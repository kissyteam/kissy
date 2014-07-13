/**
 * @ignore
 * single timer for the whole anim module
 * @author yiminghe@gmail.com
 */
var win = window,
// note in background tab, interval is set to 1s in chrome/firefox
// no interval change in ie for 15, if interval is less than 15
// then in background tab interval is changed to 15
    INTERVAL = 15,
// https://gist.github.com/paulirish/1579671
    requestAnimationFrameFn,
    cancelAnimationFrameFn;

// http://bugs.jquery.com/ticket/9381
if (0) {
    requestAnimationFrameFn = win.requestAnimationFrame;
    cancelAnimationFrameFn = win.cancelAnimationFrame;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !requestAnimationFrameFn; ++x) {
        requestAnimationFrameFn = win[vendors[x] + 'RequestAnimationFrame'];
        cancelAnimationFrameFn = win[vendors[x] + 'CancelAnimationFrame'] ||
            win[vendors[x] + 'CancelRequestAnimationFrame'];
    }
} else {
    requestAnimationFrameFn = function (fn) {
        return setTimeout(fn, INTERVAL);
    };
    cancelAnimationFrameFn = function (timer) {
        clearTimeout(timer);
    };
}

//function check() {
//    if (runnings.head === runnings.tail) {
//        if (runnings.head && (runnings.head._ksNext || runnings.head._ksPrev)) {
//            debugger
//        }
//        return;
//    }
//}

var runnings = {
    head: null,
    tail: null
};

var manager = module.exports = {
    runnings: runnings,

    timer: null,

    start: function (anim) {
        //check();
        anim._ksNext = anim._ksPrev = null;
        if (!runnings.head) {
            runnings.head = runnings.tail = anim;
        } else {
            anim._ksPrev = runnings.tail;
            runnings.tail._ksNext = anim;
            runnings.tail = anim;
        }
        //check();
        manager.startTimer();
    },

    stop: function (anim) {
        this.notRun(anim);
    },

    notRun: function (anim) {
        //check();
        if (anim._ksPrev) {
            if (runnings.tail === anim) {
                runnings.tail = anim._ksPrev;
            }
            anim._ksPrev._ksNext = anim._ksNext;
            if (anim._ksNext) {
                anim._ksNext._ksPrev = anim._ksPrev;
            }
        } else {
            runnings.head = anim._ksNext;
            if (runnings.tail === anim) {
                runnings.tail = runnings.head;
            }
            if (runnings.head) {
                runnings.head._ksPrev = null;
            }
        }
        //check();
        anim._ksNext = anim._ksPrev = null;
        if (!runnings.head) {
            manager.stopTimer();
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
                self.timer = requestAnimationFrameFn(run);
                if (self.runFrames()) {
                    self.stopTimer();
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
        var anim = runnings.head;
        //var num = 0;
        //var anims = [];
        while (anim) {
            //anims.push(anim);
            var next = anim._ksNext;
            // in case anim is stopped
            anim.frame();
            anim = next;
            //num++;
        }
//        anims.forEach(function (a) {
//            a.frame();
//        });
        return !runnings.head;
    }
};
/**
 * @ignore
 *
 * 2014-06-19
 * - try linked list https://github.com/kissyteam/kissy/issues/651
 *
 * !TODO: deal with https://developers.google.com/chrome/whitepapers/pagevisibility
 */