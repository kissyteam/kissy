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
if (! _$jscoverage['/ie/transform.js']) {
  _$jscoverage['/ie/transform.js'] = {};
  _$jscoverage['/ie/transform.js'].lineData = [];
  _$jscoverage['/ie/transform.js'].lineData[6] = 0;
  _$jscoverage['/ie/transform.js'].lineData[7] = 0;
  _$jscoverage['/ie/transform.js'].lineData[8] = 0;
  _$jscoverage['/ie/transform.js'].lineData[9] = 0;
  _$jscoverage['/ie/transform.js'].lineData[10] = 0;
  _$jscoverage['/ie/transform.js'].lineData[12] = 0;
  _$jscoverage['/ie/transform.js'].lineData[14] = 0;
  _$jscoverage['/ie/transform.js'].lineData[16] = 0;
  _$jscoverage['/ie/transform.js'].lineData[17] = 0;
  _$jscoverage['/ie/transform.js'].lineData[18] = 0;
  _$jscoverage['/ie/transform.js'].lineData[20] = 0;
  _$jscoverage['/ie/transform.js'].lineData[21] = 0;
  _$jscoverage['/ie/transform.js'].lineData[22] = 0;
  _$jscoverage['/ie/transform.js'].lineData[23] = 0;
  _$jscoverage['/ie/transform.js'].lineData[25] = 0;
  _$jscoverage['/ie/transform.js'].lineData[26] = 0;
  _$jscoverage['/ie/transform.js'].lineData[28] = 0;
  _$jscoverage['/ie/transform.js'].lineData[37] = 0;
  _$jscoverage['/ie/transform.js'].lineData[39] = 0;
  _$jscoverage['/ie/transform.js'].lineData[43] = 0;
  _$jscoverage['/ie/transform.js'].lineData[58] = 0;
  _$jscoverage['/ie/transform.js'].lineData[59] = 0;
  _$jscoverage['/ie/transform.js'].lineData[60] = 0;
  _$jscoverage['/ie/transform.js'].lineData[61] = 0;
  _$jscoverage['/ie/transform.js'].lineData[62] = 0;
  _$jscoverage['/ie/transform.js'].lineData[63] = 0;
  _$jscoverage['/ie/transform.js'].lineData[64] = 0;
  _$jscoverage['/ie/transform.js'].lineData[78] = 0;
  _$jscoverage['/ie/transform.js'].lineData[80] = 0;
  _$jscoverage['/ie/transform.js'].lineData[82] = 0;
  _$jscoverage['/ie/transform.js'].lineData[86] = 0;
  _$jscoverage['/ie/transform.js'].lineData[87] = 0;
  _$jscoverage['/ie/transform.js'].lineData[91] = 0;
  _$jscoverage['/ie/transform.js'].lineData[97] = 0;
  _$jscoverage['/ie/transform.js'].lineData[101] = 0;
  _$jscoverage['/ie/transform.js'].lineData[102] = 0;
  _$jscoverage['/ie/transform.js'].lineData[106] = 0;
  _$jscoverage['/ie/transform.js'].lineData[107] = 0;
  _$jscoverage['/ie/transform.js'].lineData[109] = 0;
  _$jscoverage['/ie/transform.js'].lineData[115] = 0;
  _$jscoverage['/ie/transform.js'].lineData[116] = 0;
  _$jscoverage['/ie/transform.js'].lineData[118] = 0;
  _$jscoverage['/ie/transform.js'].lineData[133] = 0;
  _$jscoverage['/ie/transform.js'].lineData[134] = 0;
  _$jscoverage['/ie/transform.js'].lineData[135] = 0;
  _$jscoverage['/ie/transform.js'].lineData[136] = 0;
  _$jscoverage['/ie/transform.js'].lineData[137] = 0;
  _$jscoverage['/ie/transform.js'].lineData[139] = 0;
  _$jscoverage['/ie/transform.js'].lineData[140] = 0;
  _$jscoverage['/ie/transform.js'].lineData[141] = 0;
  _$jscoverage['/ie/transform.js'].lineData[142] = 0;
  _$jscoverage['/ie/transform.js'].lineData[144] = 0;
  _$jscoverage['/ie/transform.js'].lineData[147] = 0;
  _$jscoverage['/ie/transform.js'].lineData[151] = 0;
  _$jscoverage['/ie/transform.js'].lineData[152] = 0;
  _$jscoverage['/ie/transform.js'].lineData[153] = 0;
  _$jscoverage['/ie/transform.js'].lineData[161] = 0;
  _$jscoverage['/ie/transform.js'].lineData[162] = 0;
  _$jscoverage['/ie/transform.js'].lineData[163] = 0;
  _$jscoverage['/ie/transform.js'].lineData[164] = 0;
  _$jscoverage['/ie/transform.js'].lineData[165] = 0;
  _$jscoverage['/ie/transform.js'].lineData[166] = 0;
  _$jscoverage['/ie/transform.js'].lineData[168] = 0;
  _$jscoverage['/ie/transform.js'].lineData[169] = 0;
  _$jscoverage['/ie/transform.js'].lineData[172] = 0;
  _$jscoverage['/ie/transform.js'].lineData[173] = 0;
  _$jscoverage['/ie/transform.js'].lineData[176] = 0;
  _$jscoverage['/ie/transform.js'].lineData[177] = 0;
  _$jscoverage['/ie/transform.js'].lineData[178] = 0;
  _$jscoverage['/ie/transform.js'].lineData[179] = 0;
  _$jscoverage['/ie/transform.js'].lineData[182] = 0;
  _$jscoverage['/ie/transform.js'].lineData[183] = 0;
  _$jscoverage['/ie/transform.js'].lineData[184] = 0;
  _$jscoverage['/ie/transform.js'].lineData[185] = 0;
  _$jscoverage['/ie/transform.js'].lineData[186] = 0;
  _$jscoverage['/ie/transform.js'].lineData[187] = 0;
  _$jscoverage['/ie/transform.js'].lineData[190] = 0;
  _$jscoverage['/ie/transform.js'].lineData[191] = 0;
  _$jscoverage['/ie/transform.js'].lineData[194] = 0;
  _$jscoverage['/ie/transform.js'].lineData[195] = 0;
  _$jscoverage['/ie/transform.js'].lineData[198] = 0;
  _$jscoverage['/ie/transform.js'].lineData[199] = 0;
  _$jscoverage['/ie/transform.js'].lineData[200] = 0;
  _$jscoverage['/ie/transform.js'].lineData[201] = 0;
  _$jscoverage['/ie/transform.js'].lineData[204] = 0;
  _$jscoverage['/ie/transform.js'].lineData[205] = 0;
  _$jscoverage['/ie/transform.js'].lineData[208] = 0;
  _$jscoverage['/ie/transform.js'].lineData[209] = 0;
  _$jscoverage['/ie/transform.js'].lineData[212] = 0;
  _$jscoverage['/ie/transform.js'].lineData[213] = 0;
  _$jscoverage['/ie/transform.js'].lineData[214] = 0;
  _$jscoverage['/ie/transform.js'].lineData[215] = 0;
  _$jscoverage['/ie/transform.js'].lineData[217] = 0;
  _$jscoverage['/ie/transform.js'].lineData[220] = 0;
  _$jscoverage['/ie/transform.js'].lineData[221] = 0;
  _$jscoverage['/ie/transform.js'].lineData[222] = 0;
  _$jscoverage['/ie/transform.js'].lineData[223] = 0;
  _$jscoverage['/ie/transform.js'].lineData[224] = 0;
  _$jscoverage['/ie/transform.js'].lineData[225] = 0;
  _$jscoverage['/ie/transform.js'].lineData[226] = 0;
  _$jscoverage['/ie/transform.js'].lineData[227] = 0;
  _$jscoverage['/ie/transform.js'].lineData[229] = 0;
  _$jscoverage['/ie/transform.js'].lineData[232] = 0;
  _$jscoverage['/ie/transform.js'].lineData[235] = 0;
  _$jscoverage['/ie/transform.js'].lineData[236] = 0;
  _$jscoverage['/ie/transform.js'].lineData[243] = 0;
  _$jscoverage['/ie/transform.js'].lineData[244] = 0;
  _$jscoverage['/ie/transform.js'].lineData[245] = 0;
  _$jscoverage['/ie/transform.js'].lineData[247] = 0;
  _$jscoverage['/ie/transform.js'].lineData[250] = 0;
  _$jscoverage['/ie/transform.js'].lineData[251] = 0;
  _$jscoverage['/ie/transform.js'].lineData[252] = 0;
  _$jscoverage['/ie/transform.js'].lineData[253] = 0;
  _$jscoverage['/ie/transform.js'].lineData[254] = 0;
  _$jscoverage['/ie/transform.js'].lineData[255] = 0;
  _$jscoverage['/ie/transform.js'].lineData[257] = 0;
  _$jscoverage['/ie/transform.js'].lineData[260] = 0;
  _$jscoverage['/ie/transform.js'].lineData[265] = 0;
  _$jscoverage['/ie/transform.js'].lineData[266] = 0;
  _$jscoverage['/ie/transform.js'].lineData[267] = 0;
  _$jscoverage['/ie/transform.js'].lineData[268] = 0;
  _$jscoverage['/ie/transform.js'].lineData[269] = 0;
  _$jscoverage['/ie/transform.js'].lineData[271] = 0;
  _$jscoverage['/ie/transform.js'].lineData[275] = 0;
  _$jscoverage['/ie/transform.js'].lineData[279] = 0;
  _$jscoverage['/ie/transform.js'].lineData[280] = 0;
}
if (! _$jscoverage['/ie/transform.js'].functionData) {
  _$jscoverage['/ie/transform.js'].functionData = [];
  _$jscoverage['/ie/transform.js'].functionData[0] = 0;
  _$jscoverage['/ie/transform.js'].functionData[1] = 0;
  _$jscoverage['/ie/transform.js'].functionData[2] = 0;
  _$jscoverage['/ie/transform.js'].functionData[3] = 0;
  _$jscoverage['/ie/transform.js'].functionData[4] = 0;
  _$jscoverage['/ie/transform.js'].functionData[5] = 0;
  _$jscoverage['/ie/transform.js'].functionData[6] = 0;
  _$jscoverage['/ie/transform.js'].functionData[7] = 0;
  _$jscoverage['/ie/transform.js'].functionData[8] = 0;
  _$jscoverage['/ie/transform.js'].functionData[9] = 0;
}
if (! _$jscoverage['/ie/transform.js'].branchData) {
  _$jscoverage['/ie/transform.js'].branchData = {};
  _$jscoverage['/ie/transform.js'].branchData['16'] = [];
  _$jscoverage['/ie/transform.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['20'] = [];
  _$jscoverage['/ie/transform.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['21'] = [];
  _$jscoverage['/ie/transform.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['22'] = [];
  _$jscoverage['/ie/transform.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['22'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['25'] = [];
  _$jscoverage['/ie/transform.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['59'] = [];
  _$jscoverage['/ie/transform.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['80'] = [];
  _$jscoverage['/ie/transform.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['80'][2] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['80'][3] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['82'] = [];
  _$jscoverage['/ie/transform.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['88'] = [];
  _$jscoverage['/ie/transform.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['90'] = [];
  _$jscoverage['/ie/transform.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['101'] = [];
  _$jscoverage['/ie/transform.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['134'] = [];
  _$jscoverage['/ie/transform.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['136'] = [];
  _$jscoverage['/ie/transform.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['139'] = [];
  _$jscoverage['/ie/transform.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['141'] = [];
  _$jscoverage['/ie/transform.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['161'] = [];
  _$jscoverage['/ie/transform.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['178'] = [];
  _$jscoverage['/ie/transform.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['200'] = [];
  _$jscoverage['/ie/transform.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['214'] = [];
  _$jscoverage['/ie/transform.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['244'] = [];
  _$jscoverage['/ie/transform.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['252'] = [];
  _$jscoverage['/ie/transform.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['254'] = [];
  _$jscoverage['/ie/transform.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['265'] = [];
  _$jscoverage['/ie/transform.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['266'] = [];
  _$jscoverage['/ie/transform.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['268'] = [];
  _$jscoverage['/ie/transform.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/ie/transform.js'].branchData['280'] = [];
  _$jscoverage['/ie/transform.js'].branchData['280'][1] = new BranchData();
}
_$jscoverage['/ie/transform.js'].branchData['280'][1].init(17, 25, 'value.indexOf(\'deg\') > -1');
function visit116_280_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['268'][1].init(64, 6, 'j < r2');
function visit115_268_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['266'][1].init(30, 6, 'k < c2');
function visit114_266_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['265'][1].init(380, 6, 'i < r1');
function visit113_265_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['254'][1].init(53, 20, 'i < arguments.length');
function visit112_254_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['252'][1].init(30, 20, 'arguments.length > 2');
function visit111_252_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['244'][1].init(14, 5, '!m[x]');
function visit110_244_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['214'][1].init(139, 14, 'val.length > 1');
function visit109_214_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['200'][1].init(127, 14, 'val.length > 1');
function visit108_200_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['178'][1].init(153, 11, 'val[1] || 0');
function visit107_178_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['161'][1].init(346, 7, '++i < l');
function visit106_161_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['141'][1].init(64, 29, 'util.endsWith(origin[i], \'%\')');
function visit105_141_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['139'][1].init(187, 17, 'i < origin.length');
function visit104_139_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['136'][1].init(92, 19, 'origin.length === 1');
function visit103_136_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['134'][1].init(19, 19, 'origin || \'50% 50%\'');
function visit102_134_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['101'][1].init(2612, 9, 'matrixVal');
function visit101_101_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['90'][1].init(129, 36, 'currentStyle && !currentStyle.filter');
function visit100_90_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['88'][1].init(48, 166, '!matrixVal || currentStyle && !currentStyle.filter');
function visit99_88_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['82'][1].init(1635, 53, '!matrixVal && !util.trim(filter.replace(rMatrix, \'\'))');
function visit98_82_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['80'][3].init(1592, 22, 'elemStyle.filter || \'\'');
function visit97_80_3(result) {
  _$jscoverage['/ie/transform.js'].branchData['80'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['80'][2].init(1553, 35, 'currentStyle && currentStyle.filter');
function visit96_80_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['80'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['80'][1].init(1553, 61, 'currentStyle && currentStyle.filter || elemStyle.filter || \'\'');
function visit95_80_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['59'][1].init(612, 5, 'value');
function visit94_59_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['25'][2].init(385, 29, 'dys[0].toLowerCase() === \'dy\'');
function visit93_25_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['25'][1].init(378, 36, 'dys && dys[0].toLowerCase() === \'dy\'');
function visit92_25_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['22'][2].init(259, 29, 'dxs[0].toLowerCase() === \'dx\'');
function visit91_22_2(result) {
  _$jscoverage['/ie/transform.js'].branchData['22'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['22'][1].init(252, 36, 'dxs && dxs[0].toLowerCase() === \'dx\'');
function visit90_22_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['21'][1].init(196, 33, 'matrix[5] && matrix[5].split(\'=\')');
function visit89_21_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['20'][1].init(134, 33, 'matrix[4] && matrix[4].split(\'=\')');
function visit88_20_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].branchData['16'][1].init(115, 43, 'elemStyle && rMatrix.test(elemStyle.filter)');
function visit87_16_1(result) {
  _$jscoverage['/ie/transform.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/transform.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/transform.js'].functionData[0]++;
  _$jscoverage['/ie/transform.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/ie/transform.js'].lineData[8]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/transform.js'].lineData[9]++;
  var cssHooks = Dom._cssHooks;
  _$jscoverage['/ie/transform.js'].lineData[10]++;
  var rMatrix = /progid:DXImageTransform.Microsoft.Matrix\(([^)]*)\)/;
  _$jscoverage['/ie/transform.js'].lineData[12]++;
  cssHooks.transform = {
  get: function(elem, computed) {
  _$jscoverage['/ie/transform.js'].functionData[1]++;
  _$jscoverage['/ie/transform.js'].lineData[14]++;
  var elemStyle = elem[computed ? 'currentStyle' : 'style'], matrix;
  _$jscoverage['/ie/transform.js'].lineData[16]++;
  if (visit87_16_1(elemStyle && rMatrix.test(elemStyle.filter))) {
    _$jscoverage['/ie/transform.js'].lineData[17]++;
    matrix = RegExp.$1.split(',');
    _$jscoverage['/ie/transform.js'].lineData[18]++;
    var dx = 0, dy = 0;
    _$jscoverage['/ie/transform.js'].lineData[20]++;
    var dxs = visit88_20_1(matrix[4] && matrix[4].split('='));
    _$jscoverage['/ie/transform.js'].lineData[21]++;
    var dys = visit89_21_1(matrix[5] && matrix[5].split('='));
    _$jscoverage['/ie/transform.js'].lineData[22]++;
    if (visit90_22_1(dxs && visit91_22_2(dxs[0].toLowerCase() === 'dx'))) {
      _$jscoverage['/ie/transform.js'].lineData[23]++;
      dx = parseFloat(dxs[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[25]++;
    if (visit92_25_1(dys && visit93_25_2(dys[0].toLowerCase() === 'dy'))) {
      _$jscoverage['/ie/transform.js'].lineData[26]++;
      dy = parseFloat(dys[1]);
    }
    _$jscoverage['/ie/transform.js'].lineData[28]++;
    matrix = [matrix[0].split('=')[1], matrix[2].split('=')[1], matrix[1].split('=')[1], matrix[3].split('=')[1], dx, dy];
  } else {
    _$jscoverage['/ie/transform.js'].lineData[37]++;
    return computed ? 'none' : '';
  }
  _$jscoverage['/ie/transform.js'].lineData[39]++;
  return 'matrix(' + matrix.join(',') + ')';
}, 
  set: function(elem, value) {
  _$jscoverage['/ie/transform.js'].functionData[2]++;
  _$jscoverage['/ie/transform.js'].lineData[43]++;
  var elemStyle = elem.style, afterCenter, currentStyle = elem.currentStyle, matrixVal, region = {
  width: elem.clientWidth, 
  height: elem.clientHeight}, center = {
  x: region.width / 2, 
  y: region.height / 2}, origin = parseOrigin(elem.style.transformOrigin, region), filter;
  _$jscoverage['/ie/transform.js'].lineData[58]++;
  elemStyle.zoom = 1;
  _$jscoverage['/ie/transform.js'].lineData[59]++;
  if (visit94_59_1(value)) {
    _$jscoverage['/ie/transform.js'].lineData[60]++;
    value = matrix(value);
    _$jscoverage['/ie/transform.js'].lineData[61]++;
    afterCenter = getCenterByOrigin(value, origin, center);
    _$jscoverage['/ie/transform.js'].lineData[62]++;
    afterCenter.x = afterCenter[0][0];
    _$jscoverage['/ie/transform.js'].lineData[63]++;
    afterCenter.y = afterCenter[1][0];
    _$jscoverage['/ie/transform.js'].lineData[64]++;
    matrixVal = ['progid:DXImageTransform.Microsoft.Matrix(' + 'M11=' + value[0][0], 'M12=' + value[0][1], 'M21=' + value[1][0], 'M22=' + value[1][1], 'Dx=' + value[0][2], 'Dy=' + value[1][2], 'SizingMethod="auto expand"'].join(',') + ')';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[78]++;
    matrixVal = '';
  }
  _$jscoverage['/ie/transform.js'].lineData[80]++;
  filter = visit95_80_1(visit96_80_2(currentStyle && currentStyle.filter) || visit97_80_3(elemStyle.filter || ''));
  _$jscoverage['/ie/transform.js'].lineData[82]++;
  if (visit98_82_1(!matrixVal && !util.trim(filter.replace(rMatrix, '')))) {
    _$jscoverage['/ie/transform.js'].lineData[86]++;
    elemStyle.removeAttribute('filter');
    _$jscoverage['/ie/transform.js'].lineData[87]++;
    if (visit99_88_1(!matrixVal || visit100_90_1(currentStyle && !currentStyle.filter))) {
      _$jscoverage['/ie/transform.js'].lineData[91]++;
      return;
    }
  }
  _$jscoverage['/ie/transform.js'].lineData[97]++;
  elemStyle.filter = rMatrix.test(filter) ? filter.replace(rMatrix, matrixVal) : filter + (filter ? ', ' : '') + matrixVal;
  _$jscoverage['/ie/transform.js'].lineData[101]++;
  if (visit101_101_1(matrixVal)) {
    _$jscoverage['/ie/transform.js'].lineData[102]++;
    var realCenter = {
  x: elem.offsetWidth / 2, 
  y: elem.offsetHeight / 2};
    _$jscoverage['/ie/transform.js'].lineData[106]++;
    elemStyle.marginLeft = afterCenter.x - realCenter.x + 'px';
    _$jscoverage['/ie/transform.js'].lineData[107]++;
    elemStyle.marginTop = afterCenter.y - realCenter.y + 'px';
  } else {
    _$jscoverage['/ie/transform.js'].lineData[109]++;
    elemStyle.marginLeft = elemStyle.marginTop = 0;
  }
}};
  _$jscoverage['/ie/transform.js'].lineData[115]++;
  function getCenterByOrigin(m, origin, center) {
    _$jscoverage['/ie/transform.js'].functionData[3]++;
    _$jscoverage['/ie/transform.js'].lineData[116]++;
    var w = origin[0], h = origin[1];
    _$jscoverage['/ie/transform.js'].lineData[118]++;
    return multipleMatrix([[1, 0, w], [0, 1, h], [0, 0, 1]], m, [[1, 0, -w], [0, 1, -h], [0, 0, 1]], [[center.x], [center.y], [1]]);
  }
  _$jscoverage['/ie/transform.js'].lineData[133]++;
  function parseOrigin(origin, region) {
    _$jscoverage['/ie/transform.js'].functionData[4]++;
    _$jscoverage['/ie/transform.js'].lineData[134]++;
    origin = visit102_134_1(origin || '50% 50%');
    _$jscoverage['/ie/transform.js'].lineData[135]++;
    origin = origin.split(/\s+/);
    _$jscoverage['/ie/transform.js'].lineData[136]++;
    if (visit103_136_1(origin.length === 1)) {
      _$jscoverage['/ie/transform.js'].lineData[137]++;
      origin[1] = origin[0];
    }
    _$jscoverage['/ie/transform.js'].lineData[139]++;
    for (var i = 0; visit104_139_1(i < origin.length); i++) {
      _$jscoverage['/ie/transform.js'].lineData[140]++;
      var val = parseFloat(origin[i]);
      _$jscoverage['/ie/transform.js'].lineData[141]++;
      if (visit105_141_1(util.endsWith(origin[i], '%'))) {
        _$jscoverage['/ie/transform.js'].lineData[142]++;
        origin[i] = val * region[i ? 'height' : 'width'] / 100;
      } else {
        _$jscoverage['/ie/transform.js'].lineData[144]++;
        origin[i] = val;
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[147]++;
    return origin;
  }
  _$jscoverage['/ie/transform.js'].lineData[151]++;
  function matrix(transform) {
    _$jscoverage['/ie/transform.js'].functionData[5]++;
    _$jscoverage['/ie/transform.js'].lineData[152]++;
    transform = transform.split(')');
    _$jscoverage['/ie/transform.js'].lineData[153]++;
    var trim = util.trim, i = -1, l = transform.length - 1, split, prop, val, ret = cssMatrixToComputableMatrix([1, 0, 0, 1, 0, 0]), curr;
    _$jscoverage['/ie/transform.js'].lineData[161]++;
    while (visit106_161_1(++i < l)) {
      _$jscoverage['/ie/transform.js'].lineData[162]++;
      split = transform[i].split('(');
      _$jscoverage['/ie/transform.js'].lineData[163]++;
      prop = trim(split[0]);
      _$jscoverage['/ie/transform.js'].lineData[164]++;
      val = split[1];
      _$jscoverage['/ie/transform.js'].lineData[165]++;
      curr = [1, 0, 0, 1, 0, 0];
      _$jscoverage['/ie/transform.js'].lineData[166]++;
      switch (prop) {
        case 'translateX':
          _$jscoverage['/ie/transform.js'].lineData[168]++;
          curr[4] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[169]++;
          break;
        case 'translateY':
          _$jscoverage['/ie/transform.js'].lineData[172]++;
          curr[5] = parseInt(val, 10);
          _$jscoverage['/ie/transform.js'].lineData[173]++;
          break;
        case 'translate':
          _$jscoverage['/ie/transform.js'].lineData[176]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[177]++;
          curr[4] = parseInt(val[0], 10);
          _$jscoverage['/ie/transform.js'].lineData[178]++;
          curr[5] = parseInt(visit107_178_1(val[1] || 0), 10);
          _$jscoverage['/ie/transform.js'].lineData[179]++;
          break;
        case 'rotate':
          _$jscoverage['/ie/transform.js'].lineData[182]++;
          val = toRadian(val);
          _$jscoverage['/ie/transform.js'].lineData[183]++;
          curr[0] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[184]++;
          curr[1] = Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[185]++;
          curr[2] = -Math.sin(val);
          _$jscoverage['/ie/transform.js'].lineData[186]++;
          curr[3] = Math.cos(val);
          _$jscoverage['/ie/transform.js'].lineData[187]++;
          break;
        case 'scaleX':
          _$jscoverage['/ie/transform.js'].lineData[190]++;
          curr[0] = +val;
          _$jscoverage['/ie/transform.js'].lineData[191]++;
          break;
        case 'scaleY':
          _$jscoverage['/ie/transform.js'].lineData[194]++;
          curr[3] = +val;
          _$jscoverage['/ie/transform.js'].lineData[195]++;
          break;
        case 'scale':
          _$jscoverage['/ie/transform.js'].lineData[198]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[199]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[200]++;
          curr[3] = visit108_200_1(val.length > 1) ? +val[1] : +val[0];
          _$jscoverage['/ie/transform.js'].lineData[201]++;
          break;
        case 'skewX':
          _$jscoverage['/ie/transform.js'].lineData[204]++;
          curr[2] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[205]++;
          break;
        case 'skewY':
          _$jscoverage['/ie/transform.js'].lineData[208]++;
          curr[1] = Math.tan(toRadian(val));
          _$jscoverage['/ie/transform.js'].lineData[209]++;
          break;
        case 'skew':
          _$jscoverage['/ie/transform.js'].lineData[212]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[213]++;
          curr[2] = Math.tan(toRadian(val[0]));
          _$jscoverage['/ie/transform.js'].lineData[214]++;
          if (visit109_214_1(val.length > 1)) {
            _$jscoverage['/ie/transform.js'].lineData[215]++;
            curr[1] = Math.tan(toRadian(val[1]));
          }
          _$jscoverage['/ie/transform.js'].lineData[217]++;
          break;
        case 'matrix':
          _$jscoverage['/ie/transform.js'].lineData[220]++;
          val = val.split(',');
          _$jscoverage['/ie/transform.js'].lineData[221]++;
          curr[0] = +val[0];
          _$jscoverage['/ie/transform.js'].lineData[222]++;
          curr[1] = +val[1];
          _$jscoverage['/ie/transform.js'].lineData[223]++;
          curr[2] = +val[2];
          _$jscoverage['/ie/transform.js'].lineData[224]++;
          curr[3] = +val[3];
          _$jscoverage['/ie/transform.js'].lineData[225]++;
          curr[4] = parseInt(val[4], 10);
          _$jscoverage['/ie/transform.js'].lineData[226]++;
          curr[5] = parseInt(val[5], 10);
          _$jscoverage['/ie/transform.js'].lineData[227]++;
          break;
      }
      _$jscoverage['/ie/transform.js'].lineData[229]++;
      ret = multipleMatrix(ret, cssMatrixToComputableMatrix(curr));
    }
    _$jscoverage['/ie/transform.js'].lineData[232]++;
    return ret;
  }
  _$jscoverage['/ie/transform.js'].lineData[235]++;
  function cssMatrixToComputableMatrix(matrix) {
    _$jscoverage['/ie/transform.js'].functionData[6]++;
    _$jscoverage['/ie/transform.js'].lineData[236]++;
    return [[matrix[0], matrix[2], matrix[4]], [matrix[1], matrix[3], matrix[5]], [0, 0, 1]];
  }
  _$jscoverage['/ie/transform.js'].lineData[243]++;
  function setMatrix(m, x, y, v) {
    _$jscoverage['/ie/transform.js'].functionData[7]++;
    _$jscoverage['/ie/transform.js'].lineData[244]++;
    if (visit110_244_1(!m[x])) {
      _$jscoverage['/ie/transform.js'].lineData[245]++;
      m[x] = [];
    }
    _$jscoverage['/ie/transform.js'].lineData[247]++;
    m[x][y] = v;
  }
  _$jscoverage['/ie/transform.js'].lineData[250]++;
  function multipleMatrix(m1, m2) {
    _$jscoverage['/ie/transform.js'].functionData[8]++;
    _$jscoverage['/ie/transform.js'].lineData[251]++;
    var i;
    _$jscoverage['/ie/transform.js'].lineData[252]++;
    if (visit111_252_1(arguments.length > 2)) {
      _$jscoverage['/ie/transform.js'].lineData[253]++;
      var ret = m1;
      _$jscoverage['/ie/transform.js'].lineData[254]++;
      for (i = 1; visit112_254_1(i < arguments.length); i++) {
        _$jscoverage['/ie/transform.js'].lineData[255]++;
        ret = multipleMatrix(ret, arguments[i]);
      }
      _$jscoverage['/ie/transform.js'].lineData[257]++;
      return ret;
    }
    _$jscoverage['/ie/transform.js'].lineData[260]++;
    var m = [], r1 = m1.length, r2 = m2.length, c2 = m2[0].length;
    _$jscoverage['/ie/transform.js'].lineData[265]++;
    for (i = 0; visit113_265_1(i < r1); i++) {
      _$jscoverage['/ie/transform.js'].lineData[266]++;
      for (var k = 0; visit114_266_1(k < c2); k++) {
        _$jscoverage['/ie/transform.js'].lineData[267]++;
        var sum = 0;
        _$jscoverage['/ie/transform.js'].lineData[268]++;
        for (var j = 0; visit115_268_1(j < r2); j++) {
          _$jscoverage['/ie/transform.js'].lineData[269]++;
          sum += m1[i][j] * m2[j][k];
        }
        _$jscoverage['/ie/transform.js'].lineData[271]++;
        setMatrix(m, i, k, sum);
      }
    }
    _$jscoverage['/ie/transform.js'].lineData[275]++;
    return m;
  }
  _$jscoverage['/ie/transform.js'].lineData[279]++;
  function toRadian(value) {
    _$jscoverage['/ie/transform.js'].functionData[9]++;
    _$jscoverage['/ie/transform.js'].lineData[280]++;
    return visit116_280_1(value.indexOf('deg') > -1) ? parseInt(value, 10) * (Math.PI * 2 / 360) : parseFloat(value);
  }
});
