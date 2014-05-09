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
if (! _$jscoverage['/runtime.js']) {
  _$jscoverage['/runtime.js'] = {};
  _$jscoverage['/runtime.js'].lineData = [];
  _$jscoverage['/runtime.js'].lineData[6] = 0;
  _$jscoverage['/runtime.js'].lineData[7] = 0;
  _$jscoverage['/runtime.js'].lineData[8] = 0;
  _$jscoverage['/runtime.js'].lineData[9] = 0;
  _$jscoverage['/runtime.js'].lineData[10] = 0;
  _$jscoverage['/runtime.js'].lineData[11] = 0;
  _$jscoverage['/runtime.js'].lineData[13] = 0;
  _$jscoverage['/runtime.js'].lineData[14] = 0;
  _$jscoverage['/runtime.js'].lineData[15] = 0;
  _$jscoverage['/runtime.js'].lineData[16] = 0;
  _$jscoverage['/runtime.js'].lineData[17] = 0;
  _$jscoverage['/runtime.js'].lineData[19] = 0;
  _$jscoverage['/runtime.js'].lineData[20] = 0;
  _$jscoverage['/runtime.js'].lineData[21] = 0;
  _$jscoverage['/runtime.js'].lineData[22] = 0;
  _$jscoverage['/runtime.js'].lineData[23] = 0;
  _$jscoverage['/runtime.js'].lineData[24] = 0;
  _$jscoverage['/runtime.js'].lineData[28] = 0;
  _$jscoverage['/runtime.js'].lineData[31] = 0;
  _$jscoverage['/runtime.js'].lineData[32] = 0;
  _$jscoverage['/runtime.js'].lineData[33] = 0;
  _$jscoverage['/runtime.js'].lineData[34] = 0;
  _$jscoverage['/runtime.js'].lineData[35] = 0;
  _$jscoverage['/runtime.js'].lineData[36] = 0;
  _$jscoverage['/runtime.js'].lineData[37] = 0;
  _$jscoverage['/runtime.js'].lineData[38] = 0;
  _$jscoverage['/runtime.js'].lineData[39] = 0;
  _$jscoverage['/runtime.js'].lineData[41] = 0;
  _$jscoverage['/runtime.js'].lineData[44] = 0;
  _$jscoverage['/runtime.js'].lineData[47] = 0;
  _$jscoverage['/runtime.js'].lineData[48] = 0;
  _$jscoverage['/runtime.js'].lineData[49] = 0;
  _$jscoverage['/runtime.js'].lineData[50] = 0;
  _$jscoverage['/runtime.js'].lineData[54] = 0;
  _$jscoverage['/runtime.js'].lineData[55] = 0;
  _$jscoverage['/runtime.js'].lineData[57] = 0;
  _$jscoverage['/runtime.js'].lineData[58] = 0;
  _$jscoverage['/runtime.js'].lineData[59] = 0;
  _$jscoverage['/runtime.js'].lineData[61] = 0;
  _$jscoverage['/runtime.js'].lineData[64] = 0;
  _$jscoverage['/runtime.js'].lineData[65] = 0;
  _$jscoverage['/runtime.js'].lineData[66] = 0;
  _$jscoverage['/runtime.js'].lineData[67] = 0;
  _$jscoverage['/runtime.js'].lineData[68] = 0;
  _$jscoverage['/runtime.js'].lineData[69] = 0;
  _$jscoverage['/runtime.js'].lineData[71] = 0;
  _$jscoverage['/runtime.js'].lineData[72] = 0;
  _$jscoverage['/runtime.js'].lineData[74] = 0;
  _$jscoverage['/runtime.js'].lineData[76] = 0;
  _$jscoverage['/runtime.js'].lineData[77] = 0;
  _$jscoverage['/runtime.js'].lineData[78] = 0;
  _$jscoverage['/runtime.js'].lineData[79] = 0;
  _$jscoverage['/runtime.js'].lineData[80] = 0;
  _$jscoverage['/runtime.js'].lineData[83] = 0;
  _$jscoverage['/runtime.js'].lineData[84] = 0;
  _$jscoverage['/runtime.js'].lineData[86] = 0;
  _$jscoverage['/runtime.js'].lineData[89] = 0;
  _$jscoverage['/runtime.js'].lineData[91] = 0;
  _$jscoverage['/runtime.js'].lineData[94] = 0;
  _$jscoverage['/runtime.js'].lineData[109] = 0;
  _$jscoverage['/runtime.js'].lineData[110] = 0;
  _$jscoverage['/runtime.js'].lineData[111] = 0;
  _$jscoverage['/runtime.js'].lineData[112] = 0;
  _$jscoverage['/runtime.js'].lineData[113] = 0;
  _$jscoverage['/runtime.js'].lineData[116] = 0;
  _$jscoverage['/runtime.js'].lineData[130] = 0;
  _$jscoverage['/runtime.js'].lineData[141] = 0;
  _$jscoverage['/runtime.js'].lineData[145] = 0;
  _$jscoverage['/runtime.js'].lineData[147] = 0;
  _$jscoverage['/runtime.js'].lineData[148] = 0;
  _$jscoverage['/runtime.js'].lineData[149] = 0;
  _$jscoverage['/runtime.js'].lineData[151] = 0;
  _$jscoverage['/runtime.js'].lineData[152] = 0;
  _$jscoverage['/runtime.js'].lineData[154] = 0;
  _$jscoverage['/runtime.js'].lineData[156] = 0;
  _$jscoverage['/runtime.js'].lineData[157] = 0;
  _$jscoverage['/runtime.js'].lineData[158] = 0;
  _$jscoverage['/runtime.js'].lineData[160] = 0;
  _$jscoverage['/runtime.js'].lineData[162] = 0;
  _$jscoverage['/runtime.js'].lineData[165] = 0;
  _$jscoverage['/runtime.js'].lineData[175] = 0;
  _$jscoverage['/runtime.js'].lineData[176] = 0;
  _$jscoverage['/runtime.js'].lineData[177] = 0;
  _$jscoverage['/runtime.js'].lineData[179] = 0;
  _$jscoverage['/runtime.js'].lineData[181] = 0;
  _$jscoverage['/runtime.js'].lineData[182] = 0;
  _$jscoverage['/runtime.js'].lineData[192] = 0;
  _$jscoverage['/runtime.js'].lineData[200] = 0;
  _$jscoverage['/runtime.js'].lineData[201] = 0;
  _$jscoverage['/runtime.js'].lineData[202] = 0;
  _$jscoverage['/runtime.js'].lineData[212] = 0;
  _$jscoverage['/runtime.js'].lineData[213] = 0;
  _$jscoverage['/runtime.js'].lineData[214] = 0;
  _$jscoverage['/runtime.js'].lineData[218] = 0;
  _$jscoverage['/runtime.js'].lineData[219] = 0;
  _$jscoverage['/runtime.js'].lineData[220] = 0;
  _$jscoverage['/runtime.js'].lineData[221] = 0;
  _$jscoverage['/runtime.js'].lineData[222] = 0;
  _$jscoverage['/runtime.js'].lineData[223] = 0;
  _$jscoverage['/runtime.js'].lineData[225] = 0;
  _$jscoverage['/runtime.js'].lineData[243] = 0;
  _$jscoverage['/runtime.js'].lineData[244] = 0;
  _$jscoverage['/runtime.js'].lineData[245] = 0;
  _$jscoverage['/runtime.js'].lineData[246] = 0;
  _$jscoverage['/runtime.js'].lineData[247] = 0;
  _$jscoverage['/runtime.js'].lineData[249] = 0;
  _$jscoverage['/runtime.js'].lineData[250] = 0;
  _$jscoverage['/runtime.js'].lineData[251] = 0;
  _$jscoverage['/runtime.js'].lineData[253] = 0;
  _$jscoverage['/runtime.js'].lineData[255] = 0;
  _$jscoverage['/runtime.js'].lineData[261] = 0;
  _$jscoverage['/runtime.js'].lineData[265] = 0;
  _$jscoverage['/runtime.js'].lineData[267] = 0;
}
if (! _$jscoverage['/runtime.js'].functionData) {
  _$jscoverage['/runtime.js'].functionData = [];
  _$jscoverage['/runtime.js'].functionData[0] = 0;
  _$jscoverage['/runtime.js'].functionData[1] = 0;
  _$jscoverage['/runtime.js'].functionData[2] = 0;
  _$jscoverage['/runtime.js'].functionData[3] = 0;
  _$jscoverage['/runtime.js'].functionData[4] = 0;
  _$jscoverage['/runtime.js'].functionData[5] = 0;
  _$jscoverage['/runtime.js'].functionData[6] = 0;
  _$jscoverage['/runtime.js'].functionData[7] = 0;
  _$jscoverage['/runtime.js'].functionData[8] = 0;
  _$jscoverage['/runtime.js'].functionData[9] = 0;
  _$jscoverage['/runtime.js'].functionData[10] = 0;
  _$jscoverage['/runtime.js'].functionData[11] = 0;
  _$jscoverage['/runtime.js'].functionData[12] = 0;
  _$jscoverage['/runtime.js'].functionData[13] = 0;
  _$jscoverage['/runtime.js'].functionData[14] = 0;
  _$jscoverage['/runtime.js'].functionData[15] = 0;
  _$jscoverage['/runtime.js'].functionData[16] = 0;
  _$jscoverage['/runtime.js'].functionData[17] = 0;
  _$jscoverage['/runtime.js'].functionData[18] = 0;
  _$jscoverage['/runtime.js'].functionData[19] = 0;
}
if (! _$jscoverage['/runtime.js'].branchData) {
  _$jscoverage['/runtime.js'].branchData = {};
  _$jscoverage['/runtime.js'].branchData['15'] = [];
  _$jscoverage['/runtime.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['16'] = [];
  _$jscoverage['/runtime.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['19'] = [];
  _$jscoverage['/runtime.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['21'] = [];
  _$jscoverage['/runtime.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['23'] = [];
  _$jscoverage['/runtime.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['35'] = [];
  _$jscoverage['/runtime.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['37'] = [];
  _$jscoverage['/runtime.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['38'] = [];
  _$jscoverage['/runtime.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['49'] = [];
  _$jscoverage['/runtime.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['57'] = [];
  _$jscoverage['/runtime.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['68'] = [];
  _$jscoverage['/runtime.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['71'] = [];
  _$jscoverage['/runtime.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['76'] = [];
  _$jscoverage['/runtime.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['79'] = [];
  _$jscoverage['/runtime.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['83'] = [];
  _$jscoverage['/runtime.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['112'] = [];
  _$jscoverage['/runtime.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['148'] = [];
  _$jscoverage['/runtime.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['151'] = [];
  _$jscoverage['/runtime.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['156'] = [];
  _$jscoverage['/runtime.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['157'] = [];
  _$jscoverage['/runtime.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['176'] = [];
  _$jscoverage['/runtime.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['201'] = [];
  _$jscoverage['/runtime.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['213'] = [];
  _$jscoverage['/runtime.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['222'] = [];
  _$jscoverage['/runtime.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['246'] = [];
  _$jscoverage['/runtime.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/runtime.js'].branchData['250'] = [];
  _$jscoverage['/runtime.js'].branchData['250'][1] = new BranchData();
}
_$jscoverage['/runtime.js'].branchData['250'][1].init(254, 20, '!name && fn.TPL_NAME');
function visit81_250_1(result) {
  _$jscoverage['/runtime.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['246'][1].init(114, 79, 'callback || function(error, ret) {\n  html = ret;\n}');
function visit80_246_1(result) {
  _$jscoverage['/runtime.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['222'][1].init(26, 5, 'error');
function visit79_222_1(result) {
  _$jscoverage['/runtime.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['213'][1].init(71, 21, 'config.commands || {}');
function visit78_213_1(result) {
  _$jscoverage['/runtime.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['201'][1].init(57, 15, 'config.commands');
function visit77_201_1(result) {
  _$jscoverage['/runtime.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['176'][1].init(58, 3, 'tpl');
function visit76_176_1(result) {
  _$jscoverage['/runtime.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['157'][1].init(389, 14, 'cache[subName]');
function visit75_157_1(result) {
  _$jscoverage['/runtime.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['156'][1].init(337, 37, 'subNameResolveCache[parentName] || {}');
function visit74_156_1(result) {
  _$jscoverage['/runtime.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['151'][1].init(96, 11, '!parentName');
function visit73_151_1(result) {
  _$jscoverage['/runtime.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['148'][1].init(14, 25, 'subName.charAt(0) !== \'.\'');
function visit72_148_1(result) {
  _$jscoverage['/runtime.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['112'][1].init(68, 12, 'config || {}');
function visit71_112_1(result) {
  _$jscoverage['/runtime.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['83'][1].init(687, 5, 'error');
function visit70_83_1(result) {
  _$jscoverage['/runtime.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['79'][1].init(133, 2, 'fn');
function visit69_79_1(result) {
  _$jscoverage['/runtime.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['76'][1].init(435, 14, 'resolveInScope');
function visit68_76_1(result) {
  _$jscoverage['/runtime.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['71'][1].init(207, 8, 'command1');
function visit67_71_1(result) {
  _$jscoverage['/runtime.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['68'][1].init(119, 6, '!depth');
function visit66_68_1(result) {
  _$jscoverage['/runtime.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['57'][1].init(452, 13, 'extendTplName');
function visit65_57_1(result) {
  _$jscoverage['/runtime.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][2].init(54, 24, 'S.version !== fn.version');
function visit64_49_2(result) {
  _$jscoverage['/runtime.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['49'][1].init(40, 38, 'fn.version && S.version !== fn.version');
function visit63_49_1(result) {
  _$jscoverage['/runtime.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['38'][1].init(102, 16, 'subPart === \'..\'');
function visit62_38_1(result) {
  _$jscoverage['/runtime.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['37'][1].init(58, 15, 'subPart === \'.\'');
function visit61_37_1(result) {
  _$jscoverage['/runtime.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['35'][1].init(157, 5, 'i < l');
function visit60_35_1(result) {
  _$jscoverage['/runtime.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['23'][1].init(60, 4, '!cmd');
function visit59_23_1(result) {
  _$jscoverage['/runtime.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['21'][1].init(67, 7, 'i < len');
function visit58_21_1(result) {
  _$jscoverage['/runtime.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['19'][1].init(190, 3, 'cmd');
function visit57_19_1(result) {
  _$jscoverage['/runtime.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['16'][1].init(119, 18, 'parts.length === 1');
function visit56_16_1(result) {
  _$jscoverage['/runtime.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][2].init(50, 36, 'localCommands && localCommands[name]');
function visit55_15_2(result) {
  _$jscoverage['/runtime.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].branchData['15'][1].init(50, 54, 'localCommands && localCommands[name] || commands[name]');
function visit54_15_1(result) {
  _$jscoverage['/runtime.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/runtime.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/runtime.js'].functionData[0]++;
  _$jscoverage['/runtime.js'].lineData[7]++;
  require('util');
  _$jscoverage['/runtime.js'].lineData[8]++;
  var nativeCommands = require('./runtime/commands');
  _$jscoverage['/runtime.js'].lineData[9]++;
  var commands = {};
  _$jscoverage['/runtime.js'].lineData[10]++;
  var Scope = require('./runtime/scope');
  _$jscoverage['/runtime.js'].lineData[11]++;
  var LinkedBuffer = require('./runtime/linked-buffer');
  _$jscoverage['/runtime.js'].lineData[13]++;
  function findCommand(localCommands, parts) {
    _$jscoverage['/runtime.js'].functionData[1]++;
    _$jscoverage['/runtime.js'].lineData[14]++;
    var name = parts[0];
    _$jscoverage['/runtime.js'].lineData[15]++;
    var cmd = visit54_15_1(visit55_15_2(localCommands && localCommands[name]) || commands[name]);
    _$jscoverage['/runtime.js'].lineData[16]++;
    if (visit56_16_1(parts.length === 1)) {
      _$jscoverage['/runtime.js'].lineData[17]++;
      return cmd;
    }
    _$jscoverage['/runtime.js'].lineData[19]++;
    if (visit57_19_1(cmd)) {
      _$jscoverage['/runtime.js'].lineData[20]++;
      var len = parts.length;
      _$jscoverage['/runtime.js'].lineData[21]++;
      for (var i = 1; visit58_21_1(i < len); i++) {
        _$jscoverage['/runtime.js'].lineData[22]++;
        cmd = cmd[parts[i]];
        _$jscoverage['/runtime.js'].lineData[23]++;
        if (visit59_23_1(!cmd)) {
          _$jscoverage['/runtime.js'].lineData[24]++;
          break;
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[28]++;
    return cmd;
  }
  _$jscoverage['/runtime.js'].lineData[31]++;
  function getSubNameFromParentName(parentName, subName) {
    _$jscoverage['/runtime.js'].functionData[2]++;
    _$jscoverage['/runtime.js'].lineData[32]++;
    var parts = parentName.split('/');
    _$jscoverage['/runtime.js'].lineData[33]++;
    var subParts = subName.split('/');
    _$jscoverage['/runtime.js'].lineData[34]++;
    parts.pop();
    _$jscoverage['/runtime.js'].lineData[35]++;
    for (var i = 0, l = subParts.length; visit60_35_1(i < l); i++) {
      _$jscoverage['/runtime.js'].lineData[36]++;
      var subPart = subParts[i];
      _$jscoverage['/runtime.js'].lineData[37]++;
      if (visit61_37_1(subPart === '.')) {
      } else {
        _$jscoverage['/runtime.js'].lineData[38]++;
        if (visit62_38_1(subPart === '..')) {
          _$jscoverage['/runtime.js'].lineData[39]++;
          parts.pop();
        } else {
          _$jscoverage['/runtime.js'].lineData[41]++;
          parts.push(subPart);
        }
      }
    }
    _$jscoverage['/runtime.js'].lineData[44]++;
    return parts.join('/');
  }
  _$jscoverage['/runtime.js'].lineData[47]++;
  function renderTpl(tpl, scope, buffer) {
    _$jscoverage['/runtime.js'].functionData[3]++;
    _$jscoverage['/runtime.js'].lineData[48]++;
    var fn = tpl.fn;
    _$jscoverage['/runtime.js'].lineData[49]++;
    if (visit63_49_1(fn.version && visit64_49_2(S.version !== fn.version))) {
      _$jscoverage['/runtime.js'].lineData[50]++;
      throw new Error('current xtemplate file(' + tpl.name + ')(v' + fn.version + ')need to be recompiled using current kissy(v' + S.version + ')!');
    }
    _$jscoverage['/runtime.js'].lineData[54]++;
    buffer = tpl.fn.call(tpl, scope, buffer);
    _$jscoverage['/runtime.js'].lineData[55]++;
    var extendTplName = tpl.session.extendTplName;
    _$jscoverage['/runtime.js'].lineData[57]++;
    if (visit65_57_1(extendTplName)) {
      _$jscoverage['/runtime.js'].lineData[58]++;
      delete tpl.session.extendTplName;
      _$jscoverage['/runtime.js'].lineData[59]++;
      buffer = tpl.root.include(extendTplName, tpl, scope, buffer);
    }
    _$jscoverage['/runtime.js'].lineData[61]++;
    return buffer.end();
  }
  _$jscoverage['/runtime.js'].lineData[64]++;
  function callFn(tpl, scope, option, buffer, parts, depth, line, resolveInScope) {
    _$jscoverage['/runtime.js'].functionData[4]++;
    _$jscoverage['/runtime.js'].lineData[65]++;
    var commands = tpl.root.config.commands;
    _$jscoverage['/runtime.js'].lineData[66]++;
    var error, caller, fn;
    _$jscoverage['/runtime.js'].lineData[67]++;
    var command1;
    _$jscoverage['/runtime.js'].lineData[68]++;
    if (visit66_68_1(!depth)) {
      _$jscoverage['/runtime.js'].lineData[69]++;
      command1 = findCommand(commands, parts);
    }
    _$jscoverage['/runtime.js'].lineData[71]++;
    if (visit67_71_1(command1)) {
      _$jscoverage['/runtime.js'].lineData[72]++;
      return command1.call(tpl, scope, option, buffer, line);
    } else {
      _$jscoverage['/runtime.js'].lineData[74]++;
      error = 'in file: ' + tpl.name + ' can not call: ' + parts.join('.') + '" at line ' + line;
    }
    _$jscoverage['/runtime.js'].lineData[76]++;
    if (visit68_76_1(resolveInScope)) {
      _$jscoverage['/runtime.js'].lineData[77]++;
      caller = scope.resolve(parts.slice(0, -1), depth);
      _$jscoverage['/runtime.js'].lineData[78]++;
      fn = caller[parts[parts.length - 1]];
      _$jscoverage['/runtime.js'].lineData[79]++;
      if (visit69_79_1(fn)) {
        _$jscoverage['/runtime.js'].lineData[80]++;
        return fn.apply(caller, option.params);
      }
    }
    _$jscoverage['/runtime.js'].lineData[83]++;
    if (visit70_83_1(error)) {
      _$jscoverage['/runtime.js'].lineData[84]++;
      S.error(error);
    }
    _$jscoverage['/runtime.js'].lineData[86]++;
    return buffer;
  }
  _$jscoverage['/runtime.js'].lineData[89]++;
  var utils = {
  callFn: function(tpl, scope, option, buffer, parts, depth, line) {
  _$jscoverage['/runtime.js'].functionData[5]++;
  _$jscoverage['/runtime.js'].lineData[91]++;
  return callFn(tpl, scope, option, buffer, parts, depth, line, true);
}, 
  callCommand: function(tpl, scope, option, buffer, parts, line) {
  _$jscoverage['/runtime.js'].functionData[6]++;
  _$jscoverage['/runtime.js'].lineData[94]++;
  return callFn(tpl, scope, option, buffer, parts, 0, line, true);
}};
  _$jscoverage['/runtime.js'].lineData[109]++;
  function XTemplateRuntime(fn, config) {
    _$jscoverage['/runtime.js'].functionData[7]++;
    _$jscoverage['/runtime.js'].lineData[110]++;
    var self = this;
    _$jscoverage['/runtime.js'].lineData[111]++;
    self.fn = fn;
    _$jscoverage['/runtime.js'].lineData[112]++;
    config = visit71_112_1(config || {});
    _$jscoverage['/runtime.js'].lineData[113]++;
    self.config = config;
  }
  _$jscoverage['/runtime.js'].lineData[116]++;
  S.mix(XTemplateRuntime, {
  nativeCommands: nativeCommands, 
  utils: utils, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[8]++;
  _$jscoverage['/runtime.js'].lineData[130]++;
  commands[commandName] = fn;
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[9]++;
  _$jscoverage['/runtime.js'].lineData[141]++;
  delete commands[commandName];
}});
  _$jscoverage['/runtime.js'].lineData[145]++;
  var subNameResolveCache = {};
  _$jscoverage['/runtime.js'].lineData[147]++;
  function resolve(subName, parentName) {
    _$jscoverage['/runtime.js'].functionData[10]++;
    _$jscoverage['/runtime.js'].lineData[148]++;
    if (visit72_148_1(subName.charAt(0) !== '.')) {
      _$jscoverage['/runtime.js'].lineData[149]++;
      return subName;
    }
    _$jscoverage['/runtime.js'].lineData[151]++;
    if (visit73_151_1(!parentName)) {
      _$jscoverage['/runtime.js'].lineData[152]++;
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
      _$jscoverage['/runtime.js'].lineData[154]++;
      throw new Error(error);
    }
    _$jscoverage['/runtime.js'].lineData[156]++;
    var cache = subNameResolveCache[parentName] = visit74_156_1(subNameResolveCache[parentName] || {});
    _$jscoverage['/runtime.js'].lineData[157]++;
    if (visit75_157_1(cache[subName])) {
      _$jscoverage['/runtime.js'].lineData[158]++;
      return cache[subName];
    }
    _$jscoverage['/runtime.js'].lineData[160]++;
    subName = cache[subName] = getSubNameFromParentName(parentName, subName);
    _$jscoverage['/runtime.js'].lineData[162]++;
    return subName;
  }
  _$jscoverage['/runtime.js'].lineData[165]++;
  XTemplateRuntime.prototype = {
  constructor: XTemplateRuntime, 
  Scope: Scope, 
  nativeCommands: nativeCommands, 
  utils: utils, 
  getTplContent: function(name, callback) {
  _$jscoverage['/runtime.js'].functionData[11]++;
  _$jscoverage['/runtime.js'].lineData[175]++;
  var tpl = S.require(name);
  _$jscoverage['/runtime.js'].lineData[176]++;
  if (visit76_176_1(tpl)) {
    _$jscoverage['/runtime.js'].lineData[177]++;
    return callback(undefined, tpl);
  } else {
    _$jscoverage['/runtime.js'].lineData[179]++;
    var error = 'template "' + name + '" does not exist, ' + 'better required or used first for performance!';
    _$jscoverage['/runtime.js'].lineData[181]++;
    S.log(error, 'error');
    _$jscoverage['/runtime.js'].lineData[182]++;
    callback(error);
  }
}, 
  load: function(name, callback) {
  _$jscoverage['/runtime.js'].functionData[12]++;
  _$jscoverage['/runtime.js'].lineData[192]++;
  this.getTplContent(name, callback);
}, 
  removeCommand: function(commandName) {
  _$jscoverage['/runtime.js'].functionData[13]++;
  _$jscoverage['/runtime.js'].lineData[200]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[201]++;
  if (visit77_201_1(config.commands)) {
    _$jscoverage['/runtime.js'].lineData[202]++;
    delete config.commands[commandName];
  }
}, 
  addCommand: function(commandName, fn) {
  _$jscoverage['/runtime.js'].functionData[14]++;
  _$jscoverage['/runtime.js'].lineData[212]++;
  var config = this.config;
  _$jscoverage['/runtime.js'].lineData[213]++;
  config.commands = visit78_213_1(config.commands || {});
  _$jscoverage['/runtime.js'].lineData[214]++;
  config.commands[commandName] = fn;
}, 
  include: function(subTplName, tpl, scope, buffer) {
  _$jscoverage['/runtime.js'].functionData[15]++;
  _$jscoverage['/runtime.js'].lineData[218]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[219]++;
  subTplName = resolve(subTplName, tpl.name);
  _$jscoverage['/runtime.js'].lineData[220]++;
  return buffer.async(function(newBuffer) {
  _$jscoverage['/runtime.js'].functionData[16]++;
  _$jscoverage['/runtime.js'].lineData[221]++;
  self.load(subTplName, function(error, tplFn) {
  _$jscoverage['/runtime.js'].functionData[17]++;
  _$jscoverage['/runtime.js'].lineData[222]++;
  if (visit79_222_1(error)) {
    _$jscoverage['/runtime.js'].lineData[223]++;
    newBuffer.error(error);
  } else {
    _$jscoverage['/runtime.js'].lineData[225]++;
    renderTpl({
  root: tpl.root, 
  fn: tplFn, 
  name: subTplName, 
  session: tpl.session}, scope, newBuffer);
  }
});
});
}, 
  render: function(data, callback) {
  _$jscoverage['/runtime.js'].functionData[18]++;
  _$jscoverage['/runtime.js'].lineData[243]++;
  var html = '';
  _$jscoverage['/runtime.js'].lineData[244]++;
  var self = this;
  _$jscoverage['/runtime.js'].lineData[245]++;
  var fn = self.fn;
  _$jscoverage['/runtime.js'].lineData[246]++;
  callback = visit80_246_1(callback || function(error, ret) {
  _$jscoverage['/runtime.js'].functionData[19]++;
  _$jscoverage['/runtime.js'].lineData[247]++;
  html = ret;
});
  _$jscoverage['/runtime.js'].lineData[249]++;
  var name = self.config.name;
  _$jscoverage['/runtime.js'].lineData[250]++;
  if (visit81_250_1(!name && fn.TPL_NAME)) {
    _$jscoverage['/runtime.js'].lineData[251]++;
    name = fn.TPL_NAME;
  }
  _$jscoverage['/runtime.js'].lineData[253]++;
  var scope = new Scope(data), buffer = new LinkedBuffer(callback).head;
  _$jscoverage['/runtime.js'].lineData[255]++;
  renderTpl({
  name: name, 
  fn: fn, 
  session: {}, 
  root: self}, scope, buffer);
  _$jscoverage['/runtime.js'].lineData[261]++;
  return html;
}};
  _$jscoverage['/runtime.js'].lineData[265]++;
  XTemplateRuntime.Scope = Scope;
  _$jscoverage['/runtime.js'].lineData[267]++;
  return XTemplateRuntime;
});
