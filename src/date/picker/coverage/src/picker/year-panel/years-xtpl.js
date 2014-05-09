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
if (! _$jscoverage['/picker/year-panel/years-xtpl.js']) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'] = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[132] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[153] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[154] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[160] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[162] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[164] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[166] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[168] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[170] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[174] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[175] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5] = 0;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6] = 0;
}
if (! _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData = {};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['51'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['64'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['77'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['94'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['107'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['124'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['137'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['155'] = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['155'][1] = new BranchData();
}
_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['155'][1].init(5721, 31, 'callRet37 && callRet37.isBuffer');
function visit55_155_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['137'][1].init(493, 31, 'callRet34 && callRet34.isBuffer');
function visit54_137_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['124'][1].init(4102, 14, '(id29) > (id30)');
function visit53_124_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['107'][1].init(493, 31, 'callRet26 && callRet26.isBuffer');
function visit52_107_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['94'][1].init(2653, 14, '(id21) < (id22)');
function visit51_94_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['77'][1].init(489, 31, 'callRet18 && callRet18.isBuffer');
function visit50_77_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['64'][1].init(1205, 16, '(id13) === (id14)');
function visit49_64_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['51'][1].init(632, 31, 'callRet10 && callRet10.isBuffer');
function visit48_51_1(result) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[0]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[4]++;
  var years = function(scope, buffer, undefined) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[1]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[5]++;
  var tpl = this, nativeCommands = tpl.root.nativeCommands, utils = tpl.root.utils;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[8]++;
  var callFnUtil = utils["callFn"], callCommandUtil = utils["callCommand"], eachCommand = nativeCommands["each"], withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands["set"], includeCommand = nativeCommands["include"], parseCommand = nativeCommands["parse"], extendCommand = nativeCommands["extend"], blockCommand = nativeCommands["block"], macroCommand = nativeCommands["macro"], debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[20]++;
  buffer.write('', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[21]++;
  var option0 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[24]++;
  var params1 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[25]++;
  var id2 = scope.resolve(["years"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[26]++;
  params1.push(id2);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[27]++;
  option0.params = params1;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[28]++;
  option0.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[2]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[29]++;
  buffer.write('\r\n<tr role="row">\r\n    ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[30]++;
  var option3 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[33]++;
  var params4 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[34]++;
  var id6 = scope.resolve(["xindex"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[35]++;
  var id5 = scope.resolve(["years", id6], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[36]++;
  params4.push(id5);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[37]++;
  option3.params = params4;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[38]++;
  option3.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[3]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[39]++;
  buffer.write('\r\n    <td role="gridcell"\r\n        title="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[40]++;
  var id7 = scope.resolve(["title"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[41]++;
  buffer.write(id7, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[42]++;
  buffer.write('"\r\n        class="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[43]++;
  var option8 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[46]++;
  var params9 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[47]++;
  params9.push('cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[48]++;
  option8.params = params9;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[49]++;
  var callRet10;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[50]++;
  callRet10 = callFnUtil(tpl, scope, option8, buffer, ["getBaseCssClasses"], 0, 6);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[51]++;
  if (visit48_51_1(callRet10 && callRet10.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[52]++;
    buffer = callRet10;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[53]++;
    callRet10 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[55]++;
  buffer.write(callRet10, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[56]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[57]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[60]++;
  var params12 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[61]++;
  var id13 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[62]++;
  var exp15 = id13;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[63]++;
  var id14 = scope.resolve(["year"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[64]++;
  exp15 = visit49_64_1((id13) === (id14));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[65]++;
  params12.push(exp15);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[66]++;
  option11.params = params12;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[67]++;
  option11.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[4]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[68]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[69]++;
  var option16 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[72]++;
  var params17 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[73]++;
  params17.push('selected-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[74]++;
  option16.params = params17;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[75]++;
  var callRet18;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[76]++;
  callRet18 = callFnUtil(tpl, scope, option16, buffer, ["getBaseCssClasses"], 0, 8);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[77]++;
  if (visit50_77_1(callRet18 && callRet18.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[78]++;
    buffer = callRet18;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[79]++;
    callRet18 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[81]++;
  buffer.write(callRet18, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[82]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[83]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[85]++;
  buffer = ifCommand.call(tpl, scope, option11, buffer, 7);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[86]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[87]++;
  var option19 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[90]++;
  var params20 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[91]++;
  var id21 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[92]++;
  var exp23 = id21;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[93]++;
  var id22 = scope.resolve(["startYear"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[94]++;
  exp23 = visit51_94_1((id21) < (id22));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[95]++;
  params20.push(exp23);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[96]++;
  option19.params = params20;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[97]++;
  option19.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[5]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[98]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[99]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[102]++;
  var params25 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[103]++;
  params25.push('last-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[104]++;
  option24.params = params25;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[105]++;
  var callRet26;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[106]++;
  callRet26 = callFnUtil(tpl, scope, option24, buffer, ["getBaseCssClasses"], 0, 11);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[107]++;
  if (visit52_107_1(callRet26 && callRet26.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[108]++;
    buffer = callRet26;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[109]++;
    callRet26 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[111]++;
  buffer.write(callRet26, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[112]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[113]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[115]++;
  buffer = ifCommand.call(tpl, scope, option19, buffer, 10);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[116]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[117]++;
  var option27 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[120]++;
  var params28 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[121]++;
  var id29 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[122]++;
  var exp31 = id29;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[123]++;
  var id30 = scope.resolve(["endYear"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[124]++;
  exp31 = visit53_124_1((id29) > (id30));
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[125]++;
  params28.push(exp31);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[126]++;
  option27.params = params28;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[127]++;
  option27.fn = function(scope, buffer) {
  _$jscoverage['/picker/year-panel/years-xtpl.js'].functionData[6]++;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[128]++;
  buffer.write('\r\n         ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[129]++;
  var option32 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[132]++;
  var params33 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[133]++;
  params33.push('next-decade-cell');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[134]++;
  option32.params = params33;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[135]++;
  var callRet34;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[136]++;
  callRet34 = callFnUtil(tpl, scope, option32, buffer, ["getBaseCssClasses"], 0, 14);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[137]++;
  if (visit54_137_1(callRet34 && callRet34.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[138]++;
    buffer = callRet34;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[139]++;
    callRet34 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[141]++;
  buffer.write(callRet34, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[142]++;
  buffer.write('\r\n        ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[143]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[145]++;
  buffer = ifCommand.call(tpl, scope, option27, buffer, 13);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[146]++;
  buffer.write('\r\n        ">\r\n        <a hidefocus="on"\r\n           href="#"\r\n           unselectable="on"\r\n           class="', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[147]++;
  var option35 = {
  escape: 1};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[150]++;
  var params36 = [];
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[151]++;
  params36.push('year');
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[152]++;
  option35.params = params36;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[153]++;
  var callRet37;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[154]++;
  callRet37 = callFnUtil(tpl, scope, option35, buffer, ["getBaseCssClasses"], 0, 20);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[155]++;
  if (visit55_155_1(callRet37 && callRet37.isBuffer)) {
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[156]++;
    buffer = callRet37;
    _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[157]++;
    callRet37 = undefined;
  }
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[159]++;
  buffer.write(callRet37, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[160]++;
  buffer.write('">\r\n            ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[161]++;
  var id38 = scope.resolve(["content"], 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[162]++;
  buffer.write(id38, true);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[163]++;
  buffer.write('\r\n        </a>\r\n    </td>\r\n    ', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[164]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[166]++;
  buffer = eachCommand.call(tpl, scope, option3, buffer, 3);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[167]++;
  buffer.write('\r\n</tr>\r\n', 0);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[168]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[170]++;
  buffer = eachCommand.call(tpl, scope, option0, buffer, 1);
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[171]++;
  return buffer;
};
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[173]++;
  years.TPL_NAME = module.name;
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[174]++;
  years.version = "5.0.0";
  _$jscoverage['/picker/year-panel/years-xtpl.js'].lineData[175]++;
  return years;
});
