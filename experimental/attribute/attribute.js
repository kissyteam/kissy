/**
 * @module  Attribute for Kissy
 * @author  yiminghe@gmail.com(承玉)
 */
KISSY.add('attribute-base', function (S, undefined) {
    var EventTarget = S.EventTarget,
        BEFORE = "before",
        CHANGE = "change",
        AFTER = "after";
    /**
     * Attribute provides the implementation for any object to deal with its attribute in aop ways
     */

    function Attribute() {
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
        this._state = {};
        /**
         *attribute value
         *@description
         {
         attr:v
         }
         */
        this._values = {};
    }
    S.augment(Attribute, {
        constructor: Attribute,
        addAttribute: function (attr, attrConfig) {
            this._state[attr] = attrConfig;
        },
        /**
         *set object's attribute
         *@param attr{String} attribute name
         *@param value attribute's value
         */
        set: function (attr, value) {
            //if allow set
            if (this.fire(BEFORE + attr + CHANGE, {
                value: value
            }) === false) return;
            //get previous value
            var preVal = this.get(attr);
            //finally set
            this._set.apply(this, arguments);
            //notify set
            this.fire(AFTER + attr + CHANGE, {
                preVal: preVal,
                newVal: this._values[attr]
            });
        },
        //internal use,no event involved,just set
        _set: function (attr, value) {
            var attrConfig = this._state[attr],
                setValue = undefined,
                setter = attrConfig && attrConfig.setter;
            //if setter has effect
            if (setter) setValue = setter.apply(this, [value]);
            if (setValue !== undefined) value = setValue;
            //finally set
            this._values[attr] = value;
        },
        /**
         *get object's attribute value
         *@param attr{String} attribute's name
         *@return object's attribute value
         */
        get: function (attr) {
            var attrConfig = this._state[attr],
                getter = attrConfig && attrConfig.getter,
            //get user-set value or default value
            ret = attr in this._values ? this._values[attr] : (attrConfig ? attrConfig.value : undefined);
            //invoke getter for this attribute     
            if (getter) ret = getter.call(this, ret);
            return ret;
        },
        /**
         *reset attribute's value with default value in meta info
         *@param attr{String} attribute's name
         */
        reset: function (attr) {
            if (attr !== undefined) {
                //if attribute does not have default value,then set undefined
                this.set(attr, this._state[attr].value);
                return;
            }
            for (var attr in this._state) {
                if (this._state.hasOwnProperty(attr)) {
                    this.reset(attr);
                }
            }
        }
    });
    /*
    *Base for class-based component
    */

    function Base(cfg) {
        Attribute.call(this);
        this._initAttr();
        this._initial(cfg);
    }
    S.augment(Base, EventTarget);
    S.augment(Base, Attribute);
    S.augment(Base, {
        //init attr using constructor chain's attr meta info
        _initAttr: function () {
            var c = this.constructor;
            while (c) {
                if (c.ATTRS) {
                    for (var attr in c.ATTRS) {
                        if (c.ATTRS.hasOwnProperty(attr)) this.addAttribute(attr, c.ATTRS[attr]);
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
 *					value:默认值
 *					valueFn:默认值为函数调用结果	
 *					setter:set调用，返回false阻止，返回undefined设置用户值，否则设置返回值
 *					gettter:get调用            
 */