/**
 * @module  dom
 * @author  lifesinger@gmail.com
 */
KISSY.add('dom', function(S) {

    S.DOM = {
        /**
         * ÊÇ²»ÊÇ element node
         */
        _isElementNode: function(elem) {
            return elem && elem.nodeType === 1;
        }
    };
});
