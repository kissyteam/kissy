/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */
KISSY.add('xtemplate/runtime', function (S, commands) {

    var subTpls = {},

        utils = {
            'getProperty': function (parts, scopes, depth) {
                // this refer to current scope object
                if (parts == 'this' || parts == '.') {
                    if (scopes.length) {
                        return [ scopes[0] ];
                    } else {
                        return false;
                    }
                }
                parts = parts.split('.');
                var len = parts.length,
                    i,
                    j = depth || 0,
                    v,
                    p,
                    valid,
                    sl = scopes.length;
                for (; j < sl; j++) {
                    v = scopes[j];
                    valid = 1;
                    for (i = 0; i < len; i++) {
                        p = parts[i];
                        // may not be object at all
                        if (typeof v != 'object' || !(p in v)) {
                            valid = 0;
                            break;
                        }
                        v = v[p];
                    }
                    if (valid) {
                        // support property function return value as property value
                        if (typeof v == 'function') {
                            v = v.call(scopes[sl - 1]);
                        }
                        return [v];
                    }
                }
                return false;
            }
        },

        defaultConfig = {

            /**
             * whether throw exception when template variable is not found in data
             *
             * or
             *
             * command is not found
             *
             *      @example
             *      '{{title}}'.render({t2:0})
             *
             *
             * @cfg {Boolean} silent
             * @member KISSY.XTemplate.Runtime
             */
            silent: true,

            /**
             * template file name for chrome debug
             *
             * @cfg {Boolean} name
             * @member KISSY.XTemplate.Runtime
             */
            name: 'unspecified',

            /**
             * {{}} default to escapeHtml
             *
             * @cfg {Boolean} escapeHtml
             * @member KISSY.XTemplate.Runtime
             */
            escapeHtml: true

        };

    /**
     * XTemplate runtime. only accept tpl as function.
     *
     *      @example
     *      new XTemplateRuntime(tplFunction, config);
     *
     * @class KISSY.XTemplate.Runtime
     */
    function XTemplateRuntime(tpl, config) {
        var self = this;
        self.tpl = tpl;
        config = S.merge(defaultConfig, config);
        config.subTpls = S.merge(config.subTpls, XTemplateRuntime.subTpls);
        config.commands = S.merge(config.commands, XTemplateRuntime.commands);
        config.engine = self;
        config.utils = utils;
        this.config = config;
    }

    XTemplateRuntime.prototype = {

        constructor: XTemplateRuntime,

        // allow str sub template
        invokeEngine: function (tpl, scopes, config) {
            return new this.constructor(tpl, config).render(scopes, true);
        },

        /**
         * remove sub template by name
         * @param subTplName
         */
        'removeSubTpl': function (subTplName) {
            delete this.config.subTpls[subTplName];
        },

        /**
         * remove command by name
         * @param commandName
         */
        'removeCommand': function (commandName) {
            delete this.config.commands[commandName];
        },

        /**
         * add sub template definition to current template
         * @param subTplName
         * @param {String|Function}def
         */
        addSubTpl: function (subTplName, def) {
            this.config.subTpls[subTplName] = def;
        },

        /**
         * add command definition to current template
         * @param commandName
         * @param {Function} fn command definition
         */
        addCommand: function (commandName, fn) {
            this.config.commands[commandName] = fn;
        },

        /**
         * get result by merge data with template
         * @param data
         * @return {String}
         * @param {Boolean} [keepDataFormat] for internal use
         */
        render: function (data, keepDataFormat) {
            if (!keepDataFormat) {
                data = [data];
            }
            return this.tpl(data, this.config);
        }

    };

    S.mix(XTemplateRuntime, {
        commands: commands,

        subTpls: subTpls,

        utils: utils,

        /**
         * add command to all template
         * @method
         * @static
         * @param {String} commandName
         * @param {Function} fn
         * @member KISSY.XTemplate.Runtime
         */
        addCommand: function (commandName, fn) {
            commands[commandName] = fn;
        },

        /**
         * remove command from all template by name
         * @method
         * @static
         * @param {String} commandName
         * @member KISSY.XTemplate.Runtime
         */
        removeCommand: function (commandName) {
            delete commands[commandName];
        },

        /**
         * add sub template definition to all template
         * @method
         * @static
         * @param {String} tplName
         * @param {Function|String} def
         * @member KISSY.XTemplate.Runtime
         */
        addSubTpl: function (tplName, def) {
            subTpls[tplName] = def;
        },

        /**
         * remove sub template definition from all template by name
         * @method
         * @static
         * @param {String} tplName
         * @member KISSY.XTemplate.Runtime
         */
        removeSubTpl: function (tplName) {
            delete  subTpls[tplName];
        }
    });

    return XTemplateRuntime;

}, {
    requires: [ './runtime/commands']
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
 *      - 内置 escapeHtml 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *   劣势
 *      - 不支持表达式
 *      - 不支持复杂比较操作
 *      - 不支持 js 语法
 *
 */