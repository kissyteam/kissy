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
if (! _$jscoverage['/web.js']) {
  _$jscoverage['/web.js'] = {};
  _$jscoverage['/web.js'].lineData = [];
  _$jscoverage['/web.js'].lineData[6] = 0;
  _$jscoverage['/web.js'].lineData[7] = 0;
  _$jscoverage['/web.js'].lineData[29] = 0;
  _$jscoverage['/web.js'].lineData[31] = 0;
  _$jscoverage['/web.js'].lineData[34] = 0;
  _$jscoverage['/web.js'].lineData[36] = 0;
  _$jscoverage['/web.js'].lineData[39] = 0;
  _$jscoverage['/web.js'].lineData[45] = 0;
  _$jscoverage['/web.js'].lineData[55] = 0;
  _$jscoverage['/web.js'].lineData[56] = 0;
  _$jscoverage['/web.js'].lineData[58] = 0;
  _$jscoverage['/web.js'].lineData[59] = 0;
  _$jscoverage['/web.js'].lineData[61] = 0;
  _$jscoverage['/web.js'].lineData[62] = 0;
  _$jscoverage['/web.js'].lineData[64] = 0;
  _$jscoverage['/web.js'].lineData[65] = 0;
  _$jscoverage['/web.js'].lineData[66] = 0;
  _$jscoverage['/web.js'].lineData[69] = 0;
  _$jscoverage['/web.js'].lineData[70] = 0;
  _$jscoverage['/web.js'].lineData[71] = 0;
  _$jscoverage['/web.js'].lineData[73] = 0;
  _$jscoverage['/web.js'].lineData[74] = 0;
  _$jscoverage['/web.js'].lineData[76] = 0;
  _$jscoverage['/web.js'].lineData[84] = 0;
  _$jscoverage['/web.js'].lineData[87] = 0;
  _$jscoverage['/web.js'].lineData[88] = 0;
  _$jscoverage['/web.js'].lineData[100] = 0;
  _$jscoverage['/web.js'].lineData[101] = 0;
  _$jscoverage['/web.js'].lineData[102] = 0;
  _$jscoverage['/web.js'].lineData[104] = 0;
  _$jscoverage['/web.js'].lineData[105] = 0;
  _$jscoverage['/web.js'].lineData[106] = 0;
  _$jscoverage['/web.js'].lineData[110] = 0;
  _$jscoverage['/web.js'].lineData[112] = 0;
  _$jscoverage['/web.js'].lineData[122] = 0;
  _$jscoverage['/web.js'].lineData[123] = 0;
  _$jscoverage['/web.js'].lineData[124] = 0;
  _$jscoverage['/web.js'].lineData[125] = 0;
  _$jscoverage['/web.js'].lineData[126] = 0;
  _$jscoverage['/web.js'].lineData[127] = 0;
  _$jscoverage['/web.js'].lineData[129] = 0;
  _$jscoverage['/web.js'].lineData[130] = 0;
  _$jscoverage['/web.js'].lineData[131] = 0;
  _$jscoverage['/web.js'].lineData[132] = 0;
  _$jscoverage['/web.js'].lineData[138] = 0;
  _$jscoverage['/web.js'].lineData[139] = 0;
  _$jscoverage['/web.js'].lineData[140] = 0;
  _$jscoverage['/web.js'].lineData[143] = 0;
  _$jscoverage['/web.js'].lineData[144] = 0;
  _$jscoverage['/web.js'].lineData[146] = 0;
  _$jscoverage['/web.js'].lineData[147] = 0;
  _$jscoverage['/web.js'].lineData[148] = 0;
  _$jscoverage['/web.js'].lineData[149] = 0;
  _$jscoverage['/web.js'].lineData[151] = 0;
  _$jscoverage['/web.js'].lineData[152] = 0;
  _$jscoverage['/web.js'].lineData[153] = 0;
  _$jscoverage['/web.js'].lineData[160] = 0;
  _$jscoverage['/web.js'].lineData[163] = 0;
  _$jscoverage['/web.js'].lineData[164] = 0;
  _$jscoverage['/web.js'].lineData[165] = 0;
  _$jscoverage['/web.js'].lineData[169] = 0;
  _$jscoverage['/web.js'].lineData[172] = 0;
  _$jscoverage['/web.js'].lineData[173] = 0;
  _$jscoverage['/web.js'].lineData[174] = 0;
  _$jscoverage['/web.js'].lineData[175] = 0;
  _$jscoverage['/web.js'].lineData[178] = 0;
  _$jscoverage['/web.js'].lineData[182] = 0;
  _$jscoverage['/web.js'].lineData[183] = 0;
  _$jscoverage['/web.js'].lineData[184] = 0;
  _$jscoverage['/web.js'].lineData[185] = 0;
  _$jscoverage['/web.js'].lineData[191] = 0;
  _$jscoverage['/web.js'].lineData[195] = 0;
  _$jscoverage['/web.js'].lineData[198] = 0;
  _$jscoverage['/web.js'].lineData[199] = 0;
  _$jscoverage['/web.js'].lineData[201] = 0;
  _$jscoverage['/web.js'].lineData[205] = 0;
  _$jscoverage['/web.js'].lineData[206] = 0;
  _$jscoverage['/web.js'].lineData[207] = 0;
  _$jscoverage['/web.js'].lineData[209] = 0;
  _$jscoverage['/web.js'].lineData[210] = 0;
  _$jscoverage['/web.js'].lineData[212] = 0;
  _$jscoverage['/web.js'].lineData[215] = 0;
  _$jscoverage['/web.js'].lineData[221] = 0;
  _$jscoverage['/web.js'].lineData[222] = 0;
  _$jscoverage['/web.js'].lineData[229] = 0;
  _$jscoverage['/web.js'].lineData[231] = 0;
  _$jscoverage['/web.js'].lineData[232] = 0;
  _$jscoverage['/web.js'].lineData[233] = 0;
}
if (! _$jscoverage['/web.js'].functionData) {
  _$jscoverage['/web.js'].functionData = [];
  _$jscoverage['/web.js'].functionData[0] = 0;
  _$jscoverage['/web.js'].functionData[1] = 0;
  _$jscoverage['/web.js'].functionData[2] = 0;
  _$jscoverage['/web.js'].functionData[3] = 0;
  _$jscoverage['/web.js'].functionData[4] = 0;
  _$jscoverage['/web.js'].functionData[5] = 0;
  _$jscoverage['/web.js'].functionData[6] = 0;
  _$jscoverage['/web.js'].functionData[7] = 0;
  _$jscoverage['/web.js'].functionData[8] = 0;
  _$jscoverage['/web.js'].functionData[9] = 0;
  _$jscoverage['/web.js'].functionData[10] = 0;
  _$jscoverage['/web.js'].functionData[11] = 0;
  _$jscoverage['/web.js'].functionData[12] = 0;
  _$jscoverage['/web.js'].functionData[13] = 0;
  _$jscoverage['/web.js'].functionData[14] = 0;
  _$jscoverage['/web.js'].functionData[15] = 0;
  _$jscoverage['/web.js'].functionData[16] = 0;
  _$jscoverage['/web.js'].functionData[17] = 0;
  _$jscoverage['/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/web.js'].branchData) {
  _$jscoverage['/web.js'].branchData = {};
  _$jscoverage['/web.js'].branchData['11'] = [];
  _$jscoverage['/web.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['23'] = [];
  _$jscoverage['/web.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'] = [];
  _$jscoverage['/web.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['55'] = [];
  _$jscoverage['/web.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['61'] = [];
  _$jscoverage['/web.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['73'] = [];
  _$jscoverage['/web.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['84'] = [];
  _$jscoverage['/web.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['87'] = [];
  _$jscoverage['/web.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['100'] = [];
  _$jscoverage['/web.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['104'] = [];
  _$jscoverage['/web.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['125'] = [];
  _$jscoverage['/web.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['130'] = [];
  _$jscoverage['/web.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['139'] = [];
  _$jscoverage['/web.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['143'] = [];
  _$jscoverage['/web.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['147'] = [];
  _$jscoverage['/web.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['151'] = [];
  _$jscoverage['/web.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['163'] = [];
  _$jscoverage['/web.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['163'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['172'] = [];
  _$jscoverage['/web.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['183'] = [];
  _$jscoverage['/web.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['196'] = [];
  _$jscoverage['/web.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['199'] = [];
  _$jscoverage['/web.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['205'] = [];
  _$jscoverage['/web.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['221'] = [];
  _$jscoverage['/web.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/web.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/web.js'].branchData['221'][3] = new BranchData();
  _$jscoverage['/web.js'].branchData['231'] = [];
  _$jscoverage['/web.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/web.js'].branchData['231'][1].init(7369, 5, 'UA.ie');
function visit665_231_1(result) {
  _$jscoverage['/web.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['221'][3].init(7088, 24, 'location.search || EMPTY');
function visit664_221_3(result) {
  _$jscoverage['/web.js'].branchData['221'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['221'][2].init(7088, 52, '(location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit663_221_2(result) {
  _$jscoverage['/web.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['221'][1].init(7075, 65, 'location && (location.search || EMPTY).indexOf(\'ks-debug\') !== -1');
function visit662_221_1(result) {
  _$jscoverage['/web.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['205'][1].init(910, 20, 'doScroll && notframe');
function visit661_205_1(result) {
  _$jscoverage['/web.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['199'][1].init(29, 28, 'win[\'frameElement\'] === null');
function visit660_199_1(result) {
  _$jscoverage['/web.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['196'][1].init(40, 27, 'docElem && docElem.doScroll');
function visit659_196_1(result) {
  _$jscoverage['/web.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['183'][1].init(21, 27, 'doc.readyState === COMPLETE');
function visit658_183_1(result) {
  _$jscoverage['/web.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['172'][1].init(361, 18, 'standardEventModel');
function visit657_172_1(result) {
  _$jscoverage['/web.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['163'][2].init(125, 27, 'doc.readyState === COMPLETE');
function visit656_163_2(result) {
  _$jscoverage['/web.js'].branchData['163'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['163'][1].init(117, 35, '!doc || doc.readyState === COMPLETE');
function visit655_163_1(result) {
  _$jscoverage['/web.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['151'][1].init(23, 12, 'e.stack || e');
function visit654_151_1(result) {
  _$jscoverage['/web.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['147'][1].init(223, 20, 'i < callbacks.length');
function visit653_147_1(result) {
  _$jscoverage['/web.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['143'][1].init(85, 17, 'doc && !UA.nodejs');
function visit652_143_1(result) {
  _$jscoverage['/web.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['139'][1].init(13, 8, 'domReady');
function visit651_139_1(result) {
  _$jscoverage['/web.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['130'][1].init(205, 4, 'node');
function visit650_130_1(result) {
  _$jscoverage['/web.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['125'][1].init(21, 27, '++retryCount > POLL_RETIRES');
function visit649_125_1(result) {
  _$jscoverage['/web.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['104'][1].init(27, 12, 'e.stack || e');
function visit648_104_1(result) {
  _$jscoverage['/web.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['100'][1].init(17, 8, 'domReady');
function visit647_100_1(result) {
  _$jscoverage['/web.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['87'][1].init(-1, 104, 'win.execScript || function(data) {\n  win[\'eval\'].call(win, data);\n}');
function visit646_87_1(result) {
  _$jscoverage['/web.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['84'][1].init(17, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit645_84_1(result) {
  _$jscoverage['/web.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['73'][2].init(669, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit644_73_2(result) {
  _$jscoverage['/web.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['73'][1].init(661, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit643_73_1(result) {
  _$jscoverage['/web.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['61'][1].init(49, 16, 'win[\'DOMParser\']');
function visit642_61_1(result) {
  _$jscoverage['/web.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['55'][1].init(46, 20, 'data.documentElement');
function visit641_55_1(result) {
  _$jscoverage['/web.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][3].init(35, 17, 'obj == obj.window');
function visit640_45_3(result) {
  _$jscoverage['/web.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][2].init(20, 11, 'obj != null');
function visit639_45_2(result) {
  _$jscoverage['/web.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['45'][1].init(20, 32, 'obj != null && obj == obj.window');
function visit638_45_1(result) {
  _$jscoverage['/web.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['23'][1].init(505, 27, 'doc && doc.addEventListener');
function visit637_23_1(result) {
  _$jscoverage['/web.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].branchData['11'][1].init(128, 26, 'doc && doc.documentElement');
function visit636_11_1(result) {
  _$jscoverage['/web.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/web.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/web.js'].functionData[0]++;
  _$jscoverage['/web.js'].lineData[7]++;
  var win = S.Env.host, logger = S.getLogger('s/web'), UA = S.UA, doc = win['document'], docElem = visit636_11_1(doc && doc.documentElement), location = win.location, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = !!(visit637_23_1(doc && doc.addEventListener)), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[1]++;
  _$jscoverage['/web.js'].lineData[29]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[2]++;
  _$jscoverage['/web.js'].lineData[31]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[3]++;
  _$jscoverage['/web.js'].lineData[34]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/web.js'].functionData[4]++;
  _$jscoverage['/web.js'].lineData[36]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/web.js'].lineData[39]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/web.js'].functionData[5]++;
  _$jscoverage['/web.js'].lineData[45]++;
  return visit638_45_1(visit639_45_2(obj != null) && visit640_45_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/web.js'].functionData[6]++;
  _$jscoverage['/web.js'].lineData[55]++;
  if (visit641_55_1(data.documentElement)) {
    _$jscoverage['/web.js'].lineData[56]++;
    return data;
  }
  _$jscoverage['/web.js'].lineData[58]++;
  var xml;
  _$jscoverage['/web.js'].lineData[59]++;
  try {
    _$jscoverage['/web.js'].lineData[61]++;
    if (visit642_61_1(win['DOMParser'])) {
      _$jscoverage['/web.js'].lineData[62]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/web.js'].lineData[64]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/web.js'].lineData[65]++;
      xml.async = false;
      _$jscoverage['/web.js'].lineData[66]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/web.js'].lineData[69]++;
  logger.error('parseXML error :');
  _$jscoverage['/web.js'].lineData[70]++;
  logger.error(e);
  _$jscoverage['/web.js'].lineData[71]++;
  xml = undefined;
}
  _$jscoverage['/web.js'].lineData[73]++;
  if (visit643_73_1(!xml || visit644_73_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/web.js'].lineData[74]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/web.js'].lineData[76]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/web.js'].functionData[7]++;
  _$jscoverage['/web.js'].lineData[84]++;
  if (visit645_84_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/web.js'].lineData[87]++;
    (visit646_87_1(win.execScript || function(data) {
  _$jscoverage['/web.js'].functionData[8]++;
  _$jscoverage['/web.js'].lineData[88]++;
  win['eval'].call(win, data);
}))(data);
  }
}, 
  ready: function(fn) {
  _$jscoverage['/web.js'].functionData[9]++;
  _$jscoverage['/web.js'].lineData[100]++;
  if (visit647_100_1(domReady)) {
    _$jscoverage['/web.js'].lineData[101]++;
    try {
      _$jscoverage['/web.js'].lineData[102]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/web.js'].lineData[104]++;
  S.log(visit648_104_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[105]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[10]++;
  _$jscoverage['/web.js'].lineData[106]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/web.js'].lineData[110]++;
    callbacks.push(fn);
  }
  _$jscoverage['/web.js'].lineData[112]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/web.js'].functionData[11]++;
  _$jscoverage['/web.js'].lineData[122]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/web.js'].lineData[123]++;
  var retryCount = 1;
  _$jscoverage['/web.js'].lineData[124]++;
  var timer = S.later(function() {
  _$jscoverage['/web.js'].functionData[12]++;
  _$jscoverage['/web.js'].lineData[125]++;
  if (visit649_125_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/web.js'].lineData[126]++;
    timer.cancel();
    _$jscoverage['/web.js'].lineData[127]++;
    return;
  }
  _$jscoverage['/web.js'].lineData[129]++;
  var node = doc.getElementById(id);
  _$jscoverage['/web.js'].lineData[130]++;
  if (visit650_130_1(node)) {
    _$jscoverage['/web.js'].lineData[131]++;
    fn(node);
    _$jscoverage['/web.js'].lineData[132]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/web.js'].lineData[138]++;
  function fireReady() {
    _$jscoverage['/web.js'].functionData[13]++;
    _$jscoverage['/web.js'].lineData[139]++;
    if (visit651_139_1(domReady)) {
      _$jscoverage['/web.js'].lineData[140]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[143]++;
    if (visit652_143_1(doc && !UA.nodejs)) {
      _$jscoverage['/web.js'].lineData[144]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/web.js'].lineData[146]++;
    domReady = 1;
    _$jscoverage['/web.js'].lineData[147]++;
    for (var i = 0; visit653_147_1(i < callbacks.length); i++) {
      _$jscoverage['/web.js'].lineData[148]++;
      try {
        _$jscoverage['/web.js'].lineData[149]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[151]++;
  S.log(visit654_151_1(e.stack || e), 'error');
  _$jscoverage['/web.js'].lineData[152]++;
  setTimeout(function() {
  _$jscoverage['/web.js'].functionData[14]++;
  _$jscoverage['/web.js'].lineData[153]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/web.js'].lineData[160]++;
  function bindReady() {
    _$jscoverage['/web.js'].functionData[15]++;
    _$jscoverage['/web.js'].lineData[163]++;
    if (visit655_163_1(!doc || visit656_163_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/web.js'].lineData[164]++;
      fireReady();
      _$jscoverage['/web.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/web.js'].lineData[169]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/web.js'].lineData[172]++;
    if (visit657_172_1(standardEventModel)) {
      _$jscoverage['/web.js'].lineData[173]++;
      var domReady = function() {
  _$jscoverage['/web.js'].functionData[16]++;
  _$jscoverage['/web.js'].lineData[174]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/web.js'].lineData[175]++;
  fireReady();
};
      _$jscoverage['/web.js'].lineData[178]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/web.js'].lineData[182]++;
      var stateChange = function() {
  _$jscoverage['/web.js'].functionData[17]++;
  _$jscoverage['/web.js'].lineData[183]++;
  if (visit658_183_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/web.js'].lineData[184]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/web.js'].lineData[185]++;
    fireReady();
  }
};
      _$jscoverage['/web.js'].lineData[191]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/web.js'].lineData[195]++;
      var notframe, doScroll = visit659_196_1(docElem && docElem.doScroll);
      _$jscoverage['/web.js'].lineData[198]++;
      try {
        _$jscoverage['/web.js'].lineData[199]++;
        notframe = (visit660_199_1(win['frameElement'] === null));
      }      catch (e) {
  _$jscoverage['/web.js'].lineData[201]++;
  notframe = false;
}
      _$jscoverage['/web.js'].lineData[205]++;
      if (visit661_205_1(doScroll && notframe)) {
        _$jscoverage['/web.js'].lineData[206]++;
        var readyScroll = function() {
  _$jscoverage['/web.js'].functionData[18]++;
  _$jscoverage['/web.js'].lineData[207]++;
  try {
    _$jscoverage['/web.js'].lineData[209]++;
    doScroll('left');
    _$jscoverage['/web.js'].lineData[210]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/web.js'].lineData[212]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/web.js'].lineData[215]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/web.js'].lineData[221]++;
  if (visit662_221_1(location && visit663_221_2((visit664_221_3(location.search || EMPTY)).indexOf('ks-debug') !== -1))) {
    _$jscoverage['/web.js'].lineData[222]++;
    S.Config.debug = true;
  }
  _$jscoverage['/web.js'].lineData[229]++;
  bindReady();
  _$jscoverage['/web.js'].lineData[231]++;
  if (visit665_231_1(UA.ie)) {
    _$jscoverage['/web.js'].lineData[232]++;
    try {
      _$jscoverage['/web.js'].lineData[233]++;
      doc.execCommand('BackgroundImageCache', false, true);
    }    catch (e) {
}
  }
})(KISSY, undefined);
