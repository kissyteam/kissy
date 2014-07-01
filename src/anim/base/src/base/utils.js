/**
 * utils for anim
 * @author yiminghe@gmail.com
 * @ignore
 */
var Q = require('./queue'),
    util = require('util'),
    Dom = require('dom');
var runningKey = util.guid('ks-anim-unqueued-' + util.now() + '-');

function saveRunningAnim(anim) {
    var node = anim.node,
        allRunning = Dom.data(node, runningKey);
    if (!allRunning) {
        Dom.data(node, runningKey, allRunning = {});
    }
    allRunning[util.stamp(anim)] = anim;
}

function removeRunningAnim(anim) {
    var node = anim.node,
        allRunning = Dom.data(node, runningKey);
    if (allRunning) {
        delete allRunning[util.stamp(anim)];
        if (util.isEmptyObject(allRunning)) {
            Dom.removeData(node, runningKey);
        }
    }
}

function isAnimRunning(anim) {
    var node = anim.node,
        allRunning = Dom.data(node, runningKey);
    if (allRunning) {
        return !!allRunning[util.stamp(anim)];
    }
    return 0;
}

var pausedKey = util.guid('ks-anim-paused-' + util.now() + '-');

function savePausedAnim(anim) {
    var node = anim.node,
        paused = Dom.data(node, pausedKey);
    if (!paused) {
        Dom.data(node, pausedKey, paused = {});
    }
    paused[util.stamp(anim)] = anim;
}

function removePausedAnim(anim) {
    var node = anim.node,
        paused = Dom.data(node, pausedKey);
    if (paused) {
        delete paused[util.stamp(anim)];
        if (util.isEmptyObject(paused)) {
            Dom.removeData(node, pausedKey);
        }
    }
}

function isAnimPaused(anim) {
    var node = anim.node,
        paused = Dom.data(node, pausedKey);
    if (paused) {
        return !!paused[util.stamp(anim)];
    }
    return 0;
}

function pauseOrResumeQueue(node, queue, action) {
    var allAnims = Dom.data(node, action === 'resume' ? pausedKey : runningKey),
    // can not stop in for/in , stop will modified allRunning too
        anims = util.merge(allAnims);

    util.each(anims, function (anim) {
        if (queue === undefined ||
            anim.config.queue === queue) {
            anim[action]();
        }
    });
}

module.exports = {
    saveRunningAnim: saveRunningAnim,
    removeRunningAnim: removeRunningAnim,
    isAnimPaused: isAnimPaused,
    removePausedAnim: removePausedAnim,
    savePausedAnim: savePausedAnim,
    isAnimRunning: isAnimRunning,
    // whether node has paused anim
    isElPaused: function (node) {
        var paused = Dom.data(node, pausedKey);
        return paused && !util.isEmptyObject(paused);
    },
    // whether node is running anim
    isElRunning: function (node) {
        var allRunning = Dom.data(node, runningKey);
        return allRunning && !util.isEmptyObject(allRunning);
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
        var allRunning = Dom.data(node, runningKey),
        // can not stop in for/in , stop will modified allRunning too
            anims = util.merge(allRunning);
        util.each(anims, function (anim) {
            if (queue === undefined || anim.config.queue === queue) {
                anim.stop(end);
            }
        });
    }
};