/*
Copyright 2010, KISSY UI Library v1.0.3
MIT Licensed
build: 469 Mar 9 17:10
*/
/**
 * @module  node
 * @author  lifesinger@gmail.com
 * @depends kissy, selector, dom
 */

KISSY.add('node', function(S) {

    var Dom = S.Dom;

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode, match;

        // factory or constructor
        if (!(self instanceof Node)) {
            return new Node(html, props, ownerDocument);
        }

        // handle Node(''), Node(null), or Node(undefined)
        if (!html) {
            return null;
        }

        // handle Node(HTMLElement)
        if (html.nodeType) {
            domNode = html;
        }
        else if (typeof html === 'string') {
            domNode = Dom.create(html, ownerDocument);
        }

        if (props) {
            // TODO: set props to domNode
        }

        self[0] = domNode;
    }

    // TODO: imports methods from S.Dom

    // query api
    S.one = function(selector, context) {
        return new Node(S.get(selector, context));
    }

    S.Node = Node;

});
