require File.expand_path('../../test_helper', __FILE__)

class AngularControllerTest < ActionController::TestCase

  test "should render the index view with the angular template" do
    @request.session[:user_id] = 1
    get :index
    assert_response :success
    assert_template :index
    assert_template layout: "layouts/angular"
  end

  test "should redirect from dashboard view to index without a user" do
    # reset current user
    User.current = nil
    get :index
    assert_response :redirect
  end

end
