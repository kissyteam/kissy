/**
 * xtemplate base
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime/base', function (S) {

    var defaultConfig = {

        /**
         * whether throw exception when template variable is not found in data
         *
         *      @example
         *      '{{title}}'.render({t2:0})
         *
         *
         * @cfg {Boolean} silent
         * @member KISSY.XTemplate
         */

        /**
         * whether throw exception when template variable is not found in data
         *
         *      @example
         *      '{{title}}'.render({t2:0})
         *
         *
         * @cfg {Boolean} silent
         * @member KISSY.XTemplate.Runtime
         */
        silent: true,
        /**
         * template file name for chrome debug
         *
         * @cfg {String} name
         * @member KISSY.XTemplate
         */
        /**
         * template file name for chrome debug
         *
         * @cfg {Boolean} name
         * @member KISSY.XTemplate.Runtime
         */
        name: '',
        utils: {
            'getProperty': function (parts, from) {
                if (!from) {
                    return false;
                }
                parts = parts.split('.');
                var len = parts.length, i, v = from;
                for (i = 0; i < len; i++) {
                    if (!(parts[i] in v)) {
                        return false;
                    }
                    v = v[parts[i]];
                }
                return [v];
            }
        }
    };

    /**
     * XTemplate runtime. only accept tpl as function.
     *
     *      @example
     *      new XTemplateRuntime(tplFunction, config);
     *
     * @class KISSY.XTemplate.Runtime
     */
    function XTemplateRuntime(tpl, option) {
        var self = this;
        self.tpl = tpl;
        option = S.merge(defaultConfig, option);
        option.subTpls = S.merge(option.subTpls, XTemplateRuntime.subTpls);
        option.commands = S.merge(option.commands, XTemplateRuntime.commands);
        this.option = option;
    }

    XTemplateRuntime.prototype = {
        constructor: XTemplateRuntime,
        /**
         * remove sub template by name
         * @param subTplName
         */
        'removeSubTpl': function (subTplName) {
            delete this.option.subTpls[subTplName];
        },
        /**
         * remove command by name
         * @param commandName
         */
        'removeCommand': function (commandName) {
            delete this.option.commands[commandName];
        },
        /**
         * add sub template definition to current template
         * @param subTplName
         * @param {String|Function}def
         */
        addSubTpl: function (subTplName, def) {
            this.option.subTpls[subTplName] = def;
        },
        /**
         * add command definition to current template
         * @param commandName
         * @param {Function} fn command definition
         */
        addCommand: function (commandName, fn) {
            this.option.commands[commandName] = fn;
        },
        /**
         * get result by merge data with template
         * @param data
         * @return {String}
         */
        render: function (data) {
            var self = this;
            if (!S.isArray(data)) {
                data = [data];
            }
            return self.tpl(data, self.option);
        }
    };

    return XTemplateRuntime;
});