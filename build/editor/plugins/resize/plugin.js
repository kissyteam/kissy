/**
 * resize functionality
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("resize", function (editor) {
    var S = KISSY,
        Node = S.Node;


    S.use("dd", function (S, DD) {
        var Draggable = S['Draggable'] || DD['Draggable'],
            statusDiv = editor.statusDiv,
            textarea = editor.textarea,
            resizer = new Node("<div class='ke-resizer'>"),
            cfg = editor.cfg["pluginConfig"]["resize"] || {};
        cfg = cfg["direction"] || ["x", "y"];
        resizer.appendTo(statusDiv);
        //最大化时就不能缩放了
        editor.on("maximizeWindow", function () {
            resizer.css("display", "none");
        });
        editor.on("restoreWindow", function () {
            resizer.css("display", "");
        });
        resizer._4e_unselectable();
        var d = new Draggable({
            node:resizer,
            cursor:'se-resize'
        }),
            height = 0,
            width = 0,
            t_height = 0,
            t_width = 0,
            heightEl = editor.wrap,
            widthEl = editor.editorWrap;
        d.on("dragstart", function () {
            height = heightEl.height();
            width = widthEl.width();
            // may get wrong height : 100% => viewport height
            t_height = textarea.height();
            t_width = textarea.width();
            editor.fire("resizeStart");
        });
        d.on("drag", function (ev) {
            var self = this,
                diffX = ev.left - self['startNodePos'].left,
                diffY = ev.top - self['startNodePos'].top;
            if (S.inArray("y", cfg)) {
                heightEl.height(height + diffY);
                textarea.height(t_height + diffY);
            }
            if (S.inArray("x", cfg)) {
                widthEl.width(width + diffX);
                textarea.width(t_width + diffX);
            }
            editor.fire("resize");
        });

        editor.on("destroy", function () {
            d.destroy();
            resizer.remove();
        });
    });
}, {
    attach:false
});