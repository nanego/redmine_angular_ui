# frozen_string_literal: true

module RedmineAngularUi
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context)
      stylesheet_link_tag("standard_menu", :plugin => "redmine_angular_ui")
    end
  end

  class ModelHook < Redmine::Hook::Listener
    def after_plugins_loaded(_context = {})
      require_relative 'issue_patch'
      require_relative 'watcher_patch'
      require_relative 'acts_as_watchable_patch'
    end
  end
end
