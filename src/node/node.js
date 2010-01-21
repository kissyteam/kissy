/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy, node-selector
 */

KISSY.add('node', function(S) {

    var doc = document;

    /**
     * Node Class
     */
    function Node(selector) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(selector);
        }

        /**
         * Related DOM Element
         */
        self.domEl = typeof selector === 'string' ? S.query(selector, doc, true) : selector;
    }

    S.mix(Node.prototype, {

        /**
         * Gets the related DOM Element.
         */
        dom: function() {
            return this.domEl;
        }
    });

    S.Node = Node;
});
