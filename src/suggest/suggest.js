/**
 * 提示补全组件
 * @module   suggest
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core
 */
KISSY.add('suggest', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        win = window, doc = document, bd, head = S.get('head'),
        ie = S.UA.ie, ie6 = (ie === 6),

        CALLBACK_STR = 'g_ks_suggest_callback', // 约定的全局回调函数
        PREFIX = 'ks-suggest-',
        STYLE_ID = '#' + PREFIX + 'style', // 样式 style 元素的 id

        CONTAINER_CLS = PREFIX + 'container',
        KEY_EL_CLS = PREFIX + 'key',
        RESULT_EL_CLS = PREFIX + 'result',
        SELECTED_ITEM_CLS = 'ks-selected', // 选中项
        ODD_ITEM_CLS = 'ks-odd', // 奇数项
        EVEN_ITEM_CLS = 'ks-even', // 偶数项
        FOOTER_CLS = PREFIX + 'footer',
        CLOSE_BTN_CLS = PREFIX + 'closebtn',
        SHIM_CLS = PREFIX + 'shim', // iframe shim 的 class

        EVENT_BEFORE_START = 'beforeStart', // 监控计时器开始前触发，可以用来做条件触发
        EVENT_ITEM_SELECT = 'itemSelect', // 选中某项时触发，可以用来添加监控埋点等参数
        EVENT_BEFORE_SUBMIT = 'beforeSubmit', // 表单提交前触发，可以用来取消提交或添加特定参数
        EVENT_BEFORE_DATA_REQUEST = 'beforeDataRequest', // 请求数据前触发，可以用来动态修改请求 url 和参数
        EVENT_DATA_RETURN = 'dataReturn', // 获得返回数据时触发，可以用来动态修正数据
        EVENT_UPDATE_FOOTER = 'updateFooter', // 更新底部内容时触发，可以用来动态添加自定义内容
        EVENT_BEFORE_SHOW = 'beforeShow', // 显示提示层前触发，可以用来动态修改提示层数据

        TIMER_DELAY = 200,
        EMPTY = '', HIDDEN = 'hidden',
        LI = 'LI', li = 'li',
        RESULT = 'result', KEY = 'key',
        DATA_TIME = 'data-time',
        PARSEINT = parseInt,

        /**
         * Suggest的默认配置
         */
        defaultConfig = {
            /**
             * 用户附加给悬浮提示层的 class
             *
             * 提示层的默认结构如下：
             * <div class='kssuggest-container {containerCls}'>
             *     <ol>
             *         <li>
             *             <span class='ks-suggest-key'>...</span>
             *             <span class='ks-suggest-result'>...</span>
             *         </li>
             *     </ol>
             *     <div class='ks-suggest-footer'>
             *         <a class='ks-suggest-close-btn'>...</a>
             *     </div>
             * </div>
             * @type String
             */
            containerCls: EMPTY,

            /**
             * 提示层的宽度
             * 注意：默认情况下，提示层的宽度和input输入框的宽度保持一致
             * 示范取值：'200px', '10%' 等，必须带单位
             * @type String
             */
            //containerWidth: EMPTY,

            /**
             * result 的格式
             * @type String
             */
            resultFormat: '约%result%条结果',

            /**
             * 是否显示关闭按钮
             * @type Boolean
             */
            //closeBtn: false,

            /**
             * 关闭按钮上的文字
             * @type String
             */
            closeBtnText: '关闭',

            /**
             * 是否需要 iframe shim 默认只在 ie6 下显示
             * @type Boolean
             */
            shim: ie6,

            /**
             * 初始化后，自动激活
             * @type Boolean
             */
            //autoFocus: false,

            /**
             * 选择某项时，是否自动提交表单
             * @type Boolean
             */
            submitOnSelect: true
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
         * 获取数据的 URL
         * @type {String|Object}
         */
        // 归一化为：http://path/to/suggest.do? or http://path/to/suggest.do?p=1&
        dataSource += (dataSource.indexOf('?') === -1) ? '?' : '&';
        self.dataSource = dataSource + 'code=utf-8&callback=' + CALLBACK_STR;

        /**
         * 通过 jsonp 返回的数据
         * @type Object
         */
        //self.returnedData = undefined;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config);

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        //self.container = undefined;

        /**
         * 输入框的值
         * @type String
         */
        self.query = EMPTY;

        /**
         * 内部定时器
         * @private
         * @type Object
         */
        //self._timer = undefined;

        /**
         * 计时器是否处于运行状态
         * @private
         * @type Boolean
         */
        //self._isRunning = false;

        /**
         * 获取数据的 script 元素
         * @type HTMLElement
         */
        //self.dataScript = undefined;

        /**
         * 数据缓存
         * @private
         * @type Object
         */
        self._dataCache = { };

        /**
         * 最新 script 的时间戳
         * @type String
         */
        //self._latestScriptTime = EMPTY;

        /**
         * script返回的数据是否已经过期
         * @type Boolean
         */
        //self._scriptDataIsOut = false;

        /**
         * 提示层的当前选中项
         * @type Boolean
         */
        //self.selectedItem = undefined;

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
            bd = doc.body;

            self._initTextInput();
            self._initContainer();
            if (self.config.shim) self._initShim();

            self._initStyle();
            self._initResizeEvent();
        },

        /**
         * 初始化输入框
         */
        _initTextInput: function() {
            var self = this,
                input = self.textInput,
                isDowningOrUping = false, // 是否持续按住 DOWN / UP 键
                pressingCount = 0; // 持续按住某键时，连续触发的 keydown 次数。注意 Opera 只会触发一次

            DOM.attr(input, 'autocomplete', 'off');
            if (self.config['autoFocus']) input.focus();

            // 监控 keydown 事件
            // 注：截至 2010/08/03, 在 Opera 10.60 中，输入法开启时，依旧不会触发任何键盘事件
            Event.on(input, 'keydown', function(ev) {
                var keyCode = ev.keyCode;
                //S.log('keydown ' + keyCode);

                // ESC 键，隐藏提示层并还原初始输入
                if (keyCode === 27) {
                    self.hide();
                    input.value = self.query;
                }
                // 方向键，包括 PgUp, PgDn, End, Home, Left, Up, Right, Down
                else if (keyCode > 32 && keyCode < 41) {
                    // 如果输入框无值，按下以上键时，将响应转移到页面上，以避免自动定焦导致的键盘导航问题
                    if (!input.value) {
                        input.blur();
                    }
                    // DOWN / UP 键
                    else if (keyCode === 40 || keyCode === 38) {
                        // 按住键不动时，延时处理。这样可以使操作看起来更自然，避免太快导致的体验不好
                        if (pressingCount++ === 0) {
                            if (self._isRunning) self.stop();
                            isDowningOrUping = true;
                            self._selectItem(keyCode === 40);
                        }
                        else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                    }
                }
                // ENTER 键
                else if (keyCode === 13) {
                    // 提交表单前，先隐藏提示层并停止计时器
                    input.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                    // 如果是键盘选中某项后回车，触发 onItemSelect 事件
                    if (isDowningOrUping) {
                        if (input.value == self._getSelectedItemKey()) { // 确保值匹配
                            if(self.fire(EVENT_ITEM_SELECT) === false) return;
                        }
                    }

                    // 提交表单
                    self._submitForm();
                }
                // 非以上控制键，开启计时器
                else {
                    if (!self._isRunning) {
                        // 1. 当网速较慢，suggest.js 还未下载和初始化完时，用户可能就已经开始输入
                        //    这时，focus 事件已经不会触发，需要在 keydown 里触发定时器
                        // 2. 非 DOWN/UP 等控制键时，需要激活定时器
                        self.start();
                    }
                    isDowningOrUping = false;
                }
            });

            // reset pressingCount
            Event.on(input, 'keyup', function() {
                pressingCount = 0;
            });

            // 失去焦点时，停止计时器，并隐藏提示层
            Event.on(input, 'blur', function() {
                self.stop();
                self.hide();
            });
        },

        /**
         * 初始化提示层容器
         */
        _initContainer: function() {
            var self = this,
                container = DOM.create('<div>', {
                    'class': CONTAINER_CLS + ' ' + self.config.containerCls,
                    style: 'position: absolute; visibility: hidden'
                });

            bd.insertBefore(container, bd.firstChild);
            self.container = container;
            self._setContainerRegion();
            self._initContainerEvent();
        },

        /**
         * 设置容器的 left, top, width
         */
        _setContainerRegion: function() {
            var self = this,
                input = self.textInput,
                p = DOM.offset(input),
                container = self.container;

            DOM.offset(container, {
                left: p.left,
                top: p.top + input.offsetHeight - 1 // 默认向上偏差 1, 以覆盖掉 input 的下边框
            });

            // 默认 container 的边框为 1, padding 为 0, 因此 width = offsetWidth - 2
            DOM.width(container, self.config['containerWidth'] || input.offsetWidth - 2);
        },

        /**
         * 初始化容器事件
         * 子元素都不用设置事件，冒泡到这里统一处理
         */
        _initContainerEvent: function() {
            var self = this,
                input = self.textInput, container = self.container,
                mouseDownItem;

            Event.on(container, 'mousemove', function(ev) {
                var target = ev.target;

                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                if (DOM.contains(container, target)) {
                    if (target !== self.selectedItem) {
                        // 移除老的
                        self._removeSelectedItem();
                        // 设置新的
                        self._setSelectedItem(target);
                    }
                }
            });

            Event.on(container, 'mousedown', function(ev) {
                // 鼠标按下处的 item
                mouseDownItem = ev.target;

                // 鼠标按下时，让输入框不会失去焦点
                // 1. for IE
                input.onbeforedeactivate = function() {
                    win.event.returnValue = false;
                    input.onbeforedeactivate = undefined;
                };
                // 2. for W3C
                return false;
            });

            Event.on(container, 'mouseup', function(ev) {
                var target = ev.target;
                // 在提示层 A 项处按下鼠标，移动到 B 处释放，不触发 onItemSelect
                if (target != mouseDownItem) return;

                // 点击在关闭按钮上
                if (DOM.hasClass(target, CLOSE_BTN_CLS)) {
                    self.hide();
                    return;
                }

                // 可能点击在 li 的子元素上
                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                // 必须点击在 container 内部的 li 上
                if (DOM.contains(container, target)) {
                    self._updateInputFromSelectItem(target);

                    // 触发选中事件
                    if(self.fire(EVENT_ITEM_SELECT) === false) return;

                    // 提交表单前，先隐藏提示层并停止计时器
                    input.blur();

                    // 提交表单
                    self._submitForm();
                }
            });
        },

        /**
         * click 选择 or enter 后，提交表单
         */
        _submitForm: function() {
            // 注：对于键盘控制 enter 选择的情况，由 html 自身决定是否提交。否则会导致某些输入法下，用 enter 选择英文时也触发提交
            if (this.config.submitOnSelect) {
                var form = this.textInput.form;
                if (!form) return;

                if(self.fire(EVENT_BEFORE_SUBMIT, { form: form }) === false) return;

                // 通过 js 提交表单时，不会触发 onsubmit 事件
                // 需要 js 自己触发
                // 这里触发的目的是，使得其它脚本中给 form 注册的 onsubmit 事件可以正常触发
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
         * 给容器添加 iframe shim 层
         */
        _initShim: function() {
            var iframe = DOM.create('<iframe>', {
                src: 'about:blank',
                'class': SHIM_CLS,
                style: 'position:absolute;visibility:hidden;border:none'
            });
            this.container.shim = iframe;

            this._setShimRegion();
            bd.insertBefore(iframe, bd.firstChild);
        },

        /**
         * 设置 shim 的 left, top, width
         */
        _setShimRegion: function() {
            var style = this.container.style, shim = this.container.shim;
            if (shim) {
                DOM.css(shim, {
                    left: PARSEINT(style.left) - 2, // -2 可以解决吞边线的 bug
                    top: style.top,
                    width: PARSEINT(style.width) + 2
                });
            }
        },

        /**
         * 初始化样式
         */
        _initStyle: function() {
            var styleEl = S.get(STYLE_ID);
            if (styleEl) return; // 防止多个实例时重复添加

            DOM.addStyleSheet(
                '.ks-suggest-container{background:white;border:1px solid #999;z-index:99999}'
                + '.ks-suggest-shim{z-index:99998}'
                + '.ks-suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}'
                + '.ks-suggest-container .ks-selected{background-color:#39F;cursor:default}'
                + '.ks-suggest-key{float:left;text-align:left;padding-left:5px}'
                + '.ks-suggest-result{float:right;text-align:right;padding-right:5px;color:green}'
                + '.ks-suggest-container .ks-selected span{color:#FFF;cursor:default}'
                + '.ks-suggest-footer{padding:0 5px 5px}'
                + '.ks-suggest-closebtn{float:right}'
                + '.ks-suggest-container li,.ks-suggest-footer{overflow:hidden;zoom:1;clear:both}'
                /* hacks */
                + '.ks-suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}',
                styleEl);
        },

        /**
         * window.onresize 时，调整提示层的位置
         */
        _initResizeEvent: function() {
            var self = this, resizeTimer;

            Event.on(win, 'resize', function() {
                if (resizeTimer) {
                    resizeTimer.cancel();
                }

                resizeTimer = S.later(function() {
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
            if(self.fire(EVENT_BEFORE_START) === false) return;

            Suggest.focusInstance = self;

            self._timer = S.later(function() {
                self._updateContent();
                self._timer = S.later(arguments.callee, TIMER_DELAY);
            }, TIMER_DELAY);

            self._isRunning = true;
        },

        /**
         * 停止计时器
         */
        stop: function() {
            Suggest.focusInstance = undefined;
            this._timer.cancel();
            this._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            visible(container);

            if (shim) {
                if (!shim.style.height) { // 第一次显示时，需要设定高度
                    DOM.height(shim, container.offsetHeight - 2);
                }
                visible(shim);
            }
        },

        /**
         * 隐藏提示层
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;

            if (shim) invisible(shim);
            invisible(container);
        },

        /**
         * 提示层是否显示
         */
        isVisible: function() {
            return this.container.style.visibility != HIDDEN;
        },

        /**
         * 更新提示层的数据
         */
        _updateContent: function() {
            var self = this, input = self.textInput, q;

            // 检测是否需要更新。注意：加入空格也算有变化
            if (input.value == self.query) return;
            q = self.query = input.value;

            // 1. 输入为空时，隐藏提示层
            if (!S.trim(q)) {
                self._fillContainer(EMPTY);
                self.hide();
                return;
            }

            if (self._dataCache[q] !== undefined) { // 1. 使用缓存数据
                // S.log('use cache');
                self._fillContainer(self._dataCache[q]);
                self._displayContainer();

            } else { // 2. 请求服务器数据
                self._requestData();
            }
        },

        /**
         * 通过 script 元素异步加载数据
         */
        _requestData: function() {
            var self = this, script;
            //S.log('request data via script');

            if (!ie) self.dataScript = undefined; // IE不需要重新创建 script 元素

            if (!self.dataScript) {
                script = doc.createElement('script');
                script.charset = 'utf-8';
                script.async = true;

                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie) {
                    var t = S.now();
                    self._latestScriptTime = t;
                    DOM.attr(script, DATA_TIME, t);

                    Event.on(script, 'load', function() {
                        // 判断返回的数据是否已经过期
                        self._scriptDataIsOut = DOM.attr(script, DATA_TIME) != self._latestScriptTime;
                    });
                }
            }

            if(self.fire(EVENT_BEFORE_DATA_REQUEST) === false) return;

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            self.dataScript.src = self.dataSource + '&q=' + encodeURIComponent(self.query);
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        _handleResponse: function(data) {
            var self = this, container = self.container, formattedData,
                content = EMPTY, i, len, list, li, key, itemData;
            //S.log('handle response');
            
            if (self._scriptDataIsOut) return; // 抛弃过期数据，否则会导致 bug：1. 缓存 key 值不对； 2. 过期数据导致的闪屏

            self.returnedData = data;
            if(self.fire(EVENT_DATA_RETURN, { data: data }) === false) return;

            // 格式化数据
            formattedData = self._formatData(self.returnedData);

            // 填充数据
            if ((len = formattedData.length) > 0) {
                list = DOM.create('<ol>');
                for (i = 0; i < len; ++i) {
                    itemData = formattedData[i];
                    li = self._formatItem((key = itemData[KEY]), itemData[RESULT]);

                    // 缓存 key 值到 attribute 上
                    DOM.attr(li, KEY, key);

                    // 添加奇偶 class
                    DOM.addClass(li, i % 2 ? EVEN_ITEM_CLS : ODD_ITEM_CLS);
                    list.appendChild(li);
                }
                content = list;
            }
            self._fillContainer(content);

            // 更新底部
            self._updateFooter();

            // fire event
            // 实际上是 beforeCache，但从用户的角度看，是 beforeShow
            // 这样可以保证重复内容不用重新生成，直接用缓存
            if (self.fire(EVENT_BEFORE_SHOW) === false) return;

            // cache
            self._dataCache[self.query] = S.trim(DOM.html(container));

            // 显示容器
            self._displayContainer();
        },

        /**
         * 格式化输入的数据对象为标准格式
         * @param {Object} data 格式可以有 3 种：
         *  1. {'result' : [['key1', 'result1'], ['key2', 'result2'], ...]}
         *  2. {'result' : ['key1', 'key2', ...]}
         *  3. 1 和 2 的组合
         *  4. 标准格式
         *  5. 上面 1 - 4 中，直接取 o['result'] 的值
         * @return Object 标准格式的数据：
         *  [{'key' : 'key1', 'result' : 'result1'}, {'key' : 'key2', 'result' : 'result2'}, ...]
         */
        _formatData: function(data) {
            var arr = [], len, item, i, j = 0;
            if (!data) return arr;
            if (S.isArray(data[RESULT])) data = data[RESULT];
            if (!(len = data.length)) return arr;

            for (i = 0; i < len; ++i) {
                item = data[i];

                if (S.isString(item)) { // 只有 key 值时
                    arr[j++] = { 'key' : item };
                } else if (S.isArray(item) && item.length > 1) { // ['key', 'result'] 取数组前2个
                    arr[j++] = {'key' : item[0], 'result' : item[1]};
                }
                // 不能识别的，直接忽略掉
            }
            return arr;
        },

        /**
         * 格式化输出项
         * @param {String} key 查询字符串
         * @param {Number} result 结果 可不设
         * @return {HTMLElement}
         */
        _formatItem: function(key, result) {
            var li = DOM.create('<li>'),
                keyEl = DOM.create('<span>', {
                    'class': KEY_EL_CLS
                }),
                resultText, resultEl;

            DOM.html(keyEl, key);
            li.appendChild(keyEl);

            if (result) {
                resultText = this.config.resultFormat.replace('%result%', result);
                if (S.trim(resultText)) { // 有值时才创建
                    resultEl = DOM.create('<span>', {
                        'class': RESULT_EL_CLS
                    });
                    DOM.html(resultEl, resultText);
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * 更新提示层底部
         */
        _updateFooter: function() {
            var self = this, cfg = self.config,
                footer = DOM.create('<div>', {
                    'class': FOOTER_CLS
                }),
                closeBtn;

            if (cfg['closeBtn']) {
                closeBtn = DOM.create('<a>', {
                    'class': CLOSE_BTN_CLS,
                    href: 'javascript: void(0)',
                    target: '_self' // bug fix: 覆盖<base target='_blank' />，否则会弹出空白页面
                });
                DOM.html(closeBtn, cfg.closeBtnText);
                footer.appendChild(closeBtn);
            }

            self.fire(EVENT_UPDATE_FOOTER);

            // 仅当有内容时才添加
            if (S.trim(DOM.html(footer))) {
                self.container.appendChild(footer);
            }
        },

        /**
         * 填充提示层
         * @param {String|HTMLElement} content innerHTML or Child Node
         */
        _fillContainer: function(content) {
            var self = this, container = self.container;

            if (content.nodeType === 1) {
                DOM.html(container, EMPTY);
                container.appendChild(content);
            } else {
                DOM.html(container, content);
            }

            // 一旦重新填充了，selectedItem 就没了，需要重置
            self.selectedItem = undefined;
        },

        /**
         * 根据 contanier 的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            var self = this;

            if (S.trim(DOM.html(self.container))) {
                self.show();
            } else {
                self.hide();
            }
        },

        /**
         * 选中提示层中的上/下一个条
         * @param {Boolean} down true 表示 down, false 表示 up
         */
        _selectItem: function(down) {
            var self = this,
                items = S.get(li, self.container),
                newSelectedItem;
            if (items.length === 0) return;

            // 有可能用 ESC 隐藏了，直接显示即可
            if (!self.isVisible()) {
                self.show();
                return; // 保留原来的选中状态
            }

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
         */
        _removeSelectedItem: function() {
            DOM.removeClass(this.selectedItem, SELECTED_ITEM_CLS);
            this.selectedItem = undefined;
        },

        /**
         * 设置当前选中项
         */
        _setSelectedItem: function(item) {
            DOM.addClass(item, SELECTED_ITEM_CLS);
            this.selectedItem = item;
        },

        /**
         * 获取提示层中选中项的 key 字符串
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return EMPTY;

            // getElementsByClassName 比较损耗性能，改用缓存数据到 attribute 上方法
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLS, '*', this.selectedItem)[0];
            //return keyEl.innerHTML;

            return DOM.attr(this.selectedItem, KEY);
        },

        /**
         * 将选中项的 key 值更新到 textInput
         */
        _updateInputFromSelectItem: function() {
            this.textInput.value = this._getSelectedItemKey(this.selectedItem);
        }
    });

    function visible(elem) {
        elem.style.visibility = EMPTY;
    }

    function invisible(elem) {
        elem.style.visibility = HIDDEN;
    }

    /**
     * 约定的全局回调函数
     */
    win[CALLBACK_STR] = function(data) {
        if (!Suggest.focusInstance) return;
        // 保证先运行 script.onload 事件，然后再执行 callback 函数
        S.later(function() {
            Suggest.focusInstance._handleResponse(data);
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
