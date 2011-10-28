/**
 * 应用路由规则
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, mvc, NotesView, EditView, NotesCollection, NoteModel) {
    /**
     * 应用 router
     */
    function NoteRouter() {
        var self = this;
        NoteRouter.superclass.constructor.apply(self, arguments);
        self.notesView = new NotesView({
            notes:new NotesCollection(),
            router:self
        });
        self.editView = new EditView();
        // 初始载入全部笔记
        self.notesView.get("notes").load();
        self.editView.on("submit", self._onEditSubmit, self);
    }


    S.extend(NoteRouter, mvc.Router, {

        _onEditSubmit:function(e) {
            var note = e.note,
                self = this,
                notes = self.notesView.get("notes");
            if (note.isNew()) {
                // 新建
                notes.create(note, {
                    success:function() {
                        self.navigate("");
                    }
                });
            } else {
                var exits = notes.getById(note.getId());
                exits.set(note.toJSON());
                // 修改
                exits.save({
                    success:function() {
                        self.navigate("");
                    }
                });
            }
        },

        /**
         * 展示笔记列表
         */
        index:function() {
            var self = this;
            self.editView.get("el").hide();
            self.notesView.get("el").show();
        },

        /**
         * 编辑笔记动作，弹出编辑界面
         */
        editNote:function(paths) {
            var self = this,
                id = paths.id,
                note = new NoteModel({
                    id:id
                }),
                editView = self.editView;
            // 载入笔记的其他信息
            // 没的话可以直接 note=notes.getById(id)
            note.load({
                success:function() {
                    self.notesView.get("el").hide();
                    editView.set("note", note);
                    /*根据note模型，重新渲染编辑界面*/
                    editView.render();
                    editView.get("el").show();
                }
            });

        },

        /**
         * 新键笔记，弹出编辑界面
         */
        newNote:function() {
            var self = this,
                editView = self.editView;
            self.notesView.get("el").hide();
            editView.set("note", new NoteModel());
            /*根据note模型，重新渲染编辑界面*/
            editView.render().get("el").show();
        }

    }, {
        ATTRS:{
            /**
             * 默认 router 配置
             */
            routes:{
                value:{
                    '':"index",
                    '/edit/:id':"editNote",
                    '/new/':"newNote"
                }
            }
        }
    });

    return NoteRouter;
}, {
    requires:['mvc','./NotesView','./EditView','./NotesCollection','./NoteModel']
});