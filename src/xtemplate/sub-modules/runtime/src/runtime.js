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

    function findCommand(localCommands, parts) {
        var name = parts[0];
        var cmd = localCommands && localCommands[name] || commands[name];
        if (parts.length === 1) {
            return cmd;
        }
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

    function renderTpl(tpl, scope, buffer) {
        var fn = tpl.fn;
        if (fn.version && S.version !== fn.version) {
            throw new Error('current xtemplate file(' + tpl.name +
                ')(v' + fn.version + ')need to be recompiled using current kissy(v' +
                S.version + ')!');
        }
        buffer = tpl.fn.call(tpl, scope, buffer);
        var extendTplName = tpl.session.extendTplName;
        // if has extend statement, only parse
        if (extendTplName) {
            delete tpl.session.extendTplName;
            buffer = tpl.root.include(extendTplName, tpl, scope, buffer);
        }
        return buffer.end();
    }

    function callFn(tpl, scope, option, buffer, parts, depth, line, resolveInScope) {
        var commands = tpl.root.config.commands;
        var error, caller, fn;
        var command1;
        if (!depth) {
            command1 = findCommand(commands, parts);
        }
        if (command1) {
            return command1.call(tpl, scope, option, buffer, line);
        } else {
            error = 'in file: ' + tpl.name + ' can not call: ' + parts.join('.') + '" at line ' + line;
        }
        if (resolveInScope) {
            caller = scope.resolve(parts.slice(0, -1), depth);
            fn = caller[parts[parts.length - 1]];
            if (fn) {
                return fn.apply(caller, option.params);
            }
        }
        if (error) {
            S.error(error);
        }
        return buffer;
    }

    var utils = {
        callFn: function (tpl, scope, option, buffer, parts, depth, line) {
            return callFn(tpl, scope, option, buffer, parts, depth, line, true);
        },
        callCommand: function (tpl, scope, option, buffer, parts, line) {
            return callFn(tpl, scope, option, buffer, parts, 0, line, true);
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
    function XTemplateRuntime(fn, config) {
        var self = this;
        self.fn = fn;
        config = config || {};
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

    var subNameResolveCache = {};

    function resolve(subName, parentName) {
        if (subName.charAt(0) !== '.') {
            return subName;
        }
        if (!parentName) {
            var error = 'parent template does not have name' +
                ' for relative sub tpl name: ' + subName;
            throw new Error(error);
        }
        var cache = subNameResolveCache[parentName] = subNameResolveCache[parentName] || {};
        if (cache[subName]) {
            return cache[subName];
        }
        subName = cache[subName] = getSubNameFromParentName(parentName, subName);
        //console.log('resolve: ' + name + ' : ' + subName);
        return subName;
    }

    XTemplateRuntime.prototype = {
        constructor: XTemplateRuntime,

        Scope: Scope,

        nativeCommands: nativeCommands,

        utils: utils,

        getTplContent: function (name, callback) {
            var tpl = S.require(name,true);
            if (tpl) {
                return callback(undefined, tpl);
            } else {
                var error = 'template "' + name + '" does not exist, ' +
                    'better required or used first for performance!';
                S.log(error, 'error');
                callback(error);
            }
        },

        /**
         * get
         * @cfg {Function} loader
         * @member KISSY.XTemplate.Runtime
         */
        load: function (name, callback) {
            this.getTplContent(name, callback);
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

        include: function (subTplName, tpl, scope, buffer) {
            var self = this;
            subTplName = resolve(subTplName, tpl.name);
            return buffer.async(function (newBuffer) {
                self.load(subTplName, function (error, tplFn) {
                    if (error) {
                        newBuffer.error(error);
                    } else {
                        renderTpl({
                            root: tpl.root,
                            fn: tplFn,
                            name: subTplName,
                            session: tpl.session
                        }, scope, newBuffer);
                    }
                });
            });
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
            var fn = self.fn;
            callback = callback || function (error, ret) {
                html = ret;
            };
            var name = self.config.name;
            if (!name && fn.TPL_NAME) {
                name = fn.TPL_NAME;
            }
            var scope = new Scope(data),
                buffer = new LinkedBuffer(callback).head;
            renderTpl({
                name: name,
                fn: fn,
                session: {},
                root: self
            }, scope, buffer);
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
 *  - Expression/ConditionalOrExpression
 *  - EqualityExpression/RelationalExpression...
 *
 * 2012-09-11 yiminghe@gmail.com
 *  - 初步完成，添加 tc
 *
 * 对比 template
 *
 *  优势
 *      - 不会莫名其妙报错（with）
 *      - 更多出错信息，直接给出行号
 *      - 更容易扩展 command, sub-tpl
 *      - 支持子模板
 *      - 支持作用域链: ..\x ..\..\y
 *      - 内置 escapeHtml 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *      - 支持类似函数的嵌套命令
 *   劣势
 *      - 不支持完整 js 语法
 */