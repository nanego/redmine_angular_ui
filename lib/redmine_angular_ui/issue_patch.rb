require_dependency 'issue'

module RedmineAngularUi
  module IssuePatch

    def notif_after_create
      notif_after_commit('create')
    end

    def notif_after_update
      if status.is_closed?
        notif_after_commit('destroy')
      else
        notif_after_commit('update')
      end
    end

    def notif_after_destroy
      notif_after_commit('destroy')
    end

    # The realtime channel is broadcast to every connected client, so it must
    # never carry data the recipient might not be allowed to see. We only push
    # the issue id and the action; each client then re-fetches the details
    def notif_after_commit(action)
      # Check if current app is prod or preprod
      Mailer.default_url_options[:host] =~ /portail/ ? channel_type = '' : channel_type = '-preprod'

      message = { :channel => '/issues' + channel_type, :data => { 'action' => action, 'issue' => { 'id' => id } }.to_json }

      if Rails.env == 'development' || Rails.env == 'test'
        uri = URI.parse("https://faye-redis.herokuapp.com/faye")
      else
        uri = URI.parse("http://localhost:3011/faye")
      end

      begin
        Timeout.timeout(3) do
          Net::HTTP.post_form(uri, :message => message.to_json) unless Rails.env == 'test'
        end
      rescue Timeout::Error => e
        Rails.logger.warn "WARNING (redmine_angular_ui): couldn't post Issue update because the operation timed out"
      end

    end

    # Notification payload served only to authorized recipients (see
    # custom_api/issues#notification_data). Built for User.current, which here
    # is the recipient asking for the data, so `watched` reflects that user.
    def notification_payload
      sql = Journal.select('count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id = ? AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, id).group("journalized_id").to_sql
      r = ActiveRecord::Base.connection.execute(sql).first
      last_note = Journal.where(created_on: r['max_date'], journalized_id: id).first if r.present?

      issue = {
        'id' => id,
        'priority' => { 'id' => priority.id },
        'subject' => subject,
        'status' => {
          'id' => status.id,
          'name' => status.name,
          'is_closed' => status.is_closed? ? "1" : "0" },
        'tracker' => {
          'id' => tracker.id,
          'name' => tracker.name },
        'project' => {
          'id' => project.try(:id),
          'name' => project.try(:name) },
        'author' => {
          'id' => author.id,
          'name' => author.name },
        'updated_on' => updated_on,
        'notes_count' => r.present? ? r['count'] : "",
        'last_note' => r.present? ? last_note['notes'] : "",
        'watched' => watcher_users.include?(User.current) ? "1" : "0",
        'assigned_to' => assigned_to.present? ? { 'id' => assigned_to_id, 'name' => assigned_to.name } : ''
      }

      if Redmine::Plugin.installed?(:redmine_limited_visibility) && project.present? && project.module_enabled?("limited_visibility")
        issue['authorized_viewers'] = authorized_viewer_ids
        issue['assigned_to_functional_role'] = assigned_to_function_id.present? ? { 'id' => assigned_to_function_id, 'name' => assigned_function.name } : ""
      end

      issue
    end
  end

end

Issue.prepend RedmineAngularUi::IssuePatch

class Issue
  after_commit :notif_after_create, :on => :create
  after_commit :notif_after_update, :on => :update
  after_commit :notif_after_destroy, :on => :destroy
end
