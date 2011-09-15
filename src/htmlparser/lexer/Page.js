/**
 * represent html source
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Index) {
    function Page(source) {
        this.source = source;
        this.lineIndex = new Index();
    }

    Page.prototype = {
        getChar:function(cursor) {
            var source = this.source;
            var i = cursor.position;
            if (i >= source.length) {
                return -1;
            }
            var ret = source.charAt(i);

            cursor.advance();

            // normalize line separator
            if ('\r' === ret) {
                ret = '\n';
                i = cursor.position;
                var next = source.charAt(i);
                if (next === '\n') {
                    cursor.advance();
                }
            }

            // update line Index
            if ('\n' === ret) {
                this.lineIndex.add(cursor);
            }

            return ret;

        },

        ungetChar:function(cursor) {
            var source = this.source;
            cursor.retreat();
            var i = cursor.position;
            var ch = source.charAt(i);
            if (ch === '\n' && 0 != i) {
                ch = source.charAt(i - 1);
                if ('\r' === ch) {
                    cursor.retreat();
                }
            }
        },

        getText:function(start, end) {
            return this.source.slice(start, end);
        },

        row:function(cursor) {
            return this.lineIndex.row(cursor);
        },

        col:function(cursor) {
            return this.lineIndex.col(cursor);
        }
    };

    return Page;
}, {
    requires:['./Index']
});