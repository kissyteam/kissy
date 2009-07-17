/**
 * Grids BigBang Script by lifesinger@gmail.com
 */

YUI({
    /*base: "http://t-yubo/assets/yui/3.0.0/build/",
    debug: true,
    filter: 'debug',*/
    modules: {
        "yui2-utilities": {
            fullpath: "http://yui.yahooapis.com/2.7.0/build/utilities/utilities.js"
        },
        "resize": {
            fullpath: "http://yui.yahooapis.com/2.7.0/build/resize/resize-min.js",
            requires: ["yui2-utilities"]
        }
    }
}).use("dd", "resize", function(Y) {
    // 共用变量
    var page, content, pageWidth, ROW_TMPL, COL_SUB_TMPL, COL_EXTRA_TMPL,
        GRIDS_N = 24,
        UNIT_COL = 40,
        UNIT_GUTTER = 10,
        LAYOUT = "layout",
        GRID = "grid",
        DEFAULT_COL1 = LAYOUT + " " + GRID,
        DEFAULT_COL2 = LAYOUT + " " + GRID + "-m0s5",
        CLS_LAYOUT = "." + LAYOUT,
        HIDDEN = "hidden",
        FLOAT_RIGHT = "float-right",
        DD_PROXY = "dd-proxy",
        CLS_MAIN_WRAP = ".main-wrap",
        CLS_COL_SUB = ".col-sub",
        CLS_COL_EXTRA = ".col-extra",
        CLS_ADD_COL = ".add-col",
        CLS_DEL_COL = ".del-col",
        CLS_COL_STRIP = ".col-strip",
        CLS_COL_WIDTH = ".col-width",
        CLS_DD_HANDLE = ".dd-handle",
        CLS_TOOL_BOX = ".tool-box";

    var BigBang = {
        /**
         * 初始化
         */
        init: function() {
            var self = this;
            page = Y.get("#page");
            content = Y.get("#content");

            // 1. 切换页面宽度
            pageWidth = Y.get("#page-width");
            pageWidth.on("change", function() {
                self.switchPageWidth(this.get("value"));
            });

            // 2. 添加行，添加列，删除行，删除列
            ROW_TMPL  = Y.get("#row-tmpl").get("innerHTML");
            COL_SUB_TMPL = Y.get("#col-sub-tmpl").get("innerHTML");
            COL_EXTRA_TMPL = Y.get("#col-extra-tmpl").get("innerHTML");
            content.delegate("click", function(e) {
                var button = e.currentTarget;

                if(button.getAttribute("id") === "add-row") {
                    self.insertRow(Y.Node.getDOMNode(button.ancestor()));

                } else if(button.hasClass("del-row")) {
                    self.removeRow(button.ancestor(".layout"));

                } else if(button.hasClass("add-col")) {
                    self.insertCol(button);

                } else if(button.hasClass("del-col")) {
                    self.removeCol(button);
                }
            }, "span");

            // 3. onresize
            Y.on("resize", function() {
                if(pageWidth.get("value") === "auto") {
                    self._updateAllColMainWidth();
                }
            }, window);
        },

        /**
         * 初始化 col
         */
        initCol: function(col) {
            this._initDD(col);
            this._initResize(col);
        },

        /**
         * 初始化拖放
         */
        _initDD: function(col) {
            var drag = new Y.DD.Drag({
                node: col.query(CLS_TOOL_BOX),
                handles: [CLS_DD_HANDLE]
            });

            var layout = col.ancestor(CLS_LAYOUT),
                layoutType,
                gridCls,
                newGridCls,
                mCol = layout.query(CLS_MAIN_WRAP),
                sCol = layout.query(CLS_COL_SUB),
                eCol,
                sN,
                eN,
                mHalf, // main-wrap 元素的半宽
                sHalf, // col-sub 元素的半宽
                eHalf, // col-extra 元素的半宽
                pHalf, // proxy 元素的半宽
                mX, // main-wrap 中轴线的 X 坐标值
                sX, // col-sub 中轴线的 X 坐标值
                eX, // col-extra 中轴线的 X 坐标值
                pX, // proxy 中轴线的 X 坐标值
                p,  // proxy node
                self = this;

            drag.on("drag:start", function() {
                p = this.get("dragNode");

                // 调整样式
                p.addClass(DD_PROXY);
                col.setStyle("zIndex", "99");

                // 获取初始值
                // 注：当添加删除列后，下面这些值都会更新，因此放在 drag:start
                layoutType = self._getLayoutType(layout);
                gridCls = self._getGridCls(layout);
                eCol = layout.query(CLS_COL_EXTRA);
                sN = parseInt(gridCls.replace(/^.+s(\d).*$/, "$1"));
                eN = parseInt(gridCls.replace(/^.+e(\d).*$/, "$1"));
                sHalf = (sN * UNIT_COL - UNIT_GUTTER) / 2;
                eHalf = (eN * UNIT_COL - UNIT_GUTTER) / 2;
                mHalf = parseInt(mCol.getComputedStyle("width")) / 2;
                pHalf = parseInt(p.getComputedStyle("width")) / 2;
                mX = mCol.getX() + mHalf;
                sX = sCol.getX() + sHalf;
                if(eCol) eX = eCol.getX() + eHalf;
            });

            drag.on("drag:drag", function(e) {
                var args;

                // 得到当前坐标
                pX = e.pageX + pHalf;

                if (layoutType === 2) { // 两栏
                    args = [[mX], [pX, sN], null];

                } else if(layoutType === 3) { // 三栏
                    if(col.hasClass(CLS_COL_SUB.slice(1))) { // 拖动的是 col-sub
                        args = [[mX], [pX, sN], [eX, eN]];

                    } else { // 拖动的是 col-extra
                        args = [[mX], [sX, sN], [pX, eN]];
                    }
                }

                //console.log(args);
                newGridCls = self._getGridClsByPosition(args[0], args[1], args[2]);
                //console.log("newGridCls = " + newGridCls);
                if (newGridCls && newGridCls != gridCls) {
                    layout.replaceClass(gridCls, newGridCls);

                    // 下面这些值需要动态更新，否则接下来的判断不对
                    gridCls = newGridCls;
                    mX = mCol.getX() + mHalf;
                    sX = sCol.getX() + sHalf;
                    if(eCol) eX = eCol.getX() + eHalf;

                    // 更新拖拉标志的位置
                    self._updateResizeFlag(layoutType, gridCls, sCol, eCol);
                }
            });

            drag.on("drag:end", function() {
                // 还原样式
                p.removeClass(DD_PROXY);
                p.removeAttribute("style");
                col.setStyle("zIndex", "");
            });
        },

        /**
         * 初始化 Resize
         */
        _initResize: function(col) {
            var resize = new YAHOO.util.Resize(Y.Node.getDOMNode(col),
                    {
                        handles: ["r", "l"],
                        proxy: true,
                        setSize: false
                    });

            var proxy = Y.get(resize.getProxyEl()),
                layout = col.ancestor(CLS_LAYOUT),
                colLeft = col.getX(),
                colWidth = parseInt(col.getComputedStyle("width")),
                activeHandle;

            resize.on('startResize', function() {
                activeHandle = Y.get(this.getActiveHandleEl());
            });

            resize.on('proxyResize', function(e) {
                if(activeHandle.hasClass('yui-resize-handle-l')) {
                    proxy.setStyles({
                        left:  (colLeft - (e.width - colWidth)) + "px"
                    });
                }
            });

            /* nothing to do
            resize.on('resize', function(e) {

            });*/

            resize.on('endResize', function(e) {
                col.removeAttribute("style"); // 消除拉伸时设置的样式

                
            });

        },

        /**
         * 切换页面宽度
         */
        switchPageWidth: function(type) {
            switch (type) {
                case "950":
                case "750":
                    page.setAttribute("class", "w" + type);
                    content.removeAttribute("class");
                    break;
                case "auto":
                    page.removeAttribute("class");
                    content.removeAttribute("class");
                    break;
                case "hamburger":
                    page.removeAttribute("class");
                    content.setAttribute("class", "w950");
                    break;
            }

            this._updateAllColMainWidth();
        },

        /**
         * 根据 gridCls 直接插入一行栅格布局
         */
        insertLayout: function() {
            // TODO
        },

        /**
         * 插入行
         */
        insertRow: function(where) {
            var row = content.create(ROW_TMPL);
            content.insert(row, where);
            this._updateColMainWidth(row);
        },

        /**
         * 删除行
         */
        removeRow: function(row) {
            row.remove();
        },

        /**
         * 插入列
         */
        insertCol: function(pos) {
            var layout = pos.ancestor(CLS_LAYOUT),
                layoutType = this._getLayoutType(layout),
                gridCls, newGridCls, col, needSyncUI = true;

            if (layoutType === 1) { // 通栏
                layout.setAttribute("class", DEFAULT_COL2);

                col = layout.create(COL_SUB_TMPL);
                layout.append(col);
                this.initCol(col);

            } else if(layoutType === 2) { // 两栏
                gridCls = this._getGridCls(layout);
                newGridCls = gridCls.replace(/^(.+)m0(.*)$/, "$1m0e6$2");
                layout.replaceClass(gridCls, newGridCls);

                col = layout.create(COL_EXTRA_TMPL);
                layout.append(col);
                this.initCol(col);

            } else {
                needSyncUI = false;
            }

            if(needSyncUI) this._syncUI(layout);
        },

        /**
         * 删除列
         */
        removeCol: function(pos) {
            var layout = pos.ancestor(CLS_LAYOUT),
                layoutType = this._getLayoutType(layout),
                gridCls, newGridCls, needSyncUI = true;

            if (layoutType === 2) { // 两栏
                layout.query(CLS_COL_SUB).remove();
                layout.setAttribute("class", DEFAULT_COL1);

            } else if(layoutType === 3) { // 三栏
                layout.query(CLS_COL_EXTRA).remove();

                gridCls = this._getGridCls(layout);
                newGridCls = gridCls.replace(/^(.+)e\d(.*)$/, "$1$2");
                layout.replaceClass(gridCls, newGridCls);

            } else {
                needSyncUI = false;
            }

            if(needSyncUI) this._syncUI(layout);
        },

        /**
         * 更新栏宽，按钮状态等 UI 信息
         */
        _syncUI: function(layout) {
            // 为了减少耦合，下面仅根据 gridCls 更新 UI
            // 这样会导致某些情况下的无谓更新，但总体来说，这样做能减少复杂度，是值得的
            var gridCls = this._getGridCls(layout),
                layoutType = this._getLayoutType(layout),
                sCol = layout.query(CLS_COL_SUB),
                eCol = layout.query(CLS_COL_EXTRA),
                sN = gridCls.replace(/^grid-.*s(\d).*$/, "$1") >> 0, eN = 0, mN = 0;

            if(layoutType === 3) eN = gridCls.replace(/^grid-.*e(\d).*$/, "$1") >> 0;
            mN = GRIDS_N - sN - eN;

            // 更新栏宽
            if(mN) { this._updateColMainWidth(layout); }
            if(sN) { this._updateColWidth(layout.query(CLS_COL_SUB), sN); }
            if(eN) { this._updateColWidth(layout.query(CLS_COL_EXTRA), eN); }

            // 三栏时，1. 隐藏“添加列” 2. 隐藏 col-sub 的“删除”
            if(layoutType === 3) {
                layout.query(CLS_ADD_COL).addClass(HIDDEN);
                sCol.query(CLS_DEL_COL).addClass(HIDDEN);
            } else
            // 两栏时，1. 显示“添加列” 2. 显示 col-sub 的“删除”
            if(layoutType === 2) {
                layout.query(CLS_ADD_COL).removeClass(HIDDEN);
                sCol.query(CLS_DEL_COL).removeClass(HIDDEN);
            }

            // 更新拖拉标志的位置
            this._updateResizeFlag(layoutType, gridCls, sCol, eCol);
        },

        /**
         * 更新列宽
         */
        _updateColWidth: function(col, val) {
            val = Y.Lang.isNumber(val) ? val * UNIT_COL - UNIT_GUTTER + "px" : val;
            col.query(CLS_COL_WIDTH).setContent(val);
        },

        /**
         * 更新 col-main 的列宽
         */
        _updateColMainWidth: function(layout) {
            var mainWrap = layout.query(CLS_MAIN_WRAP);
            this._updateColWidth(mainWrap, Y.DOM.getComputedStyle(Y.Node.getDOMNode(mainWrap), "width"));
        },

        /**
         * 更新所有 col-main 的列宽
         */
        _updateAllColMainWidth: function() {
            var self = this;
            Y.all(CLS_LAYOUT).each(function(layout) {
                self._updateColMainWidth(layout);
            });
        },

        /**
         * 更新 resize 标志符
         */
        _updateResizeFlag: function(layoutType, gridCls, sCol, eCol) {
            if(layoutType > 1) {
                if(/^.+s\d.*m0.*$/.test(gridCls)) { // col-sub 在 col-main 左边
                    //sCol.query(CLS_COL_STRIP).addClass(FLOAT_RIGHT);
                    sCol.addClass(FLOAT_RIGHT); // for YUI 2 Resize
                } else {
                    //sCol.query(CLS_COL_STRIP).removeClass(FLOAT_RIGHT);
                    sCol.removeClass(FLOAT_RIGHT); // for YUI 2 Resize
                }

                if (layoutType > 2) {
                    if (/^.+e\d.*m0.*$/.test(gridCls)) { // col-extra 在 col-main 左边
                        //eCol.query(CLS_COL_STRIP).addClass(FLOAT_RIGHT);
                        eCol.addClass(FLOAT_RIGHT); // for YUI 2 Resize
                    } else {
                        //eCol.query(CLS_COL_STRIP).removeClass(FLOAT_RIGHT);
                        eCol.removeClass(FLOAT_RIGHT); // for YUI 2 Resize
                    }
                }
            }
        },

        /**
         * 获取布局类型
         * @return 1 - 通栏, 2 - 两栏, 3 - 三栏, 0 - 其它情况
         */
        _getLayoutType: function(layout) {
            if(layout.hasClass(GRID)) return 1;

            var gridCls = this._getGridCls(layout);
            if(gridCls.indexOf("e") != -1) return 3;
            if(gridCls.indexOf("s" != -1)) return 2;

            return 0;
        },

        /**
         * 获取 layout 的 grid 类名
         */
        _getGridCls: function(layout) {
            return layout.getAttribute("class").replace(/^.*(grid-\S+).*$/, "$1");
        },

        /**
         * 根据中轴线的位置得到对应的 gridCls
         * @param m [mX]
         * @param s [sX, sN]
         * @param e [eX, eN]
         */
        _getGridClsByPosition: function(m, s, e) {
            if(m[0] == s[0]) return "";
            if(e && (m[0] == e[0] || s[0] == e[0])) return "";

            var cls = "grid-";
            if(!e) { // 两栏
                cls += m[0] < s[0] ? "m0" + "s" + s[1] : "s" + s[1] + "m0";

            } else { // 三栏
                if(     m[0] < s[0] && s[0] < e[0]) cls += "m0s" + s[1] + "e" + e[1];
                else if(m[0] < e[0] && e[0] < s[0]) cls += "m0e" + e[1] + "s" + s[1];
                else if(s[0] < m[0] && m[0] < e[0]) cls += "s" + s[1] + "m0e" + e[1];
                else if(s[0] < e[0] && e[0] < m[0]) cls += "s" + s[1] + "e" + e[1] + "m0";
                else if(e[0] < s[0] && s[0] < m[0]) cls += "e" + e[1] + "s" + s[1] + "m0";
                else if(e[0] < m[0] && m[0] < s[0]) cls += "e" + e[1] + "m0s" + s[1];

            }

            return cls;
        }
    };

    Y.on("domready", function() { BigBang.init(); });
});