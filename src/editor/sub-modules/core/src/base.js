/**
 * Set up editor constructor
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/core/base", function (S, HTMLParser, Component) {

    /**
     * @class
     * KISSY Editor.
     * xclass: 'editor'.
     * @extends KISSY.Component.Controller
     * @name Editor
     */
    var Editor = Component.Controller.extend(
        /**
         * @lends Editor#
         */
        {
            initializer: function () {
                var self = this;
                self.__commands = {};
                self.__controls = {};
            }
        },

        {
            Config: {},
            XHTML_DTD: HTMLParser['DTD'],
            ATTRS: /**
             * @lends Editor#
             */
            {
                /**
                 * textarea
                 * @type {KISSY.NodeList}
                 */
                textarea: {},
                /**
                 * iframe
                 * @type {KISSY.NodeList}
                 */
                iframe: {},
                /**
                 * iframe 's contentWindow.
                 * @type {KISSY.NodeList}
                 */
                window: {
                    // ie6 一旦中途设置了 domain
                    // 那么就不能从 document getWindow 获取对应的 window
                    // 所以一开始设置下，和 document 有一定的信息冗余

                },
                /**
                 * iframe 's document
                 * @type {KISSY.NodeList}
                 */
                document: {},
                /**
                 * toolbar element
                 * @type {KISSY.NodeList}
                 */
                toolBarEl: {},
                /**
                 * status bar element
                 * @type {KISSY.NodeList}
                 */
                statusBarEl: {},
                handleMouseEvents: {
                    value: false
                },
                focusable: {
                    value: false
                },
                /**
                 * editor mode.
                 * wysiswyg mode:1
                 * source mode:0
                 * Defaults to: wysiswyg mode
                 */
                mode: {
                    value: 1
                },
                /**
                 * Current editor's content
                 * @type {String}
                 */
                data: {
                    getter: function (v) {
                        var d = this._getData();
                        if (d === undefined) {
                            return v;
                        }
                        return d;
                    }
                },
                /**
                 *  Current editor's format content
                 * @type {String}
                 * @readonly
                 */
                formatData: {
                    getter: function () {
                        return this._getData(1);
                    }
                },

                /**
                 * Custom style for editor.
                 * @type {String}
                 */
                customStyle: {
                    value: ""
                },

                /**
                 * Custom css link url for editor.
                 * @type {String[]}
                 */
                customLink: {
                    value: []
                }
            }
        }, {
            xclass: 'editor'
        });


    Editor.HTML_PARSER = {

        textarea: function (el) {
            return el.one("." + this.get('prefixCls') + "editor-textarea");
        },
        data: function (el) {
            return el.one("." + this.get('prefixCls') + "editor-textarea").val();
        }

    };

    S.mix(Editor, S.EventTarget);

    KISSY.Editor = Editor;

    return Editor;
}, {
    requires: ['htmlparser', 'component/base', 'core']
});