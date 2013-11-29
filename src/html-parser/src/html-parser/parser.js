/**
 * @ignore
 * parse html to a hierarchy dom tree
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var dtd = require('./dtd');
    var Tag = require('./nodes/tag');
    var Fragment = require('./nodes/fragment');
    var Lexer = require('./lexer/lexer');
    var Document = require('./nodes/document');
    var Scanner = require('./scanner');

    /**
     * Html Parse Class
     * @param html
     * @param opts
     * @class KISSY.HtmlParser.Parser
     */
    function Parser(html, opts) {
        // fake root node
        html = S.trim(html);
        this.originalHTML = html;
        // only allow condition
        // 1. start with <!doctype
        // 2. start with <!html
        // 3. start with <!body
        // 4. not start with <head
        // 5. not start with <meta
        if (/^(<!doctype|<html|<body)/i.test(html)) {
            html = '<document>' + html + '</document>';
        } else {
            html = '<body>' + html + '</body>';
        }
        this.lexer = new Lexer(html);
        this.opts = opts || {};
    }

    Parser.prototype = {
        constructor: Parser,

        elements: function () {
            var root ,
                doc,
                lexer = this.lexer,
                opts = this.opts;

            doc = root = lexer.nextNode();

            if (root.tagName !== 'document') {
                doc = new Document();
                doc.appendChild(root);
            }

            doc.nodeType = 9;

            Scanner.getScanner('div').scan(root, lexer, opts);

            var body = fixBody(doc);

            if (body && opts.autoParagraph) {
                autoParagraph(body);
            }

            postProcess(doc);

            var originalHTML = this.originalHTML,
                fragment = new Fragment(), cs;

            if (/^(<!doctype|<html|<body)/i.test(originalHTML)) {
                cs = doc.childNodes;
            } else {
                cs = body.childNodes;
            }
            S.each(cs, function (c) {
                fragment.appendChild(c);
            });
            return fragment;
        },

        parse: function () {
            return this.elements();
        }
    };

    function fixBody(doc) {
        // 3 limit depth
        var body = findTagWithName(doc, 'body', 3);
        if (body) {
            /**
             * <body>
             <li>2</li>
             <span>1</span>
             <li>2</li>
             <span>3</span>
             <li>2</li>
             </body>
             */
            var parent = body.parentNode,
                silbing = parent.childNodes,
                bodyIndex = S.indexOf(body, silbing);
            if (bodyIndex !== silbing.length - 1) {
                var fixes = silbing.slice(bodyIndex + 1, silbing.length);
                for (var i = 0; i < fixes.length; i++) {
                    parent.removeChild(fixes[i]);
                    if (fixes[i].tagName === 'body') {
                        /*jshint loopfunc:true*/
                        S.each(fixes[i].childNodes, function (c) {
                            body.appendChild(c);
                        });
                    } else {
                        body.appendChild(fixes[i]);
                    }
                }
            }
        }
        return body;
    }


    function autoParagraph(doc) {
        var childNodes = doc.childNodes,
            c,
            i,
            pDtd = dtd.p,
            needFix = 0;

        for (i = 0; i < childNodes.length; i++) {
            c = childNodes[i];
            if (c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])) {
                needFix = 1;
                break;
            }
        }
        if (needFix) {
            var newChildren = [],
                holder = new Tag();
            holder.nodeName = holder.tagName = 'p';
            for (i = 0; i < childNodes.length; i++) {
                c = childNodes[i];
                if (c.nodeType === 3 || (c.nodeType === 1 && pDtd[c.nodeName])) {
                    holder.appendChild(c);
                } else {
                    if (holder.childNodes.length) {
                        newChildren.push(holder);
                        holder = holder.clone();
                    }
                    newChildren.push(c);
                }
            }

            if (holder.childNodes.length) {
                newChildren.push(holder);
            }

            doc.empty();

            for (i = 0; i < newChildren.length; i++) {
                doc.appendChild(newChildren[i]);
            }
        }
    }


    function findTagWithName(root, tagName, level) {
        if (level === 0) {
            return 0;
        }
        if (typeof level === 'number') {
            level--;
        }
        var r, childNodes = root.childNodes;
        if (childNodes) {
            for (var i = 0; i < childNodes.length; i++) {
                if (childNodes[i].tagName === tagName) {
                    return childNodes[i];
                }
                if ((r = findTagWithName(childNodes[i], tagName, level))) {
                    return r;
                }
            }
        }
        return 0;
    }

    function postProcess(doc) {
        // Space characters before the root html element,
        // and space characters at the start of the html element and before the head element,
        // will be dropped when the document is parsed;
        var childNodes = [].concat(doc.childNodes);
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeName === 'html') {
                var html = childNodes[i];
                for (var j = 0; j < i; j++) {
                    if (childNodes[j].nodeType === 3 && !S.trim(childNodes[j].toHtml())) {
                        doc.removeChild(childNodes[j]);
                    }
                }
                while (html.firstChild &&
                    html.firstChild.nodeType === 3 && !S.trim(html.firstChild.toHtml())) {
                    html.removeChild(html.firstChild);
                }
                break;
            }
        }
    }

    return Parser;
});