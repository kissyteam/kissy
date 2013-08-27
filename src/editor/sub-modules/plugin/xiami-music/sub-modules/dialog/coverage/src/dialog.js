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
  _$jscoverage['/dialog.js'].lineData[5] = 0;
  _$jscoverage['/dialog.js'].lineData[6] = 0;
  _$jscoverage['/dialog.js'].lineData[17] = 0;
  _$jscoverage['/dialog.js'].lineData[18] = 0;
  _$jscoverage['/dialog.js'].lineData[19] = 0;
  _$jscoverage['/dialog.js'].lineData[20] = 0;
  _$jscoverage['/dialog.js'].lineData[23] = 0;
  _$jscoverage['/dialog.js'].lineData[70] = 0;
  _$jscoverage['/dialog.js'].lineData[71] = 0;
  _$jscoverage['/dialog.js'].lineData[74] = 0;
  _$jscoverage['/dialog.js'].lineData[76] = 0;
  _$jscoverage['/dialog.js'].lineData[79] = 0;
  _$jscoverage['/dialog.js'].lineData[80] = 0;
  _$jscoverage['/dialog.js'].lineData[81] = 0;
  _$jscoverage['/dialog.js'].lineData[82] = 0;
  _$jscoverage['/dialog.js'].lineData[85] = 0;
  _$jscoverage['/dialog.js'].lineData[90] = 0;
  _$jscoverage['/dialog.js'].lineData[97] = 0;
  _$jscoverage['/dialog.js'].lineData[105] = 0;
  _$jscoverage['/dialog.js'].lineData[106] = 0;
  _$jscoverage['/dialog.js'].lineData[107] = 0;
  _$jscoverage['/dialog.js'].lineData[108] = 0;
  _$jscoverage['/dialog.js'].lineData[109] = 0;
  _$jscoverage['/dialog.js'].lineData[110] = 0;
  _$jscoverage['/dialog.js'].lineData[111] = 0;
  _$jscoverage['/dialog.js'].lineData[112] = 0;
  _$jscoverage['/dialog.js'].lineData[113] = 0;
  _$jscoverage['/dialog.js'].lineData[114] = 0;
  _$jscoverage['/dialog.js'].lineData[116] = 0;
  _$jscoverage['/dialog.js'].lineData[117] = 0;
  _$jscoverage['/dialog.js'].lineData[118] = 0;
  _$jscoverage['/dialog.js'].lineData[119] = 0;
  _$jscoverage['/dialog.js'].lineData[122] = 0;
  _$jscoverage['/dialog.js'].lineData[123] = 0;
  _$jscoverage['/dialog.js'].lineData[124] = 0;
  _$jscoverage['/dialog.js'].lineData[126] = 0;
  _$jscoverage['/dialog.js'].lineData[127] = 0;
  _$jscoverage['/dialog.js'].lineData[128] = 0;
  _$jscoverage['/dialog.js'].lineData[129] = 0;
  _$jscoverage['/dialog.js'].lineData[131] = 0;
  _$jscoverage['/dialog.js'].lineData[132] = 0;
  _$jscoverage['/dialog.js'].lineData[133] = 0;
  _$jscoverage['/dialog.js'].lineData[135] = 0;
  _$jscoverage['/dialog.js'].lineData[146] = 0;
  _$jscoverage['/dialog.js'].lineData[147] = 0;
  _$jscoverage['/dialog.js'].lineData[149] = 0;
  _$jscoverage['/dialog.js'].lineData[151] = 0;
  _$jscoverage['/dialog.js'].lineData[152] = 0;
  _$jscoverage['/dialog.js'].lineData[153] = 0;
  _$jscoverage['/dialog.js'].lineData[154] = 0;
  _$jscoverage['/dialog.js'].lineData[155] = 0;
  _$jscoverage['/dialog.js'].lineData[156] = 0;
  _$jscoverage['/dialog.js'].lineData[157] = 0;
  _$jscoverage['/dialog.js'].lineData[158] = 0;
  _$jscoverage['/dialog.js'].lineData[160] = 0;
  _$jscoverage['/dialog.js'].lineData[161] = 0;
  _$jscoverage['/dialog.js'].lineData[165] = 0;
  _$jscoverage['/dialog.js'].lineData[172] = 0;
  _$jscoverage['/dialog.js'].lineData[174] = 0;
  _$jscoverage['/dialog.js'].lineData[175] = 0;
  _$jscoverage['/dialog.js'].lineData[180] = 0;
  _$jscoverage['/dialog.js'].lineData[181] = 0;
  _$jscoverage['/dialog.js'].lineData[184] = 0;
  _$jscoverage['/dialog.js'].lineData[185] = 0;
  _$jscoverage['/dialog.js'].lineData[188] = 0;
  _$jscoverage['/dialog.js'].lineData[194] = 0;
  _$jscoverage['/dialog.js'].lineData[195] = 0;
  _$jscoverage['/dialog.js'].lineData[196] = 0;
  _$jscoverage['/dialog.js'].lineData[198] = 0;
  _$jscoverage['/dialog.js'].lineData[202] = 0;
  _$jscoverage['/dialog.js'].lineData[205] = 0;
  _$jscoverage['/dialog.js'].lineData[206] = 0;
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
  _$jscoverage['/dialog.js'].lineData[260] = 0;
  _$jscoverage['/dialog.js'].lineData[262] = 0;
  _$jscoverage['/dialog.js'].lineData[267] = 0;
  _$jscoverage['/dialog.js'].lineData[268] = 0;
  _$jscoverage['/dialog.js'].lineData[269] = 0;
  _$jscoverage['/dialog.js'].lineData[270] = 0;
  _$jscoverage['/dialog.js'].lineData[271] = 0;
  _$jscoverage['/dialog.js'].lineData[273] = 0;
  _$jscoverage['/dialog.js'].lineData[274] = 0;
  _$jscoverage['/dialog.js'].lineData[275] = 0;
  _$jscoverage['/dialog.js'].lineData[277] = 0;
  _$jscoverage['/dialog.js'].lineData[278] = 0;
  _$jscoverage['/dialog.js'].lineData[280] = 0;
  _$jscoverage['/dialog.js'].lineData[281] = 0;
  _$jscoverage['/dialog.js'].lineData[282] = 0;
  _$jscoverage['/dialog.js'].lineData[284] = 0;
  _$jscoverage['/dialog.js'].lineData[285] = 0;
  _$jscoverage['/dialog.js'].lineData[287] = 0;
  _$jscoverage['/dialog.js'].lineData[288] = 0;
  _$jscoverage['/dialog.js'].lineData[289] = 0;
  _$jscoverage['/dialog.js'].lineData[291] = 0;
  _$jscoverage['/dialog.js'].lineData[293] = 0;
  _$jscoverage['/dialog.js'].lineData[294] = 0;
  _$jscoverage['/dialog.js'].lineData[296] = 0;
  _$jscoverage['/dialog.js'].lineData[300] = 0;
  _$jscoverage['/dialog.js'].lineData[304] = 0;
  _$jscoverage['/dialog.js'].lineData[311] = 0;
  _$jscoverage['/dialog.js'].lineData[315] = 0;
  _$jscoverage['/dialog.js'].lineData[316] = 0;
  _$jscoverage['/dialog.js'].lineData[317] = 0;
  _$jscoverage['/dialog.js'].lineData[318] = 0;
  _$jscoverage['/dialog.js'].lineData[319] = 0;
  _$jscoverage['/dialog.js'].lineData[320] = 0;
  _$jscoverage['/dialog.js'].lineData[321] = 0;
  _$jscoverage['/dialog.js'].lineData[322] = 0;
  _$jscoverage['/dialog.js'].lineData[324] = 0;
  _$jscoverage['/dialog.js'].lineData[325] = 0;
  _$jscoverage['/dialog.js'].lineData[326] = 0;
  _$jscoverage['/dialog.js'].lineData[327] = 0;
  _$jscoverage['/dialog.js'].lineData[328] = 0;
  _$jscoverage['/dialog.js'].lineData[329] = 0;
  _$jscoverage['/dialog.js'].lineData[330] = 0;
  _$jscoverage['/dialog.js'].lineData[332] = 0;
  _$jscoverage['/dialog.js'].lineData[333] = 0;
  _$jscoverage['/dialog.js'].lineData[337] = 0;
  _$jscoverage['/dialog.js'].lineData[338] = 0;
  _$jscoverage['/dialog.js'].lineData[342] = 0;
  _$jscoverage['/dialog.js'].lineData[348] = 0;
  _$jscoverage['/dialog.js'].lineData[349] = 0;
  _$jscoverage['/dialog.js'].lineData[354] = 0;
  _$jscoverage['/dialog.js'].lineData[355] = 0;
  _$jscoverage['/dialog.js'].lineData[360] = 0;
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
  _$jscoverage['/dialog.js'].branchData['18'] = [];
  _$jscoverage['/dialog.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['112'] = [];
  _$jscoverage['/dialog.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['118'] = [];
  _$jscoverage['/dialog.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['141'] = [];
  _$jscoverage['/dialog.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['153'] = [];
  _$jscoverage['/dialog.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['156'] = [];
  _$jscoverage['/dialog.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['198'] = [];
  _$jscoverage['/dialog.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['202'] = [];
  _$jscoverage['/dialog.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['205'] = [];
  _$jscoverage['/dialog.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['214'] = [];
  _$jscoverage['/dialog.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['220'] = [];
  _$jscoverage['/dialog.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['235'] = [];
  _$jscoverage['/dialog.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['237'] = [];
  _$jscoverage['/dialog.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['239'] = [];
  _$jscoverage['/dialog.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['267'] = [];
  _$jscoverage['/dialog.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['269'] = [];
  _$jscoverage['/dialog.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['274'] = [];
  _$jscoverage['/dialog.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['277'] = [];
  _$jscoverage['/dialog.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['281'] = [];
  _$jscoverage['/dialog.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['284'] = [];
  _$jscoverage['/dialog.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['287'] = [];
  _$jscoverage['/dialog.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['288'] = [];
  _$jscoverage['/dialog.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['293'] = [];
  _$jscoverage['/dialog.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['315'] = [];
  _$jscoverage['/dialog.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['319'] = [];
  _$jscoverage['/dialog.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['350'] = [];
  _$jscoverage['/dialog.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/dialog.js'].branchData['351'] = [];
  _$jscoverage['/dialog.js'].branchData['351'][1] = new BranchData();
}
_$jscoverage['/dialog.js'].branchData['351'][1].init(212, 6, 's || i');
function visit28_351_1(result) {
  _$jscoverage['/dialog.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['350'][1].init(103, 9, 'page == i');
function visit27_350_1(result) {
  _$jscoverage['/dialog.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['319'][1].init(210, 32, 'parseInt(f.style("margin")) || 0');
function visit26_319_1(result) {
  _$jscoverage['/dialog.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['315'][1].init(182, 1, 'f');
function visit25_315_1(result) {
  _$jscoverage['/dialog.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['293'][1].init(1397, 17, 'page != totalPage');
function visit24_293_1(result) {
  _$jscoverage['/dialog.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['288'][1].init(34, 20, 'end != totalPage - 1');
function visit23_288_1(result) {
  _$jscoverage['/dialog.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['287'][1].init(1043, 16, 'end != totalPage');
function visit22_287_1(result) {
  _$jscoverage['/dialog.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['284'][1].init(897, 8, 'i <= end');
function visit21_284_1(result) {
  _$jscoverage['/dialog.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['281'][1].init(710, 10, 'start != 2');
function visit20_281_1(result) {
  _$jscoverage['/dialog.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['277'][1].init(502, 9, 'page != 1');
function visit19_277_1(result) {
  _$jscoverage['/dialog.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['274'][1].init(363, 20, 'end == totalPage - 1');
function visit18_274_1(result) {
  _$jscoverage['/dialog.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['269'][1].init(115, 10, 'start <= 2');
function visit17_269_1(result) {
  _$jscoverage['/dialog.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['267'][1].init(1293, 13, 'totalPage > 1');
function visit16_267_1(result) {
  _$jscoverage['/dialog.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['239'][1].init(70, 13, 'i < re.length');
function visit15_239_1(result) {
  _$jscoverage['/dialog.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['237'][1].init(120, 15, 're && re.length');
function visit14_237_1(result) {
  _$jscoverage['/dialog.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['235'][1].init(262, 43, 'data.key == S.trim(self._xiami_input.val())');
function visit13_235_1(result) {
  _$jscoverage['/dialog.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['220'][1].init(1302, 6, 'paging');
function visit12_220_1(result) {
  _$jscoverage['/dialog.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['214'][1].init(45, 33, 'parseInt(self.dMargin.val()) || 0');
function visit11_214_1(result) {
  _$jscoverage['/dialog.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['205'][1].init(595, 3, 'add');
function visit10_205_1(result) {
  _$jscoverage['/dialog.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['202'][1].init(33, 121, 'self._xiamia_list.contains(node) && Dom.hasClass(node, prefixCls + "editor-xiami-page-item")');
function visit9_202_1(result) {
  _$jscoverage['/dialog.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['198'][1].init(33, 115, 'self._xiamia_list.contains(node) && Dom.hasClass(node, prefixCls + "editor-xiami-add")');
function visit8_198_1(result) {
  _$jscoverage['/dialog.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['156'][2].init(244, 12, 'query == TIP');
function visit7_156_2(result) {
  _$jscoverage['/dialog.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['156'][1].init(226, 30, '!S.trim(query) || query == TIP');
function visit6_156_1(result) {
  _$jscoverage['/dialog.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['153'][1].init(64, 48, 'query.replace(/[^\\x00-\\xff]/g, "@@").length > 30');
function visit5_153_1(result) {
  _$jscoverage['/dialog.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['141'][1].init(41, 33, 'parseInt(self.dMargin.val()) || 0');
function visit4_141_1(result) {
  _$jscoverage['/dialog.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['118'][1].init(22, 17, 'ev.keyCode === 13');
function visit3_118_1(result) {
  _$jscoverage['/dialog.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['112'][1].init(22, 68, '!self._xiami_submit.hasClass("ks-editor-button-disabled", undefined)');
function visit2_112_1(result) {
  _$jscoverage['/dialog.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].branchData['18'][1].init(14, 14, 'str.length > l');
function visit1_18_1(result) {
  _$jscoverage['/dialog.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/dialog.js'].lineData[5]++;
KISSY.add("editor/plugin/xiami-music/dialog", function(S, Editor, FlashDialog, MenuButton) {
  _$jscoverage['/dialog.js'].functionData[0]++;
  _$jscoverage['/dialog.js'].lineData[6]++;
  var Dom = S.DOM, Node = S.Node, Utils = Editor.Utils, loading = Utils.debugUrl("theme/tao-loading.gif"), XIAMI_URL = "http://www.xiami.com/app/nineteen/search/key/{key}/page/{page}", CLS_XIAMI = "ke_xiami", TYPE_XIAMI = "xiami-music", BTIP = "\u641c \u7d22", TIP = "\u8f93\u5165\u6b4c\u66f2\u540d\u3001\u4e13\u8f91\u540d\u3001\u827a\u4eba\u540d";
  _$jscoverage['/dialog.js'].lineData[17]++;
  function limit(str, l) {
    _$jscoverage['/dialog.js'].functionData[1]++;
    _$jscoverage['/dialog.js'].lineData[18]++;
    if (visit1_18_1(str.length > l)) {
      _$jscoverage['/dialog.js'].lineData[19]++;
      str = str.substring(0, l) + "...";
    }
    _$jscoverage['/dialog.js'].lineData[20]++;
    return str;
  }
  _$jscoverage['/dialog.js'].lineData[23]++;
  var MARGIN_DEFAULT = 0, bodyHTML = "<div style='padding:40px 0 70px 0;'>" + "<form action='#' class='{prefixCls}editor-xiami-form' style='margin:0 20px;'>" + "<p class='{prefixCls}editor-xiami-title'>" + "" + "</p>" + "<p class='{prefixCls}editor-xiami-url-wrap'>" + "<input class='{prefixCls}editor-xiami-url {prefixCls}editor-input' " + "style='width:370px;" + "'" + "/> &nbsp; " + " <a " + "class='{prefixCls}editor-xiami-submit {prefixCls}editor-button ks-inline-block'" + ">" + BTIP + "</a>" + "</p>" + "<p " + "style='margin:10px 0'>" + "<label>\u5bf9 \u9f50\uff1a " + "<select " + "class='{prefixCls}editor-xiami-align' title='\u5bf9\u9f50'>" + "<option value='none'>\u65e0</option>" + "<option value='left'>\u5de6\u5bf9\u9f50</option>" + "<option value='right'>\u53f3\u5bf9\u9f50</option>" + "</select>" + "</label>" + "<label style='margin-left:70px;'>\u95f4\u8ddd\uff1a " + " " + "<input " + "" + " data-verify='^\\d+$' " + " data-warning='\u95f4\u8ddd\u8bf7\u8f93\u5165\u975e\u8d1f\u6574\u6570' " + "class='{prefixCls}editor-xiami-margin {prefixCls}editor-input' style='width:60px;" + "' value='" + MARGIN_DEFAULT + "'/> \u50cf\u7d20" + "</label>" + "</p>" + "</form>" + "<div " + "class='{prefixCls}editor-xiami-list'>" + "</div>" + "</div>", footHTML = "<div style='padding:5px 20px 20px;'><a " + "class='{prefixCls}editor-xiami-ok {prefixCls}editor-button ks-inline-block' " + "style='margin-right:20px;'>\u786e&nbsp;\u5b9a</a>" + "<a class='{prefixCls}editor-xiami-cancel {prefixCls}editor-button ks-inline-block'>\u53d6&nbsp;\u6d88</a></div>";
  _$jscoverage['/dialog.js'].lineData[70]++;
  function XiamiMusicDialog() {
    _$jscoverage['/dialog.js'].functionData[2]++;
    _$jscoverage['/dialog.js'].lineData[71]++;
    XiamiMusicDialog.superclass.constructor.apply(this, arguments);
  }
  _$jscoverage['/dialog.js'].lineData[74]++;
  S.extend(XiamiMusicDialog, FlashDialog, {
  _config: function() {
  _$jscoverage['/dialog.js'].functionData[3]++;
  _$jscoverage['/dialog.js'].lineData[76]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls');
  _$jscoverage['/dialog.js'].lineData[79]++;
  self._cls = CLS_XIAMI;
  _$jscoverage['/dialog.js'].lineData[80]++;
  self._type = TYPE_XIAMI;
  _$jscoverage['/dialog.js'].lineData[81]++;
  self._title = "\u867e\u7c73\u97f3\u4e50";
  _$jscoverage['/dialog.js'].lineData[82]++;
  self._bodyHTML = S.substitute(bodyHTML, {
  prefixCls: prefixCls});
  _$jscoverage['/dialog.js'].lineData[85]++;
  self._footHTML = S.substitute(footHTML, {
  prefixCls: prefixCls});
}, 
  _initD: function() {
  _$jscoverage['/dialog.js'].functionData[4]++;
  _$jscoverage['/dialog.js'].lineData[90]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), d = self.dialog, del = d.get("el"), dfoot = d.get("footer"), input = del.one("." + prefixCls + "editor-xiami-url");
  _$jscoverage['/dialog.js'].lineData[97]++;
  self.dAlign = MenuButton.Select.decorate(del.one("." + prefixCls + "editor-xiami-align"), {
  prefixCls: 'ks-editor-big-', 
  width: 80, 
  menuCfg: {
  prefixCls: 'ks-editor-', 
  render: del}});
  _$jscoverage['/dialog.js'].lineData[105]++;
  self.addRes(self.dAlign);
  _$jscoverage['/dialog.js'].lineData[106]++;
  self._xiami_input = input;
  _$jscoverage['/dialog.js'].lineData[107]++;
  Editor.Utils.placeholder(input, TIP);
  _$jscoverage['/dialog.js'].lineData[108]++;
  self.addRes(input);
  _$jscoverage['/dialog.js'].lineData[109]++;
  self._xiamia_list = del.one("." + prefixCls + "editor-xiami-list");
  _$jscoverage['/dialog.js'].lineData[110]++;
  self._xiami_submit = del.one("." + prefixCls + "editor-xiami-submit");
  _$jscoverage['/dialog.js'].lineData[111]++;
  self._xiami_submit.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[5]++;
  _$jscoverage['/dialog.js'].lineData[112]++;
  if (visit2_112_1(!self._xiami_submit.hasClass("ks-editor-button-disabled", undefined))) {
    _$jscoverage['/dialog.js'].lineData[113]++;
    loadRecordsByPage(1);
  }
  _$jscoverage['/dialog.js'].lineData[114]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[116]++;
  self.addRes(self._xiami_submit);
  _$jscoverage['/dialog.js'].lineData[117]++;
  input.on("keydown", function(ev) {
  _$jscoverage['/dialog.js'].functionData[6]++;
  _$jscoverage['/dialog.js'].lineData[118]++;
  if (visit3_118_1(ev.keyCode === 13)) {
    _$jscoverage['/dialog.js'].lineData[119]++;
    loadRecordsByPage(1);
  }
});
  _$jscoverage['/dialog.js'].lineData[122]++;
  self.dMargin = del.one("." + prefixCls + "editor-xiami-margin");
  _$jscoverage['/dialog.js'].lineData[123]++;
  self._xiami_url_wrap = del.one("." + prefixCls + "editor-xiami-url-wrap");
  _$jscoverage['/dialog.js'].lineData[124]++;
  self._xiamia_title = del.one("." + prefixCls + "editor-xiami-title");
  _$jscoverage['/dialog.js'].lineData[126]++;
  var _xiami_ok = dfoot.one("." + prefixCls + "editor-xiami-ok");
  _$jscoverage['/dialog.js'].lineData[127]++;
  dfoot.one("." + prefixCls + "editor-xiami-cancel").on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[7]++;
  _$jscoverage['/dialog.js'].lineData[128]++;
  d.hide();
  _$jscoverage['/dialog.js'].lineData[129]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[131]++;
  self.addRes(dfoot);
  _$jscoverage['/dialog.js'].lineData[132]++;
  _xiami_ok.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[8]++;
  _$jscoverage['/dialog.js'].lineData[133]++;
  var f = self.selectedFlash, r = editor.restoreRealElement(f);
  _$jscoverage['/dialog.js'].lineData[135]++;
  self._dinfo = {
  url: self._getFlashUrl(r), 
  attrs: {
  title: f.attr("title"), 
  style: "margin:" + (visit4_141_1(parseInt(self.dMargin.val()) || 0)) + "px;" + "float:" + self.dAlign.get("value") + ";"}};
  _$jscoverage['/dialog.js'].lineData[146]++;
  self._gen();
  _$jscoverage['/dialog.js'].lineData[147]++;
  ev.halt();
}, self);
  _$jscoverage['/dialog.js'].lineData[149]++;
  self.addRes(_xiami_ok);
  _$jscoverage['/dialog.js'].lineData[151]++;
  function loadRecordsByPage(page) {
    _$jscoverage['/dialog.js'].functionData[9]++;
    _$jscoverage['/dialog.js'].lineData[152]++;
    var query = input.val();
    _$jscoverage['/dialog.js'].lineData[153]++;
    if (visit5_153_1(query.replace(/[^\x00-\xff]/g, "@@").length > 30)) {
      _$jscoverage['/dialog.js'].lineData[154]++;
      alert("\u957f\u5ea6\u4e0a\u965030\u4e2a\u5b57\u7b26\uff081\u4e2a\u6c49\u5b57=2\u4e2a\u5b57\u7b26\uff09");
      _$jscoverage['/dialog.js'].lineData[155]++;
      return;
    } else {
      _$jscoverage['/dialog.js'].lineData[156]++;
      if (visit6_156_1(!S.trim(query) || visit7_156_2(query == TIP))) {
        _$jscoverage['/dialog.js'].lineData[157]++;
        alert("\u4e0d\u80fd\u4e3a\u7a7a\uff01");
        _$jscoverage['/dialog.js'].lineData[158]++;
        return;
      }
    }
    _$jscoverage['/dialog.js'].lineData[160]++;
    self._xiami_submit.addClass(prefixCls + "editor-button-disabled", undefined);
    _$jscoverage['/dialog.js'].lineData[161]++;
    var req = S.substitute(XIAMI_URL, {
  key: encodeURIComponent(input.val()), 
  page: page});
    _$jscoverage['/dialog.js'].lineData[165]++;
    self._xiamia_list.html("<img style='" + "display:block;" + "width:32px;" + "height:32px;" + "margin:5px auto 0 auto;" + "'src='" + loading + "'/>" + "<p style='width: 130px; margin: 15px auto 0; color: rgb(150, 150, 150);'>\u6b63\u5728\u641c\u7d22\uff0c\u8bf7\u7a0d\u5019......</p>");
    _$jscoverage['/dialog.js'].lineData[172]++;
    self._xiamia_list.show();
    _$jscoverage['/dialog.js'].lineData[174]++;
    S.use('io', function(S, IO) {
  _$jscoverage['/dialog.js'].functionData[10]++;
  _$jscoverage['/dialog.js'].lineData[175]++;
  new IO({
  cache: false, 
  url: req, 
  dataType: 'jsonp', 
  success: function(data) {
  _$jscoverage['/dialog.js'].functionData[11]++;
  _$jscoverage['/dialog.js'].lineData[180]++;
  data.page = page;
  _$jscoverage['/dialog.js'].lineData[181]++;
  self._listSearch(data);
}, 
  error: function() {
  _$jscoverage['/dialog.js'].functionData[12]++;
  _$jscoverage['/dialog.js'].lineData[184]++;
  self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
  _$jscoverage['/dialog.js'].lineData[185]++;
  var html = "<p style='text-align:center;margin:10px 0;'>" + "\u4e0d\u597d\u610f\u601d\uff0c\u8d85\u65f6\u4e86\uff0c\u8bf7\u91cd\u8bd5\uff01" + "</p>";
  _$jscoverage['/dialog.js'].lineData[188]++;
  self._xiamia_list.html(html);
}});
});
  }
  _$jscoverage['/dialog.js'].lineData[194]++;
  self._xiamia_list.on("click", function(ev) {
  _$jscoverage['/dialog.js'].functionData[13]++;
  _$jscoverage['/dialog.js'].lineData[195]++;
  ev.preventDefault();
  _$jscoverage['/dialog.js'].lineData[196]++;
  var t = new Node(ev.target), add = t.closest(function(node) {
  _$jscoverage['/dialog.js'].functionData[14]++;
  _$jscoverage['/dialog.js'].lineData[198]++;
  return visit8_198_1(self._xiamia_list.contains(node) && Dom.hasClass(node, prefixCls + "editor-xiami-add"));
}, undefined), paging = t.closest(function(node) {
  _$jscoverage['/dialog.js'].functionData[15]++;
  _$jscoverage['/dialog.js'].lineData[202]++;
  return visit9_202_1(self._xiamia_list.contains(node) && Dom.hasClass(node, prefixCls + "editor-xiami-page-item"));
}, undefined);
  _$jscoverage['/dialog.js'].lineData[205]++;
  if (visit10_205_1(add)) {
    _$jscoverage['/dialog.js'].lineData[206]++;
    self._dinfo = {
  url: ("http://www.xiami.com/widget/" + add.attr("data-value") + "/singlePlayer.swf"), 
  attrs: {
  title: add.attr("title"), 
  style: "margin:" + (visit11_214_1(parseInt(self.dMargin.val()) || 0)) + "px;" + "float:" + self.dAlign.get("value") + ";"}};
    _$jscoverage['/dialog.js'].lineData[219]++;
    self._gen();
  } else {
    _$jscoverage['/dialog.js'].lineData[220]++;
    if (visit12_220_1(paging)) {
      _$jscoverage['/dialog.js'].lineData[221]++;
      loadRecordsByPage(parseInt(paging.attr("data-value")));
    }
  }
  _$jscoverage['/dialog.js'].lineData[223]++;
  ev.halt();
});
  _$jscoverage['/dialog.js'].lineData[225]++;
  self.addRes(self._xiamia_list);
}, 
  _listSearch: function(data) {
  _$jscoverage['/dialog.js'].functionData[16]++;
  _$jscoverage['/dialog.js'].lineData[228]++;
  var self = this, i, editor = self.editor, prefixCls = editor.get('prefixCls'), re = data['results'], html = "";
  _$jscoverage['/dialog.js'].lineData[235]++;
  if (visit13_235_1(data.key == S.trim(self._xiami_input.val()))) {
    _$jscoverage['/dialog.js'].lineData[236]++;
    self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
    _$jscoverage['/dialog.js'].lineData[237]++;
    if (visit14_237_1(re && re.length)) {
      _$jscoverage['/dialog.js'].lineData[238]++;
      html = "<ul>";
      _$jscoverage['/dialog.js'].lineData[239]++;
      for (i = 0; visit15_239_1(i < re.length); i++) {
        _$jscoverage['/dialog.js'].lineData[240]++;
        var r = re[i], d = getDisplayName(r);
        _$jscoverage['/dialog.js'].lineData[241]++;
        html += "<li " + "title='" + d + "'>" + "<span class='" + prefixCls + "editor-xiami-song'>" + limit(d, 35) + "</span>" + "" + "" + "<a href='#' " + "title='" + d + "' " + "class='" + prefixCls + "editor-xiami-add' data-value='" + (r['album_id'] + "_" + r['song_id']) + "'>\u6dfb\u52a0</a>" + "</li>";
      }
      _$jscoverage['/dialog.js'].lineData[260]++;
      html += "</ul>";
      _$jscoverage['/dialog.js'].lineData[262]++;
      var page = data.page, totalPage = Math.floor(data['total'] / 8), start = page - 1, end = page + 1;
      _$jscoverage['/dialog.js'].lineData[267]++;
      if (visit16_267_1(totalPage > 1)) {
        _$jscoverage['/dialog.js'].lineData[268]++;
        html += "<p class='" + prefixCls + "editor-xiami-paging'>";
        _$jscoverage['/dialog.js'].lineData[269]++;
        if (visit17_269_1(start <= 2)) {
          _$jscoverage['/dialog.js'].lineData[270]++;
          end = Math.min(2 - start + end, totalPage - 1);
          _$jscoverage['/dialog.js'].lineData[271]++;
          start = 2;
        }
        _$jscoverage['/dialog.js'].lineData[273]++;
        end = Math.min(end, totalPage - 1);
        _$jscoverage['/dialog.js'].lineData[274]++;
        if (visit18_274_1(end == totalPage - 1)) {
          _$jscoverage['/dialog.js'].lineData[275]++;
          start = Math.max(2, end - 3);
        }
        _$jscoverage['/dialog.js'].lineData[277]++;
        if (visit19_277_1(page != 1)) {
          _$jscoverage['/dialog.js'].lineData[278]++;
          html += getXiamiPaging(page, page - 1, "\u4e0a\u4e00\u9875");
        }
        _$jscoverage['/dialog.js'].lineData[280]++;
        html += getXiamiPaging(page, 1, "1");
        _$jscoverage['/dialog.js'].lineData[281]++;
        if (visit20_281_1(start != 2)) {
          _$jscoverage['/dialog.js'].lineData[282]++;
          html += "<span class='" + prefixCls + "editor-xiami-page-more'>...</span>";
        }
        _$jscoverage['/dialog.js'].lineData[284]++;
        for (i = start; visit21_284_1(i <= end); i++) {
          _$jscoverage['/dialog.js'].lineData[285]++;
          html += getXiamiPaging(page, i, undefined);
        }
        _$jscoverage['/dialog.js'].lineData[287]++;
        if (visit22_287_1(end != totalPage)) {
          _$jscoverage['/dialog.js'].lineData[288]++;
          if (visit23_288_1(end != totalPage - 1)) {
            _$jscoverage['/dialog.js'].lineData[289]++;
            html += "<span class='" + prefixCls + "editor-xiami-page-more'>...</span>";
          }
          _$jscoverage['/dialog.js'].lineData[291]++;
          html += getXiamiPaging(page, totalPage, totalPage);
        }
        _$jscoverage['/dialog.js'].lineData[293]++;
        if (visit24_293_1(page != totalPage)) {
          _$jscoverage['/dialog.js'].lineData[294]++;
          html += getXiamiPaging(page, page + 1, "\u4e0b\u4e00\u9875");
        }
        _$jscoverage['/dialog.js'].lineData[296]++;
        html += "</p>";
      }
    } else {
      _$jscoverage['/dialog.js'].lineData[300]++;
      html = "<p style='text-align:center;margin:10px 0;'>" + "\u4e0d\u597d\u610f\u601d\uff0c\u6ca1\u6709\u627e\u5230\u7ed3\u679c\uff01" + "</p>";
    }
    _$jscoverage['/dialog.js'].lineData[304]++;
    self._xiamia_list.html(S.substitute(html, {
  prefixCls: prefixCls}));
  }
}, 
  _updateD: function() {
  _$jscoverage['/dialog.js'].functionData[17]++;
  _$jscoverage['/dialog.js'].lineData[311]++;
  var self = this, editor = self.editor, prefixCls = editor.get('prefixCls'), f = self.selectedFlash;
  _$jscoverage['/dialog.js'].lineData[315]++;
  if (visit25_315_1(f)) {
    _$jscoverage['/dialog.js'].lineData[316]++;
    self._xiami_input.val(f.attr("title"));
    _$jscoverage['/dialog.js'].lineData[317]++;
    self._xiamia_title.html(f.attr("title"));
    _$jscoverage['/dialog.js'].lineData[318]++;
    self.dAlign.set("value", f.css("float"));
    _$jscoverage['/dialog.js'].lineData[319]++;
    self.dMargin.val(visit26_319_1(parseInt(f.style("margin")) || 0));
    _$jscoverage['/dialog.js'].lineData[320]++;
    self._xiami_url_wrap.hide();
    _$jscoverage['/dialog.js'].lineData[321]++;
    self.dialog.get("footer").show();
    _$jscoverage['/dialog.js'].lineData[322]++;
    self._xiamia_title.show();
  } else {
    _$jscoverage['/dialog.js'].lineData[324]++;
    Editor.Utils.resetInput(self._xiami_input);
    _$jscoverage['/dialog.js'].lineData[325]++;
    self.dAlign.set("value", "none");
    _$jscoverage['/dialog.js'].lineData[326]++;
    self.dMargin.val(MARGIN_DEFAULT);
    _$jscoverage['/dialog.js'].lineData[327]++;
    self._xiami_url_wrap.show();
    _$jscoverage['/dialog.js'].lineData[328]++;
    self.dialog.get("footer").hide();
    _$jscoverage['/dialog.js'].lineData[329]++;
    self._xiamia_title.hide();
    _$jscoverage['/dialog.js'].lineData[330]++;
    self._xiami_submit.removeClass(prefixCls + "editor-button-disabled", undefined);
  }
  _$jscoverage['/dialog.js'].lineData[332]++;
  self._xiamia_list.hide();
  _$jscoverage['/dialog.js'].lineData[333]++;
  self._xiamia_list.html("");
}, 
  _getDInfo: function() {
  _$jscoverage['/dialog.js'].functionData[18]++;
  _$jscoverage['/dialog.js'].lineData[337]++;
  var self = this;
  _$jscoverage['/dialog.js'].lineData[338]++;
  S.mix(self._dinfo.attrs, {
  width: 257, 
  height: 33});
  _$jscoverage['/dialog.js'].lineData[342]++;
  return self._dinfo;
}});
  _$jscoverage['/dialog.js'].lineData[348]++;
  function getXiamiPaging(page, i, s) {
    _$jscoverage['/dialog.js'].functionData[19]++;
    _$jscoverage['/dialog.js'].lineData[349]++;
    return "<a class='{prefixCls}editor-xiami-page-item {prefixCls}editor-button ks-inline-block" + ((visit27_350_1(page == i)) ? " {prefixCls}editor-xiami-curpage" : "") + "' data-value='" + i + "' href='#'>" + (visit28_351_1(s || i)) + "</a>";
  }
  _$jscoverage['/dialog.js'].lineData[354]++;
  function getDisplayName(r) {
    _$jscoverage['/dialog.js'].functionData[20]++;
    _$jscoverage['/dialog.js'].lineData[355]++;
    return S.urlDecode(r['song_name']) + " - " + S.urlDecode(r['artist_name']);
  }
  _$jscoverage['/dialog.js'].lineData[360]++;
  return XiamiMusicDialog;
}, {
  requires: ['editor', '../flash/dialog', '../menubutton']});
