/**
 * checkbox source editor for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.Editor.add("checkbox-sourcearea", function(editor) {
    var KE = KISSY.Editor,
        S = KISSY,
        UA = S.UA;
    //firefox 3.5 不支持，有bug
    if (UA.gecko < 1.92) return;
    KE.use("checkbox-sourcearea/support", function() {
        var a=new KE.CheckboxSourceArea(editor);
        editor.on("destroy",function(){
           a.destroy();
        });
    });
},
{
    attach:false
});
