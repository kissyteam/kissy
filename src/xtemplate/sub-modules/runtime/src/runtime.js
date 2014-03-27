/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add(function (S, require) {
    require('util');
    var nativeCommands = require('./runtime/commands');
    var commands = {};
    var Scope = require('./runtime/scope');
    var LinkedBuffer = require('./runtime/linked-buffer');

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

    function getSubNameFromParentName(parentName, subName) {
        var parts = parentName.split('/');
        var subParts = subName.split('/');
        parts.pop();
        for (var i = 0, l = subParts.length; i < l; i++) {
            var subPart = subParts[i];
            if (subPart === '.') {
            } else if (subPart === '..') {
                parts.pop();
            } else {
                parts.push(subPart);
            }
        }
        return parts.join('/');
    }

    function renderTpl(self, scope, buffer, payload) {
        var tpl = self.tpl;
        payload = payload || {};
        payload.extendTplName = null;
        if (tpl.TPL_NAME && !self.name) {
            self.name = tpl.TPL_NAME;
        }
        buffer = tpl.call(self, scope, S, buffer, payload);
        var extendTplName = payload.extendTplName;
        // if has extend statement, only parse
        if (extendTplName) {
            buffer = self.include(extendTplName, scope, buffer, payload);
        }
        return buffer;
    }

    function callCommand(engine, scope, option, buffer, name, line) {
        var commands = engine.config.commands;
        var error;
        var command1 = findCommand(commands, name);
        if (command1) {
            return command1.call(engine, scope, option, buffer, line);
        } else {
            error = 'in file: ' + engine.name + ' can not find command: ' + name + '" at line ' + line;
            S.error(error);
        }
        return buffer;
    }

    var utils = {
        callCommand: callCommand
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

        Scope: Scope,

        nativeCommands: nativeCommands,

        utils: utils,

        /**
         * tpl loader to load sub tpl by name
         * @cfg {Function} loader
         * @member KISSY.XTemplate.Runtime
         */
        load: function (subTplName) {
            var self = this;
            var tpl = S.require(subTplName);
            if (!tpl) {
                S.error('template "' + subTplName + '" does not exist, need to be required or used first!');
            }
            var engine = new self.constructor(tpl, self.config);
            engine.name = subTplName;
            return engine;
        },

        /**
         * remove command by name
         * @param commandName
         */
        removeCommand: function (commandName) {
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

        include: function (subTplName, scope, buffer, payload) {
            var myName = this.name;
            if (subTplName.charAt(0) === '.') {
                if (!myName) {
                    var error = 'parent template does not have name' +
                        ' for relative sub tpl name: ' + subTplName;
                    throw new Error(error);
                }
                subTplName = getSubNameFromParentName(myName, subTplName);
            }
            return renderTpl(this.load(subTplName), scope, buffer, payload);
        },

        /**
         * get result by merge data with template
         * @param data
         * @param callback function called
         * @return {String}
         */
        render: function (data, callback) {
            var html = '';
            var self = this;
            callback = callback || function (error, ret) {
                html = ret;
            };
            if (!self.name && self.tpl.TPL_NAME) {
                self.name = self.tpl.TPL_NAME;
            }
            renderTpl(self, new Scope(data),
                new LinkedBuffer(callback).head).end();
            return html;
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