/**
 * KISSY.Dialog
 * @creator  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S, undefined) {

    var Dialog = S.Base.create(S.Overlay, [S.Ext.StdMod,S.Ext.Close]);

    S.Dialog = Dialog;
}, { host: 'overlay' });



