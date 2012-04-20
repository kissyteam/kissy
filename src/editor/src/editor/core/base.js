/**
 * set up editor variable
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/base", function (S, HtmlParser, Component, UIBase) {
    var PREFIX = "editor/plugin/", SUFFIX = "/";

    /**
     * KISSY Editor
     * @class
     * @extends Component.Controller
     * @name Editor
     */
    var Editor = UIBase.create(Component.Controller, [UIBase.Box],
        /**
         * @lends Editor#
         */
        {
            initializer:function () {
                var self = this, textarea;
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
                    if (!self.get("width")) {
                        self.__set("width", textarea.style("width") || textarea.css("width"));
                    }
                    if (!self.get("height")) {
                        self.__set("height", textarea.style("height") || textarea.css("height"));
                    }
                } else {
                    self.__editor_created_new = 1;
                }
            },
            use:function (mods, callback) {
                var self = this,
                    BASIC = self.__CORE_PLUGINS || [
                        "htmlDataProcessor",
                        "enterKey",
                        "clipboard",
                        "selection"
                    ];

                mods = mods.split(",");

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
                        modFns[i].init(self);
                    }
                    callback && callback.call(self);
                }

                //编辑器实例 use 时会进行编辑器 ui 操作而不单单是功能定义，必须 ready
                S.use(mods.join(","), function () {
                    var args = S.makeArray(arguments);
                    args.shift();
                    useMods(args);
                });

                self.__CORE_PLUGINS = [];

                return self;
            }
        },

        {
            Config:{
                base:S.Config.base + "editor/"
            },
            XHTML_DTD:HtmlParser['DTD'],
            ATTRS:/**
             * @lends Editor
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

    Editor.DefaultRender = UIBase.create(Component.Render, [UIBase.Box.Render], {
        _uiSetHeight:function () {
        }
    });

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires:['htmlparser', 'component', 'uibase', 'core']
});