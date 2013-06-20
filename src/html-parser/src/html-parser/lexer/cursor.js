/**
 * represent a cursor of page , it can advance and retreat
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser/lexer/cursor",function() {
    function Cursor(offset) {
        this.position = offset || 0;
    }

    Cursor.prototype = {

        constructor:Cursor,

        advance:function() {
            this.position++;
        },

        retreat:function() {
            this.position = Math.max(--this.position, 0);
        }
    };

    return Cursor;
});