/**
 * @ignore
 * overrides methods in Node.prototype
 * @author yiminghe@gmail.com
 */

var util = require('util');
var Dom = require('dom');
/*global Node:true*/
var Node = require('./base');
require('./attach');

var NLP = Node.prototype;

/**
 * Insert every element in the set of newNodes to the end of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method append
 * @member KISSY.Node
 */

/**
 * Insert every element in the set of newNodes to the beginning of every element in the set of current node list.
 * @param {KISSY.Node} newNodes Nodes to be inserted
 * @return {KISSY.Node} this
 * @method prepend
 * @member KISSY.Node
 */

    // append(node ,parent): reverse param order
    // appendTo(parent,node): normal
util.each(['append', 'prepend', 'before', 'after'], function (insertType) {
    NLP[insertType] = function (html) {
        var newNode = html, self = this;
        // create
        if (typeof newNode !== 'object') {
            newNode = Dom.create(newNode + '');
        }
        if (newNode) {
            Dom[insertType](newNode, self);
        }
        return self;
    };
});

util.each(['wrap', 'wrapAll', 'replaceWith', 'wrapInner'], function (fixType) {
    var orig = NLP[fixType];
    NLP[fixType] = function (others) {
        var self = this;
        if (typeof others === 'string') {
            others = Node.all(others, self[0].ownerDocument);
        }
        return orig.call(self, others);
    };
});

/*
 2011-04-05 yiminghe@gmail.com
 - 增加 wrap/wrapAll/replaceWith/wrapInner/unwrap/contents

 2011-05-24
 - yiminghe@gmail.com：
 - 重写 Node 的某些方法
 - 添加 one ,all ，从当前 Node 往下开始选择节点
 - 处理 append ,prepend 和 Dom 的参数实际上是反过来的
 - append/prepend 参数是节点时，如果当前 Node 数量 > 1 需要经过 clone，因为同一节点不可能被添加到多个节点中去（Node）
 */