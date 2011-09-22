KISSY.use("htmlparser", function(S, HtmlParser) {
    var Parser = HtmlParser.Parser;
    describe("Parser", function() {

        it("works for valid html", function() {
            // valid html is fine
            var html = "<div id='5'><span>1</span><a href=\"http://www.g.cn\">http://www.taobao.com</a></div>";

            var parser = new Parser(html),
                node;

            node = parser.parse()[0];

            expect(node.childNodes.length).toBe(2);

            var childnode1 = node.childNodes;

            expect(childnode1[0].nodeName).toBe("span");

            expect(childnode1[0].childNodes[0].toHtml()).toBe("1");

            expect(childnode1[1].nodeName).toBe("a");

            expect(childnode1[1].childNodes[0].toHtml()).toBe("http://www.taobao.com");
        });

        it("works for none-valid html", function() {

            // not valid html is fine too
            var html = "<div id='5'><span>1<a href=\"http://www.g.cn\">http://www.taobao.com</div>";

            var parser = new Parser(html),
                node;

            node = parser.parse()[0];

            expect(node.childNodes.length).toBe(1);

            var childnode1 = node.childNodes;

            expect(childnode1[0].nodeName).toBe("span");

            var childnode2 = childnode1[0].childNodes;

            expect(childnode2[0].toHtml()).toBe("1");

            expect(childnode2[1].nodeName).toBe("a");

            expect(childnode2[1].childNodes[0].toHtml()).toBe("http://www.taobao.com");
        });


        it("works for valid script", function() {

            // valid script ok
            var html = "<div><script>var x='<a>b</a>';</script></div>";

            var parser = new Parser(html),
                node;

            node = parser.parse()[0];

            var script = node.childNodes[0];

            expect(script.nodeName).toBe("script");

            expect(script.childNodes.length).toBe(1);

            expect(script.childNodes[0].toHtml()).toBe("var x='<a>b</a>';");

        });


        it("works for none-valid script", function() {

            // not valid script ok ,but truncated
            var html = "<div><script>var x='<a>b</a>';</a>test</script></div>";

            var parser = new Parser(html),
                node;

            node = parser.parse()[0];

            expect(node.childNodes.length).toBe(2);

            expect(node.childNodes[1].toHtml()).toBe("test");

            var script = node.childNodes[0];

            expect(script.nodeName).toBe("script");

            expect(script.childNodes.length).toBe(1);

            expect(script.childNodes[0].toHtml()).toBe("var x='<a>b</a>';");

        });

    });


});