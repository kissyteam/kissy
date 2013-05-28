/**
 * @ignore
 * single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/timer/manager', function (S, undefined) {
    var stamp = S.stamp;
    var win = S.Env.host;
    // note in background tab, interval is set to 1s in chrome/firefox
    // no interval change in ie for 15, if interval is less than 15
    // then in background tab interval is changed to 15
    var INTERVAL = 15;
    // https://gist.github.com/paulirish/1579671
    var requestAnimationFrameFn = win['requestAnimationFrame'],
        cancelAnimationFrameFn = win['cancelAnimationFrame'];
    if (!requestAnimationFrameFn) {
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !requestAnimationFrameFn; ++x) {
            requestAnimationFrameFn = win[vendors[x] + 'RequestAnimationFrame'];
            cancelAnimationFrameFn = win[vendors[x] + 'CancelAnimationFrame'] ||
                win[vendors[x] + 'CancelRequestAnimationFrame'];
        }
    }
    // chrome is unstable....
    if (requestAnimationFrameFn && !S.UA.chrome) {
        S.log('anim use requestAnimationFrame');
    } else {
        requestAnimationFrameFn = function (fn) {
            return setTimeout(fn, INTERVAL);
        };
        cancelAnimationFrameFn = function (timer) {
            clearTimeout(timer);
        };
    }

    return {
        runnings: {},
        timer: null,
        start: function (anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop: function (anim) {
            this.notRun(anim);
        },
        notRun: function (anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
            }
        },
        pause: function (anim) {
            this.notRun(anim);
        },
        resume: function (anim) {
            this.start(anim);
        },
        startTimer: function () {
            var self = this;
            if (!self.timer) {
                self.timer = requestAnimationFrameFn(function run() {
                    if (self.runFrames()) {
                        self.stopTimer();
                    } else {
                        self.timer = requestAnimationFrameFn(run);
                    }
                });
            }
        },
        stopTimer: function () {
            var self = this,
                t = self.timer;
            if (t) {
                cancelAnimationFrameFn(t);
                self.timer = 0;
            }
        },
        runFrames: function () {
            var self = this,
                r,
                flag,
                runnings = self.runnings;
            for (r in runnings) {
                runnings[r].frame();
                flag = 0;
            }
            return flag === undefined;
        }
    };
});
/**
 * @ignore
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 */