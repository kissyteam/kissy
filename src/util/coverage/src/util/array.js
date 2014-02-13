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
if (! _$jscoverage['/util/array.js']) {
  _$jscoverage['/util/array.js'] = {};
  _$jscoverage['/util/array.js'].lineData = [];
  _$jscoverage['/util/array.js'].lineData[7] = 0;
  _$jscoverage['/util/array.js'].lineData[8] = 0;
  _$jscoverage['/util/array.js'].lineData[18] = 0;
  _$jscoverage['/util/array.js'].lineData[29] = 0;
  _$jscoverage['/util/array.js'].lineData[32] = 0;
  _$jscoverage['/util/array.js'].lineData[33] = 0;
  _$jscoverage['/util/array.js'].lineData[34] = 0;
  _$jscoverage['/util/array.js'].lineData[37] = 0;
  _$jscoverage['/util/array.js'].lineData[52] = 0;
  _$jscoverage['/util/array.js'].lineData[55] = 0;
  _$jscoverage['/util/array.js'].lineData[56] = 0;
  _$jscoverage['/util/array.js'].lineData[57] = 0;
  _$jscoverage['/util/array.js'].lineData[60] = 0;
  _$jscoverage['/util/array.js'].lineData[72] = 0;
  _$jscoverage['/util/array.js'].lineData[73] = 0;
  _$jscoverage['/util/array.js'].lineData[74] = 0;
  _$jscoverage['/util/array.js'].lineData[76] = 0;
  _$jscoverage['/util/array.js'].lineData[80] = 0;
  _$jscoverage['/util/array.js'].lineData[81] = 0;
  _$jscoverage['/util/array.js'].lineData[82] = 0;
  _$jscoverage['/util/array.js'].lineData[83] = 0;
  _$jscoverage['/util/array.js'].lineData[85] = 0;
  _$jscoverage['/util/array.js'].lineData[88] = 0;
  _$jscoverage['/util/array.js'].lineData[89] = 0;
  _$jscoverage['/util/array.js'].lineData[91] = 0;
  _$jscoverage['/util/array.js'].lineData[102] = 0;
  _$jscoverage['/util/array.js'].lineData[119] = 0;
  _$jscoverage['/util/array.js'].lineData[122] = 0;
  _$jscoverage['/util/array.js'].lineData[123] = 0;
  _$jscoverage['/util/array.js'].lineData[124] = 0;
  _$jscoverage['/util/array.js'].lineData[125] = 0;
  _$jscoverage['/util/array.js'].lineData[128] = 0;
  _$jscoverage['/util/array.js'].lineData[145] = 0;
  _$jscoverage['/util/array.js'].lineData[148] = 0;
  _$jscoverage['/util/array.js'].lineData[150] = 0;
  _$jscoverage['/util/array.js'].lineData[151] = 0;
  _$jscoverage['/util/array.js'].lineData[152] = 0;
  _$jscoverage['/util/array.js'].lineData[155] = 0;
  _$jscoverage['/util/array.js'].lineData[158] = 0;
  _$jscoverage['/util/array.js'].lineData[174] = 0;
  _$jscoverage['/util/array.js'].lineData[175] = 0;
  _$jscoverage['/util/array.js'].lineData[176] = 0;
  _$jscoverage['/util/array.js'].lineData[180] = 0;
  _$jscoverage['/util/array.js'].lineData[181] = 0;
  _$jscoverage['/util/array.js'].lineData[184] = 0;
  _$jscoverage['/util/array.js'].lineData[185] = 0;
  _$jscoverage['/util/array.js'].lineData[186] = 0;
  _$jscoverage['/util/array.js'].lineData[187] = 0;
  _$jscoverage['/util/array.js'].lineData[189] = 0;
  _$jscoverage['/util/array.js'].lineData[190] = 0;
  _$jscoverage['/util/array.js'].lineData[191] = 0;
  _$jscoverage['/util/array.js'].lineData[192] = 0;
  _$jscoverage['/util/array.js'].lineData[196] = 0;
  _$jscoverage['/util/array.js'].lineData[197] = 0;
  _$jscoverage['/util/array.js'].lineData[198] = 0;
  _$jscoverage['/util/array.js'].lineData[204] = 0;
  _$jscoverage['/util/array.js'].lineData[205] = 0;
  _$jscoverage['/util/array.js'].lineData[206] = 0;
  _$jscoverage['/util/array.js'].lineData[208] = 0;
  _$jscoverage['/util/array.js'].lineData[211] = 0;
  _$jscoverage['/util/array.js'].lineData[225] = 0;
  _$jscoverage['/util/array.js'].lineData[228] = 0;
  _$jscoverage['/util/array.js'].lineData[229] = 0;
  _$jscoverage['/util/array.js'].lineData[230] = 0;
  _$jscoverage['/util/array.js'].lineData[231] = 0;
  _$jscoverage['/util/array.js'].lineData[234] = 0;
  _$jscoverage['/util/array.js'].lineData[248] = 0;
  _$jscoverage['/util/array.js'].lineData[251] = 0;
  _$jscoverage['/util/array.js'].lineData[252] = 0;
  _$jscoverage['/util/array.js'].lineData[253] = 0;
  _$jscoverage['/util/array.js'].lineData[254] = 0;
  _$jscoverage['/util/array.js'].lineData[257] = 0;
  _$jscoverage['/util/array.js'].lineData[267] = 0;
  _$jscoverage['/util/array.js'].lineData[268] = 0;
  _$jscoverage['/util/array.js'].lineData[270] = 0;
  _$jscoverage['/util/array.js'].lineData[271] = 0;
  _$jscoverage['/util/array.js'].lineData[273] = 0;
  _$jscoverage['/util/array.js'].lineData[276] = 0;
  _$jscoverage['/util/array.js'].lineData[286] = 0;
  _$jscoverage['/util/array.js'].lineData[288] = 0;
  _$jscoverage['/util/array.js'].lineData[289] = 0;
  _$jscoverage['/util/array.js'].lineData[290] = 0;
  _$jscoverage['/util/array.js'].lineData[292] = 0;
}
if (! _$jscoverage['/util/array.js'].functionData) {
  _$jscoverage['/util/array.js'].functionData = [];
  _$jscoverage['/util/array.js'].functionData[0] = 0;
  _$jscoverage['/util/array.js'].functionData[1] = 0;
  _$jscoverage['/util/array.js'].functionData[2] = 0;
  _$jscoverage['/util/array.js'].functionData[3] = 0;
  _$jscoverage['/util/array.js'].functionData[4] = 0;
  _$jscoverage['/util/array.js'].functionData[5] = 0;
  _$jscoverage['/util/array.js'].functionData[6] = 0;
  _$jscoverage['/util/array.js'].functionData[7] = 0;
  _$jscoverage['/util/array.js'].functionData[8] = 0;
  _$jscoverage['/util/array.js'].functionData[9] = 0;
  _$jscoverage['/util/array.js'].functionData[10] = 0;
  _$jscoverage['/util/array.js'].functionData[11] = 0;
  _$jscoverage['/util/array.js'].functionData[12] = 0;
  _$jscoverage['/util/array.js'].functionData[13] = 0;
  _$jscoverage['/util/array.js'].functionData[14] = 0;
  _$jscoverage['/util/array.js'].functionData[15] = 0;
  _$jscoverage['/util/array.js'].functionData[16] = 0;
  _$jscoverage['/util/array.js'].functionData[17] = 0;
}
if (! _$jscoverage['/util/array.js'].branchData) {
  _$jscoverage['/util/array.js'].branchData = {};
  _$jscoverage['/util/array.js'].branchData['32'] = [];
  _$jscoverage['/util/array.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['33'] = [];
  _$jscoverage['/util/array.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['55'] = [];
  _$jscoverage['/util/array.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['56'] = [];
  _$jscoverage['/util/array.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['73'] = [];
  _$jscoverage['/util/array.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['80'] = [];
  _$jscoverage['/util/array.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['82'] = [];
  _$jscoverage['/util/array.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['88'] = [];
  _$jscoverage['/util/array.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['102'] = [];
  _$jscoverage['/util/array.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['119'] = [];
  _$jscoverage['/util/array.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['124'] = [];
  _$jscoverage['/util/array.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['145'] = [];
  _$jscoverage['/util/array.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['150'] = [];
  _$jscoverage['/util/array.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['151'] = [];
  _$jscoverage['/util/array.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['152'] = [];
  _$jscoverage['/util/array.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['155'] = [];
  _$jscoverage['/util/array.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['175'] = [];
  _$jscoverage['/util/array.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['180'] = [];
  _$jscoverage['/util/array.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['180'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['186'] = [];
  _$jscoverage['/util/array.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['190'] = [];
  _$jscoverage['/util/array.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['197'] = [];
  _$jscoverage['/util/array.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['204'] = [];
  _$jscoverage['/util/array.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['205'] = [];
  _$jscoverage['/util/array.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['225'] = [];
  _$jscoverage['/util/array.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['228'] = [];
  _$jscoverage['/util/array.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['229'] = [];
  _$jscoverage['/util/array.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['230'] = [];
  _$jscoverage['/util/array.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['248'] = [];
  _$jscoverage['/util/array.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['251'] = [];
  _$jscoverage['/util/array.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['252'] = [];
  _$jscoverage['/util/array.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['253'] = [];
  _$jscoverage['/util/array.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['267'] = [];
  _$jscoverage['/util/array.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['270'] = [];
  _$jscoverage['/util/array.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['276'] = [];
  _$jscoverage['/util/array.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['279'] = [];
  _$jscoverage['/util/array.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['282'] = [];
  _$jscoverage['/util/array.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['282'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['282'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['283'] = [];
  _$jscoverage['/util/array.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['283'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['285'] = [];
  _$jscoverage['/util/array.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['285'][2] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['285'][3] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['285'][4] = new BranchData();
  _$jscoverage['/util/array.js'].branchData['289'] = [];
  _$jscoverage['/util/array.js'].branchData['289'][1] = new BranchData();
}
_$jscoverage['/util/array.js'].branchData['289'][1].init(891, 5, 'i < l');
function visit53_289_1(result) {
  _$jscoverage['/util/array.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['285'][4].init(146, 23, 'lengthType === \'number\'');
function visit52_285_4(result) {
  _$jscoverage['/util/array.js'].branchData['285'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['285'][3].init(131, 38, '\'item\' in o && lengthType === \'number\'');
function visit51_285_3(result) {
  _$jscoverage['/util/array.js'].branchData['285'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['285'][2].init(105, 20, 'oType === \'function\'');
function visit50_285_2(result) {
  _$jscoverage['/util/array.js'].branchData['285'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['285'][1].init(105, 65, 'oType === \'function\' && !(\'item\' in o && lengthType === \'number\')');
function visit49_285_1(result) {
  _$jscoverage['/util/array.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['283'][2].init(609, 18, 'oType === \'string\'');
function visit48_283_2(result) {
  _$jscoverage['/util/array.js'].branchData['283'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['283'][1].init(46, 172, 'oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit47_283_1(result) {
  _$jscoverage['/util/array.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['282'][4].init(574, 13, 'o == o.window');
function visit46_282_4(result) {
  _$jscoverage['/util/array.js'].branchData['282'][4].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['282'][3].init(561, 9, 'o != null');
function visit45_282_3(result) {
  _$jscoverage['/util/array.js'].branchData['282'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['282'][2].init(561, 26, 'o != null && o == o.window');
function visit44_282_2(result) {
  _$jscoverage['/util/array.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['282'][1].init(116, 219, '(o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit43_282_1(result) {
  _$jscoverage['/util/array.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['279'][2].init(443, 30, 'typeof o.nodeName === \'string\'');
function visit42_279_2(result) {
  _$jscoverage['/util/array.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['279'][1].init(141, 336, 'typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit41_279_1(result) {
  _$jscoverage['/util/array.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['276'][2].init(299, 23, 'lengthType !== \'number\'');
function visit40_276_2(result) {
  _$jscoverage['/util/array.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['276'][1].init(299, 478, 'lengthType !== \'number\' || typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit39_276_1(result) {
  _$jscoverage['/util/array.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['270'][1].init(87, 12, 'S.isArray(o)');
function visit38_270_1(result) {
  _$jscoverage['/util/array.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['267'][1].init(17, 9, 'o == null');
function visit37_267_1(result) {
  _$jscoverage['/util/array.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['253'][1].init(25, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit36_253_1(result) {
  _$jscoverage['/util/array.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['252'][1].init(83, 7, 'i < len');
function visit35_252_1(result) {
  _$jscoverage['/util/array.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['251'][2].init(27, 17, 'arr && arr.length');
function visit34_251_2(result) {
  _$jscoverage['/util/array.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['251'][1].init(27, 22, 'arr && arr.length || 0');
function visit33_251_1(result) {
  _$jscoverage['/util/array.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['248'][1].init(43, 15, 'context || this');
function visit32_248_1(result) {
  _$jscoverage['/util/array.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['230'][1].init(25, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit31_230_1(result) {
  _$jscoverage['/util/array.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['229'][1].init(83, 7, 'i < len');
function visit30_229_1(result) {
  _$jscoverage['/util/array.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['228'][2].init(27, 17, 'arr && arr.length');
function visit29_228_2(result) {
  _$jscoverage['/util/array.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['228'][1].init(27, 22, 'arr && arr.length || 0');
function visit28_228_1(result) {
  _$jscoverage['/util/array.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['225'][1].init(44, 15, 'context || this');
function visit27_225_1(result) {
  _$jscoverage['/util/array.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['205'][1].init(21, 8, 'k in arr');
function visit26_205_1(result) {
  _$jscoverage['/util/array.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['204'][1].init(978, 7, 'k < len');
function visit25_204_1(result) {
  _$jscoverage['/util/array.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['197'][1].init(270, 8, 'k >= len');
function visit24_197_1(result) {
  _$jscoverage['/util/array.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['190'][1].init(25, 8, 'k in arr');
function visit23_190_1(result) {
  _$jscoverage['/util/array.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['186'][1].init(435, 21, 'arguments.length >= 3');
function visit22_186_1(result) {
  _$jscoverage['/util/array.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['180'][3].init(268, 22, 'arguments.length === 2');
function visit21_180_3(result) {
  _$jscoverage['/util/array.js'].branchData['180'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['180'][2].init(255, 9, 'len === 0');
function visit20_180_2(result) {
  _$jscoverage['/util/array.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['180'][1].init(255, 35, 'len === 0 && arguments.length === 2');
function visit19_180_1(result) {
  _$jscoverage['/util/array.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['175'][1].init(51, 30, 'typeof callback !== \'function\'');
function visit18_175_1(result) {
  _$jscoverage['/util/array.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['155'][1].init(42, 15, 'context || this');
function visit17_155_1(result) {
  _$jscoverage['/util/array.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['152'][1].init(104, 106, 'el || i in arr');
function visit16_152_1(result) {
  _$jscoverage['/util/array.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['151'][1].init(30, 23, 'typeof arr === \'string\'');
function visit15_151_1(result) {
  _$jscoverage['/util/array.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['150'][1].init(113, 7, 'i < len');
function visit14_150_1(result) {
  _$jscoverage['/util/array.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['145'][1].init(42, 15, 'context || this');
function visit13_145_1(result) {
  _$jscoverage['/util/array.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['124'][2].init(33, 15, 'context || this');
function visit12_124_2(result) {
  _$jscoverage['/util/array.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['124'][1].init(25, 38, 'fn.call(context || this, item, i, arr)');
function visit11_124_1(result) {
  _$jscoverage['/util/array.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['119'][1].init(45, 15, 'context || this');
function visit10_119_1(result) {
  _$jscoverage['/util/array.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['102'][1].init(20, 25, 'S.indexOf(item, arr) > -1');
function visit9_102_1(result) {
  _$jscoverage['/util/array.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['88'][1].init(402, 8, 'override');
function visit8_88_1(result) {
  _$jscoverage['/util/array.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['82'][1].init(54, 33, '(n = S.lastIndexOf(item, b)) !== i');
function visit7_82_1(result) {
  _$jscoverage['/util/array.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['80'][1].init(187, 12, 'i < b.length');
function visit6_80_1(result) {
  _$jscoverage['/util/array.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['73'][1].init(48, 8, 'override');
function visit5_73_1(result) {
  _$jscoverage['/util/array.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['56'][1].init(25, 15, 'arr[i] === item');
function visit4_56_1(result) {
  _$jscoverage['/util/array.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['55'][1].init(46, 6, 'i >= 0');
function visit3_55_1(result) {
  _$jscoverage['/util/array.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['33'][1].init(25, 15, 'arr[i] === item');
function visit2_33_1(result) {
  _$jscoverage['/util/array.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].branchData['32'][1].init(51, 7, 'i < len');
function visit1_32_1(result) {
  _$jscoverage['/util/array.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/array.js'].lineData[7]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/util/array.js'].functionData[0]++;
  _$jscoverage['/util/array.js'].lineData[8]++;
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  _$jscoverage['/util/array.js'].lineData[18]++;
  S.mix(S, {
  indexOf: indexOf ? function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[1]++;
  _$jscoverage['/util/array.js'].lineData[29]++;
  return indexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[2]++;
  _$jscoverage['/util/array.js'].lineData[32]++;
  for (var i = 0, len = arr.length; visit1_32_1(i < len); ++i) {
    _$jscoverage['/util/array.js'].lineData[33]++;
    if (visit2_33_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[34]++;
      return i;
    }
  }
  _$jscoverage['/util/array.js'].lineData[37]++;
  return -1;
}, 
  lastIndexOf: (lastIndexOf) ? function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[3]++;
  _$jscoverage['/util/array.js'].lineData[52]++;
  return lastIndexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[4]++;
  _$jscoverage['/util/array.js'].lineData[55]++;
  for (var i = arr.length - 1; visit3_55_1(i >= 0); i--) {
    _$jscoverage['/util/array.js'].lineData[56]++;
    if (visit4_56_1(arr[i] === item)) {
      _$jscoverage['/util/array.js'].lineData[57]++;
      break;
    }
  }
  _$jscoverage['/util/array.js'].lineData[60]++;
  return i;
}, 
  unique: function(a, override) {
  _$jscoverage['/util/array.js'].functionData[5]++;
  _$jscoverage['/util/array.js'].lineData[72]++;
  var b = a.slice();
  _$jscoverage['/util/array.js'].lineData[73]++;
  if (visit5_73_1(override)) {
    _$jscoverage['/util/array.js'].lineData[74]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[76]++;
  var i = 0, n, item;
  _$jscoverage['/util/array.js'].lineData[80]++;
  while (visit6_80_1(i < b.length)) {
    _$jscoverage['/util/array.js'].lineData[81]++;
    item = b[i];
    _$jscoverage['/util/array.js'].lineData[82]++;
    while (visit7_82_1((n = S.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/util/array.js'].lineData[83]++;
      b.splice(n, 1);
    }
    _$jscoverage['/util/array.js'].lineData[85]++;
    i += 1;
  }
  _$jscoverage['/util/array.js'].lineData[88]++;
  if (visit8_88_1(override)) {
    _$jscoverage['/util/array.js'].lineData[89]++;
    b.reverse();
  }
  _$jscoverage['/util/array.js'].lineData[91]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/util/array.js'].functionData[6]++;
  _$jscoverage['/util/array.js'].lineData[102]++;
  return visit9_102_1(S.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[7]++;
  _$jscoverage['/util/array.js'].lineData[119]++;
  return filter.call(arr, fn, visit10_119_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[8]++;
  _$jscoverage['/util/array.js'].lineData[122]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[123]++;
  S.each(arr, function(item, i, arr) {
  _$jscoverage['/util/array.js'].functionData[9]++;
  _$jscoverage['/util/array.js'].lineData[124]++;
  if (visit11_124_1(fn.call(visit12_124_2(context || this), item, i, arr))) {
    _$jscoverage['/util/array.js'].lineData[125]++;
    ret.push(item);
  }
});
  _$jscoverage['/util/array.js'].lineData[128]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[10]++;
  _$jscoverage['/util/array.js'].lineData[145]++;
  return map.call(arr, fn, visit13_145_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[11]++;
  _$jscoverage['/util/array.js'].lineData[148]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/util/array.js'].lineData[150]++;
  for (var i = 0; visit14_150_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[151]++;
    var el = visit15_151_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/util/array.js'].lineData[152]++;
    if (visit16_152_1(el || i in arr)) {
      _$jscoverage['/util/array.js'].lineData[155]++;
      res[i] = fn.call(visit17_155_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/util/array.js'].lineData[158]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/util/array.js'].functionData[12]++;
  _$jscoverage['/util/array.js'].lineData[174]++;
  var len = arr.length;
  _$jscoverage['/util/array.js'].lineData[175]++;
  if (visit18_175_1(typeof callback !== 'function')) {
    _$jscoverage['/util/array.js'].lineData[176]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/util/array.js'].lineData[180]++;
  if (visit19_180_1(visit20_180_2(len === 0) && visit21_180_3(arguments.length === 2))) {
    _$jscoverage['/util/array.js'].lineData[181]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/util/array.js'].lineData[184]++;
  var k = 0;
  _$jscoverage['/util/array.js'].lineData[185]++;
  var accumulator;
  _$jscoverage['/util/array.js'].lineData[186]++;
  if (visit22_186_1(arguments.length >= 3)) {
    _$jscoverage['/util/array.js'].lineData[187]++;
    accumulator = initialValue;
  } else {
    _$jscoverage['/util/array.js'].lineData[189]++;
    do {
      _$jscoverage['/util/array.js'].lineData[190]++;
      if (visit23_190_1(k in arr)) {
        _$jscoverage['/util/array.js'].lineData[191]++;
        accumulator = arr[k++];
        _$jscoverage['/util/array.js'].lineData[192]++;
        break;
      }
      _$jscoverage['/util/array.js'].lineData[196]++;
      k += 1;
      _$jscoverage['/util/array.js'].lineData[197]++;
      if (visit24_197_1(k >= len)) {
        _$jscoverage['/util/array.js'].lineData[198]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/util/array.js'].lineData[204]++;
  while (visit25_204_1(k < len)) {
    _$jscoverage['/util/array.js'].lineData[205]++;
    if (visit26_205_1(k in arr)) {
      _$jscoverage['/util/array.js'].lineData[206]++;
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/util/array.js'].lineData[208]++;
    k++;
  }
  _$jscoverage['/util/array.js'].lineData[211]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[13]++;
  _$jscoverage['/util/array.js'].lineData[225]++;
  return every.call(arr, fn, visit27_225_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[14]++;
  _$jscoverage['/util/array.js'].lineData[228]++;
  var len = visit28_228_1(visit29_228_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[229]++;
  for (var i = 0; visit30_229_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[230]++;
    if (visit31_230_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[231]++;
      return FALSE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[234]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[15]++;
  _$jscoverage['/util/array.js'].lineData[248]++;
  return some.call(arr, fn, visit32_248_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/util/array.js'].functionData[16]++;
  _$jscoverage['/util/array.js'].lineData[251]++;
  var len = visit33_251_1(visit34_251_2(arr && arr.length) || 0);
  _$jscoverage['/util/array.js'].lineData[252]++;
  for (var i = 0; visit35_252_1(i < len); i++) {
    _$jscoverage['/util/array.js'].lineData[253]++;
    if (visit36_253_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/util/array.js'].lineData[254]++;
      return TRUE;
    }
  }
  _$jscoverage['/util/array.js'].lineData[257]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/util/array.js'].functionData[17]++;
  _$jscoverage['/util/array.js'].lineData[267]++;
  if (visit37_267_1(o == null)) {
    _$jscoverage['/util/array.js'].lineData[268]++;
    return [];
  }
  _$jscoverage['/util/array.js'].lineData[270]++;
  if (visit38_270_1(S.isArray(o))) {
    _$jscoverage['/util/array.js'].lineData[271]++;
    return o;
  }
  _$jscoverage['/util/array.js'].lineData[273]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/util/array.js'].lineData[276]++;
  if (visit39_276_1(visit40_276_2(lengthType !== 'number') || visit41_279_1(visit42_279_2(typeof o.nodeName === 'string') || visit43_282_1((visit44_282_2(visit45_282_3(o != null) && visit46_282_4(o == o.window))) || visit47_283_1(visit48_283_2(oType === 'string') || (visit49_285_1(visit50_285_2(oType === 'function') && !(visit51_285_3('item' in o && visit52_285_4(lengthType === 'number')))))))))) {
    _$jscoverage['/util/array.js'].lineData[286]++;
    return [o];
  }
  _$jscoverage['/util/array.js'].lineData[288]++;
  var ret = [];
  _$jscoverage['/util/array.js'].lineData[289]++;
  for (var i = 0, l = o.length; visit53_289_1(i < l); i++) {
    _$jscoverage['/util/array.js'].lineData[290]++;
    ret[i] = o[i];
  }
  _$jscoverage['/util/array.js'].lineData[292]++;
  return ret;
}});
});
