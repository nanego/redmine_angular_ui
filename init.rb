require 'redmine'

require_relative 'lib/redmine_angular_ui/hooks'

Redmine::Plugin.register :redmine_angular_ui do
  name 'Redmine AngularJS User Interface plugin'
  author 'Vincent ROBERT'
  description 'This plugin for Redmine provides a new user interface based on AngularJS and the Redmine API.'
  version '5.0.0'
  requires_redmine :version_or_higher => '4.2.0'
  # doesn't work since redmine evaluates dependencies as it loads, and loads in lexical order
  # TODO: see if it works in Redmine 6.x when they're released
  # requires_redmine_plugin :redmine_base_deface, :version_or_higher => '0.0.1'
  url 'https://github.com/nanego/redmine_angular_ui'
  author_url 'mailto:contact@vincent-robert.com'
  menu :admin_menu, :new_ui, { :controller => 'angular', :action => 'index' },
       :caption => :new_ui,
       :html => {:class => 'icon'}
  settings :default => { 'favorite_view_mode' => 1},
           :partial => 'settings/plugin_settings'

  project_module :issue_tracking do
    permission :view_angular_interface, {:angular => :index}, :read => true, global: true
  end

end
