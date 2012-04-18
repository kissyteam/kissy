/**
 * localStorage support for ie<8
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/localStorage/index", function (S, KE, Overlay, FlashBridge) {

    // 原生或者已经定义过立即返回
    // ie 使用 flash 模拟的 localStorage，序列化性能不行
    if (!S.UA['ie'] && window.localStorage) {
        //原生的立即可用
        return window.localStorage;
    }

    // 国产浏览器用随机数/时间戳试试 ! 是可以的
    var movie = KE.Utils.debugUrl("/plugin/localStorage/swfstore.swf?t=" + (+new Date()));

    var store = new FlashBridge({
        movie:movie,
        flashVars:{
            useCompression:true
        },
        methods:["setItem", "removeItem", "getItem", "setMinDiskSpace", "getValueOf"]
    });

    store.swf.height = 138;

    //Dialog 不行
    var o = new Overlay({
        width:"0px",
        elStyle:{
            overflow:'hidden'
        },
        content:"<h1 style='border:1px solid black;" +
            "border-bottom:none;" +
            "background:white;" +
            "text-align:center;'>请点击允许</h1>",
        zIndex:KE.baseZIndex(KE.zIndexManager.STORE_FLASH_SHOW)
    });
    o.render();
    o.get("contentEl").append(store.swf);
    // 必须在视窗范围内才可以初始化，触发 contentReady 事件
    o.center();
    o.show();

    store.on("pending", function () {
        o.set("width", 215);
        o.center();
        o.show();
        // 轮训，直到用户允许
        setTimeout(function () {
            store.retrySave();
        }, 1000);
    });

    store.on("save", function () {
        o.set("width", 0);
    });

    var oldSet = store.setItem;

    S.mix(store, {
        _ke:1,
        getItem:function (k) {
            return this['getValueOf'](k);
        },
        retrySave:function () {
            var self = this;
            self.setItem(self.lastSave.k, self.lastSave.v);
        },
        setItem:function (k, v) {
            var self = this;
            self.lastSave = {k:k, v:v};
            oldSet.call(self, k, v);
        }
    });

    //非原生，等待flash通知
    store.on("contentReady", function () {
        store._ready = 1;
    });

    /*
     "quotaExceededError"
     "error"
     "save"
     "inadequateDimensions"
     */

    return store;
}, {
    //important
    //不能立即运行，ie6 可能会没有 domready 添加 flash 节点
    //导致：operation aborted
    attach:false,
    "requires":["editor", "overlay", "../flashBridge/"]
});