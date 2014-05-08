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
    var pool = require('./runtime/pool');

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

    function renderTpl(self, scope, buffer, session) {
        var tpl = self.tpl;
        session.extendTplName = null;
        if (tpl.TPL_NAME && !self.name) {
            self.name = tpl.TPL_NAME;
        }
        buffer = tpl.call(self, scope, buffer, session);
        var extendTplName = session.extendTplName;
        // if has extend statement, only parse
        if (extendTplName) {
            buffer = self.include(extendTplName, scope, buffer, session);
        }
        return buffer.end();
    }

    function callFn(engine, scope, option, buffer, parts, depth, line, resolveInScope) {
        var commands = engine.getRoot().config.commands;
        var error, caller, fn;
        var command1;
        if (!depth) {
            command1 = findCommand(commands, parts);
        }
        if (command1) {
            return command1.call(engine, scope, option, buffer, line);
        } else {
            error = 'in file: ' + engine.name + ' can not call: ' + parts.join('.') + '" at line ' + line;
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
        callFn: function (engine, scope, option, buffer, parts, depth, line) {
            return callFn(engine, scope, option, buffer, parts, depth, line, true);
        },
        callCommand: function (engine, scope, option, buffer, parts, line) {
            return callFn(engine, scope, option, buffer, parts, 0, line, true);
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
        self.name = config.name;
        self.config = config;
        self.subNameResolveCache = {};
        config.root = config.root || self;
    }

    S.mix(XTemplateRuntime, {
        nativeCommands: nativeCommands,

        pool: pool,

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

        getRoot: function () {
            return this.config.root;
        },

        resolve: function (subName) {
            if (subName.charAt(0) !== '.') {
                return subName;
            }
            var cache = this.subNameResolveCache;
            if (cache[subName]) {
                return cache[subName];
            }
            var name = this.name;
            if (!name) {
                var error = 'parent template does not have name' +
                    ' for relative sub tpl name: ' + subName;
                throw new Error(error);
            }
            subName = cache[subName] = getSubNameFromParentName(name, subName);
            //console.log('resolve: ' + name + ' : ' + subName);
            return subName;
        },

        loadContent: function (subTplName, callback) {
            var tpl = S.require(subTplName);
            if (tpl) {
                callback(undefined, tpl);
            } else {
                var warning = 'template "' + subTplName + '" does not exist, ' +
                    'better required or used first for performance!';
                S.log(warning, 'error');
                callback(warning, undefined);
            }
        },

        /**
         * get
         * @cfg {Function} loader
         * @member KISSY.XTemplate.Runtime
         */
        load: function (subTplName, session, callback) {
            var self = this,
                engine,
                cache = self.getRoot().config.cache;
            if (cache !== false && pool.hasInstance(subTplName)) {
                engine = pool.getInstance(undefined, {
                    name: subTplName,
                    root: self.getRoot()
                }, self.constructor);
                session.descendants.push(engine);
                return callback(undefined, engine);
            }
            self.loadContent(subTplName, function (error, tpl) {
                if (error) {
                    callback(error);
                } else {
                    var engine;
                    if (cache !== false) {
                        engine = pool.getInstance(tpl, {
                            name: subTplName,
                            root: self.getRoot()
                        }, self.constructor);
                        session.descendants.push(engine);
                    } else {
                        engine = new self.constructor(tpl, {
                            name: subTplName,
                            root: self.getRoot()
                        });
                    }
                    callback(undefined, engine);
                }
            });
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

        include: function (subTplName, scope, buffer, session) {
            var self = this;
            subTplName = self.resolve(subTplName);
            return buffer.async(function (newBuffer) {
                self.load(subTplName, session, function (error, engine) {
                    if (error) {
                        newBuffer.error(error);
                    } else {
                        renderTpl(engine, scope, newBuffer, session);
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
            callback = callback || function (error, ret) {
                html = ret;
            };
            var session = {
                descendants: []
            };
            var finalCallback = callback;
            if (self.config.cache !== false) {
                finalCallback = function (error, ret) {
                    var len = session.descendants.length;
                    for (var i = 0; i < len; i++) {
                        pool.recycle(session.descendants[i]);
                    }
                    callback(error, ret);
                };
            }
            if (!self.name && self.tpl.TPL_NAME) {
                self.name = self.tpl.TPL_NAME;
            }
            var scope = new Scope(data),
                buffer = new LinkedBuffer(finalCallback).head;
            renderTpl(self, scope, buffer, session);
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