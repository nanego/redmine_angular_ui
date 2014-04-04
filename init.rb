require 'redmine'

ActionDispatch::Callbacks.to_prepare do
  require_dependency 'redmine_angular_ui/hooks'
end

# Little hack for using the 'deface' gem in redmine:
# - redmine plugins are not railties nor engines, so deface overrides in app/overrides/ are not detected automatically
# - deface doesn't support direct loading anymore ; it unloads everything at boot so that reload in dev works
# - hack consists in adding "app/overrides" path of the plugin in Redmine's main #paths
# TODO: see if it's complicated to turn a plugin into a Railtie or find something a bit cleaner
Rails.application.paths["app/overrides"] ||= []
Rails.application.paths["app/overrides"] << File.expand_path("../app/overrides", __FILE__)

Redmine::Plugin.register :redmine_angular_ui do
  name 'Redmine AngularJS User Interface plugin'
  author 'Vincent ROBERT'
  description 'This plugin for Redmine provides a new user interface based on AngularJS and the Redmine API.'
  version '0.0.1'
  url 'https://github.com/nanego/redmine_angular_ui'
  author_url 'mailto:contact@vincent-robert.com'
end
