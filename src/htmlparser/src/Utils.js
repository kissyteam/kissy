/**
 *  utils about language for html parser
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/Utils", function() {
    return {
        collapseWhitespace:function (str) {
            return str.replace(/[\s\xa0]+/g, ' ');
        },
        isLetter:function(ch) {
            return 'a' <= ch && 'z' >= ch || 'A' <= ch && 'Z' >= ch;
        },
        /**
         * http://www.w3.org/TR/html5/syntax.html#attributes-0
         */
        isValidAttributeNameStartChar:function(ch) {
            return !this.isWhitespace(ch) &&
                ch != '"' &&
                ch != "'" &&
                ch != '>' &&
                ch != "<" &&
                ch != '/' &&
                ch != '=';
        },
        /**
         *
         * @param ch
         */
        isWhitespace:function(ch) {
            // http://yiminghe.iteye.com/admin/blogs/722786
            // http://yiminghe.iteye.com/admin/blogs/788929
            // 相比平时的空格（&#32;），nbsp拥有不间断（non-breaking）特性。
            // 即连续的nbsp会在同一行内显示。即使有100个连续的nbsp，浏览器也不会把它们拆成两行。
            // &nbsp; => 160
            // /\s/.test(String.fromCharCode(160))
            // ie return false, others return true
            return /^[\s\xa0]$/.test(ch);
        }
    };
});
/**
 * refer:
 *  -  http://www.w3.org/TR/html5/syntax.html
 **/