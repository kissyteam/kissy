/*
Copyright 2010, KISSY UI Library v1.1.0pre
MIT Licensed
build time: ${build.time}
*/
/**
 * 提示补全组件
 * @module   suggest
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core
 */
KISSY.add('suggest', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        win = window, doc = document,
        head = doc.getElementsByTagName('head')[0],
        ie = S.UA.ie, ie6 = (ie === 6),

        CALLBACK_STR = 'g_ks_suggest_callback', // 约定的全局回调函数
        STYLE_ID = 'ks-suggest-style', // 样式 style 元素的 id

        CONTAINER_CLASS = 'ks-suggest-container',
        KEY_EL_CLASS = 'ks-suggest-key', // 提示层中，key 元素的 class
        RESULT_EL_CLASS = 'ks-suggest-result', // 提示层中，result 元素的 class
        SELECTED_ITEM_CLASS = 'selected', // 提示层中，选中项的 class
        ODD_ITEM_CLASS = 'odd', // 提示层中，奇数项的 class
        EVEN_ITEM_CLASS = 'even', // 提示层中，偶数项的 class
        BOTTOM_CLASS = 'ks-suggest-bottom',
        CLOSE_BTN_CLASS = 'ks-suggest-close-btn',
        SHIM_CLASS = 'ks-suggest-shim', // iframe shim 的 class

        EVENT_DATA_REQUEST = 'dataRequest',
        EVENT_DATA_RETURN = 'dataReturn',
        EVENT_SHOW = 'show',
        EVENT_ITEM_SELECT = 'itemSelect',

        /**
         * Suggest的默认配置
         */
        defaultConfig = {
            /**
             * 用户附加给悬浮提示层的 class
             *
             * 提示层的默认结构如下：
             * <div class='suggest-container [container-class]'>
             *     <ol>
             *         <li>
             *             <span class='suggest-key'>...</span>
             *             <span class='suggest-result'>...</span>
             *         </li>
             *     </ol>
             *     <div class='suggest-bottom'>
             *         <a class='suggest-close-btn'>...</a>
             *     </div>
             * </div>
             * @type String
             */
            containerCls: '',

            /**
             * 提示层的宽度
             * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
             * 示范取值：'200px', '10%'等，必须带单位
             * @type String
             */
            containerWidth: '',

            /**
             * result的格式
             * @type String
             */
            resultFormat: '约%result%条结果',

            /**
             * 是否显示关闭按钮
             * @type Boolean
             */
            showCloseBtn: false,

            /**
             * 关闭按钮上的文字
             * @type String
             */
            closeBtnText: '关闭',

            /**
             * 是否需要iframe shim
             * @type Boolean
             */
            useShim: ie6,

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
     * @constructor
     * @param {String|HTMLElement} textInput
     * @param {String} dataSource
     * @param {Object} config
     */
    function Suggest(textInput, dataSource, config) {
        var self = this;

        // allow instantiation without the new operator
        if (!(self instanceof Suggest)) {
            return new Suggest(textInput, dataSource, config);
        }

        /**
         * 文本输入框
         * @type HTMLElement
         */
        self.textInput = S.get(textInput);

        /**
         * 获取数据的URL 或 JSON格式的静态数据
         * @type {String|Object}
         */
        self.dataSource = dataSource;

        /**
         * JSON静态数据源
         * @type Object 格式为 {'query1' : [['key1', 'result1'], []], 'query2' : [[], []]}
         */
        self.JSONDataSource = S.isPlainObject(dataSource) ? dataSource : null;

        /**
         * 通过jsonp返回的数据
         * @type Object
         */
        self.returnedData = null;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || { });

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        self.container = null;

        /**
         * 输入框的值
         * @type String
         */
        self.query = '';

        /**
         * 获取数据时的参数
         * @type String
         */
        self.queryParams = '';

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        self._timer = null;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        self._isRunning = false;

        /**
         * 获取数据的script元素
         * @type HTMLElement
         */
        self.dataScript = null;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        self._dataCache = {};

        /**
         * 最新script的时间戳
         * @type String
         */
        self._latestScriptTime = '';

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        self._scriptDataIsOut = false;

        /**
         * 是否处于键盘选择状态
         * @private
         * @type Boolean
         */
        self._onKeyboardSelecting = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        self.selectedItem = null;

        // init
        self._init();
    }

    S.augment(Suggest, S.EventTarget, {
        /**
         * 初始化方法
         * @protected
         */
        _init: function() {
            var self = this;

            // init DOM
            self._initTextInput();
            self._initContainer();
            if (self.config.useShim) self._initShim();
            self._initStyle();

            // window resize event
            self._initResizeEvent();
        },

        /**
         * 初始化输入框
         * @protected
         */
        _initTextInput: function() {
            var self = this;

            // turn off autocomplete
            self.textInput.setAttribute('autocomplete', 'off');

            // focus
            // 2009-12-10 yubo: 延迟到 keydown 中 start
            //            Event.on(this.textInput, 'focus', function() {
            //                instance.start();
            //            });

            // blur
            Event.on(self.textInput, 'blur', function() {
                self.stop();
                self.hide();
            });

            // auto focus
            if (self.config.autoFocus) self.textInput.focus();

            // keydown
            // 注：截至目前，在Opera9.64中，输入法开启时，依旧不会触发任何键盘事件
            var pressingCount = 0; // 持续按住某键时，连续触发的keydown次数。注意Opera只会触发一次。
            Event.on(self.textInput, 'keydown', function(ev) {
                var keyCode = ev.keyCode;
                //console.log('keydown ' + keyCode);

                switch (keyCode) {
                    case 27: // ESC键，隐藏提示层并还原初始输入
                        self.hide();
                        self.textInput.value = self.query;

                        // 当输入框为空时，按下 ESC 键，输入框失去焦点
                        if(self.query.length === 0) {
                            self.textInput.blur();
                        }
                        break;
                    case 13: // ENTER键
                        // 提交表单前，先隐藏提示层并停止计时器
                        self.textInput.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                        // 如果是键盘选中某项后回车，触发onItemSelect事件
                        if (self._onKeyboardSelecting) {
                            if (self.textInput.value == self._getSelectedItemKey()) { // 确保值匹配
                                self.fire(EVENT_ITEM_SELECT);
                            }
                        }

                        // 提交表单
                        self._submitForm();
                        break;
                    case 40: // DOWN键
                    case 38: // UP键
                        // 按住键不动时，延时处理
                        if (pressingCount++ == 0) {
                            if (self._isRunning) self.stop();
                            self._onKeyboardSelecting = true;
                            self.selectItem(keyCode === 40);

                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        break;
                }

                // 非 DOWN/UP 键时，开启计时器
                if (keyCode != 40 && keyCode != 38) {
                    if (!self._isRunning) {
                        // 1. 当网速较慢，js还未下载完时，用户可能就已经开始输入
                        //    这时，focus事件已经不会触发，需要在keyup里触发定时器
                        // 2. 非DOWN/UP键时，需要激活定时器
                        self.start();
                    }
                    self._onKeyboardSelecting = false;
                }
            });

            // reset pressingCount
            Event.on(self.textInput, 'keyup', function() {
                //console.log('keyup');
                pressingCount = 0;
            });
        },

        /**
         * 初始化提示层容器
         * @protected
         */
        _initContainer: function() {
            // create
            var container = doc.createElement('div'),
                customContainerClass = this.config.containerCls;

            container.className = CONTAINER_CLASS;
            if (customContainerClass) {
                container.className += ' ' + customContainerClass;
            }
            container.style.position = 'absolute';
            container.style.visibility = 'hidden';
            this.container = container;

            this._setContainerRegion();
            this._initContainerEvent();

            // append
            doc.body.insertBefore(container, doc.body.firstChild);
        },

        /**
         * 设置容器的 left, top, width
         */
        _setContainerRegion: function() {
            var self = this,
                input = self.textInput,
                pos = DOM.offset(input),
                container = self.container;

            DOM.offset(container, {
                left: pos.left,
                top: pos.top + input.offsetHeight - 1 // 默认向上偏差 1, 以覆盖掉 input 的下边框
            });

            // 默认 container 的边框为 1, padding 为 0, 因此 width = offsetWidth - 2
            DOM.width(container, self.config.containerWidth || input.offsetWidth - 2);
        },

        /**
         * 初始化容器事件
         * 子元素都不用设置事件，冒泡到这里统一处理
         * @protected
         */
        _initContainerEvent: function() {
            var self = this;

            // 鼠标事件
            Event.on(self.container, 'mousemove', function(ev) {
                var target = ev.target;

                if (target.nodeName !== 'LI') {
                    target = DOM.parent(target, '.li');
                }
                if (DOM.contains(self.container, target)) {
                    if (target !== self.selectedItem) {
                        // 移除老的
                        self._removeSelectedItem();
                        // 设置新的
                        self._setSelectedItem(target);
                    }
                }
            });

            var mouseDownItem = null;
            Event.on(self.container, 'mousedown', function(e) {
                // 鼠标按下处的item
                mouseDownItem = e.target;

                // 鼠标按下时，让输入框不会失去焦点
                // 1. for IE
                self.textInput.onbeforedeactivate = function() {
                    win.event.returnValue = false;
                    self.textInput.onbeforedeactivate = null;
                };
                // 2. for W3C
                return false;
            });

            // mouseup事件
            Event.on(self.container, 'mouseup', function(ev) {
                // 当mousedown在提示层，但mouseup在提示层外时，点击无效
                if (!self._isInContainer([ev.pageX, ev.pageY])) return;

                var target = ev.target;
                // 在提示层A项处按下鼠标，移动到B处释放，不触发onItemSelect
                if (target != mouseDownItem) return;

                // 点击在关闭按钮上
                if (target.className == CLOSE_BTN_CLASS) {
                    self.hide();
                    return;
                }

                // 可能点击在li的子元素上
                if (target.nodeName != 'LI') {
                    target = DOM.parent(target, '.li');
                }
                // 必须点击在container内部的li上
                if (DOM.contains(self.container, target)) {
                    self._updateInputFromSelectItem(target);

                    // 触发选中事件
                    //console.log('on item select');
                    self.fire(EVENT_ITEM_SELECT);

                    // 提交表单前，先隐藏提示层并停止计时器
                    self.textInput.blur();

                    // 提交表单
                    self._submitForm();
                }
            });
        },

        /**
         * click选择 or enter后，提交表单
         */
        _submitForm: function() {
            // 注：对于键盘控制enter选择的情况，由html自身决定是否提交。否则会导致某些输入法下，用enter选择英文时也触发提交
            if (this.config.submitFormOnClickSelect) {
                var form = this.textInput.form;
                if (!form) return;

                // 通过js提交表单时，不会触发onsubmit事件
                // 需要js自己触发
                if (doc.createEvent) { // w3c
                    var evObj = doc.createEvent('MouseEvents');
                    evObj.initEvent('submit', true, false);
                    form.dispatchEvent(evObj);
                }
                else if (doc.createEventObject) { // ie
                    form.fireEvent('onsubmit');
                }

                form.submit();
            }
        },

        /**
         * 判断p是否在提示层内
         * @param {Array} p [x, y]
         */
        _isInContainer: function(p) {
            var r = this._getContainerRegion();

            return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
        },

        /**
         * 给容器添加iframe shim层
         * @protected
         */
        _initShim: function() {
            var iframe = doc.createElement('iframe');
            iframe.src = 'about:blank';
            iframe.className = SHIM_CLASS;
            iframe.style.position = 'absolute';
            iframe.style.visibility = 'hidden';
            iframe.style.border = 'none';
            this.container.shim = iframe;

            this._setShimRegion();
            doc.body.insertBefore(iframe, doc.body.firstChild);
        },

        /**
         * 设置shim的left, top, width
         * @protected
         */
        _setShimRegion: function() {
            var container = this.container, shim = container.shim;
            if (shim) {
                shim.style.left = (parseInt(container.style.left) - 2) + 'px'; // 解决吞边线bug
                shim.style.top = container.style.top;
                shim.style.width = (parseInt(container.style.width) + 2) + 'px';
            }
        },

        /**
         * 初始化样式
         * @protected
         */
        _initStyle: function() {
            var styleEl = S.get('#' + STYLE_ID);
            if (styleEl) return; // 防止多个实例时重复添加

            var style = '.ks-suggest-container{background:white;border:1px solid #999;z-index:99999}'
                + '.ks-suggest-shim{z-index:99998}'
                + '.ks-suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}'
                + '.ks-suggest-container li.selected{background-color:#39F;cursor:default}'
                + '.ks-suggest-key{float:left;text-align:left;padding-left:5px}'
                + '.ks-suggest-result{float:right;text-align:right;padding-right:5px;color:green}'
                + '.ks-suggest-container li.selected span{color:#FFF;cursor:default}'
                + '.ks-suggest-bottom{padding:0 5px 5px}'
                + '.ks-suggest-close-btn{float:right}'
                + '.ks-suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}'
                /* hacks */
                + '.ks-suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}';

            DOM.addStyleSheet(style, STYLE_ID);
        },

        /**
         * window.onresize时，调整提示层的位置
         * @protected
         */
        _initResizeEvent: function() {
            var self = this, resizeTimer;

            Event.on(win, 'resize', function() {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }

                resizeTimer = setTimeout(function() {
                    self._setContainerRegion();
                    self._setShimRegion();
                }, 50);
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            var self = this;

            Suggest.focusInstance = self;
            self._timer = setTimeout(function() {
                self.updateContent();
                self._timer = setTimeout(arguments.callee, self.config.timerDelay);
            }, self.config.timerDelay);

            self._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            Suggest.focusInstance = null;
            clearTimeout(this._timer);
            this._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            container.style.visibility = '';

            if (shim) {
                if (!shim.style.height) { // 第一次显示时，需要设定高度
                    shim.style.height = (container.offsetHeight - 2) + 'px';
                }
                shim.style.visibility = '';
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;
            //console.log('hide');

            if (shim) shim.style.visibility = 'hidden';
            container.style.visibility = 'hidden';
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != 'hidden';
        },

        /**
         * 更新提示层的数据
         */
        updateContent: function() {
            var self = this;
            if (!self._needUpdate()) return;
            //console.log('update data');

            self._updateQueryValueFromInput();
            var q = self.query;

            // 1. 输入为空时，隐藏提示层
            if (!S.trim(q).length) {
                self._fillContainer('');
                self.hide();
                return;
            }

            if (self._dataCache[q] !== undefined) { // 2. 使用缓存数据
                //console.log('use cache');
                self.returnedData = 'using cache';
                self._fillContainer(self._dataCache[q]);
                self._displayContainer();

            } else if (self.JSONDataSource) { // 3. 使用JSON静态数据源
                self.handleResponse(self.JSONDataSource[q]);

            } else { // 4. 请求服务器数据
                self.requestData();
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
            var self = this;

            //console.log('request data via script');
            if (!ie) self.dataScript = null; // IE不需要重新创建script元素

            if (!self.dataScript) {
                var script = doc.createElement('script');
                script.charset = 'utf-8';

                // jQuery ajax.js line 275:
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie) {
                    var t = new Date().getTime();
                    self._latestScriptTime = t;
                    script.setAttribute('time', t);

                    Event.on(script, 'load', function() {
                        //console.log('on load');
                        // 判断返回的数据是否已经过期
                        self._scriptDataIsOut = script.getAttribute('time') != self._latestScriptTime;
                    });
                }
            }

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            self.queryParams = 'q=' + encodeURIComponent(self.query) + '&code=utf-8&callback=' + CALLBACK_STR;
            self.fire(EVENT_DATA_REQUEST);
            self.dataScript.src = self.dataSource + '?' + self.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        handleResponse: function(data) {
            var self = this;

            //console.log('handle response');
            if (self._scriptDataIsOut) return; // 抛弃过期数据，否则会导致bug：1. 缓存key值不对； 2. 过期数据导致的闪屏

            self.returnedData = data;
            self.fire(EVENT_DATA_RETURN);

            // 格式化数据
            self.returnedData = self.formatData(self.returnedData);

            // 填充数据
            var content = '';
            var len = self.returnedData.length;
            if (len > 0) {
                var list = doc.createElement('ol');
                for (var i = 0; i < len; ++i) {
                    var itemData = self.returnedData[i];
                    var li = self.formatItem(itemData['key'], itemData['result']);
                    // 缓存key值到attribute上
                    li.setAttribute('key', itemData['key']);
                    // 添加奇偶 class
                    DOM.addClass(li, i % 2 ? EVEN_ITEM_CLASS : ODD_ITEM_CLASS);
                    list.appendChild(li);
                }
                content = list;
            }
            self._fillContainer(content);

            // 有内容时才添加底部
            if (len > 0) self.appendBottom();

            // fire event
            if (S.trim(self.container.innerHTML)) {
                // 实际上是beforeCache，但从用户的角度看，是beforeShow
                self.fire(EVENT_SHOW);
            }

            // cache
            self._dataCache[self.query] = self.container.innerHTML;

            // 显示容器
            self._displayContainer();
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有3种：
         *  1. {'result' : [['key1', 'result1'], ['key2', 'result2'], ...]}
         *  2. {'result' : ['key1', 'key2', ...]}
         *  3. 1和2的组合
         *  4. 标准格式
         *  5. 上面1-4中，直接取o['result']的值
         * @return Object 标准格式的数据：
         *  [{'key' : 'key1', 'result' : 'result1'}, {'key' : 'key2', 'result' : 'result2'}, ...]
         */
        formatData: function(data) {
            var arr = [];
            if (!data) return arr;
            if (S.isArray(data['result'])) data = data['result'];
            var len = data.length;
            if (!len) return arr;

            var item;
            for (var i = 0; i < len; ++i) {
                item = data[i];

                if (typeof item === 'string') { // 只有key值时
                    arr[i] = {'key' : item};
                } else if (S.isArray(item) && item.length >= 2) { // ['key', 'result'] 取数组前2个
                    arr[i] = {'key' : item[0], 'result' : item[1]};
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
            var li = doc.createElement('li');
            var keyEl = doc.createElement('span');
            keyEl.className = KEY_EL_CLASS;
            keyEl.appendChild(doc.createTextNode(key));
            li.appendChild(keyEl);

            if (result !== undefined) { // 可以没有
                var resultText = this.config.resultFormat.replace('%result%', result);
                if (S.trim(resultText)) { // 有值时才创建
                    var resultEl = doc.createElement('span');
                    resultEl.className = RESULT_EL_CLASS;
                    resultEl.appendChild(doc.createTextNode(resultText));
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * 添加提示层底部
         */
        appendBottom: function() {
            var bottom = doc.createElement('div');
            bottom.className = BOTTOM_CLASS;

            if (this.config.showCloseBtn) {
                var closeBtn = doc.createElement('a');
                closeBtn.href = 'javascript: void(0)';
                closeBtn.setAttribute('target', '_self'); // bug fix: 覆盖<base target='_blank' />，否则会弹出空白页面
                closeBtn.className = CLOSE_BTN_CLASS;
                closeBtn.appendChild(doc.createTextNode(this.config.closeBtnText));

                bottom.appendChild(closeBtn);
            }

            // 仅当有内容时才添加
            if (S.trim(bottom.innerHTML)) {
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
                this.container.innerHTML = '';
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
            if (S.trim(this.container.innerHTML)) {
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
            var self = this;

            //console.log('select item ' + down);
            var items = self.container.getElementsByTagName('li');
            if (items.length == 0) return;

            // 有可能用ESC隐藏了，直接显示即可
            if (!self.isVisible()) {
                self.show();
                return; // 保留原来的选中状态
            }
            var newSelectedItem;

            // 没有选中项时，选中第一/最后项
            if (!self.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // 选中下/上一项
                newSelectedItem = DOM[down ? 'next' : 'prev'](self.selectedItem);
                // 已经到了最后/前一项时，归位到输入框，并还原输入值
                if (!newSelectedItem) {
                    self.textInput.value = self.query;
                }
            }

            // 移除当前选中项
            self._removeSelectedItem();

            // 选中新项
            if (newSelectedItem) {
                self._setSelectedItem(newSelectedItem);
                self._updateInputFromSelectItem();
            }
        },

        /**
         * 移除选中项
         * @protected
         */
        _removeSelectedItem: function() {
            //console.log('remove selected item');
            DOM.removeClass(this.selectedItem, SELECTED_ITEM_CLASS);
            this.selectedItem = null;
        },

        /**
         * 设置当前选中项
         * @protected
         * @param {HTMLElement} item
         */
        _setSelectedItem: function(item) {
            //console.log('set selected item');
            DOM.addClass(item, SELECTED_ITEM_CLASS);
            this.selectedItem = item;
        },

        /**
         * 获取提示层中选中项的key字符串
         * @protected
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return '';

            // getElementsByClassName比较损耗性能，改用缓存数据到attribute上方法
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLASS, '*', this.selectedItem)[0];
            //return keyEl.innerHTML;

            return this.selectedItem.getAttribute('key');
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
        },

        /**
         * 获取 container 的 left, top, right, bottom
         */
        _getContainerRegion: function() {
            var container = this.container,
                offset = DOM.offset(container),
                l = offset.left,
                t = offset.top,
                b = t + container.offsetHeight - 1,
                r = l + container.offsetWidth - 1;

            return { left: l, top: t, right: r, bottom: b };
        }
    });

    /**
     * 约定的全局回调函数
     */
    win[CALLBACK_STR] = function(data) {
        if (!Suggest.focusInstance) return;
        // 使得先运行 script.onload 事件，然后再执行 callback 函数
        setTimeout(function() {
            Suggest.focusInstance.handleResponse(data);
        }, 0);
    };

    S.Suggest = Suggest;
});


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
 *  c. 在ie等浏览器中，输入框中输入ENTER键时，会自动提交表单。如果form.target='_blank', 自动提交和JS提交
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

/**
 * 2009-08-05 更新： 将 class 从配置项中移动到常量，原因是：修改默认 className 的可能性很小，仅保留一个
 *                  containerCls 作为个性化样式的接口即可
 *
 * 2009-12-10 更新： 采用 kissy module 组织代码。为了避免多个沙箱下，对全局回调函数覆盖定义引发的问题，
 *                  采用共享模式。
 *
 * 2010-03-10 更新： 去除共享模式，适应 kissy 新的代码组织方式。
 */
