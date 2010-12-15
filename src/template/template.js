/**
 * KISSY.Template
 * @author 文河(yyfrankyy@gmail.com)
 */
KISSY.add('template', function(S, undefined) {

    var KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_EMPTY = '',

        defaultConfig = {
            lq: '{{',
            rq: '}}'
        },

        templateCache = {},

        /**
         * Regexp Cache
         */
        regexpCache = {},
        getRegexp = function(regexp) {
            if (!(regexp in regexpCache)) {
                regexpCache[regexp] = new RegExp(regexp, 'ig');
            }
            return regexpCache[regexp];
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
        buildParser = function(templ, lq, rq) {
            lq = escape(lq);
            rq = escape(rq);
            var stack = [], prefix = KS_EMPTY;
            templ = S.trim(templ)
                        .replace(getRegexp('[\r\t\n]'), ' ')
                        .replace(getRegexp('(["\'])'), '\\$1')
                        .replace(getRegexp('\{\{([#/]?)(?!\}\})([^}]*)\}\}'), function(all, expr, oper) {

                            S.log(arguments);

                            // expressions
                            if (expr) {
                                oper = S.trim(oper).split(/\s+/);

                                for (var i in Statements) {
                                    if (oper[0] === i) {
                                        oper.shift();
                                        switch (expr) {
                                            case '#':
                                                // can be closed
                                                if (Statements[i].end) {
                                                    stack.push(Statements[i]);
                                                }
                                                prefix = '");';
                                                return prefix + Statements[i].start.replace(getRegexp(KS_TEMPL_STAT_PARAM), oper.join(KS_EMPTY)) +
                                                    KS_TEMPL + '.push("';

                                            case '/':
                                                stack.pop();
                                                return '");' + Statements[i].end + KS_TEMPL + '.push("';

                                            default:
                                                // not supported
                                                break;
                                        }
                                    }
                                }

                            }

                            // return array directly
                            else {
                                if (stack.length > 0) {
                                    return '");' + KS_TEMPL + '.push(' + oper + ');' + KS_TEMPL + '.push("';
                                }
                                return '");' + KS_TEMPL + '.push(' + oper + ');' + KS_TEMPL + '.push("';
                            }

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
         * @param {String} config config of template.
         */
        Template = function(templ, config) {

            if (!(templ in templateCache)) {
                config = S.merge(defaultConfig, config);

                var _ks_data = KS_DATA + +new Date,
                    _lq = config.lq, _rq = config.rq,

                    // var _ks_templ = [],
                    //     KS_TEMPL_STAT_PARAM = false;
                    // with (_ks_data) {
                    //     KS_TEMPL.push($TEMPLATE);
                    // }
                    // return _ks_templ.join("");
                    _parser = [
                        'var ' + KS_TEMPL + '=[],' + KS_TEMPL_STAT_PARAM + '=false;with(',
                        _ks_data,
                        '){' + KS_TEMPL + '.push("',
                        buildParser(templ, _lq, _rq),
                        '");};return ' + KS_TEMPL + '.join("");'
                    ].join(KS_EMPTY);

                templateCache[templ] = {
                    parser: _parser,
                    render: new Function(_ks_data, _parser)
                };
            }

            S.log(templateCache[templ].render, 'info');
            return templateCache[templ];
        };

    S.Template = Template;
}, {requires: ['core']});
/**
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
 */
