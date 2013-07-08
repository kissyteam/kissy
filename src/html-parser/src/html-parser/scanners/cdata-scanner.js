/**
 * scanner cdata (script/textarea/style)
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/scanners/cdata-scanner", function () {
    return {
        scan:function (tag, lexer, opts) {
            // only terminate when encounter </tag>
            // <textarea><div></div></textarea>
            var content = lexer.parseCDATA(opts.quoteSmart, tag.nodeName),
                position = lexer.getPosition(),
                node = lexer.nextNode();
            if (node) {
                // 这段应该永远不会执行到的
                if (node.nodeType != 1 ||
                    !(node.isEndTag() &&
                        node.tagName == tag.tagName)) {
                    lexer.setPosition(position);
                    node = null;
                }
            }
            tag.closed = true;
            if (content) {
                tag.appendChild(content);
            }
        }
    };
});