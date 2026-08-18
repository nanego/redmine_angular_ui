Deface::Override.new :virtual_path  => 'issues/index',
                     :name          => 'add-link-to-angular-client',
                     :insert_before => 'div.contextual',
                     :partial       => 'angular/link'
