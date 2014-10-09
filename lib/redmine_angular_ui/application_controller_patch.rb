require_dependency 'application_controller'

class ApplicationController

  before_filter :set_application_host

  def set_application_host
    Rails.application.routes.default_url_options[:host] ||= "#{request.host_with_port}"
  end

end
