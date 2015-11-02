RedmineApp::Application.routes.draw do
  get'/angular'=>'angular#index'

  namespace :custom_api do
    namespace :issues do
      post :get_last_note
      get :not_assigned_issues
    end
    namespace :projects do
      get :minimal_index
    end
  end
end
