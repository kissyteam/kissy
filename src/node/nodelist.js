/**
 * @module  nodelist
 * @author  lifesinger@gmail.com
 * @depends kissy, dom
 */

KISSY.add('nodelist', function(S) {

    var DOM = S.DOM,
        push = Array.prototype.push,
        NP = NodeList.prototype;

    /**
     * The NodeList class provides a wrapper for manipulating DOM NodeList.
     */
    function NodeList(domNodes) {
        // factory or constructor
        if (!(this instanceof NodeList)) {
            return new NodeList(domNodes);
        }

        // push nodes
        push.apply(this, domNodes || []);
    }

    S.mix(NP, {
        /**
         * 默认长度为 0
         */
        length: 0
    });

    // query api
    S.all = function(selector, context) {
        return new NodeList(S.query(selector, context, true));
    };

    S.NodeList = NodeList;
});
