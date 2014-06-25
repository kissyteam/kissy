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
    var cmd = runtimeCommands && runtimeCommands[name] ||
        instanceCommands && instanceCommands[name] ||
        commands[name];
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
    var extendTplName = tpl.runtime.extendTplName;
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
    load: function (params, callback) {
        require([params.name], {
            success: function (tpl) {
                callback(undefined, tpl);
            },
            error: function () {
                var error = 'template "' + params.name + '" does not exist';
                LoggerManager.log(error, 'error');
                callback(error);
            }
        });
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
    config = self.config = config || {};
    config.loader = config.loader || loader;
    this.subNameResolveCache = {};
}

util.mix(XTemplateRuntime, {
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
            var error = 'parent template does not have name' +
                ' for relative sub tpl name: ' + subName;
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
        subTplName = self.resolve(subTplName, tpl.name);
        return buffer.async(function (newBuffer) {
            self.config.loader.load({
                template: self,
                name: subTplName,
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
                        name: subTplName,
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
        var scope = new Scope(data),
            buffer = new LinkedBuffer(callback).head;
        renderTpl({
            name: name,
            fn: fn,
            runtime: {
                commands: option.commands
            },
            root: self
        }, scope, buffer);
        return html;
    }
};

XTemplateRuntime.Scope = Scope;

module.exports = XTemplateRuntime;

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