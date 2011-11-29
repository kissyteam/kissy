/**
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TagScanner", function(S, dtd) {
    var scanner = {
        scan:function(tag, lexer, opts) {
            var node,
                i,
                stack;
            stack = opts.stack = opts.stack || [];
            if (tag.isEmptyXmlTag) {
                tag.closed = true;
            } else {
                do{
                    node = lexer.nextNode();
                    if (node) {
                        if (node.nodeType === 1) {
                            // normal end tag
                            if (node.isEndTag() && node.tagName == tag.tagName) {
                                node = null;
                            } else if (!node.isEndTag()) {
                                // now fake recursive using stack
                                var nodeScanner = node.scanner;
                                if (nodeScanner) {
                                    if (nodeScanner === scanner) {
                                        if (node.isEmptyXmlTag) {
                                            tag.appendChild(node);
                                        } else {
                                            // fake stack
                                            stack.push(tag);
                                            tag = node;
                                        }
                                    } else {
                                        // change scanner ,such as textarea scanner ... etc
                                        nodeScanner.scan(node, lexer, opts);
                                        tag.appendChild(node);
                                    }
                                } else {
                                    tag.appendChild(node);
                                }
                            } else if (node.isEndTag()) {
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
                                    }
                                }

                                if (index != -1) {
                                    // <div><span> <a> </div>
                                    // tag==a
                                    stack[stack.length - 1].appendChild(tag);
                                    fixCloseTagByDtd(tag, opts);
                                    for (i = stack.length - 1; i > index; i--) {
                                        var currentStackItem = stack[i],preStackItem = stack[i - 1];
                                        preStackItem.appendChild(currentStackItem);
                                        fixCloseTagByDtd(currentStackItem, opts);
                                    }
                                    tag = stack[index];
                                    stack.length = index;
                                    node = null;
                                } else {
                                    // discard this close tag
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
                                    node.appendChild(tag);
                                    // child fix
                                    fixCloseTagByDtd(tag, opts);
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

                // root tag fix
                fixCloseTagByDtd(tag, opts);


            }
        }
    };


    /**
     * close tag and check nest by xhtml dtd rules
     * <span> 1 <span>2</span> <p>3</p> </span> => <span> 1 <span>2</span> </span> <p><span>3</span></p>
     * @param tag
     */
    function fixCloseTagByDtd(tag, opts) {
        tag['closed'] = 1;

        if (!opts['fixByDtd']) {
            return 0;
        }

        var valid = 1,
            childNodes = [].concat(tag.childNodes);

        S.each(childNodes, function(c) {
            if (!canHasNodeAsChild(tag, c)) {
                valid = 0;
                return false;
            }
        });

        if (valid) {
            return 0;
        }

        var holder = tag.clone(),
            prev = tag,
            recursives = [];

        S.each(childNodes, function(c) {
            if (canHasNodeAsChild(holder, c)) {
                holder.appendChild(c);
            } else {
                if (holder.childNodes.length) {
                    holder.insertAfter(prev);
                    prev = holder;
                    holder = tag.clone();
                }

                if (!c.equals(holder)) {
                    // <a><p></p></a> => <p><a></a></p>
                    if (canHasNodeAsChild(c, holder)) {
                        holder = tag.clone();
                        S.each(c.childNodes, function(cc) {
                            holder.appendChild(cc);
                        });
                        c.empty();
                        c.insertAfter(prev);
                        prev = c;
                        c.appendChild(holder);
                        // recursive to a , lower
                        recursives.push(holder);
                        holder = tag.clone();
                    } else {
                        // <a href='1'> <a href='2'>2</a> </a>
                        c.insertAfter(prev);
                        prev = c;
                    }
                } else {
                    c.insertAfter(prev);
                    prev = c;
                }
            }
        });

        // <a>1<p>3</p>3</a>
        // encouter 3 , last holder should be inserted after <p>
        if (holder.childNodes.length) {
            holder.insertAfter(prev);
        }

        // <a><p>1</p></a> => <a></a><p><a>1</a></p> => <p><a>1</a></p>
        tag.parentNode.removeChild(tag);

        // <a><div><div>1</div></div></a>
        // =>
        // <div><a><div>1</div></a></div>

        // => fixCloseTagByDtd("<a><div>1</div></a>")
        S.each(recursives, function(r) {
            fixCloseTagByDtd(r, opts);
        });

        return 1;
    }


    /**
     * checked whether tag can include node as its child according to DTD
     */
    function canHasNodeAsChild(tag, node) {
        // document can nest any tag
        if (tag.nodeType == 9) {
            return 1;
        }
        if (!dtd[tag.tagName]) {
            S.error("dtd[" + tag.tagName + "] === undefined!")
        }
        if (node.nodeType == 8) {
            return 1;
        }
        var nodeName = node.tagName||node.nodeName;
        if (node.nodeType == 3) {
            nodeName = '#';
        }
        return !! dtd[tag.tagName][nodeName];
    }

    return scanner;
}, {
    requires:["../dtd"]
});