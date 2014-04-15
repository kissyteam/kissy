function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/compiler/ast.js']) {
  _$jscoverage['/compiler/ast.js'] = {};
  _$jscoverage['/compiler/ast.js'].lineData = [];
  _$jscoverage['/compiler/ast.js'].lineData[6] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[7] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[9] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[10] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[11] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[12] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[14] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[15] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[16] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[19] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[29] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[30] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[31] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[32] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[33] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[36] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[38] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[39] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[43] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[44] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[50] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[52] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[53] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[54] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[55] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[58] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[60] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[61] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[62] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[63] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[64] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[67] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[69] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[70] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[71] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[72] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[75] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[77] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[78] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[79] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[90] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[91] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[92] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[93] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[94] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[95] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[98] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[100] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[102] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[103] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[104] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[105] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[106] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[109] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[111] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[112] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[113] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[114] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[115] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[118] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[120] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[121] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[122] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[123] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[124] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[127] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[129] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[130] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[131] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[132] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[133] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[136] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[138] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[139] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[140] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[141] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[142] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[145] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[147] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[148] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[149] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[150] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[151] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[154] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[156] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[157] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[158] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[159] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[162] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[164] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[165] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[166] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[167] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[170] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[172] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[173] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[174] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[175] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[178] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[180] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[181] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[183] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[184] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[187] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[189] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[190] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[193] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[194] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[195] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[196] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[197] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[199] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[202] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[203] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[204] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[207] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[209] = 0;
}
if (! _$jscoverage['/compiler/ast.js'].functionData) {
  _$jscoverage['/compiler/ast.js'].functionData = [];
  _$jscoverage['/compiler/ast.js'].functionData[0] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[1] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[2] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[3] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[4] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[5] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[6] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[7] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[8] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[9] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[10] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[11] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[12] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[13] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[14] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[15] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[16] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[17] = 0;
  _$jscoverage['/compiler/ast.js'].functionData[18] = 0;
}
if (! _$jscoverage['/compiler/ast.js'].branchData) {
  _$jscoverage['/compiler/ast.js'].branchData = {};
  _$jscoverage['/compiler/ast.js'].branchData['11'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['14'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['15'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['43'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['194'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['196'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['196'][1] = new BranchData();
}
_$jscoverage['/compiler/ast.js'].branchData['196'][1].init(47, 10, 'p === \'..\'');
function visit6_196_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['194'][1].init(156, 5, 'i < l');
function visit5_194_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['43'][1].init(120, 40, '!sameArray(command.id.parts, closeParts)');
function visit4_43_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['15'][1].init(18, 15, 'a1[i] !== a2[i]');
function visit3_15_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['14'][1].init(131, 6, 'i < l1');
function visit2_14_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['11'][1].init(59, 9, 'l1 !== l2');
function visit1_11_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/compiler/ast.js'].functionData[0]++;
  _$jscoverage['/compiler/ast.js'].lineData[7]++;
  var ast = {};
  _$jscoverage['/compiler/ast.js'].lineData[9]++;
  function sameArray(a1, a2) {
    _$jscoverage['/compiler/ast.js'].functionData[1]++;
    _$jscoverage['/compiler/ast.js'].lineData[10]++;
    var l1 = a1.length, l2 = a2.length;
    _$jscoverage['/compiler/ast.js'].lineData[11]++;
    if (visit1_11_1(l1 !== l2)) {
      _$jscoverage['/compiler/ast.js'].lineData[12]++;
      return 0;
    }
    _$jscoverage['/compiler/ast.js'].lineData[14]++;
    for (var i = 0; visit2_14_1(i < l1); i++) {
      _$jscoverage['/compiler/ast.js'].lineData[15]++;
      if (visit3_15_1(a1[i] !== a2[i])) {
        _$jscoverage['/compiler/ast.js'].lineData[16]++;
        return 0;
      }
    }
    _$jscoverage['/compiler/ast.js'].lineData[19]++;
    return 1;
  }
  _$jscoverage['/compiler/ast.js'].lineData[29]++;
  ast.ProgramNode = function(lineNumber, statements, inverse) {
  _$jscoverage['/compiler/ast.js'].functionData[2]++;
  _$jscoverage['/compiler/ast.js'].lineData[30]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[31]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[32]++;
  self.statements = statements;
  _$jscoverage['/compiler/ast.js'].lineData[33]++;
  self.inverse = inverse;
};
  _$jscoverage['/compiler/ast.js'].lineData[36]++;
  ast.ProgramNode.prototype.type = 'program';
  _$jscoverage['/compiler/ast.js'].lineData[38]++;
  ast.BlockStatement = function(lineNumber, command, program, close, escape) {
  _$jscoverage['/compiler/ast.js'].functionData[3]++;
  _$jscoverage['/compiler/ast.js'].lineData[39]++;
  var closeParts = close.parts, self = this, e;
  _$jscoverage['/compiler/ast.js'].lineData[43]++;
  if (visit4_43_1(!sameArray(command.id.parts, closeParts))) {
    _$jscoverage['/compiler/ast.js'].lineData[44]++;
    e = ('Syntax error at line ' + lineNumber + ':\n' + 'expect {{/' + command.id.parts + '}} not {{/' + closeParts + '}}');
    _$jscoverage['/compiler/ast.js'].lineData[50]++;
    S.error(e);
  }
  _$jscoverage['/compiler/ast.js'].lineData[52]++;
  self.escape = escape;
  _$jscoverage['/compiler/ast.js'].lineData[53]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[54]++;
  self.command = command;
  _$jscoverage['/compiler/ast.js'].lineData[55]++;
  self.program = program;
};
  _$jscoverage['/compiler/ast.js'].lineData[58]++;
  ast.BlockStatement.prototype.type = 'blockStatement';
  _$jscoverage['/compiler/ast.js'].lineData[60]++;
  ast.ExpressionStatement = function(lineNumber, expression, escape) {
  _$jscoverage['/compiler/ast.js'].functionData[4]++;
  _$jscoverage['/compiler/ast.js'].lineData[61]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[62]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[63]++;
  self.value = expression;
  _$jscoverage['/compiler/ast.js'].lineData[64]++;
  self.escape = escape;
};
  _$jscoverage['/compiler/ast.js'].lineData[67]++;
  ast.ExpressionStatement.prototype.type = 'expressionStatement';
  _$jscoverage['/compiler/ast.js'].lineData[69]++;
  ast.ContentStatement = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[5]++;
  _$jscoverage['/compiler/ast.js'].lineData[70]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[71]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[72]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[75]++;
  ast.ContentStatement.prototype.type = 'contentStatement';
  _$jscoverage['/compiler/ast.js'].lineData[77]++;
  ast.UnaryExpression = function(unaryType, v) {
  _$jscoverage['/compiler/ast.js'].functionData[6]++;
  _$jscoverage['/compiler/ast.js'].lineData[78]++;
  this.value = v;
  _$jscoverage['/compiler/ast.js'].lineData[79]++;
  this.unaryType = unaryType;
};
  _$jscoverage['/compiler/ast.js'].lineData[90]++;
  ast.Command = function(lineNumber, id, params, hash) {
  _$jscoverage['/compiler/ast.js'].functionData[7]++;
  _$jscoverage['/compiler/ast.js'].lineData[91]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[92]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[93]++;
  self.id = id;
  _$jscoverage['/compiler/ast.js'].lineData[94]++;
  self.params = params;
  _$jscoverage['/compiler/ast.js'].lineData[95]++;
  self.hash = hash;
};
  _$jscoverage['/compiler/ast.js'].lineData[98]++;
  ast.Command.prototype.type = 'command';
  _$jscoverage['/compiler/ast.js'].lineData[100]++;
  ast.UnaryExpression.prototype.type = 'unaryExpression';
  _$jscoverage['/compiler/ast.js'].lineData[102]++;
  ast.MultiplicativeExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[8]++;
  _$jscoverage['/compiler/ast.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[104]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[105]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[106]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[109]++;
  ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';
  _$jscoverage['/compiler/ast.js'].lineData[111]++;
  ast.AdditiveExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[9]++;
  _$jscoverage['/compiler/ast.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[113]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[114]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[115]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[118]++;
  ast.AdditiveExpression.prototype.type = 'additiveExpression';
  _$jscoverage['/compiler/ast.js'].lineData[120]++;
  ast.RelationalExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[10]++;
  _$jscoverage['/compiler/ast.js'].lineData[121]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[122]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[123]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[124]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[127]++;
  ast.RelationalExpression.prototype.type = 'relationalExpression';
  _$jscoverage['/compiler/ast.js'].lineData[129]++;
  ast.EqualityExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[11]++;
  _$jscoverage['/compiler/ast.js'].lineData[130]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[131]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[132]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[133]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[136]++;
  ast.EqualityExpression.prototype.type = 'equalityExpression';
  _$jscoverage['/compiler/ast.js'].lineData[138]++;
  ast.ConditionalAndExpression = function(op1, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[12]++;
  _$jscoverage['/compiler/ast.js'].lineData[139]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[140]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[141]++;
  self.op2 = op2;
  _$jscoverage['/compiler/ast.js'].lineData[142]++;
  self.opType = '&&';
};
  _$jscoverage['/compiler/ast.js'].lineData[145]++;
  ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';
  _$jscoverage['/compiler/ast.js'].lineData[147]++;
  ast.ConditionalOrExpression = function(op1, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[13]++;
  _$jscoverage['/compiler/ast.js'].lineData[148]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[149]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[150]++;
  self.op2 = op2;
  _$jscoverage['/compiler/ast.js'].lineData[151]++;
  self.opType = '||';
};
  _$jscoverage['/compiler/ast.js'].lineData[154]++;
  ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';
  _$jscoverage['/compiler/ast.js'].lineData[156]++;
  ast.String = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[14]++;
  _$jscoverage['/compiler/ast.js'].lineData[157]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[158]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[159]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[162]++;
  ast.String.prototype.type = 'string';
  _$jscoverage['/compiler/ast.js'].lineData[164]++;
  ast.Number = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[15]++;
  _$jscoverage['/compiler/ast.js'].lineData[165]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[166]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[167]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[170]++;
  ast.Number.prototype.type = 'number';
  _$jscoverage['/compiler/ast.js'].lineData[172]++;
  ast.Boolean = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[16]++;
  _$jscoverage['/compiler/ast.js'].lineData[173]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[174]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[175]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[178]++;
  ast.Boolean.prototype.type = 'boolean';
  _$jscoverage['/compiler/ast.js'].lineData[180]++;
  ast.Hash = function(lineNumber) {
  _$jscoverage['/compiler/ast.js'].functionData[17]++;
  _$jscoverage['/compiler/ast.js'].lineData[181]++;
  var self = this, value = {};
  _$jscoverage['/compiler/ast.js'].lineData[183]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[184]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[187]++;
  ast.Hash.prototype.type = 'hash';
  _$jscoverage['/compiler/ast.js'].lineData[189]++;
  ast.Id = function(lineNumber, raw) {
  _$jscoverage['/compiler/ast.js'].functionData[18]++;
  _$jscoverage['/compiler/ast.js'].lineData[190]++;
  var self = this, parts = [], depth = 0;
  _$jscoverage['/compiler/ast.js'].lineData[193]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[194]++;
  for (var i = 0, l = raw.length; visit5_194_1(i < l); i++) {
    _$jscoverage['/compiler/ast.js'].lineData[195]++;
    var p = raw[i];
    _$jscoverage['/compiler/ast.js'].lineData[196]++;
    if (visit6_196_1(p === '..')) {
      _$jscoverage['/compiler/ast.js'].lineData[197]++;
      depth++;
    } else {
      _$jscoverage['/compiler/ast.js'].lineData[199]++;
      parts.push(p);
    }
  }
  _$jscoverage['/compiler/ast.js'].lineData[202]++;
  self.parts = parts;
  _$jscoverage['/compiler/ast.js'].lineData[203]++;
  self.string = parts.join('.');
  _$jscoverage['/compiler/ast.js'].lineData[204]++;
  self.depth = depth;
};
  _$jscoverage['/compiler/ast.js'].lineData[207]++;
  ast.Id.prototype.type = 'id';
  _$jscoverage['/compiler/ast.js'].lineData[209]++;
  return ast;
});
