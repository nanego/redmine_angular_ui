# frozen_string_literal: true

module RedmineAngularUi
  class ModelHook < Redmine::Hook::Listener
    def after_plugins_loaded(_context = {})
      require_relative 'application_controller_patch'
      require_relative 'issue_patch'
      require_relative 'watcher_patch'
      require_relative 'acts_as_watchable_patch'
    end
  end
end
