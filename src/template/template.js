/**
 * @fileoverview KISSY.Template.
 * @author yyfrankyy(yyfrankyy@gmail.com)
 *
 * ChangeLog:
 *
 * 2010-9-22
 *  - 根据new Function的思路，实现了一遍Micro Template，增加一些接口
 *
 * 2010-11-02
 *  - 调整部分接口，实现一个较为复杂的用例，P4P
 *
 * 2010-11-10
 *  - 迁移到kissy目录
 *  - 按照原来的接口，规划好部分单元测试用例
 *
 * 2010-12-15
 *  - 重构为白名单机制，语法支持扩展
 *  - 重写测试用例
 *  - 增加js-templates-benchmark和其他模板做一下性能对比
 *
 * 2010-12-15
 *  - 完善测试用例
 *
 * TODO:
 *  - 非标记字符直接push入数组，需要进行部分转义
 *  - 标记内的字符会被直接转为js执行，要完善测试用例
 *  - 集成错误处理
 *  - 提供一些KISSY内置接口(DOM, Node, Ajax, Data)
 *
 */
KISSY.add('template', function(S, undefined) {

    var KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_EMPTY = '',

        PREFIX = '");',
        SUFFIX = KS_TEMPL + '.push("',

        PARSER_PREFIX = 'var ' + KS_TEMPL + '=[],' + KS_TEMPL_STAT_PARAM + '=false;with(',
        PARSER_MIDDLE = '){try{' + KS_TEMPL + '.push("',
        PARSER_SUFFIX = '");}catch(e){KISSY.Template.fire(\'error\', {message: e.message});}};return ' + KS_TEMPL + '.join("");',

        templateCache = {},

        /**
         * Regexp Cache
         */
        regexpCache = {},
        getRegexp = function(regexp) {
            if (!(regexp in regexpCache)) {
                S.log('regex cache hit rate', 'count');
                regexpCache[regexp] = new RegExp(regexp, 'ig');
            }
            return regexpCache[regexp];
        },

        /**
         * 默认配置.
         */
        defaultConfig = {
        },

        /*
         * special characters
         */
        escape = function(_char) {
            return _char.replace(/([{}\[\]()?*.\\\/])/g, '\\$1');
        },

        /*
         * build a static parser
         */
        buildParser = function(templ) {
            var _parser = '';
            templ = S.trim(templ)
                        .replace(getRegexp('[\r\t\n]'), ' ')
                        .replace(getRegexp('(["\'])'), '\\$1')
                        .replace(getRegexp('\{\{([#/]?)(?!\}\})([^}]*)\}\}'), function(all, expr, oper) {

                            S.log(arguments);

                            // expressions
                            if (expr) {
                                oper = S.trim(oper).split(/\s+/);

                                for (var i in Statements) {
                                    if (oper[0] !== i) continue;

                                    oper.shift();
                                    switch (expr) {
                                        case '#':
                                            _parser = Statements[i].start.replace(
                                                getRegexp(KS_TEMPL_STAT_PARAM),
                                                // 把引号转回来...
                                                oper.join(KS_EMPTY).replace(getRegexp('\\\\([\'"])'), '$1')
                                            );
                                            break;

                                        case '/':
                                            _parser = Statements[i].end;
                                            break;

                                        default:
                                            throw new Error('statement not supported');
                                            break;
                                    }
                                }

                            }

                            // return array directly
                            else {
                                _parser = KS_TEMPL + '.push(' + oper + ');';
                            }

                            return PREFIX + _parser + SUFFIX;

                        });

            S.log(templ);
            return templ;
        },

        /**
         * HTML Special Characters
         */
        htmlSpecialCharacters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&#34;',
            '\'': '&#39;'
        },

        /**
         * expressions
         */
        Statements = {

            'if': {
                start: 'if(' + KS_TEMPL_STAT_PARAM + '){',
                end: '}'
            },

            'else': {
                start: '}else{'
            },

            'elseif': {
                start: '}else if(' + KS_TEMPL_STAT_PARAM + '){'
            },

            'each': {
                start: 'KISSY.each(' + KS_TEMPL_STAT_PARAM + ', function(_ks_value, _ks_index){',
                end: '});'
            }

        },

        /**
         * @param {String} templ template to be rendered.
         */
        Template = function(templ, config) {

            if (!(templ in templateCache)) {
                S.log('template cache hit rate', 'count');

                config = S.mix(defaultConfig, config);

                var _ks_data = config.name || KS_DATA + S.now();
                    // var _ks_templ = [],
                    //     KS_TEMPL_STAT_PARAM = false;
                    // with (_ks_data) {
                    //     KS_TEMPL.push($TEMPLATE);
                    // }
                    // return _ks_templ.join("");
                    _parser = [
                        PARSER_PREFIX,
                        _ks_data,
                        PARSER_MIDDLE,
                        buildParser(templ),
                        PARSER_SUFFIX
                    ].join(KS_EMPTY);

                templateCache[templ] = {
                    name: _ks_data,
                    parser: _parser,
                    render: new Function(_ks_data, _parser)
                };
            }

            S.log(templateCache[templ].render, 'info');
            return templateCache[templ];
        };

        S.mix(Template, {

            /**
             * 得到所有缓存
             */
            cache: templateCache,

            /**
             * @param {String} name 根据串作为with的内部变量名.
             */
            getCacheByName: function(name) {
                for (var i in templateCache) {
                    if (templateCache[i].name === name) {
                        return templateCache[i];
                    }
                }
            }

        });
    S.Template = Template;
}, {requires: ['core']});
