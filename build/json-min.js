/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 11 12:56
*/
KISSY.add("json",function(c,a){"undefined"!==typeof JSON&&(a=JSON);return c.JSON={parse:function(b){return null==b||""===b?null:a.parse(b)},stringify:a.stringify}},{requires:[KISSY.Features.isNativeJSONSupported()?"":"json/json2"]});
