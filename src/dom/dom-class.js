/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom-class', function(S, undefined) {

    var SPACE = ' ',
        DOM = S.DOM,
        REG_SPACE = /\s+/,
        REG_CLASS = /[\n\t]/g;

    S.mix(DOM, {

        /**
         * Determine whether any of the matched elements are assigned the given class.
         */
        hasClass: function(selector, className) {
            var elems = S.query(selector), i = 0, len = elems.length, cls;
            if (!className || !len) return false;
            className = SPACE + className + SPACE;

            for (; i < len; i++) {
                cls = elems[i].className;
                if (cls && (SPACE + cls + SPACE).indexOf(className) > -1) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Adds the specified class(es) to each of the set of matched elements.
         */
        addClass: function(selector, value) {
            if(!S.isString(value)) return;

            var elems = S.query(selector),
                i = 0, len = elems.length,
                classNames = value.split(REG_SPACE),
                cl = classNames.length,
                elem, oldClass;

            for (; i < len; i++) {
                elem = elems[i];
                if (elem.nodeType === 1) {
                    oldClass = elem.className;
                    if (!oldClass) {
                        elem.className = value;
                    }
                    else {
                        var className = SPACE + oldClass + SPACE, setClass = oldClass, j = 0;
                        for (; j < cl; j++) {
                            // 下面这个判断可以用 hasClass. 但为了性能，牺牲少量空间换时间是值得的。
                            if (className.indexOf(SPACE + classNames[j] + SPACE) < 0) {
                                setClass += SPACE + classNames[j];
                            }
                        }
                        elem.className = S.trim(setClass);
                    }
                }
            }
        },

        /**
         * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
         */
        removeClass: function(selector, value) {
            if (!(S.isString(value) || value === undefined)) return;

            var elems = S.query(selector),
                i = 0, len = elems.length,
                classNames = value.split(REG_SPACE),
                cl = classNames.length,
                elem, oldClass;

            for (; i < len; i++) {
                elem = elems[i];
                oldClass = elem.className;

                if (elem.nodeType === 1 && oldClass) {
                    if(value === undefined) {
                        elem.className = '';
                    }
                    else {
                        var className = (SPACE + oldClass + SPACE).replace(REG_CLASS, SPACE), j;
                        for (; j < cl; j++) {
                            className = className.replace(SPACE + classNames[j] + SPACE, SPACE);
                        }
                        elem.className = S.trim(className);
                    }
                }
            }
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
            if(!S.isString(value)) return;
            var isBool = S.isBoolean(state), bool;

            S.each(S.query(selector), function(elem) {
                // toggle individual class names
                var classNames = value.split(REG_SPACE),
                    className, i = 0;

                while ((className = classNames[i++])) {
                    // check each className given, space seperated list
                    bool = isBool ? state : !DOM.hasClass(elem, className);
                    DOM[bool ? 'addClass' : 'removeClass'](elem, className);
                }
            });
        }
    });
});

/**
 * NOTES:
 *   - hasClass/addClass/removeClass 的逻辑和 jQuery 保持一致
 *   - toggleClass 不支持 value 为 undefined 的情形（jQuery 支持）
 */
