/**
 * Grids BigBang Script by lifesinger@gmail.com
 */

YUI({
    /*base: "http://t-yubo/assets/yui/3.0.0/build/",*/
    debug: false,
    /*filter: 'debug',*/
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
    // 共用变量和常量
    var page, content, pageWidth, ROW_TMPL, COL_SUB_TMPL, COL_EXTRA_TMPL,
        GRIDS_N = 24,
        UNIT_COL = 40,
        UNIT_GUTTER = 10,
        COL_MIN_N = 4,
        COL_MIN_WIDTH = UNIT_COL * COL_MIN_N - UNIT_GUTTER,
        COL_SUB_DEFAULT_N = 5, // col-sub 的默认宽度
        COL_EXTRA_DEFAULT_N = 6, // col-extra 的默认宽度
        LAYOUT = "layout",
        GRID = "grid",
        DEFAULT_COL1 = LAYOUT + " " + GRID + "-m",
        DEFAULT_COL2 = LAYOUT + " " + GRID + "-m0s" + COL_SUB_DEFAULT_N,
        RE_SCOL_N = /^.+s(\d+).*$/,
        RE_ECOL_N = /^.+e(\d+).*$/,
        HIDDEN = "hidden",
        FLOAT_RIGHT = "float-right",
        DD_PROXY = "dd-proxy",
        CLS_LAYOUT = "." + LAYOUT,
        CLS_ONE_COL = "." + GRID + "-m",
        CLS_MAIN_WRAP = ".main-wrap",
        CLS_COL_SUB = ".col-sub",
        CLS_COL_EXTRA = ".col-extra",
        CLS_ADD_COL = ".add-col",
        CLS_DEL_COL = ".del-col",
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

            // 3. window onresize
            Y.on("resize", function() {
                if(pageWidth.get("value") === "auto") {
                    self._updateAllColMainWidth();
                }
            }, window);

            // 4. 生成 HTML 代码
            Y.on("click", function() {
                self.generateHTMLCode();
            }, "#build-code");

            // 5. 生成分享链接
            Y.on("click", function() {
                self.generateShareLink();
            }, "#share-link");
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
                sN = parseInt(gridCls.replace(RE_SCOL_N, "$1"));
                eN = parseInt(gridCls.replace(RE_ECOL_N, "$1"));
                sHalf = self._getWidthByN(sN) / 2;
                eHalf = self._getWidthByN(eN) / 2;
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

            var layout = col.ancestor(CLS_LAYOUT),
                layoutWidth,
                gridCls,
                newGridCls,
                proxy = Y.get(resize.getProxyEl()),
                activeHandle,
                handleAtLeft = true,
                sWidth,
                eWidth,
                activeColCls = col.hasClass(CLS_COL_SUB.slice(1)) ? CLS_COL_SUB : CLS_COL_EXTRA,
                colLeft,
                colWidth,
                activeN,
                self = this;

            resize.on('startResize', function() {
                activeHandle = Y.get(this.getActiveHandleEl());
                handleAtLeft = activeHandle.hasClass('yui-resize-handle-l');

                // 下面这些值，在resize注册后，有可能因拖动而改变
                gridCls = self._getGridCls(layout);
                sWidth = self._getWidthByN(parseInt(gridCls.replace(RE_SCOL_N, "$1")));
                eWidth = self._getWidthByN(parseInt(gridCls.replace(RE_ECOL_N, "$1")));

                // 下面这些值，在窗口拉伸和切换页面宽度等情形下，有可能会改变，因此放在 resize start 中获取
                layoutWidth = parseInt(layout.getComputedStyle("width"));
                colLeft = col.getX();
                colWidth = parseInt(col.getComputedStyle("width")); // 可能已经 resize 过
            });

            resize.on('proxyResize', function(e) {
                if(handleAtLeft) {
                    proxy.setStyles({
                        left: (colLeft - (e.width - colWidth)) + "px"
                    });
                }

                // 动态显示宽度
                self._updateColWidth(col, self._getGridWidth(e.width) + "px");
            });

            resize.on('endResize', function(e) {
                // 消除拉伸时设置的样式
                col.removeAttribute("style");

                // 获取当前拉动的 col 宽度
                if(activeColCls === CLS_COL_SUB) {
                    sWidth = self._getWidthByN(self._getNByWidth(e.width));
                } else {
                    eWidth = self._getWidthByN(self._getNByWidth(e.width));
                }

                // 调整宽度符合栅格
                activeN = self._calcActiveColWidth(layoutWidth, activeColCls, sWidth, eWidth);
                //console.log("activeN = " + activeN);

                // 获取新的 gridCls
                newGridCls = self._adjustGridClsByWidth(gridCls, activeColCls, activeN);
                //console.log("newGridCls = " + newGridCls);

                if (newGridCls && newGridCls != gridCls) {
                    layout.replaceClass(gridCls, newGridCls);
                    gridCls = newGridCls;

                    // 更新列宽
                    self._updateColMainWidth(layout);
                }
                
                // 有可能拉伸到小于最小宽度，这时没有引发 gridCls 变化，但依旧需要更新列宽
                self._updateColWidth(col, self._getWidthByN(activeN) + "px");
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
         * 插入行
         */
        insertRow: function(where) {
            var row = content.create(ROW_TMPL);
            content.insert(row, where);
            this._updateColMainWidth(row);
            return row;
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
                newGridCls = gridCls.replace(/^(.+)m0(.*)$/, "$1m0e" + COL_EXTRA_DEFAULT_N + "$2");
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
                newGridCls = gridCls.replace(/^(.+)e\d+(.*)$/, "$1$2");
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
                sN = gridCls.replace(RE_SCOL_N, "$1") >> 0, eN = 0, mN = 0;

            if(layoutType === 3) eN = gridCls.replace(RE_ECOL_N, "$1") >> 0;
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
            val = Y.Lang.isNumber(val) ? this._getWidthByN(val) + "px" : val;
            col.query(CLS_COL_WIDTH).setContent(val);
        },

        /**
         * 更新 col-main 的列宽
         */
        _updateColMainWidth: function(layout) {
            var mainWrap = layout.query(CLS_MAIN_WRAP),
                mainWidth = parseInt(mainWrap.getComputedStyle("width"));
            this._updateColWidth(mainWrap, mainWidth + "px");

            this._updateAddColButton(layout, mainWidth);
        },

        /**
         * 更新“添加列”按钮的显示状态
         */
        _updateAddColButton: function(layout, mainWidth) {
            // 当宽度小于一定值时，已经不能添加 col-extra 了，需要隐藏添加按钮
            if(mainWidth < this._getWidthByN(COL_MIN_N + COL_EXTRA_DEFAULT_N)) {
                layout.query(CLS_ADD_COL).addClass(HIDDEN);

            } else if(!layout.query(CLS_COL_EXTRA)) { // 不是三栏
                layout.query(CLS_ADD_COL).removeClass(HIDDEN);
            }
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
                if(/^.+s\d+.*m0.*$/.test(gridCls)) { // col-sub 在 col-main 左边
                    sCol.addClass(FLOAT_RIGHT); // for YUI 2 Resize
                } else {
                    sCol.removeClass(FLOAT_RIGHT); // for YUI 2 Resize
                }

                if (layoutType > 2) {
                    if (/^.+e\d+.*m0.*$/.test(gridCls)) { // col-extra 在 col-main 左边
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
         * @return {number} layoutType 1 - 通栏, 2 - 两栏, 3 - 三栏, 0 - 其它情况
         */
        _getLayoutType: function(layout) {
            if(layout.hasClass(CLS_ONE_COL.slice(1))) return 1;

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
        },

        /**
         * 调整正在 resize 的 col 的宽度为允许值
         * @return {number} activeN
         */
        _calcActiveColWidth: function(layoutWidth, activeColCls, sWidth, eWidth) {
            eWidth = eWidth >> 0;
            var sN = this._getNByWidth(sWidth),
                eN = this._getNByWidth(eWidth),
                activeN, mWidth;

            // 不能小于最小宽度
            if(sN < COL_MIN_N) {
                sN = COL_MIN_N;
                sWidth = COL_MIN_WIDTH;
            }
            if(eN < COL_MIN_N) {
                eN = COL_MIN_N;
                eWidth = COL_MIN_WIDTH;
            }

            // 也不能太宽，使得 main-wrap 的宽度小于最小宽度
            activeN = (activeColCls === CLS_COL_SUB) ? sN : eN;
            mWidth = layoutWidth - sWidth - eWidth;
            while (mWidth < COL_MIN_WIDTH) {
                activeN--;
                mWidth += UNIT_COL;
            }
            return activeN;
        },

        /**
         * 根据宽度值调整 gridCls
         */
        _adjustGridClsByWidth: function(gridCls, activeColCls, activeN) {
            var colFlag = activeColCls === CLS_COL_SUB ? "s" : "e",
                re = new RegExp("^(.+" + colFlag + ")(\\d+)(.*)$");

            return gridCls.replace(re, function(s, m1, m2, m3) {
                return m1 + activeN + m3;
            });
        },

        _getWidthByN: function(n) {
            return n * UNIT_COL - UNIT_GUTTER;
        },

        _getNByWidth: function(width) {
            width = width >> 0;
            return Math.floor((width + UNIT_GUTTER) / UNIT_COL);
        },

        _getGridWidth: function(width) {
            return this._getWidthByN(this._getNByWidth(width));
        },

        /**
         * 根据 gridCls 直接插入一行栅格布局
         * @param {string|Array} gridFlags 例如："m0s5" 或 ["s5m0e6", "m0s6", "m"]
         */
        insertLayout: function(gridFlags) {
            if(Y.Lang.isString(gridFlags)) gridFlags = [gridFlags];
            var self = this, row,
                defaultCls = CLS_ONE_COL.slice(1),
                newCls,
                insertPos = Y.Node.getDOMNode(Y.get("#add-row").get("parentNode"));

            Y.each(gridFlags, function(flag) {
                if(!self.checkGridFlagIsValid(flag)) return;
                newCls = GRID + "-" + flag;

                row = self.insertRow(insertPos);
                if(newCls != defaultCls) {
                    row.replaceClass(defaultCls, newCls);
                }

                if(flag.indexOf("s") != -1) { // col-sub
                    row.append(COL_SUB_TMPL);
                    self.initCol(row.query(CLS_COL_SUB));
                }
                if(flag.indexOf("e") != -1) { // col-extra
                    row.append(COL_EXTRA_TMPL);
                    self.initCol(row.query(CLS_COL_EXTRA));
                }

                // 更新 UI 信息
                self._syncUI(row);
            });
        },

        /**
         * 检查 flag 是否符合栅格标记
         */
        checkGridFlagIsValid: function(flag) {
            if(!flag) return false;

            // 1. 通栏
            if(flag === "m") return true;

            // 2. 两栏
            if(/^m0s\d{1,2}|s\d{1,2}m0$/.test(flag)) return true;

            // 3. 三栏
            var m = flag.match(/[m|s|e]\d{1,2}/g);

            // 无匹配或总匹配数不为3
            if(!m || m.length != 3) return false;

            // 含有非 [m|s|e]\d{1,2} 字符
            if(flag != m.join("")) return false;

            // 含有 mm, ss, ee
            if(m[0].charAt(0) == m[1].charAt(0)) return false;
            if(m[0].charAt(0) == m[2].charAt(0)) return false;
            return m[1].charAt(0) != m[2].charAt(0);
        },

        /**
         * 从 location.hash 解析出默认布局
         * @param {string} hash 格式为 s5m0e6-m0s6-m
         */
        parseHash: function(hash) {
            if(hash) {
                this.insertLayout(hash.split("-"));
            }
        },

        /**
         * 生成 HTML 代码
         */
        generateHTMLCode: function() {
            // TODO
            alert("莫急莫急，尚未实现。");
        },

        /**
         * 生成分享链接
         */
        generateShareLink: function() {
            var hash = [], cls;

            Y.each(content.queryAll(CLS_LAYOUT), function(layout) {
                cls = layout.getAttribute("class");
                hash.push(cls.replace(/^.*grid-(.+).*$/i, "$1"));
            });

            location.replace("#" + hash.join("-"));
        }
    };

    Y.on("domready", function() {
        BigBang.init();

        // 隐藏 loading
        Y.get("#page-loading").addClass("hidden");

        // 从 hash 里获取布局数据
        if(location.hash) {
            BigBang.parseHash(location.hash.slice(1));

        } else {
            // 添加默认布局
            BigBang.insertLayout(["s5m0e6", "m0s6", "m"]);
        }

        // 显示操作按钮
        Y.get("#page-width").removeClass("hidden");
        Y.get("#add-row").removeClass("hidden");
        Y.get("#bottom-operations").removeClass("hidden");
    });
});
