/**
 * KISSY.Dialog
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    var DOM = S.DOM, Event = S.Event,

        DOT = '.', DIV = '<div>',

        CLS_CONTAINER = 'ks-overlay ks-dialog',
        CLS_PREFIX = 'ks-dialog-',

        defaultConfig = {
            title: '',
            containerCls: CLS_CONTAINER,
            hdCls: CLS_PREFIX + 'hd',
            bdCls: CLS_PREFIX + 'bd',
            ftCls: CLS_PREFIX + 'ft',
            closeBtnCls: CLS_PREFIX + 'close',
            width: 400,
            height: 300,
            closable: true
        };

    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.header
     *  - this.footer
     */
    function Dialog(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Dialog)) {
            return new Dialog(container, config);
        }
        Dialog.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Dialog, S.Overlay);
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {

        _prepareMarkup: function() {
            var self = this,
                config = self.config;

            Dialog.superclass._prepareMarkup.call(self);

            self.head = S.get(DOT + config.hdCls, self.container);
            self.foot = S.get(DOT + config.ftCls, self.container);

            if (config.hdContent || config.close) {
                if (!self.head) {
                    self.head = DOM.create(DIV, { 'class': config.hdCls });
                    DOM.insertBefore(self.head, self.body);
                }
                self.setHdContent(config.hdContent);
                if(config.closable) self._initClose();
            }

            if (config.ftContent) {
                if (!self.foot) {
                    self.foot = DOM.create(DIV, { 'class': config.ftCls });
                    self.container.appendChild(self.foot);
                }
                self.setFooter(config.ftContent);
            }
        },

        _initClose: function() {
            var self = this, config = self.config,
                elem = DOM.create(DIV, { 'class': config.closeBtnCls });

            DOM.html(elem, 'close');
            
            Event.on(elem, 'click', function(e) {
                e.halt();
                self.hide();
            });

            self.head.appendChild(elem);
        },

        setHeader: function(html) {
            DOM.html(this.header, html);
        },

        setFooter: function(html) {
            DOM.html(this.footer, html);
        }
    });

}, { host: 'overlay' });

