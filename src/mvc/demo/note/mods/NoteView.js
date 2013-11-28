/**
 * 笔记视图
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node,mvc, Template) {
    var noteTpl = new Template(Node.all("#noteTpl").html());

    /*
     单个笔记view
     */
    return mvc.View.extend({
        initializer:function(){
            var self = this;
            // 任何属性发生变化就重新渲染，简化处理
            self.get("note").on("*Change", self.render, self);
            // 模型销毁时，销毁 view
            self.get("note").on('destroy', self.destroy, self);
        },
        /**
         * 根据模板以及数据渲染单个笔记
         */
        render:function() {
            var self = this;
            // dom 节点添加标志 , dom 代理事件需要
            self.get('el').addClass("note").attr('id', self.get("note").getId());
            self.get('el').html(noteTpl.render({
                note:self.get("note").toJSON()}));
            return self;
        },

        /**
         * 销毁单个笔记view
         */
        destroy:function() {
            this.get('el').remove();
        }
    });
}, {
    requires:['node','mvc','xtemplate']
});