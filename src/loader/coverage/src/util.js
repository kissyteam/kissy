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
if (! _$jscoverage['/util.js']) {
  _$jscoverage['/util.js'] = {};
  _$jscoverage['/util.js'].lineData = [];
  _$jscoverage['/util.js'].lineData[1] = 0;
  _$jscoverage['/util.js'].lineData[2] = 0;
  _$jscoverage['/util.js'].lineData[3] = 0;
  _$jscoverage['/util.js'].lineData[8] = 0;
  _$jscoverage['/util.js'].lineData[11] = 0;
  _$jscoverage['/util.js'].lineData[22] = 0;
  _$jscoverage['/util.js'].lineData[23] = 0;
  _$jscoverage['/util.js'].lineData[25] = 0;
  _$jscoverage['/util.js'].lineData[28] = 0;
  _$jscoverage['/util.js'].lineData[34] = 0;
  _$jscoverage['/util.js'].lineData[35] = 0;
  _$jscoverage['/util.js'].lineData[36] = 0;
  _$jscoverage['/util.js'].lineData[39] = 0;
  _$jscoverage['/util.js'].lineData[52] = 0;
  _$jscoverage['/util.js'].lineData[56] = 0;
  _$jscoverage['/util.js'].lineData[66] = 0;
  _$jscoverage['/util.js'].lineData[77] = 0;
  _$jscoverage['/util.js'].lineData[88] = 0;
  _$jscoverage['/util.js'].lineData[99] = 0;
  _$jscoverage['/util.js'].lineData[100] = 0;
  _$jscoverage['/util.js'].lineData[110] = 0;
  _$jscoverage['/util.js'].lineData[113] = 0;
  _$jscoverage['/util.js'].lineData[122] = 0;
  _$jscoverage['/util.js'].lineData[124] = 0;
  _$jscoverage['/util.js'].lineData[126] = 0;
  _$jscoverage['/util.js'].lineData[127] = 0;
  _$jscoverage['/util.js'].lineData[131] = 0;
  _$jscoverage['/util.js'].lineData[132] = 0;
  _$jscoverage['/util.js'].lineData[133] = 0;
  _$jscoverage['/util.js'].lineData[134] = 0;
  _$jscoverage['/util.js'].lineData[135] = 0;
  _$jscoverage['/util.js'].lineData[140] = 0;
  _$jscoverage['/util.js'].lineData[151] = 0;
  _$jscoverage['/util.js'].lineData[152] = 0;
  _$jscoverage['/util.js'].lineData[160] = 0;
  _$jscoverage['/util.js'].lineData[162] = 0;
  _$jscoverage['/util.js'].lineData[163] = 0;
  _$jscoverage['/util.js'].lineData[164] = 0;
  _$jscoverage['/util.js'].lineData[165] = 0;
  _$jscoverage['/util.js'].lineData[167] = 0;
  _$jscoverage['/util.js'].lineData[168] = 0;
  _$jscoverage['/util.js'].lineData[172] = 0;
  _$jscoverage['/util.js'].lineData[174] = 0;
  _$jscoverage['/util.js'].lineData[175] = 0;
  _$jscoverage['/util.js'].lineData[180] = 0;
  _$jscoverage['/util.js'].lineData[202] = 0;
  _$jscoverage['/util.js'].lineData[203] = 0;
  _$jscoverage['/util.js'].lineData[204] = 0;
  _$jscoverage['/util.js'].lineData[205] = 0;
  _$jscoverage['/util.js'].lineData[207] = 0;
  _$jscoverage['/util.js'].lineData[209] = 0;
  _$jscoverage['/util.js'].lineData[211] = 0;
  _$jscoverage['/util.js'].lineData[212] = 0;
  _$jscoverage['/util.js'].lineData[215] = 0;
  _$jscoverage['/util.js'].lineData[216] = 0;
  _$jscoverage['/util.js'].lineData[217] = 0;
  _$jscoverage['/util.js'].lineData[218] = 0;
  _$jscoverage['/util.js'].lineData[220] = 0;
  _$jscoverage['/util.js'].lineData[221] = 0;
  _$jscoverage['/util.js'].lineData[223] = 0;
  _$jscoverage['/util.js'].lineData[224] = 0;
  _$jscoverage['/util.js'].lineData[225] = 0;
  _$jscoverage['/util.js'].lineData[226] = 0;
  _$jscoverage['/util.js'].lineData[227] = 0;
  _$jscoverage['/util.js'].lineData[228] = 0;
  _$jscoverage['/util.js'].lineData[230] = 0;
  _$jscoverage['/util.js'].lineData[237] = 0;
  _$jscoverage['/util.js'].lineData[238] = 0;
  _$jscoverage['/util.js'].lineData[257] = 0;
  _$jscoverage['/util.js'].lineData[258] = 0;
  _$jscoverage['/util.js'].lineData[260] = 0;
  _$jscoverage['/util.js'].lineData[261] = 0;
  _$jscoverage['/util.js'].lineData[262] = 0;
  _$jscoverage['/util.js'].lineData[269] = 0;
  _$jscoverage['/util.js'].lineData[270] = 0;
  _$jscoverage['/util.js'].lineData[271] = 0;
  _$jscoverage['/util.js'].lineData[272] = 0;
  _$jscoverage['/util.js'].lineData[273] = 0;
  _$jscoverage['/util.js'].lineData[276] = 0;
  _$jscoverage['/util.js'].lineData[277] = 0;
  _$jscoverage['/util.js'].lineData[278] = 0;
  _$jscoverage['/util.js'].lineData[279] = 0;
  _$jscoverage['/util.js'].lineData[281] = 0;
  _$jscoverage['/util.js'].lineData[282] = 0;
  _$jscoverage['/util.js'].lineData[284] = 0;
  _$jscoverage['/util.js'].lineData[285] = 0;
  _$jscoverage['/util.js'].lineData[288] = 0;
  _$jscoverage['/util.js'].lineData[289] = 0;
  _$jscoverage['/util.js'].lineData[290] = 0;
  _$jscoverage['/util.js'].lineData[292] = 0;
  _$jscoverage['/util.js'].lineData[295] = 0;
  _$jscoverage['/util.js'].lineData[298] = 0;
}
if (! _$jscoverage['/util.js'].functionData) {
  _$jscoverage['/util.js'].functionData = [];
  _$jscoverage['/util.js'].functionData[0] = 0;
  _$jscoverage['/util.js'].functionData[1] = 0;
  _$jscoverage['/util.js'].functionData[2] = 0;
  _$jscoverage['/util.js'].functionData[3] = 0;
  _$jscoverage['/util.js'].functionData[4] = 0;
  _$jscoverage['/util.js'].functionData[5] = 0;
  _$jscoverage['/util.js'].functionData[6] = 0;
  _$jscoverage['/util.js'].functionData[7] = 0;
  _$jscoverage['/util.js'].functionData[8] = 0;
  _$jscoverage['/util.js'].functionData[9] = 0;
  _$jscoverage['/util.js'].functionData[10] = 0;
  _$jscoverage['/util.js'].functionData[11] = 0;
  _$jscoverage['/util.js'].functionData[12] = 0;
  _$jscoverage['/util.js'].functionData[13] = 0;
  _$jscoverage['/util.js'].functionData[14] = 0;
}
if (! _$jscoverage['/util.js'].branchData) {
  _$jscoverage['/util.js'].branchData = {};
  _$jscoverage['/util.js'].branchData['25'] = [];
  _$jscoverage['/util.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['25'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['25'][4] = new BranchData();
  _$jscoverage['/util.js'].branchData['25'][5] = new BranchData();
  _$jscoverage['/util.js'].branchData['35'] = [];
  _$jscoverage['/util.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['51'] = [];
  _$jscoverage['/util.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['56'] = [];
  _$jscoverage['/util.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['88'] = [];
  _$jscoverage['/util.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['100'] = [];
  _$jscoverage['/util.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['100'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['110'] = [];
  _$jscoverage['/util.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['113'] = [];
  _$jscoverage['/util.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['121'] = [];
  _$jscoverage['/util.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['126'] = [];
  _$jscoverage['/util.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['131'] = [];
  _$jscoverage['/util.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['132'] = [];
  _$jscoverage['/util.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['134'] = [];
  _$jscoverage['/util.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['151'] = [];
  _$jscoverage['/util.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['156'] = [];
  _$jscoverage['/util.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['158'] = [];
  _$jscoverage['/util.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['158'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['158'][3] = new BranchData();
  _$jscoverage['/util.js'].branchData['160'] = [];
  _$jscoverage['/util.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['162'] = [];
  _$jscoverage['/util.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['164'] = [];
  _$jscoverage['/util.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['167'] = [];
  _$jscoverage['/util.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['173'] = [];
  _$jscoverage['/util.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['174'] = [];
  _$jscoverage['/util.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['202'] = [];
  _$jscoverage['/util.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['203'] = [];
  _$jscoverage['/util.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['204'] = [];
  _$jscoverage['/util.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['215'] = [];
  _$jscoverage['/util.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['217'] = [];
  _$jscoverage['/util.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['221'] = [];
  _$jscoverage['/util.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['223'] = [];
  _$jscoverage['/util.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['225'] = [];
  _$jscoverage['/util.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['227'] = [];
  _$jscoverage['/util.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['257'] = [];
  _$jscoverage['/util.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/util.js'].branchData['260'] = [];
  _$jscoverage['/util.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['261'] = [];
  _$jscoverage['/util.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['269'] = [];
  _$jscoverage['/util.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['271'] = [];
  _$jscoverage['/util.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['284'] = [];
  _$jscoverage['/util.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['288'] = [];
  _$jscoverage['/util.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/util.js'].branchData['289'] = [];
  _$jscoverage['/util.js'].branchData['289'][1] = new BranchData();
}
_$jscoverage['/util.js'].branchData['289'][1].init(26, 19, 'S.isArray(ret[key])');
function visit258_289_1(result) {
  _$jscoverage['/util.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['288'][1].init(798, 10, 'key in ret');
function visit257_288_1(result) {
  _$jscoverage['/util.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['284'][1].init(448, 21, 'S.endsWith(key, \'[]\')');
function visit256_284_1(result) {
  _$jscoverage['/util.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['271'][1].init(71, 14, 'eqIndex === -1');
function visit255_271_1(result) {
  _$jscoverage['/util.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['269'][1].init(397, 7, 'i < len');
function visit254_269_1(result) {
  _$jscoverage['/util.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['261'][1].init(161, 8, 'eq || EQ');
function visit253_261_1(result) {
  _$jscoverage['/util.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['260'][1].init(131, 10, 'sep || SEP');
function visit252_260_1(result) {
  _$jscoverage['/util.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['257'][2].init(18, 23, 'typeof str !== \'string\'');
function visit251_257_2(result) {
  _$jscoverage['/util.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['257'][1].init(18, 47, 'typeof str !== \'string\' || !(str = S.trim(str))');
function visit250_257_1(result) {
  _$jscoverage['/util.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['227'][1].init(119, 15, 'v !== undefined');
function visit249_227_1(result) {
  _$jscoverage['/util.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['225'][1].init(67, 20, 'isValidParamValue(v)');
function visit248_225_1(result) {
  _$jscoverage['/util.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['223'][1].init(99, 7, 'i < len');
function visit247_223_1(result) {
  _$jscoverage['/util.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['221'][1].init(398, 28, 'S.isArray(val) && val.length');
function visit246_221_1(result) {
  _$jscoverage['/util.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['217'][1].init(62, 17, 'val !== undefined');
function visit245_217_1(result) {
  _$jscoverage['/util.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['215'][1].init(142, 22, 'isValidParamValue(val)');
function visit244_215_1(result) {
  _$jscoverage['/util.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['204'][1].init(77, 28, 'serializeArray === undefined');
function visit243_204_1(result) {
  _$jscoverage['/util.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['203'][1].init(50, 8, 'eq || EQ');
function visit242_203_1(result) {
  _$jscoverage['/util.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['202'][1].init(20, 10, 'sep || SEP');
function visit241_202_1(result) {
  _$jscoverage['/util.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['174'][1].init(30, 42, 'fn.call(context, val, i, object) === false');
function visit240_174_1(result) {
  _$jscoverage['/util.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['173'][1].init(47, 10, 'i < length');
function visit239_173_1(result) {
  _$jscoverage['/util.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['167'][1].init(125, 52, 'fn.call(context, object[key], key, object) === false');
function visit238_167_1(result) {
  _$jscoverage['/util.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['164'][1].init(73, 15, 'i < keys.length');
function visit237_164_1(result) {
  _$jscoverage['/util.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['162'][1].init(406, 5, 'isObj');
function visit236_162_1(result) {
  _$jscoverage['/util.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['160'][1].init(366, 15, 'context || null');
function visit235_160_1(result) {
  _$jscoverage['/util.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['158'][3].init(271, 45, 'toString.call(object) === \'[object Function]\'');
function visit234_158_3(result) {
  _$jscoverage['/util.js'].branchData['158'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['158'][2].init(247, 20, 'length === undefined');
function visit233_158_2(result) {
  _$jscoverage['/util.js'].branchData['158'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['158'][1].init(247, 69, 'length === undefined || toString.call(object) === \'[object Function]\'');
function visit232_158_1(result) {
  _$jscoverage['/util.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['156'][1].init(119, 23, 'object && object.length');
function visit231_156_1(result) {
  _$jscoverage['/util.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['151'][1].init(18, 6, 'object');
function visit230_151_1(result) {
  _$jscoverage['/util.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['134'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit229_134_1(result) {
  _$jscoverage['/util.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['132'][1].init(54, 6, 'i >= 0');
function visit228_132_1(result) {
  _$jscoverage['/util.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['131'][1].init(238, 10, 'hasEnumBug');
function visit227_131_1(result) {
  _$jscoverage['/util.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['126'][1].init(59, 19, 'o.hasOwnProperty(p)');
function visit226_126_1(result) {
  _$jscoverage['/util.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['121'][1].init(3064, 579, 'Object.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit225_121_1(result) {
  _$jscoverage['/util.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['113'][1].init(25, 11, 'str == null');
function visit224_113_1(result) {
  _$jscoverage['/util.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['110'][1].init(25, 11, 'str == null');
function visit223_110_1(result) {
  _$jscoverage['/util.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['100'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit222_100_3(result) {
  _$jscoverage['/util.js'].branchData['100'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['100'][2].init(72, 8, 'ind >= 0');
function visit221_100_2(result) {
  _$jscoverage['/util.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['100'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit220_100_1(result) {
  _$jscoverage['/util.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['88'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit219_88_1(result) {
  _$jscoverage['/util.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['56'][1].init(21, 39, 'toString.call(obj) === \'[object Array]\'');
function visit218_56_1(result) {
  _$jscoverage['/util.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['51'][1].init(740, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit217_51_1(result) {
  _$jscoverage['/util.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['35'][1].init(22, 15, 'p !== undefined');
function visit216_35_1(result) {
  _$jscoverage['/util.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['25'][5].init(169, 16, 't !== \'function\'');
function visit215_25_5(result) {
  _$jscoverage['/util.js'].branchData['25'][5].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['25'][4].init(151, 14, 't !== \'object\'');
function visit214_25_4(result) {
  _$jscoverage['/util.js'].branchData['25'][4].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['25'][3].init(151, 34, 't !== \'object\' && t !== \'function\'');
function visit213_25_3(result) {
  _$jscoverage['/util.js'].branchData['25'][3].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['25'][2].init(135, 11, 'val == null');
function visit212_25_2(result) {
  _$jscoverage['/util.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].branchData['25'][1].init(135, 51, 'val == null || (t !== \'object\' && t !== \'function\')');
function visit211_25_1(result) {
  _$jscoverage['/util.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/util.js'].lineData[1]++;
(function(S) {
  _$jscoverage['/util.js'].functionData[0]++;
  _$jscoverage['/util.js'].lineData[2]++;
  var logger = S.getLogger('s/lang');
  _$jscoverage['/util.js'].lineData[3]++;
  var SEP = '&', EMPTY = '', EQ = '=', toString = ({}).toString, TRUE = true;
  _$jscoverage['/util.js'].lineData[8]++;
  var RE_TRIM = /^[\s\xa0]+|[\s\xa0]+$/g, trim = String.prototype.trim;
  _$jscoverage['/util.js'].lineData[11]++;
  var hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/util.js'].lineData[22]++;
  function isValidParamValue(val) {
    _$jscoverage['/util.js'].functionData[1]++;
    _$jscoverage['/util.js'].lineData[23]++;
    var t = typeof val;
    _$jscoverage['/util.js'].lineData[25]++;
    return visit211_25_1(visit212_25_2(val == null) || (visit213_25_3(visit214_25_4(t !== 'object') && visit215_25_5(t !== 'function'))));
  }
  _$jscoverage['/util.js'].lineData[28]++;
  S.mix(S, {
  isEmptyObject: function(o) {
  _$jscoverage['/util.js'].functionData[2]++;
  _$jscoverage['/util.js'].lineData[34]++;
  for (var p in o) {
    _$jscoverage['/util.js'].lineData[35]++;
    if (visit216_35_1(p !== undefined)) {
      _$jscoverage['/util.js'].lineData[36]++;
      return false;
    }
  }
  _$jscoverage['/util.js'].lineData[39]++;
  return true;
}, 
  now: visit217_51_1(Date.now || function() {
  _$jscoverage['/util.js'].functionData[3]++;
  _$jscoverage['/util.js'].lineData[52]++;
  return +new Date();
}), 
  isArray: function(obj) {
  _$jscoverage['/util.js'].functionData[4]++;
  _$jscoverage['/util.js'].lineData[56]++;
  return visit218_56_1(toString.call(obj) === '[object Array]');
}, 
  urlEncode: function(s) {
  _$jscoverage['/util.js'].functionData[5]++;
  _$jscoverage['/util.js'].lineData[66]++;
  return encodeURIComponent(String(s));
}, 
  urlDecode: function(s) {
  _$jscoverage['/util.js'].functionData[6]++;
  _$jscoverage['/util.js'].lineData[77]++;
  return decodeURIComponent(s.replace(/\+/g, ' '));
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/util.js'].functionData[7]++;
  _$jscoverage['/util.js'].lineData[88]++;
  return visit219_88_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/util.js'].functionData[8]++;
  _$jscoverage['/util.js'].lineData[99]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/util.js'].lineData[100]++;
  return visit220_100_1(visit221_100_2(ind >= 0) && visit222_100_3(str.indexOf(suffix, ind) === ind));
}, 
  trim: trim ? function(str) {
  _$jscoverage['/util.js'].functionData[9]++;
  _$jscoverage['/util.js'].lineData[110]++;
  return visit223_110_1(str == null) ? EMPTY : trim.call(str);
} : function(str) {
  _$jscoverage['/util.js'].functionData[10]++;
  _$jscoverage['/util.js'].lineData[113]++;
  return visit224_113_1(str == null) ? EMPTY : (str + '').replace(RE_TRIM, EMPTY);
}, 
  keys: visit225_121_1(Object.keys || function(o) {
  _$jscoverage['/util.js'].functionData[11]++;
  _$jscoverage['/util.js'].lineData[122]++;
  var result = [], p, i;
  _$jscoverage['/util.js'].lineData[124]++;
  for (p in o) {
    _$jscoverage['/util.js'].lineData[126]++;
    if (visit226_126_1(o.hasOwnProperty(p))) {
      _$jscoverage['/util.js'].lineData[127]++;
      result.push(p);
    }
  }
  _$jscoverage['/util.js'].lineData[131]++;
  if (visit227_131_1(hasEnumBug)) {
    _$jscoverage['/util.js'].lineData[132]++;
    for (i = enumProperties.length - 1; visit228_132_1(i >= 0); i--) {
      _$jscoverage['/util.js'].lineData[133]++;
      p = enumProperties[i];
      _$jscoverage['/util.js'].lineData[134]++;
      if (visit229_134_1(o.hasOwnProperty(p))) {
        _$jscoverage['/util.js'].lineData[135]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/util.js'].lineData[140]++;
  return result;
}), 
  each: function(object, fn, context) {
  _$jscoverage['/util.js'].functionData[12]++;
  _$jscoverage['/util.js'].lineData[151]++;
  if (visit230_151_1(object)) {
    _$jscoverage['/util.js'].lineData[152]++;
    var key, val, keys, i = 0, length = visit231_156_1(object && object.length), isObj = visit232_158_1(visit233_158_2(length === undefined) || visit234_158_3(toString.call(object) === '[object Function]'));
    _$jscoverage['/util.js'].lineData[160]++;
    context = visit235_160_1(context || null);
    _$jscoverage['/util.js'].lineData[162]++;
    if (visit236_162_1(isObj)) {
      _$jscoverage['/util.js'].lineData[163]++;
      keys = S.keys(object);
      _$jscoverage['/util.js'].lineData[164]++;
      for (; visit237_164_1(i < keys.length); i++) {
        _$jscoverage['/util.js'].lineData[165]++;
        key = keys[i];
        _$jscoverage['/util.js'].lineData[167]++;
        if (visit238_167_1(fn.call(context, object[key], key, object) === false)) {
          _$jscoverage['/util.js'].lineData[168]++;
          break;
        }
      }
    } else {
      _$jscoverage['/util.js'].lineData[172]++;
      for (val = object[0]; visit239_173_1(i < length); val = object[++i]) {
        _$jscoverage['/util.js'].lineData[174]++;
        if (visit240_174_1(fn.call(context, val, i, object) === false)) {
          _$jscoverage['/util.js'].lineData[175]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/util.js'].lineData[180]++;
  return object;
}, 
  param: function(o, sep, eq, serializeArray) {
  _$jscoverage['/util.js'].functionData[13]++;
  _$jscoverage['/util.js'].lineData[202]++;
  sep = visit241_202_1(sep || SEP);
  _$jscoverage['/util.js'].lineData[203]++;
  eq = visit242_203_1(eq || EQ);
  _$jscoverage['/util.js'].lineData[204]++;
  if (visit243_204_1(serializeArray === undefined)) {
    _$jscoverage['/util.js'].lineData[205]++;
    serializeArray = TRUE;
  }
  _$jscoverage['/util.js'].lineData[207]++;
  var buf = [], key, i, v, len, val, encode = S.urlEncode;
  _$jscoverage['/util.js'].lineData[209]++;
  for (key in o) {
    _$jscoverage['/util.js'].lineData[211]++;
    val = o[key];
    _$jscoverage['/util.js'].lineData[212]++;
    key = encode(key);
    _$jscoverage['/util.js'].lineData[215]++;
    if (visit244_215_1(isValidParamValue(val))) {
      _$jscoverage['/util.js'].lineData[216]++;
      buf.push(key);
      _$jscoverage['/util.js'].lineData[217]++;
      if (visit245_217_1(val !== undefined)) {
        _$jscoverage['/util.js'].lineData[218]++;
        buf.push(eq, encode(val + EMPTY));
      }
      _$jscoverage['/util.js'].lineData[220]++;
      buf.push(sep);
    } else {
      _$jscoverage['/util.js'].lineData[221]++;
      if (visit246_221_1(S.isArray(val) && val.length)) {
        _$jscoverage['/util.js'].lineData[223]++;
        for (i = 0 , len = val.length; visit247_223_1(i < len); ++i) {
          _$jscoverage['/util.js'].lineData[224]++;
          v = val[i];
          _$jscoverage['/util.js'].lineData[225]++;
          if (visit248_225_1(isValidParamValue(v))) {
            _$jscoverage['/util.js'].lineData[226]++;
            buf.push(key, (serializeArray ? encode('[]') : EMPTY));
            _$jscoverage['/util.js'].lineData[227]++;
            if (visit249_227_1(v !== undefined)) {
              _$jscoverage['/util.js'].lineData[228]++;
              buf.push(eq, encode(v + EMPTY));
            }
            _$jscoverage['/util.js'].lineData[230]++;
            buf.push(sep);
          }
        }
      }
    }
  }
  _$jscoverage['/util.js'].lineData[237]++;
  buf.pop();
  _$jscoverage['/util.js'].lineData[238]++;
  return buf.join(EMPTY);
}, 
  unparam: function(str, sep, eq) {
  _$jscoverage['/util.js'].functionData[14]++;
  _$jscoverage['/util.js'].lineData[257]++;
  if (visit250_257_1(visit251_257_2(typeof str !== 'string') || !(str = S.trim(str)))) {
    _$jscoverage['/util.js'].lineData[258]++;
    return {};
  }
  _$jscoverage['/util.js'].lineData[260]++;
  sep = visit252_260_1(sep || SEP);
  _$jscoverage['/util.js'].lineData[261]++;
  eq = visit253_261_1(eq || EQ);
  _$jscoverage['/util.js'].lineData[262]++;
  var ret = {}, eqIndex, decode = S.urlDecode, pairs = str.split(sep), key, val, i = 0, len = pairs.length;
  _$jscoverage['/util.js'].lineData[269]++;
  for (; visit254_269_1(i < len); ++i) {
    _$jscoverage['/util.js'].lineData[270]++;
    eqIndex = pairs[i].indexOf(eq);
    _$jscoverage['/util.js'].lineData[271]++;
    if (visit255_271_1(eqIndex === -1)) {
      _$jscoverage['/util.js'].lineData[272]++;
      key = decode(pairs[i]);
      _$jscoverage['/util.js'].lineData[273]++;
      val = undefined;
    } else {
      _$jscoverage['/util.js'].lineData[276]++;
      key = decode(pairs[i].substring(0, eqIndex));
      _$jscoverage['/util.js'].lineData[277]++;
      val = pairs[i].substring(eqIndex + 1);
      _$jscoverage['/util.js'].lineData[278]++;
      try {
        _$jscoverage['/util.js'].lineData[279]++;
        val = decode(val);
      }      catch (e) {
  _$jscoverage['/util.js'].lineData[281]++;
  logger.error('decodeURIComponent error : ' + val);
  _$jscoverage['/util.js'].lineData[282]++;
  logger.error(e);
}
      _$jscoverage['/util.js'].lineData[284]++;
      if (visit256_284_1(S.endsWith(key, '[]'))) {
        _$jscoverage['/util.js'].lineData[285]++;
        key = key.substring(0, key.length - 2);
      }
    }
    _$jscoverage['/util.js'].lineData[288]++;
    if (visit257_288_1(key in ret)) {
      _$jscoverage['/util.js'].lineData[289]++;
      if (visit258_289_1(S.isArray(ret[key]))) {
        _$jscoverage['/util.js'].lineData[290]++;
        ret[key].push(val);
      } else {
        _$jscoverage['/util.js'].lineData[292]++;
        ret[key] = [ret[key], val];
      }
    } else {
      _$jscoverage['/util.js'].lineData[295]++;
      ret[key] = val;
    }
  }
  _$jscoverage['/util.js'].lineData[298]++;
  return ret;
}});
})(KISSY);
