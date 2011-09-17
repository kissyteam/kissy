/**
 * HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add(function(S, Lexer, Parser) {
    return {
        Lexer:Lexer,
        Parser:Parser
    };
}, {
    requires:['htmlparser/lexer/Lexer','htmlparser/Parser']
});

/**
 * 参考 http://htmlparser.sourceforge.net/
 **/