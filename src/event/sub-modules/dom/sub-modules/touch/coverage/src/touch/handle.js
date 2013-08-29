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
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[18] = 0;
  _$jscoverage['/touch/handle.js'].lineData[19] = 0;
  _$jscoverage['/touch/handle.js'].lineData[21] = 0;
  _$jscoverage['/touch/handle.js'].lineData[22] = 0;
  _$jscoverage['/touch/handle.js'].lineData[23] = 0;
  _$jscoverage['/touch/handle.js'].lineData[25] = 0;
  _$jscoverage['/touch/handle.js'].lineData[26] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[29] = 0;
  _$jscoverage['/touch/handle.js'].lineData[30] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[32] = 0;
  _$jscoverage['/touch/handle.js'].lineData[34] = 0;
  _$jscoverage['/touch/handle.js'].lineData[35] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[39] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[42] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[46] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[48] = 0;
  _$jscoverage['/touch/handle.js'].lineData[49] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[52] = 0;
  _$jscoverage['/touch/handle.js'].lineData[54] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[62] = 0;
  _$jscoverage['/touch/handle.js'].lineData[66] = 0;
  _$jscoverage['/touch/handle.js'].lineData[67] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[69] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[77] = 0;
  _$jscoverage['/touch/handle.js'].lineData[78] = 0;
  _$jscoverage['/touch/handle.js'].lineData[79] = 0;
  _$jscoverage['/touch/handle.js'].lineData[80] = 0;
  _$jscoverage['/touch/handle.js'].lineData[81] = 0;
  _$jscoverage['/touch/handle.js'].lineData[83] = 0;
  _$jscoverage['/touch/handle.js'].lineData[88] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[93] = 0;
  _$jscoverage['/touch/handle.js'].lineData[94] = 0;
  _$jscoverage['/touch/handle.js'].lineData[99] = 0;
  _$jscoverage['/touch/handle.js'].lineData[102] = 0;
  _$jscoverage['/touch/handle.js'].lineData[103] = 0;
  _$jscoverage['/touch/handle.js'].lineData[106] = 0;
  _$jscoverage['/touch/handle.js'].lineData[107] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[111] = 0;
  _$jscoverage['/touch/handle.js'].lineData[114] = 0;
  _$jscoverage['/touch/handle.js'].lineData[116] = 0;
  _$jscoverage['/touch/handle.js'].lineData[117] = 0;
  _$jscoverage['/touch/handle.js'].lineData[118] = 0;
  _$jscoverage['/touch/handle.js'].lineData[119] = 0;
  _$jscoverage['/touch/handle.js'].lineData[120] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[127] = 0;
  _$jscoverage['/touch/handle.js'].lineData[128] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[134] = 0;
  _$jscoverage['/touch/handle.js'].lineData[135] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[144] = 0;
  _$jscoverage['/touch/handle.js'].lineData[145] = 0;
  _$jscoverage['/touch/handle.js'].lineData[146] = 0;
  _$jscoverage['/touch/handle.js'].lineData[148] = 0;
  _$jscoverage['/touch/handle.js'].lineData[149] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[151] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[161] = 0;
  _$jscoverage['/touch/handle.js'].lineData[162] = 0;
  _$jscoverage['/touch/handle.js'].lineData[164] = 0;
  _$jscoverage['/touch/handle.js'].lineData[165] = 0;
  _$jscoverage['/touch/handle.js'].lineData[167] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[170] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[178] = 0;
  _$jscoverage['/touch/handle.js'].lineData[181] = 0;
  _$jscoverage['/touch/handle.js'].lineData[182] = 0;
  _$jscoverage['/touch/handle.js'].lineData[183] = 0;
  _$jscoverage['/touch/handle.js'].lineData[185] = 0;
  _$jscoverage['/touch/handle.js'].lineData[186] = 0;
  _$jscoverage['/touch/handle.js'].lineData[187] = 0;
  _$jscoverage['/touch/handle.js'].lineData[189] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[197] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[199] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[202] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[205] = 0;
  _$jscoverage['/touch/handle.js'].lineData[207] = 0;
  _$jscoverage['/touch/handle.js'].lineData[208] = 0;
  _$jscoverage['/touch/handle.js'].lineData[213] = 0;
  _$jscoverage['/touch/handle.js'].lineData[214] = 0;
  _$jscoverage['/touch/handle.js'].lineData[215] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[224] = 0;
  _$jscoverage['/touch/handle.js'].lineData[225] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[235] = 0;
  _$jscoverage['/touch/handle.js'].lineData[236] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[245] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[249] = 0;
  _$jscoverage['/touch/handle.js'].lineData[250] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[257] = 0;
  _$jscoverage['/touch/handle.js'].lineData[259] = 0;
  _$jscoverage['/touch/handle.js'].lineData[260] = 0;
  _$jscoverage['/touch/handle.js'].lineData[262] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[268] = 0;
  _$jscoverage['/touch/handle.js'].lineData[270] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[272] = 0;
  _$jscoverage['/touch/handle.js'].lineData[274] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[276] = 0;
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
  _$jscoverage['/touch/handle.js'].branchData['17'] = [];
  _$jscoverage['/touch/handle.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['21'] = [];
  _$jscoverage['/touch/handle.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['28'] = [];
  _$jscoverage['/touch/handle.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['42'] = [];
  _$jscoverage['/touch/handle.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['68'] = [];
  _$jscoverage['/touch/handle.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['79'] = [];
  _$jscoverage['/touch/handle.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['102'] = [];
  _$jscoverage['/touch/handle.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['103'] = [];
  _$jscoverage['/touch/handle.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['103'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['106'] = [];
  _$jscoverage['/touch/handle.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['127'] = [];
  _$jscoverage['/touch/handle.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['132'] = [];
  _$jscoverage['/touch/handle.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['135'] = [];
  _$jscoverage['/touch/handle.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['148'] = [];
  _$jscoverage['/touch/handle.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['150'] = [];
  _$jscoverage['/touch/handle.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['162'] = [];
  _$jscoverage['/touch/handle.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['164'] = [];
  _$jscoverage['/touch/handle.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['167'] = [];
  _$jscoverage['/touch/handle.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['182'] = [];
  _$jscoverage['/touch/handle.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['186'] = [];
  _$jscoverage['/touch/handle.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['198'] = [];
  _$jscoverage['/touch/handle.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['202'] = [];
  _$jscoverage['/touch/handle.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['207'] = [];
  _$jscoverage['/touch/handle.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['207'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['224'] = [];
  _$jscoverage['/touch/handle.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['236'] = [];
  _$jscoverage['/touch/handle.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['238'] = [];
  _$jscoverage['/touch/handle.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['259'] = [];
  _$jscoverage['/touch/handle.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['262'] = [];
  _$jscoverage['/touch/handle.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['270'] = [];
  _$jscoverage['/touch/handle.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['271'] = [];
  _$jscoverage['/touch/handle.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['274'] = [];
  _$jscoverage['/touch/handle.js'].branchData['274'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['274'][1].init(125, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit39_274_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['271'][1].init(22, 5, 'event');
function visit38_271_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['270'][1].init(108, 6, 'handle');
function visit37_270_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['262'][1].init(223, 5, 'event');
function visit36_262_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['259'][1].init(108, 7, '!handle');
function visit35_259_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['238'][1].init(67, 25, '!eventHandle[event].count');
function visit34_238_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['236'][1].init(67, 18, 'eventHandle[event]');
function visit33_236_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['224'][1].init(153, 18, 'eventHandle[event]');
function visit32_224_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['207'][3].init(343, 26, 'h[method](event) === false');
function visit31_207_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['207'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['207'][2].init(330, 39, 'h[method] && h[method](event) === false');
function visit30_207_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['207'][1].init(316, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit29_207_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['202'][1].init(140, 11, 'h.processed');
function visit28_202_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['198'][1].init(164, 5, 'event');
function visit27_198_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['186'][1].init(407, 20, 'isMsPointerSupported');
function visit26_186_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['182'][1].init(206, 16, 'isTouchSupported');
function visit25_182_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['167'][1].init(140, 20, 'isMsPointerSupported');
function visit24_167_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['164'][1].init(55, 12, 'self.inTouch');
function visit23_164_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['162'][1].init(48, 17, '!(\'touches\' in e)');
function visit22_162_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['150'][1].init(1048, 20, 'isMsPointerSupported');
function visit21_150_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['148'][1].init(941, 18, '\'touches\' in event');
function visit20_148_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['135'][1].init(133, 21, '!isMsPointerSupported');
function visit19_135_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['132'][1].init(22, 12, 'self.inTouch');
function visit18_132_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['127'][1].init(120, 18, '\'touches\' in event');
function visit17_127_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['106'][1].init(171, 21, 'touchList.length == 1');
function visit16_106_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['103'][3].init(53, 21, 'type == \'touchcancel\'');
function visit15_103_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['103'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['103'][2].init(31, 18, 'type == \'touchend\'');
function visit14_103_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['103'][1].init(31, 43, 'type == \'touchend\' || type == \'touchcancel\'');
function visit13_103_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['102'][1].init(102, 27, 'S.startsWith(type, \'touch\')');
function visit12_102_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['79'][1].init(22, 27, 'tt.pointerId == t.pointerId');
function visit11_79_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['68'][1].init(22, 27, 'tt.pointerId == t.pointerId');
function visit10_68_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['42'][1].init(1148, 11, 'cancelEvent');
function visit9_42_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['28'][1].init(704, 20, 'isMsPointerSupported');
function visit8_28_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['21'][1].init(142, 24, 'UA.chrome && !UA.android');
function visit7_21_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['17'][1].init(277, 32, 'Features.isTouchEventSupported()');
function visit6_17_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add('event/dom/touch/handle', function(S, Dom, eventHandleMap, DomEvent) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var key = S.guid('touch-handle'), Features = S.Features, UA = S.UA, isMsPointerSupported = Features.isMsPointerSupported(), touchEvents = {}, startEvent, moveEvent, cancelEvent, endEvent;
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  if (visit6_17_1(Features.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[18]++;
    endEvent = 'touchend';
    _$jscoverage['/touch/handle.js'].lineData[19]++;
    cancelEvent = 'touchcancel';
    _$jscoverage['/touch/handle.js'].lineData[21]++;
    if (visit7_21_1(UA.chrome && !UA.android)) {
      _$jscoverage['/touch/handle.js'].lineData[22]++;
      startEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[23]++;
      moveEvent = 'touchmove mousemove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[25]++;
      startEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[26]++;
      moveEvent = 'touchmove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[28]++;
    if (visit8_28_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[29]++;
      startEvent = 'MSPointerDown';
      _$jscoverage['/touch/handle.js'].lineData[30]++;
      moveEvent = 'MSPointerMove';
      _$jscoverage['/touch/handle.js'].lineData[31]++;
      endEvent = 'MSPointerUp';
      _$jscoverage['/touch/handle.js'].lineData[32]++;
      cancelEvent = 'MSPointerCancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[34]++;
      startEvent = 'mousedown';
      _$jscoverage['/touch/handle.js'].lineData[35]++;
      moveEvent = 'mousemove';
      _$jscoverage['/touch/handle.js'].lineData[36]++;
      endEvent = 'mouseup';
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[39]++;
  touchEvents[startEvent] = 'onTouchStart';
  _$jscoverage['/touch/handle.js'].lineData[40]++;
  touchEvents[moveEvent] = 'onTouchMove';
  _$jscoverage['/touch/handle.js'].lineData[41]++;
  touchEvents[endEvent] = 'onTouchEnd';
  _$jscoverage['/touch/handle.js'].lineData[42]++;
  if (visit9_42_1(cancelEvent)) {
    _$jscoverage['/touch/handle.js'].lineData[43]++;
    touchEvents[cancelEvent] = 'onTouchEnd';
  }
  _$jscoverage['/touch/handle.js'].lineData[46]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[47]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[48]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[49]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[50]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[52]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[54]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[57]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  addTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[2]++;
  _$jscoverage['/touch/handle.js'].lineData[61]++;
  t.identifier = t.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[62]++;
  this.touches.push(t);
}, 
  removeTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[3]++;
  _$jscoverage['/touch/handle.js'].lineData[66]++;
  var touches = this.touches;
  _$jscoverage['/touch/handle.js'].lineData[67]++;
  S.each(touches, function(tt, index) {
  _$jscoverage['/touch/handle.js'].functionData[4]++;
  _$jscoverage['/touch/handle.js'].lineData[68]++;
  if (visit10_68_1(tt.pointerId == t.pointerId)) {
    _$jscoverage['/touch/handle.js'].lineData[69]++;
    touches.splice(index, 1);
    _$jscoverage['/touch/handle.js'].lineData[70]++;
    return false;
  }
  _$jscoverage['/touch/handle.js'].lineData[72]++;
  return undefined;
});
}, 
  updateTouch: function(t) {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[77]++;
  var touches = this.touches;
  _$jscoverage['/touch/handle.js'].lineData[78]++;
  S.each(touches, function(tt, index) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[79]++;
  if (visit11_79_1(tt.pointerId == t.pointerId)) {
    _$jscoverage['/touch/handle.js'].lineData[80]++;
    touches[index] = t;
    _$jscoverage['/touch/handle.js'].lineData[81]++;
    return false;
  }
  _$jscoverage['/touch/handle.js'].lineData[83]++;
  return undefined;
});
}, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[88]++;
  var self = this, doc = self.doc, e, h;
  _$jscoverage['/touch/handle.js'].lineData[92]++;
  for (e in touchEvents) {
    _$jscoverage['/touch/handle.js'].lineData[93]++;
    h = touchEvents[e];
    _$jscoverage['/touch/handle.js'].lineData[94]++;
    DomEvent.on(doc, e, self[h], self);
  }
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[99]++;
  var type = e.type, notUp, touchList;
  _$jscoverage['/touch/handle.js'].lineData[102]++;
  if (visit12_102_1(S.startsWith(type, 'touch'))) {
    _$jscoverage['/touch/handle.js'].lineData[103]++;
    touchList = (visit13_103_1(visit14_103_2(type == 'touchend') || visit15_103_3(type == 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[106]++;
    if (visit16_106_1(touchList.length == 1)) {
      _$jscoverage['/touch/handle.js'].lineData[107]++;
      e.which = 1;
      _$jscoverage['/touch/handle.js'].lineData[108]++;
      e.pageX = touchList[0].pageX;
      _$jscoverage['/touch/handle.js'].lineData[109]++;
      e.pageY = touchList[0].pageY;
    }
    _$jscoverage['/touch/handle.js'].lineData[111]++;
    return e;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[114]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[116]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[117]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[118]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[119]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[120]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[124]++;
  var e, h, self = this, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[127]++;
  if (visit17_127_1('touches' in event)) {
    _$jscoverage['/touch/handle.js'].lineData[128]++;
    self.inTouch = event.touches.length;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[132]++;
    if (visit18_132_1(self.inTouch)) {
      _$jscoverage['/touch/handle.js'].lineData[134]++;
      return;
    } else {
      _$jscoverage['/touch/handle.js'].lineData[135]++;
      if (visit19_135_1(!isMsPointerSupported)) {
        _$jscoverage['/touch/handle.js'].lineData[137]++;
        DomEvent.on(self.doc, 'mouseup', {
  fn: self.onTouchEnd, 
  context: self, 
  once: true});
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[144]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[145]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[146]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[148]++;
  if (visit20_148_1('touches' in event)) {
    _$jscoverage['/touch/handle.js'].lineData[149]++;
    self.touches = S.makeArray(event.touches);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[150]++;
    if (visit21_150_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[151]++;
      self.addTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[154]++;
      self.touches = [event.originalEvent];
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[157]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[161]++;
  var self = this;
  _$jscoverage['/touch/handle.js'].lineData[162]++;
  if (visit22_162_1(!('touches' in e))) {
    _$jscoverage['/touch/handle.js'].lineData[164]++;
    if (visit23_164_1(self.inTouch)) {
      _$jscoverage['/touch/handle.js'].lineData[165]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[167]++;
    if (visit24_167_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[168]++;
      self.updateTouch(e.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[170]++;
      self.touches = [e.originalEvent];
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[174]++;
  self.callEventHandle('onTouchMove', e);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[178]++;
  var self = this, isTouchSupported = 'touches' in event;
  _$jscoverage['/touch/handle.js'].lineData[181]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[182]++;
  if (visit25_182_1(isTouchSupported)) {
    _$jscoverage['/touch/handle.js'].lineData[183]++;
    self.touches = S.makeArray(event.touches);
    _$jscoverage['/touch/handle.js'].lineData[185]++;
    self.inTouch = self.touches.length;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[186]++;
    if (visit26_186_1(isMsPointerSupported)) {
      _$jscoverage['/touch/handle.js'].lineData[187]++;
      self.removeTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[189]++;
      self.touches = [];
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[194]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[197]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[198]++;
  if (visit27_198_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[199]++;
    for (e in eventHandle) {
      _$jscoverage['/touch/handle.js'].lineData[201]++;
      h = eventHandle[e].handle;
      _$jscoverage['/touch/handle.js'].lineData[202]++;
      if (visit28_202_1(h.processed)) {
        _$jscoverage['/touch/handle.js'].lineData[203]++;
        continue;
      }
      _$jscoverage['/touch/handle.js'].lineData[205]++;
      h.processed = 1;
      _$jscoverage['/touch/handle.js'].lineData[207]++;
      if (visit29_207_1(h.isActive && visit30_207_2(h[method] && visit31_207_3(h[method](event) === false)))) {
        _$jscoverage['/touch/handle.js'].lineData[208]++;
        h.isActive = 0;
      }
    }
    _$jscoverage['/touch/handle.js'].lineData[213]++;
    for (e in eventHandle) {
      _$jscoverage['/touch/handle.js'].lineData[214]++;
      h = eventHandle[e].handle;
      _$jscoverage['/touch/handle.js'].lineData[215]++;
      h.processed = 0;
    }
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[221]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[224]++;
  if (visit32_224_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[225]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[227]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[235]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[236]++;
  if (visit33_236_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[237]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[238]++;
    if (visit34_238_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[239]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[245]++;
  var self = this, doc = self.doc, e, h;
  _$jscoverage['/touch/handle.js'].lineData[248]++;
  for (e in touchEvents) {
    _$jscoverage['/touch/handle.js'].lineData[249]++;
    h = touchEvents[e];
    _$jscoverage['/touch/handle.js'].lineData[250]++;
    DomEvent.detach(doc, e, self[h], self);
  }
}};
  _$jscoverage['/touch/handle.js'].lineData[255]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[257]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[259]++;
  if (visit35_259_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[260]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[262]++;
  if (visit36_262_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[263]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[268]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[270]++;
  if (visit37_270_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[271]++;
    if (visit38_271_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[272]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[274]++;
    if (visit39_274_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[275]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[276]++;
      Dom.removeData(doc, key);
    }
  }
}};
}, {
  requires: ['dom', './handle-map', 'event/dom/base', './tap', './swipe', './double-tap', './pinch', './tap-hold', './rotate']});
