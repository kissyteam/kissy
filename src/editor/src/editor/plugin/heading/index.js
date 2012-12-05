/**
 * Heading plugin for KISSY.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/heading/index", function (S, Editor, headingCmd) {

    function HeadingPlugin() {

    }

    S.augment(HeadingPlugin, {
        pluginRenderUI: function (editor) {
            headingCmd.init(editor);

            var FORMAT_SELECTION_ITEMS = [],
                FORMATS = {
                    "普通文本": "p",
                    "标题1": "h1",
                    "标题2": "h2",
                    "标题3": "h3",
                    "标题4": "h4",
                    "标题5": "h5",
                    "标题6": "h6"
                },
                FORMAT_SIZES = {
                    p: "1em",
                    h1: "2em",
                    h2: "1.5em",
                    h3: "1.17em",
                    h4: "1em",
                    h5: "0.83em",
                    h6: "0.67em"
                };

            for (var p in FORMATS) {

                FORMAT_SELECTION_ITEMS.push({
                    content: p,
                    value: FORMATS[p],
                    elAttrs: {
                        style: "font-size:" + FORMAT_SIZES[FORMATS[p]]
                    }
                });

            }

            editor.addSelect("heading", {
                defaultCaption: "标题",
                width: "120px",
                menu: {
                    children: FORMAT_SELECTION_ITEMS
                },
                mode: Editor.WYSIWYG_MODE,
                listeners: {
                    click: function (ev) {
                        var v = ev.target.get("value")
                        editor.execCommand("heading", v);
                    },
                    afterSyncUI: function () {
                        var self = this;
                        editor.on("selectionChange", function () {
                            if (editor.get("mode") == Editor.SOURCE_MODE) {
                                return;
                            }
                            // For each element into the elements path.
                            // Check if the element is removable by any of
                            // the styles.
                            var headingValue = editor.queryCommandValue("heading"), value;
                            for (value in FORMAT_SIZES) {
                                if (value == headingValue) {
                                    self.set("value", value);
                                    return;
                                }
                            }
                            self.set("value", null);
                        });
                    }

                }
            });
        }
    });

    return HeadingPlugin;
}, {
    requires: ['editor', './cmd']
});