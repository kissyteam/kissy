/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 28 18:33
*/
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
         * or
         *
         * command is not found
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
         * or
         *
         * command is not found
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
            'getProperty': function (parts, scopes) {
                // this refer to current scope object
                if (parts == 'this' || parts == '.') {
                    if (scopes.length) {
                        return [ scopes[0] ];
                    } else {
                        return false;
                    }
                }
                parts = parts.split('.');
                var len = parts.length,
                    i,
                    j,
                    v,
                    p,
                    valid,
                    sl = scopes.length;
                for (j = 0; j < sl; j++) {
                    v = scopes[j];
                    valid = 1;
                    for (i = 0; i < len; i++) {
                        p = parts[i];
                        // may not be object at all
                        if (typeof v != 'object' || !(p in v)) {
                            valid = 0;
                            break;
                        }
                        v = v[p];
                    }
                    if (valid) {
                        // support property function return value as property value
                        if (typeof v == 'function') {
                            v = v.call(scopes[sl - 1]);
                        }
                        return [v];
                    }
                }
                return false;
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
         * @param {Boolean} [keepDataFormat] internal use
         */
        render: function (data, keepDataFormat) {
            var self = this;
            if (!keepDataFormat) {
                data = [data];
            }
            return self.tpl(data, self.option);
        }
    };

    return XTemplateRuntime;
});/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S, includeCommand) {
    return {
        'each': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var buffer = '';
            var xcount;
            // if undefined, will emit warning by compiler
            if (param0) {
                // skip array check for performance
                var opScopes = [0, 0].concat(scopes);
                xcount = param0.length;
                for (var xindex = 0; xindex < xcount; xindex++) {
                    // two more variable scope for array looping
                    opScopes[0] = param0[xindex];
                    opScopes[1] = {
                        xcount: xcount,
                        xindex: xindex
                    };
                    buffer += option.fn(opScopes);
                }
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0) {
                // skip object check for performance
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                if (option.fn) {
                    buffer = option.fn(scopes);
                }
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'set': function (scopes, option) {
            // in case scopes[0] is not object ,{{#each}}{{set }}{{/each}}
            for (var i = scopes.length - 1; i >= 0; i--) {
                if (typeof scopes[i] == 'object') {
                    S.mix(scopes[i], option.hash);
                    break;
                }
            }
            return '';
        },

        'include': includeCommand.include
    };

}, {
    requires: ['./include-command']
});/**
 * include command
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime/include-command', function (S, XTemplateRuntime) {

    var include = {

        invokeEngine: function (tpl, scopes, option) {
            return new XTemplateRuntime(tpl, S.merge(option)).render(scopes, true);
        },

        include: function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                S[option.silent ? 'log' : 'error']('include must has one param');
                return '';
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                S[option.silent ? 'log' : 'error']('does not include sub template "' + param0 + '"');
                return '';
            }
            // template file name
            option.name = param0;
            return include.invokeEngine(tpl, scopes, option)
        }

    };

    return include;

}, {
    requires: ['./base']
});/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', function (S, XTemplateRuntime, commands, includeCommand) {

    /**
     * add command to all template
     * @method
     * @static
     * @param {String} commandName
     * @param {Function} fn
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.addCommand = function (commandName, fn) {
        commands[commandName] = fn;
    };

    /**
     * remove command from all template by name
     * @method
     * @static
     * @param {String} commandName
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.removeCommand = function (commandName) {
        delete commands[commandName];
    };

    XTemplateRuntime.commands = commands;

    XTemplateRuntime.includeCommand = includeCommand;

    var subTpls = {};

    XTemplateRuntime.subTpls = subTpls;

    /**
     * add sub template definition to all template
     * @method
     * @static
     * @param {String} tplName
     * @param {Function|String} def
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.addSubTpl = function (tplName, def) {
        subTpls[tplName] = def;
    };

    /**
     * remove sub template definition from all template by name
     * @method
     * @static
     * @param {String} tplName
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.removeSubTpl = function (tplName) {
        delete  subTpls[tplName];
    };

    // can only include compiled sub template
    XTemplateRuntime.IncludeEngine = XTemplateRuntime;

    return XTemplateRuntime;
}, {
    requires: ['./runtime/base', './runtime/commands', './runtime/include-command']
});

/**
 * @ignore
 *
 * 2012-09-12 yiminghe@gmail.com
 *  - 参考 velocity, 扩充 ast
 *          - Expression/ConditionalOrExpression
 *          - EqualityExpression/RelationalExpression...
 *
 * 2012-09-11 yiminghe@gmail.com
 *  - 初步完成，添加 tc
 *
 * 对比 template
 *
 *  优势
 *      - 不会莫名其妙报错（with）
 *      - 更多出错信息，直接给出行号
 *      - 更容易扩展 command,sub-tpl
 *      - 支持子模板
 *      - 支持作用域链: ..\x ..\..\y
 *      - 内置 escapeHTML 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *   劣势
 *      - 不支持表达式
 *      - 不支持复杂比较操作
 *      - 不支持 js 语法
 *
 */
