describe("KISSY.Defer", function () {
    var S = KISSY,
        Promise = S.Promise;


    it("works for simple value", function () {
        var r, r2;

        Promise.when(1,
            function (v) {
                r = v;
                return r + 1;
            }).then(function (v) {
                r2 = v;
            });

        waitsFor(function () {
            return r == 1 && r2 == 2;
        }, 100);
    });

    it("works simply when fulfilled", function () {
        var d = S.Defer(),
            p = d.promise,
            r;

        expect(Promise.isPromise(d)).toBe(false);
        expect(Promise.isPromise(p)).toBe(true);
        expect(Promise.isResolved(p)).toBe(false);
        expect(Promise.isRejected(p)).toBe(false);


        p.then(function (v) {
            r = v;
        });
        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(100);
        runs(function () {
            expect(r).toBe(1);
            expect(Promise.isResolved(p)).toBe(true);
        });
    });

    it("can access value after resolved", function () {
        var d = S.Defer(),
            r,
            p = d.promise;
        d.resolve(1);
        waits(100);
        runs(function () {
            expect(Promise.isResolved(p)).toBe(true);
            p.then(function (v) {
                r = v;
            });
        });
        waits(100);
        runs(function () {
            expect(r).toBe(1);
            expect(Promise.isResolved(p)).toBe(true);
        });
    });

    it("can access error after resolved", function () {
        var d = S.Defer(),
            r,
            p = d.promise;
        d.reject(1);
        waits(100);
        runs(function () {
            expect(Promise.isResolved(p)).toBe(false);
            expect(Promise.isRejected(p)).toBe(true);
            p.fail(function (v) {
                r = v;
            });
        });
        waits(100);
        runs(function () {
            expect(r).toBe(1);
            expect(Promise.isResolved(p)).toBe(false);
            expect(Promise.isRejected(p)).toBe(true);
        });
    });

    it("can transform returned value by chained promise", function () {
        var d = S.Defer(),
            p = d.promise,
            r;

        p.then(
            function (v) {
                return v + 1;
            }).then(function (v) {
                r = v;
            });
        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(100);
        runs(function () {
            expect(r).toBe(2);
        });
    });

    it("should support promise chained promise", function () {
        var defer = S.Defer(),
            p = defer.promise,
            p2,
            v1, v2;
        p2 = p.then(
            function (v) {
                v1 = v;
                var d2 = S.Defer();
                setTimeout(function () {
                    d2.resolve(1);
                }, 50);
                return d2.promise;
            }).then(
            function (v) {
                v2 = v;
            });

        waits(100);
        runs(function () {
            defer.resolve(2);
        });
        waits(20);
        runs(function () {
            expect(Promise.isResolved(p)).toBe(true);
            // p2 is waiting for d2
            expect(Promise.isResolved(p2)).toBe(false);
        });
        waits(100);
        runs(function () {
            expect(v1).toBe(2);
            expect(v2).toBe(1);
            expect(Promise.isResolved(p)).toBe(true);
            expect(Promise.isResolved(p2)).toBe(true);
        });
    });

    it("should propagate error reason", function () {

        var d = S.Defer(),
            order = [],
            p = d.promise;

        var p2 = p.then(
            function (v) {
                order.push("e1 :" + v);
                throw "e1";
            },
            function (r) {
                order.push("e2 :" + r);
                return "e2";
            });

        var p3 = p2.then(
            function (v) {
                order.push("e3 :" + v);
                throw "e3";
            },
            function (r) {
                order.push("e4 :" + r);
                throw "e4";
            });

        var p4 = p3.then(function (v) {
            order.push("e5 :" + v);
            throw "e5";
        }, function (r) {
            order.push("e6 :" + r);
            throw "e6";
        });

        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(50);
        runs(function () {
            expect(Promise.isRejected(p)).toBe(false);
            expect(Promise.isResolved(p)).toBe(true);

            expect(Promise.isRejected(p2)).toBe(true);
            expect(Promise.isResolved(p2)).toBe(false);

            // p2 rethrow
            expect(Promise.isRejected(p3)).toBe(true);
            expect(Promise.isResolved(p3)).toBe(false);
        });
        waits(100);
        runs(function () {
            expect(order).toEqual(['e1 :1', 'e4 :e1', 'e6 :e4'])
        });

    });

    it("should support error recovery", function () {

        var d = S.Defer(),
            order = [],
            p = d.promise;

        var p2 = p.then(
            function (v) {
                order.push("e1 :" + v);
                throw "e1";
            },
            function (r) {
                order.push("e2 :" + r);
                return "e2";
            });

        var p3 = p2.then(
            function (v) {
                order.push("e3 :" + v);
                throw "e3";
            },
            function (r) {
                order.push("e4 :" + r);
                return "e4";
            });

        var p4 = p3.then(function (v) {
            order.push("e5 :" + v);
            throw "e5";
        }, function (r) {
            order.push("e6 :" + r);
            throw "e6";
        });

        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(50);
        runs(function () {
            expect(Promise.isRejected(p)).toBe(false);
            expect(Promise.isResolved(p)).toBe(true);

            expect(Promise.isRejected(p2)).toBe(true);
            expect(Promise.isResolved(p2)).toBe(false);

            // p2.error recovery
            expect(Promise.isRejected(p3)).toBe(false);
            expect(Promise.isResolved(p3)).toBe(true);
        });
        waits(100);
        runs(function () {
            expect(order).toEqual(['e1 :1', 'e4 :e1', 'e5 :e4'])
        });

    });


    it("should propagate error reason by default", function () {

        var d = S.Defer(),
            order = [],
            p = d.promise;

        var p2 = p.then(
            function (v) {
                order.push("e1 :" + v);
                throw "e1";
            });

        var p3 = p2.then(
            function (v) {
                order.push("e3 :" + v);
                throw "e3";
            });

        var p4 = p3.then(function (v) {
            order.push("e5 :" + v);
            throw "e5";
        }, function (r) {
            order.push("e6 :" + r);
            throw "e6";
        });

        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(100);
        runs(function () {
            expect(order).toEqual(['e1 :1', 'e6 :e1'])
        });
    });


    it("all works", function () {
        var defer1 = S.Defer();
        var defer2 = S.Defer();
        var r = [];
        var p = Promise.all([defer1.promise, defer2.promise]);
        p.then(function (v) {
            r = v;
        });
        waits(50);
        runs(function () {
            defer1.resolve(1);
        });
        waits(50);
        runs(function () {
            expect(Promise.isResolved(defer1.promise)).toBe(true);
            expect(Promise.isResolved(defer2.promise)).toBe(false);
            expect(r).toEqual([]);
            expect(Promise.isResolved(p)).toBe(false);
        });
        waits(50);
        runs(function () {
            defer2.resolve(2);
        });
        waits(50);
        runs(function () {
            expect(Promise.isResolved(defer1.promise)).toBe(true);
            expect(Promise.isResolved(defer2.promise)).toBe(true);
            expect(r).toEqual([1, 2]);
            expect(Promise.isResolved(p)).toBe(true);
        });

    });


});