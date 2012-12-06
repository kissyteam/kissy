/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', function (S, XTemplateRuntime, commands, includeCommand) {

    /**
     * add command to all template
     * @method
     * @static
     * @param {String} commandName
     * @param {Function} fn
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.addCommand = function (commandName, fn) {
        commands[commandName] = fn;
    };

    /**
     * remove command from all template by name
     * @method
     * @static
     * @param {String} commandName
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.removeCommand = function (commandName) {
        delete commands[commandName];
    };

    XTemplateRuntime.commands = commands;

    XTemplateRuntime.includeCommand = includeCommand;

    var subTpls = {};

    XTemplateRuntime.subTpls = subTpls;

    /**
     * add sub template definition to all template
     * @method
     * @static
     * @param {String} tplName
     * @param {Function|String} def
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.addSubTpl = function (tplName, def) {
        subTpls[tplName] = def;
    };

    /**
     * remove sub template definition from all template by name
     * @method
     * @static
     * @param {String} tplName
     * @member KISSY.XTemplate.Runtime
     */
    XTemplateRuntime.removeSubTpl = function (tplName) {
        delete  subTpls[tplName];
    };

    // can only include compiled sub template
    XTemplateRuntime.IncludeEngine = XTemplateRuntime;

    return XTemplateRuntime;
}, {
    requires: ['./runtime/base', './runtime/commands', './runtime/include-command']
});

/**
 * @ignore
 *
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