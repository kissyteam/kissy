KISSY.add("note/mods/NotesView", function(S, Node, mvc, XTemplate, NoteView) {
  var $ = Node.all, tmpl = new XTemplate($("#listTpl").html());
  function NotesView() {
    NotesView.superclass.constructor.apply(this, arguments);
    var self = this, statistic, dataList, el = self.get("el");
    self.searchInput = el.one(".searchInput");
    dataList = self.dataList = el.one(".dataList");
    statistic = self.statistic = el.one(".statistic");
    var notes = self.get("notes");
    notes.on("*Change", function(e) {
      if(e.target != self) {
        statistic.html(e.target.get("title"))
      }
    });
    notes.on("add remove", function(e) {
      statistic.html(e.model.get("title"))
    });
    notes.on("add", function(e) {
      dataList.append((new NoteView({note:e.model})).render().get("el"))
    });
    notes.on("afterModelsChange", function() {
      dataList.html(tmpl.render({list:notes.toJSON()}));
      var list = dataList.all(".note");
      list.each(function(l, i) {
        new NoteView({note:notes.at(i), el:l})
      })
    })
  }
  S.extend(NotesView, mvc.View, {newNote:function() {
    mvc.Router.navigate("/new/")
  }, refreshNote:function() {
    this.get("notes").load()
  }, editNote:function(e) {
    mvc.Router.navigate("/edit/" + $(e.currentTarget).parent("div").attr("id"))
  }, deleteNode:function(e) {
    var notes = this.get("notes");
    notes.getById($(e.currentTarget).parent("div").attr("id")).destroy({"delete":1})
  }, search:function() {
    if(S.trim(this.searchInput.val())) {
      mvc.Router.navigate("/search/?q=" + encodeURIComponent(this.searchInput.val()))
    }
  }, keyup:function(e) {
    if(e.keyCode == 13) {
      e.halt();
      this.searchInput[0].focus();
      this.search()
    }
  }}, {ATTRS:{el:{value:"#list"}, events:{value:{".edit":{click:"editNote"}, ".newNote":{click:"newNote"}, ".delete":{click:"deleteNode"}, ".refreshNote":{click:"refreshNote"}, ".searchNote":{click:"search"}, ".searchInput":{keyup:"keyup"}}}}});
  return NotesView
}, {requires:["node", "mvc", "xtemplate", "./NoteView"]});

