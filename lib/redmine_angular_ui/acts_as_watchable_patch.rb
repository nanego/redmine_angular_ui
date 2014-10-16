require_dependency 'acts_as_watchable'

# ActsAsWatchable
module Redmine
  module Acts
    module Watchable
      module InstanceMethods

        # Removes user from the watchers list # Custom: use destroy_all instead of delete_all so we can use after_commit on a watcher object
        def remove_watcher(user)
          return nil unless user && user.is_a?(User)
          watchers.where(:user_id => user.id).destroy_all
        end

      end
    end
  end
end
