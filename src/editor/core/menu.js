
KISSY.Editor.add("core~menu", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        UA = YAHOO.env.ua,

        DISPLAY = "display",
        NONE = "none",
        EMPTY = "",
        DROP_MENU_CLASS = "ks-editor-drop-menu",
        SHADOW_CLASS = "ks-editor-drop-menu-shadow",
        CONTENT_CLASS = "ks-editor-drop-menu-content",
        SELECTED_CLASS = "ks-editor-toolbar-button-selected",
        SHIM_CLASS = DROP_MENU_CLASS + "-shim", //  // iframe shim 的 class
        shim; // 共用一个 shim 即可
    
    E.Menu = {

        /**
         * 生成下拉框
         * @param {KISSY.Editor} editor dropMenu 所属的编辑器实例
         * @param {HTMLElement} trigger
         * @param {Array} offset dropMenu 位置的偏移量
         * @return {HTMLElement} dropMenu
         */
        generateDropMenu: function(editor, trigger, offset) {
            var dropMenu = document.createElement("div"),
                 self = this;

            // 添加阴影层
            dropMenu.innerHTML = '<div class="' + SHADOW_CLASS + '"></div>'
                               + '<div class="' + CONTENT_CLASS + '"></div>';
            
            // 生成 DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[DISPLAY] = NONE;
            document.body.appendChild(dropMenu);

            // 点击触点时，显示下拉框
            // 注：一个编辑器实例，最多只能有一个激活的下拉框
            Event.on(trigger, "click", function(ev) {
                // 不向上传播，自己控制
                // 否则 document 上监控点击后，会关闭刚打开的 dropMenu
                Event.stopPropagation(ev);

                // 隐藏当前激活的下拉框
                self._hide(editor);

                // 打开当前 trigger 的 dropMenu
                if(editor.activeDropMenu != dropMenu) {
                    self._setDropMenuPosition(trigger, dropMenu, offset); // 延迟到显示时调整位置
                    editor.activeDropMenu = dropMenu;
                    editor.activeDropButton = trigger;
                    self._show(editor);

                } else { // 第二次点击在 trigger 上，关闭 activeDropMenu, 并置为 null. 否则会导致第三次点击打不开
                    editor.activeDropMenu = null;
                    editor.activeDropButton = null;
                }
            });

            // document 捕获到点击时，关闭当前激活的下拉框
            Event.on([document, editor.contentDoc], "click", function() {
                if(editor.activeDropMenu) {
                    self.hideActiveDropMenu(editor);

                    // 还原选区和焦点
                    if (this == editor.contentDoc) {
                        // TODO: [bug 58]  需要重写一个 focusmanager 来统一管理焦点
//                        if (UA.ie) {
//                            var range = editor.getSelectionRange();
//                            range.select();
//                        }
                        editor.contentWin.focus();
                    }
                }
            });

            // 改变窗口大小时，动态调整位置
            this._initResizeEvent(trigger, dropMenu, offset);

            // 返回
            return dropMenu.childNodes[1]; // 返回 content 部分
        },

        /**
         * 设置 dropMenu 的位置
         */
        _setDropMenuPosition: function(trigger, dropMenu, offset) {
            var r = Dom.getRegion(trigger),
                left = r.left, top = r.bottom;

            if(offset) {
                left += offset[0];
                top += offset[1];
            }

            dropMenu.style.left = left + "px";
            dropMenu.style.top = top + "px";
        },

        _isVisible: function(el) {
            if(!el) return false;
            return el.style[DISPLAY] != NONE;
        },

        /**
         * 隐藏编辑器当前打开的下拉框
         */
        hideActiveDropMenu: function(editor) {
            this._hide(editor);
            editor.activeDropMenu = null;
            editor.activeDropButton = null;
        },

        _hide: function(editor) {
            var dropMenu = editor.activeDropMenu,
                dropButton = editor.activeDropButton;

            if(dropMenu) {
                shim && (shim.style[DISPLAY] = NONE);

                dropMenu.style[DISPLAY] = NONE;
                //dropMenu.style.visibility = "hidden";
                // 注：visibilty 方式会导致ie下，上传并插入文件（选择了选取文件框）后，编辑区域焦点丢失
            }

            dropButton && (Dom.removeClass(dropButton, SELECTED_CLASS));
        },

        _show: function(editor) {
            var dropMenu = editor.activeDropMenu,
                dropButton = editor.activeDropButton;

            if (dropMenu) {
                dropMenu.style[DISPLAY] = EMPTY;

                if (UA.ie === 6) {
                    this._updateShimRegion(dropMenu);
                    shim.style[DISPLAY] = EMPTY;
                }
            }

            dropButton && (Dom.addClass(dropButton, SELECTED_CLASS));
        },

        _updateShimRegion: function(el) {
            if(el) {
                if(UA.ie === 6) {
                    if(!shim) this._initShim();
                    this._setShimRegion(el);
                }
            }
        },

        /**
         * window.onresize 时，重新调整 dropMenu 的位置
         */
        _initResizeEvent: function(trigger, dropMenu, offset) {
            var self = this, resizeTimer;

            Event.on(window, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    if(self._isVisible(dropMenu)) { // 仅在显示时，需要动态调整
                        self._setDropMenuPosition(trigger, dropMenu, offset);
                    }
                }, 50);
            });
        },

        _initShim: function() {
            shim = document.createElement("iframe");
            shim.src = "about:blank";
            shim.className = SHIM_CLASS;
            shim.style.position = "absolute";
            shim.style[DISPLAY] = NONE;
            shim.style.border = NONE;
            document.body.appendChild(shim);
        },

        /**
         * 设置 shim 的 region
         * @protected
         */
        _setShimRegion: function(el) {
            if (shim && this._isVisible(el)) {
                var r = Dom.getRegion(el);
                if (r.width > 0) {
                    shim.style.left = r.left + "px";
                    shim.style.top = r.top + "px";
                    shim.style.width = (r.width - 1) + "px"; // 少一像素，否则 ie6 下会露出一像素
                    shim.style.height = (r.height - 1) + "px";
                }
            }
        }
    };

});

