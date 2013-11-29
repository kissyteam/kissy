/**
 * @ignore
 * represent line index of each line
 * @author yiminghe@gmail.com
 */
KISSY.add(function () {
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
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            if (index !== -1) {
                this.lineCursors.splice(index, 0, cursor.clone());
            }
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
                lineCursor = this.lineCursors[this.row(cursor) - 1];
            if (lineCursor) {
                linePosition = lineCursor.position;
            }
            return cursor.position - linePosition;
        }
    };

    function indexOfCursor(cs, c) {
        var cPosition = c.position;
        for (var i = 0; i < cs.length; i++) {
            var iPosition = cs[i].position;
            if (iPosition === cPosition) {
                return i;
            }
            else if (iPosition < cPosition) {
                return -1;
            }
        }
        return -1;
    }

    function indexOfCursorForInsert(cs, c) {
        var cPosition = c.position;
        for (var i = 0; i < cs.length; i++) {
            var iPosition = cs[i].position;
            if (iPosition === cPosition) {
                return -1;
            }
            else if (iPosition > cPosition) {
                return i;
            }
        }
        return i;
    }

    return Index;
});