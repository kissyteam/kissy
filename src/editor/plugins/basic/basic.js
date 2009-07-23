
KISSY.Editor.add("basic", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, //Lang = YAHOO.lang,
        //isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE;


    /* 普通按钮 */
    var buttons  = "bold,italic,underline,";
    buttons += "insertOrderedList,insertUnorderedList,";
    buttons += "outdent,indent,";
    buttons += "justifyLeft,justifyCenter,justifyRight";

    E.plugins[buttons] = {
        /**
         * 种类：普通按钮
         */
        type: TYPE.TOOLBAR_BUTTON,

        /**
         * 响应函数
         * @param {KISSY.Editor} editor
         */
        fn: function(editor) {
            editor.execCommand(this.name);
        }
    };


    /* 下拉按钮 */
    E.plugins["foreColor,backColor"] = {
        /**
         * 种类：普通按钮 + 菜单按钮
         */
        type: TYPE.TOOLBAR_BUTTON | TYPE.TOOLBAR_MENU_BUTTON,

        /**
         * 当前选取色
         * 在 init 里初始化
         */
        color: [],

        /**
         * 关联的下拉菜单框
         */
        dropMenu: null,

        /**
         * 插件自己的初始化函数
         */
        init: function(editor) {
            this.color = (this.name == "foreColor") ? [0,0,0] : [255,255,255];

            var el = this.domEl,
                caption = el.getElementsByTagName("span")[0].parentNode,
                //dropdown = caption.nextSibling,
                self = this;

                Dom.addClass(el, "kissy-toolbar-color-button");
                caption.innerHTML = '<div class="kissy-toolbar-color-button-indicator" style="border-bottom-color:' + this._getColor() + '">'
                                   + caption.innerHTML
                                   + '</div>';

            /*
            // 点击 caption 区域
            Event.on(caption, "click", function() {
                editor.execCommand(self.name, self._getColor());
            });

            // 下拉框
            this._initDropDown(dropdown);
            */
            // 注：上面的方案，是仿照 MS Office 2007，仅当点击下拉箭头时，才弹出下拉框。点击 caption 时，直接设置颜色
            // 从逻辑上讲，上面的方案不错。
            // 但是，考虑 web 页面上，按钮比较小，不区分 caption 和 dropdown，让每次点击都弹出下拉框，这样反而能增加
            // 易用性。这也是 Google Docs 采取的方式。下面采用这种方式。
            this._initDropDown(el);

            // 点击时，执行命令
            Event.on(el, "click", function() {
                editor.execCommand(self.name, self._getColor());
            });
        },

        /**
         * 初始化下拉框
         */
        _initDropDown: function(dropdown) {
            this.dropMenu = E.Menu.generateDropMenu(dropdown, [-1, 1]);

            // 生成下拉框内的内容
            this._generatePalettes();
        },

        /**
         * 生成取色板
         */
        _generatePalettes: function() {
            // TODO
            this.dropMenu.innerHTML = "haha";
        },

        /**
         * 得到当前的选取色，格式为 "rgb(r,g,b)"
         */
        _getColor: function() {
            return "rgb(" + this.color.join() + ")";
        }
    };

});
