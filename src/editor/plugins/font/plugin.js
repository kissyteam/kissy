
KISSY.Editor.add("plugins~font", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,

        SELECT_TMPL = '<ul class="kissy-select-list">{LI}</ul>',
        OPTION_TMPL = '<li class="kissy-option" data-value="{VALUE}">' +
                          '<span class="kissy-option-checkbox"></span>' +
                          '<span style="{STYLE}">{KEY}</span>' +
                      '</li>',
        OPTION_SELECTED = "kissy-option-selected",
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

        /**
         * 初始化
         */
        init: function() {
            var el = this.domEl;

            this.options = this.lang.options;
            this.selectHead = el.getElementsByTagName("span")[0];

            this._initSelectList(el);

            // 选中当前值
            this._setSelectedOption(this.options[DEFAULT]);
        },

        /**
         * 初始化下拉选择框
         */
        _initSelectList: function(trigger) {
            this.selectList = E.Menu.generateDropMenu(this.editor, trigger, [1, 0]);

            // 初始化下拉框 DOM
            this._renderSelectList();

            // 注册选取事件
            this._bindPickEvent();
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
                        .replace("{STYLE}", this._getOptionStyle(val))
                        .replace("{KEY}", key);
            }

            // 添加到 DOM 中
            this.selectList.innerHTML = SELECT_TMPL.replace("{LI}", htmlCode);

            // 添加个性化 class
            Dom.addClass(this.selectList, "kissy-drop-menu-" + this.name);

            // 针对 ie，设置不可选择
            if (isIE) E.Dom.setItemUnselectable(this.selectList);
        },

        /**
         * 绑定取色事件
         */
        _bindPickEvent: function() {
            var self = this, editor = this.editor;

            Event.on(this.selectList, "click", function(ev) {
                var target = Event.getTarget(ev), val;

                if(target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if(!target) return;

                val = target.getAttribute("data-value");
                //console.log(val);

                if(val) {
                    // 更新当前值
                    self._setSelectedOption(val);

                    // 执行命令
                    editor.execCommand(self.name, self.selectedValue);
                }
            });
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

        _getOptionStyle: function(val) {
          if(this.name == "fontName") {
              return "font-family:" + val;
          } else { // font size
              return "font-size:" + val;
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
