KISSY.add("note/main", function(S, Node, NoteRouter, Sy, MVC) {
  new NoteRouter;
  MVC.Router.start({success:function() {
    Node.all("#loading").hide()
  }})
}, {requires:["node", "./mods/router", "./mods/sync", "mvc"]});

