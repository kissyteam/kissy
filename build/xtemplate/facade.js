/*
Copyright 2013, KISSY UI Library v1.30
MIT Licensed
build time: Feb 28 18:33
*/
/**
 * @ignore
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
        return new XTemplate(tpl, S.merge(option)).render(scopes, true);
    };

    var defaultCfg = {
        cache: true
    };

    /**
     * xtemplate engine for KISSY.
     *
     *      @example
     *      new XTemplate(tplString, config);
     *      // or
     *      new XTemplate(tplFunction, config);
     *
     * @class KISSY.XTemplate
     */
    function XTemplate(tpl, option) {
        /**
         * whether cache template string
         * @cfg {Boolean} cache
         */
        var self = this;
        option = S.merge(defaultCfg, option);
        if (typeof tpl == 'string') {
            tpl = compile(tpl, option);
        }
        self.option = option;
        self.tpl = tpl;
        self.runtime = new XTemplateRuntime(tpl, option);
    }

    S.augment(XTemplate, {
        /**
         * remove sub template by name
         * @param subTplName
         */
        'removeSubTpl': function (subTplName) {
            this.runtime.removeSubTpl(subTplName);
        },
        /**
         * remove command by name
         * @param commandName
         */
        'removeCommand': function (commandName) {
            this.runtime.removeCommand(commandName);
        },
        /**
         * add sub template definition to current template
         * @param subTplName
         * @param {String|Function}def
         */
        addSubTpl: function (subTplName, def) {
            this.runtime.addSubTpl(subTplName, def);
        },
        /**
         * add command definition to current template
         * @param commandName
         * @param {Function} fn command definition
         */
        addCommand: function (commandName, fn) {
            this.runtime.addCommand(commandName, fn);
        },
        /**
         * get result by merge data with template
         * @param data
         * @return {String}
         */
        render: function (data) {
            return this.runtime.render.apply(this.runtime, arguments);
        }
    });

    XTemplate.compiler = compiler;

    XTemplate.RunTime = XTemplateRuntime;

    /**
     * add command to all template
     * @method
     * @static
     * @param {String} commandName
     * @param {Function} fn
     */
    XTemplate.addCommand = XTemplateRuntime.addCommand;

    /**
     * add sub template definition to all template
     * @method
     * @static
     * @param {String} subName
     * @param {Function|String} def
     */
    XTemplate.addSubTpl = XTemplateRuntime.addSubTpl;

    /**
     * remove command from all template by name
     * @method
     * @static
     * @param {String} commandName
     */
    XTemplate.removeCommand = XTemplateRuntime.removeCommand;

    /**
     * remove sub template definition from all template by name
     * @method
     * @static
     * @param {String} subName
     */
    XTemplate.removeSubTpl = XTemplateRuntime.removeSubTpl;

    return XTemplate;

}, {
    requires: ['./runtime', './compiler']
});
