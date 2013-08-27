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
if (! _$jscoverage['/editor/utils.js']) {
  _$jscoverage['/editor/utils.js'] = {};
  _$jscoverage['/editor/utils.js'].lineData = [];
  _$jscoverage['/editor/utils.js'].lineData[5] = 0;
  _$jscoverage['/editor/utils.js'].lineData[7] = 0;
  _$jscoverage['/editor/utils.js'].lineData[27] = 0;
  _$jscoverage['/editor/utils.js'].lineData[28] = 0;
  _$jscoverage['/editor/utils.js'].lineData[29] = 0;
  _$jscoverage['/editor/utils.js'].lineData[31] = 0;
  _$jscoverage['/editor/utils.js'].lineData[32] = 0;
  _$jscoverage['/editor/utils.js'].lineData[33] = 0;
  _$jscoverage['/editor/utils.js'].lineData[35] = 0;
  _$jscoverage['/editor/utils.js'].lineData[37] = 0;
  _$jscoverage['/editor/utils.js'].lineData[39] = 0;
  _$jscoverage['/editor/utils.js'].lineData[49] = 0;
  _$jscoverage['/editor/utils.js'].lineData[50] = 0;
  _$jscoverage['/editor/utils.js'].lineData[51] = 0;
  _$jscoverage['/editor/utils.js'].lineData[52] = 0;
  _$jscoverage['/editor/utils.js'].lineData[53] = 0;
  _$jscoverage['/editor/utils.js'].lineData[61] = 0;
  _$jscoverage['/editor/utils.js'].lineData[65] = 0;
  _$jscoverage['/editor/utils.js'].lineData[66] = 0;
  _$jscoverage['/editor/utils.js'].lineData[69] = 0;
  _$jscoverage['/editor/utils.js'].lineData[70] = 0;
  _$jscoverage['/editor/utils.js'].lineData[71] = 0;
  _$jscoverage['/editor/utils.js'].lineData[73] = 0;
  _$jscoverage['/editor/utils.js'].lineData[82] = 0;
  _$jscoverage['/editor/utils.js'].lineData[83] = 0;
  _$jscoverage['/editor/utils.js'].lineData[84] = 0;
  _$jscoverage['/editor/utils.js'].lineData[85] = 0;
  _$jscoverage['/editor/utils.js'].lineData[86] = 0;
  _$jscoverage['/editor/utils.js'].lineData[87] = 0;
  _$jscoverage['/editor/utils.js'].lineData[92] = 0;
  _$jscoverage['/editor/utils.js'].lineData[102] = 0;
  _$jscoverage['/editor/utils.js'].lineData[103] = 0;
  _$jscoverage['/editor/utils.js'].lineData[105] = 0;
  _$jscoverage['/editor/utils.js'].lineData[106] = 0;
  _$jscoverage['/editor/utils.js'].lineData[108] = 0;
  _$jscoverage['/editor/utils.js'].lineData[109] = 0;
  _$jscoverage['/editor/utils.js'].lineData[110] = 0;
  _$jscoverage['/editor/utils.js'].lineData[113] = 0;
  _$jscoverage['/editor/utils.js'].lineData[120] = 0;
  _$jscoverage['/editor/utils.js'].lineData[122] = 0;
  _$jscoverage['/editor/utils.js'].lineData[133] = 0;
  _$jscoverage['/editor/utils.js'].lineData[142] = 0;
  _$jscoverage['/editor/utils.js'].lineData[149] = 0;
  _$jscoverage['/editor/utils.js'].lineData[158] = 0;
  _$jscoverage['/editor/utils.js'].lineData[159] = 0;
  _$jscoverage['/editor/utils.js'].lineData[163] = 0;
  _$jscoverage['/editor/utils.js'].lineData[164] = 0;
  _$jscoverage['/editor/utils.js'].lineData[165] = 0;
  _$jscoverage['/editor/utils.js'].lineData[168] = 0;
  _$jscoverage['/editor/utils.js'].lineData[177] = 0;
  _$jscoverage['/editor/utils.js'].lineData[178] = 0;
  _$jscoverage['/editor/utils.js'].lineData[186] = 0;
  _$jscoverage['/editor/utils.js'].lineData[187] = 0;
  _$jscoverage['/editor/utils.js'].lineData[188] = 0;
  _$jscoverage['/editor/utils.js'].lineData[189] = 0;
  _$jscoverage['/editor/utils.js'].lineData[190] = 0;
  _$jscoverage['/editor/utils.js'].lineData[191] = 0;
  _$jscoverage['/editor/utils.js'].lineData[201] = 0;
  _$jscoverage['/editor/utils.js'].lineData[202] = 0;
  _$jscoverage['/editor/utils.js'].lineData[203] = 0;
  _$jscoverage['/editor/utils.js'].lineData[205] = 0;
  _$jscoverage['/editor/utils.js'].lineData[208] = 0;
  _$jscoverage['/editor/utils.js'].lineData[209] = 0;
  _$jscoverage['/editor/utils.js'].lineData[219] = 0;
  _$jscoverage['/editor/utils.js'].lineData[220] = 0;
  _$jscoverage['/editor/utils.js'].lineData[221] = 0;
  _$jscoverage['/editor/utils.js'].lineData[223] = 0;
  _$jscoverage['/editor/utils.js'].lineData[224] = 0;
  _$jscoverage['/editor/utils.js'].lineData[225] = 0;
  _$jscoverage['/editor/utils.js'].lineData[226] = 0;
  _$jscoverage['/editor/utils.js'].lineData[229] = 0;
  _$jscoverage['/editor/utils.js'].lineData[230] = 0;
  _$jscoverage['/editor/utils.js'].lineData[231] = 0;
  _$jscoverage['/editor/utils.js'].lineData[232] = 0;
  _$jscoverage['/editor/utils.js'].lineData[244] = 0;
  _$jscoverage['/editor/utils.js'].lineData[253] = 0;
  _$jscoverage['/editor/utils.js'].lineData[254] = 0;
  _$jscoverage['/editor/utils.js'].lineData[256] = 0;
  _$jscoverage['/editor/utils.js'].lineData[257] = 0;
  _$jscoverage['/editor/utils.js'].lineData[258] = 0;
  _$jscoverage['/editor/utils.js'].lineData[262] = 0;
  _$jscoverage['/editor/utils.js'].lineData[269] = 0;
  _$jscoverage['/editor/utils.js'].lineData[270] = 0;
  _$jscoverage['/editor/utils.js'].lineData[272] = 0;
  _$jscoverage['/editor/utils.js'].lineData[283] = 0;
  _$jscoverage['/editor/utils.js'].lineData[285] = 0;
  _$jscoverage['/editor/utils.js'].lineData[287] = 0;
  _$jscoverage['/editor/utils.js'].lineData[295] = 0;
  _$jscoverage['/editor/utils.js'].lineData[296] = 0;
  _$jscoverage['/editor/utils.js'].lineData[297] = 0;
  _$jscoverage['/editor/utils.js'].lineData[298] = 0;
  _$jscoverage['/editor/utils.js'].lineData[299] = 0;
  _$jscoverage['/editor/utils.js'].lineData[300] = 0;
  _$jscoverage['/editor/utils.js'].lineData[301] = 0;
  _$jscoverage['/editor/utils.js'].lineData[302] = 0;
  _$jscoverage['/editor/utils.js'].lineData[303] = 0;
  _$jscoverage['/editor/utils.js'].lineData[305] = 0;
  _$jscoverage['/editor/utils.js'].lineData[306] = 0;
  _$jscoverage['/editor/utils.js'].lineData[307] = 0;
  _$jscoverage['/editor/utils.js'].lineData[310] = 0;
  _$jscoverage['/editor/utils.js'].lineData[321] = 0;
  _$jscoverage['/editor/utils.js'].lineData[322] = 0;
  _$jscoverage['/editor/utils.js'].lineData[323] = 0;
  _$jscoverage['/editor/utils.js'].lineData[330] = 0;
  _$jscoverage['/editor/utils.js'].lineData[331] = 0;
  _$jscoverage['/editor/utils.js'].lineData[332] = 0;
  _$jscoverage['/editor/utils.js'].lineData[333] = 0;
  _$jscoverage['/editor/utils.js'].lineData[334] = 0;
  _$jscoverage['/editor/utils.js'].lineData[336] = 0;
  _$jscoverage['/editor/utils.js'].lineData[337] = 0;
  _$jscoverage['/editor/utils.js'].lineData[339] = 0;
  _$jscoverage['/editor/utils.js'].lineData[340] = 0;
  _$jscoverage['/editor/utils.js'].lineData[344] = 0;
  _$jscoverage['/editor/utils.js'].lineData[351] = 0;
  _$jscoverage['/editor/utils.js'].lineData[352] = 0;
  _$jscoverage['/editor/utils.js'].lineData[357] = 0;
  _$jscoverage['/editor/utils.js'].lineData[359] = 0;
}
if (! _$jscoverage['/editor/utils.js'].functionData) {
  _$jscoverage['/editor/utils.js'].functionData = [];
  _$jscoverage['/editor/utils.js'].functionData[0] = 0;
  _$jscoverage['/editor/utils.js'].functionData[1] = 0;
  _$jscoverage['/editor/utils.js'].functionData[2] = 0;
  _$jscoverage['/editor/utils.js'].functionData[3] = 0;
  _$jscoverage['/editor/utils.js'].functionData[4] = 0;
  _$jscoverage['/editor/utils.js'].functionData[5] = 0;
  _$jscoverage['/editor/utils.js'].functionData[6] = 0;
  _$jscoverage['/editor/utils.js'].functionData[7] = 0;
  _$jscoverage['/editor/utils.js'].functionData[8] = 0;
  _$jscoverage['/editor/utils.js'].functionData[9] = 0;
  _$jscoverage['/editor/utils.js'].functionData[10] = 0;
  _$jscoverage['/editor/utils.js'].functionData[11] = 0;
  _$jscoverage['/editor/utils.js'].functionData[12] = 0;
  _$jscoverage['/editor/utils.js'].functionData[13] = 0;
  _$jscoverage['/editor/utils.js'].functionData[14] = 0;
  _$jscoverage['/editor/utils.js'].functionData[15] = 0;
  _$jscoverage['/editor/utils.js'].functionData[16] = 0;
  _$jscoverage['/editor/utils.js'].functionData[17] = 0;
  _$jscoverage['/editor/utils.js'].functionData[18] = 0;
  _$jscoverage['/editor/utils.js'].functionData[19] = 0;
  _$jscoverage['/editor/utils.js'].functionData[20] = 0;
  _$jscoverage['/editor/utils.js'].functionData[21] = 0;
  _$jscoverage['/editor/utils.js'].functionData[22] = 0;
  _$jscoverage['/editor/utils.js'].functionData[23] = 0;
  _$jscoverage['/editor/utils.js'].functionData[24] = 0;
  _$jscoverage['/editor/utils.js'].functionData[25] = 0;
  _$jscoverage['/editor/utils.js'].functionData[26] = 0;
  _$jscoverage['/editor/utils.js'].functionData[27] = 0;
  _$jscoverage['/editor/utils.js'].functionData[28] = 0;
}
if (! _$jscoverage['/editor/utils.js'].branchData) {
  _$jscoverage['/editor/utils.js'].branchData = {};
  _$jscoverage['/editor/utils.js'].branchData['28'] = [];
  _$jscoverage['/editor/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['31'] = [];
  _$jscoverage['/editor/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['32'] = [];
  _$jscoverage['/editor/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['83'] = [];
  _$jscoverage['/editor/utils.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['102'] = [];
  _$jscoverage['/editor/utils.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['105'] = [];
  _$jscoverage['/editor/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['105'][3] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['108'] = [];
  _$jscoverage['/editor/utils.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['109'] = [];
  _$jscoverage['/editor/utils.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['158'] = [];
  _$jscoverage['/editor/utils.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['163'] = [];
  _$jscoverage['/editor/utils.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['187'] = [];
  _$jscoverage['/editor/utils.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['190'] = [];
  _$jscoverage['/editor/utils.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['201'] = [];
  _$jscoverage['/editor/utils.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['202'] = [];
  _$jscoverage['/editor/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['220'] = [];
  _$jscoverage['/editor/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['224'] = [];
  _$jscoverage['/editor/utils.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['231'] = [];
  _$jscoverage['/editor/utils.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['257'] = [];
  _$jscoverage['/editor/utils.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['269'] = [];
  _$jscoverage['/editor/utils.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['276'] = [];
  _$jscoverage['/editor/utils.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['283'] = [];
  _$jscoverage['/editor/utils.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['302'] = [];
  _$jscoverage['/editor/utils.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['305'] = [];
  _$jscoverage['/editor/utils.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['306'] = [];
  _$jscoverage['/editor/utils.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['306'][2] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['321'] = [];
  _$jscoverage['/editor/utils.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['330'] = [];
  _$jscoverage['/editor/utils.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['331'] = [];
  _$jscoverage['/editor/utils.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['333'] = [];
  _$jscoverage['/editor/utils.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['336'] = [];
  _$jscoverage['/editor/utils.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/editor/utils.js'].branchData['339'] = [];
  _$jscoverage['/editor/utils.js'].branchData['339'][1] = new BranchData();
}
_$jscoverage['/editor/utils.js'].branchData['339'][1].init(147, 8, 'r.remove');
function visit1078_339_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['336'][1].init(30, 9, 'r.destroy');
function visit1077_336_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['333'][1].init(63, 23, 'typeof r === \'function\'');
function visit1076_333_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['331'][1].init(79, 14, 'i < res.length');
function visit1075_331_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['330'][1].init(28, 16, 'this.__res || []');
function visit1074_330_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['321'][1].init(31, 16, 'this.__res || []');
function visit1073_321_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['306'][2].init(64, 25, 'ret[0] && ret[0].nodeType');
function visit1072_306_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['306'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['306'][1].init(42, 48, 'ret.__IS_NODELIST || (ret[0] && ret[0].nodeType)');
function visit1071_306_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['305'][1].init(38, 14, 'S.isArray(ret)');
function visit1070_305_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['302'][2].init(235, 31, 'ret.nodeType || S.isWindow(ret)');
function visit1069_302_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['302'][1].init(227, 40, 'ret && (ret.nodeType || S.isWindow(ret))');
function visit1068_302_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['283'][1].init(22, 8, 'UA[\'ie\']');
function visit1067_283_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['276'][1].init(8242, 36, 'document[\'documentMode\'] || UA[\'ie\']');
function visit1066_276_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['269'][1].init(34, 14, 'i < arr.length');
function visit1065_269_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['257'][1].init(68, 23, 'typeof v === \'function\'');
function visit1064_257_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['231'][1].init(87, 24, 'S.trim(inp.val()) == tip');
function visit1063_231_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['224'][1].init(26, 18, '!S.trim(inp.val())');
function visit1062_224_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['220'][1].init(69, 9, '!UA[\'ie\']');
function visit1061_220_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['202'][1].init(26, 35, 'inp.hasClass("ks-editor-input-tip")');
function visit1060_202_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['201'][1].init(22, 17, 'val === undefined');
function visit1059_201_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['190'][1].init(239, 9, '!UA[\'ie\']');
function visit1058_190_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['187'][1].init(82, 23, 'placeholder && UA[\'ie\']');
function visit1057_187_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['163'][1].init(264, 37, 'verify && !new RegExp(verify).test(v)');
function visit1056_163_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['158'][1].init(34, 17, 'i < inputs.length');
function visit1055_158_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['109'][1].init(26, 27, 'arrayA[i] !== arrayB[i]');
function visit1054_109_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['108'][1].init(223, 17, 'i < arrayA.length');
function visit1053_108_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['105'][3].init(121, 30, 'arrayA.length != arrayB.length');
function visit1052_105_3(result) {
  _$jscoverage['/editor/utils.js'].branchData['105'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['105'][2].init(110, 41, '!arrayB || arrayA.length != arrayB.length');
function visit1051_105_2(result) {
  _$jscoverage['/editor/utils.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['105'][1].init(99, 52, '!arrayA || !arrayB || arrayA.length != arrayB.length');
function visit1050_105_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['102'][1].init(22, 18, '!arrayA && !arrayB');
function visit1049_102_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['83'][1].init(95, 10, 'i < length');
function visit1048_83_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['32'][1].init(26, 22, 'url.indexOf("?") != -1');
function visit1047_32_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['31'][1].init(185, 23, 'url.indexOf("?t") == -1');
function visit1046_31_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].branchData['28'][1].init(62, 13, '!Config.debug');
function visit1045_28_1(result) {
  _$jscoverage['/editor/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/utils.js'].lineData[5]++;
KISSY.add("editor/utils", function(S, Editor) {
  _$jscoverage['/editor/utils.js'].functionData[0]++;
  _$jscoverage['/editor/utils.js'].lineData[7]++;
  var TRUE = true, FALSE = false, NULL = null, Node = S.Node, Dom = S.DOM, UA = S.UA, Utils = {
  debugUrl: function(url) {
  _$jscoverage['/editor/utils.js'].functionData[1]++;
  _$jscoverage['/editor/utils.js'].lineData[27]++;
  var Config = S.Config;
  _$jscoverage['/editor/utils.js'].lineData[28]++;
  if (visit1045_28_1(!Config.debug)) {
    _$jscoverage['/editor/utils.js'].lineData[29]++;
    url = url.replace(/\.(js|css)/i, "-min.$1");
  }
  _$jscoverage['/editor/utils.js'].lineData[31]++;
  if (visit1046_31_1(url.indexOf("?t") == -1)) {
    _$jscoverage['/editor/utils.js'].lineData[32]++;
    if (visit1047_32_1(url.indexOf("?") != -1)) {
      _$jscoverage['/editor/utils.js'].lineData[33]++;
      url += "&";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[35]++;
      url += "?";
    }
    _$jscoverage['/editor/utils.js'].lineData[37]++;
    url += "t=" + encodeURIComponent(Config.tag);
  }
  _$jscoverage['/editor/utils.js'].lineData[39]++;
  return Config.base + "editor/" + url;
}, 
  lazyRun: function(obj, before, after) {
  _$jscoverage['/editor/utils.js'].functionData[2]++;
  _$jscoverage['/editor/utils.js'].lineData[49]++;
  var b = obj[before], a = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[50]++;
  obj[before] = function() {
  _$jscoverage['/editor/utils.js'].functionData[3]++;
  _$jscoverage['/editor/utils.js'].lineData[51]++;
  b.apply(this, arguments);
  _$jscoverage['/editor/utils.js'].lineData[52]++;
  obj[before] = obj[after];
  _$jscoverage['/editor/utils.js'].lineData[53]++;
  return a.apply(this, arguments);
};
}, 
  getXY: function(offset, editor) {
  _$jscoverage['/editor/utils.js'].functionData[4]++;
  _$jscoverage['/editor/utils.js'].lineData[61]++;
  var x = offset.left, y = offset.top, currentWindow = editor.get("window")[0];
  _$jscoverage['/editor/utils.js'].lineData[65]++;
  x -= Dom.scrollLeft(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[66]++;
  y -= Dom.scrollTop(currentWindow);
  _$jscoverage['/editor/utils.js'].lineData[69]++;
  var iframePosition = editor.get("iframe").offset();
  _$jscoverage['/editor/utils.js'].lineData[70]++;
  x += iframePosition.left;
  _$jscoverage['/editor/utils.js'].lineData[71]++;
  y += iframePosition.top;
  _$jscoverage['/editor/utils.js'].lineData[73]++;
  return {
  left: x, 
  top: y};
}, 
  tryThese: function(var_args) {
  _$jscoverage['/editor/utils.js'].functionData[5]++;
  _$jscoverage['/editor/utils.js'].lineData[82]++;
  var returnValue;
  _$jscoverage['/editor/utils.js'].lineData[83]++;
  for (var i = 0, length = arguments.length; visit1048_83_1(i < length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[84]++;
    var lambda = arguments[i];
    _$jscoverage['/editor/utils.js'].lineData[85]++;
    try {
      _$jscoverage['/editor/utils.js'].lineData[86]++;
      returnValue = lambda();
      _$jscoverage['/editor/utils.js'].lineData[87]++;
      break;
    }    catch (e) {
}
  }
  _$jscoverage['/editor/utils.js'].lineData[92]++;
  return returnValue;
}, 
  arrayCompare: function(arrayA, arrayB) {
  _$jscoverage['/editor/utils.js'].functionData[6]++;
  _$jscoverage['/editor/utils.js'].lineData[102]++;
  if (visit1049_102_1(!arrayA && !arrayB)) {
    _$jscoverage['/editor/utils.js'].lineData[103]++;
    return TRUE;
  }
  _$jscoverage['/editor/utils.js'].lineData[105]++;
  if (visit1050_105_1(!arrayA || visit1051_105_2(!arrayB || visit1052_105_3(arrayA.length != arrayB.length)))) {
    _$jscoverage['/editor/utils.js'].lineData[106]++;
    return FALSE;
  }
  _$jscoverage['/editor/utils.js'].lineData[108]++;
  for (var i = 0; visit1053_108_1(i < arrayA.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[109]++;
    if (visit1054_109_1(arrayA[i] !== arrayB[i])) {
      _$jscoverage['/editor/utils.js'].lineData[110]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[113]++;
  return TRUE;
}, 
  clearAllMarkers: function(database) {
  _$jscoverage['/editor/utils.js'].functionData[7]++;
  _$jscoverage['/editor/utils.js'].lineData[120]++;
  for (var i in database) {
    _$jscoverage['/editor/utils.js'].lineData[122]++;
    database[i]._4e_clearMarkers(database, TRUE, undefined);
  }
}, 
  ltrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[8]++;
  _$jscoverage['/editor/utils.js'].lineData[133]++;
  return str.replace(/^\s+/, "");
}, 
  rtrim: function(str) {
  _$jscoverage['/editor/utils.js'].functionData[9]++;
  _$jscoverage['/editor/utils.js'].lineData[142]++;
  return str.replace(/\s+$/, "");
}, 
  isNumber: function(n) {
  _$jscoverage['/editor/utils.js'].functionData[10]++;
  _$jscoverage['/editor/utils.js'].lineData[149]++;
  return /^\d+(.\d+)?$/.test(S.trim(n));
}, 
  verifyInputs: function(inputs) {
  _$jscoverage['/editor/utils.js'].functionData[11]++;
  _$jscoverage['/editor/utils.js'].lineData[158]++;
  for (var i = 0; visit1055_158_1(i < inputs.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[159]++;
    var input = new Node(inputs[i]), v = S.trim(Utils.valInput(input)), verify = input.attr("data-verify"), warning = input.attr("data-warning");
    _$jscoverage['/editor/utils.js'].lineData[163]++;
    if (visit1056_163_1(verify && !new RegExp(verify).test(v))) {
      _$jscoverage['/editor/utils.js'].lineData[164]++;
      alert(warning);
      _$jscoverage['/editor/utils.js'].lineData[165]++;
      return FALSE;
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[168]++;
  return TRUE;
}, 
  sourceDisable: function(editor, plugin) {
  _$jscoverage['/editor/utils.js'].functionData[12]++;
  _$jscoverage['/editor/utils.js'].lineData[177]++;
  editor.on("sourceMode", plugin.disable, plugin);
  _$jscoverage['/editor/utils.js'].lineData[178]++;
  editor.on("wysiwygMode", plugin.enable, plugin);
}, 
  resetInput: function(inp) {
  _$jscoverage['/editor/utils.js'].functionData[13]++;
  _$jscoverage['/editor/utils.js'].lineData[186]++;
  var placeholder = inp.attr("placeholder");
  _$jscoverage['/editor/utils.js'].lineData[187]++;
  if (visit1057_187_1(placeholder && UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[188]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[189]++;
    inp.val(placeholder);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[190]++;
    if (visit1058_190_1(!UA['ie'])) {
      _$jscoverage['/editor/utils.js'].lineData[191]++;
      inp.val("");
    }
  }
}, 
  valInput: function(inp, val) {
  _$jscoverage['/editor/utils.js'].functionData[14]++;
  _$jscoverage['/editor/utils.js'].lineData[201]++;
  if (visit1059_201_1(val === undefined)) {
    _$jscoverage['/editor/utils.js'].lineData[202]++;
    if (visit1060_202_1(inp.hasClass("ks-editor-input-tip"))) {
      _$jscoverage['/editor/utils.js'].lineData[203]++;
      return "";
    } else {
      _$jscoverage['/editor/utils.js'].lineData[205]++;
      return inp.val();
    }
  } else {
    _$jscoverage['/editor/utils.js'].lineData[208]++;
    inp.removeClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[209]++;
    inp.val(val);
  }
}, 
  placeholder: function(inp, tip) {
  _$jscoverage['/editor/utils.js'].functionData[15]++;
  _$jscoverage['/editor/utils.js'].lineData[219]++;
  inp.attr("placeholder", tip);
  _$jscoverage['/editor/utils.js'].lineData[220]++;
  if (visit1061_220_1(!UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[221]++;
    return;
  }
  _$jscoverage['/editor/utils.js'].lineData[223]++;
  inp.on("blur", function() {
  _$jscoverage['/editor/utils.js'].functionData[16]++;
  _$jscoverage['/editor/utils.js'].lineData[224]++;
  if (visit1062_224_1(!S.trim(inp.val()))) {
    _$jscoverage['/editor/utils.js'].lineData[225]++;
    inp.addClass("ks-editor-input-tip");
    _$jscoverage['/editor/utils.js'].lineData[226]++;
    inp.val(tip);
  }
});
  _$jscoverage['/editor/utils.js'].lineData[229]++;
  inp.on("focus", function() {
  _$jscoverage['/editor/utils.js'].functionData[17]++;
  _$jscoverage['/editor/utils.js'].lineData[230]++;
  inp.removeClass("ks-editor-input-tip");
  _$jscoverage['/editor/utils.js'].lineData[231]++;
  if (visit1063_231_1(S.trim(inp.val()) == tip)) {
    _$jscoverage['/editor/utils.js'].lineData[232]++;
    inp.val("");
  }
});
}, 
  htmlEncode: function(value) {
  _$jscoverage['/editor/utils.js'].functionData[18]++;
  _$jscoverage['/editor/utils.js'].lineData[244]++;
  return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}, 
  normParams: function(params) {
  _$jscoverage['/editor/utils.js'].functionData[19]++;
  _$jscoverage['/editor/utils.js'].lineData[253]++;
  params = S.clone(params);
  _$jscoverage['/editor/utils.js'].lineData[254]++;
  for (var p in params) {
    _$jscoverage['/editor/utils.js'].lineData[256]++;
    var v = params[p];
    _$jscoverage['/editor/utils.js'].lineData[257]++;
    if (visit1064_257_1(typeof v === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[258]++;
      params[p] = v();
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[262]++;
  return params;
}, 
  map: function(arr, callback) {
  _$jscoverage['/editor/utils.js'].functionData[20]++;
  _$jscoverage['/editor/utils.js'].lineData[269]++;
  for (var i = 0; visit1065_269_1(i < arr.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[270]++;
    arr[i] = callback(arr[i]);
  }
  _$jscoverage['/editor/utils.js'].lineData[272]++;
  return arr;
}, 
  ieEngine: visit1066_276_1(document['documentMode'] || UA['ie']), 
  preventFocus: function(el) {
  _$jscoverage['/editor/utils.js'].functionData[21]++;
  _$jscoverage['/editor/utils.js'].lineData[283]++;
  if (visit1067_283_1(UA['ie'])) {
    _$jscoverage['/editor/utils.js'].lineData[285]++;
    el.unselectable();
  } else {
    _$jscoverage['/editor/utils.js'].lineData[287]++;
    el.attr("onmousedown", "return false;");
  }
}, 
  injectDom: function(editorDom) {
  _$jscoverage['/editor/utils.js'].functionData[22]++;
  _$jscoverage['/editor/utils.js'].lineData[295]++;
  S.mix(Dom, editorDom);
  _$jscoverage['/editor/utils.js'].lineData[296]++;
  for (var dm in editorDom) {
    _$jscoverage['/editor/utils.js'].lineData[297]++;
    (function(dm) {
  _$jscoverage['/editor/utils.js'].functionData[23]++;
  _$jscoverage['/editor/utils.js'].lineData[298]++;
  Node.prototype[dm] = function() {
  _$jscoverage['/editor/utils.js'].functionData[24]++;
  _$jscoverage['/editor/utils.js'].lineData[299]++;
  var args = [].slice.call(arguments, 0);
  _$jscoverage['/editor/utils.js'].lineData[300]++;
  args.unshift(this[0]);
  _$jscoverage['/editor/utils.js'].lineData[301]++;
  var ret = editorDom[dm].apply(NULL, args);
  _$jscoverage['/editor/utils.js'].lineData[302]++;
  if (visit1068_302_1(ret && (visit1069_302_2(ret.nodeType || S.isWindow(ret))))) {
    _$jscoverage['/editor/utils.js'].lineData[303]++;
    return new Node(ret);
  } else {
    _$jscoverage['/editor/utils.js'].lineData[305]++;
    if (visit1070_305_1(S.isArray(ret))) {
      _$jscoverage['/editor/utils.js'].lineData[306]++;
      if (visit1071_306_1(ret.__IS_NODELIST || (visit1072_306_2(ret[0] && ret[0].nodeType)))) {
        _$jscoverage['/editor/utils.js'].lineData[307]++;
        return new Node(ret);
      }
    }
    _$jscoverage['/editor/utils.js'].lineData[310]++;
    return ret;
  }
};
})(dm);
  }
}, 
  addRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[25]++;
  _$jscoverage['/editor/utils.js'].lineData[321]++;
  this.__res = visit1073_321_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[322]++;
  var res = this.__res;
  _$jscoverage['/editor/utils.js'].lineData[323]++;
  res.push.apply(res, S.makeArray(arguments));
}, 
  destroyRes: function() {
  _$jscoverage['/editor/utils.js'].functionData[26]++;
  _$jscoverage['/editor/utils.js'].lineData[330]++;
  var res = visit1074_330_1(this.__res || []);
  _$jscoverage['/editor/utils.js'].lineData[331]++;
  for (var i = 0; visit1075_331_1(i < res.length); i++) {
    _$jscoverage['/editor/utils.js'].lineData[332]++;
    var r = res[i];
    _$jscoverage['/editor/utils.js'].lineData[333]++;
    if (visit1076_333_1(typeof r === 'function')) {
      _$jscoverage['/editor/utils.js'].lineData[334]++;
      r();
    } else {
      _$jscoverage['/editor/utils.js'].lineData[336]++;
      if (visit1077_336_1(r.destroy)) {
        _$jscoverage['/editor/utils.js'].lineData[337]++;
        r.destroy();
      } else {
        _$jscoverage['/editor/utils.js'].lineData[339]++;
        if (visit1078_339_1(r.remove)) {
          _$jscoverage['/editor/utils.js'].lineData[340]++;
          r.remove();
        }
      }
    }
  }
  _$jscoverage['/editor/utils.js'].lineData[344]++;
  this.__res = [];
}, 
  getQueryCmd: function(cmd) {
  _$jscoverage['/editor/utils.js'].functionData[27]++;
  _$jscoverage['/editor/utils.js'].lineData[351]++;
  return "query" + ("-" + cmd).replace(/-(\w)/g, function(m, m1) {
  _$jscoverage['/editor/utils.js'].functionData[28]++;
  _$jscoverage['/editor/utils.js'].lineData[352]++;
  return m1.toUpperCase();
}) + "Value";
}};
  _$jscoverage['/editor/utils.js'].lineData[357]++;
  Editor.Utils = Utils;
  _$jscoverage['/editor/utils.js'].lineData[359]++;
  return Utils;
}, {
  requires: ['./base', 'node']});
