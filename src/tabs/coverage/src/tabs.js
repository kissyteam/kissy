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
if (! _$jscoverage['/tabs.js']) {
  _$jscoverage['/tabs.js'] = {};
  _$jscoverage['/tabs.js'].lineData = [];
  _$jscoverage['/tabs.js'].lineData[6] = 0;
  _$jscoverage['/tabs.js'].lineData[7] = 0;
  _$jscoverage['/tabs.js'].lineData[8] = 0;
  _$jscoverage['/tabs.js'].lineData[9] = 0;
  _$jscoverage['/tabs.js'].lineData[10] = 0;
  _$jscoverage['/tabs.js'].lineData[11] = 0;
  _$jscoverage['/tabs.js'].lineData[12] = 0;
  _$jscoverage['/tabs.js'].lineData[15] = 0;
  _$jscoverage['/tabs.js'].lineData[16] = 0;
  _$jscoverage['/tabs.js'].lineData[19] = 0;
  _$jscoverage['/tabs.js'].lineData[20] = 0;
  _$jscoverage['/tabs.js'].lineData[28] = 0;
  _$jscoverage['/tabs.js'].lineData[30] = 0;
  _$jscoverage['/tabs.js'].lineData[34] = 0;
  _$jscoverage['/tabs.js'].lineData[35] = 0;
  _$jscoverage['/tabs.js'].lineData[56] = 0;
  _$jscoverage['/tabs.js'].lineData[57] = 0;
  _$jscoverage['/tabs.js'].lineData[58] = 0;
  _$jscoverage['/tabs.js'].lineData[62] = 0;
  _$jscoverage['/tabs.js'].lineData[69] = 0;
  _$jscoverage['/tabs.js'].lineData[70] = 0;
  _$jscoverage['/tabs.js'].lineData[71] = 0;
  _$jscoverage['/tabs.js'].lineData[74] = 0;
  _$jscoverage['/tabs.js'].lineData[75] = 0;
  _$jscoverage['/tabs.js'].lineData[89] = 0;
  _$jscoverage['/tabs.js'].lineData[97] = 0;
  _$jscoverage['/tabs.js'].lineData[98] = 0;
  _$jscoverage['/tabs.js'].lineData[101] = 0;
  _$jscoverage['/tabs.js'].lineData[105] = 0;
  _$jscoverage['/tabs.js'].lineData[109] = 0;
  _$jscoverage['/tabs.js'].lineData[111] = 0;
  _$jscoverage['/tabs.js'].lineData[113] = 0;
  _$jscoverage['/tabs.js'].lineData[115] = 0;
  _$jscoverage['/tabs.js'].lineData[116] = 0;
  _$jscoverage['/tabs.js'].lineData[117] = 0;
  _$jscoverage['/tabs.js'].lineData[120] = 0;
  _$jscoverage['/tabs.js'].lineData[130] = 0;
  _$jscoverage['/tabs.js'].lineData[141] = 0;
  _$jscoverage['/tabs.js'].lineData[142] = 0;
  _$jscoverage['/tabs.js'].lineData[143] = 0;
  _$jscoverage['/tabs.js'].lineData[144] = 0;
  _$jscoverage['/tabs.js'].lineData[145] = 0;
  _$jscoverage['/tabs.js'].lineData[147] = 0;
  _$jscoverage['/tabs.js'].lineData[150] = 0;
  _$jscoverage['/tabs.js'].lineData[151] = 0;
  _$jscoverage['/tabs.js'].lineData[152] = 0;
  _$jscoverage['/tabs.js'].lineData[162] = 0;
  _$jscoverage['/tabs.js'].lineData[163] = 0;
  _$jscoverage['/tabs.js'].lineData[173] = 0;
  _$jscoverage['/tabs.js'].lineData[174] = 0;
  _$jscoverage['/tabs.js'].lineData[182] = 0;
  _$jscoverage['/tabs.js'].lineData[186] = 0;
  _$jscoverage['/tabs.js'].lineData[187] = 0;
  _$jscoverage['/tabs.js'].lineData[188] = 0;
  _$jscoverage['/tabs.js'].lineData[189] = 0;
  _$jscoverage['/tabs.js'].lineData[191] = 0;
  _$jscoverage['/tabs.js'].lineData[194] = 0;
  _$jscoverage['/tabs.js'].lineData[202] = 0;
  _$jscoverage['/tabs.js'].lineData[206] = 0;
  _$jscoverage['/tabs.js'].lineData[207] = 0;
  _$jscoverage['/tabs.js'].lineData[208] = 0;
  _$jscoverage['/tabs.js'].lineData[209] = 0;
  _$jscoverage['/tabs.js'].lineData[211] = 0;
  _$jscoverage['/tabs.js'].lineData[214] = 0;
  _$jscoverage['/tabs.js'].lineData[222] = 0;
  _$jscoverage['/tabs.js'].lineData[230] = 0;
  _$jscoverage['/tabs.js'].lineData[237] = 0;
  _$jscoverage['/tabs.js'].lineData[244] = 0;
  _$jscoverage['/tabs.js'].lineData[253] = 0;
  _$jscoverage['/tabs.js'].lineData[256] = 0;
  _$jscoverage['/tabs.js'].lineData[257] = 0;
  _$jscoverage['/tabs.js'].lineData[258] = 0;
  _$jscoverage['/tabs.js'].lineData[267] = 0;
  _$jscoverage['/tabs.js'].lineData[271] = 0;
  _$jscoverage['/tabs.js'].lineData[272] = 0;
  _$jscoverage['/tabs.js'].lineData[273] = 0;
  _$jscoverage['/tabs.js'].lineData[280] = 0;
  _$jscoverage['/tabs.js'].lineData[281] = 0;
  _$jscoverage['/tabs.js'].lineData[349] = 0;
  _$jscoverage['/tabs.js'].lineData[354] = 0;
  _$jscoverage['/tabs.js'].lineData[379] = 0;
  _$jscoverage['/tabs.js'].lineData[398] = 0;
  _$jscoverage['/tabs.js'].lineData[405] = 0;
  _$jscoverage['/tabs.js'].lineData[407] = 0;
  _$jscoverage['/tabs.js'].lineData[408] = 0;
  _$jscoverage['/tabs.js'].lineData[409] = 0;
  _$jscoverage['/tabs.js'].lineData[411] = 0;
}
if (! _$jscoverage['/tabs.js'].functionData) {
  _$jscoverage['/tabs.js'].functionData = [];
  _$jscoverage['/tabs.js'].functionData[0] = 0;
  _$jscoverage['/tabs.js'].functionData[1] = 0;
  _$jscoverage['/tabs.js'].functionData[2] = 0;
  _$jscoverage['/tabs.js'].functionData[3] = 0;
  _$jscoverage['/tabs.js'].functionData[4] = 0;
  _$jscoverage['/tabs.js'].functionData[5] = 0;
  _$jscoverage['/tabs.js'].functionData[6] = 0;
  _$jscoverage['/tabs.js'].functionData[7] = 0;
  _$jscoverage['/tabs.js'].functionData[8] = 0;
  _$jscoverage['/tabs.js'].functionData[9] = 0;
  _$jscoverage['/tabs.js'].functionData[10] = 0;
  _$jscoverage['/tabs.js'].functionData[11] = 0;
  _$jscoverage['/tabs.js'].functionData[12] = 0;
  _$jscoverage['/tabs.js'].functionData[13] = 0;
  _$jscoverage['/tabs.js'].functionData[14] = 0;
  _$jscoverage['/tabs.js'].functionData[15] = 0;
  _$jscoverage['/tabs.js'].functionData[16] = 0;
  _$jscoverage['/tabs.js'].functionData[17] = 0;
  _$jscoverage['/tabs.js'].functionData[18] = 0;
  _$jscoverage['/tabs.js'].functionData[19] = 0;
  _$jscoverage['/tabs.js'].functionData[20] = 0;
  _$jscoverage['/tabs.js'].functionData[21] = 0;
  _$jscoverage['/tabs.js'].functionData[22] = 0;
}
if (! _$jscoverage['/tabs.js'].branchData) {
  _$jscoverage['/tabs.js'].branchData = {};
  _$jscoverage['/tabs.js'].branchData['34'] = [];
  _$jscoverage['/tabs.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['57'] = [];
  _$jscoverage['/tabs.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['69'] = [];
  _$jscoverage['/tabs.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['97'] = [];
  _$jscoverage['/tabs.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['115'] = [];
  _$jscoverage['/tabs.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['141'] = [];
  _$jscoverage['/tabs.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['142'] = [];
  _$jscoverage['/tabs.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['144'] = [];
  _$jscoverage['/tabs.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['187'] = [];
  _$jscoverage['/tabs.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['207'] = [];
  _$jscoverage['/tabs.js'].branchData['207'][1] = new BranchData();
}
_$jscoverage['/tabs.js'].branchData['207'][1].init(21, 17, 'c.get(\'selected\')');
function visit25_207_1(result) {
  _$jscoverage['/tabs.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['187'][1].init(21, 17, 'c.get(\'selected\')');
function visit24_187_1(result) {
  _$jscoverage['/tabs.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['144'][1].init(121, 11, 'index === 0');
function visit23_144_1(result) {
  _$jscoverage['/tabs.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['142'][1].init(21, 18, 'barCs.length === 1');
function visit22_142_1(result) {
  _$jscoverage['/tabs.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['141'][1].init(406, 19, 'tab.get(\'selected\')');
function visit21_141_1(result) {
  _$jscoverage['/tabs.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['115'][1].init(658, 13, 'item.selected');
function visit20_115_1(result) {
  _$jscoverage['/tabs.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['97'][1].init(259, 28, 'typeof index === \'undefined\'');
function visit19_97_1(result) {
  _$jscoverage['/tabs.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['69'][1].init(1314, 31, '!selected && barChildren.length');
function visit18_69_1(result) {
  _$jscoverage['/tabs.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['57'][1].init(32, 25, 'selected || item.selected');
function visit17_57_1(result) {
  _$jscoverage['/tabs.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['34'][1].init(117, 5, 'items');
function visit16_34_1(result) {
  _$jscoverage['/tabs.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tabs.js'].functionData[0]++;
  _$jscoverage['/tabs.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/tabs.js'].lineData[8]++;
  var Bar = require('tabs/bar');
  _$jscoverage['/tabs.js'].lineData[9]++;
  var Body = require('tabs/body');
  _$jscoverage['/tabs.js'].lineData[10]++;
  require('tabs/tab');
  _$jscoverage['/tabs.js'].lineData[11]++;
  var Panel = require('tabs/panel');
  _$jscoverage['/tabs.js'].lineData[12]++;
  var Render = require('tabs/render');
  _$jscoverage['/tabs.js'].lineData[15]++;
  function setBar(children, barOrientation, bar) {
    _$jscoverage['/tabs.js'].functionData[1]++;
    _$jscoverage['/tabs.js'].lineData[16]++;
    children[BarIndexMap[barOrientation]] = bar;
  }
  _$jscoverage['/tabs.js'].lineData[19]++;
  function setBody(children, barOrientation, body) {
    _$jscoverage['/tabs.js'].functionData[2]++;
    _$jscoverage['/tabs.js'].lineData[20]++;
    children[1 - BarIndexMap[barOrientation]] = body;
  }
  _$jscoverage['/tabs.js'].lineData[28]++;
  var Tabs = Container.extend({
  initializer: function() {
  _$jscoverage['/tabs.js'].functionData[3]++;
  _$jscoverage['/tabs.js'].lineData[30]++;
  var self = this, items = self.get('items');
  _$jscoverage['/tabs.js'].lineData[34]++;
  if (visit16_34_1(items)) {
    _$jscoverage['/tabs.js'].lineData[35]++;
    var children = self.get('children'), barOrientation = self.get('barOrientation'), selected, prefixCls = self.get('prefixCls'), tabItem, panelItem, bar = {
  prefixCls: prefixCls, 
  xclass: 'tabs-bar', 
  changeType: self.get('changeType'), 
  children: []}, body = {
  prefixCls: prefixCls, 
  xclass: 'tabs-body', 
  lazyRender: self.get('lazyRender'), 
  children: []}, barChildren = bar.children, panels = body.children;
    _$jscoverage['/tabs.js'].lineData[56]++;
    S.each(items, function(item) {
  _$jscoverage['/tabs.js'].functionData[4]++;
  _$jscoverage['/tabs.js'].lineData[57]++;
  selected = visit17_57_1(selected || item.selected);
  _$jscoverage['/tabs.js'].lineData[58]++;
  barChildren.push(tabItem = {
  content: item.title, 
  selected: item.selected});
  _$jscoverage['/tabs.js'].lineData[62]++;
  panels.push(panelItem = {
  content: item.content, 
  selected: item.selected});
});
    _$jscoverage['/tabs.js'].lineData[69]++;
    if (visit18_69_1(!selected && barChildren.length)) {
      _$jscoverage['/tabs.js'].lineData[70]++;
      barChildren[0].selected = true;
      _$jscoverage['/tabs.js'].lineData[71]++;
      panels[0].selected = true;
    }
    _$jscoverage['/tabs.js'].lineData[74]++;
    setBar(children, barOrientation, bar);
    _$jscoverage['/tabs.js'].lineData[75]++;
    setBody(children, barOrientation, body);
  }
}, 
  addItem: function(item, index) {
  _$jscoverage['/tabs.js'].functionData[5]++;
  _$jscoverage['/tabs.js'].lineData[89]++;
  var self = this, bar = self.get('bar'), selectedTab, tabItem, panelItem, barChildren = bar.get('children'), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[97]++;
  if (visit19_97_1(typeof index === 'undefined')) {
    _$jscoverage['/tabs.js'].lineData[98]++;
    index = barChildren.length;
  }
  _$jscoverage['/tabs.js'].lineData[101]++;
  tabItem = {
  content: item.title};
  _$jscoverage['/tabs.js'].lineData[105]++;
  panelItem = {
  content: item.content};
  _$jscoverage['/tabs.js'].lineData[109]++;
  bar.addChild(tabItem, index);
  _$jscoverage['/tabs.js'].lineData[111]++;
  selectedTab = barChildren[index];
  _$jscoverage['/tabs.js'].lineData[113]++;
  body.addChild(panelItem, index);
  _$jscoverage['/tabs.js'].lineData[115]++;
  if (visit20_115_1(item.selected)) {
    _$jscoverage['/tabs.js'].lineData[116]++;
    bar.set('selectedTab', selectedTab);
    _$jscoverage['/tabs.js'].lineData[117]++;
    body.set('selectedPanelIndex', index);
  }
  _$jscoverage['/tabs.js'].lineData[120]++;
  return self;
}, 
  removeItemAt: function(index, destroy) {
  _$jscoverage['/tabs.js'].functionData[6]++;
  _$jscoverage['/tabs.js'].lineData[130]++;
  var tabs = this, bar = tabs.get('bar'), barCs = bar.get('children'), tab = bar.getChildAt(index), body = tabs.get('body');
  _$jscoverage['/tabs.js'].lineData[141]++;
  if (visit21_141_1(tab.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[142]++;
    if (visit22_142_1(barCs.length === 1)) {
      _$jscoverage['/tabs.js'].lineData[143]++;
      bar.set('selectedTab', null);
    } else {
      _$jscoverage['/tabs.js'].lineData[144]++;
      if (visit23_144_1(index === 0)) {
        _$jscoverage['/tabs.js'].lineData[145]++;
        bar.set('selectedTab', bar.getChildAt(index + 1));
      } else {
        _$jscoverage['/tabs.js'].lineData[147]++;
        bar.set('selectedTab', bar.getChildAt(index - 1));
      }
    }
  }
  _$jscoverage['/tabs.js'].lineData[150]++;
  bar.removeChild(bar.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[151]++;
  body.removeChild(body.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[152]++;
  return tabs;
}, 
  'removeItemByTab': function(tab, destroy) {
  _$jscoverage['/tabs.js'].functionData[7]++;
  _$jscoverage['/tabs.js'].lineData[162]++;
  var index = S.indexOf(tab, this.get('bar').get('children'));
  _$jscoverage['/tabs.js'].lineData[163]++;
  return this.removeItemAt(index, destroy);
}, 
  'removeItemByPanel': function(panel, destroy) {
  _$jscoverage['/tabs.js'].functionData[8]++;
  _$jscoverage['/tabs.js'].lineData[173]++;
  var index = S.indexOf(panel, this.get('body').get('children'));
  _$jscoverage['/tabs.js'].lineData[174]++;
  return this.removeItemAt(index, destroy);
}, 
  getSelectedTab: function() {
  _$jscoverage['/tabs.js'].functionData[9]++;
  _$jscoverage['/tabs.js'].lineData[182]++;
  var tabs = this, bar = tabs.get('bar'), child = null;
  _$jscoverage['/tabs.js'].lineData[186]++;
  S.each(bar.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[10]++;
  _$jscoverage['/tabs.js'].lineData[187]++;
  if (visit24_187_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[188]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[189]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[191]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[194]++;
  return child;
}, 
  getSelectedPanel: function() {
  _$jscoverage['/tabs.js'].functionData[11]++;
  _$jscoverage['/tabs.js'].lineData[202]++;
  var tabs = this, body = tabs.get('body'), child = null;
  _$jscoverage['/tabs.js'].lineData[206]++;
  S.each(body.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[12]++;
  _$jscoverage['/tabs.js'].lineData[207]++;
  if (visit25_207_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[208]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[209]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[211]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[214]++;
  return child;
}, 
  getTabs: function() {
  _$jscoverage['/tabs.js'].functionData[13]++;
  _$jscoverage['/tabs.js'].lineData[222]++;
  return this.get('bar').get('children');
}, 
  getPanels: function() {
  _$jscoverage['/tabs.js'].functionData[14]++;
  _$jscoverage['/tabs.js'].lineData[230]++;
  return this.get('body').get('children');
}, 
  getTabAt: function(index) {
  _$jscoverage['/tabs.js'].functionData[15]++;
  _$jscoverage['/tabs.js'].lineData[237]++;
  return this.get('bar').get('children')[index];
}, 
  'getPanelAt': function(index) {
  _$jscoverage['/tabs.js'].functionData[16]++;
  _$jscoverage['/tabs.js'].lineData[244]++;
  return this.get('body').get('children')[index];
}, 
  setSelectedTab: function(tab) {
  _$jscoverage['/tabs.js'].functionData[17]++;
  _$jscoverage['/tabs.js'].lineData[253]++;
  var tabs = this, bar = tabs.get('bar'), body = tabs.get('body');
  _$jscoverage['/tabs.js'].lineData[256]++;
  bar.set('selectedTab', tab);
  _$jscoverage['/tabs.js'].lineData[257]++;
  body.set('selectedPanelIndex', S.indexOf(tab, bar.get('children')));
  _$jscoverage['/tabs.js'].lineData[258]++;
  return this;
}, 
  'setSelectedPanel': function(panel) {
  _$jscoverage['/tabs.js'].functionData[18]++;
  _$jscoverage['/tabs.js'].lineData[267]++;
  var tabs = this, bar = tabs.get('bar'), body = tabs.get('body'), selectedPanelIndex = S.indexOf(panel, body.get('children'));
  _$jscoverage['/tabs.js'].lineData[271]++;
  body.set('selectedPanelIndex', selectedPanelIndex);
  _$jscoverage['/tabs.js'].lineData[272]++;
  bar.set('selectedTab', tabs.getTabAt(selectedPanelIndex));
  _$jscoverage['/tabs.js'].lineData[273]++;
  return this;
}, 
  bindUI: function() {
  _$jscoverage['/tabs.js'].functionData[19]++;
  _$jscoverage['/tabs.js'].lineData[280]++;
  this.on('afterSelectedTabChange', function(e) {
  _$jscoverage['/tabs.js'].functionData[20]++;
  _$jscoverage['/tabs.js'].lineData[281]++;
  this.setSelectedTab(e.newVal);
});
}}, {
  ATTRS: {
  items: {}, 
  changeType: {}, 
  lazyRender: {
  value: false}, 
  handleMouseEvents: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  focusable: {
  value: false}, 
  bar: {
  getter: function() {
  _$jscoverage['/tabs.js'].functionData[21]++;
  _$jscoverage['/tabs.js'].lineData[349]++;
  return this.get('children')[BarIndexMap[this.get('barOrientation')]];
}}, 
  body: {
  getter: function() {
  _$jscoverage['/tabs.js'].functionData[22]++;
  _$jscoverage['/tabs.js'].lineData[354]++;
  return this.get('children')[1 - BarIndexMap[this.get('barOrientation')]];
}}, 
  barOrientation: {
  view: 1, 
  value: 'top'}, 
  xrender: {
  value: Render}}, 
  xclass: 'tabs'});
  _$jscoverage['/tabs.js'].lineData[379]++;
  Tabs.Orientation = {
  TOP: 'top', 
  BOTTOM: 'bottom', 
  LEFT: 'left', 
  RIGHT: 'right'};
  _$jscoverage['/tabs.js'].lineData[398]++;
  var BarIndexMap = {
  top: 0, 
  left: 0, 
  bottom: 1, 
  right: 0};
  _$jscoverage['/tabs.js'].lineData[405]++;
  Tabs.ChangeType = Bar.ChangeType;
  _$jscoverage['/tabs.js'].lineData[407]++;
  Tabs.Bar = Bar;
  _$jscoverage['/tabs.js'].lineData[408]++;
  Tabs.Body = Body;
  _$jscoverage['/tabs.js'].lineData[409]++;
  Tabs.Panel = Panel;
  _$jscoverage['/tabs.js'].lineData[411]++;
  return Tabs;
});
