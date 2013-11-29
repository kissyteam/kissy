/**
 * @ignore
 * mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var UA = S.UA,
        Node = require('node'),
        ie6 = (UA.ie === 6),
        $ = Node.all;

    function docWidth() {
        return  ie6 ? ('expression(KISSY.DOM.docWidth())') : '100%';
    }

    function docHeight() {
        return ie6 ? ('expression(KISSY.DOM.docHeight())') : '100%';
    }

    function initMask(self, hiddenCls) {
        var maskCls = self.view.getBaseCssClasses('mask'),
            mask = $('<div ' +
                ' style="width:' + docWidth() + ';' +
                'left:0;' +
                'top:0;' +
                'height:' + docHeight() + ';' +
                'position:' + (ie6 ? 'absolute' : 'fixed') + ';"' +
                ' class="' +
                maskCls + ' ' + hiddenCls +
                '">' +
                (ie6 ? '<' + 'iframe ' +
                    'style="position:absolute;' +
                    'left:' + '0' + ';' +
                    'top:' + '0' + ';' +
                    'background:red;' +
                    'width: expression(this.parentNode.offsetWidth);' +
                    'height: expression(this.parentNode.offsetHeight);' +
                    'filter:alpha(opacity=0);' +
                    'z-index:-1;"></iframe>' : '') +
                '</div>')
                .prependTo('body');
        /*
         点 mask 焦点不转移
         */
        mask.unselectable();
        mask.on('mousedown', function (e) {
            e.preventDefault();
        });
        return mask;
    }

    /**
     * @class KISSY.Overlay.Extension.Mask
     * Mask extension class. Make component to be able to show with mask.
     */
    function Mask() {
    }

    Mask.ATTRS = {
        /**
         * Whether show mask layer when component shows and effect
         *
         * for example:
         *
         *      {
         *          // whether hide current component when click on mask
         *          closeOnClick: false,
         *          effect: 'fade', // slide
         *          duration: 0.5,
         *          easing: 'easingNone'
         *      }
         *
         * @cfg {Boolean|Object} mask
         */
        /**
         * @ignore
         */
        mask: {
            value: false
        },
        /**
         * Mask node of current component.
         * @type {KISSY.NodeList}
         * @property maskNode
         * @readonly
         */
        /**
         * @ignore
         */
        maskNode: {
        }
    };

    var NONE = 'none',
        effects = {fade: ['Out', 'In'], slide: ['Up', 'Down']};

    function setMaskVisible(self, shown) {
        var maskNode = self.get('maskNode'),
            hiddenCls = self.view.getBaseCssClasses('mask-hidden');
        if (shown) {
            maskNode.removeClass(hiddenCls);
        } else {
            maskNode.addClass(hiddenCls);
        }
    }

    function processMask(mask, el, show, self) {

        var effect = mask.effect || NONE;

        setMaskVisible(self, show);

        if (effect === NONE) {
            return;
        }

        var duration = mask.duration,
            easing = mask.easing,
            m,
            index = show ? 1 : 0;

        // run complete fn to restore window's original height
        el.stop(1, 1);

        el.css('display', show ? NONE : 'block');

        m = effect + effects[effect][index];

        el[m](duration, function () {
            el.css('display', '');
        }, easing);
    }

    function afterVisibleChange(e) {
        var v,
            self = this,
            maskNode = self.get('maskNode');
        if ((v = e.newVal)) {
            var elZIndex = Number(self.$el.css('z-index'));
            if (!isNaN(elZIndex)) {
                maskNode.css('z-index', elZIndex);
            }
        }
        processMask(self.get('mask'), maskNode, v, self);
    }

    Mask.prototype = {
        __renderUI: function () {
            var self = this;
            if (self.get('mask')) {
                self.set('maskNode', initMask(self, self.get('visible') ? '' : self.view.getBaseCssClasses('mask-hidden')));
            }
        },

        __bindUI: function () {
            var self = this,
                maskNode,
                mask;
            if ((mask = self.get('mask'))) {
                maskNode = self.get('maskNode');
                if (mask.closeOnClick) {
                    maskNode.on(Node.Gesture.tap, self.close, self);
                }
                self.on('afterVisibleChange', afterVisibleChange);
            }
        },

        __destructor: function () {
            var mask;
            if ((mask = this.get('maskNode'))) {
                mask.remove();
            }
        }
    };

    return Mask;
});