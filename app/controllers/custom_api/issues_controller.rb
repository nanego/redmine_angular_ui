class CustomApi::IssuesController < ApplicationController

  accept_api_auth :get_last_note, :not_assigned_issues

  def get_last_note
    @issues = []
    if params['issue_ids'].present?

      # TODO Make it with only one request
      # TODO Do not take into account private notes
      sql = Journal.select('max(id) max_id, journalized_id, count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id IN (?) AND notes IS NOT NULL AND notes <> '' ", Issue.to_s, params['issue_ids']).group("journalized_id").to_sql
      records = ActiveRecord::Base.connection.execute(sql)
      records.each do |r|
        journal = Journal.where(created_on: r['max_date'], journalized_id: r['journalized_id'] ).first
        i = {id: r['journalized_id'].to_i, count: r['count'].to_i, last_note: journal.notes}
        @issues << i
      end

      present_ids = @issues.map { |i| i[:id]}
      params['issue_ids'].each do |issue_id|
        unless present_ids.include?(issue_id)
          i = {id: issue_id, count: 0, last_note: ""}
          @issues << i
        end
      end

    end
  end

  def not_assigned_issues
    @query = IssueQuery.new(:name => "_",
                            :filters => {"assigned_to_id" => {:operator=>"!*", :values=>[""]},
                                         "status_id"=>{:operator=>"o", :values=>[""]}} )
    @issues = @query.issues(:include => [:assigned_to, :tracker, :priority, :category, :fixed_version],
                            :order => "#{Issue.table_name}.updated_on DESC",
                            :limit => 100)
     render "issues/index"
  end

end
