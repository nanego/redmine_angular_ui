Redmine AngularJS Client
========================

Install
-------

You can first take a look at general instructions for plugins [here](http://www.redmine.org/wiki/redmine/Plugins).

Then :

* install the redmine_base_deface plugin (see [here](https://github.com/jbbarth/redmine_base_deface))
* clone this repository in your "plugins/" directory
* install dependencies (gems) by running `bundle install` from the root of your redmine instance
* restart your Redmine instance (depends on how you host it)

Test status
----------

| Plugin branch | Redmine Version | Test Status       |
|---------------|-----------------|-------------------|
| master        | 5.1.2           | [![5.1.2][1]][5]  |
| master        | 4.2.11          | [![4.2.11][2]][5] |
| master        | master          | [![master][4]][5] |

[1]: https://github.com/nanego/redmine_angular_ui/actions/workflows/5_1_2.yml/badge.svg
[2]: https://github.com/nanego/redmine_angular_ui/actions/workflows/4_2_11.yml/badge.svg
[4]: https://github.com/nanego/redmine_angular_ui/actions/workflows/master.yml/badge.svg
[5]: https://github.com/nanego/redmine_angular_ui/actions
