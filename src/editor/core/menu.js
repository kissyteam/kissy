
KISSY.Editor.add("menu", function(E) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event,
        //isIE = YAHOO.env.ua.ie,

        VISIBILITY = "visibility",
        DROP_MENU_CLASS = "kissy-drop-menu";
    
    E.Menu = {

        /**
         * 生成下拉框
         * @param {HTMLElement} trigger
         * @param {Array} offset dropMenu 位置的偏移量
         * @return {HTMLElement} dropMenu
         */
        generateDropMenu: function(trigger, offset) {
            var dropMenu = document.createElement("div");

            // DOM
            dropMenu.className = DROP_MENU_CLASS;
            dropMenu.style[VISIBILITY] = "hidden";
            document.body.appendChild(dropMenu);
            this._setDropMenuPosition(trigger, dropMenu);

            // Event
            Event.on(trigger, "click", function() { // 点击时切换显示
                if(dropMenu.style[VISIBILITY] == "hidden") {
                    dropMenu.style[VISIBILITY] = "visible";
                } else {
                    dropMenu.style[VISIBILITY] = "hidden";
                }
            });
            this._initResizeEvent(trigger, dropMenu, offset); // 改变窗口大小时，动态调整位置

            // 返回
            return dropMenu;
        },

        /**
         * 设置 dropMenu 的位置
         */
        _setDropMenuPosition: function(trigger, dropMenu, offset) {
            var r = Dom.getRegion(trigger),
                left = r.left, top = r.bottom;

            // ie8兼容模式
            // document.documentMode:
            // 5 - Quirks Mode
            // 7 - IE7 Standards
            // 8 - IE8 Standards
            var docMode = document.documentMode;
            if (docMode === 7 && (ie === 7 || ie === 8)) {
                left -= 2;
            } else if (YAHOO.env.ua.gecko) { // firefox下左偏一像素 注：当父级容器有 margin: auto 时会出现
                left++;
            }

            if(offset) {
                left += offset[0];
                top += offset[1];
            }

            dropMenu.style.left = left + "px";
            dropMenu.style.top = top + "px";
        },

        /**
         * window.onresize 时，重新调整 dropMenu 的位置
         */
        _initResizeEvent: function(trigger, dropMenu) {
            var instance = this, resizeTimer;

            Event.on(window, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    instance._setDropMenuPosition(trigger, dropMenu);
                }, 50);
            });
        }
    };

});
