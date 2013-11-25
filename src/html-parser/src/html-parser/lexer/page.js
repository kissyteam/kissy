/**
 * @ignore
 * represent html source
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Index = require('./index');

    function Page(source) {
        this.source = source;
        this.lineIndex = new Index();
    }

    Page.prototype = {
        constructor: Page,

        getChar: function (cursor) {
            var source = this.source;
            var i = cursor.position;
            if (i >= source.length) {
                return -1;
            }
            var ret = source.charAt(i);

            cursor.advance();

            // U+000D CARRIAGE RETURN (CR) characters and U+000A LINE FEED (LF) characters are treated specially.
            // Any CR characters that are followed by LF characters must be removed,
            // and any CR characters not followed by LF characters must be converted to LF characters.
            // Thus, newlines in HTML DOMs are represented by LF characters,
            // and there are never any CR characters in the input to the tokenization stage.
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

        ungetChar: function (cursor) {
            var source = this.source;
            cursor.retreat();
            var i = cursor.position,
                ch = source.charAt(i);
            if (ch === '\n' && 0 !== i) {
                ch = source.charAt(i - 1);
                if ('\r' === ch) {
                    cursor.retreat();
                }
            }
        },

        getText: function (start, end) {
            return this.source.slice(start, end);
        },

        row: function (cursor) {
            return this.lineIndex.row(cursor);
        },

        col: function (cursor) {
            return this.lineIndex.col(cursor);
        }
    };

    return Page;
});