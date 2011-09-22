/**
 * represent tag , it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Node, TagScanner, QuoteCdataScanner, TextareaScanner, Attribute) {

    var scanners = {
        'style':QuoteCdataScanner,
        'script':QuoteCdataScanner,
        'textarea':TextareaScanner
    };

    function getScannerForTag(nodeName) {
        return scanners[nodeName] || TagScanner;
    }

    function Tag(page, startPosition, endPosition, attributes) {
        Tag.superclass.constructor.apply(this, arguments);
        this.childNodes = [];
        this.firstChild = null;
        this.lastChild = null;
        this.attributes = attributes || [];
        this.nodeType = 1;

        // first attribute is actually nodeName
        if (this.attributes[0]) {
            this.nodeName = attributes[0].name.toLowerCase();
            // note :
            // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
            this.tagName = this.nodeName.replace(/\//, "");
            attributes.splice(0, 1);
        }

        // whether has been closed by its end tag
        // !TODO how to set closed position correctly
        this.closed = this.isEmptyXmlTag();
        this.closedStartPosition = -1;
        this.closedEndPosition = -1;
        // scan it's innerHTMl to childNodes
        this.scanner = getScannerForTag(this.nodeName);
    }

    function refreshChildNodes(self) {
        var c = self.childNodes;
        self.firstChild = c[0];
        self.lastChild = c[c.length - 1];
        if (c.length >= 1) {
            c[0].nextSibling = c[0].nextSibling = null;
            c[0].parentNode = self;
        }

        if (c.length > 1) {
            for (var i = 0; i < c.length - 1; i++) {
                c[i].nextSibling = c[i + 1];
                c[i + 1].previousSibling = c[i];
                c[i + 1].parentNode = self;
            }
            c[c.length - 1].nextSibling = null
        }
    }

    S.extend(Tag, Node, {

        isEndTag:function() {
            return /^\//.test(this.nodeName);
        },

        isEmptyXmlTag:function() {
            var attr = this.attributes[this.attributes.length - 1];
            return !!(attr && /\/$/.test(attr.name));
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

        getAttribute:function(name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },
        setAttribute:function(name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },
        removeAttribute:function(name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = S.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        }
    });

    function findAttributeByName(attributes, name) {
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].name == name) {
                return attributes[i];
            }
        }
        return null;
    }

    return Tag;

}, {
    requires:['./Node',
        '../scanners/TagScanner',
        '../scanners/QuoteCdataScanner',
        '../scanners/TextareaScanner',
        './Attribute']
});