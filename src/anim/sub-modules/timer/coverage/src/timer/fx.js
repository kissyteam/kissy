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
if (! _$jscoverage['/timer/fx.js']) {
  _$jscoverage['/timer/fx.js'] = {};
  _$jscoverage['/timer/fx.js'].lineData = [];
  _$jscoverage['/timer/fx.js'].lineData[6] = 0;
  _$jscoverage['/timer/fx.js'].lineData[7] = 0;
  _$jscoverage['/timer/fx.js'].lineData[8] = 0;
  _$jscoverage['/timer/fx.js'].lineData[10] = 0;
  _$jscoverage['/timer/fx.js'].lineData[11] = 0;
  _$jscoverage['/timer/fx.js'].lineData[12] = 0;
  _$jscoverage['/timer/fx.js'].lineData[13] = 0;
  _$jscoverage['/timer/fx.js'].lineData[21] = 0;
  _$jscoverage['/timer/fx.js'].lineData[22] = 0;
  _$jscoverage['/timer/fx.js'].lineData[25] = 0;
  _$jscoverage['/timer/fx.js'].lineData[36] = 0;
  _$jscoverage['/timer/fx.js'].lineData[44] = 0;
  _$jscoverage['/timer/fx.js'].lineData[45] = 0;
  _$jscoverage['/timer/fx.js'].lineData[48] = 0;
  _$jscoverage['/timer/fx.js'].lineData[56] = 0;
  _$jscoverage['/timer/fx.js'].lineData[57] = 0;
  _$jscoverage['/timer/fx.js'].lineData[60] = 0;
  _$jscoverage['/timer/fx.js'].lineData[62] = 0;
  _$jscoverage['/timer/fx.js'].lineData[63] = 0;
  _$jscoverage['/timer/fx.js'].lineData[66] = 0;
  _$jscoverage['/timer/fx.js'].lineData[68] = 0;
  _$jscoverage['/timer/fx.js'].lineData[70] = 0;
  _$jscoverage['/timer/fx.js'].lineData[71] = 0;
  _$jscoverage['/timer/fx.js'].lineData[74] = 0;
  _$jscoverage['/timer/fx.js'].lineData[75] = 0;
  _$jscoverage['/timer/fx.js'].lineData[77] = 0;
  _$jscoverage['/timer/fx.js'].lineData[78] = 0;
  _$jscoverage['/timer/fx.js'].lineData[79] = 0;
  _$jscoverage['/timer/fx.js'].lineData[81] = 0;
  _$jscoverage['/timer/fx.js'].lineData[83] = 0;
  _$jscoverage['/timer/fx.js'].lineData[84] = 0;
  _$jscoverage['/timer/fx.js'].lineData[85] = 0;
  _$jscoverage['/timer/fx.js'].lineData[87] = 0;
  _$jscoverage['/timer/fx.js'].lineData[102] = 0;
  _$jscoverage['/timer/fx.js'].lineData[104] = 0;
  _$jscoverage['/timer/fx.js'].lineData[106] = 0;
  _$jscoverage['/timer/fx.js'].lineData[115] = 0;
  _$jscoverage['/timer/fx.js'].lineData[120] = 0;
  _$jscoverage['/timer/fx.js'].lineData[121] = 0;
  _$jscoverage['/timer/fx.js'].lineData[123] = 0;
  _$jscoverage['/timer/fx.js'].lineData[124] = 0;
  _$jscoverage['/timer/fx.js'].lineData[126] = 0;
  _$jscoverage['/timer/fx.js'].lineData[127] = 0;
  _$jscoverage['/timer/fx.js'].lineData[129] = 0;
  _$jscoverage['/timer/fx.js'].lineData[134] = 0;
  _$jscoverage['/timer/fx.js'].lineData[141] = 0;
  _$jscoverage['/timer/fx.js'].lineData[143] = 0;
  _$jscoverage['/timer/fx.js'].lineData[145] = 0;
  _$jscoverage['/timer/fx.js'].lineData[147] = 0;
  _$jscoverage['/timer/fx.js'].lineData[150] = 0;
  _$jscoverage['/timer/fx.js'].lineData[151] = 0;
  _$jscoverage['/timer/fx.js'].lineData[156] = 0;
  _$jscoverage['/timer/fx.js'].lineData[157] = 0;
  _$jscoverage['/timer/fx.js'].lineData[158] = 0;
  _$jscoverage['/timer/fx.js'].lineData[159] = 0;
  _$jscoverage['/timer/fx.js'].lineData[160] = 0;
  _$jscoverage['/timer/fx.js'].lineData[162] = 0;
  _$jscoverage['/timer/fx.js'].lineData[166] = 0;
  _$jscoverage['/timer/fx.js'].lineData[167] = 0;
  _$jscoverage['/timer/fx.js'].lineData[169] = 0;
  _$jscoverage['/timer/fx.js'].lineData[170] = 0;
  _$jscoverage['/timer/fx.js'].lineData[173] = 0;
  _$jscoverage['/timer/fx.js'].lineData[174] = 0;
  _$jscoverage['/timer/fx.js'].lineData[176] = 0;
  _$jscoverage['/timer/fx.js'].lineData[177] = 0;
  _$jscoverage['/timer/fx.js'].lineData[179] = 0;
  _$jscoverage['/timer/fx.js'].lineData[182] = 0;
}
if (! _$jscoverage['/timer/fx.js'].functionData) {
  _$jscoverage['/timer/fx.js'].functionData = [];
  _$jscoverage['/timer/fx.js'].functionData[0] = 0;
  _$jscoverage['/timer/fx.js'].functionData[1] = 0;
  _$jscoverage['/timer/fx.js'].functionData[2] = 0;
  _$jscoverage['/timer/fx.js'].functionData[3] = 0;
  _$jscoverage['/timer/fx.js'].functionData[4] = 0;
  _$jscoverage['/timer/fx.js'].functionData[5] = 0;
  _$jscoverage['/timer/fx.js'].functionData[6] = 0;
  _$jscoverage['/timer/fx.js'].functionData[7] = 0;
  _$jscoverage['/timer/fx.js'].functionData[8] = 0;
  _$jscoverage['/timer/fx.js'].functionData[9] = 0;
}
if (! _$jscoverage['/timer/fx.js'].branchData) {
  _$jscoverage['/timer/fx.js'].branchData = {};
  _$jscoverage['/timer/fx.js'].branchData['13'] = [];
  _$jscoverage['/timer/fx.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['44'] = [];
  _$jscoverage['/timer/fx.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['56'] = [];
  _$jscoverage['/timer/fx.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'] = [];
  _$jscoverage['/timer/fx.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['62'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['70'] = [];
  _$jscoverage['/timer/fx.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['74'] = [];
  _$jscoverage['/timer/fx.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['75'] = [];
  _$jscoverage['/timer/fx.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['84'] = [];
  _$jscoverage['/timer/fx.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['102'] = [];
  _$jscoverage['/timer/fx.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['102'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['103'] = [];
  _$jscoverage['/timer/fx.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['120'] = [];
  _$jscoverage['/timer/fx.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['121'] = [];
  _$jscoverage['/timer/fx.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['123'] = [];
  _$jscoverage['/timer/fx.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['126'] = [];
  _$jscoverage['/timer/fx.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['135'] = [];
  _$jscoverage['/timer/fx.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['135'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['143'] = [];
  _$jscoverage['/timer/fx.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['143'][2] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['143'][3] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['144'] = [];
  _$jscoverage['/timer/fx.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['157'] = [];
  _$jscoverage['/timer/fx.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['159'] = [];
  _$jscoverage['/timer/fx.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['173'] = [];
  _$jscoverage['/timer/fx.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/timer/fx.js'].branchData['176'] = [];
  _$jscoverage['/timer/fx.js'].branchData['176'][1] = new BranchData();
}
_$jscoverage['/timer/fx.js'].branchData['176'][1].init(189, 54, '!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop])');
function visit69_176_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['173'][1].init(89, 19, 'fxType = cfg.fxType');
function visit68_173_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['159'][1].init(285, 19, 'runTime >= duration');
function visit67_159_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['157'][1].init(225, 12, 'runTime <= 0');
function visit66_157_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['144'][1].init(58, 42, 'Dom.attr(node, prop, undefined, 1) != null');
function visit65_144_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['143'][3].init(70, 26, 'node.style[prop] == null');
function visit64_143_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['143'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['143'][2].init(55, 41, '!node.style || node.style[prop] == null');
function visit63_143_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['143'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['143'][1].init(55, 101, '(!node.style || node.style[prop] == null) && Dom.attr(node, prop, undefined, 1) != null');
function visit62_143_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['135'][2].init(58, 12, 'r === \'auto\'');
function visit61_135_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['135'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['135'][1].init(52, 18, '!r || r === \'auto\'');
function visit60_135_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['126'][1].init(404, 14, 'type == \'attr\'');
function visit59_126_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['123'][1].init(276, 19, '!(type = self.type)');
function visit58_123_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['121'][1].init(25, 15, 'node[prop] || 0');
function visit57_121_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['120'][1].init(184, 15, 'self.isCustomFx');
function visit56_120_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['103'][1].init(46, 22, 'typeof to === \'number\'');
function visit55_103_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['102'][2].init(51, 24, 'typeof from === \'number\'');
function visit54_102_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['102'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['102'][1].init(51, 70, '(typeof from === \'number\') && (typeof to === \'number\')');
function visit53_102_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['84'][1].init(410, 19, 'self.type == \'attr\'');
function visit52_84_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['75'][1].init(22, 42, 'val === undefined');
function visit51_75_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['74'][1].init(810, 16, '!self.isCustomFx');
function visit50_74_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['70'][1].init(655, 14, 'propData.frame');
function visit49_70_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][3].init(489, 9, 'pos === 0');
function visit48_62_3(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][3].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][2].init(474, 11, 'from === to');
function visit47_62_2(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][2].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['62'][1].init(474, 24, 'from === to || pos === 0');
function visit46_62_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['56'][1].init(341, 17, 'pos === undefined');
function visit45_56_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['44'][1].init(18, 14, 'this.pos === 1');
function visit44_44_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].branchData['13'][1].init(72, 15, 'self.unit || \'\'');
function visit43_13_1(result) {
  _$jscoverage['/timer/fx.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/timer/fx.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/timer/fx.js'].functionData[0]++;
  _$jscoverage['/timer/fx.js'].lineData[7]++;
  var logger = S.getLogger('s/aim/timer/fx');
  _$jscoverage['/timer/fx.js'].lineData[8]++;
  var Dom = KISSY.require('dom');
  _$jscoverage['/timer/fx.js'].lineData[10]++;
  function load(self, cfg) {
    _$jscoverage['/timer/fx.js'].functionData[1]++;
    _$jscoverage['/timer/fx.js'].lineData[11]++;
    S.mix(self, cfg);
    _$jscoverage['/timer/fx.js'].lineData[12]++;
    self.pos = 0;
    _$jscoverage['/timer/fx.js'].lineData[13]++;
    self.unit = visit43_13_1(self.unit || '');
  }
  _$jscoverage['/timer/fx.js'].lineData[21]++;
  function Fx(cfg) {
    _$jscoverage['/timer/fx.js'].functionData[2]++;
    _$jscoverage['/timer/fx.js'].lineData[22]++;
    load(this, cfg);
  }
  _$jscoverage['/timer/fx.js'].lineData[25]++;
  Fx.prototype = {
  isCustomFx: 0, 
  constructor: Fx, 
  load: function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[3]++;
  _$jscoverage['/timer/fx.js'].lineData[36]++;
  load(this, cfg);
}, 
  frame: function(pos) {
  _$jscoverage['/timer/fx.js'].functionData[4]++;
  _$jscoverage['/timer/fx.js'].lineData[44]++;
  if (visit44_44_1(this.pos === 1)) {
    _$jscoverage['/timer/fx.js'].lineData[45]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[48]++;
  var self = this, anim = self.anim, prop = self.prop, node = anim.node, from = self.from, propData = self.propData, to = self.to;
  _$jscoverage['/timer/fx.js'].lineData[56]++;
  if (visit45_56_1(pos === undefined)) {
    _$jscoverage['/timer/fx.js'].lineData[57]++;
    pos = getPos(anim, propData);
  }
  _$jscoverage['/timer/fx.js'].lineData[60]++;
  self.pos = pos;
  _$jscoverage['/timer/fx.js'].lineData[62]++;
  if (visit46_62_1(visit47_62_2(from === to) || visit48_62_3(pos === 0))) {
    _$jscoverage['/timer/fx.js'].lineData[63]++;
    return;
  }
  _$jscoverage['/timer/fx.js'].lineData[66]++;
  var val = self.interpolate(from, to, self.pos);
  _$jscoverage['/timer/fx.js'].lineData[68]++;
  self.val = val;
  _$jscoverage['/timer/fx.js'].lineData[70]++;
  if (visit49_70_1(propData.frame)) {
    _$jscoverage['/timer/fx.js'].lineData[71]++;
    propData.frame.call(self, anim, self);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[74]++;
    if (visit50_74_1(!self.isCustomFx)) {
      _$jscoverage['/timer/fx.js'].lineData[75]++;
      if (visit51_75_1(val === undefined)) {
        _$jscoverage['/timer/fx.js'].lineData[77]++;
        self.pos = 1;
        _$jscoverage['/timer/fx.js'].lineData[78]++;
        val = to;
        _$jscoverage['/timer/fx.js'].lineData[79]++;
        logger.warn(prop + ' update directly ! : ' + val + ' : ' + from + ' : ' + to);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[81]++;
        val += self.unit;
      }
      _$jscoverage['/timer/fx.js'].lineData[83]++;
      self.val = val;
      _$jscoverage['/timer/fx.js'].lineData[84]++;
      if (visit52_84_1(self.type == 'attr')) {
        _$jscoverage['/timer/fx.js'].lineData[85]++;
        Dom.attr(node, prop, val, 1);
      } else {
        _$jscoverage['/timer/fx.js'].lineData[87]++;
        Dom.css(node, prop, val);
      }
    }
  }
}, 
  interpolate: function(from, to, pos) {
  _$jscoverage['/timer/fx.js'].functionData[5]++;
  _$jscoverage['/timer/fx.js'].lineData[102]++;
  if (visit53_102_1((visit54_102_2(typeof from === 'number')) && (visit55_103_1(typeof to === 'number')))) {
    _$jscoverage['/timer/fx.js'].lineData[104]++;
    return Math.round((from + (to - from) * pos) * 1e5) / 1e5;
  } else {
    _$jscoverage['/timer/fx.js'].lineData[106]++;
    return undefined;
  }
}, 
  cur: function() {
  _$jscoverage['/timer/fx.js'].functionData[6]++;
  _$jscoverage['/timer/fx.js'].lineData[115]++;
  var self = this, prop = self.prop, type, node = self.anim.node;
  _$jscoverage['/timer/fx.js'].lineData[120]++;
  if (visit56_120_1(self.isCustomFx)) {
    _$jscoverage['/timer/fx.js'].lineData[121]++;
    return visit57_121_1(node[prop] || 0);
  }
  _$jscoverage['/timer/fx.js'].lineData[123]++;
  if (visit58_123_1(!(type = self.type))) {
    _$jscoverage['/timer/fx.js'].lineData[124]++;
    type = self.type = isAttr(node, prop) ? 'attr' : 'css';
  }
  _$jscoverage['/timer/fx.js'].lineData[126]++;
  if (visit59_126_1(type == 'attr')) {
    _$jscoverage['/timer/fx.js'].lineData[127]++;
    return Dom.attr(node, prop, undefined, 1);
  } else {
    _$jscoverage['/timer/fx.js'].lineData[129]++;
    var parsed, r = Dom.css(node, prop);
    _$jscoverage['/timer/fx.js'].lineData[134]++;
    return isNaN(parsed = parseFloat(r)) ? visit60_135_1(!r || visit61_135_2(r === 'auto')) ? 0 : r : parsed;
  }
}};
  _$jscoverage['/timer/fx.js'].lineData[141]++;
  function isAttr(node, prop) {
    _$jscoverage['/timer/fx.js'].functionData[7]++;
    _$jscoverage['/timer/fx.js'].lineData[143]++;
    if (visit62_143_1((visit63_143_2(!node.style || visit64_143_3(node.style[prop] == null))) && visit65_144_1(Dom.attr(node, prop, undefined, 1) != null))) {
      _$jscoverage['/timer/fx.js'].lineData[145]++;
      return 1;
    }
    _$jscoverage['/timer/fx.js'].lineData[147]++;
    return 0;
  }
  _$jscoverage['/timer/fx.js'].lineData[150]++;
  function getPos(anim, propData) {
    _$jscoverage['/timer/fx.js'].functionData[8]++;
    _$jscoverage['/timer/fx.js'].lineData[151]++;
    var t = S.now(), runTime, startTime = anim.startTime, delay = propData.delay, duration = propData.duration;
    _$jscoverage['/timer/fx.js'].lineData[156]++;
    runTime = t - startTime - delay;
    _$jscoverage['/timer/fx.js'].lineData[157]++;
    if (visit66_157_1(runTime <= 0)) {
      _$jscoverage['/timer/fx.js'].lineData[158]++;
      return 0;
    } else {
      _$jscoverage['/timer/fx.js'].lineData[159]++;
      if (visit67_159_1(runTime >= duration)) {
        _$jscoverage['/timer/fx.js'].lineData[160]++;
        return 1;
      } else {
        _$jscoverage['/timer/fx.js'].lineData[162]++;
        return propData.easing(runTime / duration);
      }
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[166]++;
  Fx.Factories = {};
  _$jscoverage['/timer/fx.js'].lineData[167]++;
  Fx.FxTypes = {};
  _$jscoverage['/timer/fx.js'].lineData[169]++;
  Fx.getFx = function(cfg) {
  _$jscoverage['/timer/fx.js'].functionData[9]++;
  _$jscoverage['/timer/fx.js'].lineData[170]++;
  var Constructor = Fx, fxType, SubClass;
  _$jscoverage['/timer/fx.js'].lineData[173]++;
  if (visit68_173_1(fxType = cfg.fxType)) {
    _$jscoverage['/timer/fx.js'].lineData[174]++;
    Constructor = Fx.FxTypes[fxType];
  } else {
    _$jscoverage['/timer/fx.js'].lineData[176]++;
    if (visit69_176_1(!cfg.isCustomFx && (SubClass = Fx.Factories[cfg.prop]))) {
      _$jscoverage['/timer/fx.js'].lineData[177]++;
      Constructor = SubClass;
    }
  }
  _$jscoverage['/timer/fx.js'].lineData[179]++;
  return new Constructor(cfg);
};
  _$jscoverage['/timer/fx.js'].lineData[182]++;
  return Fx;
});
