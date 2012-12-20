/**
 * test cases for node about chained call and return value
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,node", function (S, DOM, Node) {
    S.one = Node.one;
    S.all = Node.all;
    var jq = jQuery;
    var $ = S.all;
    var NodeList = Node;
    //DOM 已经测试通过，通过 DOM 测 Node
    describe("node", function () {

        it("add works", function () {
            var x = $();
            var y = x.add("<div></div><p></p>");

            expect(x).not.toBe(y);
            expect(y.length).toBe(2);
            var z = y.add("<s></s>");
            expect(z.length).toBe(3);
            expect(z.item(2).getDOMNode().nodeName.toLowerCase()).toBe("s");
            var q = z.add("<b></b>", 0);
            expect(q.length).toBe(4);
            expect(q.item(0).getDOMNode().nodeName.toLowerCase()).toBe("b");
        });

        it("should invoke dom method correctly on node", function () {
            var n = new Node("<div id='testDiv' class='test-div'>ok</div>").appendTo(document.body);
            expect($("#testDiv")[0]).not.toBe(undefined);
            expect($("#testDiv2")[0]).toBe(undefined);

            var n2 = new Node("<div id='testDiv3' class='test-div'>ok3</div>").appendTo(n);
            expect($("#testDiv3")[0]).not.toBe(null);
            expect(S.one("#testDiv3").parent().equals(n)).toBe(true);


            new Node("<div id='testDiv6' class='test-div'>ok5</div>").appendTo(document.body);


            //data chained
            expect(n.data("x")).toBe(undefined);
            expect(jq(n).data("x")).toBe(undefined);
            n.data("x", null);
            jq(n).data("x", null);
            expect(jq(n).data("x")).toBe(null);
            expect(n.data("x")).toBe(null);
            expect(n.data("x", "y")).toBe(n);
            expect(n.data("x")).toBe("y");

            //attr chained
            expect(n.attr("test")).toBe(undefined);
            expect(n.attr("test", "xx")).toBe(n);
            expect(n.attr("test")).toBe("xx");
            expect(n.hasAttr("test")).toBe(true);


        });


        it("should invoke dom method correctly on nodelist", function () {

            var nl = S.all(".test-div");

            //chain
            expect(nl.css({
                "height": "200px",
                'overflow': 'hidden'
            })).toBe(nl);

            nl.each(function (n) {
                expect(n.css("height")).toBe("200px");
            });


        });


        it("should invoke method on window or document correctly", function () {
            var win = S.one(window), doc = S.one(document);

            var e = DOM.viewportHeight();

            expect(win.height()).toBe(DOM.viewportHeight());
            expect(win.width()).toBe(DOM.viewportWidth());


            expect(doc.height()).toBe(DOM.docHeight());
            expect(doc.width()).toBe(DOM.docWidth());

        });

        it("should append/prepend correctly on node", function () {
            var body = S.one(document.body);

            var n = body.append("<div class='test-div' id='testDiv4'>ok4</div>");

            expect(n).toBe(body);

            expect(DOM.get("#testDiv4")).not.toBe(null);

            var n2 = $("#foo").prepend("<div class='test-div' id='testDiv5'>ok5</div>");

            expect(DOM.get("#testDiv5")).not.toBe(null);
        });


        it("should append/prepend correctly on nodelist", function () {
            var body = S.one(document.body);
            new Node("<div id='testDiv7' class='test-div'>ok7</div>" +
                "<div id='testDiv8' class='test-div'>ok8</div>").appendTo(body);
            expect(DOM.get("#testDiv7")).not.toBe(null);
            expect(DOM.get("#testDiv8")).not.toBe(null);

            var newNode = new Node("<div class='test-nodelist'>test-nodelist</div>" +
                "<div class='test-nodelist'>test-nodelist2</div>");
            var testDivs = S.all(".test-div");

            testDivs = testDivs.append(newNode);
            expect(testDivs.length * 2).toBe(DOM.query(".test-nodelist").length);


            testDivs.append("<div class='test-nodelist2'>test-nodelist3</div>" +
                "<div class='test-nodelist2'>test-nodelist4</div>");
            expect(testDivs.length * 2).toBe(DOM.query(".test-nodelist2").length);


            S.all("#testDiv7").append(S.all("#testDiv8"));
            expect(S.all("#testDiv8").parent().equals(S.all('#testDiv7'))).toBe(true);


            testDivs.prepend("<div class='test-nodelist3-pre'>test-nodelist5-pre</div>" +
                "<div class='test-nodelist3-last'>test-nodelist6-last</div>");

            expect(testDivs.length).toBe(DOM.query(".test-nodelist3-pre").length);
            expect(testDivs.length).toBe(DOM.query(".test-nodelist3-last").length);


            var pres = S.all(".test-nodelist3-pre"),
                lasts = S.all(".test-nodelist3-last");
            expect(pres.length).toBe(lasts.length);

            for (var i = 0; i < pres.length; i++) {
                expect(pres.item(i).parent().attr("class")).toBe("test-div");
                expect(pres.item(i).prev()).toBe(null);
                expect(lasts.item(i).prev().equals(pres.item(i))).toBe(true);
            }
        });


        it("should insertBefore/insertAfter correctly", function () {
            var testDivs = S.all(".test-div");

            (function () {
                S.all("<div class='test-insertafter'>insertafter1</div>" +
                        "<div class='test-insertafter2'>insertafter2</div>")
                    .insertAfter(testDivs);

                var pres = S.all(".test-insertafter"),
                    lasts = S.all(".test-insertafter2");
                expect(pres.length).toBe(lasts.length);

                for (var i = 0; i < pres.length; i++) {
                    expect(pres.item(i).next().equals(lasts.item(i))).toBe(true);
                    expect(pres.item(i).prev().attr("class")).toBe("test-div");
                }
            })();

            (function () {
                S.all("<div class='test-insertbefore'>insertbefore1</div>" +
                        "<div class='test-insertbefore2'>insertbefore2</div>")
                    .insertBefore(testDivs);

                var pres = S.all(".test-insertbefore"),
                    lasts = S.all(".test-insertbefore2");
                expect(pres.length).toBe(lasts.length);

                for (var i = 0; i < pres.length; i++) {
                    expect(pres.item(i).next().equals(lasts.item(i))).toBe(true);
                    expect(lasts.item(i).next().attr("class")).toBe("test-div");
                }
            })();
        });

        it("wrapAll works", function () {
            var time = S.now();
            var wrappedCls = "f" + time;
            var wrapperCls = "x" + time;
            var body = document.body;
            var foo = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            var foo2 = body.appendChild(DOM.create("<div class='" + wrappedCls + "'></div>"));
            $("." + wrappedCls).wrapAll("<div class='" + wrapperCls + "'>" +
                "<div class='x" + wrapperCls + "'></div>" +
                "</div>");
            expect(foo.nextSibling).toBe(foo2);
            expect(foo.parentNode.childNodes.length).toBe(2);
            expect(foo.parentNode.className).toBe("x" + wrapperCls);
            expect(foo.parentNode.parentNode.className).toBe(wrapperCls);
            DOM.remove([foo, foo2]);
            $("." + wrapperCls).remove();
        });


        it("one/all should select nodes ", function () {
            var body = S.one(document.body);


            var doms = DOM.query(".test-div");

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

        it("children should return nodelist", function () {
            var body = S.one(document.body);
            var dbivs = DOM.children(body[0], "div");
            var bdivnodes = body.children("div");
            expect(bdivnodes instanceof NodeList).toBe(true);
            expect(dbivs.length).toBe(bdivnodes.length);
        });

        it("one/all should create nodes", function () {

            S.all("<div id='one-all-create'>one-all-create</div><div id='one-all-create2'>one-all-create2</div>")
                .appendTo(S.one(document.body));

            expect(S.one("#one-all-create")).not.toBe(null);
            expect(S.one("#one-all-create2")).not.toBe(null);
            expect(S.one("#one-all-create3")).toBe(null);
        });


        it("context support Node or htmlelement", function () {

            S.all("<div id='context-wrapper'>" +
                "<div class='test-div'>context-wrapper : test-div</div>" +
                "</div>").appendTo(document.body);

            expect(S.all(".test-div", S.all("#context-wrapper")).length).toBe(1);

            expect(S.all(".test-div", DOM.get("#context-wrapper")).length).toBe(1);
        });

        it("should on/detach event properly", function () {
            var cb = S.one("#cb");
            var handler = function () {
                expect(this).toBe(cb.getDOMNode());
            };
            cb.on("click", handler);

            jasmine.simulate(cb.getDOMNode(), "click");

            waits(10);

            runs(function () {
                cb.detach("click", handler);
            });

            var h2 = function () {
                expect(this.className).toBe("test-div");
            };

            var body = S.one(document.body);

            var ps = body.all(".test-div");

            runs(function () {
                ps.on("click", h2);
                ps.each(function (n) {
                    jasmine.simulate(n.getDOMNode(), "click");
                });
            });

            waits(10);

            runs(function () {
                ps.detach("click", h2);
            });

        });


        it("should return value or chains correctly", function () {
            var n = new Node("<div>test return</div>").appendTo(document.body);

            var ret = n.attr("test", "5");

            // chained
            expect(ret).toBe(n);

            // not chained , get value
            expect(n.attr("test")).toBe('5');

            // no-exist attribute return null
            expect(n.attr("test2")).toBe(undefined);


            var ret2 = n.css("font-size", "13px");

            expect(ret2).toBe(n);

            expect(n.css("font-size")).toBe("13px");

            // no-exit css value return ''
            expect(n.css("xx")).toBe('');

        });


        it("should end correctly", function () {
            var html = $("<div id='end1'><div class='end2'></div><div class='end3'></div></div>").appendTo("body");
            html.all(".end2").text("end2").end().all(".end3").text("end3").end().append("<div class='end4'></div>");
            expect($("#end1 .end2").text()).toBe("end2");
            expect($("#end1 .end3").text()).toBe("end3");
            expect($("#end1 .end4").length).toBe(1);
        });
    });

    describe("selector context", function () {
        var html = $(
            "<div id='context-test-1' class='context-test'>" +
                "<div class='context-test-3' id='context-test-2'></div>" +
                "</div>" +
                "<div class='context-test-3' id='context-test-4'></div>" +
                "<div class='context-test'>" +
                "<div class='context-test'>" +
                "<div class='context-test-3' id='context-test-5'>" +
                "</div>" +
                "</div>" +
                "</div>").appendTo("body");

        it("should support #id", function () {
            expect($(".context-test-3", "#context-test-1").length).toBe(1);
            expect($(".context-test-3").length).toBe(3);
            expect($(".context-test-3", "#context-test-1").attr("id")).toBe("context-test-2");
        });

        it("should support other string form selector and unique works", function () {
            expect($(".context-test-3", ".context-test").length).toBe(2);
        });


        it("should support node array form selector and unique works", function () {
            var c3 = $(".context-test-3");
            expect(c3.length).toBe(3);
            var c = $(".context-test");
            expect(c.length).toBe(3);
            expect($(c3, ".context-test").length).toBe(2);
            expect($(".context-test-3", c).length).toBe(2);
            expect($(c3, c).length).toBe(2);
            expect($(".context-test-3", ".context-test").length).toBe(2);

            expect(c.all(".context-test-3").length).toBe(2);
            expect(c.all(c3).length).toBe(2);

        });

        // #85
        it("slice works", function () {
            expect($("body").slice(-1)[0]).toBe(document.body);
            expect($(".context-test-3").slice(-2).length).toBe(2);
            expect($(".context-test-3").slice(-2, -1).length).toBe(1);
        });

        it('index works', function () {

            var div = $('<ul class="index-ul">' +
                '<li class="index-li">0</li>' +
                '<li class="index-li">1</li>' +
                '<li class="index-li">2</li>' +
                '</ul>').appendTo('body');

            // 单个节点
            expect($('.index-li').index($('.index-li')[1])).toBe(1);

            // 取第一个节点
            expect($('.index-li').index($('.index-li'))).toBe(0);

            // 第一个节点在 parent 中找
            expect($('.index-li').index()).toBe(0);

            expect($('.index-li').item(1).index()).toBe(1);

            // selector 集合中找当前第一个节点
            expect($('.index-li').item(1).index('.index-li')).toBe(1);

            expect($('body').index('.index-li')).toBe(-1);

            div.remove();

        });

        runs(function () {
            html.remove();
        });
    });

});