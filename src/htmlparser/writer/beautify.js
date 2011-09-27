/**
 * format html prettily
 * @author yiminghe@gmail.com
 */
KISSY.add("htmlparser/writer/beautify",function(S, BasicWriter, dtd) {

    function BeautifyWriter() {
        BeautifyWriter.superclass.constructor.apply(this, arguments);
        // tag in pre should not indent
        // space (\t\r\n ) in pre should not collapse
        this.inPre = 0;
        this.indentChar = "\t";
        this.indentLevel = 0;
        // whether to indent on current line
        // if already indent and then not line break ,next tag should not indent
        this.allowIndent = 0;
        this.rules = {};

        for (var e in S.merge(
            dtd.$nonBodyContent,
            dtd.$block,
            dtd.$listItem,
            dtd.$tableContent
        )) {
            this.setRules(e, {
                // whether its tag/text children should indent
                allowIndent : 1,
                breakBeforeOpen : 1,
                breakAfterOpen : 1,
                breakBeforeClose : 1,// !dtd[e]['#']
                breakAfterClose : 1
            });
        }

        this.setRules('br', {
            breakAfterOpen : 1
        });

        this.setRules('title', {
            allowIndent : 0,
            breakBeforeClose:0,
            breakAfterOpen : 0
        });

        this.setRules('style', {
            allowIndent : 0,
            breakBeforeOpen : 1,
            breakAfterOpen : 1,
            breakBeforeClose : 1,
            breakAfterClose : 1
        });

        this.setRules('script', {
            allowIndent : 0,
            breakBeforeOpen : 1,
            breakAfterOpen : 1,
            breakBeforeClose : 1,
            breakAfterClose : 1
        });

        // Disable indentation on <pre>.
        this.setRules('pre', {
            allowIndent : 0
        });
    }

    S.extend(BeautifyWriter, BasicWriter, {
        indentation:function() {
            if (!this.inPre) {
                this.append(new Array(this.indentLevel + 1).join(this.indentChar));
            }
            // already indent ,unless line break  it will not indent again
            this.allowIndent = 0;
        },

        lineBreak:function() {
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
                this.append("\n");
            }
            // allow indentation if encounter next tag
            this.allowIndent = 1;
        },

        setRules:function(tagName, rule) {
            if (!this.rules[tagName]) {
                this.rules[tagName] = {};
            }
            S.mix(this.rules[tagName], rule);
        },

        openTag:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeOpen) {
                this.lineBreak();
                this.indentation();
            }
            BeautifyWriter.superclass.openTag.apply(this, arguments);
        },

        openTagClose:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};
            if (el.isEmptyXmlTag) {
                this.append(" />")
            } else {
                this.append(">");
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

        closeTag:function(el) {

            var tagName = el.tagName;
            var rules = this.rules[tagName] || {};

            if (rules.allowIndent) {
                this.indentLevel--;
            }

            if (this.allowIndent) {
                this.indentation();
            } else if (rules.breakBeforeClose) {
                this.lineBreak();
                this.indentation();
            }

            BeautifyWriter.superclass.closeTag.apply(this, arguments);

            if (tagName === "pre") {
                this.inPre = 0;
            }

            if (rules.breakAfterClose) {
                this.lineBreak();
            }

        },

        text:function(text) {

            if (this.allowIndent) {
                this.indentation();
            }
            if (!this.inPre) {
                // shrink consequential spaces into one space
                text = text.replace(/[\t\r\n ]{2,}|[\t\r\n]/g, ' ');
            }
            this.append(text);
        },

        comment:function(comment) {
            if (this.allowIndent) {
                this.indentation();
            }
            this.append(comment);
        }


    });

    return BeautifyWriter;

}, {
    requires:['./basic','../dtd']
});