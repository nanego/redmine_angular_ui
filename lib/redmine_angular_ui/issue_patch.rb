require_dependency 'issue'

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
    json = {'action'=>action, 'issue'=>{'id'=> self.id, 'subject'=>subject ,'tracker'=>{'id'=>tracker.id, 'name'=>tracker.name}, 'project'=>{'id'=>project.id, 'name'=>project.name}, 'author'=>{'id'=>author.id, 'name'=>author.name}}}.to_json
    message = {:channel => '/issues', :data => json}
    # uri = URI.parse("http://faye-redis.herokuapp.com/faye")
    # uri = URI.parse("http://localhost:3001/faye")
    uri = URI.parse("http://faye.application.ac.centre-serveur.i2/faye")
    Net::HTTP.post_form(uri, :message => message.to_json)
  end
end
