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
if (! _$jscoverage['/dialog.js']) {
  _$jscoverage['/dialog.js'] = {};
  _$jscoverage['/dialog.js'].lineData = [];
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[7] = 0;
  _$jscoverage['/dialog.js'].lineData[8] = 0;
  _$jscoverage['/dialog.js'].lineData[9] = 0;
  _$jscoverage['/dialog.js'].lineData[10] = 0;
  _$jscoverage['/dialog.js'].lineData[21] = 0;
  _$jscoverage['/dialog.js'].lineData[22] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[25] = 0;
  _$jscoverage['/dialog.js'].lineData[28] = 0;
  _$jscoverage['/dialog.js'].lineData[72] = 0;
  _$jscoverage['/dialog.js'].lineData[73] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[78] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[83] = 0;
  _$jscoverage['/dialog.js'].lineData[84] = 0;
  _$jscoverage['/dialog.js'].lineData[87] = 0;
  _$jscoverage['/dialog.js'].lineData[92] = 0;
  _$jscoverage['/dialog.js'].lineData[99] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[115] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[120] = 0;
  _$jscoverage['/dialog.js'].lineData[121] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[125] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[129] = 0;
  _$jscoverage['/dialog.js'].lineData[130] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[134] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[136] = 0;
  _$jscoverage['/dialog.js'].lineData[138] = 0;
  _$jscoverage['/dialog.js'].lineData[148] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[156] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[159] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[162] = 0;
  _$jscoverage['/dialog.js'].lineData[163] = 0;
  _$jscoverage['/dialog.js'].lineData[167] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[176] = 0;
  _$jscoverage['/dialog.js'].lineData[177] = 0;
  _$jscoverage['/dialog.js'].lineData[182] = 0;
  _$jscoverage['/dialog.js'].lineData[183] = 0;
  _$jscoverage['/dialog.js'].lineData[186] = 0;
  _$jscoverage['/dialog.js'].lineData[187] = 0;
  _$jscoverage['/dialog.js'].lineData[190] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[197] = 0;
  _$jscoverage['/dialog.js'].lineData[198] = 0;
  _$jscoverage['/dialog.js'].lineData[200] = 0;
  _$jscoverage['/dialog.js'].lineData[204] = 0;
  _$jscoverage['/dialog.js'].lineData[207] = 0;
  _$jscoverage['/dialog.js'].lineData[208] = 0;
  _$jscoverage['/dialog.js'].lineData[219] = 0;
  _$jscoverage['/dialog.js'].lineData[220] = 0;
  _$jscoverage['/dialog.js'].lineData[221] = 0;
  _$jscoverage['/dialog.js'].lineData[223] = 0;
  _$jscoverage['/dialog.js'].lineData[225] = 0;
  _$jscoverage['/dialog.js'].lineData[228] = 0;
  _$jscoverage['/dialog.js'].lineData[235] = 0;
  _$jscoverage['/dialog.js'].lineData[236] = 0;
  _$jscoverage['/dialog.js'].lineData[237] = 0;
  _$jscoverage['/dialog.js'].lineData[238] = 0;
  _$jscoverage['/dialog.js'].lineData[239] = 0;
  _$jscoverage['/dialog.js'].lineData[240] = 0;
  _$jscoverage['/dialog.js'].lineData[241] = 0;
  _$jscoverage['/dialog.js'].lineData[256] = 0;
  _$jscoverage['/dialog.js'].lineData[258] = 0;
  _$jscoverage['/dialog.js'].lineData[263] = 0;
  _$jscoverage['/dialog.js'].lineData[264] = 0;
  _$jscoverage['/dialog.js'].lineData[265] = 0;
  _$jscoverage['/dialog.js'].lineData[266] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[269] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[276] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[283] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[290] = 0;
  _$jscoverage['/dialog.js'].lineData[292] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[307] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[312] = 0;
  _$jscoverage['/dialog.js'].lineData[313] = 0;
  _$jscoverage['/dialog.js'].lineData[314] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[320] = 0;
  _$jscoverage['/dialog.js'].lineData[321] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[323] = 0;
  _$jscoverage['/dialog.js'].lineData[324] = 0;
  _$jscoverage['/dialog.js'].lineData[325] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[333] = 0;
  _$jscoverage['/dialog.js'].lineData[334] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[343] = 0;
  _$jscoverage['/dialog.js'].lineData[344] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[351] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
}
if (! _$jscoverage['/dialog.js'].functionData) {
  _$jscoverage['/dialog.js'].functionData = [];
  _$jscoverage['/dialog.js'].functionData[0] = 0;
  _$jscoverage['/dialog.js'].functionData[1] = 0;
  _$jscoverage['/dialog.js'].functionData[2] = 0;
  _$jscoverage['/dialog.js'].functionData[3] = 0;
  _$jscoverage['/dialog.js'].functionData[4] = 0;
  _$jscoverage['/dialog.js'].functionData[5] = 0;
  _$jscoverage['/dialog.js'].functionData[6] = 0;
  _$jscoverage['/dialog.js'].functionData[7] = 0;
  _$jscoverage['/dialog.js'].functionData[8] = 0;
  _$jscoverage['/dialog.js'].functionData[9] = 0;
  _$jscoverage['/dialog.js'].functionData[10] = 0;
  _$jscoverage['/dialog.js'].functionData[11] = 0;
  _$jscoverage['/dialog.js'].functionData[12] = 0;
  _$jscoverage['/dialog.js'].functionData[13] = 0;
  _$jscoverage['/dialog.js'].functionData[14] = 0;
  _$jscoverage['/dialog.js'].functionData[15] = 0;
  _$jscoverage['/dialog.js'].functionData[16] = 0;
  _$jscoverage['/dialog.js'].functionData[17] = 0;
  _$jscoverage['/dialog.js'].functionData[18] = 0;
  _$jscoverage['/dialog.js'].functionData[19] = 0;
  _$jscoverage['/dialog.js'].functionData[20] = 0;
}
if (! _$jscoverage['/dialog.js'].branchData) {
  _$jscoverage['/dialog.js'].branchData = {};
  _$jscoverage['/dialog.js'].branchData['22'] = [];
  _$jscoverage['/dialog.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['114'] = [];
  _$jscoverage['/dialog.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['121'] = [];
  _$jscoverage['/dialog.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['144'] = [];
  _$jscoverage['/dialog.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['155'] = [];
  _$jscoverage['/dialog.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['158'] = [];
  _$jscoverage['/dialog.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['158'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['200'] = [];
  _$jscoverage['/dialog.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['204'] = [];
  _$jscoverage['/dialog.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['207'] = [];
  _$jscoverage['/dialog.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['215'] = [];
  _$jscoverage['/dialog.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['220'] = [];
  _$jscoverage['/dialog.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['235'] = [];
  _$jscoverage['/dialog.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['237'] = [];
  _$jscoverage['/dialog.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['239'] = [];
  _$jscoverage['/dialog.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['263'] = [];
  _$jscoverage['/dialog.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['265'] = [];
  _$jscoverage['/dialog.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['270'] = [];
  _$jscoverage['/dialog.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['273'] = [];
  _$jscoverage['/dialog.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['277'] = [];
  _$jscoverage['/dialog.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['280'] = [];
  _$jscoverage['/dialog.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['283'] = [];
  _$jscoverage['/dialog.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['284'] = [];
  _$jscoverage['/dialog.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['289'] = [];
  _$jscoverage['/dialog.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['311'] = [];
  _$jscoverage['/dialog.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'] = [];
  _$jscoverage['/dialog.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['345'] = [];
  _$jscoverage['/dialog.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['346'] = [];
  _$jscoverage['/dialog.js'].branchData['346'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['346'][1].init(211, 6, 's || i');
function visit28_346_1(result) {
  _$jscoverage['/dialog.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['345'][1].init(102, 10, 'page === i');
function visit27_345_1(result) {
  _$jscoverage['/dialog.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][1].init(203, 35, 'parseInt(f.style(\'margin\'), 10) || 0');
function visit26_315_1(result) {
  _$jscoverage['/dialog.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['311'][1].init(177, 1, 'f');
function visit25_311_1(result) {
  _$jscoverage['/dialog.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['289'][1].init(1376, 18, 'page !== totalPage');
function visit24_289_1(result) {
  _$jscoverage['/dialog.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['284'][1].init(33, 21, 'end !== totalPage - 1');
function visit23_284_1(result) {
  _$jscoverage['/dialog.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['283'][1].init(1026, 17, 'end !== totalPage');
function visit22_283_1(result) {
  _$jscoverage['/dialog.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['280'][1].init(883, 8, 'i <= end');
function visit21_280_1(result) {
  _$jscoverage['/dialog.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['277'][1].init(698, 11, 'start !== 2');
function visit20_277_1(result) {
  _$jscoverage['/dialog.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['273'][1].init(493, 10, 'page !== 1');
function visit19_273_1(result) {
  _$jscoverage['/dialog.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['270'][1].init(356, 21, 'end === totalPage - 1');
function visit18_270_1(result) {
  _$jscoverage['/dialog.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['265'][1].init(113, 10, 'start <= 2');
function visit17_265_1(result) {
  _$jscoverage['/dialog.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['263'][1].init(1158, 13, 'totalPage > 1');
function visit16_263_1(result) {
  _$jscoverage['/dialog.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['239'][1].init(68, 13, 'i < re.length');
function visit15_239_1(result) {
  _$jscoverage['/dialog.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['237'][1].init(117, 15, 're && re.length');
function visit14_237_1(result) {
  _$jscoverage['/dialog.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['235'][1].init(251, 43, 'data.key === S.trim(self._xiamiInput.val())');
function visit13_235_1(result) {
  _$jscoverage['/dialog.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['220'][1].init(1217, 6, 'paging');
function visit12_220_1(result) {
  _$jscoverage['/dialog.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['215'][1].init(44, 36, 'parseInt(self.dMargin.val(), 10) || 0');
function visit11_215_1(result) {
  _$jscoverage['/dialog.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['207'][1].init(582, 3, 'add');
function visit10_207_1(result) {
  _$jscoverage['/dialog.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['204'][1].init(32, 119, 'self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + \'editor-xiami-page-item\')');
function visit9_204_1(result) {
  _$jscoverage['/dialog.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['200'][1].init(32, 113, 'self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + \'editor-xiami-add\')');
function visit8_200_1(result) {
  _$jscoverage['/dialog.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['158'][2].init(246, 13, 'query === TIP');
function visit7_158_2(result) {
  _$jscoverage['/dialog.js'].branchData['158'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['158'][1].init(228, 31, '!S.trim(query) || query === TIP');
function visit6_158_1(result) {
  _$jscoverage['/dialog.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['155'][1].init(62, 48, 'query.replace(/[^\\x00-\\xff]/g, \'@@\').length > 30');
function visit5_155_1(result) {
  _$jscoverage['/dialog.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['144'][1].init(40, 36, 'parseInt(self.dMargin.val(), 10) || 0');
function visit4_144_1(result) {
  _$jscoverage['/dialog.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['121'][1].init(21, 17, 'ev.keyCode === 13');
function visit3_121_1(result) {
  _$jscoverage['/dialog.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['114'][1].init(21, 67, '!self._xiamiSubmit.hasClass(\'ks-editor-button-disabled\', undefined)');
function visit2_114_1(result) {
  _$jscoverage['/dialog.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['22'][1].init(13, 14, 'str.length > l');
function visit1_22_1(result) {
  _$jscoverage['/dialog.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/dialog.js'].lineData[8]++;
  var FlashDialog = require('../flash/dialog');
  _$jscoverage['/dialog.js'].lineData[9]++;
  var MenuButton = require('../menubutton');
  _$jscoverage['/dialog.js'].lineData[10]++;
  var Dom = S.DOM, Node = S.Node, Utils = Editor.Utils, loading = Utils.debugUrl('theme/tao-loading.gif'), XIAMI_URL = 'http://www.xiami.com/app/nineteen/search/key/{key}/page/{page}', CLS_XIAMI = 'ke_xiami', TYPE_XIAMI = 'xiami-music', BTIP = '\u641c \u7d22', TIP = '\u8f93\u5165\u6b4c\u66f2\u540d\u3001\u4e13\u8f91\u540d\u3001\u827a\u4eba\u540d';
  _$jscoverage['/dialog.js'].lineData[21]++;
  function limit(str, l) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[22]++;
    if (visit1_22_1(str.length > l)) {
      _$jscoverage['/dialog.js'].lineData[23]++;
      str = str.substring(0, l) + '...';
    }
    _$jscoverage['/dialog.js'].lineData[25]++;
    return str;
  }
  _$jscoverage['/dialog.js'].lineData[28]++;
  var MARGIN_DEFAULT = 0, bodyHTML = '<div style="padding:40px 0 70px 0;">' + '<form action="#" class="{prefixCls}editor-xiami-form" style="margin:0 20px;">' + '<p class="{prefixCls}editor-xiami-title">' + '' + '</p>' + '<p class="{prefixCls}editor-xiami-url-wrap">' + '<input class="{prefixCls}editor-xiami-url {prefixCls}editor-input" ' + 'style="width:370px;' + '"' + '/> &nbsp; ' + ' <a ' + 'class="{prefixCls}editor-xiami-submit {prefixCls}editor-button ks-inline-block"' + '>' + BTIP + '</a>' + '</p>' + '<p ' + 'style="margin:10px 0">' + '<label>\u5bf9 \u9f50\uff1a ' + '<select ' + 'class="{prefixCls}editor-xiami-align" title="\u5bf9\u9f50">' + '<option value="none">\u65e0</option>' + '<option value="left">\u5de6\u5bf9\u9f50</option>' + '<option value="right">\u53f3\u5bf9\u9f50</option>' + '</select>' + '</label>' + '<label style="margin-left:70px;">\u95f4\u8ddd\uff1a ' + ' ' + '<input ' + '' + ' data-verify="^\\d+$" ' + ' data-warning="\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570" ' + 'class="{prefixCls}editor-xiami-margin {prefixCls}editor-input" style="width:60px;' + '" value="' + MARGIN_DEFAULT + '"/> \u50cf\u7d20' + '</label>' + '</p>' + '</form>' + '<div ' + 'class="{prefixCls}editor-xiami-list">' + '</div>' + '</div>', footHTML = '<div style="padding:5px 20px 20px;"><a ' + 'class="{prefixCls}editor-xiami-ok {prefixCls}editor-button ks-inline-block" ' + 'style="margin-right:20px;">\u786e&nbsp;\u5b9a</a>' + '<a class="{prefixCls}editor-xiami-cancel {prefixCls}editor-button ks-inline-block">\u53d6&nbsp;\u6d88</a></div>';
  _$jscoverage['/dialog.js'].lineData[72]++;
  function XiamiMusicDialog() {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[73]++;
    XiamiMusicDialog.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/dialog.js'].lineData[76]++;
  S.extend(XiamiMusicDialog, FlashDialog, {
  _config: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[78]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[81]++;
  self._cls = CLS_XIAMI;
  _$jscoverage['/dialog.js'].lineData[82]++;
  self._type = TYPE_XIAMI;
  _$jscoverage['/dialog.js'].lineData[83]++;
  self._title = '\u867e\u7c73\u97f3\u4e50';
  _$jscoverage['/dialog.js'].lineData[84]++;
  self._bodyHTML = S.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[87]++;
  self._footHTML = S.substitute(footHTML, {
  prefixCls: prefixCls});
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[92]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), d = self.dialog, del = d.get('el'), dfoot = d.get('footer'), input = del.one('.' + prefixCls + 'editor-xiami-url');
  _$jscoverage['/dialog.js'].lineData[99]++;
  self.dAlign = MenuButton.Select.decorate(del.one('.' + prefixCls + 'editor-xiami-align'), {
  prefixCls: 'ks-editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: 'ks-editor-', 
  render: del}});
  _$jscoverage['/dialog.js'].lineData[107]++;
  self.addRes(self.dAlign);
  _$jscoverage['/dialog.js'].lineData[108]++;
  self._xiamiInput = input;
  _$jscoverage['/dialog.js'].lineData[109]++;
  Editor.Utils.placeholder(input, TIP);
  _$jscoverage['/dialog.js'].lineData[110]++;
  self.addRes(input);
  _$jscoverage['/dialog.js'].lineData[111]++;
  self._xiamiaList = del.one('.' + prefixCls + 'editor-xiami-list');
  _$jscoverage['/dialog.js'].lineData[112]++;
  self._xiamiSubmit = del.one('.' + prefixCls + 'editor-xiami-submit');
  _$jscoverage['/dialog.js'].lineData[113]++;
  self._xiamiSubmit.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[114]++;
  if (visit2_114_1(!self._xiamiSubmit.hasClass('ks-editor-button-disabled', undefined))) {
    _$jscoverage['/dialog.js'].lineData[115]++;
    loadRecordsByPage(1);
  }
  _$jscoverage['/dialog.js'].lineData[117]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[119]++;
  self.addRes(self._xiamiSubmit);
  _$jscoverage['/dialog.js'].lineData[120]++;
  input.on('keydown', function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[121]++;
  if (visit3_121_1(ev.keyCode === 13)) {
    _$jscoverage['/dialog.js'].lineData[122]++;
    loadRecordsByPage(1);
  }
});
  _$jscoverage['/dialog.js'].lineData[125]++;
  self.dMargin = del.one('.' + prefixCls + 'editor-xiami-margin');
  _$jscoverage['/dialog.js'].lineData[126]++;
  self._xiamiUrlWrap = del.one('.' + prefixCls + 'editor-xiami-url-wrap');
  _$jscoverage['/dialog.js'].lineData[127]++;
  self._xiamiTitle = del.one('.' + prefixCls + 'editor-xiami-title');
  _$jscoverage['/dialog.js'].lineData[129]++;
  var xiamiOk = dfoot.one('.' + prefixCls + 'editor-xiami-ok');
  _$jscoverage['/dialog.js'].lineData[130]++;
  dfoot.one('.' + prefixCls + 'editor-xiami-cancel').on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[131]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[132]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[134]++;
  self.addRes(dfoot);
  _$jscoverage['/dialog.js'].lineData[135]++;
  xiamiOk.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[136]++;
  var f = self.selectedFlash, r = editor.restoreRealElement(f);
  _$jscoverage['/dialog.js'].lineData[138]++;
  self._dinfo = {
  url: self._getFlashUrl(r), 
  attrs: {
  title: f.attr('title'), 
  style: 'margin:' + (visit4_144_1(parseInt(self.dMargin.val(), 10) || 0)) + 'px;' + 'float:' + self.dAlign.get('value') + ';'}};
  _$jscoverage['/dialog.js'].lineData[148]++;
  self._gen();
  _$jscoverage['/dialog.js'].lineData[149]++;
  ev.halt();
}, self);
  _$jscoverage['/dialog.js'].lineData[151]++;
  self.addRes(xiamiOk);
  _$jscoverage['/dialog.js'].lineData[153]++;
  function loadRecordsByPage(page) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[154]++;
    var query = input.val();
    _$jscoverage['/dialog.js'].lineData[155]++;
    if (visit5_155_1(query.replace(/[^\x00-\xff]/g, '@@').length > 30)) {
      _$jscoverage['/dialog.js'].lineData[156]++;
      window.alert('\u957f\u5ea6\u4e0a\u965030\u4e2a\u5b57\u7b26\uff081\u4e2a\u6c49\u5b57=2\u4e2a\u5b57\u7b26\uff09');
      _$jscoverage['/dialog.js'].lineData[157]++;
      return;
    } else {
      _$jscoverage['/dialog.js'].lineData[158]++;
      if (visit6_158_1(!S.trim(query) || visit7_158_2(query === TIP))) {
        _$jscoverage['/dialog.js'].lineData[159]++;
        window.alert('\u4e0d\u80fd\u4e3a\u7a7a\uff01');
        _$jscoverage['/dialog.js'].lineData[160]++;
        return;
      }
    }
    _$jscoverage['/dialog.js'].lineData[162]++;
    self._xiamiSubmit.addClass(prefixCls + 'editor-button-disabled', undefined);
    _$jscoverage['/dialog.js'].lineData[163]++;
    var req = S.substitute(XIAMI_URL, {
  key: encodeURIComponent(input.val()), 
  page: page});
    _$jscoverage['/dialog.js'].lineData[167]++;
    self._xiamiaList.html('<img style="' + 'display:block;' + 'width:32px;' + 'height:32px;' + 'margin:5px auto 0 auto;' + '" src="' + loading + '"/>' + '<p style="width: 130px; margin: 15px auto 0; color: rgb(150, 150, 150);">\u6b63\u5728\u641c\u7d22\uff0c\u8bf7\u7a0d\u5019......</p>');
    _$jscoverage['/dialog.js'].lineData[174]++;
    self._xiamiaList.show();
    _$jscoverage['/dialog.js'].lineData[176]++;
    S.use('io', function(S, IO) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[177]++;
  IO({
  cache: false, 
  url: req, 
  dataType: 'jsonp', 
  success: function(data) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[182]++;
  data.page = page;
  _$jscoverage['/dialog.js'].lineData[183]++;
  self._listSearch(data);
}, 
  error: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[186]++;
  self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
  _$jscoverage['/dialog.js'].lineData[187]++;
  var html = '<p style="text-align:center;margin:10px 0;">' + '\u4e0d\u597d\u610f\u601d\uff0c\u8d85\u65f6\u4e86\uff0c\u8bf7\u91cd\u8bd5\uff01' + '</p>';
  _$jscoverage['/dialog.js'].lineData[190]++;
  self._xiamiaList.html(html);
}});
});
  }
  _$jscoverage['/dialog.js'].lineData[196]++;
  self._xiamiaList.on('click', function(ev) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[197]++;
  ev.preventDefault();
  _$jscoverage['/dialog.js'].lineData[198]++;
  var t = new Node(ev.target), add = t.closest(function(node) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[200]++;
  return visit8_200_1(self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + 'editor-xiami-add'));
}, undefined), paging = t.closest(function(node) {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[204]++;
  return visit9_204_1(self._xiamiaList.contains(node) && Dom.hasClass(node, prefixCls + 'editor-xiami-page-item'));
}, undefined);
  _$jscoverage['/dialog.js'].lineData[207]++;
  if (visit10_207_1(add)) {
    _$jscoverage['/dialog.js'].lineData[208]++;
    self._dinfo = {
  url: ('http://www.xiami.com/widget/' + add.attr('data-value') + '/singlePlayer.swf'), 
  attrs: {
  title: add.attr('title'), 
  style: 'margin:' + (visit11_215_1(parseInt(self.dMargin.val(), 10) || 0)) + 'px;' + 'float:' + self.dAlign.get('value') + ';'}};
    _$jscoverage['/dialog.js'].lineData[219]++;
    self._gen();
  } else {
    _$jscoverage['/dialog.js'].lineData[220]++;
    if (visit12_220_1(paging)) {
      _$jscoverage['/dialog.js'].lineData[221]++;
      loadRecordsByPage(parseInt(paging.attr('data-value'), 10));
    }
  }
  _$jscoverage['/dialog.js'].lineData[223]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[225]++;
  self.addRes(self._xiamiaList);
}, 
  _listSearch: function(data) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[228]++;
  var self = this, i, editor = self.editor, prefixCls = editor.get('prefixCls'), re = data.results, html = '';
  _$jscoverage['/dialog.js'].lineData[235]++;
  if (visit13_235_1(data.key === S.trim(self._xiamiInput.val()))) {
    _$jscoverage['/dialog.js'].lineData[236]++;
    self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
    _$jscoverage['/dialog.js'].lineData[237]++;
    if (visit14_237_1(re && re.length)) {
      _$jscoverage['/dialog.js'].lineData[238]++;
      html = '<ul>';
      _$jscoverage['/dialog.js'].lineData[239]++;
      for (i = 0; visit15_239_1(i < re.length); i++) {
        _$jscoverage['/dialog.js'].lineData[240]++;
        var r = re[i], d = getDisplayName(r);
        _$jscoverage['/dialog.js'].lineData[241]++;
        html += '<li ' + 'title="' + d + '">' + '<span class="' + prefixCls + 'editor-xiami-song">' + limit(d, 35) + '</span>' + '' + '' + '<a href="#" ' + 'title="' + d + '" ' + 'class="' + prefixCls + 'editor-xiami-add" data-value="' + (r.album_id + '_' + r.song_id) + '">\u6dfb\u52a0</a>' + '</li>';
      }
      _$jscoverage['/dialog.js'].lineData[256]++;
      html += '</ul>';
      _$jscoverage['/dialog.js'].lineData[258]++;
      var page = data.page, totalPage = Math.floor(data.total / 8), start = page - 1, end = page + 1;
      _$jscoverage['/dialog.js'].lineData[263]++;
      if (visit16_263_1(totalPage > 1)) {
        _$jscoverage['/dialog.js'].lineData[264]++;
        html += '<p class="' + prefixCls + 'editor-xiami-paging">';
        _$jscoverage['/dialog.js'].lineData[265]++;
        if (visit17_265_1(start <= 2)) {
          _$jscoverage['/dialog.js'].lineData[266]++;
          end = Math.min(2 - start + end, totalPage - 1);
          _$jscoverage['/dialog.js'].lineData[267]++;
          start = 2;
        }
        _$jscoverage['/dialog.js'].lineData[269]++;
        end = Math.min(end, totalPage - 1);
        _$jscoverage['/dialog.js'].lineData[270]++;
        if (visit18_270_1(end === totalPage - 1)) {
          _$jscoverage['/dialog.js'].lineData[271]++;
          start = Math.max(2, end - 3);
        }
        _$jscoverage['/dialog.js'].lineData[273]++;
        if (visit19_273_1(page !== 1)) {
          _$jscoverage['/dialog.js'].lineData[274]++;
          html += getXiamiPaging(page, page - 1, '\u4e0a\u4e00\u9875');
        }
        _$jscoverage['/dialog.js'].lineData[276]++;
        html += getXiamiPaging(page, 1, '1');
        _$jscoverage['/dialog.js'].lineData[277]++;
        if (visit20_277_1(start !== 2)) {
          _$jscoverage['/dialog.js'].lineData[278]++;
          html += '<span class="' + prefixCls + 'editor-xiami-page-more">...</span>';
        }
        _$jscoverage['/dialog.js'].lineData[280]++;
        for (i = start; visit21_280_1(i <= end); i++) {
          _$jscoverage['/dialog.js'].lineData[281]++;
          html += getXiamiPaging(page, i, undefined);
        }
        _$jscoverage['/dialog.js'].lineData[283]++;
        if (visit22_283_1(end !== totalPage)) {
          _$jscoverage['/dialog.js'].lineData[284]++;
          if (visit23_284_1(end !== totalPage - 1)) {
            _$jscoverage['/dialog.js'].lineData[285]++;
            html += '<span class="' + prefixCls + 'editor-xiami-page-more">...</span>';
          }
          _$jscoverage['/dialog.js'].lineData[287]++;
          html += getXiamiPaging(page, totalPage, totalPage);
        }
        _$jscoverage['/dialog.js'].lineData[289]++;
        if (visit24_289_1(page !== totalPage)) {
          _$jscoverage['/dialog.js'].lineData[290]++;
          html += getXiamiPaging(page, page + 1, '\u4e0b\u4e00\u9875');
        }
        _$jscoverage['/dialog.js'].lineData[292]++;
        html += '</p>';
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[296]++;
      html = '<p style="text-align:center;margin:10px 0;">' + '\u4e0d\u597d\u610f\u601d\uff0c\u6ca1\u6709\u627e\u5230\u7ed3\u679c\uff01' + '</p>';
    }
    _$jscoverage['/dialog.js'].lineData[300]++;
    self._xiamiaList.html(S.substitute(html, {
  prefixCls: prefixCls}));
  }
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[307]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[311]++;
  if (visit25_311_1(f)) {
    _$jscoverage['/dialog.js'].lineData[312]++;
    self._xiamiInput.val(f.attr('title'));
    _$jscoverage['/dialog.js'].lineData[313]++;
    self._xiamiTitle.html(f.attr('title'));
    _$jscoverage['/dialog.js'].lineData[314]++;
    self.dAlign.set('value', f.css('float'));
    _$jscoverage['/dialog.js'].lineData[315]++;
    self.dMargin.val(visit26_315_1(parseInt(f.style('margin'), 10) || 0));
    _$jscoverage['/dialog.js'].lineData[316]++;
    self._xiamiUrlWrap.hide();
    _$jscoverage['/dialog.js'].lineData[317]++;
    self.dialog.get('footer').show();
    _$jscoverage['/dialog.js'].lineData[318]++;
    self._xiamiTitle.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[320]++;
    Editor.Utils.resetInput(self._xiamiInput);
    _$jscoverage['/dialog.js'].lineData[321]++;
    self.dAlign.set('value', 'none');
    _$jscoverage['/dialog.js'].lineData[322]++;
    self.dMargin.val(MARGIN_DEFAULT);
    _$jscoverage['/dialog.js'].lineData[323]++;
    self._xiamiUrlWrap.show();
    _$jscoverage['/dialog.js'].lineData[324]++;
    self.dialog.get('footer').hide();
    _$jscoverage['/dialog.js'].lineData[325]++;
    self._xiamiTitle.hide();
    _$jscoverage['/dialog.js'].lineData[326]++;
    self._xiamiSubmit.removeClass(prefixCls + 'editor-button-disabled', undefined);
  }
  _$jscoverage['/dialog.js'].lineData[328]++;
  self._xiamiaList.hide();
  _$jscoverage['/dialog.js'].lineData[329]++;
  self._xiamiaList.html('');
}, 
  _getDInfo: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[333]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[334]++;
  S.mix(self._dinfo.attrs, {
  width: 257, 
  height: 33});
  _$jscoverage['/dialog.js'].lineData[338]++;
  return self._dinfo;
}});
  _$jscoverage['/dialog.js'].lineData[343]++;
  function getXiamiPaging(page, i, s) {
    _$jscoverage['/dialog.js'].functionData[19]++;
    _$jscoverage['/dialog.js'].lineData[344]++;
    return '<a class="{prefixCls}editor-xiami-page-item {prefixCls}editor-button ks-inline-block' + ((visit27_345_1(page === i)) ? ' {prefixCls}editor-xiami-curpage' : '') + '" data-value="' + i + '" href="#">' + (visit28_346_1(s || i)) + '</a>';
  }
  _$jscoverage['/dialog.js'].lineData[349]++;
  function getDisplayName(r) {
    _$jscoverage['/dialog.js'].functionData[20]++;
    _$jscoverage['/dialog.js'].lineData[351]++;
    return S.urlDecode(r.song_name) + ' - ' + S.urlDecode(r.artist_name);
  }
  _$jscoverage['/dialog.js'].lineData[354]++;
  return XiamiMusicDialog;
});
