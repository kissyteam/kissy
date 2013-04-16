/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:15
*/
/**
 * @ignore
 * generate proxy drag object,
 * @author yiminghe@gmail.com
 */
KISSY.add('dd/plugin/proxy', function (S, Node, Base, DD) {
    var DDM = DD.DDM,
        PROXY_EVENT = '.-ks-proxy' + S.now();

    /**
     * @extends KISSY.Base
     * @class KISSY.DD.Plugin.Proxy
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
         * whether hide original node when drag proxy.
         * Defaults to: false
         * @cfg {Boolean} hideNodeOnDrag
         */
        /**
         * @ignore
         */
        hideNodeOnDrag: {
            value: false
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

        pluginId: 'dd/plugin/proxy',

        /**
         * make this draggable object can be proxied.
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        pluginInitializer: function (drag) {

            var self = this, hideNodeOnDrag = self.get('hideNodeOnDrag');

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
                if (hideNodeOnDrag) {
                    dragNode.css('visibility', 'hidden');
                }
            }

            function end() {
                var node = self.get('proxyNode'),
                    dragNode = drag.get('dragNode');
                if (self.get('moveOnEnd')) {
                    dragNode.offset(node.offset());
                }
                if (self.get('destroyOnEnd')) {
                    node.remove();
                    self.set('proxyNode', 0);
                } else {
                    node.hide();
                }
                drag['setInternal']('node', dragNode);
                if (hideNodeOnDrag) {
                    dragNode.css('visibility', 'visible');
                }
            }

            drag['on']('dragstart' + PROXY_EVENT, start)
                .on('dragend' + PROXY_EVENT, end);
        },
        /**
         * make this draggable object unproxied
         * @param {KISSY.DD.Draggable} drag
         * @private
         */
        pluginDestructor: function (drag) {
            drag['detach'](PROXY_EVENT);
        }
    });

    return Proxy;
}, {
    requires: ['node', 'base', 'dd/base']
});
