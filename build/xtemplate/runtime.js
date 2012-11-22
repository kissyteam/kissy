/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Nov 22 17:47
*/
/**
 * xtemplate base
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/runtime/base', function (S) {

    var guid = 0;

    var cache = {};

    var defaultConfig = {
        cache: true,
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

    function XTemplate(tpl, option) {
        var self = this;
        // prevent messing up with velocity
        if (typeof tpl == 'string') {
            tpl = tpl.replace(/\{\{@/g, '{{#');
        }
        self.tpl = tpl;
        option = S.merge(defaultConfig, option);
        option.subTpls = S.merge(option.subTpls, XTemplate.subTpls);
        option.commands = S.merge(option.commands, XTemplate.commands);
        this.option = option;
    }

    XTemplate.prototype = {
        constructor: XTemplate,
        'removeSubTpl': function (subTplName) {
            delete this.option.subTpls[subTplName];
        },
        'removeCommand': function (commandName) {
            delete this.option.commands[commandName];
        },
        addSubTpl: function (subTplName, def) {
            this.option.subTpls[subTplName] = def;
        },
        addCommand: function (commandName, fn) {
            this.option.commands[commandName] = fn;
        },
        __compile: function () {
            var self = this,
                option = self.option,
                compiler = S.require('xtemplate/compiler'),
                tpl = self.tpl;

            if (!compiler) {
                S.error('you have to use/require xtemplate/compiler first!');
                return null;
            }

            var code = compiler.compile(tpl);
            // eval is not ok for eval("(function(){})") ie
            return (Function.apply(null, []
                .concat(code.params)
                .concat(code.source.join('\n') + '//@ sourceURL=' +
                (option.name ? option.name : ('xtemplate' + (guid++))) + '.js')));
        },
        compile: function () {
            var self = this,
                tpl = self.tpl,
                option = self.option;
            if (!self.compiled) {
                if (S.isFunction(tpl)) {
                } else if (option.cache) {
                    self.tpl = cache[tpl] || (cache[tpl] = self.__compile());
                } else {
                    self.tpl = self.__compile();
                }
                self.compiled = !!self.tpl;
            }
            return self.tpl;
        },
        render: function (data) {
            var self = this;
            self.compile();
            if (!S.isArray(data)) {
                data = [data];
            }
            return self.tpl(data, self.option);
        }
    };

    return XTemplate;
});/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/runtime/commands", function (S, XTemplate) {

    return {
        'each': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('each must has one param');
            }
            var param0 = params[0];
            var buffer = '';
            var xcount;
            var single;
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
                throw new Error('each can only apply to array');
            }
            return buffer;
        },

        'with': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('with must has one param');
            }
            var param0 = params[0];
            var opScopes = [0].concat(scopes);
            var buffer = '';
            if (S.isObject(param0)) {
                opScopes[0] = param0;
                buffer = option.fn(opScopes);
            } else {
                S.log(param0, 'error');
                throw new Error('with can only apply to object');
            }
            return buffer;
        },

        'if': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('if must has one param');
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

        'include': function (scopes, option) {
            var params = option.params;
            if (!params || params.length != 1) {
                throw new Error('include must has one param');
            }
            var param0 = params[0], tpl;
            var subTpls = option.subTpls;
            if (!(tpl = subTpls[param0])) {
                throw new Error('does not include sub template "' + param0 + '"');
            }
            return new XTemplate(tpl, {
                cache: option.cache,
                commands: option.commands,
                subTpls: option.subTpls
            }).render(scopes);
        }
    };

}, {
    requires: ['./base']
});/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/runtime', function (S, XTemplate, commands) {

    XTemplate.addCommand = function (commandName, fn) {
        commands[commandName] = fn;
    };

    XTemplate.commands = commands;

    var subTpls = {};

    XTemplate.subTpls = subTpls;

    XTemplate.addSubTpl = function (tplName, def) {
        subTpls[tplName] = def;
    };

    return XTemplate;
}, {
    requires: ['./runtime/base', './runtime/commands']
});

/**
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
