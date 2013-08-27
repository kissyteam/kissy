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
  _$jscoverage['/scroll.js'].lineData[20] = 0;
  _$jscoverage['/scroll.js'].lineData[29] = 0;
  _$jscoverage['/scroll.js'].lineData[30] = 0;
  _$jscoverage['/scroll.js'].lineData[35] = 0;
  _$jscoverage['/scroll.js'].lineData[47] = 0;
  _$jscoverage['/scroll.js'].lineData[48] = 0;
  _$jscoverage['/scroll.js'].lineData[53] = 0;
  _$jscoverage['/scroll.js'].lineData[62] = 0;
  _$jscoverage['/scroll.js'].lineData[73] = 0;
  _$jscoverage['/scroll.js'].lineData[74] = 0;
  _$jscoverage['/scroll.js'].lineData[83] = 0;
  _$jscoverage['/scroll.js'].lineData[92] = 0;
  _$jscoverage['/scroll.js'].lineData[95] = 0;
  _$jscoverage['/scroll.js'].lineData[105] = 0;
  _$jscoverage['/scroll.js'].lineData[106] = 0;
  _$jscoverage['/scroll.js'].lineData[107] = 0;
  _$jscoverage['/scroll.js'].lineData[110] = 0;
  _$jscoverage['/scroll.js'].lineData[113] = 0;
  _$jscoverage['/scroll.js'].lineData[114] = 0;
  _$jscoverage['/scroll.js'].lineData[115] = 0;
  _$jscoverage['/scroll.js'].lineData[116] = 0;
  _$jscoverage['/scroll.js'].lineData[118] = 0;
  _$jscoverage['/scroll.js'].lineData[121] = 0;
  _$jscoverage['/scroll.js'].lineData[124] = 0;
  _$jscoverage['/scroll.js'].lineData[125] = 0;
  _$jscoverage['/scroll.js'].lineData[128] = 0;
  _$jscoverage['/scroll.js'].lineData[129] = 0;
  _$jscoverage['/scroll.js'].lineData[133] = 0;
  _$jscoverage['/scroll.js'].lineData[134] = 0;
  _$jscoverage['/scroll.js'].lineData[135] = 0;
  _$jscoverage['/scroll.js'].lineData[136] = 0;
  _$jscoverage['/scroll.js'].lineData[137] = 0;
  _$jscoverage['/scroll.js'].lineData[138] = 0;
  _$jscoverage['/scroll.js'].lineData[139] = 0;
  _$jscoverage['/scroll.js'].lineData[143] = 0;
  _$jscoverage['/scroll.js'].lineData[144] = 0;
  _$jscoverage['/scroll.js'].lineData[145] = 0;
  _$jscoverage['/scroll.js'].lineData[148] = 0;
  _$jscoverage['/scroll.js'].lineData[150] = 0;
  _$jscoverage['/scroll.js'].lineData[151] = 0;
  _$jscoverage['/scroll.js'].lineData[154] = 0;
  _$jscoverage['/scroll.js'].lineData[156] = 0;
  _$jscoverage['/scroll.js'].lineData[157] = 0;
  _$jscoverage['/scroll.js'].lineData[158] = 0;
  _$jscoverage['/scroll.js'].lineData[161] = 0;
  _$jscoverage['/scroll.js'].lineData[169] = 0;
  _$jscoverage['/scroll.js'].lineData[170] = 0;
  _$jscoverage['/scroll.js'].lineData[171] = 0;
  _$jscoverage['/scroll.js'].lineData[174] = 0;
  _$jscoverage['/scroll.js'].lineData[176] = 0;
  _$jscoverage['/scroll.js'].lineData[177] = 0;
  _$jscoverage['/scroll.js'].lineData[178] = 0;
  _$jscoverage['/scroll.js'].lineData[181] = 0;
  _$jscoverage['/scroll.js'].lineData[183] = 0;
  _$jscoverage['/scroll.js'].lineData[184] = 0;
  _$jscoverage['/scroll.js'].lineData[185] = 0;
  _$jscoverage['/scroll.js'].lineData[188] = 0;
  _$jscoverage['/scroll.js'].lineData[190] = 0;
  _$jscoverage['/scroll.js'].lineData[191] = 0;
  _$jscoverage['/scroll.js'].lineData[192] = 0;
  _$jscoverage['/scroll.js'].lineData[195] = 0;
  _$jscoverage['/scroll.js'].lineData[196] = 0;
  _$jscoverage['/scroll.js'].lineData[197] = 0;
  _$jscoverage['/scroll.js'].lineData[202] = 0;
  _$jscoverage['/scroll.js'].lineData[203] = 0;
  _$jscoverage['/scroll.js'].lineData[206] = 0;
  _$jscoverage['/scroll.js'].lineData[207] = 0;
  _$jscoverage['/scroll.js'].lineData[208] = 0;
  _$jscoverage['/scroll.js'].lineData[211] = 0;
  _$jscoverage['/scroll.js'].lineData[212] = 0;
  _$jscoverage['/scroll.js'].lineData[214] = 0;
  _$jscoverage['/scroll.js'].lineData[216] = 0;
  _$jscoverage['/scroll.js'].lineData[232] = 0;
  _$jscoverage['/scroll.js'].lineData[235] = 0;
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
  _$jscoverage['/scroll.js'].branchData['29'] = [];
  _$jscoverage['/scroll.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['47'] = [];
  _$jscoverage['/scroll.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['106'] = [];
  _$jscoverage['/scroll.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['113'] = [];
  _$jscoverage['/scroll.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['124'] = [];
  _$jscoverage['/scroll.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['128'] = [];
  _$jscoverage['/scroll.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['138'] = [];
  _$jscoverage['/scroll.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['157'] = [];
  _$jscoverage['/scroll.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['169'] = [];
  _$jscoverage['/scroll.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['176'] = [];
  _$jscoverage['/scroll.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['183'] = [];
  _$jscoverage['/scroll.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['190'] = [];
  _$jscoverage['/scroll.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['195'] = [];
  _$jscoverage['/scroll.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['203'] = [];
  _$jscoverage['/scroll.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/scroll.js'].branchData['211'] = [];
  _$jscoverage['/scroll.js'].branchData['211'][1] = new BranchData();
}
_$jscoverage['/scroll.js'].branchData['211'][1].init(819, 16, 'drag.get(\'move\')');
function visit15_211_1(result) {
  _$jscoverage['/scroll.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['203'][1].init(380, 14, 'isWin(node[0])');
function visit14_203_1(result) {
  _$jscoverage['/scroll.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['195'][1].init(1115, 6, 'adjust');
function visit13_195_1(result) {
  _$jscoverage['/scroll.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['190'][1].init(971, 17, 'diffX2 <= diff[0]');
function visit12_190_1(result) {
  _$jscoverage['/scroll.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['183'][1].init(785, 17, 'diffX >= -diff[0]');
function visit11_183_1(result) {
  _$jscoverage['/scroll.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['176'][1].init(596, 17, 'diffY2 <= diff[1]');
function visit10_176_1(result) {
  _$jscoverage['/scroll.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['169'][1].init(412, 17, 'diffY >= -diff[1]');
function visit9_169_1(result) {
  _$jscoverage['/scroll.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['157'][1].init(22, 16, 'checkContainer()');
function visit8_157_1(result) {
  _$jscoverage['/scroll.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['138'][1].init(529, 6, '!timer');
function visit7_138_1(result) {
  _$jscoverage['/scroll.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['128'][1].init(190, 16, 'checkContainer()');
function visit6_128_1(result) {
  _$jscoverage['/scroll.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['124'][1].init(108, 7, 'ev.fake');
function visit5_124_1(result) {
  _$jscoverage['/scroll.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['113'][1].init(254, 26, '!DDM.inRegion(r, mousePos)');
function visit4_113_1(result) {
  _$jscoverage['/scroll.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['106'][1].init(22, 14, 'isWin(node[0])');
function visit3_106_1(result) {
  _$jscoverage['/scroll.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['47'][1].init(18, 14, 'isWin(node[0])');
function visit2_47_1(result) {
  _$jscoverage['/scroll.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].branchData['29'][1].init(18, 14, 'isWin(node[0])');
function visit1_29_1(result) {
  _$jscoverage['/scroll.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/scroll.js'].lineData[6]++;
KISSY.add('dd/plugin/scroll', function(S, DD, Base, Node) {
  _$jscoverage['/scroll.js'].functionData[0]++;
  _$jscoverage['/scroll.js'].lineData[8]++;
  var DDM = DD.DDM, win = S.Env.host, SCROLL_EVENT = '.-ks-dd-scroll' + S.now(), RATE = [10, 10], ADJUST_DELAY = 100, DIFF = [20, 20], isWin = S.isWindow;
  _$jscoverage['/scroll.js'].lineData[20]++;
  return Base.extend({
  pluginId: 'dd/plugin/scroll', 
  getRegion: function(node) {
  _$jscoverage['/scroll.js'].functionData[1]++;
  _$jscoverage['/scroll.js'].lineData[29]++;
  if (visit1_29_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[30]++;
    return {
  width: node.width(), 
  height: node.height()};
  } else {
    _$jscoverage['/scroll.js'].lineData[35]++;
    return {
  width: node.outerWidth(), 
  height: node.outerHeight()};
  }
}, 
  getOffset: function(node) {
  _$jscoverage['/scroll.js'].functionData[2]++;
  _$jscoverage['/scroll.js'].lineData[47]++;
  if (visit2_47_1(isWin(node[0]))) {
    _$jscoverage['/scroll.js'].lineData[48]++;
    return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
  } else {
    _$jscoverage['/scroll.js'].lineData[53]++;
    return node.offset();
  }
}, 
  getScroll: function(node) {
  _$jscoverage['/scroll.js'].functionData[3]++;
  _$jscoverage['/scroll.js'].lineData[62]++;
  return {
  left: node.scrollLeft(), 
  top: node.scrollTop()};
}, 
  setScroll: function(node, r) {
  _$jscoverage['/scroll.js'].functionData[4]++;
  _$jscoverage['/scroll.js'].lineData[73]++;
  node.scrollLeft(r.left);
  _$jscoverage['/scroll.js'].lineData[74]++;
  node.scrollTop(r.top);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/scroll.js'].functionData[5]++;
  _$jscoverage['/scroll.js'].lineData[83]++;
  drag['detach'](SCROLL_EVENT);
}, 
  pluginInitializer: function(drag) {
  _$jscoverage['/scroll.js'].functionData[6]++;
  _$jscoverage['/scroll.js'].lineData[92]++;
  var self = this, node = self.get('node');
  _$jscoverage['/scroll.js'].lineData[95]++;
  var rate = self.get('rate'), diff = self.get('diff'), event, dxy, timer = null;
  _$jscoverage['/scroll.js'].lineData[105]++;
  function checkContainer() {
    _$jscoverage['/scroll.js'].functionData[7]++;
    _$jscoverage['/scroll.js'].lineData[106]++;
    if (visit3_106_1(isWin(node[0]))) {
      _$jscoverage['/scroll.js'].lineData[107]++;
      return 0;
    }
    _$jscoverage['/scroll.js'].lineData[110]++;
    var mousePos = drag.mousePos, r = DDM.region(node);
    _$jscoverage['/scroll.js'].lineData[113]++;
    if (visit4_113_1(!DDM.inRegion(r, mousePos))) {
      _$jscoverage['/scroll.js'].lineData[114]++;
      clearTimeout(timer);
      _$jscoverage['/scroll.js'].lineData[115]++;
      timer = 0;
      _$jscoverage['/scroll.js'].lineData[116]++;
      return 1;
    }
    _$jscoverage['/scroll.js'].lineData[118]++;
    return 0;
  }
  _$jscoverage['/scroll.js'].lineData[121]++;
  function dragging(ev) {
    _$jscoverage['/scroll.js'].functionData[8]++;
    _$jscoverage['/scroll.js'].lineData[124]++;
    if (visit5_124_1(ev.fake)) {
      _$jscoverage['/scroll.js'].lineData[125]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[128]++;
    if (visit6_128_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[129]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[133]++;
    event = ev;
    _$jscoverage['/scroll.js'].lineData[134]++;
    dxy = S.clone(drag.mousePos);
    _$jscoverage['/scroll.js'].lineData[135]++;
    var offset = self.getOffset(node);
    _$jscoverage['/scroll.js'].lineData[136]++;
    dxy.left -= offset.left;
    _$jscoverage['/scroll.js'].lineData[137]++;
    dxy.top -= offset.top;
    _$jscoverage['/scroll.js'].lineData[138]++;
    if (visit7_138_1(!timer)) {
      _$jscoverage['/scroll.js'].lineData[139]++;
      checkAndScroll();
    }
  }
  _$jscoverage['/scroll.js'].lineData[143]++;
  function dragEnd() {
    _$jscoverage['/scroll.js'].functionData[9]++;
    _$jscoverage['/scroll.js'].lineData[144]++;
    clearTimeout(timer);
    _$jscoverage['/scroll.js'].lineData[145]++;
    timer = null;
  }
  _$jscoverage['/scroll.js'].lineData[148]++;
  drag.on('drag' + SCROLL_EVENT, dragging);
  _$jscoverage['/scroll.js'].lineData[150]++;
  drag.on('dragstart' + SCROLL_EVENT, function() {
  _$jscoverage['/scroll.js'].functionData[10]++;
  _$jscoverage['/scroll.js'].lineData[151]++;
  DDM.cacheWH(node);
});
  _$jscoverage['/scroll.js'].lineData[154]++;
  drag.on('dragend' + SCROLL_EVENT, dragEnd);
  _$jscoverage['/scroll.js'].lineData[156]++;
  function checkAndScroll() {
    _$jscoverage['/scroll.js'].functionData[11]++;
    _$jscoverage['/scroll.js'].lineData[157]++;
    if (visit8_157_1(checkContainer())) {
      _$jscoverage['/scroll.js'].lineData[158]++;
      return;
    }
    _$jscoverage['/scroll.js'].lineData[161]++;
    var r = self.getRegion(node), nw = r.width, nh = r.height, scroll = self.getScroll(node), origin = S.clone(scroll), diffY = dxy.top - nh, adjust = false;
    _$jscoverage['/scroll.js'].lineData[169]++;
    if (visit9_169_1(diffY >= -diff[1])) {
      _$jscoverage['/scroll.js'].lineData[170]++;
      scroll.top += rate[1];
      _$jscoverage['/scroll.js'].lineData[171]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[174]++;
    var diffY2 = dxy.top;
    _$jscoverage['/scroll.js'].lineData[176]++;
    if (visit10_176_1(diffY2 <= diff[1])) {
      _$jscoverage['/scroll.js'].lineData[177]++;
      scroll.top -= rate[1];
      _$jscoverage['/scroll.js'].lineData[178]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[181]++;
    var diffX = dxy.left - nw;
    _$jscoverage['/scroll.js'].lineData[183]++;
    if (visit11_183_1(diffX >= -diff[0])) {
      _$jscoverage['/scroll.js'].lineData[184]++;
      scroll.left += rate[0];
      _$jscoverage['/scroll.js'].lineData[185]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[188]++;
    var diffX2 = dxy.left;
    _$jscoverage['/scroll.js'].lineData[190]++;
    if (visit12_190_1(diffX2 <= diff[0])) {
      _$jscoverage['/scroll.js'].lineData[191]++;
      scroll.left -= rate[0];
      _$jscoverage['/scroll.js'].lineData[192]++;
      adjust = true;
    }
    _$jscoverage['/scroll.js'].lineData[195]++;
    if (visit13_195_1(adjust)) {
      _$jscoverage['/scroll.js'].lineData[196]++;
      self.setScroll(node, scroll);
      _$jscoverage['/scroll.js'].lineData[197]++;
      timer = setTimeout(checkAndScroll, ADJUST_DELAY);
      _$jscoverage['/scroll.js'].lineData[202]++;
      event.fake = true;
      _$jscoverage['/scroll.js'].lineData[203]++;
      if (visit14_203_1(isWin(node[0]))) {
        _$jscoverage['/scroll.js'].lineData[206]++;
        scroll = self.getScroll(node);
        _$jscoverage['/scroll.js'].lineData[207]++;
        event.left += scroll.left - origin.left;
        _$jscoverage['/scroll.js'].lineData[208]++;
        event.top += scroll.top - origin.top;
      }
      _$jscoverage['/scroll.js'].lineData[211]++;
      if (visit15_211_1(drag.get('move'))) {
        _$jscoverage['/scroll.js'].lineData[212]++;
        drag.get('node').offset(event);
      }
      _$jscoverage['/scroll.js'].lineData[214]++;
      drag.fire('drag', event);
    } else {
      _$jscoverage['/scroll.js'].lineData[216]++;
      timer = null;
    }
  }
}}, {
  ATTRS: {
  node: {
  valueFn: function() {
  _$jscoverage['/scroll.js'].functionData[12]++;
  _$jscoverage['/scroll.js'].lineData[232]++;
  return Node.one(win);
}, 
  setter: function(v) {
  _$jscoverage['/scroll.js'].functionData[13]++;
  _$jscoverage['/scroll.js'].lineData[235]++;
  return Node.one(v);
}}, 
  rate: {
  value: RATE}, 
  diff: {
  value: DIFF}}});
}, {
  requires: ['dd', 'base', 'node']});
