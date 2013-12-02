/**
 * @ignore
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('node');
    var DelegateChildrenExtension = require('component/extension/delegate-children');

    var UA = S.UA,
        ie = UA.ieMode,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    /**
     * Manage tree node for tree root
     * @class KISSY.Tree.Manager
     */
    function TreeManager() {
    }

    TreeManager.ATTRS = {
        /**
         * Whether show root node.
         * Defaults to: true.
         * @cfg {Boolean} showRootNode
         */
        /**
         * @ignore
         */
        showRootNode: {
            value: true,
            view: 1
        },
        /**
         * Current selected tree node.
         * @property {KISSY.Tree.Node} selectedItem
         * @readonly
         */
        /**
         * @ignore
         */
        selectedItem: {},

        // only root node is focusable
        focusable: {
            value: true
        },

        handleMouseEvents: {
            value: true
        }
    };

    S.augment(TreeManager, DelegateChildrenExtension, {
        isTree: 1,

        __bindUI: function () {
            var self = this,
                prefixCls = self.get('prefixCls'),
                delegateCls = prefixCls + 'tree-node',
                events = Gesture.tap;

            if (!isTouchEventSupported) {
                events += (ie && ie < 9 ? ' dblclick ' : '');
            }

            self.$el.delegate(events, '.' + delegateCls,
                self.handleChildrenEvents, self);
        },

        // 单选
        '_onSetSelectedItem': function (n, ev) {
            // 仅用于排他性
            if (n && ev.prevVal) {
                ev.prevVal.set('selected', false, {
                    data: {
                        byPassSetTreeSelectedItem: 1
                    }
                });
            }
        },

        '_onSetShowRootNode': function (v) {
            this.get('rowEl')[v ? 'show' : 'hide']();
        }
    });

    return TreeManager;
});