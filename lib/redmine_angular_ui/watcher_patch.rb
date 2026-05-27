require_dependency 'watcher'

module RedmineAngularUi
  module WatcherPatch

    def notif_after_event
      if self.watchable.is_a?(Issue) && user == User.current
        notif_after_commit('update')
      end
    end

    def notif_after_commit(action)
      # Same access-control rationale as Issue#notif_after_commit: the channel
      # name is guessable, so it must only carry the issue id. The client
      # re-fetches the details through the authorized notification_data endpoint.

      # Check if current app is prod or preprod
      Mailer.default_url_options[:host] !~ /portail/ ? channel_type = '-preprod' : channel_type = ''

      message = { :channel => "/watched" + channel_type + "/#{User.current.id}", :data => { 'action' => action, 'issue' => { 'id' => self.watchable.id } }.to_json }
      if Rails.env == 'development' || Rails.env == 'test'
        uri = URI.parse("https://faye-redis.herokuapp.com/faye")
      else
        uri = URI.parse("http://localhost:3011/faye")
      end
      Net::HTTP.post_form(uri, :message => message.to_json) unless Rails.env == 'test'
    end

  end
end

Watcher.prepend RedmineAngularUi::WatcherPatch

class Watcher
  after_commit :notif_after_event, :only => [:create, :update, :destroy]
end
