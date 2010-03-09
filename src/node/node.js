/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy, selector, dom
 */

KISSY.add('node', function(S) {

    var doc = document,
        // match a standalone tag
        REG_SINGLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props) {
        var self = this, domNode, match;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            return null;
        }

        // handle Node(HTMLElement)
        if (html.nodeType) {
            domNode = html;
        } else
        // handle html strings
        if (typeof html === 'string') {
            // If a single string is passed in and it's a single tag
            // just do a createElement and skip the rest
            match = REG_SINGLE_TAG.exec(html);
            if (match) {
                domNode = doc.createElement(match[1]);
            } else {
                // TODO
                // domNode = buildFragment(match[1]);
            }
        }

        if (props) {
            // TODO: set props to domNode
        }

        self[0] = domNode;
    }

    // TODO: import methods from S.Dom

    // query api
    S.one = function(selector, context) {
        return new Node(S.get(selector, context));
    }

});
