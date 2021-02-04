require_dependency 'issue'

class Issue < ActiveRecord::Base

  after_commit :notif_after_create, :on => :create
  after_commit :notif_after_update, :on => :update
  after_commit :notif_after_destroy, :on => :destroy

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

  def notif_after_commit(action)
    # TODO Remove that and make it asynchone with a call from the client only if the issue is visible

    # Check if current app is prod or preprod
    Mailer.default_url_options[:host] =~ /portail/ ? channel_type = '' : channel_type = '-preprod'

    message = {:channel => '/issues'+channel_type, :data => updated_data(action)}

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

  def updated_data(action)
    sql = Journal.select('count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id = ? AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, id).group("journalized_id").to_sql
    r = ActiveRecord::Base.connection.execute(sql).first
    last_note = Journal.where(created_on: r['max_date'], journalized_id: id).first if r.present?

    if assigned_to.present?
      json = {'issue' => {'assigned_to' => {'id' => assigned_to_id, 'name' => assigned_to.name} } }
    else
      json = {'issue' => {'assigned_to' => ''} }
    end

    if Redmine::Plugin.installed?(:redmine_limited_visibility) && project.present? && project.module_enabled?("limited_visibility")
      json.merge!({'issue' => {'authorized_viewers' => authorized_viewer_ids,
                               'assigned_to_functional_role' => assigned_to_function_id.present? ? {'id' => assigned_to_function_id, 'name' => assigned_function.name} : ""
                  }}) { |k, a, b| a.is_a?(Hash) && b.is_a?(Hash) ? a.merge(b) : b }
    end

    json.merge!({'action' => action,
            'user' => {'id' => User.current.id},
            'issue' =>
                {'id' => id,
                 'priority' =>
                     {'id' => priority.id},
                 'subject' => subject,
                 'status' => {
                      'id' => status.id,
                      'name' => status.name,
                      'is_closed' => status.is_closed? ? "1" : "0" },
                 'tracker' => {
                     'id' => tracker.id,
                     'name' => tracker.name},
                 'project' => {
                     'id' => project.try(:id),
                     'name' => project.try(:name)},
                 'author' => {
                     'id' => author.id,
                     'name' => author.name},
                 'updated_on' => updated_on,
                 'notes_count' => r.present? ? r['count'] : "",
                 'last_note' => r.present? ? last_note['notes'] : "",
                 'watched' => watcher_users.include?(User.current) ? "1" : "0"
                }
    }) { |key, first, second|
      first.is_a?(Hash) && second.is_a?(Hash) ? first.merge(second) : second
    }

    json.to_json
  end
end

