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
if (! _$jscoverage['/html-parser/writer/beautify.js']) {
  _$jscoverage['/html-parser/writer/beautify.js'] = {};
  _$jscoverage['/html-parser/writer/beautify.js'].lineData = [];
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[190] = 0;
}
if (! _$jscoverage['/html-parser/writer/beautify.js'].functionData) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData = [];
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10] = 0;
}
if (! _$jscoverage['/html-parser/writer/beautify.js'].branchData) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['69'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['78'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['104'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['107'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['122'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['126'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['145'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['175'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['182'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['182'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/beautify.js'].branchData['182'][1].init(18, 16, 'this.allowIndent');
function visit361_182_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['175'][1].init(18, 16, 'this.allowIndent');
function visit360_175_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1].init(107, 11, '!this.inPre');
function visit359_166_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1].init(18, 16, 'this.allowIndent');
function visit358_163_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].init(608, 21, 'rules.breakAfterClose');
function visit357_156_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1].init(520, 17, 'tagName === "pre"');
function visit356_152_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['145'][1].init(315, 22, 'rules.breakBeforeClose');
function visit355_145_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1].init(233, 16, 'self.allowIndent');
function visit354_143_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1].init(141, 17, 'rules.allowIndent');
function visit353_139_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1].init(80, 25, 'self.rules[tagName] || {}');
function visit352_137_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1].init(448, 17, 'tagName === \'pre\'');
function visit351_129_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['126'][1].init(357, 20, 'rules.breakAfterOpen');
function visit350_126_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['122'][1].init(57, 17, 'rules.allowIndent');
function visit349_122_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].init(111, 15, 'el.isSelfClosed');
function visit348_118_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1].init(67, 25, 'this.rules[tagName] || {}');
function visit347_117_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['107'][1].init(193, 21, 'rules.breakBeforeOpen');
function visit346_107_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1].init(111, 16, 'this.allowIndent');
function visit345_105_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['104'][1].init(50, 25, 'this.rules[tagName] || {}');
function visit344_104_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1].init(18, 20, '!this.rules[tagName]');
function visit343_95_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].init(26, 25, '!(/[\\r\\n\\t ]/.test(o[j]))');
function visit342_83_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1].init(287, 6, 'j >= 0');
function visit341_82_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['78'][1].init(52, 23, '!this.inPre && o.length');
function visit340_78_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['69'][1].init(18, 11, '!this.inPre');
function visit339_69_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].lineData[5]++;
KISSY.add("html-parser/writer/beautify", function(S, BasicWriter, dtd, Utils) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[7]++;
  function BeautifyWriter() {
    _$jscoverage['/html-parser/writer/beautify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[8]++;
    var self = this;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[9]++;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[12]++;
    self.inPre = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[13]++;
    self.indentChar = "\t";
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[14]++;
    self.indentLevel = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[17]++;
    self.allowIndent = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[18]++;
    self.rules = {};
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[20]++;
    for (var e in S.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
  "select": 1, 
  "script": 1, 
  "style": 1})) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[33]++;
      self.setRules(e, {
  allowIndent: 1, 
  breakBeforeOpen: 1, 
  breakAfterOpen: 1, 
  breakBeforeClose: 1, 
  breakAfterClose: 1});
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[43]++;
    self.setRules('option', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[47]++;
    self.setRules('optiongroup', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[51]++;
    self.setRules('br', {
  breakAfterOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[55]++;
    self.setRules('title', {
  allowIndent: 0, 
  breakBeforeClose: 0, 
  breakAfterOpen: 0});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[62]++;
    self.setRules('pre', {
  allowIndent: 0});
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[67]++;
  S.extend(BeautifyWriter, BasicWriter, {
  indentation: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[69]++;
  if (visit339_69_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[70]++;
    this.append(new Array(this.indentLevel + 1).join(this.indentChar));
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[73]++;
  this.allowIndent = 0;
}, 
  lineBreak: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[77]++;
  var o = this.output;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78]++;
  if (visit340_78_1(!this.inPre && o.length)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[82]++;
    for (var j = o.length - 1; visit341_82_1(j >= 0); j--) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[83]++;
      if (visit342_83_1(!(/[\r\n\t ]/.test(o[j])))) {
        _$jscoverage['/html-parser/writer/beautify.js'].lineData[84]++;
        break;
      }
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[87]++;
    o.length = j + 1;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[88]++;
    this.append("\n");
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91]++;
  this.allowIndent = 1;
}, 
  setRules: function(tagName, rule) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[95]++;
  if (visit343_95_1(!this.rules[tagName])) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[96]++;
    this.rules[tagName] = {};
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[98]++;
  S.mix(this.rules[tagName], rule);
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[103]++;
  var tagName = el.tagName, rules = visit344_104_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[105]++;
  if (visit345_105_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[106]++;
    this.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[107]++;
    if (visit346_107_1(rules.breakBeforeOpen)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[108]++;
      this.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[109]++;
      this.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[111]++;
  BeautifyWriter.superclass.openTag.apply(this, arguments);
}, 
  openTagClose: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116]++;
  var tagName = el.tagName;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117]++;
  var rules = visit347_117_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118]++;
  if (visit348_118_1(el.isSelfClosed)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[119]++;
    this.append(" />");
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[121]++;
    this.append(">");
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[122]++;
    if (visit349_122_1(rules.allowIndent)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[123]++;
      this.indentLevel++;
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[126]++;
  if (visit350_126_1(rules.breakAfterOpen)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[127]++;
    this.lineBreak();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129]++;
  if (visit351_129_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[130]++;
    this.inPre = 1;
  }
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[135]++;
  var self = this, tagName = el.tagName, rules = visit352_137_1(self.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[139]++;
  if (visit353_139_1(rules.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[140]++;
    self.indentLevel--;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[143]++;
  if (visit354_143_1(self.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[144]++;
    self.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[145]++;
    if (visit355_145_1(rules.breakBeforeClose)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[146]++;
      self.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[147]++;
      self.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[150]++;
  BeautifyWriter.superclass.closeTag.apply(self, arguments);
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[152]++;
  if (visit356_152_1(tagName === "pre")) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[153]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[156]++;
  if (visit357_156_1(rules.breakAfterClose)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[157]++;
    self.lineBreak();
  }
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163]++;
  if (visit358_163_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[164]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[166]++;
  if (visit359_166_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[169]++;
    text = Utils.collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[171]++;
  this.append(text);
}, 
  comment: function(comment) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[175]++;
  if (visit360_175_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[176]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[178]++;
  this.append("<!--" + comment + "-->");
}, 
  cdata: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[182]++;
  if (visit361_182_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[183]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[185]++;
  this.append(S.trim(text));
}});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[190]++;
  return BeautifyWriter;
}, {
  requires: ['./basic', '../dtd', '../utils']});
