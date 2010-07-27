/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom', function(S) {

    var NODE_TYPE = 'nodeType',

    DOM = {

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
            return elem && elem[NODE_TYPE] === 1;
        },

        /**
         * 是不是 text node
         */
        _isTextNode: function(elem) {
            return elem && elem[NODE_TYPE] === 3;
        },

        /**
         * 是不是 KISSY.Node
         */
        _isKSNode: function(elem) {
            return elem && S.Node && elem[NODE_TYPE] === S.Node.TYPE;
        }
    };

    S.DOM = DOM;
});
