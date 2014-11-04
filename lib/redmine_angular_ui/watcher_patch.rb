require_dependency 'watcher'

class Watcher

  after_commit :notif_after_event, :only => [:create, :update, :destroy]

  def notif_after_event
    if self.watchable.is_a?(Issue) && user == User.current
      notif_after_commit('update')
    end
  end

  def notif_after_commit(action)
    # TODO Remove that and make it asynchone with a call from the client only if the issue is visible
    message = {:channel => "/watched/#{User.current.id}", :data => self.watchable.updated_data(action)}
    if Rails.env == 'development'
      uri = URI.parse("https://faye-redis.herokuapp.com/faye")
    else
      uri = URI.parse("http://localhost:3011/faye")
    end
    Net::HTTP.post_form(uri, :message => message.to_json)
  end

end
