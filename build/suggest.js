/*
Copyright 2011, KISSY UI Library v1.20dev
MIT Licensed
build time: Jul 20 18:43
*/
KISSY.add("suggest", function(S, Sug) {
    S.Suggest = Sug;
    return Sug;
}, {
    requires:["suggest/base"]
});/**
 * 提示补全组件
 * @module   suggest
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('suggest/base', function(S, DOM, Event, UA,undefined) {

    var win = window,
        EventTarget = Event.Target,
        doc = document, bd, head = DOM.get('head'),
        ie = UA['ie'],
        ie6 = (ie === 6),
        ie9 = (ie >= 9),

        CALLBACK_FN = 'KISSY.Suggest.callback', // 约定的全局回调函数
        PREFIX = 'ks-suggest-',
        STYLE_ID = PREFIX + 'style', // 样式 style 元素的 id

        CONTAINER_CLS = PREFIX + 'container',
        KEY_EL_CLS = PREFIX + 'key',
        RESULT_EL_CLS = PREFIX + 'result',
        SELECTED_ITEM_CLS = 'ks-selected', // 选中项
        ODD_ITEM_CLS = 'ks-odd', // 奇数项
        EVEN_ITEM_CLS = 'ks-even', // 偶数项
        CONTENT_CLS = PREFIX + 'content',
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
        DISPLAY = 'display', NONE = 'none',
        LI = 'LI', li = 'li', DIV = '<div>',
        RESULT = 'result', KEY = 'key',
        DATA_TIME = 'data-time',
        PARSEINT = parseInt,
        RE_FOCUS_ELEMS = /^(?:input|button|a)$/i,

        /**
         * Suggest 的默认配置
         */
        defaultConfig = {
            /**
             * 用户附加给悬浮提示层的 class
             *
             * 提示层的默认结构如下：
             * <div class='ks-suggest-container {containerCls}'>
             *     <ol class="ks-suggest-content">
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
            resultFormat: '%result%',

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
            submitOnSelect: true,

            /**
             * 提示悬浮层和输入框的垂直偏离
             * 默认向上偏差 1px, 使得悬浮层刚好覆盖输入框的下边框
             * @type Boolean
             */
            offset: -1,

            /**
             * 数据接口返回数据的编码
             */
            charset: 'utf-8',

            /**
             * 回调函数的参数名
             */
            callbackName: 'callback',

            /**
             * 回调函数的函数名
             */
            callbackFn: CALLBACK_FN,

            /**
             * 查询的参数名
             */
            queryName: 'q',

            /**
             * @type Number 数据源标志, 默认为 0 , 可取 0, 1, 2
             * - 0: 数据来自远程, 且请求回来后存入 _dataCache
             * - 1: 数据来自远程, 且不存入 _dataCache, 每次请求的数据是否需要缓存, 防止在公用同一个 suggest , 但数据源不一样时, 出现相同内容
             * - 2: 数据来自静态, 不存在时, 不显示提示浮层
             */
            dataType: 0
            /**
             * 提示层内容渲染器
             * @param {Object} data 请求返回的数据
             * @return {HTMLElement | String} 渲染的内容,可选项要求由"li"标签包裹，并将用于表单提交的值存储在"li"元素的key属性上
             */
			//contentRender:null
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
        var self = this, cbFn;

        // allow instantiation without the new operator
        if (!(self instanceof Suggest)) {
            return new Suggest(textInput, dataSource, config);
        }

        /**
         * 文本输入框
         * @type HTMLElement
         */
        self.textInput = DOM.get(textInput);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config = S.merge(defaultConfig, config);

        /**
         * 获取数据的 URL, 或是静态数据
         * @type {String|Object}
         */
        if (S.isString(dataSource)) {
            // 归一化为：http://path/to/suggest.do? or http://path/to/suggest.do?p=1&
            dataSource += (dataSource.indexOf('?') === -1) ? '?' : '&';
            self.dataSource = dataSource + config.callbackName + '=' + (cbFn = config.callbackFn);
            if (config.dataType === 2) self.config.dataType = 0;

            // 回调函数名不是默认值时，需要指向默认回调函数
            if (cbFn !== CALLBACK_FN) initCallback(cbFn);
        }
        // 如果就是一个数据源对象, 强制使用 dataSource
        else {
            self.dataSource = dataSource;
            self.config.dataType = 2;
        }


        /**
         * 通过 jsonp 返回的数据
         * @type Object
         */
        //self.returnedData = undefined;

        /**
         * 存放提示信息的容器
         * @type HTMLElement
         */
        //self.container = undefined;
        //self.content = undefined;
        //self.footer = undefined;

        /**
         * 输入框的值
         * @type String
         */
        self.query = EMPTY;

        /**
         * 获取数据时的参数
         * @type String
         */
        self.queryParams = EMPTY;

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

        /**
         * 焦点是否在提示层
         */
        //self._focusing = false;

        // init
        self._init();
        return 0;
    }

    S.augment(Suggest, EventTarget, {

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
            self._initEvent();
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
                        // webkit 内核下，input 中按 UP 键，默认会导致光标定位到最前
                        ev.preventDefault();
                    }
                }
                // ENTER 键
                else if (keyCode === 13) {
                    // 提交表单前，先隐藏提示层并停止计时器
                    input.blur(); // 这一句还可以阻止掉浏览器的默认提交事件

                    // 如果是键盘选中某项后回车，触发 onItemSelect 事件
                    if (isDowningOrUping) {
                        if (input.value == self._getSelectedItemKey()) { // 确保值匹配
                            if (self.fire(EVENT_ITEM_SELECT) === false) return;
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

                /*
                 * fix 防止 chrome 下 键盘按键移动选中项后, 仍然触发 mousemove 事件
                 */
                if (UA['chrome']) {
                    // 标志按键状态, 延迟后, 恢复没有按键
                    if (self._keyTimer) self._keyTimer.cancel();
                    self._keyTimer = S.later(function() {
                        self._keyTimer = undefined;
                    }, 500);
                }
            });

            // reset pressingCount
            Event.on(input, 'keyup', function() {
                pressingCount = 0;
            });

            // 失去焦点时，停止计时器，并隐藏提示层
            Event.on(input, 'blur', function() {
                self.stop();

                // 点击提示层中的 input 输入框时，首先会输发这里的 blur 事件，之后才是 focusin
                // 因此需要 setTimeout 一下，更换顺序
                S.later(function() {
                    if (!self._focusing) { // 焦点在提示层时，不关闭
                        self.hide();
                    }
                }, 0);
            });
        },

        /**
         * 初始化提示层容器
         */
        _initContainer: function() {
            var self = this,
                extraCls = self.config.containerCls,
                container = DOM.create(DIV, {
                    'class': CONTAINER_CLS + (extraCls ? ' ' + extraCls : EMPTY),
                    style: 'position:absolute;visibility:hidden'
                }),
                content = DOM.create(DIV, {
                    'class': CONTENT_CLS
                }),
                footer = DOM.create(DIV, {
                    'class': FOOTER_CLS
                });

            container.appendChild(content);
            container.appendChild(footer);
            bd.insertBefore(container, bd.firstChild);

            self.container = container;
            self.content = content;
            self.footer = footer;

            self._initContainerEvent();
        },

        /**
         * 设置容器的 left, top, width
         */
        _setContainerRegion: function() {
            var self = this, config = self.config,
                input = self.textInput,
                p = DOM.offset(input),
                container = self.container;

            DOM.offset(container, {
                left: p.left,
                top: p.top + input.offsetHeight + config.offset
            });

            // 默认 container 的边框为 1, padding 为 0, 因此 width = offsetWidth - 2
            DOM.width(container, config['containerWidth'] || input.offsetWidth - 2);
        },

        /**
         * 初始化容器事件
         */
        _initContainerEvent: function() {
            var self = this,
                input = self.textInput,
                container = self.container,
                content = self.content,
                footer = self.footer,
                mouseDownItem, mouseLeaveFooter;

            Event.on(content, 'mousemove', function(ev) {
                if (self._keyTimer) return;

                var target = ev.target;

                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                if (DOM.contains(content, target)) {
                    if (target !== self.selectedItem) {
                        // 移除老的
                        self._removeSelectedItem();
                        // 设置新的
                        self._setSelectedItem(target);
                    }
                }
            });

            Event.on(content, 'mousedown', function(ev) {
                var target = ev.target;

                // 可能点击在 li 的子元素上
                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }
                mouseDownItem = target;
            });

            // 鼠标按下时，让输入框不会失去焦点
            Event.on(container, 'mousedown', function(ev) {
                if (!RE_FOCUS_ELEMS.test(ev.target.nodeName)) { // footer 区域的 input 等元素不阻止
                    // 1. for IE
                    input.onbeforedeactivate = function() {
                        win.event.returnValue = false;
                        input.onbeforedeactivate = null;
                    };
                    // 2. for W3C
                    ev.preventDefault();
                }
            });

            Event.on(content, 'mouseup', function(ev) {
                var target = ev.target;
                if (ev.which > 2) return; // 非左键和中键点击

                // 可能点击在 li 的子元素上
                if (target.nodeName !== LI) {
                    target = DOM.parent(target, li);
                }

                // 在提示层 A 项处按下鼠标，移动到 B 处释放，不触发 onItemSelect
                if (target != mouseDownItem) return;

                // 必须点击在 content 内部的 li 上
                if (DOM.contains(content, target)) {
                    self._updateInputFromSelectItem(target);

                    // 触发选中事件
                    if (self.fire(EVENT_ITEM_SELECT) === false) return;

                    // 提交表单前，先隐藏提示层并停止计时器
                    input.blur();

                    // 提交表单
                    self._submitForm();
                }
            });

            // footer 获取到焦点，比如同店购的输入框
            Event.on(footer, 'focusin', function() {
                self._focusing = true;
                self._removeSelectedItem();
                mouseLeaveFooter = false; // 在这里还原为 false 即可
            });

            Event.on(footer, 'focusout', function() {
                self._focusing = false;

                // 如果立刻 focus textInput 的话，无法从 footer 的一个输入框切换到另一个
                // 因此需要等待另一个输入框 focusin 触发后，再执行下面的逻辑
                S.later(function() {
                    // 鼠标已移开 footer 区域
                    if (mouseLeaveFooter) {
                        self.hide();
                    }
                    // 不是转移到另一个输入框，而是在 footer 非输入框处点击
                    else if (!self._focusing) {
                        self.textInput.focus();
                    }
                }, 0);
            });

            // 使得在 footer 的输入框获取焦点后，点击提示层外面，能关闭提示层
            Event.on(self.container, 'mouseleave', function() {
                mouseLeaveFooter = true;
            });

            // 点击在关闭按钮上
            Event.on(footer, 'click', function(ev) {
                if (DOM.hasClass(ev.target, CLOSE_BTN_CLS)) {
                    self.hide();
                }
            })
        },

        /**
         * click 选择 or enter 后，提交表单
         */
        _submitForm: function() {
            var self = this;

            // 注：对于键盘控制 enter 选择的情况，由 html 自身决定是否提交。否则会导致某些输入法下，用 enter 选择英文时也触发提交
            if (self.config.submitOnSelect) {
                var form = self.textInput.form;
                if (!form) return;

                if (self.fire(EVENT_BEFORE_SUBMIT, { form: form }) === false) return;

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

            bd.insertBefore(iframe, bd.firstChild);
        },

        /**
         * 设置 shim 的 left, top, width, height
         */
        _setShimRegion: function() {
            var self = this, container = self.container,
                style = container.style, shim = container.shim;
            if (shim) {
                //S.log([PARSEINT(style.left) - 2, style.top, PARSEINT(style.width) + 2, DOM.height(container)-2]);
                DOM.css(shim, {
                    left: PARSEINT(style.left) - 2, // -2 可以解决吞边线的 bug
                    top: style.top,
                    width: PARSEINT(style.width) + 2,
                    height: DOM.height(container) - 2
                });
            }
        },

        /**
         * 初始化样式
         */
        _initStyle: function() {
            var styleEl = DOM.get('#' + STYLE_ID);
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
                STYLE_ID);
        },

        /**
         * 初始化事件
         */
        _initEvent: function() {
            var self = this;

            // onresize 时，调整提示层的位置
            Event.on(win, 'resize', function() {
                self._setContainerRegion();
                self._setShimRegion();
                // 2010-08-04: 为了保持连贯，取消了定时器
            });
        },

        /**
         * 启动计时器，开始监听用户输入
         */
        start: function() {
            var self = this;
            if (self.fire(EVENT_BEFORE_START) === false) return;

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
            var self = this;

            Suggest.focusInstance = undefined;
            if (self._timer) self._timer.cancel();
            self._isRunning = false;
        },

        /**
         * 显示提示层
         */
        show: function() {
            var self = this;
            if (self.isVisible()) return;
            var container = self.container, shim = container.shim;

            // 每次显示前，都重新计算位置，这样能自适应 input 的变化（牺牲少量性能，满足更普适的需求）
            self._setContainerRegion();
            visible(container);

            if (shim) {
                self._setShimRegion();
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
                self._fillContainer();
                self.hide();
                return;
            }

            switch(self.config.dataType) {
                case 0:
                    if (self._dataCache[q] !== undefined) { // 1. 如果设置需要缓存标志 且已经有缓存数据时, 使用缓存中的
                        S.log('use cache');
                        self._fillContainer(self._dataCache[q]);
                        self._displayContainer();
                    } else { // 2. 请求服务器数据
                        S.log('no cache, data from server');
                        self._requestData();
                    }
                    break;
                case 1:
                    S.log('no cache, data always from server');
                    self._requestData();
                    break;
                case 2:
                    S.log('use static datasource');
                    self._handleResponse(self.dataSource[q]);
                    break;
            }
        },

        /**
         * 通过 script 元素异步加载数据
         */
        _requestData: function() {
            var self = this, config = self.config, script;
            //S.log('request data via script');

            if (!ie || ie9) self.dataScript = undefined; // IE不需要重新创建 script 元素

            if (!self.dataScript) {
                script = doc.createElement('script');
                script.charset = config.charset;
                script.async = true;

                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie || ie9) {
                    var t = S.now();
                    self._latestScriptTime = t;
                    DOM.attr(script, DATA_TIME, t);

                    Event.on(script, 'load', function() {
                        // 判断返回的数据是否已经过期
                        self._scriptDataIsOut = DOM.attr(script, DATA_TIME) != self._latestScriptTime;
                    });
                }
            }

            self.queryParams = config.queryName + '=' + encodeURIComponent(self.query);
            if (self.fire(EVENT_BEFORE_DATA_REQUEST) === false) return;

            // 注意：没必要加时间戳，是否缓存由服务器返回的Header头控制
            self.dataScript.src = self.dataSource + '&' + self.queryParams;
        },

        /**
         * 处理获取的数据
         * @param {Object} data
         */
        _handleResponse: function(data) {
            var self = this, formattedData,
                content = EMPTY, i, len, list, li, key, itemData;
            //S.log('handle response');

            if (self._scriptDataIsOut) return; // 抛弃过期数据，否则会导致 bug：1. 缓存 key 值不对； 2. 过期数据导致的闪屏

            self.returnedData = data;
            if (self.fire(EVENT_DATA_RETURN, { data: data }) === false) return;
            
            //渲染内容
			if(!self.config.contentRenderer){
				content = self._renderContent(data);
			}else{
				content = self.config.contentRenderer(data);
			}
			
            self._fillContainer(content);

            // fire event
            // 实际上是 beforeCache，但从用户的角度看，是 beforeShow
            // 这样可以保证重复内容不用重新生成，直接用缓存
            if (self.fire(EVENT_BEFORE_SHOW) === false) return;

            // cache
            if (!self.config.dataType) self._dataCache[self.query] = DOM.html(self.content);

            // 显示容器
            self._displayContainer();
        },
        /**
         * 渲染内容
         */		
        _renderContent:function(data){           
            var self = this, formattedData,
                content = EMPTY, i, len, list, li, key, itemData;
                

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
            return content;
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
                resultText;

            li.appendChild(DOM.create('<span>', {
                'class': KEY_EL_CLS,
                html: key
            }));

            if (result) {
                resultText = this.config.resultFormat.replace('%result%', result);
                if (S.trim(resultText)) { // 有值时才创建
                    li.appendChild(DOM.create('<span>', {
                        'class': RESULT_EL_CLS,
                        html: resultText
                    }));
                }
            }

            return li;
        },

        /**
         * 填充提示层容器
         */
        _fillContainer: function(content, footer) {
            var self = this;
            self._fillContent(content || EMPTY);
            self._fillFooter(footer || EMPTY);

            // bugfix: 更改容器内容时, 调整 shim 大小
            if (self.isVisible()) self._setShimRegion();
        },

        /**
         * 填充提示层内容层
         * @param {String|HTMLElement} html innerHTML or Child Node
         */
        _fillContent: function(html) {
            replaceContent(this.content, html);
            this.selectedItem = undefined; // 一旦重新填充了，selectedItem 就没了，需要重置
        },

        /**
         * 填充提示层底部
         */
        _fillFooter: function(html) {
            var self = this, cfg = self.config,
                footer = self.footer, closeBtn;

            replaceContent(footer, html);

            // 关闭按钮
            if (cfg['closeBtn']) {
                footer.appendChild(DOM.create('<a>', {
                    'class': CLOSE_BTN_CLS,
                    text: cfg.closeBtnText,
                    href: 'javascript: void(0)',
                    target: '_self' // bug fix: 覆盖<base target='_blank' />，否则会弹出空白页面
                }));
            }

            // 根据 query 参数，有可能填充不同的内容到 footer
            self.fire(EVENT_UPDATE_FOOTER, { footer: footer, query: self.query });

            // 无内容时，隐藏掉
            DOM.css(footer, DISPLAY, DOM.text(footer) ? EMPTY : NONE);
        },

        /**
         * 根据 contanier 的内容，显示或隐藏容器
         */
        _displayContainer: function() {
            var self = this;

            if (S.trim(DOM.text(self.container))) {
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
                items = DOM.query(li, self.container),
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
                //newSelectedItem = DOM[down ? 'next' : 'prev'](self.selectedItem);
				//如果选项被分散在多个ol中，不能直接next或prev获取 
                newSelectedItem = items[S.indexOf(self.selectedItem,items)+(down ? 1 : -1)];
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
            this.textInput.focus(); // 考虑从 footer 移动到 content 区域，需要重新聚焦
        },

        /**
         * 获取提示层中选中项的 key 字符串
         */
        _getSelectedItemKey: function() {
            var self = this;
            if (!self.selectedItem) return EMPTY;

            // getElementsByClassName 比较损耗性能，改用缓存数据到 attribute 上方法
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLS, '*', this.selectedItem)[0];
            //return keyEl.innerHTML;

            return DOM.attr(self.selectedItem, KEY);
        },

        /**
         * 将选中项的 key 值更新到 textInput
         */
        _updateInputFromSelectItem: function() {
            var self = this;
            self.textInput.value = self._getSelectedItemKey(self.selectedItem) || self.query; // 如果没有 key, 就用输入值
        }
    });

    function visible(elem) {
        elem.style.visibility = EMPTY;
    }

    function invisible(elem) {
        elem.style.visibility = HIDDEN;
    }

    function replaceContent(elem, html) {
        if (html.nodeType === 1) {
            DOM.html(elem, EMPTY);
            elem.appendChild(html);
        } else {
            DOM.html(elem, html);
        }
    }

    function initCallback(cbFn) {
        var parts = cbFn.split('.'), len = parts.length, o;

        // cbFn 有可能为 'goog.ac.h'
        if (len > 1) {
            cbFn = cbFn.replace(/^(.*)\..+$/, '$1');
            o = S.namespace(cbFn, true);
            o[parts[len - 1]] = callback;
        } else {
            win[cbFn] = callback;
        }
    }

    /**
     * 约定的全局回调函数
     */
    function callback(data) {
        if (!Suggest.focusInstance) return;
        // 保证先运行 script.onload 事件，然后再执行 callback 函数
        S.later(function() {
            Suggest.focusInstance._handleResponse(data);
        }, 0);
    }

    Suggest.version = 1.1;
    Suggest.callback = callback;
    S.Suggest=Suggest;
    return Suggest;

}, { requires: ['dom','event','ua'] });


/**
 * 小结：
 *
 * 整个组件代码，由两大部分组成：数据处理 + 事件处理
 *
 * 一、数据处理很 core，但相对来说是简单的，由 requestData + handleResponse + formatData 等辅助方法组成
 * 需要注意两点：
 *  a. IE 中, 改变 script.src, 会自动取消掉之前的请求，并发送新请求。非 IE 中，必须新创建 script 才行。这是
 *     requestData 方法中存在两种处理方式的原因。  --- IE9 中修改 src 不会发送新请求(qiaohua)
 *  b. 当网速很慢，数据返回时，用户的输入可能已改变，已经有请求发送出去，需要抛弃过期数据。目前采用加 data-time
 *     的解决方案。更好的解决方案是，调整 API，使得返回的数据中，带有 query 值。
 *
 * 二、事件处理看似简单，实际上有不少陷阱，分 2 部分：
 *  1. 输入框的 focus/blur 事件 + 键盘控制事件
 *  2. 提示层上的鼠标悬浮和点击事件
 * 需要注意以下几点：
 *  a. 因为点击提示层时，首先会触发输入框的 blur 事件，blur 事件中调用 hide 方法，提示层一旦隐藏后，就捕获不到
 *     点击事件了。因此有了 this._mouseHovering 来排除这种情况，使得 blur 时不会触发 hide, 在提示层的点击
 *     事件中自行处理。（2009-06-18 更新：采用 mouseup 来替代 click 事件，代码清晰简单了很多）（注：后来发现
 *     用 beforedeactive 方法可以阻止掉输入框的焦点丢失，逻辑更简单了）
 *  b. 当鼠标移动到某项或通过上下键选中某项时，给 this.selectedItem 赋值；当提示层的数据重新填充时，重置
 *     this.selectedItem. 这种处理方式和 google 的一致，可以使得选中某项，隐藏，再次打开时，依旧选中原来
 *     的选中项。
 *  c. 在 ie 等浏览器中，输入框中输入 ENTER 键时，会自动提交表单。如果 form.target='_blank', 自动提交和 JS 提交
 *     会打开两个提交页面。因此这里采取了在 JS 中不提交的策略，ENTER 键是否提交表单，完全由 HTML 代码自身决定。这
 *     样也能使得组件很容易应用在不需要提交表单的场景中。（2009-06-18 更新：可以通过 blur() 取消掉浏览器的默认
 *     Enter 响应，这样能使得代码逻辑和 mouseup 的一致）
 *  d. onItemSelect 仅在鼠标点击选择某项 和 键盘选中某项回车 后触发。
 *  e. 当 textInput 会触发表单提交时，在 enter keydown 和 keyup 之间，就会触发提交。因此在 keydown 中捕捉事件。
 *     并且在 keydown 中能捕捉到持续 DOWN/UP, 在 keyup 中就不行了。
 *
 * 【得到的一些编程经验】：
 *  1. 职责单一原则。方法的职责要单一，比如 hide 方法和 show 方法，除了改变 visibility, 就不要拥有其它功能。这
 *     看似简单，真要做到却并不容易。保持职责单一，保持简单的好处是，代码的整体逻辑更清晰，方法的可复用性也提
 *     高了。
 *  2. 小心事件处理。当事件之间有关联时，要仔细想清楚，设计好后再写代码。比如输入框的 blur 和提示层的 click 事件。
 *  3. 测试的重要性。目前是列出 Test Cases，以后要尝试自动化。保证每次改动后，都不影响原有功能。
 *  4. 挑选正确的事件做正确的事，太重要了，能省去很多很多烦恼。
 *
 */

/**
 * 2009-08-05 更新： 将 class 从配置项中移动到常量，原因是：修改默认 className 的可能性很小，仅保留一个
 *                  containerCls 作为个性化样式的接口即可。
 *
 * 2009-12-10 更新： 采用 kissy module 组织代码。为了避免多个沙箱下，对全局回调函数覆盖定义引发的问题，
 *                  采用共享模式。
 *
 * 2010-03-10 更新： 去除共享模式，适应 kissy 新的代码组织方式。
 *
 * 2010-08-04 更新： 去掉对 yahoo-dom-event 的依赖，仅依赖 ks-core. 调整了部分 public api, 扩展更容易了。
 *
 * 2011-05-22 更新： fool2fish<fool2fish@gmail.com>新增部分完全向后兼容的功能
 *                   1. 对于开放配置config.contentRenderer，接收content的渲染函数，返回渲染后的dom节点，规定item必须为li
 *                   2. 改进上下方向键选择item的代码逻辑
 */
