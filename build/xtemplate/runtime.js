/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 11 12:57
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
});/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S, includeCommand, undefined) {
    var error = S.error;
    return {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('each must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            var single;
            if (param0 !== undefined) {
                if (S.isArray(param0)) {
                    var opScopes = [0].concat(scopes);
                    xcount = param0.length;
                    for (var xindex = 0; xindex < xcount; xindex++) {
                        var holder = {};
                        single = param0[xindex];
                        holder['this'] = single;
                        holder.xcount = xcount;
                        holder.xindex = xindex;
                        if (S.isObject(single)) {
                            S.mix(holder, single);
                        }
                        opScopes[0] = holder;
                        buffer += option.fn(opScopes);
                    }
                } else {
                    S.log(param0, 'error');
                    error('each can only apply to array');
                }
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('with must has one param');
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0 !== undefined) {
                if (S.isObject(param0)) {
                    opScopes[0] = param0;
                    buffer = option.fn(opScopes);
                } else {
                    S.log(param0, 'error');
                    error('with can only apply to object');
                }
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('if must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                buffer = option.fn(scopes);
            } else if (option.inverse) {
                buffer = option.inverse(scopes);
            }
            return buffer;
        },

        'set': function (scopes, option) {
            S.mix(scopes[0], option.hash);
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
            return new XTemplateRuntime(tpl, S.merge(option)).render(scopes);
        },

        include: function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                error('include must has one param');
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                error('does not include sub template "' + param0 + '"');
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
