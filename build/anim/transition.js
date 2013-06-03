/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 3 15:03
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 anim/transition
*/

/**
 * animation using css transition
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/transition', function (S, DOM, Event, AnimBase) {

    var vendorPrefix = S.Features.getTransitionPrefix();
    var TRANSITION_END_EVENT = vendorPrefix ?
        // webkitTransitionEnd !
        (vendorPrefix.toLowerCase() + 'TransitionEnd') :
        'transitionend';
    var TRANSITION = S.Features.getTransitionProperty();

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
                node = self.node,
                elStyle = node.style,
                _propsData = self._propsData,
                original = elStyle[TRANSITION],
                propsCss = {};

            S.each(_propsData, function (propData, prop) {
                var v = propData.value,
                    currentValue = DOM.css(node, prop);
                if (typeof v == 'number') {
                    currentValue = parseFloat(currentValue);
                }
                if (currentValue == v) {
                    // browser does not trigger _onTransitionEnd if from is same with to
                    setTimeout(function () {
                        self._onTransitionEnd({
                            originalEvent: {
                                propertyName: prop
                            }
                        });
                    }, 0);
                }
                propsCss[prop] = v;
            });
            // chrome none
            // firefox none 0s ease 0s
            if (original.indexOf('none') != -1) {
                original = '';
            } else if (original) {
                original += ',';
            }

            // S.log('before start: '+original);
            elStyle[TRANSITION] = original + genTransition(_propsData);
            // S.log('after start: '+elStyle[TRANSITION]);

            Event.on(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);

            DOM.css(node, propsCss);
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
                allFinished = 1,
                propsData = self._propsData;
            // other anim on the same element
            if (!propsData[e.propertyName]) {
                return;
            }
            propsData[e.propertyName].finished = 1;
            S.each(propsData, function (propData) {
                if (!propData.finished) {
                    allFinished = 0;
                    return false;
                }
                return undefined;
            });
            if (allFinished) {
                self.stop(true);
            }
        },

        doStop: function (finish) {
            var self = this,
                node = self.node,
                elStyle = node.style,
                _propsData = self._propsData,
                propList = [],
                clear,
                propsCss = {};

            Event.detach(node, TRANSITION_END_EVENT, self._onTransitionEnd, self);
            S.each(_propsData, function (propData, prop) {
                if (!finish) {
                    propsCss[prop] = DOM.css(node, prop);
                }
                propList.push(prop);
            });

            // firefox need set transition and need set none
            clear = S.trim(elStyle[TRANSITION]
                    .replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'),
                        '$1'))
                .replace(/^,|,,|,$/g, '') || 'none';

            // S.log('before end: '+elStyle[TRANSITION]);
            elStyle[TRANSITION] = clear;
            // S.log('after end: '+elStyle[TRANSITION]);


            DOM.css(node, propsCss);
        }
    });

    return TransitionAnim;

}, {
    requires: ['dom', 'event', './base']
});

