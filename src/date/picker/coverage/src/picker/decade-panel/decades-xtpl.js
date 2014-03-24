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
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js']) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'] = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[189] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[191] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[192] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData = {};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['54'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['73'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['88'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['119'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['137'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['150'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['168'] = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['168'][1] = new BranchData();
}
_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['168'][1].init(5802, 37, 'commandRet40 && commandRet40.isBuffer');
function visit30_168_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['150'][1].init(462, 37, 'commandRet37 && commandRet37.isBuffer');
function visit29_150_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['137'][1].init(4226, 14, '(id32) > (id33)');
function visit28_137_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['119'][1].init(462, 37, 'commandRet29 && commandRet29.isBuffer');
function visit27_119_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['106'][1].init(2795, 14, '(id24) < (id25)');
function visit26_106_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['88'][1].init(457, 37, 'commandRet21 && commandRet21.isBuffer');
function visit25_88_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['73'][1].init(201, 15, '(id15) <= (id16)');
function visit24_73_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1].init(1012, 15, '(id12) <= (id13)');
function visit23_67_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['54'][1].init(436, 35, 'commandRet9 && commandRet9.isBuffer');
function visit22_54_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit21_11_2(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit20_11_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit19_8_1(result) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[8]++;
  if (visit19_8_1("1.50" !== S.version)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[11]++;
  if (visit20_11_1(visit21_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[25]++;
  buffer.write('');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[26]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[29]++;
  var params1 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[30]++;
  var id2 = scope.resolve(["decades"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[31]++;
  params1.push(id2);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[32]++;
  option0.params = params1;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[33]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[35]++;
  buffer.write('\n<tr role="row">\n    ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[36]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[39]++;
  var params4 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[40]++;
  var id6 = scope.resolve(["xindex"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[41]++;
  var id5 = scope.resolve(["decades", id6]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[42]++;
  params4.push(id5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[43]++;
  option3.params = params4;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[44]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[46]++;
  buffer.write('\n    <td role="gridcell"\n        class="');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[47]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[50]++;
  var params8 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[51]++;
  params8.push('cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[52]++;
  option7.params = params8;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[53]++;
  var commandRet9 = callCommandUtil(engine, scope, option7, buffer, "getBaseCssClasses", 5);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[54]++;
  if (visit22_54_1(commandRet9 && commandRet9.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[55]++;
    buffer = commandRet9;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[56]++;
    commandRet9 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[58]++;
  buffer.write(commandRet9, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[59]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[60]++;
  var option10 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[63]++;
  var params11 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[64]++;
  var id12 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[65]++;
  var exp14 = id12;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[66]++;
  var id13 = scope.resolve(["year"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[67]++;
  exp14 = visit23_67_1((id12) <= (id13));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[68]++;
  var exp18 = exp14;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[69]++;
  if ((exp14)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[70]++;
    var id15 = scope.resolve(["year"]);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[71]++;
    var exp17 = id15;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[72]++;
    var id16 = scope.resolve(["endDecade"]);
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[73]++;
    exp17 = visit24_73_1((id15) <= (id16));
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[74]++;
    exp18 = exp17;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[76]++;
  params11.push(exp18);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[77]++;
  option10.params = params11;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[78]++;
  option10.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[80]++;
  buffer.write('\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[81]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[84]++;
  var params20 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[85]++;
  params20.push('selected-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[86]++;
  option19.params = params20;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[87]++;
  var commandRet21 = callCommandUtil(engine, scope, option19, buffer, "getBaseCssClasses", 7);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[88]++;
  if (visit25_88_1(commandRet21 && commandRet21.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[89]++;
    buffer = commandRet21;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[90]++;
    commandRet21 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[92]++;
  buffer.write(commandRet21, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[93]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[95]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[97]++;
  buffer = ifCommand.call(engine, scope, option10, buffer, 6, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[98]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[99]++;
  var option22 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[102]++;
  var params23 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[103]++;
  var id24 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[104]++;
  var exp26 = id24;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[105]++;
  var id25 = scope.resolve(["startYear"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[106]++;
  exp26 = visit26_106_1((id24) < (id25));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[107]++;
  params23.push(exp26);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[108]++;
  option22.params = params23;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[109]++;
  option22.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[111]++;
  buffer.write('\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[112]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[115]++;
  var params28 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[116]++;
  params28.push('last-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[117]++;
  option27.params = params28;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[118]++;
  var commandRet29 = callCommandUtil(engine, scope, option27, buffer, "getBaseCssClasses", 10);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[119]++;
  if (visit27_119_1(commandRet29 && commandRet29.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[120]++;
    buffer = commandRet29;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[121]++;
    commandRet29 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[123]++;
  buffer.write(commandRet29, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[124]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[126]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[128]++;
  buffer = ifCommand.call(engine, scope, option22, buffer, 9, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[129]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[130]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[133]++;
  var params31 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[134]++;
  var id32 = scope.resolve(["endDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[135]++;
  var exp34 = id32;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[136]++;
  var id33 = scope.resolve(["endYear"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[137]++;
  exp34 = visit28_137_1((id32) > (id33));
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[138]++;
  params31.push(exp34);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[139]++;
  option30.params = params31;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[140]++;
  option30.fn = function(scope, buffer) {
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[142]++;
  buffer.write('\n         ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[143]++;
  var option35 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[146]++;
  var params36 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[147]++;
  params36.push('next-century-cell');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[148]++;
  option35.params = params36;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[149]++;
  var commandRet37 = callCommandUtil(engine, scope, option35, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[150]++;
  if (visit29_150_1(commandRet37 && commandRet37.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[151]++;
    buffer = commandRet37;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[152]++;
    commandRet37 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[154]++;
  buffer.write(commandRet37, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[155]++;
  buffer.write('\n        ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[157]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[159]++;
  buffer = ifCommand.call(engine, scope, option30, buffer, 12, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[160]++;
  buffer.write('\n        ">\n        <a hidefocus="on"\n           href="#"\n           unselectable="on"\n           class="');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[161]++;
  var option38 = {
  escape: 1};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[164]++;
  var params39 = [];
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[165]++;
  params39.push('decade');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[166]++;
  option38.params = params39;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[167]++;
  var commandRet40 = callCommandUtil(engine, scope, option38, buffer, "getBaseCssClasses", 19);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[168]++;
  if (visit30_168_1(commandRet40 && commandRet40.isBuffer)) {
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[169]++;
    buffer = commandRet40;
    _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[170]++;
    commandRet40 = undefined;
  }
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[172]++;
  buffer.write(commandRet40, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[173]++;
  buffer.write('">\n            ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[174]++;
  var id41 = scope.resolve(["startDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[175]++;
  buffer.write(id41, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[176]++;
  buffer.write('-');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[177]++;
  var id42 = scope.resolve(["endDecade"]);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[178]++;
  buffer.write(id42, true);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[179]++;
  buffer.write('\n        </a>\n    </td>\n    ');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[181]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[183]++;
  buffer = eachCommand.call(engine, scope, option3, buffer, 3, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[184]++;
  buffer.write('\n</tr>\n');
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[186]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[188]++;
  buffer = eachCommand.call(engine, scope, option0, buffer, 1, payload);
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[189]++;
  return buffer;
};
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[191]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/decade-panel/decades-xtpl.js'].lineData[192]++;
  return t;
});
