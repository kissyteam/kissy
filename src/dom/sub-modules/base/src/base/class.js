/**
 * batch class operation
 * @ignore
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Dom = require('./api');
    var slice = [].slice,
        NodeType = Dom.NodeType,
        RE_SPLIT = /[\.\s]\s*\.?/;

    function strToArray(str) {
        str = S.trim(str || '');
        var arr = str.split(RE_SPLIT),
            newArr = [], v,
            l = arr.length,
            i = 0;
        for (; i < l; i++) {
            if ((v = arr[i])) {
                newArr.push(v);
            }
        }
        return newArr;
    }

    function batchClassList(method) {
        return function (elem, classNames) {
            var i, l,
                className,
                classList = elem.classList,
                extraArgs = slice.call(arguments, 2);
            for (i = 0, l = classNames.length; i < l; i++) {
                if ((className = classNames[i])) {
                    classList[method].apply(classList, [className].concat(extraArgs));
                }
            }
        };
    }

    function batchEls(method) {
        return function (selector, className) {
            var classNames = strToArray(className),
                extraArgs = slice.call(arguments, 2);
            Dom.query(selector).each(function (elem) {
                if (elem.nodeType === NodeType.ELEMENT_NODE) {
                    Dom[method].apply(Dom, [elem, classNames].concat(extraArgs));
                }
            });
        };
    }

    S.mix(Dom,
        /**
         * @override KISSY.DOM
         * @class
         * @singleton
         */
        {
            _hasClass: function (elem, classNames) {
                var i, l, className, classList = elem.classList;
                if (classList.length) {
                    for (i = 0, l = classNames.length; i < l; i++) {
                        className = classNames[i];
                        if (className && !classList.contains(className)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },

            _addClass: batchClassList('add'),

            _removeClass: batchClassList('remove'),

            _toggleClass: batchClassList('toggle'),

            /**
             * Determine whether any of the matched elements are assigned the given classes.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} className One or more class names to search for.
             * multiple class names is separated by space
             * @return {Boolean}
             */
            hasClass: function (selector, className) {
                var ret = false;
                className = strToArray(className);
                Dom.query(selector).each(function (elem) {
                    if (elem.nodeType === NodeType.ELEMENT_NODE &&
                        Dom._hasClass(elem, className)) {
                        ret = true;
                        return false;
                    }
                    return undefined;
                });
                return ret;
            },

            /**
             * Replace a class with another class for matched elements.
             * If no oldClassName is present, the newClassName is simply added.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} oldClassName One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             * @param {String} newClassName One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            replaceClass: function (selector, oldClassName, newClassName) {
                Dom.removeClass(selector, oldClassName);
                Dom.addClass(selector, newClassName);
            },

            /**
             * Adds the specified class(es) to each of the set of matched elements.
             * @method
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             */
            addClass: batchEls('_addClass'),

            /**
             * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @method
             * @param {String} className One or more class names to be removed from the class attribute of each matched element.
             * multiple class names is separated by space
             */
            removeClass: batchEls('_removeClass'),

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param {HTMLElement|String|HTMLElement[]} selector matched elements
             * @param {String} className One or more class names to be added to the class attribute of each matched element.
             * multiple class names is separated by space
             * @method
             */
            toggleClass: batchEls('_toggleClass')
            // @param [state] {Boolean} optional boolean to indicate whether class
            // should be added or removed regardless of current state.
            // latest firefox/ie10 does not support
        });

    return Dom;

});

/*
 http://jsperf.com/kissy-classlist-vs-classname 17157:14741
 http://jsperf.com/kissy-1-3-vs-jquery-on-dom-class 15721:15223

 NOTES:
 - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */