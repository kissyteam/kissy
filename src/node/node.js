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
        self.domEl = S.query(selector, doc);
    }

    S.mix(Node.prototype, {

        /**
         * Gets the related DOM Element.
         */
        dom: function() {
            return this.domEl;
        }
    });

    var StaticMethods = {
       /**
         * Sets and gets styles.
         */
        css: function() {
            // TODO
        }
    };
    S.mix(Node.prototype, StaticMethods);

    S.Node = Node;
    S.Node.StaticMethods = StaticMethods;
});
