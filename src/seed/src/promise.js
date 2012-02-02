/**
 * implement Promise specification by KISSY
 * @author yiminghe@gmail.com
 */
(function (S, undefined) {

    var ALREADY_RESOLVED_OR_REJECTED = 1;

    function nextTick(fn) {
        setTimeout(fn, 0);
    }

    function Defer() {
        this.promise = new Promise();
    }

    Defer.prototype = {
        constructor:Defer,
        resolve:function (value) {
        },
        reject:function (reason) {

        }
    };

    function isPromise(obj) {
        return  obj && obj instanceof Promise;
    }

    function Promise(v) {
        // maybe internal value is also a promise
        this._value = v;
        if (arguments.length) {
            this._state = ALREADY_RESOLVED_OR_REJECTED;
        }
        this._pendings = [];
    }

    Promise.prototype = {
        constructor:Promise,
        _when:function (fulfilled, rejected) {
            var v = this._value,
                pendings = this._pendings;
            // unresolved
            // pushed to pending list
            if (v === undefined) {
                pendings.push([fulfilled, rejected]);
            }
            // resolved but waiting for another promise
            // then forward
            // note: maybe a Reject
            else if (isPromise(v)) {
                nextTick(function () {
                    v._when(fulfilled, rejected);
                });
            } else {
                // normal value represents ok
                // need return user's return value
                // if return promise then forward
                return fulfilled(v);
            }
        },
        when:function (fulfilled, rejected) {

        }
    };

    function Reject(reason) {
        Promise.apply(this, arguments);
    }

    S.extend(Reject, Promise, {

    });

    function resolve(value) {
        if (value instanceof Promise) {
            return value;
        }
        return new Promise(value);
    }

    function when(value, fulfilled, rejected) {
        var defer = new Defer(), done = 0;

        function _fulfilled(value) {
            try {
                return fulfilled ? fulfilled(value) : value;
            } catch (e) {
                return new Reject(e);
            }
        }

        function _rejected(reason) {
            try {
                return rejected ? rejected(reason) : new Reject(reason);
            } catch (e) {
                return new Reject(e);
            }
        }

        nextTick(function () {
            resolve(value)._when(function (value) {
                if (done) {
                    return;
                }
                // asset.not(value instanceof Promise);
                done = 1;
                // maybe resolve(promise)
                defer.resolve(resolve(value)._when(_fulfilled, _rejected));
            }, function (reason) {
                if (done) {
                    return;
                }
                done = 1;
                defer.resolve(new Reject(reason));
            });
        });
    }

})(KISSY);

/**
 * refer
 *  - http://wiki.commonjs.org/wiki/Promises
 *  - https://github.com/kriskowal/q
 **/