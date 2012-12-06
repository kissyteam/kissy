KISSY.add("note/mods/router", function(S, Node, mvc, NotesView, EditView, NotesCollection, NoteModel, SearchView) {
  var $ = S.Node.all;
  function NoteRouter() {
    var self = this;
    NoteRouter.superclass.constructor.apply(self, arguments);
    self.notesView = new NotesView({notes:new NotesCollection});
    self.editView = new EditView;
    self.notesView.get("notes").load();
    self.editView.on("submit", self._onEditSubmit, self);
    self.searchView = new SearchView({notes:new NotesCollection})
  }
  S.extend(NoteRouter, mvc.Router, {_onEditSubmit:function(e) {
    var note = e.note, self = this, notes = self.notesView.get("notes");
    if(note.isNew()) {
      notes.create(note, {success:function() {
        mvc.Router.navigate("")
      }})
    }else {
      var exits = notes.getById(note.getId());
      exits.set(note.toJSON());
      exits.save({success:function() {
        mvc.Router.navigate("")
      }})
    }
  }, index:function() {
    var self = this;
    $(".page").hide();
    self.notesView.get("el").show()
  }, editNote:function(paths) {
    var self = this, id = paths.id, note = new NoteModel({id:id}), editView = self.editView;
    note.load({success:function() {
      $(".page").hide();
      editView.set("note", note);
      editView.render();
      editView.get("el").show()
    }})
  }, newNote:function() {
    var self = this, editView = self.editView;
    $(".page").hide();
    editView.set("note", new NoteModel);
    editView.render().get("el").show()
  }, search:function(path, query) {
    var q = S.urlDecode(query.q), self = this;
    self.searchView.searchInput.val(q);
    self.searchView.get("notes").load({data:{q:q}, success:function() {
      $(".page").hide();
      self.searchView.get("el").show()
    }})
  }}, {ATTRS:{routes:{value:{"/":"index", "":"index", "/edit/:id":"editNote", "/new/":"newNote", "/search/":"search"}}}});
  return NoteRouter
}, {requires:["node", "mvc", "./NotesView", "./EditView", "./NotesCollection", "./NoteModel", "./SearchView"]});

