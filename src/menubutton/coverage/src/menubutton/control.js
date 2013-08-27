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
if (! _$jscoverage['/menubutton/control.js']) {
  _$jscoverage['/menubutton/control.js'] = {};
  _$jscoverage['/menubutton/control.js'].lineData = [];
  _$jscoverage['/menubutton/control.js'].lineData[5] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[7] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[14] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[19] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[21] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[22] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[24] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[25] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[28] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[36] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[37] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[38] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[39] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[40] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[43] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[45] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[52] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[53] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[55] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[68] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[74] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[76] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[77] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[78] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[80] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[81] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[84] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[85] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[87] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[88] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[89] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[91] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[95] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[98] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[99] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[101] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[112] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[113] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[125] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[126] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[128] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[138] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[139] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[148] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[149] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[157] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[158] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[159] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[160] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[161] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[162] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[172] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[173] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[178] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[179] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[183] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[214] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[215] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[216] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[217] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[219] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[222] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[223] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[243] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[244] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[245] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[249] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[250] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[251] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[253] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].functionData) {
  _$jscoverage['/menubutton/control.js'].functionData = [];
  _$jscoverage['/menubutton/control.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[1] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[2] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[3] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[4] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[5] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[6] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[7] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[8] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[9] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[10] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[11] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[12] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[13] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[14] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[15] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].branchData) {
  _$jscoverage['/menubutton/control.js'].branchData = {};
  _$jscoverage['/menubutton/control.js'].branchData['21'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['25'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['37'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['41'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['42'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['74'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['77'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['80'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['84'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['87'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['95'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['96'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['97'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['158'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['159'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['161'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['173'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['179'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['214'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['215'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['222'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['244'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['250'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['253'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['253'][2] = new BranchData();
}
_$jscoverage['/menubutton/control.js'].branchData['253'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit27_253_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['253'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['253'][1].init(124, 32, 'menuItem && menuItem.el.id || \'\'');
function visit26_253_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['250'][1].init(14, 15, 'e.target.isMenu');
function visit25_250_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['244'][1].init(14, 50, 'e.target.isMenuItem && this.get(\'collapseOnClick\')');
function visit24_244_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['222'][1].init(26, 11, 'm.isControl');
function visit23_222_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['215'][1].init(37, 23, 'v.xclass || \'popupmenu\'');
function visit22_215_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['214'][1].init(26, 12, '!v.isControl');
function visit21_214_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['179'][1].init(44, 33, '!v && self.set("collapsed", true)');
function visit20_179_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['173'][1].init(63, 46, 'menu.get(\'rendered\') && menu.getChildAt(index)');
function visit19_173_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['161'][1].init(125, 13, 'menu.children');
function visit18_161_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['159'][1].init(22, 19, 'menu.removeChildren');
function visit17_159_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['158'][1].init(60, 4, 'menu');
function visit16_158_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['97'][1].init(43, 21, 'keyCode == KeyCode.UP');
function visit15_97_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['96'][2].init(1053, 23, 'keyCode == KeyCode.DOWN');
function visit14_96_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['96'][1].init(44, 65, 'keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit13_96_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['95'][2].init(1006, 24, 'keyCode == KeyCode.SPACE');
function visit12_95_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['95'][1].init(1006, 110, 'keyCode == KeyCode.SPACE || keyCode == KeyCode.DOWN || keyCode == KeyCode.UP');
function visit11_95_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['87'][1].init(114, 22, 'keyCode == KeyCode.ESC');
function visit10_87_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['84'][1].init(561, 43, 'menu.get(\'rendered\') && menu.get("visible")');
function visit9_84_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['80'][1].init(447, 17, 'type != "keydown"');
function visit8_80_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['77'][1].init(113, 15, 'type != "keyup"');
function visit7_77_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['74'][1].init(205, 24, 'keyCode == KeyCode.SPACE');
function visit6_74_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['42'][1].init(81, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit5_42_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['41'][1].init(43, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit4_41_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['37'][1].init(490, 24, 'self.get("matchElWidth")');
function visit3_37_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['25'][1].init(58, 20, '!menu.get("visible")');
function visit2_25_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['21'][1].init(90, 1, 'v');
function visit1_21_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].lineData[5]++;
KISSY.add("menubutton/control", function(S, Node, Button, MenuButtonRender, Menu, undefined) {
  _$jscoverage['/menubutton/control.js'].functionData[0]++;
  _$jscoverage['/menubutton/control.js'].lineData[7]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menubutton/control.js'].lineData[14]++;
  return Button.extend({
  isMenuButton: 1, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[1]++;
  _$jscoverage['/menubutton/control.js'].lineData[19]++;
  var self = this, menu = self.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[21]++;
  if (visit1_21_1(v)) {
    _$jscoverage['/menubutton/control.js'].lineData[22]++;
    menu.hide();
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[24]++;
    var el = self.$el;
    _$jscoverage['/menubutton/control.js'].lineData[25]++;
    if (visit2_25_1(!menu.get("visible"))) {
      _$jscoverage['/menubutton/control.js'].lineData[28]++;
      var align = {
  node: el, 
  points: ["bl", "tl"], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
      _$jscoverage['/menubutton/control.js'].lineData[36]++;
      S.mix(menu.get('align'), align, false);
      _$jscoverage['/menubutton/control.js'].lineData[37]++;
      if (visit3_37_1(self.get("matchElWidth"))) {
        _$jscoverage['/menubutton/control.js'].lineData[38]++;
        menu.render();
        _$jscoverage['/menubutton/control.js'].lineData[39]++;
        var menuEl = menu.get('el');
        _$jscoverage['/menubutton/control.js'].lineData[40]++;
        var borderWidth = (visit4_41_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit5_42_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/menubutton/control.js'].lineData[43]++;
        menu.set("width", menu.get("align").node[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/menubutton/control.js'].lineData[45]++;
      menu.show();
      _$jscoverage['/menubutton/control.js'].lineData[46]++;
      el.attr("aria-haspopup", menu.get('el').attr("id"));
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/menubutton/control.js'].functionData[2]++;
  _$jscoverage['/menubutton/control.js'].lineData[52]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[53]++;
  self.on('afterHighlightedItemChange', onMenuAfterHighlightedItemChange, self);
  _$jscoverage['/menubutton/control.js'].lineData[55]++;
  self.on('click', onMenuItemClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[3]++;
  _$jscoverage['/menubutton/control.js'].lineData[68]++;
  var self = this, keyCode = e.keyCode, type = String(e.type), menu = self.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[74]++;
  if (visit6_74_1(keyCode == KeyCode.SPACE)) {
    _$jscoverage['/menubutton/control.js'].lineData[76]++;
    e.preventDefault();
    _$jscoverage['/menubutton/control.js'].lineData[77]++;
    if (visit7_77_1(type != "keyup")) {
      _$jscoverage['/menubutton/control.js'].lineData[78]++;
      return undefined;
    }
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[80]++;
    if (visit8_80_1(type != "keydown")) {
      _$jscoverage['/menubutton/control.js'].lineData[81]++;
      return undefined;
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[84]++;
  if (visit9_84_1(menu.get('rendered') && menu.get("visible"))) {
    _$jscoverage['/menubutton/control.js'].lineData[85]++;
    var handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/menubutton/control.js'].lineData[87]++;
    if (visit10_87_1(keyCode == KeyCode.ESC)) {
      _$jscoverage['/menubutton/control.js'].lineData[88]++;
      self.set("collapsed", true);
      _$jscoverage['/menubutton/control.js'].lineData[89]++;
      return true;
    }
    _$jscoverage['/menubutton/control.js'].lineData[91]++;
    return handledByMenu;
  }
  _$jscoverage['/menubutton/control.js'].lineData[95]++;
  if (visit11_95_1(visit12_95_2(keyCode == KeyCode.SPACE) || visit13_96_1(visit14_96_2(keyCode == KeyCode.DOWN) || visit15_97_1(keyCode == KeyCode.UP)))) {
    _$jscoverage['/menubutton/control.js'].lineData[98]++;
    self.set("collapsed", false);
    _$jscoverage['/menubutton/control.js'].lineData[99]++;
    return true;
  }
  _$jscoverage['/menubutton/control.js'].lineData[101]++;
  return undefined;
}, 
  handleClickInternal: function() {
  _$jscoverage['/menubutton/control.js'].functionData[4]++;
  _$jscoverage['/menubutton/control.js'].lineData[112]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[113]++;
  self.set("collapsed", !self.get("collapsed"));
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[5]++;
  _$jscoverage['/menubutton/control.js'].lineData[125]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[126]++;
  self.callSuper(e);
  _$jscoverage['/menubutton/control.js'].lineData[128]++;
  self.set("collapsed", true);
}, 
  addItem: function(item, index) {
  _$jscoverage['/menubutton/control.js'].functionData[6]++;
  _$jscoverage['/menubutton/control.js'].lineData[138]++;
  var menu = this.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[139]++;
  menu.addChild(item, index);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[7]++;
  _$jscoverage['/menubutton/control.js'].lineData[148]++;
  var menu = this.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[149]++;
  menu.removeChild(c, destroy);
}, 
  removeItems: function(destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[8]++;
  _$jscoverage['/menubutton/control.js'].lineData[157]++;
  var menu = this.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[158]++;
  if (visit16_158_1(menu)) {
    _$jscoverage['/menubutton/control.js'].lineData[159]++;
    if (visit17_159_1(menu.removeChildren)) {
      _$jscoverage['/menubutton/control.js'].lineData[160]++;
      menu.removeChildren(destroy);
    } else {
      _$jscoverage['/menubutton/control.js'].lineData[161]++;
      if (visit18_161_1(menu.children)) {
        _$jscoverage['/menubutton/control.js'].lineData[162]++;
        menu.children = [];
      }
    }
  }
}, 
  getItemAt: function(index) {
  _$jscoverage['/menubutton/control.js'].functionData[9]++;
  _$jscoverage['/menubutton/control.js'].lineData[172]++;
  var menu = self.get("menu");
  _$jscoverage['/menubutton/control.js'].lineData[173]++;
  return visit19_173_1(menu.get('rendered') && menu.getChildAt(index));
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[10]++;
  _$jscoverage['/menubutton/control.js'].lineData[178]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[179]++;
  visit20_179_1(!v && self.set("collapsed", true));
}, 
  destructor: function() {
  _$jscoverage['/menubutton/control.js'].functionData[11]++;
  _$jscoverage['/menubutton/control.js'].lineData[183]++;
  this.get('menu').destroy();
}}, {
  ATTRS: {
  matchElWidth: {
  value: true}, 
  collapseOnClick: {
  value: false}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[12]++;
  _$jscoverage['/menubutton/control.js'].lineData[214]++;
  if (visit21_214_1(!v.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[215]++;
    v.xclass = visit22_215_1(v.xclass || 'popupmenu');
    _$jscoverage['/menubutton/control.js'].lineData[216]++;
    v = this.createComponent(v);
    _$jscoverage['/menubutton/control.js'].lineData[217]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menubutton/control.js'].lineData[219]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menubutton/control.js'].functionData[13]++;
  _$jscoverage['/menubutton/control.js'].lineData[222]++;
  if (visit23_222_1(m.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[223]++;
    m.setInternal('parent', this);
  }
}}, 
  collapsed: {
  value: false, 
  view: 1}, 
  xrender: {
  value: MenuButtonRender}}, 
  xclass: 'menu-button'});
  _$jscoverage['/menubutton/control.js'].lineData[243]++;
  function onMenuItemClick(e) {
    _$jscoverage['/menubutton/control.js'].functionData[14]++;
    _$jscoverage['/menubutton/control.js'].lineData[244]++;
    if (visit24_244_1(e.target.isMenuItem && this.get('collapseOnClick'))) {
      _$jscoverage['/menubutton/control.js'].lineData[245]++;
      this.set("collapsed", true);
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[249]++;
  function onMenuAfterHighlightedItemChange(e) {
    _$jscoverage['/menubutton/control.js'].functionData[15]++;
    _$jscoverage['/menubutton/control.js'].lineData[250]++;
    if (visit25_250_1(e.target.isMenu)) {
      _$jscoverage['/menubutton/control.js'].lineData[251]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menubutton/control.js'].lineData[253]++;
      el.setAttribute("aria-activedescendant", visit26_253_1(visit27_253_2(menuItem && menuItem.el.id) || ''));
    }
  }
}, {
  requires: ["node", "button", "./render", "menu"]});
