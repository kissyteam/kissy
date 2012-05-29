/**
 * @fileOverview single timer for the whole anim module
 * @author  yiminghe@gmail.com
 */
KISSY.add("anim/manager", function(S) {
    var stamp = S.stamp;

    return {
        interval:15,
        runnings:{},
        timer:null,
        start:function(anim) {
            var self = this,
                kv = stamp(anim);
            if (self.runnings[kv]) {
                return;
            }
            self.runnings[kv] = anim;
            self.startTimer();
        },
        stop:function(anim) {
            this.notRun(anim);
        },
        notRun:function(anim) {
            var self = this,
                kv = stamp(anim);
            delete self.runnings[kv];
            if (S.isEmptyObject(self.runnings)) {
                self.stopTimer();
            }
        },
        pause:function(anim) {
            this.notRun(anim);
        },
        resume:function(anim) {
            this.start(anim);
        },
        startTimer:function() {
            var self = this;
            if (!self.timer) {
                self.timer = setTimeout(function() {
                    if (!self.runFrames()) {
                        self.timer = 0;
                        self.startTimer();
                    } else {
                        self.stopTimer();
                    }
                }, self.interval);
            }
        },
        stopTimer:function() {
            var self = this,
                t = self.timer;
            if (t) {
                clearTimeout(t);
                self.timer = 0;
            }
        },
        runFrames:function() {
            var self = this,
                done = 1,
                runnings = self.runnings;
            for (var r in runnings) {
                if (runnings.hasOwnProperty(r)) {
                    done = 0;
                    runnings[r]._frame();
                }
            }
            return done;
        }
    };
});