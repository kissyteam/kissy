/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jan 31 23:01
*/
KISSY.add("json/facade",function(c,a){a||(a=JSON);return c.JSON={parse:function(b){return null==b||""===b?null:a.parse(b)},stringify:a.stringify}},{requires:[KISSY.Features.isNativeJSONSupported()?"":"json/json2"]});
