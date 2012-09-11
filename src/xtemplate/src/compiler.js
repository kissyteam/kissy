/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 */
KISSY.add("xtemplate/compiler", function (S, parser, ast) {

    parser.yy = ast;

    function escapeString(str) {
        return str.replace(/\r/g, '\\r').replace(/\n/g, '\\n');
    }

    var gen = {

        genOption: function (tplNode) {
            var source = [],
                optionName = S.guid('option'),
                self = this;

            source.push('var ' + optionName + ' = {' +
                'commands: commands,' +
                'subTpls: subTpls' +
                '};');

            if (tplNode) {

                var params, hash;
                if (params = tplNode.params) {
                    var paramsName = S.guid('params');
                    source.push('var ' + paramsName + ' = [];');
                    S.each(params, function (param) {
                        if (param.type == 'id') {
                            var nextIdNameCode = self.genId(param);
                            source.push(nextIdNameCode[1]);
                            source.push(paramsName + '.push(' + nextIdNameCode[0] + ');')
                        } else if (param.type == 'string') {
                            source.push(paramsName + '.push("' + param.value + '");')
                        } else {
                            source.push(paramsName + '.push(' + param.value + ');')
                        }
                    });

                    source.push(optionName + '.params=' + paramsName + ';');
                }

                if (hash = tplNode.hash) {
                    var hashName = S.guid('hash');
                    source.push('var ' + hashName + ' = {};');
                    S.each(hash.value, function (v, key) {
                        if (v.type == 'id') {
                            var nextIdNameCode = self.genId(v);
                            source.push(nextIdNameCode[1]);
                            source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';')
                        } else if (v.type == 'string') {
                            source.push(hashName + '["' + key + '"] = "' + v.value + '";')
                        } else {
                            source.push(hashName + '["' + key + '"] = ' + v.value + ';')
                        }
                    });

                    source.push(optionName + '.hash=' + hashName + ';');
                }

            }

            return [optionName, source.join('\n')];
        },

        genId: function (idNode, tplNode) {
            var source = [],
                depth = idNode.depth,
                scope = 'scopes[' + depth + ']',
                idString = idNode.string;

            var idName = S.guid('id'),
                self = this,
                tmpNameCommand = S.guid('command');

            source.push('var ' + idName + ';');

            if (tplNode && depth == 0) {
                var optionNameCode = self.genOption(tplNode);
                source.push(optionNameCode[1]);
                source.push('var ' + tmpNameCommand + ';');
                source.push(tmpNameCommand + ' = commands["' + idString + '"];');
                source.push('if( ' + tmpNameCommand + ' ){');
                source.push('try{');
                source.push(idName + ' = ' + tmpNameCommand +
                    '(' + scope + ',' + optionNameCode[0] + ');');
                source.push('}catch(e){');
                source.push('error(e.message+": \'' +
                    tmpNameCommand + '\' at line ' + idNode.lineNumber + '");');
                source.push('}');
                source.push('}');
            }

            if (tplNode && depth == 0) {
                source.push('else {');
            }

            source.push('if(!' + scope + '||' +
                // use in insteadof scope[idString]
                '!("' + idString + '" in ' + scope + ')){');
            source.push('log("can not find property: \'' +
                idString + '\' at line ' + idNode.lineNumber + '", "warn");');
            source.push(idName + ' = "";');
            source.push('} else {');
            source.push(idName + ' = ' + scope + '["' + idNode.string + '"];');
            source.push('}');

            if (tplNode && depth == 0) {
                source.push('}');
            }

            return [idName, source.join('\n')];
        },

        genFunction: function (statements, global) {
            var source = [];
            if (!global) {
                source.push('function(scopes) {');
            }
            source.push('var buffer = ""' + (global ? ',' : ';'));
            if (global) {
                source.push('S = KISSY,' +
                    'escapeHTML = S.escapeHTML,' +
                    'log = S.log,' +
                    'error = S.error,');
                source.push('commands = option.commands,' +
                    'subTpls=option.subTpls;');
            }
            if (statements) {
                for (var i = 0, len = statements.length; i < len; i++) {
                    source.push(this[statements[i].type](statements[i]));
                }
            }
            source.push('return buffer;');
            if (!global) {
                source.push('}');
                return source.join('\n');
            } else {
                return {
                    params: ['scopes', 'option'],
                    source: source.join('\n')
                };
            }
        },

        block: function (block) {
            var programNode = block.program,
                source = [],
                tmpNameCommand = S.guid('command'),
                tplNode = block.tpl,
                optionNameCode = this.genOption(tplNode),
                optionName = optionNameCode[0],
                string = tplNode.path.string;

            source.push(optionNameCode[1]);

            source.push('var ' + tmpNameCommand +
                ' = commands["' + string + '"];');

            source.push(optionName + '.fn=' + this.genFunction(programNode.statements) + ';');

            var inverseFn = this.genFunction(programNode.inverse);

            if (inverseFn) {
                source.push(optionName + '.inverse=' + inverseFn + ';');
            }

            source.push('if( ' + tmpNameCommand + ' ){');
            source.push('try{');
            source.push('buffer += ' + tmpNameCommand + '(scopes,' + optionName + ');');
            source.push('}catch(e){');
            source.push('error(e.message+": \'' +
                string + '\' at line ' + tplNode.path.lineNumber + '");');
            source.push('}');
            source.push('} else {');
            source.push('error("can not find command: \'' +
                string + '\' at line ' + tplNode.path.lineNumber + '");');
            source.push('}');

            return source.join('\n');
        },

        content: function (contentNode) {
            return 'buffer += "' + escapeString(contentNode.value.replace(/"/g, "\\")) + '";';
        },

        tpl: function (tplNode) {
            var source = [],
                escaped = tplNode.escaped,
                genIdCode = this.genId(tplNode.path, tplNode);
            source.push(genIdCode[1]);
            source.push('buffer+=' +
                (escaped ? 'escapeHTML(' : '') +
                genIdCode[0] + '+""' +
                (escaped ? ')' : '') +
                ';');
            return source.join('\n');
        }
    };

    return {
        compile: function (tpl) {
            var root = parser.parse(tpl);
            return gen.genFunction(root.statements, true);
        }
    };

}, {
    requires: ['./parser', './ast']
});