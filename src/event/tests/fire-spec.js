/**
 * @module  fire-spec
 * @author  yiminghe@gmail.com
 */
KISSY.use("dom,event,ua", function(S, DOM, Event, UA) {

    describe("fire", function() {

        it("works for mouseenter/leave", function() {

            var n = DOM.create("<div/>"),ret;
            Event.on(n, "mouseenter", function() {
                ret = 1
            });
            Event.fire(n, "mouseenter", {
                    relatedTarget:document
                });

            expect(ret).toBe(1);

            Event.detach(n);

        });


    });

});