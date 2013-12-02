/**
 * resize proxy plugin for resizable.
 * same with dd/plugin/proxy
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var Base = require('base');

    var $ = Node.all,
        PROXY_EVENT = '.-ks-proxy' + S.now();

    /**
     * proxy plugin for resizable
     * @class KISSY.Resizable.Plugin.Proxy
     */
    return Base.extend({
        pluginId: 'resizable/plugin/proxy',

        pluginInitializer: function (resizable) {
            var self = this,
                hideNodeOnResize = self.get('hideNodeOnResize');

            function start() {
                var node = self.get('node'),
                    dragNode = resizable.get('node');
                // cache proxy node
                if (!self.get('proxyNode')) {
                    if (typeof node === 'function') {
                        node = node(resizable);
                        self.set('proxyNode', node);
                    }
                } else {
                    node = self.get('proxyNode');
                }
                node.show();
                dragNode.parent().append(node);
                node.css({
                    left: dragNode.css('left'),
                    top: dragNode.css('top'),
                    width: dragNode.width(),
                    height: dragNode.height()
                });
                if (hideNodeOnResize) {
                    dragNode.css('visibility', 'hidden');
                }
            }

            function beforeResize(e) {
                // prevent resizable node to resize
                e.preventDefault();
                self.get('proxyNode').css(e.region);
            }

            function end() {
                var node = self.get('proxyNode'),
                    dragNode = resizable.get('node');
                dragNode.css({
                    left: node.css('left'),
                    top: node.css('top'),
                    width: node.width(),
                    height: node.height()
                });
                if (self.get('destroyOnEnd')) {
                    node.remove();
                    self.set('proxyNode', 0);
                } else {
                    node.hide();
                }
                if (hideNodeOnResize) {
                    dragNode.css('visibility', '');
                }
            }

            resizable.on('resizeStart' + PROXY_EVENT, start)
                .on('beforeResize' + PROXY_EVENT, beforeResize)
                .on('resizeEnd' + PROXY_EVENT, end);
        },

        pluginDestructor: function (resizable) {
            resizable.detach(PROXY_EVENT);
        }
    }, {
        ATTRS: {
            /**
             * pluginId.
             * Defaults to: 'resizable/plugin/proxy'
             * @cfg {String} pluginId
             */


            /**
             * how to get the proxy node.
             * default clone the node itself deeply.
             * @cfg {Function} node
             */
            /**
             * @ignore
             */
            node: {
                value: function (resizable) {
                    return $('<div class="' + resizable.get('prefixCls') +
                        'resizable-proxy"></div>');
                }
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

            },

            /**
             * whether hide original node when resize proxy.
             * Defaults to: false
             * @cfg {Boolean} hideNodeOnResize
             */
            /**
             * @ignore
             */
            hideNodeOnResize: {
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
            }
        }
    });
});