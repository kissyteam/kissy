/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Jul 30 23:50
*/
/**
 * resize functionality
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/resize/index", function (S, Editor, DD) {
    var Node = S.Node;

    function Resize(config) {
this.config=config||{};
    }

    S.augment(Resize, {
        renderUI:function (editor) {
            var Draggable = DD['Draggable'],
                statusBarEl = editor.get("statusBarEl"),
                textarea = editor.get("textarea"),
                cfg = this.config,
                direction = cfg["direction"] || ["x", "y"];

            var cursor = 'se-resize';

            if (direction.length == 1) {
                if (direction[0] == "x") {
                    cursor = "e-resize"
                } else {
                    cursor = "s-resize"
                }
            }

            var resizer = new Node("<div class='ks-editor-resizer' style='cursor: "
                + cursor +
                "'></div>").appendTo(statusBarEl);

            //最大化时就不能缩放了
            editor.on("maximizeWindow", function () {
                resizer.css("display", "none");
            });

            editor.on("restoreWindow", function () {
                resizer.css("display", "");
            });

            var d = new Draggable({
                    node:resizer
                }),
                height = 0,
                width = 0,
                heightEl = editor.get("el"),
                widthEl = editor.get("el");

            d.on("dragstart", function () {
                height = heightEl.height();
                width = widthEl.width();
                editor.fire("resizeStart");
            });

            d.on("drag", function (ev) {
                var self = this,
                    diffX = ev.left - self['startNodePos'].left,
                    diffY = ev.top - self['startNodePos'].top;
                if (S.inArray("y", direction)) {
                    editor.set("height", height + diffY);
                }
                if (S.inArray("x", direction)) {
                    editor.set("width", width + diffX);
                }
                editor.fire("resize");
            });

            editor.on("destroy", function () {
                d.destroy();
                resizer.remove();
            });
        }
    });

    return Resize;
}, {
    requires:['editor', 'dd']
});
