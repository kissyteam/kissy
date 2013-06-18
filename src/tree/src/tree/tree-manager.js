/**
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager", function (S, Node, Component, Extension) {

    var KeyCode = Node.KeyCode;

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function TreeManager() {
    }

    TreeManager.ATTRS =
    /**
     * @lends Tree#
     */
    {
        /**
         * Whether show root node.
         * Defaults to: true.
         * @type {Boolean}
         */
        showRootNode: {
            value: true,
            view: 1
        },
        /**
         * Current selected tree node.
         * @type {KISSY.Tree.Node}
         * @readonly
         */
        selectedItem: {},

        // only root node is focusable
        focusable: {
            value: true
        }
    };

    S.augment(TreeManager, Extension.DelegateChildren, {

        isTree: 1,

        __bindUI: function () {
            var self = this,
                prefixCls=self.get('prefixCls'),
                delegateCls=prefixCls+'tree-node',
                events = Gesture.tap;

            events += ' ';

            if (!isTouchEventSupported) {
                events += (ie && ie < 9 ? "dblclick " : "");
            }

            self.get("el").delegate(events, '.'+delegateCls,
                self.handleChildrenEvents, self);
        },

        handleKeyEventInternal: function (e) {
            var current = this.get("selectedItem");
            if (e.keyCode == KeyCode.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },

        // 单选
        '_onSetSelectedItem': function (n, ev) {
            // 仅用于排他性
            if (n && ev.prevVal) {
                ev.prevVal.set("selected", false, {
                    data: {
                        byPassSetTreeSelectedItem: 1
                    }
                });
            }
        },

        _onSetFocused: function (v) {
            var self = this;
            Component.Controller.prototype._onSetFocused.apply(self, arguments);
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }
    });

    return TreeManager;
}, {
    requires: ['node', 'component/base', 'component/extension']
});