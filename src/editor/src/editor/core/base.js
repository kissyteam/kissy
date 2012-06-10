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
    var Editor = Component.Controller.extend(
        /**
         * @lends Editor#
         */
        {
            initializer:function () {
                var self = this;
                self.__commands = {};
                self.__controls={};
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
                    var args = S.makeArray(arguments);
                    args.shift();
                    useMods(args);
                    // 工具条出来后调整高度
                    self.adjustHeight();
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
                 * textarea
                 * @type Node
                 */
                textarea:{},
                /**
                 * iframe
                 * @type Node
                 */
                iframe:{},
                /**
                 * iframe 's contentWindow
                 * @type Node
                 */
                window:{},
                /**
                 * iframe 's document
                 * @type Node
                 */
                document:{},
                /*
                 * iframe 's parentNode
                 * @type Node
                 */
                iframeWrapEl:{},
                /**
                 * toolbar element
                 * @type Node
                 */
                toolBarEl:{},
                /**
                 * status bar element
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
                 * editor mode.
                 * wysiswyg mode:1
                 * source mode:0
                 * @default wysiswyg mode
                 */
                mode:{
                    value:1
                },
                /**
                 * Current editor's content
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
                 *  Current editor's format content
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

                /**
                 * Custom style for editor.
                 * @type String
                 */
                customStyle:{
                    value:""
                },

                /**
                 * Custom css link url for editor.
                 * @type String[]
                 */
                customLink:{
                    value:[]
                }
            }
        }, {
            xclass:'editor'
        });


    Editor.HTML_PARSER = {

        textarea:function (el) {
            return el.one(this.get("prefixCls") + ".editor-textarea");
        }

    };

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires:['htmlparser', 'component', 'core']
});