/**
 * @ignore
 * format html prettily
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var BasicWriter = require('./basic');
    var dtd = require('../dtd');
    var Utils = require('../utils');

    function BeautifyWriter() {
        var self = this;
        BeautifyWriter.superclass.constructor.apply(self, arguments);
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        self.inPre = 0;
        self.indentChar = '\t';
        self.indentLevel = 0;
        // whether to indent on current line
        // if already indent and then not line break ,next tag should not indent
        self.allowIndent = 0;
        self.rules = {};

        var beauty = S.merge(
            dtd.$nonBodyContent,
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent, {
                // may add unnecessary whitespaces
                'select': 1,
                // add unnecessary whitespaces is ok for script and style
                'script': 1,
                'style': 1
            });
        for (var e in beauty) {
            // whether its tag/text children should indent
            self.setRules(e, {
                allowIndent: 1,
                breakBeforeOpen: 1,
                breakAfterOpen: 1,
                breakBeforeClose: 1,
                breakAfterClose: 1
            });
        }

        S.each(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function (e) {
            // text paragraph does not allow
            self.setRules(e, {
                allowIndent: 0,
                breakAfterOpen: 0,
                breakBeforeClose: 0
            });
        });

        self.setRules('option', {
            breakBeforeOpen: 1
        });

        self.setRules('optiongroup', {
            breakBeforeOpen: 1
        });

        self.setRules('br', {
            breakAfterOpen: 1
        });

        self.setRules('title', {
            allowIndent: 0,
            breakBeforeClose: 0,
            breakAfterOpen: 0
        });

        // Disable indentation on <pre>.
        self.setRules('pre', {
            breakAfterOpen: 1,
            allowIndent: 0
        });
    }

    S.extend(BeautifyWriter, BasicWriter, {
        indentation: function () {
            if (!this.inPre) {
                this.append(new Array(this.indentLevel + 1).join(this.indentChar));
            }
            // already indent ,unless line break  it will not indent again
            this.allowIndent = 0;
        },

        lineBreak: function () {
            var o = this.output;
            if (!this.inPre && o.length) {
                // prevent adding more \n between tags :
                // before : <div>\n<div>\n</div>\n</div> => <div>\n\t' '\n<div>
                // now : <div>\n<div>\n</div>\n</div> => <div>\n<div> => indentation =><div>\n\t<div>
                for (var j = o.length - 1; j >= 0; j--) {
                    if (!(/[\r\n\t ]/.test(o[j]))) {
                        break;
                    }
                }
                o.length = j + 1;
                this.append('\n');
            }
            // allow indentation if encounter next tag
            this.allowIndent = 1;
        },

        setRules: function (tagName, rule) {
            if (!this.rules[tagName]) {
                this.rules[tagName] = {};
            }
            S.mix(this.rules[tagName], rule);
        },

        openTag: function (el) {

            var tagName = el.tagName,
                rules = this.rules[tagName] || {};
            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }
            BeautifyWriter.superclass.openTag.apply(this, arguments);
        },

        openTagClose: function (el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (el.isSelfClosed) {
                this.append(' />');
            } else {
                this.append('>');
                if (rules.allowIndent) {
                    this.indentLevel++;
                }
            }
            if (rules.breakAfterOpen) {
                this.lineBreak();
            }
            if (tagName === 'pre') {
                this.inPre = 1;
            }
        },

        closeTag: function (el) {
            var self = this,
                tagName = el.tagName,
                rules = self.rules[tagName] || {};

            if (rules.allowIndent) {
                self.indentLevel--;
            }

            if (self.allowIndent) {
                self.indentation();
            } else if (rules.breakBeforeClose) {
                self.lineBreak();
                self.indentation();
            }

            BeautifyWriter.superclass.closeTag.apply(self, arguments);

            if (tagName === 'pre') {
                self.inPre = 0;
            }

            if (rules.breakAfterClose) {
                self.lineBreak();
            }

        },

        text: function (text) {
            if (this.allowIndent) {
                this.indentation();
            }
            if (!this.inPre) {
                // shrink consequential spaces into one space
                // 换行也没了，否则由于 closeTag 时 lineBreak 会导致换行越来越多
                text = Utils.collapseWhitespace(text);
            }
            this.append(text);
        },

        comment: function (comment) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append('<!--' + comment + '-->');
        },

        cdata: function (text) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append(S.trim(text));
        }

    });

    return BeautifyWriter;

});