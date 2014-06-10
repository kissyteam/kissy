/**
 * @ignore
 * anim-node-plugin
 * @author yiminghe@gmail.com,
 *         lifesinger@gmail.com,
 *         qiaohua@taobao.com,
 */

/*global Node:true*/
var Node = require('./base');
var Dom = require('dom');
var Anim = require('anim');
var util = require('util');

var FX = [
    // height animations
    ['height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom'],
    // width animations
    ['width', 'margin-left', 'margin-right', 'padding-left', 'padding-right'],
    // opacity animations
    ['opacity']
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

util.augment(Node, {
    /**
     * animate for current node list.
     * @chainable
     * @member KISSY.Node
     */
    animate: function () {
        var self = this,
            l = self.length,
            needClone = self.length > 1,
            originArgs = util.makeArray(arguments);
        var cfg = originArgs[0];
        var AnimConstructor = Anim;
        if (cfg.to) {
            AnimConstructor = cfg.Anim || Anim;
        } else {
            cfg = originArgs[1];
            if (cfg) {
                AnimConstructor = cfg.Anim || Anim;
            }
        }

        for (var i = 0; i < l; i++) {
            var elem = self[i];
            var args = needClone ? util.clone(originArgs) : originArgs,
                arg0 = args[0];
            if (arg0.to) {
                arg0.node = elem;
                new AnimConstructor(arg0).run();
            } else {
                AnimConstructor.apply(undefined, [elem].concat(args)).run();
            }
        }
        return self;
    },
    /**
     * stop anim of current node list.
     * @param {Boolean} [end] see {@link KISSY.Anim#static-method-stop}
     * @param [clearQueue]
     * @param [queue]
     * @chainable
     * @member KISSY.Node
     */
    stop: function (end, clearQueue, queue) {
        var self = this;
        util.each(self, function (elem) {
            Anim.stop(elem, end, clearQueue, queue);
        });
        return self;
    },
    /**
     * pause anim of current node list.
     * @param {Boolean} end see {@link KISSY.Anim#static-method-pause}
     * @param queue
     * @chainable
     * @member KISSY.Node
     */
    pause: function (end, queue) {
        var self = this;
        util.each(self, function (elem) {
            Anim.pause(elem, queue);
        });
        return self;
    },
    /**
     * resume anim of current node list.
     * @param {Boolean} end see {@link KISSY.Anim#static-method-resume}
     * @param queue
     * @chainable
     * @member KISSY.Node
     */
    resume: function (end, queue) {
        var self = this;
        util.each(self, function (elem) {
            Anim.resume(elem, queue);
        });
        return self;
    },
    /**
     * whether one of current node list is animating.
     * @return {Boolean}
     * @member KISSY.Node
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
     * @member KISSY.Node
     */
    isPaused: function () {
        var self = this;
        for (var i = 0; i < self.length; i++) {
            if (Anim.isPaused(self[i])) {
                return true;
            }
        }
        return false;
    }
});

/**
 * animate show effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method show
 */

/**
 * animate hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method hide
 */

/**
 * toggle show and hide effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method toggle
 */

/**
 * animate fadeIn effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeIn
 */

/**
 * animate fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeOut
 */

/**
 * toggle fadeIn and fadeOut effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method fadeToggle
 */

/**
 * animate slideUp effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideUp
 */

/**
 * animate slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideDown
 */

/**
 * toggle slideUp and slideDown effect for current node list.
 * @param {Number} duration duration of effect
 * @param {Function} [complete] callback function on anim complete.
 * @param {String|Function} [easing] easing type or custom function.
 * @chainable
 * @member KISSY.Node
 * @method slideToggle
 */

util.each({
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
            // 没有参数时，调用 Dom 中的对应方法
            if (Dom[k] && !duration) {
                Dom[k](self);
            } else {
                var AnimConstructor = Anim;
                if (typeof duration === 'object') {
                    AnimConstructor = duration.Anim || Anim;
                }
                util.each(self, function (elem) {
                    new AnimConstructor(elem, v, duration, easing, complete).run();
                });
            }
            return self;
        };
    });
/*
 2011-11-10
 - 重写，逻辑放到 Anim 模块，这边只进行转发

 2011-05-17
 - yiminghe@gmail.com：添加 stop ，随时停止动画
 */
