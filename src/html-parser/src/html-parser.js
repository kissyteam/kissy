/**
 * HtmlParser for KISSY (Editor)
 * @author yiminghe@gmail.com
 */
KISSY.add("html-parser", function (S, DTD, Lexer, Parser, BasicWriter, BeautifyWriter, MinifyWriter, Filter, CData, Comment, Node, Tag, Text) {
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
            n.writeHTML(basicWriter, filter);
            return basicWriter.getHTML();
        },
        parse:function (html) {
            return new Parser(html).parse();
        }
    };
}, {
    requires:[
        'html-parser/dtd',
        'html-parser/lexer/Lexer',
        'html-parser/Parser',
        'html-parser/writer/basic',
        'html-parser/writer/beautify',
        'html-parser/writer/minify',
        'html-parser/writer/filter',
        'html-parser/nodes/CData',
        'html-parser/nodes/Comment',
        'html-parser/nodes/Node',
        'html-parser/nodes/Tag',
        'html-parser/nodes/Text'
    ]
});

/**
 * refer
 *  - http://html-parser.sourceforge.net/
 *  - http://www.w3.org/TR/html5/syntax.html
 *  - http://www.w3.org/TR/html5/parsing.html
 *
 * TODO
 *  - http://blogs.msdn.com/b/ie/archive/2010/09/13/interoperable-html-parsing-in-ie9.aspx
 **/