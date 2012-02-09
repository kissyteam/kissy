/**
 * @fileOverview node
 * @author yiminghe@gmail.com
 */
KISSY.add("node", function (S, Event, Node) {
    Node.KeyCodes = Event.KeyCodes;
    S.mix(S, {
        Node:Node,
        NodeList:Node,
        one:Node.one,
        all:Node.all
    });
    return Node;
}, {
    requires:[
        "event",
        "node/base",
        "node/attach",
        "node/override",
        "node/anim"]
});