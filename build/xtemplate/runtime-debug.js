/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Aug 13 18:33
*/
/*
combined modules:
xtemplate/runtime
xtemplate/runtime/commands
xtemplate/runtime/scope
xtemplate/runtime/linked-buffer
*/
KISSY.add('xtemplate/runtime', [
    'util',
    'logger-manager',
    './runtime/commands',
    './runtime/scope',
    './runtime/linked-buffer'
], function (S, require, exports, module) {
    /**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
    var util = require('util');
    var LoggerManager = require('logger-manager');
    var nativeCommands = require('./runtime/commands');
    var commands = {};
    var Scope = require('./runtime/scope');
    var LinkedBuffer = require('./runtime/linked-buffer');
    function findCommand(runtimeCommands, instanceCommands, parts) {
        var name = parts[0];
        var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
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
        buffer = tpl.fn(scope, buffer);
        var extendTplName = tpl.runtime.extendTplName;    // if has extend statement, only parse
        // if has extend statement, only parse
        if (extendTplName) {
            delete tpl.runtime.extendTplName;
            buffer = tpl.root.include(extendTplName, tpl, scope, null, buffer);
        }
        return buffer.end();
    }
    function callFn(tpl, scope, option, buffer, parts, depth, line, resolveInScope) {
        var error, caller, fn, command1;
        if (!depth) {
            command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
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
            LoggerManager.error(error);
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
    var loader = {
            cache: {},
            load: function (params, callback) {
                var name = params.name;
                var cache = this.cache;
                if (cache[name]) {
                    return callback(undefined, cache[name]);
                }
                require([name], {
                    success: function (tpl) {
                        cache[name] = tpl;
                        callback(undefined, tpl);
                    },
                    error: function () {
                        var error = 'template "' + params.name + '" does not exist';
                        LoggerManager.log(error, 'error');
                        callback(error);
                    }
                });
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
    function XTemplateRuntime(fn, config) {
        var self = this;
        self.fn = fn;
        config = self.config = config || {};
        config.loader = config.loader || loader;
        this.subNameResolveCache = {};
    }
    util.mix(XTemplateRuntime, {
        loader: loader,
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
        resolve: function (subName, parentName) {
            if (subName.charAt(0) !== '.') {
                return subName;
            }
            if (!parentName) {
                var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
                LoggerManager.error(error);
            }
            var nameResolveCache = this.subNameResolveCache[parentName] = this.subNameResolveCache[parentName] || {};
            if (nameResolveCache[subName]) {
                return nameResolveCache[subName];
            }
            subName = nameResolveCache[subName] = getSubNameFromParentName(parentName, subName);
            return subName;
        },
        include: function (subTplName, tpl, scope, option, buffer) {
            var self = this;
            var parentName = tpl.name;
            var resolvedSubTplName = self.resolve(subTplName, parentName);
            return buffer.async(function (newBuffer) {
                self.config.loader.load({
                    root: self,
                    parentName: parentName,
                    originalName: subTplName,
                    name: resolvedSubTplName,
                    scope: scope,
                    option: option
                }, function (error, tplFn) {
                    if (error) {
                        newBuffer.error(error);
                    } else if (typeof tplFn === 'string') {
                        newBuffer.write(tplFn, option && option.escape).end();
                    } else {
                        renderTpl({
                            root: tpl.root,
                            fn: tplFn,
                            name: resolvedSubTplName,
                            runtime: tpl.runtime
                        }, scope, newBuffer);
                    }
                });
            });
        },
        /**
     * get result by merge data with template
     * @param data
     * @param option
     * @param callback function called
     * @return {String}
     */
        render: function (data, option, callback) {
            var html = '';
            var self = this;
            var fn = self.fn;
            if (typeof option === 'function') {
                callback = option;
                option = null;
            }
            option = option || {};
            callback = callback || function (error, ret) {
                if (error) {
                    if (!(error instanceof Error)) {
                        error = new Error(error);
                    }
                    throw error;
                }
                html = ret;
            };
            var name = self.config.name;
            if (!name && fn.TPL_NAME) {
                name = fn.TPL_NAME;
            }
            var scope = new Scope(data);
            var buffer = new XTemplateRuntime.LinkedBuffer(callback, self.config).head;
            renderTpl({
                name: name,
                fn: fn,
                runtime: { commands: option.commands },
                root: self
            }, scope, buffer);
            return html;
        }
    };
    XTemplateRuntime.Scope = Scope;
    XTemplateRuntime.LinkedBuffer = LinkedBuffer;
    module.exports = XTemplateRuntime;    /**
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
});


KISSY.add('xtemplate/runtime/commands', [
    './scope',
    'util'
], function (S, require, exports, module) {
    /**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */
    var Scope = require('./scope');
    var util = require('util');
    var commands = {
            // range(start, stop, [step])
            range: function (scope, option) {
                var params = option.params;
                var start = params[0];
                var end = params[1];
                var step = params[2];
                if (!step) {
                    step = start > end ? -1 : 1;
                } else if (start > end && step > 0 || start < end && step < 0) {
                    step = -step;
                }
                var ret = [];
                for (var i = start; start < end ? i < end : i > end; i += step) {
                    ret.push(i);
                }
                return ret;
            },
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
                    if (util.isArray(param0)) {
                        xcount = param0.length;
                        for (var xindex = 0; xindex < xcount; xindex++) {
                            opScope = new Scope(param0[xindex]);
                            affix = opScope.affix = { xcount: xcount };
                            affix[xindexName] = xindex;
                            if (valueName) {
                                affix[valueName] = param0[xindex];
                            }
                            opScope.setParent(scope);
                            buffer = option.fn(opScope, buffer);
                        }
                    } else {
                        for (var name in param0) {
                            opScope = new Scope(param0[name]);
                            affix = opScope.affix = {};
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
                    var fn = option.fn;
                    if (fn) {
                        buffer = fn(scope, buffer);
                    }
                } else {
                    var matchElseIf = false;
                    var elseIfs = option.elseIfs;
                    var inverse = option.inverse;
                    if (elseIfs) {
                        for (var i = 0, len = elseIfs.length; i < len; i++) {
                            var elseIf = elseIfs[i];
                            matchElseIf = elseIf.test(scope);
                            if (matchElseIf) {
                                buffer = elseIf.fn(scope, buffer);
                                break;
                            }
                        }
                    }
                    if (!matchElseIf && inverse) {
                        buffer = inverse(scope, buffer);
                    }
                }
                return buffer;
            },
            // lhs does not support property reference
            // only create or set at current scope
            // {{set( x[1] = 2 )}}
            set: function (scope, option, buffer) {
                scope.mix(option.hash);
                return buffer;
            },
            include: function (scope, option, buffer) {
                var params = option.params, i, newScope, l = params.length;
                newScope = scope;    // sub template scope
                // sub template scope
                if (option.hash) {
                    newScope = new Scope(option.hash);
                    newScope.setParent(scope);
                }
                for (i = 0; i < l; i++) {
                    buffer = this.root.include(params[i], this, newScope, option, buffer);
                }
                return buffer;
            },
            parse: function (scope, option, buffer) {
                // abandon scope
                return commands.include.call(this, new Scope(), option, buffer);
            },
            extend: function (scope, option, buffer) {
                this.runtime.extendTplName = option.params[0];
                return buffer;
            },
            block: function (scope, option, buffer) {
                var self = this;
                var runtime = self.runtime;
                var params = option.params;
                var blockName = params[0];
                var type;
                if (params.length === 2) {
                    type = params[0];
                    blockName = params[1];
                }
                var blocks = runtime.blocks = runtime.blocks || {};
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
                if (!runtime.extendTplName) {
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
            macro: function (scope, option, buffer, lineNumber) {
                var hash = option.hash;
                var params = option.params;
                var macroName = params[0];
                var params1 = params.slice(1);
                var self = this;
                var runtime = self.runtime;
                var macros = runtime.macros = runtime.macros || {};    // definition
                // definition
                if (option.fn) {
                    macros[macroName] = {
                        paramNames: params1,
                        hash: hash,
                        fn: option.fn
                    };
                } else {
                    var macro = macros[macroName];
                    var paramValues = macro.hash || {};
                    var paramNames;
                    if (macro && (paramNames = macro.paramNames)) {
                        for (var i = 0, len = paramNames.length; i < len; i++) {
                            var p = paramNames[i];
                            paramValues[p] = params1[i];
                        }
                        if (hash) {
                            for (var h in hash) {
                                paramValues[h] = hash[h];
                            }
                        }
                        var newScope = new Scope(paramValues);    // no caller Scope
                        // no caller Scope
                        buffer = macro.fn.call(self, newScope, buffer);
                    } else {
                        var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + lineNumber;
                        throw new Error(error);
                    }
                }
                return buffer;
            }
        };
    if ('@DEBUG@') {
        commands['debugger'] = function () {
            util.globalEval('debugger');
        };
    }
    module.exports = commands;
});
KISSY.add('xtemplate/runtime/scope', [], function (S, require, exports, module) {
    /**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
    var undef;
    function Scope(data) {
        // {}
        if (arguments.length) {
            this.data = data;
        } else {
            this.data = {};
        }    // {xindex}
        // {xindex}
        this.affix = undef;
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
            var affix = this.affix;
            if (!affix) {
                affix = this.affix = {};
            }
            for (var name in v) {
                affix[name] = v[name];
            }
        },
        get: function (name) {
            var data = this.data;
            var v;
            var affix = this.affix;
            v = affix && affix[name];
            if (v !== undef) {
                return v;
            }
            if (data !== undef && data !== null) {
                v = data[name];
            }
            if (v !== undef) {
                return v;
            }
            if (name === 'this') {
                return data;
            } else if (name === 'root') {
                return this.root.data;
            }
            return v;
        },
        resolve: function (parts, depth) {
            var self = this;
            var v;
            if (!depth && parts.length === 1) {
                v = self.get(parts[0]);
                if (v !== undef) {
                    return v;
                } else {
                    depth = 1;
                }
            }
            var len = parts.length, scope = self, i;    // root keyword for root self
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
            if (!scope) {
                return undef;
            }
            if (!len) {
                return scope.data;
            }
            var part0 = parts[0];
            do {
                v = scope.get(part0);
            } while (v === undef && (scope = scope.parent));
            if (v && scope) {
                for (i = 1; v && i < len; i++) {
                    v = v[parts[i]];
                }
                return v;
            } else {
                return undef;
            }
        }
    };
    module.exports = Scope;
});
KISSY.add('xtemplate/runtime/linked-buffer', ['util'], function (S, require, exports, module) {
    /**
 * LinkedBuffer of generate content from xtemplate
 * @author yiminghe@gmail.com
 */
    var undef;
    var util = require('util');
    function Buffer(list) {
        this.list = list;
        this.init();
    }
    Buffer.prototype = {
        constructor: Buffer,
        isBuffer: 1,
        init: function () {
            this.data = '';
        },
        append: function (data) {
            this.data += data;
        },
        write: function (data, escape) {
            if (data || data === 0) {
                this.append(escape ? util.escapeHtml(data) : data);
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
    function LinkedBuffer(callback, config) {
        var self = this;
        self.config = config;
        self.head = new Buffer(self);
        self.callback = callback;
        this.init();
    }
    LinkedBuffer.prototype = {
        constructor: LinkedBuffer,
        init: function () {
            this.data = '';
        },
        append: function (data) {
            this.data += data;
        },
        end: function () {
            this.callback(null, this.data);
        },
        flush: function () {
            var self = this;
            var fragment = self.head;
            while (fragment) {
                if (fragment.ready) {
                    this.append(fragment.data);
                } else {
                    return;
                }
                fragment = fragment.next;
                self.head = fragment;
            }
            self.end();
        }
    };
    LinkedBuffer.Buffer = Buffer;
    module.exports = LinkedBuffer;    /**
 * 2014-06-19 yiminghe@gmail.com
 * string concat is faster than array join: 85ms<-> 131ms
 */
});
