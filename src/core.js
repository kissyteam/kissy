KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie) {
    var re = {
        UA:UA,
        DOM:DOM,
        Event:Event,
        EventTarget:Event.Target,
        Node:Node,
        JSON:JSON,
        Ajax:Ajax,
        IO:Ajax,
        ajax:Ajax,
        io:Ajax,
        jsonp:Ajax.jsonp,
        Anim:Anim,
        Easing:Anim.Easing,
        Base:Base,
        Cookie:Cookie,
        one:Node.one,
        all:Node.List.all,
        get:DOM.get,
        query:DOM.query
    };
    S.mix(S, re);
    return re;
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
        "cookie"
    ]
});