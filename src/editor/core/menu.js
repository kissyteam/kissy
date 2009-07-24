
KISSY.Editor.add("core~menu", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,

        VISIBILITY = "visibility",
        DROP_MENU_CLASS = "kissy-drop-menu";
    
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

            // 生成 DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[VISIBILITY] = "hidden";
            document.body.appendChild(dropMenu);

            // 点击触点时，显示下拉框
            // 注：一个编辑器实例，最多只能有一个激活的下拉框
            Event.on(trigger, "click", function(ev) {
                // 不向上传播，自己控制
                // 否则 document 上监控点击后，会关闭刚打开的 dropMenu
                Event.stopPropagation(ev);

                // 隐藏当前激活的下拉框
                self._hide(editor.activeDropMenu);

                // 打开当前 trigger 的 dropMenu
                if(editor.activeDropMenu != dropMenu) {
                    self._setDropMenuPosition(trigger, dropMenu, offset); // 延迟到显示时调整位置
                    self._show(dropMenu);
                    editor.activeDropMenu = dropMenu;

                } else { // 第二次点击在 trigger 上，关闭 activeDropMenu, 并置为 null. 否则会导致第三次点击打不开
                    editor.activeDropMenu = null;                   
                }
            });

            // document 捕获到点击时，关闭当前激活的下拉框
            Event.on([document, editor.contentDoc], "click", function() {
                self._hide(editor.activeDropMenu);
                editor.activeDropMenu = null;
            });

            // 改变窗口大小时，动态调整位置
            this._initResizeEvent(trigger, dropMenu, offset);

            // 返回
            return dropMenu;
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
            return el.style[VISIBILITY] != "hidden";
        },

        _hide: function(el) {
            if(el) {
                el.style[VISIBILITY] = "hidden";
            }
        },

        _show: function(el) {
            if(el) {
                el.style[VISIBILITY] = "visible";
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
        }
    };

});
