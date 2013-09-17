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
  _$jscoverage['/scroll.js'].lineData[8] = 0;
  _$jscoverage['/scroll.js'].lineData[21] = 0;
  _$jscoverage['/scroll.js'].lineData[30] = 0;
  _$jscoverage['/scroll.js'].lineData[31] = 0;
  _$jscoverage['/scroll.js'].lineData[36] = 0;
  _$jscoverage['/scroll.js'].lineData[48] = 0;
  _$jscoverage['/scroll.js'].lineData[49] = 0;
  _$jscoverage['/scroll.js'].lineData[54] = 0;
  _$jscoverage['/scroll.js'].lineData[63] = 0;
  _$jscoverage['/scroll.js'].lineData[74] = 0;
  _$jscoverage['/scroll.js'].lineData[75] = 0;
  _$jscoverage['/scroll.js'].lineData[84] = 0;
  _$jscoverage['/scroll.js'].lineData[93] = 0;
  _$jscoverage['/scroll.js'].lineData[96] = 0;
  _$jscoverage['/scroll.js'].lineData[106] = 0;
  _$jscoverage['/scroll.js'].lineData[107] = 0;
  _$jscoverage['/scroll.js'].lineData[108] = 0;
  _$jscoverage['/scroll.js'].lineData[111] = 0;
  _$jscoverage['/scroll.js'].lineData[114] = 0;
  _$jscoverage['/scroll.js'].lineData[115] = 0;
  _$jscoverage['/scroll.js'].lineData[116] = 0;
  _$jscoverage['/scroll.js'].lineData[117] = 0;
  _$jscoverage['/scroll.js'].lineData[119] = 0;
  _$jscoverage['/scroll.js'].lineData[122] = 0;
  _$jscoverage['/scroll.js'].lineData[125] = 0;
  _$jscoverage['/scroll.js'].lineData[126] = 0;
  _$jscoverage['/scroll.js'].lineData[129] = 0;
  _$jscoverage['/scroll.js'].lineData[130] = 0;
  _$jscoverage['/scroll.js'].lineData[134] = 0;
  _$jscoverage['/scroll.js'].lineData[135] = 0;
  _$jscoverage['/scroll.js'].lineData[136] = 0;
  _$jscoverage['/scroll.js'].lineData[137] = 0;
  _$jscoverage['/scroll.js'].lineData[138] = 0;
  _$jscoverage['/scroll.js'].lineData[139] = 0;
  _$jscoverage['/scroll.js'].lineData[140] = 0;
  _$jscoverage['/scroll.js'].lineData[144] = 0;
  _$jscoverage['/scroll.js'].lineData[145] = 0;
  _$jscoverage['/scroll.js'].lineData[146] = 0;
  _$jscoverage['/scroll.js'].lineData[149] = 0;
  _$jscoverage['/scroll.js'].lineData[151] = 0;
  _$jscoverage['/scroll.js'].lineData[152] = 0;
  _$jscoverage['/scroll.js'].lineData[155] = 0;
  _$jscoverage['/scroll.js'].lineData[157] = 0;
  _$jscoverage['/scroll.js'].lineData[158] = 0;
  _$jscoverage['/scroll.js'].lineData[159] = 0;
  _$jscoverage['/scroll.js'].lineData[162] = 0;
  _$jscoverage['/scroll.js'].lineData[170] = 0;
  _$jscoverage['/scroll.js'].lineData[171] = 0;
  _$jscoverage['/scroll.js'].lineData[172] = 0;
  _$jscoverage['/scroll.js'].lineData[175] = 0;
  _$jscoverage['/scroll.js'].lineData[177] = 0;
  _$jscoverage['/scroll.js'].lineData[178] = 0;
  _$jscoverage['/scroll.js'].lineData[179] = 0;
  _$jscoverage['/scroll.js'].lineData[182] = 0;
  _$jscoverage['/scroll.js'].lineData[184] = 0;
  _$jscoverage['/scroll.js'].lineData[185] = 0;
  _$jscoverage['/scroll.js'].lineData[186] = 0;
  _$jscoverage['/scroll.js'].lineData[189] = 0;
  _$jscoverage['/scroll.js'].lineData[191] = 0;
  _$jscoverage['/scroll.js'].lineData[192] = 0;
  _$jscoverage['/scroll.js'].lineData[193] = 0;
  _$jscoverage['/scroll.js'].lineData[196] = 0;
  _$jscoverage['/scroll.js'].lineData[197] = 0;
  _$jscoverage['/scroll.js'].lineData[198] = 0;
  _$jscoverage['/scroll.js'].lineData[203] = 0;
  _$jscoverage['/scroll.js'].lineData[204] = 0;
  _$jscoverage['/scroll.js'].lineData[207] = 0;
  _$jscoverage['/scroll.js'].lineData[208] = 0;
  _$jscoverage['/scroll.js'].lineData[209] = 0;
  _$jscoverage['/scroll.js'].lineData[212] = 0;
  _$jscoverage['/scroll.js'].lineData[213] = 0;
  _$jscoverage['/scroll.js'].lineData[215] = 0;
  _$jscoverage['/scroll.js'].lineData[217] = 0;
  _$jscoverage['/scroll.js'].lineData[233] = 0;
  _$jscoverage['/scroll.js'].lineData[236] = 0;
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
  _$jscoverage['/scroll.js'].branchData['30'] = [];
  _$jscoverage['/scroll.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['48'] = [];
  _$jscoverage['/scroll.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['107'] = [];
  _$jscoverage['/scroll.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['114'] = [];
  _$jscoverage['/scroll.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['125'] = [];
  _$jscoverage['/scroll.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['129'] = [];
  _$jscoverage['/scroll.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['139'] = [];
  _$jscoverage['/scroll.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['158'] = [];
  _$jscoverage['/scroll.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['170'] = [];
  _$jscoverage['/scroll.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['177'] = [];
  _$jscoverage['/scroll.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['184'] = [];
  _$jscoverage['/scroll.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['191'] = [];
  _$jscoverage['/scroll.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['196'] = [];
  _$jscoverage['/scroll.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['204'] = [];
  _$jscoverage['/scroll.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['212'] = [];
  _$jscoverage['/scroll.js'].branchData['212'][1] = new BranchData();
}
_$jscoverage['/scroll.js'].branchData['212'][1].init(819, 16, 'drag.get(\'move\')');
function visit15_212_1(result) {
  _$jscoverage['/scroll.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['204'][1].init(380, 14, 'isWin(node[0])');
function visit14_204_1(result) {
  _$jscoverage['/scroll.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['196'][1].init(1115, 6, 'adjust');
function visit13_196_1(result) {
  _$jscoverage['/scroll.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['191'][1].init(971, 17, 'diffX2 <= diff[0]');
function visit12_191_1(result) {
  _$jscoverage['/scroll.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['184'][1].init(785, 17, 'diffX >= -diff[0]');
function visit11_184_1(result) {
  _$jscoverage['/scroll.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['177'][1].init(596, 17, 'diffY2 <= diff[1]');
function visit10_177_1(result) {
  _$jscoverage['/scroll.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['170'][1].init(412, 17, 'diffY >= -diff[1]');
function visit9_170_1(result) {
  _$jscoverage['/scroll.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['158'][1].init(22, 16, 'checkContainer()');
function visit8_158_1(result) {
  _$jscoverage['/scroll.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['139'][1].init(529, 6, '!timer');
function visit7_139_1(result) {
  _$jscoverage['/scroll.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['129'][1].init(190, 16, 'checkContainer()');
function visit6_129_1(result) {
  _$jscoverage['/scroll.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['125'][1].init(108, 7, 'ev.fake');
function visit5_125_1(result) {
  _$jscoverage['/scroll.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['114'][1].init(254, 26, '!DDM.inRegion(r, mousePos)');
function visit4_114_1(result) {
  _$jscoverage['/scroll.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['107'][1].init(22, 14, 'isWin(node[0])');
function visit3_107_1(result) {
  _$jscoverage['/scroll.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['48'][1].init(18, 14, 'isWin(node[0])');
function visit2_48_1(result) {
  _$jscoverage['/scroll.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['30'][1].init(18, 14, 'isWin(node[0])');
function visit1_30_1(result) {
  _$jscoverage['/scroll.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].lineData[6]++;
KISSY.add('dd/plugin/scroll', function(S, DD, Base, Node) {
  _$jscoverage['/scroll.js'].functionData[0]++;
  _$jscoverage['/scroll.js'].lineData[8]++;
  var DDM = DD.DDM, win = S.Env.host, SCROLL_EVENT = '.-ks-dd-scroll' + S.now(), RATE = [10, 10], ADJUST_DELAY = 100, DIFF = [20, 20], isWin = S.isWindow;
  _$jscoverage['/scroll.js'].lineData[21]++;
  return Base.extend({
  pluginId: 'dd/plugin/scroll', 
  getRegion: function(node) {
  _$jscoverage['/scroll.js'].functionData[1]++;
  _$jscoverage['/scroll.js'].lineData[30]++;
  if (visit1_30_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[31]++;
    return {
  width: node.width(), 
  height: node.height()};
  } else {
    _$jscoverage['/scroll.js'].lineData[36]++;
    return {
  width: node.outerWidth(), 
  height: node.outerHeight()};
  }
}, 
  getOffset: function(node) {
  _$jscoverage['/scroll.js'].functionData[2]++;
  _$jscoverage['/scroll.js'].lineData[48]++;
  if (visit2_48_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[49]++;
    return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
  } else {
    _$jscoverage['/scroll.js'].lineData[54]++;
    return node.offset();
  }
}, 
  getScroll: function(node) {
  _$jscoverage['/scroll.js'].functionData[3]++;
  _$jscoverage['/scroll.js'].lineData[63]++;
  return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
}, 
  setScroll: function(node, r) {
  _$jscoverage['/scroll.js'].functionData[4]++;
  _$jscoverage['/scroll.js'].lineData[74]++;
  node.scrollLeft(r.left);
  _$jscoverage['/scroll.js'].lineData[75]++;
  node.scrollTop(r.top);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/scroll.js'].functionData[5]++;
  _$jscoverage['/scroll.js'].lineData[84]++;
  drag['detach'](SCROLL_EVENT);
}, 
  pluginInitializer: function(drag) {
  _$jscoverage['/scroll.js'].functionData[6]++;
  _$jscoverage['/scroll.js'].lineData[93]++;
  var self = this, node = self.get('node');
  _$jscoverage['/scroll.js'].lineData[96]++;
  var rate = self.get('rate'), diff = self.get('diff'), event, dxy, timer = null;
  _$jscoverage['/scroll.js'].lineData[106]++;
  function checkContainer() {
    _$jscoverage['/scroll.js'].functionData[7]++;
    _$jscoverage['/scroll.js'].lineData[107]++;
    if (visit3_107_1(isWin(node[0]))) {
      _$jscoverage['/scroll.js'].lineData[108]++;
      return 0;
    }
    _$jscoverage['/scroll.js'].lineData[111]++;
    var mousePos = drag.mousePos, r = DDM.region(node);
    _$jscoverage['/scroll.js'].lineData[114]++;
    if (visit4_114_1(!DDM.inRegion(r, mousePos))) {
      _$jscoverage['/scroll.js'].lineData[115]++;
      clearTimeout(timer);
      _$jscoverage['/scroll.js'].lineData[116]++;
      timer = 0;
      _$jscoverage['/scroll.js'].lineData[117]++;
      return 1;
    }
    _$jscoverage['/scroll.js'].lineData[119]++;
    return 0;
  }
  _$jscoverage['/scroll.js'].lineData[122]++;
  function dragging(ev) {
    _$jscoverage['/scroll.js'].functionData[8]++;
    _$jscoverage['/scroll.js'].lineData[125]++;
    if (visit5_125_1(ev.fake)) {
      _$jscoverage['/scroll.js'].lineData[126]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[129]++;
    if (visit6_129_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[130]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[134]++;
    event = ev;
    _$jscoverage['/scroll.js'].lineData[135]++;
    dxy = S.clone(drag.mousePos);
    _$jscoverage['/scroll.js'].lineData[136]++;
    var offset = self.getOffset(node);
    _$jscoverage['/scroll.js'].lineData[137]++;
    dxy.left -= offset.left;
    _$jscoverage['/scroll.js'].lineData[138]++;
    dxy.top -= offset.top;
    _$jscoverage['/scroll.js'].lineData[139]++;
    if (visit7_139_1(!timer)) {
      _$jscoverage['/scroll.js'].lineData[140]++;
      checkAndScroll();
    }
  }
  _$jscoverage['/scroll.js'].lineData[144]++;
  function dragEnd() {
    _$jscoverage['/scroll.js'].functionData[9]++;
    _$jscoverage['/scroll.js'].lineData[145]++;
    clearTimeout(timer);
    _$jscoverage['/scroll.js'].lineData[146]++;
    timer = null;
  }
  _$jscoverage['/scroll.js'].lineData[149]++;
  drag.on('drag' + SCROLL_EVENT, dragging);
  _$jscoverage['/scroll.js'].lineData[151]++;
  drag.on('dragstart' + SCROLL_EVENT, function() {
  _$jscoverage['/scroll.js'].functionData[10]++;
  _$jscoverage['/scroll.js'].lineData[152]++;
  DDM.cacheWH(node);
});
  _$jscoverage['/scroll.js'].lineData[155]++;
  drag.on('dragend' + SCROLL_EVENT, dragEnd);
  _$jscoverage['/scroll.js'].lineData[157]++;
  function checkAndScroll() {
    _$jscoverage['/scroll.js'].functionData[11]++;
    _$jscoverage['/scroll.js'].lineData[158]++;
    if (visit8_158_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[159]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[162]++;
    var r = self.getRegion(node), nw = r.width, nh = r.height, scroll = self.getScroll(node), origin = S.clone(scroll), diffY = dxy.top - nh, adjust = false;
    _$jscoverage['/scroll.js'].lineData[170]++;
    if (visit9_170_1(diffY >= -diff[1])) {
      _$jscoverage['/scroll.js'].lineData[171]++;
      scroll.top += rate[1];
      _$jscoverage['/scroll.js'].lineData[172]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[175]++;
    var diffY2 = dxy.top;
    _$jscoverage['/scroll.js'].lineData[177]++;
    if (visit10_177_1(diffY2 <= diff[1])) {
      _$jscoverage['/scroll.js'].lineData[178]++;
      scroll.top -= rate[1];
      _$jscoverage['/scroll.js'].lineData[179]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[182]++;
    var diffX = dxy.left - nw;
    _$jscoverage['/scroll.js'].lineData[184]++;
    if (visit11_184_1(diffX >= -diff[0])) {
      _$jscoverage['/scroll.js'].lineData[185]++;
      scroll.left += rate[0];
      _$jscoverage['/scroll.js'].lineData[186]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[189]++;
    var diffX2 = dxy.left;
    _$jscoverage['/scroll.js'].lineData[191]++;
    if (visit12_191_1(diffX2 <= diff[0])) {
      _$jscoverage['/scroll.js'].lineData[192]++;
      scroll.left -= rate[0];
      _$jscoverage['/scroll.js'].lineData[193]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[196]++;
    if (visit13_196_1(adjust)) {
      _$jscoverage['/scroll.js'].lineData[197]++;
      self.setScroll(node, scroll);
      _$jscoverage['/scroll.js'].lineData[198]++;
      timer = setTimeout(checkAndScroll, ADJUST_DELAY);
      _$jscoverage['/scroll.js'].lineData[203]++;
      event.fake = true;
      _$jscoverage['/scroll.js'].lineData[204]++;
      if (visit14_204_1(isWin(node[0]))) {
        _$jscoverage['/scroll.js'].lineData[207]++;
        scroll = self.getScroll(node);
        _$jscoverage['/scroll.js'].lineData[208]++;
        event.left += scroll.left - origin.left;
        _$jscoverage['/scroll.js'].lineData[209]++;
        event.top += scroll.top - origin.top;
      }
      _$jscoverage['/scroll.js'].lineData[212]++;
      if (visit15_212_1(drag.get('move'))) {
        _$jscoverage['/scroll.js'].lineData[213]++;
        drag.get('node').offset(event);
      }
      _$jscoverage['/scroll.js'].lineData[215]++;
      drag.fire('drag', event);
    } else {
      _$jscoverage['/scroll.js'].lineData[217]++;
      timer = null;
    }
  }
}}, {
  ATTRS: {
  node: {
  valueFn: function() {
  _$jscoverage['/scroll.js'].functionData[12]++;
  _$jscoverage['/scroll.js'].lineData[233]++;
  return Node.one(win);
}, 
  setter: function(v) {
  _$jscoverage['/scroll.js'].functionData[13]++;
  _$jscoverage['/scroll.js'].lineData[236]++;
  return Node.one(v);
}}, 
  rate: {
  value: RATE}, 
  diff: {
  value: DIFF}}});
}, {
  requires: ['dd', 'base', 'node']});
