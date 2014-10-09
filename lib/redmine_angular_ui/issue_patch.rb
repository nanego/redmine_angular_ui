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
    json = {'action'=>action, 'issue'=>{'id'=> self.id, 'priority' => {'id' => priority.id}, 'subject'=>subject ,'tracker'=>{'id'=>tracker.id, 'name'=>tracker.name}, 'project'=>{'id'=>project.id, 'name'=>project.name}, 'author'=>{'id'=>author.id, 'name'=>author.name}}}.to_json
    message = {:channel => '/issues', :data => json}
    if Rails.env == 'development'
      faye_server_url = 'faye-redis.herokuapp.com/faye/faye'
    else
      faye_server_url = "#{Rails.application.routes.default_url_options[:host]}/faye/faye"
    end

    begin
      uri = URI.parse("https://"+faye_server_url)
      Net::HTTP.post_form(uri, :message => message.to_json)
    rescue *HTTP_ERRORS => error
      raise "error with AngularJS client"
    end

  end
end
