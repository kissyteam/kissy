/**
 *  HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser", function (S, DTD, Lexer, Parser, BasicWriter, BeautifyWriter, MinifyWriter, Filter, CData, Comment, Node, Tag, Text) {
    return {
        CData:CData,
        Comment:Comment,
        Node:Node,
        Tag:Tag,
        Text:Text,
        Lexer:Lexer,
        Parser:Parser,
        BasicWriter:BasicWriter,
        BeautifyWriter:BeautifyWriter,
        MinifyWriter:MinifyWriter,
        Filter:Filter,
        DTD:DTD,
        serialize:function (n, filter) {
            var basicWriter = new BasicWriter();
            n.writeHtml(basicWriter, filter);
            return basicWriter.getHtml();
        },
        parse:function (html) {
            return new Parser(html).parse();
        }
    };
}, {
    requires:[
        'htmlparser/dtd',
        'htmlparser/lexer/Lexer',
        'htmlparser/Parser',
        'htmlparser/writer/basic',
        'htmlparser/writer/beautify',
        'htmlparser/writer/minify',
        'htmlparser/writer/filter',
        'htmlparser/nodes/CData',
        'htmlparser/nodes/Comment',
        'htmlparser/nodes/Node',
        'htmlparser/nodes/Tag',
        'htmlparser/nodes/Text'
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