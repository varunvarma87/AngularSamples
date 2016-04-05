merchant-base-css
=================

Dependency:
-----------
  Bootstrap 3 variables.less and mixins.less.

Steps for usage:
----------------

1] bower install merchant-base-css  //This should get all the required CSS under your bower_components folder.

2] In your app.less add the following lines

    @import "_bootstrap/bootstrap" //Bootsrap variables and mixins is required for this bower component.
    @import "base";
    @import "lib";

**Note:** 

You can import base.less in your app.less file to get HAWK base layout and styles.

app.less includes:

* variables.less
* mixins.less
* reset.less
* business.less


To get additional styles like button styles and utils import lib.less.

lib.less includes:

* buttons.less
* actionbuttons.less
* utils.less
