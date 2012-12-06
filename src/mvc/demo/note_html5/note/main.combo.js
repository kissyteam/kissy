/*
 Combined modules by KISSY Module Compiler: 

 note/mods/NoteView
 note/mods/NotesView
 note/mods/EditView
 note/mods/NoteModel
 note/mods/NotesCollection
 note/mods/SearchView
 note/mods/router
 note/mods/sync
 note/main
*/

KISSY.add("note/mods/NoteView", function(S, Node, mvc, XTemplate) {
  var noteTpl = new XTemplate(Node.all("#noteTpl").html());
  function NoteView() {
    var self = this;
    NoteView.superclass.constructor.apply(self, arguments);
    self.get("note").on("*Change", self.render, self);
    self.get("note").on("destroy", self.destroy, self)
  }
  S.extend(NoteView, mvc.View, {render:function() {
    var self = this;
    self.get("el").addClass("note").attr("id", self.get("note").getId());
    self.get("el").html(noteTpl.render({note:self.get("note").toJSON()}));
    return self
  }, destroy:function() {
    this.get("el").remove()
  }});
  return NoteView
}, {requires:["node", "mvc", "xtemplate"]});
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
KISSY.add("note/mods/EditView", function(S, Node, mvc, XTemplate) {
  var detailTpl = new XTemplate(Node.all("#detailTpl").html());
  function EditView() {
    EditView.superclass.constructor.apply(this, arguments)
  }
  S.extend(EditView, mvc.View, {submit:function() {
    var self = this, note = self.get("note"), el = self.get("el");
    note.set({title:el.one(".title").val(), content:el.one(".content").val()});
    self.fire("submit", {note:note})
  }, render:function() {
    var self = this;
    self.get("el").html(detailTpl.render({note:self.get("note").toJSON()}));
    return self
  }}, {ATTRS:{el:{value:"#edit"}, events:{value:{".submit":{click:"submit"}}}}});
  return EditView
}, {requires:["node", "mvc", "xtemplate"]});
KISSY.add("note/mods/NoteModel", function(S, mvc) {
  function NoteModel() {
    NoteModel.superclass.constructor.apply(this, arguments)
  }
  S.extend(NoteModel, mvc.Model);
  return NoteModel
}, {requires:["mvc"]});
KISSY.add("note/mods/NotesCollection", function(S, mvc, NoteModel) {
  function NotesModel() {
    NotesModel.superclass.constructor.apply(this, arguments)
  }
  S.extend(NotesModel, mvc.Collection, {ATTRS:{model:{value:NoteModel}}});
  return NotesModel
}, {requires:["mvc", "./NoteModel"]});
KISSY.add("note/mods/SearchView", function(S, Node, mvc, XTemplate) {
  var $ = Node.all, tmpl = new XTemplate($("#searchTpl").html());
  function SearchView() {
    var self = this;
    SearchView.superclass.constructor.apply(this, arguments);
    this.searchInput = this.get("el").one(".searchInput");
    this.searchList = this.get("el").one(".searchList");
    this.get("notes").on("afterModelsChange", function() {
      self.searchList.html(tmpl.render({list:self.get("notes").toJSON()}))
    })
  }
  S.extend(SearchView, mvc.View, {search:function() {
    if(S.trim(this.searchInput.val())) {
      mvc.Router.navigate("/search/?q=" + encodeURIComponent(this.searchInput.val()))
    }
  }, keyup:function(e) {
    if(e.keyCode == 13) {
      e.halt();
      this.searchInput[0].focus();
      this.search()
    }
  }, back:function() {
    this.searchInput.val("");
    mvc.Router.navigate("/")
  }}, {ATTRS:{el:{value:"#search"}, events:{value:{".searchBtn":{click:"search"}, ".backBtn":{click:"back"}, ".searchInput":{keyup:"keyup"}}}}});
  return SearchView
}, {requires:["node", "mvc", "xtemplate"]});
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
KISSY.add("note/mods/sync", function(S, mvc) {
  var KEY = "KISSY_Note";
  function isModel(m) {
    return m instanceof mvc.Model
  }
  function findById(store, id) {
    for(var i = 0;i < store.length;i++) {
      if(store[i].id == id) {
        return i
      }
    }
    return-1
  }
  var STORE, sync;
  sync = mvc.sync = function(self, method, options) {
    options = options || {};
    S.log(method);
    setTimeout(function() {
      var index;
      var store = STORE || (window.localStorage ? window.localStorage.getItem(KEY) || [] : []);
      if(typeof store == "string") {
        store = JSON.parse(store)
      }
      var ret, id, error, i;
      switch(method) {
        case "read":
          var q;
          if(options.data && (q = options.data.q)) {
            ret = [];
            for(i in store) {
              if(store[i].title.indexOf(q) > -1) {
                ret.push(store[i])
              }
            }
          }else {
            if(isModel(self)) {
              ret = store[findById(store, self.get("id"))];
              if(!ret) {
                error = "not found"
              }
            }else {
              ret = [];
              for(i in store) {
                ret.push(store[i])
              }
            }
          }
          break;
        case "create":
          ret = self.toJSON();
          ret.id = S.guid("note");
          ret.time = (new Date).toLocaleTimeString();
          store.push(ret);
          break;
        case "delete":
          id = self.get("id");
          index = findById(store, id);
          if(index > -1) {
            store.splice(index, 1)
          }
          break;
        case "update":
          id = self.get("id");
          index = findById(store, id);
          if(index > -1) {
            store[index] = self.toJSON()
          }
          break
      }
      if(method != "read" && window.localStorage) {
        window.localStorage.setItem(KEY, S.JSON.stringify(store))
      }
      STORE = store;
      if(error) {
        if(options.error) {
          options.error(null, error)
        }
      }else {
        if(options.success) {
          options.success(ret)
        }
      }
      if(options.complete) {
        options.complete(ret, error)
      }
    }, 500)
  };
  return sync
}, {requires:["mvc"]});
KISSY.add("note/main", function(S, Node, NoteRouter, Sy, MVC) {
  new NoteRouter;
  MVC.Router.start({success:function() {
    Node.all("#loading").hide()
  }})
}, {requires:["node", "./mods/router", "./mods/sync", "mvc"]});

