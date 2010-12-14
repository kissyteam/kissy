/**
 * KISSY.Template
 * @author 文河(yyfrankyy@gmail.com)
 */
KISSY.add('template', function(S, undefined) {

    var templateCache = {},

        defaultConfig = {
            lq: '{{',
            rq: '}}'
        },

        /*
         * 正则缓存
         */
        regexpCache = {},
        getRegexp = function(regexp) {
            if (!(regexp in regexpCache)) {
                regexpCache[regexp] = new RegExp(regexp, 'ig');
            }
            return regexpCache[regexp];
        },

        /*
         * 特殊字符转义
         */
        escape = function(_char) {
            return _char.replace(/([{}\[\]()?*.\\\/])/g, '\\$1');
        },

        /*
         * 静态化parser
         *  - 通过白名单支持tag(jq-templ)
         *  - 生成的js，通过jslint校检
         */
        buildParser = function(templ, lq, rq) {
            lq = escape(lq);
            rq = escape(rq);
            templ = S.trim(templ)
                        .replace(getRegexp('[\r\t\n]'), ' ')
                        .replace(getRegexp('\{\{([#/]?)(?!\}\})([^}]*)\}\}'), function(all, expr, oper) {
                            S.log(arguments);

                            // 表达式
                            if (expr) {
                                oper = S.trim(oper).split(/\s+/);

                                for (var i in Statements) {
                                    if (oper[0] === i) {
                                        if (expr === '#') {
                                            return Statements[i].start;
                                        } else if (expr === '/') {
                                            return Statements[i].end;
                                        }
                                    }
                                }

                                //return all;
                            }

                            // 直接返回数值
                            else {
                                return '_ks_templ.push(' + oper + ');';
                            }

                            return all;
                        });
            return templ;
        },

        /**
         * HTML实体转义
         */
        htmlSpecialCharacters = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&#34;',
            '\'': '&#39;'
        },

        /**
         * 表达式组合,支持扩展
         */
        Statements = {

            'if': {
                start: 'if(KS_TEMPL_STAT_PARAM){',
                end: '}'
            },

            'else': {
                start: '}else{'
            },

            'elseif': {
                start: '}else if(KS_TEMPL_STAT_PARAM){'
            },

            'each': {
                start: 'KISSY.each(KS_TEMPL_STAT_PARAM, function(_ks_value, _ks_index){',
                end: '});'
            }

        },

        /**
         * @see http://ejohn.org/blog/javascript-micro-templating/
         * @param {String} templ 待渲染的模板.
         * @param {String} config 模板配置.
         */
        Template = function(templ, config) {

            if (!(templ in templateCache)) {
                config = S.merge(defaultConfig, config);

                var _ks_data = '_ks_data' + +new Date,
                    _lq = config.lq, _rq = config.rq,

                    // var _ks_templ = [];
                    // with (_ks_data) {
                    //     _ks_templ.push($TEMPLATE);
                    // }
                    // return _ks_templ.join("");
                    _parser = [
                        'var _ks_templ=[];with(',
                        _ks_data,
                        '){_ks_templ.push("',
                        buildParser(templ, _lq, _rq),
                        '");};return _ks_templ.join("");'
                    ].join('');

                templateCache[templ] = {
                    parser: _parser,
                    render: new Function(_ks_data, _parser)
                };
            }

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
