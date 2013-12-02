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
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[86] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[203] = 0;
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
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[11] = 0;
}
if (! _$jscoverage['/html-parser/writer/beautify.js'].branchData) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData = {};
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['91'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['120'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['135'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['142'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['158'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['165'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['179'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['188'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['195'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/beautify.js'].branchData['195'][1].init(17, 16, 'this.allowIndent');
function visit372_195_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['188'][1].init(17, 16, 'this.allowIndent');
function visit371_188_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['179'][1].init(103, 11, '!this.inPre');
function visit370_179_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1].init(17, 16, 'this.allowIndent');
function visit369_176_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['169'][1].init(586, 21, 'rules.breakAfterClose');
function visit368_169_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['165'][1].init(502, 17, 'tagName === \'pre\'');
function visit367_165_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['158'][1].init(304, 22, 'rules.breakBeforeClose');
function visit366_158_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].init(224, 16, 'self.allowIndent');
function visit365_156_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1].init(136, 17, 'rules.allowIndent');
function visit364_152_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1].init(78, 25, 'self.rules[tagName] || {}');
function visit363_150_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['142'][1].init(434, 17, 'tagName === \'pre\'');
function visit362_142_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1].init(346, 20, 'rules.breakAfterOpen');
function visit361_139_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['135'][1].init(55, 17, 'rules.allowIndent');
function visit360_135_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1].init(107, 15, 'el.isSelfClosed');
function visit359_131_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1].init(64, 25, 'this.rules[tagName] || {}');
function visit358_130_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['120'][1].init(187, 21, 'rules.breakBeforeOpen');
function visit357_120_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].init(107, 16, 'this.allowIndent');
function visit356_118_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1].init(49, 25, 'this.rules[tagName] || {}');
function visit355_117_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1].init(17, 20, '!this.rules[tagName]');
function visit354_108_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].init(25, 25, '!(/[\\r\\n\\t ]/.test(o[j]))');
function visit353_96_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1].init(283, 6, 'j >= 0');
function visit352_95_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['91'][1].init(50, 23, '!this.inPre && o.length');
function visit351_91_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1].init(17, 11, '!this.inPre');
function visit350_82_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[7]++;
  var BasicWriter = require('./basic');
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[8]++;
  var dtd = require('../dtd');
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[9]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[11]++;
  function BeautifyWriter() {
    _$jscoverage['/html-parser/writer/beautify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[12]++;
    var self = this;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[13]++;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[16]++;
    self.inPre = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[17]++;
    self.indentChar = '\t';
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[18]++;
    self.indentLevel = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[21]++;
    self.allowIndent = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[22]++;
    self.rules = {};
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[24]++;
    var beauty = S.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
  'select': 1, 
  'script': 1, 
  'style': 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[35]++;
    for (var e in beauty) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[37]++;
      self.setRules(e, {
  allowIndent: 1, 
  breakBeforeOpen: 1, 
  breakAfterOpen: 1, 
  breakBeforeClose: 1, 
  breakAfterClose: 1});
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[46]++;
    S.each(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function(e) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[48]++;
  self.setRules(e, {
  allowIndent: 0, 
  breakAfterOpen: 0, 
  breakBeforeClose: 0});
});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[55]++;
    self.setRules('option', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[59]++;
    self.setRules('optiongroup', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[63]++;
    self.setRules('br', {
  breakAfterOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[67]++;
    self.setRules('title', {
  allowIndent: 0, 
  breakBeforeClose: 0, 
  breakAfterOpen: 0});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[74]++;
    self.setRules('pre', {
  breakAfterOpen: 1, 
  allowIndent: 0});
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[80]++;
  S.extend(BeautifyWriter, BasicWriter, {
  indentation: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[82]++;
  if (visit350_82_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[83]++;
    this.append(new Array(this.indentLevel + 1).join(this.indentChar));
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[86]++;
  this.allowIndent = 0;
}, 
  lineBreak: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[90]++;
  var o = this.output;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91]++;
  if (visit351_91_1(!this.inPre && o.length)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[95]++;
    for (var j = o.length - 1; visit352_95_1(j >= 0); j--) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[96]++;
      if (visit353_96_1(!(/[\r\n\t ]/.test(o[j])))) {
        _$jscoverage['/html-parser/writer/beautify.js'].lineData[97]++;
        break;
      }
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[100]++;
    o.length = j + 1;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[101]++;
    this.append('\n');
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[104]++;
  this.allowIndent = 1;
}, 
  setRules: function(tagName, rule) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[108]++;
  if (visit354_108_1(!this.rules[tagName])) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[109]++;
    this.rules[tagName] = {};
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[111]++;
  S.mix(this.rules[tagName], rule);
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[116]++;
  var tagName = el.tagName, rules = visit355_117_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[118]++;
  if (visit356_118_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[119]++;
    this.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[120]++;
    if (visit357_120_1(rules.breakBeforeOpen)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[121]++;
      this.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[122]++;
      this.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[124]++;
  BeautifyWriter.superclass.openTag.apply(this, arguments);
}, 
  openTagClose: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[129]++;
  var tagName = el.tagName;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130]++;
  var rules = visit358_130_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[131]++;
  if (visit359_131_1(el.isSelfClosed)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[132]++;
    this.append(' />');
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[134]++;
    this.append('>');
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[135]++;
    if (visit360_135_1(rules.allowIndent)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[136]++;
      this.indentLevel++;
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[139]++;
  if (visit361_139_1(rules.breakAfterOpen)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[140]++;
    this.lineBreak();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[142]++;
  if (visit362_142_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[143]++;
    this.inPre = 1;
  }
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[148]++;
  var self = this, tagName = el.tagName, rules = visit363_150_1(self.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[152]++;
  if (visit364_152_1(rules.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[153]++;
    self.indentLevel--;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[156]++;
  if (visit365_156_1(self.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[157]++;
    self.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[158]++;
    if (visit366_158_1(rules.breakBeforeClose)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[159]++;
      self.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[160]++;
      self.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[163]++;
  BeautifyWriter.superclass.closeTag.apply(self, arguments);
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[165]++;
  if (visit367_165_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[166]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[169]++;
  if (visit368_169_1(rules.breakAfterClose)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[170]++;
    self.lineBreak();
  }
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[176]++;
  if (visit369_176_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[177]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[179]++;
  if (visit370_179_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[182]++;
    text = Utils.collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[184]++;
  this.append(text);
}, 
  comment: function(comment) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[188]++;
  if (visit371_188_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[189]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[191]++;
  this.append('<!--' + comment + '-->');
}, 
  cdata: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[195]++;
  if (visit372_195_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[196]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[198]++;
  this.append(S.trim(text));
}});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[203]++;
  return BeautifyWriter;
});
