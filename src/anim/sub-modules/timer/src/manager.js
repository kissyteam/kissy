/**
 * @ignore
 * single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/timer/manager', function (S, undefined) {
    var stamp = S.stamp;
    var win = S.Env.host;

    var manager = {
        // note in background tab, interval is set to 1s in chrome/firefox
        // no interval change in ie for 15, if interval is less than 15
        // then in background tab interval is changed to 15
        interval: 15,
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
                self.timer = setTimeout(function () {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer: function () {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
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

    var requestAnimationFrameFn = win['requestAnimationFrame'] ||
            win['mozRequestAnimationFrame'] ||
            win['msRequestAnimationFrame'] ||
            win['webkitRequestAnimationFrame'],
        cancelAnimationFrameFn = win['cancelAnimationFrame'] ||
            win['mozCancelAnimationFrame'] ||
            win['msCancelAnimationFrame'] ||
            win['webkitCancelAnimationFrame'];

    if (requestAnimationFrameFn) {
        S.log('anim use requestAnimationFrame', 'info');
        S.mix(manager, {
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
            }
        });
    }

    return manager;
});
/**
 * @ignore
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 */