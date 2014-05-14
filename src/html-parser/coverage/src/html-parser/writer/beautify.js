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
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[185] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[199] = 0;
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
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['92'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['97'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['121'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['132'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['136'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['151'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['159'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['170'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['189'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['196'] = [];
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['196'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/beautify.js'].branchData['196'][1].init(18, 16, 'this.allowIndent');
function visit371_196_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['189'][1].init(18, 16, 'this.allowIndent');
function visit370_189_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['180'][1].init(107, 11, '!this.inPre');
function visit369_180_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1].init(18, 16, 'this.allowIndent');
function visit368_177_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['170'][1].init(608, 21, 'rules.breakAfterClose');
function visit367_170_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1].init(520, 17, 'tagName === \'pre\'');
function visit366_166_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['159'][1].init(315, 22, 'rules.breakBeforeClose');
function visit365_159_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1].init(233, 16, 'self.allowIndent');
function visit364_157_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1].init(141, 17, 'rules.allowIndent');
function visit363_153_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['151'][1].init(80, 25, 'self.rules[tagName] || {}');
function visit362_151_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1].init(449, 17, 'tagName === \'pre\'');
function visit361_143_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].init(358, 20, 'rules.breakAfterOpen');
function visit360_140_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['136'][1].init(57, 17, 'rules.allowIndent');
function visit359_136_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['132'][1].init(111, 15, 'el.isSelfClosed');
function visit358_132_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1].init(67, 25, 'this.rules[tagName] || {}');
function visit357_131_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['121'][1].init(193, 21, 'rules.breakBeforeOpen');
function visit356_121_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1].init(111, 16, 'this.allowIndent');
function visit355_119_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].init(50, 25, 'this.rules[tagName] || {}');
function visit354_118_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['109'][1].init(18, 20, '!this.rules[tagName]');
function visit353_109_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['97'][1].init(26, 25, '!(/[\\r\\n\\t ]/.test(o[j]))');
function visit352_97_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].init(287, 6, 'j >= 0');
function visit351_96_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['92'][1].init(52, 23, '!this.inPre && o.length');
function visit350_92_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].init(18, 11, '!this.inPre');
function visit349_83_1(result) {
  _$jscoverage['/html-parser/writer/beautify.js'].branchData['83'][1].ranCondition(result);
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
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[10]++;
  var util = require('util');
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[12]++;
  function BeautifyWriter() {
    _$jscoverage['/html-parser/writer/beautify.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[13]++;
    var self = this;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[14]++;
    BeautifyWriter.superclass.constructor.apply(self, arguments);
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[17]++;
    self.inPre = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[18]++;
    self.indentChar = '\t';
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[19]++;
    self.indentLevel = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[22]++;
    self.allowIndent = 0;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[23]++;
    self.rules = {};
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[25]++;
    var beauty = util.merge(dtd.$nonBodyContent, dtd.$block, dtd.$listItem, dtd.$tableContent, {
  select: 1, 
  script: 1, 
  style: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[36]++;
    for (var e in beauty) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[38]++;
      self.setRules(e, {
  allowIndent: 1, 
  breakBeforeOpen: 1, 
  breakAfterOpen: 1, 
  breakBeforeClose: 1, 
  breakAfterClose: 1});
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[47]++;
    util.each(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function(e) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[2]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[49]++;
  self.setRules(e, {
  allowIndent: 0, 
  breakAfterOpen: 0, 
  breakBeforeClose: 0});
});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[56]++;
    self.setRules('option', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[60]++;
    self.setRules('optiongroup', {
  breakBeforeOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[64]++;
    self.setRules('br', {
  breakAfterOpen: 1});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[68]++;
    self.setRules('title', {
  allowIndent: 0, 
  breakBeforeClose: 0, 
  breakAfterOpen: 0});
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[75]++;
    self.setRules('pre', {
  breakAfterOpen: 1, 
  allowIndent: 0});
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[81]++;
  util.extend(BeautifyWriter, BasicWriter, {
  indentation: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[3]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[83]++;
  if (visit349_83_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[84]++;
    this.append(new Array(this.indentLevel + 1).join(this.indentChar));
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[87]++;
  this.allowIndent = 0;
}, 
  lineBreak: function() {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[91]++;
  var o = this.output;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[92]++;
  if (visit350_92_1(!this.inPre && o.length)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[96]++;
    for (var j = o.length - 1; visit351_96_1(j >= 0); j--) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[97]++;
      if (visit352_97_1(!(/[\r\n\t ]/.test(o[j])))) {
        _$jscoverage['/html-parser/writer/beautify.js'].lineData[98]++;
        break;
      }
    }
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[101]++;
    o.length = j + 1;
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[102]++;
    this.append('\n');
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[105]++;
  this.allowIndent = 1;
}, 
  setRules: function(tagName, rule) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[5]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[109]++;
  if (visit353_109_1(!this.rules[tagName])) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[110]++;
    this.rules[tagName] = {};
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[112]++;
  util.mix(this.rules[tagName], rule);
}, 
  openTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[6]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[117]++;
  var tagName = el.tagName, rules = visit354_118_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[119]++;
  if (visit355_119_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[120]++;
    this.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[121]++;
    if (visit356_121_1(rules.breakBeforeOpen)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[122]++;
      this.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[123]++;
      this.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[125]++;
  BeautifyWriter.superclass.openTag.apply(this, arguments);
}, 
  openTagClose: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[130]++;
  var tagName = el.tagName;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[131]++;
  var rules = visit357_131_1(this.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[132]++;
  if (visit358_132_1(el.isSelfClosed)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[133]++;
    this.append(' />');
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[135]++;
    this.append('>');
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[136]++;
    if (visit359_136_1(rules.allowIndent)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[137]++;
      this.indentLevel++;
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[140]++;
  if (visit360_140_1(rules.breakAfterOpen)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[141]++;
    this.lineBreak();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[143]++;
  if (visit361_143_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[144]++;
    this.inPre = 1;
  }
}, 
  closeTag: function(el) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[149]++;
  var self = this, tagName = el.tagName, rules = visit362_151_1(self.rules[tagName] || {});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[153]++;
  if (visit363_153_1(rules.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[154]++;
    self.indentLevel--;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[157]++;
  if (visit364_157_1(self.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[158]++;
    self.indentation();
  } else {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[159]++;
    if (visit365_159_1(rules.breakBeforeClose)) {
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[160]++;
      self.lineBreak();
      _$jscoverage['/html-parser/writer/beautify.js'].lineData[161]++;
      self.indentation();
    }
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[164]++;
  BeautifyWriter.superclass.closeTag.apply(self, arguments);
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[166]++;
  if (visit366_166_1(tagName === 'pre')) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[167]++;
    self.inPre = 0;
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[170]++;
  if (visit367_170_1(rules.breakAfterClose)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[171]++;
    self.lineBreak();
  }
}, 
  text: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[177]++;
  if (visit368_177_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[178]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[180]++;
  if (visit369_180_1(!this.inPre)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[183]++;
    text = Utils.collapseWhitespace(text);
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[185]++;
  this.append(text);
}, 
  comment: function(comment) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[189]++;
  if (visit370_189_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[190]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[192]++;
  this.append('<!--' + comment + '-->');
}, 
  cdata: function(text) {
  _$jscoverage['/html-parser/writer/beautify.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[196]++;
  if (visit371_196_1(this.allowIndent)) {
    _$jscoverage['/html-parser/writer/beautify.js'].lineData[197]++;
    this.indentation();
  }
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[199]++;
  this.append(util.trim(text));
}});
  _$jscoverage['/html-parser/writer/beautify.js'].lineData[203]++;
  return BeautifyWriter;
});
