/**
 * implement Promise specification by KISSY
 * @author yiminghe@gmail.com
 * @description thanks to https://github.com/kriskowal/q
 */
(function (KISSY, undefined) {
    var S = KISSY;

    function nextTick(fn) {
        // for debug
        // fn();
        // make parallel call in production
        // setTimeout(fn, 0);
        // sync,same with event
        fn();
    }

    /**
     * @class Defer constructor For KISSY,implement Promise specification.
     * @memberOf KISSY
     */
    function Defer(promise) {
        var self = this;
        if (!(self instanceof Defer)) {
            return new Defer(promise);
        }
        // http://en.wikipedia.org/wiki/Object-capability_model
        // principal of least authority
        /**
         * @description defer object's promise
         * @type KISSY.Promise
         * @memberOf KISSY.Defer#
         * @name promise
         */
        self.promise = promise || new Promise();
    }

    Defer.prototype =
    /**
     * @lends KISSY.Defer.prototype
     */
    {
        constructor:Defer,
        /**
         * fulfill defer object's promise
         * note: can only be called once
         * @param value defer object's value
         * @returns defer object's promise
         */
        resolve:function (value) {
            var promise = this.promise,
                pendings;
            if (!(pendings = promise._pendings)) {
                return undefined;
            }
            // set current promise's resolved value
            // maybe a promise or instant value
            promise._value = value;
            pendings = [].concat(pendings);
            promise._pendings = undefined;
            for (var i = 0; i < pendings.length; i++) {
                (function (p) {
                    nextTick(function () {
                        promise._when(p[0], p[1]);
                    });
                })(pendings[i]);
            }
            return value;
        },
        /**
         * reject defer object's promise
         * @param reason
         * @returns defer object's promise
         */
        reject:function (reason) {
            return this.resolve(new Reject(reason));
        }
    };

    function isPromise(obj) {
        return  obj && obj instanceof Promise;
    }

    /**
     * @class Promise constructor.
     * This class should not be instantiated manually.
     * Instances will be created and returned as needed by {@link KISSY.Defer#promise}
     * @namespace
     * @param v promise's resolved value
     * @memberOf KISSY
     */
    function Promise(v) {
        var self = this;
        // maybe internal value is also a promise
        self._value = v;
        if (!arguments.length) {
            self._pendings = [];
        }
    }

    Promise.prototype =
    /**
     * @lends KISSY.Promise.prototype
     */
    {
        constructor:Promise,
        /**
         * two effects:
         * 1. call fulfilled with immediate value
         * 2. push fulfilled in right promise
         * @private
         * @param fulfilled
         * @param rejected
         */
        _when:function (fulfilled, rejected) {
            var promise = this,
                v = promise._value,
                pendings = promise._pendings;
            // unresolved
            // pushed to pending list
            if (pendings) {
                pendings.push([fulfilled, rejected]);
            }
            // rejected or nested promise
            else if (isPromise(v)) {
                nextTick(function () {
                    v._when(fulfilled, rejected);
                });
            } else {
                // fulfilled value
                // normal value represents ok
                // need return user's return value
                // if return promise then forward
                return fulfilled && fulfilled(v);
            }
            return undefined;
        },
        /**
         * register callbacks when this promise object is resolved
         * @param {Function(*)} fulfilled called when resolved successfully,pass a resolved value to this function and
         *                      return a value (could be promise object) for the new promise's resolved value.
         * @param {Function(*)} [rejected] called when error occurs,pass error reason to this function and
         *                      return a new reason for the new promise's error reason
         * @returns {KISSY.Promise} a new promise object
         */
        then:function (fulfilled, rejected) {
            return when(this, fulfilled, rejected);
        },
        /**
         * call rejected callback when this promise object is rejected
         * @param {Function(*)} rejected called with rejected reason
         * @returns {KISSY.Promise} a new promise object
         */
        fail:function (rejected) {
            return when(this, 0, rejected);
        },
        /**
         * call callback when this promise object is rejected or resolved
         * @param {Function(*,Boolean)} callback the second parameter is
         * true when resolved and false when rejected
         * @@returns {KISSY.Promise} a new promise object
         */
        fin:function (callback) {
            return when(this, function (value) {
                return callback(value, true);
            }, function (reason) {
                return callback(reason, false);
            });
        },
        /**
         * whether the given object is a resolved promise
         * if it is resolved with another promise,
         * then that promise needs to be resolved as well.
         */
        isResolved:function () {
            return isResolved(this);
        },
        /**
         * whether the given object is a rejected promise
         */
        isRejected:function () {
            return isRejected(this);
        }
    };

    function Reject(reason) {
        if (reason instanceof Reject) {
            return reason;
        }
        Promise.apply(this, arguments);
        if (this._value instanceof Promise) {
            S.error('assert.not(this._value instanceof promise) in Reject constructor');
        }
        return undefined;
    }

    S.extend(Reject, Promise, {
        // override,simply call rejected
        _when:function (fulfilled, rejected) {
            // if there is a rejected , should always has! see when()
            if (!rejected) {
                S.error("no rejected callback!");
            }
            return rejected ? rejected(this._value) : new Reject(this._value);
        }
    });

    function resolve(value) {
        if (value instanceof Promise) {
            return value;
        }
        return new Promise(value);
    }

    /**
     * wrap for promise._when
     * @param value
     * @param fulfilled
     * @param [rejected]
     */
    function when(value, fulfilled, rejected) {
        var defer = new Defer(),
            done = 0;

        // wrap user's callback to catch exception
        function _fulfilled(value) {
            try {
                return fulfilled ? fulfilled(value) : value;
            } catch (e) {
                S.log(e,"error");
                return new Reject(e);
            }
        }

        function _rejected(reason) {
            try {
                return rejected ? rejected(reason) : new Reject(reason);
            } catch (e) {
                S.log(e,"error");
                return new Reject(e);
            }
        }

        nextTick(function () {
            resolve(value)._when(function (value) {
                if (done) {
                    S.error("already done at fulfilled");
                    return;
                }
                if (value instanceof Promise) {
                    S.error("assert.not(value instanceof Promise) in when")
                }
                done = 1;
                defer.resolve(
                    // may return another promise
                    resolve(value)._when(_fulfilled, _rejected)
                );
            }, function (reason) {
                if (done) {
                    S.error("already done at rejected");
                    return;
                }
                done = 1;
                // _reject may return non-Reject object for error recovery
                defer.resolve(_rejected(reason));
            });
        });

        // chained and leveled
        // wait for value's resolve
        return defer.promise;
    }

    function isResolved(obj) {
        // exclude Reject at first
        return !isRejected(obj) &&
            isPromise(obj) &&
            (obj._pendings === undefined) &&
            (
                // immediate value
                !isPromise(obj._value) ||
                    // resolved with a resolved promise !!! :)
                    // Reject._value is string
                    isResolved(obj._value)
                );
    }

    function isRejected(obj) {
        return isPromise(obj) &&
            (obj._pendings === undefined) &&
            (obj._value instanceof Reject);
    }

    KISSY.Defer = Defer;
    KISSY.Promise = Promise;

    S.mix(Promise,
        /**
         * @lends KISSY.Promise
         */
        {
            /**
             * register callbacks when obj as a promise is resolved
             * or call fulfilled callback directly when obj is not a promise object
             * @param {KISSY.Promise|*} obj a promise object or value of any type
             * @param {Function(*)} fulfilled called when obj resolved successfully,pass a resolved value to this function and
             *                      return a value (could be promise object) for the new promise's resolved value.
             * @param {Function(*)} [rejected] called when error occurs in obj,pass error reason to this function and
             *                      return a new reason for the new promise's error reason
             * @returns {KISSY.Promise} a new promise object
             * @example
             * <code>
             * function check(p){
             *   S.Promise.when(p,function(v){
             *     alert(v===1);
             *   });
             * }
             *
             * var defer=S.Defer();
             * defer.resolve(1);
             *
             * check(1); // => alert(true)
             *
             * check(defer.promise); //=> alert(true);
             * </code>
             * @function
             */
            when:when,
            /**
             * whether the given object is a promise
             * @function
             * @param obj the tested object
             */
            isPromise:isPromise,
            /**
             * whether the given object is a resolved promise
             * @function
             * @param obj the tested object
             */
            isResolved:isResolved,
            /**
             * whether the given object is a rejected promise
             * @function
             * @param obj the tested object
             */
            isRejected:isRejected,
            /**
             * return a new promise
             * which is resolved when all promises is resolved
             * and rejected when any one of promises is rejected
             * @param {KISSY.Promise[]} promises list of promises
             */
            all:function (promises) {
                return when([].concat(promises), function (promises) {
                    var count = promises.length;
                    if (!count) {
                        return promises;
                    }
                    var defer = Defer();
                    for (var i = 0; i < promises.length; i++) {
                        (function (promise, i) {
                            when(promise, function (value) {
                                promises[i] = value;
                                if (--count === 0) {
                                    // if all is resolved
                                    // then resolve final returned promise with all value
                                    defer.resolve(promises);
                                }
                            }, function (r) {
                                // if any one is rejected
                                // then reject final return promise with first reason
                                defer.reject(r);
                            });
                        })(promises[i], i);
                    }
                    return defer.promise;
                });
            }
        });

})(KISSY);

/**
 * refer:
 *  - http://wiki.commonjs.org/wiki/Promises
 *  - http://en.wikipedia.org/wiki/Futures_and_promises#Read-only_views
 *  - http://en.wikipedia.org/wiki/Object-capability_model
 *  - https://github.com/kriskowal/q
 *  - http://www.sitepen.com/blog/2010/05/03/robust-promises-with-dojo-deferred-1-5/
 *  - http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/
 **/