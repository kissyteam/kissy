/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 12:18:45
Revision: 380
*/
KISSY.add("tabs",function(b){var c="switchable";function a(d,f){var e=this;if(!(e instanceof a)){return new a(d,f)}a.superclass.constructor.call(e,d,f);e.switchable(e.config);e.config=e.config[c];e.config[c]=e.config}b.extend(a,b.Widget);b.Tabs=a});
