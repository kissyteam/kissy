/**
 * @ignore
 * root node represent a simple tree
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var TreeNode = require('./node');
    var TreeManager = require('./tree-manager');

    /*多继承
     1. 继承基节点（包括可装饰儿子节点功能）
     2. 继承 mixin 树管理功能
     3. 继承 mixin 儿子事件代理功能
     */

    /**
     * KISSY Tree. xclass: 'tree'.
     * @class KISSY.Tree
     * @extends KISSY.Tree.Node
     */
    return TreeNode.extend([TreeManager], {
        handleKeyDownInternal: function (e) {
            var current = this.get('selectedItem');
            if (current === this) {
                return this.callSuper(e);
            }
            return current && current.handleKeyDownInternal(e);
        },

        _onSetFocused: function (v) {
            var self = this;
            self.callSuper(v);
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get('selectedItem')) {
                self.select();
            }
        }
    }, {
        ATTRS: {
            defaultChildCfg: {
                value: {
                    xclass: 'tree-node'
                }
            }
        },
        xclass: 'tree'
    });
});

/*
 Refer:
 - http://www.w3.org/TR/wai-aria-practices/#TreeView

 note bug:
 1. checked tree 根节点总是 selected ！
 2. 根节点 hover 后取消不了了



 支持 aria
 重用组件框架
 键盘操作指南

 tab 到树，自动选择根节点

 上下键在可视节点间深度遍历
 左键
 已展开节点：关闭节点
 已关闭节点: 移动到父亲节点
 右键
 已展开节点：移动到该节点的第一个子节点
 已关闭节点: 无效
 enter : 触发 click 事件
 home : 移动到根节点
 end : 移动到前序遍历最后一个节点
 */