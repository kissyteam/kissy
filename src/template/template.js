/**
 * @fileoverview KISSY Template Engine.
 * @author yyfrankyy@gmail.com
 */
KISSY.add('template/base', function(S) {

    var // Template Cache
        templateCache = {},

        // start/end tag mark
        tagStartEnd = {
            '#': 'start',
            '/': 'end'
        },

        // static string
        KS_TEMPL_STAT_PARAM = 'KS_TEMPL_STAT_PARAM',
        KS_TEMPL_STAT_PARAM_REG = new RegExp(KS_TEMPL_STAT_PARAM, "g"),
        KS_TEMPL = 'KS_TEMPL',
        KS_DATA = 'KS_DATA_',
        KS_EMPTY = '',
        KS_AS = 'as',

        PREFIX = '");',
        SUFFIX = KS_TEMPL + '.push("',

        PARSER_SYNTAX_ERROR = 'KISSY.Template: Syntax Error. ',
        PARSER_RENDER_ERROR = 'KISSY.Template: Render Error. ',

        PARSER_PREFIX = 'var ' + KS_TEMPL + '=[],' +
            KS_TEMPL_STAT_PARAM + '=false;with(',

        PARSER_MIDDLE = '||{}){try{' + KS_TEMPL + '.push("',

        PARSER_SUFFIX = '");}catch(e){' + KS_TEMPL + '=["' +
            PARSER_RENDER_ERROR + '" + e.message]}};return ' +
            KS_TEMPL + '.join("");',

        restoreQuote = function(str) {
            return str.replace(/\\"/g, '"');
        },

        escapeQuote = function(str) {
            return str.replace(/"/g, '\\"');
        },

        trim = S.trim,

        // build a static parser
        buildParser = function(tpl) {
            var _parser,
                _empty_index;
            return escapeQuote(trim(tpl)
                .replace(/[\r\t\n]/g, ' ')
                // escape escape ...
                .replace(/\\/g, '\\\\'))
                .replace(/\{\{([#/]?)(?!\}\})([^}]*)\}\}/g,
                function(all, expr, body) {
                    _parser = KS_EMPTY;
                    // is an expression
                    if (expr) {
                        body = trim(body);
                        _empty_index = body.indexOf(' ');
                        body = _empty_index === -1 ?
                            [ body, '' ] :
                            [
                                body.substring(0, _empty_index),
                                body.substring(_empty_index)
                            ];

                        var operator = body[0],
                            fn,
                            args = trim(body[1]),
                            opStatement = Statements[operator];

                        if (opStatement && tagStartEnd[expr]) {
                            // get expression definition function/string
                            fn = opStatement[tagStartEnd[expr]];
                            _parser = S.isFunction(fn) ?
                                restoreQuote(fn.apply(this, args.split(/\s+/))) :
                                restoreQuote(fn.replace(KS_TEMPL_STAT_PARAM_REG, args));
                        }
                    }
                    // return array directly
                    else {
                        _parser = KS_TEMPL +
                            '.push(' +
                            // prevent variable undefined error when look up in with ,simple variable substitution
                            // with({}){alert(x);} => ReferenceError: x is not defined
                            'typeof '+body+'==="undefined"?"":'+restoreQuote(body) +
                            ');';
                    }
                    return PREFIX + _parser + SUFFIX;

                });
        },

        // expression
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

            // KISSY.each function wrap
            'each': {
                start: function(obj, as, v, k) {
                    var _ks_value = '_ks_value',
                        _ks_index = '_ks_index';
                    if (as === KS_AS && v) {
                        _ks_value = v || _ks_value,
                            _ks_index = k || _ks_index;
                    }
                    return 'KISSY.each(' + obj +
                        ', function(' + _ks_value +
                        ', ' + _ks_index + '){';
                },
                end: '});'
            },

            // comments
            '!': {
                start: '/*' + KS_TEMPL_STAT_PARAM + '*/'
            }
        };

    /**
     * Template
     * @param {String} tpl template to be rendered.
     * @return {Object} return this for chain.
     */
    function Template(tpl) {
        if (!(templateCache[tpl])) {
            var _ks_data = S.guid(KS_DATA),
                func,
                o,
                _parser = [
                    PARSER_PREFIX,
                    _ks_data,
                    PARSER_MIDDLE,
                    o = buildParser(tpl),
                    PARSER_SUFFIX
                ];

            try {
                func = new Function(_ks_data, _parser.join(KS_EMPTY));
            } catch (e) {
                _parser[3] = PREFIX + SUFFIX +
                    PARSER_SYNTAX_ERROR + ',' +
                    e.message + PREFIX + SUFFIX;
                func = new Function(_ks_data, _parser.join(KS_EMPTY));
            }

            templateCache[tpl] = {
                name: _ks_data,
                o:o,
                parser: _parser.join(KS_EMPTY),
                render: func
            };
        }
        return templateCache[tpl];
    }

    S.mix(Template, {
        /**
         * Logging Compiled Template Codes
         * @param {String} tpl template string.
         */
        log: function(tpl) {
            if (tpl in templateCache) {
                if ('js_beautify' in window) {
//                        S.log(js_beautify(templateCache[tpl].parser, {
//                            indent_size: 4,
//                            indent_char: ' ',
//                            preserve_newlines: true,
//                            braces_on_own_line: false,
//                            keep_array_indentation: false,
//                            space_after_anon_function: true
//                        }), 'info');
                } else {
                    S.log(templateCache[tpl].parser, 'info');
                }
            } else {
                Template(tpl);
                this.log(tpl);
            }
        },

        /**
         * add statement for extending template tags
         * @param {String} statement tag name.
         * @param {String} o extent tag object.
         */
        addStatement: function(statement, o) {
            if (S.isString(statement)) {
                Statements[statement] = o;
            } else {
                S.mix(Statements, statement);
            }
        }

    });

    S.Template = Template;
    return Template;

});
/**
 * 2011-09-20 note by yiminghe :
 *      - code style change
 *      - remove reg cache , ugly to see
 *      - fix escape by escape
 *      - expect(T('{{#if a=="a"}}{{b}}\\"{{/if}}').render({a:"a",b:"b"})).toBe('b\\"');
 */
