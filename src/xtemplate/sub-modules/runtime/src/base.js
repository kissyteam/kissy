/**
 * xtemplate base
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/runtime/base', function (S) {

    var defaultConfig = {
        // whether throw exception => '{{title}}'.render({t2:0})
        silent: true,
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

    function XTemplateRuntime(tpl, option) {
        var self = this;
        self.tpl = tpl;
        option = S.merge(defaultConfig, option);
        option.subTpls = S.merge(option.subTpls, XTemplateRuntime.subTpls);
        option.commands = S.merge(option.commands, XTemplateRuntime.commands);
        this.option = option;
    }

    XTemplateRuntime.prototype = {
        constructor: XTemplateRuntime,
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
        render: function (data) {
            var self = this;
            if (!S.isArray(data)) {
                data = [data];
            }
            return self.tpl(data, self.option);
        }
    };

    return XTemplateRuntime;
});