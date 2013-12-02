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
if (! _$jscoverage['/container.js']) {
  _$jscoverage['/container.js'] = {};
  _$jscoverage['/container.js'].lineData = [];
  _$jscoverage['/container.js'].lineData[6] = 0;
  _$jscoverage['/container.js'].lineData[7] = 0;
  _$jscoverage['/container.js'].lineData[8] = 0;
  _$jscoverage['/container.js'].lineData[10] = 0;
  _$jscoverage['/container.js'].lineData[11] = 0;
  _$jscoverage['/container.js'].lineData[12] = 0;
  _$jscoverage['/container.js'].lineData[13] = 0;
  _$jscoverage['/container.js'].lineData[15] = 0;
  _$jscoverage['/container.js'].lineData[19] = 0;
  _$jscoverage['/container.js'].lineData[22] = 0;
  _$jscoverage['/container.js'].lineData[24] = 0;
  _$jscoverage['/container.js'].lineData[26] = 0;
  _$jscoverage['/container.js'].lineData[28] = 0;
  _$jscoverage['/container.js'].lineData[29] = 0;
  _$jscoverage['/container.js'].lineData[31] = 0;
  _$jscoverage['/container.js'].lineData[37] = 0;
  _$jscoverage['/container.js'].lineData[38] = 0;
  _$jscoverage['/container.js'].lineData[40] = 0;
  _$jscoverage['/container.js'].lineData[41] = 0;
  _$jscoverage['/container.js'].lineData[44] = 0;
  _$jscoverage['/container.js'].lineData[51] = 0;
  _$jscoverage['/container.js'].lineData[52] = 0;
  _$jscoverage['/container.js'].lineData[55] = 0;
  _$jscoverage['/container.js'].lineData[57] = 0;
  _$jscoverage['/container.js'].lineData[59] = 0;
  _$jscoverage['/container.js'].lineData[60] = 0;
  _$jscoverage['/container.js'].lineData[63] = 0;
  _$jscoverage['/container.js'].lineData[64] = 0;
  _$jscoverage['/container.js'].lineData[65] = 0;
  _$jscoverage['/container.js'].lineData[70] = 0;
  _$jscoverage['/container.js'].lineData[81] = 0;
  _$jscoverage['/container.js'].lineData[85] = 0;
  _$jscoverage['/container.js'].lineData[89] = 0;
  _$jscoverage['/container.js'].lineData[93] = 0;
  _$jscoverage['/container.js'].lineData[97] = 0;
  _$jscoverage['/container.js'].lineData[101] = 0;
  _$jscoverage['/container.js'].lineData[105] = 0;
  _$jscoverage['/container.js'].lineData[109] = 0;
  _$jscoverage['/container.js'].lineData[112] = 0;
  _$jscoverage['/container.js'].lineData[113] = 0;
  _$jscoverage['/container.js'].lineData[118] = 0;
  _$jscoverage['/container.js'].lineData[121] = 0;
  _$jscoverage['/container.js'].lineData[122] = 0;
  _$jscoverage['/container.js'].lineData[139] = 0;
  _$jscoverage['/container.js'].lineData[141] = 0;
  _$jscoverage['/container.js'].lineData[142] = 0;
  _$jscoverage['/container.js'].lineData[144] = 0;
  _$jscoverage['/container.js'].lineData[151] = 0;
  _$jscoverage['/container.js'].lineData[154] = 0;
  _$jscoverage['/container.js'].lineData[156] = 0;
  _$jscoverage['/container.js'].lineData[163] = 0;
  _$jscoverage['/container.js'].lineData[170] = 0;
  _$jscoverage['/container.js'].lineData[171] = 0;
  _$jscoverage['/container.js'].lineData[172] = 0;
  _$jscoverage['/container.js'].lineData[173] = 0;
  _$jscoverage['/container.js'].lineData[174] = 0;
  _$jscoverage['/container.js'].lineData[175] = 0;
  _$jscoverage['/container.js'].lineData[176] = 0;
  _$jscoverage['/container.js'].lineData[177] = 0;
  _$jscoverage['/container.js'].lineData[180] = 0;
  _$jscoverage['/container.js'].lineData[181] = 0;
  _$jscoverage['/container.js'].lineData[183] = 0;
  _$jscoverage['/container.js'].lineData[185] = 0;
  _$jscoverage['/container.js'].lineData[187] = 0;
  _$jscoverage['/container.js'].lineData[192] = 0;
  _$jscoverage['/container.js'].lineData[208] = 0;
  _$jscoverage['/container.js'].lineData[209] = 0;
  _$jscoverage['/container.js'].lineData[211] = 0;
  _$jscoverage['/container.js'].lineData[226] = 0;
  _$jscoverage['/container.js'].lineData[229] = 0;
  _$jscoverage['/container.js'].lineData[230] = 0;
  _$jscoverage['/container.js'].lineData[232] = 0;
  _$jscoverage['/container.js'].lineData[241] = 0;
  _$jscoverage['/container.js'].lineData[242] = 0;
  _$jscoverage['/container.js'].lineData[250] = 0;
  _$jscoverage['/container.js'].lineData[252] = 0;
  _$jscoverage['/container.js'].lineData[253] = 0;
  _$jscoverage['/container.js'].lineData[254] = 0;
  _$jscoverage['/container.js'].lineData[270] = 0;
  _$jscoverage['/container.js'].lineData[274] = 0;
  _$jscoverage['/container.js'].lineData[275] = 0;
  _$jscoverage['/container.js'].lineData[276] = 0;
  _$jscoverage['/container.js'].lineData[277] = 0;
  _$jscoverage['/container.js'].lineData[278] = 0;
  _$jscoverage['/container.js'].lineData[279] = 0;
  _$jscoverage['/container.js'].lineData[282] = 0;
  _$jscoverage['/container.js'].lineData[285] = 0;
  _$jscoverage['/container.js'].lineData[288] = 0;
  _$jscoverage['/container.js'].lineData[289] = 0;
  _$jscoverage['/container.js'].lineData[290] = 0;
  _$jscoverage['/container.js'].lineData[291] = 0;
}
if (! _$jscoverage['/container.js'].functionData) {
  _$jscoverage['/container.js'].functionData = [];
  _$jscoverage['/container.js'].functionData[0] = 0;
  _$jscoverage['/container.js'].functionData[1] = 0;
  _$jscoverage['/container.js'].functionData[2] = 0;
  _$jscoverage['/container.js'].functionData[3] = 0;
  _$jscoverage['/container.js'].functionData[4] = 0;
  _$jscoverage['/container.js'].functionData[5] = 0;
  _$jscoverage['/container.js'].functionData[6] = 0;
  _$jscoverage['/container.js'].functionData[7] = 0;
  _$jscoverage['/container.js'].functionData[8] = 0;
  _$jscoverage['/container.js'].functionData[9] = 0;
  _$jscoverage['/container.js'].functionData[10] = 0;
  _$jscoverage['/container.js'].functionData[11] = 0;
  _$jscoverage['/container.js'].functionData[12] = 0;
  _$jscoverage['/container.js'].functionData[13] = 0;
  _$jscoverage['/container.js'].functionData[14] = 0;
  _$jscoverage['/container.js'].functionData[15] = 0;
  _$jscoverage['/container.js'].functionData[16] = 0;
}
if (! _$jscoverage['/container.js'].branchData) {
  _$jscoverage['/container.js'].branchData = {};
  _$jscoverage['/container.js'].branchData['12'] = [];
  _$jscoverage['/container.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['28'] = [];
  _$jscoverage['/container.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['40'] = [];
  _$jscoverage['/container.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['51'] = [];
  _$jscoverage['/container.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['57'] = [];
  _$jscoverage['/container.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['59'] = [];
  _$jscoverage['/container.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['63'] = [];
  _$jscoverage['/container.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['97'] = [];
  _$jscoverage['/container.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['112'] = [];
  _$jscoverage['/container.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['121'] = [];
  _$jscoverage['/container.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['141'] = [];
  _$jscoverage['/container.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['173'] = [];
  _$jscoverage['/container.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['174'] = [];
  _$jscoverage['/container.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['176'] = [];
  _$jscoverage['/container.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['180'] = [];
  _$jscoverage['/container.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['208'] = [];
  _$jscoverage['/container.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['229'] = [];
  _$jscoverage['/container.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['242'] = [];
  _$jscoverage['/container.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['252'] = [];
  _$jscoverage['/container.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['253'] = [];
  _$jscoverage['/container.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['274'] = [];
  _$jscoverage['/container.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['276'] = [];
  _$jscoverage['/container.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['277'] = [];
  _$jscoverage['/container.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['288'] = [];
  _$jscoverage['/container.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['290'] = [];
  _$jscoverage['/container.js'].branchData['290'][1] = new BranchData();
}
_$jscoverage['/container.js'].branchData['290'][1].init(63, 11, 'c.isControl');
function visit28_290_1(result) {
  _$jscoverage['/container.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['288'][1].init(111, 12, 'i < v.length');
function visit27_288_1(result) {
  _$jscoverage['/container.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['277'][1].init(47, 46, 'defaultChildCfg || self.get(\'defaultChildCfg\')');
function visit26_277_1(result) {
  _$jscoverage['/container.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['276'][1].init(63, 12, '!c.isControl');
function visit25_276_1(result) {
  _$jscoverage['/container.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['274'][1].init(172, 12, 'i < v.length');
function visit24_274_1(result) {
  _$jscoverage['/container.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['253'][1].init(21, 19, 'children[i].destroy');
function visit23_253_1(result) {
  _$jscoverage['/container.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['252'][1].init(93, 19, 'i < children.length');
function visit22_252_1(result) {
  _$jscoverage['/container.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['242'][1].init(69, 23, 'children[index] || null');
function visit21_242_1(result) {
  _$jscoverage['/container.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['229'][1].init(126, 12, 'i < t.length');
function visit20_229_1(result) {
  _$jscoverage['/container.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['208'][1].init(17, 21, 'destroy === undefined');
function visit19_208_1(result) {
  _$jscoverage['/container.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['180'][1].init(21, 8, 'elBefore');
function visit18_180_1(result) {
  _$jscoverage['/container.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['176'][1].init(49, 31, 'cEl.parentNode !== domContentEl');
function visit17_176_1(result) {
  _$jscoverage['/container.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['174'][1].init(423, 17, 'c.get(\'rendered\')');
function visit16_174_1(result) {
  _$jscoverage['/container.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['173'][1].init(364, 41, 'domContentEl.children[childIndex] || null');
function visit15_173_1(result) {
  _$jscoverage['/container.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['141'][1].init(95, 19, 'index === undefined');
function visit14_141_1(result) {
  _$jscoverage['/container.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['121'][1].init(122, 19, 'i < children.length');
function visit13_121_1(result) {
  _$jscoverage['/container.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['112'][1].init(122, 19, 'i < children.length');
function visit12_112_1(result) {
  _$jscoverage['/container.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['97'][1].init(393, 38, 'defaultChildCfg.prefixCls || prefixCls');
function visit11_97_1(result) {
  _$jscoverage['/container.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['63'][1].init(17, 24, 'c.get && (cDOMEl = c.el)');
function visit10_63_1(result) {
  _$jscoverage['/container.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['59'][1].init(48, 9, 'c.destroy');
function visit9_59_1(result) {
  _$jscoverage['/container.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['57'][1].init(404, 7, 'destroy');
function visit8_57_1(result) {
  _$jscoverage['/container.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['51'][1].init(286, 12, 'index !== -1');
function visit7_51_1(result) {
  _$jscoverage['/container.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['40'][1].init(39, 17, 'e.target !== self');
function visit6_40_1(result) {
  _$jscoverage['/container.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['28'][1].init(377, 20, 'self.get(\'rendered\')');
function visit5_28_1(result) {
  _$jscoverage['/container.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['12'][1].init(38, 17, 'e.target !== self');
function visit4_12_1(result) {
  _$jscoverage['/container.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/container.js'].functionData[0]++;
  _$jscoverage['/container.js'].lineData[7]++;
  var Control = require('component/control');
  _$jscoverage['/container.js'].lineData[8]++;
  var ContainerRender = require('./container/render');
  _$jscoverage['/container.js'].lineData[10]++;
  function defAddChild(e) {
    _$jscoverage['/container.js'].functionData[1]++;
    _$jscoverage['/container.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[12]++;
    if (visit4_12_1(e.target !== self)) {
      _$jscoverage['/container.js'].lineData[13]++;
      return;
    }
    _$jscoverage['/container.js'].lineData[15]++;
    var c = e.component, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[19]++;
    children.splice(index, 0, c);
    _$jscoverage['/container.js'].lineData[22]++;
    children = self.get('children');
    _$jscoverage['/container.js'].lineData[24]++;
    c = children[index];
    _$jscoverage['/container.js'].lineData[26]++;
    c.setInternal('parent', self);
    _$jscoverage['/container.js'].lineData[28]++;
    if (visit5_28_1(self.get('rendered'))) {
      _$jscoverage['/container.js'].lineData[29]++;
      self.renderChild(index);
    }
    _$jscoverage['/container.js'].lineData[31]++;
    self.fire('afterAddChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[37]++;
  function defRemoveChild(e) {
    _$jscoverage['/container.js'].functionData[2]++;
    _$jscoverage['/container.js'].lineData[38]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[40]++;
    if (visit6_40_1(e.target !== self)) {
      _$jscoverage['/container.js'].lineData[41]++;
      return;
    }
    _$jscoverage['/container.js'].lineData[44]++;
    var c = e.component, cDOMParentEl, cDOMEl, destroy = e.destroy, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[51]++;
    if (visit7_51_1(index !== -1)) {
      _$jscoverage['/container.js'].lineData[52]++;
      children.splice(index, 1);
    }
    _$jscoverage['/container.js'].lineData[55]++;
    c.setInternal('parent', null);
    _$jscoverage['/container.js'].lineData[57]++;
    if (visit8_57_1(destroy)) {
      _$jscoverage['/container.js'].lineData[59]++;
      if (visit9_59_1(c.destroy)) {
        _$jscoverage['/container.js'].lineData[60]++;
        c.destroy();
      }
    } else {
      _$jscoverage['/container.js'].lineData[63]++;
      if (visit10_63_1(c.get && (cDOMEl = c.el))) {
        _$jscoverage['/container.js'].lineData[64]++;
        if ((cDOMParentEl = cDOMEl.parentNode)) {
          _$jscoverage['/container.js'].lineData[65]++;
          cDOMParentEl.removeChild(cDOMEl);
        }
      }
    }
    _$jscoverage['/container.js'].lineData[70]++;
    self.fire('afterRemoveChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[81]++;
  return Control.extend({
  isContainer: true, 
  initializer: function() {
  _$jscoverage['/container.js'].functionData[3]++;
  _$jscoverage['/container.js'].lineData[85]++;
  var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
  _$jscoverage['/container.js'].lineData[89]++;
  self.publish('beforeAddChild', {
  defaultFn: defAddChild});
  _$jscoverage['/container.js'].lineData[93]++;
  self.publish('beforeRemoveChild', {
  defaultFn: defRemoveChild});
  _$jscoverage['/container.js'].lineData[97]++;
  defaultChildCfg.prefixCls = visit11_97_1(defaultChildCfg.prefixCls || prefixCls);
}, 
  createDom: function() {
  _$jscoverage['/container.js'].functionData[4]++;
  _$jscoverage['/container.js'].lineData[101]++;
  this.createChildren();
}, 
  renderUI: function() {
  _$jscoverage['/container.js'].functionData[5]++;
  _$jscoverage['/container.js'].lineData[105]++;
  this.renderChildren();
}, 
  renderChildren: function() {
  _$jscoverage['/container.js'].functionData[6]++;
  _$jscoverage['/container.js'].lineData[109]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[112]++;
  for (i = 0; visit12_112_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[113]++;
    self.renderChild(i);
  }
}, 
  createChildren: function() {
  _$jscoverage['/container.js'].functionData[7]++;
  _$jscoverage['/container.js'].lineData[118]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[121]++;
  for (i = 0; visit13_121_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[122]++;
    self.createChild(i);
  }
}, 
  addChild: function(c, index) {
  _$jscoverage['/container.js'].functionData[8]++;
  _$jscoverage['/container.js'].lineData[139]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[141]++;
  if (visit14_141_1(index === undefined)) {
    _$jscoverage['/container.js'].lineData[142]++;
    index = children.length;
  }
  _$jscoverage['/container.js'].lineData[144]++;
  self.fire('beforeAddChild', {
  component: c, 
  index: index});
}, 
  renderChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[9]++;
  _$jscoverage['/container.js'].lineData[151]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[154]++;
  self.createChild(childIndex).render();
  _$jscoverage['/container.js'].lineData[156]++;
  self.fire('afterRenderChild', {
  component: children[childIndex], 
  index: childIndex});
}, 
  createChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[10]++;
  _$jscoverage['/container.js'].lineData[163]++;
  var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
  _$jscoverage['/container.js'].lineData[170]++;
  c = children[childIndex];
  _$jscoverage['/container.js'].lineData[171]++;
  contentEl = self.view.getChildrenContainerEl();
  _$jscoverage['/container.js'].lineData[172]++;
  domContentEl = contentEl[0];
  _$jscoverage['/container.js'].lineData[173]++;
  elBefore = visit15_173_1(domContentEl.children[childIndex] || null);
  _$jscoverage['/container.js'].lineData[174]++;
  if (visit16_174_1(c.get('rendered'))) {
    _$jscoverage['/container.js'].lineData[175]++;
    cEl = c.el;
    _$jscoverage['/container.js'].lineData[176]++;
    if (visit17_176_1(cEl.parentNode !== domContentEl)) {
      _$jscoverage['/container.js'].lineData[177]++;
      domContentEl.insertBefore(cEl, elBefore);
    }
  } else {
    _$jscoverage['/container.js'].lineData[180]++;
    if (visit18_180_1(elBefore)) {
      _$jscoverage['/container.js'].lineData[181]++;
      c.set('elBefore', elBefore);
    } else {
      _$jscoverage['/container.js'].lineData[183]++;
      c.set('render', contentEl);
    }
    _$jscoverage['/container.js'].lineData[185]++;
    c.create();
  }
  _$jscoverage['/container.js'].lineData[187]++;
  self.fire('afterCreateChild', {
  component: c, 
  index: childIndex});
  _$jscoverage['/container.js'].lineData[192]++;
  return c;
}, 
  removeChild: function(c, destroy) {
  _$jscoverage['/container.js'].functionData[11]++;
  _$jscoverage['/container.js'].lineData[208]++;
  if (visit19_208_1(destroy === undefined)) {
    _$jscoverage['/container.js'].lineData[209]++;
    destroy = true;
  }
  _$jscoverage['/container.js'].lineData[211]++;
  this.fire('beforeRemoveChild', {
  component: c, 
  index: S.indexOf(c, this.get('children')), 
  destroy: destroy});
}, 
  removeChildren: function(destroy) {
  _$jscoverage['/container.js'].functionData[12]++;
  _$jscoverage['/container.js'].lineData[226]++;
  var self = this, i, t = [].concat(self.get('children'));
  _$jscoverage['/container.js'].lineData[229]++;
  for (i = 0; visit20_229_1(i < t.length); i++) {
    _$jscoverage['/container.js'].lineData[230]++;
    self.removeChild(t[i], destroy);
  }
  _$jscoverage['/container.js'].lineData[232]++;
  return self;
}, 
  getChildAt: function(index) {
  _$jscoverage['/container.js'].functionData[13]++;
  _$jscoverage['/container.js'].lineData[241]++;
  var children = this.get('children');
  _$jscoverage['/container.js'].lineData[242]++;
  return visit21_242_1(children[index] || null);
}, 
  destructor: function() {
  _$jscoverage['/container.js'].functionData[14]++;
  _$jscoverage['/container.js'].lineData[250]++;
  var i, children = this.get('children');
  _$jscoverage['/container.js'].lineData[252]++;
  for (i = 0; visit22_252_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[253]++;
    if (visit23_253_1(children[i].destroy)) {
      _$jscoverage['/container.js'].lineData[254]++;
      children[i].destroy();
    }
  }
}}, {
  ATTRS: {
  children: {
  value: [], 
  getter: function(v) {
  _$jscoverage['/container.js'].functionData[15]++;
  _$jscoverage['/container.js'].lineData[270]++;
  var defaultChildCfg = null, i, c, self = this;
  _$jscoverage['/container.js'].lineData[274]++;
  for (i = 0; visit24_274_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[275]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[276]++;
    if (visit25_276_1(!c.isControl)) {
      _$jscoverage['/container.js'].lineData[277]++;
      defaultChildCfg = visit26_277_1(defaultChildCfg || self.get('defaultChildCfg'));
      _$jscoverage['/container.js'].lineData[278]++;
      S.mix(c, defaultChildCfg, false);
      _$jscoverage['/container.js'].lineData[279]++;
      v[i] = this.createComponent(c);
    }
  }
  _$jscoverage['/container.js'].lineData[282]++;
  return v;
}, 
  setter: function(v) {
  _$jscoverage['/container.js'].functionData[16]++;
  _$jscoverage['/container.js'].lineData[285]++;
  var i, c;
  _$jscoverage['/container.js'].lineData[288]++;
  for (i = 0; visit27_288_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[289]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[290]++;
    if (visit28_290_1(c.isControl)) {
      _$jscoverage['/container.js'].lineData[291]++;
      c.setInternal('parent', this);
    }
  }
}}, 
  defaultChildCfg: {
  value: {}}, 
  xrender: {
  value: ContainerRender}}, 
  name: 'container'});
});
