/**
 * tc about fire function
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Dom, Event) {
    var DomEventObservable = S.require('event/dom/base/observable');

    describe("fire", function () {
        it('support once', function () {
            var n = Dom.create("<div/>"), ret;

            Event.on(n, 'mouseenter', {
                fn: function (e) {
                    expect(e.type).toBe('mouseenter');
                    ret = 1
                },
                once: 1
            });

            Event.fire(n, 'mouseenter', {
                relatedTarget: document
            });

            expect(ret).toBe(1);

            expect(DomEventObservable.getDomEventObservablesHolder(n)).toBe(undefined);
        });

        it('can get fire return value', function () {
            var n = Dom.create("<div/>");

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
            });

            expect(Event.fire(n, 'xx')).toBe(1);

            Event.detach(n);

            Event.on(n, 'xx', function () {
                return false;
            });

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
            });

            expect(Event.fire(n, 'xx')).toBe(false);

            Event.detach(n);

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
                return null;
            });

            expect(Event.fire(n, 'xx')).toBe(null);
        });

        it('can get fireHandler return value', function () {
            var n = Dom.create("<div/>");

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
            });

            expect(Event.fireHandler(n, 'xx')).toBe(1);

            Event.detach(n);

            Event.on(n, 'xx', function () {
                return false;
            });

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
            });

            expect(Event.fireHandler(n, 'xx')).toBe(false);

            Event.detach(n);

            Event.on(n, 'xx', function () {
                return 1;
            });

            Event.on(n, 'xx', function () {
                return null;
            });

            expect(Event.fireHandler(n, 'xx')).toBe(null);
        });

        it('bubble event remove element/fn in the middle', function () {
            var n = Dom.create("<div>" +
                "<div class='l1'><div class='l2'></div></div>" +
                "</div>"), ret = [], dfn, winFn;

            Dom.append(n, 'body');

            var l1 = Dom.get('.l1', n);

            var l2 = Dom.get('.l2', n);

            Event.on(l1, 'click', function () {
                ret.push(1);
            });

            Event.on(l2, 'click', function () {
                ret.push(2);
                Event.detach(l2);
            });

            Event.on(l2, 'click', function () {
                Dom.append(l2, n);
                ret.push(22);
            });

            Event.on(document, 'click', dfn = function () {
                ret.push(3);
            });

            Event.on(window, 'click', winFn = function () {
                ret.push(4);
            });

            Event.fire(l2, 'click');

            expect(ret).toEqual([2, 22, 1, 3, 4]);

            ret = [];

            Event.fire(l2, 'click');

            expect(ret).toEqual([3, 4]);

            Event.detach(document, 'click', dfn);

            Event.detach(window, 'click', winFn);

            Dom.remove(n);
        });

        it('fireHandler does not bubble', function () {

            var n = Dom.create("<div>" +
                    "<div class='l1'>" +
                    "<div class='l2'></div>" +
                    "</div>" +
                    "</div>"),
                ret = [],
                dfn, winFn;

            Dom.append(n, 'body');

            var l1 = Dom.get('.l1', n);

            var l2 = Dom.get('.l2', n);

            Event.on(l1, 'click', function () {
                ret.push(1);
            });

            Event.on(l2, 'click', function () {
                ret.push(2);
                Event.detach(l2);
            });

            Event.on(l2, 'click', function () {
                Dom.append(l2, n);
                ret.push(22);
            });

            Event.on(document, 'click', dfn = function () {
                ret.push(3);
            });

            Event.on(window, 'click', winFn = function () {
                ret.push(4);
            });

            Event.fireHandler(l2, 'click');

            expect(ret).toEqual([2, 22]);

            ret = [];

            Event.fireHandler(l2, 'click');

            expect(ret).toEqual([]);

            Event.detach(document, 'click', dfn);

            Event.detach(window, 'click', winFn);

            Dom.remove(n);
        });
    });
}, {
    requires: ['dom', 'event/dom/base']
});