require_dependency 'issue'
require 'timeout'

class Issue

  after_commit :notif_after_create, :on => :create
  after_commit :notif_after_update, :on => :update
  after_commit :notif_after_destroy, :on => :destroy

  def notif_after_create
    notif_after_commit('create')
  end

  def notif_after_update
    notif_after_commit('update')
  end

  def notif_after_destroy
    notif_after_commit('destroy')
  end

  def notif_after_commit(action)

    # TODO Remove that and make it asynchone with a call from the client only if the issue is visible
    sql = Journal.select('count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id = ? AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, id).group("journalized_id").to_sql
    r = ActiveRecord::Base.connection.execute(sql).first
    last_note = Journal.where(created_on: r['max_date'], journalized_id: id ).first if r.present?

    json = {'action'=>action,
            'issue'=>
                {'id'=> id,
                 'priority' =>
                     {'id' => priority.id},
                 'subject'=>subject,
                 'tracker'=>{
                     'id'=>tracker.id,
                     'name'=>tracker.name},
                 'project'=>{
                     'id'=>project.id,
                     'name'=>project.name},
                 'author'=>{
                     'id'=>author.id,
                     'name'=>author.name},
                 'notes_count'=> r.present? ? r['count'] : "",
                 'last_note'=> r.present? ? last_note['notes'] : "",
                 'watched' => issue.watcher_users.include?(User.current) ? "1" : "0"
                }
            }.to_json
    message = {:channel => '/issues', :data => json}
    if Rails.env == 'development'
      uri = URI.parse("https://faye-redis.herokuapp.com/faye")
    else
      uri = URI.parse("http://localhost:3011/faye")
    end
    Net::HTTP.post_form(uri, :message => message.to_json)
  end
end
