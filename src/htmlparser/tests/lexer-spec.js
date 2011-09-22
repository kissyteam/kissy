KISSY.use("htmlparser", function(S, HtmlParser) {

    describe("Lexer", function() {


        it("works", function() {
            var Lexer = HtmlParser.Lexer;
            var html = "<div id='z'><<a> ";
            var lexer = new Lexer(html),node;
            var nodes = [];
            while (node = lexer.nextNode()) {
                nodes.push(node);
            }
            expect(nodes[0].nodeType).toBe(1);
            expect(nodes[0].nodeName).toBe("div");
            expect(nodes[0].attributes.length).toBe(1);
            expect(nodes[0].attributes[0].name).toBe("id");
            expect(nodes[0].attributes[0].value).toBe("z");
            expect(nodes[0].toHtml()).toBe("<div id='z'>");
            expect(nodes[1].nodeType).toBe(3);
            expect(nodes[1].toHtml()).toBe("<");
            expect(nodes[2].nodeType).toBe(1);
            expect(nodes[2].nodeName).toBe("a");
            expect(nodes[2].toHtml()).toBe("<a>");
        });

    });


});