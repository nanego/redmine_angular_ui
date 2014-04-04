module RedmineAngularUi
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context)
      stylesheet_link_tag("angular_ui", :plugin => "redmine_angular_ui") +
        javascript_include_tag("angular_ui", :plugin => "redmine_angular_ui")
    end
  end
end
