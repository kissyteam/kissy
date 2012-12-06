KISSY.add("note/mods/NoteModel", function(S, mvc) {
  function NoteModel() {
    NoteModel.superclass.constructor.apply(this, arguments)
  }
  S.extend(NoteModel, mvc.Model);
  return NoteModel
}, {requires:["mvc"]});

