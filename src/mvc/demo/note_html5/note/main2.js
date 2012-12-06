KISSY.add("note/main2", function(S, Node, NoteRouter, Sy, MVC) {
  new NoteRouter;
  MVC.Router.start({triggerRoute:1, nativeHistory:1, urlRoot:(new S.Uri(location.href)).getPath(), success:function() {
    Node.all("#loading").hide()
  }})
}, {requires:["node", "./mods/router", "./mods/sync", "mvc"]});

