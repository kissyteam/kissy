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
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js']) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[131] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[181] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1] = 0;
}
if (! _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['20'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['32'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['63'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['80'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['100'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['114'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['131'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['145'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['159'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['172'] = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['172'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['172'][1].init(7282, 31, 'callRet34 && callRet34.isBuffer');
function visit52_172_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['159'][1].init(6753, 31, 'callRet31 && callRet31.isBuffer');
function visit51_159_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['145'][1].init(6179, 31, 'callRet28 && callRet28.isBuffer');
function visit50_145_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['131'][1].init(5637, 31, 'callRet25 && callRet25.isBuffer');
function visit49_131_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['114'][1].init(4860, 31, 'callRet21 && callRet21.isBuffer');
function visit48_114_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['100'][1].init(4288, 31, 'callRet18 && callRet18.isBuffer');
function visit47_100_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['80'][1].init(3433, 31, 'callRet13 && callRet13.isBuffer');
function visit46_80_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['63'][1].init(2651, 29, 'callRet9 && callRet9.isBuffer');
function visit45_63_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1].init(1881, 29, 'callRet5 && callRet5.isBuffer');
function visit44_46_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['32'][1].init(1347, 29, 'callRet2 && callRet2.isBuffer');
function visit43_32_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['20'][1].init(802, 21, '"5.0.0" !== S.version');
function visit42_20_1(result) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[4]++;
  var t = function(scope, buffer, payload, undefined) {
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[5]++;
  var engine = this, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[20]++;
  if (visit42_20_1("5.0.0" !== S.version)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[21]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v5.0.0) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[23]++;
  buffer.write('<div class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[24]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[27]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[28]++;
  params1.push('header');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[29]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[30]++;
  var callRet2;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[31]++;
  callRet2 = callFnUtil(engine, scope, option0, buffer, ["getBaseCssClasses"], 0, 1);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[32]++;
  if (visit43_32_1(callRet2 && callRet2.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[33]++;
    buffer = callRet2;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[34]++;
    callRet2 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[36]++;
  buffer.write(callRet2, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[37]++;
  buffer.write('">\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[38]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[41]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[42]++;
  params4.push('prev-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[43]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[44]++;
  var callRet5;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[45]++;
  callRet5 = callFnUtil(engine, scope, option3, buffer, ["getBaseCssClasses"], 0, 2);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[46]++;
  if (visit44_46_1(callRet5 && callRet5.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[47]++;
    buffer = callRet5;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[48]++;
    callRet5 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[50]++;
  buffer.write(callRet5, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[51]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[52]++;
  var id6 = scope.resolve(["previousDecadeLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[53]++;
  buffer.write(id6, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[54]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[55]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[58]++;
  var params8 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[59]++;
  params8.push('decade-select');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[60]++;
  option7.params = params8;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[61]++;
  var callRet9;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[62]++;
  callRet9 = callFnUtil(engine, scope, option7, buffer, ["getBaseCssClasses"], 0, 9);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[63]++;
  if (visit45_63_1(callRet9 && callRet9.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[64]++;
    buffer = callRet9;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[65]++;
    callRet9 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[67]++;
  buffer.write(callRet9, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[68]++;
  buffer.write('"\r\n       role="button"\r\n       href="#"\r\n       hidefocus="on"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[69]++;
  var id10 = scope.resolve(["decadeSelectLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[70]++;
  buffer.write(id10, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[71]++;
  buffer.write('">\r\n            <span class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[72]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[75]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[76]++;
  params12.push('decade-select-content');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[77]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[78]++;
  var callRet13;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[79]++;
  callRet13 = callFnUtil(engine, scope, option11, buffer, ["getBaseCssClasses"], 0, 14);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[80]++;
  if (visit46_80_1(callRet13 && callRet13.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[81]++;
    buffer = callRet13;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[82]++;
    callRet13 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[84]++;
  buffer.write(callRet13, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[85]++;
  buffer.write('">\r\n                ', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[86]++;
  var id14 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[87]++;
  buffer.write(id14, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[88]++;
  buffer.write('-', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[89]++;
  var id15 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[90]++;
  buffer.write(id15, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[91]++;
  buffer.write('\r\n            </span>\r\n        <span class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[92]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[95]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[96]++;
  params17.push('decade-select-arrow');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[97]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[98]++;
  var callRet18;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[99]++;
  callRet18 = callFnUtil(engine, scope, option16, buffer, ["getBaseCssClasses"], 0, 17);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[100]++;
  if (visit47_100_1(callRet18 && callRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[101]++;
    buffer = callRet18;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[102]++;
    callRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[104]++;
  buffer.write(callRet18, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[105]++;
  buffer.write('">x</span>\r\n    </a>\r\n\r\n    <a class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[106]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[109]++;
  var params20 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[110]++;
  params20.push('next-decade-btn');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[111]++;
  option19.params = params20;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[112]++;
  var callRet21;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[113]++;
  callRet21 = callFnUtil(engine, scope, option19, buffer, ["getBaseCssClasses"], 0, 20);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[114]++;
  if (visit48_114_1(callRet21 && callRet21.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[115]++;
    buffer = callRet21;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[116]++;
    callRet21 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[118]++;
  buffer.write(callRet21, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[119]++;
  buffer.write('"\r\n       href="#"\r\n       role="button"\r\n       title="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[120]++;
  var id22 = scope.resolve(["nextDecadeLabel"], 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[121]++;
  buffer.write(id22, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[122]++;
  buffer.write('"\r\n       hidefocus="on">\r\n    </a>\r\n</div>\r\n<div class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[123]++;
  var option23 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[126]++;
  var params24 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[127]++;
  params24.push('body');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[128]++;
  option23.params = params24;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[129]++;
  var callRet25;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[130]++;
  callRet25 = callFnUtil(engine, scope, option23, buffer, ["getBaseCssClasses"], 0, 27);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[131]++;
  if (visit49_131_1(callRet25 && callRet25.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[132]++;
    buffer = callRet25;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[133]++;
    callRet25 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[135]++;
  buffer.write(callRet25, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[136]++;
  buffer.write('">\r\n    <table class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[137]++;
  var option26 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[140]++;
  var params27 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[141]++;
  params27.push('table');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[142]++;
  option26.params = params27;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[143]++;
  var callRet28;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[144]++;
  callRet28 = callFnUtil(engine, scope, option26, buffer, ["getBaseCssClasses"], 0, 28);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[145]++;
  if (visit50_145_1(callRet28 && callRet28.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[146]++;
    buffer = callRet28;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[147]++;
    callRet28 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[149]++;
  buffer.write(callRet28, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[150]++;
  buffer.write('" cellspacing="0" role="grid">\r\n        <tbody class="', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[151]++;
  var option29 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[154]++;
  var params30 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[155]++;
  params30.push('tbody');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[156]++;
  option29.params = params30;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[157]++;
  var callRet31;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[158]++;
  callRet31 = callFnUtil(engine, scope, option29, buffer, ["getBaseCssClasses"], 0, 29);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[159]++;
  if (visit51_159_1(callRet31 && callRet31.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[160]++;
    buffer = callRet31;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[161]++;
    callRet31 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[163]++;
  buffer.write(callRet31, true);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[164]++;
  buffer.write('">\r\n        ', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[165]++;
  var option32 = {};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[166]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[167]++;
  params33.push('./years-xtpl');
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[168]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[169]++;
  require("./years-xtpl");
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[170]++;
  var callRet34;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[171]++;
  callRet34 = includeCommand.call(engine, scope, option32, buffer, 30, payload);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[172]++;
  if (visit52_172_1(callRet34 && callRet34.isBuffer)) {
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[173]++;
    buffer = callRet34;
    _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[174]++;
    callRet34 = undefined;
  }
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[176]++;
  buffer.write(callRet34, false);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[177]++;
  buffer.write('\r\n        </tbody>\r\n    </table>\r\n</div>', 0);
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[178]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[180]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/year-panel-xtpl.js'].lineData[181]++;
  return t;
});
