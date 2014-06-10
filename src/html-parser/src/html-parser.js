/**
 * HtmlParser for KISSY (Editor)
 * @ignore
 * @author yiminghe@gmail.com
 */
var DTD = require('html-parser/dtd');
var Lexer = require('html-parser/lexer/lexer');
var Parser = require('html-parser/parser');
var BasicWriter = require('html-parser/writer/basic');
var BeautifyWriter = require('html-parser/writer/beautify');
var MinifyWriter = require('html-parser/writer/minify');
var Filter = require('html-parser/writer/filter');
var CData = require('html-parser/nodes/cdata');
var Comment = require('html-parser/nodes/comment');
var Tag = require('html-parser/nodes/tag');
var Text = require('html-parser/nodes/text');

module.exports = {
    CData: CData,
    Comment: Comment,
    Node: require('html-parser/nodes/node'),
    Tag: Tag,
    Text: Text,
    Lexer: Lexer,
    Parser: Parser,
    BasicWriter: BasicWriter,
    BeautifyWriter: BeautifyWriter,
    MinifyWriter: MinifyWriter,
    Filter: Filter,
    DTD: DTD,
    serialize: function (n, filter) {
        var basicWriter = new BasicWriter();
        n.writeHtml(basicWriter, filter);
        return basicWriter.getHtml();
    },
    parse: function (html) {
        return new Parser(html).parse();
    }
};

/**
 * @ignore
 * refer
 *  - http://html-parser.sourceforge.net/
 *  - http://www.w3.org/TR/html5/syntax.html
 *  - http://www.w3.org/TR/html5/parsing.html
 *
 * TODO
 *  - http://blogs.msdn.com/b/ie/archive/2010/09/13/interoperable-html-parsing-in-ie9.aspx
 **/