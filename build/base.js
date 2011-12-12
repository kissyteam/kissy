/*
Copyright 2011, KISSY UI Library v1.20
MIT Licensed
build time: Nov 28 12:38
*/
/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function(S, undef) {

    // atomic flag
    Attribute.INVALID = {};

    var INVALID = Attribute.INVALID;

    /**
     *
     * @param host
     * @param method
     * @return method if fn or host[method]
     */
    function normalFn(host, method) {
        if (S.isString(method)) {
            return host[method];
        }
        return method;
    }


    /**
     * fire attribute value change
     */
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName) {
        attrName = attrName || name;
        return self.fire(when + capitalFirst(name) + 'Change', {
            attrName: attrName,
            subAttrName:subAttrName,
            prevVal: prevVal,
            newVal: newVal
        });
    }


    /**
     *
     * @param obj
     * @param name
     * @param create
     * @return non-empty property value of obj
     */
    function ensureNonEmpty(obj, name, create) {
        var ret = obj[name] || {};
        if (create) {
            obj[name] = ret;
        }
        return ret;
    }

    /**
     *
     * @param self
     * @return non-empty attr config holder
     */
    function getAttrs(self) {
        /**
         * attribute meta information
         {
         attrName: {
         getter: function,
         setter: function,
         // 注意：只能是普通对象以及系统内置类型，而不能是 new Xx()，否则用 valueFn 替代
         value: v, // default value
         valueFn: function
         }
         }
         */
        return ensureNonEmpty(self, "__attrs", true);
    }

    /**
     *
     * @param self
     * @return non-empty attr value holder
     */
    function getAttrVals(self) {
        /**
         * attribute value
         {
         attrName: attrVal
         }
         */
        return ensureNonEmpty(self, "__attrVals", true);
    }

    /**
     * o, [x,y,z] => o[x][y][z]
     * @param o
     * @param path
     */
    function getValueByPath(o, path) {
        for (var i = 0,len = path.length;
             o != undef && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /**
     * o, [x,y,z], val => o[x][y][z]=val
     * @param o
     * @param path
     * @param val
     */
    function setValueByPath(o, path, val) {
        var rlen = path.length - 1,
            s = o;
        if (rlen >= 0) {
            for (var i = 0; i < rlen; i++) {
                o = o[path[i]];
            }
            if (o != undef) {
                o[path[i]] = val;
            } else {
                s = undef;
            }
        }
        return s;
    }

    function setInternal(self, name, value, opts, attrs) {
        var ret;
        opts = opts || {};
        var dot = ".",
            path,
            subVal,
            prevVal,
            fullName = name;

        if (name.indexOf(dot) !== -1) {
            path = name.split(dot);
            name = path.shift();
        }

        prevVal = self.get(name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        if (!path && prevVal === value) {
            return undefined;
        } else if (path && subVal === value) {
            return undefined;
        }

        if (path) {
            var tmp = S.clone(prevVal);
            setValueByPath(tmp, path, value);
            value = tmp;
        }

        // check before event
        if (!opts['silent']) {
            if (false === __fireAttrChange(self, 'before', name, prevVal, value, fullName)) {
                return false;
            }
        }
        // set it
        ret = self.__set(name, value);

        if (ret === false) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = getAttrVals(self)[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName);
            if (!attrs) {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name]);
            } else {
                attrs.push({
                    prevVal:prevVal,
                    newVal:value,
                    attrName:name,
                    subAttrName:fullName
                });
            }
        }
        return self;
    }

    /**
     * 提供属性管理机制
     * @name Attribute
     * @class
     */
    function Attribute() {
    }

    S.augment(Attribute, {

        /**
         * @return un-cloned attr config collections
         */
        getAttrs: function() {
            return getAttrs(this);
        },

        /**
         * @return un-cloned attr value collections
         */
        getAttrVals:function() {
            var self = this,
                o = {},
                a,
                attrs = getAttrs(self);
            for (a in attrs) {
                o[a] = self.get(a);
            }
            return o;
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * @param {String} name attrName
         * @param {Object} attrConfig The config supports the following properties:
         * {
         *     value: 'the default value', // 最好不要使用自定义类生成的对象，这时使用 valueFn
         *     valueFn: function //
         *     setter: function
         *     getter: function
         * }
         * @param {boolean} override whether override existing attribute config ,default true
         */
        addAttr: function(name, attrConfig, override) {
            var self = this,
                attrs = getAttrs(self),
                cfg = S.clone(attrConfig);
            if (!attrs[name]) {
                attrs[name] = cfg;
            } else {
                S.mix(attrs[name], cfg, override);
            }
            return self;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
         * @param {Object} initialValues user defined initial values
         */
        addAttrs: function(attrConfigs, initialValues) {
            var self = this;
            S.each(attrConfigs, function(attrConfig, name) {
                self.addAttr(name, attrConfig);
            });
            if (initialValues) {
                self.set(initialValues);
            }
            return self;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr: function(name) {
            return name && getAttrs(this).hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr: function(name) {
            var self = this;

            if (self.hasAttr(name)) {
                delete getAttrs(self)[name];
                delete getAttrVals(self)[name];
            }

            return self;
        },

        /**
         * Sets the value of an attribute.
         */
        set: function(name, value, opts) {
            var ret,self = this;
            if (S.isPlainObject(name)) {
                var all = name;
                name = 0;
                ret = true;
                opts = value;
                var attrs = [];
                for (name in all) {
                    ret = setInternal(self, name, all[name], opts, attrs);
                    if (ret === false) {
                        break;
                    }
                }
                var attrNames = [],
                    prevVals = [],
                    newVals = [],
                    subAttrNames = [];
                S.each(attrs, function(attr) {
                    prevVals.push(attr.prevVal);
                    newVals.push(attr.newVal);
                    attrNames.push(attr.attrName);
                    subAttrNames.push(attr.subAttrName);
                });
                if (attrNames.length) {
                    __fireAttrChange(self,
                        '',
                        '*',
                        prevVals,
                        newVals,
                        subAttrNames,
                        attrNames);
                }
                return ret;
            }

            return setInternal(self, name, value, opts);


        },

        /**
         * internal use, no event involved, just set.
         * @protected overriden by mvc/model
         */
        __set: function(name, value) {
            var self = this,
                setValue,
                // if host does not have meta info corresponding to (name,value)
                // then register on demand in order to collect all data meta info
                // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                // 因为属性在声明注册前可以直接设置值
                attrConfig = ensureNonEmpty(getAttrs(self), name, true),
                validator = attrConfig['validator'],
                setter = attrConfig['setter'];

            // validator check
            if (validator = normalFn(self, validator)) {
                if (validator.call(self, value, name) === false) {
                    return false;
                }
            }

            // if setter has effect
            if (setter = normalFn(self, setter)) {
                setValue = setter.call(self, value, name);
            }

            if (setValue === INVALID) {
                return false;
            }

            if (setValue !== undef) {
                value = setValue;
            }

            // finally set
            getAttrVals(self)[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get: function(name) {
            var self = this,
                dot = ".",
                path,
                attrConfig,
                getter, ret;

            if (name.indexOf(dot) !== -1) {
                path = name.split(dot);
                name = path.shift();
            }

            attrConfig = ensureNonEmpty(getAttrs(self), name);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in getAttrVals(self) ?
                getAttrVals(self)[name] :
                self.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter = normalFn(self, getter)) {
                ret = getter.call(self, ret, name);
            }

            if (path) {
                ret = getValueByPath(ret, path);
            }

            return ret;
        },

        /**
         * get default attribute value from valueFn/value
         * @private
         * @param name
         */
        __getDefAttrVal: function(name) {
            var self = this,
                attrConfig = ensureNonEmpty(getAttrs(self), name),
                valFn,
                val;

            if ((valFn = normalFn(self, attrConfig.valueFn))) {
                val = valFn.call(self);
                if (val !== undef) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
                getAttrs(self)[name] = attrConfig;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
         * @param {String} name name of attribute
         */
        reset: function (name, opts) {
            var self = this;

            if (S.isString(name)) {
                if (self.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined.
                    return self.set(name, self.__getDefAttrVal(name), opts);
                }
                else {
                    return self;
                }
            }

            opts = name;

            var attrs = getAttrs(self),
                values = {};

            // reset all
            for (name in attrs) {
                values[name] = self.__getDefAttrVal(name);
            }

            self.set(values, opts);
            return self;
        }
    });

    function capitalFirst(s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }

    if (undef) {
        Attribute.prototype.addAttrs = undef;
    }
    return Attribute;
});

/**
 *  2011-10-18
 *    get/set sub attribute value ,set("x.y",val) x 最好为 {} ，不要是 new Clz() 出来的
 *    add validator
 */
/**
 * @module  Base
 * @author  yiminghe@gmail.com,lifesinger@gmail.com
 */
KISSY.add('base/base', function (S, Attribute, Event) {

    /**
     * Base for class-based component
     * @name Base
     * @extends Event.Target
     * @extends Attribute
     * @class
     */
    function Base(config) {
        var c = this.constructor;

        // define
        while (c) {
            addAttrs(this, c['ATTRS']);
            c = c.superclass ? c.superclass.constructor : null;
        }
        // initial
        initAttrs(this, config);
    }

    function addAttrs(host, attrs) {
        if (attrs) {
            for (var attr in attrs) {
                // 子类上的 ATTRS 配置优先
                if (attrs.hasOwnProperty(attr)) {
                    // 父类后加，父类不覆盖子类的相同设置
                    // 属性对象会 merge   a: {y:{getter:fn}}, b:{y:{value:3}}, b extends a => b {y:{value:3}}
                    host.addAttr(attr, attrs[attr], false);
                }
            }
        }
    }

    function initAttrs(host, config) {
        if (config) {
            for (var attr in config) {
                if (config.hasOwnProperty(attr)) {
                    //用户设置会调用 setter/validator 的，但不会触发属性变化事件
                    host.__set(attr, config[attr]);
                }

            }
        }
    }

    S.augment(Base, Event.Target, Attribute);
    return Base;
}, {
    requires:["./attribute","event"]
});
KISSY.add("base", function(S, Base, Attribute) {
    Base.Attribute = Attribute;
    return Base;
}, {
    requires:["base/base","base/attribute"]
});
