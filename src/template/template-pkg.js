/**
 * @fileoverview KISSY.Template.
 * @author yyfrankyy(yyfrankyy@gmail.com)
 */
KISSY.add('template', function(S, undefined) {

    var defaultConfig = {},

        /**
         * Template Cache
         */
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

        // static string
        KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_EMPTY = '',

        PREFIX = '");',
        SUFFIX = KS_TEMPL + '.push("',

        PARSER_SYNTAX_ERROR = 'KISSY.Template: Syntax Error. ',
        PARSER_RENDER_ERROR = 'KISSY.Template: Render Error. ',

        PARSER_PREFIX = 'var ' + KS_TEMPL + '=[],' + KS_TEMPL_STAT_PARAM + '=false;with(',
        PARSER_MIDDLE = '||{}){try{' + KS_TEMPL + '.push("',
        PARSER_SUFFIX = '");}catch(e){' + KS_TEMPL + '=["' + PARSER_RENDER_ERROR + '" + e.message]}};return ' + KS_TEMPL + '.join("");',

        /*
         * build a static parser
         */
        buildParser = function(templ) {
            var _parser, _empty_index;
            return S.trim(templ).replace(getRegexp('[\r\t\n]'), ' ').replace(getRegexp('(["\'])'), '\\$1')
                .replace(getRegexp('\{\{([#/]?)(?!\}\})([^}]*)\}\}'), function(all, expr, oper) {
                    _parser = KS_EMPTY;
                    // is an expression
                    if (expr) {
                        oper = S.trim(oper);
                        _empty_index = oper.indexOf(' ');
                        oper = _empty_index === -1 ? [oper, ''] :
                                [oper.substring(0, oper.indexOf(' ')), oper.substring(oper.indexOf(' '))];
                        for (var i in Statements) {
                            if (oper[0] !== i) continue;
                            oper.shift();
                            switch (expr) {
                                case '#':
                                    _parser = Statements[i].start.replace(
                                        getRegexp(KS_TEMPL_STAT_PARAM),
                                        oper.join(KS_EMPTY).replace(getRegexp('\\\\([\'"])'), '$1')
                                    );
                                    break;
                                case '/':
                                    _parser = Statements[i].end;
                                    break;
                                default:
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
         * @param {Object} config configuration.
         * @return {KISSY.Template} return this for chain.
         */
        Template = function(templ, config) {
            if (!(templ in templateCache)) {
                var _ks_data = KS_DATA + S.now(), func,
                    _parser = [
                        PARSER_PREFIX,
                        _ks_data,
                        PARSER_MIDDLE,
                        buildParser(templ),
                        PARSER_SUFFIX
                    ];

                try {
                    func = new Function(_ks_data, _parser.join(KS_EMPTY));
                } catch (e) {
                    _parser[3] = PREFIX + SUFFIX + PARSER_SYNTAX_ERROR + ',' + e.message + PREFIX + SUFFIX;
                    func = new Function(_ks_data, _parser.join(KS_EMPTY));
                }

                templateCache[templ] = {
                    name: _ks_data,
                    parser: _parser.join(KS_EMPTY),
                    render: func
                };
            }
            return templateCache[templ];
        };

        S.mix(Template, {
            log: function(templ) {
                if (templ in templateCache) {
                    if ('js_beautify' in window) {
                        S.log(js_beautify(templateCache[templ].parser, {
                            indent_size: 4,
                            indent_char: ' ',
                            preserve_newlines: true,
                            braces_on_own_line: false,
                            keep_array_indentation: false,
                            space_after_anon_function: true
                        }), 'info');
                    } else {
                        S.log(templateCache[templ].parser, 'info');
                    }
                } else {
                    Template(templ);
                    this.log(templ);
                }
            },

            /**
             * @param {String} statement 支持的标签扩展.
             */
            addStatement: function(statement, o) {
                if (S.isString(statement) && S.isObject(o)) {
                    Statements[statement] = o;
                }
            },

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
/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template-node', function(S, undefined) {

    S.mix(S, {
        // S.one('#temlate').tmpl({a: 'a'}).appendTo(target);
        tmpl: function(selector, data) {
            return S.one(S.DOM.create(S.Template(S.one(selector).html()).render(data)));
        }
    });

}, {host: 'template'});
