# frozen_string_literal: true

class CustomApi::IssuesController < ApplicationController
  before_action :require_login

  def get_last_note
    @issues = []
    # Only expose notes for issues the current user is allowed to see
    visible_ids = Issue.visible.where(id: params['issue_ids']).pluck(:id) if params['issue_ids'].present?
    if visible_ids.present?
      sql = Journal.select('max(id) max_id, journalized_id, count(journalized_id), max(created_on) max_date')
                   .where("journalized_type = ? AND journalized_id IN (?) AND notes IS NOT NULL AND notes <> '' ",
                          Issue.to_s, visible_ids)
                   .group("journalized_id").to_sql
      records = ActiveRecord::Base.connection.execute(sql)
      records.each do |r|
        journal = Journal.where(created_on: r['max_date'], journalized_id: r['journalized_id']).first
        @issues << { id: r['journalized_id'].to_i, count: r['count'].to_i, last_note: journal.notes }
      end

      present_ids = @issues.map { |i| i[:id] }
      visible_ids.each do |issue_id|
        @issues << { id: issue_id, count: 0, last_note: "" } unless present_ids.include?(issue_id)
      end
    end

    render json: { issues: @issues }
  end

  # Authorized source of realtime notification details. The Faye channel only
  # carries the issue id; the actual data is served here, gated by Issue#visible?
  # so an unauthorized user gets a 403 and no data ever leaks client-side.
  def notification_data
    issue = Issue.find(params[:id])
    return render_403 unless issue.visible?

    render json: issue.notification_payload
  end

  def not_assigned_issues
    @query = IssueQuery.new(:name => "_",
                            :filters => {"assigned_to_id" => {:operator => "!*", :values => [""]},
                                         "status_id" => {:operator => "o", :values => [""]}})
    @issues = @query.issues(:include => [:assigned_to, :tracker, :priority, :category, :fixed_version],
                            :order => "#{Issue.table_name}.updated_on DESC",
                            :limit => 100)
    render "issues/index"
  end
end
