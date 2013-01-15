/**
 * utils for anim
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/base/utils', function (S, DOM, Q,undefined) {

    var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');

    function saveRunningAnim(anim) {
        var el = anim.el,
            allRunning = DOM.data(el, runningKey);
        if (!allRunning) {
            DOM.data(el, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunningAnim(anim) {
        var el = anim.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(el, runningKey);
            }
        }
    }

    function isAnimRunning(anim) {
        var el = anim.el,
            allRunning = DOM.data(el, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }

    var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');

    function savePausedAnim(anim) {
        var el = anim.el,
            paused = DOM.data(el, pausedKey);
        if (!paused) {
            DOM.data(el, pausedKey, paused = {});
        }
        paused[S.stamp(anim)] = anim;
    }

    function removePausedAnim(anim) {
        var el = anim.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            delete paused[S.stamp(anim)];
            if (S.isEmptyObject(paused)) {
                DOM.removeData(el, pausedKey);
            }
        }
    }

    function isAnimPaused(anim) {
        var el = anim.el,
            paused = DOM.data(el, pausedKey);
        if (paused) {
            return !!paused[S.stamp(anim)];
        }
        return 0;
    }

    function pauseOrResumeQueue(el, queue, action) {
        var allAnims = DOM.data(el, action == 'resume' ? pausedKey : runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = S.merge(allAnims);

        S.each(anims, function (anim) {
            if (queue === undefined ||
                anim.config.queue == queue) {
                anim[action]();
            }
        });
    }

    return {
        saveRunningAnim: saveRunningAnim,
        removeRunningAnim: removeRunningAnim,
        isAnimPaused: isAnimPaused,
        removePausedAnim: removePausedAnim,
        savePausedAnim: savePausedAnim,
        isAnimRunning: isAnimRunning,
        // whether el has paused anim
        'isElPaused': function (el) {
            var paused = DOM.data(el, pausedKey);
            return paused && !S.isEmptyObject(paused);
        },
        // whether el is running anim
        'isElRunning': function (el) {
            var allRunning = DOM.data(el, runningKey);
            return allRunning && !S.isEmptyObject(allRunning);
        },
        pauseOrResumeQueue: pauseOrResumeQueue,
        stopEl: function (el, end, clearQueue, queue) {
            if (clearQueue) {
                if (queue === undefined) {
                    Q.clearQueues(el);
                } else if (queue !== false) {
                    Q.clearQueue(el, queue);
                }
            }
            var allRunning = DOM.data(el, runningKey),
            // can not stop in for/in , stop will modified allRunning too
                anims = S.merge(allRunning);
            S.each(anims, function (anim) {
                if (queue === undefined || anim.config.queue == queue) {
                    anim.stop(end);
                }
            });
        }
    }
}, {
    requires: ['dom', './queue']
});