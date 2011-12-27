/**
 * @fileOverview HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser", function(S, Lexer, Parser, BasicWriter, BeautifyWriter, MinifyWriter, Filter) {
    return {
        Lexer:Lexer,
        Parser:Parser,
        BasicWriter:BasicWriter,
        BeautifyWriter:BeautifyWriter,
        MinifyWriter:MinifyWriter,
        Filter:Filter
    };
}, {
    requires:[
        'htmlparser/lexer/Lexer',
        'htmlparser/Parser',
        'htmlparser/writer/basic',
        'htmlparser/writer/beautify',
        'htmlparser/writer/minify',
        'htmlparser/writer/filter'
    ]
});

/**
 * refer
 *  - http://htmlparser.sourceforge.net/
 *  - http://www.w3.org/TR/html5/syntax.html
 *  - http://www.w3.org/TR/html5/parsing.html
 *
 * TODO
 *  - http://blogs.msdn.com/b/ie/archive/2010/09/13/interoperable-html-parsing-in-ie9.aspx
 **/