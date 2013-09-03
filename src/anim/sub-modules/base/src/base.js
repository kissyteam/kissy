/**
 * base class for transition anim and timer anim
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/base', function (S, Dom, Utils, CustomEvent, Q) {
    var NodeType = Dom.NodeType,
        specialVals = {
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
        var node = config.node;
        if (!S.isPlainObject(node)) {
            node = Dom.get(config.node);
        }
        self.node = self.el = node;
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
            Dom.css(self.node, _backupProps);
        }
    }

    S.augment(AnimBase, CustomEvent.Target, {
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
                    if (Dom.css(node, 'display') === 'inline' &&
                        Dom.css(node, 'float') === 'none') {
                        if (S.UA['ie']) {
                            elStyle.zoom = 1;
                        } else {
                            elStyle.display = 'inline-block';
                        }
                    }
                }

                var exit, hidden;
                hidden = (Dom.css(node, 'display') === 'none');
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
                        _backupProps[prop] = Dom.style(node, prop);
                        if (val == 'toggle') {
                            val = hidden ? 'show' : 'hide';
                        }
                        else if (val == 'hide') {
                            _propData.value = 0;
                            // 执行完后隐藏
                            _backupProps.display = 'none';
                        } else {
                            _propData.value = Dom.css(node, prop);
                            // prevent flash of content
                            Dom.css(node, prop, 0);
                            Dom.show(node);
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

            if (self.__stopped) {
                return self;
            }

            if (!self.isRunning() && !self.isPaused()) {
                if (queue !== false) {
                    // queued but not start to run
                    Q.remove(node, queue, self);
                }
                return self;
            }

            self.doStop(finish);
            Utils.removeRunningAnim(self);
            Utils.removePausedAnim(self);
            self.__stopped = 1;

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