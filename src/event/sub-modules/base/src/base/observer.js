/**
 * @ignore
 * observer for event.
 * @author yiminghe@gmail.com
 */
var undef;
var util = require('util');
/**
 * KISSY 's base observer for handle user-specified function
 * @private
 * @class KISSY.Event.Observer
 * @param {Object} cfg
 */
function Observer(cfg) {
    this.config = cfg || {};

    /**
     * context in which observer's fn runs
     * @cfg {Object} context
     */
    /**
     * current observer's user-defined function
     * @cfg {Function} fn
     */
    /**
     * whether un-observer current observer once after running observer's user-defined function
     * @cfg {Boolean} once
     */
    /**
     * groups separated by '.' which current observer belongs
     * @cfg {String} groups
     */
}

Observer.prototype = {
    constructor: Observer,

    /**
     * whether current observer equals s2
     * @param {KISSY.Event.Observer} s2 another observer
     * @return {Boolean}
     */
    equals: function (s2) {
        var self = this;
        return !!util.reduce(self.keys, function (v, k) {
            return v && (self.config[k] === s2.config[k]);
        }, 1);
    },

    /**
     * simple run current observer's user-defined function
     * @param {KISSY.Event.Object} event
     * @param {KISSY.Event.Observable} ce
     * @return {*} return value of current observer's user-defined function
     */
    simpleNotify: function (event, ce) {
        var ret,
            self = this,
            config = self.config;
        ret = config.fn.call(config.context || ce.currentTarget, event, config.data);
        if (config.once) {
            //noinspection JSUnresolvedFunction
            ce.removeObserver(self);
        }
        return ret;
    },

    /**
     * current observer's notification.
     * @protected
     * @param {KISSY.Event.Object} event
     * @param {KISSY.Event.Observable} ce
     */
    notifyInternal: function (event, ce) {
        var ret = this.simpleNotify(event, ce);
        // return false 等价 preventDefault + stopPropagation
        if (ret === false) {
            event.halt();
        }
        return ret;
    },

    /**
     * run current observer's user-defined function
     * @param event
     * @param ce
     */
    notify: function (event, ce) {
        var self = this,
            config = self.config,
            _ksGroups = event._ksGroups;

        // handler's group does not match specified groups (at fire step)
        if (_ksGroups && (!config.groups || !(config.groups.match(_ksGroups)))) {
            return undef;
        }

        return self.notifyInternal(event, ce);
    }
};

module.exports = Observer;