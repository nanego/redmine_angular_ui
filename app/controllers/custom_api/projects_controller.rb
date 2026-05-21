# frozen_string_literal: true

class CustomApi::ProjectsController < ApplicationController
  before_action :require_login

  def minimal_index
    scope = Project.visible.sorted
    render json: {
      total_count: scope.count,
      projects: scope.map { |p|
        {
          id: p.id,
          name: p.name,
          identifier: p.identifier,
          status: p.status,
          is_public: p.is_public?,
          allowed_to_view_issues: User.current.allowed_to?(:view_issues, p) ? 1 : 0
        }
      }
    }
  end
end
