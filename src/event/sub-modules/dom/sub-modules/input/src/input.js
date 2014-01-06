/**
 * @ignore
 * html input event polyfill
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var DomEvent = require('event/dom/base');
    var Dom = require('dom');
    var noop = S.noop;
    var Special = DomEvent.Special;

    function canFireInput(n) {
        var nodeName = (n.nodeName || '').toLowerCase();
        if (nodeName === 'textarea') {
            return true;
        } else if (nodeName === 'input') {
            return n.type === 'text' || n.type === 'password';
        }
        return false;
    }

    Special.input = {
        setup: function () {
            var el = this;
            if (canFireInput(el)) {
                DomEvent.on(el, 'propertychange', propertyChange);
            } else {
                // if bind on parentNode, lazy bind event to its form elements
                DomEvent.on(el, 'beforeactivate', beforeActivate);
            }
        },
        tearDown: function () {
            var el = this;
            if (canFireInput(el)) {
                DomEvent.remove(el, 'propertychange', propertyChange);
            } else {
                DomEvent.remove(el, 'beforeactivate', beforeActivate);
                Dom.query('textarea,input', el).each(function (fel) {
                    if (fel.__inputHandler) {
                        fel.__inputHandler = 0;
                        DomEvent.remove(fel, 'input', noop);
                    }
                });
            }
        }
    };

    function propertyChange(e) {
        if (e.originalEvent.propertyName === 'value' &&
            /*jshint eqeqeq:false*/
            this.ownerDocument.activeElement == this) {
            DomEvent.fire(this, 'input');
        }
    }

    function beforeActivate(e) {
        debugger
        var t = e.target;
        if (canFireInput(t) && !t.__inputHandler) {
            t.__inputHandler = 1;
            // start input monitor
            DomEvent.on(t, 'input', noop);
        }
    }
});