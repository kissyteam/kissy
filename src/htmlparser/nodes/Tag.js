/**
 * represent tag , it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node) {
    function Tag(page, startPosition, endPosition, attributes) {
        Tag.superclass.constructor.apply(this, arguments);
        this.childNodes = [];
        this.firstChild = null;
        this.lastChild = null;
        this.attributes = attributes || [];
        this.nodeType = 1;
        if (this.attributes[0]) {
            this.nodeName = attributes[0].name;
        }
    }

    function refreshChildNodes(self) {
        var c = self.childNodes;
        self.firstChild = c[0];
        self.lastChild = c[c.length - 1];
        if (c.length == 1) {
            c[0].nextSibling = c[0].nextSibling = null;
            c[0].parentNode = self;
        } else {
            for (var i = 0; i < c.length - 1; i++) {
                c[i].nextSibling = c[i + 1];
                c[i + 1].previousSibling = c[i];
                c[i + 1].parentNode = self;
            }
        }
    }

    S.extend(Tag, Node, {

        isEndTag:function() {
            return /^\//.test(this.nodeName);
        },

        isEmptyXmlTag:function() {
            return /\/$/.test(this.nodeName);
        },

        appendChild:function(node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },

        insertBefore:function(ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },

        removeChild:function(node) {
            var silbing = node.parentNode.childNodes,
                index = S.indexOf(node, silbing);
            silbing.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },

        getAttribute:function() {

        },
        setAttribute:function() {

        },
        removeAttribute:function() {

        },
        getAttributeNode:function() {

        },
        setAttributeNode:function() {

        },
        removeAttributeNode:function() {

        }
    });


    return Tag;

}, {
    requires:['./Node']
});