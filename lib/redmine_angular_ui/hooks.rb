module RedmineAngularUi
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context)
      stylesheet_link_tag("standard_menu", :plugin => "redmine_angular_ui")
    end
  end
end
