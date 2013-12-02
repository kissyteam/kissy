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
  _$jscoverage['/scroll.js'].lineData[10] = 0;
  _$jscoverage['/scroll.js'].lineData[23] = 0;
  _$jscoverage['/scroll.js'].lineData[32] = 0;
  _$jscoverage['/scroll.js'].lineData[33] = 0;
  _$jscoverage['/scroll.js'].lineData[38] = 0;
  _$jscoverage['/scroll.js'].lineData[50] = 0;
  _$jscoverage['/scroll.js'].lineData[51] = 0;
  _$jscoverage['/scroll.js'].lineData[56] = 0;
  _$jscoverage['/scroll.js'].lineData[65] = 0;
  _$jscoverage['/scroll.js'].lineData[76] = 0;
  _$jscoverage['/scroll.js'].lineData[77] = 0;
  _$jscoverage['/scroll.js'].lineData[86] = 0;
  _$jscoverage['/scroll.js'].lineData[95] = 0;
  _$jscoverage['/scroll.js'].lineData[98] = 0;
  _$jscoverage['/scroll.js'].lineData[108] = 0;
  _$jscoverage['/scroll.js'].lineData[109] = 0;
  _$jscoverage['/scroll.js'].lineData[110] = 0;
  _$jscoverage['/scroll.js'].lineData[113] = 0;
  _$jscoverage['/scroll.js'].lineData[116] = 0;
  _$jscoverage['/scroll.js'].lineData[117] = 0;
  _$jscoverage['/scroll.js'].lineData[118] = 0;
  _$jscoverage['/scroll.js'].lineData[119] = 0;
  _$jscoverage['/scroll.js'].lineData[121] = 0;
  _$jscoverage['/scroll.js'].lineData[124] = 0;
  _$jscoverage['/scroll.js'].lineData[127] = 0;
  _$jscoverage['/scroll.js'].lineData[128] = 0;
  _$jscoverage['/scroll.js'].lineData[131] = 0;
  _$jscoverage['/scroll.js'].lineData[132] = 0;
  _$jscoverage['/scroll.js'].lineData[136] = 0;
  _$jscoverage['/scroll.js'].lineData[137] = 0;
  _$jscoverage['/scroll.js'].lineData[138] = 0;
  _$jscoverage['/scroll.js'].lineData[139] = 0;
  _$jscoverage['/scroll.js'].lineData[140] = 0;
  _$jscoverage['/scroll.js'].lineData[141] = 0;
  _$jscoverage['/scroll.js'].lineData[142] = 0;
  _$jscoverage['/scroll.js'].lineData[146] = 0;
  _$jscoverage['/scroll.js'].lineData[147] = 0;
  _$jscoverage['/scroll.js'].lineData[148] = 0;
  _$jscoverage['/scroll.js'].lineData[151] = 0;
  _$jscoverage['/scroll.js'].lineData[153] = 0;
  _$jscoverage['/scroll.js'].lineData[154] = 0;
  _$jscoverage['/scroll.js'].lineData[157] = 0;
  _$jscoverage['/scroll.js'].lineData[159] = 0;
  _$jscoverage['/scroll.js'].lineData[160] = 0;
  _$jscoverage['/scroll.js'].lineData[161] = 0;
  _$jscoverage['/scroll.js'].lineData[164] = 0;
  _$jscoverage['/scroll.js'].lineData[172] = 0;
  _$jscoverage['/scroll.js'].lineData[173] = 0;
  _$jscoverage['/scroll.js'].lineData[174] = 0;
  _$jscoverage['/scroll.js'].lineData[177] = 0;
  _$jscoverage['/scroll.js'].lineData[179] = 0;
  _$jscoverage['/scroll.js'].lineData[180] = 0;
  _$jscoverage['/scroll.js'].lineData[181] = 0;
  _$jscoverage['/scroll.js'].lineData[184] = 0;
  _$jscoverage['/scroll.js'].lineData[186] = 0;
  _$jscoverage['/scroll.js'].lineData[187] = 0;
  _$jscoverage['/scroll.js'].lineData[188] = 0;
  _$jscoverage['/scroll.js'].lineData[191] = 0;
  _$jscoverage['/scroll.js'].lineData[193] = 0;
  _$jscoverage['/scroll.js'].lineData[194] = 0;
  _$jscoverage['/scroll.js'].lineData[195] = 0;
  _$jscoverage['/scroll.js'].lineData[198] = 0;
  _$jscoverage['/scroll.js'].lineData[199] = 0;
  _$jscoverage['/scroll.js'].lineData[200] = 0;
  _$jscoverage['/scroll.js'].lineData[205] = 0;
  _$jscoverage['/scroll.js'].lineData[206] = 0;
  _$jscoverage['/scroll.js'].lineData[209] = 0;
  _$jscoverage['/scroll.js'].lineData[210] = 0;
  _$jscoverage['/scroll.js'].lineData[211] = 0;
  _$jscoverage['/scroll.js'].lineData[214] = 0;
  _$jscoverage['/scroll.js'].lineData[215] = 0;
  _$jscoverage['/scroll.js'].lineData[217] = 0;
  _$jscoverage['/scroll.js'].lineData[219] = 0;
  _$jscoverage['/scroll.js'].lineData[235] = 0;
  _$jscoverage['/scroll.js'].lineData[238] = 0;
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
  _$jscoverage['/scroll.js'].branchData['32'] = [];
  _$jscoverage['/scroll.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['50'] = [];
  _$jscoverage['/scroll.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['109'] = [];
  _$jscoverage['/scroll.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['116'] = [];
  _$jscoverage['/scroll.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['127'] = [];
  _$jscoverage['/scroll.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['131'] = [];
  _$jscoverage['/scroll.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['141'] = [];
  _$jscoverage['/scroll.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['160'] = [];
  _$jscoverage['/scroll.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['172'] = [];
  _$jscoverage['/scroll.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['179'] = [];
  _$jscoverage['/scroll.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['186'] = [];
  _$jscoverage['/scroll.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['193'] = [];
  _$jscoverage['/scroll.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['198'] = [];
  _$jscoverage['/scroll.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['206'] = [];
  _$jscoverage['/scroll.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['214'] = [];
  _$jscoverage['/scroll.js'].branchData['214'][1] = new BranchData();
}
_$jscoverage['/scroll.js'].branchData['214'][1].init(803, 16, 'drag.get(\'move\')');
function visit15_214_1(result) {
  _$jscoverage['/scroll.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['206'][1].init(372, 14, 'isWin(node[0])');
function visit14_206_1(result) {
  _$jscoverage['/scroll.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['198'][1].init(1076, 6, 'adjust');
function visit13_198_1(result) {
  _$jscoverage['/scroll.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['193'][1].init(937, 17, 'diffX2 <= diff[0]');
function visit12_193_1(result) {
  _$jscoverage['/scroll.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['186'][1].init(758, 17, 'diffX >= -diff[0]');
function visit11_186_1(result) {
  _$jscoverage['/scroll.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['179'][1].init(576, 17, 'diffY2 <= diff[1]');
function visit10_179_1(result) {
  _$jscoverage['/scroll.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['172'][1].init(399, 17, 'diffY >= -diff[1]');
function visit9_172_1(result) {
  _$jscoverage['/scroll.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['160'][1].init(21, 16, 'checkContainer()');
function visit8_160_1(result) {
  _$jscoverage['/scroll.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['141'][1].init(512, 6, '!timer');
function visit7_141_1(result) {
  _$jscoverage['/scroll.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['131'][1].init(183, 16, 'checkContainer()');
function visit6_131_1(result) {
  _$jscoverage['/scroll.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['127'][1].init(105, 7, 'ev.fake');
function visit5_127_1(result) {
  _$jscoverage['/scroll.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['116'][1].init(246, 26, '!DDM.inRegion(r, mousePos)');
function visit4_116_1(result) {
  _$jscoverage['/scroll.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['109'][1].init(21, 14, 'isWin(node[0])');
function visit3_109_1(result) {
  _$jscoverage['/scroll.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['50'][1].init(17, 14, 'isWin(node[0])');
function visit2_50_1(result) {
  _$jscoverage['/scroll.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['32'][1].init(17, 14, 'isWin(node[0])');
function visit1_32_1(result) {
  _$jscoverage['/scroll.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scroll.js'].functionData[0]++;
  _$jscoverage['/scroll.js'].lineData[7]++;
  var Node = require('node'), DD = require('dd'), Base = require('base');
  _$jscoverage['/scroll.js'].lineData[10]++;
  var DDM = DD.DDM, win = S.Env.host, SCROLL_EVENT = '.-ks-dd-scroll' + S.now(), RATE = [10, 10], ADJUST_DELAY = 100, DIFF = [20, 20], isWin = S.isWindow;
  _$jscoverage['/scroll.js'].lineData[23]++;
  return Base.extend({
  pluginId: 'dd/plugin/scroll', 
  getRegion: function(node) {
  _$jscoverage['/scroll.js'].functionData[1]++;
  _$jscoverage['/scroll.js'].lineData[32]++;
  if (visit1_32_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[33]++;
    return {
  width: node.width(), 
  height: node.height()};
  } else {
    _$jscoverage['/scroll.js'].lineData[38]++;
    return {
  width: node.outerWidth(), 
  height: node.outerHeight()};
  }
}, 
  getOffset: function(node) {
  _$jscoverage['/scroll.js'].functionData[2]++;
  _$jscoverage['/scroll.js'].lineData[50]++;
  if (visit2_50_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[51]++;
    return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
  } else {
    _$jscoverage['/scroll.js'].lineData[56]++;
    return node.offset();
  }
}, 
  getScroll: function(node) {
  _$jscoverage['/scroll.js'].functionData[3]++;
  _$jscoverage['/scroll.js'].lineData[65]++;
  return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
}, 
  setScroll: function(node, r) {
  _$jscoverage['/scroll.js'].functionData[4]++;
  _$jscoverage['/scroll.js'].lineData[76]++;
  node.scrollLeft(r.left);
  _$jscoverage['/scroll.js'].lineData[77]++;
  node.scrollTop(r.top);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/scroll.js'].functionData[5]++;
  _$jscoverage['/scroll.js'].lineData[86]++;
  drag.detach(SCROLL_EVENT);
}, 
  pluginInitializer: function(drag) {
  _$jscoverage['/scroll.js'].functionData[6]++;
  _$jscoverage['/scroll.js'].lineData[95]++;
  var self = this, node = self.get('node');
  _$jscoverage['/scroll.js'].lineData[98]++;
  var rate = self.get('rate'), diff = self.get('diff'), event, dxy, timer = null;
  _$jscoverage['/scroll.js'].lineData[108]++;
  function checkContainer() {
    _$jscoverage['/scroll.js'].functionData[7]++;
    _$jscoverage['/scroll.js'].lineData[109]++;
    if (visit3_109_1(isWin(node[0]))) {
      _$jscoverage['/scroll.js'].lineData[110]++;
      return 0;
    }
    _$jscoverage['/scroll.js'].lineData[113]++;
    var mousePos = drag.mousePos, r = DDM.region(node);
    _$jscoverage['/scroll.js'].lineData[116]++;
    if (visit4_116_1(!DDM.inRegion(r, mousePos))) {
      _$jscoverage['/scroll.js'].lineData[117]++;
      clearTimeout(timer);
      _$jscoverage['/scroll.js'].lineData[118]++;
      timer = 0;
      _$jscoverage['/scroll.js'].lineData[119]++;
      return 1;
    }
    _$jscoverage['/scroll.js'].lineData[121]++;
    return 0;
  }
  _$jscoverage['/scroll.js'].lineData[124]++;
  function dragging(ev) {
    _$jscoverage['/scroll.js'].functionData[8]++;
    _$jscoverage['/scroll.js'].lineData[127]++;
    if (visit5_127_1(ev.fake)) {
      _$jscoverage['/scroll.js'].lineData[128]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[131]++;
    if (visit6_131_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[132]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[136]++;
    event = ev;
    _$jscoverage['/scroll.js'].lineData[137]++;
    dxy = S.clone(drag.mousePos);
    _$jscoverage['/scroll.js'].lineData[138]++;
    var offset = self.getOffset(node);
    _$jscoverage['/scroll.js'].lineData[139]++;
    dxy.left -= offset.left;
    _$jscoverage['/scroll.js'].lineData[140]++;
    dxy.top -= offset.top;
    _$jscoverage['/scroll.js'].lineData[141]++;
    if (visit7_141_1(!timer)) {
      _$jscoverage['/scroll.js'].lineData[142]++;
      checkAndScroll();
    }
  }
  _$jscoverage['/scroll.js'].lineData[146]++;
  function dragEnd() {
    _$jscoverage['/scroll.js'].functionData[9]++;
    _$jscoverage['/scroll.js'].lineData[147]++;
    clearTimeout(timer);
    _$jscoverage['/scroll.js'].lineData[148]++;
    timer = null;
  }
  _$jscoverage['/scroll.js'].lineData[151]++;
  drag.on('drag' + SCROLL_EVENT, dragging);
  _$jscoverage['/scroll.js'].lineData[153]++;
  drag.on('dragstart' + SCROLL_EVENT, function() {
  _$jscoverage['/scroll.js'].functionData[10]++;
  _$jscoverage['/scroll.js'].lineData[154]++;
  DDM.cacheWH(node);
});
  _$jscoverage['/scroll.js'].lineData[157]++;
  drag.on('dragend' + SCROLL_EVENT, dragEnd);
  _$jscoverage['/scroll.js'].lineData[159]++;
  function checkAndScroll() {
    _$jscoverage['/scroll.js'].functionData[11]++;
    _$jscoverage['/scroll.js'].lineData[160]++;
    if (visit8_160_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[161]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[164]++;
    var r = self.getRegion(node), nw = r.width, nh = r.height, scroll = self.getScroll(node), origin = S.clone(scroll), diffY = dxy.top - nh, adjust = false;
    _$jscoverage['/scroll.js'].lineData[172]++;
    if (visit9_172_1(diffY >= -diff[1])) {
      _$jscoverage['/scroll.js'].lineData[173]++;
      scroll.top += rate[1];
      _$jscoverage['/scroll.js'].lineData[174]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[177]++;
    var diffY2 = dxy.top;
    _$jscoverage['/scroll.js'].lineData[179]++;
    if (visit10_179_1(diffY2 <= diff[1])) {
      _$jscoverage['/scroll.js'].lineData[180]++;
      scroll.top -= rate[1];
      _$jscoverage['/scroll.js'].lineData[181]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[184]++;
    var diffX = dxy.left - nw;
    _$jscoverage['/scroll.js'].lineData[186]++;
    if (visit11_186_1(diffX >= -diff[0])) {
      _$jscoverage['/scroll.js'].lineData[187]++;
      scroll.left += rate[0];
      _$jscoverage['/scroll.js'].lineData[188]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[191]++;
    var diffX2 = dxy.left;
    _$jscoverage['/scroll.js'].lineData[193]++;
    if (visit12_193_1(diffX2 <= diff[0])) {
      _$jscoverage['/scroll.js'].lineData[194]++;
      scroll.left -= rate[0];
      _$jscoverage['/scroll.js'].lineData[195]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[198]++;
    if (visit13_198_1(adjust)) {
      _$jscoverage['/scroll.js'].lineData[199]++;
      self.setScroll(node, scroll);
      _$jscoverage['/scroll.js'].lineData[200]++;
      timer = setTimeout(checkAndScroll, ADJUST_DELAY);
      _$jscoverage['/scroll.js'].lineData[205]++;
      event.fake = true;
      _$jscoverage['/scroll.js'].lineData[206]++;
      if (visit14_206_1(isWin(node[0]))) {
        _$jscoverage['/scroll.js'].lineData[209]++;
        scroll = self.getScroll(node);
        _$jscoverage['/scroll.js'].lineData[210]++;
        event.left += scroll.left - origin.left;
        _$jscoverage['/scroll.js'].lineData[211]++;
        event.top += scroll.top - origin.top;
      }
      _$jscoverage['/scroll.js'].lineData[214]++;
      if (visit15_214_1(drag.get('move'))) {
        _$jscoverage['/scroll.js'].lineData[215]++;
        drag.get('node').offset(event);
      }
      _$jscoverage['/scroll.js'].lineData[217]++;
      drag.fire('drag', event);
    } else {
      _$jscoverage['/scroll.js'].lineData[219]++;
      timer = null;
    }
  }
}}, {
  ATTRS: {
  node: {
  valueFn: function() {
  _$jscoverage['/scroll.js'].functionData[12]++;
  _$jscoverage['/scroll.js'].lineData[235]++;
  return Node.one(win);
}, 
  setter: function(v) {
  _$jscoverage['/scroll.js'].functionData[13]++;
  _$jscoverage['/scroll.js'].lineData[238]++;
  return Node.one(v);
}}, 
  rate: {
  value: RATE}, 
  diff: {
  value: DIFF}}});
});
