/**
 * KISSY.Dialog
 * @creator  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        DOT = '.', DIV = '<div>', EMPTY = '', HEADER = 'header', FOOTER = 'footer',

        CLS_CONTAINER = 'ks-overlay ks-dialog',
        CLS_PREFIX = 'ks-dialog-',

        /*
         * DOM 结构
         *  <div class="ks-overlay ks-dialog">
         *      <div class="ks-dialog-hd">
         *          <div class="ks-dialog-close"></div>
         *      </div>
         *      <div class="ks-dialog-bd"></div>
         *      <div class="ks-dialog-ft"></div>
         *  </div>
         */
        defaultConfig = {
            containerCls: CLS_CONTAINER,
            bdCls: CLS_PREFIX + 'bd',

            width: 400,
            height: 300
        };

    Dialog.ATTRS = {
        header: {                // 头部内容
            value: EMPTY
        },
        footer: {                // 尾部内容
            value: EMPTY
        },

        hdCls: {                // 头部元素的 class
            value: CLS_PREFIX + 'hd'
        },
        ftCls: {                // 尾部元素的 class
            value: CLS_PREFIX + 'ft'
        },

        closeBtnCls: {          // 关闭按钮的 class
            value: CLS_PREFIX + 'close'
        },
        closable: {             // 是否需要关闭按钮
            value: true
        }
    };
    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.header
     *  - this.footer
     *  - this.manager
     *  - this.ID
     */
    function Dialog(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Dialog)) {
            return new Dialog(container, config);
        }

        config = config || { };
        if (S.isPlainObject(container)) config = container;
        else config.container = container;

        Dialog.superclass.constructor.call(self, S.merge(defaultConfig, config));

        /**
         * 对话框管理器
         * @type {Object}
         */
        self.manager = S.DialogManager;
        /**
         * 对话框唯一 ID
         * @type {number}
         */
        self.ID = self.manager.register(self);
    }

    S.extend(Dialog, S.Overlay);
    
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {
        _onAttrChanges: function() {
            var self = this;

            Dialog.superclass._onAttrChanges.call(self);

            self.on('afterHeaderChange', function(e) {
                DOM.html(self.header, e.newVal);
            });
            self.on('afterFooterChange', function(e) {
                DOM.html(self.footer, e.newVal);
            });
        },

        _prepareMarkup: function() {
            var self = this,
                footer,
                hdCls = self.get('hdCls'), ftCls = self.get('ftCls');

            Dialog.superclass._prepareMarkup.call(self);

            /**
             * 对话框头
             * @type {Element}
             */
            self.header = S.get(DOT + hdCls, self.container);
            if (!self.header) {
                self.header = DOM.create(DIV, { 'class': hdCls });
                DOM.insertBefore(self.header, self.body);
            }
            DOM.html(self.header, self.get(HEADER));

            if (footer = self.get(FOOTER)) {
                /**
                 * 对话框尾
                 * @type {Element}
                 */
                self.footer = S.get(DOT + ftCls, self.container);
                if (!self.footer) {
                    self.footer = DOM.create(DIV, { 'class': ftCls });
                    self.container.appendChild(self.footer);
                }
                DOM.html(self.footer, footer);
            }

            if (self.get('closable')) self._initClose();
        },

        /**
         * 初始化关闭按钮
         * @private
         */
        _initClose: function() {
            var self = this,
                elem = DOM.create(DIV, { 'class': self.get('closeBtnCls') });

            DOM.html(elem, 'close');
            
            Event.on(elem, 'click', function(e) {
                e.halt();
                self.hide();
            });

            self.header.appendChild(elem);
        },

        /**
         * 设置头部内容
         * @param {string} html
         * @deprecated set('header', html)
         */
        setHeader: function(html) {
            this.set(HEADER, html);
        },

        /**
         * 设置尾部内容
         * @param {string} html
         * @deprecated set('footer', html)
         */
        setFooter: function(html) {
            this.set(FOOTER, html);
        }
    });

    S.DialogManager = {
        /**
         * 注册 dialog 对象
         * @param dlg
         */
        register: function(dlg) {
            if (dlg instanceof Dialog) {
                var id = S.guid();
                this._dialog[id] = dlg;
                return id;
            }
            return -1;
        },

        /**
         * 保存所有 dialog 对象
         * @type {Object.<number, Object>}
         */
        _dialog: {},

        /**
         * 隐藏所有
         */
        hideAll: function() {
            S.each(this._dialog, function(dlg) {
                dlg && dlg.hide();
            })
        },
        /**
         * 根据 id 获取 dialog 对象
         * @param {number} id
         * @return {Object} Dialog 实例
         */
        get: function(id) {
            if (!id) return undefined;
            try{
                return this._dialog[id];
            } catch(e) {
                return undefined;
            }
        }
    };

}, { host: 'overlay' });



