/**
 * @ignore
 * represent line index of each line
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/lexer/index", function () {

    /**
     * Page index class.
     * @private
     * @class KISSY.HtmlParser.Lexer.Index
     */
    function Index() {
        this.lineCursors = [];
    }

    Index.prototype = {
        constructor: Index,

        add: function (cursor) {
            if (indexOfCursor(this.lineCursors, cursor) !== -1) {
                return;
            }
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            this.lineCursors.splice(index, 0, cursor);
        },

        remove: function (cursor) {
            var cs = this.lineCursors;
            var index = indexOfCursor(this.lineCursors, cursor);
            if (index !== -1) {
                cs.splice(index, 1);
            }
        },

        /**
         * line number of this cursor , index from zero
         * @param cursor
         */
        row: function (cursor) {
            var cs = this.lineCursors;
            for (var i = 0; i < cs.length; i++) {
                if (cs[i].position > cursor.position) {
                    return i - 1;
                }
            }
            return i;
        },

        col: function (cursor) {
            var linePosition = 0,
                lineCursor;
            if (lineCursor = this.lineCursors[this.row(cursor) - 1]) {
                linePosition = lineCursor.position;
            }
            return cursor.position - linePosition;
        }
    };

    function indexOfCursor(cs, c) {
        for (var i = 0; i < cs.length; i++) {
            if (cs[i].position === c.position) {
                return i;
            }
        }
        return -1;
    }

    function indexOfCursorForInsert(cs, c) {
        for (var i = 0; i < cs.length; i++) {
            if (cs[i].position > c.position) {
                return i;
            }
        }
        return i;
    }

    return Index;

});