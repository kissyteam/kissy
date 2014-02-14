/**
 * es6 promise api
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var Promise = require('promise');
    var Defer = Promise.Defer;
    describe('es6 promise', function () {
        describe('constructor', function () {
            it('resolve sync works', function () {
                var obj = {};
                var ok = 1;
                var promise = new Promise(function (resolve) {
                    resolve(obj);
                });
                promise.then(function (ret) {
                    ok = 1;
                    expect(ret).toBe(obj);
                });
                waitsFor(function () {
                    return ok;
                });
            });

            it('reject sync works', function () {
                var obj = {};
                var ok = 1;
                var promise = new Promise(function (resolve, reject) {
                    reject(obj);
                });
                promise.then(undefined, function (ret) {
                    ok = 1;
                    expect(ret).toBe(obj);
                });
                waitsFor(function () {
                    return ok;
                });
            });

            it('resolve async works', function () {
                var obj = {};
                var ok = 1;
                var promise = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(obj);
                    }, 100);
                });
                promise.then(function (ret) {
                    ok = 1;
                    expect(ret).toBe(obj);
                });
                waitsFor(function () {
                    return ok;
                });
            });

            it('reject async works', function () {
                var obj = {};
                var ok = 1;
                var promise = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(obj);
                    }, 100);
                });
                promise.then(undefined, function (ret) {
                    ok = 1;
                    expect(ret).toBe(obj);
                });
                waitsFor(function () {
                    return ok;
                });
            });

            it('catch function parameter', function () {
                var obj = {};
                var ok = 1;
                var promise = new Promise(function (resolve, reject) {
                    if (1) {
                        throw obj;
                    }
                    reject(2);
                });
                promise.then(undefined, function (ret) {
                    ok = 1;
                    expect(ret).toBe(obj);
                });
                waitsFor(function () {
                    return ok;
                });
            });
        });

        describe('cast', function () {
            it('cast promise works', function () {
                var defer = new Defer();
                expect(Promise.cast(defer.promise)).toBe(defer.promise);
            });

            it('cast common obj works', function () {
                var obj = {};
                var ok = 0;
                Promise.cast(obj).then(function (obj2) {
                    expect(obj).toBe(obj2);
                    ok = 1;
                });
                waitsFor(function () {
                    return ok;
                });
            });
        });

        describe('resolve', function () {
            it('resolve thenable works', function () {
                var defer = new Defer();
                var casted = Promise.resolve(defer.promise);
                expect(casted).not.toBe(defer.promise);
                var obj = {};
                defer.resolve(obj);
                var obj2;
                casted.then(function (ret) {
                    obj2 = ret;
                });
                waitsFor(function () {
                    return obj2;
                });
                runs(function () {
                    expect(obj2).toBe(obj);
                });
            });

            it('resolve common obj works', function () {
                var obj = {};
                var ok = 0;
                Promise.resolve(obj).then(function (obj2) {
                    expect(obj).toBe(obj2);
                    ok = 1;
                });
                waitsFor(function () {
                    return ok;
                });
            });
        });

        it('reject works', function () {
            var error = new Error({});
            var ok = 0;
            Promise.reject(error).then(undefined, function (reason) {
                expect(reason).toBe(error);
                ok = 1;
            });
            waitsFor(function () {
                return ok;
            });
        });
    });
});