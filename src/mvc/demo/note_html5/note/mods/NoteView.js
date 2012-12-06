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

