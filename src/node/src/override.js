/**
 * @fileOverview overrides methods in NodeList.prototype
 * @author yiminghe@gmail.com
 */
KISSY.add("node/override", function (S, DOM, Event, NodeList) {

    var NLP = NodeList.prototype;

    /**
     * append(node ,parent) : 参数顺序反过来了
     * appendTo(parent,node) : 才是正常
     *
     */
    S.each(['append', 'prepend', 'before', 'after'], function (insertType) {
        NLP[insertType] = function (html) {
            var newNode = html, self = this;
            // 创建
            if (S.isString(newNode)) {
                newNode = DOM.create(newNode);
            }
            if (newNode) {
                DOM[insertType](newNode, self);
            }
            return self;
        };
    });

    S.each(["wrap", "wrapAll", "replaceWith", "wrapInner"], function (fixType) {
        var orig = NLP[fixType];
        NLP[fixType] = function (others) {
            var self = this;
            if (S.isString(others)) {
                others = NodeList.all(others, self[0].ownerDocument);
            }
            return orig.call(self, others);
        };
    })

}, {
    requires:["dom", "event", "./base", "./attach"]
});

/**
 * 2011-04-05 yiminghe@gmail.com
 * - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents
 *
 * 2011-05-24
 * - 承玉：
 * - 重写 NodeList 的某些方法
 * - 添加 one ,all ，从当前 NodeList 往下开始选择节点
 * - 处理 append ,prepend 和 DOM 的参数实际上是反过来的
 * - append/prepend 参数是节点时，如果当前 NodeList 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（NodeList）
 */