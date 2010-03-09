/**
 * @module  dom-base
 * @author  lifesinger@gmail.com
 * @depends kissy, selector
 */

KISSY.add('dom-base', function(S, undefined) {

    var doc = document,
        ATTR_TEXT = doc.documentElement.textContent !== undefined ? 'textContent' : 'innerText';

    S.Dom = {

        /**
         * Returns the first element that matches the selector.
         */
        get: S.get,

        /**
         * Returns a NodeList that matches the selector.
         */
        query: S.query,

        /**
         * Gets or sets the attribute of the HTMLElement.
         */
        attr: function(el, val) {
            
        },

        /**
         * Gets or sets the the text content of the HTMLElement.
         */
        text: function(el, val) {
            // getText
            if(val === undefined) {
                return (el || {})[ATTR_TEXT] || '';
            }

            // setText
            if(el) {
                el[ATTR_TEXT] = val;
            }
        }
    };

});
