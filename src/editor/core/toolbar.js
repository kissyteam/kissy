
KISSY.Editor.add("toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, //Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="kissy-toolbar-separator"></div>',

        TOOLBAR_BUTTON_TMPL = '\
<div class="kissy-toolbar-button" title="{TITLE}">\
    <div class="kissy-toolbar-button-outer-box">\
        <div class="kissy-toolbar-button-inner-box">\
            <span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>\
        </div>\
    </div>\
</div>',
        TOOLBAR_MENU_BUTTON_CLASS = "kissy-toolbar-menu-button",
        TOOLBAR_MENU_BUTTON_TMPL = '\
<div class="kissy-toolbar-menu-button-caption">\
    <span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>\
</div>\
<div class="kissy-toolbar-menu-button-dropdown"></div>';

    E.Toolbar = {

        /**
         * 根据传入的编辑器实例，初始化实例的工具条
         * @param {KISSY.Editor} editor
         */
        init: function(editor) {
            var config = editor.config,
                lang = E.lang[config.language],
                items = config.toolbar,
                plugins = E.plugins,
                i, len, key, button,
                div = document.createElement("div");

            for (i = 0,len = items.length; i < len; ++i) {
                key = items[i];

                if (key) {
                    if (!(key in plugins)) continue; // 有可能配置项里有但插件里无

                    (function() {
                        var p = plugins[key], innerBox, el;

                        // 给 p 追加键值
                        p.name = key;
                        p.lang = lang[key];

                        // 根据模板构建 DOM
                        div.innerHTML = TOOLBAR_BUTTON_TMPL
                                .replace("{TITLE}", p.lang.title)
                                .replace("{NAME}", p.name)
                                .replace("{TEXT}", p.lang.text);

                        p.domEl = el = div.firstChild;

                        // 根据工具栏的插件类型，调整 DOM 结构
                        // TODO 支持更多普适类插件类型
                        if(p.type & TYPE.TOOLBAR_MENU_BUTTON) { // 下拉菜单
                            Dom.addClass(el, TOOLBAR_MENU_BUTTON_CLASS);
                            innerBox = el.getElementsByTagName("span")[0].parentNode;
                            innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
                                .replace("{NAME}", p.name)
                                .replace("{TEXT}", p.lang.text);

                        }

                        // 调用插件自己的初始化函数
                        // 插件的个性化接口
                        if(p.init) {
                            p.init(p, editor);
                        }

                        // 注册点击时的响应函数
                        if (p.fn) {
                            Event.on(el, "click", function() {
                                p.fn(p, editor);
                            });
                        }
                    })();

                } else { // 分隔线
                    div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
                }

                button = div.firstChild;
                if(isIE) button = this._setItemUnselectable(button);
                editor.toolbar.appendChild(button);
            }
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
