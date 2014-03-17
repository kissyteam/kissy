/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    var nativeCommands = require('./runtime/commands');
    var commands = {};
    var Scope = require('./runtime/scope');

//    function merge(from, to) {
//        for (var i in to) {
//            from[i] = to[i];
//        }
//    }

    function findCommand(localCommands, name) {
        if (name.indexOf('.') === -1) {
            return localCommands && localCommands[name] || commands[name];
        }
        var parts = name.split('.');
        var cmd = localCommands && localCommands[parts[0]] || commands[parts[0]];
        if (cmd) {
            var len = parts.length;
            for (var i = 1; i < len; i++) {
                cmd = cmd[parts[i]];
                if (!cmd) {
                    break;
                }
            }
        }
        return cmd;
    }

    var utils = {
        'normalizeOutput':function(str){
            if (!str && str !== 0) {
                return '';
            }
            return str;
        },
        'callCommand': function (engine, scope, options, name, line) {
            var ret = '';
            var commands = engine.config.commands;
            var command1 = findCommand(commands, name);
            if (command1) {
                try {
                    ret = command1.call(engine, scope, options);
                } catch (e) {
                    S.error('in file: ' + engine.name + ' ' + e.message + ': "' + name + '" at line ' + line);
                }
            } else {
                S.error('in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line);
            }
            return ret;
        }
    };

    /**
     * template file name for chrome debug
     *
     * @cfg {Boolean} name
     * @member KISSY.XTemplate.Runtime
     */

    /**
     * XTemplate runtime. only accept tpl as function.
     * @class KISSY.XTemplate.Runtime
     */
    function XTemplateRuntime(tpl, config) {
        var self = this;
        self.tpl = tpl;
        config = config || {};
        // can not shared between config
        if (config.name) {
            self.name = config.name;
        }
        self.config = config;
    }

    S.mix(XTemplateRuntime, {
        nativeCommands: nativeCommands,

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

        nativeCommands: nativeCommands,

        utils: utils,

        /**
         * tpl loader to load sub tpl by name
         * @cfg {Function} loader
         * @member KISSY.XTemplate.Runtime
         */
        load: function (subTplName) {
            var tpl = S.require(subTplName);
            if (!tpl) {
                S.error('template "' + subTplName + '" does not exist, ' + 'need to be required or used first!');
            }
            var engine = new this.constructor(tpl, this.config);
            engine.name = subTplName;
            return engine;
        },

        /**
         * remove command by name
         * @param commandName
         */
        'removeCommand': function (commandName) {
            var config = this.config;
            if (config.commands) {
                delete config.commands[commandName];
            }
        },

        /**
         * add command definition to current template
         * @param commandName
         * @param {Function} fn command definition
         */
        addCommand: function (commandName, fn) {
            var config = this.config;
            config.commands = config.commands || {};
            config.commands[commandName] = fn;
        },

        /**
         * get result by merge data with template
         * @param data
         * @param payload internal usage
         * @return {String}
         */
        render: function (data, payload) {
            var root = data;
            var self = this;
            if (!(root && root.isScope)) {
                root = new Scope(data);
            }
            payload = payload || {};
            payload.extendTplName = null;
            if (self.tpl.TPL_NAME && !self.name) {
                self.name = self.tpl.TPL_NAME;
            }
            var html = self.tpl(root, S, payload);
            var extendTplName = payload.extendTplName;
            // if has extend statement, only parse
            if (extendTplName) {
                return nativeCommands.include.call(self, root, {
                    params: [extendTplName]
                }, payload);
            } else {
                return html;
            }
        }
    };

    XTemplateRuntime.Scope = Scope;

    return XTemplateRuntime;
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