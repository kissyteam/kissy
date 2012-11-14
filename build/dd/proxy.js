/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 14 21:50
*/
/**
 * @ignore
 * @fileOverview generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/proxy', function (S, Node, Base, DD) {
    var DESTRUCTOR_ID = '__proxy_destructors',
        DDM = DD.DDM,
        stamp = S.stamp,
        MARKER = S.guid('__dd_proxy');

    /**
     * @extends KISSY.Base
     * @class KISSY.DD.Proxy
     * provide abilities for draggable tp create a proxy drag node,
     * instead of dragging the original node.
     */
    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
        self[DESTRUCTOR_ID] = {};
    }

    Proxy.ATTRS = {
        /**
         * how to get the proxy node.
         * default clone the node itself deeply.
         * @cfg {Function} node
         */
        /**
         * @ignore
         */
        node: {
            value: function (drag) {
                return new Node(drag.get('node').clone(true));
            }
        },
        /**
         * destroy the proxy node at the end of this drag.
         * default false
         * @cfg {Boolean} destroyOnEnd
         */
        /**
         * @ignore
         */
        destroyOnEnd: {
            value: false
        },

        /**
         * move the original node at the end of the drag.
         * default true
         * @cfg {Boolean} moveOnEnd
         */
        /**
         * @ignore
         */
        moveOnEnd: {
            value: true
        },

        /**
         * Current proxy node.
         * @type {KISSY.NodeList}
         * @property proxyNode
         */
        /**
         * @ignore
         */
        proxyNode: {

        }
    };

    S.extend(Proxy, Base, {
        /**
         * make this draggable object can be proxied.
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Proxy} this
         */
        attachDrag: function (drag) {

            var self = this,
                destructors = self[DESTRUCTOR_ID],
                tag = stamp(drag, 0, MARKER);

            if (destructors[tag]) {
                return self;
            }

            function start() {
                var node = self.get('node'),
                    dragNode = drag.get('node');
                // cache proxy node
                if (!self.get('proxyNode')) {
                    if (S.isFunction(node)) {
                        node = node(drag);
                        node.addClass('ks-dd-proxy');
                        node.css('position', 'absolute');
                        self.set('proxyNode', node);
                    }
                } else {
                    node = self.get('proxyNode');
                }
                node.show();
                dragNode.parent().append(node);
                DDM.cacheWH(node);
                node.offset(dragNode.offset());
                drag.setInternal('dragNode', dragNode);
                drag.setInternal('node', node);
            }

            function end() {
                var node = self.get('proxyNode');
                if (self.get('moveOnEnd')) {
                    drag.get('dragNode').offset(node.offset());
                }
                if (self.get('destroyOnEnd')) {
                    node.remove();
                    self.set('proxyNode', 0);
                } else {
                    node.hide();
                }
                drag.setInternal('node', drag.get('dragNode'));
            }

            drag.on('dragstart', start);
            drag.on('dragend', end);

            destructors[tag] = {
                drag: drag,
                fn: function () {
                    drag.detach('dragstart', start);
                    drag.detach('dragend', end);
                }
            };
            return self;
        },
        /**
         * make this draggable object unproxied
         * @param {KISSY.DD.Draggable} drag
         * @return {KISSY.DD.Proxy} this
         */
        detachDrag: function (drag) {
            var self = this,
                tag = stamp(drag, 1, MARKER),
                destructors = self[DESTRUCTOR_ID];
            if (tag && destructors[tag]) {
                destructors[tag].fn();
                delete destructors[tag];
            }
            return self;
        },

        /**
         * make all draggable object associated with this proxy object unproxied
         */
        destroy: function () {
            var self = this,
                node = self.get('node'),
                destructors = self[DESTRUCTOR_ID];
            if (node && !S.isFunction(node)) {
                node.remove();
            }
            for (var d in destructors) {
                this.detachDrag(destructors[d].drag);
            }
        }
    });

    // for compatibility
    var ProxyPrototype = Proxy.prototype;
    ProxyPrototype.attach = ProxyPrototype.attachDrag;
    ProxyPrototype.unAttach = ProxyPrototype.detachDrag;

    DD.Proxy = Proxy;

    return Proxy;
}, {
    requires: ['node', 'base', 'dd/base']
});
