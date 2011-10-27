KISSY.add(function(S, mvc) {

    function NoteModel() {
        NoteModel.superclass.constructor.call(this, arguments);
    }

    S.extend(NoteModel, mvc.Model);

    return NoteModel;


}, {
    requires:["mvc"]
});