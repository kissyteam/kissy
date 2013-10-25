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
  _$jscoverage['/cmd.js'].lineData[15] = 0;
  _$jscoverage['/cmd.js'].lineData[16] = 0;
  _$jscoverage['/cmd.js'].lineData[26] = 0;
  _$jscoverage['/cmd.js'].lineData[27] = 0;
  _$jscoverage['/cmd.js'].lineData[30] = 0;
  _$jscoverage['/cmd.js'].lineData[33] = 0;
  _$jscoverage['/cmd.js'].lineData[36] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[40] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[45] = 0;
  _$jscoverage['/cmd.js'].lineData[49] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[53] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[65] = 0;
  _$jscoverage['/cmd.js'].lineData[70] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[72] = 0;
  _$jscoverage['/cmd.js'].lineData[73] = 0;
  _$jscoverage['/cmd.js'].lineData[75] = 0;
  _$jscoverage['/cmd.js'].lineData[79] = 0;
  _$jscoverage['/cmd.js'].lineData[82] = 0;
  _$jscoverage['/cmd.js'].lineData[85] = 0;
  _$jscoverage['/cmd.js'].lineData[91] = 0;
  _$jscoverage['/cmd.js'].lineData[93] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[97] = 0;
  _$jscoverage['/cmd.js'].lineData[102] = 0;
  _$jscoverage['/cmd.js'].lineData[104] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[114] = 0;
  _$jscoverage['/cmd.js'].lineData[118] = 0;
  _$jscoverage['/cmd.js'].lineData[119] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[122] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[126] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[135] = 0;
  _$jscoverage['/cmd.js'].lineData[137] = 0;
  _$jscoverage['/cmd.js'].lineData[139] = 0;
  _$jscoverage['/cmd.js'].lineData[142] = 0;
  _$jscoverage['/cmd.js'].lineData[143] = 0;
  _$jscoverage['/cmd.js'].lineData[153] = 0;
  _$jscoverage['/cmd.js'].lineData[155] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[159] = 0;
  _$jscoverage['/cmd.js'].lineData[161] = 0;
  _$jscoverage['/cmd.js'].lineData[169] = 0;
  _$jscoverage['/cmd.js'].lineData[178] = 0;
  _$jscoverage['/cmd.js'].lineData[179] = 0;
  _$jscoverage['/cmd.js'].lineData[182] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[187] = 0;
  _$jscoverage['/cmd.js'].lineData[188] = 0;
  _$jscoverage['/cmd.js'].lineData[191] = 0;
  _$jscoverage['/cmd.js'].lineData[204] = 0;
  _$jscoverage['/cmd.js'].lineData[214] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[221] = 0;
  _$jscoverage['/cmd.js'].lineData[223] = 0;
  _$jscoverage['/cmd.js'].lineData[225] = 0;
  _$jscoverage['/cmd.js'].lineData[230] = 0;
  _$jscoverage['/cmd.js'].lineData[235] = 0;
  _$jscoverage['/cmd.js'].lineData[239] = 0;
  _$jscoverage['/cmd.js'].lineData[244] = 0;
  _$jscoverage['/cmd.js'].lineData[249] = 0;
  _$jscoverage['/cmd.js'].lineData[253] = 0;
  _$jscoverage['/cmd.js'].lineData[254] = 0;
  _$jscoverage['/cmd.js'].lineData[258] = 0;
  _$jscoverage['/cmd.js'].lineData[260] = 0;
  _$jscoverage['/cmd.js'].lineData[261] = 0;
  _$jscoverage['/cmd.js'].lineData[264] = 0;
  _$jscoverage['/cmd.js'].lineData[265] = 0;
  _$jscoverage['/cmd.js'].lineData[266] = 0;
  _$jscoverage['/cmd.js'].lineData[267] = 0;
  _$jscoverage['/cmd.js'].lineData[268] = 0;
  _$jscoverage['/cmd.js'].lineData[269] = 0;
  _$jscoverage['/cmd.js'].lineData[270] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[276] = 0;
  _$jscoverage['/cmd.js'].lineData[277] = 0;
  _$jscoverage['/cmd.js'].lineData[278] = 0;
  _$jscoverage['/cmd.js'].lineData[279] = 0;
  _$jscoverage['/cmd.js'].lineData[283] = 0;
  _$jscoverage['/cmd.js'].lineData[285] = 0;
  _$jscoverage['/cmd.js'].lineData[286] = 0;
  _$jscoverage['/cmd.js'].lineData[288] = 0;
  _$jscoverage['/cmd.js'].lineData[289] = 0;
  _$jscoverage['/cmd.js'].lineData[292] = 0;
  _$jscoverage['/cmd.js'].lineData[293] = 0;
  _$jscoverage['/cmd.js'].lineData[294] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[301] = 0;
  _$jscoverage['/cmd.js'].lineData[303] = 0;
  _$jscoverage['/cmd.js'].lineData[304] = 0;
  _$jscoverage['/cmd.js'].lineData[306] = 0;
  _$jscoverage['/cmd.js'].lineData[308] = 0;
  _$jscoverage['/cmd.js'].lineData[312] = 0;
  _$jscoverage['/cmd.js'].lineData[314] = 0;
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
  _$jscoverage['/cmd.js'].branchData['15'] = [];
  _$jscoverage['/cmd.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['36'] = [];
  _$jscoverage['/cmd.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['40'] = [];
  _$jscoverage['/cmd.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['70'] = [];
  _$jscoverage['/cmd.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['71'] = [];
  _$jscoverage['/cmd.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['104'] = [];
  _$jscoverage['/cmd.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['130'] = [];
  _$jscoverage['/cmd.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['142'] = [];
  _$jscoverage['/cmd.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['156'] = [];
  _$jscoverage['/cmd.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['161'] = [];
  _$jscoverage['/cmd.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['178'] = [];
  _$jscoverage['/cmd.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['182'] = [];
  _$jscoverage['/cmd.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['187'] = [];
  _$jscoverage['/cmd.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['191'] = [];
  _$jscoverage['/cmd.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['214'] = [];
  _$jscoverage['/cmd.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['253'] = [];
  _$jscoverage['/cmd.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['260'] = [];
  _$jscoverage['/cmd.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['267'] = [];
  _$jscoverage['/cmd.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['285'] = [];
  _$jscoverage['/cmd.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['293'] = [];
  _$jscoverage['/cmd.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['303'] = [];
  _$jscoverage['/cmd.js'].branchData['303'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['303'][1].init(18, 36, '!editor.hasCommand("maximizeWindow")');
function visit21_303_1(result) {
  _$jscoverage['/cmd.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['293'][1].init(48, 12, 'self._resize');
function visit20_293_1(result) {
  _$jscoverage['/cmd.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['285'][1].init(87, 45, 'editor.fire("beforeMaximizeWindow") === false');
function visit19_285_1(result) {
  _$jscoverage['/cmd.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['267'][1].init(263, 13, '!self._resize');
function visit18_267_1(result) {
  _$jscoverage['/cmd.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['260'][1].init(87, 12, 'self._resize');
function visit17_260_1(result) {
  _$jscoverage['/cmd.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['253'][1].init(1712, 13, 'stop !== true');
function visit16_253_1(result) {
  _$jscoverage['/cmd.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['214'][1].init(498, 3, '!ie');
function visit15_214_1(result) {
  _$jscoverage['/cmd.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['191'][1].init(173, 204, 'element && element.scrollIntoView(undefined, {\n  alignWithTop: false, \n  allowHorizontalScroll: true, \n  onlyScrollIfNeeded: true})');
function visit14_191_1(result) {
  _$jscoverage['/cmd.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['187'][1].init(508, 27, 'editor.__iframeFocus && sel');
function visit13_187_1(result) {
  _$jscoverage['/cmd.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['182'][1].init(371, 18, 'savedRanges && sel');
function visit12_182_1(result) {
  _$jscoverage['/cmd.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['178'][1].init(281, 11, 'UA[\'gecko\']');
function visit11_178_1(result) {
  _$jscoverage['/cmd.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['161'][1].init(328, 22, 'sel && sel.getRanges()');
function visit10_161_1(result) {
  _$jscoverage['/cmd.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['156'][1].init(125, 37, '!UA[\'gecko\'] || !editor.__iframeFocus');
function visit9_156_1(result) {
  _$jscoverage['/cmd.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['142'][1].init(1037, 6, 'ie < 8');
function visit8_142_1(result) {
  _$jscoverage['/cmd.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['130'][1].init(68, 15, 'pre != "static"');
function visit7_130_1(result) {
  _$jscoverage['/cmd.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['104'][1].init(1369, 6, 'ie < 8');
function visit6_104_1(result) {
  _$jscoverage['/cmd.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['71'][1].init(34, 24, 'i < _savedParents.length');
function visit5_71_1(result) {
  _$jscoverage['/cmd.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['70'][1].init(244, 13, '_savedParents');
function visit4_70_1(result) {
  _$jscoverage['/cmd.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['40'][1].init(196, 12, 'self._resize');
function visit3_40_1(result) {
  _$jscoverage['/cmd.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['36'][1].init(89, 44, 'editor.fire("beforeRestoreWindow") === false');
function visit2_36_1(result) {
  _$jscoverage['/cmd.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['15'][1].init(18, 7, '!iframe');
function visit1_15_1(result) {
  _$jscoverage['/cmd.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add("editor/plugin/maximize/cmd", function(S, Event, Editor) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var UA = S.UA, ie = UA['ie'], doc = document, Node = S.Node, Dom = S.DOM, iframe, MAXIMIZE_TOOLBAR_CLASS = "editor-toolbar-padding", init = function() {
  _$jscoverage['/cmd.js'].functionData[1]++;
  _$jscoverage['/cmd.js'].lineData[15]++;
  if (visit1_15_1(!iframe)) {
    _$jscoverage['/cmd.js'].lineData[16]++;
    iframe = new Node("<" + "iframe " + " style='" + "position:absolute;" + "top:-9999px;" + "left:-9999px;" + "'" + " frameborder='0'>").prependTo(doc.body, undefined);
  }
};
  _$jscoverage['/cmd.js'].lineData[26]++;
  function MaximizeCmd(editor) {
    _$jscoverage['/cmd.js'].functionData[2]++;
    _$jscoverage['/cmd.js'].lineData[27]++;
    this.editor = editor;
  }
  _$jscoverage['/cmd.js'].lineData[30]++;
  S.augment(MaximizeCmd, {
  restoreWindow: function() {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[33]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[36]++;
  if (visit2_36_1(editor.fire("beforeRestoreWindow") === false)) {
    _$jscoverage['/cmd.js'].lineData[37]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[40]++;
  if (visit3_40_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[41]++;
    Event.remove(window, "resize", self._resize);
    _$jscoverage['/cmd.js'].lineData[42]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[43]++;
    self._resize = 0;
  } else {
    _$jscoverage['/cmd.js'].lineData[45]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[49]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[50]++;
  self._restoreState();
  _$jscoverage['/cmd.js'].lineData[53]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[54]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[55]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[56]++;
  editor.fire("afterRestoreWindow");
}, 30);
}, 
  _restoreState: function() {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[65]++;
  var self = this, editor = self.editor, textareaEl = editor.get("textarea"), _savedParents = self._savedParents;
  _$jscoverage['/cmd.js'].lineData[70]++;
  if (visit4_70_1(_savedParents)) {
    _$jscoverage['/cmd.js'].lineData[71]++;
    for (var i = 0; visit5_71_1(i < _savedParents.length); i++) {
      _$jscoverage['/cmd.js'].lineData[72]++;
      var po = _savedParents[i];
      _$jscoverage['/cmd.js'].lineData[73]++;
      po.el.css("position", po.position);
    }
    _$jscoverage['/cmd.js'].lineData[75]++;
    self._savedParents = null;
  }
  _$jscoverage['/cmd.js'].lineData[79]++;
  textareaEl.parent().css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[82]++;
  textareaEl.css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[85]++;
  Dom.css(doc.body, {
  width: "", 
  height: "", 
  overflow: ""});
  _$jscoverage['/cmd.js'].lineData[91]++;
  doc.documentElement.style.overflow = "";
  _$jscoverage['/cmd.js'].lineData[93]++;
  var editorElStyle = editor.get("el")[0].style;
  _$jscoverage['/cmd.js'].lineData[94]++;
  editorElStyle.position = "static";
  _$jscoverage['/cmd.js'].lineData[95]++;
  editorElStyle.width = self.editorElWidth;
  _$jscoverage['/cmd.js'].lineData[97]++;
  iframe.css({
  left: "-99999px", 
  top: "-99999px"});
  _$jscoverage['/cmd.js'].lineData[102]++;
  window.scrollTo(self.scrollLeft, self.scrollTop);
  _$jscoverage['/cmd.js'].lineData[104]++;
  if (visit6_104_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[105]++;
    editor.get("toolBarEl").removeClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveSate: function() {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[114]++;
  var self = this, editor = self.editor, _savedParents = [], editorEl = editor.get("el");
  _$jscoverage['/cmd.js'].lineData[118]++;
  self.iframeHeight = editor.get("textarea").parent().style("height");
  _$jscoverage['/cmd.js'].lineData[119]++;
  self.editorElWidth = editorEl.style("width");
  _$jscoverage['/cmd.js'].lineData[121]++;
  self.scrollLeft = Dom.scrollLeft();
  _$jscoverage['/cmd.js'].lineData[122]++;
  self.scrollTop = Dom.scrollTop();
  _$jscoverage['/cmd.js'].lineData[123]++;
  window.scrollTo(0, 0);
  _$jscoverage['/cmd.js'].lineData[126]++;
  var p = editorEl.parent();
  _$jscoverage['/cmd.js'].lineData[128]++;
  while (p) {
    _$jscoverage['/cmd.js'].lineData[129]++;
    var pre = p.css("position");
    _$jscoverage['/cmd.js'].lineData[130]++;
    if (visit7_130_1(pre != "static")) {
      _$jscoverage['/cmd.js'].lineData[131]++;
      _savedParents.push({
  el: p, 
  position: pre});
      _$jscoverage['/cmd.js'].lineData[135]++;
      p.css("position", "static");
    }
    _$jscoverage['/cmd.js'].lineData[137]++;
    p = p.parent();
  }
  _$jscoverage['/cmd.js'].lineData[139]++;
  self._savedParents = _savedParents;
  _$jscoverage['/cmd.js'].lineData[142]++;
  if (visit8_142_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[143]++;
    editor.get("toolBarEl").addClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[153]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[155]++;
  self.savedRanges = null;
  _$jscoverage['/cmd.js'].lineData[156]++;
  if (visit9_156_1(!UA['gecko'] || !editor.__iframeFocus)) {
    _$jscoverage['/cmd.js'].lineData[157]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[159]++;
  var sel = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[161]++;
  self.savedRanges = visit10_161_1(sel && sel.getRanges());
}, 
  _restoreEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[169]++;
  var self = this, editor = self.editor, sel = editor.getSelection(), savedRanges = self.savedRanges;
  _$jscoverage['/cmd.js'].lineData[178]++;
  if (visit11_178_1(UA['gecko'])) {
    _$jscoverage['/cmd.js'].lineData[179]++;
    editor.activateGecko();
  }
  _$jscoverage['/cmd.js'].lineData[182]++;
  if (visit12_182_1(savedRanges && sel)) {
    _$jscoverage['/cmd.js'].lineData[183]++;
    sel.selectRanges(savedRanges);
  }
  _$jscoverage['/cmd.js'].lineData[187]++;
  if (visit13_187_1(editor.__iframeFocus && sel)) {
    _$jscoverage['/cmd.js'].lineData[188]++;
    var element = sel.getStartElement();
    _$jscoverage['/cmd.js'].lineData[191]++;
    visit14_191_1(element && element.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true}));
  }
}, 
  _maximize: function(stop) {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[204]++;
  var self = this, editor = self.editor, editorEl = editor.get("el"), viewportHeight = Dom.viewportHeight(), viewportWidth = Dom.viewportWidth(), textareaEl = editor.get("textarea"), statusHeight = editor.get("statusBarEl") ? editor.get("statusBarEl")[0].offsetHeight : 0, toolHeight = editor.get("toolBarEl")[0].offsetHeight;
  _$jscoverage['/cmd.js'].lineData[214]++;
  if (visit15_214_1(!ie)) {
    _$jscoverage['/cmd.js'].lineData[215]++;
    Dom.css(doc.body, {
  width: 0, 
  height: 0, 
  overflow: "hidden"});
  } else {
    _$jscoverage['/cmd.js'].lineData[221]++;
    doc.body.style.overflow = "hidden";
  }
  _$jscoverage['/cmd.js'].lineData[223]++;
  doc.documentElement.style.overflow = "hidden";
  _$jscoverage['/cmd.js'].lineData[225]++;
  editorEl.css({
  position: "absolute", 
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE), 
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[230]++;
  iframe.css({
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE - 5), 
  height: viewportHeight + "px", 
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[235]++;
  editorEl.offset({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[239]++;
  iframe.css({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[244]++;
  textareaEl.parent().css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[249]++;
  textareaEl.css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[253]++;
  if (visit16_253_1(stop !== true)) {
    _$jscoverage['/cmd.js'].lineData[254]++;
    arguments.callee.call(self, true);
  }
}, 
  _real: function() {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[258]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[260]++;
  if (visit17_260_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[261]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[264]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[265]++;
  self._saveSate();
  _$jscoverage['/cmd.js'].lineData[266]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[267]++;
  if (visit18_267_1(!self._resize)) {
    _$jscoverage['/cmd.js'].lineData[268]++;
    self._resize = S.buffer(function() {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[269]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[270]++;
  editor.fire("afterMaximizeWindow");
}, 100);
  }
  _$jscoverage['/cmd.js'].lineData[274]++;
  Event.on(window, "resize", self._resize);
  _$jscoverage['/cmd.js'].lineData[276]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[277]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[278]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[279]++;
  editor.fire("afterMaximizeWindow");
}, 30);
}, 
  maximizeWindow: function() {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[283]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[285]++;
  if (visit19_285_1(editor.fire("beforeMaximizeWindow") === false)) {
    _$jscoverage['/cmd.js'].lineData[286]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[288]++;
  init();
  _$jscoverage['/cmd.js'].lineData[289]++;
  self._real();
}, 
  destroy: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[292]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[293]++;
  if (visit20_293_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[294]++;
    Event.remove(window, "resize", self._resize);
    _$jscoverage['/cmd.js'].lineData[295]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[296]++;
    self._resize = 0;
  }
}});
  _$jscoverage['/cmd.js'].lineData[301]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[303]++;
  if (visit21_303_1(!editor.hasCommand("maximizeWindow"))) {
    _$jscoverage['/cmd.js'].lineData[304]++;
    var maximizeCmd = new MaximizeCmd(editor);
    _$jscoverage['/cmd.js'].lineData[306]++;
    editor.addCommand("maximizeWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[16]++;
  _$jscoverage['/cmd.js'].lineData[308]++;
  maximizeCmd.maximizeWindow();
}});
    _$jscoverage['/cmd.js'].lineData[312]++;
    editor.addCommand("restoreWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[17]++;
  _$jscoverage['/cmd.js'].lineData[314]++;
  maximizeCmd.restoreWindow();
}});
  }
}};
}, {
  requires: ['event', 'editor']});
