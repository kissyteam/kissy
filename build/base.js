/*
Copyright 2011, KISSY UI Library v1.1.7dev
MIT Licensed
build time: ${build.time}
*/
KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie, DataLazyload) {

    return {
        UA:UA,
        DOM:DOM,
        Event:Event,
        Node:Node,
        JSON:JSON,
        Ajax:Ajax,
        Anim:Anim,
        Base:Base,
        Cookie:Cookie,
        DataLazyload:DataLazyload
    };

}, {
    requires:[
        "ua",
        "dom",
        "event",
        "node",
        "json",
        "ajax",
        "anim",
        "base",
        "cookie",
        "datalazyload"
    ]
});
