/*
Copyright 2010, KISSY UI Library v1.0.3
MIT Licensed
build: 469 Mar 9 17:10
*/
/**
 * @module  dom-base
 * @author  lifesinger@gmail.com
 * @depends kissy, selector
 */

KISSY.add('dom-base', function(S, undefined) {

    var doc = document,
        docElement = doc.documentElement,
        TEXT = docElement.textContent !== undefined ? 'textContent' : 'innerText',
        CUSTOM_ATTRIBUTES = (!docElement.hasAttribute) ? { // IE < 8
                'for': 'htmlFor',
                'class': 'className'
            } : { },
        SPACE = ' ';

    S.Dom = {

        /**
         * Returns a NodeList that matches the selector.
         */
        query: S.query,

        /**
         * Returns the first element that matches the selector.
         */
        get: S.get,

        /**
         * Gets or sets the attribute of the HTMLElement.
         */
        attr: function(el, name, val) {
            name = CUSTOM_ATTRIBUTES[name] || name;

            if (el && el.getAttribute) {
                // getAttr
                if (val === undefined) {
                    return el.getAttribute(attr) || ''; // '' is added per DOM spec.
                }
                // setAttr
                el.setAttribute(attr, val);
            }
        },

        /**
         * Removes the attribute of the HTMLElement.
         */
        removeAttr: function(el, name) {
            if(el & el.removeAttribute) {
                el.removeAttribute(name);
            }
        },

        /**
         * Determines whether a HTMLElement has the given className.
         */
        hasClass: function(el, className) {
            if (!className || !el.className) return false;

            return (SPACE + el.className + SPACE).indexOf(SPACE + className + SPACE) > -1;
        },

        /**
         * Adds a given className to a HTMLElement.
         */
        addClass: function(el, className) {
            if (!className) return;
            if (hasClass(el, className)) return;

            el.className += SPACE + className;
        },

        /**
         * Removes a given className from a HTMLElement.
         */
        removeClass: function(el, className) {
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
            var add = (force !== undefined) ? force :
                      !(hasClass(el, className));

            if (add) {
                addClass(el, className);
            } else {
                removeClass(el, className);
            }
        },

        /**
         * Gets or sets styles on the HTMLElement.
         */
        css: function(el, prop, val) {
            // TODO
        },

        /**
         * Gets or sets the the text content of the HTMLElement.
         */
        text: function(el, val) {
            // getText
            if (val === undefined) {
                return (el || {})[TEXT] || '';
            }

            // setText
            if (el) {
                el[TEXT] = val;
            }
        },

        /**
         * Get the HTML contents of the HTMLElement.
         */
        html: function(el, htmlString) {
            // TODO
        },

        /**
         * Get the current value of the HTMLElement.
         */
        val: function(el, value) {
            // TODO
        },

        /**
         * Creates a new HTMLElement using the provided html string.
         */
        create: function(htmlString, ownerDocument) {
            // TODO
        }
    };

    // for quick access
    var hasClass = S.Dom.hasClass,
        addClass = S.Dom.addClass,
        removeClass = S.Dom.removeClass;
});
