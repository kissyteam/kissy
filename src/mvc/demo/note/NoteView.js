KISSY.add(function(S, mvc, Template) {
    var tmpl = Template($("#noteTpl").html());

    function NoteView() {
        var self = this;
        NoteView.superclass.constructor.apply(self, arguments);
        var note = self.get("note");
        note.on("*Change", self.render, self);
        note.on("destroy", self.destroy, self);
    }

    S.extend(NoteView, mvc.View, {
        render:function() {
            var self = this;
            self.get("el").html(tmpl.render({note:self.get("note").toJSON()}));
            return self;
        },
        destroy:function() {
            this.get("el").remove();
        }
    });

    return NoteView;
}, {
    requires:['mvc','template']
});