class AngularController < ApplicationController

  TEMPLATES_DIR = File.expand_path('../assets/templates', __dir__)
  IMAGES_DIR = File.expand_path('../assets/images', __dir__)

  # Only files actually shipped with the plugin can be served
  TEMPLATES = Dir.glob('**/*.html', base: TEMPLATES_DIR).to_set.freeze
  IMAGES = Dir.children(IMAGES_DIR).to_set.freeze

  before_action :require_login
  layout "angular"

  def index
  end

  def get_template
    template = [params[:folder], "#{params[:template]}.html"].compact_blank.join('/')
    return head :not_found unless TEMPLATES.include?(template)

    render file: File.join(TEMPLATES_DIR, template), layout: false, content_type: 'text/html'
  end

  def get_image
    image = "#{params[:image]}.#{params[:format]}"
    return head :not_found unless IMAGES.include?(image)

    send_file File.join(IMAGES_DIR, image), disposition: 'inline'
  end

end
