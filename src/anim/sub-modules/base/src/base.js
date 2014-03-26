/**
 * base class for transition anim and timer anim
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var Dom = require('dom'),
        UA = require('ua'),
        Utils = require('./base/utils'),
        Q = require('./base/queue'),
        Promise = require('promise'),
        NodeType = Dom.NodeType,
        camelCase = S.camelCase,
        noop = S.noop,
        specialVals = {
            toggle: 1,
            hide: 1,
            show: 1
        };

    var defaultConfig = {
        duration: 1,
        easing: 'linear'
    };

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

    /**
     * @class KISSY.Anim
     * A class for constructing animation instances.
     *
     *      @example
     *      KISSY.use('dom,anim',function(S,Dom,Anim){
     *          var d=Dom.create('<div style="width:50px;height:50px;border:1px solid red;">running</div>');
     *          document.body.appendChild(d);
     *          new Anim({
     *              node: d,
     *              to: {width:100,height:100}
     *          }).run().then(function(){
     *              d.innerHTML='completed';
     *          });
     *      });
     *
     * @extend KISSY.Promise
     * @cfg {HTMLElement|Window} node html dom node or window
     * (window can only animate scrollTop/scrollLeft)
     * @cfg {Object} to end css style value.
     * @cfg {Number} [duration=1] duration(second) or anim config
     * @cfg {String|Function} [easing='easeNone'] easing fn or string
     * @cfg {Function} [complete] callback function when this animation is complete
     * @cfg {String|Boolean} [queue] current animation's queue, if false then no queue
     */
    function AnimBase(node, to, duration, easing, complete) {
        var self = this;
        var config;

        if (node.node) {
            config = node;
        } else {
            // the transition properties
            if (typeof to === 'string') {
                to = S.unparam(String(to), ';', ':');
                S.each(to, function (value, prop) {
                    var trimProp = S.trim(prop);
                    if (trimProp) {
                        to[trimProp] = S.trim(value);
                    }
                    if (!trimProp || trimProp !== prop) {
                        delete to[prop];
                    }
                });
            }
            // animation config
            if (S.isPlainObject(duration)) {
                config = S.clone(duration);
            } else {
                config = {
                    complete: complete
                };
                if (duration) {
                    config.duration = duration;
                }
                if (easing) {
                    config.easing = easing;
                }
            }
            config.node = node;
            config.to = to;
        }

        config = S.merge(defaultConfig, config);

        // Promise.call(self);
        AnimBase.superclass.constructor.call(self);
        Promise.Defer(self);

        /**
         * config object of current anim instance
         * @type {Object}
         */
        self.config = config;

        node = config.node;

        if (!S.isPlainObject(node)) {
            node = Dom.get(config.node);
        }
        self.node = self.el = node;
        self._backupProps = {};
        self._propsData = {};

        // camel case uniformity
        var newTo = {};
        to = config.to;
        for (var prop in to) {
            newTo[camelCase(prop)] = to[prop];
        }
        config.to = newTo;
    }

    S.extend(AnimBase, Promise, {
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
                        if (UA.ieMode < 10) {
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
        beforeResume: noop,

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

    var Statics = AnimBase.Statics = {
        isRunning: Utils.isElRunning,
        isPaused: Utils.isElPaused,
        stop: Utils.stopEl,
        Q: Q
    };

    S.each(['pause', 'resume'], function (action) {
        Statics[action] = function (node, queue) {
            if (
            // default queue
                queue === null ||
                    // name of specified queue
                    typeof queue === 'string' ||
                    // anims not belong to any queue
                    queue === false
                ) {
                return Utils.pauseOrResumeQueue(node, queue, action);
            }
            return Utils.pauseOrResumeQueue(node, undefined, action);
        };
    });

    return AnimBase;
});

/*
 yiminghe@gmail.com 2014-03-13
 - anim alias to transition in css3 anim enabled browser
 */