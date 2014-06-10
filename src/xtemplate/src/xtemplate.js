/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */

var util = require('util');
var XTemplateRuntime = require('xtemplate/runtime');
var Compiler = require('xtemplate/compiler');
var cache = XTemplate.cache = {};

function compile(tpl, name, config) {
    var fn;

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
        tpl = compile(tpl, config && config.name, config);
    }
    XTemplate.superclass.constructor.call(this, tpl, config);
}

util.extend(XTemplate, XTemplateRuntime, {
    load: function (name, callback) {
        var tplModule = this.getTplContent(name, function (error, fn) {
            if (error) {
                return  callback(tplModule.error);
            } else {
                if (typeof fn === 'string') {
                    try {
                        fn = compile(fn, name, this.config);
                    } catch (e) {
                        return callback(e);
                    }
                }
                callback(undefined, fn);
            }
        });
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