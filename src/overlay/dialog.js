/**
 * KISSY.Dialog
 * @creator     乔花<qiaohua@taobao.com>
 */
KISSY.add('dialog', function(S) {

    var DOM = S.DOM,
        Event = S.Event,
        Overlay = S.Overlay,
        DOT = '.',
        DIV = '<div>',
        CLS_PREFIX = 'ks-dialog-',
        CLS_CLOSE = CLS_PREFIX + 'close',
        CLS_HEAD = CLS_PREFIX + 'hd',
        CLS_FOOT = CLS_PREFIX + 'fd',

        /**
         * Dialog 默认配置: 含有head, ft 包含关闭按钮, 在可视区域居中对齐, 显示背景层, 固定滚动
         */
        defaultConfig = {
            hdContent: '',                  // 头部内容, 为空时, 表示不需要这部分
            bdContent: '',
            ftContent: '',                  // 尾部, 为空时, 表示不需要这部分

            width: 400,
            height: 300,

            closable: true,            // 显示关闭按钮
            closeBtnCls: CLS_CLOSE,

            hdCls: CLS_HEAD,
            ftCls: CLS_FOOT
        };

    /*
     * DOM
     *  <div class="{{KS_OVERLAY_CLS}}">
     *      <div class="{{HEAD_CLS}}"></div>
     *      <div class="{{BODY_CLS}}"></div>
     *      <div class="{{FOOT_CLS}}"></div>
     *  </div>
     */

    /**
     * Dialog Class
     * @constructor
     * attached members：
     *  - this.head
     *  - this.foot
     */
    function Dialog(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Dialog)) {
            return new Dialog(container, config);
        }
        Dialog.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Dialog, Overlay);
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
                self.setFtContent(config.ftContent);
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

        setHdContent: function(head) {
            DOM.html(this.head, head);
        },

        setFtContent: function(foot) {
            DOM.html(this.foot, foot);
        }
    });

}, { host: 'overlay' });

