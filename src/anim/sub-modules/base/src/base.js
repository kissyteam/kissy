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
        self.el = DOM.get(config.el);
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
            DOM.css(self.el, _backupProps);
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
                el = self.el,
                val,
                _backupProps = self._backupProps,
                _propsData = self._propsData,
                props = config.props,
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
            S.each(props, function (val, prop) {
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

            if (el.nodeType == NodeType.ELEMENT_NODE) {

                // 放在前面，设置 overflow hidden，否则后面 ie6  取 width/height 初值导致错误
                // <div style='width:0'><div style='width:100px'></div></div>
                if (props.width || props.height) {
                    // Make sure that nothing sneaks out
                    // Record all 3 overflow attributes because IE does not
                    // change the overflow attribute when overflowX and
                    // overflowY are set to the same value
                    var elStyle = el.style;
                    S.mix(_backupProps, {
                        overflow: elStyle.overflow,
                        'overflow-x': elStyle.overflowX,
                        'overflow-y': elStyle.overflowY
                    });
                    elStyle.overflow = 'hidden';
                    // inline element should has layout/inline-block
                    if (DOM.css(el, 'display') === 'inline' &&
                        DOM.css(el, 'float') === 'none') {
                        if (S.UA['ie']) {
                            elStyle.zoom = 1;
                        } else {
                            elStyle.display = 'inline-block';
                        }
                    }
                }

                var exit, hidden;
                hidden = (DOM.css(el, 'display') === 'none');
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
                        _backupProps[prop] = DOM.style(el, prop);
                        if (val == 'toggle') {
                            val = hidden ? 'show' : 'hide';
                        }
                        else if (val == 'hide') {
                            _propData.value = 0;
                            // 执行完后隐藏
                            _backupProps.display = 'none';
                        } else {
                            _propData.value = DOM.css(el, prop);
                            // prevent flash of content
                            DOM.css(el, prop, 0);
                            DOM.show(el);
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
                q = Q.queue(self.el, queue, self);
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
                el = self.el,
                q,
                queue = self.config.queue;

            if (!self.isRunning() && !self.isPaused()) {
                if (queue !== false) {
                    // queued but not start to run
                    Q.remove(el, queue, self);
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
                q = Q.dequeue(el, queue);
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