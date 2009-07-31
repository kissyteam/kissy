
KISSY.Editor.add("plugins~save", function(E) {

    var Y = YAHOO.util, Event = Y.Event,
        TYPE = E.PLUGIN_TYPE;


    E.addPlugin("save", {
        /**
         * 种类
         */
        type: TYPE.CUSTOM,

        /**
         * 初始化
         */
        init: function(editor) {
            var textarea = editor.textarea,
                form = textarea.form;

            if(form) {
                Event.on(form, "submit", function() {
                    textarea.value = editor.getData();
                });
            }
        },

        /**
         * 过滤数据
         */
        filterData: function(data) {

            data = data
                // 将 ie 的大写标签和 style 等属性值转换为小写
                .replace(/<\/?[^>]+>/g, function(tag) {
                    return tag.toLowerCase();
                })
                // 让标签样式化
                .replace(/<strong>/g, "<b>").replace(/<\/strong>/g, "</b>")
                .replace(/<em>/g, "<i>").replace(/<\/em>/g, "</i>")
                ;

            return data;

            // 注:
            //  1. 将编辑器定义为样式编辑器而非语义编辑器。
            //  2. 实现语义化，需要将 b, i, u, s 转换为 strong, em, ins, del. 但在实际使用场景中，
            //     斜体不一定表示强调，下划线也不定义代表插入，因此 goto 1.
            //  4. 去掉了 ua 判断，是因为有可能从其它地方 copy 过来，比如 word.
            //  5. 当 data 很大时，上面的 replace 可能会有性能问题。

            // FCKEditor 实现了部分语义化
            // Google Docs 采用是实用主义
            // 我这里暂时全部采用 Google Docs 的方案
        }
    });
 });
