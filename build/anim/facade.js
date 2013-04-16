/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:13
*/
/**
 * anim facade between native and timer
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('anim/facade', function (S, DOM, AnimBase, TimerAnim, TransitionAnim) {

    var Utils = AnimBase.Utils,
        defaultConfig = {
            duration: 1,
            easing: 'linear'
        };

    /**
     * @class KISSY.Anim
     * A class for constructing animation instances.
     * @mixins KISSY.Event.Target
     * @cfg {HTMLElement|window} el html dom node or window
     * (window can only animate scrollTop/scrollLeft)
     * @cfg {Object} props end css style value.
     * @cfg {Number} [duration=1] duration(second) or anim config
     * @cfg {String|Function} [easing='easeNone'] easing fn or string
     * @cfg {Function} [complete] callback function when this animation is complete
     * @cfg {String|Boolean} [queue] current animation's queue, if false then no queue
     */
    function Anim(el, props, duration, easing, complete) {
        var config;
        if (el.el) {
            config = el;
        } else {
            // the transition properties
            if (typeof props == 'string') {
                props = S.unparam(String(props), ';', ':');
                S.each(props, function (value, prop) {
                    var trimProp = S.trim(prop);
                    if (trimProp) {
                        props[trimProp] = S.trim(value);
                    }
                    if (!trimProp || trimProp != prop) {
                        delete props[prop];
                    }
                });
            } else {
                // clone to prevent collision within multiple instance
                props = S.clone(props);
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
            config.el = el;
            config.props = props;
        }
        config = S.merge(defaultConfig, config, {
            // default anim mode for whole kissy application
            useTransition: S.config('anim/useTransition')
        });
        if (config['useTransition'] && TransitionAnim) {
            // S.log('use transition anim');
            return new TransitionAnim(config);
        } else {
            // S.log('use js timer anim');
            return new TimerAnim(config);
        }
    }


    /**
     * pause all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queue current queue's name to be cleared
     * @method pause
     * @member KISSY.Anim
     * @static
     */

    /**
     * resume all the anims currently running
     * @param {HTMLElement} el element which anim belongs to
     * @param {String|Boolean} queue current queue's name to be cleared
     * @method resume
     * @member KISSY.Anim
     * @static
     */


    /**
     * stop this animation
     * @param {Boolean} [finish] whether jump to the last position of this animation
     * @chainable
     * @method stop
     * @member KISSY.Anim
     */

    /**
     * start this animation
     * @chainable
     * @method run
     * @member KISSY.Anim
     */

    /**
     * resume current anim
     * @chainable
     * @method resume
     * @member KISSY.Anim
     */

    /**
     * pause current anim
     * @chainable
     * @method pause
     * @member KISSY.Anim
     */

    /**
     * whether this animation is running
     * @return {Boolean}
     * @method isRunning
     * @member KISSY.Anim
     */


    /**
     * whether this animation is paused
     * @return {Boolean}
     * @method isPaused
     * @member KISSY.Anim
     */

    S.each(['pause', 'resume'], function (action) {
        Anim[action] = function (el, queue) {
            if (
            // default queue
                queue === null ||
                    // name of specified queue
                    typeof queue == 'string' ||
                    // anims not belong to any queue
                    queue === false
                ) {
                return Utils.pauseOrResumeQueue(el, queue, action);
            }
            return Utils.pauseOrResumeQueue(el, undefined, action);
        };
    });

    /**
     * whether el is running anim
     * @method
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isRunning = Utils.isElRunning;

    /**
     * whether el has paused anim
     * @method
     * @param {HTMLElement} el
     * @return {Boolean}
     * @static
     */
    Anim.isPaused = Utils.isElPaused;

    /**
     * stop all the anims currently running
     * @static
     * @method stop
     * @member KISSY.Anim
     * @param {HTMLElement} el element which anim belongs to
     * @param {Boolean} end whether jump to last position
     * @param {Boolean} clearQueue whether clean current queue
     * @param {String|Boolean} queueName current queue's name to be cleared
     */
    Anim.stop = Utils.stopEl;

    Anim.Easing = TimerAnim.Easing;

    S.Anim = Anim;

    Anim.Q = AnimBase.Q;

    return Anim;

}, {
    requires: ['dom', 'anim/base', 'anim/timer',
        KISSY.Features.isTransitionSupported() ? 'anim/transition' : '']

});
