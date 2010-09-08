/**
 * Dialog
 * @creator     乔花<qiaohua@taobao.com>
 * @date        2010.08.25
 * @version     1.0
 */
KISSY.add('dialog', function(S, undefined) {

    var DOM = S.DOM,
        Event = S.Event,
        Overlay = S.Overlay,
        DOT = '.',
        DIV = '<div>',
        CLS_PREFIX = 'ks-dialog-',
        CLOSE_CLS = CLS_PREFIX+'close',
        HEAD_CLS = CLS_PREFIX+'hd',
        FOOT_CLS = CLS_PREFIX+'fd',

        /**
         * Dialog 默认配置: 含有head, ft 包含关闭按钮, 在可视区域居中对齐, 显示背景层, 固定滚动
         */
        defaultConfig = {
            hdContent: 'header',                  // 头部内容, 为空时, 表示不需要这部分
            bdContent: '正在加载...',
            ftContent: '',                  // 尾部, 为空时, 表示不需要这部分

            width: 400,
            height: 300,
            close: true,            // 显示关闭按钮
            closeCls: CLOSE_CLS,
            hdCls: HEAD_CLS,
            ftCls: FOOT_CLS
        };

    /*
     * DOM
     * <body>
     *  <div class="{{KS_OVERLAY_CLS}}">
     *      <div class="{{HEAD_CLS}}"></div>
     *      <div class="{{BODYY_CLS}}"></div>
     *      <div class="{{FOOT_CLS}}"></div>
     *  </div>
     * </body>
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

    S.extend(Dialog, S.Overlay);
    S.Dialog = Dialog;

    S.augment(Dialog, S.EventTarget, {
        _prepareMarkup: function(){
            var self = this,
                config = self.config;

            Dialog.superclass._prepareMarkup.call(self);

            self.head = S.get(DOT+config.hdCls, self.container);
            self.foot = S.get(DOT+config.ftCls, self.container);

            if (config.hdContent||config.close) {
                if (!self.head) {
                    self.head = DOM.create(DIV, { 'class': config.hdCls });
                    DOM.insertBefore(self.head, self.body);
                }
                self.setHdContent(config.hdContent);

                var close = DOM.create(DIV, { 'class': config.closeCls });
                if (config.close) self.head.appendChild(close);

                Event.on(close, 'click', function(e) {
                    e.halt();
                    self.hide();
                });
            }

            if (config.ftContent) {
                if (!self.foot) {
                    self.foot = DOM.create(DIV, { 'class': config.ftCls });
                    self.container.appendChild(self.foot);
                }
                self.setFdContent(config.ftContent);
            }
        },

        setHdContent: function(head) {
            DOM.html(this.head, head);
        },

        setFtContent: function(foot) {
            DOM.html(this.foot, foot);
        }
    });
}, { host: 'overlay' } );


/**
 * NOTES:
 *  201008
 *      - 在Overlay基础上扩展Dialog
 *  TODO:
 *      -
 */

