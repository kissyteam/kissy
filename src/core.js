KISSY.add("core", function(S, UA, DOM, Event, Node, JSON, Ajax, Anim, Base, Cookie) {
    var re = {
        UA:UA,
        DOM:DOM,
        Event:Event,
        Node:Node,
        JSON:JSON,
        Ajax:Ajax,
        Anim:Anim,
        Base:Base,
        Cookie:Cookie
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