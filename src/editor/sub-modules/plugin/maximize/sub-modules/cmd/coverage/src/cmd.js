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
if (! _$jscoverage['/cmd.js']) {
  _$jscoverage['/cmd.js'] = {};
  _$jscoverage['/cmd.js'].lineData = [];
  _$jscoverage['/cmd.js'].lineData[6] = 0;
  _$jscoverage['/cmd.js'].lineData[7] = 0;
  _$jscoverage['/cmd.js'].lineData[8] = 0;
  _$jscoverage['/cmd.js'].lineData[10] = 0;
  _$jscoverage['/cmd.js'].lineData[18] = 0;
  _$jscoverage['/cmd.js'].lineData[19] = 0;
  _$jscoverage['/cmd.js'].lineData[29] = 0;
  _$jscoverage['/cmd.js'].lineData[30] = 0;
  _$jscoverage['/cmd.js'].lineData[33] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[39] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[48] = 0;
  _$jscoverage['/cmd.js'].lineData[52] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[58] = 0;
  _$jscoverage['/cmd.js'].lineData[59] = 0;
  _$jscoverage['/cmd.js'].lineData[68] = 0;
  _$jscoverage['/cmd.js'].lineData[73] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[78] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[85] = 0;
  _$jscoverage['/cmd.js'].lineData[88] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[97] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[100] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[107] = 0;
  _$jscoverage['/cmd.js'].lineData[108] = 0;
  _$jscoverage['/cmd.js'].lineData[117] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[122] = 0;
  _$jscoverage['/cmd.js'].lineData[124] = 0;
  _$jscoverage['/cmd.js'].lineData[125] = 0;
  _$jscoverage['/cmd.js'].lineData[126] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[132] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[134] = 0;
  _$jscoverage['/cmd.js'].lineData[138] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[142] = 0;
  _$jscoverage['/cmd.js'].lineData[145] = 0;
  _$jscoverage['/cmd.js'].lineData[146] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[160] = 0;
  _$jscoverage['/cmd.js'].lineData[162] = 0;
  _$jscoverage['/cmd.js'].lineData[164] = 0;
  _$jscoverage['/cmd.js'].lineData[172] = 0;
  _$jscoverage['/cmd.js'].lineData[181] = 0;
  _$jscoverage['/cmd.js'].lineData[182] = 0;
  _$jscoverage['/cmd.js'].lineData[185] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[190] = 0;
  _$jscoverage['/cmd.js'].lineData[191] = 0;
  _$jscoverage['/cmd.js'].lineData[194] = 0;
  _$jscoverage['/cmd.js'].lineData[195] = 0;
  _$jscoverage['/cmd.js'].lineData[209] = 0;
  _$jscoverage['/cmd.js'].lineData[219] = 0;
  _$jscoverage['/cmd.js'].lineData[220] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[228] = 0;
  _$jscoverage['/cmd.js'].lineData[230] = 0;
  _$jscoverage['/cmd.js'].lineData[235] = 0;
  _$jscoverage['/cmd.js'].lineData[240] = 0;
  _$jscoverage['/cmd.js'].lineData[244] = 0;
  _$jscoverage['/cmd.js'].lineData[249] = 0;
  _$jscoverage['/cmd.js'].lineData[254] = 0;
  _$jscoverage['/cmd.js'].lineData[258] = 0;
  _$jscoverage['/cmd.js'].lineData[260] = 0;
  _$jscoverage['/cmd.js'].lineData[264] = 0;
  _$jscoverage['/cmd.js'].lineData[266] = 0;
  _$jscoverage['/cmd.js'].lineData[267] = 0;
  _$jscoverage['/cmd.js'].lineData[270] = 0;
  _$jscoverage['/cmd.js'].lineData[271] = 0;
  _$jscoverage['/cmd.js'].lineData[272] = 0;
  _$jscoverage['/cmd.js'].lineData[273] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[275] = 0;
  _$jscoverage['/cmd.js'].lineData[276] = 0;
  _$jscoverage['/cmd.js'].lineData[280] = 0;
  _$jscoverage['/cmd.js'].lineData[282] = 0;
  _$jscoverage['/cmd.js'].lineData[283] = 0;
  _$jscoverage['/cmd.js'].lineData[284] = 0;
  _$jscoverage['/cmd.js'].lineData[285] = 0;
  _$jscoverage['/cmd.js'].lineData[289] = 0;
  _$jscoverage['/cmd.js'].lineData[291] = 0;
  _$jscoverage['/cmd.js'].lineData[292] = 0;
  _$jscoverage['/cmd.js'].lineData[294] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[298] = 0;
  _$jscoverage['/cmd.js'].lineData[299] = 0;
  _$jscoverage['/cmd.js'].lineData[300] = 0;
  _$jscoverage['/cmd.js'].lineData[301] = 0;
  _$jscoverage['/cmd.js'].lineData[302] = 0;
  _$jscoverage['/cmd.js'].lineData[307] = 0;
  _$jscoverage['/cmd.js'].lineData[309] = 0;
  _$jscoverage['/cmd.js'].lineData[310] = 0;
  _$jscoverage['/cmd.js'].lineData[312] = 0;
  _$jscoverage['/cmd.js'].lineData[314] = 0;
  _$jscoverage['/cmd.js'].lineData[318] = 0;
  _$jscoverage['/cmd.js'].lineData[320] = 0;
}
if (! _$jscoverage['/cmd.js'].functionData) {
  _$jscoverage['/cmd.js'].functionData = [];
  _$jscoverage['/cmd.js'].functionData[0] = 0;
  _$jscoverage['/cmd.js'].functionData[1] = 0;
  _$jscoverage['/cmd.js'].functionData[2] = 0;
  _$jscoverage['/cmd.js'].functionData[3] = 0;
  _$jscoverage['/cmd.js'].functionData[4] = 0;
  _$jscoverage['/cmd.js'].functionData[5] = 0;
  _$jscoverage['/cmd.js'].functionData[6] = 0;
  _$jscoverage['/cmd.js'].functionData[7] = 0;
  _$jscoverage['/cmd.js'].functionData[8] = 0;
  _$jscoverage['/cmd.js'].functionData[9] = 0;
  _$jscoverage['/cmd.js'].functionData[10] = 0;
  _$jscoverage['/cmd.js'].functionData[11] = 0;
  _$jscoverage['/cmd.js'].functionData[12] = 0;
  _$jscoverage['/cmd.js'].functionData[13] = 0;
  _$jscoverage['/cmd.js'].functionData[14] = 0;
  _$jscoverage['/cmd.js'].functionData[15] = 0;
  _$jscoverage['/cmd.js'].functionData[16] = 0;
  _$jscoverage['/cmd.js'].functionData[17] = 0;
}
if (! _$jscoverage['/cmd.js'].branchData) {
  _$jscoverage['/cmd.js'].branchData = {};
  _$jscoverage['/cmd.js'].branchData['18'] = [];
  _$jscoverage['/cmd.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['39'] = [];
  _$jscoverage['/cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['43'] = [];
  _$jscoverage['/cmd.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['73'] = [];
  _$jscoverage['/cmd.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['74'] = [];
  _$jscoverage['/cmd.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['107'] = [];
  _$jscoverage['/cmd.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['133'] = [];
  _$jscoverage['/cmd.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['145'] = [];
  _$jscoverage['/cmd.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['159'] = [];
  _$jscoverage['/cmd.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['164'] = [];
  _$jscoverage['/cmd.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['181'] = [];
  _$jscoverage['/cmd.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['185'] = [];
  _$jscoverage['/cmd.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['190'] = [];
  _$jscoverage['/cmd.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['194'] = [];
  _$jscoverage['/cmd.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['219'] = [];
  _$jscoverage['/cmd.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['258'] = [];
  _$jscoverage['/cmd.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['266'] = [];
  _$jscoverage['/cmd.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['273'] = [];
  _$jscoverage['/cmd.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['291'] = [];
  _$jscoverage['/cmd.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['299'] = [];
  _$jscoverage['/cmd.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['309'] = [];
  _$jscoverage['/cmd.js'].branchData['309'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['309'][1].init(17, 36, '!editor.hasCommand(\'maximizeWindow\')');
function visit21_309_1(result) {
  _$jscoverage['/cmd.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['299'][1].init(46, 12, 'self._resize');
function visit20_299_1(result) {
  _$jscoverage['/cmd.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['291'][1].init(84, 45, 'editor.fire(\'beforeMaximizeWindow\') === false');
function visit19_291_1(result) {
  _$jscoverage['/cmd.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['273'][1].init(253, 13, '!self._resize');
function visit18_273_1(result) {
  _$jscoverage['/cmd.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['266'][1].init(84, 12, 'self._resize');
function visit17_266_1(result) {
  _$jscoverage['/cmd.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['258'][1].init(1662, 13, 'stop !== true');
function visit16_258_1(result) {
  _$jscoverage['/cmd.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['219'][1].init(487, 3, '!ie');
function visit15_219_1(result) {
  _$jscoverage['/cmd.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['194'][1].init(172, 7, 'element');
function visit14_194_1(result) {
  _$jscoverage['/cmd.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['190'][1].init(486, 27, 'editor.__iframeFocus && sel');
function visit13_190_1(result) {
  _$jscoverage['/cmd.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['185'][1].init(354, 18, 'savedRanges && sel');
function visit12_185_1(result) {
  _$jscoverage['/cmd.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['181'][1].init(271, 8, 'UA.gecko');
function visit11_181_1(result) {
  _$jscoverage['/cmd.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['164'][1].init(316, 22, 'sel && sel.getRanges()');
function visit10_164_1(result) {
  _$jscoverage['/cmd.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['159'][1].init(121, 34, '!UA.gecko || !editor.__iframeFocus');
function visit9_159_1(result) {
  _$jscoverage['/cmd.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['145'][1].init(1009, 6, 'ie < 8');
function visit8_145_1(result) {
  _$jscoverage['/cmd.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['133'][1].init(66, 16, 'pre !== \'static\'');
function visit7_133_1(result) {
  _$jscoverage['/cmd.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['107'][1].init(1329, 6, 'ie < 8');
function visit6_107_1(result) {
  _$jscoverage['/cmd.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['74'][1].init(33, 24, 'i < _savedParents.length');
function visit5_74_1(result) {
  _$jscoverage['/cmd.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['73'][1].init(238, 13, '_savedParents');
function visit4_73_1(result) {
  _$jscoverage['/cmd.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['43'][1].init(188, 12, 'self._resize');
function visit3_43_1(result) {
  _$jscoverage['/cmd.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['39'][1].init(85, 44, 'editor.fire(\'beforeRestoreWindow\') === false');
function visit2_39_1(result) {
  _$jscoverage['/cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['18'][1].init(17, 7, '!iframe');
function visit1_18_1(result) {
  _$jscoverage['/cmd.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/cmd.js'].lineData[8]++;
  var Event = require('event');
  _$jscoverage['/cmd.js'].lineData[10]++;
  var UA = S.UA, ie = UA.ie, doc = document, Node = S.Node, Dom = S.DOM, iframe, MAXIMIZE_TOOLBAR_CLASS = 'editor-toolbar-padding', init = function() {
  _$jscoverage['/cmd.js'].functionData[1]++;
  _$jscoverage['/cmd.js'].lineData[18]++;
  if (visit1_18_1(!iframe)) {
    _$jscoverage['/cmd.js'].lineData[19]++;
    iframe = new Node('<' + 'iframe ' + ' style="' + 'position:absolute;' + 'top:-9999px;' + 'left:-9999px;' + '"' + ' frameborder="0">').prependTo(doc.body, undefined);
  }
};
  _$jscoverage['/cmd.js'].lineData[29]++;
  function MaximizeCmd(editor) {
    _$jscoverage['/cmd.js'].functionData[2]++;
    _$jscoverage['/cmd.js'].lineData[30]++;
    this.editor = editor;
  }
  _$jscoverage['/cmd.js'].lineData[33]++;
  S.augment(MaximizeCmd, {
  restoreWindow: function() {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[36]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[39]++;
  if (visit2_39_1(editor.fire('beforeRestoreWindow') === false)) {
    _$jscoverage['/cmd.js'].lineData[40]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[43]++;
  if (visit3_43_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[44]++;
    Event.remove(window, 'resize', self._resize);
    _$jscoverage['/cmd.js'].lineData[45]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[46]++;
    self._resize = 0;
  } else {
    _$jscoverage['/cmd.js'].lineData[48]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[52]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[53]++;
  self._restoreState();
  _$jscoverage['/cmd.js'].lineData[56]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[57]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[58]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[59]++;
  editor.fire('afterRestoreWindow');
}, 30);
}, 
  _restoreState: function() {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[68]++;
  var self = this, editor = self.editor, textareaEl = editor.get('textarea'), _savedParents = self._savedParents;
  _$jscoverage['/cmd.js'].lineData[73]++;
  if (visit4_73_1(_savedParents)) {
    _$jscoverage['/cmd.js'].lineData[74]++;
    for (var i = 0; visit5_74_1(i < _savedParents.length); i++) {
      _$jscoverage['/cmd.js'].lineData[75]++;
      var po = _savedParents[i];
      _$jscoverage['/cmd.js'].lineData[76]++;
      po.el.css('position', po.position);
    }
    _$jscoverage['/cmd.js'].lineData[78]++;
    self._savedParents = null;
  }
  _$jscoverage['/cmd.js'].lineData[82]++;
  textareaEl.parent().css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[85]++;
  textareaEl.css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[88]++;
  Dom.css(doc.body, {
  width: '', 
  height: '', 
  overflow: ''});
  _$jscoverage['/cmd.js'].lineData[94]++;
  doc.documentElement.style.overflow = '';
  _$jscoverage['/cmd.js'].lineData[96]++;
  var editorElStyle = editor.get('el')[0].style;
  _$jscoverage['/cmd.js'].lineData[97]++;
  editorElStyle.position = 'static';
  _$jscoverage['/cmd.js'].lineData[98]++;
  editorElStyle.width = self.editorElWidth;
  _$jscoverage['/cmd.js'].lineData[100]++;
  iframe.css({
  left: '-99999px', 
  top: '-99999px'});
  _$jscoverage['/cmd.js'].lineData[105]++;
  window.scrollTo(self.scrollLeft, self.scrollTop);
  _$jscoverage['/cmd.js'].lineData[107]++;
  if (visit6_107_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[108]++;
    editor.get('toolBarEl').removeClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveSate: function() {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[117]++;
  var self = this, editor = self.editor, _savedParents = [], editorEl = editor.get('el');
  _$jscoverage['/cmd.js'].lineData[121]++;
  self.iframeHeight = editor.get('textarea').parent().style('height');
  _$jscoverage['/cmd.js'].lineData[122]++;
  self.editorElWidth = editorEl.style('width');
  _$jscoverage['/cmd.js'].lineData[124]++;
  self.scrollLeft = Dom.scrollLeft();
  _$jscoverage['/cmd.js'].lineData[125]++;
  self.scrollTop = Dom.scrollTop();
  _$jscoverage['/cmd.js'].lineData[126]++;
  window.scrollTo(0, 0);
  _$jscoverage['/cmd.js'].lineData[129]++;
  var p = editorEl.parent();
  _$jscoverage['/cmd.js'].lineData[131]++;
  while (p) {
    _$jscoverage['/cmd.js'].lineData[132]++;
    var pre = p.css('position');
    _$jscoverage['/cmd.js'].lineData[133]++;
    if (visit7_133_1(pre !== 'static')) {
      _$jscoverage['/cmd.js'].lineData[134]++;
      _savedParents.push({
  el: p, 
  position: pre});
      _$jscoverage['/cmd.js'].lineData[138]++;
      p.css('position', 'static');
    }
    _$jscoverage['/cmd.js'].lineData[140]++;
    p = p.parent();
  }
  _$jscoverage['/cmd.js'].lineData[142]++;
  self._savedParents = _savedParents;
  _$jscoverage['/cmd.js'].lineData[145]++;
  if (visit8_145_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[146]++;
    editor.get('toolBarEl').addClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[156]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[158]++;
  self.savedRanges = null;
  _$jscoverage['/cmd.js'].lineData[159]++;
  if (visit9_159_1(!UA.gecko || !editor.__iframeFocus)) {
    _$jscoverage['/cmd.js'].lineData[160]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[162]++;
  var sel = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[164]++;
  self.savedRanges = visit10_164_1(sel && sel.getRanges());
}, 
  _restoreEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[172]++;
  var self = this, editor = self.editor, sel = editor.getSelection(), savedRanges = self.savedRanges;
  _$jscoverage['/cmd.js'].lineData[181]++;
  if (visit11_181_1(UA.gecko)) {
    _$jscoverage['/cmd.js'].lineData[182]++;
    editor.activateGecko();
  }
  _$jscoverage['/cmd.js'].lineData[185]++;
  if (visit12_185_1(savedRanges && sel)) {
    _$jscoverage['/cmd.js'].lineData[186]++;
    sel.selectRanges(savedRanges);
  }
  _$jscoverage['/cmd.js'].lineData[190]++;
  if (visit13_190_1(editor.__iframeFocus && sel)) {
    _$jscoverage['/cmd.js'].lineData[191]++;
    var element = sel.getStartElement();
    _$jscoverage['/cmd.js'].lineData[194]++;
    if (visit14_194_1(element)) {
      _$jscoverage['/cmd.js'].lineData[195]++;
      element.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
    }
  }
}, 
  _maximize: function(stop) {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[209]++;
  var self = this, editor = self.editor, editorEl = editor.get('el'), viewportHeight = Dom.viewportHeight(), viewportWidth = Dom.viewportWidth(), textareaEl = editor.get('textarea'), statusHeight = editor.get('statusBarEl') ? editor.get('statusBarEl')[0].offsetHeight : 0, toolHeight = editor.get('toolBarEl')[0].offsetHeight;
  _$jscoverage['/cmd.js'].lineData[219]++;
  if (visit15_219_1(!ie)) {
    _$jscoverage['/cmd.js'].lineData[220]++;
    Dom.css(doc.body, {
  width: 0, 
  height: 0, 
  overflow: 'hidden'});
  } else {
    _$jscoverage['/cmd.js'].lineData[226]++;
    doc.body.style.overflow = 'hidden';
  }
  _$jscoverage['/cmd.js'].lineData[228]++;
  doc.documentElement.style.overflow = 'hidden';
  _$jscoverage['/cmd.js'].lineData[230]++;
  editorEl.css({
  position: 'absolute', 
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE), 
  width: viewportWidth + 'px'});
  _$jscoverage['/cmd.js'].lineData[235]++;
  iframe.css({
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE - 5), 
  height: viewportHeight + 'px', 
  width: viewportWidth + 'px'});
  _$jscoverage['/cmd.js'].lineData[240]++;
  editorEl.offset({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[244]++;
  iframe.css({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[249]++;
  textareaEl.parent().css({
  height: (viewportHeight - statusHeight - toolHeight) + 'px'});
  _$jscoverage['/cmd.js'].lineData[254]++;
  textareaEl.css({
  height: (viewportHeight - statusHeight - toolHeight) + 'px'});
  _$jscoverage['/cmd.js'].lineData[258]++;
  if (visit16_258_1(stop !== true)) {
    _$jscoverage['/cmd.js'].lineData[260]++;
    arguments.callee.call(self, true);
  }
}, 
  _real: function() {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[264]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[266]++;
  if (visit17_266_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[267]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[270]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[271]++;
  self._saveSate();
  _$jscoverage['/cmd.js'].lineData[272]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[273]++;
  if (visit18_273_1(!self._resize)) {
    _$jscoverage['/cmd.js'].lineData[274]++;
    self._resize = S.buffer(function() {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[275]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[276]++;
  editor.fire('afterMaximizeWindow');
}, 100);
  }
  _$jscoverage['/cmd.js'].lineData[280]++;
  Event.on(window, 'resize', self._resize);
  _$jscoverage['/cmd.js'].lineData[282]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[283]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[284]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[285]++;
  editor.fire('afterMaximizeWindow');
}, 30);
}, 
  maximizeWindow: function() {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[289]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[291]++;
  if (visit19_291_1(editor.fire('beforeMaximizeWindow') === false)) {
    _$jscoverage['/cmd.js'].lineData[292]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[294]++;
  init();
  _$jscoverage['/cmd.js'].lineData[295]++;
  self._real();
}, 
  destroy: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[298]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[299]++;
  if (visit20_299_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[300]++;
    Event.remove(window, 'resize', self._resize);
    _$jscoverage['/cmd.js'].lineData[301]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[302]++;
    self._resize = 0;
  }
}});
  _$jscoverage['/cmd.js'].lineData[307]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[309]++;
  if (visit21_309_1(!editor.hasCommand('maximizeWindow'))) {
    _$jscoverage['/cmd.js'].lineData[310]++;
    var maximizeCmd = new MaximizeCmd(editor);
    _$jscoverage['/cmd.js'].lineData[312]++;
    editor.addCommand('maximizeWindow', {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[16]++;
  _$jscoverage['/cmd.js'].lineData[314]++;
  maximizeCmd.maximizeWindow();
}});
    _$jscoverage['/cmd.js'].lineData[318]++;
    editor.addCommand('restoreWindow', {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[17]++;
  _$jscoverage['/cmd.js'].lineData[320]++;
  maximizeCmd.restoreWindow();
}});
  }
}};
});
