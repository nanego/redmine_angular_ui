class CustomApi::ProjectsController < ApplicationController

  accept_api_auth :minimal_index

  # Lists visible projects
  def minimal_index
    scope = Project.visible.sorted
    respond_to do |format|
      format.api  {
        @project_count = scope.count
        @projects = scope.to_a
      }
    end
  end
end
