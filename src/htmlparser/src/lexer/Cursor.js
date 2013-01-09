/**
 *  represent a cursor of page , it can advance and retreat
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/lexer/Cursor",function() {
    function Cursor(offset) {
        this.position = offset || 0;
    }

    Cursor.prototype = {
        advance:function() {
            this.position++;
        },

        retreat:function() {
            this.position = Math.max(--this.position, 0);
        }
    };

    return Cursor;
});