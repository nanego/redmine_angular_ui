require_dependency 'issue'
require 'firehose'

class Issue
  after_create do
    json = {'hello'=> self.id}.to_json
    firehose = Firehose::Client::Producer::Http.new('//127.0.0.1:7474')
    firehose.publish(json).to("/issues/new")
  end
end
