
KISSY.Editor.add("toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, //Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="kissy-toolbar-separator kissy-inline-block"></div>',

        TOOLBAR_BUTTON_TMPL = '\
<div class="kissy-toolbar-button kissy-inline-block" title="{TITLE}">\
    <div class="kissy-toolbar-button-outer-box">\
        <div class="kissy-toolbar-button-inner-box">\
            <span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>\
        </div>\
    </div>\
</div>',
        TOOLBAR_MENU_BUTTON_TMPL = '\
<div class="kissy-toolbar-menu-button-caption kissy-inline-block">\
    <span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>\
</div>\
<div class="kissy-toolbar-menu-button-dropdown kissy-inline-block"></div>',

        TOOLBAR_BUTTON_ACTIVE = "kissy-toolbar-button-active",

        config, // 当前 editor 实例的配置
        lang, // 当前 editor 实例的语言
        items, // 当前 editor 实例工具栏上的配置项
        plugins = E.plugins, // 所有注册的实例
        div = document.createElement("div"); // 通用 el 容器

    
    E.Toolbar = {

        /**
         * 根据传入的编辑器实例，初始化实例的工具条
         * @param {KISSY.Editor} editor
         */
        init: function(editor) {
            var i, len, key, button;

            // 更新实例相关变量
            config = editor.config;
            lang = E.lang[config.language];
            items = config.toolbar;

            for (i = 0,len = items.length; i < len; ++i) {
                key = items[i];

                if (key) {
                    if (!(key in plugins)) continue; // 配置项里有，但插件里无，直接忽略
                    this._initItem(key, editor);

                } else { // 分隔线
                    div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
                }

                button = div.firstChild;
                if(isIE) button = this._setItemUnselectable(button);
                editor.toolbar.appendChild(button);
            }
        },

        /**
         * 初始化工具栏上的项
         */
        _initItem: function(key, editor) {
            var p = plugins[key], innerBox, el;

            // 当plugin 没有设置 lang 时，采用默认语言配置
            if (!p.lang) p.lang = lang[key];

            // 根据模板构建 DOM
            div.innerHTML = TOOLBAR_BUTTON_TMPL
                    .replace("{TITLE}", p.lang.title)
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text);

            p.domEl = el = div.firstChild;

            // 根据工具栏的插件类型，调整 DOM 结构
            // TODO 支持更多普适类插件类型
            if (p.type & TYPE.TOOLBAR_MENU_BUTTON) { // 下拉菜单
                innerBox = el.getElementsByTagName("span")[0].parentNode;
                innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
                        .replace("{NAME}", p.name)
                        .replace("{TEXT}", p.lang.text);
            }

            // 调用插件自己的初始化函数
            // 插件的个性化接口
            if (p.init) {
                p.init(p, editor);
            }

            // 注册点击时的响应函数
            if (p.fn) {
                Event.on(el, "click", function() {
                    p.fn(p, editor);
                });
            }

            // 添加鼠标点击时，按钮按下的效果
            Event.on(el, "mousedown", function() {
                Dom.addClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            Event.on(el, "mouseup", function() {
                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            // TODO 完善下面的事件，在按下状态，鼠标移出和移入时，状态的切换和还原
            Event.on(el, "mouseout", function(e) {
                var toElement = Event.getRelatedTarget(e), isChild;
                if (el.contains) {
                    isChild = el.contains(toElement);
                } else if (el.compareDocumentPosition) { // ff 3.5 下貌似无效，待更进一步测试确定
                    isChild = el.compareDocumentPosition(toElement) & 16;
                }
                if (isChild) return;

                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });


        },

        /**
         * 让元素不可选，解决 ie 下 selection 丢失的问题
         */
        _setItemUnselectable: function(el) {
            var arr, i, len, n, a;

            // 在 ie 下不行
            //arr = [el].concat(Array.prototype.slice.call(el.getElementsByTagName("*")));

            arr = el.getElementsByTagName("*");
            for (i = -1, len = arr.length; i < len; ++i) {
                a = (i == -1) ? el : arr[i];
                
                n = a.nodeName;
                if (n && n != "INPUT") {
                    a.setAttribute("unselectable", "on");
                }
            }

            return el;
        }

    };

});
