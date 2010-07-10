/*
Copyright 2010, KISSY UI Library v1.0.8
MIT Licensed
build: 846 Jul 11 00:10
*/
/**
 * ��ʾ��ȫ���
 * @module      suggest
 * @creator     ��<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("suggest", function(S, undefined) {

    var YDOM = YAHOO.util.Dom, DOM = S.DOM, Event = S.Event,
        win = window, doc = document,
        head = doc.getElementsByTagName("head")[0],
        ie = YAHOO.env.ua.ie, ie6 = (ie === 6),

        CALLBACK_STR = "g_ks_suggest_callback", // Լ����ȫ�ֻص�����
        STYLE_ID = "ks-suggest-style", // ��ʽ style Ԫ�ص� id

        CONTAINER_CLASS = "ks-suggest-container",
        KEY_EL_CLASS = "ks-suggest-key", // ��ʾ���У�key Ԫ�ص� class
        RESULT_EL_CLASS = "ks-suggest-result", // ��ʾ���У�result Ԫ�ص� class
        SELECTED_ITEM_CLASS = "selected", // ��ʾ���У�ѡ����� class
        ODD_ITEM_CLASS = "odd", // ��ʾ���У�������� class
        EVEN_ITEM_CLASS = "even", // ��ʾ���У�ż����� class
        BOTTOM_CLASS = "ks-suggest-bottom",
        CLOSE_BTN_CLASS = "ks-suggest-close-btn",
        SHIM_CLASS = "ks-suggest-shim", // iframe shim �� class

        EVENT_DATA_REQUEST = "dataRequest",
        EVENT_DATA_RETURN = "dataReturn",
        EVENT_SHOW = "show",
        EVENT_ITEM_SELECT = "itemSelect",

        /**
         * Suggest��Ĭ������
         */
        defaultConfig = {
            /**
             * �û����Ӹ�����ʾ��� class
             *
             * ��ʾ���Ĭ�Ͻṹ���£�
             * <div class="suggest-container [container-class]">
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
            containerCls: "",

            /**
             * ��ʾ��Ŀ��
             * ע�⣺Ĭ������£���ʾ��Ŀ�Ⱥ�input�����Ŀ�ȱ���һ��
             * ʾ��ȡֵ��"200px", "10%"�ȣ������λ
             * @type String
             */
            containerWidth: "auto",

            /**
             * result�ĸ�ʽ
             * @type String
             */
            resultFormat: "Լ%result%�����",

            /**
             * �Ƿ���ʾ�رհ�ť
             * @type Boolean
             */
            showCloseBtn: false,

            /**
             * �رհ�ť�ϵ�����
             * @type String
             */
            closeBtnText: "�ر�",

            /**
             * �Ƿ���Ҫiframe shim
             * @type Boolean
             */
            useShim: ie6,

            /**
             * ��ʱ������ʱ
             * @type Number
             */
            timerDelay: 200,

            /**
             * ��ʼ�����Զ�����
             * @type Boolean
             */
            autoFocus: false,

            /**
             * ��������ѡ��ʱ���Ƿ��Զ��ύ�?
             * @type Boolean
             */
            submitFormOnClickSelect: true
        };

    /**
     * ��ʾ��ȫ���
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
         * �ı������
         * @type HTMLElement
         */
        self.textInput = S.get(textInput);

        /**
         * ��ȡ��ݵ�URL �� JSON��ʽ�ľ�̬���
         * @type {String|Object}
         */
        self.dataSource = dataSource;

        /**
         * JSON��̬���Դ
         * @type Object ��ʽΪ {"query1" : [["key1", "result1"], []], "query2" : [[], []]}
         */
        self.JSONDataSource = S.isPlainObject(dataSource) ? dataSource : null;

        /**
         * ͨ��jsonp���ص����
         * @type Object
         */
        self.returnedData = null;

        /**
         * ���ò���
         * @type Object
         */
        self.config = S.merge(defaultConfig, config || { });

        /**
         * �����ʾ��Ϣ������
         * @type HTMLElement
         */
        self.container = null;

        /**
         * ������ֵ
         * @type String
         */
        self.query = "";

        /**
         * ��ȡ���ʱ�Ĳ���
         * @type String
         */
        self.queryParams = "";

        /**
         * �ڲ���ʱ��
         * @private
         * @type Object
         */
        self._timer = null;

        /**
         * ��ʱ���Ƿ�������״̬
         * @private
         * @type Boolean
         */
        self._isRunning = false;

        /**
         * ��ȡ��ݵ�scriptԪ��
         * @type HTMLElement
         */
        self.dataScript = null;

        /**
         * ��ݻ���
         * @private
         * @type Object
         */
        self._dataCache = {};

        /**
         * ����script��ʱ���
         * @type String
         */
        self._latestScriptTime = "";

        /**
         * script���ص�����Ƿ��Ѿ�����
         * @type Boolean
         */
        self._scriptDataIsOut = false;

        /**
         * �Ƿ��ڼ���ѡ��״̬
         * @private
         * @type Boolean
         */
        self._onKeyboardSelecting = false;

        /**
         * ��ʾ��ĵ�ǰѡ����
         * @type Boolean
         */
        self.selectedItem = null;

        // init
        self._init();
    }

    S.mix(Suggest.prototype, {
        /**
         * ��ʼ������
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
         * ��ʼ�������
         * @protected
         */
        _initTextInput: function() {
            var self = this;

            // turn off autocomplete
            self.textInput.setAttribute("autocomplete", "off");

            // focus
            // 2009-12-10 yubo: �ӳٵ� keydown �� start
            //            Event.on(this.textInput, "focus", function() {
            //                instance.start();
            //            });

            // blur
            Event.on(self.textInput, "blur", function() {
                self.stop();
                self.hide();
            });

            // auto focus
            if (self.config.autoFocus) self.textInput.focus();

            // keydown
            // ע������Ŀǰ����Opera9.64�У����뷨����ʱ�����ɲ��ᴥ���κμ����¼�
            var pressingCount = 0; // ����סĳ��ʱ��������keydown����ע��Operaֻ�ᴥ��һ�Ρ�
            Event.on(self.textInput, "keydown", function(ev) {
                var keyCode = ev.keyCode;
                //console.log("keydown " + keyCode);

                switch (keyCode) {
                    case 27: // ESC��������ʾ�㲢��ԭ��ʼ����
                        self.hide();
                        self.textInput.value = self.query;

                        // �������Ϊ��ʱ������ ESC �������ʧȥ����
                        if(self.query.length === 0) {
                            self.textInput.blur();
                        }
                        break;
                    case 13: // ENTER��
                        // �ύ�?ǰ����������ʾ�㲢ֹͣ��ʱ��
                        self.textInput.blur(); // ��һ�仹������ֹ���������Ĭ���ύ�¼�

                        // ����Ǽ���ѡ��ĳ���س�������onItemSelect�¼�
                        if (self._onKeyboardSelecting) {
                            if (self.textInput.value == self._getSelectedItemKey()) { // ȷ��ֵƥ��
                                self.fire(EVENT_ITEM_SELECT);
                            }
                        }

                        // �ύ�?
                        self._submitForm();
                        break;
                    case 40: // DOWN��
                    case 38: // UP��
                        // ��ס��ʱ����ʱ����
                        if (pressingCount++ == 0) {
                            if (self._isRunning) self.stop();
                            self._onKeyboardSelecting = true;
                            self.selectItem(keyCode === 40);

                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        break;
                }

                // �� DOWN/UP ��ʱ��������ʱ��
                if (keyCode != 40 && keyCode != 38) {
                    if (!self._isRunning) {
                        // 1. �����ٽ���js��δ������ʱ���û����ܾ��Ѿ���ʼ����
                        //    ��ʱ��focus�¼��Ѿ����ᴥ������Ҫ��keyup�ﴥ����ʱ��
                        // 2. ��DOWN/UP��ʱ����Ҫ���ʱ��
                        self.start();
                    }
                    self._onKeyboardSelecting = false;
                }
            });

            // reset pressingCount
            Event.on(self.textInput, "keyup", function() {
                //console.log("keyup");
                pressingCount = 0;
            });
        },

        /**
         * ��ʼ����ʾ������
         * @protected
         */
        _initContainer: function() {
            // create
            var container = doc.createElement("div"),
                customContainerClass = this.config.containerCls;

            container.className = CONTAINER_CLASS;
            if (customContainerClass) {
                container.className += " " + customContainerClass;
            }
            container.style.position = "absolute";
            container.style.visibility = "hidden";
            this.container = container;

            this._setContainerRegion();
            this._initContainerEvent();

            // append
            doc.body.insertBefore(container, doc.body.firstChild);
        },

        /**
         * ����������left, top, width
         * @protected
         */
        _setContainerRegion: function() {
            var self = this,
                r = YDOM.getRegion(self.textInput),
                left = r.left,
                w = r.right - left - 2;  // ��ȥborder��2px

            // bug fix: w Ӧ���ж����Ƿ���� 0, ������� width ��ʱ�����С�� 0, ie �»ᱨ������Ч�Ĵ���
            w = w > 0 ? w : 0;

            // ie8 ����ģʽ
            // document.documentMode:
            // 5 - Quirks Mode
            // 7 - IE7 Standards
            // 8 - IE8 Standards
            var docMode = doc.documentMode;
            if (docMode === 7 && (ie === 7 || ie === 8)) {
                left -= 2;
            } else if (S.UA.gecko) { // firefox����ƫһ���� ע���� input ���ڵĸ��������� margin: auto ʱ�����
                left++;
            }

            self.container.style.left = left + "px";
            self.container.style.top = r.bottom + "px";

            if (self.config.containerWidth == "auto") {
                self.container.style.width = w + "px";
            } else {
                self.container.style.width = self.config.containerWidth;
            }
        },

        /**
         * ��ʼ�������¼�
         * ��Ԫ�ض����������¼���ð�ݵ�����ͳһ����
         * @protected
         */
        _initContainerEvent: function() {
            var self = this;

            // ����¼�
            Event.on(self.container, "mousemove", function(ev) {
                //console.log("mouse move");
                var target = ev.target;

                if (target.nodeName != "LI") {
                    target = YDOM.getAncestorByTagName(target, "li");
                }
                if (YDOM.isAncestor(self.container, target)) {
                    if (target != self.selectedItem) {
                        // �Ƴ��ϵ�
                        self._removeSelectedItem();
                        // �����µ�
                        self._setSelectedItem(target);
                    }
                }
            });

            var mouseDownItem = null;
            Event.on(self.container, 'mousedown', function(e) {
                // ��갴�´���item
                mouseDownItem = e.target;

                // ��갴��ʱ��������򲻻�ʧȥ����
                // 1. for IE
                self.textInput.onbeforedeactivate = function() {
                    win.event.returnValue = false;
                    self.textInput.onbeforedeactivate = null;
                };
                // 2. for W3C
                return false;
            });

            // mouseup�¼�
            Event.on(self.container, "mouseup", function(ev) {
                // ��mousedown����ʾ�㣬��mouseup����ʾ����ʱ�������Ч
                if (!self._isInContainer([ev.pageX, ev.pageY])) return;

                var target = ev.target;
                // ����ʾ��A�������꣬�ƶ���B���ͷţ�������onItemSelect
                if (target != mouseDownItem) return;

                // ����ڹرհ�ť��
                if (target.className == CLOSE_BTN_CLASS) {
                    self.hide();
                    return;
                }

                // ���ܵ����li����Ԫ����
                if (target.nodeName != "LI") {
                    target = YDOM.getAncestorByTagName(target, "li");
                }
                // ��������container�ڲ���li��
                if (YDOM.isAncestor(self.container, target)) {
                    self._updateInputFromSelectItem(target);

                    // ����ѡ���¼�
                    //console.log("on item select");
                    self.fire(EVENT_ITEM_SELECT);

                    // �ύ�?ǰ����������ʾ�㲢ֹͣ��ʱ��
                    self.textInput.blur();

                    // �ύ�?
                    self._submitForm();
                }
            });
        },

        /**
         * clickѡ�� or enter���ύ�?
         */
        _submitForm: function() {
            // ע�����ڼ��̿���enterѡ����������html��������Ƿ��ύ������ᵼ��ĳЩ���뷨�£���enterѡ��Ӣ��ʱҲ�����ύ
            if (this.config.submitFormOnClickSelect) {
                var form = this.textInput.form;
                if (!form) return;

                // ͨ��js�ύ�?ʱ�����ᴥ��onsubmit�¼�
                // ��Ҫjs�Լ�����
                if (doc.createEvent) { // w3c
                    var evObj = doc.createEvent("MouseEvents");
                    evObj.initEvent("submit", true, false);
                    form.dispatchEvent(evObj);
                }
                else if (doc.createEventObject) { // ie
                    form.fireEvent("onsubmit");
                }

                form.submit();
            }
        },

        /**
         * �ж�p�Ƿ�����ʾ����
         * @param {Array} p [x, y]
         */
        _isInContainer: function(p) {
            var r = YDOM.getRegion(this.container);
            return p[0] >= r.left && p[0] <= r.right && p[1] >= r.top && p[1] <= r.bottom;
        },

        /**
         * ���������iframe shim��
         * @protected
         */
        _initShim: function() {
            var iframe = doc.createElement("iframe");
            iframe.src = "about:blank";
            iframe.className = SHIM_CLASS;
            iframe.style.position = "absolute";
            iframe.style.visibility = "hidden";
            iframe.style.border = "none";
            this.container.shim = iframe;

            this._setShimRegion();
            doc.body.insertBefore(iframe, doc.body.firstChild);
        },

        /**
         * ����shim��left, top, width
         * @protected
         */
        _setShimRegion: function() {
            var container = this.container, shim = container.shim;
            if (shim) {
                shim.style.left = (parseInt(container.style.left) - 2) + "px"; // ����̱���bug
                shim.style.top = container.style.top;
                shim.style.width = (parseInt(container.style.width) + 2) + "px";
            }
        },

        /**
         * ��ʼ����ʽ
         * @protected
         */
        _initStyle: function() {
            var styleEl = S.get('#' + STYLE_ID);
            if (styleEl) return; // ��ֹ���ʵ��ʱ�ظ����

            var style = ".ks-suggest-container{background:white;border:1px solid #999;z-index:99999}"
                + ".ks-suggest-shim{z-index:99998}"
                + ".ks-suggest-container li{color:#404040;padding:1px 0 2px;font-size:12px;line-height:18px;float:left;width:100%}"
                + ".ks-suggest-container li.selected{background-color:#39F;cursor:default}"
                + ".ks-suggest-key{float:left;text-align:left;padding-left:5px}"
                + ".ks-suggest-result{float:right;text-align:right;padding-right:5px;color:green}"
                + ".ks-suggest-container li.selected span{color:#FFF;cursor:default}"
                // + ".ks-suggest-container li.selected .suggest-result{color:green}"
                + ".ks-suggest-bottom{padding:0 5px 5px}"
                + ".ks-suggest-close-btn{float:right}"
                + ".ks-suggest-container li,.suggest-bottom{overflow:hidden;zoom:1;clear:both}"
                /* hacks */
                + ".ks-suggest-container{*margin-left:2px;_margin-left:-2px;_margin-top:-3px}";

            DOM.addStyleSheet(style, STYLE_ID);
        },

        /**
         * window.onresizeʱ��������ʾ���λ��
         * @protected
         */
        _initResizeEvent: function() {
            var self = this, resizeTimer;

            Event.on(win, "resize", function() {
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
         * ������ʱ������ʼ�����û�����
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
         * ֹͣ��ʱ��
         */
        stop: function() {
            Suggest.focusInstance = null;
            clearTimeout(this._timer);
            this._isRunning = false;
        },

        /**
         * ��ʾ��ʾ��
         */
        show: function() {
            if (this.isVisible()) return;
            var container = this.container, shim = container.shim;

            container.style.visibility = "";

            if (shim) {
                if (!shim.style.height) { // ��һ����ʾʱ����Ҫ�趨�߶�
                    var r = YDOM.getRegion(container);
                    shim.style.height = (r.bottom - r.top - 2) + "px";
                }
                shim.style.visibility = "";
            }
        },

        /**
         * ������ʾ��
         */
        hide: function() {
            if (!this.isVisible()) return;
            var container = this.container, shim = container.shim;
            //console.log("hide");

            if (shim) shim.style.visibility = "hidden";
            container.style.visibility = "hidden";
        },

        /**
         * ��ʾ���Ƿ���ʾ
         */
        isVisible: function() {
            return this.container.style.visibility != "hidden";
        },

        /**
         * ������ʾ������
         */
        updateContent: function() {
            var self = this;
            if (!self._needUpdate()) return;
            //console.log("update data");

            self._updateQueryValueFromInput();
            var q = self.query;

            // 1. ����Ϊ��ʱ��������ʾ��
            if (!S.trim(q).length) {
                self._fillContainer("");
                self.hide();
                return;
            }

            if (self._dataCache[q] !== undefined) { // 2. ʹ�û������
                //console.log("use cache");
                self.returnedData = "using cache";
                self._fillContainer(self._dataCache[q]);
                self._displayContainer();

            } else if (self.JSONDataSource) { // 3. ʹ��JSON��̬���Դ
                self.handleResponse(self.JSONDataSource[q]);

            } else { // 4. ������������
                self.requestData();
            }
        },

        /**
         * �Ƿ���Ҫ�������
         * @protected
         * @return Boolean
         */
        _needUpdate: function() {
            // ע�⣺����ո�Ҳ���б仯
            return this.textInput.value != this.query;
        },

        /**
         * ͨ��scriptԪ�ؼ������
         */
        requestData: function() {
            var self = this;
            
            //console.log("request data via script");
            if (!ie) self.dataScript = null; // IE����Ҫ���´���scriptԪ��

            if (!self.dataScript) {
                var script = doc.createElement("script");
                script.charset = "utf-8";

                // jQuery ajax.js line 275:
                // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
                // This arises when a base node is used.
                head.insertBefore(script, head.firstChild);
                self.dataScript = script;

                if (!ie) {
                    var t = new Date().getTime();
                    self._latestScriptTime = t;
                    script.setAttribute("time", t);

                    Event.on(script, "load", function() {
                        //console.log("on load");
                        // �жϷ��ص�����Ƿ��Ѿ�����
                        self._scriptDataIsOut = script.getAttribute("time") != self._latestScriptTime;
                    });
                }
            }

            // ע�⣺û��Ҫ��ʱ������Ƿ񻺴��ɷ��������ص�Headerͷ����
            self.queryParams = "q=" + encodeURIComponent(self.query) + "&code=utf-8&callback=" + CALLBACK_STR;
            self.fire(EVENT_DATA_REQUEST);
            self.dataScript.src = self.dataSource + "?" + self.queryParams;
        },

        /**
         * �����ȡ�����
         * @param {Object} data
         */
        handleResponse: function(data) {
            var self = this;
            
            //console.log("handle response");
            if (self._scriptDataIsOut) return; // ���������ݣ�����ᵼ��bug��1. ����keyֵ���ԣ� 2. ������ݵ��µ�����

            self.returnedData = data;
            self.fire(EVENT_DATA_RETURN);

            // ��ʽ�����
            self.returnedData = self.formatData(self.returnedData);

            // ������
            var content = "";
            var len = self.returnedData.length;
            if (len > 0) {
                var list = doc.createElement("ol");
                for (var i = 0; i < len; ++i) {
                    var itemData = self.returnedData[i];
                    var li = self.formatItem(itemData["key"], itemData["result"]);
                    // ����keyֵ��attribute��
                    li.setAttribute("key", itemData["key"]);
                    // �����ż class
                    DOM.addClass(li, i % 2 ? EVEN_ITEM_CLASS : ODD_ITEM_CLASS);
                    list.appendChild(li);
                }
                content = list;
            }
            self._fillContainer(content);

            // ������ʱ����ӵײ�
            if (len > 0) self.appendBottom();

            // fire event
            if (S.trim(self.container.innerHTML)) {
                // ʵ������beforeCache�������û��ĽǶȿ�����beforeShow
                self.fire(EVENT_SHOW);
            }

            // cache
            self._dataCache[self.query] = self.container.innerHTML;

            // ��ʾ����
            self._displayContainer();
        },

        /**
         * ��ʽ���������ݶ���Ϊ��׼��ʽ
         * @param {Object} data ��ʽ������3�֣�
         *  1. {"result" : [["key1", "result1"], ["key2", "result2"], ...]}
         *  2. {"result" : ["key1", "key2", ...]}
         *  3. 1��2�����
         *  4. ��׼��ʽ
         *  5. ����1-4�У�ֱ��ȡo["result"]��ֵ
         * @return Object ��׼��ʽ����ݣ�
         *  [{"key" : "key1", "result" : "result1"}, {"key" : "key2", "result" : "result2"}, ...]
         */
        formatData: function(data) {
            var arr = [];
            if (!data) return arr;
            if (S.isArray(data["result"])) data = data["result"];
            var len = data.length;
            if (!len) return arr;

            var item;
            for (var i = 0; i < len; ++i) {
                item = data[i];

                if (typeof item === "string") { // ֻ��keyֵʱ
                    arr[i] = {"key" : item};
                } else if (S.isArray(item) && item.length >= 2) { // ["key", "result"] ȡ����ǰ2��
                    arr[i] = {"key" : item[0], "result" : item[1]};
                } else {
                    arr[i] = item;
                }
            }
            return arr;
        },

        /**
         * ��ʽ�������
         * @param {String} key ��ѯ�ַ�
         * @param {Number} result ��� �ɲ���
         * @return {HTMLElement}
         */
        formatItem: function(key, result) {
            var li = doc.createElement("li");
            var keyEl = doc.createElement("span");
            keyEl.className = KEY_EL_CLASS;
            keyEl.appendChild(doc.createTextNode(key));
            li.appendChild(keyEl);

            if (result !== undefined) { // ����û��
                var resultText = this.config.resultFormat.replace("%result%", result);
                if (S.trim(resultText)) { // ��ֵʱ�Ŵ���
                    var resultEl = doc.createElement("span");
                    resultEl.className = RESULT_EL_CLASS;
                    resultEl.appendChild(doc.createTextNode(resultText));
                    li.appendChild(resultEl);
                }
            }

            return li;
        },

        /**
         * �����ʾ��ײ�
         */
        appendBottom: function() {
            var bottom = doc.createElement("div");
            bottom.className = BOTTOM_CLASS;

            if (this.config.showCloseBtn) {
                var closeBtn = doc.createElement("a");
                closeBtn.href = "javascript: void(0)";
                closeBtn.setAttribute("target", "_self"); // bug fix: ����<base target="_blank" />������ᵯ���հ�ҳ��
                closeBtn.className = CLOSE_BTN_CLASS;
                closeBtn.appendChild(doc.createTextNode(this.config.closeBtnText));

                bottom.appendChild(closeBtn);
            }

            // ����������ʱ�����
            if (S.trim(bottom.innerHTML)) {
                this.container.appendChild(bottom);
            }
        },

        /**
         * �����ʾ��
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

            // һ����������ˣ�selectedItem��û�ˣ���Ҫ����
            this.selectedItem = null;
        },

        /**
         * ���contanier�����ݣ���ʾ����������
         */
        _displayContainer: function() {
            if (S.trim(this.container.innerHTML)) {
                this.show();
            } else {
                this.hide();
            }
        },

        /**
         * ѡ����ʾ���е���/��һ����
         * @param {Boolean} down true��ʾdown��false��ʾup
         */
        selectItem: function(down) {
            var self = this;
            
            //console.log("select item " + down);
            var items = self.container.getElementsByTagName("li");
            if (items.length == 0) return;

            // �п�����ESC�����ˣ�ֱ����ʾ����
            if (!self.isVisible()) {
                self.show();
                return; // ����ԭ����ѡ��״̬
            }
            var newSelectedItem;

            // û��ѡ����ʱ��ѡ�е�һ/�����
            if (!self.selectedItem) {
                newSelectedItem = items[down ? 0 : items.length - 1];
            } else {
                // ѡ����/��һ��
                newSelectedItem = YDOM[down ? "getNextSibling" : "getPreviousSibling"](self.selectedItem);
                // �Ѿ��������/ǰһ��ʱ����λ������򣬲���ԭ����ֵ
                if (!newSelectedItem) {
                    self.textInput.value = self.query;
                }
            }

            // �Ƴ�ǰѡ����
            self._removeSelectedItem();

            // ѡ������
            if (newSelectedItem) {
                self._setSelectedItem(newSelectedItem);
                self._updateInputFromSelectItem();
            }
        },

        /**
         * �Ƴ�ѡ����
         * @protected
         */
        _removeSelectedItem: function() {
            //console.log("remove selected item");
            DOM.removeClass(this.selectedItem, SELECTED_ITEM_CLASS);
            this.selectedItem = null;
        },

        /**
         * ���õ�ǰѡ����
         * @protected
         * @param {HTMLElement} item
         */
        _setSelectedItem: function(item) {
            //console.log("set selected item");
            DOM.addClass(item, SELECTED_ITEM_CLASS);
            this.selectedItem = item;
        },

        /**
         * ��ȡ��ʾ����ѡ�����key�ַ�
         * @protected
         */
        _getSelectedItemKey: function() {
            if (!this.selectedItem) return "";

            // getElementsByClassName�Ƚ�������ܣ����û�����ݵ�attribute�Ϸ���
            //var keyEl = Dom.getElementsByClassName(KEY_EL_CLASS, "*", this.selectedItem)[0];
            //return keyEl.innerHTML;

            return this.selectedItem.getAttribute("key");
        },

        /**
         * ��textInput��ֵ���µ�this.query
         * @protected
         */
        _updateQueryValueFromInput: function() {
            this.query = this.textInput.value;
        },

        /**
         * ��ѡ�����ֵ���µ�textInput
         * @protected
         */
        _updateInputFromSelectItem: function() {
            this.textInput.value = this._getSelectedItemKey(this.selectedItem);
        }

    });

    S.mix(Suggest.prototype, S.EventTarget);

    /**
     * Լ����ȫ�ֻص�����
     */
    win[CALLBACK_STR] = function(data) {
        if (!Suggest.focusInstance) return;
        // ʹ�������� script.onload �¼���Ȼ����ִ�� callback ����
        setTimeout(function() {
            Suggest.focusInstance.handleResponse(data);
        }, 0);
    };

    S.Suggest = Suggest;
});


/**
 * С�᣺
 *
 * ���������룬�����󲿷���ɣ���ݴ��� + �¼�����
 *
 * һ����ݴ����core���������˵�Ǽ򵥵ģ��� requestData + handleResponse + formatData�ȸ������
 * ��Ҫע�����㣺
 *  a. IE�У��ı�script.src, ���Զ�ȡ���֮ǰ�����󣬲����������󡣷�IE�У������´���script���С�����
 *     requestData�����д������ִ��?ʽ��ԭ��
 *  b. �����ٺ�����ݷ���ʱ���û�����������Ѹı䣬�Ѿ��������ͳ�ȥ����Ҫ���������ݡ�Ŀǰ���ü�ʱ���
 *     �Ľ����������õĽ�������ǣ�����API��ʹ�÷��ص�����У�����queryֵ��
 *
 * �����¼����?�Ƽ򵥣�ʵ�����в������壬��2���֣�
 *  1. ������focus/blur�¼� + ���̿����¼�
 *  2. ��ʾ���ϵ������͵���¼�
 * ��Ҫע�����¼��㣺
 *  a. ��Ϊ�����ʾ��ʱ�����Ȼᴥ��������blur�¼���blur�¼��е���hide��������ʾ��һ�����غ󣬾Ͳ��񲻵�
 *     ����¼��ˡ�������� this._mouseHovering ���ų����������ʹ��blurʱ���ᴥ��hide������ʾ��ĵ��
 *     �¼������д��?��2009-06-18���£�����mouseup�����click�¼�������������˺ࣩܶ
 *  b. ������ƶ���ĳ���ͨ�����¼�ѡ��ĳ��ʱ����this.selectedItem��ֵ������ʾ�������������ʱ������
 *     this.selectedItem. ���ִ��?ʽ��google��һ�£�����ʹ��ѡ��ĳ����أ��ٴδ�ʱ������ѡ��ԭ��
 *     ��ѡ���
 *  c. ��ie��������У������������ENTER��ʱ�����Զ��ύ�?�����form.target="_blank", �Զ��ύ��JS�ύ
 *     ��������ύҳ�档��������ȡ����JS�в��ύ�Ĳ��ԣ�ENTER���Ƿ��ύ�?����ȫ��HTML���������������
 *     ��Ҳ��ʹ�����������Ӧ���ڲ���Ҫ�ύ�?�ĳ����С���2009-06-18���£�����ͨ��blur()ȡ����������Ĭ��
 *     Enter��Ӧ��������ʹ�ô����߼���mouseup��һ�£�
 *  d. onItemSelect ���������ѡ��ĳ�� �� ����ѡ��ĳ��س� �󴥷���
 *  e. ��textInput�ᴥ���?�ύʱ����enter keydown �� keyup֮�䣬�ͻᴥ���ύ�������keydown�в�׽�¼���
 *     ������keydown���ܲ�׽������DOWN/UP����keyup�оͲ����ˡ�
 *
 * ���õ���һЩ��̾��顿��
 *  1. ְ��һԭ�򡣷�����ְ��Ҫ��һ������hide������show���������˸ı�visibility, �Ͳ�Ҫӵ�������ܡ���
 *     ���Ƽ򵥣���Ҫ����ȴ�������ס�����ְ��һ�����ּ򵥵ĺô��ǣ�����������߼����������Ŀɸ�����Ҳ��
 *     ���ˡ�
 *  2. С���¼����?���¼�֮���й���ʱ��Ҫ��ϸ���������ƺú���д���롣����������blur����ʾ���click�¼���
 *  3. ���Ե���Ҫ�ԡ�Ŀǰ���г�Test Cases���Ժ�Ҫ�����Զ�������֤ÿ�θĶ��󣬶���Ӱ��ԭ�й��ܡ�
 *  4. ��ѡ��ȷ���¼�����ȷ���£�̫��Ҫ�ˣ���ʡȥ�ܶ�ܶෳ�ա�
 *
 */

/**
 * 2009-08-05 ���£� �� class �����������ƶ���������ԭ���ǣ��޸�Ĭ�� className �Ŀ����Ժ�С��������һ��
 *                  containerCls ��Ϊ���Ի���ʽ�Ľӿڼ���
 *
 * 2009-12-10 ���£� ���� kissy module ��֯���롣Ϊ�˱�����ɳ���£���ȫ�ֻص�����Ƕ���������⣬
 *                  ���ù���ģʽ��
 *
 * 2010-03-10 ���£� ȥ����ģʽ����Ӧ kissy �µĴ�����֯��ʽ��
 */
