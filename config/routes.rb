RedmineApp::Application.routes.draw do
  get 'angular' => 'angular#index'

  # Serve Angular assets
  get 'redmine_angular_ui/templates/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/templates/:folder/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/templates/:template', to: 'angular#get_template'
  get 'redmine_angular_ui/images/:image', to: 'angular#get_image'

  scope '/custom_api' do
    post 'issues/get_last_note', to: 'custom_api/issues#get_last_note'
    get 'issues/not_assigned_issues', to: 'custom_api/issues#not_assigned_issues'
    get 'issues/:id/notification_data', to: 'custom_api/issues#notification_data'
    get 'projects/minimal_index', to: 'custom_api/projects#minimal_index'
  end
end
