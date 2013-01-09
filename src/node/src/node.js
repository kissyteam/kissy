/**
 * @ignore
 *  node
 * @author yiminghe@gmail.com
 */
KISSY.add('node', function (S, Node) {
    S.mix(S, {
        Node: Node,
        NodeList: Node,
        one: Node.one,
        all: Node.all
    });
    return Node;
}, {
    requires: [
        'node/base',
        'node/attach',
        'node/override',
        'node/anim'
    ]
});