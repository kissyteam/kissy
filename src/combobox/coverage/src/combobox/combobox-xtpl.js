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
if (! _$jscoverage['/combobox/combobox-xtpl.js']) {
  _$jscoverage['/combobox/combobox-xtpl.js'] = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[14] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[141] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[142] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[148] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[150] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[152] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[156] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[158] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[159] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[163] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[171] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[176] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[178] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[181] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[182] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[184] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[185] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[186] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[187] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[188] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[189] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[191] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[192] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].functionData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4] = 0;
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5] = 0;
}
if (! _$jscoverage['/combobox/combobox-xtpl.js'].branchData) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData = {};
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][2] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['36'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['49'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['75'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['88'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['106'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['137'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['180'] = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['180'][1] = new BranchData();
}
_$jscoverage['/combobox/combobox-xtpl.js'].branchData['180'][1].init(7435, 37, 'commandRet35 && commandRet35.isBuffer');
function visit10_180_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['137'][1].init(5799, 37, 'commandRet26 && commandRet26.isBuffer');
function visit9_137_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['106'][1].init(4424, 37, 'commandRet19 && commandRet19.isBuffer');
function visit8_106_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['88'][1].init(1130, 37, 'commandRet16 && commandRet16.isBuffer');
function visit7_88_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['75'][1].init(540, 37, 'commandRet13 && commandRet13.isBuffer');
function visit6_75_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['49'][1].init(2059, 35, 'commandRet6 && commandRet6.isBuffer');
function visit5_49_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['36'][1].init(1533, 35, 'commandRet3 && commandRet3.isBuffer');
function visit4_36_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][2].init(358, 29, 'typeof module !== "undefined"');
function visit3_11_2(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][1].init(358, 45, 'typeof module !== "undefined" && module.kissy');
function visit2_11_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1].init(154, 20, '"1.50" !== S.version');
function visit1_8_1(result) {
  _$jscoverage['/combobox/combobox-xtpl.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/combobox-xtpl.js'].lineData[2]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[0]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[4]++;
  var t = function(scope, S, buffer, payload, undefined) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[1]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[5]++;
  var engine = this, moduleWrap, nativeCommands = engine.nativeCommands, utils = engine.utils;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[8]++;
  if (visit1_8_1("1.50" !== S.version)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[9]++;
    throw new Error("current xtemplate file(" + engine.name + ")(v1.50) need to be recompiled using current kissy(v" + S.version + ")!");
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[11]++;
  if (visit2_11_1(visit3_11_2(typeof module !== "undefined") && module.kissy)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[12]++;
    moduleWrap = module;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[14]++;
  var callCommandUtil = utils.callCommand, eachCommand = nativeCommands.each, withCommand = nativeCommands["with"], ifCommand = nativeCommands["if"], setCommand = nativeCommands.set, includeCommand = nativeCommands.include, parseCommand = nativeCommands.parse, extendCommand = nativeCommands.extend, blockCommand = nativeCommands.block, macroCommand = nativeCommands.macro, debuggerCommand = nativeCommands["debugger"];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[25]++;
  buffer.write('<div id="ks-combobox-invalid-el-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[26]++;
  var id0 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[27]++;
  buffer.write(id0, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[28]++;
  buffer.write('"\n     class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[29]++;
  var option1 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[32]++;
  var params2 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[33]++;
  params2.push('invalid-el');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[34]++;
  option1.params = params2;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[35]++;
  var commandRet3 = callCommandUtil(engine, scope, option1, buffer, "getBaseCssClasses", 2);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[36]++;
  if (visit4_36_1(commandRet3 && commandRet3.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[37]++;
    buffer = commandRet3;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[38]++;
    commandRet3 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[40]++;
  buffer.write(commandRet3, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[41]++;
  buffer.write('">\n    <div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[42]++;
  var option4 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[45]++;
  var params5 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[46]++;
  params5.push('invalid-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[47]++;
  option4.params = params5;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[48]++;
  var commandRet6 = callCommandUtil(engine, scope, option4, buffer, "getBaseCssClasses", 3);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[49]++;
  if (visit5_49_1(commandRet6 && commandRet6.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[50]++;
    buffer = commandRet6;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[51]++;
    commandRet6 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[53]++;
  buffer.write(commandRet6, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[54]++;
  buffer.write('"></div>\n</div>\n\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[55]++;
  var option7 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[58]++;
  var params8 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[59]++;
  var id9 = scope.resolve(["hasTrigger"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[60]++;
  params8.push(id9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[61]++;
  option7.params = params8;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[62]++;
  option7.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[2]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[64]++;
  buffer.write('\n<div id="ks-combobox-trigger-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[65]++;
  var id10 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[66]++;
  buffer.write(id10, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[67]++;
  buffer.write('"\n     class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[68]++;
  var option11 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[71]++;
  var params12 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[72]++;
  params12.push('trigger');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[73]++;
  option11.params = params12;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[74]++;
  var commandRet13 = callCommandUtil(engine, scope, option11, buffer, "getBaseCssClasses", 8);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[75]++;
  if (visit6_75_1(commandRet13 && commandRet13.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[76]++;
    buffer = commandRet13;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[77]++;
    commandRet13 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[79]++;
  buffer.write(commandRet13, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[80]++;
  buffer.write('">\n    <div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[81]++;
  var option14 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[84]++;
  var params15 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[85]++;
  params15.push('trigger-inner');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[86]++;
  option14.params = params15;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[87]++;
  var commandRet16 = callCommandUtil(engine, scope, option14, buffer, "getBaseCssClasses", 9);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[88]++;
  if (visit7_88_1(commandRet16 && commandRet16.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[89]++;
    buffer = commandRet16;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[90]++;
    commandRet16 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[92]++;
  buffer.write(commandRet16, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[93]++;
  buffer.write('">&#x25BC;</div>\n</div>\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[95]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[97]++;
  buffer = ifCommand.call(engine, scope, option7, buffer, 6, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[98]++;
  buffer.write('\n\n<div class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[99]++;
  var option17 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[102]++;
  var params18 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[103]++;
  params18.push('input-wrap');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[104]++;
  option17.params = params18;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[105]++;
  var commandRet19 = callCommandUtil(engine, scope, option17, buffer, "getBaseCssClasses", 13);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[106]++;
  if (visit8_106_1(commandRet19 && commandRet19.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[107]++;
    buffer = commandRet19;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[108]++;
    commandRet19 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[110]++;
  buffer.write(commandRet19, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[111]++;
  buffer.write('">\n\n    <input id="ks-combobox-input-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[112]++;
  var id20 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[113]++;
  buffer.write(id20, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[114]++;
  buffer.write('"\n           aria-haspopup="true"\n           aria-autocomplete="list"\n           aria-haspopup="true"\n           role="autocomplete"\n           aria-expanded="false"\n\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[115]++;
  var option21 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[118]++;
  var params22 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[119]++;
  var id23 = scope.resolve(["disabled"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[120]++;
  params22.push(id23);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[121]++;
  option21.params = params22;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[122]++;
  option21.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[3]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[124]++;
  buffer.write('\n    disabled\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[126]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[128]++;
  buffer = ifCommand.call(engine, scope, option21, buffer, 22, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[129]++;
  buffer.write('\n\n    autocomplete="off"\n    class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[130]++;
  var option24 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[133]++;
  var params25 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[134]++;
  params25.push('input');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[135]++;
  option24.params = params25;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[136]++;
  var commandRet26 = callCommandUtil(engine, scope, option24, buffer, "getBaseCssClasses", 27);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[137]++;
  if (visit9_137_1(commandRet26 && commandRet26.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[138]++;
    buffer = commandRet26;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[139]++;
    commandRet26 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[141]++;
  buffer.write(commandRet26, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[142]++;
  buffer.write('"\n\n    value="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[143]++;
  var id27 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[144]++;
  buffer.write(id27, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[145]++;
  buffer.write('"\n    />\n\n\n    <label id="ks-combobox-placeholder-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[146]++;
  var id28 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[147]++;
  buffer.write(id28, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[148]++;
  buffer.write('"\n           for="ks-combobox-input-');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[149]++;
  var id29 = scope.resolve(["id"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[150]++;
  buffer.write(id29, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[151]++;
  buffer.write('"\n            style=\'display:');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[152]++;
  var option30 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[155]++;
  var params31 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[156]++;
  var id32 = scope.resolve(["value"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[157]++;
  params31.push(id32);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[158]++;
  option30.params = params31;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[159]++;
  option30.fn = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[4]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[161]++;
  buffer.write('none');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[163]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[165]++;
  option30.inverse = function(scope, buffer) {
  _$jscoverage['/combobox/combobox-xtpl.js'].functionData[5]++;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[167]++;
  buffer.write('block');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[169]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[171]++;
  buffer = ifCommand.call(engine, scope, option30, buffer, 35, payload);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[172]++;
  buffer.write(';\'\n    class="');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[173]++;
  var option33 = {
  escape: 1};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[176]++;
  var params34 = [];
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[177]++;
  params34.push('placeholder');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[178]++;
  option33.params = params34;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[179]++;
  var commandRet35 = callCommandUtil(engine, scope, option33, buffer, "getBaseCssClasses", 36);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[180]++;
  if (visit10_180_1(commandRet35 && commandRet35.isBuffer)) {
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[181]++;
    buffer = commandRet35;
    _$jscoverage['/combobox/combobox-xtpl.js'].lineData[182]++;
    commandRet35 = undefined;
  }
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[184]++;
  buffer.write(commandRet35, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[185]++;
  buffer.write('">\n    ');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[186]++;
  var id36 = scope.resolve(["placeholder"]);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[187]++;
  buffer.write(id36, true);
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[188]++;
  buffer.write('\n    </label>\n</div>\n');
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[189]++;
  return buffer;
};
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[191]++;
  t.TPL_NAME = module.name;
  _$jscoverage['/combobox/combobox-xtpl.js'].lineData[192]++;
  return t;
});
