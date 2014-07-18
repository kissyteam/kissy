/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Jul 18 13:55
*/
/*
combined modules:
dd/plugin/proxy
*/
KISSY.add('dd/plugin/proxy', [
    'dd',
    'base'
], function (S, require, exports, module) {
    /**
 * @ignore
 * generate proxy drag object,
 * @author yiminghe@gmail.com
 */
    var DD = require('dd'), Base = require('base');
    var DDM = DD.DDM, PROXY_EVENT = '.-ks-proxy' + +new Date();    /**
 * @extends KISSY.Base
 * @class KISSY.DD.Plugin.Proxy
 * Proxy plugin to provide abilities for draggable tp create a proxy drag node,
 * instead of dragging the original node.
 */
    /**
 * @extends KISSY.Base
 * @class KISSY.DD.Plugin.Proxy
 * Proxy plugin to provide abilities for draggable tp create a proxy drag node,
 * instead of dragging the original node.
 */
    module.exports = Base.extend({
        pluginId: 'dd/plugin/proxy',
        /**
     * make this draggable object can be proxied.
     * @param {KISSY.DD.Draggable} drag
     * @private
     */
        pluginInitializer: function (drag) {
            var self = this;
            function start() {
                var node = self.get('node'), dragNode = drag.get('node');    // cache proxy node
                // cache proxy node
                if (!self.get('proxyNode')) {
                    if (typeof node === 'function') {
                        node = node(drag);
                        node.addClass('ks-dd-proxy');
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
                var node = self.get('proxyNode'), dragNode = drag.get('dragNode');
                if (self.get('moveOnEnd')) {
                    dragNode.offset(node.offset());
                }
                if (self.get('destroyOnEnd')) {
                    node.remove();
                    self.set('proxyNode', 0);
                } else {
                    node.hide();
                }
                drag.setInternal('node', dragNode);
            }
            drag.on('dragstart' + PROXY_EVENT, start).on('dragend' + PROXY_EVENT, end);
        },
        /**
     * make this draggable object unproxied
     * @param {KISSY.DD.Draggable} drag
     * @private
     */
        pluginDestructor: function (drag) {
            drag.detach(PROXY_EVENT);
        }
    }, {
        ATTRS: {
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
                    return drag.get('node').clone(true);
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
            destroyOnEnd: { value: false },
            /**
         * move the original node at the end of the drag.
         * default true
         * @cfg {Boolean} moveOnEnd
         */
            /**
         * @ignore
         */
            moveOnEnd: { value: true },
            /**
         * Current proxy node.
         * @type {KISSY.Node}
         * @property proxyNode
         */
            /**
         * @ignore
         */
            proxyNode: {}
        }
    });
});

