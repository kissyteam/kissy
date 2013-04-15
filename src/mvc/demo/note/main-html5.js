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
        // 触发当前地址对应的 route 操作
        triggerRoute:1,
        nativeHistory:1,
        urlRoot:location.pathname,
        success:function() {
            Node.all('#loading').hide();
        }
    });
}, {
    requires:['node','./mods/router','./mods/sync','mvc']
});