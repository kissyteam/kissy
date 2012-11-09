KISSY.use('dom,sizzle', function (S, DOM) {
    describe('sizzle', function () {

        beforeEach(function () {
            var html = DOM.create(
                "<div id='content-sizzle'><div id='context-test-1' class='context-test'>" +
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
                    "<div data-key='a,b'>" +
                    "</div>" +
                    "</div>" +
                    "</div></div>");

            DOM.prepend(html, document.body);
        });

        afterEach(function () {
            DOM.remove('#content-sizzle');
        });

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

        it('support , in att value', function () {
            expect($('#content-sizzle [data-key="a,b"]').length).toBe(1);
            expect(S.query('#content-sizzle [data-key="a,b"]').length).toBe(1);
        });

    });
});