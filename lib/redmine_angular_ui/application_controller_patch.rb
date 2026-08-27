# frozen_string_literal: true

require_dependency 'application_controller'

module RedmineAngularUi
  # Lets the AngularJS SPA consume Redmine's JSON endpoints with the logged-in
  # user's session instead of an API key, so the interface keeps working even
  # when the REST API is disabled.
  #
  # Redmine's ApplicationController#find_current_user ignores the session for
  # API-format requests (the `unless api_request?` guard) and authenticates them
  # only through the REST API (API key / OAuth / Basic), which is gated by
  # Setting.rest_api_enabled?.
  module ApplicationControllerPatch

    # Redmine 7.0.1 replaces the session with a null session on every API
    # request (ApplicationController#api_session). Keep the real session for
    # the SPA only, identified by a valid CSRF token, so #find_current_user
    # below can still authenticate it. Every other API request keeps the core
    # hardening.
    def api_session
      return if api_request? && session[:user_id] && request.x_csrf_token.present? && verified_request?

      super
    end

    def find_current_user
      user = super
      if user.nil? && session[:user_id] && api_request? && request.x_csrf_token.present? && verified_request?
        user =
          begin
            User.active.find(session[:user_id])
          rescue ActiveRecord::RecordNotFound
            nil
          end
        user.remote_ip = request.remote_ip if user
      end
      user
    end
  end
end

unless ApplicationController < RedmineAngularUi::ApplicationControllerPatch
  ApplicationController.prepend RedmineAngularUi::ApplicationControllerPatch
end
