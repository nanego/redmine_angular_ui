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

end
