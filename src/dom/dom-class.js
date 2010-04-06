/**
 * @module  dom-class
 * @author  lifesinger@gmail.com
 * @depends kissy, dom-base
 */

KISSY.add('dom-class', function(S, undefined) {

    var SPACE = ' ',
        DOM = S.DOM;

    S.mix(DOM, {

        /**
         * Determines whether a HTMLElement has the given className.
         */
        hasClass: function(el, className) {
            if (!className || !el || !el.className) return false;

            return (SPACE + el.className + SPACE).indexOf(SPACE + className + SPACE) > -1;
        },

        /**
         * Adds a given className to a HTMLElement.
         */
        addClass: function(el, className) {
            if(batch(el, addClass, DOM, className)) return;
            if (!className || !el) return;
            if (hasClass(el, className)) return;

            el.className += SPACE + className;
        },

        /**
         * Removes a given className from a HTMLElement.
         */
        removeClass: function(el, className) {
            if(batch(el, removeClass, DOM, className)) return;
            if (!hasClass(el, className)) return;

            el.className = (SPACE + el.className + SPACE).replace(SPACE + className + SPACE, SPACE);
            if (hasClass(el, className)) {
                removeClass(el, className);
            }
        },

        /**
         * Replace a class with another class for a given element.
         * If no oldClassName is present, the newClassName is simply added.
         */
        replaceClass: function(el, oldC, newC) {
            removeClass(el, oldC);
            addClass(el, newC);
        },

        /**
         * If the className exists on the node it is removed, if it doesn't exist it is added.
         * @param {boolean} force addClass optional boolean to indicate whether class
         * should be added or removed regardless of current state.
         */
        toggleClass: function(el, className, force) {
            if(batch(el, DOM.toggleClass, DOM, className, force)) return;

            var add = (force !== undefined) ? force :
                      !(hasClass(el, className));

            if (add) {
                addClass(el, className);
            } else {
                removeClass(el, className);
            }
        }
    });

    function batch(arr, method, context) {
        if (S.isArray(arr)) {
            S.each(arr, function(item) {
                method.apply(context, Array.prototype.slice.call(arguments, 3));
            });
            return true;
        }
    }

    // for quick access
    var hasClass = DOM.hasClass,
        addClass = DOM.addClass,
        removeClass = DOM.removeClass;
});

/**
 * TODO:
 *   - hasClass needs batch?
 */