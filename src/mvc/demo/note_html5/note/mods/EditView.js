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

