/**
 * @ignore
 * root node represent a check tree
 * @author yiminghe@gmail.com
 */

var CheckNode = require('./check-node');
var TreeManager = require('./tree-manager');
/**
 * KISSY Checked Tree. xclass: 'check-tree'.
 * @extends KISSY.Tree.CheckNode
 * @class KISSY.Tree.CheckTree
 * @mixins {KISSY.Tree.Manager}
 */
module.exports = CheckNode.extend([TreeManager], {
    handleKeyDownInternal: function (e) {
        var current = this.get('selectedItem');
        if (current === this) {
            return this.callSuper(e);
        }
        return current && current.handleKeyDownInternal(e);
    },

    _onSetFocused: function (v, e) {
        var self = this;
        self.callSuper(v, e);
        // 得到焦点时没有选择节点
        // 默认选择自己
        if (v && !self.get('selectedItem')) {
            self.select();
        }
    }
}, {
    ATTRS: {
        defaultChildCfg: {
            valueFn: function () {
                return {
                    xclass: 'check-tree-node'
                };
            }
        }
    },
    xclass: 'check-tree'
});