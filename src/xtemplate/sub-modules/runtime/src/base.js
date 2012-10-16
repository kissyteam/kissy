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
});