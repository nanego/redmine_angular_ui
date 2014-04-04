class AngularController < ApplicationController

  before_filter :require_login
  layout "angular"

  def index

  end

end
