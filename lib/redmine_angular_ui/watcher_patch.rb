require_dependency 'watcher'

class Watcher

  after_commit :notif_after_event, :only => [:create, :update, :destroy]

  def notif_after_event
    if self.watchable.is_a?(Issue) && user == User.current
      notif_after_commit('update')
    end
  end

  def notif_after_commit(action)

    issue = self.watchable

    # TODO Remove that and make it asynchone with a call from the client only if the issue is visible
    sql = Journal.select('count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id = ? AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, issue.id).group("journalized_id").to_sql
    r = ActiveRecord::Base.connection.execute(sql).first
    last_note = Journal.where(created_on: r['max_date'], journalized_id: issue.id ).first if r.present?

    json = {'action'=>action,
            'issue'=>
                {'id'=> issue.id,
                 'priority' =>
                     {'id' => issue.priority.id},
                 'subject'=>issue.subject,
                 'tracker'=>{
                     'id'=>issue.tracker.id,
                     'name'=>issue.tracker.name},
                 'project'=>{
                     'id'=>issue.project.id,
                     'name'=>issue.project.name},
                 'author'=>{
                     'id'=>issue.author.id,
                     'name'=>issue.author.name},
                 'notes_count'=> r.present? ? r['count'] : "",
                 'last_note'=> r.present? ? last_note['notes'] : "",
                 'watched' => issue.watcher_users.include?(User.current) ? "1" : "0"
                }
    }.to_json
    message = {:channel => '/watched', :data => json}
    if Rails.env == 'development'
      uri = URI.parse("https://faye-redis.herokuapp.com/faye")
    else
      uri = URI.parse("http://localhost:3011/faye")
    end
    Net::HTTP.post_form(uri, :message => message.to_json)
  end

end
