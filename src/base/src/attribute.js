/**
 * @fileOverview attribute management
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('base/attribute', function (S, undef) {

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
            attrName:attrName,
            subAttrName:subAttrName,
            prevVal:prevVal,
            newVal:newVal
        });
    }


    /**
     *
     * @param obj
     * @param name
     * @param [create]
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
        for (var i = 0, len = path.length;
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
            return undef;
        } else if (path && subVal === value) {
            return undef;
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
        ret = self.__set(name, value, opts);

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
     * @class <p>
     * Attribute provides configurable attribute support along with attribute change events. It is designed to be
     * augmented on to a host class, and provides the host with the ability to configure attributes to store and retrieve state,
     * along with attribute change events.
     * </p>
     * <p>For example, attributes added to the host can be configured:</p>
     * <ul>
     *     <li>With a setter function, which can be used to manipulate
     *     values passed to Attribute's {@link Attribute#set} method, before they are stored.</li>
     *     <li>With a getter function, which can be used to manipulate stored values,
     *     before they are returned by Attribute's {@link Attribute#get} method.</li>
     *     <li>With a validator function, to validate values before they are stored.</li>
     * </ul>
     *
     * <p>See the {@link Attribute#addAttr} method, for the complete set of configuration
     * options available for attributes</p>.
     *
     * <p><strong>NOTE:</strong> Most implementations will be better off extending the {@link Base} class,
     * instead of augmenting Attribute directly. Base augments Attribute and will handle the initial configuration
     * of attributes for derived classes, accounting for values passed into the constructor.</p>
     * @name Attribute
     */
    function Attribute() {
    }

    S.augment(Attribute,
        /**
         * @lends Attribute.prototype
         */
        {

            /**
             * @return un-cloned attr config collections
             */
            getAttrs:function () {
                return getAttrs(this);
            },

            /**
             * @return un-cloned attr value collections
             */
            getAttrVals:function () {
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
             * @param {Object} attrConfig The config supports the following properties
             * @param [attrConfig.value] simple object or system native object
             * @param [attrConfig.valueFn] a function which can return current attribute's default value
             * @param {Function(*)} [attrConfig.setter] call when set attribute's value
             *                                          pass current attribute's value as parameter
             *                                          if return value is not undefined,set returned value as real value
             * @param {Function(*)} [attrConfig.getter] call when get attribute's value
             *                                          pass current attribute's value as parameter
             *                                          return getter's returned value to invoker
             * @param {Function(*)} [attrConfig.validator]  call before set attribute's value
             *                                              if return false,cancel this set action
             * @param {boolean} [override] whether override existing attribute config ,default true
             */
            addAttr:function (name, attrConfig, override) {
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
            addAttrs:function (attrConfigs, initialValues) {
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
             */
            hasAttr:function (name) {
                return name && getAttrs(this).hasOwnProperty(name);
            },

            /**
             * Removes an attribute from the host object.
             */
            removeAttr:function (name) {
                var self = this;

                if (self.hasAttr(name)) {
                    delete getAttrs(self)[name];
                    delete getAttrVals(self)[name];
                }

                return self;
            },


            /**
             * Sets the value of an attribute.
             * @param {String|Object} name attribute's name or attribute name and value map
             * @param [value] attribute's value
             * @param {Object} [opts] some options
             * @param {boolean} [opts.silent] whether fire change event
             * @returns {boolean} whether pass validator
             */
            set:function (name, value, opts) {
                var self = this;
                if (S.isPlainObject(name)) {
                    opts = value;
                    var all = Object(name),
                        attrs = [],
                        e,
                        errors = [];
                    for (name in all) {
                        // bulk validation
                        // if any one failed,all values are not set
                        if ((e = validate(self, name, all[name], all)) !== undef) {
                            errors.push(e);
                        }
                    }
                    if (errors.length) {
                        if (opts.error) {
                            opts.error(errors);
                        }
                        return false;
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
                            attrNames);
                    }
                    return self;
                }
                return setInternal(self, name, value, opts);
            },

            /**
             * internal use, no event involved, just set.
             * @protected overriden by mvc/model
             */
            __set:function (name, value, opts) {
                var self = this,
                    setValue,
                    // if host does not have meta info corresponding to (name,value)
                    // then register on demand in order to collect all data meta info
                    // 一定要注册属性元数据，否则其他模块通过 _attrs 不能枚举到所有有效属性
                    // 因为属性在声明注册前可以直接设置值
                    e,
                    attrConfig = ensureNonEmpty(getAttrs(self), name, true),
                    setter = attrConfig['setter'];

                // validator check
                e = validate(self, name, value);

                if (e !== undef) {
                    if (opts.error) {
                        opts.error(e);
                    }
                    return false;
                }

                // if setter has effect
                if (setter && (setter = normalFn(self, setter))) {
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
             * @param {String} name attribute's name
             */
            get:function (name) {
                var self = this,
                    dot = ".",
                    path,
                    attrVals = getAttrVals(self),
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
                ret = name in attrVals ?
                    attrVals[name] :
                    self.__getDefAttrVal(name);

                // invoke getter for this attribute
                if (getter && (getter = normalFn(self, getter))) {
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
            __getDefAttrVal:function (name) {
                var self = this,
                    attrs = getAttrs(self),
                    attrConfig = ensureNonEmpty(attrs, name),
                    valFn = attrConfig.valueFn,
                    val;

                if (valFn && (valFn = normalFn(self, valFn))) {
                    val = valFn.call(self);
                    if (val !== undef) {
                        attrConfig.value = val;
                    }
                    delete attrConfig.valueFn;
                    attrs[name] = attrConfig;
                }

                return attrConfig.value;
            },

            /**
             * Resets the value of an attribute.just reset what addAttr set  (not what invoker set when call new Xx(cfg))
             * @param {String} name name of attribute
             * @param {Object} [opts] some options
             * @param {boolean} [opts.silent] whether fire change event
             */
            reset:function (name, opts) {
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

    function validate(self, name, value, all) {
        var attrConfig = ensureNonEmpty(getAttrs(self), name, true),
            e,
            validator = attrConfig['validator'];
        if (validator && (validator = normalFn(self, validator))) {
            e = validator.call(self, value, name, all);
            // undefined and true validate successfully
            if (e !== undef && e !== true) {
                return e;
            }
        }
        return undef;
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
