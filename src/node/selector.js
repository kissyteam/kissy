/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy, node
 */

KISSY.add('node-selector', function(S) {

    var doc = document,
        Node = S.Node,
        STRING = 'string',
        REG_QUERY = /^(#([\w-]+)?\s?|^)([\w-]+)?\.?(\w+)?$/;

    /**
     * Retrieves a Node or an Array of Nodes based on the given CSS selector.
     * @param {string} selector
     * @param {string|HTMLElement|Node} context A #id string, DOM Element, or Node to use as context.
     * @param {boolean} dom If false, return Node, else return DOM Element. default is false.
     */
    S.query = function(selector, context, dom) {
        var match, ret, id, tag, className, i, len;

        // selector 必须为有效的字符串，否则怎来的怎么回去
        if (typeof selector !== STRING || !selector) {
            return selector;
        }

        // 将 context 转换为原生 DOM 元素
        context = context || doc;
        if (typeof context === STRING) {
            context = getElementById(context);
        } else if (context instanceof Node) {
            context = context.dom();
        }

        // 考虑 2/8 原则，仅支持以下选择器：
        // #id
        // .class
        // tag
        // tag.class
        // #id tag
        // #id .class
        // #id tag.class
        // Ref: http://ejohn.org/blog/selectors-that-people-actually-use/
        // 用正则匹配出需要的信息
        if (match = REG_QUERY.exec(selector)) {
            id = match[2];
            tag = match[3];
            className = match[4];
        }

        // 调用内部方法，获取所有满足条件的元素
        if (id) {
            ret = getElementById(id); // case: #id

            if(tag && !className) { // case: #id tag
                ret = getElementsByTagName(ret, tag);

            } else if(className) { // case: #id .class or #id tag.class
                ret = getElementsByClassName(className, tag, ret);
            }

        } else if(className) { // case: .class or tag.class
            ret = getElementsByClassName(className, tag, context);

        } else if(tag) { // case: tag
            ret = getElementsByTagName(ret, tag);
        }

        // 返回单个对象
        if(!('length' in ret)) {
            return dom ? ret : Node(ret);
        }

        // 返回数组
        var arr = [];
        for(i = 0, len = ret.length; i < len; i++) {
            arr[i] = dom ? ret : Node(ret[i]);
        }
        return arr;
    };


    // case: #id
    function getElementById(id) {
        return doc.getElementById(id);
    }

    // case: tag
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }

    // case: .class
    function getElementsByClassName(className, tag, context) {
        var ret = [],
            els =  context.getElementsByTagName(tag || '*'),
            i = 0, el,
            len = els.length;

        className = ' ' + className + ' ';
        while(i++ < len){
            el = els[i];
            if ((' ' + el.className + ' ').indexOf(className) !== -1) {
                ret[i] = el;
            }
        }

        return ret;
    }
});
