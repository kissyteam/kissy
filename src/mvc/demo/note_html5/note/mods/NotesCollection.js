/**
 * 笔记collection
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, mvc, NoteModel) {
    /*
     笔记列表模型
     */
    function NotesModel() {
        NotesModel.superclass.constructor.apply(this, arguments);
    }

    S.extend(NotesModel, mvc.Collection, {
        ATTRS:{
            model:{
                value:NoteModel
            }
        }
    });

    return NotesModel;
}, {
    requires:['mvc','./NoteModel']
});