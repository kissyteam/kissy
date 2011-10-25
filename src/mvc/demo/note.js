/**
 * simple demo to show how to use kissy mvc
 * @author yiminghe@gmail.com
 */
KISSY.use("mvc,template", function(S, MVC, Template) {

    var Model = MVC.Model,
        $ = S.all,
        Collection = MVC.Collection,
        View = MVC.View,
        Router = MVC.Router;

    var KEY = 'KISSY_Note';

    function isModel(m) {
        return m instanceof Model;
    }

    function findById(store, id) {
        for (var i = 0; i < store.length; i++) {
            if (store[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    var STORE;
    /*
     覆盖全局的同步函数
     */
    MVC.sync = function(method, options) {
        S.log(method);
        var self = this;
        var index;
        var store = STORE || (window.localStorage ? window.localStorage.getItem(KEY) || [] : []);
        if (S.isString(store)) {
            store = S.JSON.parse(store);
        }

        var ret,id,error;
        switch (method) {
            case 'read':
                if (isModel(self)) {
                    ret = store[findById(store, self.get("id"))];
                    if (!ret) {
                        error = 'not found';
                    }
                } else {
                    ret = [];
                    for (var i in store) {
                        ret.push(store[i]);
                    }
                }
                break;
            case 'create':
                var data = self.toJSON();
                data.id = S.guid("note");
                // 更新当前内存对象
                self.setId(data.id);
                store.push(data);
                break;
            case 'delete':
                id = self.get("id");
                index = findById(store, id);
                if (index > -1) {
                    store.splice(index, 1);
                }
                break;
            case 'update':
                id = self.get("id");
                index = findById(store, id);
                if (index > -1) {
                    store[index] = self.toJSON();
                }
                break;
        }

        if (method != 'read' && window.localStorage) {
            window.localStorage.setItem(KEY, S.JSON.stringify(store));
        }

        STORE = store;

        if (error) {
            if (options.error) {
                options.error(null, error);
            }
        }

        else if (options.success) {
            options.success(ret);
        }

        if (options.complete) {
            options.complete(ret, error);
        }
    };


    /*
     模板取得
     1. 列表模板
     2. 详情模板
     3. 编辑模板
     */
    var listTpl = Template($("#listTpl").html());
    var detailTpl = Template($("#detailTpl").html());
    var noteTpl = Template($("#noteTpl").html());

    /*
     笔记模型
     */
    function NoteModel() {
        NoteModel.superclass.constructor.apply(this, arguments);
    }

    S.extend(NoteModel, Model, {}, {
        /**
         * 声明模型属性，必须声明默认值，否则 KISSY Template 不能渲染
         */
        ATTRS:{
            title:{
                value:""
            },
            content:{
                value:""
            },
            id:{
                value:""
            },
            time:{
                valueFn:function() {
                    return new Date().toLocaleString();
                }
            }

        }
    });

    /*
     笔记列表模型
     */
    function NoteCollection() {
        NoteCollection.superclass.constructor.apply(this, arguments);
    }

    S.extend(NoteCollection, Collection, {
    }, {
        ATTRS:{
            Model:{
                value:NoteModel
            }
        }
    });

    /*
     单个笔记view
     */
    function NoteView() {
        var self = this;
        NoteView.superclass.constructor.apply(self, arguments);
        // 任何属性发生变化就重新渲染，简化处理
        self.get("note").on("*Change", self.render, self);
        // 模型销毁时，销毁 view
        self.get("note").on("destroy", self.destroy, self);
    }

    S.extend(NoteView, View, {
        /**
         * 根据模板以及数据渲染单个笔记
         */
        render:function() {
            var self = this;
            // dom 节点添加标志 , dom 代理事件需要
            self.get("el").addClass("note").attr("id", self.get("note").getId());
            self.get("el").html(noteTpl.render(self.get("note").toJSON()));
            return self;
        },

        /**
         * 销毁单个笔记view
         */
        destroy:function() {
            this.get("el").remove();
        }
    });

    /**
     * 编辑笔记view
     */
    function NoteEditView() {
        NoteEditView.superclass.constructor.apply(this, arguments);
    }

    S.extend(NoteEditView, View, {
        /**
         * 提交操作：(创建或更新)
         */
        submit:function() {
            var note = this.get("note");
            var el = this.get("el");
            note.set({
                title:el.one(".title").val(),
                content:el.one(".content").val()
            });
            /**
             * 通知外部模块
             */
            this.fire("submit", {
                note:note
            });
        },
        /**
         * 很据已有笔记和模板渲染编辑界面
         */
        render:function() {
            this.get("el").html(detailTpl.render(this.get("note").toJSON()));
            return this;
        }
    }, {
        ATTRS:{
            /**
             * 覆盖默认属性
             */

            el:{
                value:'#edit'
            },
            events:{
                value:{
                    ".submit":{
                        "click":"submit"
                    }
                }
            }
        }
    });


    /**
     * 笔记列表View
     */
    function NoteCollectionView() {
        NoteCollectionView.superclass.constructor.apply(this, arguments);

        var self = this,
            statistic,
            dataList,
            el = self.get("el");

        dataList = self.dataList = el.one(".dataList");
        statistic = self.statistic = el.one(".statistic");
        var notes = this.get("notes");

        /**
         * 监控笔记集合（包括各个笔记）的所有变化
         */
        notes.on("*Change", function(e) {
            statistic.html(e.target.get("title"));
        });
        notes.on("add remove", function(e) {
            statistic.html(e.model.get("title"));
        });

        /**
         * 集合添加时，同步到 dom
         */
        notes.on("add", function(e) {
            dataList.append(new NoteView({
                note:e.model
            }).render().get("el"))
        });

        /**
         * 设置整体时，同步到 dom
         */
        notes.on("reset", function() {
            dataList.html(listTpl.render({list:notes.toJSON()}));
            var list = dataList.all(".note");
            list.each(function(l, i) {
                // 初始化 NoteView ，修改时该 note 时局部更新
                new NoteView({
                    note:notes.at(i),
                    el:l
                })
            });
        });
    }

    S.extend(NoteCollectionView, View, {
        /**
         * 新加笔记，更改url，由router处理
         */
        newNote:function() {
            router.navigate("/new/");
        },

        /**
         * 编辑笔记，更改url，由router处理
         */
        editNote:function(e) {
            router.navigate("/edit/" + $(e.currentTarget).parent("div").attr("id"));
        },

        /**
         * 删除笔记
         */
        deleteNode:function(e) {
            var notes = this.get("notes");
            // 找到对应的模型销毁->触发 view 的销毁
            notes.getById(
                $(e.currentTarget)
                    .parent("div")
                    .attr("id"))
                .destroy({
                    "delete":1
                });
        }
    }, {
        ATTRS:{
            el:{
                value:'#list'
            },
            /**
             * 事件代理，三个惭怍
             */
            events:{
                value:{
                    ".edit":{
                        click:"editNote"
                    },
                    ".newNote":{
                        click:"newNote"
                    },
                    ".delete":{
                        click:"deleteNode"
                    }
                }
            }
        }
    });


    /**
     * 应用 router
     */
    function NoteRouter() {
        var self = this;
        NoteRouter.superclass.constructor.apply(self, arguments);
        self.notesView = new NoteCollectionView({
            notes:new NoteCollection()
        });
        self.editView = new NoteEditView();
        // 初始载入全部笔记
        self.notesView.get("notes").load();
        self.editView.on("submit", self._onEditSubmit, self);
    }


    S.extend(NoteRouter, Router, {

        _onEditSubmit:function(e) {
            var note = e.note,
                self = this,
                notes = self.notesView.get("notes");
            if (note.isNew()) {
                // 新建
                notes.create(note, {
                    success:function() {
                        self.navigate("/");
                    }
                });
            } else {
                var exits = notes.getById(note.getId());
                exits.set(note.toJSON());
                // 修改
                exits.save({
                    success:function() {
                        self.navigate("/");
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
                    '/':"index",
                    '/edit/:id':"editNote",
                    '/new/':"newNote"
                }
            }
        }
    });

    // 复原 hash
    location.hash = '!';
    var router = new NoteRouter();
    // 防止多次触发 hashchange
    setTimeout(function() {
        /**
         * 启动 app router
         */

        router.start();
        // 首先载入笔记列表
        router.navigate("/");
    }, 100);

});

