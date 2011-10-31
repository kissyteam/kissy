KISSY.add("htmlparser/scanners/CdataScanner",function() {
    return {
        scan:function(tag, lexer, stack, quoteSmart) {
            // tolerate var x="<a></a>"
            // but still not var x="<a></a>"; </a>
            var content = lexer.parseCDATA(quoteSmart),
                position = lexer.getPosition(),
                node = lexer.nextNode();
            if (node) {
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
            return tag;
        }
    };
});