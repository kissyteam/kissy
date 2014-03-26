/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    require('util');
    var XTemplateRuntime = require('xtemplate/runtime');
    var Compiler = require('xtemplate/compiler');
    var cache = XTemplate.cache = {};

    function compile(tpl, config) {
        var fn;
        var cacheable = !config || config.cache !== false;

        if (cacheable && (fn = cache[tpl])) {
            return fn;
        }

        fn = Compiler.compileToFn(tpl, config && config.name);

        if (cacheable) {
            cache[tpl] = fn;
        }

        return fn;
    }

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
    function XTemplate(tpl, config) {
        if (typeof tpl === 'string') {
            tpl = compile(tpl, config);
        }
        XTemplate.superclass.constructor.call(this, tpl, config);
    }

    S.extend(XTemplate, XTemplateRuntime, {
    }, {
        Compiler: Compiler,

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