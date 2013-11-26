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
if (! _$jscoverage['/base/dom-event.js']) {
  _$jscoverage['/base/dom-event.js'] = {};
  _$jscoverage['/base/dom-event.js'].lineData = [];
  _$jscoverage['/base/dom-event.js'].lineData[6] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[7] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[8] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[9] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[10] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[11] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[12] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[14] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[16] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[18] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[19] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[24] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[27] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[28] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[31] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[34] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[35] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[40] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[41] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[44] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[46] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[47] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[51] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[56] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[58] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[59] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[60] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[61] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[62] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[64] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[66] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[69] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[70] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[74] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[76] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[77] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[82] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[85] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[87] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[90] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[92] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[94] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[96] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[98] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[101] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[102] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[106] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[107] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[108] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[110] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[113] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[115] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[116] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[125] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[141] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[143] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[144] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[145] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[146] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[147] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[148] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[152] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[171] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[173] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[175] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[183] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[184] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[185] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[187] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[188] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[189] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[190] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[197] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[212] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[229] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[247] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[249] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[255] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[257] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[259] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[264] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[267] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[268] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[270] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[276] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[279] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[281] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[282] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[283] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[286] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[287] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[292] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[293] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[294] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[295] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[301] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[316] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[328] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[330] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[331] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[333] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[334] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[337] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[339] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[340] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[341] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[345] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[351] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].functionData) {
  _$jscoverage['/base/dom-event.js'].functionData = [];
  _$jscoverage['/base/dom-event.js'].functionData[0] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[1] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[2] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[3] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[4] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[5] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[6] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[7] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[8] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[9] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[10] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[11] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[12] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[13] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[14] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[15] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].branchData) {
  _$jscoverage['/base/dom-event.js'].branchData = {};
  _$jscoverage['/base/dom-event.js'].branchData['19'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['24'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['46'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['54'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['55'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['59'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['69'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['76'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['99'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['101'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['106'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['115'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['146'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['183'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['187'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['189'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['249'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['274'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['281'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['286'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['292'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['294'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['294'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['294'][3] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['330'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['334'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['334'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['334'][2].init(300, 36, 'srcData === DomEventUtils.data(dest)');
function visit28_334_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['334'][1].init(289, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit27_334_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['330'][1].init(97, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit26_330_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['294'][3].init(124, 15, 'r !== undefined');
function visit25_294_3(result) {
  _$jscoverage['/base/dom-event.js'].branchData['294'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['294'][2].init(107, 13, 'ret !== false');
function visit24_294_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['294'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['294'][1].init(107, 32, 'ret !== false && r !== undefined');
function visit23_294_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['292'][1].init(542, 18, 'domEventObservable');
function visit22_292_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['286'][1].init(260, 36, '!onlyHandlers && !domEventObservable');
function visit21_286_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['281'][1].init(676, 6, 'i >= 0');
function visit20_281_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['274'][1].init(468, 14, 's && s.typeFix');
function visit19_274_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['249'][1].init(112, 15, 'eventData || {}');
function visit18_249_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['189'][1].init(123, 6, 'j >= 0');
function visit17_189_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['187'][1].init(152, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_187_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['183'][1].init(266, 6, 'i >= 0');
function visit15_183_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['146'][1].init(156, 6, 'i >= 0');
function visit14_146_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['115'][1].init(659, 11, 'customEvent');
function visit13_115_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['106'][1].init(440, 5, '!type');
function visit12_106_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['101'][1].init(306, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_101_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['99'][1].init(130, 31, 'domEventObservablesHolder || {}');
function visit10_99_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['76'][1].init(1648, 19, '!domEventObservable');
function visit9_76_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['69'][1].init(1358, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_69_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['59'][1].init(577, 18, 'domEventObservable');
function visit7_59_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['55'][1].init(64, 27, 'typeof KISSY == \'undefined\'');
function visit6_55_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['54'][2].init(305, 41, 'DomEventObservable.triggeredEvent == type');
function visit5_54_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['54'][1].init(305, 92, 'DomEventObservable.triggeredEvent == type || typeof KISSY == \'undefined\'');
function visit4_54_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['46'][1].init(324, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_46_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['24'][1].init(174, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_24_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['19'][1].init(17, 19, 'Special[type] || {}');
function visit1_19_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/dom-event.js'].lineData[8]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/dom-event.js'].lineData[9]++;
  var Dom = require('dom');
  _$jscoverage['/base/dom-event.js'].lineData[10]++;
  var Special = require('./special');
  _$jscoverage['/base/dom-event.js'].lineData[11]++;
  var DomEventObservable = require('./observable');
  _$jscoverage['/base/dom-event.js'].lineData[12]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/dom-event.js'].lineData[14]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[16]++;
  var undefined = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[18]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[19]++;
    var s = visit1_19_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[24]++;
    if (visit2_24_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[27]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[28]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[31]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[34]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[35]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[40]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[41]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[44]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[46]++;
    if (visit3_46_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[47]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[51]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[54]++;
  if (visit4_54_1(visit5_54_2(DomEventObservable.triggeredEvent == type) || visit6_55_1(typeof KISSY == 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[56]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[58]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[59]++;
  if (visit7_59_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[60]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[61]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[62]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[64]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[66]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[69]++;
    if (visit8_69_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[70]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[74]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[76]++;
    if (visit9_76_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[77]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[82]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[85]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[87]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[90]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[92]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[94]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[96]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[98]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_99_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[101]++;
    if (visit11_101_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[102]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[106]++;
    if (visit12_106_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[107]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[108]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[110]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[113]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[115]++;
    if (visit13_115_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[116]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[125]++;
  var DomEvent = {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[141]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[143]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[144]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[145]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[146]++;
  for (i = targets.length - 1; visit14_146_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[147]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[148]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[152]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[171]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[173]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[175]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[181]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[183]++;
  for (i = targets.length - 1; visit15_183_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[184]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[185]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[187]++;
    if (visit16_187_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[188]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[189]++;
      for (j = elChildren.length - 1; visit17_189_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[190]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[197]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[212]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[229]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[247]++;
  var ret = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[249]++;
  eventData = visit18_249_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[255]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[257]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[259]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[264]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[267]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[268]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[270]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[274]++;
  if (visit19_274_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[276]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[279]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[281]++;
  for (i = targets.length - 1; visit20_281_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[282]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[283]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[286]++;
    if (visit21_286_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[287]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[292]++;
    if (visit22_292_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[293]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[294]++;
      if (visit23_294_1(visit24_294_2(ret !== false) && visit25_294_3(r !== undefined))) {
        _$jscoverage['/base/dom-event.js'].lineData[295]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[301]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[316]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[328]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[330]++;
  if (visit26_330_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[331]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[333]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[334]++;
  if (visit27_334_1(srcData && visit28_334_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[337]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[339]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[340]++;
  S.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[341]++;
  S.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[345]++;
  addInternal(dest, type, observer);
});
});
}};
  _$jscoverage['/base/dom-event.js'].lineData[351]++;
  return DomEvent;
});
