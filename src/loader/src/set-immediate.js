/*
 setImmediate polyfill inspired by Q
 @author yiminghe@gmail.com
 */
(function (S) {
    /*global setImmediate*/
    /*global process */
    /*global MessageChannel */

    var queue = [];

    var flushing = 0;

    function flush() {
        var i = 0, item;
        while ((item = queue[i++])) {
            try {
                item();
            } catch (e) {
                S.log(e.stack || e, 'error');
                /*jshint loopfunc:true*/
                setTimeout(function () {
                    throw e;
                }, 0);
            }
        }
        if (i > 1) {
            queue = [];
        }
        flushing = 0;
    }

    /*
     setImmediate for loader and promise
     @param {Function} fn async function to call
     @private
     */
    S.setImmediate = function (fn) {
        queue.push(fn);
        if (!flushing) {
            flushing = 1;
            requestFlush();
        }
    };

    var requestFlush;
    if (typeof setImmediate === 'function') {
        requestFlush = function () {

            setImmediate(flush);
        };
    } else if (typeof process !== 'undefined' && typeof  process.nextTick === 'function') {
        requestFlush = function () {
            process.nextTick(flush);
        };
    } else if (typeof MessageChannel !== 'undefined') {
        // modern browsers
        // http://msdn.microsoft.com/en-us/library/windows/apps/hh441303.aspx
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestFlush = realRequestFlush;
            channel.port1.onmessage = flush;
            flush();
        };
        var realRequestFlush = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestFlush = function () {
            setTimeout(flush, 0);
            realRequestFlush();
        };

    } else {
        // old browsers
        requestFlush = function () {
            setTimeout(flush, 0);
        };
    }
})(KISSY);