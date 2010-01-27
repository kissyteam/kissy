/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy
 */

KISSY.add('node', function(S) {

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props, ownerDocument);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            return self;
        }

        // handle Node(HTMLElement)
        if (html.nodeType) {
            self[0] = html;
            return self;
        }

        // handle html strings
        if(typeof html === 'string') {

        }
    }

    S.mix(Node.prototype, {
       /**
         * Sets and gets styles.
         */
        create: function() {
            // TODO
        }
    });

});
