/**
 * simple selector test
 * @author lifesinger@gmail.com,yiminghe@gmail.com
 */
KISSY.use("dom", function (S, DOM) {
    var $ = jQuery;
    S.get = DOM.get;
    S.query = DOM.query;
    describe("selector", function () {

        it("support #id", function () {

            expect(S.get("#test-selector").id).toBe("test-selector");

            expect(S.query("#test-selector").length).toBe(1);

            expect(S.get("#test-selector-xx")).toBe(null);

            expect(S.query("#test-selector-xx").length).toBe(0);

        });

        it("support tag", function () {
            expect(S.get("s").id).toBe("test-selector-tag");
            expect(S.query("s").length).toBe(2);

            expect(S.get("sub")).toBe(null);
            expect(S.query("sub").length).toBe(0);
        });

        it("support .cls", function () {
            expect(S.get(".test-selector").id).toBe("test-selector-1");
            expect(S.query(".test-selector").length).toBe(4);
        });

        it("support #id tag", function () {
            expect(S.get("#test-selector s").id).toBe("test-selector-tag");
            expect(S.get("#test-selector-2 s").id).toBe("");

            expect(S.query("#test-selector s").length).toBe(2);
            expect(S.query("#test-selector-2 s").length).toBe(1);
        });

        it("support comma", function () {
            expect(S.query("#test-selector-1 .test-selector , #test-selector-2 .test-selector").length)
                .toBe(2);
        });


        it("support #id .cls", function () {
            expect(S.get("#test-selector-1 .test-selector").tagName.toLowerCase()).toBe("div");
            expect(S.get("#test-selector-2 .test-selector").tagName.toLowerCase()).toBe("p");
            expect(S.query("#test-selector-1 .test-selector").length).toBe(1);
            expect(S.query("#test-selector .test-selector").length).toBe(4);
        });

        it("support tag.cls", function () {
            expect(S.get("div.test-selector").id).toBe("test-selector-1");
            expect(S.query("div.test-selector").length).toBe(3);
            expect(S.get("p.test-selector").tagName.toLowerCase()).toBe("p");
            expect(S.query("p.test-selector").length).toBe(1);
        });


        it("support #id tag.cls", function () {
            expect(S.get("#test-selector-1 p.test-selector")).toBe(null);
            expect(S.get("#test-selector-2 p.test-selector").tagName.toLowerCase()).toBe("p");
        });


        it("does not confuse name with id", function () {
            var id = "id" + S.now();
            var input = DOM.create("<input name='" + id + "'/>");
            var div = DOM.create("<div id='" + id + "'></div>");
            DOM.append(input, document.body);
            DOM.append(div, document.body);

            expect(DOM.get("#" + id).nodeName.toLowerCase()).toBe("div");

        });
    });

    describe("1.2 selector context", function () {
        var html = DOM.create(
            "<div><div id='context-test-1' class='context-test'>" +
                "<div>" +
                "<div class='context-test-3' id='context-test-2'></div>" +
                "</div>" +
                "</div>" +
                "<div>" +
                "<div class='context-test-3' id='context-test-4'></div>" +
                "</div>" +
                "<div class='context-test'>" +
                "<div class='context-test'>" +
                "<div>" +
                "<div class='context-test-3' id='context-test-5'></div>" +
                "</div>" +
                "</div>" +
                "</div></div>");

        DOM.prepend(html, document.body);


        it("should attach each properly", function () {
            var c3 = S.query(".context-test-3");
            expect(c3.length).toBe(3);
            var a = [];
            // each 绑定正常
            c3.each(function (v, i) {
                a[i] = v;
            });
            expect(a.length).toBe(3);
            expect(DOM.equals(a, c3));
        });

        it("should support #id", function () {
            expect(S.query(".context-test-3", "#context-test-1").length).toBe(1);

            expect($(".context-test-3", "#context-test-1").length).toBe(1);

            expect(S.query(".context-test-3").length).toBe(3);

            expect($(".context-test-3").length).toBe(3);

            expect(S.get(".context-test-3", "#context-test-1").id).toBe("context-test-2");

            expect($(".context-test-3", "#context-test-1").attr("id")).toBe("context-test-2");
        });


        it("should support other string form selector and unique works", function () {
            expect(S.query(".context-test-3", ".context-test").length).toBe(2);

            expect($(".context-test-3", ".context-test").length).toBe(2);

        });


        it("should support node array form selector and unique works", function () {

            var r;
            var c3 = S.query(".context-test-3");
            expect(r = c3.length).toBe(3);

            var c3j = $(".context-test-3");
            expect(r = c3j.length).toBe(3);

            var c = S.query(".context-test");
            expect(r = c.length).toBe(3);

            var cj = $(".context-test");
            expect(r = cj.length).toBe(3);

            expect(r = S.query(c3, ".context-test").length).toBe(2);
            expect(r = S.query(".context-test-3", c).length).toBe(2);
            expect(r = S.query(c3, c).length).toBe(2);
            expect(r = S.query(".context-test-3", ".context-test").length).toBe(2);

            /*jquery contrast test*/
            var t = $(c3j, ".context-test");
            // 上下文不对第一个参数是节点集合时生效
            expect(t.length).toBe(3);
            expect(r = $(".context-test-3", cj).length).toBe(2);
            // 上下文不对第一个参数是节点集合时生效
            expect(r = $(c3j, cj).length).toBe(3);
            expect(r = $(".context-test-3", ".context-test").length).toBe(2);

            expect(r = cj.find(".context-test-3").length).toBe(2);
            expect(r = cj.find(c3j).length).toBe(2);


        });

        it("support other format as first parameter", function () {
            // 普通对象
            var o = {length:1};
            expect(DOM.query(o)[0]).toBe(o);

            // KISSY NodeList
            o = {
                getDOMNodes:1
            };
            expect(DOM.query(o)).toBe(o);

            // 数组
            o = [1];
            expect(DOM.query(o)).toBe(o);

            // NodeList
            o = document.getElementsByTagName("div");
            var ret = DOM.query(o);
            expect(ret.length).toBe(o.length);
            expect(ret[0]).toBe(o[0]);
            expect(S.isArray(ret)).toBe(true);
        });

        if (S.require("sizzle")) {

            it("should support other string form selector and unique works in sizzle", function () {
                expect(S.query("div .context-test-3", "body .context-test").length).toBe(2);

                expect($("div .context-test-3", "body .context-test").length).toBe(2);

            });


            it("should support node array form selector and unique works in sizzle", function () {
                var c3 = S.query("div .context-test-3");
                expect(c3.length).toBe(3);

                var c = S.query("div .context-test");
                expect(c.length).toBe(3);


                expect(S.query(c3, "div .context-test").length).toBe(2);
                expect(S.query("div .context-test-3", c).length).toBe(2);
                expect(S.query(c3, c).length).toBe(2);
                expect(S.query("div .context-test-3", "div .context-test").length).toBe(2);
            });
        }
    });

});