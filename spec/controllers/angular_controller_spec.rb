require "spec_helper"

describe AngularController do

  fixtures :users

  it "should render the index view with the angular template" do
    @request.session[:user_id] = 1
    get :index
    expect(response).to have_http_status(:ok) # should return a 200 OK status
    assert_template :index
    assert_template "layouts/angular"
  end

  it "should redirect from dashboard view to index without a user" do
    # reset current user
    User.current = nil
    get :index
    expect(response).to have_http_status(:redirect) # redirect (302)
  end

  describe "assets" do
    before { @request.session[:user_id] = 2 }

    it "serves a template of the plugin" do
      get :get_template, params: { folder: "issues", template: "show", format: "html" }
      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/html")
    end

    it "serves a root template of the plugin" do
      get :get_template, params: { template: "notifications", format: "html" }
      expect(response).to have_http_status(:ok)
    end

    it "refuses a template outside the plugin" do
      get :get_template, params: { folder: "../../../../../public", template: "404", format: "html" }
      expect(response).to have_http_status(:not_found)
    end

    it "serves an image of the plugin" do
      get :get_image, params: { image: "spinner", format: "gif" }
      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("image/gif")
    end

    it "refuses a file outside the plugin" do
      get :get_image, params: { image: "../../../../../config/database", format: "yml" }
      expect(response).to have_http_status(:not_found)
    end
  end

end
