/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', function (S, commands, undefined) {
    var escapeHtml = S.escapeHtml;
    var logger = S.getLogger('s/xtemplate');

    function info(s) {
        logger.info(s);
    }

    function findCommand(commands, name) {
        var parts = name.split('.');
        var cmd = commands;
        var len = parts.length;
        for (var i = 0; i < len; i++) {
            cmd = cmd[parts[i]];
            if (!cmd) {
                break;
            }
        }
        return cmd;
    }

    function getProperty(parts, scopes, depth) {
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

    var utils = {
            'runBlockCommand': function (engine, scopes, options, name, line) {
                var config = engine.config;
                var logFn = config.silent ? info : S.error;
                var commands = config.commands;
                var command = findCommand(commands, name);
                if (!command) {
                    if (!options.params && !options.hash) {
                        var property = getProperty(name, scopes);
                        if (property === false) {
                            logFn("can not find property: '" + name + "' at line " + line);
                            property = '';
                        } else {
                            property = property[0];
                        }
                        command = commands['if'];
                        if (S.isArray(property)) {
                            command = commands.each;
                        }
                        else if (typeof property == 'object') {
                            command = commands['with'];
                        }
                        options.params = [property];
                    } else {
                        S.error("can not find command module: " + name + "' at line " + line);
                        return '';
                    }
                }
                var ret = '';
                try {
                    ret = command.call(engine, scopes, options);
                } catch (e) {
                    S.error(e.message + ": '" + name + "' at line " + line);
                }
                if (ret === undefined) {
                    ret = '';
                }
                return ret;
            },

            'getExpression': function (exp, escaped) {
                if (exp === undefined) {
                    exp = '';
                }
                return escaped && exp ? escapeHtml(exp) : exp;
            },

            'getPropertyOrRunCommand': function (engine, scopes, options, name, depth, line, escape, preserveUndefined) {
                var id0;
                var config = engine.config;
                var commands = config.commands;
                var command1 = findCommand(commands, name);
                var logFn = config.silent ? info : S.error;
                if (command1) {
                    try {
                        id0 = command1.call(engine, scopes, options);
                    } catch (e) {
                        S.error(e.message + ": '" + name + "' at line " + line);
                        return '';
                    }
                }
                else {
                    var tmp2 = getProperty(name, scopes, depth);
                    if (tmp2 === false) {
                        logFn("can not find property: '" +
                            name + "' at line " + line, "warn");
                        // undefined for expression
                        // {{n+2}}
                        return preserveUndefined ? undefined : '';
                    } else {
                        id0 = tmp2[0];
                    }
                }
                if (!preserveUndefined && id0 === undefined) {
                    id0 = '';
                }
                return escape && id0 ? escapeHtml(id0) : id0;
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
             * tpl loader to load sub tpl by name
             * @cfg {Function} loader
             * @member KISSY.XTemplate.Runtime
             */
            loader: function (subTplName) {
                var tpl = S.require(subTplName);
                if (!tpl) {
                    S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
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
        config.commands = S.merge(config.commands, commands);
        config.utils = utils;
        config.macros = config.macros || {};
        this.config = config;
    }

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
            return this.tpl(data, S);
        }
    };

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