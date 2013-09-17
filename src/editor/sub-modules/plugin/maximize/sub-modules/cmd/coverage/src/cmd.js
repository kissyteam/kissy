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
  _$jscoverage['/cmd.js'].lineData[16] = 0;
  _$jscoverage['/cmd.js'].lineData[17] = 0;
  _$jscoverage['/cmd.js'].lineData[27] = 0;
  _$jscoverage['/cmd.js'].lineData[28] = 0;
  _$jscoverage['/cmd.js'].lineData[31] = 0;
  _$jscoverage['/cmd.js'].lineData[34] = 0;
  _$jscoverage['/cmd.js'].lineData[37] = 0;
  _$jscoverage['/cmd.js'].lineData[38] = 0;
  _$jscoverage['/cmd.js'].lineData[41] = 0;
  _$jscoverage['/cmd.js'].lineData[42] = 0;
  _$jscoverage['/cmd.js'].lineData[43] = 0;
  _$jscoverage['/cmd.js'].lineData[44] = 0;
  _$jscoverage['/cmd.js'].lineData[46] = 0;
  _$jscoverage['/cmd.js'].lineData[50] = 0;
  _$jscoverage['/cmd.js'].lineData[51] = 0;
  _$jscoverage['/cmd.js'].lineData[54] = 0;
  _$jscoverage['/cmd.js'].lineData[55] = 0;
  _$jscoverage['/cmd.js'].lineData[56] = 0;
  _$jscoverage['/cmd.js'].lineData[57] = 0;
  _$jscoverage['/cmd.js'].lineData[66] = 0;
  _$jscoverage['/cmd.js'].lineData[71] = 0;
  _$jscoverage['/cmd.js'].lineData[72] = 0;
  _$jscoverage['/cmd.js'].lineData[73] = 0;
  _$jscoverage['/cmd.js'].lineData[74] = 0;
  _$jscoverage['/cmd.js'].lineData[76] = 0;
  _$jscoverage['/cmd.js'].lineData[80] = 0;
  _$jscoverage['/cmd.js'].lineData[83] = 0;
  _$jscoverage['/cmd.js'].lineData[86] = 0;
  _$jscoverage['/cmd.js'].lineData[92] = 0;
  _$jscoverage['/cmd.js'].lineData[94] = 0;
  _$jscoverage['/cmd.js'].lineData[95] = 0;
  _$jscoverage['/cmd.js'].lineData[96] = 0;
  _$jscoverage['/cmd.js'].lineData[98] = 0;
  _$jscoverage['/cmd.js'].lineData[103] = 0;
  _$jscoverage['/cmd.js'].lineData[105] = 0;
  _$jscoverage['/cmd.js'].lineData[106] = 0;
  _$jscoverage['/cmd.js'].lineData[115] = 0;
  _$jscoverage['/cmd.js'].lineData[119] = 0;
  _$jscoverage['/cmd.js'].lineData[120] = 0;
  _$jscoverage['/cmd.js'].lineData[122] = 0;
  _$jscoverage['/cmd.js'].lineData[123] = 0;
  _$jscoverage['/cmd.js'].lineData[124] = 0;
  _$jscoverage['/cmd.js'].lineData[127] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[131] = 0;
  _$jscoverage['/cmd.js'].lineData[132] = 0;
  _$jscoverage['/cmd.js'].lineData[136] = 0;
  _$jscoverage['/cmd.js'].lineData[138] = 0;
  _$jscoverage['/cmd.js'].lineData[140] = 0;
  _$jscoverage['/cmd.js'].lineData[143] = 0;
  _$jscoverage['/cmd.js'].lineData[144] = 0;
  _$jscoverage['/cmd.js'].lineData[154] = 0;
  _$jscoverage['/cmd.js'].lineData[156] = 0;
  _$jscoverage['/cmd.js'].lineData[157] = 0;
  _$jscoverage['/cmd.js'].lineData[158] = 0;
  _$jscoverage['/cmd.js'].lineData[160] = 0;
  _$jscoverage['/cmd.js'].lineData[162] = 0;
  _$jscoverage['/cmd.js'].lineData[170] = 0;
  _$jscoverage['/cmd.js'].lineData[179] = 0;
  _$jscoverage['/cmd.js'].lineData[180] = 0;
  _$jscoverage['/cmd.js'].lineData[183] = 0;
  _$jscoverage['/cmd.js'].lineData[184] = 0;
  _$jscoverage['/cmd.js'].lineData[188] = 0;
  _$jscoverage['/cmd.js'].lineData[189] = 0;
  _$jscoverage['/cmd.js'].lineData[192] = 0;
  _$jscoverage['/cmd.js'].lineData[205] = 0;
  _$jscoverage['/cmd.js'].lineData[215] = 0;
  _$jscoverage['/cmd.js'].lineData[216] = 0;
  _$jscoverage['/cmd.js'].lineData[222] = 0;
  _$jscoverage['/cmd.js'].lineData[224] = 0;
  _$jscoverage['/cmd.js'].lineData[226] = 0;
  _$jscoverage['/cmd.js'].lineData[231] = 0;
  _$jscoverage['/cmd.js'].lineData[236] = 0;
  _$jscoverage['/cmd.js'].lineData[240] = 0;
  _$jscoverage['/cmd.js'].lineData[245] = 0;
  _$jscoverage['/cmd.js'].lineData[250] = 0;
  _$jscoverage['/cmd.js'].lineData[254] = 0;
  _$jscoverage['/cmd.js'].lineData[255] = 0;
  _$jscoverage['/cmd.js'].lineData[259] = 0;
  _$jscoverage['/cmd.js'].lineData[261] = 0;
  _$jscoverage['/cmd.js'].lineData[262] = 0;
  _$jscoverage['/cmd.js'].lineData[265] = 0;
  _$jscoverage['/cmd.js'].lineData[266] = 0;
  _$jscoverage['/cmd.js'].lineData[267] = 0;
  _$jscoverage['/cmd.js'].lineData[268] = 0;
  _$jscoverage['/cmd.js'].lineData[269] = 0;
  _$jscoverage['/cmd.js'].lineData[270] = 0;
  _$jscoverage['/cmd.js'].lineData[271] = 0;
  _$jscoverage['/cmd.js'].lineData[275] = 0;
  _$jscoverage['/cmd.js'].lineData[277] = 0;
  _$jscoverage['/cmd.js'].lineData[278] = 0;
  _$jscoverage['/cmd.js'].lineData[279] = 0;
  _$jscoverage['/cmd.js'].lineData[280] = 0;
  _$jscoverage['/cmd.js'].lineData[284] = 0;
  _$jscoverage['/cmd.js'].lineData[286] = 0;
  _$jscoverage['/cmd.js'].lineData[287] = 0;
  _$jscoverage['/cmd.js'].lineData[289] = 0;
  _$jscoverage['/cmd.js'].lineData[290] = 0;
  _$jscoverage['/cmd.js'].lineData[293] = 0;
  _$jscoverage['/cmd.js'].lineData[294] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[297] = 0;
  _$jscoverage['/cmd.js'].lineData[302] = 0;
  _$jscoverage['/cmd.js'].lineData[304] = 0;
  _$jscoverage['/cmd.js'].lineData[305] = 0;
  _$jscoverage['/cmd.js'].lineData[307] = 0;
  _$jscoverage['/cmd.js'].lineData[309] = 0;
  _$jscoverage['/cmd.js'].lineData[313] = 0;
  _$jscoverage['/cmd.js'].lineData[315] = 0;
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
  _$jscoverage['/cmd.js'].branchData['16'] = [];
  _$jscoverage['/cmd.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['37'] = [];
  _$jscoverage['/cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['41'] = [];
  _$jscoverage['/cmd.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['71'] = [];
  _$jscoverage['/cmd.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['72'] = [];
  _$jscoverage['/cmd.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['105'] = [];
  _$jscoverage['/cmd.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['131'] = [];
  _$jscoverage['/cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['143'] = [];
  _$jscoverage['/cmd.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['157'] = [];
  _$jscoverage['/cmd.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['162'] = [];
  _$jscoverage['/cmd.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['179'] = [];
  _$jscoverage['/cmd.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['183'] = [];
  _$jscoverage['/cmd.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['188'] = [];
  _$jscoverage['/cmd.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['192'] = [];
  _$jscoverage['/cmd.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['215'] = [];
  _$jscoverage['/cmd.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['254'] = [];
  _$jscoverage['/cmd.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['261'] = [];
  _$jscoverage['/cmd.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['268'] = [];
  _$jscoverage['/cmd.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['286'] = [];
  _$jscoverage['/cmd.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['294'] = [];
  _$jscoverage['/cmd.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['304'] = [];
  _$jscoverage['/cmd.js'].branchData['304'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['304'][1].init(18, 36, '!editor.hasCommand("maximizeWindow")');
function visit21_304_1(result) {
  _$jscoverage['/cmd.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['294'][1].init(48, 12, 'self._resize');
function visit20_294_1(result) {
  _$jscoverage['/cmd.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['286'][1].init(87, 45, 'editor.fire("beforeMaximizeWindow") === false');
function visit19_286_1(result) {
  _$jscoverage['/cmd.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['268'][1].init(263, 13, '!self._resize');
function visit18_268_1(result) {
  _$jscoverage['/cmd.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['261'][1].init(87, 12, 'self._resize');
function visit17_261_1(result) {
  _$jscoverage['/cmd.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['254'][1].init(1712, 13, 'stop !== true');
function visit16_254_1(result) {
  _$jscoverage['/cmd.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['215'][1].init(498, 3, '!ie');
function visit15_215_1(result) {
  _$jscoverage['/cmd.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['192'][1].init(173, 200, 'element && element.scrollIntoView(undefined, {\n  alignWithTop: false, \n  allowHorizontalScroll: true, \n  onlyScrollIfNeeded: true})');
function visit14_192_1(result) {
  _$jscoverage['/cmd.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['188'][1].init(508, 27, 'editor.__iframeFocus && sel');
function visit13_188_1(result) {
  _$jscoverage['/cmd.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['183'][1].init(371, 18, 'savedRanges && sel');
function visit12_183_1(result) {
  _$jscoverage['/cmd.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['179'][1].init(281, 11, 'UA[\'gecko\']');
function visit11_179_1(result) {
  _$jscoverage['/cmd.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['162'][1].init(328, 22, 'sel && sel.getRanges()');
function visit10_162_1(result) {
  _$jscoverage['/cmd.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['157'][1].init(125, 37, '!UA[\'gecko\'] || !editor.__iframeFocus');
function visit9_157_1(result) {
  _$jscoverage['/cmd.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['143'][1].init(1037, 6, 'ie < 8');
function visit8_143_1(result) {
  _$jscoverage['/cmd.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['131'][1].init(68, 15, 'pre != "static"');
function visit7_131_1(result) {
  _$jscoverage['/cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['105'][1].init(1369, 6, 'ie < 8');
function visit6_105_1(result) {
  _$jscoverage['/cmd.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['72'][1].init(34, 24, 'i < _savedParents.length');
function visit5_72_1(result) {
  _$jscoverage['/cmd.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['71'][1].init(244, 13, '_savedParents');
function visit4_71_1(result) {
  _$jscoverage['/cmd.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['41'][1].init(196, 12, 'self._resize');
function visit3_41_1(result) {
  _$jscoverage['/cmd.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['37'][1].init(89, 44, 'editor.fire("beforeRestoreWindow") === false');
function visit2_37_1(result) {
  _$jscoverage['/cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['16'][1].init(18, 7, '!iframe');
function visit1_16_1(result) {
  _$jscoverage['/cmd.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].lineData[6]++;
KISSY.add("editor/plugin/maximize/cmd", function(S, Editor) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[7]++;
  var UA = S.UA, ie = UA['ie'], doc = document, Node = S.Node, Event = S.Event, Dom = S.DOM, iframe, MAXIMIZE_TOOLBAR_CLASS = "editor-toolbar-padding", init = function() {
  _$jscoverage['/cmd.js'].functionData[1]++;
  _$jscoverage['/cmd.js'].lineData[16]++;
  if (visit1_16_1(!iframe)) {
    _$jscoverage['/cmd.js'].lineData[17]++;
    iframe = new Node("<" + "iframe " + " style='" + "position:absolute;" + "top:-9999px;" + "left:-9999px;" + "'" + " frameborder='0'>").prependTo(doc.body, undefined);
  }
};
  _$jscoverage['/cmd.js'].lineData[27]++;
  function MaximizeCmd(editor) {
    _$jscoverage['/cmd.js'].functionData[2]++;
    _$jscoverage['/cmd.js'].lineData[28]++;
    this.editor = editor;
  }
  _$jscoverage['/cmd.js'].lineData[31]++;
  S.augment(MaximizeCmd, {
  restoreWindow: function() {
  _$jscoverage['/cmd.js'].functionData[3]++;
  _$jscoverage['/cmd.js'].lineData[34]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[37]++;
  if (visit2_37_1(editor.fire("beforeRestoreWindow") === false)) {
    _$jscoverage['/cmd.js'].lineData[38]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[41]++;
  if (visit3_41_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[42]++;
    Event.remove(window, "resize", self._resize);
    _$jscoverage['/cmd.js'].lineData[43]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[44]++;
    self._resize = 0;
  } else {
    _$jscoverage['/cmd.js'].lineData[46]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[50]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[51]++;
  self._restoreState();
  _$jscoverage['/cmd.js'].lineData[54]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[4]++;
  _$jscoverage['/cmd.js'].lineData[55]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[56]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[57]++;
  editor.fire("afterRestoreWindow");
}, 30);
}, 
  _restoreState: function() {
  _$jscoverage['/cmd.js'].functionData[5]++;
  _$jscoverage['/cmd.js'].lineData[66]++;
  var self = this, editor = self.editor, textareaEl = editor.get("textarea"), _savedParents = self._savedParents;
  _$jscoverage['/cmd.js'].lineData[71]++;
  if (visit4_71_1(_savedParents)) {
    _$jscoverage['/cmd.js'].lineData[72]++;
    for (var i = 0; visit5_72_1(i < _savedParents.length); i++) {
      _$jscoverage['/cmd.js'].lineData[73]++;
      var po = _savedParents[i];
      _$jscoverage['/cmd.js'].lineData[74]++;
      po.el.css("position", po.position);
    }
    _$jscoverage['/cmd.js'].lineData[76]++;
    self._savedParents = null;
  }
  _$jscoverage['/cmd.js'].lineData[80]++;
  textareaEl.parent().css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[83]++;
  textareaEl.css({
  height: self.iframeHeight});
  _$jscoverage['/cmd.js'].lineData[86]++;
  Dom.css(doc.body, {
  width: "", 
  height: "", 
  overflow: ""});
  _$jscoverage['/cmd.js'].lineData[92]++;
  doc.documentElement.style.overflow = "";
  _$jscoverage['/cmd.js'].lineData[94]++;
  var editorElStyle = editor.get("el")[0].style;
  _$jscoverage['/cmd.js'].lineData[95]++;
  editorElStyle.position = "static";
  _$jscoverage['/cmd.js'].lineData[96]++;
  editorElStyle.width = self.editorElWidth;
  _$jscoverage['/cmd.js'].lineData[98]++;
  iframe.css({
  left: "-99999px", 
  top: "-99999px"});
  _$jscoverage['/cmd.js'].lineData[103]++;
  window.scrollTo(self.scrollLeft, self.scrollTop);
  _$jscoverage['/cmd.js'].lineData[105]++;
  if (visit6_105_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[106]++;
    editor.get("toolBarEl").removeClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveSate: function() {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[115]++;
  var self = this, editor = self.editor, _savedParents = [], editorEl = editor.get("el");
  _$jscoverage['/cmd.js'].lineData[119]++;
  self.iframeHeight = editor.get("textarea").parent().style("height");
  _$jscoverage['/cmd.js'].lineData[120]++;
  self.editorElWidth = editorEl.style("width");
  _$jscoverage['/cmd.js'].lineData[122]++;
  self.scrollLeft = Dom.scrollLeft();
  _$jscoverage['/cmd.js'].lineData[123]++;
  self.scrollTop = Dom.scrollTop();
  _$jscoverage['/cmd.js'].lineData[124]++;
  window.scrollTo(0, 0);
  _$jscoverage['/cmd.js'].lineData[127]++;
  var p = editorEl.parent();
  _$jscoverage['/cmd.js'].lineData[129]++;
  while (p) {
    _$jscoverage['/cmd.js'].lineData[130]++;
    var pre = p.css("position");
    _$jscoverage['/cmd.js'].lineData[131]++;
    if (visit7_131_1(pre != "static")) {
      _$jscoverage['/cmd.js'].lineData[132]++;
      _savedParents.push({
  el: p, 
  position: pre});
      _$jscoverage['/cmd.js'].lineData[136]++;
      p.css("position", "static");
    }
    _$jscoverage['/cmd.js'].lineData[138]++;
    p = p.parent();
  }
  _$jscoverage['/cmd.js'].lineData[140]++;
  self._savedParents = _savedParents;
  _$jscoverage['/cmd.js'].lineData[143]++;
  if (visit8_143_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[144]++;
    editor.get("toolBarEl").addClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[154]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[156]++;
  self.savedRanges = null;
  _$jscoverage['/cmd.js'].lineData[157]++;
  if (visit9_157_1(!UA['gecko'] || !editor.__iframeFocus)) {
    _$jscoverage['/cmd.js'].lineData[158]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[160]++;
  var sel = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[162]++;
  self.savedRanges = visit10_162_1(sel && sel.getRanges());
}, 
  _restoreEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[170]++;
  var self = this, editor = self.editor, sel = editor.getSelection(), savedRanges = self.savedRanges;
  _$jscoverage['/cmd.js'].lineData[179]++;
  if (visit11_179_1(UA['gecko'])) {
    _$jscoverage['/cmd.js'].lineData[180]++;
    editor.activateGecko();
  }
  _$jscoverage['/cmd.js'].lineData[183]++;
  if (visit12_183_1(savedRanges && sel)) {
    _$jscoverage['/cmd.js'].lineData[184]++;
    sel.selectRanges(savedRanges);
  }
  _$jscoverage['/cmd.js'].lineData[188]++;
  if (visit13_188_1(editor.__iframeFocus && sel)) {
    _$jscoverage['/cmd.js'].lineData[189]++;
    var element = sel.getStartElement();
    _$jscoverage['/cmd.js'].lineData[192]++;
    visit14_192_1(element && element.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true}));
  }
}, 
  _maximize: function(stop) {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[205]++;
  var self = this, editor = self.editor, editorEl = editor.get("el"), viewportHeight = Dom.viewportHeight(), viewportWidth = Dom.viewportWidth(), textareaEl = editor.get("textarea"), statusHeight = editor.get("statusBarEl") ? editor.get("statusBarEl")[0].offsetHeight : 0, toolHeight = editor.get("toolBarEl")[0].offsetHeight;
  _$jscoverage['/cmd.js'].lineData[215]++;
  if (visit15_215_1(!ie)) {
    _$jscoverage['/cmd.js'].lineData[216]++;
    Dom.css(doc.body, {
  width: 0, 
  height: 0, 
  overflow: "hidden"});
  } else {
    _$jscoverage['/cmd.js'].lineData[222]++;
    doc.body.style.overflow = "hidden";
  }
  _$jscoverage['/cmd.js'].lineData[224]++;
  doc.documentElement.style.overflow = "hidden";
  _$jscoverage['/cmd.js'].lineData[226]++;
  editorEl.css({
  position: "absolute", 
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE),
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[231]++;
  iframe.css({
  zIndex: Editor.baseZIndex(Editor.ZIndexManager.MAXIMIZE - 5),
  height: viewportHeight + "px", 
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[236]++;
  editorEl.offset({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[240]++;
  iframe.css({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[245]++;
  textareaEl.parent().css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[250]++;
  textareaEl.css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[254]++;
  if (visit16_254_1(stop !== true)) {
    _$jscoverage['/cmd.js'].lineData[255]++;
    arguments.callee.call(self, true);
  }
}, 
  _real: function() {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[259]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[261]++;
  if (visit17_261_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[262]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[265]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[266]++;
  self._saveSate();
  _$jscoverage['/cmd.js'].lineData[267]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[268]++;
  if (visit18_268_1(!self._resize)) {
    _$jscoverage['/cmd.js'].lineData[269]++;
    self._resize = S.buffer(function() {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[270]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[271]++;
  editor.fire("afterMaximizeWindow");
}, 100);
  }
  _$jscoverage['/cmd.js'].lineData[275]++;
  Event.on(window, "resize", self._resize);
  _$jscoverage['/cmd.js'].lineData[277]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[278]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[279]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[280]++;
  editor.fire("afterMaximizeWindow");
}, 30);
}, 
  maximizeWindow: function() {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[284]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[286]++;
  if (visit19_286_1(editor.fire("beforeMaximizeWindow") === false)) {
    _$jscoverage['/cmd.js'].lineData[287]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[289]++;
  init();
  _$jscoverage['/cmd.js'].lineData[290]++;
  self._real();
}, 
  destroy: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[293]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[294]++;
  if (visit20_294_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[295]++;
    Event.remove(window, "resize", self._resize);
    _$jscoverage['/cmd.js'].lineData[296]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[297]++;
    self._resize = 0;
  }
}});
  _$jscoverage['/cmd.js'].lineData[302]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[304]++;
  if (visit21_304_1(!editor.hasCommand("maximizeWindow"))) {
    _$jscoverage['/cmd.js'].lineData[305]++;
    var maximizeCmd = new MaximizeCmd(editor);
    _$jscoverage['/cmd.js'].lineData[307]++;
    editor.addCommand("maximizeWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[16]++;
  _$jscoverage['/cmd.js'].lineData[309]++;
  maximizeCmd.maximizeWindow();
}});
    _$jscoverage['/cmd.js'].lineData[313]++;
    editor.addCommand("restoreWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[17]++;
  _$jscoverage['/cmd.js'].lineData[315]++;
  maximizeCmd.restoreWindow();
}});
  }
}};
}, {
  requires: ['editor']});
