/**
 * fire focus in correct order
 * @author yiminghe@gmail.com
 */
KISSY.use("dom,event/dom/base", function (S, DOM, Event) {
    describe("focus", function () {

        it('fired focus in correct order', function () {

            var n = DOM.create("<div class='outer'>" +
                "<div class='inner'>" +
                "<input type='input'/>" +
                "</div>" +
                "</div>"), ret;

            DOM.append(n,'body');

            Event.fire(n, "mouseenter", {
                relatedTarget: document
            });

            expect(ret).toBe(1);

            expect(Event._ObservableDOMEvent.getCustomEvents(n)).toBe(undefined);

        });

    });

});