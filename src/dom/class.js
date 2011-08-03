/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom/class', function(S, DOM, undefined) {

    var SPACE = ' ',
        REG_SPLIT = /[\.\s]\s*\.?/,
        REG_CLASS = /[\n\t]/g;

    function norm(elemClass) {
        return (SPACE + elemClass + SPACE).replace(REG_CLASS, SPACE);
    }

    S.mix(DOM, {

            /**
             * Determine whether any of the matched elements are assigned the given class.
             */
            hasClass: function(selector, value) {
                return batch(selector, value, function(elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (elemClass) {
                        var className = norm(elemClass),
                            j = 0,
                            ret = true;
                        for (; j < cl; j++) {
                            if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                ret = false;
                                break;
                            }
                        }
                        if (ret) {
                            return true;
                        }
                    }
                }, true);
            },

            /**
             * Adds the specified class(es) to each of the set of matched elements.
             */
            addClass: function(selector, value) {
                batch(selector, value, function(elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (!elemClass) {
                        elem.className = value;
                    } else {
                        var className = norm(elemClass),
                            setClass = elemClass,
                            j = 0;
                        for (; j < cl; j++) {
                            if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                setClass += SPACE + classNames[j];
                            }
                        }
                        elem.className = S.trim(setClass);
                    }
                }, undefined);
            },

            /**
             * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
             */
            removeClass: function(selector, value) {
                batch(selector, value, function(elem, classNames, cl) {
                    var elemClass = elem.className;
                    if (elemClass) {
                        if (!cl) {
                            elem.className = '';
                        } else {
                            var className = norm(elemClass),
                                j = 0,
                                needle;
                            for (; j < cl; j++) {
                                needle = SPACE + classNames[j] + SPACE;
                                // 一个 cls 有可能多次出现：'link link2 link link3 link'
                                while (className.indexOf(needle) >= 0) {
                                    className = className.replace(needle, SPACE);
                                }
                            }
                            elem.className = S.trim(className);
                        }
                    }
                }, undefined);
            },

            /**
             * Replace a class with another class for matched elements.
             * If no oldClassName is present, the newClassName is simply added.
             */
            replaceClass: function(selector, oldClassName, newClassName) {
                DOM.removeClass(selector, oldClassName);
                DOM.addClass(selector, newClassName);
            },

            /**
             * Add or remove one or more classes from each element in the set of
             * matched elements, depending on either the class's presence or the
             * value of the switch argument.
             * @param state {Boolean} optional boolean to indicate whether class
             *        should be added or removed regardless of current state.
             */
            toggleClass: function(selector, value, state) {
                var isBool = S.isBoolean(state), has;

                batch(selector, value, function(elem, classNames, cl) {
                    var j = 0, className;
                    for (; j < cl; j++) {
                        className = classNames[j];
                        has = isBool ? !state : DOM.hasClass(elem, className);
                        DOM[has ? 'removeClass' : 'addClass'](elem, className);
                    }
                }, undefined);
            }
        });

    function batch(selector, value, fn, resultIsBool) {
        if (!(value = S.trim(value))) {
            return resultIsBool ? false : undefined;
        }

        var elems = DOM.query(selector),
            len = elems.length,
            tmp = value.split(REG_SPLIT),
            elem,
            ret;

        var classNames = [];
        for (var i=0; i < tmp.length; i++) {
            var t = S.trim(tmp[i]);
            if (t) {
                classNames.push(t);
            }
        }
        for (i=0; i < len; i++) {
            elem = elems[i];
            if (DOM._isElementNode(elem)) {
                ret = fn(elem, classNames, classNames.length);
                if (ret !== undefined) {
                    return ret;
                }
            }
        }

        if (resultIsBool) {
            return false;
        }
        return undefined;
    }

    return DOM;
}, {
        requires:["dom/base"]
    });

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 *   - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
