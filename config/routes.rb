RedmineApp::Application.routes.draw do
  get 'angular' => 'angular#index'

  # Serve Angular assets
  get 'redmine_angular_ui/templates/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/templates/:folder/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/templates/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/images/:image', to: 'angular#get_image'

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
