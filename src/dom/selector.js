/**
 * @module  selector
 * @author  lifesinger@gmail.com
 * @depends kissy, dom
 */

KISSY.add('selector', function(S, undefined) {

    var doc = document,
        STRING = 'string',
        SPACE = ' ',
        slice = Array.prototype.slice,
        REG_ID = /^#[\w-]+$/,
        REG_QUERY = /^(?:#([\w-]+))?\s*([\w-]+)?\.?([\w-]+)?$/;

    /**
     * Retrieves an Array of HTMLElement based on the given CSS selector.
     * @param {string} selector
     * @param {string|HTMLElement} context An id string or a HTMLElement used as context
     * @return {Array} The array of found HTMLElement
     */
    S.query = function(selector, context) {
        var match, t, ret = [], id, tag, cls;

        // Ref: http://ejohn.org/blog/selectors-that-people-actually-use/        
        // 考虑 2/8 原则，仅支持以下选择器：
        // #id
        // tag
        // .cls
        // #id tag
        // #id .cls
        // tag.cls
        // #id tag.cls
        // 注意：REG_QUERY 还会匹配 #id.cls 无效值
        // 返回值为数组，没找到时返回空数组
        // 如果选择器不在上面的列表中，或者参数非法，统统抛异常

        // selector 为字符串是最常见的情况，优先考虑
        // 注：空字符串无需判断，运行下去自动能返回空数组
        if (typeof selector === STRING) {
            selector = S.trim(selector);

            // selector 为 #id 是最常见的情况，特殊优化处理
            if (REG_ID.test(selector)) {
                t = getElementById(selector.slice(1));
                if (t) ret = [t]; // #id 无效时，返回空数组
            }
            // selector 为支持列表中的其它 6 种
            else if (match = REG_QUERY.exec(selector)) {
                // 获取匹配出的信息
                id = match[1];
                tag = match[2];
                cls = match[3];

                if (id) {
                    // 进入此处，可能的情况为：#id tag, #id .cls, #id tag.cls, #id.cls
                    // 其中 #id.cls 是无效选择器

                    t = getElementById(id);

                    // #id tag
                    if (tag && !cls) {
                        ret = getElementsByTagName(t, tag);
                    }
                    // #id .cls or #id tag.cls
                    else {
                        if (selector.indexOf(SPACE) !== -1) { // 排除 #id.cls
                            ret = getElementsByClassName(cls, tag, t);
                        }
                    }
                }
                else {
                    context = tuneContext(context);

                    // .class or tag.class
                    if (cls) {
                        ret = getElementsByClassName(cls, tag, context);
                    }
                    // tag
                    else if(tag) { // 注：这里判断 tag, 可以去除 selector 为空白字符串的情况
                        ret = getElementsByTagName(context, tag);
                    }
                }
            }
        }
        // 传入的 selector 是 Node
        else if (selector.nodeType) {
            ret = [selector];
        }
        // 传入的 selector 是 NodeList
        else if (selector.item) {
            ret = selector;
        }
        // 传入的 selector 是其它值时，返回空数组

        // 将 NodeList 转换为普通数组，并添加上使用方法
        return attachMethods(ret.item ? makeArray(ret) : ret);
    };

    // 调整 context
    function tuneContext(context) {
        // 1). context 为 undefined 是最常见的情况，优先考虑。
        if (context === undefined) {
            context = doc;
        }
        // 2). context 的第二使用场景是传入 #id
        else if (typeof context === STRING && REG_ID.test(context)) {
            context = getElementById(context.slice(1));
            // 注：#id 可能无效，这时获取的 context 为 null. 在下面的处理中会抛出预期的异常。
        }
        // 3). context 还可以传入 HTMLElement, 此时无需处理。
        // 4). 其它情况，保持 context 的传入值，下面的代码自动会抛出异常。
        return context;
    }

    // query #id
    function getElementById(id) {
        return doc.getElementById(id);
    }

    // query tag
    function getElementsByTagName(el, tag) {
        return el.getElementsByTagName(tag);
    }

    // query .cls
    function getElementsByClassName(cls, tag, context) {
        var els = context.getElementsByTagName(tag || '*'),
            ret = [], i = 0, j = 0, len = els.length, el, t;

        cls = SPACE + cls + SPACE;
        for (; i < len; i++) {
            el = els[i];
            t = el.className;
            if (t && (SPACE + t + SPACE).indexOf(cls) > -1) {
                ret[j++] = el;
            }
        }
        return ret;
    }

    // 用原生的 getElementsByClassName
    if (doc.getElementsByClassName) {
        getElementsByClassName = function(cls, tag, context) {
            var els = context.getElementsByClassName(cls),
                ret = els, i = 0, j = 0, len = els.length, el;

            if (tag) {
                ret = [];
                tag = tag.toUpperCase();
                for (; i < len; i++) {
                    el = els[i];
                    if (el.tagName === tag) {
                        ret[j++] = el;
                    }
                }
            }
            return ret;
        }
    }
    // 用原生的 querySelectorAll
    else if (doc.querySelectorAll) {
        getElementsByClassName = function(cls, tag, context) {
            return context.querySelectorAll((tag ? tag : '') + '.' + cls);
        }
    }

    // 将 NodeList 转换为普通数组
    function makeArray(nodeList) {
        return slice.call(nodeList, 0);
    }

    // ie 不支持 slice 转换 NodeList, 降级到普通方法
    try {
        slice.call(doc.documentElement.childNodes, 0);
    }
    catch(e) {
        makeArray = function(nodeList) {
            var ret = [], i, len;
            for (i = 0,len = nodeList.length; i < len; i++) {
                ret[i] = nodeList[i];
            }
            return ret;
        }
    }

    // 添加实用方法到 arr 上
    function attachMethods(arr) {
        return S.mix(arr, S.Dom);
    }

});

/**
 * NOTES:
 *
 * 2010.01:
 *  - 对 reg exec 的结果(id, tag, className)做 cache, 发现对性能影响很小，去掉
 *  - getElementById 使用频率最高，使用直达通道优化
 *  - getElementsByClassName 性能优于 querySelectorAll, 但 IE 系列不支持
 *  - new Node() 即便 Node 很简单，在大量循环下，对性能也会有明显降低
 *  - instanceof 对性能有影响
 *
 * References:
 *  - querySelectorAll context 的注意点：http://ejohn.org/blog/thoughts-on-queryselectorall/
 */