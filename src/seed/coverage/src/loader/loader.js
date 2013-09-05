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
if (! _$jscoverage['/loader/loader.js']) {
  _$jscoverage['/loader/loader.js'] = {};
  _$jscoverage['/loader/loader.js'].lineData = [];
  _$jscoverage['/loader/loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/loader.js'].lineData[13] = 0;
  _$jscoverage['/loader/loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/loader.js'].lineData[34] = 0;
  _$jscoverage['/loader/loader.js'].lineData[38] = 0;
  _$jscoverage['/loader/loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/loader.js'].lineData[71] = 0;
  _$jscoverage['/loader/loader.js'].lineData[72] = 0;
  _$jscoverage['/loader/loader.js'].lineData[73] = 0;
  _$jscoverage['/loader/loader.js'].lineData[74] = 0;
  _$jscoverage['/loader/loader.js'].lineData[76] = 0;
  _$jscoverage['/loader/loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/loader.js'].lineData[102] = 0;
  _$jscoverage['/loader/loader.js'].lineData[103] = 0;
  _$jscoverage['/loader/loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/loader.js'].lineData[113] = 0;
  _$jscoverage['/loader/loader.js'].lineData[115] = 0;
  _$jscoverage['/loader/loader.js'].lineData[116] = 0;
  _$jscoverage['/loader/loader.js'].lineData[117] = 0;
  _$jscoverage['/loader/loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/loader.js'].lineData[123] = 0;
  _$jscoverage['/loader/loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/loader.js'].lineData[130] = 0;
  _$jscoverage['/loader/loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/loader.js'].lineData[133] = 0;
  _$jscoverage['/loader/loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/loader.js'].lineData[143] = 0;
  _$jscoverage['/loader/loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/loader.js'].lineData[146] = 0;
  _$jscoverage['/loader/loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/loader.js'].lineData[153] = 0;
  _$jscoverage['/loader/loader.js'].lineData[155] = 0;
  _$jscoverage['/loader/loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/loader.js'].lineData[169] = 0;
  _$jscoverage['/loader/loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/loader.js'].lineData[171] = 0;
  _$jscoverage['/loader/loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/loader.js'].lineData[178] = 0;
  _$jscoverage['/loader/loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/loader.js'].lineData[187] = 0;
  _$jscoverage['/loader/loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/loader.js'].lineData[189] = 0;
  _$jscoverage['/loader/loader.js'].lineData[192] = 0;
  _$jscoverage['/loader/loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/loader.js'].lineData[201] = 0;
  _$jscoverage['/loader/loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/loader.js'].lineData[208] = 0;
  _$jscoverage['/loader/loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/loader.js'].lineData[214] = 0;
  _$jscoverage['/loader/loader.js'].lineData[215] = 0;
  _$jscoverage['/loader/loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/loader.js'].lineData[220] = 0;
  _$jscoverage['/loader/loader.js'].lineData[221] = 0;
  _$jscoverage['/loader/loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/loader.js'].lineData[227] = 0;
  _$jscoverage['/loader/loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/loader.js'].lineData[251] = 0;
  _$jscoverage['/loader/loader.js'].lineData[252] = 0;
  _$jscoverage['/loader/loader.js'].lineData[256] = 0;
  _$jscoverage['/loader/loader.js'].lineData[257] = 0;
  _$jscoverage['/loader/loader.js'].lineData[260] = 0;
  _$jscoverage['/loader/loader.js'].lineData[262] = 0;
  _$jscoverage['/loader/loader.js'].lineData[268] = 0;
  _$jscoverage['/loader/loader.js'].lineData[280] = 0;
}
if (! _$jscoverage['/loader/loader.js'].functionData) {
  _$jscoverage['/loader/loader.js'].functionData = [];
  _$jscoverage['/loader/loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/loader.js'].functionData[16] = 0;
}
if (! _$jscoverage['/loader/loader.js'].branchData) {
  _$jscoverage['/loader/loader.js'].branchData = {};
  _$jscoverage['/loader/loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['71'] = [];
  _$jscoverage['/loader/loader.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['73'] = [];
  _$jscoverage['/loader/loader.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['101'] = [];
  _$jscoverage['/loader/loader.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['116'] = [];
  _$jscoverage['/loader/loader.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['117'] = [];
  _$jscoverage['/loader/loader.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['118'] = [];
  _$jscoverage['/loader/loader.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['128'] = [];
  _$jscoverage['/loader/loader.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['129'] = [];
  _$jscoverage['/loader/loader.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['143'] = [];
  _$jscoverage['/loader/loader.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['152'] = [];
  _$jscoverage['/loader/loader.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['170'] = [];
  _$jscoverage['/loader/loader.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['187'] = [];
  _$jscoverage['/loader/loader.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['188'] = [];
  _$jscoverage['/loader/loader.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['194'] = [];
  _$jscoverage['/loader/loader.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['200'] = [];
  _$jscoverage['/loader/loader.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['201'] = [];
  _$jscoverage['/loader/loader.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['208'] = [];
  _$jscoverage['/loader/loader.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['214'] = [];
  _$jscoverage['/loader/loader.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['219'] = [];
  _$jscoverage['/loader/loader.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['250'] = [];
  _$jscoverage['/loader/loader.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['251'] = [];
  _$jscoverage['/loader/loader.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/loader/loader.js'].branchData['260'] = [];
  _$jscoverage['/loader/loader.js'].branchData['260'][1] = new BranchData();
}
_$jscoverage['/loader/loader.js'].branchData['260'][1].init(8395, 11, 'S.UA.nodejs');
function visit425_260_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['251'][1].init(18, 43, 'info = getBaseInfoFromOneScript(scripts[i])');
function visit424_251_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['250'][1].init(230, 6, 'i >= 0');
function visit423_250_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['219'][1].init(22, 23, 'part.match(baseTestReg)');
function visit422_219_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['214'][1].init(183, 35, 'base.charAt(base.length - 1) != \'/\'');
function visit421_214_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['208'][1].init(652, 11, 'index == -1');
function visit420_208_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['201'][1].init(501, 24, 'baseInfo.comboSep || \',\'');
function visit419_201_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['200'][1].init(427, 28, 'baseInfo.comboPrefix || \'??\'');
function visit418_200_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['194'][1].init(260, 8, 'baseInfo');
function visit417_194_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['188'][1].init(122, 23, '!src.match(baseTestReg)');
function visit416_188_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['187'][1].init(91, 16, 'script.src || \'\'');
function visit415_187_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['170'][1].init(118, 43, 'Utils.attachModsRecursively(moduleNames, S)');
function visit414_170_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['152'][1].init(2203, 4, 'sync');
function visit413_152_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['143'][1].init(1873, 14, 'Config.combine');
function visit412_143_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['129'][1].init(30, 4, 'sync');
function visit411_129_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['128'][1].init(26, 5, 'error');
function visit410_128_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['127'][1].init(680, 16, 'errorList.length');
function visit409_127_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['118'][1].init(30, 4, 'sync');
function visit408_118_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['117'][1].init(26, 7, 'success');
function visit407_117_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['116'][1].init(182, 3, 'ret');
function visit406_116_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['101'][1].init(230, 24, 'S.isPlainObject(success)');
function visit405_101_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['73'][1].init(127, 17, '!S.Config.combine');
function visit404_73_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['71'][1].init(18, 23, 'typeof name == \'string\'');
function visit403_71_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].branchData['27'][1].init(79, 36, 'fn && S.isEmptyObject(self.waitMods)');
function visit402_27_1(result) {
  _$jscoverage['/loader/loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/loader.js'].functionData[0]++;
  _$jscoverage['/loader/loader.js'].lineData[7]++;
  var Loader = KISSY.Loader, Env = S.Env, Utils = Loader.Utils, SimpleLoader = Loader.SimpleLoader, ComboLoader = Loader.ComboLoader;
  _$jscoverage['/loader/loader.js'].lineData[13]++;
  function WaitingModules(fn) {
    _$jscoverage['/loader/loader.js'].functionData[1]++;
    _$jscoverage['/loader/loader.js'].lineData[14]++;
    S.mix(this, {
  fn: fn, 
  waitMods: {}});
  }
  _$jscoverage['/loader/loader.js'].lineData[20]++;
  WaitingModules.prototype = {
  constructor: WaitingModules, 
  notifyAll: function() {
  _$jscoverage['/loader/loader.js'].functionData[2]++;
  _$jscoverage['/loader/loader.js'].lineData[25]++;
  var self = this, fn = self.fn;
  _$jscoverage['/loader/loader.js'].lineData[27]++;
  if (visit402_27_1(fn && S.isEmptyObject(self.waitMods))) {
    _$jscoverage['/loader/loader.js'].lineData[28]++;
    self.fn = null;
    _$jscoverage['/loader/loader.js'].lineData[29]++;
    fn();
  }
}, 
  add: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[3]++;
  _$jscoverage['/loader/loader.js'].lineData[34]++;
  this.waitMods[modName] = 1;
}, 
  remove: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[4]++;
  _$jscoverage['/loader/loader.js'].lineData[38]++;
  delete this.waitMods[modName];
}, 
  contains: function(modName) {
  _$jscoverage['/loader/loader.js'].functionData[5]++;
  _$jscoverage['/loader/loader.js'].lineData[42]++;
  return this.waitMods[modName];
}};
  _$jscoverage['/loader/loader.js'].lineData[47]++;
  Loader.WaitingModules = WaitingModules;
  _$jscoverage['/loader/loader.js'].lineData[49]++;
  S.mix(S, {
  add: function(name, fn, cfg) {
  _$jscoverage['/loader/loader.js'].functionData[6]++;
  _$jscoverage['/loader/loader.js'].lineData[71]++;
  if (visit403_71_1(typeof name == 'string')) {
    _$jscoverage['/loader/loader.js'].lineData[72]++;
    Utils.registerModule(S, name, fn, cfg);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[73]++;
    if (visit404_73_1(!S.Config.combine)) {
      _$jscoverage['/loader/loader.js'].lineData[74]++;
      SimpleLoader.add(name, fn, cfg, S);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[76]++;
      throw new Error('Unsupported KISSY.add format!');
    }
  }
}, 
  use: function(modNames, success) {
  _$jscoverage['/loader/loader.js'].functionData[7]++;
  _$jscoverage['/loader/loader.js'].lineData[94]++;
  var Config = S.Config, normalizedModNames, loader, error, sync, waitingModules = new WaitingModules(loadReady);
  _$jscoverage['/loader/loader.js'].lineData[101]++;
  if (visit405_101_1(S.isPlainObject(success))) {
    _$jscoverage['/loader/loader.js'].lineData[102]++;
    sync = success.sync;
    _$jscoverage['/loader/loader.js'].lineData[103]++;
    error = success.error;
    _$jscoverage['/loader/loader.js'].lineData[104]++;
    success = success.success;
  }
  _$jscoverage['/loader/loader.js'].lineData[107]++;
  modNames = Utils.getModNamesAsArray(modNames);
  _$jscoverage['/loader/loader.js'].lineData[108]++;
  modNames = Utils.normalizeModNamesWithAlias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[110]++;
  normalizedModNames = Utils.unalias(S, modNames);
  _$jscoverage['/loader/loader.js'].lineData[112]++;
  function loadReady() {
    _$jscoverage['/loader/loader.js'].functionData[8]++;
    _$jscoverage['/loader/loader.js'].lineData[113]++;
    var errorList = [], ret;
    _$jscoverage['/loader/loader.js'].lineData[115]++;
    ret = Utils.attachModsRecursively(normalizedModNames, S, undefined, errorList);
    _$jscoverage['/loader/loader.js'].lineData[116]++;
    if (visit406_116_1(ret)) {
      _$jscoverage['/loader/loader.js'].lineData[117]++;
      if (visit407_117_1(success)) {
        _$jscoverage['/loader/loader.js'].lineData[118]++;
        if (visit408_118_1(sync)) {
          _$jscoverage['/loader/loader.js'].lineData[119]++;
          success.apply(S, Utils.getModules(S, modNames));
        } else {
          _$jscoverage['/loader/loader.js'].lineData[122]++;
          setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[9]++;
  _$jscoverage['/loader/loader.js'].lineData[123]++;
  success.apply(S, Utils.getModules(S, modNames));
}, 0);
        }
      }
    } else {
      _$jscoverage['/loader/loader.js'].lineData[127]++;
      if (visit409_127_1(errorList.length)) {
        _$jscoverage['/loader/loader.js'].lineData[128]++;
        if (visit410_128_1(error)) {
          _$jscoverage['/loader/loader.js'].lineData[129]++;
          if (visit411_129_1(sync)) {
            _$jscoverage['/loader/loader.js'].lineData[130]++;
            error.apply(S, errorList);
          } else {
            _$jscoverage['/loader/loader.js'].lineData[132]++;
            setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[10]++;
  _$jscoverage['/loader/loader.js'].lineData[133]++;
  error.apply(S, errorList);
}, 0);
          }
        }
      } else {
        _$jscoverage['/loader/loader.js'].lineData[138]++;
        waitingModules.fn = loadReady;
        _$jscoverage['/loader/loader.js'].lineData[139]++;
        loader.use(normalizedModNames);
      }
    }
  }
  _$jscoverage['/loader/loader.js'].lineData[143]++;
  if (visit412_143_1(Config.combine)) {
    _$jscoverage['/loader/loader.js'].lineData[144]++;
    loader = new ComboLoader(S, waitingModules);
  } else {
    _$jscoverage['/loader/loader.js'].lineData[146]++;
    loader = new SimpleLoader(S, waitingModules);
  }
  _$jscoverage['/loader/loader.js'].lineData[152]++;
  if (visit413_152_1(sync)) {
    _$jscoverage['/loader/loader.js'].lineData[153]++;
    waitingModules.notifyAll();
  } else {
    _$jscoverage['/loader/loader.js'].lineData[155]++;
    setTimeout(function() {
  _$jscoverage['/loader/loader.js'].functionData[11]++;
  _$jscoverage['/loader/loader.js'].lineData[156]++;
  waitingModules.notifyAll();
}, 0);
  }
  _$jscoverage['/loader/loader.js'].lineData[159]++;
  return S;
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/loader.js'].functionData[12]++;
  _$jscoverage['/loader/loader.js'].lineData[169]++;
  var moduleNames = Utils.unalias(S, Utils.normalizeModNamesWithAlias(S, [moduleName]));
  _$jscoverage['/loader/loader.js'].lineData[170]++;
  if (visit414_170_1(Utils.attachModsRecursively(moduleNames, S))) {
    _$jscoverage['/loader/loader.js'].lineData[171]++;
    return Utils.getModules(S, moduleNames)[1];
  }
  _$jscoverage['/loader/loader.js'].lineData[173]++;
  return undefined;
}});
  _$jscoverage['/loader/loader.js'].lineData[177]++;
  function returnJson(s) {
    _$jscoverage['/loader/loader.js'].functionData[13]++;
    _$jscoverage['/loader/loader.js'].lineData[178]++;
    return (new Function('return ' + s))();
  }
  _$jscoverage['/loader/loader.js'].lineData[181]++;
  var baseReg = /^(.*)(seed|kissy)(?:-min)?\.js[^/]*/i, baseTestReg = /(seed|kissy)(?:-min)?\.js/i;
  _$jscoverage['/loader/loader.js'].lineData[184]++;
  function getBaseInfoFromOneScript(script) {
    _$jscoverage['/loader/loader.js'].functionData[14]++;
    _$jscoverage['/loader/loader.js'].lineData[187]++;
    var src = visit415_187_1(script.src || '');
    _$jscoverage['/loader/loader.js'].lineData[188]++;
    if (visit416_188_1(!src.match(baseTestReg))) {
      _$jscoverage['/loader/loader.js'].lineData[189]++;
      return 0;
    }
    _$jscoverage['/loader/loader.js'].lineData[192]++;
    var baseInfo = script.getAttribute('data-config');
    _$jscoverage['/loader/loader.js'].lineData[194]++;
    if (visit417_194_1(baseInfo)) {
      _$jscoverage['/loader/loader.js'].lineData[195]++;
      baseInfo = returnJson(baseInfo);
    } else {
      _$jscoverage['/loader/loader.js'].lineData[197]++;
      baseInfo = {};
    }
    _$jscoverage['/loader/loader.js'].lineData[200]++;
    var comboPrefix = baseInfo.comboPrefix = visit418_200_1(baseInfo.comboPrefix || '??');
    _$jscoverage['/loader/loader.js'].lineData[201]++;
    var comboSep = baseInfo.comboSep = visit419_201_1(baseInfo.comboSep || ',');
    _$jscoverage['/loader/loader.js'].lineData[203]++;
    var parts, base, index = src.indexOf(comboPrefix);
    _$jscoverage['/loader/loader.js'].lineData[208]++;
    if (visit420_208_1(index == -1)) {
      _$jscoverage['/loader/loader.js'].lineData[209]++;
      base = src.replace(baseReg, '$1');
    } else {
      _$jscoverage['/loader/loader.js'].lineData[211]++;
      base = src.substring(0, index);
      _$jscoverage['/loader/loader.js'].lineData[214]++;
      if (visit421_214_1(base.charAt(base.length - 1) != '/')) {
        _$jscoverage['/loader/loader.js'].lineData[215]++;
        base += '/';
      }
      _$jscoverage['/loader/loader.js'].lineData[217]++;
      parts = src.substring(index + comboPrefix.length).split(comboSep);
      _$jscoverage['/loader/loader.js'].lineData[218]++;
      S.each(parts, function(part) {
  _$jscoverage['/loader/loader.js'].functionData[15]++;
  _$jscoverage['/loader/loader.js'].lineData[219]++;
  if (visit422_219_1(part.match(baseTestReg))) {
    _$jscoverage['/loader/loader.js'].lineData[220]++;
    base += part.replace(baseReg, '$1');
    _$jscoverage['/loader/loader.js'].lineData[221]++;
    return false;
  }
  _$jscoverage['/loader/loader.js'].lineData[223]++;
  return undefined;
});
    }
    _$jscoverage['/loader/loader.js'].lineData[227]++;
    return S.mix({
  base: base}, baseInfo);
  }
  _$jscoverage['/loader/loader.js'].lineData[243]++;
  function getBaseInfo() {
    _$jscoverage['/loader/loader.js'].functionData[16]++;
    _$jscoverage['/loader/loader.js'].lineData[246]++;
    var scripts = Env.host.document.getElementsByTagName('script'), i, info;
    _$jscoverage['/loader/loader.js'].lineData[250]++;
    for (i = scripts.length - 1; visit423_250_1(i >= 0); i--) {
      _$jscoverage['/loader/loader.js'].lineData[251]++;
      if (visit424_251_1(info = getBaseInfoFromOneScript(scripts[i]))) {
        _$jscoverage['/loader/loader.js'].lineData[252]++;
        return info;
      }
    }
    _$jscoverage['/loader/loader.js'].lineData[256]++;
    S.error('must load kissy by file name: seed.js or seed-min.js');
    _$jscoverage['/loader/loader.js'].lineData[257]++;
    return null;
  }
  _$jscoverage['/loader/loader.js'].lineData[260]++;
  if (visit425_260_1(S.UA.nodejs)) {
    _$jscoverage['/loader/loader.js'].lineData[262]++;
    S.config({
  charset: 'utf-8', 
  base: __dirname.replace(/\\/g, '/').replace(/\/$/, '') + '/'});
  } else {
    _$jscoverage['/loader/loader.js'].lineData[268]++;
    S.config(S.mix({
  comboMaxUrlLength: 2000, 
  comboMaxFileNum: 40, 
  charset: 'utf-8', 
  lang: 'zh-cn', 
  tag: '@TIMESTAMP@'}, getBaseInfo()));
  }
  _$jscoverage['/loader/loader.js'].lineData[280]++;
  Env.mods = {};
})(KISSY);
