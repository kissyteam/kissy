/*
Copyright (c) 2010, Kissy UI Library. All rights reserved.
MIT Licensed.
http://kissy.googlecode.com/

Date: 2009-12-30 18:55:24
Revision: 384
*/
KISSY.add("tabs",function(b){var c="switchable";function a(d,f){var e=this;if(!(e instanceof a)){return new a(d,f)}a.superclass.constructor.call(e,d,f);e.switchable(e.config);e.config=e.config[c];e.config[c]=e.config}b.extend(a,b.Widget);b.Tabs=a});
