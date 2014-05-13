/**
 * @ignore
 * represent tag, it can nest other tag
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Node = require('./node');
    var Attribute = require('./attribute');
    var Dtd = require('../dtd');
    var util = require('util');

    function createTag(self, tagName, attrs) {
        self.nodeName = self.tagName = tagName.toLowerCase();
        self._updateSelfClosed();
        util.each(attrs, function (v, n) {
            self.setAttribute(n, v);
        });
    }

    /**
     * Html Tag Class
     * @param page
     * @param startPosition
     * @param endPosition
     * @param attributes
     * @class KISSY.HtmlParser.Tag
     */
    function Tag(page, startPosition, endPosition, attributes) {
        var self = this;

        self.childNodes = [];
        self.firstChild = null;
        self.lastChild = null;
        self.attributes = attributes || [];
        self.nodeType = 1;

        if (typeof page === 'string') {
            createTag.apply(null, [self].concat(util.makeArray(arguments)));
        } else {
            Tag.superclass.constructor.apply(self, arguments);

            attributes = self.attributes;
            // first attribute is actually nodeName

            if (attributes[0]) {
                self.nodeName = attributes[0].name.toLowerCase();
                // end tag (</div>) is a tag too in lexer , but not exist in parsed dom tree
                self.tagName = self.nodeName.replace(/\//, '');
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
            self.closed = self.isSelfClosed;
        }
        self.closedStartPosition = -1;
        self.closedEndPosition = -1;
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
            c[c.length - 1].nextSibling = null;
        }
    }

    util.extend(Tag, Node, {
        _updateSelfClosed: function () {
            var self = this;
            // <br> <img> <input> , just recognize them immediately
            self.isSelfClosed = !!(Dtd.$empty[self.nodeName]);
            if (!self.isSelfClosed) {
                self.isSelfClosed = /\/$/.test(self.nodeName);
            }
            self.closed = self.isSelfClosed;
        },

        clone: function () {
            var ret = new Tag(),
                attrs = [];
            util.each(this.attributes, function (a) {
                attrs.push(a.clone());
            });
            util.mix(ret, {
                childNodes: [],
                firstChild: null,
                lastChild: null,
                attributes: attrs,
                nodeType: this.nodeType,
                nodeName: this.nodeName,
                tagName: this.tagName,
                isSelfClosed: this.isSelfClosed,
                closed: this.closed,
                closedStartPosition: this.closedStartPosition,
                closedEndPosition: this.closedEndPosition
            });
            return ret;
        },

        setTagName: function (v) {
            var self = this;
            self.nodeName = self.tagName = v;
            if (v) {
                self._updateSelfClosed();
            }
        },

        equals: function (tag) {
            if (!tag || this.nodeName !== tag.nodeName) {
                return 0;
            }
            if (this.nodeType !== tag.nodeType) {
                return 0;
            }
            if (this.attributes.length !== tag.attributes.length) {
                return 0;
            }
            for (var i = 0; i < this.attributes.length; i++) {
                if (!this.attributes[i].equals(tag.attributes[i])) {
                    return 0;
                }
            }
            return 1;
        },

        isEndTag: function () {
            return (/^\//).test(this.nodeName);
        },

        appendChild: function (node) {
            this.childNodes.push(node);
            refreshChildNodes(this);
        },

        replace: function (ref) {
            var sibling = ref.parentNode.childNodes,
                index = util.indexOf(ref, sibling);
            sibling[index] = this;
            refreshChildNodes(ref.parentNode);
        },

        replaceChild: function (newC, refC) {
            var self = this,
                childNodes = self.childNodes;
            var index = util.indexOf(refC, childNodes);
            childNodes[index] = newC;
            refreshChildNodes(self);
        },

        prepend: function (node) {
            this.childNodes.unshift(node);
            refreshChildNodes(this);
        },

        insertBefore: function (ref) {
            var sibling = ref.parentNode.childNodes,
                index = util.indexOf(ref, sibling);
            sibling.splice(index, 0, this);
            refreshChildNodes(ref.parentNode);
        },

        insertAfter: function (ref) {
            var sibling = ref.parentNode.childNodes,
                index = util.indexOf(ref, sibling);
            if (index === sibling.length - 1) {
                ref.parentNode.appendChild(this);
            } else {
                this.insertBefore(ref.parentNode.childNodes[[index + 1]]);
            }
        },

        empty: function () {
            this.childNodes = [];
            refreshChildNodes(this);
        },

        removeChild: function (node) {
            var sibling = node.parentNode.childNodes,
                index = util.indexOf(node, sibling);
            sibling.splice(index, 1);
            refreshChildNodes(node.parentNode);
        },

        getAttribute: function (name) {
            var attr = findAttributeByName(this.attributes, name);
            return attr && attr.value;
        },

        setAttribute: function (name, value) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                attr.value = value;
            } else {
                this.attributes.push(new Attribute(name, '=', value, '"'));
            }
        },

        removeAttribute: function (name) {
            var attr = findAttributeByName(this.attributes, name);
            if (attr) {
                var index = util.indexOf(attr, this.attributes);
                this.attributes.splice(index, 1);
            }
        },

        /**
         * give root node a chance to filter children first
         */
        filterChildren: function () {
            var self = this;
            if (!self.isChildrenFiltered) {
                var writer = new (S.require('html-parser/writer/basic'))();
                self._writeChildrenHTML(writer);
                var parser = new (S.require('html-parser/parser'))(writer.getHtml()),
                    children = parser.parse().childNodes;
                self.empty();
                util.each(children, function (c) {
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
        writeHtml: function (writer, filter) {
            var self = this,
                tmp,
                attrName,
                tagName = self.tagName;

            // special treat for doctype
            if (tagName === '!doctype') {
                writer.append(this.toHtml() + '\n');
                return;
            }

            self.__filter = filter;
            self.isChildrenFiltered = 0;

            // process its open tag
            if (filter) {
                // element filtered by its name directly
                if (!(tagName = filter.onTagName(tagName))) {
                    return;
                }

                self.tagName = tagName;

                tmp = filter.onTag(self);

                if (tmp === false) {
                    return;
                }

                // replaced
                if (tmp) {
                    self = tmp;
                }

                // replaced by other type of node
                if (self.nodeType !== 1) {
                    self.writeHtml(writer, filter);
                    return;
                }

                // preserve children but delete itself
                if (!self.tagName) {
                    self._writeChildrenHTML(writer);
                    return;
                }
            }

            writer.openTag(self);

            // process its attributes
            var attributes = self.attributes;
            for (var i = 0; i < attributes.length; i++) {
                var attr = attributes[i];
                attrName = attr.name;
                if (filter) {
                    // filtered directly by name
                    if (!(attrName = filter.onAttributeName(attrName, self))) {
                        continue;
                    }
                    attr.name = attrName;
                    // filtered by value and node
                    if (filter.onAttribute(attr, self) === false) {
                        continue;
                    }
                }
                writer.attribute(attr, self);
            }

            // close its open tag
            writer.openTagClose(self);

            if (!self.isSelfClosed) {
                self._writeChildrenHTML(writer);
                // process its close tag
                writer.closeTag(self);
            }
        },

        /**
         * @param writer
         * @protected
         */
        _writeChildrenHTML: function (writer) {
            var self = this,
                filter = self.isChildrenFiltered ? 0 : self.__filter;
            // process its children recursively
            util.each(self.childNodes, function (child) {
                child.writeHtml(writer, filter);
            });
        },

        outerHtml: function () {
            var writer = new (S.require('html-parser/writer/basic'))();
            this.writeHtml(writer);
            return writer.getHtml();
        }
    });

    function findAttributeByName(attributes, name) {
        if (attributes && attributes.length) {
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name === name) {
                    return attributes[i];
                }
            }
        }
        return null;
    }

    return Tag;
});