/**
 * HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Lexer) {
    return {
        Lexer:Lexer
    };
}, {
    requires:['htmlparser/lexer/Lexer']
});

/**
 * 参考 http://htmlparser.sourceforge.net/
 **/