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
if (! _$jscoverage['/resizable.js']) {
  _$jscoverage['/resizable.js'] = {};
  _$jscoverage['/resizable.js'].lineData = [];
  _$jscoverage['/resizable.js'].lineData[6] = 0;
  _$jscoverage['/resizable.js'].lineData[7] = 0;
  _$jscoverage['/resizable.js'].lineData[8] = 0;
  _$jscoverage['/resizable.js'].lineData[9] = 0;
  _$jscoverage['/resizable.js'].lineData[11] = 0;
  _$jscoverage['/resizable.js'].lineData[21] = 0;
  _$jscoverage['/resizable.js'].lineData[24] = 0;
  _$jscoverage['/resizable.js'].lineData[25] = 0;
  _$jscoverage['/resizable.js'].lineData[27] = 0;
  _$jscoverage['/resizable.js'].lineData[30] = 0;
  _$jscoverage['/resizable.js'].lineData[32] = 0;
  _$jscoverage['/resizable.js'].lineData[33] = 0;
  _$jscoverage['/resizable.js'].lineData[35] = 0;
  _$jscoverage['/resizable.js'].lineData[38] = 0;
  _$jscoverage['/resizable.js'].lineData[40] = 0;
  _$jscoverage['/resizable.js'].lineData[41] = 0;
  _$jscoverage['/resizable.js'].lineData[43] = 0;
  _$jscoverage['/resizable.js'].lineData[46] = 0;
  _$jscoverage['/resizable.js'].lineData[49] = 0;
  _$jscoverage['/resizable.js'].lineData[50] = 0;
  _$jscoverage['/resizable.js'].lineData[52] = 0;
  _$jscoverage['/resizable.js'].lineData[56] = 0;
  _$jscoverage['/resizable.js'].lineData[57] = 0;
  _$jscoverage['/resizable.js'].lineData[59] = 0;
  _$jscoverage['/resizable.js'].lineData[60] = 0;
  _$jscoverage['/resizable.js'].lineData[61] = 0;
  _$jscoverage['/resizable.js'].lineData[67] = 0;
  _$jscoverage['/resizable.js'].lineData[68] = 0;
  _$jscoverage['/resizable.js'].lineData[69] = 0;
  _$jscoverage['/resizable.js'].lineData[70] = 0;
  _$jscoverage['/resizable.js'].lineData[72] = 0;
  _$jscoverage['/resizable.js'].lineData[75] = 0;
  _$jscoverage['/resizable.js'].lineData[76] = 0;
  _$jscoverage['/resizable.js'].lineData[79] = 0;
  _$jscoverage['/resizable.js'].lineData[80] = 0;
  _$jscoverage['/resizable.js'].lineData[87] = 0;
  _$jscoverage['/resizable.js'].lineData[88] = 0;
  _$jscoverage['/resizable.js'].lineData[100] = 0;
  _$jscoverage['/resizable.js'].lineData[101] = 0;
  _$jscoverage['/resizable.js'].lineData[102] = 0;
  _$jscoverage['/resizable.js'].lineData[103] = 0;
  _$jscoverage['/resizable.js'].lineData[117] = 0;
  _$jscoverage['/resizable.js'].lineData[118] = 0;
  _$jscoverage['/resizable.js'].lineData[119] = 0;
  _$jscoverage['/resizable.js'].lineData[122] = 0;
  _$jscoverage['/resizable.js'].lineData[128] = 0;
  _$jscoverage['/resizable.js'].lineData[129] = 0;
  _$jscoverage['/resizable.js'].lineData[130] = 0;
  _$jscoverage['/resizable.js'].lineData[131] = 0;
  _$jscoverage['/resizable.js'].lineData[132] = 0;
  _$jscoverage['/resizable.js'].lineData[133] = 0;
  _$jscoverage['/resizable.js'].lineData[134] = 0;
  _$jscoverage['/resizable.js'].lineData[135] = 0;
  _$jscoverage['/resizable.js'].lineData[140] = 0;
  _$jscoverage['/resizable.js'].lineData[141] = 0;
  _$jscoverage['/resizable.js'].lineData[155] = 0;
  _$jscoverage['/resizable.js'].lineData[157] = 0;
  _$jscoverage['/resizable.js'].lineData[158] = 0;
  _$jscoverage['/resizable.js'].lineData[164] = 0;
  _$jscoverage['/resizable.js'].lineData[165] = 0;
  _$jscoverage['/resizable.js'].lineData[173] = 0;
  _$jscoverage['/resizable.js'].lineData[177] = 0;
  _$jscoverage['/resizable.js'].lineData[178] = 0;
  _$jscoverage['/resizable.js'].lineData[179] = 0;
  _$jscoverage['/resizable.js'].lineData[184] = 0;
  _$jscoverage['/resizable.js'].lineData[187] = 0;
  _$jscoverage['/resizable.js'].lineData[188] = 0;
  _$jscoverage['/resizable.js'].lineData[189] = 0;
  _$jscoverage['/resizable.js'].lineData[190] = 0;
  _$jscoverage['/resizable.js'].lineData[207] = 0;
  _$jscoverage['/resizable.js'].lineData[335] = 0;
  _$jscoverage['/resizable.js'].lineData[370] = 0;
}
if (! _$jscoverage['/resizable.js'].functionData) {
  _$jscoverage['/resizable.js'].functionData = [];
  _$jscoverage['/resizable.js'].functionData[0] = 0;
  _$jscoverage['/resizable.js'].functionData[1] = 0;
  _$jscoverage['/resizable.js'].functionData[2] = 0;
  _$jscoverage['/resizable.js'].functionData[3] = 0;
  _$jscoverage['/resizable.js'].functionData[4] = 0;
  _$jscoverage['/resizable.js'].functionData[5] = 0;
  _$jscoverage['/resizable.js'].functionData[6] = 0;
  _$jscoverage['/resizable.js'].functionData[7] = 0;
  _$jscoverage['/resizable.js'].functionData[8] = 0;
  _$jscoverage['/resizable.js'].functionData[9] = 0;
  _$jscoverage['/resizable.js'].functionData[10] = 0;
  _$jscoverage['/resizable.js'].functionData[11] = 0;
  _$jscoverage['/resizable.js'].functionData[12] = 0;
  _$jscoverage['/resizable.js'].functionData[13] = 0;
  _$jscoverage['/resizable.js'].functionData[14] = 0;
  _$jscoverage['/resizable.js'].functionData[15] = 0;
  _$jscoverage['/resizable.js'].functionData[16] = 0;
  _$jscoverage['/resizable.js'].functionData[17] = 0;
  _$jscoverage['/resizable.js'].functionData[18] = 0;
  _$jscoverage['/resizable.js'].functionData[19] = 0;
  _$jscoverage['/resizable.js'].functionData[20] = 0;
}
if (! _$jscoverage['/resizable.js'].branchData) {
  _$jscoverage['/resizable.js'].branchData = {};
  _$jscoverage['/resizable.js'].branchData['24'] = [];
  _$jscoverage['/resizable.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['32'] = [];
  _$jscoverage['/resizable.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['40'] = [];
  _$jscoverage['/resizable.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['49'] = [];
  _$jscoverage['/resizable.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['56'] = [];
  _$jscoverage['/resizable.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['57'] = [];
  _$jscoverage['/resizable.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['69'] = [];
  _$jscoverage['/resizable.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['70'] = [];
  _$jscoverage['/resizable.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['87'] = [];
  _$jscoverage['/resizable.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['117'] = [];
  _$jscoverage['/resizable.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/resizable.js'].branchData['118'] = [];
  _$jscoverage['/resizable.js'].branchData['118'][1] = new BranchData();
}
_$jscoverage['/resizable.js'].branchData['118'][1].init(29, 6, 'pos[i]');
function visit11_118_1(result) {
  _$jscoverage['/resizable.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['117'][1].init(754, 22, 'i < ATTRS_ORDER.length');
function visit10_117_1(result) {
  _$jscoverage['/resizable.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['87'][1].init(299, 19, 'i < handlers.length');
function visit9_87_1(result) {
  _$jscoverage['/resizable.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['70'][1].init(20, 14, 'a1[i] || a2[i]');
function visit8_70_1(result) {
  _$jscoverage['/resizable.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['69'][1].init(41, 13, 'i < a1.length');
function visit7_69_1(result) {
  _$jscoverage['/resizable.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['57'][1].init(21, 19, 'j < vertical.length');
function visit6_57_1(result) {
  _$jscoverage['/resizable.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['56'][1].init(1786, 21, 'i < horizontal.length');
function visit5_56_1(result) {
  _$jscoverage['/resizable.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['49'][1].init(148, 13, 'preserveRatio');
function visit4_49_1(result) {
  _$jscoverage['/resizable.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['40'][1].init(111, 13, 'preserveRatio');
function visit3_40_1(result) {
  _$jscoverage['/resizable.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['32'][1].init(111, 13, 'preserveRatio');
function visit2_32_1(result) {
  _$jscoverage['/resizable.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].branchData['24'][1].init(148, 13, 'preserveRatio');
function visit1_24_1(result) {
  _$jscoverage['/resizable.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/resizable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/resizable.js'].functionData[0]++;
  _$jscoverage['/resizable.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/resizable.js'].lineData[8]++;
  var Base = require('base');
  _$jscoverage['/resizable.js'].lineData[9]++;
  var DD = require('dd');
  _$jscoverage['/resizable.js'].lineData[11]++;
  var $ = Node.all, i, j, Draggable = DD.Draggable, CLS_PREFIX = 'resizable-handler', horizontal = ['l', 'r'], vertical = ['t', 'b'], ATTRS_ORDER = ['width', 'height', 'top', 'left'], hcNormal = {
  't': function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
  _$jscoverage['/resizable.js'].functionData[1]++;
  _$jscoverage['/resizable.js'].lineData[21]++;
  var h = getBoundValue(minH, maxH, oh - diffT), t = ot + oh - h, w = 0;
  _$jscoverage['/resizable.js'].lineData[24]++;
  if (visit1_24_1(preserveRatio)) {
    _$jscoverage['/resizable.js'].lineData[25]++;
    w = h / oh * ow;
  }
  _$jscoverage['/resizable.js'].lineData[27]++;
  return [w, h, t, 0];
}, 
  'b': function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
  _$jscoverage['/resizable.js'].functionData[2]++;
  _$jscoverage['/resizable.js'].lineData[30]++;
  var h = getBoundValue(minH, maxH, oh + diffT), w = 0;
  _$jscoverage['/resizable.js'].lineData[32]++;
  if (visit2_32_1(preserveRatio)) {
    _$jscoverage['/resizable.js'].lineData[33]++;
    w = h / oh * ow;
  }
  _$jscoverage['/resizable.js'].lineData[35]++;
  return [w, h, 0, 0];
}, 
  'r': function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
  _$jscoverage['/resizable.js'].functionData[3]++;
  _$jscoverage['/resizable.js'].lineData[38]++;
  var w = getBoundValue(minW, maxW, ow + diffL), h = 0;
  _$jscoverage['/resizable.js'].lineData[40]++;
  if (visit3_40_1(preserveRatio)) {
    _$jscoverage['/resizable.js'].lineData[41]++;
    h = w / ow * oh;
  }
  _$jscoverage['/resizable.js'].lineData[43]++;
  return [w, h, 0, 0];
}, 
  'l': function(minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio) {
  _$jscoverage['/resizable.js'].functionData[4]++;
  _$jscoverage['/resizable.js'].lineData[46]++;
  var w = getBoundValue(minW, maxW, ow - diffL), h = 0, l = ol + ow - w;
  _$jscoverage['/resizable.js'].lineData[49]++;
  if (visit4_49_1(preserveRatio)) {
    _$jscoverage['/resizable.js'].lineData[50]++;
    h = w / ow * oh;
  }
  _$jscoverage['/resizable.js'].lineData[52]++;
  return [w, h, 0, l];
}};
  _$jscoverage['/resizable.js'].lineData[56]++;
  for (i = 0; visit5_56_1(i < horizontal.length); i++) {
    _$jscoverage['/resizable.js'].lineData[57]++;
    for (j = 0; visit6_57_1(j < vertical.length); j++) {
      _$jscoverage['/resizable.js'].lineData[59]++;
      (function(h, v) {
  _$jscoverage['/resizable.js'].functionData[5]++;
  _$jscoverage['/resizable.js'].lineData[60]++;
  hcNormal[h + v] = hcNormal[v + h] = function() {
  _$jscoverage['/resizable.js'].functionData[6]++;
  _$jscoverage['/resizable.js'].lineData[61]++;
  return merge(hcNormal[h].apply(this, arguments), hcNormal[v].apply(this, arguments));
};
})(horizontal[i], vertical[j]);
    }
  }
  _$jscoverage['/resizable.js'].lineData[67]++;
  function merge(a1, a2) {
    _$jscoverage['/resizable.js'].functionData[7]++;
    _$jscoverage['/resizable.js'].lineData[68]++;
    var a = [];
    _$jscoverage['/resizable.js'].lineData[69]++;
    for (i = 0; visit7_69_1(i < a1.length); i++) {
      _$jscoverage['/resizable.js'].lineData[70]++;
      a[i] = visit8_70_1(a1[i] || a2[i]);
    }
    _$jscoverage['/resizable.js'].lineData[72]++;
    return a;
  }
  _$jscoverage['/resizable.js'].lineData[75]++;
  function getBoundValue(min, max, v) {
    _$jscoverage['/resizable.js'].functionData[8]++;
    _$jscoverage['/resizable.js'].lineData[76]++;
    return Math.min(Math.max(min, v), max);
  }
  _$jscoverage['/resizable.js'].lineData[79]++;
  function createDD(self) {
    _$jscoverage['/resizable.js'].functionData[9]++;
    _$jscoverage['/resizable.js'].lineData[80]++;
    var dds = self.dds, node = self.get('node'), handlers = self.get('handlers'), preserveRatio, dragConfig = self.get('dragConfig'), prefixCls = self.get('prefixCls'), prefix = prefixCls + CLS_PREFIX;
    _$jscoverage['/resizable.js'].lineData[87]++;
    for (i = 0; visit9_87_1(i < handlers.length); i++) {
      _$jscoverage['/resizable.js'].lineData[88]++;
      var hc = handlers[i], el = $('<div class="' + prefix + ' ' + prefix + '-' + hc + '"></div>').prependTo(node, undefined), dd = dds[hc] = new Draggable(S.mix({
  node: el, 
  cursor: null, 
  groups: false}, dragConfig));
      _$jscoverage['/resizable.js'].lineData[100]++;
      (function(hc, dd) {
  _$jscoverage['/resizable.js'].functionData[10]++;
  _$jscoverage['/resizable.js'].lineData[101]++;
  var startEdgePos;
  _$jscoverage['/resizable.js'].lineData[102]++;
  dd.on('drag', function(ev) {
  _$jscoverage['/resizable.js'].functionData[11]++;
  _$jscoverage['/resizable.js'].lineData[103]++;
  var dd = ev.target, ow = self._width, oh = self._height, minW = self.get('minWidth'), maxW = self.get('maxWidth'), minH = self.get('minHeight'), maxH = self.get('maxHeight'), diffT = ev.pageY - startEdgePos.top, diffL = ev.pageX - startEdgePos.left, ot = self._top, ol = self._left, region = {}, pos = hcNormal[hc](minW, maxW, minH, maxH, ot, ol, ow, oh, diffT, diffL, preserveRatio);
  _$jscoverage['/resizable.js'].lineData[117]++;
  for (i = 0; visit10_117_1(i < ATTRS_ORDER.length); i++) {
    _$jscoverage['/resizable.js'].lineData[118]++;
    if (visit11_118_1(pos[i])) {
      _$jscoverage['/resizable.js'].lineData[119]++;
      region[ATTRS_ORDER[i]] = pos[i];
    }
  }
  _$jscoverage['/resizable.js'].lineData[122]++;
  self.fire('beforeResize', {
  handler: hc, 
  dd: dd, 
  region: region});
});
  _$jscoverage['/resizable.js'].lineData[128]++;
  dd.on('dragstart', function() {
  _$jscoverage['/resizable.js'].functionData[12]++;
  _$jscoverage['/resizable.js'].lineData[129]++;
  startEdgePos = dd.get('startMousePos');
  _$jscoverage['/resizable.js'].lineData[130]++;
  preserveRatio = self.get('preserveRatio');
  _$jscoverage['/resizable.js'].lineData[131]++;
  self._width = node.width();
  _$jscoverage['/resizable.js'].lineData[132]++;
  self._top = parseInt(node.css('top'));
  _$jscoverage['/resizable.js'].lineData[133]++;
  self._left = parseInt(node.css('left'));
  _$jscoverage['/resizable.js'].lineData[134]++;
  self._height = node.height();
  _$jscoverage['/resizable.js'].lineData[135]++;
  self.fire('resizeStart', {
  handler: hc, 
  dd: dd});
});
  _$jscoverage['/resizable.js'].lineData[140]++;
  dd.on('dragend', function() {
  _$jscoverage['/resizable.js'].functionData[13]++;
  _$jscoverage['/resizable.js'].lineData[141]++;
  self.fire('resizeEnd', {
  handler: hc, 
  dd: dd});
});
})(hc, dd);
    }
  }
  _$jscoverage['/resizable.js'].lineData[155]++;
  var Resizable = Base.extend({
  initializer: function() {
  _$jscoverage['/resizable.js'].functionData[14]++;
  _$jscoverage['/resizable.js'].lineData[157]++;
  this.dds = {};
  _$jscoverage['/resizable.js'].lineData[158]++;
  this.publish('beforeResize', {
  defaultFn: this._onBeforeResize});
}, 
  _onBeforeResize: function(e) {
  _$jscoverage['/resizable.js'].functionData[15]++;
  _$jscoverage['/resizable.js'].lineData[164]++;
  this.get('node').css(e.region);
  _$jscoverage['/resizable.js'].lineData[165]++;
  this.fire('resize', {
  handler: e.hc, 
  dd: e.dd, 
  region: e.region});
}, 
  _onSetNode: function() {
  _$jscoverage['/resizable.js'].functionData[16]++;
  _$jscoverage['/resizable.js'].lineData[173]++;
  createDD(this);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/resizable.js'].functionData[17]++;
  _$jscoverage['/resizable.js'].lineData[177]++;
  var dds = this.dds;
  _$jscoverage['/resizable.js'].lineData[178]++;
  S.each(dds, function(d) {
  _$jscoverage['/resizable.js'].functionData[18]++;
  _$jscoverage['/resizable.js'].lineData[179]++;
  d.set('disabled', v);
});
}, 
  destructor: function() {
  _$jscoverage['/resizable.js'].functionData[19]++;
  _$jscoverage['/resizable.js'].lineData[184]++;
  var self = this, d, dds = self.dds;
  _$jscoverage['/resizable.js'].lineData[187]++;
  for (d in dds) {
    _$jscoverage['/resizable.js'].lineData[188]++;
    dds[d].destroy();
    _$jscoverage['/resizable.js'].lineData[189]++;
    dds[d].get('node').remove();
    _$jscoverage['/resizable.js'].lineData[190]++;
    delete dds[d];
  }
}}, {
  name: 'Resizable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/resizable.js'].functionData[20]++;
  _$jscoverage['/resizable.js'].lineData[207]++;
  return $(v);
}}, 
  dragConfig: {}, 
  prefixCls: {
  value: 'ks-'}, 
  disabled: {}, 
  minWidth: {
  value: 0}, 
  minHeight: {
  value: 0}, 
  maxWidth: {
  value: Number.MAX_VALUE}, 
  maxHeight: {
  value: Number.MAX_VALUE}, 
  preserveRatio: {
  value: false}, 
  handlers: {
  value: []}}});
  _$jscoverage['/resizable.js'].lineData[335]++;
  Resizable.Handler = {
  B: 'b', 
  T: 't', 
  L: 'l', 
  R: 'r', 
  BL: 'bl', 
  TL: 'tl', 
  BR: 'br', 
  TR: 'tr'};
  _$jscoverage['/resizable.js'].lineData[370]++;
  return Resizable;
});
