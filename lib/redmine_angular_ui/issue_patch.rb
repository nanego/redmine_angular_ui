require_dependency 'issue'

class Issue

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
    message = {:channel => '/issues', :data => updated_data(action)}
    if Rails.env == 'development'
      uri = URI.parse("https://faye-redis.herokuapp.com/faye")
    else
      uri = URI.parse("http://localhost:3011/faye")
    end
    Net::HTTP.post_form(uri, :message => message.to_json)
  end

  def updated_data(action)
    sql = Journal.select('count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id = ? AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, id).group("journalized_id").to_sql
    r = ActiveRecord::Base.connection.execute(sql).first
    last_note = Journal.where(created_on: r['max_date'], journalized_id: id).first if r.present?

    json = {}

    if assigned_to.present?
      json.merge!({'issue' => {'assigned_to' => {'id' => assigned_to_id, 'name' => assigned_to.name} } })
    else
      json.merge!({'issue' => {'assigned_to' => nil}})
    end

    if project.module_enabled?("limited_visibility") && !assigned_to_function_id.nil?
      json.merge!({'issue' => {'assigned_to_functional_role' => {'id' => assigned_to_function_id, 'name' => assigned_function.name}}})
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
                     'id' => project.id,
                     'name' => project.name},
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

