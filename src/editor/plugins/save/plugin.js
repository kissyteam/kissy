
KISSY.Editor.add("plugins~save", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        TYPE = E.PLUGIN_TYPE,

        TAG_MAP = {
            b: { tag: "strong" },
            i: { tag: "em" },
            u: { tag: "span", style: "text-decoration:underline" },
            strike: { tag: "span", style: "text-decoration:line-through" }
        };


    E.addPlugin("save", {
        /**
         * 种类
         */
        type: TYPE.FUNC,

        /**
         * 初始化
         */
        init: function() {
            var editor = this.editor,
                textarea = editor.textarea,
                form = textarea.form;

            if(form) {
                Event.on(form, "submit", function() {
                    if(!editor.sourceMode) {
                        textarea.value = editor.getData();
                    }
                });
            }
        },

        /**
         * 过滤数据
         */
        filterData: function(data) {

            data = data.replace(/<(\/?)([^>\s]+)([^>]*)>/g, function(m, slash, tag, attr) {

                // 将 ie 的大写标签转换为小写
                tag = tag.toLowerCase();

                // 让标签语义化
                var map = TAG_MAP[tag],
                    ret = tag;

                // 仅针对 <tag> 这种不含属性的标签做进一步处理
                if(map && !attr) {
                    ret = map["tag"];
                    if(!slash && map["style"]) {
                        ret += ' style="' + map["style"] + '"';
                    }
                }

                return "<" + slash + ret + attr + ">";
            });

            return data;

            // 注:
            //  1. 当 data 很大时，上面的 replace 可能会有性能问题。
            //    （更新：已经将多个 replace 合并成了一个，正常情况下，不会有性能问题）
            //
            //  2. 尽量语义化，google 的实用，但未必对
            // TODO: 进一步优化，比如 <span style="..."><span style="..."> 两个span可以合并为一个

            // FCKEditor 实现了部分语义化
            // Google Docs 采用是实用主义
            // KISSY Editor 的原则是：在保证实用的基础上，尽量语义化
        }
    });
 });
