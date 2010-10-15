/*
Copyright 2010, KISSY UI Library v1.1.5
MIT Licensed
build time: Oct 15 14:07
*/
/**
 * @module  Attribute
 * @author  yiminghe@gmail.com, lifesinger@gmail.com
 */
KISSY.add('attribute', function(S, undefined) {

    /**
     * Attribute provides the implementation for any object
     * to deal with its attribute in aop ways.
     */
    function Attribute() {
        /**
         * attribute meta information
         {
            attrName: {
                getter: function,
                setter: function,
                value: v, // default value
                valueFn: function
            }
         }
         */
        //host.__attrs = { };

        /**
         * attribute value
         {
            attrName: attrVal
         }
         */
        //host.__attrVals = { };
    }

    S.augment(Attribute, {

        __initAttrs: function() {
            var host = this;
            if(host.__attrs) return;

            host.__attrs = { };
            host.__attrVals = { };
        },

        /**
         * Adds an attribute with the provided configuration to the host object.
         * The config supports the following properties:
         * {
         *     value: 'the default value',
         *     valueFn: function
         *     setter: function
         *     getter: function
         * }
         */
        addAttr: function(name, attrConfig) {
            var host = this;

            host.__initAttrs();
            host.__attrs[name] = S.clone(attrConfig || { });

            return host;
        },

        /**
         * Configures a group of attributes, and sets initial values.
         * @param attrConfigs {Object} An object with attribute name/configuration pairs.
         * @param values {Object} An object with attribute name/value pairs, defining the initial values to apply.
         *        Values defined in the cfgs argument will be over-written by values in this argument.
         */
        addAttrs: function(attrConfigs, values) {
            var host = this;

            S.each(attrConfigs, function(attrConfig, name) {
                if (name in values) {
                    attrConfig.value = values[name];
                }
                host.addAttr(name, attrConfig);
            });

            return host;
        },

        /**
         * Checks if the given attribute has been added to the host.
         */
        hasAttr: function(name) {
            return name && (name in (this.__attrs || { }));
        },

        /**
         * Removes an attribute from the host object.
         */
        removeAttr: function(name) {
            var host = this;

            if(host.hasAttr(name)) {
                delete host.__attrs.name;
                delete host.__attrVals.name;
            }

            return host;
        },

        /**
         * Sets the value of an attribute.
         */
        set: function (name, value) {
            var host = this,
                prevVal = host.get(name);

            // if no change, just return
            if (prevVal === value) return;

            // check before event
            if (false === host.__fireAttrChange('before', name, prevVal, value)) return;

            // set it
            host.__set(name, value);

            // fire after event
            host.__fireAttrChange('after', name, prevVal, host.__attrVals[name]);

            return host;
        },

        __fireAttrChange: function(when, name, prevVal, newVal) {
            return this.fire(when + capitalFirst(name) + 'Change', {
                attrName: name,
                prevVal: prevVal,
                newVal: newVal
            });
        },

        /**
         * internal use, no event involved, just set.
         */
        __set: function (name, value) {
            var host = this,
                setValue,
                attrConfig = host.__attrs[name],
                setter = attrConfig && attrConfig['setter'];

            // if setter has effect
            if (setter) setValue = setter.call(host, value);
            if (setValue !== undefined) value = setValue;

            // finally set
            host.__attrVals[name] = value;
        },

        /**
         * Gets the current value of the attribute.
         */
        get: function (name) {
            var host = this, attrConfig, getter, ret;

            host.__initAttrs();
            attrConfig = host.__attrs[name];
            getter = attrConfig && attrConfig['getter'];

            // get user-set value or default value
            ret = name in host.__attrVals ?
                host.__attrVals[name] :
                host.__getDefAttrVal(name);

            // invoke getter for this attribute
            if (getter) ret = getter.call(host, ret);

            return ret;
        },

        __getDefAttrVal: function(name) {
            var host = this,
                attrConfig = host.__attrs[name],
                valFn, val;

            if (!attrConfig) return;

            if ((valFn = attrConfig.valueFn)) {
                val = valFn.call(host);
                if (val !== undefined) {
                    attrConfig.value = val;
                }
                delete attrConfig.valueFn;
            }

            return attrConfig.value;
        },

        /**
         * Resets the value of an attribute.
         */
        reset: function (name) {
            var host = this;

            if (host.hasAttr(name)) {
                // if attribute does not have default value, then set to undefined.
                return host.set(name, host.__getDefAttrVal(name));
            }

            // reset all
            for (name in host.__attrs) {
                if (host.hasAttr(name)) {
                    host.reset(name);
                }
            }
            
            return host;
        }
    });

    S.Attribute = Attribute;

    function capitalFirst(s) {
        s = s + '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }
});
