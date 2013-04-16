/**
 * represent tag, it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/nodes/Tag", function (S, Node, Attribute, Dtd) {

    function createTag(self, tagName, attrs) {
        self.nodeName = self.tagName = tagName.toLowerCase();
        self._updateSelfClosed();
        S.each(attrs, function (v, n) {
            self.setAttribute(n, v);
        });
    }

    function Tag(page, startPosition, endPosition, attributes) {
        var self = this;

        self.childNodes = [];
        self.firstChild = null;
        self.lastChild = null;
        self.attributes = attributes || [];
        self.nodeType = 1;

        if (typeof page == 'string') {
            createTag.apply(null, [self].concat(S.makeArray(arguments)));
        } else {
            Tag.superclass.constructor.apply(self, arguments);

            attributes = self.attributes;
            // first attribute is actually nodeName

            if (attributes[0]) {
                self.nodeName = attributes[0].name.toLowerCase();
                // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
                self.tagName = self.nodeName.replace(/\//, "");
                self._updateSelfClosed();
                attributes.splice(0, 1);
            }

            var lastAttr = attributes[attributes.length - 1],
                lastSlash = !!(lastAttr && /\/$/.test(lastAttr.name));

            if (lastSlash) {
                attributes.length = attributes.length - 1;
            }

            // self-closing flag
            self.isSelfClosed = self.isSelfClosed || lastSlash;

            // whether has been closed by its end tag
            // !TODO how to set closed position correctly
            self['closed'] = self.isSelfClosed;
        }
        self['closedStartPosition'] = -1;
        self['closedEndPosition'] = -1;
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

        _updateSelfClosed:function () {
            var self = this;
            // <br> <img> <input> , just recognize them immediately
            self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
            if (!self.isSelfClosed) {
                self.isSelfClosed = /\/$/.test(self.nodeName);
            }
            self['closed'] = self.isSelfClosed;
        },

        clone:function () {
            var ret = new Tag(),
                attrs = [];
            S.each(this.attributes, function (a) {
                attrs.push(a.clone());
            });
            S.mix(ret, {
                childNodes:[],
                firstChild:null,
                lastChild:null,
                attributes:attrs,
                nodeType:this.nodeType,
                nodeName:this.nodeName,
                tagName:this.tagName,
                isSelfClosed:this.isSelfClosed,
                closed:this.closed,
                closedStartPosition:this.closedStartPosition,
                closedEndPosition:this.closedEndPosition
            });
            return ret;
        },

        setTagName:function (v) {
            var self = this;
            self.nodeName = self.tagName = v;
            if (v) {
                self._updateSelfClosed();
            }
        },

        equals:function (tag) {
            if (!tag || this.nodeName != tag.nodeName) {
                return 0;
            }
            if (this.nodeType != tag.nodeType) {
                return 0;
            }
            if (this.attributes.length != tag.attributes.length) {
                return 0;
            }
            for (var i = 0; i < this.attributes.length; i++) {
                if (!this.attributes[i].equals(tag.attributes[i])) {
                    return 0;
                }
            }
            return 1;
        },

        isEndTag:function () {
            return /^\//.test(this.nodeName);
        },

        appendChild:function (node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },

        replace:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing[index] = this;
            refreshChildNodes(ref.parentNode);
        },

        replaceChild:function (newC, refC) {
            var self = this,
                childNodes = self.childNodes;
            var index = S.indexOf(refC, childNodes);
            childNodes[index] = newC;
            refreshChildNodes(self);
        },

        prepend:function (node) {
            this.childNodes.unshift(node);
            refreshChildNodes(this);
        },

        insertBefore:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            silbing.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },


        insertAfter:function (ref) {
            var silbing = ref.parentNode.childNodes,
                index = S.indexOf(ref, silbing);
            if (index == silbing.length - 1) {
                ref.parentNode.appendChild(this);
            } else {
                this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
            }
        },

        empty:function () {
            this.childNodes = [];
            refreshChildNodes(this);
        },

        removeChild:function (node) {
            var silbing = node.parentNode.childNodes,
                index = S.indexOf(node, silbing);
            silbing.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },

        getAttribute:function (name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },

        setAttribute:function (name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },

        removeAttribute:function (name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = S.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        },

        /**
         * give root node a chance to filter children first
         */
        filterChildren:function () {
            var self = this;
            if (!self.isChildrenFiltered) {
                var writer = new (S.require('htmlparser/writer/basic'))();
                self._writeChildrenHTML(writer);
                var parser = new (S.require('htmlparser/Parser'))(writer.getHTML()),
                    children = parser.parse().childNodes;
                self.empty();
                S.each(children, function (c) {
                    self.appendChild(c);
                });
                self.isChildrenFiltered = 1;
            }
        },

        /**
         * serialize tag to html string in writer
         * @param writer
         * @param filter
         */
        writeHTML:function (writer, filter) {
            var el = this,
                tmp,
                attrName,
                tagName = el.tagName;

            // special treat for doctype
            if (tagName == "!doctype") {
                writer.append(this.toHTML() + "\n");
                return;
            }

            el.__filter = filter;
            el.isChildrenFiltered = 0;

            // process its open tag
            if (filter) {
                // element filtered by its name directly
                if (!(tagName = filter.onTagName(tagName))) {
                    return;
                }

                el.tagName = tagName;

                tmp = filter.onTag(el);

                if (tmp === false) {
                    return;
                }

                // replaced
                if (tmp) {
                    el = tmp;
                }

                // replaced by other type of node
                if (el.nodeType !== 1) {
                    el.writeHTML(writer, filter);
                    return;
                }

                // preserve children but delete itself
                if (!el.tagName) {
                    el._writeChildrenHTML(writer);
                    return;
                }
            }

            writer.openTag(el);

            // process its attributes
            var attributes = el.attributes;
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                attrName = attr.name;
                if (filter) {
                    // filtered directly by name
                    if (!(attrName = filter.onAttributeName(attrName, el))) {
                        continue;
                    }
                    attr.name = attrName;
                    // filtered by value and node
                    if (filter.onAttribute(attr, el) === false) {
                        continue;
                    }
                }
                writer.attribute(attr, el);
            }

            // close its open tag
            writer.openTagClose(el);

            if (!el.isSelfClosed) {
                el._writeChildrenHTML(writer);
                // process its close tag
                writer.closeTag(el);
            }
        },


        /**
         * @param writer
         * @protected
         */
        _writeChildrenHTML:function (writer) {
            var self = this,
                filter = self.isChildrenFiltered ? 0 : self.__filter;
            // process its children recursively
            S.each(self.childNodes, function (child) {
                child.writeHTML(writer, filter);
            });
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
    requires:['./Node', './Attribute', '../dtd']
});