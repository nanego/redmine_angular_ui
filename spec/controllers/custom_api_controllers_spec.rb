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

    it "returns notes for issues the user is allowed to see" do
      # jsmith (user 2) is a member of the private project 2, so issue 4 is visible.
      post :get_last_note, params: { issue_ids: [4] }
      ids = JSON.parse(response.body)["issues"].map { |i| i["id"] }
      expect(ids).to include(4)
    end

    it "does not expose notes for issues the user cannot see" do
      hidden = Issue.find(4) # private project 2
      outsider = User.active.where(admin: false).detect { |u| !hidden.visible?(u) }
      session[:user_id] = outsider.id
      post :get_last_note, params: { issue_ids: [hidden.id] }
      ids = JSON.parse(response.body)["issues"].map { |i| i["id"] }
      expect(ids).not_to include(hidden.id)
    end
  end

  describe "GET #notification_data" do
    it "returns the payload for an issue the user can see" do
      get :notification_data, params: { id: 1 }
      expect(response).to have_http_status(200)
      body = JSON.parse(response.body)
      expect(body["id"]).to eq(1)
      expect(body).to have_key("subject")
    end

    it "denies access to an issue the user cannot see" do
      hidden = Issue.find(4) # private project 2
      outsider = User.active.where(admin: false).detect { |u| !hidden.visible?(u) }
      session[:user_id] = outsider.id
      get :notification_data, params: { id: hidden.id }
      expect(response).to have_http_status(403)
    end

    it "rejects unauthenticated requests" do
      session.delete(:user_id)
      get :notification_data, params: { id: 1 }
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