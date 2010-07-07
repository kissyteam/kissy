/**
 * @module  node
 * @author  lifesinger@gmail.com
 */

KISSY.add('node', function(S) {

    var DOM = S.DOM,
        NP = Node.prototype;

    /**
     * The Node class provides a wrapper for manipulating DOM Node.
     */
    function Node(html, props, ownerDocument) {
        var self = this, domNode;

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
            domNode = DOM.create(html, ownerDocument);
        }

        if (props) {
            S.error('not implemented'); // TODO
        }

        self[0] = domNode;
    }

    // import dom methods
    S.each(['attr', 'removeAttr', 'css'],
        function(methodName) {
            NP[methodName] = function(name, val) {
                var domNode = this[0];
                if(val === undefined) {
                    return DOM[methodName](domNode, name);
                } else {
                    DOM[methodName](domNode, name, val);
                    return this;
                }
            }
        });

    S.each(['val', 'text', 'html'],
            function(methodName) {
                NP[methodName] = function(val) {
                    var domNode = this[0];
                    if(val === undefined) {
                        return DOM[methodName](domNode);
                    } else {
                        DOM[methodName](domNode, val);
                        return this;
                    }
                }
            });

    S.each(['children', 'siblings', 'next', 'prev', 'parent'],
        function(methodName) {
            NP[methodName] = function() {
                var ret = DOM[methodName](this[0]);
                return ret ? new S[ret.length ? 'NodeList' : 'Node'](ret) : null;
            }
        });

    S.each(['hasClass', 'addClass', 'removeClass', 'replaceClass', 'toggleClass'],
        function(methodName) {
            NP[methodName] = function() {
                var ret = DOM[methodName].apply(DOM, [this[0]].concat(S.makeArray(arguments)));
                // 只有 hasClass 有返回值
                return typeof ret === 'boolean' ? ret : this;
            }
        });

    // import event methods
    S.mix(NP, S.EventTarget);
    NP._addEvent = function(type, handle) {
        S.Event._simpleAdd(this[0], type, handle);
    };
    NP._removeEvent = function(type, handle) {
        S.Event._simpleRemove(this[0], type, handle);
    };
    delete NP.fire;    

    // add more methods
    S.mix(NP, {

        /**
         * Retrieves a node based on the given CSS selector.
         */
        one: function(selector) {
            return S.one(selector, this[0]);
        },

        /**
         * Retrieves a nodeList based on the given CSS selector.
         */
        all: function(selector) {
            return S.all(selector, this[0]);
        },

        /**
         * Insert the element to the end of the parent.
         */
        appendTo: function(parent) {
            if((parent = S.get(parent)) && parent.appendChild) {
                parent.appendChild(this[0]);
            }
            return this;
        }
    });

    // query api
    S.one = function(selector, context) {
        return new Node(S.get(selector, context));
    };

    S.Node = Node;
});

/**
 * TODO:
 *   - append/appendTo, insertBefore/insertAfter, after/before 等操作的实现和测试
 */
