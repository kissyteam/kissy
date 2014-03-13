/*
Copyright 2014, KISSY v1.50
MIT Licensed
build time: Mar 13 18:02
*/
/*
 Combined modules by KISSY Module Compiler: 

 promise
*/

KISSY.add("promise", [], function(S) {
  var logger = S.getLogger("s/promise");
  var PROMISE_VALUE = "__promise_value", processImmediate = S.setImmediate, PROMISE_PROGRESS_LISTENERS = "__promise_progress_listeners", PROMISE_PENDINGS = "__promise_pendings";
  function logError(str) {
    if(typeof console !== "undefined" && console.error) {
      console.error(str)
    }
  }
  function promiseWhen(promise, fulfilled, rejected) {
    if(promise instanceof Reject) {
      processImmediate(function() {
        rejected.call(promise, promise[PROMISE_VALUE])
      })
    }else {
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      if(pendings === undefined) {
        pendings = promise[PROMISE_PENDINGS] = []
      }
      if(pendings) {
        pendings.push([fulfilled, rejected])
      }else {
        if(isPromise(v)) {
          promiseWhen(v, fulfilled, rejected)
        }else {
          if(fulfilled) {
            processImmediate(function() {
              fulfilled.call(promise, v)
            })
          }
        }
      }
    }
  }
  function Defer(promise) {
    var self = this;
    if(!(self instanceof Defer)) {
      return new Defer(promise)
    }
    self.promise = promise || new Promise;
    self.promise.defer = self
  }
  Defer.prototype = {constructor:Defer, resolve:function(value) {
    var promise = this.promise, pendings;
    if((pendings = promise[PROMISE_PENDINGS]) === false) {
      return null
    }
    promise[PROMISE_VALUE] = value;
    pendings = pendings ? [].concat(pendings) : [];
    promise[PROMISE_PENDINGS] = false;
    promise[PROMISE_PROGRESS_LISTENERS] = false;
    S.each(pendings, function(p) {
      promiseWhen(promise, p[0], p[1])
    });
    return value
  }, reject:function(reason) {
    return this.resolve(new Reject(reason))
  }, notify:function(message) {
    S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
      processImmediate(function() {
        listener(message)
      })
    })
  }};
  function isPromise(obj) {
    return obj && obj instanceof Promise
  }
  function bind(fn, context) {
    return function() {
      return fn.apply(context, arguments)
    }
  }
  function Promise(v) {
    var self = this;
    if(typeof v === "function") {
      var defer = new Defer(self);
      var resolve = bind(defer.resolve, defer);
      var reject = bind(defer.reject, defer);
      try {
        v(resolve, reject)
      }catch(e) {
        logError(e.stack || e);
        reject(e)
      }
    }
  }
  Promise.prototype = {constructor:Promise, then:function(fulfilled, rejected, progressListener) {
    if(progressListener) {
      this.progress(progressListener)
    }
    return when(this, fulfilled, rejected)
  }, progress:function(progressListener) {
    var self = this, listeners = self[PROMISE_PROGRESS_LISTENERS];
    if(listeners === false) {
      return self
    }
    if(!listeners) {
      listeners = self[PROMISE_PROGRESS_LISTENERS] = []
    }
    listeners.push(progressListener);
    return self
  }, fail:function(rejected) {
    return when(this, 0, rejected)
  }, fin:function(callback) {
    return when(this, function(value) {
      return callback(value, true)
    }, function(reason) {
      return callback(reason, false)
    })
  }, done:function(fulfilled, rejected) {
    var self = this, onUnhandledError = function(e) {
      S.log(e.stack || e, "error");
      setTimeout(function() {
        throw e;
      }, 0)
    }, promiseToHandle = fulfilled || rejected ? self.then(fulfilled, rejected) : self;
    promiseToHandle.fail(onUnhandledError)
  }, isResolved:function() {
    return isResolved(this)
  }, isRejected:function() {
    return isRejected(this)
  }};
  Promise.prototype["catch"] = Promise.prototype.fail;
  function Reject(reason) {
    if(reason instanceof Reject) {
      return reason
    }
    var self = this;
    self[PROMISE_VALUE] = reason;
    self[PROMISE_PENDINGS] = false;
    self[PROMISE_PROGRESS_LISTENERS] = false;
    return self
  }
  S.extend(Reject, Promise);
  function when(value, fulfilled, rejected) {
    var defer = new Defer, done = 0;
    function _fulfilled(value) {
      try {
        return fulfilled ? fulfilled.call(this, value) : value
      }catch(e) {
        logError(e.stack || e);
        return new Reject(e)
      }
    }
    function _rejected(reason) {
      try {
        return rejected ? rejected.call(this, reason) : new Reject(reason)
      }catch(e) {
        logError(e.stack || e);
        return new Reject(e)
      }
    }
    function finalFulfill(value) {
      if(done) {
        logger.error("already done at fulfilled");
        return
      }
      if(value instanceof Promise) {
        logger.error("assert.not(value instanceof Promise) in when");
        return
      }
      done = 1;
      defer.resolve(_fulfilled.call(this, value))
    }
    if(value instanceof Promise) {
      promiseWhen(value, finalFulfill, function(reason) {
        if(done) {
          logger.error("already done at rejected");
          return
        }
        done = 1;
        defer.resolve(_rejected.call(this, reason))
      })
    }else {
      finalFulfill(value)
    }
    return defer.promise
  }
  function isResolved(obj) {
    return obj && !isRejected(obj) && obj[PROMISE_PENDINGS] === false && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))
  }
  function isRejected(obj) {
    return obj && (obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)
  }
  KISSY.Defer = Defer;
  KISSY.Promise = Promise;
  Promise.Defer = Defer;
  S.mix(Promise, {when:when, cast:function(obj) {
    if(obj instanceof Promise) {
      return obj
    }
    return when(obj)
  }, resolve:function(obj) {
    return when(obj)
  }, reject:function(obj) {
    return new Reject(obj)
  }, isPromise:isPromise, isResolved:isResolved, isRejected:isRejected, all:function(promises) {
    var count = promises.length;
    if(!count) {
      return null
    }
    var defer = new Defer;
    for(var i = 0;i < promises.length;i++) {
      (function(promise, i) {
        when(promise, function(value) {
          promises[i] = value;
          if(--count === 0) {
            defer.resolve(promises)
          }
        }, function(r) {
          defer.reject(r)
        })
      })(promises[i], i)
    }
    return defer.promise
  }, async:function(generatorFunc) {
    return function() {
      var generator = generatorFunc.apply(this, arguments);
      function doAction(action, arg) {
        var result;
        try {
          result = generator[action](arg)
        }catch(e) {
          return new Reject(e)
        }
        if(result.done) {
          return result.value
        }
        return when(result.value, next, throwEx)
      }
      function next(v) {
        return doAction("next", v)
      }
      function throwEx(e) {
        return doAction("throw", e)
      }
      return next()
    }
  }});
  return Promise
});

