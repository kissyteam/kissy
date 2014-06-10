/**
 * @ignore
 * delegate all draggable nodes to one draggable object
 * @author yiminghe@gmail.com
 */

var DDM = require('./ddm'),
    Draggable = require('./draggable'),
    PREFIX_CLS = DDM.PREFIX_CLS,
    $ = require('node');

/**
 * @extends KISSY.DD.Draggable
 * @class KISSY.DD.DraggableDelegate
 * drag multiple nodes under a container element
 * using only one draggable instance as a delegate.
 */
module.exports = Draggable.extend({
        // override Draggable
        _onSetNode: function () {

        },

        _onSetDisabled: function (d) {
            var self = this;
            var container = self.get('container');
            if (container) {
                container[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
                self[d ? 'stop' : 'start']();
            }
        },

        getEventTargetEl: function () {
            return this.get('container');
        },

        /*
         父容器监听 mousedown，找到合适的拖动 handlers 以及拖动节点
         */
        onGestureStart: function (ev) {
            var self = this,
                handler,
                node;

            if (!self._checkDragStartValid(ev)) {
                return;
            }

            var handlers = self.get('handlers'),
                target = $(ev.target);

            // 不需要像 Draggable 一样，判断 target 是否在 handler 内
            // 委托时，直接从 target 开始往上找 handler
            if (handlers.length) {
                handler = self._getHandler(target);
            } else {
                handler = target;
            }

            if (handler) {
                node = self._getNode(handler);
            }

            // can not find handler or can not find matched node from handler
            // just return !
            if (!node) {
                return;
            }

            self.setInternal('activeHandler', handler);

            // 找到 handler 确定 委托的 node ，就算成功了
            self.setInternal('node', node);
            self.setInternal('dragNode', node);
            self._prepare(ev);
        },

        /*
         得到适合 handler，从这里开始启动拖放，对于 handlers 选择器字符串数组
         */
        _getHandler: function (target) {
            var self = this,
                node = self.get('container'),
                handlers = self.get('handlers');
            while (target && target[0] !== node[0]) {
                for (var i = 0; i < handlers.length; i++) {
                    var h = handlers[i];
                    if (target.test(h)) {
                        return target;
                    }
                }
                target = target.parent();
            }
            return null;
        },

        /*
         找到真正应该移动的节点，对应 selector 属性选择器字符串
         */
        _getNode: function (h) {
            return h.closest(this.get('selector'), this.get('container'));
        }
    },
    {
        ATTRS: {
            /**
             * a selector query to get the container to listen for mousedown events on.
             * All 'draggable selector' should be a child of this container
             * @cfg {HTMLElement|String} container
             */
            /**
             * @ignore
             */
            container: {
                setter: function (v) {
                    return $(v);
                }
            },

            /**
             * a selector query to get the children of container to make draggable elements from.
             * usually as for tag.cls.
             * @cfg {String} selector
             */
            /**
             * @ignore
             */
            selector: {
            },

            /**
             * handlers to initiate drag operation.
             * can only be as form of tag.cls.
             * default {@link #selector}
             * @cfg {String[]} handlers
             **/
            /**
             * @ignore
             */
            handlers: {
                valueFn: function () {
                    return [];
                },
                // 覆盖父类的 getter ，这里 normalize 成节点
                getter: 0
            }
        }
    });