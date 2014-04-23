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
if (! _$jscoverage['/util/web.js']) {
  _$jscoverage['/util/web.js'] = {};
  _$jscoverage['/util/web.js'].lineData = [];
  _$jscoverage['/util/web.js'].lineData[6] = 0;
  _$jscoverage['/util/web.js'].lineData[7] = 0;
  _$jscoverage['/util/web.js'].lineData[8] = 0;
  _$jscoverage['/util/web.js'].lineData[29] = 0;
  _$jscoverage['/util/web.js'].lineData[31] = 0;
  _$jscoverage['/util/web.js'].lineData[34] = 0;
  _$jscoverage['/util/web.js'].lineData[36] = 0;
  _$jscoverage['/util/web.js'].lineData[39] = 0;
  _$jscoverage['/util/web.js'].lineData[47] = 0;
  _$jscoverage['/util/web.js'].lineData[57] = 0;
  _$jscoverage['/util/web.js'].lineData[58] = 0;
  _$jscoverage['/util/web.js'].lineData[60] = 0;
  _$jscoverage['/util/web.js'].lineData[61] = 0;
  _$jscoverage['/util/web.js'].lineData[63] = 0;
  _$jscoverage['/util/web.js'].lineData[64] = 0;
  _$jscoverage['/util/web.js'].lineData[67] = 0;
  _$jscoverage['/util/web.js'].lineData[68] = 0;
  _$jscoverage['/util/web.js'].lineData[69] = 0;
  _$jscoverage['/util/web.js'].lineData[72] = 0;
  _$jscoverage['/util/web.js'].lineData[73] = 0;
  _$jscoverage['/util/web.js'].lineData[74] = 0;
  _$jscoverage['/util/web.js'].lineData[76] = 0;
  _$jscoverage['/util/web.js'].lineData[77] = 0;
  _$jscoverage['/util/web.js'].lineData[79] = 0;
  _$jscoverage['/util/web.js'].lineData[87] = 0;
  _$jscoverage['/util/web.js'].lineData[91] = 0;
  _$jscoverage['/util/web.js'].lineData[92] = 0;
  _$jscoverage['/util/web.js'].lineData[94] = 0;
  _$jscoverage['/util/web.js'].lineData[95] = 0;
  _$jscoverage['/util/web.js'].lineData[108] = 0;
  _$jscoverage['/util/web.js'].lineData[109] = 0;
  _$jscoverage['/util/web.js'].lineData[110] = 0;
  _$jscoverage['/util/web.js'].lineData[112] = 0;
  _$jscoverage['/util/web.js'].lineData[113] = 0;
  _$jscoverage['/util/web.js'].lineData[114] = 0;
  _$jscoverage['/util/web.js'].lineData[118] = 0;
  _$jscoverage['/util/web.js'].lineData[120] = 0;
  _$jscoverage['/util/web.js'].lineData[130] = 0;
  _$jscoverage['/util/web.js'].lineData[131] = 0;
  _$jscoverage['/util/web.js'].lineData[132] = 0;
  _$jscoverage['/util/web.js'].lineData[133] = 0;
  _$jscoverage['/util/web.js'].lineData[134] = 0;
  _$jscoverage['/util/web.js'].lineData[135] = 0;
  _$jscoverage['/util/web.js'].lineData[137] = 0;
  _$jscoverage['/util/web.js'].lineData[138] = 0;
  _$jscoverage['/util/web.js'].lineData[139] = 0;
  _$jscoverage['/util/web.js'].lineData[140] = 0;
  _$jscoverage['/util/web.js'].lineData[146] = 0;
  _$jscoverage['/util/web.js'].lineData[147] = 0;
  _$jscoverage['/util/web.js'].lineData[148] = 0;
  _$jscoverage['/util/web.js'].lineData[151] = 0;
  _$jscoverage['/util/web.js'].lineData[152] = 0;
  _$jscoverage['/util/web.js'].lineData[154] = 0;
  _$jscoverage['/util/web.js'].lineData[155] = 0;
  _$jscoverage['/util/web.js'].lineData[156] = 0;
  _$jscoverage['/util/web.js'].lineData[157] = 0;
  _$jscoverage['/util/web.js'].lineData[159] = 0;
  _$jscoverage['/util/web.js'].lineData[161] = 0;
  _$jscoverage['/util/web.js'].lineData[162] = 0;
  _$jscoverage['/util/web.js'].lineData[169] = 0;
  _$jscoverage['/util/web.js'].lineData[172] = 0;
  _$jscoverage['/util/web.js'].lineData[173] = 0;
  _$jscoverage['/util/web.js'].lineData[174] = 0;
  _$jscoverage['/util/web.js'].lineData[178] = 0;
  _$jscoverage['/util/web.js'].lineData[181] = 0;
  _$jscoverage['/util/web.js'].lineData[182] = 0;
  _$jscoverage['/util/web.js'].lineData[183] = 0;
  _$jscoverage['/util/web.js'].lineData[184] = 0;
  _$jscoverage['/util/web.js'].lineData[187] = 0;
  _$jscoverage['/util/web.js'].lineData[189] = 0;
  _$jscoverage['/util/web.js'].lineData[190] = 0;
  _$jscoverage['/util/web.js'].lineData[191] = 0;
  _$jscoverage['/util/web.js'].lineData[192] = 0;
  _$jscoverage['/util/web.js'].lineData[198] = 0;
  _$jscoverage['/util/web.js'].lineData[202] = 0;
  _$jscoverage['/util/web.js'].lineData[205] = 0;
  _$jscoverage['/util/web.js'].lineData[206] = 0;
  _$jscoverage['/util/web.js'].lineData[208] = 0;
  _$jscoverage['/util/web.js'].lineData[212] = 0;
  _$jscoverage['/util/web.js'].lineData[213] = 0;
  _$jscoverage['/util/web.js'].lineData[214] = 0;
  _$jscoverage['/util/web.js'].lineData[216] = 0;
  _$jscoverage['/util/web.js'].lineData[217] = 0;
  _$jscoverage['/util/web.js'].lineData[219] = 0;
  _$jscoverage['/util/web.js'].lineData[222] = 0;
  _$jscoverage['/util/web.js'].lineData[231] = 0;
  _$jscoverage['/util/web.js'].lineData[232] = 0;
  _$jscoverage['/util/web.js'].lineData[235] = 0;
  _$jscoverage['/util/web.js'].lineData[236] = 0;
}
if (! _$jscoverage['/util/web.js'].functionData) {
  _$jscoverage['/util/web.js'].functionData = [];
  _$jscoverage['/util/web.js'].functionData[0] = 0;
  _$jscoverage['/util/web.js'].functionData[1] = 0;
  _$jscoverage['/util/web.js'].functionData[2] = 0;
  _$jscoverage['/util/web.js'].functionData[3] = 0;
  _$jscoverage['/util/web.js'].functionData[4] = 0;
  _$jscoverage['/util/web.js'].functionData[5] = 0;
  _$jscoverage['/util/web.js'].functionData[6] = 0;
  _$jscoverage['/util/web.js'].functionData[7] = 0;
  _$jscoverage['/util/web.js'].functionData[8] = 0;
  _$jscoverage['/util/web.js'].functionData[9] = 0;
  _$jscoverage['/util/web.js'].functionData[10] = 0;
  _$jscoverage['/util/web.js'].functionData[11] = 0;
  _$jscoverage['/util/web.js'].functionData[12] = 0;
  _$jscoverage['/util/web.js'].functionData[13] = 0;
  _$jscoverage['/util/web.js'].functionData[14] = 0;
  _$jscoverage['/util/web.js'].functionData[15] = 0;
  _$jscoverage['/util/web.js'].functionData[16] = 0;
  _$jscoverage['/util/web.js'].functionData[17] = 0;
  _$jscoverage['/util/web.js'].functionData[18] = 0;
}
if (! _$jscoverage['/util/web.js'].branchData) {
  _$jscoverage['/util/web.js'].branchData = {};
  _$jscoverage['/util/web.js'].branchData['10'] = [];
  _$jscoverage['/util/web.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['23'] = [];
  _$jscoverage['/util/web.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['47'] = [];
  _$jscoverage['/util/web.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['47'][3] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['57'] = [];
  _$jscoverage['/util/web.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['63'] = [];
  _$jscoverage['/util/web.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['76'] = [];
  _$jscoverage['/util/web.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['87'] = [];
  _$jscoverage['/util/web.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['91'] = [];
  _$jscoverage['/util/web.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['108'] = [];
  _$jscoverage['/util/web.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['112'] = [];
  _$jscoverage['/util/web.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['133'] = [];
  _$jscoverage['/util/web.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['138'] = [];
  _$jscoverage['/util/web.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['147'] = [];
  _$jscoverage['/util/web.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['151'] = [];
  _$jscoverage['/util/web.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['155'] = [];
  _$jscoverage['/util/web.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['159'] = [];
  _$jscoverage['/util/web.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['172'] = [];
  _$jscoverage['/util/web.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['181'] = [];
  _$jscoverage['/util/web.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['190'] = [];
  _$jscoverage['/util/web.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['203'] = [];
  _$jscoverage['/util/web.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['206'] = [];
  _$jscoverage['/util/web.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['212'] = [];
  _$jscoverage['/util/web.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/util/web.js'].branchData['231'] = [];
  _$jscoverage['/util/web.js'].branchData['231'][1] = new BranchData();
}
_$jscoverage['/util/web.js'].branchData['231'][1].init(7655, 12, 'supportEvent');
function visit213_231_1(result) {
  _$jscoverage['/util/web.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['212'][1].init(931, 20, 'doScroll && notframe');
function visit212_212_1(result) {
  _$jscoverage['/util/web.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['206'][1].init(30, 25, 'win.frameElement === null');
function visit211_206_1(result) {
  _$jscoverage['/util/web.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['203'][1].init(41, 27, 'docElem && docElem.doScroll');
function visit210_203_1(result) {
  _$jscoverage['/util/web.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['190'][1].init(22, 27, 'doc.readyState === COMPLETE');
function visit209_190_1(result) {
  _$jscoverage['/util/web.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['181'][1].init(373, 18, 'standardEventModel');
function visit208_181_1(result) {
  _$jscoverage['/util/web.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['172'][2].init(128, 27, 'doc.readyState === COMPLETE');
function visit207_172_2(result) {
  _$jscoverage['/util/web.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['172'][1].init(120, 35, '!doc || doc.readyState === COMPLETE');
function visit206_172_1(result) {
  _$jscoverage['/util/web.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['159'][1].init(24, 12, 'e.stack || e');
function visit205_159_1(result) {
  _$jscoverage['/util/web.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['155'][1].init(236, 20, 'i < callbacks.length');
function visit204_155_1(result) {
  _$jscoverage['/util/web.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['151'][1].init(90, 21, 'win && win.setTimeout');
function visit203_151_1(result) {
  _$jscoverage['/util/web.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['147'][1].init(14, 8, 'domReady');
function visit202_147_1(result) {
  _$jscoverage['/util/web.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['138'][1].init(211, 4, 'node');
function visit201_138_1(result) {
  _$jscoverage['/util/web.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['133'][1].init(22, 27, '++retryCount > POLL_RETIRES');
function visit200_133_1(result) {
  _$jscoverage['/util/web.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['112'][1].init(28, 12, 'e.stack || e');
function visit199_112_1(result) {
  _$jscoverage['/util/web.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['108'][1].init(18, 8, 'domReady');
function visit198_108_1(result) {
  _$jscoverage['/util/web.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['91'][1].init(273, 14, 'win.execScript');
function visit197_91_1(result) {
  _$jscoverage['/util/web.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['87'][1].init(18, 36, 'data && RE_NOT_WHITESPACE.test(data)');
function visit196_87_1(result) {
  _$jscoverage['/util/web.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['76'][2].init(728, 70, '!xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit195_76_2(result) {
  _$jscoverage['/util/web.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['76'][1].init(720, 78, '!xml || !xml.documentElement || xml.getElementsByTagName(\'parsererror\').length');
function visit194_76_1(result) {
  _$jscoverage['/util/web.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['63'][1].init(51, 13, 'win.DOMParser');
function visit193_63_1(result) {
  _$jscoverage['/util/web.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['57'][1].init(48, 20, 'data.documentElement');
function visit192_57_1(result) {
  _$jscoverage['/util/web.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['47'][3].init(109, 17, 'obj == obj.window');
function visit191_47_3(result) {
  _$jscoverage['/util/web.js'].branchData['47'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['47'][2].init(94, 11, 'obj != null');
function visit190_47_2(result) {
  _$jscoverage['/util/web.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['47'][1].init(94, 32, 'obj != null && obj == obj.window');
function visit189_47_1(result) {
  _$jscoverage['/util/web.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['23'][1].init(482, 37, 'doc.attachEvent || standardEventModel');
function visit188_23_1(result) {
  _$jscoverage['/util/web.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].branchData['10'][1].init(52, 18, 'win.document || {}');
function visit187_10_1(result) {
  _$jscoverage['/util/web.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/web.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/util/web.js'].functionData[0]++;
  _$jscoverage['/util/web.js'].lineData[7]++;
  var logger = S.getLogger('s/web');
  _$jscoverage['/util/web.js'].lineData[8]++;
  var win = S.Env.host, undef, doc = visit187_10_1(win.document || {}), docElem = doc.documentElement, EMPTY = '', domReady = 0, callbacks = [], POLL_RETIRES = 500, POLL_INTERVAL = 40, RE_ID_STR = /^#?([\w-]+)$/, RE_NOT_WHITESPACE = /\S/, standardEventModel = doc.addEventListener, supportEvent = visit188_23_1(doc.attachEvent || standardEventModel), DOM_READY_EVENT = 'DOMContentLoaded', READY_STATE_CHANGE_EVENT = 'readystatechange', LOAD_EVENT = 'load', COMPLETE = 'complete', addEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[1]++;
  _$jscoverage['/util/web.js'].lineData[29]++;
  el.addEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[2]++;
  _$jscoverage['/util/web.js'].lineData[31]++;
  el.attachEvent('on' + type, fn);
}, removeEventListener = standardEventModel ? function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[3]++;
  _$jscoverage['/util/web.js'].lineData[34]++;
  el.removeEventListener(type, fn, false);
} : function(el, type, fn) {
  _$jscoverage['/util/web.js'].functionData[4]++;
  _$jscoverage['/util/web.js'].lineData[36]++;
  el.detachEvent('on' + type, fn);
};
  _$jscoverage['/util/web.js'].lineData[39]++;
  S.mix(S, {
  isWindow: function(obj) {
  _$jscoverage['/util/web.js'].functionData[5]++;
  _$jscoverage['/util/web.js'].lineData[47]++;
  return visit189_47_1(visit190_47_2(obj != null) && visit191_47_3(obj == obj.window));
}, 
  parseXML: function(data) {
  _$jscoverage['/util/web.js'].functionData[6]++;
  _$jscoverage['/util/web.js'].lineData[57]++;
  if (visit192_57_1(data.documentElement)) {
    _$jscoverage['/util/web.js'].lineData[58]++;
    return data;
  }
  _$jscoverage['/util/web.js'].lineData[60]++;
  var xml;
  _$jscoverage['/util/web.js'].lineData[61]++;
  try {
    _$jscoverage['/util/web.js'].lineData[63]++;
    if (visit193_63_1(win.DOMParser)) {
      _$jscoverage['/util/web.js'].lineData[64]++;
      xml = new DOMParser().parseFromString(data, 'text/xml');
    } else {
      _$jscoverage['/util/web.js'].lineData[67]++;
      xml = new ActiveXObject('Microsoft.XMLDOM');
      _$jscoverage['/util/web.js'].lineData[68]++;
      xml.async = false;
      _$jscoverage['/util/web.js'].lineData[69]++;
      xml.loadXML(data);
    }
  }  catch (e) {
  _$jscoverage['/util/web.js'].lineData[72]++;
  logger.error('parseXML error :');
  _$jscoverage['/util/web.js'].lineData[73]++;
  logger.error(e);
  _$jscoverage['/util/web.js'].lineData[74]++;
  xml = undef;
}
  _$jscoverage['/util/web.js'].lineData[76]++;
  if (visit194_76_1(!xml || visit195_76_2(!xml.documentElement || xml.getElementsByTagName('parsererror').length))) {
    _$jscoverage['/util/web.js'].lineData[77]++;
    S.error('Invalid XML: ' + data);
  }
  _$jscoverage['/util/web.js'].lineData[79]++;
  return xml;
}, 
  globalEval: function(data) {
  _$jscoverage['/util/web.js'].functionData[7]++;
  _$jscoverage['/util/web.js'].lineData[87]++;
  if (visit196_87_1(data && RE_NOT_WHITESPACE.test(data))) {
    _$jscoverage['/util/web.js'].lineData[91]++;
    if (visit197_91_1(win.execScript)) {
      _$jscoverage['/util/web.js'].lineData[92]++;
      win.execScript(data);
    } else {
      _$jscoverage['/util/web.js'].lineData[94]++;
      (function(data) {
  _$jscoverage['/util/web.js'].functionData[8]++;
  _$jscoverage['/util/web.js'].lineData[95]++;
  win['eval'].call(win, data);
})(data);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/util/web.js'].functionData[9]++;
  _$jscoverage['/util/web.js'].lineData[108]++;
  if (visit198_108_1(domReady)) {
    _$jscoverage['/util/web.js'].lineData[109]++;
    try {
      _$jscoverage['/util/web.js'].lineData[110]++;
      fn(S);
    }    catch (e) {
  _$jscoverage['/util/web.js'].lineData[112]++;
  S.log(visit199_112_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[113]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[10]++;
  _$jscoverage['/util/web.js'].lineData[114]++;
  throw e;
}, 0);
}
  } else {
    _$jscoverage['/util/web.js'].lineData[118]++;
    callbacks.push(fn);
  }
  _$jscoverage['/util/web.js'].lineData[120]++;
  return this;
}, 
  available: function(id, fn) {
  _$jscoverage['/util/web.js'].functionData[11]++;
  _$jscoverage['/util/web.js'].lineData[130]++;
  id = (id + EMPTY).match(RE_ID_STR)[1];
  _$jscoverage['/util/web.js'].lineData[131]++;
  var retryCount = 1;
  _$jscoverage['/util/web.js'].lineData[132]++;
  var timer = S.later(function() {
  _$jscoverage['/util/web.js'].functionData[12]++;
  _$jscoverage['/util/web.js'].lineData[133]++;
  if (visit200_133_1(++retryCount > POLL_RETIRES)) {
    _$jscoverage['/util/web.js'].lineData[134]++;
    timer.cancel();
    _$jscoverage['/util/web.js'].lineData[135]++;
    return;
  }
  _$jscoverage['/util/web.js'].lineData[137]++;
  var node = doc.getElementById(id);
  _$jscoverage['/util/web.js'].lineData[138]++;
  if (visit201_138_1(node)) {
    _$jscoverage['/util/web.js'].lineData[139]++;
    fn(node);
    _$jscoverage['/util/web.js'].lineData[140]++;
    timer.cancel();
  }
}, POLL_INTERVAL, true);
}});
  _$jscoverage['/util/web.js'].lineData[146]++;
  function fireReady() {
    _$jscoverage['/util/web.js'].functionData[13]++;
    _$jscoverage['/util/web.js'].lineData[147]++;
    if (visit202_147_1(domReady)) {
      _$jscoverage['/util/web.js'].lineData[148]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[151]++;
    if (visit203_151_1(win && win.setTimeout)) {
      _$jscoverage['/util/web.js'].lineData[152]++;
      removeEventListener(win, LOAD_EVENT, fireReady);
    }
    _$jscoverage['/util/web.js'].lineData[154]++;
    domReady = 1;
    _$jscoverage['/util/web.js'].lineData[155]++;
    for (var i = 0; visit204_155_1(i < callbacks.length); i++) {
      _$jscoverage['/util/web.js'].lineData[156]++;
      try {
        _$jscoverage['/util/web.js'].lineData[157]++;
        callbacks[i](S);
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[159]++;
  S.log(visit205_159_1(e.stack || e), 'error');
  _$jscoverage['/util/web.js'].lineData[161]++;
  setTimeout(function() {
  _$jscoverage['/util/web.js'].functionData[14]++;
  _$jscoverage['/util/web.js'].lineData[162]++;
  throw e;
}, 0);
}
    }
  }
  _$jscoverage['/util/web.js'].lineData[169]++;
  function bindReady() {
    _$jscoverage['/util/web.js'].functionData[15]++;
    _$jscoverage['/util/web.js'].lineData[172]++;
    if (visit206_172_1(!doc || visit207_172_2(doc.readyState === COMPLETE))) {
      _$jscoverage['/util/web.js'].lineData[173]++;
      fireReady();
      _$jscoverage['/util/web.js'].lineData[174]++;
      return;
    }
    _$jscoverage['/util/web.js'].lineData[178]++;
    addEventListener(win, LOAD_EVENT, fireReady);
    _$jscoverage['/util/web.js'].lineData[181]++;
    if (visit208_181_1(standardEventModel)) {
      _$jscoverage['/util/web.js'].lineData[182]++;
      var domReady = function() {
  _$jscoverage['/util/web.js'].functionData[16]++;
  _$jscoverage['/util/web.js'].lineData[183]++;
  removeEventListener(doc, DOM_READY_EVENT, domReady);
  _$jscoverage['/util/web.js'].lineData[184]++;
  fireReady();
};
      _$jscoverage['/util/web.js'].lineData[187]++;
      addEventListener(doc, DOM_READY_EVENT, domReady);
    } else {
      _$jscoverage['/util/web.js'].lineData[189]++;
      var stateChange = function() {
  _$jscoverage['/util/web.js'].functionData[17]++;
  _$jscoverage['/util/web.js'].lineData[190]++;
  if (visit209_190_1(doc.readyState === COMPLETE)) {
    _$jscoverage['/util/web.js'].lineData[191]++;
    removeEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
    _$jscoverage['/util/web.js'].lineData[192]++;
    fireReady();
  }
};
      _$jscoverage['/util/web.js'].lineData[198]++;
      addEventListener(doc, READY_STATE_CHANGE_EVENT, stateChange);
      _$jscoverage['/util/web.js'].lineData[202]++;
      var notframe, doScroll = visit210_203_1(docElem && docElem.doScroll);
      _$jscoverage['/util/web.js'].lineData[205]++;
      try {
        _$jscoverage['/util/web.js'].lineData[206]++;
        notframe = (visit211_206_1(win.frameElement === null));
      }      catch (e) {
  _$jscoverage['/util/web.js'].lineData[208]++;
  notframe = false;
}
      _$jscoverage['/util/web.js'].lineData[212]++;
      if (visit212_212_1(doScroll && notframe)) {
        _$jscoverage['/util/web.js'].lineData[213]++;
        var readyScroll = function() {
  _$jscoverage['/util/web.js'].functionData[18]++;
  _$jscoverage['/util/web.js'].lineData[214]++;
  try {
    _$jscoverage['/util/web.js'].lineData[216]++;
    doScroll('left');
    _$jscoverage['/util/web.js'].lineData[217]++;
    fireReady();
  }  catch (ex) {
  _$jscoverage['/util/web.js'].lineData[219]++;
  setTimeout(readyScroll, POLL_INTERVAL);
}
};
        _$jscoverage['/util/web.js'].lineData[222]++;
        readyScroll();
      }
    }
  }
  _$jscoverage['/util/web.js'].lineData[231]++;
  if (visit213_231_1(supportEvent)) {
    _$jscoverage['/util/web.js'].lineData[232]++;
    bindReady();
  }
  _$jscoverage['/util/web.js'].lineData[235]++;
  try {
    _$jscoverage['/util/web.js'].lineData[236]++;
    doc.execCommand('BackgroundImageCache', false, true);
  }  catch (e) {
}
});
