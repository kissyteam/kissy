/*
Copyright 2012, KISSY UI Library v1.40dev
MIT Licensed
build time: Dec 6 20:34
*/
/**
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */
KISSY.add('xtemplate/facade', function (S, XTemplateRuntime, compiler) {

    var cache = XTemplate.cache = {};

    function compile(tpl, option) {
        var fn;

        if (option.cache && (fn = cache[tpl])) {
            return fn;
        }

        fn = compiler.compileToFn(tpl, option);

        if (option.cache) {
            cache[tpl] = fn;
        }

        return fn;
    }

    // allow str sub template
    XTemplateRuntime.includeCommand.invokeEngine = function (tpl, scopes, option) {
        return new XTemplate(tpl, S.merge(option)).render(scopes);
    };

    var defaultCfg = {
        cache: true
    };

    function XTemplate(tpl, option) {
        var self = this;
        option = S.merge(defaultCfg, option);
        if (typeof tpl == 'string') {
            // prevent messing up with velocity
            tpl = tpl.replace(/\{\{@/g, '{{#');
            tpl = compile(tpl, option);
        }
        self.option = option;
        self.tpl = tpl;
        self.runtime = new XTemplateRuntime(tpl, option);
    }

    S.augment(XTemplate, {
        'removeSubTpl': function (subTplName) {
            this.runtime.removeSubTpl(subTplName);
        },
        'removeCommand': function (commandName) {
            this.runtime.removeCommand(commandName);
        },
        addSubTpl: function (subTplName, def) {
            this.runtime.addSubTpl(subTplName, def);
        },
        addCommand: function (commandName, fn) {
            this.runtime.addCommand(commandName, fn);
        },
        render: function (data) {
            return this.runtime.render(data);
        }
    });

    XTemplate.compiler = compiler;

    XTemplate.RunTime = XTemplateRuntime;

    XTemplate.addCommand = XTemplateRuntime.addCommand;

    XTemplate.addSubTpl = XTemplateRuntime.addSubTpl;

    XTemplate.removeCommand = XTemplateRuntime.removeCommand;

    XTemplate.removeSubTpl = XTemplateRuntime.removeSubTpl;

    return XTemplate;

}, {
    requires: ['./runtime', './compiler']
});
