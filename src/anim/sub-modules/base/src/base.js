/**
 * base class for transition anim and timer anim
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var Dom = require('dom'),
        Utils = require('./base/utils'),
        Q = require('./base/queue'),
        Promise = require('promise');
    var logger = S.getLogger('s/anim');
    var NodeType = Dom.NodeType,
        noop = S.noop,

        specialVals = {
            toggle: 1,
            hide: 1,
            show: 1
        };

    /**
     * superclass for transition anim and js anim
     * @class KISSY.Anim.Base
     * @extend KISSY.Promise
     * @private
     */
    function AnimBase(config) {
        var self = this;
        AnimBase.superclass.constructor.call(self);
        Promise.Defer(self);
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
    }

    // stop(true) will run complete function synchronously
    function syncComplete(self) {
        var _backupProps, complete = self.config.complete;
        // only recover after complete anim
        if (!S.isEmptyObject(_backupProps = self._backupProps)) {
            Dom.css(self.node, _backupProps);
        }
        if (complete) {
            complete.call(self);
        }
    }

    S.extend(AnimBase, Promise, {
        /**
         * please use promise api instead
         * @deprecated
         */
        on: function (name, fn) {
            var self = this;
            logger.warn('please use promise api of anim instead');
            if (name === 'complete') {
                self.then(fn);
            } else if (name === 'end') {
                self.fin(fn);
            } else if (name === 'step') {
                self.progress(fn);
            } else {
                logger.error('not supported event for anim: ' + name);
            }
            return self;
        },

        /**
         * prepare fx hook
         * @protected
         * @method
         */
        prepareFx: noop,

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

            if (node.nodeType === NodeType.ELEMENT_NODE) {
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
                        if (S.UA.ieMode < 10) {
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
                        if (val === 'hide' && hidden || val === 'show' && !hidden) {
                            // need to invoke complete
                            self.stop(true);
                            exit = false;
                            return exit;
                        }
                        // backup original inline css value
                        _backupProps[prop] = Dom.style(node, prop);
                        if (val === 'toggle') {
                            val = hidden ? 'show' : 'hide';
                        }
                        if (val === 'hide') {
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
            if (S.isEmptyObject(_propsData)) {
                self.__totalTime = defaultDuration * 1000;
                self.__waitTimeout = setTimeout(function () {
                    self.stop(true);
                }, self.__totalTime);
            } else {
                self.prepareFx();
                self.doStart();
            }
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
                self.__totalTime -= self._runTime;
                Utils.removeRunningAnim(self);
                Utils.savePausedAnim(self);
                if (self.__waitTimeout) {
                    clearTimeout(self.__waitTimeout);
                } else {
                    self.doStop();
                }
            }
            return self;
        },

        /**
         * stop by dom operation
         * @protected
         * @method
         */
        doStop: noop,

        /**
         * start by dom operation
         * @protected
         * @method
         */
        doStart: noop,

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
                if (self.__waitTimeout) {
                    self.__waitTimeout = setTimeout(function () {
                        self.stop(true);
                    }, self.__totalTime);
                } else {
                    self.beforeResume();
                    self.doStart();
                }
            }
            return self;
        },

        /**
         * before resume hook
         * @protected
         * @method
         */
        'beforeResume': noop,

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
                if (q.length === 1) {
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

            if (self.isResolved() || self.isRejected()) {
                return self;
            }

            if (self.__waitTimeout) {
                clearTimeout(self.__waitTimeout);
                self.__waitTimeout = 0;
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

            var defer = self.defer;
            if (finish) {
                syncComplete(self);
                defer.resolve([self]);
            } else {
                defer.reject([self]);
            }

            if (queue !== false) {
                // notify next anim to run in the same queue
                q = Q.dequeue(node, queue);
                if (q && q[0]) {
                    q[0].runInternal();
                }
            }
            return self;
        }
    });

    AnimBase.Utils = Utils;
    AnimBase.Q = Q;

    return AnimBase;
});