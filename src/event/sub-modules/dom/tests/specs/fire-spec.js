/**
 * @fileOverview tc about fire function
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom", function (S, DOM, Event) {
    describe("fire", function () {

        it("works for mouseenter/leave", function () {

            var n = DOM.create("<div/>"), ret;
            Event.on(n, "mouseenter", function (e) {
                expect(e.type).toBe('mouseenter');
                ret = 1
            });
            Event.fire(n, "mouseenter", {
                relatedTarget: document
            });

            expect(ret).toBe(1);

            Event.detach(n);

        });


        it('support once', function () {

            var n = DOM.create("<div/>"), ret;

            Event.on(n, "mouseenter", {
                fn: function (e) {
                    expect(e.type).toBe('mouseenter');
                    ret = 1
                },
                once: 1
            });

            Event.fire(n, "mouseenter", {
                relatedTarget: document
            });

            expect(ret).toBe(1);

            expect(Event._ObservableDOMEvent.getCustomEvents(n)).toBe(undefined);

        });

    });

});