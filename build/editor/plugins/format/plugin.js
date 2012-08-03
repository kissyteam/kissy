/**
 * format formatting,modified from ckeditor
 * @modifier yiminghe@gmail.com
 */
KISSY.Editor.add("format", function(editor) {
    editor.addPlugin("format", function() {
        var S = KISSY,
            KE = S.Editor,
            FORMAT_SELECTION_ITEMS = [],
            FORMATS = {
                "普通文本":"p",
                "标题1":"h1",
                "标题2":"h2",
                "标题3":"h3",
                "标题4":"h4",
                "标题5":"h5",
                "标题6":"h6"
            },
            FORMAT_SIZES = {
                p:"1em",
                h1:"2em",
                h2:"1.5em",
                h3:"1.17em",
                h4:"1em",
                h5:"0.83em",
                h6:"0.67em"
            },
            FORMAT_STYLES = {},
            KEStyle = KE.Style;

        for (var p in FORMATS) {
            if (FORMATS[p]) {
                FORMAT_STYLES[FORMATS[p]] = new KEStyle({
                    element:FORMATS[p]
                });
                FORMAT_SELECTION_ITEMS.push({
                    name:p,
                    value:FORMATS[p],
                    attrs:{
                        style:"font-size:" + FORMAT_SIZES[FORMATS[p]]
                    }
                });

            }
        }

        var context = editor.addSelect("font-family", {
            items:FORMAT_SELECTION_ITEMS,
            title:"标题",
            width:"100px",
            mode:KE.WYSIWYG_MODE,
            popUpWidth:"120px",
            click:function(ev) {
                var self = this,
                    v = ev.newVal,
                    pre = ev.prevVal;
                editor.fire("save");
                if (v != pre) {
                    FORMAT_STYLES[v].apply(editor.document);
                } else {
                    FORMAT_STYLES["p"].apply(editor.document);
                    self.btn.set("value", "p");
                }
                editor.fire("save");
            },
            selectionChange:function(ev) {
                var self = this,
                    elementPath = ev.path;
                // For each element into the elements path.
                // Check if the element is removable by any of
                // the styles.
                for (var value in FORMAT_STYLES) {
                    if (FORMAT_STYLES[ value ].checkActive(elementPath)) {
                        self.btn.set("value", value);
                        return;
                    }
                }
            }
        });


        this.destroy = function() {
            context.destroy();
        };
    });
}, {
    attach:false
});
