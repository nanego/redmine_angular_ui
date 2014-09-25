RedmineApp::Application.routes.draw do
  get'/angular'=>'angular#index'

  namespace :custom_api do
    namespace :issues do
      post :get_last_note
    end
  end
end
