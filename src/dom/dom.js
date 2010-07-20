/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom', function(S) {

    var DOM = {

        /**
         * 是不是 element/text node
         */
        _isSupportedNode: function(elem) {
            return DOM._isElementNode(elem) || DOM._isTextNode(elem);
        },

        /**
         * 是不是 element node
         */
        _isElementNode: function(elem) {
            return elem && elem.nodeType === 1;
        },

        /**
         * 是不是 text node
         */
        _isTextNode: function(elem) {
            return elem && elem.nodeType === 3;
        }
    };

    S.DOM = DOM;
});
