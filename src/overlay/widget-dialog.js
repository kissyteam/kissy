/**
 * KISSY.Dialog
 * @creator  玉伯<lifesinger@gmail.com>, 乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    var DOM = S.DOM, Event = S.Event,

        DOT = '.', DIV = '<div>', EMPTY = '',

        CLS_CONTAINER = 'ks-overlay ks-dialog',
        CLS_PREFIX = 'ks-dialog-',

        defaultConfig = {
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
            header: EMPTY,
            footer: EMPTY,

            containerCls: CLS_CONTAINER,
            hdCls: CLS_PREFIX + 'hd',
            bdCls: CLS_PREFIX + 'bd',
            ftCls: CLS_PREFIX + 'ft',
            closeBtnCls: CLS_PREFIX + 'close',

            width: 400,
            height: 300,
            closable: true
        };

    Dialog.ATTRS = {
        header: {
            value: EMPTY
        },
        footer: {
            value: EMPTY
        }
    };
    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.header
     *  - this.footer
     *  - this.manager
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

        self.manager = S.DialogManager;
        self.dialogID = self.manager.register(self) || -1;

        // attrs event
        self.on('afterHeaderChange', function(e) {
            DOM.html(self.header, e.newVal);
        });
        self.on('afterFooterChange', function(e) {
            DOM.html(self.footer, e.newVal);
        });
    }

    S.extend(Dialog, S.Overlay);
    
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {
        _prepareMarkup: function() {
            var self = this,
                config = self.config;

            Dialog.superclass._prepareMarkup.call(self);

            self.header = S.get(DOT + config.hdCls, self.container);
            if (!self.header) {
                self.header = DOM.create(DIV, { 'class': config.hdCls });
                DOM.insertBefore(self.header, self.body);
            }
            self.setHeader(config.header);

            if (config.footer) {
                self.footer = S.get(DOT + config.ftCls, self.container);
                if (!self.footer) {
                    self.footer = DOM.create(DIV, { 'class': config.ftCls });
                    self.container.appendChild(self.footer);
                }
                self.setFooter(config.footer);
            }

            if (config.closable) self._initClose();
        },

        /**
         * 初始化关闭按钮
         * @private
         */
        _initClose: function() {
            var self = this, config = self.config,
                elem = DOM.create(DIV, { 'class': config.closeBtnCls });

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
         */
        setHeader: function(html) {
            this.set('header', html);
        },

        /**
         * 设置尾部内容
         * @param {string} html
         */
        setFooter: function(html) {
            this.set('footer', html);
        }
    });

    S.DialogManager = {
        register: function(dlg) {
            if (dlg instanceof Dialog) {
                var id = S.guid();
                this._dialog[id] = dlg;
                return id;
            }
        },

        _dialog: {},

        hideAll: function() {
            S.each(this._dialog, function(dlg) {
                dlg && dlg.hide();
            })
        }
    };

}, { host: 'overlay' });



