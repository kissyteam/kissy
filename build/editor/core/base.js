/*
Copyright 2012, KISSY UI Library v1.30dev
MIT Licensed
build time: May 28 19:44
*/
/**
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/base", function (S, HtmlParser, Component) {
    var PREFIX = "editor/plugin/", SUFFIX = "/";

    /**
     * KISSY Editor
     * @class
     * @extends Component.Controller
     * @extends Component.UIBase.Box
     * @name Editor
     */
    var Editor = Component.define(Component.Controller, [Component.UIBase.Box],
        /**
         * @lends Editor#
         */
        {
            initializer:function () {
                var self = this,
                    textarea;
                self.__commands = {};
                self.__dialogs = {};
                if (textarea = self.get("textarea")) {
                    if (!self.get("render") && !self.get("elBefore")) {
                        var next = textarea.next();
                        if (next) {
                            self.__set("elBefore", next);
                        } else {
                            self.__set("render", textarea.parent());
                        }
                    }
                } else {
                    self.__editor_created_new = 1;
                }
            },

            /**
             * Use editor plugins.
             * @param {Array<String>|String} mods Editor plugin names.
             * @param callback
             * @return {Editor} Current instance.
             */
            use:function (mods, callback) {
                var self = this,
                    BASIC = self.__CORE_PLUGINS || [
                        "htmlDataProcessor",
                        "enterKey",
                        "clipboard",
                        "selection"
                    ];

                if (S.isString(mods)) {
                    mods = mods.split(",");
                }

                for (var l = mods.length - 1; l >= 0; l--) {
                    if (!mods[l]) {
                        mods.splice(l, 1);
                    }
                }

                for (var i = 0; i < BASIC.length; i++) {
                    var b = BASIC[i];
                    if (!S.inArray(b, mods)) {
                        mods.unshift(b);
                    }
                }

                S.each(mods, function (m, i) {
                    if (mods[i]) {
                        mods[i] = PREFIX + m + SUFFIX;
                    }
                });

                function useMods(modFns) {
                    // 载入了插件的attach功能，现在按照顺序一个个attach
                    for (var i = 0; i < modFns.length; i++) {
                        if (modFns[i]) {
                            modFns[i].init(self);
                        }
                    }
                    callback && callback.call(self);
                }

                //编辑器实例 use 时会进行编辑器 ui 操作而不单单是功能定义，必须 ready
                S.use(mods, function () {
                    var h, args = S.makeArray(arguments);
                    args.shift();
                    useMods(args);
                    // 工具条出来后调整高度
                    if (h = self.get("height")) {
                        self._uiSetHeight(h);
                    }
                });

                self.__CORE_PLUGINS = [];

                return self;
            }
        },

        {
            Config:{},
            XHTML_DTD:HtmlParser['DTD'],
            ATTRS:/**
             * @lends Editor#
             */
            {
                /**
                 * textarea 元素
                 * @type Node
                 */
                textarea:{},
                /**
                 * iframe 元素
                 * @type Node
                 */
                iframe:{},
                /**
                 * iframe 中的 contentWindow
                 * @type Node
                 */
                window:{},
                /**
                 * iframe 中的 document
                 * @type Node
                 */
                document:{},
                /**
                 * iframe 元素的 父节点
                 * @type Node
                 */
                iframeWrapEl:{},
                /**
                 * 工具栏节点
                 * @type Node
                 */
                toolBarEl:{},
                /**
                 * 状态栏节点
                 * @type Node
                 */
                statusBarEl:{},
                handleMouseEvents:{
                    value:false
                },
                focusable:{
                    value:false
                },
                /**
                 * 编辑器当前模式：源码模式或可视化模式
                 * @default 可视化模式
                 */
                mode:{
                    value:1
                },
                /**
                 * 编辑器当前内容
                 * @type String
                 */
                data:{
                    getter:function () {
                        return this._getData();
                    },
                    setter:function (v) {
                        return this._setData(v);
                    }
                },
                /**
                 * 编辑器经过格式化的当前内容
                 * @type String
                 */
                formatData:{
                    getter:function () {
                        return this._getData(1);
                    },
                    setter:function (v) {
                        return this._setData(v);
                    }
                },
                prefixCls:{
                    value:"ke-"
                }
            }
        }, "Editor");

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires:['htmlparser', 'component', 'core']
});
