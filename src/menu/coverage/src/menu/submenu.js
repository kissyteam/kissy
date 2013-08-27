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
if (! _$jscoverage['/menu/submenu.js']) {
  _$jscoverage['/menu/submenu.js'] = {};
  _$jscoverage['/menu/submenu.js'].lineData = [];
  _$jscoverage['/menu/submenu.js'].lineData[6] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[8] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[11] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[12] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[15] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[16] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[17] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[18] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[20] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[21] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[32] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[37] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[38] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[39] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[40] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[45] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[46] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[47] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[48] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[53] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[54] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[58] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[59] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[63] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[64] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[69] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[70] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[71] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[73] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[79] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[80] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[85] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[86] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[87] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[88] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[98] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[100] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[101] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[103] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[104] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[105] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[107] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[108] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[109] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[110] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[116] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[117] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[119] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[133] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[140] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[142] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[143] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[144] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[145] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[146] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[154] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[155] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[158] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[160] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[165] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[167] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[168] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[174] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[176] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[180] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[184] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[186] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[187] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[220] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[221] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[222] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[223] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[225] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[228] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[229] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[243] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[244] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[248] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[256] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[257] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[258] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[261] = 0;
  _$jscoverage['/menu/submenu.js'].lineData[262] = 0;
}
if (! _$jscoverage['/menu/submenu.js'].functionData) {
  _$jscoverage['/menu/submenu.js'].functionData = [];
  _$jscoverage['/menu/submenu.js'].functionData[0] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[1] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[2] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[3] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[4] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[5] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[6] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[7] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[8] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[9] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[10] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[11] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[12] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[13] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[14] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[15] = 0;
  _$jscoverage['/menu/submenu.js'].functionData[16] = 0;
}
if (! _$jscoverage['/menu/submenu.js'].branchData) {
  _$jscoverage['/menu/submenu.js'].branchData = {};
  _$jscoverage['/menu/submenu.js'].branchData['15'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['15'][3] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['17'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['38'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['46'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['71'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['87'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['100'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['104'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['107'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['109'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['140'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['142'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['145'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['154'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['160'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['165'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['220'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['221'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/menu/submenu.js'].branchData['228'] = [];
  _$jscoverage['/menu/submenu.js'].branchData['228'][1] = new BranchData();
}
_$jscoverage['/menu/submenu.js'].branchData['228'][1].init(30, 11, 'm.isControl');
function visit63_228_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['221'][1].init(41, 23, 'v.xclass || \'popupmenu\'');
function visit62_221_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['220'][1].init(30, 12, '!v.isControl');
function visit61_220_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['165'][1].init(1375, 23, 'keyCode == KeyCode.LEFT');
function visit60_165_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['160'][1].init(1134, 29, 'menu.handleKeyDownInternal(e)');
function visit59_160_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['154'][1].init(600, 24, 'keyCode == KeyCode.ENTER');
function visit58_154_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['145'][1].init(138, 27, 'menuChild = menuChildren[0]');
function visit57_145_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['142'][1].init(56, 24, 'keyCode == KeyCode.RIGHT');
function visit56_142_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['140'][1].init(277, 20, '!hasKeyboardControl_');
function visit55_140_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['109'][1].init(371, 2, '!v');
function visit54_109_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['107'][1].init(276, 20, 'v && !e.fromKeyboard');
function visit53_107_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['104'][1].init(192, 11, 'e.fromMouse');
function visit52_104_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['100'][1].init(81, 2, '!e');
function visit51_100_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['87'][1].init(306, 20, '!menu.get(\'visible\')');
function visit50_87_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['71'][1].init(307, 19, 'menu.get(\'visible\')');
function visit49_71_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['46'][1].init(57, 33, 'dismissTimer = this._dismissTimer');
function visit48_46_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['38'][1].init(54, 27, 'showTimer = this._showTimer');
function visit47_38_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['17'][1].init(64, 24, '!self.get(\'highlighted\')');
function visit46_17_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['15'][3].init(122, 29, 'target.isMenuItem && e.newVal');
function visit45_15_3(result) {
  _$jscoverage['/menu/submenu.js'].branchData['15'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['15'][2].init(103, 15, 'target !== self');
function visit44_15_2(result) {
  _$jscoverage['/menu/submenu.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].branchData['15'][1].init(103, 48, 'target !== self && target.isMenuItem && e.newVal');
function visit43_15_1(result) {
  _$jscoverage['/menu/submenu.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/submenu.js'].lineData[6]++;
KISSY.add("menu/submenu", function(S, Node, MenuItem, SubMenuRender) {
  _$jscoverage['/menu/submenu.js'].functionData[0]++;
  _$jscoverage['/menu/submenu.js'].lineData[8]++;
  var KeyCode = Node.KeyCode, MENU_DELAY = 0.15;
  _$jscoverage['/menu/submenu.js'].lineData[11]++;
  function afterHighlightedChange(e) {
    _$jscoverage['/menu/submenu.js'].functionData[1]++;
    _$jscoverage['/menu/submenu.js'].lineData[12]++;
    var target = e.target, self = this;
    _$jscoverage['/menu/submenu.js'].lineData[15]++;
    if (visit43_15_1(visit44_15_2(target !== self) && visit45_15_3(target.isMenuItem && e.newVal))) {
      _$jscoverage['/menu/submenu.js'].lineData[16]++;
      self.clearHidePopupMenuTimers();
      _$jscoverage['/menu/submenu.js'].lineData[17]++;
      if (visit46_17_1(!self.get('highlighted'))) {
        _$jscoverage['/menu/submenu.js'].lineData[18]++;
        self.set('highlighted', true);
        _$jscoverage['/menu/submenu.js'].lineData[20]++;
        target.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[21]++;
        target.set('highlighted', true);
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[32]++;
  return MenuItem.extend({
  isSubMenu: 1, 
  clearShowPopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[2]++;
  _$jscoverage['/menu/submenu.js'].lineData[37]++;
  var showTimer;
  _$jscoverage['/menu/submenu.js'].lineData[38]++;
  if (visit47_38_1(showTimer = this._showTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[39]++;
    showTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[40]++;
    this._showTimer = null;
  }
}, 
  clearHidePopupMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[3]++;
  _$jscoverage['/menu/submenu.js'].lineData[45]++;
  var dismissTimer;
  _$jscoverage['/menu/submenu.js'].lineData[46]++;
  if (visit48_46_1(dismissTimer = this._dismissTimer)) {
    _$jscoverage['/menu/submenu.js'].lineData[47]++;
    dismissTimer.cancel();
    _$jscoverage['/menu/submenu.js'].lineData[48]++;
    this._dismissTimer = null;
  }
}, 
  clearSubMenuTimers: function() {
  _$jscoverage['/menu/submenu.js'].functionData[4]++;
  _$jscoverage['/menu/submenu.js'].lineData[53]++;
  this.clearHidePopupMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[54]++;
  this.clearShowPopupMenuTimers();
}, 
  bindUI: function() {
  _$jscoverage['/menu/submenu.js'].functionData[5]++;
  _$jscoverage['/menu/submenu.js'].lineData[58]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[59]++;
  self.on('afterHighlightedChange', afterHighlightedChange, self);
}, 
  handleMouseLeaveInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[6]++;
  _$jscoverage['/menu/submenu.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[64]++;
  self.set('highlighted', false, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[69]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[70]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[71]++;
  if (visit49_71_1(menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[73]++;
    self._dismissTimer = S.later(hideMenu, self.get("menuDelay") * 1000, false, self);
  }
}, 
  handleMouseEnterInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[7]++;
  _$jscoverage['/menu/submenu.js'].lineData[79]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[80]++;
  self.set('highlighted', true, {
  data: {
  fromMouse: 1}});
  _$jscoverage['/menu/submenu.js'].lineData[85]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[86]++;
  var menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[87]++;
  if (visit50_87_1(!menu.get('visible'))) {
    _$jscoverage['/menu/submenu.js'].lineData[88]++;
    self._showTimer = S.later(showMenu, self.get("menuDelay") * 1000, false, self);
  }
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/submenu.js'].functionData[8]++;
  _$jscoverage['/menu/submenu.js'].lineData[98]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[100]++;
  if (visit51_100_1(!e)) {
    _$jscoverage['/menu/submenu.js'].lineData[101]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[103]++;
  self.callSuper(e);
  _$jscoverage['/menu/submenu.js'].lineData[104]++;
  if (visit52_104_1(e.fromMouse)) {
    _$jscoverage['/menu/submenu.js'].lineData[105]++;
    return;
  }
  _$jscoverage['/menu/submenu.js'].lineData[107]++;
  if (visit53_107_1(v && !e.fromKeyboard)) {
    _$jscoverage['/menu/submenu.js'].lineData[108]++;
    showMenu.call(self);
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[109]++;
    if (visit54_109_1(!v)) {
      _$jscoverage['/menu/submenu.js'].lineData[110]++;
      hideMenu.call(self);
    }
  }
}, 
  handleClickInternal: function() {
  _$jscoverage['/menu/submenu.js'].functionData[9]++;
  _$jscoverage['/menu/submenu.js'].lineData[116]++;
  var self = this;
  _$jscoverage['/menu/submenu.js'].lineData[117]++;
  showMenu.call(self);
  _$jscoverage['/menu/submenu.js'].lineData[119]++;
  self.callSuper(e);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menu/submenu.js'].functionData[10]++;
  _$jscoverage['/menu/submenu.js'].lineData[133]++;
  var self = this, menu = self.get('menu'), menuChildren, menuChild, hasKeyboardControl_ = menu.get("visible"), keyCode = e.keyCode;
  _$jscoverage['/menu/submenu.js'].lineData[140]++;
  if (visit55_140_1(!hasKeyboardControl_)) {
    _$jscoverage['/menu/submenu.js'].lineData[142]++;
    if (visit56_142_1(keyCode == KeyCode.RIGHT)) {
      _$jscoverage['/menu/submenu.js'].lineData[143]++;
      showMenu.call(self);
      _$jscoverage['/menu/submenu.js'].lineData[144]++;
      menuChildren = menu.get("children");
      _$jscoverage['/menu/submenu.js'].lineData[145]++;
      if (visit57_145_1(menuChild = menuChildren[0])) {
        _$jscoverage['/menu/submenu.js'].lineData[146]++;
        menuChild.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      }
    } else {
      _$jscoverage['/menu/submenu.js'].lineData[154]++;
      if (visit58_154_1(keyCode == KeyCode.ENTER)) {
        _$jscoverage['/menu/submenu.js'].lineData[155]++;
        return self.handleClickInternal(e);
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[158]++;
        return undefined;
      }
    }
  } else {
    _$jscoverage['/menu/submenu.js'].lineData[160]++;
    if (visit59_160_1(menu.handleKeyDownInternal(e))) {
    } else {
      _$jscoverage['/menu/submenu.js'].lineData[165]++;
      if (visit60_165_1(keyCode == KeyCode.LEFT)) {
        _$jscoverage['/menu/submenu.js'].lineData[167]++;
        self.set('highlighted', false);
        _$jscoverage['/menu/submenu.js'].lineData[168]++;
        self.set('highlighted', true, {
  data: {
  fromKeyboard: 1}});
      } else {
        _$jscoverage['/menu/submenu.js'].lineData[174]++;
        return undefined;
      }
    }
  }
  _$jscoverage['/menu/submenu.js'].lineData[176]++;
  return true;
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/submenu.js'].functionData[11]++;
  _$jscoverage['/menu/submenu.js'].lineData[180]++;
  return this.get('menu').containsElement(element);
}, 
  destructor: function() {
  _$jscoverage['/menu/submenu.js'].functionData[12]++;
  _$jscoverage['/menu/submenu.js'].lineData[184]++;
  var self = this, menu = self.get('menu');
  _$jscoverage['/menu/submenu.js'].lineData[186]++;
  self.clearSubMenuTimers();
  _$jscoverage['/menu/submenu.js'].lineData[187]++;
  menu.destroy();
}}, {
  ATTRS: {
  menuDelay: {
  value: MENU_DELAY}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/menu/submenu.js'].functionData[13]++;
  _$jscoverage['/menu/submenu.js'].lineData[220]++;
  if (visit61_220_1(!v.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[221]++;
    v.xclass = visit62_221_1(v.xclass || 'popupmenu');
    _$jscoverage['/menu/submenu.js'].lineData[222]++;
    v = this.createComponent(v);
    _$jscoverage['/menu/submenu.js'].lineData[223]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menu/submenu.js'].lineData[225]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menu/submenu.js'].functionData[14]++;
  _$jscoverage['/menu/submenu.js'].lineData[228]++;
  if (visit63_228_1(m.isControl)) {
    _$jscoverage['/menu/submenu.js'].lineData[229]++;
    m.setInternal('parent', this);
  }
}}, 
  xrender: {
  value: SubMenuRender}}, 
  xclass: 'submenu'});
  _$jscoverage['/menu/submenu.js'].lineData[243]++;
  function showMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[15]++;
    _$jscoverage['/menu/submenu.js'].lineData[244]++;
    var self = this, menu = self.get('menu');
    _$jscoverage['/menu/submenu.js'].lineData[248]++;
    var align = {
  node: this.$el, 
  points: ['tr', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
    _$jscoverage['/menu/submenu.js'].lineData[256]++;
    S.mix(menu.get('align'), align, false);
    _$jscoverage['/menu/submenu.js'].lineData[257]++;
    menu.show();
    _$jscoverage['/menu/submenu.js'].lineData[258]++;
    self.el.setAttribute("aria-haspopup", menu.get('el').attr("id"));
  }
  _$jscoverage['/menu/submenu.js'].lineData[261]++;
  function hideMenu() {
    _$jscoverage['/menu/submenu.js'].functionData[16]++;
    _$jscoverage['/menu/submenu.js'].lineData[262]++;
    this.get('menu').hide();
  }
}, {
  requires: ['node', './menuitem', './submenu-render']});
