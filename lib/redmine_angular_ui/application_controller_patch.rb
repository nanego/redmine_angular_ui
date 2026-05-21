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
  # Setting.rest_api_enabled?. We restore session authentication for those
  # requests, but only when the request is forgery-safe: verified_request? is
  # true for GET/HEAD, and for unsafe verbs only when a valid CSRF token is
  # present (the SPA sends it via the X-CSRF-Token header). This is essential
  # because Redmine disables CSRF verification for API-format requests
  # (see ApplicationController#verify_authenticity_token); without this guard a
  # cross-site request riding on the session cookie could mutate data.
  module ApplicationControllerPatch
    def find_current_user
      user = super
      if user.nil? && session[:user_id] && api_request? && verified_request?
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
