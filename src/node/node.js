/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('node', function(S) {

    /**
     * Node Class
     * @constructor
     */
    function Node(selector) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(selector);
        }
    }

    S.Node = Node;
});
