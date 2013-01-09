/**
 *  represent line index of each line
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Index",function() {

    function Index() {
        this.lineCursors = [];
    }

    Index.prototype = {


        add:function(cursor) {
            if (indexOfCursor(this.lineCursors, cursor) != -1) {
                return;
            }
            var index = indexOfCursorForInsert(this.lineCursors, cursor);
            this.lineCursors.splice(index, 0, cursor);
        },

        remove:function(cursor) {
            var cs = this.lineCursors;
            var index = indexOfCursor(this.lineCursors, cursor);
            if (index != -1) {
                cs.splice(index, 1);
            }
        },

        /**
         * line number of this cursor , index from zero
         * @param cursor
         */
        row:function(cursor) {
            return indexOfCursorForInsert(this.lineCursors, cursor) - 1;
        },

        col:function(cursor) {
            var row = indexOfCursorForInsert(this.lineCursors, cursor) - 1;
            return cursor.position - this.lineCursors[row]
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