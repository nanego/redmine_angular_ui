class AngularController < ApplicationController

  before_action :require_login
  layout "angular"

  def index
    @api_key = User.current.api_key
  end

  def get_template
    if params[:folder].present?
      path = Rails.root.join('plugins', 'redmine_angular_ui', 'app', 'assets', 'templates', params[:folder], "#{params[:template]}.html")
    else
      path = Rails.root.join('plugins', 'redmine_angular_ui', 'app', 'assets', 'templates', "#{params[:template]}.html")
    end
    if File.exist?(path)
      render file: path, layout: false, content_type: 'text/html'
    else
      head :not_found
    end
  end

  def get_image
    filename = params[:image]
    format = params[:format]
    path = Rails.root.join('plugins', 'redmine_angular_ui', 'app', 'assets', 'images', "#{filename}.#{format}")
    puts path
    if File.exist?(path)
      render file: path, layout: false
    else
      head :not_found
    end
  end

end
