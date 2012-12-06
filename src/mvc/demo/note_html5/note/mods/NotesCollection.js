KISSY.add("note/mods/NotesCollection", function(S, mvc, NoteModel) {
  function NotesModel() {
    NotesModel.superclass.constructor.apply(this, arguments)
  }
  S.extend(NotesModel, mvc.Collection, {ATTRS:{model:{value:NoteModel}}});
  return NotesModel
}, {requires:["mvc", "./NoteModel"]});

