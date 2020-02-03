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

|Plugin branch| Redmine Version   | Test Status       |
|-------------|-------------------|-------------------|
|master       | master            | [![Build1][1]][5] |  
|master       | 4.1.0             | [![Build2][2]][5] |  
|master       | 4.0.6             | [![Build3][3]][5] |

[1]: https://travis-matrix-badges.herokuapp.com/repos/nanego/redmine_angular_ui/branches/master/1?use_travis_com=true
[2]: https://travis-matrix-badges.herokuapp.com/repos/nanego/redmine_angular_ui/branches/master/2?use_travis_com=true
[3]: https://travis-matrix-badges.herokuapp.com/repos/nanego/redmine_angular_ui/branches/master/3?use_travis_com=true
[5]: https://travis-ci.com/nanego/redmine_angular_ui
