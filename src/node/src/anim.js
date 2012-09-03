/**
 * @ignore
 * @fileOverview anim-node-plugin
 * @author yiminghe@gmail.com,
 *         lifesinger@gmail.com,
 *         qiaohua@taobao.com,
 *
 */
KISSY.add('node/anim', function (S, DOM, Anim, Node, undefined) {

    var FX = [
        // height animations
        [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ],
        // width animations
        [ 'width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight' ],
        // opacity animations
        [ 'opacity' ]
    ];

    function getFxs(type, num, from) {
        var ret = [],
            obj = {};
        for (var i = from || 0; i < num; i++) {
            ret.push.apply(ret, FX[i]);
        }
        for (i = 0; i < ret.length; i++) {
            obj[ret[i]] = type;
        }
        return obj;
    }

    S.augment(Node,
        /**
         * @class
         * @singleton
         * @override KISSY.NodeList
         */
        {
            /**
             * animate for current node list.
             * @param var_args see {@link KISSY.Anim}
             * @return {KISSY.NodeList} this
             */
            animate: function (var_args) {
                var self = this,
                    originArgs = S.makeArray(arguments);
                S.each(self, function (elem) {
                    var args = S.clone(originArgs),
                        arg0 = args[0];
                    if (arg0.props) {
                        arg0.el = elem;
                        Anim(arg0);
                    } else {
                        Anim.apply(undefined, [elem].concat(args)).run();
                    }
                });
                return self;
            },
            /**
             * stop anim of current node list.
             * @param {Boolean} [end] see {@link KISSY.Anim#static-method-stop}
             * @param [clearQueue]
             * @param [queue]
             * @return {KISSY.NodeList} this
             */
            stop: function (end, clearQueue, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.stop(elem, end, clearQueue, queue);
                });
                return self;
            },
            /**
             * pause anim of current node list.
             * @param {Boolean} end see {@link KISSY.Anim#static-method-pause}
             * @param queue
             * @return {KISSY.NodeList} this
             */
            pause: function (end, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.pause(elem, queue);
                });
                return self;
            },
            /**
             * resume anim of current node list.
             * @param {Boolean} end see {@link KISSY.Anim#static-method-resume}
             * @param queue
             * @return {KISSY.NodeList} this
             */
            resume: function (end, queue) {
                var self = this;
                S.each(self, function (elem) {
                    Anim.resume(elem, queue);
                });
                return self;
            },
            /**
             * whether one of current node list is animating.
             * @return {Boolean}
             */
            isRunning: function () {
                var self = this;
                for (var i = 0; i < self.length; i++) {
                    if (Anim.isRunning(self[i])) {
                        return true;
                    }
                }
                return false;
            },
            /**
             * whether one of current node list 's animation is paused.
             * @return {Boolean}
             */
            isPaused: function () {
                var self = this;
                for (var i = 0; i < self.length; i++) {
                    if (Anim.isPaused(self[i])) {
                        return 1;
                    }
                }
                return 0;
            }
        });

    /**
     * animate show effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method show
     */

    /**
     * animate hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method hide
     */

    /**
     * toggle show and hide effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method toggle
     */

    /**
     * animate fadeIn effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method fadeIn
     */

    /**
     * animate fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method fadeOut
     */

    /**
     * toggle fadeIn and fadeOut effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method fadeToggle
     */

    /**
     * animate slideUp effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method slideUp
     */

    /**
     * animate slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method slideDown
     */

    /**
     * toggle slideUp and slideDown effect for current node list.
     * @param {Number} duration duration of effect
     * @param {Function} [complete] callback function on anim complete.
     * @param {String|Function} [easing] easing type or custom function.
     * @return {KISSY.NodeList} this
     * @member KISSY.NodeList
     * @method slideToggle
     */

    S.each({
            show: getFxs('show', 3),
            hide: getFxs('hide', 3),
            toggle: getFxs('toggle', 3),
            fadeIn: getFxs('show', 3, 2),
            fadeOut: getFxs('hide', 3, 2),
            fadeToggle: getFxs('toggle', 3, 2),
            slideDown: getFxs('show', 1),
            slideUp: getFxs('hide', 1),
            slideToggle: getFxs('toggle', 1)
        },
        function (v, k) {
            Node.prototype[k] = function (duration, complete, easing) {
                var self = this;
                // 没有参数时，调用 DOM 中的对应方法
                if (DOM[k] && !duration) {
                    DOM[k](self);
                } else {
                    S.each(self, function (elem) {
                        Anim(elem, v, duration, easing || 'easeOut', complete).run();
                    });
                }
                return self;
            };
        });

}, {
    requires: ['dom', 'anim', './base']
});
/*
 2011-11-10
 - 重写，逻辑放到 Anim 模块，这边只进行转发

 2011-05-17
 - 承玉：添加 stop ，随时停止动画

 TODO
 - anim needs queue mechanism ?
 */
