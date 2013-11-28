/**
 * @ignore
 * localStorage support for ie<8
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Editor = require('editor');
    var Overlay = require('overlay');
    var FlashBridge = require('./flash-bridge');

    var ie = S.UA.ieMode;

    // 原生或者已经定义过立即返回
    // ie 使用 flash 模拟的 localStorage，序列化性能不行
    if ((!ie || ie > 8) && window.localStorage) {
        //原生的立即可用
        return window.localStorage;
    }

    // 国产浏览器用随机数/时间戳试试 ! 是可以的
    var swfSrc = Editor.Utils.debugUrl('plugin/local-storage/assets/swfstore.swf?t=' + (+new Date()));

    var css = {
        width: 215,
        border: '1px solid red'
    }, reverseCss = {
        width: 0,
        border: 'none'
    };

    //Dialog 不行
    var o = new Overlay({
        prefixCls: 'ks-editor-',
        elStyle: {
            background: 'white'
        },
        width: '0px',
        content: '<h1 style="' + 'text-align:center;">请点击允许</h1>' +
            '<div class="storage-container"></div>',
        zIndex: Editor.baseZIndex(Editor.ZIndexManager.STORE_FLASH_SHOW)
    });
    o.render();
    o.show();

    var store = new FlashBridge({
        src: swfSrc,
        render: o.get('contentEl').one('.storage-container'),
        params: {
            flashVars: {
                useCompression: true
            }
        },
        attrs: {
            height: 138,
            width: '100%'
        },
        methods: ['setItem', 'removeItem', 'getItem', 'setMinDiskSpace', 'getValueOf']
    });

    // 必须在视窗范围内才可以初始化，触发 contentReady 事件
    S.ready(function () {
        setTimeout(function () {
            o.center();
        }, 0);
    });

    store.on('pending', function () {
        o.get('el').css(css);
        o.center();
        o.show();
        // 轮训，直到用户允许
        setTimeout(function () {
            store.retrySave();
        }, 1000);
    });

    store.on('save', function () {
        o.get('el').css(reverseCss);
    });

    var oldSet = store.setItem;

    S.mix(store, {
        _ke: 1,
        getItem: function (k) {
            return this.getValueOf(k);
        },
        retrySave: function () {
            var self = this;
            self.setItem(self.lastSave.k, self.lastSave.v);
        },
        setItem: function (k, v) {
            var self = this;
            self.lastSave = {k: k, v: v};
            oldSet.call(self, k, v);
        }
    });

    //非原生，等待flash通知
    store.on('contentReady', function () {
        store._ready = 1;
    });

    /*
     'quotaExceededError'
     'error'
     'save'
     'inadequateDimensions'
     */

    return store;
});