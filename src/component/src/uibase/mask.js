/**
 * @fileOverview mask extension for kissy
 * @author yiminghe@gmail.com
 */
KISSY.add("component/uibase/mask", function () {

    /**
     * @name Mask
     * @class
     * Mask extension class.
     * Make component to be able to show with mask.
     * @memberOf Component.UIBase
     */
    function Mask() {
    }

    Mask.ATTRS =
    /**
     * @lends Component.UIBase.Mask#
     */
    {
        /**
         * Whether show mask layer when component shows
         * @type {Boolean|Object}
         */
        mask: {
            view: 1
        },
        maskNode: {
            view: 1
        }
    };

    var NONE = 'none',
        effects = {fade: ["Out", "In"], slide: ["Up", "Down"]};

    function processMask(mask, el, show) {
        var effect = mask.effect || NONE;

        if (effect == NONE) {
            el[show ? 'show' : 'hide']();
            return;
        }

        var duration = mask.duration,
            easing = mask.easing,
            m,
            index = show ? 1 : 0;

        // run complete fn to restore window's original height
        el.stop(1, 1);

        m = effect + effects[effect][index];
        el[m](duration, null, easing);
    }

    Mask.prototype = {

        __bindUI: function () {
            var self = this,
                maskNode,
                mask,
                view = self.get("view");
            if (mask = self.get("mask")) {
                maskNode = self.get('maskNode');
                self.on('afterVisibleChange', function (e) {
                    processMask(mask, maskNode, e.newVal)
                });
            }
        }
    };


    return Mask;
}, {requires: ["ua"]});