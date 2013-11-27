/**
 * tc for lexer of html-parser
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, HtmlParser) {
    var Lexer = HtmlParser.Lexer;
    describe("html parser lexer", function () {
        it("works", function () {
            var html = "<div id='z'><<a> ";
            var lexer = new Lexer(html), node;
            var nodes = [];
            while (node = lexer.nextNode()) {
                nodes.push(node);
            }
            expect(nodes[0].nodeType).toBe(1);
            expect(nodes[0].nodeName).toBe('div');
            expect(nodes[0].attributes.length).toBe(1);
            expect(nodes[0].attributes[0].name).toBe('id');
            expect(nodes[0].attributes[0].value).toBe("z");
            expect(nodes[0].toHtml()).toBe("<div id='z'>");
            expect(nodes[1].nodeType).toBe(3);
            expect(nodes[1].toHtml()).toBe("<");
            expect(nodes[2].nodeType).toBe(1);
            expect(nodes[2].nodeName).toBe("a");
            expect(nodes[2].toHtml()).toBe("<a>");
        });

        it('can detect syntax error about tag in strict mode', function () {
            var html = "<div \n " +
                "a='b'";
            var lexer = new Lexer(html, {
                strict: true
            });
            expect(function () {
                lexer.nextNode();
            }).toThrow('div syntax error at row 2 , col 7');
            html = "</div";
            lexer = new Lexer(html, {
                strict: true
            });
            expect(function () {
                lexer.nextNode();
            }).toThrow('/div syntax error at row 1 , col 6');
            html = "<div>";
            lexer = new Lexer(html, {
                strict: true
            });
            var node = lexer.nextNode();
            expect(node.nodeName).toBe('div');
        });

        it("works for isSelfClosed", function () {
            var html = "<z/>x";
            var lexer = new Lexer(html), node;
            var nodes = [];
            while (node = lexer.nextNode()) {
                nodes.push(node);
            }
            expect(nodes.length).toBe(2);
            expect(nodes[0].tagName).toBe("z");
            expect(nodes[0].isSelfClosed).toBe(true);
        });

        it("works for <br/>", function () {
            var html = "<br/>";
            var lexer = new Lexer(html), node;
            var nodes = [];
            while (node = lexer.nextNode()) {
                nodes.push(node);
            }
            expect(nodes.length).toBe(1);
            expect(nodes[0].tagName).toBe("br");
            expect(nodes[0].isSelfClosed).toBe(true);
        });

        it("works when encounter invalid attribute value", function () {
            var html = '<a href="http://g.cn/"">1</a>';
            var lexer = new Lexer(html), node;
            var nodes = [];
            while (node = lexer.nextNode()) {
                nodes.push(node);
            }
            node = nodes[0];
            expect(nodes.length).toBe(3);
            var attributes = node.attributes;
            expect(attributes.length).toBe(1);
            expect(attributes[0].name).toBe('href');
            expect(attributes[0].value).toBe('http://g.cn/');
        });

    });
}, {
    requires: ['html-parser', 'ua']
});