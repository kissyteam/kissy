/**
 * main函数
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node, NoteRouter) {
    var router = new NoteRouter();
    /**
     * 启动 app router
     */
    router.start({
        // 触发当前地址对应的 route 操作
        triggerRoute:1,
        success:function() {
            Node.all('#loading').hide();
        }
    });
}, {
    requires:['node','./mods/router','./mods/sync']
});