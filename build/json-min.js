/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Jan 29 22:46
*/
KISSY.add("json",function(c,a){a||(a=JSON);return c.JSON={parse:function(b){return null==b||""===b?null:a.parse(b)},stringify:a.stringify}},{requires:[KISSY.Features.isNativeJSONSupported()?"":"json/json2"]});
