/**
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TagScanner", function(S, dtd) {
    var scanner = {
        scan:function(tag, lexer, stack) {
            var node,i;
            if (tag.isEmptyXmlTag) {
                tag.closed = true;
            } else {
                do{
                    node = lexer.nextNode();
                    if (node) {
                        if (node.nodeType === 1) {
                            // normal end tag
                            if (node.isEndTag() && node.tagName == tag.tagName) {
                                tag['closed'] = true;
                                node = null;
                            }
                            // encounter  <a>1<p>2</p>3</a> , close <a> => <a>1</a><p>2</p>3</a> => <a>1</a><p>2</p>3
                            // perfection is better and more complicated :
                            // <a>1<p>2</p>3</a> , move <a> inside => <a>1</a><p><a>2</a></p><a>3</a>
                            else if (!node.isEndTag() && !this.canHasNodeAsChild(tag, node)) {
                                // can not be it as child ,will terminate tag lately
                                lexer.setPosition(node.startPosition);
                                node = null;
                            } else if (!node.isEndTag()) {
                                // now fake recursive using stack
                                var nodeScanner = node.scanner;
                                if (nodeScanner) {
                                    if (nodeScanner === scanner) {
                                        if (node.isEmptyXmlTag) {
                                            tag.appendChild(node);
                                        } else {
                                            stack.push(tag);
                                            tag = node;
                                        }
                                    } else {
                                        // change scanner ,such as textarea scanner ... etc
                                        node = nodeScanner.scan(node, lexer, stack);
                                        tag.appendChild(node);
                                    }
                                } else {
                                    tag.appendChild(node);
                                }
                            } else {
                                // encouter a end tag without open tag
                                // There are two cases...
                                // 1) The tag hasn't been registered, in which case
                                // we just add it as a simple child, like it's
                                // opening tag
                                // 2) There may be an opening tag further up the
                                // parse stack that needs closing.
                                // So, we ask the factory for a node like this one
                                // (since end tags never have scanners) and see
                                // if it's scanner is a composite tag scanner.
                                // If it is we walk up the parse stack looking for
                                // something that needs this end tag to finish it.
                                // If there is something, we close off all the tags
                                // walked over and continue on as if nothing
                                // happened.
                                var index = -1;
                                for (i = stack.length - 1; i >= 0; i--) {
                                    var c = stack[i];
                                    if (c.tagName === node.tagName) {
                                        index = i;
                                        break;
                                    } else if (!this.canHasNodeAsChild(c, node)) {
                                        // can not include this node as child of a node in stack
                                        index = i;
                                        break;
                                    }
                                }

                                if (index != -1) {
                                    // <div><span> <a> </div>
                                    // tag==a
                                    tag['closed'] = true;
                                    stack[stack.length - 1].appendChild(tag);
                                    for (i = stack.length - 1; i > index; i--) {
                                        var currentStackItem = stack[i],preStackItem = stack[i - 1];
                                        currentStackItem['closed'] = true;
                                        preStackItem.appendChild(currentStackItem);
                                    }
                                    tag = stack[index];
                                    stack.length = index;
                                    node = null;
                                }

                            }
                        } else {
                            tag.appendChild(node);
                        }
                    }

                    // fake recursive success , stack retreat
                    if (node == null) {
                        if (stack.length > 0) {
                            node = stack[stack.length - 1];
                            if (node.nodeType == 1) {
                                // fake recursion
                                if (node.scanner === scanner) {
                                    stack.length = stack.length - 1;
                                    tag['closed'] = true;
                                    node.appendChild(tag);
                                    tag = node;
                                } else {
                                    node = null;
                                }
                            } else {
                                node = null;
                            }
                        }
                    }
                } while (node);

                tag['closed'] = true;
            }

            return tag;
        },

        /**
         * checked whether tag can include node as its child according to DTD
         */
        canHasNodeAsChild:function(tag, node) {
            if (!dtd[tag.tagName]) {
                S.error("dtd[" + tag.tagName + "] === undefined!")
            }
            var nodeName = node.nodeName;
            if (node.nodeType == 3) {
                nodeName = '#';
            }
            return !! dtd[tag.tagName][nodeName];
        }
    };
    return scanner;
}, {
    requires:["../dtd"]
});