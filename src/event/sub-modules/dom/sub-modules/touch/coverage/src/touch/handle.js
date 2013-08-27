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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[16] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[18] = 0;
  _$jscoverage['/touch/handle.js'].lineData[19] = 0;
  _$jscoverage['/touch/handle.js'].lineData[20] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[23] = 0;
  _$jscoverage['/touch/handle.js'].lineData[24] = 0;
  _$jscoverage['/touch/handle.js'].lineData[25] = 0;
  _$jscoverage['/touch/handle.js'].lineData[27] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[29] = 0;
  _$jscoverage['/touch/handle.js'].lineData[32] = 0;
  _$jscoverage['/touch/handle.js'].lineData[33] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[35] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[60] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[62] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[65] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[71] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[73] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[76] = 0;
  _$jscoverage['/touch/handle.js'].lineData[81] = 0;
  _$jscoverage['/touch/handle.js'].lineData[85] = 0;
  _$jscoverage['/touch/handle.js'].lineData[86] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[95] = 0;
  _$jscoverage['/touch/handle.js'].lineData[96] = 0;
  _$jscoverage['/touch/handle.js'].lineData[99] = 0;
  _$jscoverage['/touch/handle.js'].lineData[100] = 0;
  _$jscoverage['/touch/handle.js'].lineData[101] = 0;
  _$jscoverage['/touch/handle.js'].lineData[102] = 0;
  _$jscoverage['/touch/handle.js'].lineData[104] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[110] = 0;
  _$jscoverage['/touch/handle.js'].lineData[111] = 0;
  _$jscoverage['/touch/handle.js'].lineData[112] = 0;
  _$jscoverage['/touch/handle.js'].lineData[113] = 0;
  _$jscoverage['/touch/handle.js'].lineData[117] = 0;
  _$jscoverage['/touch/handle.js'].lineData[120] = 0;
  _$jscoverage['/touch/handle.js'].lineData[121] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[125] = 0;
  _$jscoverage['/touch/handle.js'].lineData[126] = 0;
  _$jscoverage['/touch/handle.js'].lineData[128] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[136] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[139] = 0;
  _$jscoverage['/touch/handle.js'].lineData[140] = 0;
  _$jscoverage['/touch/handle.js'].lineData[141] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[145] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[153] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[158] = 0;
  _$jscoverage['/touch/handle.js'].lineData[159] = 0;
  _$jscoverage['/touch/handle.js'].lineData[161] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[169] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[173] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[176] = 0;
  _$jscoverage['/touch/handle.js'].lineData[177] = 0;
  _$jscoverage['/touch/handle.js'].lineData[178] = 0;
  _$jscoverage['/touch/handle.js'].lineData[180] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[188] = 0;
  _$jscoverage['/touch/handle.js'].lineData[189] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[196] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[204] = 0;
  _$jscoverage['/touch/handle.js'].lineData[205] = 0;
  _$jscoverage['/touch/handle.js'].lineData[206] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[215] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[218] = 0;
  _$jscoverage['/touch/handle.js'].lineData[226] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[229] = 0;
  _$jscoverage['/touch/handle.js'].lineData[230] = 0;
  _$jscoverage['/touch/handle.js'].lineData[236] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[240] = 0;
  _$jscoverage['/touch/handle.js'].lineData[241] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[250] = 0;
  _$jscoverage['/touch/handle.js'].lineData[251] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[259] = 0;
  _$jscoverage['/touch/handle.js'].lineData[261] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['16'] = [];
  _$jscoverage['/touch/handle.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['21'] = [];
  _$jscoverage['/touch/handle.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['35'] = [];
  _$jscoverage['/touch/handle.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['61'] = [];
  _$jscoverage['/touch/handle.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['72'] = [];
  _$jscoverage['/touch/handle.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['95'] = [];
  _$jscoverage['/touch/handle.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['96'] = [];
  _$jscoverage['/touch/handle.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['96'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['99'] = [];
  _$jscoverage['/touch/handle.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['120'] = [];
  _$jscoverage['/touch/handle.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['123'] = [];
  _$jscoverage['/touch/handle.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['126'] = [];
  _$jscoverage['/touch/handle.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['139'] = [];
  _$jscoverage['/touch/handle.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['141'] = [];
  _$jscoverage['/touch/handle.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['153'] = [];
  _$jscoverage['/touch/handle.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['155'] = [];
  _$jscoverage['/touch/handle.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['158'] = [];
  _$jscoverage['/touch/handle.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['173'] = [];
  _$jscoverage['/touch/handle.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['177'] = [];
  _$jscoverage['/touch/handle.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['189'] = [];
  _$jscoverage['/touch/handle.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['193'] = [];
  _$jscoverage['/touch/handle.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'] = [];
  _$jscoverage['/touch/handle.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['215'] = [];
  _$jscoverage['/touch/handle.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['227'] = [];
  _$jscoverage['/touch/handle.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['229'] = [];
  _$jscoverage['/touch/handle.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['250'] = [];
  _$jscoverage['/touch/handle.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['253'] = [];
  _$jscoverage['/touch/handle.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['261'] = [];
  _$jscoverage['/touch/handle.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['262'] = [];
  _$jscoverage['/touch/handle.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'] = [];
  _$jscoverage['/touch/handle.js'].branchData['265'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['265'][1].init(125, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit38_265_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['262'][1].init(22, 5, 'event');
function visit37_262_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['261'][1].init(108, 6, 'handle');
function visit36_261_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['253'][1].init(223, 5, 'event');
function visit35_253_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['250'][1].init(108, 7, '!handle');
function visit34_250_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['229'][1].init(67, 25, '!eventHandle[event].count');
function visit33_229_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['227'][1].init(67, 18, 'eventHandle[event]');
function visit32_227_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['215'][1].init(153, 18, 'eventHandle[event]');
function visit31_215_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][3].init(343, 26, 'h[method](event) === false');
function visit30_198_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][2].init(330, 39, 'h[method] && h[method](event) === false');
function visit29_198_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][1].init(316, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit28_198_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['193'][1].init(140, 11, 'h.processed');
function visit27_193_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['189'][1].init(164, 5, 'event');
function visit26_189_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['177'][1].init(407, 20, 'isMsPointerSupported');
function visit25_177_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['173'][1].init(206, 16, 'isTouchSupported');
function visit24_173_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['158'][1].init(140, 20, 'isMsPointerSupported');
function visit23_158_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['155'][1].init(55, 12, 'self.inTouch');
function visit22_155_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['153'][1].init(48, 17, '!(\'touches\' in e)');
function visit21_153_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['141'][1].init(947, 20, 'isMsPointerSupported');
function visit20_141_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['139'][1].init(840, 18, '\'touches\' in event');
function visit19_139_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['126'][1].init(133, 21, '!isMsPointerSupported');
function visit18_126_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['123'][1].init(22, 12, 'self.inTouch');
function visit17_123_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['120'][1].init(120, 18, '\'touches\' in event');
function visit16_120_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['99'][1].init(171, 21, 'touchList.length == 1');
function visit15_99_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['96'][3].init(53, 21, 'type == \'touchcancel\'');
function visit14_96_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['96'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['96'][2].init(31, 18, 'type == \'touchend\'');
function visit13_96_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['96'][1].init(31, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit12_96_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['95'][1].init(102, 27, 'S.startsWith(type, \'touch\')');
function visit11_95_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['72'][1].init(22, 27, 'tt.pointerId == t.pointerId');
function visit10_72_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['61'][1].init(22, 27, 'tt.pointerId == t.pointerId');
function visit9_61_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['35'][1].init(914, 11, 'cancelEvent');
function visit8_35_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['21'][1].init(470, 20, 'isMsPointerSupported');
function visit7_21_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['16'][1].init(257, 32, 'Features.isTouchEventSupported()');
function visit6_16_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add('event/dom/touch/handle', function(S, Dom, eventHandleMap, DomEvent) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var key = S.guid('touch-handle'), Features = S.Features, isMsPointerSupported = Features.isMsPointerSupported(), touchEvents = {}, startEvent, moveEvent, cancelEvent, endEvent;
  _$jscoverage['/touch/handle.js'].lineData[16]++;
  if (visit6_16_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[17]++;
    startEvent = 'touchstart mousedown';
    _$jscoverage['/touch/handle.js'].lineData[18]++;
    endEvent = 'touchend';
    _$jscoverage['/touch/handle.js'].lineData[19]++;
    moveEvent = 'touchmove mousemove';
    _$jscoverage['/touch/handle.js'].lineData[20]++;
    cancelEvent = 'touchcancel';
  } else {
    _$jscoverage['/touch/handle.js'].lineData[21]++;
    if (visit7_21_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[22]++;
      startEvent = 'MSPointerDown';
      _$jscoverage['/touch/handle.js'].lineData[23]++;
      moveEvent = 'MSPointerMove';
      _$jscoverage['/touch/handle.js'].lineData[24]++;
      endEvent = 'MSPointerUp';
      _$jscoverage['/touch/handle.js'].lineData[25]++;
      cancelEvent = 'MSPointerCancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[27]++;
      startEvent = 'mousedown';
      _$jscoverage['/touch/handle.js'].lineData[28]++;
      moveEvent = 'mousemove';
      _$jscoverage['/touch/handle.js'].lineData[29]++;
      endEvent = 'mouseup';
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[32]++;
  touchEvents[startEvent] = 'onTouchStart';
  _$jscoverage['/touch/handle.js'].lineData[33]++;
  touchEvents[moveEvent] = 'onTouchMove';
  _$jscoverage['/touch/handle.js'].lineData[34]++;
  touchEvents[endEvent] = 'onTouchEnd';
  _$jscoverage['/touch/handle.js'].lineData[35]++;
  if (visit8_35_1(cancelEvent)) {
    _$jscoverage['/touch/handle.js'].lineData[36]++;
    touchEvents[cancelEvent] = 'onTouchEnd';
  }
  _$jscoverage['/touch/handle.js'].lineData[39]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[40]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[41]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[42]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[43]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[45]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[47]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[50]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  addTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[2]++;
  _$jscoverage['/touch/handle.js'].lineData[54]++;
  t.identifier = t.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[55]++;
  this.touches.push(t);
}, 
  removeTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[3]++;
  _$jscoverage['/touch/handle.js'].lineData[59]++;
  var touches = this.touches;
  _$jscoverage['/touch/handle.js'].lineData[60]++;
  S.each(touches, function(tt, index) {
  _$jscoverage['/touch/handle.js'].functionData[4]++;
  _$jscoverage['/touch/handle.js'].lineData[61]++;
  if (visit9_61_1(tt.pointerId == t.pointerId)) {
    _$jscoverage['/touch/handle.js'].lineData[62]++;
    touches.splice(index, 1);
    _$jscoverage['/touch/handle.js'].lineData[63]++;
    return false;
  }
  _$jscoverage['/touch/handle.js'].lineData[65]++;
  return undefined;
});
}, 
  updateTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[70]++;
  var touches = this.touches;
  _$jscoverage['/touch/handle.js'].lineData[71]++;
  S.each(touches, function(tt, index) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[72]++;
  if (visit10_72_1(tt.pointerId == t.pointerId)) {
    _$jscoverage['/touch/handle.js'].lineData[73]++;
    touches[index] = t;
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    return false;
  }
  _$jscoverage['/touch/handle.js'].lineData[76]++;
  return undefined;
});
}, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[81]++;
  var self = this, doc = self.doc, e, h;
  _$jscoverage['/touch/handle.js'].lineData[85]++;
  for (e in touchEvents) {
    _$jscoverage['/touch/handle.js'].lineData[86]++;
    h = touchEvents[e];
    _$jscoverage['/touch/handle.js'].lineData[87]++;
    DomEvent.on(doc, e, self[h], self);
  }
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[92]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[95]++;
  if (visit11_95_1(S.startsWith(type, 'touch'))) {
    _$jscoverage['/touch/handle.js'].lineData[96]++;
    touchList = (visit12_96_1(visit13_96_2(type == 'touchend') || visit14_96_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[99]++;
    if (visit15_99_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[100]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[101]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[102]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[104]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[107]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[109]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[110]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[111]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[112]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[113]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[117]++;
  var e, h, self = this, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[120]++;
  if (visit16_120_1('touches' in event)) {
    _$jscoverage['/touch/handle.js'].lineData[121]++;
    self.inTouch = event.touches.length;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[123]++;
    if (visit17_123_1(self.inTouch)) {
      _$jscoverage['/touch/handle.js'].lineData[125]++;
      return;
    } else {
      _$jscoverage['/touch/handle.js'].lineData[126]++;
      if (visit18_126_1(!isMsPointerSupported)) {
        _$jscoverage['/touch/handle.js'].lineData[128]++;
        DomEvent.on(self.doc, 'mouseup', {
  fn: self.onTouchEnd, 
  context: self, 
  once: true});
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[135]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[136]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[137]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[139]++;
  if (visit19_139_1('touches' in event)) {
    _$jscoverage['/touch/handle.js'].lineData[140]++;
    self.touches = S.makeArray(event.touches);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[141]++;
    if (visit20_141_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[142]++;
      self.addTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[145]++;
      self.touches = [event.originalEvent];
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[152]++;
  var self = this;
  _$jscoverage['/touch/handle.js'].lineData[153]++;
  if (visit21_153_1(!('touches' in e))) {
    _$jscoverage['/touch/handle.js'].lineData[155]++;
    if (visit22_155_1(self.inTouch)) {
      _$jscoverage['/touch/handle.js'].lineData[156]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[158]++;
    if (visit23_158_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[159]++;
      self.updateTouch(e.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[161]++;
      self.touches = [e.originalEvent];
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[165]++;
  self.callEventHandle('onTouchMove', e);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[169]++;
  var self = this, isTouchSupported = 'touches' in event;
  _$jscoverage['/touch/handle.js'].lineData[172]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[173]++;
  if (visit24_173_1(isTouchSupported)) {
    _$jscoverage['/touch/handle.js'].lineData[174]++;
    self.touches = S.makeArray(event.touches);
    _$jscoverage['/touch/handle.js'].lineData[176]++;
    self.inTouch = self.touches.length;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[177]++;
    if (visit25_177_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[178]++;
      self.removeTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[180]++;
      self.touches = [];
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[185]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[188]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[189]++;
  if (visit26_189_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[190]++;
    for (e in eventHandle) {
      _$jscoverage['/touch/handle.js'].lineData[192]++;
      h = eventHandle[e].handle;
      _$jscoverage['/touch/handle.js'].lineData[193]++;
      if (visit27_193_1(h.processed)) {
        _$jscoverage['/touch/handle.js'].lineData[194]++;
        continue;
      }
      _$jscoverage['/touch/handle.js'].lineData[196]++;
      h.processed = 1;
      _$jscoverage['/touch/handle.js'].lineData[198]++;
      if (visit28_198_1(h.isActive && visit29_198_2(h[method] && visit30_198_3(h[method](event) === false)))) {
        _$jscoverage['/touch/handle.js'].lineData[199]++;
        h.isActive = 0;
      }
    }
    _$jscoverage['/touch/handle.js'].lineData[204]++;
    for (e in eventHandle) {
      _$jscoverage['/touch/handle.js'].lineData[205]++;
      h = eventHandle[e].handle;
      _$jscoverage['/touch/handle.js'].lineData[206]++;
      h.processed = 0;
    }
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[212]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[215]++;
  if (visit31_215_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[216]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[218]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[226]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[227]++;
  if (visit32_227_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[228]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[229]++;
    if (visit33_229_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[230]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[236]++;
  var self = this, doc = self.doc, e, h;
  _$jscoverage['/touch/handle.js'].lineData[239]++;
  for (e in touchEvents) {
    _$jscoverage['/touch/handle.js'].lineData[240]++;
    h = touchEvents[e];
    _$jscoverage['/touch/handle.js'].lineData[241]++;
    DomEvent.detach(doc, e, self[h], self);
  }
}};
  _$jscoverage['/touch/handle.js'].lineData[246]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[248]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[250]++;
  if (visit34_250_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[251]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[253]++;
  if (visit35_253_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[254]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[259]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[261]++;
  if (visit36_261_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[262]++;
    if (visit37_262_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[263]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[265]++;
    if (visit38_265_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[266]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[267]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
