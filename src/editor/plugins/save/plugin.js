
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
                        //var val = editor.getData();
                        // 统一样式  由后台控制
//                        if(val && val.indexOf('<div class="ks-editor-post">') !== 0) {
//                            val = '<div class="ks-editor-post">' + val + '</div>';
//                        }
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

            // 过滤 word 的垃圾数据
            if(data.indexOf("mso") > 0) {
                data = this.filterWord(data);
            }

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
        },

        /**
         * 过滤 word 粘贴过来的垃圾数据
         * Ref: CKEditor - pastefromword plugin
         */
        filterWord: function(html) {

            // Remove onmouseover and onmouseout events (from MS Word comments effect)
            html = html.replace(/<(\w[^>]*) onmouseover="([^\"]*)"([^>]*)/gi, "<$1$3");
            html = html.replace(/<(\w[^>]*) onmouseout="([^\"]*)"([^>]*)/gi, "<$1$3");

            // The original <Hn> tag send from Word is something like this: <Hn style="margin-top:0px;margin-bottom:0px">
            html = html.replace(/<H(\d)([^>]*)>/gi, "<h$1>");

            // Word likes to insert extra <font> tags, when using MSIE. (Wierd).
            html = html.replace(/<(H\d)><FONT[^>]*>([\s\S]*?)<\/FONT><\/\1>/gi, "<$1>$2<\/$1>");
            html = html.replace(/<(H\d)><EM>([\s\S]*?)<\/EM><\/\1>/gi, "<$1>$2<\/$1>");

            // Remove <meta xx...>
            html = html.replace(/<meta[^>]*>/ig, "");

            // Remove <link rel="xx" href="file:///...">
            html = html.replace(/<link rel="\S+" href="file:[^>]*">/ig, "");

            // Remove <!--[if gte mso 9|10]>...<![endif]-->
            html = html.replace(/<!--\[if gte mso [0-9]{1,2}\]>[\s\S]*?<!\[endif\]-->/ig, "");

            // Remove <style> ...mso...</style>
            html = html.replace(/<style>[\s\S]*?mso[\s\S]*?<\/style>/ig, "");

            // Remove lang="..."
            html = html.replace(/ lang=".+?"/ig, "");

            // Remove <o:p></o:p>
            html = html.replace(/<o:p><\/o:p>/ig, "");

            // Remove class="MsoNormal"
            html = html.replace(/ class="Mso.+?"/ig, "");

            // Remove XML elements and declarations
            html = html.replace(/<\\?\?xml[^>]*>/ig, "") ;

            return html;
        }

    });
 });
