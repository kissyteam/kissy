/**
 * @ignore
 * write html into its minified form,thanks to kangax where minify algorithm comes from
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BasicWriter = require('./basic');
    var Utils = require('../utils');

    var trim = S.trim,
        isBooleanAttribute = Utils.isBooleanAttribute,
        collapseWhitespace = Utils.collapseWhitespace,
        reEmptyAttribute = new RegExp(
            '^(?:class|id|style|title|lang|dir|on' +
                '(?:focus|blur|change|click|dblclick|mouse(' +
                '?:down|up|over|move|out)|key(?:press|down|up)))$');

    function escapeAttrValue(str) {
        return String(str).replace(/"/g, '&quot;');
    }

    function canDeleteEmptyAttribute(tag, attr) {
        var attrValue = attr.value || '',
            attrName = attr.name;
        if (!trim(attrValue)) {
            return ((tag === 'input' && attrName === 'value') ||
                reEmptyAttribute.test(attrName));
        }
        return 0;
    }


    function canRemoveAttributeQuotes(value) {
        // http://www.w3.org/TR/html5/syntax.html#unquoted
        // avoid \w, which could match unicode in some implementations
        return !(/[ "'=<>`]/).test(value);
    }

    function isAttributeRedundant(el, attr) {
        var tag = el.nodeName,
            attrName = attr.name,
            attrValue = attr.value || '';
        attrValue = trim(attrValue.toLowerCase());
        return (
            (tag === 'script' &&
                attrName === 'language' &&
                attrValue === 'javascript') ||

                (tag === 'form' &&
                    attrName === 'method' &&
                    attrValue === 'get') ||

                (tag === 'input' &&
                    attrName === 'type' &&
                    attrValue === 'text') ||

                (tag === 'script' &&
                    attrName === 'type' &&
                    attrValue === 'text/javascript') ||

                (tag === 'style' &&
                    attrName === 'type' &&
                    attrValue === 'text/css') ||

                (tag === 'area' &&
                    attrName === 'shape' &&
                    attrValue === 'rect')
            );
    }

    function isConditionalComment(text) {
        return (/\[if[^\]]+\]/).test(text);
    }

    function isEventAttribute(attrName) {
        return (/^on[a-z]+/).test(attrName);
    }

    function isUriTypeAttribute(attrName, tag) {
        return (
            ((/^(?:a|area|link|base)$/).test(tag) && attrName === 'href') ||
                (tag === 'img' && (/^(?:src|longdesc|usemap)$/).test(attrName)) ||
                (tag === 'object' && (/^(?:classid|codebase|data|usemap)$/).test(attrName)) ||
                (tag === 'q' && attrName === 'cite') ||
                (tag === 'blockquote' && attrName === 'cite') ||
                ((tag === 'ins' || tag === 'del') && attrName === 'cite') ||
                (tag === 'form' && attrName === 'action') ||
                (tag === 'input' && (attrName === 'src' || attrName === 'usemap')) ||
                (tag === 'head' && attrName === 'profile') ||
                (tag === 'script' && (attrName === 'src' || attrName === 'for'))
            );
    }

    function isNumberTypeAttribute(attrName, tag) {
        return (
            ((/^(?:a|area|object|button)$/).test(tag) && attrName === 'tabindex') ||
                (tag === 'input' && (attrName === 'maxlength' || attrName === 'tabindex')) ||
                (tag === 'select' && (attrName === 'size' || attrName === 'tabindex')) ||
                (tag === 'textarea' && (/^(?:rows|cols|tabindex)$/).test(attrName)) ||
                (tag === 'colgroup' && attrName === 'span') ||
                (tag === 'col' && attrName === 'span') ||
                ((tag === 'th' || tag === 'td') && (attrName === 'rowspan' || attrName === 'colspan'))
            );
    }

    function cleanAttributeValue(el, attr) {
        var tag = el.nodeName,
            attrName = attr.name,
            attrValue = attr.value || '';
        if (isEventAttribute(attrName)) {
            attrValue = trim(attrValue)
                .replace(/^javascript:[\s\xa0]*/i, '')
                .replace(/[\s\xa0]*;$/, '');
        }
        else if (attrName === 'class') {
            attrValue = collapseWhitespace(trim(attrValue));
        }
        else if (isUriTypeAttribute(attrName, tag) ||
            isNumberTypeAttribute(attrName, tag)) {
            attrValue = trim(attrValue);
        }
        else if (attrName === 'style') {
            attrValue = trim(attrValue).replace(/[\s\xa0]*;[\s\xa0]*$/, '');
        }
        return attrValue;
    }

    function cleanConditionalComment(comment) {
        return comment
            .replace(/^(\[[^\]]+\]>)[\s\xa0]*/, '$1')
            .replace(/[\s\xa0]*(<!\[endif\])$/, '$1');
    }

    function removeCDATASections(text) {
        return trim(text)
            // "/* <![CDATA[ */" or "// <![CDATA["
            .replace(/^(?:[\s\xa0]*\/\*[\s\xa0]*<!\[CDATA\[[\s\xa0]*\*\/|[\s\xa0]*\/\/[\s\xa0]*<!\[CDATA\[.*)/, '')// [\s\xa0]* ??
            // "/* ]]> */" or "// ]]>"
            .replace(/(?:\/\*[\s\xa0]*\]\]>[\s\xa0]*\*\/|\/\/[\s\xa0]*\]\]>)[\s\xa0]*$/, '');
    }

    /**
     * MinifyWriter for html content
     * @class KISSY.HtmlParser.MinifyWriter
     * @extends KISSY.HtmlParser.BasicWriter
     */
    function MinifyWriter() {
        var self = this;
        MinifyWriter.superclass.constructor.apply(self, arguments);
        self.inPre = 0;
    }

    S.extend(MinifyWriter, BasicWriter, {
        /**
         * remove non-conditional comment
         */
        comment: function (text) {
            if (isConditionalComment(text)) {
                text = cleanConditionalComment(text);
                MinifyWriter.superclass.comment.call(this, text);
            }
        },

        /**
         * record pre track
         */
        openTag: function (el) {
            var self = this;
            if (el.tagName === 'pre') {
                self.inPre = 1;
            }
            MinifyWriter.superclass.openTag.apply(self, arguments);
        },

        /**
         * clean pre track
         */
        closeTag: function (el) {
            var self = this;
            if (el.tagName === 'pre') {
                self.inPre = 0;
            }
            MinifyWriter.superclass.closeTag.apply(self, arguments);
        },

        /**
         * textarea | script | style
         */
        cdata: function (cdata) {
            cdata = removeCDATASections(cdata);
            MinifyWriter.superclass.cdata.call(this, cdata);
        },

        attribute: function (attr, el) {
            var self = this,
                name = attr.name,
                normalizedValue,
                value = attr.value || '';

            // remove empty attribute
            if (canDeleteEmptyAttribute(el, attr) ||
                // remove redundant attribute
                isAttributeRedundant(el, attr)) {
                return;
            }

            if (isBooleanAttribute(name)) {
                // collapse boolean attributes
                self.append(' ', name);
                return;
            }

            // clean attribute value
            normalizedValue = escapeAttrValue(cleanAttributeValue(el, attr));

            if (!(value && canRemoveAttributeQuotes(value))) {
                // remove quote if value is not empty
                normalizedValue = '"' + normalizedValue + '"';
            }

            self.append(' ', name, '=', normalizedValue);
        },

        /**
         * note : pre is special
         */
        text: function (text) {
            var self = this;
            if (!self.inPre) {
                // collapse whitespace
                text = collapseWhitespace(text);
            }
            self.append(text);
        }
    });

    return MinifyWriter;
});

/*
 refer :
 - https://github.com/kangax/html-minifier/
 */