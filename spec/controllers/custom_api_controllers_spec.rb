require "spec_helper"

describe CustomApi::IssuesController, type: :controller do
  fixtures :users, :email_addresses, :issues, :journals, :journal_details,
           :projects, :trackers, :issue_statuses, :enumerations, :members,
           :member_roles, :roles, :enabled_modules

  before { session[:user_id] = User.find(2).id }

  describe "POST #get_last_note" do
    it "authenticates via session" do
      post :get_last_note, params: { issue_ids: [] }
      expect(response).to have_http_status(200)
    end

    it "returns JSON with an issues key" do
      post :get_last_note, params: { issue_ids: [] }
      expect(JSON.parse(response.body)).to have_key("issues")
    end

    it "rejects unauthenticated requests" do
      session.delete(:user_id)
      post :get_last_note, params: { issue_ids: [] }
      expect(response).to have_http_status(:redirect).or have_http_status(:unauthorized)
    end
  end
end

describe CustomApi::ProjectsController, type: :controller do
  fixtures :users, :email_addresses, :projects, :members, :member_roles,
           :roles, :enabled_modules

  before { session[:user_id] = User.find(2).id }

  describe "GET #minimal_index" do
    it "authenticates via session" do
      get :minimal_index
      expect(response).to have_http_status(200)
    end

    it "returns JSON with projects and total_count keys" do
      get :minimal_index
      body = JSON.parse(response.body)
      expect(body).to have_key("projects")
      expect(body).to have_key("total_count")
    end

    it "rejects unauthenticated requests" do
      session.delete(:user_id)
      get :minimal_index
      expect(response).to have_http_status(:redirect).or have_http_status(:unauthorized)
    end
  end
end