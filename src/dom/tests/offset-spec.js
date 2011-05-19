/**
 * test cases for offset sub module of dom module
 * @author:yiminghe@gmail.com
 * @description:need to be completed
 */
KISSY.use("dom", function(S, DOM) {
    describe("offset", function() {

        it("should works", function() {
            var test_offset = DOM.get("#test-offset");
            var o = DOM.offset(test_offset);
            DOM.offset(test_offset, o);
            var o2 = DOM.offset(test_offset);
            expect(o2.top).toBe(o.top);
            expect(o2.left).toBe(o.left);
            expect(test_offset.style.position).toBe("relative");
        });

    });
});