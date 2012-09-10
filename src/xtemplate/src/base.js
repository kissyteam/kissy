/**
 * setup xtemplate constructor
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/base', function (S, compiler) {

    var cache = {};

    function XTemplate(tpl, option) {
        this.tpl = tpl;
        this.subTpls = S.merge(option.subTpls, XTemplate.subTpls);
        this.commands = S.merge(option.commands, XTemplate.commands);
    }

    XTemplate.prototype = {
        constructor: XTemplate,
        removeSubTpl: function (subTplName) {
            delete this.subTpls[subTplName];
        },
        removeCommand: function (commandName) {
            delete this.commands[commandName];
        },
        addSubTpl: function (subTplName, def) {
            this.subTpls[subTplName] = def;
        },
        addCommand: function (commandName, fn) {
            this.commands[commandName] = fn;
        },
        render: function (data) {
            if (!this.compiled) {
                if (S.isFunction(this.tpl)) {
                } else {
                    this.tpl = cache[this.tpl] ||
                        (cache[this.tpl] = new Function(compiler.compile(this.tpl)));
                }
                this.compiled = 1;
            }
            if (!S.isArray(data)) {
                data = [data];
            }
            return this.tpl(data, {
                commands: this.commands,
                subTpls: this.subTpls
            })
        }
    };

    return XTemplate;
}, {
    requires: ['./compiler']
});