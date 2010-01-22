/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy, node
 */

KISSY.add('node-selector', function(S, undefined) {

    var doc = document,
        Node = S.Node,
        STRING = 'string',
        supportGBCN = doc.getElementsByClassName,
        REG_ID = /^#[\w-]+$/,
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
        if (context === undefined) {
            context = doc;
        } else if (typeof context === STRING) {
            context = getElementById(context);
        } else if (context instanceof Node) {
            context = context.dom();
        }

        // 为 #id 优化
        if (REG_ID.test(selector)) { // case: #id
            ret = getElementById(selector.slice(1));
        }
        else {
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
                ret = getElementById(id);

                if (tag && !className) { // case: #id tag
                    ret = getElementsByTagName(ret, tag);

                } else if (className) { // case: #id .class or #id tag.class
                    ret = getElementsByClassName(className, tag, ret);
                }

            } else if (className) { // case: .class or tag.class
                ret = getElementsByClassName(className, tag, context);

            } else if (tag) { // case: tag
                ret = getElementsByTagName(context, tag);
            }
        }

        // 返回单个对象
        if (!('length' in ret)) {
            return dom ? ret : new Node(ret);
        }

        // 返回数组
        var arr = [];
        for (i = 0,len = ret.length; i < len; i++) {
            arr[i] = dom ? ret : new Node(ret[i]);
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
        var els = context.getElementsByTagName(tag || '*'),
            ret = [], i, el, len, cls;

        className = ' ' + className + ' ';
        for (i = 0,len = els.length; i < len; i++) {
            el = els[i];
            cls = el.className;
            if (cls && (' ' + cls + ' ').indexOf(className) !== -1) {
                ret.push(el);
            }
        }
        return ret;
    }

    if (supportGBCN || doc.querySelectorAll) {
        getElementsByClassName = function(className, tag, context) {
            var els = supportGBCN ?
                      context.getElementsByClassName(className) :
                      context.querySelectorAll('.' + className),
                ret = els, i, el, len;

            if (tag) {
                ret = [];
                tag = tag.toUpperCase();
                for (i = 0,len = els.length; i < len; i++) {
                    el = els[i];
                    if (el.tagName === tag) {
                        ret.push(el);
                    }
                }
            }
            return ret;
        }
    }
});

/**
 * NOTES:
 *
 * 2010-01-21:
 *  - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉
 *
 * References:
 *  - getElementById 使用频率最高，使用直达通道优化
 *  - querySelectorAll context 的注意点：http://ejohn.org/blog/thoughts-on-queryselectorall/
 *  - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持
 *
 */