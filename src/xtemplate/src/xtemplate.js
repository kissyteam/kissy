/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var XTemplateRuntime = require('xtemplate/runtime');
    var compiler = require('xtemplate/compiler');
    var cache = XTemplate.cache = {};

    /*
     *whether cache template string
     * @member KISSY.XTemplate
     * @cfg {Boolean} cache.
     * Defaults to true.
     */

    /**
     * xtemplate engine for KISSY.
     *
     *
     *      @example
     *      KISSY.use('xtemplate',function(S, XTemplate){
     *          document.writeln(new XTemplate('{{title}}').render({title:2}));
     *      });
     *
     *
     * @class KISSY.XTemplate
     * @extends KISSY.XTemplate.Runtime
     */
    function XTemplate() {
        XTemplate.superclass.constructor.apply(this, arguments);
    }

    S.extend(XTemplate, XTemplateRuntime, {
        compile: function () {
            var fn,
                self = this,
                config = self.config,
                tpl = self.tpl;

            if (config.cache !== false && (fn = cache[tpl])) {
                return fn;
            }

            fn = compiler.compileToFn(tpl, self.name);

            if (config.cache !== false) {
                cache[tpl] = fn;
            }

            return fn;
        },

        render: function () {
            var self = this;
            if (!self.compiled) {
                self.compiled = 1;
                var tpl = self.tpl;
                if (typeof tpl === 'string') {
                    self.tpl = self.compile();
                }
            }
            return XTemplate.superclass.render.apply(self, arguments);
        }
    }, {
        compiler: compiler,

        Scope: XTemplateRuntime.Scope,

        RunTime: XTemplateRuntime,

        /**
         * add command to all template
         * @method
         * @static
         * @param {String} commandName
         * @param {Function} fn
         */
        addCommand: XTemplateRuntime.addCommand,

        /**
         * remove command from all template by name
         * @method
         * @static
         * @param {String} commandName
         */
        removeCommand: XTemplateRuntime.removeCommand
    });

    return XTemplate;
});

/*
 It consists three modules:

 -   xtemplate - Both compiler and runtime functionality.
 -   xtemplate/compiler - Compiler string template to module functions.
 -   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
 or template functions.

 xtemplate/compiler depends on xtemplate/runtime,
 because compiler needs to know about runtime to generate corresponding codes.
 */