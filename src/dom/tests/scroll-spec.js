/**
 * test cases for scroll sub module of dom module
 * @author:yiminghe@gmail.com
 * @description:need to be completed
 */
KISSY.use("dom", function(S, DOM) {
    describe("scroll", function() {
        beforeEach(function() {
            this.addMatchers({
                    toBeAlmostEqual: function(expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 20;
                    },


                    toBeEqual: function(expected) {
                        return Math.abs(parseInt(this.actual) - parseInt(expected)) < 5;
                    },

                    toBeArrayEq:function(expected) {
                        var actual = this.actual;
                        if (expected.length != actual.length) return false;
                        for (var i = 0; i < expected.length; i++) {
                            if (expected[i] != actual[i]) return false;
                        }
                        return true;
                    }
                });
        });

        var container = DOM.get('#scroll-container'),
            node = DOM.get('#scroll-el');

        var container_border_width = parseInt(DOM.css(container, "border-width"));
        var container_height = DOM.height(container);
        var node_height = node.offsetHeight;


        afterEach(function() {
            DOM.scrollTop(0);
            DOM.scrollTop(container, 0);
        });

        it("native scroll should works", function() {
            DOM.scrollIntoView(node);
            var scrollTop = Math.round(DOM.scrollTop());
            var nt = Math.round(DOM.offset(node).top);
            var ct = Math.round(DOM.offset(container).top);
            expect(scrollTop).toBeEqual(nt);
            expect(nt - ct).toBeEqual(container_border_width);
        });

        it("scroll node to container manually works", function() {
//            DOM.scrollTop(0);
//            DOM.scrollTop(container, 0);
            DOM.scrollIntoView(node, container);
            var scrollTop = Math.round(DOM.scrollTop());
            var nt = Math.round(DOM.offset(node).top);
            var ct = Math.round(DOM.offset(container).top);
            expect(scrollTop).toBeEqual(0);
            expect(nt - ct).toBeEqual(container_border_width);


            var iframe = S.get('#test-iframe'),
                inner = S.get('#test-inner', iframe.contentWindow.document);

            DOM.scrollIntoView(inner, iframe.contentWindow);
            var nt = Math.round(DOM.offset(inner).top);
            expect(nt).toBe(DOM.scrollTop(iframe.contentWindow));
        });

        it("scroll node to container at bottom", function() {
//            DOM.scrollTop(0);
//            DOM.scrollTop(container, 0);
            waitsFor(function() {
                return node_height = node.offsetHeight;
            }, "node_height got", 10000);
            runs(function() {
                DOM.scrollIntoView(node, container, false);
                var nt = Math.round(DOM.offset(node).top);
                var ct = Math.round(DOM.offset(container).top);
                S.log(nt + " , " + ct + " , " + container_height + " , " + node_height + " , " + container_border_width);
                expect(nt).toBe(ct + container_height - node_height + container_border_width);
            });
        });

        it("scroll node to bottom of window", function() {
//            DOM.scrollTop(0);
//            DOM.scrollTop(container, 0);
            DOM.scrollIntoView(container);
            var ct = Math.round(DOM.offset(container).top);
            expect(ct).toBeEqual(DOM.scrollTop());
        });


    });
});