class CustomApi::IssuesController < ApplicationController

  accept_api_auth :get_last_note

  def get_last_note

    # TODO Make it with only one request
    sql = Journal.select('max(id) max_id, journalized_id, count(journalized_id), max(created_on) max_date').where("journalized_type = ? AND journalized_id IN (?) AND notes IS NOT NULL AND notes <> '' ", Issue.class_name, params['issue_ids']).group("journalized_id").to_sql
    records = ActiveRecord::Base.connection.execute(sql)

    @issues_map = []
    records.each do |r|
      journal = Journal.where(created_on: r['max_date'], journalized_id: r['journalized_id'] ).first
      i = {id: r['journalized_id'].to_i, count: r['count'].to_i, last_note: journal.notes}
      @issues_map << i
    end

  end

end
