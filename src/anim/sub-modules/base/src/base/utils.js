/**
 * utils for anim
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/base/utils', function (S, DOM, Q,undefined) {

    var runningKey = S.guid('ks-anim-unqueued-' + S.now() + '-');

    function saveRunningAnim(anim) {
        var node = anim.node,
            allRunning = DOM.data(node, runningKey);
        if (!allRunning) {
            DOM.data(node, runningKey, allRunning = {});
        }
        allRunning[S.stamp(anim)] = anim;
    }

    function removeRunningAnim(anim) {
        var node = anim.node,
            allRunning = DOM.data(node, runningKey);
        if (allRunning) {
            delete allRunning[S.stamp(anim)];
            if (S.isEmptyObject(allRunning)) {
                DOM.removeData(node, runningKey);
            }
        }
    }

    function isAnimRunning(anim) {
        var node = anim.node,
            allRunning = DOM.data(node, runningKey);
        if (allRunning) {
            return !!allRunning[S.stamp(anim)];
        }
        return 0;
    }

    var pausedKey = S.guid('ks-anim-paused-' + S.now() + '-');

    function savePausedAnim(anim) {
        var node = anim.node,
            paused = DOM.data(node, pausedKey);
        if (!paused) {
            DOM.data(node, pausedKey, paused = {});
        }
        paused[S.stamp(anim)] = anim;
    }

    function removePausedAnim(anim) {
        var node = anim.node,
            paused = DOM.data(node, pausedKey);
        if (paused) {
            delete paused[S.stamp(anim)];
            if (S.isEmptyObject(paused)) {
                DOM.removeData(node, pausedKey);
            }
        }
    }

    function isAnimPaused(anim) {
        var node = anim.node,
            paused = DOM.data(node, pausedKey);
        if (paused) {
            return !!paused[S.stamp(anim)];
        }
        return 0;
    }

    function pauseOrResumeQueue(node, queue, action) {
        var allAnims = DOM.data(node, action == 'resume' ? pausedKey : runningKey),
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
        // whether node has paused anim
        'isElPaused': function (node) {
            var paused = DOM.data(node, pausedKey);
            return paused && !S.isEmptyObject(paused);
        },
        // whether node is running anim
        'isElRunning': function (node) {
            var allRunning = DOM.data(node, runningKey);
            return allRunning && !S.isEmptyObject(allRunning);
        },
        pauseOrResumeQueue: pauseOrResumeQueue,
        stopEl: function (node, end, clearQueue, queue) {
            if (clearQueue) {
                if (queue === undefined) {
                    Q.clearQueues(node);
                } else if (queue !== false) {
                    Q.clearQueue(node, queue);
                }
            }
            var allRunning = DOM.data(node, runningKey),
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