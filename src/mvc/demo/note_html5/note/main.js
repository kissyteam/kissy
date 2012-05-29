/**
 * main函数
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node, NoteRouter, Sy, MVC) {
    new NoteRouter();
    /**
     * 启动 app router
     */
    MVC.Router.start({
        success:function() {
            Node.all('#loading').hide();
        }
    });
}, {
    requires:['node','./mods/router','./mods/sync','mvc']
});