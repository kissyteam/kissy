/**
 * 笔记编辑界面
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node, mvc, Template) {

    var detailTpl = new Template(Node.all("#detailTpl").html());

    /**
     * 编辑笔记view
     */
   return mvc.View.extend({
        /**
         * 提交操作：(创建或更新)
         */
        submit:function() {
            var self = this,
                note = self.get("note"),
                el = self.get('el');
            note.set({
                title:el.one(".title").val(),
                content:el.one(".content").val()
            });
            /**
             * 通知外部模块
             */
            self.fire('submit', {
                note:note
            });
        },
        /**
         * 根据已有笔记和模板渲染编辑界面
         */
        render:function() {
            var self = this;
            self.get('el').html(detailTpl.render({
                note:self.get("note").toJSON()
            }));
            return self;
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
                        'click':'submit'
                    }
                }
            }
        }
    });
}, {
    requires:['node','mvc','xtemplate']
});