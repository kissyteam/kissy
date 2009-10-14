
KISSY.Editor.add("plugins~font", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        SELECT_TMPL = '<ul class="ks-editor-select-list">{LI}</ul>',
        OPTION_TMPL = '<li class="ks-editor-option" data-value="{VALUE}">' +
                          '<span class="ks-editor-option-checkbox"></span>' +
                          '<span style="{STYLE}">{KEY}</span>' +
                      '</li>',
        OPTION_SELECTED = "ks-editor-option-selected",
        DEFAULT = "Default";

    E.addPlugin(["fontName", "fontSize"], {
        /**
         * 种类：菜单按钮
         */
        type: TYPE.TOOLBAR_SELECT,

        /**
         * 当前选中值
         */
        selectedValue: "",

        /**
         * 选择框头部
         */
        selectHead: null,

        /**
         * 关联的下拉选择列表
         */
        selectList: null,

        /**
         * 下拉框里的所有选项值
         */
        options: [],

        range: null,

        /**
         * 初始化
         */
        init: function() {
            this.options = this.lang.options;
            this.selectHead = this.domEl.getElementsByTagName("span")[0];

            this._renderUI();
            this._bindUI();
        },

        _renderUI: function() {
            // 初始化下拉框 DOM
            this.selectList = E.Menu.generateDropMenu(this.editor, this.domEl, [1, 0]);
            this._renderSelectList();

            // 选中默认值
            this._setSelectedOption(this.options[DEFAULT]);
        },

        _bindUI: function() {
            // 注册选取事件
            this._bindPickEvent();

            // 隐藏光标，否则 ie 下光标会显示在层上面
            if(isIE) {
                Event.on(this.domEl, "click", function() {
                    this.range = this.editor.getSelectionRange(); // 保存 range, 以便还原焦点
                }, this, true);
            }
        },

        /**
         * 初始化下拉框 DOM
         */
        _renderSelectList: function() {
            var htmlCode = "", options = this.options,
                key, val;

            for(key in options) {
                if(key == DEFAULT) continue;
                val = options[key];

                htmlCode += OPTION_TMPL
                        .replace("{VALUE}", val)
                        .replace("{STYLE}", this._getOptionStyle(key, val))
                        .replace("{KEY}", key);
            }

            // 添加到 DOM 中
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // 添加个性化 class
            Dom.addClass(this.selectList, "ks-editor-drop-menu-" + this.name);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this;

            Event.on(this.selectList, "click", function(ev) {
                var target = Event.getTarget(ev);

                if(target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if(!target) return;

                self._doAction(target.getAttribute("data-value"));
            });
        },

        /**
         * 执行操作
         */
        _doAction: function(val) {
            if(!val) return;

            var editor = this.editor,
                range = this.range;

            // 更新当前值
            this._setSelectedOption(val);

            // 还原选区
            if(isIE && range.select) range.select();

            // 执行命令
            editor.execCommand(this.name, this.selectedValue);
        },

        /**
         * 选中某一项
         */
        _setSelectedOption: function(val) {
            this.selectedValue = val;

            // 更新 head
            this.selectHead.innerHTML = this._getOptionKey(val);

            // 更新 selectList 中的选中项
            this._updateSelectedOption(val);
        },

        _getOptionStyle: function(key, val) {
          if(this.name == "fontName") {
              return "font-family:" + val;
          } else { // font size
              return "font-size:" + key + "px";
          }
        },

        _getOptionKey: function(val) {
            var options = this.options, key;

            for(key in options) {
                if(key == DEFAULT) continue;

                if(options[key] == val) {
                    return key;
                }
            }
        },

        /**
         * 更新下拉框的选中项
         */
        _updateSelectedOption: function(val) {
            var items = this.selectList.getElementsByTagName("li"),
                i, len = items.length, item;

            for(i = 0; i < len; ++i) {
                item = items[i];

                if(item.getAttribute("data-value") == val) {
                    Dom.addClass(item, OPTION_SELECTED);
                } else {
                    Dom.removeClass(item, OPTION_SELECTED);
                }
            }
        }
    });

});

// TODO
//  1. 仿 google, 对键盘事件的支持
//  2. 光标变化时，动态更新当前字体显示值
