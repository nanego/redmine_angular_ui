require "spec_helper"

describe AngularController do

  it "should should render the index view with the angular template" do
    @request.session[:user_id] = 1
    get :index
    expect(response).to be_success
    assert_template :index
    assert_template "layouts/angular"
  end

  it "should should redirect from dashboard view to index without a user" do
    # reset current user
    User.current = nil
    get :index
    expect(response).to be_redirect
  end

end
