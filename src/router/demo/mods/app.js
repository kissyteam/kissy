/**
 * 应用路由规则
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require, exports, module) {
    var $ = require('node');
    var NotesView = require('./NotesView');
    var EditView = require('./EditView');
    var NotesCollection = require('./NotesCollection');
    var NoteModel = require('./NoteModel');
    var SearchView = require('./SearchView');
    var router = require('router');
    var self;

    /**
     * 应用 router
     */
    self = module.exports = {
        initializer: function (config) {
            self.notesView = new NotesView({
                notes: new NotesCollection()
            });
            self.editView = new EditView();
            // 初始载入全部笔记
            self.notesView.get('notes').load();
            self.editView.on('submit', self._onEditSubmit, self);
            self.searchView = new SearchView({
                notes: new NotesCollection()
            });

            router.get('/', function () {
                self.index.apply(self, arguments);
            });

            router.get('/edit/:id', function () {
                self.editNote.apply(self, arguments);
            });

            router.get('/new/', function () {
                self.newNote.apply(self, arguments);
            });

            router.get('/search/', function () {
                self.search.apply(self, arguments);
            });

            router.config(config);

            router.start(config.success);
        },

        _onEditSubmit: function (e) {
            var note = e.note,
                self = this,
                notes = self.notesView.get('notes');
            if (note.isNew()) {
                // 新建
                notes.create(note, {
                    success: function () {
                        router.navigate('/');
                    }
                });
            } else {
                var exits = notes.getById(note.getId());
                exits.set(note.toJSON());
                // 修改
                exits.save({
                    success: function () {
                        router.navigate('/');
                    }
                });
            }
        },

        /**
         * 展示笔记列表
         */
        index: function () {
            var self = this;
            $('.page').hide();
            self.notesView.get('el').show();
        },

        /**
         * 编辑笔记动作，弹出编辑界面
         */
        editNote: function (req) {
            var self = this,
                id = req.params.id,
                note = new NoteModel({
                    id: id
                }),
                editView = self.editView;
            // 载入笔记的其他信息
            // 没的话可以直接 note=notes.getById(id)
            note.load({
                success: function () {
                    $('.page').hide();
                    editView.set('note', note);
                    /*根据note模型，重新渲染编辑界面*/
                    editView.render();
                    editView.get('el').show();
                }
            });

        },

        /**
         * 新键笔记，弹出编辑界面
         */
        newNote: function () {
            var self = this,
                editView = self.editView;
            $('.page').hide();
            editView.set('note', new NoteModel());
            /*根据note模型，重新渲染编辑界面*/
            editView.render().get('el').show();
        },

        search: function (req) {
            var q = decodeURIComponent(req.query.q),
                self = this;
            self.searchView.searchInput.val(q);
            self.searchView.get('notes').load({
                data: {
                    q: q
                },
                success: function () {
                    $('.page').hide();
                    self.searchView.get('el').show();
                }
            });
        }
    };
});