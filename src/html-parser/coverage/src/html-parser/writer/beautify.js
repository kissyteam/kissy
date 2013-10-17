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
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[191] = 0;
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
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['70'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['79'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['123'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['127'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['138'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['144'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['146'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['164'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['183'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/beautify.js'].branchData['183'][1].init(18, 16, 'this.allowIndent');
function visit370_183_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1].init(18, 16, 'this.allowIndent');
function visit369_176_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1].init(107, 11, '!this.inPre');
function visit368_167_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['164'][1].init(18, 16, 'this.allowIndent');
function visit367_164_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1].init(608, 21, 'rules.breakAfterClose');
function visit366_157_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1].init(520, 17, 'tagName === "pre"');
function visit365_153_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['146'][1].init(315, 22, 'rules.breakBeforeClose');
function visit364_146_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['144'][1].init(233, 16, 'self.allowIndent');
function visit363_144_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].init(141, 17, 'rules.allowIndent');
function visit362_140_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['138'][1].init(80, 25, 'self.rules[tagName] || {}');
function visit361_138_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1].init(448, 17, 'tagName === \'pre\'');
function visit360_130_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['127'][1].init(357, 20, 'rules.breakAfterOpen');
function visit359_127_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['123'][1].init(57, 17, 'rules.allowIndent');
function visit358_123_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1].init(111, 15, 'el.isSelfClosed');
function visit357_119_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].init(67, 25, 'this.rules[tagName] || {}');
function visit356_118_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1].init(193, 21, 'rules.breakBeforeOpen');
function visit355_108_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1].init(111, 16, 'this.allowIndent');
function visit354_106_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1].init(50, 25, 'this.rules[tagName] || {}');
function visit353_105_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].init(18, 20, '!this.rules[tagName]');
function visit352_96_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['84'][1].init(26, 25, '!(/[\\r\\n\\t ]/.test(o[j]))');
function visit351_84_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].init(287, 6, 'j >= 0');
function visit350_83_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['79'][1].init(52, 23, '!this.inPre && o.length');
function visit349_79_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['70'][1].init(18, 11, '!this.inPre');
function visit348_70_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].lineData[6]++;
KISSY.add("html-parser/writer/beautify", function(S, BasicWriter, dtd, Utils) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8]++;
  function BeautifyWriter() {
    _$jscoverage['/html-parser/writer/beautify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[9]++;
    var self = this;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[10]++;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[13]++;
    self.inPre = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[14]++;
    self.indentChar = "\t";
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[15]++;
    self.indentLevel = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[18]++;
    self.allowIndent = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[19]++;
    self.rules = {};
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[21]++;
    for (var e in S.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
  "select": 1, 
  "script": 1, 
  "style": 1})) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[34]++;
      self.setRules(e, {
  allowIndent: 1, 
  breakBeforeOpen: 1, 
  breakAfterOpen: 1, 
  breakBeforeClose: 1, 
  breakAfterClose: 1});
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[44]++;
    self.setRules('option', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[48]++;
    self.setRules('optiongroup', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[52]++;
    self.setRules('br', {
  breakAfterOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[56]++;
    self.setRules('title', {
  allowIndent: 0, 
  breakBeforeClose: 0, 
  breakAfterOpen: 0});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[63]++;
    self.setRules('pre', {
  allowIndent: 0});
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[68]++;
  S.extend(BeautifyWriter, BasicWriter, {
  indentation: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[70]++;
  if (visit348_70_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[71]++;
    this.append(new Array(this.indentLevel + 1).join(this.indentChar));
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[74]++;
  this.allowIndent = 0;
}, 
  lineBreak: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[78]++;
  var o = this.output;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[79]++;
  if (visit349_79_1(!this.inPre && o.length)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[83]++;
    for (var j = o.length - 1; visit350_83_1(j >= 0); j--) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[84]++;
      if (visit351_84_1(!(/[\r\n\t ]/.test(o[j])))) {
        _$jscoverage['/html-parser/writer/beautify.js'].lineData[85]++;
        break;
      }
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[88]++;
    o.length = j + 1;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[89]++;
    this.append("\n");
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[92]++;
  this.allowIndent = 1;
}, 
  setRules: function(tagName, rule) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[96]++;
  if (visit352_96_1(!this.rules[tagName])) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[97]++;
    this.rules[tagName] = {};
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[99]++;
  S.mix(this.rules[tagName], rule);
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[104]++;
  var tagName = el.tagName, rules = visit353_105_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[106]++;
  if (visit354_106_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[107]++;
    this.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[108]++;
    if (visit355_108_1(rules.breakBeforeOpen)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[109]++;
      this.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[110]++;
      this.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[112]++;
  BeautifyWriter.superclass.openTag.apply(this, arguments);
}, 
  openTagClose: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117]++;
  var tagName = el.tagName;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118]++;
  var rules = visit356_118_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119]++;
  if (visit357_119_1(el.isSelfClosed)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[120]++;
    this.append(" />");
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[122]++;
    this.append(">");
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[123]++;
    if (visit358_123_1(rules.allowIndent)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[124]++;
      this.indentLevel++;
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[127]++;
  if (visit359_127_1(rules.breakAfterOpen)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[128]++;
    this.lineBreak();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130]++;
  if (visit360_130_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[131]++;
    this.inPre = 1;
  }
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[136]++;
  var self = this, tagName = el.tagName, rules = visit361_138_1(self.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140]++;
  if (visit362_140_1(rules.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[141]++;
    self.indentLevel--;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[144]++;
  if (visit363_144_1(self.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[145]++;
    self.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[146]++;
    if (visit364_146_1(rules.breakBeforeClose)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[147]++;
      self.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[148]++;
      self.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[151]++;
  BeautifyWriter.superclass.closeTag.apply(self, arguments);
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153]++;
  if (visit365_153_1(tagName === "pre")) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[154]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157]++;
  if (visit366_157_1(rules.breakAfterClose)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[158]++;
    self.lineBreak();
  }
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164]++;
  if (visit367_164_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[165]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[167]++;
  if (visit368_167_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[170]++;
    text = Utils.collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[172]++;
  this.append(text);
}, 
  comment: function(comment) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[176]++;
  if (visit369_176_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[177]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[179]++;
  this.append("<!--" + comment + "-->");
}, 
  cdata: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[183]++;
  if (visit370_183_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[184]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[186]++;
  this.append(S.trim(text));
}});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[191]++;
  return BeautifyWriter;
}, {
  requires: ['./basic', '../dtd', '../utils']});
