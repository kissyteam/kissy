/**
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/base", function (S, HtmlParser, Component) {

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
            return el.one(".ks-editor-textarea");
        }

    };

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires:['htmlparser', 'component', 'core']
});