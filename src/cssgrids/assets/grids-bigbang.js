/**
 * Grids BigBang Script by lifesinger@gmail.com
 */

YUI().use("dd", function(Y) {
    // 共用变量
    var page, content, ROW_TMPL, COL_SUB_TMPL, COL_EXTRA_TMPL,
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
        CLS_COL_MAIN = ".col-main",
        CLS_COL_SUB = ".col-sub",
        CLS_COL_EXTRA = ".col-extra",
        CLS_ADD_COL = ".add-col",
        CLS_DEL_COL = ".del-col",
        CLS_COL_STRIP = ".col-strip";

    var BigBang = {
        /**
         * 初始化
         */
        init: function() {
            var self = this;
            page = Y.get("#page");
            content = Y.get("#content");

            // 切换页面宽度
            Y.on("change", function() {
                self.switchPageWidth(this.get("value"));
            }, "#page-width");

            // 添加行，添加列，删除行，删除列
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
        },

        /**
         * 插入行
         */
        insertRow: function(where) {
            content.insert(ROW_TMPL, where);
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
                gridCls, newGridCls, needSyncUI = true;

            if (layoutType === 1) { // 通栏
                layout.setAttribute("class", DEFAULT_COL2);
                layout.append(COL_SUB_TMPL);

            } else if(layoutType === 2) { // 两栏
                gridCls = this._getGridClass(layout);
                newGridCls = gridCls.replace(/^(.+)m0(.*)$/, "$1m0e6$2");
                layout.replaceClass(gridCls, newGridCls);

                layout.append(COL_EXTRA_TMPL);

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

                gridCls = this._getGridClass(layout);
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
            var gridCls = this._getGridClass(layout),
                type = this._getLayoutType(layout),
                colSub = layout.query(CLS_COL_SUB),
                colExtra = layout.query(CLS_COL_EXTRA),
                sN = gridCls.replace(/^grid-.*s(\d).*$/, "$1") >> 0, eN = 0, mN = 0;

            if(type === 3) eN = gridCls.replace(/^grid-.*e(\d).*$/, "$1") >> 0;
            mN = GRIDS_N - sN - eN;

            // 更新栏宽
            if(mN) { this._updateColWidth(layout.query(CLS_COL_MAIN), mN); }
            if(sN) { this._updateColWidth(layout.query(CLS_COL_SUB), sN); }
            if(eN) { this._updateColWidth(layout.query(CLS_COL_EXTRA), eN); }

            // 三栏时，1. 隐藏“添加列” 2. 隐藏 col-sub 的“删除”
            if(type === 3) {
                layout.query(CLS_ADD_COL).addClass(HIDDEN);
                colSub.query(CLS_DEL_COL).addClass(HIDDEN);
            } else
            // 两栏时，1. 显示“添加列” 2. 显示 col-sub 的“删除”
            if(type === 2) {
                layout.query(CLS_ADD_COL).removeClass(HIDDEN);
                colSub.query(CLS_DEL_COL).removeClass(HIDDEN);
            }

            // 更新拖拉标志的位置
            if(type > 1) {
                if(/^grid-s\d.+$/.test(gridCls)) { // col-sub 在最左边
                    colSub.query(CLS_COL_STRIP).addClass(FLOAT_RIGHT);
                } else {
                    colSub.query(CLS_COL_STRIP).removeClass(FLOAT_RIGHT);
                }

                if (type > 2) {
                    if (/^grid-e\d.+$/.test(gridCls)) { // col-extra 在最左边
                        colExtra.query(CLS_COL_STRIP).addClass(FLOAT_RIGHT);
                    } else {
                        colExtra.query(CLS_COL_STRIP).removeClass(FLOAT_RIGHT);
                    }
                }
            }
        },

        /**
         * 更新列宽
         */
        _updateColWidth: function(col, n) {
            col.query(".col-width").setContent(n * UNIT_COL - UNIT_GUTTER + "px");
        },

        /**
         * 获取布局类型
         * @private
         * @return 1 - 通栏, 2 - 两栏, 3 - 三栏, 0 - 其它情况
         */
        _getLayoutType: function(layout) {
            if(layout.hasClass(GRID)) return 1;

            var gridCls = this._getGridClass(layout);
            if(gridCls.indexOf("e") != -1) return 3;
            if(gridCls.indexOf("s" != -1)) return 2;

            return 0;
        },

        /**
         * 获取 layout 的 grid 类名
         * @private
         */
        _getGridClass: function(layout) {
            return layout.getAttribute("class").replace(/^.*(grid-\S+).*$/, "$1");
        }
    };

    Y.on("domready", function() { BigBang.init(); });
});