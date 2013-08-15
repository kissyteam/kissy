/**
 * 笔记collection
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, mvc, NoteModel) {
    /*
     笔记列表模型
     */
    return mvc.Collection.extend({}, {
        ATTRS: {
            model: {
                value: NoteModel
            }
        }
    });
}, {
    requires: ['mvc', './NoteModel']
});