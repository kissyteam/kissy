/**
 * @fileOverview filter dom tree to html string form,api designed by ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/filter", function (S) {
    function Filter() {
        // {priority: ?, value:?}
        this.tagNames = [];
        this.attributeNames = [];
        this.tags = [];
        this.comment = [];
        this.text = [];
        this.cdata = [];
        this.attributes = [];
        this.root = [];
    }

    function findIndexToInsert(arr, p) {
        for (var i = 0; arr && i < arr.length; i++) {
            if (arr[i].priority > p) {
                return i;
            }
        }
        return arr.length;
    }

    function filterName(arr, v) {
        for (var i = 0; arr && i < arr.length; i++) {
            var items = arr[i].value;
            S.each(items, function (item) {
                v = v.replace(item[0], item[1]);
            });
        }
        return v;
    }

    function filterFn(arr, args, _default) {
        for (var i = 0; arr && i < arr.length; i++) {
            var item = arr[i].value;
            if (item.apply(null, args) === false) {
                return false;
            }
        }
        return _default;
    }

    function filterAttr(arr, attrNode, el, _default) {
        for (var i = 0; arr && i < arr.length; i++) {
            var item = arr[i].value,
                name = attrNode.name;
            if (item[name] && item[name].call(null, attrNode.value, el) === false) {
                return false;
            }
        }
        return _default;
    }

    Filter.prototype = {

        /**
         *
         * @param rules
         * {
         *   tagNames:[ [/^ke/,''] ],
         *   attributeNames:[[^on],''],
         *   tags:{
         *      p:function(element){},
         *      ^:function(element){},
         *      $:function(element){}
         *   }
         *   comment:function(){},
         *   attributes:{style:function(){}},
         *   text:function(){},
         *   root:function(){}
         * }
         * @param {Number} [priority] 值越小，优先级越高 ,最低 1
         */
        addRules:function (rules, priority) {
            priority = priority || 10;
            for (var r in rules) {
                if (rules.hasOwnProperty(r)) {
                    var holder = this[r];
                    if (holder) {
                        var index = findIndexToInsert(holder, priority);
                        holder.splice(index, 0, {
                            value:rules[r],
                            priority:priority
                        });
                    }
                }
            }
        },

        /**
         * when encounter element name transformer ,directly transform
         * @param v
         */
        onTagName:function (v) {
            return filterName(this.tagNames, v);
        },

        onAttributeName:function (v) {
            return filterName(this.attributeNames, v);
        },

        onText:function (el) {
            return filterFn(this.text, [el.toHtml(), el], el);
        },

        onCData:function (el) {
            return filterFn(this.cdata, [el.toHtml(), el], el);
        },

        onAttribute:function (attrNode, el) {
            return filterAttr(this.attributes, attrNode, el, attrNode);
        },

        onComment:function (el) {
            return filterFn(this.comment, [el.toHtml(), el], el);
        },

        onNode:function (el) {
            var t = el.nodeType;
            if (t === 1) {
                return this.onTag(el);
            } else if (t === 3) {
                return this.onText(el);
            } else if (t === 8) {
                return this.onComment(el);
            }
        },

        onFragment:function (el) {
            return filterFn(this.root, [el], el);
        },

        onTag:function (el) {
            // ^ tagName $
            var filters = ["^", el.tagName, "$"],
                tags = this.tags,
                ret;
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                for (var j = 0; j < tags.length; j++) {
                    var element = tags[j].value;
                    if (element[filter]) {
                        // node is removed with its children
                        if ((ret = element[filter](el)) === false) {
                            return false;
                        }
                        // node is replaced with another node
                        if (ret && ret != el) {
                            return this.onNode(ret);
                        }
                        // node is removed (children preserved)
                        if (!el.tagName) {
                            return el;
                        }
                    }
                }
            }
            return el;
        }

    };

    return Filter;
});