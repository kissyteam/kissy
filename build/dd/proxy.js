/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 5 02:23
*/
/**
 * @ignore
 * @fileOverview generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/proxy', function (S, Node, Base, DD) {
    var DDM = DD.DDM,
        PROXY_EVENT = '.-ks-proxy' + S.now();

    /**
     * @extends KISSY.Base
     * @class KISSY.DD.Proxy
     * Proxy plugin to provide abilities for draggable tp create a proxy drag node,
     * instead of dragging the original node.
     */
    function Proxy() {
        var self = this;
        Proxy.superclass.constructor.apply(self, arguments);
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
         * @private
         */
        initializer: function (drag) {

            var self = this;

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

            drag['on']('dragstart' + PROXY_EVENT, start)
                .on('dragend' + PROXY_EVENT, end);
        },
        /**
         * make this draggable object unproxied
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        destructor: function (drag) {
            drag['detach'](PROXY_EVENT);
        },

        detachDrag: function (drag) {
            S.log('dd.proxy.detachDrag is deprecated, call unplug/destroy on drag please', 'warn');
            this.destructor(drag);
        },

        attachDrag: function (drag) {
            S.log('dd.proxy.attachDrag is deprecated, call plug on drag please', 'warn');
            this.initializer(drag);
        },

        destroy: function () {
            S.log('dd.proxy.destroy is deprecated, call unplug/destroy on drag please', 'warn');
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
