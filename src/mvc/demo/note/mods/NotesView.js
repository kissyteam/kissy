/**
 * 笔记列表视图
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node, mvc, Template, NoteView) {
    var $ = Node.all,
        tmpl = new Template($("#listTpl").html());

    /**
     * 笔记列表View
     */
    function NotesView() {
        NotesView.superclass.constructor.apply(this, arguments);

        var self = this,
            statistic,
            dataList,
            el = self.get("el");


        self.searchInput = el.one(".searchInput");

        dataList = self.dataList = el.one(".dataList");
        statistic = self.statistic = el.one(".statistic");
        var notes = self.get("notes");

        /**
         * 监控笔记集合（包括各个笔记）的所有变化
         */
        notes.on("*Change", function(e) {
            if (e.target != self) {
                statistic.html(e.target.get("title"));
            }
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
        notes.on("afterModelsChange", function() {
            dataList.html(tmpl.render({list:notes.toJSON()}));
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

    S.extend(NotesView, mvc.View, {
        /**
         * 新加笔记，更改url，由router处理
         */
        newNote:function() {
            mvc.Router.navigate("/new/");
        },

        /**
         * 刷新笔记列表
         */
        refreshNote:function() {
            this.get("notes").load();
        },

        /**
         * 编辑笔记，更改url，由router处理
         */
        editNote:function(e) {
            mvc.Router.navigate("/edit/" + $(e.currentTarget).parent("div").attr("id"));
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
                    .attr("id")
            ).destroy({
                    "delete":1
                });
        },
        search:function() {
            if (S.trim(this.searchInput.val())) {
                mvc.Router.navigate("/search/?q=" + encodeURIComponent(this.searchInput.val()));
            }
        },
        keyup:function(e) {
            if (e.keyCode == 13) {
                e.halt();
                this.searchInput[0].focus();
                this.search();
            }
        }
    }, {
        ATTRS:{
            el:{
                value:'#list'
            },
            /**
             * 事件代理，四个操作
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
                    },
                    ".refreshNote":{
                        click:"refreshNote"
                    },
                    '.searchNote':{
                        'click':'search'
                    },
                    '.searchInput':{
                        'keyup':'keyup'
                    }
                }
            }
        }
    });

    return NotesView;

}, {
    requires:['node','mvc','xtemplate','./NoteView']
});