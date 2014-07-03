require_dependency 'issue'

class Issue
  after_commit do
    json = {'text'=> self.id}.to_json
    message = {:channel => '/issues', :data => json}
    uri = URI.parse("http://faye-redis.herokuapp.com/faye")
    Net::HTTP.post_form(uri, :message => message.to_json)
  end
end
