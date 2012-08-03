/**
 * color dialog
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("color/dialog", function(editor) {
    var S = KISSY,
        KE = S.Editor;
    KE.use("colorsupport/dialog/colorpicker", function() {
        var colorPicker = new KE.ColorSupport.ColorPicker();
        //动态更新cmd，可能有前景色与背景色两种
        editor.addDialog("color/dialog", colorPicker);
    });
}, {
    attach:false
});