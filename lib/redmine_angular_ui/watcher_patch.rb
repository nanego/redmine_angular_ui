require_dependency 'watcher'

class Watcher

  after_commit :notif_after_event, :only => [:create, :update, :delete, :destroy]

  def notif_after_event
    watchable.notif_after_commit('update')
  end

end
