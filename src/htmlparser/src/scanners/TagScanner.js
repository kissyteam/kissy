/**
 * nest tag scanner recursively
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/scanners/TagScanner", function (S, dtd, Tag, SpecialScanners) {

    var /**
     * will create ul when encounter li and li's parent is not ul
     */
        wrapper = {
        li:'ul',
        dt:'dl',
        dd:'dl'
    };

    /**
     * refer: http://www.w3.org/TR/html5/tree-construction.html#tree-construction
     * When the steps below require the UA to generate implied end tags,
     * then, while the current node is a dd element,
     * a dt element, an li element, an option element,
     * an optgroup element, a p element, an rp element, or an rt element,
     * the UA must pop the current node off the stack of open elements.
     */
    var impliedEndTag = {
        // if dd encounter another dd before encounter dl ,then close last dd
        'dd':{'dl':1},
        'dt':{'dl':1},
        // 2012.06.27 Note: li may has two kinds of parent!
        'li':{'ul':1, 'ol':1},
        'option':{'select':1},
        'optgroup':{'select':1}
        // p? rp? rt?
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

        S.each(childNodes, function (c) {
            if (!canHasNodeAsChild(tag, c)) {
                valid = 0;
                return false;
            }
        });

        if (valid) {
            return 0;
        }

        var
        // a valid element which will replace current invalid tag
        // and move tag's children to holder validly !
            holder = tag.clone(),
        // last escape position that tag's children can be insertAfter
        // escape from its parent if its parent can not include him :(
            prev = tag,
            recursives = [];

        function closeCurrentHolder() {
            if (holder.childNodes.length) {
                // close current holder
                holder.insertAfter(prev);
                // if child can not be included in holder
                // : <a><a></a></a>
                // then will insertAfter last holder
                prev = holder;
                // open new holder to accommodate child which can reside in holder
                // <a>1<a>2</a>3</a> => <a>1</a>(-<close holder)<a>2</a>(<-child can not be included in holder)<a>3</a>(<-new holder)
                holder = tag.clone();
            }
        }

        for (var i = 0; i < childNodes.length; i++) {
            var c = childNodes[i];

            if (canHasNodeAsChild(holder, c)) {
                holder.appendChild(c);
            } else {

                // if can not include text as its child , then discard
                if (c.nodeType != 1) {
                    continue;
                }

                var currentChildName = c.tagName;

                // li -> ul
                if (dtd.$listItem[currentChildName]) {
                    closeCurrentHolder();
                    var pTagName = wrapper[c.tagName],
                        pTag = new Tag();
                    pTag.nodeName = pTag.tagName = pTagName;
                    while (i < childNodes.length) {
                        if (childNodes[i].tagName == currentChildName) {
                            pTag.appendChild(childNodes[i]);
                        } else if (childNodes[i].nodeType == 3 &&
                            !S.trim(childNodes[i].toHTML())) {
                        }
                        // non-empty text leave it to outer loop
                        else if (childNodes[i].nodeType == 3) {
                            break;
                        }
                        i++;
                    }
                    pTag.insertAfter(prev);
                    prev = pTag;
                    i--;
                    continue;
                }

                // only deal with inline element mistakenly wrap block element ?
                // also consider <pre>1 \n<div>2\n 3\n</div> 4</pre> : 2012-01-13
                // if (dtd.$inline[tag.tagName]) {
                closeCurrentHolder();
                if (!c.equals(holder)) {
                    // <a><p></p></a> => <p><a></a></p>
                    if (canHasNodeAsChild(c, holder)) {
                        holder = tag.clone();
                        S.each(c.childNodes, function (cc) {
                            holder.appendChild(cc);
                        });
                        c.empty();
                        c.insertAfter(prev);
                        prev = c;
                        c.appendChild(holder);
                        // recursive to a,lower
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
                // }
            }
        }

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
        S.each(recursives, function (r) {
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
        var nodeName = node.tagName || node.nodeName;
        return !!dtd[tag.tagName][nodeName];
    }


    return {
        scan:function (tag, lexer, opts) {

            function closeStackOpenTag(end, from) {
                for (i = end; i > from; i--) {
                    var currentStackItem = stack[i],
                        preStackItem = stack[i - 1];
                    preStackItem.appendChild(currentStackItem);
                    fixCloseTagByDtd(currentStackItem, opts);
                }
                tag = stack[from];
                stack.length = from;
            }

            // fix
            // <ol><li>1<li>2</ol>
            function processImpliedEndTag(node) {
                var needFix = 0,
                    endParentTagName;
                // <ul><li>1<ul><li>2</ul></ul>
                if (endParentTagName = impliedEndTag[node.tagName]) {
                    var from = stack.length - 1,
                        parent = stack[from];
                    // <ol><li><ol><li>
                    // parent ol break li check
                    while (parent && !(parent.tagName in endParentTagName)) {
                        // <ul><li>1<div><li>2</div></ul>
                        if (parent.tagName == node.tagName) {
                            needFix = 1;
                            break;
                        }
                        from--;
                        parent = stack[from];
                    }
                    if (needFix) {
                        closeStackOpenTag(stack.length - 1, from - 1);
                    }
                }
                return needFix;
            }

            var node,
                i,
                stack;
            // http://www.w3.org/TR/html5/parsing.html#stack-of-open-elements
            // stack of open elements
            stack = opts.stack = opts.stack || [];
            do {
                node = lexer.nextNode();
                if (node) {
                    if (node.nodeType === 1) {
                        // normal end tag
                        if (node.isEndTag() &&
                            node.tagName == tag.tagName) {
                            node = null;
                        } else if (!node.isEndTag()) {

                            if (SpecialScanners[node.tagName]) {
                                // change scanner ,such as textarea scanner ... etc
                                SpecialScanners[node.tagName].scan(node, lexer, opts);
                                tag.appendChild(node);
                            } else {
                                // now fake recursive using stack
                                if (node.isSelfClosed) {
                                    tag.appendChild(node);
                                } else {
                                    // When the steps below require the UA to insert an HTML element for a token,
                                    // the UA must first create an element for the token in the HTML namespace,
                                    // and then append this node to the current node,
                                    // and push it onto the stack of open elements so that it is the new current node.
                                    // 一点改动：先放入栈中，等到结束标签再 appendChild
                                    // fake stack
                                    stack.push(tag);// <ul>
                                    //      <li>1
                                    //      <li>2
                                    // </ul>
                                    if (processImpliedEndTag(node)) {
                                        stack.push(tag);
                                    }
                                    tag = node;
                                }
                            }
                        } else if (node.isEndTag()) {
                            // encounter a end tag without open tag
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
                                closeStackOpenTag(stack.length - 1, index);
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
                        // fake recursion
                        if (!SpecialScanners[node.tagName]) {
                            stack.length = stack.length - 1;
                            node.appendChild(tag);
                            // child fix
                            fixCloseTagByDtd(tag, opts);
                            tag = node;
                        } else {
                            node = null;
                        }
                    }
                }
            } while (node);

            // root tag fix
            fixCloseTagByDtd(tag, opts);
        }
    };
}, {
    requires:["../dtd", "../nodes/Tag", "./SpecialScanners"]
});