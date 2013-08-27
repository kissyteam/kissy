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
  _$jscoverage['/cmd.js'].lineData[5] = 0;
  _$jscoverage['/cmd.js'].lineData[6] = 0;
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
  _$jscoverage['/cmd.js'].lineData[104] = 0;
  _$jscoverage['/cmd.js'].lineData[109] = 0;
  _$jscoverage['/cmd.js'].lineData[111] = 0;
  _$jscoverage['/cmd.js'].lineData[112] = 0;
  _$jscoverage['/cmd.js'].lineData[121] = 0;
  _$jscoverage['/cmd.js'].lineData[125] = 0;
  _$jscoverage['/cmd.js'].lineData[126] = 0;
  _$jscoverage['/cmd.js'].lineData[128] = 0;
  _$jscoverage['/cmd.js'].lineData[129] = 0;
  _$jscoverage['/cmd.js'].lineData[130] = 0;
  _$jscoverage['/cmd.js'].lineData[133] = 0;
  _$jscoverage['/cmd.js'].lineData[135] = 0;
  _$jscoverage['/cmd.js'].lineData[136] = 0;
  _$jscoverage['/cmd.js'].lineData[137] = 0;
  _$jscoverage['/cmd.js'].lineData[138] = 0;
  _$jscoverage['/cmd.js'].lineData[142] = 0;
  _$jscoverage['/cmd.js'].lineData[144] = 0;
  _$jscoverage['/cmd.js'].lineData[146] = 0;
  _$jscoverage['/cmd.js'].lineData[149] = 0;
  _$jscoverage['/cmd.js'].lineData[150] = 0;
  _$jscoverage['/cmd.js'].lineData[160] = 0;
  _$jscoverage['/cmd.js'].lineData[162] = 0;
  _$jscoverage['/cmd.js'].lineData[163] = 0;
  _$jscoverage['/cmd.js'].lineData[164] = 0;
  _$jscoverage['/cmd.js'].lineData[166] = 0;
  _$jscoverage['/cmd.js'].lineData[168] = 0;
  _$jscoverage['/cmd.js'].lineData[176] = 0;
  _$jscoverage['/cmd.js'].lineData[185] = 0;
  _$jscoverage['/cmd.js'].lineData[186] = 0;
  _$jscoverage['/cmd.js'].lineData[189] = 0;
  _$jscoverage['/cmd.js'].lineData[190] = 0;
  _$jscoverage['/cmd.js'].lineData[194] = 0;
  _$jscoverage['/cmd.js'].lineData[195] = 0;
  _$jscoverage['/cmd.js'].lineData[198] = 0;
  _$jscoverage['/cmd.js'].lineData[211] = 0;
  _$jscoverage['/cmd.js'].lineData[221] = 0;
  _$jscoverage['/cmd.js'].lineData[222] = 0;
  _$jscoverage['/cmd.js'].lineData[228] = 0;
  _$jscoverage['/cmd.js'].lineData[230] = 0;
  _$jscoverage['/cmd.js'].lineData[232] = 0;
  _$jscoverage['/cmd.js'].lineData[237] = 0;
  _$jscoverage['/cmd.js'].lineData[242] = 0;
  _$jscoverage['/cmd.js'].lineData[246] = 0;
  _$jscoverage['/cmd.js'].lineData[251] = 0;
  _$jscoverage['/cmd.js'].lineData[256] = 0;
  _$jscoverage['/cmd.js'].lineData[260] = 0;
  _$jscoverage['/cmd.js'].lineData[261] = 0;
  _$jscoverage['/cmd.js'].lineData[265] = 0;
  _$jscoverage['/cmd.js'].lineData[267] = 0;
  _$jscoverage['/cmd.js'].lineData[268] = 0;
  _$jscoverage['/cmd.js'].lineData[271] = 0;
  _$jscoverage['/cmd.js'].lineData[272] = 0;
  _$jscoverage['/cmd.js'].lineData[273] = 0;
  _$jscoverage['/cmd.js'].lineData[274] = 0;
  _$jscoverage['/cmd.js'].lineData[275] = 0;
  _$jscoverage['/cmd.js'].lineData[276] = 0;
  _$jscoverage['/cmd.js'].lineData[277] = 0;
  _$jscoverage['/cmd.js'].lineData[281] = 0;
  _$jscoverage['/cmd.js'].lineData[283] = 0;
  _$jscoverage['/cmd.js'].lineData[284] = 0;
  _$jscoverage['/cmd.js'].lineData[285] = 0;
  _$jscoverage['/cmd.js'].lineData[286] = 0;
  _$jscoverage['/cmd.js'].lineData[290] = 0;
  _$jscoverage['/cmd.js'].lineData[292] = 0;
  _$jscoverage['/cmd.js'].lineData[293] = 0;
  _$jscoverage['/cmd.js'].lineData[295] = 0;
  _$jscoverage['/cmd.js'].lineData[296] = 0;
  _$jscoverage['/cmd.js'].lineData[299] = 0;
  _$jscoverage['/cmd.js'].lineData[300] = 0;
  _$jscoverage['/cmd.js'].lineData[301] = 0;
  _$jscoverage['/cmd.js'].lineData[302] = 0;
  _$jscoverage['/cmd.js'].lineData[303] = 0;
  _$jscoverage['/cmd.js'].lineData[308] = 0;
  _$jscoverage['/cmd.js'].lineData[311] = 0;
  _$jscoverage['/cmd.js'].lineData[313] = 0;
  _$jscoverage['/cmd.js'].lineData[315] = 0;
  _$jscoverage['/cmd.js'].lineData[317] = 0;
  _$jscoverage['/cmd.js'].lineData[321] = 0;
  _$jscoverage['/cmd.js'].lineData[323] = 0;
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
  _$jscoverage['/cmd.js'].branchData['111'] = [];
  _$jscoverage['/cmd.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['137'] = [];
  _$jscoverage['/cmd.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['149'] = [];
  _$jscoverage['/cmd.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['163'] = [];
  _$jscoverage['/cmd.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['168'] = [];
  _$jscoverage['/cmd.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['185'] = [];
  _$jscoverage['/cmd.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['189'] = [];
  _$jscoverage['/cmd.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['194'] = [];
  _$jscoverage['/cmd.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['198'] = [];
  _$jscoverage['/cmd.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['221'] = [];
  _$jscoverage['/cmd.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['260'] = [];
  _$jscoverage['/cmd.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['267'] = [];
  _$jscoverage['/cmd.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['274'] = [];
  _$jscoverage['/cmd.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['292'] = [];
  _$jscoverage['/cmd.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['300'] = [];
  _$jscoverage['/cmd.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/cmd.js'].branchData['311'] = [];
  _$jscoverage['/cmd.js'].branchData['311'][1] = new BranchData();
}
_$jscoverage['/cmd.js'].branchData['311'][1].init(20, 36, '!editor.hasCommand("maximizeWindow")');
function visit21_311_1(result) {
  _$jscoverage['/cmd.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['300'][1].init(48, 12, 'self._resize');
function visit20_300_1(result) {
  _$jscoverage['/cmd.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['292'][1].init(87, 45, 'editor.fire("beforeMaximizeWindow") === false');
function visit19_292_1(result) {
  _$jscoverage['/cmd.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['274'][1].init(263, 13, '!self._resize');
function visit18_274_1(result) {
  _$jscoverage['/cmd.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['267'][1].init(87, 12, 'self._resize');
function visit17_267_1(result) {
  _$jscoverage['/cmd.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['260'][1].init(1712, 13, 'stop !== true');
function visit16_260_1(result) {
  _$jscoverage['/cmd.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['221'][1].init(498, 3, '!ie');
function visit15_221_1(result) {
  _$jscoverage['/cmd.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['198'][1].init(173, 200, 'element && element.scrollIntoView(undefined, {\n  alignWithTop: false, \n  allowHorizontalScroll: true, \n  onlyScrollIfNeeded: true})');
function visit14_198_1(result) {
  _$jscoverage['/cmd.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['194'][1].init(508, 27, 'editor.__iframeFocus && sel');
function visit13_194_1(result) {
  _$jscoverage['/cmd.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['189'][1].init(371, 18, 'savedRanges && sel');
function visit12_189_1(result) {
  _$jscoverage['/cmd.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['185'][1].init(281, 11, 'UA[\'gecko\']');
function visit11_185_1(result) {
  _$jscoverage['/cmd.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['168'][1].init(328, 22, 'sel && sel.getRanges()');
function visit10_168_1(result) {
  _$jscoverage['/cmd.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['163'][1].init(125, 37, '!UA[\'gecko\'] || !editor.__iframeFocus');
function visit9_163_1(result) {
  _$jscoverage['/cmd.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['149'][1].init(1037, 6, 'ie < 8');
function visit8_149_1(result) {
  _$jscoverage['/cmd.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['137'][1].init(68, 15, 'pre != "static"');
function visit7_137_1(result) {
  _$jscoverage['/cmd.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/cmd.js'].branchData['111'][1].init(1542, 6, 'ie < 8');
function visit6_111_1(result) {
  _$jscoverage['/cmd.js'].branchData['111'][1].ranCondition(result);
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
}_$jscoverage['/cmd.js'].lineData[5]++;
KISSY.add("editor/plugin/maximize/cmd", function(S, Editor) {
  _$jscoverage['/cmd.js'].functionData[0]++;
  _$jscoverage['/cmd.js'].lineData[6]++;
  var UA = S.UA, ie = UA['ie'], doc = document, Node = S.Node, Event = S.Event, Dom = S.DOM, iframe, MAXIMIZE_TOOLBAR_CLASS = "editor-toolbar-padding", init = function() {
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
  _$jscoverage['/cmd.js'].lineData[104]++;
  iframe.css({
  left: "-99999px", 
  top: "-99999px"});
  _$jscoverage['/cmd.js'].lineData[109]++;
  window.scrollTo(self.scrollLeft, self.scrollTop);
  _$jscoverage['/cmd.js'].lineData[111]++;
  if (visit6_111_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[112]++;
    editor.get("toolBarEl").removeClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveSate: function() {
  _$jscoverage['/cmd.js'].functionData[6]++;
  _$jscoverage['/cmd.js'].lineData[121]++;
  var self = this, editor = self.editor, _savedParents = [], editorEl = editor.get("el");
  _$jscoverage['/cmd.js'].lineData[125]++;
  self.iframeHeight = editor.get("textarea").parent().style("height");
  _$jscoverage['/cmd.js'].lineData[126]++;
  self.editorElWidth = editorEl.style("width");
  _$jscoverage['/cmd.js'].lineData[128]++;
  self.scrollLeft = Dom.scrollLeft();
  _$jscoverage['/cmd.js'].lineData[129]++;
  self.scrollTop = Dom.scrollTop();
  _$jscoverage['/cmd.js'].lineData[130]++;
  window.scrollTo(0, 0);
  _$jscoverage['/cmd.js'].lineData[133]++;
  var p = editorEl.parent();
  _$jscoverage['/cmd.js'].lineData[135]++;
  while (p) {
    _$jscoverage['/cmd.js'].lineData[136]++;
    var pre = p.css("position");
    _$jscoverage['/cmd.js'].lineData[137]++;
    if (visit7_137_1(pre != "static")) {
      _$jscoverage['/cmd.js'].lineData[138]++;
      _savedParents.push({
  el: p, 
  position: pre});
      _$jscoverage['/cmd.js'].lineData[142]++;
      p.css("position", "static");
    }
    _$jscoverage['/cmd.js'].lineData[144]++;
    p = p.parent();
  }
  _$jscoverage['/cmd.js'].lineData[146]++;
  self._savedParents = _savedParents;
  _$jscoverage['/cmd.js'].lineData[149]++;
  if (visit8_149_1(ie < 8)) {
    _$jscoverage['/cmd.js'].lineData[150]++;
    editor.get("toolBarEl").addClass(editor.get('prefixCls') + MAXIMIZE_TOOLBAR_CLASS, undefined);
  }
}, 
  _saveEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[7]++;
  _$jscoverage['/cmd.js'].lineData[160]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[162]++;
  self.savedRanges = null;
  _$jscoverage['/cmd.js'].lineData[163]++;
  if (visit9_163_1(!UA['gecko'] || !editor.__iframeFocus)) {
    _$jscoverage['/cmd.js'].lineData[164]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[166]++;
  var sel = editor.getSelection();
  _$jscoverage['/cmd.js'].lineData[168]++;
  self.savedRanges = visit10_168_1(sel && sel.getRanges());
}, 
  _restoreEditorStatus: function() {
  _$jscoverage['/cmd.js'].functionData[8]++;
  _$jscoverage['/cmd.js'].lineData[176]++;
  var self = this, editor = self.editor, sel = editor.getSelection(), savedRanges = self.savedRanges;
  _$jscoverage['/cmd.js'].lineData[185]++;
  if (visit11_185_1(UA['gecko'])) {
    _$jscoverage['/cmd.js'].lineData[186]++;
    editor.activateGecko();
  }
  _$jscoverage['/cmd.js'].lineData[189]++;
  if (visit12_189_1(savedRanges && sel)) {
    _$jscoverage['/cmd.js'].lineData[190]++;
    sel.selectRanges(savedRanges);
  }
  _$jscoverage['/cmd.js'].lineData[194]++;
  if (visit13_194_1(editor.__iframeFocus && sel)) {
    _$jscoverage['/cmd.js'].lineData[195]++;
    var element = sel.getStartElement();
    _$jscoverage['/cmd.js'].lineData[198]++;
    visit14_198_1(element && element.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true}));
  }
}, 
  _maximize: function(stop) {
  _$jscoverage['/cmd.js'].functionData[9]++;
  _$jscoverage['/cmd.js'].lineData[211]++;
  var self = this, editor = self.editor, editorEl = editor.get("el"), viewportHeight = Dom.viewportHeight(), viewportWidth = Dom.viewportWidth(), textareaEl = editor.get("textarea"), statusHeight = editor.get("statusBarEl") ? editor.get("statusBarEl")[0].offsetHeight : 0, toolHeight = editor.get("toolBarEl")[0].offsetHeight;
  _$jscoverage['/cmd.js'].lineData[221]++;
  if (visit15_221_1(!ie)) {
    _$jscoverage['/cmd.js'].lineData[222]++;
    Dom.css(doc.body, {
  width: 0, 
  height: 0, 
  overflow: "hidden"});
  } else {
    _$jscoverage['/cmd.js'].lineData[228]++;
    doc.body.style.overflow = "hidden";
  }
  _$jscoverage['/cmd.js'].lineData[230]++;
  doc.documentElement.style.overflow = "hidden";
  _$jscoverage['/cmd.js'].lineData[232]++;
  editorEl.css({
  position: "absolute", 
  zIndex: Editor.baseZIndex(Editor.zIndexManager.MAXIMIZE), 
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[237]++;
  iframe.css({
  zIndex: Editor.baseZIndex(Editor.zIndexManager.MAXIMIZE - 5), 
  height: viewportHeight + "px", 
  width: viewportWidth + "px"});
  _$jscoverage['/cmd.js'].lineData[242]++;
  editorEl.offset({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[246]++;
  iframe.css({
  left: 0, 
  top: 0});
  _$jscoverage['/cmd.js'].lineData[251]++;
  textareaEl.parent().css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[256]++;
  textareaEl.css({
  height: (viewportHeight - statusHeight - toolHeight) + "px"});
  _$jscoverage['/cmd.js'].lineData[260]++;
  if (visit16_260_1(stop !== true)) {
    _$jscoverage['/cmd.js'].lineData[261]++;
    arguments.callee.call(self, true);
  }
}, 
  _real: function() {
  _$jscoverage['/cmd.js'].functionData[10]++;
  _$jscoverage['/cmd.js'].lineData[265]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[267]++;
  if (visit17_267_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[268]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[271]++;
  self._saveEditorStatus();
  _$jscoverage['/cmd.js'].lineData[272]++;
  self._saveSate();
  _$jscoverage['/cmd.js'].lineData[273]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[274]++;
  if (visit18_274_1(!self._resize)) {
    _$jscoverage['/cmd.js'].lineData[275]++;
    self._resize = S.buffer(function() {
  _$jscoverage['/cmd.js'].functionData[11]++;
  _$jscoverage['/cmd.js'].lineData[276]++;
  self._maximize();
  _$jscoverage['/cmd.js'].lineData[277]++;
  editor.fire("afterMaximizeWindow");
}, 100);
  }
  _$jscoverage['/cmd.js'].lineData[281]++;
  Event.on(window, "resize", self._resize);
  _$jscoverage['/cmd.js'].lineData[283]++;
  setTimeout(function() {
  _$jscoverage['/cmd.js'].functionData[12]++;
  _$jscoverage['/cmd.js'].lineData[284]++;
  self._restoreEditorStatus();
  _$jscoverage['/cmd.js'].lineData[285]++;
  editor.notifySelectionChange();
  _$jscoverage['/cmd.js'].lineData[286]++;
  editor.fire("afterMaximizeWindow");
}, 30);
}, 
  maximizeWindow: function() {
  _$jscoverage['/cmd.js'].functionData[13]++;
  _$jscoverage['/cmd.js'].lineData[290]++;
  var self = this, editor = self.editor;
  _$jscoverage['/cmd.js'].lineData[292]++;
  if (visit19_292_1(editor.fire("beforeMaximizeWindow") === false)) {
    _$jscoverage['/cmd.js'].lineData[293]++;
    return;
  }
  _$jscoverage['/cmd.js'].lineData[295]++;
  init();
  _$jscoverage['/cmd.js'].lineData[296]++;
  self._real();
}, 
  destroy: function() {
  _$jscoverage['/cmd.js'].functionData[14]++;
  _$jscoverage['/cmd.js'].lineData[299]++;
  var self = this;
  _$jscoverage['/cmd.js'].lineData[300]++;
  if (visit20_300_1(self._resize)) {
    _$jscoverage['/cmd.js'].lineData[301]++;
    Event.remove(window, "resize", self._resize);
    _$jscoverage['/cmd.js'].lineData[302]++;
    self._resize.stop();
    _$jscoverage['/cmd.js'].lineData[303]++;
    self._resize = 0;
  }
}});
  _$jscoverage['/cmd.js'].lineData[308]++;
  return {
  init: function(editor) {
  _$jscoverage['/cmd.js'].functionData[15]++;
  _$jscoverage['/cmd.js'].lineData[311]++;
  if (visit21_311_1(!editor.hasCommand("maximizeWindow"))) {
    _$jscoverage['/cmd.js'].lineData[313]++;
    var maximizeCmd = new MaximizeCmd(editor);
    _$jscoverage['/cmd.js'].lineData[315]++;
    editor.addCommand("maximizeWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[16]++;
  _$jscoverage['/cmd.js'].lineData[317]++;
  maximizeCmd.maximizeWindow();
}});
    _$jscoverage['/cmd.js'].lineData[321]++;
    editor.addCommand("restoreWindow", {
  exec: function() {
  _$jscoverage['/cmd.js'].functionData[17]++;
  _$jscoverage['/cmd.js'].lineData[323]++;
  maximizeCmd.restoreWindow();
}});
  }
}};
}, {
  requires: ['editor']});
