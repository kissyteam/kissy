﻿/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Aug 6 21:57
*/
/*
 Combined processedModules by KISSY Module Compiler: 

 xtemplate/runtime/commands
 xtemplate/runtime
*/

/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add("xtemplate/runtime/commands", function (S) {

    var commands;

    return commands = {
        'each': function (scopes, config) {
            var params = config.params;
            var param0 = params[0];
            var buffer = '';
            var xcount;
            // if undefined, will emit warning by compiler
            if (param0) {
                // skip array check for performance
                var opScopes = [0, 0].concat(scopes);
                if (S.isArray(param0)) {
                    xcount = param0.length;
                    for (var xindex = 0; xindex < xcount; xindex++) {
                        // two more variable scope for array looping
                        opScopes[0] = param0[xindex];
                        opScopes[1] = {
                            xcount: xcount,
                            xindex: xindex
                        };
                        buffer += config.fn(opScopes);
                    }
                } else {
                    for (var name in param0) {
                        opScopes[0] = param0[name];
                        opScopes[1] = {
                            xkey: name
                        };
                        buffer += config.fn(opScopes);
                    }
                }

            } else if (config.inverse) {
                buffer = config.inverse(scopes);
            }
            return buffer;
        },

        'with': function (scopes, config) {
            var params = config.params;
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (param0) {
                // skip object check for performance
                opScopes[0] = param0;
                buffer = config.fn(opScopes);
            } else if (config.inverse) {
                buffer = config.inverse(scopes);
            }
            return buffer;
        },

        'if': function (scopes, config) {
            var params = config.params;
            var param0 = params[0];
            var buffer = '';
            if (param0) {
                if (config.fn) {
                    buffer = config.fn(scopes);
                }
            } else if (config.inverse) {
                buffer = config.inverse(scopes);
            }
            return buffer;
        },

        'set': function (scopes, config) {
            // in case scopes[0] is not object ,{{#each}}{{set }}{{/each}}
            for (var i = scopes.length - 1; i >= 0; i--) {
                if (typeof scopes[i] == 'object') {
                    S.mix(scopes[i], config.hash);
                    break;
                }
            }
            return '';
        },

        include: function (scopes, config) {
            var params = config.params;
            // allow hash to shadow parent scopes
            var extra = config.hash ? [config.hash] : [];
            scopes = extra.concat(scopes);

            if (!params || params.length != 1) {
                S[config.silent ?
                    'log' :
                    'error']('include must has one param');
                return '';
            }

            var myName = this.config.name;
            var subTplName = params[0];

            if (subTplName.charAt(0) == '.') {
                if (myName == 'unspecified') {
                    S.error('parent template does not have name' +' for relative sub tpl name: ' + subTplName);
                    return '';
                }
                subTplName = S.Path.resolve(myName, '../', subTplName);
            }

            var tpl= this.config.loader.call(this,subTplName);

            config = S.merge(this.config);
            // template file name
            config.name = subTplName;

            return this.invokeEngine(tpl, scopes, config)
        },

        parse: function (scopes, config) {
            // abandon parent scopes
            return commands.include.call(this, [], config);
        }
    };

});
/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', function (S, commands) {

    var utils = {
            'getPropertyOrCommand': function (engine, scopes, options, name, depth, line) {
                var id0;
                var config = engine.config;
                var commands = config.commands;
                var command1 = commands[name];
                if (command1) {
                    try {
                        id0 = command1.call(engine, scopes, options);
                    } catch (e) {
                        S['error'](e.message + ": '" +name + "' at line " + line);
                    }
                }
                else {
                    var tmp2 = utils.getProperty(name, scopes, depth);
                    if (tmp2 === false) {
                        S[config.silent ?
                            "log" :
                            "error"]("can not find property: '" +
                                name + "' at line " + line, "warn");
                    } else {
                        id0 = tmp2[0];
                    }
                }
                return id0;
            },

            'getProperty': function (parts, scopes, depth) {
                // this refer to current scope object
                if (parts === '.') {
                    parts = 'this';
                }
                parts = parts.split('.');
                var len = parts.length,
                    i,
                    j = depth || 0,
                    v,
                    p,
                    valid,
                    sl = scopes.length;
                // root keyword for root scope
                if (parts[0] == 'root') {
                    j = sl - 1;
                    parts.shift();
                    len--;
                }
                for (; j < sl; j++) {
                    v = scopes[j];
                    valid = 1;
                    for (i = 0; i < len; i++) {
                        p = parts[i];
                        if (p === 'this') {
                            continue;
                        }
                        // may not be object at all
                        else if (typeof v != 'object' || !(p in v)) {
                            valid = 0;
                            break;
                        }
                        v = v[p];
                    }
                    if (valid) {
                        // support property function return value as property value
                        if (typeof v == 'function') {
                            v = v.call(scopes[0]);
                        }
                        return [v];
                    }
                }
                return false;
            }
        },

        defaultConfig = {

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
             * @cfg {Boolean} name
             * @member KISSY.XTemplate.Runtime
             */
            name: 'unspecified',

            /**
             * {{}} default to escapeHtml
             *
             * @cfg {Boolean} escapeHtml
             * @member KISSY.XTemplate.Runtime
             */
            escapeHtml: true,

            /**
             * tpl loader to load sub tpl by name
             * @cfg {Function} loader
             * @member KISSY.XTemplate.Runtime
             */
            loader: function (subTplName) {
                var tpl = '';
                S.use(subTplName, {
                    success: function (S, t) {
                        tpl = t;
                    },
                    sync: 1
                });
                if (!tpl) {
                    S[this.config.silent ? 'log' : 'error']('template "' +
                        subTplName + '" does not exist, ' +
                        'need to be required or used first!');
                }
                return tpl;
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
    function XTemplateRuntime(tpl, config) {
        var self = this;
        self.tpl = tpl;
        config = S.merge(defaultConfig, config);
        config.commands = S.merge(config.commands, XTemplateRuntime.commands);
        config.utils = utils;
        this.config = config;
    }

    XTemplateRuntime.prototype = {

        constructor: XTemplateRuntime,

        // allow str sub template
        invokeEngine: function (tpl, scopes, config) {
            return new this.constructor(tpl, config).render(scopes, true);
        },

        /**
         * remove command by name
         * @param commandName
         */
        'removeCommand': function (commandName) {
            delete this.config.commands[commandName];
        },

        /**
         * add command definition to current template
         * @param commandName
         * @param {Function} fn command definition
         */
        addCommand: function (commandName, fn) {
            this.config.commands[commandName] = fn;
        },

        /**
         * get result by merge data with template
         * @param data
         * @return {String}
         * @param {Boolean} [keepDataFormat] for internal use
         */
        render: function (data, keepDataFormat) {
            if (!keepDataFormat) {
                data = [data];
            }
            return this.tpl(data);
        }

    };

    S.mix(XTemplateRuntime, {
        commands: commands,

        utils: utils,

        /**
         * add command to all template
         * @method
         * @static
         * @param {String} commandName
         * @param {Function} fn
         * @member KISSY.XTemplate.Runtime
         */
        addCommand: function (commandName, fn) {
            commands[commandName] = fn;
        },

        /**
         * remove command from all template by name
         * @method
         * @static
         * @param {String} commandName
         * @member KISSY.XTemplate.Runtime
         */
        removeCommand: function (commandName) {
            delete commands[commandName];
        }
    });

    return XTemplateRuntime;

}, {
    requires: [ './runtime/commands']
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
 *      - 内置 escapeHtml 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *   劣势
 *      - 不支持表达式
 *      - 不支持复杂比较操作
 *      - 不支持 js 语法
 *
 */

