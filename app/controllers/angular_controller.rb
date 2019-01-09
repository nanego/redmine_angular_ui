class AngularController < ApplicationController

  before_action :require_login
  layout "angular"

  def index
    @api_key = User.current.api_key
  end

end
