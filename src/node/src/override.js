/**
 * @ignore
 *  overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add('node/override', function (S, DOM,NodeList) {

    var NLP = NodeList.prototype;

    /**
     * Insert every element in the set of newNodes to the end of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method append
     * @member KISSY.NodeList
     */

    /**
     * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
     * @param {KISSY.NodeList} newNodes Nodes to be inserted
     * @return {KISSY.NodeList} this
     * @method prepend
     * @member KISSY.NodeList
     */


        // append(node ,parent) : 参数顺序反过来了
        // appendTo(parent,node) : 才是正常
    S.each(['append', 'prepend', 'before', 'after'], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;
            // 创建
            if (typeof newNode == 'string') {
                newNode = DOM.create(newNode);
            }
            if (newNode) {
                DOM[insertType](newNode, self);
            }
            return self;
        };
    });

    S.each(['wrap', 'wrapAll', 'replaceWith', 'wrapInner'], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (typeof others == 'string') {
                others = NodeList.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    })

}, {
    requires: ['dom', './base']
});

/*
 2011-04-05 yiminghe@gmail.com
 - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents

 2011-05-24
 - yiminghe@gmail.com：
 - 重写 NodeList 的某些方法
 - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */