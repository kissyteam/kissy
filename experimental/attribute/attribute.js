/**
 * @module  Attribute for Kissy
 * @author  yiminghe@gmail.com(承玉)
 */
KISSY.add('attribute-base', function (S, undefined) {
    var EventTarget = S.EventTarget,
        BEFORE = "before",
        CHANGE = "Change",
        AFTER = "after";

    function capitalFirst(s) {
        var f = s.charAt(0);
        return f.toUpperCase() + s.substring(1);
    }

    /**
     * Attribute provides the implementation for any object to deal with its attribute in aop ways
     */

    function Attribute() {
        var self = this;
        /**
         *attribute meta information
         *@description
         {
         attr:{
         getter:function,
         setter:function,
         //default value
         value:v,
         valueFn:function
         }
         }
         */
        self._state = {};
        /**
         *attribute value
         *@description
         {
         attr:v
         }
         */
        self._values = {};
    }

    S.augment(Attribute, {
        /**
         * deep copy contructor's attribute config to instance for read write efficiency
         * @param attr attribute name
         * @param attrConfig ontructor's attribute config
         */
        addAttribute: function (attr, attrConfig) {
            this._state[attr] = S.clone(attrConfig);
        },
        /**
         *set object's attribute
         *@param attr{String} attribute name
         *@param value attribute's value
         */
        set: function (attr, value) {
            var self = this,
                //get previous value
                preVal = self.get(attr);

            //no change ,just return
            if (preVal === value) return;

            //if allow set
            if (self.fire(BEFORE + capitalFirst(attr) + CHANGE, {
                preVal: preVal,
                newVal: value
            }) === false) return;

            //finally set
            self._set.apply(self, arguments);
            //notify set
            self.fire(AFTER + capitalFirst(attr) + CHANGE, {
                preVal: preVal,
                newVal: self._values[attr]
            });
        },
        //internal use,no event involved,just set
        _set: function (attr, value) {
            var self = this,
                attrConfig = self._state[attr],
                setValue = undefined,
                setter = attrConfig && attrConfig.setter;
            //if setter has effect
            if (setter) setValue = setter.apply(self, [value]);
            if (setValue !== undefined) value = setValue;
            //finally set
            self._values[attr] = value;
        },
        //get default value for specified attribute
        _getDefaultValue:function(attr) {
            var self = this,
                attrConfig = self._state[attr];
            if (!attrConfig)    return;
            if (attrConfig.valueFn) {
                attrConfig.value = attrConfig.valueFn.call(self);
                delete attrConfig.valueFn;
            }
            return attrConfig.value;
        },
        /**
         *get object's attribute value
         *@param attr{String} attribute's name
         *@return object's attribute value
         */
        get: function (attr) {
            var self = this;
            var attrConfig = self._state[attr],
                getter = attrConfig && attrConfig.getter,
                //get user-set value or default value
                ret = attr in self._values ?
                    self._values[attr] :
                    self._getDefaultValue(attr);
            //invoke getter for this attribute     
            if (getter) ret = getter.call(self, ret);
            return ret;
        },
        /**
         *reset attribute's value with default value in meta info
         *@param attr{String} attribute's name
         */
        reset: function (attr) {
            var self = this;
            if (attr !== undefined) {
                //if attribute does not have default value,then set undefined
                self.set(attr, self._getDefaultValue(attr));
                return;
            }
            for (var attr in self._state) {
                if (self._state.hasOwnProperty(attr)) {
                    self.reset(attr);
                }
            }
        }
    });
    /*
     *Base for class-based component
     */

    function Base(cfg) {
        var self = this;
        Attribute.call(self);
        self._initAttr();
        self._initial(cfg);
    }

    S.augment(Base, EventTarget, Attribute, {
        constructor:Base,
        //init attr using constructor chain's attr meta info
        //note:prevent conflict attribute name in constructor chain
        _initAttr: function () {
            var self = this,c = self.constructor;
            while (c) {
                if (c.ATTRS) {
                    for (var attr in c.ATTRS) {
                        if (c.ATTRS.hasOwnProperty(attr)) self.addAttribute(attr, c.ATTRS[attr]);
                    }
                }
                c = c.superclass ? c.superclass.constructor : null;
            }
        },
        //initial attribute's value
        _initial: function (cfg) {
            for (var attr in cfg) {
                if (cfg.hasOwnProperty(attr)) this._set(attr, cfg[attr]);
            }
        }
    });
    S.Base = Base;
});
/**
 * NOTES:
 *
 *  2010.06
 *
 *     - 简化的yui3 attribute模拟  ，属性可设置：
 *                    value:默认值
 *                    valueFn:默认值为函数调用结果
 *                    setter:set调用，返回false阻止，返回undefined设置用户值，否则设置返回值
 *                    gettter:get调用
 */