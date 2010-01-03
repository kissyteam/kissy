/*
Copyright (c) 2010, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2010-01-03 21:56:25
Revision: 393
*/
KISSY.add("tabs",function(b){var c="switchable";function a(d,f){var e=this;if(!(e instanceof a)){return new a(d,f)}a.superclass.constructor.call(e,d,f);e.switchable(e.config);e.config=e.config[c];e.config[c]=e.config}b.extend(a,b.Widget);b.Tabs=a});
