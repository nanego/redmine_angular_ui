# ActsAsWatchable
module RedmineAngularUi
  module ActsAsWatchablePatch
    module InstanceMethods

      # Removes user from the watchers list # Custom: use destroy_all instead of delete_all so we can use after_commit on a watcher object
      def remove_watcher(user)
        return nil unless user && (user.is_a?(User) || user.is_a?(Group))
        # Rails does not reset the has_many :through association
        watcher_users.reset
        return watchers.where(:user_id => user.id).destroy_all.size
      end

    end
  end
end

Redmine::Acts::Watchable.prepend RedmineAngularUi::ActsAsWatchablePatch
