/**
 * animation using css transition
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require, exports, module) {
    function upperCase() {
        return arguments[1].toUpperCase();
    }

    var RE_DASH = /-([a-z])/ig;
    var propertyPrefixes = [
            'Webkit',
            'Moz',
            'O',
            // ms is special .... !
            'ms'
        ],
        propertyPrefixesLength = propertyPrefixes.length;
    var vendorInfos = {};
    var documentElementStyle = document.documentElement.style;

    function getVendorInfo(name) {
        if (name.indexOf('-') !== -1) {
            name = name.replace(RE_DASH, upperCase);
        }
        if (name in vendorInfos) {
            return vendorInfos[name];
        }
        // if already prefixed or need not to prefix
        if (!documentElementStyle || name in documentElementStyle) {
            vendorInfos[name] = {
                propertyName: name,
                propertyNamePrefix: ''
            };
        } else {
            var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1),
                vendorName;

            for (var i = 0; i < propertyPrefixesLength; i++) {
                var propertyNamePrefix = propertyPrefixes[i];
                vendorName = propertyNamePrefix + upperFirstName;
                if (vendorName in documentElementStyle) {
                    vendorInfos[name] = {
                        propertyName: vendorName,
                        propertyNamePrefix: propertyNamePrefix
                    };
                }
            }

            vendorInfos[name] = vendorInfos[name] || null;
        }
        return  vendorInfos[name];
    }

    /**
     * animation using css transition
     * @author yiminghe@gmail.com
     * @ignore
     */
    var util = S;
    var Dom = require('dom');
    var AnimBase = require('./base');
    var transitionVendorInfo = getVendorInfo('transition');
    var TRANSITION = transitionVendorInfo.propertyName;
    var DEFAULT_EASING = 'linear';
    var css3Anim = {
        ease: 1,
        linear: 1,
        'ease-in': 1,
        'ease-out': 1,
        'ease-in-out': 1
    };

    function genTransition(propsData) {
        var str = '';
        util.each(propsData, function (propData, prop) {
            if (str) {
                str += ',';
            }
            str += prop + ' ' + propData.duration + 's ' +
                propData.easing + ' ' + propData.delay + 's';
        });
        return str;
    }

    function unCamelCase(propertyName) {
        return propertyName.replace(/[A-Z]/g, function (m) {
            return '-' + m.toLowerCase();
        });
    }

    function TransitionAnim(node, to, duration, easing, complete) {
        var self = this;
        if (!(self instanceof  TransitionAnim)) {
            return new TransitionAnim(node, to, duration, easing, complete);
        }
        TransitionAnim.superclass.constructor.apply(self, arguments);
    }

    util.extend(TransitionAnim, AnimBase, {
        prepareFx: function () {
            var self = this,
                propsData = self._propsData;
            var newProps = {};
            var val;
            var vendorInfo;
            for (var propertyName in propsData) {
                val = propsData[propertyName];
                if (typeof val.easing === 'string') {
                    if (!util.startsWith(val.easing, 'cubic-bezier') && !css3Anim[val.easing]) {
                        val.easing = DEFAULT_EASING;
                    }
                } else {
                    val.easing = DEFAULT_EASING;
                }
                vendorInfo = getVendorInfo(propertyName);
                if (!vendorInfo) {
                    S.log('unsupported css property for transition anim: ' + propertyName, 'error');
                    continue;
                }
                newProps[unCamelCase(vendorInfo.propertyName)] = propsData[propertyName];
            }
            self._propsData = newProps;
        },

        doStart: function () {
            var self = this,
                node = self.node,
                elStyle = node.style,
                _propsData = self._propsData,
                original = elStyle[TRANSITION],
                totalDuration = 0,
                propsCss = {};

            util.each(_propsData, function (propData, prop) {
                var v = propData.value;
                // hack, for to reflow?
                Dom.css(node, prop, Dom.css(node, prop));
                propsCss[prop] = v;
                totalDuration = Math.max(propData.duration + propData.delay, totalDuration);
            });

            // chrome none
            // firefox none 0s ease 0s
            if (original.indexOf('none') !== -1) {
                original = '';
            } else if (original) {
                original += ',';
            }

            elStyle[TRANSITION] = original + genTransition(_propsData);

            // bug when set left on relative element
            setTimeout(function () {
                Dom.css(node, propsCss);
            }, 0);

            // timer is more reliable and can deal with short hand css properties
            self._transitionEndTimer = setTimeout(function () {
                self.stop(true);
            }, totalDuration * 1000);
        },

        beforeResume: function () {
            // note: pause/resume in css transition is not smooth as js timer
            // already run time before pause
            var self = this,
                propsData = self._propsData,
                tmpPropsData = util.merge(propsData),
                runTime = self._runTime / 1000;
            util.each(tmpPropsData, function (propData, prop) {
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

        doStop: function (finish) {
            var self = this,
                node = self.node,
                elStyle = node.style,
                _propsData = self._propsData,
                propList = [],
                clear,
                propsCss = {};

            if (self._transitionEndTimer) {
                clearTimeout(self._transitionEndTimer);
                self._transitionEndTimer = null;
            }

            util.each(_propsData, function (propData, prop) {
                if (!finish) {
                    propsCss[prop] = Dom.css(node, prop);
                }
                propList.push(prop);
            });

            // firefox need set transition and need set none
            clear = util.trim(elStyle[TRANSITION]
                .replace(new RegExp('(^|,)' + '\\s*(?:' + propList.join('|') + ')\\s+[^,]+', 'gi'),
                '$1'))
                .replace(/^,|,,|,$/g, '') || 'none';

            elStyle[TRANSITION] = clear;
            Dom.css(node, propsCss);
        }
    });

    util.mix(TransitionAnim, AnimBase.Statics);

// bad
    module.exports = TransitionAnim;
    /*
     refer:
     - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
     */
});
/*
 refer:
 - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties
 */