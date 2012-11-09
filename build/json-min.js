/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 9 16:14
*/
KISSY.add("json",function(c,a){a=a||window.JSON;return c.JSON={parse:function(b){return null==b||""===b?null:a.parse(b)},stringify:a.stringify}},{requires:[KISSY.Features.isNativeJSONSupported?"empty":"json/json2"]});
