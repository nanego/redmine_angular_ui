require 'redmine'

ActionDispatch::Callbacks.to_prepare do
  require_dependency 'redmine_angular_ui/hooks'
  require_dependency 'redmine_angular_ui/issue_patch'
end

Redmine::Plugin.register :redmine_angular_ui do
  name 'Redmine AngularJS User Interface plugin'
  author 'Vincent ROBERT'
  description 'This plugin for Redmine provides a new user interface based on AngularJS and the Redmine API.'
  version '0.0.1'
  requires_redmine :version_or_higher => '2.5.0'
  # doesn't work since redmine evaluates dependencies as it loads, and loads in lexical order
  # TODO: see if it works in Redmine 2.6.x or 3.x when they're released
  # requires_redmine_plugin :redmine_base_deface, :version_or_higher => '0.0.1'
  url 'https://github.com/nanego/redmine_angular_ui'
  author_url 'mailto:contact@vincent-robert.com'
  menu :admin_menu, :new_ui, { :controller => 'angular', :action => 'index' }, :caption => :new_ui
end
