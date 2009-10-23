
KISSY.Editor.add("core~toolbar", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        isIE = YAHOO.env.ua.ie,
        isIE6 = isIE === 6,
        TYPE = E.PLUGIN_TYPE,
        TOOLBAR_SEPARATOR_TMPL = '<div class="ks-editor-stripbar-sep ks-inline-block"></div>',

        TOOLBAR_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-button ks-inline-block" title="{TITLE}">' +
    '<div class="ks-editor-toolbar-button-outer-box">' +
        '<div class="ks-editor-toolbar-button-inner-box">' +
            '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
        '</div>' +
    '</div>' +
'</div>',

        TOOLBAR_MENU_BUTTON_TMPL = '' +
'<div class="ks-editor-toolbar-menu-button-caption ks-inline-block">' +
    '<span class="ks-editor-toolbar-item ks-editor-toolbar-{NAME}">{TEXT}</span>' +
'</div>' +
'<div class="ks-editor-toolbar-menu-button-dropdown ks-inline-block"></div>',

        TOOLBAR_MENU_BUTTON = "ks-editor-toolbar-menu-button",
        TOOLBAR_SELECT = "ks-editor-toolbar-select",
        TOOLBAR_BUTTON_ACTIVE = "ks-editor-toolbar-button-active",
        TOOLBAR_BUTTON_HOVER = "ks-editor-toolbar-button-hover",
        TOOLBAR_BUTTON_SELECTED = "ks-editor-toolbar-button-selected",
    
        STATE_CMDS = "fontName,fontSize,bold,italic,underline,strikeThrough"
                     + "insertOrderedList,insertUnorderedList"
                     + "justifyLeft,justifyCenter,justifyRight",

        div = document.createElement("div"); // 通用 el 容器


    E.Toolbar = function(editor) {

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

        /**
         * 所有加载的工具栏插件
         */
        this.items = [];

        /**
         * 所有需要动态更新状态的工具栏插件项
         */
        this.stateItems = [];
    };
    
    Lang.augmentObject(E.Toolbar.prototype, {

        /**
         * 初始化工具条
         */
        init: function() {
            var items = this.config.toolbar,
                plugins = this.editor.plugins,
                key, p;

            // 遍历配置项，找到相关插件项，并添加到工具栏上
            for (var i = 0, len = items.length; i < len; ++i) {
                key = items[i];
                if (key) {
                    if (!(key in plugins)) continue; // 配置项里有，但加载的插件里无，直接忽略

                    // 添加插件项
                    p = plugins[key];
                    this._addItem(p);

                    this.items.push(p);
                    if(STATE_CMDS.indexOf(p.name) !== -1) {
                        this.stateItems.push(p);
                    }

                } else { // 添加分隔线
                    this._addSeparator();
                }
            }

            // 状态更新
            this._initUpdateState();
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
            html = TOOLBAR_BUTTON_TMPL
                    .replace("{TITLE}", p.lang.title || "")
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
            if (isIE6) {
                html = html
                        .replace("outer-box", "outer-box ks-inline-block")
                        .replace("inner-box", "inner-box ks-inline-block");
            }
            div.innerHTML = html;

            // 得到 domEl
            p.domEl = el = div.firstChild;

            // 根据插件类型，调整 DOM 结构
            if (type == TYPE.TOOLBAR_MENU_BUTTON || type == TYPE.TOOLBAR_SELECT) {
                // 注：select 是一种特殊的 menu button
                this._renderMenuButton(p);

                if(type == TYPE.TOOLBAR_SELECT) {
                    this._renderSelect(p);
                }
            }

            // 绑定事件
            this._bindItemUI(p);

            // 添加到工具栏
            this._addToToolbar(el);

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
         * 初始化下拉按钮的 DOM
         */
        _renderMenuButton: function(p) {
            var el = p.domEl,
                innerBox = el.getElementsByTagName("span")[0].parentNode;

            Dom.addClass(el, TOOLBAR_MENU_BUTTON);
            innerBox.innerHTML = TOOLBAR_MENU_BUTTON_TMPL
                    .replace("{NAME}", p.name)
                    .replace("{TEXT}", p.lang.text || "");
        },

        /**
         * 初始化 selectBox 的 DOM
         */
        _renderSelect: function(p) {
            Dom.addClass(p.domEl, TOOLBAR_SELECT);
        },

        /**
         * 给工具栏项绑定事件
         */
        _bindItemUI: function(p) {
            var el = p.domEl;

            // 1. 注册点击时的响应函数
            if (p.exec) {
                Event.on(el, "click", function() {
                    p.exec();
                });
            }

            // 2. 添加鼠标点击时，按钮按下的效果
            Event.on(el, "mousedown", function() {
                Dom.addClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            Event.on(el, "mouseup", function() {
                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });
            // TODO 完善效果：在鼠标左键按下状态，将鼠标移出和移入按钮时，按钮状态的切换
            // 注：firefox 下，按住左键，将鼠标移出和移入按钮时，不会触发 mouseout. 需要研究下 google 是如何实现的
            Event.on(el, "mouseout", function(e) {
                var toElement = Event.getRelatedTarget(e), isChild;

                try {
                    if (el.contains) {
                        isChild = el.contains(toElement);
                    } else if (el.compareDocumentPosition) {
                        isChild = el.compareDocumentPosition(toElement) & 8;
                    }
                } catch(e) {
                    isChild = false; // 已经移动到 iframe 里
                }
                if (isChild) return;

                Dom.removeClass(el, TOOLBAR_BUTTON_ACTIVE);
            });

            // 3. ie6 下，模拟 hover
            if(isIE6) {
                Event.on(el, "mouseenter", function() {
                    Dom.addClass(el, TOOLBAR_BUTTON_HOVER);
                });
                Event.on(el, "mouseleave", function() {
                    Dom.removeClass(el, TOOLBAR_BUTTON_HOVER);
                });
            }
        },

        /**
         * 添加分隔线
         */
        _addSeparator: function() {
            div.innerHTML = TOOLBAR_SEPARATOR_TMPL;
            this._addToToolbar(div.firstChild);
        },

        /**
         * 将 item 或 分隔线 添加到工具栏
         */
        _addToToolbar: function(el) {
            if(isIE) el = E.Dom.setItemUnselectable(el);
            this.domEl.appendChild(el);
        },

        /**
         * 初始化按钮状态的动态更新
         */
        _initUpdateState: function() {
            var doc = this.editor.contentDoc,
                self = this;

            Event.on(doc, "click", function() { self.updateState(); });
            Event.on(doc, "keyup", function(ev) {
                var keyCode = ev.keyCode;

                // PGUP,PGDN,END,HOME: 33 - 36
                // LEFT,UP,RIGHT,DOWN：37 - 40
                // BACKSPACE: 8
                // ENTER: 13
                // DEL: 46
                if((keyCode >= 33 && keyCode <= 40)
                    || keyCode === 8
                    || keyCode === 13
                    || keyCode === 46) {
                    self.updateState();
                }
            });

            // TODO: 监控粘贴时的事件，粘贴后需要更新按钮状态
        },

        /**
         * 按钮状态的动态更新（包括按钮选中状态的更新、字体字号的更新、颜色的动态更新等）
         * 遵守 Google Docs 的原则，让所有按钮始终可点击，只更新状态，不禁用按钮
         */
        updateState: function(filterNames) {
            var items = this.stateItems, p;
            filterNames = filterNames ? filterNames.join("|") : "";

            for(var i = 0, len = items.length; i < len; i++) {
                p = items[i];
                
                if(filterNames && filterNames.indexOf(p.name) === -1)
                    continue;

                // 调用插件自己的状态更新函数
                if(p.updateState) {
                    p.updateState();
                    continue;
                }

                // 默认的状态更新函数
                this.updateItemState(p);
            }

            // TODO: webkit 下，对齐的状态没获取到
        },

        updateItemState: function(p) {
            var doc = this.editor.contentDoc;

            // 默认的状态更新函数
            try {
                if (doc.queryCommandEnabled(p.name)) {
                    if (doc.queryCommandState(p.name)) {
                        Dom.addClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    } else {
                        Dom.removeClass(p.domEl, TOOLBAR_BUTTON_SELECTED);
                    }
                }
            } catch(ex) {
            }
        }
    });

});
