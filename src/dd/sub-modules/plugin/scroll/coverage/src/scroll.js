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
if (! _$jscoverage['/scroll.js']) {
  _$jscoverage['/scroll.js'] = {};
  _$jscoverage['/scroll.js'].lineData = [];
  _$jscoverage['/scroll.js'].lineData[6] = 0;
  _$jscoverage['/scroll.js'].lineData[7] = 0;
  _$jscoverage['/scroll.js'].lineData[8] = 0;
  _$jscoverage['/scroll.js'].lineData[11] = 0;
  _$jscoverage['/scroll.js'].lineData[24] = 0;
  _$jscoverage['/scroll.js'].lineData[33] = 0;
  _$jscoverage['/scroll.js'].lineData[34] = 0;
  _$jscoverage['/scroll.js'].lineData[39] = 0;
  _$jscoverage['/scroll.js'].lineData[51] = 0;
  _$jscoverage['/scroll.js'].lineData[52] = 0;
  _$jscoverage['/scroll.js'].lineData[57] = 0;
  _$jscoverage['/scroll.js'].lineData[66] = 0;
  _$jscoverage['/scroll.js'].lineData[77] = 0;
  _$jscoverage['/scroll.js'].lineData[78] = 0;
  _$jscoverage['/scroll.js'].lineData[87] = 0;
  _$jscoverage['/scroll.js'].lineData[96] = 0;
  _$jscoverage['/scroll.js'].lineData[99] = 0;
  _$jscoverage['/scroll.js'].lineData[109] = 0;
  _$jscoverage['/scroll.js'].lineData[110] = 0;
  _$jscoverage['/scroll.js'].lineData[111] = 0;
  _$jscoverage['/scroll.js'].lineData[114] = 0;
  _$jscoverage['/scroll.js'].lineData[117] = 0;
  _$jscoverage['/scroll.js'].lineData[118] = 0;
  _$jscoverage['/scroll.js'].lineData[119] = 0;
  _$jscoverage['/scroll.js'].lineData[120] = 0;
  _$jscoverage['/scroll.js'].lineData[122] = 0;
  _$jscoverage['/scroll.js'].lineData[125] = 0;
  _$jscoverage['/scroll.js'].lineData[128] = 0;
  _$jscoverage['/scroll.js'].lineData[129] = 0;
  _$jscoverage['/scroll.js'].lineData[132] = 0;
  _$jscoverage['/scroll.js'].lineData[133] = 0;
  _$jscoverage['/scroll.js'].lineData[137] = 0;
  _$jscoverage['/scroll.js'].lineData[138] = 0;
  _$jscoverage['/scroll.js'].lineData[139] = 0;
  _$jscoverage['/scroll.js'].lineData[140] = 0;
  _$jscoverage['/scroll.js'].lineData[141] = 0;
  _$jscoverage['/scroll.js'].lineData[142] = 0;
  _$jscoverage['/scroll.js'].lineData[143] = 0;
  _$jscoverage['/scroll.js'].lineData[147] = 0;
  _$jscoverage['/scroll.js'].lineData[148] = 0;
  _$jscoverage['/scroll.js'].lineData[149] = 0;
  _$jscoverage['/scroll.js'].lineData[152] = 0;
  _$jscoverage['/scroll.js'].lineData[154] = 0;
  _$jscoverage['/scroll.js'].lineData[155] = 0;
  _$jscoverage['/scroll.js'].lineData[158] = 0;
  _$jscoverage['/scroll.js'].lineData[160] = 0;
  _$jscoverage['/scroll.js'].lineData[161] = 0;
  _$jscoverage['/scroll.js'].lineData[162] = 0;
  _$jscoverage['/scroll.js'].lineData[165] = 0;
  _$jscoverage['/scroll.js'].lineData[173] = 0;
  _$jscoverage['/scroll.js'].lineData[174] = 0;
  _$jscoverage['/scroll.js'].lineData[175] = 0;
  _$jscoverage['/scroll.js'].lineData[178] = 0;
  _$jscoverage['/scroll.js'].lineData[180] = 0;
  _$jscoverage['/scroll.js'].lineData[181] = 0;
  _$jscoverage['/scroll.js'].lineData[182] = 0;
  _$jscoverage['/scroll.js'].lineData[185] = 0;
  _$jscoverage['/scroll.js'].lineData[187] = 0;
  _$jscoverage['/scroll.js'].lineData[188] = 0;
  _$jscoverage['/scroll.js'].lineData[189] = 0;
  _$jscoverage['/scroll.js'].lineData[192] = 0;
  _$jscoverage['/scroll.js'].lineData[194] = 0;
  _$jscoverage['/scroll.js'].lineData[195] = 0;
  _$jscoverage['/scroll.js'].lineData[196] = 0;
  _$jscoverage['/scroll.js'].lineData[199] = 0;
  _$jscoverage['/scroll.js'].lineData[200] = 0;
  _$jscoverage['/scroll.js'].lineData[201] = 0;
  _$jscoverage['/scroll.js'].lineData[206] = 0;
  _$jscoverage['/scroll.js'].lineData[207] = 0;
  _$jscoverage['/scroll.js'].lineData[210] = 0;
  _$jscoverage['/scroll.js'].lineData[211] = 0;
  _$jscoverage['/scroll.js'].lineData[212] = 0;
  _$jscoverage['/scroll.js'].lineData[215] = 0;
  _$jscoverage['/scroll.js'].lineData[216] = 0;
  _$jscoverage['/scroll.js'].lineData[218] = 0;
  _$jscoverage['/scroll.js'].lineData[220] = 0;
  _$jscoverage['/scroll.js'].lineData[236] = 0;
  _$jscoverage['/scroll.js'].lineData[239] = 0;
}
if (! _$jscoverage['/scroll.js'].functionData) {
  _$jscoverage['/scroll.js'].functionData = [];
  _$jscoverage['/scroll.js'].functionData[0] = 0;
  _$jscoverage['/scroll.js'].functionData[1] = 0;
  _$jscoverage['/scroll.js'].functionData[2] = 0;
  _$jscoverage['/scroll.js'].functionData[3] = 0;
  _$jscoverage['/scroll.js'].functionData[4] = 0;
  _$jscoverage['/scroll.js'].functionData[5] = 0;
  _$jscoverage['/scroll.js'].functionData[6] = 0;
  _$jscoverage['/scroll.js'].functionData[7] = 0;
  _$jscoverage['/scroll.js'].functionData[8] = 0;
  _$jscoverage['/scroll.js'].functionData[9] = 0;
  _$jscoverage['/scroll.js'].functionData[10] = 0;
  _$jscoverage['/scroll.js'].functionData[11] = 0;
  _$jscoverage['/scroll.js'].functionData[12] = 0;
  _$jscoverage['/scroll.js'].functionData[13] = 0;
}
if (! _$jscoverage['/scroll.js'].branchData) {
  _$jscoverage['/scroll.js'].branchData = {};
  _$jscoverage['/scroll.js'].branchData['33'] = [];
  _$jscoverage['/scroll.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['51'] = [];
  _$jscoverage['/scroll.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['110'] = [];
  _$jscoverage['/scroll.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['117'] = [];
  _$jscoverage['/scroll.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['128'] = [];
  _$jscoverage['/scroll.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['132'] = [];
  _$jscoverage['/scroll.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['142'] = [];
  _$jscoverage['/scroll.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['161'] = [];
  _$jscoverage['/scroll.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['173'] = [];
  _$jscoverage['/scroll.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['180'] = [];
  _$jscoverage['/scroll.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['187'] = [];
  _$jscoverage['/scroll.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['194'] = [];
  _$jscoverage['/scroll.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['199'] = [];
  _$jscoverage['/scroll.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['207'] = [];
  _$jscoverage['/scroll.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['215'] = [];
  _$jscoverage['/scroll.js'].branchData['215'][1] = new BranchData();
}
_$jscoverage['/scroll.js'].branchData['215'][1].init(819, 16, 'drag.get(\'move\')');
function visit15_215_1(result) {
  _$jscoverage['/scroll.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['207'][1].init(380, 14, 'isWin(node[0])');
function visit14_207_1(result) {
  _$jscoverage['/scroll.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['199'][1].init(1118, 6, 'adjust');
function visit13_199_1(result) {
  _$jscoverage['/scroll.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['194'][1].init(974, 17, 'diffX2 <= diff[0]');
function visit12_194_1(result) {
  _$jscoverage['/scroll.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['187'][1].init(788, 17, 'diffX >= -diff[0]');
function visit11_187_1(result) {
  _$jscoverage['/scroll.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['180'][1].init(599, 17, 'diffY2 <= diff[1]');
function visit10_180_1(result) {
  _$jscoverage['/scroll.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['173'][1].init(415, 17, 'diffY >= -diff[1]');
function visit9_173_1(result) {
  _$jscoverage['/scroll.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['161'][1].init(22, 16, 'checkContainer()');
function visit8_161_1(result) {
  _$jscoverage['/scroll.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['142'][1].init(532, 6, '!timer');
function visit7_142_1(result) {
  _$jscoverage['/scroll.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['132'][1].init(190, 16, 'checkContainer()');
function visit6_132_1(result) {
  _$jscoverage['/scroll.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['128'][1].init(108, 7, 'ev.fake');
function visit5_128_1(result) {
  _$jscoverage['/scroll.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['117'][1].init(254, 26, '!DDM.inRegion(r, mousePos)');
function visit4_117_1(result) {
  _$jscoverage['/scroll.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['110'][1].init(22, 14, 'isWin(node[0])');
function visit3_110_1(result) {
  _$jscoverage['/scroll.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['51'][1].init(18, 14, 'isWin(node[0])');
function visit2_51_1(result) {
  _$jscoverage['/scroll.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['33'][1].init(18, 14, 'isWin(node[0])');
function visit1_33_1(result) {
  _$jscoverage['/scroll.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scroll.js'].functionData[0]++;
  _$jscoverage['/scroll.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/scroll.js'].lineData[8]++;
  var Node = require('node'), DD = require('dd'), Base = require('base');
  _$jscoverage['/scroll.js'].lineData[11]++;
  var DDM = DD.DDM, win = S.Env.host, SCROLL_EVENT = '.-ks-dd-scroll' + util.now(), RATE = [10, 10], ADJUST_DELAY = 100, DIFF = [20, 20], isWin = util.isWindow;
  _$jscoverage['/scroll.js'].lineData[24]++;
  return Base.extend({
  pluginId: 'dd/plugin/scroll', 
  getRegion: function(node) {
  _$jscoverage['/scroll.js'].functionData[1]++;
  _$jscoverage['/scroll.js'].lineData[33]++;
  if (visit1_33_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[34]++;
    return {
  width: node.width(), 
  height: node.height()};
  } else {
    _$jscoverage['/scroll.js'].lineData[39]++;
    return {
  width: node.outerWidth(), 
  height: node.outerHeight()};
  }
}, 
  getOffset: function(node) {
  _$jscoverage['/scroll.js'].functionData[2]++;
  _$jscoverage['/scroll.js'].lineData[51]++;
  if (visit2_51_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[52]++;
    return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
  } else {
    _$jscoverage['/scroll.js'].lineData[57]++;
    return node.offset();
  }
}, 
  getScroll: function(node) {
  _$jscoverage['/scroll.js'].functionData[3]++;
  _$jscoverage['/scroll.js'].lineData[66]++;
  return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
}, 
  setScroll: function(node, r) {
  _$jscoverage['/scroll.js'].functionData[4]++;
  _$jscoverage['/scroll.js'].lineData[77]++;
  node.scrollLeft(r.left);
  _$jscoverage['/scroll.js'].lineData[78]++;
  node.scrollTop(r.top);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/scroll.js'].functionData[5]++;
  _$jscoverage['/scroll.js'].lineData[87]++;
  drag.detach(SCROLL_EVENT);
}, 
  pluginInitializer: function(drag) {
  _$jscoverage['/scroll.js'].functionData[6]++;
  _$jscoverage['/scroll.js'].lineData[96]++;
  var self = this, node = self.get('node');
  _$jscoverage['/scroll.js'].lineData[99]++;
  var rate = self.get('rate'), diff = self.get('diff'), event, dxy, timer = null;
  _$jscoverage['/scroll.js'].lineData[109]++;
  function checkContainer() {
    _$jscoverage['/scroll.js'].functionData[7]++;
    _$jscoverage['/scroll.js'].lineData[110]++;
    if (visit3_110_1(isWin(node[0]))) {
      _$jscoverage['/scroll.js'].lineData[111]++;
      return 0;
    }
    _$jscoverage['/scroll.js'].lineData[114]++;
    var mousePos = drag.mousePos, r = DDM.region(node);
    _$jscoverage['/scroll.js'].lineData[117]++;
    if (visit4_117_1(!DDM.inRegion(r, mousePos))) {
      _$jscoverage['/scroll.js'].lineData[118]++;
      clearTimeout(timer);
      _$jscoverage['/scroll.js'].lineData[119]++;
      timer = 0;
      _$jscoverage['/scroll.js'].lineData[120]++;
      return 1;
    }
    _$jscoverage['/scroll.js'].lineData[122]++;
    return 0;
  }
  _$jscoverage['/scroll.js'].lineData[125]++;
  function dragging(ev) {
    _$jscoverage['/scroll.js'].functionData[8]++;
    _$jscoverage['/scroll.js'].lineData[128]++;
    if (visit5_128_1(ev.fake)) {
      _$jscoverage['/scroll.js'].lineData[129]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[132]++;
    if (visit6_132_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[133]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[137]++;
    event = ev;
    _$jscoverage['/scroll.js'].lineData[138]++;
    dxy = util.clone(drag.mousePos);
    _$jscoverage['/scroll.js'].lineData[139]++;
    var offset = self.getOffset(node);
    _$jscoverage['/scroll.js'].lineData[140]++;
    dxy.left -= offset.left;
    _$jscoverage['/scroll.js'].lineData[141]++;
    dxy.top -= offset.top;
    _$jscoverage['/scroll.js'].lineData[142]++;
    if (visit7_142_1(!timer)) {
      _$jscoverage['/scroll.js'].lineData[143]++;
      checkAndScroll();
    }
  }
  _$jscoverage['/scroll.js'].lineData[147]++;
  function dragEnd() {
    _$jscoverage['/scroll.js'].functionData[9]++;
    _$jscoverage['/scroll.js'].lineData[148]++;
    clearTimeout(timer);
    _$jscoverage['/scroll.js'].lineData[149]++;
    timer = null;
  }
  _$jscoverage['/scroll.js'].lineData[152]++;
  drag.on('drag' + SCROLL_EVENT, dragging);
  _$jscoverage['/scroll.js'].lineData[154]++;
  drag.on('dragstart' + SCROLL_EVENT, function() {
  _$jscoverage['/scroll.js'].functionData[10]++;
  _$jscoverage['/scroll.js'].lineData[155]++;
  DDM.cacheWH(node);
});
  _$jscoverage['/scroll.js'].lineData[158]++;
  drag.on('dragend' + SCROLL_EVENT, dragEnd);
  _$jscoverage['/scroll.js'].lineData[160]++;
  function checkAndScroll() {
    _$jscoverage['/scroll.js'].functionData[11]++;
    _$jscoverage['/scroll.js'].lineData[161]++;
    if (visit8_161_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[162]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[165]++;
    var r = self.getRegion(node), nw = r.width, nh = r.height, scroll = self.getScroll(node), origin = util.clone(scroll), diffY = dxy.top - nh, adjust = false;
    _$jscoverage['/scroll.js'].lineData[173]++;
    if (visit9_173_1(diffY >= -diff[1])) {
      _$jscoverage['/scroll.js'].lineData[174]++;
      scroll.top += rate[1];
      _$jscoverage['/scroll.js'].lineData[175]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[178]++;
    var diffY2 = dxy.top;
    _$jscoverage['/scroll.js'].lineData[180]++;
    if (visit10_180_1(diffY2 <= diff[1])) {
      _$jscoverage['/scroll.js'].lineData[181]++;
      scroll.top -= rate[1];
      _$jscoverage['/scroll.js'].lineData[182]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[185]++;
    var diffX = dxy.left - nw;
    _$jscoverage['/scroll.js'].lineData[187]++;
    if (visit11_187_1(diffX >= -diff[0])) {
      _$jscoverage['/scroll.js'].lineData[188]++;
      scroll.left += rate[0];
      _$jscoverage['/scroll.js'].lineData[189]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[192]++;
    var diffX2 = dxy.left;
    _$jscoverage['/scroll.js'].lineData[194]++;
    if (visit12_194_1(diffX2 <= diff[0])) {
      _$jscoverage['/scroll.js'].lineData[195]++;
      scroll.left -= rate[0];
      _$jscoverage['/scroll.js'].lineData[196]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[199]++;
    if (visit13_199_1(adjust)) {
      _$jscoverage['/scroll.js'].lineData[200]++;
      self.setScroll(node, scroll);
      _$jscoverage['/scroll.js'].lineData[201]++;
      timer = setTimeout(checkAndScroll, ADJUST_DELAY);
      _$jscoverage['/scroll.js'].lineData[206]++;
      event.fake = true;
      _$jscoverage['/scroll.js'].lineData[207]++;
      if (visit14_207_1(isWin(node[0]))) {
        _$jscoverage['/scroll.js'].lineData[210]++;
        scroll = self.getScroll(node);
        _$jscoverage['/scroll.js'].lineData[211]++;
        event.left += scroll.left - origin.left;
        _$jscoverage['/scroll.js'].lineData[212]++;
        event.top += scroll.top - origin.top;
      }
      _$jscoverage['/scroll.js'].lineData[215]++;
      if (visit15_215_1(drag.get('move'))) {
        _$jscoverage['/scroll.js'].lineData[216]++;
        drag.get('node').offset(event);
      }
      _$jscoverage['/scroll.js'].lineData[218]++;
      drag.fire('drag', event);
    } else {
      _$jscoverage['/scroll.js'].lineData[220]++;
      timer = null;
    }
  }
}}, {
  ATTRS: {
  node: {
  valueFn: function() {
  _$jscoverage['/scroll.js'].functionData[12]++;
  _$jscoverage['/scroll.js'].lineData[236]++;
  return Node.one(win);
}, 
  setter: function(v) {
  _$jscoverage['/scroll.js'].functionData[13]++;
  _$jscoverage['/scroll.js'].lineData[239]++;
  return Node.one(v);
}}, 
  rate: {
  value: RATE}, 
  diff: {
  value: DIFF}}});
});
