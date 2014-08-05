var reactive = require('reactive');

function indexOf(array, item) {
    for (var i = 0, l = array.length; i < l; i++) {
        if (array[i] === item) {
            return i;
        }
    }
    return -1;
}

describe('reactive', function () {
    it('works', function () {
        var clear = 0;
        var ok = 0;
        var subscribed = 0;

        var stream = reactive.createEventStream(function (fire) {
            subscribed++;
            var timer = setTimeout(function () {
                fire(1);
            }, 0);
            return function () {
                clearTimeout(timer);
                clear = 1;
            };
        });

        stream.id = 1;

        var streamX = stream.map(function (t) {
            return t + 4;
        });

        streamX.id = 'x';

        var stream2 = stream.map(function (t) {
            return t + 1;
        });

        stream2.id = 2;

        var clearHandler = stream2.onValue(function (v2) {
            ok = 1;
            expect(v2).toBe(2);
        });

        var clearHandlerX = streamX.onValue(function () {
        });

        expect(subscribed).toBe(1);

        waitsFor(function () {
            return ok;
        });

        runs(function () {
            // has other listener
            clearHandlerX();
            expect(clear).toBe(0);
        });

        runs(function () {
            // remove all listeners
            clearHandler();
            expect(clear).toBe(1);
            subscribed = 0;
            clear = 0;
            ok = 0;
        });

        runs(function () {
            clear = 0;
            ok = 0;
        });

        var stream3;
        var clearHandler3;

        runs(function () {
            stream3 = stream.map(function (t) {
                return t + 2;
            });

            stream3.id = 3;

            // re add listeners
            clearHandler3 = stream3.onValue(function (v3) {
                ok = 1;
                expect(v3).toBe(3);
            });
        });

        waitsFor(function () {
            return ok;
        });

        runs(function () {
            clearHandler3();
            expect(clear).toBe(1);
        });
    });

    it('will remove child when child end', function () {
        var ok, end;
        var stream = reactive.createEventStream(function (fire) {
            setTimeout(function () {
                fire(1);
            }, 0);

            setTimeout(function () {
                fire(reactive.END);
                setTimeout(function () {
                    end = 1;
                }, 0);
            }, 100);
        });

        var stream2 = stream.map(function (v) {
            return v + 1;
        });

        stream2.onValue(function (v) {
            expect(v).toBe(2);
            ok = 1;
        });

        expect(indexOf(stream2._children, stream)).not.toBe(-1);

        waitsFor(function () {
            return ok && end;
        });

        runs(function () {
            expect(indexOf(stream2._children, stream)).toBe(-1);
        });
    });

    it('startsWith works for property', function () {
        var finished = 0;
        var ok = [];
        var stream = reactive.createProperty(function (fire) {
            var timer = setTimeout(function () {
                fire(1);
                finished = 1;
            }, 0);
            return function () {
                clearTimeout(timer);
            };
        }).startsWith(0);

        stream.onValue(function (v) {
            ok.push(v);
        });
        waitsFor(function () {
            return finished;
        });
        waits(100);
        runs(function () {
            expect(ok).toEqual([0, 1]);
        });
    });

    it('event stream can not access fire value', function () {
        var ok;
        var stream = reactive.createEventStream(function (fire) {
            var timer = setTimeout(function () {
                fire(1);
            }, 0);
            return function () {
                clearTimeout(timer);
            };
        });

        stream.id = 1;

        var streamX = stream.map(function (t) {
            return t + 4;
        });

        streamX.id = 'x';

        streamX.onValue(function () {
            ok = 1;
        });

        var clearHandlerAsync;
        var asyncValue = 0;
        setTimeout(function () {
            clearHandlerAsync = streamX.onValue(function () {
                asyncValue = 1;
            });
        }, 100);

        waitsFor(function () {
            return ok;
        });

        waitsFor(function () {
            return clearHandlerAsync;
        });

        runs(function () {
            expect(asyncValue).toBe(0);
        });
    });

    it('property can access fire value', function () {
        var ok;
        var stream = reactive.createProperty(function (fire) {
            var timer = setTimeout(function () {
                fire(1);
            }, 0);
            return function () {
                clearTimeout(timer);
            };
        });

        stream.id = 1;

        var streamX = stream.map(function (t) {
            return t + 4;
        });

        streamX.id = 'x';

        streamX.onValue(function () {
            ok = 1;
        });

        var clearHandlerAsync;
        var asyncValue = 0;

        setTimeout(function () {
            clearHandlerAsync = streamX.onValue(function () {
                asyncValue = 1;
            });
        }, 100);

        waitsFor(function () {
            return ok;
        });

        waitsFor(function () {
            return clearHandlerAsync;
        });

        runs(function () {
            expect(asyncValue).toBe(1);
        });
    });

    it('filter works', function () {
        var finished = 0;
        var stream1 = reactive.createEventStream(function (fire) {
            setTimeout(function () {
                fire(1);
                fire(2);
                finished = 1;
            }, 0);
        });
        var ok = [];
        var stream2 = stream1.filter(function (v) {
            return v > 1;
        });
        stream2.onValue(function (v) {
            ok.push(v);
        });
        waitsFor(function () {
            return finished;
        });
        waits(100);
        runs(function () {
            expect(ok).toEqual([2]);
        });
    });

    it('combine works', function () {
        var ok = 0;

        var stream1 = reactive.createEventStream(function (fire) {
            setTimeout(function () {
                fire(1);
            }, 10);
        });

        var stream2 = reactive.createEventStream(function (fire) {
            setTimeout(function () {
                fire(2);
            }, 100);
        });

        var fin = stream1.combine(stream2);

        fin.onValue(function (v) {
            expect(v[0]).toBe(1);
            expect(v[1]).toBe(2);
            ok = 1;
        });

        waitsFor(function () {
            return ok;
        });
    });

    it('flatMap works', function () {
        var ok;

        var stream = reactive.createEventStream(function (fire) {
            setTimeout(function () {
                fire(1);
            }, 0);
        });

        stream.id = 1;

        var stream2 = stream.flatMap(function (v) {
            var stream3 = reactive.createEventStream(function (fire) {
                setTimeout(function () {
                    fire(v + 1);
                }, 0);
            });
            stream3.id = 3;
            return stream3;
        });

        stream2.id = 2;

        stream2.onValue(function (v) {
            expect(v).toBe(2);
            ok = 1;
        });

        waitsFor(function () {
            return ok;
        });
    });
});
