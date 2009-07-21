KISSY.Editor.add("toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
            //isIE = YAHOO.env.ua.ie,
            TOOLBAR_BUTTON_TMPL = '',
            TOOLBAR_SEPARATOR_TMPL = '<div class="kissy-toolbar-separator"></div>';

    TOOLBAR_BUTTON_TMPL += '<div class="kissy-toolbar-button" title="{TITLE}">';
    TOOLBAR_BUTTON_TMPL += '    <div class="kissy-toolbar-button-outer-box">';
    TOOLBAR_BUTTON_TMPL += '        <div class="kissy-toolbar-button-inner-box">';
    TOOLBAR_BUTTON_TMPL += '            <span class="kissy-toolbar-item kissy-toolbar-{NAME}">{TEXT}</span>';
    TOOLBAR_BUTTON_TMPL += '        </div>';
    TOOLBAR_BUTTON_TMPL += '    </div>';
    TOOLBAR_BUTTON_TMPL += '</div>';


    E.Toolbar = {

        /**
         * 根据传入的编辑器实例，初始化实例的工具条
         * @param {KISSY.Editor} editor
         */
        init: function(editor) {

            this._renderUI(editor);
        },

        /**
         * 构建 DOM
         */
        _renderUI: function(editor) {
            var config = editor.config,
                lang = E.lang[config.language],
                items = config.toolbar,
                plugins = E.plugins,
                i, len, key,
                div = document.createElement("div");

            for (i = 0,len = items.length; i < len; ++i) {
                key = items[i];

                if (key) {
                    if (!(key in plugins)) continue; // 有可能配置项里有但插件里无

                    (function() {
                        var p = plugins[key];
                        var item = {
                            name      : key, // bold
                            text      : lang[key].text, // Bold
                            title     : lang[key].title // Bold (Ctrl+B)
                        };

                        // TODO 根据 type 选择不同模版
                        div.innerHTML = TOOLBAR_BUTTON_TMPL
                                .replace("{TITLE}", item.title)
                                .replace("{NAME}", item.name)
                                .replace("{TEXT}", item.text);

                        if (p.fn) {
                            Event.on(div.firstChild, "click", function() {
                                p.fn(item, editor);
                            });
                        }
                    })();

                } else { // 分隔线
                    div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
                }

                editor.toolbar.appendChild(div.firstChild);
            }
        }

    };

});
