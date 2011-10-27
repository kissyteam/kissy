KISSY.add(function(S, mvc) {
    function NotesModel() {
        NotesModel.superclass.constructor.apply(this, arguments);
    }

    S.extend(NotesModel, mvc.Collection);

    return NotesModel;
}, {
    requires:['mvc']
});