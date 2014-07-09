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
    json = {'issue_id'=> self.id, 'action'=>action}.to_json
    message = {:channel => '/issues', :data => json}
    uri = URI.parse("http://faye-redis.herokuapp.com/faye")
    Net::HTTP.post_form(uri, :message => message.to_json)
  end
end
