/**
 * test cases for node about chained call and return value
 * @author:yiminghe@gmail.com
 */
KISSY.use("dom,node", function(S, DOM, Node) {
    S.get = DOM.get;
    S.query = DOM.query;
    S.one = Node.one;
    S.all = Node.List.all;
    var NodeList = Node.List;
    //DOM 已经测试通过，通过 DOM 测 Node
    describe("node", function() {

        it("should invoke dom method correctly on node", function() {
            var n = new Node("<div id='testDiv' class='test-div'>ok</div>").appendTo(document.body);
            expect(S.get("#testDiv")).not.toBe(null);
            expect(S.get("#testDiv2")).toBe(null);

            var n2 = new Node("<div id='testDiv3' class='test-div'>ok3</div>").appendTo(n);
            expect(S.get("#testDiv3")).not.toBe(null);
            expect(S.one("#testDiv3").parent().equals(n)).toBe(true);


            new Node("<div id='testDiv6' class='test-div'>ok5</div>").appendTo(document.body);
        });


        it("should invoke dom method correctly on nodelist", function() {
            var nl = S.all(".test-div");

            //chain
            expect(nl.css("font-size", "20px")).toBe(nl);

            nl.each(function(n) {
                expect(n.css("font-size")).toBe("20px");
            });

        });


        it("should invoke method on window or document correctly", function() {
            var win = S.one(window),doc = S.one(document);

            var e = DOM.viewportHeight();
            expect(win.viewportHeight()).toBe(DOM.viewportHeight());

            expect(win.viewportWidth()).toBe(DOM.viewportWidth());

            expect(doc.viewportHeight()).toBe(DOM.viewportHeight());
            expect(doc.viewportWidth()).toBe(DOM.viewportWidth());

            expect(win.docHeight()).toBe(DOM.docHeight());
            expect(win.docWidth()).toBe(DOM.docWidth());


            expect(doc.docHeight()).toBe(DOM.docHeight());
            expect(doc.docWidth()).toBe(DOM.docWidth());

        });

        it("should append/prepend correctly on node", function() {
            var body = S.one(document.body);

            var n = body.append("<div class='test-div' id='testDiv4'>ok4</div>");

            expect(n).toBe(body);

            expect(S.get("#testDiv4")).not.toBe(null);

            var n2 = body.prepend("<div class='test-div' id='testDiv5'>ok5</div>");

            expect(S.get("#testDiv5")).not.toBe(null);
        });


        it("should append/prepend correctly on nodelist", function() {
            var body = S.one(document.body);
            new Node("<div id='testDiv7' class='test-div'>ok7</div>" +
                "<div id='testDiv8' class='test-div'>ok8</div>").appendTo(body);
            expect(S.get("#testDiv7")).not.toBe(null);
            expect(S.get("#testDiv8")).not.toBe(null);

            var newNode = new Node("<div class='test-nodelist'>test-nodelist</div>");
            var testDivs = S.all(".test-div");

            testDivs = testDivs.append(newNode);
            expect(testDivs.length).toBe(S.query(".test-nodelist").length)

        });


        it("one/all should works", function() {
            var body = S.one(document.body);
            var doms = S.query(".test-div");

            var testDivs = S.all(".test-div");
            expect(testDivs instanceof NodeList).toBe(true);
            expect(doms.length).toBe(testDivs.length);
            var i;
            for (i = 0; i < doms.length; i++) {
                expect(doms[i]).toBe(testDivs[i]);
            }

            var ps = body.all(".test-div");
            expect(ps instanceof NodeList).toBe(true);
            expect(doms.length).toBe(ps.length);
            for (i = 0; i < doms.length; i++) {
                expect(doms[i]).toBe(ps[i]);
            }
        });


        it("should on/detach event properly", function() {
            var cb = S.one("#cb");
            var handler = function() {
                expect(this).toBe(cb.getDOMNode());
            };
            cb.on("click", handler);

            jasmine.simulate(cb.getDOMNode(), "click");

            waits(10);

            runs(function() {
                cb.detach("click", handler);
            });

            var h2 = function() {
                expect(this.className).toBe("test-div");
            };

            var body = S.one(document.body);

            var ps = body.all(".test-div");

            runs(function() {
                ps.on("click", h2);
                ps.each(function(n) {
                    jasmine.simulate(n.getDOMNode(), "click");
                });
            });

            waits(10);

            runs(function() {
                ps.detach("click", h2);
            });

        });


        it("should return value or chains correctly", function() {
            var n = new Node("<div>test return</div>").appendTo(document.body);

            var ret = n.attr("test", "5");

            // chained
            expect(ret).toBe(n);

            // not chained , get value
            expect(n.attr("test")).toBe('5');

            // no-exist attribute return null
            expect(n.attr("test2")).toBe(null);


            var ret2 = n.css("font-size", "13px");

            expect(ret2).toBe(n);

            expect(n.css("font-size")).toBe("13px");

            // no-exit css value return ''
            expect(n.css("xx")).toBe('');

        });


    });

});