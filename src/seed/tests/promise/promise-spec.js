describe("KISSY.Defer", function () {
    var S = KISSY;

    it("works simply when fulfilled", function () {
        var d = S.Defer(),
            p = d.promise,
            r;

        p.then(function (v) {
            r = v;
        });
        waits(100);
        runs(function () {
            d.resolve(1);
        });
        waits(10);
        runs(function () {
            expect(r).toBe(1);
        });
    });

    it("should support promise chained promise", function () {
        var defer = S.Defer(),
            v1, v2;
        defer.promise.then(
            function (v) {
                v1 = v;
                var d2 = S.Defer();
                setTimeout(function () {
                    d2.resolve(1);
                }, 10);
                return d2.promise;
            }).then(
            function (v) {
                v2 = v;
            });

        waits(100);
        runs(function () {
            defer.resolve(2);
        });
        waits(100);
        runs(function () {
            expect(v1).toBe(2);
            expect(v2).toBe(1);
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

});