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
  _$jscoverage['/compiler/ast.js'].lineData[16] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[17] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[18] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[19] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[20] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[23] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[25] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[26] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[28] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[29] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[35] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[37] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[38] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[39] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[42] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[52] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[53] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[54] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[55] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[56] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[57] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[58] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[61] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[64] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[67] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[68] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[69] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[70] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[71] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[74] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[76] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[77] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[78] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[79] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[82] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[84] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[85] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[86] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[89] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[91] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[92] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[93] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[94] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[95] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[98] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[100] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[101] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[102] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[103] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[104] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[107] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[109] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[110] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[111] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[112] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[113] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[116] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[118] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[119] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[120] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[121] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[122] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[125] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[127] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[128] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[129] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[130] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[133] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[135] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[136] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[137] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[138] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[141] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[143] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[144] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[145] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[146] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[149] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[151] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[152] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[153] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[154] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[157] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[159] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[160] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[161] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[162] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[165] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[167] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[168] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[169] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[170] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[171] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[173] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[176] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[178] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[179] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[180] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[181] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[182] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[183] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[185] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[188] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[189] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[190] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[193] = 0;
  _$jscoverage['/compiler/ast.js'].lineData[195] = 0;
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
  _$jscoverage['/compiler/ast.js'].functionData[19] = 0;
}
if (! _$jscoverage['/compiler/ast.js'].branchData) {
  _$jscoverage['/compiler/ast.js'].branchData = {};
  _$jscoverage['/compiler/ast.js'].branchData['28'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/compiler/ast.js'].branchData['182'] = [];
  _$jscoverage['/compiler/ast.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/compiler/ast.js'].branchData['182'][1].init(17, 10, 'p === \'..\'');
function visit2_182_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].branchData['28'][1].init(91, 37, '!S.equals(tpl.path.parts, closeParts)');
function visit1_28_1(result) {
  _$jscoverage['/compiler/ast.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler/ast.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/compiler/ast.js'].functionData[0]++;
  _$jscoverage['/compiler/ast.js'].lineData[7]++;
  var ast = {};
  _$jscoverage['/compiler/ast.js'].lineData[16]++;
  ast.ProgramNode = function(lineNumber, statements, inverse) {
  _$jscoverage['/compiler/ast.js'].functionData[1]++;
  _$jscoverage['/compiler/ast.js'].lineData[17]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[18]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[19]++;
  self.statements = statements;
  _$jscoverage['/compiler/ast.js'].lineData[20]++;
  self.inverse = inverse;
};
  _$jscoverage['/compiler/ast.js'].lineData[23]++;
  ast.ProgramNode.prototype.type = 'program';
  _$jscoverage['/compiler/ast.js'].lineData[25]++;
  ast.BlockNode = function(lineNumber, tpl, program, close) {
  _$jscoverage['/compiler/ast.js'].functionData[2]++;
  _$jscoverage['/compiler/ast.js'].lineData[26]++;
  var closeParts = close.parts, self = this, e;
  _$jscoverage['/compiler/ast.js'].lineData[28]++;
  if (visit1_28_1(!S.equals(tpl.path.parts, closeParts))) {
    _$jscoverage['/compiler/ast.js'].lineData[29]++;
    e = ('Syntax error at line ' + lineNumber + ':\n' + 'expect {{/' + tpl.path.parts + '}} not {{/' + closeParts + '}}');
    _$jscoverage['/compiler/ast.js'].lineData[35]++;
    S.error(e);
  }
  _$jscoverage['/compiler/ast.js'].lineData[37]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[38]++;
  self.tpl = tpl;
  _$jscoverage['/compiler/ast.js'].lineData[39]++;
  self.program = program;
};
  _$jscoverage['/compiler/ast.js'].lineData[42]++;
  ast.BlockNode.prototype.type = 'block';
  _$jscoverage['/compiler/ast.js'].lineData[52]++;
  ast.TplNode = function(lineNumber, path, params, hash) {
  _$jscoverage['/compiler/ast.js'].functionData[3]++;
  _$jscoverage['/compiler/ast.js'].lineData[53]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[54]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[55]++;
  self.path = path;
  _$jscoverage['/compiler/ast.js'].lineData[56]++;
  self.params = params;
  _$jscoverage['/compiler/ast.js'].lineData[57]++;
  self.hash = hash;
  _$jscoverage['/compiler/ast.js'].lineData[58]++;
  self.escaped = true;
  _$jscoverage['/compiler/ast.js'].lineData[61]++;
  self.isInverted = false;
};
  _$jscoverage['/compiler/ast.js'].lineData[64]++;
  ast.TplNode.prototype.type = 'tpl';
  _$jscoverage['/compiler/ast.js'].lineData[67]++;
  ast.TplExpressionNode = function(lineNumber, expression) {
  _$jscoverage['/compiler/ast.js'].functionData[4]++;
  _$jscoverage['/compiler/ast.js'].lineData[68]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[69]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[70]++;
  self.expression = expression;
  _$jscoverage['/compiler/ast.js'].lineData[71]++;
  self.escaped = true;
};
  _$jscoverage['/compiler/ast.js'].lineData[74]++;
  ast.TplExpressionNode.prototype.type = 'tplExpression';
  _$jscoverage['/compiler/ast.js'].lineData[76]++;
  ast.ContentNode = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[5]++;
  _$jscoverage['/compiler/ast.js'].lineData[77]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[78]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[79]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[82]++;
  ast.ContentNode.prototype.type = 'content';
  _$jscoverage['/compiler/ast.js'].lineData[84]++;
  ast.UnaryExpression = function(unaryType, v) {
  _$jscoverage['/compiler/ast.js'].functionData[6]++;
  _$jscoverage['/compiler/ast.js'].lineData[85]++;
  this.value = v;
  _$jscoverage['/compiler/ast.js'].lineData[86]++;
  this.unaryType = unaryType;
};
  _$jscoverage['/compiler/ast.js'].lineData[89]++;
  ast.UnaryExpression.prototype.type = 'unaryExpression';
  _$jscoverage['/compiler/ast.js'].lineData[91]++;
  ast.MultiplicativeExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[7]++;
  _$jscoverage['/compiler/ast.js'].lineData[92]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[93]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[94]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[95]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[98]++;
  ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';
  _$jscoverage['/compiler/ast.js'].lineData[100]++;
  ast.AdditiveExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[8]++;
  _$jscoverage['/compiler/ast.js'].lineData[101]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[102]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[103]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[104]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[107]++;
  ast.AdditiveExpression.prototype.type = 'additiveExpression';
  _$jscoverage['/compiler/ast.js'].lineData[109]++;
  ast.RelationalExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[9]++;
  _$jscoverage['/compiler/ast.js'].lineData[110]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[111]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[112]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[113]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[116]++;
  ast.RelationalExpression.prototype.type = 'relationalExpression';
  _$jscoverage['/compiler/ast.js'].lineData[118]++;
  ast.EqualityExpression = function(op1, opType, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[10]++;
  _$jscoverage['/compiler/ast.js'].lineData[119]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[120]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[121]++;
  self.opType = opType;
  _$jscoverage['/compiler/ast.js'].lineData[122]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[125]++;
  ast.EqualityExpression.prototype.type = 'equalityExpression';
  _$jscoverage['/compiler/ast.js'].lineData[127]++;
  ast.ConditionalAndExpression = function(op1, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[11]++;
  _$jscoverage['/compiler/ast.js'].lineData[128]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[129]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[130]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[133]++;
  ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';
  _$jscoverage['/compiler/ast.js'].lineData[135]++;
  ast.ConditionalOrExpression = function(op1, op2) {
  _$jscoverage['/compiler/ast.js'].functionData[12]++;
  _$jscoverage['/compiler/ast.js'].lineData[136]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[137]++;
  self.op1 = op1;
  _$jscoverage['/compiler/ast.js'].lineData[138]++;
  self.op2 = op2;
};
  _$jscoverage['/compiler/ast.js'].lineData[141]++;
  ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';
  _$jscoverage['/compiler/ast.js'].lineData[143]++;
  ast.StringNode = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[13]++;
  _$jscoverage['/compiler/ast.js'].lineData[144]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[145]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[146]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[149]++;
  ast.StringNode.prototype.type = 'string';
  _$jscoverage['/compiler/ast.js'].lineData[151]++;
  ast.NumberNode = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[14]++;
  _$jscoverage['/compiler/ast.js'].lineData[152]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[153]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[154]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[157]++;
  ast.NumberNode.prototype.type = 'number';
  _$jscoverage['/compiler/ast.js'].lineData[159]++;
  ast.BooleanNode = function(lineNumber, value) {
  _$jscoverage['/compiler/ast.js'].functionData[15]++;
  _$jscoverage['/compiler/ast.js'].lineData[160]++;
  var self = this;
  _$jscoverage['/compiler/ast.js'].lineData[161]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[162]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[165]++;
  ast.BooleanNode.prototype.type = 'boolean';
  _$jscoverage['/compiler/ast.js'].lineData[167]++;
  ast.HashNode = function(lineNumber, raw) {
  _$jscoverage['/compiler/ast.js'].functionData[16]++;
  _$jscoverage['/compiler/ast.js'].lineData[168]++;
  var self = this, value = {};
  _$jscoverage['/compiler/ast.js'].lineData[169]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[170]++;
  S.each(raw, function(r) {
  _$jscoverage['/compiler/ast.js'].functionData[17]++;
  _$jscoverage['/compiler/ast.js'].lineData[171]++;
  value[r[0]] = r[1];
});
  _$jscoverage['/compiler/ast.js'].lineData[173]++;
  self.value = value;
};
  _$jscoverage['/compiler/ast.js'].lineData[176]++;
  ast.HashNode.prototype.type = 'hash';
  _$jscoverage['/compiler/ast.js'].lineData[178]++;
  ast.IdNode = function(lineNumber, raw) {
  _$jscoverage['/compiler/ast.js'].functionData[18]++;
  _$jscoverage['/compiler/ast.js'].lineData[179]++;
  var self = this, parts = [], depth = 0;
  _$jscoverage['/compiler/ast.js'].lineData[180]++;
  self.lineNumber = lineNumber;
  _$jscoverage['/compiler/ast.js'].lineData[181]++;
  S.each(raw, function(p) {
  _$jscoverage['/compiler/ast.js'].functionData[19]++;
  _$jscoverage['/compiler/ast.js'].lineData[182]++;
  if (visit2_182_1(p === '..')) {
    _$jscoverage['/compiler/ast.js'].lineData[183]++;
    depth++;
  } else {
    _$jscoverage['/compiler/ast.js'].lineData[185]++;
    parts.push(p);
  }
});
  _$jscoverage['/compiler/ast.js'].lineData[188]++;
  self.parts = parts;
  _$jscoverage['/compiler/ast.js'].lineData[189]++;
  self.string = parts.join('.');
  _$jscoverage['/compiler/ast.js'].lineData[190]++;
  self.depth = depth;
};
  _$jscoverage['/compiler/ast.js'].lineData[193]++;
  ast.IdNode.prototype.type = 'id';
  _$jscoverage['/compiler/ast.js'].lineData[195]++;
  return ast;
});
