/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Jun 7 13:41
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 anim/base/queue
 anim/base/utils
 anim/base
*/

/**
 * @ignore queue data structure
 * @author yiminghe@gmail.com
 */
KISSY.add('anim/base/queue', function (S, DOM) {

    var // 队列集合容器
        queueCollectionKey = S.guid('ks-queue-' + S.now() + '-'),
    // 默认队列
        queueKey = S.guid('ks-queue-' + S.now() + '-'),
        Q;

    function getQueue(node, name, readOnly) {
        name = name || queueKey;

        var qu,
            quCollection = DOM.data(node, queueCollectionKey);

        if (!quCollection && !readOnly) {
            DOM.data(node, queueCollectionKey, quCollection = {});
        }

        if (quCollection) {
            qu = quCollection[name];
            if (!qu && !readOnly) {
                qu = quCollection[name] = [];
            }
        }

        return qu;
    }

    return Q = {

        queueCollectionKey: queueCollectionKey,

        queue: function (node, queue, item) {
            var qu = getQueue(node, queue);
            qu.push(item);
            return qu;
        },

        remove: function (node, queue, item) {
            var qu = getQueue(node, queue, 1),
                index;
            if (qu) {
                index = S.indexOf(item, qu);
                if (index > -1) {
                    qu.splice(index, 1);
                }
            }
            if (qu && !qu.length) {
                // remove queue data
                Q.clearQueue(node, queue);
            }
            return qu;
        },

        'clearQueues': function (node) {
            DOM.removeData(node, queueCollectionKey);
        },

        clearQueue: function clearQueue(node, queue) {
            queue = queue || queueKey;
            var quCollection = DOM.data(node, queueCollectionKey);
            if (quCollection) {
                delete quCollection[queue];
            }
            if (S.isEmptyObject(quCollection)) {
                DOM.removeData(node, queueCollectionKey);
            }
        },

        dequeue: function (node, queue) {
            var qu = getQueue(node, queue, 1);
            if (qu) {
                qu.shift();
                if (!qu.length) {
                    // remove queue data
                    Q.clearQueue(node, queue);
                }
            }
            return qu;
        }

    };
}, {
    requires: ['dom']
});
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
/**
 * base class for transition anim and timer anim
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/base', function (S, DOM, Utils, EventCustom, Q) {

    var NodeType = DOM.NodeType;
    var specialVals = {
        toggle: 1,
        hide: 1,
        show: 1
    };

    /**
     * superclass for transition anim and js anim
     * @class KISSY.Anim.Base
     */
    function AnimBase(config) {
        var self = this,
            complete;
        /**
         * config object of current anim instance
         * @type {Object}
         */
        self.config = config;
        self.node = self.el = DOM.get(config.node);
        // 实例属性
        self._backupProps = {};
        self._propsData = {};

        if (complete = config.complete) {
            self.on('complete', complete);
        }
    }

    function onComplete(self) {
        var _backupProps;

        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            DOM.css(self.node, _backupProps);
        }
    }

    S.augment(AnimBase, EventCustom.Target, {
        /**
         * prepare fx hook
         * @protected
         */
        prepareFx: function () {
        },

        runInternal: function () {
            var self = this,
                config = self.config,
                node = self.node,
                val,
                _backupProps = self._backupProps,
                _propsData = self._propsData,
                to = config.to,
                defaultDelay = (config.delay || 0),
                defaultDuration = config.duration;

            // 进入该函数即代表执行（q[0] 已经是 ...）
            Utils.saveRunningAnim(self);

            if (self.fire('beforeStart') === false) {
                // no need to invoke complete
                self.stop(0);
                return;
            }

            // 分离 easing
            S.each(to, function (val, prop) {
                if (!S.isPlainObject(val)) {
                    val = {
                        value: val
                    };
                }
                _propsData[prop] = S.mix({
                    // simulate css3
                    delay: defaultDelay,
                    //// timing-function
                    easing: config.easing,
                    frame: config.frame,
                    duration: defaultDuration
                }, val);
            });

            if (node.nodeType == NodeType.ELEMENT_NODE) {

                // 放在前面，设置 overflow hidden，否则后面 ie6  取 width/height 初值导致错误
                // <div style='width:0'><div style='width:100px'></div></div>
                if (to.width || to.height) {
                    // Make sure that nothing sneaks out
                    // Record all 3 overflow attributes because IE does not
                    // change the overflow attribute when overflowX and
                    // overflowY are set to the same value
                    var elStyle = node.style;
                    S.mix(_backupProps, {
                        overflow: elStyle.overflow,
                        'overflow-x': elStyle.overflowX,
                        'overflow-y': elStyle.overflowY
                    });
                    elStyle.overflow = 'hidden';
                    // inline element should has layout/inline-block
                    if (DOM.css(node, 'display') === 'inline' &&
                        DOM.css(node, 'float') === 'none') {
                        if (S.UA['ie']) {
                            elStyle.zoom = 1;
                        } else {
                            elStyle.display = 'inline-block';
                        }
                    }
                }

                var exit, hidden;
                hidden = (DOM.css(node, 'display') === 'none');
                S.each(_propsData, function (_propData, prop) {
                    val = _propData.value;
                    // 直接结束
                    if (specialVals[val]) {
                        if (val == 'hide' && hidden || val == 'show' && !hidden) {
                            // need to invoke complete
                            self.stop(1);
                            return exit = false;
                        }
                        // backup original inline css value
                        _backupProps[prop] = DOM.style(node, prop);
                        if (val == 'toggle') {
                            val = hidden ? 'show' : 'hide';
                        }
                        else if (val == 'hide') {
                            _propData.value = 0;
                            // 执行完后隐藏
                            _backupProps.display = 'none';
                        } else {
                            _propData.value = DOM.css(node, prop);
                            // prevent flash of content
                            DOM.css(node, prop, 0);
                            DOM.show(node);
                        }
                    }
                    return undefined;
                });

                if (exit === false) {
                    return;
                }
            }

            self.startTime = S.now();

            self.prepareFx();

            self.doStart();
        },

        /**
         * whether this animation is running
         * @return {Boolean}
         */
        isRunning: function () {
            return Utils.isAnimRunning(this);
        },

        /**
         * whether this animation is paused
         * @return {Boolean}
         */
        isPaused: function () {
            return Utils.isAnimPaused(this);
        },


        /**
         * pause current anim
         * @chainable
         */
        pause: function () {
            var self = this;
            if (self.isRunning()) {
                // already run time
                self._runTime = S.now() - self.startTime;
                Utils.removeRunningAnim(self);
                Utils.savePausedAnim(self);
                self.doStop();
            }
            return self;
        },

        /**
         * stop by dom operation
         * @protected
         */
        doStop: function () {
        },

        /**
         * start by dom operation
         * @protected
         */
        doStart: function () {
        },

        /**
         * resume current anim
         * @chainable
         */
        resume: function () {
            var self = this;
            if (self.isPaused()) {
                // adjust time by run time caused by pause
                self.startTime = S.now() - self._runTime;
                Utils.removePausedAnim(self);
                Utils.saveRunningAnim(self);
                self['beforeResume']();
                self.doStart();
            }
            return self;
        },

        /**
         * before resume hook
         * @protected
         */
        'beforeResume': function () {

        },

        /**
         * start this animation
         * @chainable
         */
        run: function () {
            var self = this,
                q,
                queue = self.config.queue;

            if (queue === false) {
                self.runInternal();
            } else {
                // 当前动画对象加入队列
                q = Q.queue(self.node, queue, self);
                if (q.length == 1) {
                    self.runInternal();
                }
            }

            return self;
        },

        /**
         * stop this animation
         * @param {Boolean} [finish] whether jump to the last position of this animation
         * @chainable
         */
        stop: function (finish) {
            var self = this,
                node = self.node,
                q,
                queue = self.config.queue;

            if (!self.isRunning() && !self.isPaused()) {
                if (queue !== false) {
                    // queued but not start to run
                    Q.remove(node, queue, self);
                }
                return self;
            }

            Utils.removeRunningAnim(self);
            Utils.removePausedAnim(self);
            self.doStop(finish);
            if (finish) {
                onComplete(self);
                self.fire('complete');
            }
            if (queue !== false) {
                // notify next anim to run in the same queue
                q = Q.dequeue(node, queue);
                if (q && q[0]) {
                    q[0].runInternal();
                }
            }
            self.fire('end');
            return self;
        }
    });

    AnimBase.Utils = Utils;
    AnimBase.Q = Q;

    return AnimBase;
}, {
    requires: ['dom', './base/utils', 'event/custom', './base/queue']
});

