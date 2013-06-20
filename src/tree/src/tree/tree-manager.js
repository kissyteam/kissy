/**
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager", function (S, Node, DelegateChildrenExtension) {

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function TreeManager() {
    }

    TreeManager.ATTRS = {
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

            events += ' ';

            if (!isTouchEventSupported) {
                events += (ie && ie < 9 ? "dblclick " : "");
            }

            self.el.delegate(events, '.' + delegateCls,
                self.handleChildrenEvents, self);
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

        '_onSetShowRootNode': function (v) {
            this.get("rowEl")[v ? "show" : "hide"]();
        }
    });

    return TreeManager;

}, {
    requires: [
        'node',
        'component/extension/delegate-children'
    ]
});