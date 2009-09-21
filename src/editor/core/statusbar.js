
KISSY.Editor.add("core~statusbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        isIE6 = isIE === 6,
        TYPE = E.PLUGIN_TYPE,

        SEP_TMPL = '<div class="ks-editor-stripbar-sep kissy-inline-block"></div>',
        ITEM_TMPL = '<div class="ks-editor-statusbar-item ks-editor-statusbar-{NAME} ks-inline-block">{CONTENT}</div>',

        div = document.createElement("div"); // 通用 el 容器

    E.Statusbar = function(editor) {

        /**
         * 相关联的编辑器实例
         */
        this.editor = editor;

        /**
         * 相关联的配置
         */
        this.config = editor.config;

        /**
         * 当前语言
         */
        this.lang = E.lang[this.config.language];
    };
    
    Lang.augmentObject(E.Statusbar.prototype, {

        /**
         * 初始化工具条
         */
        init: function() {
            var items = this.config.statusbar,
                plugins = this.editor.plugins,
                key;

            // 遍历配置项，找到相关插件项，并添加到工具栏上
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // 配置项里有，但加载的插件里无，直接忽略

                    // 添加插件项
                    this._addItem(plugins[key]);

                } else { // 添加分隔线
                    this._addSep();
                }
            }
        },

        /**
         * 添加工具栏项
         */
        _addItem: function(p) {
            var el, type = p.type, lang = this.lang, html;

            // 当 plugin 没有设置 lang 时，采用默认语言配置
            // TODO: 考虑重构到 instance 模块里，因为 lang 仅跟实例相关
            if (!p.lang) p.lang = Lang.merge(lang["common"], this.lang[p.name] || {});

            // 根据模板构建 DOM
            div.innerHTML = ITEM_TMPL.replace("{NAME}", p.name);

            // 得到 domEl
            p.domEl = el = div.firstChild;

            // 添加到工具栏
            this._addToStatusbar(el);

            // 调用插件自己的初始化函数，这是插件的个性化接口
            // init 放在添加到工具栏后面，可以保证 DOM 操作比如取 region 等操作的正确性
            p.editor = this.editor; // 给 p 增加 editor 属性
            if (p.init) {
                p.init();
            }

            // 标记为已初始化完成
            p.inited = true;
        },

        /**
         * 添加分隔线
         */
        _addSep: function() {
            div.innerHTML = SEP_TMPL;
            this._addToStatusbar(div.firstChild);
        },

        /**
         * 将 item 或 分隔线 添加到状态栏
         */
        _addToStatusbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        }
    });

});
