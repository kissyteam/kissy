/*
Copyright (c) 2009, Kissy UI Library. All rights reserved.
http://kissy.googlecode.com/

Build: 47  Date: 2009-07-30 23:23:23
*/
/**
 * KISSY.Suggest 提示补全组件
 *
 * suggest.js
 * requires: yahoo-dom-event
 *
 * @author lifesinger@gmail.com
 */

if(typeof KISSY === "undefined" || !KISSY) {
    KISSY = {};
}

(function(NS) {
    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        head = document.getElementsByTagName("head")[0],
        ie = YAHOO.env.ua.ie, ie6 = (ie === 6),
        CALLBACK_STR = "KISSY.Suggest.callback", // 注意 KISSY 在这里是写死的
        STYLE_ID = "suggest-style", // 样式 style 元素的 id
        BEFORE_DATA_REQUEST = "beforeDataRequest",
        ON_DATA_RETURN = "onDataReturn",
        BEFORE_SHOW = "beforeShow",
        ON_ITEM_SELECT = "onItemSelect",

        /**
         * Suggest的默认配置
         */
        defaultConfig = {
        /**
         * 悬浮提示层的class
         * 提示层的默认结构如下：
         * <div class="suggest-container">
         *     <ol>
         *         <li>
         *             <span class="suggest-key">...</span>
         *             <span class="suggest-result">...</span>
         *         </li>
         *     </ol>
         *     <div class="suggest-bottom">
         *         <a class="suggest-close-btn">...</a>
         *     </div>
         * </div>
         * @type String
         */
        containerClassName: "suggest-container",

        /**
         * 提示层的宽度
         * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
         * 示范取值："200px", "10%"等，必须带单位
         * @type String
         */
        containerWidth: "auto",

        /**
         * 提示层中，key元素的class
         * @type String
         */
        keyElClassName: "suggest-key",

        /**
         * 提示层中，result元素的class
         * @type String
         */
        resultElClassName: "suggest-result",

        /**
         * result的格式
         * @type String
         */
        resultFormat: "约%result%条结果",

        /**
         * 提示层中，选中项的class
         * @type String
         */
        selectedItemClassName: "selected",

        /**
         * 提示层底部的class
         * @type String
         */
        bottomClassName: "suggest-bottom",

        /**
         * 是否显示关闭按钮
         * @type Boolean
         */
        showCloseBtn: false,

        /**
         * 关闭按钮上的文字
         * @type String
         */
        closeBtnText: "关闭",

        /**
         * 关闭按钮的class
         * @type String
         */
        closeBtnClassName: "suggest-close-btn",

        /**
         * 是否需要iframe shim
         * @type Boolean
         */
        useShim: ie6,

        /**
         * iframe shim的class
         * @type String
         */
        shimClassName: "suggest-shim",

        /**
         * 定时器的延时
         * @type Number
         */
        timerDelay: 200,

        /**
         * 初始化后，自动激活
         * @type Boolean
         */
        autoFocus: false,

        /**
         * 鼠标点击完成选择时，是否自动提交表单
         * @type Boolean
         */
        submitFormOnClickSelect: true
    };

    /**
     * 提示补全组件
     * @class Suggest
     * @requires YAHOO.util.Dom
     * @requires YAHOO.util.Event
     * @constructor
     * @param {String|HTMLElement} textInput
     * @param {String} dataSource
     * @param {Object} config
     */
    NS.Suggest = function(textInput, dataSource, config) {
        /**
         * 文本输入框
         * @type HTMLElement
         */
        this.textInput = Dom.get(textInput);

        /**
         * 获取数据的URL 或 JSON格式的静态数据
         * @type {String|Object}
         */
        this.dataSource = dataSource;

        /**
         * JSON静态数据源
         * @type Object 格式为 {"query1" : [["key1", "result1"], []], "query2" : [[], []]}
         */
        this.JSONDataSource = Lang.isObject(dataSource) ? dataSource : null;

        /**
         * 通过jsonp返回的数据
         * @type Object
         */
        this.returnedData = null;

        /**
         * 配置参数
         * @type Object
         */
        this.config = Lang.merge(defaultConfig, config || {});

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        this.container = null;

        /**
         * 输入框的值
         * @type String
         */
        this.query = "";

        /**
         * 获取数据时的参数
         * @type String
         */
        this.queryParams = "";

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        this._timer = null;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        this._isRunning = false;

        /**
         * 获取数据的script元素
         * @type HTMLElement
         */
        this.dataScript = null;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        this._dataCache = {};

        /**
         * 最新script的时间戳
         * @type String
         */
        this._latestScriptTime = "";

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        this._scriptDataIsOut = false;

        /**
         * 是否处于键盘选择状态
         * @private
         * @type Boolean
         */
        this._onKeyboardSelecting = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        this.selectedItem = null;

        // init
        this._init();
    };

    NS.Suggest.prototype = {
        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            // init DOM
            this._initTextInput();
            this._initContainer();
            if (this.config.useShim) this._initShim();
            this._initStyle();

            // create events
            this.createEvent(BEFORE_DATA_REQUEST);
            this.createEvent(ON_DATA_RETURN);
            this.createEvent(BEFORE_SHOW);
            this.createEvent(ON_ITEM_SELECT);

            // window resize event
            this._initResizeEvent();
        },

        /**
         * 初始化输入框
         * @protected
         */
        _initTextInput: function() {
            var instance = this;

            // turn off autocomplete
            this.textInput.setAttribute("autocomplete", "off");

            // focus
            Event.on(this.textInput, "focus", function() {
                instance.start();
            });

            // blur
            Event.on(this.textInput, "blur", function() {
                instance.stop();
                instance.hide();
            });

            // auto focus
            if (this.config.autoFocus) this.textInput.focus();

            // keydown
            // 注：截至目前，在Opera9.64中，输入法开启时，依旧不会触发任何键盘事件
            var pressingCount = 0; // 持续按住某键时，连续触发的keydown次数。注意Opera只会触发一次。
            Event.on(this.textInput, "keydown", function(ev) {
                var keyCode = ev.charCode || ev.keyCode;
                //console.log("keydown " + keyCode);

                switch (keyCode) {
                    case 27: // ESC键，隐藏提示层并还原初始输入
                        instance.hide();
                        instance.textInput.value = instance.query;
                        break;
                    case 13: // ENTER键
                        // 提交表单前，先隐藏提示层并停止计时器
                        instance.textInput.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                        // 如果是键盘选中某项后回车，触发onItemSelect事件
                        if (instance._onKeyboardSelecting) {
                            if (instance.textInput.value == instance._getSelectedItemKey()) { // 确保值匹配
                                instance.fireEvent(ON_ITEM_SELECT, instance.textInput.value);
                            }
                        }

                        // 提交表单
                        instance._submitForm();

                        break;
                    case 40: // DOWN键
                    case 38: // UP键
                        // 按住键不动时，延时处理
                        if (pressingCount++ == 0) {
                            if (instance._isRunning) instance.stop();
                            instance._onKeyboardSelecting = true;
                            instance.selectItem(keyCode == 40);

                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        break;
                }

                // 非 DOWN/UP 键时，开启计时器
                if (keyCode != 40 && keyCode != 38) {
                    if (!instance._isRunning) {
                        // 1. 当网速较慢，js还未下载完时，用户可能就已经开始输入
                        //    这时，focus事件已经不会触发，需要在keyup里触发定时器
                        // 2. 非DOWN/UP键时，需要激活定时器
                        instance.start();
                    }
                    instance._onKeyboardSelecting = false;
                }
            });

            // reset pressingCount
            Event.on(this.textInput, "keyup", function() {
                //console.log("keyup");
                pressingCount = 0;
            });
        },

        /**
         * 初始化提示层容器
         * @protected
         */
        _initContainer: function() {
            // create
            var container = document.createElement("div");
            container.className = this.config.containerClassName;
            container.style.position = "absolute";
            container.style.visibility = "hidden";
            this.container = container;

            this._setContainerRegion();
            this._initContainerEvent();

            // append
            document.body.insertBefore(container, document.body.firstChild);
        },

        /**
         * 设置容器的left, top, width
         * @protected
         */
        _setContainerRegion: function() {
            var r = Dom.getRegion(this.textInput);
            var left = r.left, w = r.right - left - 2;  // 减去border的2px

            // ie8兼容模式
            // document.documentMode:
            // 5 - Quirks Mode
            // 7 - IE7 Standards
            // 8 - IE8 Standards
            var docMode = document.documentMode;
            if (docMode === 7 && (ie === 7 || ie === 8)) {
                left -= 2;
            } else if (YAHOO.env.ua.gecko) { // firefox下左偏一像素 注：当 input 所在的父级容器有 margin: auto 时会出现
                left++;
            }

            this.container.style.left = left + "px";
            this.container.style.top = r.bottom + "px";

            if (this.config.containerWidth == "auto") {
                this.container.style.width = w + "px";
            } else {
                this.container.style.width = this.config.containerWidth;
            }
        },

        /**
         * 初始化容器事件
         * 子元素都不用设置事件，冒泡到这里统一处理
         * @protected
         */
        _initContainerEvent: function() {
            var instance = this;

            // 鼠标事件
            Event.on(this.container, "mousemove", function(ev) {
                //console.log("mouse move");
                var target = Event.getTarget(ev);

                if (target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                if (Dom.isAncestor(instance.container, target)) {
                    if (target != instance.selectedItem) {
                        // 移除老的
                        instance._removeSelectedItem();
                        // 设置新的
                        instance._setSelectedItem(target);
                    }
                }
            });

            var mouseDownItem = null;
            this.container.onmousedown = function(e) {
                e = e || window.event;
                // 鼠标按下处的item
                mouseDownItem = e.target || e.srcElement;

                // 鼠标按下时，让输入框不会失去焦点
                // 1. for IE
                instance.textInput.onbeforedeactivate = function() {
                    window.event.returnValue = false;
                    instance.textInput.onbeforedeactivate = null;
                };
                // 2. for W3C
                return false;
            };

            // mouseup事件
            Event.on(this.container, "mouseup", function(ev) {
                // 当mousedown在提示层，但mouseup在提示层外时，点击无效
                if (!instance._isInContainer(Event.getXY(ev))) return;
                var target = Event.getTarget(ev);
                // 在提示层A项处按下鼠标，移动到B处释放，不触发onItemSelect
                if (target != mouseDownItem) return;

                // 点击在关闭按钮上
                if (target.className == instance.config.closeBtnClassName) {
                    instance.hide();
                    return;
                }

                // 可能点击在li的子元素上
                if (target.nodeName != "LI") {
                    target = Dom.getAncestorByTagName(target, "li");
                }
                // 必须点击在container内部的li上
                if (Dom.isAncestor(instance.container, target)) {
                    instance._updateInputFromSelectItem(target);

                    // 触发选中事件
                    //console.log("on item select");
                    instance.fireEvent(ON_ITEM_SELECT, instance.textInput.value);

                    // 提交表单前，先隐藏提示层并停止计时器
                    instance.textInput.blur();

                    // 提交表单
                    instance._submitForm();
                }
            });
        },

        /**
         * click选择 or enter后，提交表单
         */
        _submitForm: function() {
            // 注：对于键盘控制enter选择的情况，由html自身决定是否提交。否则会导致输入法开启时，用enter选择英文时也触发提交
            if (this.config.submitFormOnClickSelect) {
                var form = this.textInput.form;
                if (!form) return;

                // 通过js提交表单时，不会触发onsubmit事件
                // 需要js自己触发
                if (document.createEvent) { // ie
                    var evObj = document.createEvent("MouseEvents");
                    evObj.initEvent("submit", true, false);
                    form.dispatchEvent(evObj);
                }
                else if (document.createEventObject) { // w3c
                    form.fireEvent("onsubmit");
                }

                form.submit();
            }
        },

        /**
         * 判断p是否在提示层内
         * @param {Array} p [x, y]
         */
        _isInContainer: function(p) {
            var r = Dom.getRegion(this.container);
            return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
        },

        /**
         * 给容器添加iframe shim层
         * @protected
         */
        _initShim: function() {
            var iframe = document.createElement("iframe");
            iframe.src = "about:blank";
            iframe.className = this.config.shimClassName;
            iframe.style.position = "absolute";
            iframe.style.visibility = "hidden";
            iframe.style.border = "none";
            this.container.shim = iframe;

            this._setShimRegion();
            document.body.insertBefore(iframe, document.body.firstChild);
        },

        /**
         * 设置shim的left, top, width
         * @protected
         */
        _setShimRegion: function() {
            var container = this.container, shim = container.shim;
            if (shim) {
                shim.style.left = (parseInt(container.style.left) - 2) + "px"; // 解决吞边线bug
                shim.style.top = container.style.top;
                shim.style.width = (parseInt(container.style.width) + 2) + "px";
            }
        },

        /**
         * 初始化样式
         * @protected
         */
        _initStyle: function() {
            var styleEl = Dom.get(STYLE_ID);
            if (styleEl) return; // 防止多个实例时重复添加

            var style = ".suggest-container{background:white;border:1px solid #999;z-index:99999}";
            style += ".suggest-shim{z-index:99998}";
            style += ".suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}";
            style += ".suggest-container li.selected{background-color:#39F;cursor:default}";
            style += ".suggest-key{float:left;text-align:left;padding-left:5px}";
            style += ".suggest-result{float:right;text-align:right;padding-right:5px;color:green}";
            style += ".suggest-container li.selected span{color:#FFF;cursor:default}";
            //style += ".suggest-container li.selected .suggest-result{color:green}";
            style += ".suggest-bottom{padding:0 5px 5px}";
            style += ".suggest-close-btn{float:right}";
            style += ".suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}";
            /* hacks */
            style += ".suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}";

            styleEl = document.createElement("style");
            styleEl.id = STYLE_ID;
            styleEl.type = "text/css";
            head.appendChild(styleEl); // 先添加到DOM树中，都在cssText里的hack会失效

            if (styleEl.styleSheet) { // IE
                styleEl.styleSheet.cssText = style;
            } else { // W3C
                styleEl.appendChild(document.createTextNode(style));
            }
        },

        /**
         * window.onresize时，调整提示层的位置
         * @protected
         */
        _initResizeEvent: function() {
            var instance = this, resizeTimer;

            Event.on(window, "resize", function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    instance._setContainerRegion();
                    instance._setShimRegion();
                }, 50);
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            NS.Suggest.focusInstance = this;

            var instance = this;
            instance._timer = setTimeout(function() {
                instance.updateData();
                instance._timer = setTimeout(arguments.callee, instance.config.timerDelay);
            }, instance.config.timerDelay);

            this._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            NS.Suggest.focusInstance = null;
            clearTimeout(this._timer);
            this._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            container.style.visibility = "";

            if (shim) {
                if (!shim.style.height) { // 第一次显示时，需要设定高度
                    var r = Dom.getRegion(container);
                    shim.style.height = (r.bottom - r.top - 2) + "px";
                }
                shim.style.visibility = "";
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;
            //console.log("hide");

            if (shim) shim.style.visibility = "hidden";
            container.style.visibility = "hidden";
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != "hidden";
        },

        /**
         * 更新提示层的数据
         */
        updateData: function() {
            if (!this._needUpdate()) return;
            //console.log("update data");

            this._updateQueryValueFromInput();
            var q = this.query;

            // 1. 输入为空时，隐藏提示层
            if (!Lang.trim(q).length) {
                this._fillContainer("");
                this.hide();
                return;
            }

            if (typeof this._dataCache[q] != "undefined") { // 2. 使用缓存数据
                //console.log("use cache");
                this.returnedData = "using cache";
                this._fillContainer(this._dataCache[q]);
                this._displayContainer();

            } else if (this.JSONDataSource) { // 3. 使用JSON静态数据源
                this.handleResponse(this.JSONDataSource[q]);

            } else { // 4. 请求服务器数据
                this.requestData();
            }
        },

        /**
         * 是否需要更新数据
         * @protected
         * @return Boolean
         */
        _needUpdate: function() {
            // 注意：加入空格也算有变化
            return this.textInput.value != this.query;
        },

        /**
         * 通过script元素加载数据
         */
        requestData: function() {
            //console.log("request data via script");
            if (!ie) this.dataScript = null; // IE不需要重新创建script元素

            if (!this.dataScript) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.charset = "utf-8";

                // jQuery ajax.js line 275:
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                this.dataScript = script;

                if (!ie) {
                    var t = new Date().getTime();
                    this._latestScriptTime = t;
                    script.setAttribute("time", t);

                    Event.on(script, "load", function() {
                        //console.log("on load");
                        // 判断返回的数据是否已经过期
                        this._scriptDataIsOut = script.getAttribute("time") != this._latestScriptTime;
                    }, this, true);
                }
            }

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            this.queryParams = "q=" + encodeURIComponent(this.query) + "&code=utf-8&callback=" + CALLBACK_STR;
            this.fireEvent(BEFORE_DATA_REQUEST, this.query);
            this.dataScript.src = this.dataSource + "?" + this.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        handleResponse: function(data) {
            //console.log("handle response");
            if (this._scriptDataIsOut) return; // 抛弃过期数据，否则会导致bug：1. 缓存key值不对； 2. 过期数据导致的闪屏

            this.returnedData = data;
            this.fireEvent(ON_DATA_RETURN, data);

            // 格式化数据
            this.returnedData = this.formatData(this.returnedData);

            // 填充数据
            var content = "";
            var len = this.returnedData.length;
            if (len > 0) {
                var list = document.createElement("ol");
                for (var i = 0; i < len; ++i) {
                    var itemData = this.returnedData[i];
                    var li = this.formatItem(itemData["key"], itemData["result"]);
                    // 缓存key值到attribute上
                    li.setAttribute("key", itemData["key"]);
                    list.appendChild(li);
                }
                content = list;
            }
            this._fillContainer(content);

            // 有内容时才添加底部
            if (len > 0) this.appendBottom();

            // fire event
            if (Lang.trim(this.container.innerHTML)) {
                // 实际上是beforeCache，但从用户的角度看，是beforeShow
                this.fireEvent(BEFORE_SHOW, this.container);
            }

            // cache
            this._dataCache[this.query] = this.container.innerHTML;

            // 显示容器
            this._displayContainer();
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有3种：
         *  1. {"result" : [["key1", "result1"], ["key2", "result2"], ...]}
         *  2. {"result" : ["key1", "key2", ...]}
         *  3. 1和2的组合
         *  4. 标准格式
         *  5. 上面1-4中，直接取o["result"]的值
         * @return Object 标准格式的数据：
         *  [{"key" : "key1", "result" : "result1"}, {"key" : "key2", "result" : "result2"}, ...]
         */
        formatData: function(data) {
            var arr = [];
            if (!data) return arr;
            if (Lang.isArray(data["result"])) data = data["result"];
            var len = data.length;
            if (!len) return arr;

            var item;
            for (var i = 0; i < len; ++i) {
                item = data[i];

                if (Lang.isString(item)) { // 只有key值时
                    arr[i] = {"key" : item};
                } else if (Lang.isArray(item) && item.length >= 2) { // ["key", "result"] 取数组前2个
                    arr[i] = {"key" : item[0], "result" : item[1]};
                } else {
                    arr[i] = item;
                }
            }
            return arr;
        },

        /**
         * 格式化输出项
         * @param {String} key 查询字符串
         * @param {Number} result 结果 可不设
         * @return {HTMLElement}
         */
        formatItem: function(key, result) {
            var li = document.createElement("li");
            var keyEl = document.createElement("span");
            keyEl.className = this.config.keyElClassName;
            keyEl.appendChild(document.createTextNode(key));
            li.appendChild(keyEl);

            if (typeof result != "undefined") { // 可以没有
                var resultText = this.config.resultFormat.replace("%result%", result);
                if (Lang.trim(resultText)) { // 有值时才创建
                    var resultEl = document.createElement("span");
                    resultEl.className = this.config.resultElClassName;
                    resultEl.appendChild(document.createTextNode(resultText));
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * 添加提示层底部
         */
        appendBottom: function() {
            var bottom = document.createElement("div");
            bottom.className = this.config.bottomClassName;

            if (this.config.showCloseBtn) {
                var closeBtn = document.createElement("a");
                closeBtn.href = "javascript: void(0)";
                closeBtn.setAttribute("target", "_self"); // bug fix: 覆盖<base target="_blank" />，否则会弹出空白页面
                closeBtn.className = this.config.closeBtnClassName;
                closeBtn.appendChild(document.createTextNode(this.config.closeBtnText));

                // 没必要，点击时，输入框失去焦点，自动就关闭了
                /*
                 Event.on(closeBtn, "click", function(ev) {
                 Event.stopEvent(ev);
                 this.hidden();
                 }, this, true);
                 */

                bottom.appendChild(closeBtn);
            }

            // 仅当有内容时才添加
            if (Lang.trim(bottom.innerHTML)) {
                this.container.appendChild(bottom);
            }
        },

        /**
         * 填充提示层
         * @protected
         * @param {String|HTMLElement} content innerHTML or Child Node
         */
        _fillContainer: function(content) {
            if (content.nodeType == 1) {
                this.container.innerHTML = "";
                this.container.appendChild(content);
            } else {
                this.container.innerHTML = content;
            }

            // 一旦重新填充了，selectedItem就没了，需要重置
            this.selectedItem = null;
        },

        /**
         * 根据contanier的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            if (Lang.trim(this.container.innerHTML)) {
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * 选中提示层中的上/下一个条
         * @param {Boolean} down true表示down，false表示up
         */
        selectItem: function(down) {
            //console.log("select item " + down);
            var items = this.container.getElementsByTagName("li");
            if (items.length == 0) return;

            // 有可能用ESC隐藏了，直接显示即可
            if (!this.isVisible()){
                this.show();
                return; // 保留原来的选中状态
            }
            var newSelectedItem;

            // 没有选中项时，选中第一/最后项
            if (!this.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // 选中下/上一项
                newSelectedItem = Dom[down ? "getNextSibling" : "getPreviousSibling"](this.selectedItem);
                // 已经到了最后/前一项时，归位到输入框，并还原输入值
                if (!newSelectedItem) {
                    this.textInput.value = this.query;
                }
            }

            // 移除当前选中项
            this._removeSelectedItem();

            // 选中新项
            if (newSelectedItem) {
                this._setSelectedItem(newSelectedItem);
                this._updateInputFromSelectItem();
            }
        },

        /**
         * 移除选中项
         * @protected
         */
        _removeSelectedItem: function() {
            //console.log("remove selected item");
            Dom.removeClass(this.selectedItem, this.config.selectedItemClassName);
            this.selectedItem = null;
        },

        /**
         * 设置当前选中项
         * @protected
         * @param {HTMLElement} item
         */
        _setSelectedItem: function(item) {
            //console.log("set selected item");
            Dom.addClass((item), this.config.selectedItemClassName);
            this.selectedItem = (item);
        },

        /**
         * 获取提示层中选中项的key字符串
         * @protected
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return "";

            // getElementsByClassName比较损耗性能，改用缓存数据到attribute上方法
            //var keyEl = Dom.getElementsByClassName(this.config.keyElClassName, "*", this.selectedItem)[0];
            //return keyEl.innerHTML;

            return this.selectedItem.getAttribute("key");
        },

        /**
         * 将textInput的值更新到this.query
         * @protected
         */
        _updateQueryValueFromInput: function() {
            this.query = this.textInput.value;
        },

        /**
         * 将选中项的值更新到textInput
         * @protected
         */
        _updateInputFromSelectItem: function() {
            this.textInput.value = this._getSelectedItemKey(this.selectedItem);
        }

    };

    Lang.augmentProto(NS.Suggest, Y.EventProvider);

    /**
     * 当前激活的实例
     * @static
     */
    NS.Suggest.focusInstance = null;

    /**
     * 从jsonp中获取数据
     * @method callback
     */
    NS.Suggest.callback = function(data) {
        if (!NS.Suggest.focusInstance) return;
        // 使得先运行script.onload事件，然后再执行callback函数
        setTimeout(function() {
            NS.Suggest.focusInstance.handleResponse(data);
        }, 0);
    };

})(KISSY);


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很core，但相对来说是简单的，由 requestData + handleResponse + formatData等辅助方法组成
 * 需要注意两点：
 *  a. IE中，改变script.src, 会自动取消掉之前的请求，并发送新请求。非IE中，必须新创建script才行。这是
 *     requestData方法中存在两种处理方式的原因。
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加时间戳
 *     的解决方案。更好的解决方案是，调整API，使得返回的数据中，带有query值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分2部分：
 *  1. 输入框的focus/blur事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的blur事件，blur事件中调用hide方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得blur时不会触发hide，在提示层的点击
 *     事件中自行处理。（2009-06-18更新：采用mouseup来替代click事件，代码清晰简单了很多）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给this.selectedItem赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和google的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在ie等浏览器中，输入框中输入ENTER键时，会自动提交表单。如果form.target="_blank", 自动提交和JS提交
 *     会打开两个提交页面。因此这里采取了在JS中不提交的策略，ENTER键是否提交表单，完全由HTML代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18更新：可以通过blur()取消掉浏览器的默认
 *     Enter响应，这样能使得代码逻辑和mouseup的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当textInput会触发表单提交时，在enter keydown 和 keyup之间，就会触发提交。因此在keydown中捕捉事件。
 *     并且在keydown中能捕捉到持续DOWN/UP，在keyup中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如hide方法和show方法，除了改变visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的blur和提示层的click事件。
 *  3. 测试的重要性。目前是列出Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */
