/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 29 15:13
*/
/*
combined modules:
xtemplate/runtime
xtemplate/runtime/commands
xtemplate/runtime/scope
xtemplate/runtime/linked-buffer
*/
/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', [
    'util',
    './runtime/commands',
    './runtime/scope',
    './runtime/linked-buffer'
], function (S, require) {
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
    function renderTpl(self, scope, buffer, payload) {
        var tpl = self.tpl;
        payload = payload || {};
        payload.extendTplName = null;
        if (tpl.TPL_NAME && !self.name) {
            self.name = tpl.TPL_NAME;
        }
        buffer = tpl.call(self, scope, buffer, payload);
        var extendTplName = payload.extendTplName;    // if has extend statement, only parse
        // if has extend statement, only parse
        if (extendTplName) {
            buffer = self.include(extendTplName, scope, buffer, payload);
        }
        return buffer.end();
    }
    function callFn(engine, scope, option, buffer, parts, depth, line, resolveInScope) {
        var commands = engine.config.commands;
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
        };    /**
     * template file name for chrome debug
     *
     * @cfg {Boolean} name
     * @member KISSY.XTemplate.Runtime
     */
              /**
     * XTemplate runtime. only accept tpl as function.
     * @class KISSY.XTemplate.Runtime
     */
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
        config = config || {};    // can not shared between config
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
         * get
         * @cfg {Function} loader
         * @member KISSY.XTemplate.Runtime
         */
        load: function (subTplName, callback) {
            var tpl = S.require(subTplName);
            if (tpl) {
                callback(undefined, tpl);
            } else {
                var warning = 'template "' + subTplName + '" does not exist, ' + 'better required or used first for performance!';
                S.log(warning, 'error');
                callback(warning, undefined);
            }
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
            var self = this;
            var myName = self.name;
            if (subTplName.charAt(0) === '.') {
                if (!myName) {
                    var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subTplName;
                    throw new Error(error);
                }
                subTplName = getSubNameFromParentName(myName, subTplName);
            }
            return buffer.async(function (newBuffer) {
                self.load(subTplName, function (error, engine) {
                    if (error) {
                        newBuffer.error(error);
                    } else {
                        if (!(engine instanceof XTemplateRuntime)) {
                            engine = new self.constructor(engine, self.config);
                            engine.name = subTplName;
                        }
                        renderTpl(engine, scope, newBuffer, payload);
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
            if (!self.name && self.tpl.TPL_NAME) {
                self.name = self.tpl.TPL_NAME;
            }
            var scope = new Scope(data), buffer = new LinkedBuffer(callback).head;
            renderTpl(self, scope, buffer);
            return html;
        }
    };
    XTemplateRuntime.Scope = Scope;
    return XTemplateRuntime;
});    /**
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

/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime/commands', ['./scope'], function (S, require) {
    var Scope = require('./scope');
    var commands = {
            each: function (scope, option, buffer) {
                var params = option.params;
                var param0 = params[0];
                var xindexName = params[2] || 'xindex';
                var valueName = params[1];
                var xcount;
                var opScope;
                var affix;    // if undefined, will emit warning by compiler
                // if undefined, will emit warning by compiler
                if (param0) {
                    if (S.isArray(param0)) {
                        xcount = param0.length;
                        for (var xindex = 0; xindex < xcount; xindex++) {
                            opScope = new Scope();
                            affix = opScope.affix = { xcount: xcount };    // two more variable scope for array looping
                            // two more variable scope for array looping
                            opScope.data = param0[xindex];
                            affix[xindexName] = xindex;
                            if (valueName) {
                                affix[valueName] = param0[xindex];
                            }
                            opScope.setParent(scope);
                            buffer = option.fn(opScope, buffer);
                        }
                    } else {
                        for (var name in param0) {
                            opScope = new Scope();
                            affix = opScope.affix = {};
                            opScope.data = param0[name];
                            affix[xindexName] = name;
                            if (valueName) {
                                affix[valueName] = param0[name];
                            }
                            opScope.setParent(scope);
                            buffer = option.fn(opScope, buffer);
                        }
                    }
                }
                return buffer;
            },
            'with': function (scope, option, buffer) {
                var params = option.params;
                var param0 = params[0];
                if (param0) {
                    // skip object check for performance
                    var opScope = new Scope(param0);
                    opScope.setParent(scope);
                    buffer = option.fn(opScope, buffer);
                }
                return buffer;
            },
            'if': function (scope, option, buffer) {
                var params = option.params;
                var param0 = params[0];
                if (param0) {
                    if (option.fn) {
                        buffer = option.fn(scope, buffer);
                    }
                } else if (option.inverse) {
                    buffer = option.inverse(scope, buffer);
                }
                return buffer;
            },
            // lhs does not support property reference
            // {{set( x[1] = 2 )}}
            set: function (scope, option, buffer) {
                scope.mix(option.hash);
                return buffer;
            },
            include: function (scope, option, buffer, lineNumber, payload) {
                var params = option.params, i, newScope, l = params.length;
                newScope = scope;    // sub template scope
                // sub template scope
                if (option.hash) {
                    newScope = new Scope(option.hash);
                    newScope.setParent(scope);
                }
                for (i = 0; i < l; i++) {
                    buffer = this.include(params[i], newScope, buffer, payload);
                }
                return buffer;
            },
            parse: function (scope, option, buffer, lineNumber, payload) {
                // abandon scope
                return commands.include.call(this, new Scope(), option, buffer, payload);
            },
            extend: function (scope, option, buffer, lineNumber, payload) {
                payload.extendTplName = option.params[0];
                return buffer;
            },
            block: function (scope, option, buffer, lineNumber, payload) {
                var self = this;
                var params = option.params;
                var blockName = params[0];
                var type;
                if (params.length === 2) {
                    type = params[0];
                    blockName = params[1];
                }
                var blocks = payload.blocks = payload.blocks || {};
                var head = blocks[blockName], cursor;
                var current = {
                        fn: option.fn,
                        type: type
                    };
                if (!head) {
                    blocks[blockName] = current;
                } else if (head.type) {
                    if (head.type === 'append') {
                        current.next = head;
                        blocks[blockName] = current;
                    } else if (head.type === 'prepend') {
                        var prev;
                        cursor = head;
                        while (cursor && cursor.type === 'prepend') {
                            prev = cursor;
                            cursor = cursor.next;
                        }
                        current.next = cursor;
                        prev.next = current;
                    }
                }
                if (!payload.extendTplName) {
                    cursor = blocks[blockName];
                    while (cursor) {
                        if (cursor.fn) {
                            buffer = cursor.fn.call(self, scope, buffer);
                        }
                        cursor = cursor.next;
                    }
                }
                return buffer;
            },
            macro: function (scope, option, buffer, lineNumber, payload) {
                var params = option.params;
                var macroName = params[0];
                var params1 = params.slice(1);
                var self = this;
                var macros = payload.macros = payload.macros || {};    // definition
                // definition
                if (option.fn) {
                    macros[macroName] = {
                        paramNames: params1,
                        fn: option.fn
                    };
                } else {
                    var paramValues = {};
                    var macro = macros[macroName];
                    var paramNames;
                    if (macro && (paramNames = macro.paramNames)) {
                        for (var i = 0, len = paramNames.length; i < len; i++) {
                            var p = paramNames[i];
                            paramValues[p] = params1[i];
                        }
                        var newScope = new Scope(paramValues);    // no caller Scope
                        // no caller Scope
                        buffer = macro.fn.call(self, newScope, buffer);
                    } else {
                        var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
                        S.error(error);
                    }
                }
                return buffer;
            }
        };
    if ('@DEBUG@') {
        commands['debugger'] = function () {
            S.globalEval('debugger');
        };
    }
    return commands;
});
/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/runtime/scope', [], function (S) {
    function Scope(data, affix) {
        // {}
        this.data = data || {};    // {xindex}
        // {xindex}
        this.affix = affix;
        this.root = this;
    }
    Scope.prototype = {
        isScope: 1,
        setParent: function (parentScope) {
            this.parent = parentScope;
            this.root = parentScope.root;
        },
        // keep original data unmodified
        set: function (name, value) {
            if (!this.affix) {
                this.affix = {};
            }
            this.affix[name] = value;
        },
        setData: function (data) {
            this.data = data;
        },
        getData: function () {
            return this.data;
        },
        mix: function (v) {
            if (!this.affix) {
                this.affix = {};
            }
            S.mix(this.affix, v);
        },
        get: function (name) {
            var data = this.data;
            var v = data && data[name];
            if (v !== undefined) {
                return v;
            }
            var affix = this.affix;
            if (affix && name in affix) {
                return affix[name];
            }
            if (name === 'this') {
                return data;
            }
            if (name === 'root') {
                return this.root.data;
            }
            return v;
        },
        resolve: function (parts, depth) {
            var self = this;
            if (!depth && parts.length === 1) {
                return self.get(parts[0]);
            }
            var len = parts.length, i, v;
            var scope = self;    // root keyword for root self
            // root keyword for root self
            if (len && parts[0] === 'root') {
                parts.shift();
                scope = scope.root;
                len--;
            } else if (depth) {
                while (scope && depth--) {
                    scope = scope.parent;
                }
            }
            if (!len) {
                return scope.data;
            }
            var part0 = parts[0];
            do {
                v = scope.get(part0);
            } while (v === undefined && (scope = scope.parent));
            if (v && scope) {
                for (i = 1; v && i < len; i++) {
                    v = v[parts[i]];
                }
                return v;
            } else {
                return undefined;
            }
        }
    };
    return Scope;
});
/**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/runtime/linked-buffer', [], function (S) {
    var undef;
    function Buffer(list) {
        this.list = list;
        this.data = '';
    }
    Buffer.prototype = {
        constructor: Buffer,
        isBuffer: 1,
        write: function (data, escape) {
            if (data || data === 0) {
                this.data += escape ? S.escapeHtml(data) : data;
            }
            return this;
        },
        async: function (fn) {
            var self = this;
            var list = self.list;
            var asyncFragment = new Buffer(list);
            var nextFragment = new Buffer(list);
            nextFragment.next = self.next;
            asyncFragment.next = nextFragment;
            self.next = asyncFragment;
            self.ready = true;
            fn(asyncFragment);
            return nextFragment;
        },
        error: function (reason) {
            var callback = this.list.callback;
            if (callback) {
                callback(reason, undef);
                this.list.callback = null;
            }
        },
        end: function (data, escape) {
            var self = this;
            if (self.list.callback) {
                self.write(data, escape);
                self.ready = true;
                self.list.flush();
            }
            return self;
        }
    };
    function LinkedBuffer(callback) {
        var self = this;
        self.head = new Buffer(self);
        self.callback = callback;
        self.data = '';
    }
    LinkedBuffer.prototype = {
        constructor: LinkedBuffer,
        flush: function () {
            var self = this;
            var fragment = self.head;
            while (fragment) {
                if (fragment.ready) {
                    self.data += fragment.data;
                } else {
                    return;
                }
                fragment = fragment.next;
                self.head = fragment;
            }
            self.callback(null, self.data);
        }
    };
    LinkedBuffer.Buffer = Buffer;
    return LinkedBuffer;
});
