/**
 * filter dom tree to html string form ,api designed by ckeditor
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/filter", function(S) {
    function Filter() {
        // {priority: ?, value:?}
        this.tagNames = [];
        this.attributeNames = [];
        this.tags = [];
        this.comments = [];
        this.texts = [];
        this.cdatas = [];
        this.attributes = [];
    }

    function findIndexToInsert(arr, p) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].priority > p) {
                return i;
            }
        }
        return arr.length;
    }

    function filterName(arr, v) {
        for (var i = 0; i < arr.length; i++) {
            var items = arr[i].value;
            S.each(items, function(item) {
                v = v.replace(item[0], item[1]);
            });
        }
        return v;
    }

    function filterFn(arr, args, _default) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i].value;
            if (item.apply(null, args) === false) {
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
         *   tags:{p:function(element){}}
         *   comments:function(){},
         *   attributes:function(){},
         *   texts:function(){}
         * }
         * @param priority 值越小，优先级越高 ,最低 1
         */
        addRules:function(rules, priority) {
            priority = priority || 10;
            for (var r in rules) {
                var holder = this[r],
                    index = findIndexToInsert(holder, priority);
                holder.splice(index, 0, {
                    value:rules[r],
                    priority:priority
                });
            }
        },

        /**
         * when encounter element name transformer ,directly transform
         * @param v
         */
        onTagName:function(v) {
            return filterName(this.tagNames, v);
        },

        onAttributeName:function(v) {
            return filterName(this.attributeNames, v);
        },

        onText:function(el) {
            return filterFn(this.texts, [el.toHtml(),el], el);
        },

        onCData:function(el) {
            return filterFn(this.cdatas, [el.toHtml(),el], el);
        },

        onAttribute:function(el, attrNode) {
            return filterFn(this.attributes, [attrNode,el], attrNode);
        },

        onComment:function(el) {
            return filterFn(this.comments, [el.toHtml(),el], el);
        },

        onNode:function(el) {
            var t = el.nodeType;
            if (t === 1) {
                return this.onTag(el);
            } else if (t === 3) {
                return this.onText(el.toHtml(), el);
            } else if (t === 8) {
                return this.onComment(el.toHtml(), el);
            }
        },

        onTag:function(el) {
            // ^ tagName $
            var filters = ["^",el.tagName,"$"],
                tags = this.tags,
                ret;
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                for (var j = 0; j < tags.length; j++) {
                    var element = tags[j].value;
                    if (element[filter]) {
                        if ((ret = element[filter](el)) === false) {
                            return false;
                        }
                        if (ret && ret != element) {
                            return this.onNode(ret);
                        }
                        if (!el.name) {
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