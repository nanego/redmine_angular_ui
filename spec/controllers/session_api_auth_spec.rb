require "spec_helper"

# Proves the ApplicationController patch lets the SPA reach Redmine's core
# JSON endpoints through the user session, even when the REST API is disabled.
describe IssuesController, type: :controller do
  fixtures :projects, :users, :email_addresses, :roles, :members, :member_roles,
           :issues, :issue_statuses, :trackers, :projects_trackers,
           :enabled_modules, :enumerations

  around { |example| with_settings(rest_api_enabled: "0") { example.run } }

  it "serves a core JSON endpoint via the session when the SPA sends the CSRF token" do
    session[:user_id] = User.find(2).id
    request.headers["X-CSRF-Token"] = "spa-token"
    get :index, format: :json
    expect(response).to have_http_status(200)
  end
end

# /users/current.json (called by the SPA's session service) requires login, so
# it exercises both sides of the patch: granted with a session, denied without.
describe UsersController, type: :controller do
  fixtures :users, :email_addresses, :roles, :members, :member_roles,
           :projects, :enabled_modules

  around { |example| with_settings(rest_api_enabled: "0") { example.run } }

  describe "GET #show :current as JSON with the REST API disabled" do
    it "authenticates via the session when the SPA sends the CSRF token" do
      session[:user_id] = User.find(2).id
      request.headers["X-CSRF-Token"] = "spa-token"
      get :show, params: { id: "current" }, format: :json
      expect(response).to have_http_status(200)
    end

    it "denies access without a session" do
      request.headers["X-CSRF-Token"] = "spa-token"
      get :show, params: { id: "current" }, format: :json
      expect(response).not_to have_http_status(200)
    end

    it "denies access with a session but without the CSRF token" do
      session[:user_id] = User.find(2).id
      get :show, params: { id: "current" }, format: :json
      expect(response).not_to have_http_status(200)
    end
  end
end
