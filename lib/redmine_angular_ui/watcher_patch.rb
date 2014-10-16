require_dependency 'watcher'

class Watcher

  after_commit :notif_after_create, :on => :create
  after_commit :notif_after_update, :on => :update
  after_commit :notif_after_destroy, :only => [:delete, :destroy]

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

    puts "WATCHER PATCH : after commit  #{action} - #{watchable_type} - #{watchable}"

    if user == User.current

      json = {'action'=>action,
              'issue'=>
                  {'id'=> watchable_id}
      }.to_json

      message = {:channel => '/watched', :data => json}

      if Rails.env == 'development'
        uri = URI.parse("https://faye-redis.herokuapp.com/faye")
      else
        uri = URI.parse("http://localhost:3011/faye")
      end
      Net::HTTP.post_form(uri, :message => message.to_json)

      puts "Envoyé"

    end
  end
end
