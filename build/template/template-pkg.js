/*
Copyright 2011, KISSY UI Library v1.1.8dev
MIT Licensed
build time: ${build.time}
*/
/**
 * @fileoverview KISSY Template Engine.
 * @author 文河(yyfrankyy) <yyfrankyy@gmail.com>
 * @see https://github.com/yyfrankyy/kissy/tree/template/src/template
 *
 * @license
 * Copyright (c) 2010 Taobao Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
KISSY.add('template', function(S) {

    var defaultConfig = {},

        // Template Cache
        templateCache = {},

        // start/end tag mark
        tagStartEnd = {
            '#': 'start',
            '/': 'end'
        },

        // Regexp Cache
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

        // build a static parser
        buildParser = function(templ) {
            var _parser, _empty_index;
            return S.trim(templ).replace(getRegexp('[\r\t\n]'), ' ')
                .replace(getRegexp('(["\'])'), '\\$1')
                .replace(getRegexp('\{\{([#/]?)(?!\}\})([^}]*)\}\}'),
                function(all, expr, oper) {
                    _parser = KS_EMPTY;
                    // is an expression
                    if (expr) {
                        oper = S.trim(oper);
                        _empty_index = oper.indexOf(' ');
                        oper = _empty_index === -1 ? [oper, ''] :
                            [oper.substring(0, oper.indexOf(' ')),
                                oper.substring(oper.indexOf(' '))];
                        for (var i in Statements) {
                            if (oper[0] !== i) continue;
                            oper.shift();
                            if (expr in tagStartEnd) {
                                // get expression definition function/string
                                var fn = Statements[i][tagStartEnd[expr]];
                                _parser = S.isFunction(fn) ?
                                    fn.apply(this, S.trim(oper.join(KS_EMPTY)
                                        .replace(getRegexp('\\\\([\'"])'),
                                        '$1')).split(/\s+/)) :
                                    fn.replace(getRegexp(KS_TEMPL_STAT_PARAM),
                                        oper.join(KS_EMPTY)
                                            .replace(getRegexp('\\\\([\'"])'), '$1')
                                        );
                            }
                        }
                    }

                    // return array directly
                    else {
                        _parser = KS_TEMPL +
                            '.push(' +
                            oper.replace(getRegexp('\\\\([\'"])'), '$1') + ');';
                    }
                    return PREFIX + _parser + SUFFIX;

                });
        },

        // convert any object to array
        toArray = function(args) {
            return [].slice.call(args);
        },

        // join any array to string by empty
        join = function(args) {
            return toArray(args).join(KS_EMPTY);
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
                start: function() {
                    var args = toArray(arguments),
                        _ks_value = '_ks_value', _ks_index = '_ks_index';
                    if (args[1] === KS_AS && args[2]) {
                        _ks_value = args[2] || _ks_value,
                            _ks_index = args[3] || _ks_index;
                    }
                    var r = 'KISSY.each(' + args[0] +
                        ', function(' + _ks_value + ', ' + _ks_index + '){';
                    return r;
                },
                end: '});'
            },

            // comments
            '!': {
                start: '/*' + KS_TEMPL_STAT_PARAM + '*/'
            }
        },

        /**
         * Template
         * @param {String} templ template to be rendered.
         * @param {Object} config configuration.
         * @return {Object} return this for chain.
         */
            Template = function(templ, config) {
            S.mix(defaultConfig, config);
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
                    _parser[3] = PREFIX + SUFFIX + PARSER_SYNTAX_ERROR + ',' +
                        e.message + PREFIX + SUFFIX;
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
        /**
         * Logging Compiled Template Codes
         * @param {String} templ template string.
         */
        log: function(templ) {
            if (templ in templateCache) {
                if ('js_beautify' in window) {
                    //cause compress error
//                        S.log(js_beautify(templateCache[templ].parser, {
//                            indent_size: 4,
//                            indent_char: ' ',
//                            preserve_newlines: true,
//                            braces_on_own_line: false,
//                            keep_array_indentation: false,
//                            space_after_anon_function: true
//                        }), 'info');
                } else {
                    S.log(templateCache[templ].parser, 'info');
                }
            } else {
                Template(templ);
                this.log(templ);
            }
        },

        /**
         * add statement for extending template tags
         * @param {String} statement tag name.
         * @param {String} o extent tag object.
         */
        addStatement: function(statement, o) {
            if (S.isString(statement) && S.isObject(o)) {
                Statements[statement] = o;
            }
        }

    });

    S.Template = Template;
    return Template;

}, {requires: ['core']});
/**
 * @fileoverview KISSY.Template Node.
 * @author 文河<wenhe@taobao.com>
 */
KISSY.add('template-node', function(S, undefined) {

    S.mix(S, {
        tmpl: function(selector, data) {
            return S.one(S.DOM.create(S.Template(S.one(selector).html()).render(data)));
        }
    });

}, {host: 'template'});
