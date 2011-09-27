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

        it("works for non-valid nest tag soup", function() {
            // encounter  <a>1<p>2</p>3</a> , close <a> => <a>1</a><p>2</p>3</a> => <a>1</a><p>2</p>3
            // perfection is better and more complicated ?
            // <a>1<p>2</p>3</a> , move <a> inside => <a>1</a><p><a>2</a></p><a>3</a>
            var html = "<a>我<p>测试</p>一下</a>";
            var parser = new Parser(html);
            var nodes = parser.parse();
            expect(nodes.length).toBe(3);
            expect(nodes[0].nodeName).toBe("a");
            expect(nodes[0].childNodes[0].toHtml()).toBe("我");
        });

    });


});