/**
 * @preserve Constructor for kissy editor,dependency moved to independent module
 *      thanks to CKSource's intelligent work on CKEditor
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 * @version: 2
 * @buildtime: 2012-10-29 15:53:12
 */

/**
 * ugly declartion
 */
KISSY.add("editor/export", function(S) {
    var DOM = S.DOM,
        TRUE = true,
        FALSE = false;

    /**
     * 初始化编辑器
     * @constructor
     * @param textarea {(string)} 将要替换的 textarea
     * @param cfg {Object} 编辑器配置
     * @return {Editor} 返回编辑器实例
     */
    function Editor(textarea, cfg) {
        var self = this;

        if (!(self instanceof Editor)) {
            return new Editor(textarea, cfg);
        }

        if (S.isString(textarea)) {
            textarea = S.one(textarea);
        }
        textarea = DOM._4e_wrap(textarea);
        cfg = cfg || {};
        cfg.pluginConfig = cfg["pluginConfig"] || {};
        self.cfg = cfg;
        //export for closure compiler
        cfg["pluginConfig"] = cfg.pluginConfig;
        self["cfg"] = cfg;
        S.app(self, S.EventTarget);

        var BASIC = ["htmldataprocessor", "enterkey", "clipboard"],
            initial = FALSE;
        /**
         * 存在问题：
         * use 涉及动态加载时
         * 1.相同的模块名不会重复 attach
         * 2.不同模块名相同 js 路径也不会重复 attach
         * @param mods {Array.<string>} ，模块名可以重复
         * @param callback {function()} ，插件载入后回调
         */
        self.use = function(mods, callback) {
            mods = mods.split(",");
            if (!initial) {
                for (var i = 0; i < BASIC.length; i++) {
                    var b = BASIC[i];
                    if (!S.inArray(b, mods)) {
                        mods.unshift(b);
                    }
                }
            }

            //编辑器实例 use 时会进行编辑器 ui 操作而不单单是功能定义，必须 ready

            self.ready(function() {
                //通过 add 里面的又一层 addPlugin 保证
                //use : 下载，非图形为乱序并行
                //plugin 的attach（按钮）为串行
                S.Editor.use("button,select", function() {
                    S.use.call(self, mods.join(","), function() {
                        //载入了插件的attach功能，现在按照顺序一个个attach
                        for (var i = 0; i < mods.length; i++) {
                            self.usePlugin(mods[i]);
                        }
                        callback && callback.call(self);
                        //也用在窗口按需加载，只有在初始化时才进行内容设置
                        if (!initial) {
                            self.setData(textarea.val());
                            //是否自动focus
                            if (cfg["focus"]) {
                                self.focus();
                            }
                            //否则清空选择区域
                            else {
                                var sel = self.getSelection();
                                sel && sel.removeAllRanges();
                            }
                            initial = TRUE;
                        }
                    }, { "global":  Editor });
                });

            });

            return self;
        };
        self["use"] = self.use;
        //配置内部组件载入基路径
        self["Config"]["base"] = Editor["Config"]["base"];
        self["Config"]["debug"] = Editor["Config"]["debug"];
        //配置内部组件载入文件名
        self["Config"]['componentJsName'] = getJSName;
        self.init(textarea);
    }

    var getJSName;
    if (parseFloat(S.version) < 1.2) {
        getJSName = function () {
            return "plugin-min.js?t=" +
                encodeURIComponent("2012-10-29 15:53:12");
        };
    } else {
        getJSName = function (m, tag) {
            return m + '/plugin-min.js' + (tag ? tag : '?t=' +
                encodeURIComponent('2012-10-29 15:53:12'));
        };
    }

    S.app(Editor, S.EventTarget);
    //配置内部组件载入基路径
    Editor["Config"]["base"] = S["Config"]["base"] + "editor/plugins/";
    Editor["Config"]["debug"] = S["Config"]["debug"];
    //配置内部组件载入文件名
    Editor["Config"]['componentJsName'] = getJSName;

    /**
     * @constructor
     */
    S.Editor = Editor;
    /**
     * @constructor
     */
    S["Editor"] = Editor;
});

KISSY.add("editor", function(S) {
    return S.Editor;
}, {
    requires:['dd','overlay']
});
/**
 * 目标：分离，解耦，模块化，去除重复代码
 * 分裂为三个部分
 * 1.纯粹 UI 模块 ：overlay,bubbleview
 * 2.编辑器功能模块 : TableUI
 * 3.编辑器attach功能模块 : table
 * 4.使用新loader，不提前注册内部模块以及依赖
 * 5.ui 根据是否首屏需要，分为 ui/core 以及 plugins
 */