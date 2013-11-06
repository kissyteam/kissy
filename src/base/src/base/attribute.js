/**!
 * @ignore
 * attribute management
 * @author yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add(function (S, undefined) {
    // atomic flag
    var INVALID = {};

    var FALSE = false;

    function normalFn(host, method) {
        if (typeof method == 'string') {
            return host[method];
        }
        return method;
    }

    function whenAttrChangeEventName(when, name) {
        return when + S.ucfirst(name) + 'Change';
    }

    // fire attribute value change
    function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
        attrName = attrName || name;
        return self.fire(whenAttrChangeEventName(when, name), S.mix({
            attrName: attrName,
            subAttrName: subAttrName,
            prevVal: prevVal,
            newVal: newVal
        }, data));
    }

    function ensureNonEmpty(obj, name, doNotCreate) {
        var ret = obj[name];
        if (!doNotCreate && !ret) {
            obj[name] = ret = {};
        }
        return ret || {};
    }

    /*
     o, [x,y,z] => o[x][y][z]
     */
    function getValueByPath(o, path) {
        for (var i = 0, len = path.length;
             o != undefined && i < len;
             i++) {
            o = o[path[i]];
        }
        return o;
    }

    /*
     o, [x,y,z], val => o[x][y][z]=val
     */
    function setValueByPath(o, path, val) {
        var len = path.length - 1,
            s = o;
        if (len >= 0) {
            for (var i = 0; i < len; i++) {
                o = o[path[i]];
            }
            if (o != undefined) {
                o[path[i]] = val;
            } else {
                s = undefined;
            }
        }
        return s;
    }

    function getPathNamePair(name) {
        var path;

        if (name.indexOf('.') !== -1) {
            path = name.split('.');
            name = path.shift();
        }

        return {
            path: path,
            name: name
        };
    }

    function getValueBySubValue(prevVal, path, value) {
        var tmp = value;
        if (path) {
            if (prevVal === undefined) {
                tmp = {};
            } else {
                tmp = S.clone(prevVal);
            }
            setValueByPath(tmp, path, value);
        }
        return tmp;
    }

    function prepareDefaultSetFn(self, name) {
        var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
        if (defaultBeforeFns[name]) {
            return;
        }
        defaultBeforeFns[name] = 1;
        var beforeChangeEventName = whenAttrChangeEventName('before', name);
        self.publish(beforeChangeEventName, {
            defaultFn: defaultSetFn
        });
    }

    function setInternal(self, name, value, opts, attrs) {
        var path,
            subVal,
            prevVal,
            pathNamePair = getPathNamePair(name),
            fullName = name;

        name = pathNamePair.name;
        path = pathNamePair.path;
        prevVal = self.get(name);

        prepareDefaultSetFn(self, name);

        if (path) {
            subVal = getValueByPath(prevVal, path);
        }

        // if no change, just return
        // pass equal check to fire change event
        if (!opts.force) {
            if (!path && prevVal === value) {
                return undefined;
            } else if (path && subVal === value) {
                return undefined;
            }
        }

        value = getValueBySubValue(prevVal, path, value);

        var beforeEventObject = S.mix({
            attrName: name,
            subAttrName: fullName,
            prevVal: prevVal,
            newVal: value,
            _opts: opts,
            _attrs: attrs,
            target: self
        }, opts.data);

        // check before event
        if (opts['silent']) {
            if (FALSE === defaultSetFn.call(self, beforeEventObject)) {
                return FALSE;
            }
        } else {
            if (FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject)) {
                return FALSE;
            }
        }

        return self;
    }

    function defaultSetFn(e) {
        // only consider itself, not bubbling!
        if (e.target !== this) {
            return undefined;
        }
        var self = this,
            value = e.newVal,
            prevVal = e.prevVal,
            name = e.attrName,
            fullName = e.subAttrName,
            attrs = e._attrs,
            opts = e._opts;

        // set it
        var ret = self.setInternal(name, value);

        if (ret === FALSE) {
            return ret;
        }

        // fire after event
        if (!opts['silent']) {
            value = self.__attrVals[name];
            __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
            if (attrs) {
                attrs.push({
                    prevVal: prevVal,
                    newVal: value,
                    attrName: name,
                    subAttrName: fullName
                });
            } else {
                __fireAttrChange(self,
                    '', '*',
                    [prevVal], [value],
                    [fullName], [name],
                    opts.data);
            }
        }

        return undefined;
    }

    /**
     * @class KISSY.Base.Attribute
     * @override KISSY.Base
     */
    return {
        INVALID: INVALID,

        /**
         * get un-cloned attr config collections
         * @return {Object}
         * @private
         */
        getAttrs: function () {
            return this.__attrs;
        },

        /**
         * get un-cloned attr value collections
         * @return {Object}
         */
        getAttrVals: function () {
            var self = this,
                o = {},
                a,
                attrs = self.__attrs;
            for (a in attrs) {
                o[a] = self.get(a);
            }
            return o;
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * @param {String} name attrName
         * @param {Object} attrConfig The config supports the following properties
         * @param [attrConfig.value] simple object or system native object
         * @param [attrConfig.valueFn] a function which can return current attribute 's default value
         * @param {Function} [attrConfig.setter] call when set attribute 's value
         * pass current attribute 's value as parameter
         * if return value is not undefined,set returned value as real value
         * @param {Function} [attrConfig.getter] call when get attribute 's value
         * pass current attribute 's value as parameter
         * return getter's returned value to invoker
         * @param {Function} [attrConfig.validator]  call before set attribute 's value
         * if return false,cancel this set action
         * @param {Boolean} [override] whether override existing attribute config ,default true
         * @chainable
         */
        addAttr: function (name, attrConfig, override) {
            var self = this,
                attrs = self.__attrs,
                attr,
                cfg = S.clone(attrConfig);
            if (attr = attrs[name]) {
                S.mix(attr, cfg, override);
            } else {
                attrs[name] = cfg;
            }
            return self;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param {Object} attrConfigs  An object with attribute name/configuration pairs.
         * @param {Object} initialValues user defined initial values
         * @chainable
         */
        addAttrs: function (attrConfigs, initialValues) {
            var self = this;
            S.each(attrConfigs, function (attrConfig, name) {
                self.addAttr(name, attrConfig);
            });
            if (initialValues) {
                self.set(initialValues);
            }
            return self;
        },

        /**
         * Checks if the given attribute has been added to the host.
         * @param {String} name attribute name
         * @return {Boolean}
         */
        hasAttr: function (name) {
            return this.__attrs.hasOwnProperty(name);
        },

        /**
         * Removes an attribute from the host object.
         * @chainable
         */
        removeAttr: function (name) {
            var self = this;
            var __attrVals = self.__attrVals;
            var __attrs = self.__attrs;

            if (self.hasAttr(name)) {
                delete __attrs[name];
                delete __attrVals[name];
            }

            return self;
        },


        /**
         * Sets the value of an attribute.
         * @param {String|Object} name attribute 's name or attribute name and value map
         * @param [value] attribute 's value
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @param {Function} [opts.error] error handler
         * @return {Boolean} whether pass validator
         */
        set: function (name, value, opts) {
            var self = this;
            if (S.isPlainObject(name)) {
                opts = value;
                opts = opts || {};
                var all = Object(name),
                    attrs = [],
                    e,
                    errors = [];
                for (name in all) {
                    // bulk validation
                    // if any one failed,all values are not set
                    if ((e = validate(self, name, all[name], all)) !== undefined) {
                        errors.push(e);
                    }
                }
                if (errors.length) {
                    if (opts['error']) {
                        opts['error'](errors);
                    }
                    return FALSE;
                }
                for (name in all) {
                    setInternal(self, name, all[name], opts, attrs);
                }
                var attrNames = [],
                    prevVals = [],
                    newVals = [],
                    subAttrNames = [];
                S.each(attrs, function (attr) {
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
                        attrNames,
                        opts.data);
                }
                return self;
            }
            opts = opts || {};
            // validator check
            e = validate(self, name, value);

            if (e !== undefined) {
                if (opts['error']) {
                    opts['error'](e);
                }
                return FALSE;
            }
            return setInternal(self, name, value, opts);
        },

        /**
         * internal use, no event involved, just set.
         * override by model
         * @protected
         */
        setInternal: function (name, value) {
            var self = this,
                setValue = undefined,
            // if host does not have meta info corresponding to (name,value)
            // then register on demand in order to collect all data meta info
            // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
            // 因为属性在声明注册前可以直接设置值
                attrConfig = ensureNonEmpty(self.__attrs, name),
                setter = attrConfig['setter'];

            // if setter has effect
            if (setter && (setter = normalFn(self, setter))) {
                setValue = setter.call(self, value, name);
            }

            if (setValue === INVALID) {
                return FALSE;
            }

            if (setValue !== undefined) {
                value = setValue;
            }

            // finally set
            self.__attrVals[name] = value;

            return undefined;
        },

        /**
         * Gets the current value of the attribute.
         * @param {String} name attribute 's name
         * @return {*}
         */
        get: function (name) {
            var self = this,
                dot = '.',
                path,
                attrVals = self.__attrVals,
                attrConfig,
                getter, ret;

            if (name.indexOf(dot) !== -1) {
                path = name.split(dot);
                name = path.shift();
            }

            attrConfig = ensureNonEmpty(self.__attrs, name, 1);
            getter = attrConfig['getter'];

            // get user-set value or default value
            //user-set value takes privilege
            ret = name in attrVals ?
                attrVals[name] :
                getDefAttrVal(self, name);

            // invoke getter for this attribute
            if (getter && (getter = normalFn(self, getter))) {
                ret = getter.call(self, ret, name);
            }

            if (!(name in attrVals) && ret !== undefined) {
                attrVals[name] = ret;
            }

            if (path) {
                ret = getValueByPath(ret, path);
            }

            return ret;
        },

        /**
         * Resets the value of an attribute.just reset what addAttr set
         * (not what invoker set when call new Xx(cfg))
         * @param {String} name name of attribute
         * @param {Object} [opts] some options
         * @param {Boolean} [opts.silent] whether fire change event
         * @chainable
         */
        reset: function (name, opts) {
            var self = this;

            if (typeof name == 'string') {
                if (self.hasAttr(name)) {
                    // if attribute does not have default value, then set to undefined
                    return self.set(name, getDefAttrVal(self, name), opts);
                }
                else {
                    return self;
                }
            }

            opts = /**@type Object
             @ignore*/(name);

            var attrs = self.__attrs,
                values = {};

            // reset all
            for (name in attrs) {
                values[name] = getDefAttrVal(self, name);
            }

            self.set(values, opts);
            return self;
        }
    };

    // get default attribute value from valueFn/value
    function getDefAttrVal(self, name) {
        var attrs = self.__attrs,
            attrConfig = ensureNonEmpty(attrs, name, 1),
            valFn = attrConfig.valueFn,
            val;

        if (valFn && (valFn = normalFn(self, valFn))) {
            val = valFn.call(self);
            if (val !== /**
             @ignore
             @type Function
             */undefined) {
                attrConfig.value = val;
            }
            delete attrConfig.valueFn;
            attrs[name] = attrConfig;
        }

        return attrConfig.value;
    }

    function validate(self, name, value, all) {
        var path, prevVal, pathNamePair;

        pathNamePair = getPathNamePair(name);

        name = pathNamePair.name;
        path = pathNamePair.path;

        if (path) {
            prevVal = self.get(name);
            value = getValueBySubValue(prevVal, path, value);
        }
        var attrConfig = ensureNonEmpty(self.__attrs, name),
            e,
            validator = attrConfig['validator'];
        if (validator && (validator = normalFn(self, validator))) {
            e = validator.call(self, value, name, all);
            // undefined and true validate successfully
            if (e !== undefined && e !== true) {
                return e;
            }
        }
        return undefined;
    }
});

/*
 2011-10-18
 get/set sub attribute value ,set('x.y',val) x 最好为 {} ，不要是 new Clz() 出来的
 add validator
 */
