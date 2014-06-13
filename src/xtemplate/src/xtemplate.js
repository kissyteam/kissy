/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */

var util = require('util');
var XTemplateRuntime = require('xtemplate/runtime');
var Compiler = require('xtemplate/compiler');
var cache = XTemplate.cache = {};
var LoggerManager = require('logger-manager');

var loader = {
    load: function (template, name, callback) {
        require([name], {
            success: function (tpl) {
                if (typeof tpl === 'string') {
                    try {
                        tpl = template.compile(tpl, name);
                    } catch (e) {
                        return callback(e);
                    }
                }
                callback(undefined, tpl);
            },
            error: function () {
                var error = 'template "' + name + '" does not exist';
                LoggerManager.log(error, 'error');
                callback(error);
            }
        });
    }
};

/*
 *whether cache template string
 * @member KISSY.XTemplate
 * @cfg {Boolean} cache.
 * Defaults to true.
 */

/**
 * xtemplate engine for KISSY.
 *
 *      @example
 *      KISSY.use('xtemplate',function(S, XTemplate){
 *          document.writeln(new XTemplate('{{title}}').render({title:2}));
 *      });
 *
 * @class KISSY.XTemplate
 * @extends KISSY.XTemplate.Runtime
 */
function XTemplate(tpl, config) {
    var self = this;
    config = self.config = config || {};
    config.loader = config.loader || loader;
    if (typeof tpl === 'string') {
        tpl = self.compile(tpl, config && config.name);
    }
    XTemplate.superclass.constructor.call(self, tpl, config);
}

util.extend(XTemplate, XTemplateRuntime, {
    compile: function (tpl, name) {
        var fn,
            config = this.config;

        var cacheable = !config || config.cache !== false;

        if (cacheable && (fn = cache[tpl])) {
            return fn;
        }

        fn = Compiler.compileToFn(tpl, name);

        if (cacheable) {
            cache[tpl] = fn;
        }

        return fn;
    }
}, {
    Compiler: Compiler,

    Scope: XTemplateRuntime.Scope,

    RunTime: XTemplateRuntime,

    clearCache: function (content) {
        delete cache[content];
    },

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

module.exports = XTemplate;

/*
 It consists three modules:

 -   xtemplate - Both compiler and runtime functionality.
 -   xtemplate/compiler - Compiler string template to module functions.
 -   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
 or template functions.

 xtemplate/compiler depends on xtemplate/runtime,
 because compiler needs to know about runtime to generate corresponding codes.
 */