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
        NoteView.superclass.constructor.apply(this, arguments);
    }

    S.extend(NoteView, View, {
        /**
         * 根据模板以及数据渲染单个笔记
         */
        render:function() {
            this.get("el").addClass("note");
            this.get("el").html(noteTpl.render(this.get("note").getId()));
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
             * 保存，并通知对应的 collection ，collection 通知 collection view加入
             */
            note.save({
                success:function() {
                    router.navigate("/");
                }
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
            el = self.get("el");

        self.dataList = el.one(".dataList");
        self.statistic = el.one(".statistic");
        var notes = this.get("notes");

        /**
         * 监控笔记集合（包括各个笔记）的所有变化
         */
        notes.on("*Change", function(e) {
            self.statistic.html(e.target.get("title"));
        });
        notes.on("add remove", function(e) {
            self.statistic.html(e.model.get("title"));
        });

        /**
         * 集合删除时，同步到 dom
         */
        notes.on("add", function(e) {
            self.dataList.appendChild(new NoteView({
                model:e.model
            }).render().get("el"))
        });

        notes.on("remove", function(e) {
            $("#" + e.model.get("id")).remove();
        });

        /**
         * 设置整体时，同步到 dom
         */
        notes.on("reset", function(e) {
            self.dataList.html(listTpl.render({list:notes.toJSON()}));
            var models = notes.get("models");
            self.statistic.html(models && models[0] && models[models.length - 1].get("title") || "");
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
            notes.getById($(e.currentTarget).parent("div").attr("id")).destroy({
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
        NoteRouter.superclass.constructor.apply(this, arguments);
        this.notesView = new NoteCollectionView({
            notes:new NoteCollection()
        });
        this.editView = new NoteEditView();
    }


    S.extend(NoteRouter, Router, {

        /**
         * 初始载入笔记列表
         */
        index:function() {
            var self = this;
            self.notesView.get("notes").load({
                success:function() {
                    self.editView.get("el").hide();
                    self.notesView.get("el").show();
                }});
        },

        /**
         * 编辑笔记动作，弹出编辑界面
         */
        editNote:function(paths) {
            var self = this,
                id = paths.id,
                note = new NoteModel({
                    id:id
                });

            note.load({
                success:function() {
                    self.notesView.get("el").hide();
                    self.editView.set("note", note);
                    /*根据note模型，重新渲染编辑界面*/
                    self.editView.render();
                    self.editView.get("el").show();
                }
            });

        },

        /**
         * 新键笔记，弹出编辑界面
         */
        newNote:function() {
            var self = this;
            self.notesView.get("el").hide();
            self.editView.set("note", new NoteModel());
            /*根据note模型，重新渲染编辑界面*/
            self.editView.render();
            self.editView.get("el").show();
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

