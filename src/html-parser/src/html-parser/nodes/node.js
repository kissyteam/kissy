/**
 * @ignore
 * abstract class for tag and text, comment .. etc
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
    function lineCount(str) {
        var i = 0;
        // cpu!
        str.replace(/\n/g, function () {
            i++;
        });
        return i;
    }

    /**
     * node structure from htmlparser
     * @param page
     * @param startPosition
     * @param endPosition
     * @class KISSY.HtmlParse.Node
     */
    function Node(page, startPosition, endPosition) {
        this.parentNode = null;
        this.page = page;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.nodeName = null;
        this.previousSibling = null;
        this.nextSibling = null;
    }

    Node.prototype = {
        constructor: Node,

        getStartLine: function () {
            if (this.page) {
                if ('startLine' in this) {
                    return this.startLine;
                }
                this.startLine = lineCount(this.page.getText(0, this.startPosition));
            }
            return -1;
        },

        getEndLine: function () {
            if (this.page) {
                if ('endLine' in this) {
                    return this.endLine;
                }
                this.endLine = lineCount(this.page.getText(0, this.endPosition));
            }
            return -1;
        },

        /**
         * get outerHtml of current node
         * @returns {String}
         */
        toHtml: function () {
            if (this.page && this.page.getText) {
                return this.page.getText(this.startPosition, this.endPosition);
            }
            return '';
        },

        toDebugString: function () {
            var ret = [],
                self = this;
            ret.push(self.nodeName +
                '  [ ' + self.startPosition + '|' +
                self.getStartLine() +
                ' : ' + self.endPosition +
                '|' + self.getEndLine() +
                ' ]\n');
            ret.push(self.toHtml());
            return ret.join('');
        }
    };

    return Node;
});