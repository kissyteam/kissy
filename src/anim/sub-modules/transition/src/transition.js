/**
 * animation using css transition
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/transition', function (S, DOM, Event, AnimBase) {

    function hypen(str) {
        return str.replace(/[A-Z]/g, function (m) {
            return '-' + (m.toLowerCase());
        })
    }

    var vendorPrefix = S.Features.getTransitionPrefix();
    var TRANSITION_END_EVENT = vendorPrefix ?
        (vendorPrefix.toLowerCase() + 'TransitionEnd') :
        'transitionend';

    vendorPrefix = vendorPrefix ? (hypen(vendorPrefix) + '-') : '';
    var TRANSITION = vendorPrefix + 'transition';
//    var TRANSITION_PROPERTY = vendorPrefix + 'transition-property';
//    var TRANSITION_DURATION = vendorPrefix + 'transition-duration';
//    var TRANSITION_TIMING_FUNCTION = vendorPrefix + 'transition-timing-function';
//    var TRANSITION_DELAY = vendorPrefix + 'transition-delay';

    // firefox set transition
    // set transition-property/duration is unstable

    function genTransition(propsData) {
        var str = '';
        S.each(propsData, function (propData, prop) {
            if (str) {
                str += ',';
            }
            str += prop + ' ' + propData.duration +
                's ' + propData.easing + ' ' + propData.delay + 's';
        });
        return str;
    }

    function TransitionAnim(config) {
        TransitionAnim.superclass.constructor.apply(this, arguments);
    }

    S.extend(TransitionAnim, AnimBase, {

        doStart: function () {
            var self = this,
                el = self.el,
                elStyle = el.style,
                _propsData = self._propsData,
                propsCss = {};

            S.each(_propsData, function (propData, prop) {
                propsCss[prop] = propData.value;
            });

            elStyle[TRANSITION] = genTransition(_propsData);

            Event.on(el, TRANSITION_END_EVENT, self._onTransitionEnd, self);

            DOM.css(el, propsCss);
        },

        beforeResume: function () {
            // note: pause/resume in css transition is not smooth as js timer
            // already run time before pause
            var self = this,
                propsData = self._propsData,
                tmpPropsData = S.merge(propsData),
                runTime = self._runTime / 1000;
            S.each(tmpPropsData, function (propData, prop) {
                var tRunTime = runTime;
                if (propData.delay >= tRunTime) {
                    propData.delay -= tRunTime;
                } else {
                    tRunTime -= propData.delay;
                    propData.delay = 0;
                    if (propData.duration >= tRunTime) {
                        propData.duration -= tRunTime;
                    } else {
                        delete propsData[prop];
                    }
                }
            });
        },

        _onTransitionEnd: function (e) {
            e = e.originalEvent;
            var self = this,
                propsData = self._propsData;
            delete propsData[e.propertyName];
            if (S.isEmptyObject(propsData)) {
                self.stop(true);
            }
        },

        doStop: function (finish) {
            var self = this,
                el = self.el,
                elStyle = el.style,
                _propsData = self._propsData,
                propList = [],
                clear,
                propsCss = {};

            Event.detach(el, TRANSITION_END_EVENT, self._onTransitionEnd, self);
            S.each(_propsData, function (propData, prop) {
                if (!finish) {
                    propsCss[prop] = DOM.css(el, prop);
                }
                propList.push(prop);
            });

            // firefox need set transition and need set none
            clear = S.trim(elStyle[TRANSITION]
                    .replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'),
                        '$1'))
                .replace(/^,|,,|,$/g, '') || 'none';

            elStyle[TRANSITION] = clear;
            DOM.css(el, propsCss);
        }
    });

    return TransitionAnim;

}, {
    requires: ['dom', 'event', './base']
});