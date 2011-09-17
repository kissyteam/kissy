/**
 * lang for html parser
 * @author yiminghe@gmail.com
 */
KISSY.add(function() {
    return {
        isLetter:function(ch) {
            return 'a' <= ch && 'z' >= ch || 'A' <= ch && 'Z' >= ch;
        },
        isWhitespace:function(ch) {
            return /\s/.test(ch);
        }
    };
});