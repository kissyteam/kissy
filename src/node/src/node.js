/**
 * @ignore
 * node
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node/base');
    require('node/attach');
    require('node/override');
    require('node/anim');

    S.mix(S, {
        Node: Node,
        NodeList: Node,
        one: Node.one,
        all: Node.all
    });
    return Node;
});