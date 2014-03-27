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
  _$jscoverage['/tabs.js'].lineData[14] = 0;
  _$jscoverage['/tabs.js'].lineData[15] = 0;
  _$jscoverage['/tabs.js'].lineData[18] = 0;
  _$jscoverage['/tabs.js'].lineData[19] = 0;
  _$jscoverage['/tabs.js'].lineData[27] = 0;
  _$jscoverage['/tabs.js'].lineData[29] = 0;
  _$jscoverage['/tabs.js'].lineData[33] = 0;
  _$jscoverage['/tabs.js'].lineData[34] = 0;
  _$jscoverage['/tabs.js'].lineData[55] = 0;
  _$jscoverage['/tabs.js'].lineData[56] = 0;
  _$jscoverage['/tabs.js'].lineData[57] = 0;
  _$jscoverage['/tabs.js'].lineData[61] = 0;
  _$jscoverage['/tabs.js'].lineData[68] = 0;
  _$jscoverage['/tabs.js'].lineData[69] = 0;
  _$jscoverage['/tabs.js'].lineData[70] = 0;
  _$jscoverage['/tabs.js'].lineData[73] = 0;
  _$jscoverage['/tabs.js'].lineData[74] = 0;
  _$jscoverage['/tabs.js'].lineData[87] = 0;
  _$jscoverage['/tabs.js'].lineData[95] = 0;
  _$jscoverage['/tabs.js'].lineData[96] = 0;
  _$jscoverage['/tabs.js'].lineData[99] = 0;
  _$jscoverage['/tabs.js'].lineData[103] = 0;
  _$jscoverage['/tabs.js'].lineData[107] = 0;
  _$jscoverage['/tabs.js'].lineData[109] = 0;
  _$jscoverage['/tabs.js'].lineData[111] = 0;
  _$jscoverage['/tabs.js'].lineData[113] = 0;
  _$jscoverage['/tabs.js'].lineData[114] = 0;
  _$jscoverage['/tabs.js'].lineData[115] = 0;
  _$jscoverage['/tabs.js'].lineData[118] = 0;
  _$jscoverage['/tabs.js'].lineData[128] = 0;
  _$jscoverage['/tabs.js'].lineData[139] = 0;
  _$jscoverage['/tabs.js'].lineData[140] = 0;
  _$jscoverage['/tabs.js'].lineData[141] = 0;
  _$jscoverage['/tabs.js'].lineData[142] = 0;
  _$jscoverage['/tabs.js'].lineData[143] = 0;
  _$jscoverage['/tabs.js'].lineData[145] = 0;
  _$jscoverage['/tabs.js'].lineData[148] = 0;
  _$jscoverage['/tabs.js'].lineData[149] = 0;
  _$jscoverage['/tabs.js'].lineData[150] = 0;
  _$jscoverage['/tabs.js'].lineData[160] = 0;
  _$jscoverage['/tabs.js'].lineData[161] = 0;
  _$jscoverage['/tabs.js'].lineData[171] = 0;
  _$jscoverage['/tabs.js'].lineData[172] = 0;
  _$jscoverage['/tabs.js'].lineData[180] = 0;
  _$jscoverage['/tabs.js'].lineData[184] = 0;
  _$jscoverage['/tabs.js'].lineData[185] = 0;
  _$jscoverage['/tabs.js'].lineData[186] = 0;
  _$jscoverage['/tabs.js'].lineData[187] = 0;
  _$jscoverage['/tabs.js'].lineData[189] = 0;
  _$jscoverage['/tabs.js'].lineData[192] = 0;
  _$jscoverage['/tabs.js'].lineData[200] = 0;
  _$jscoverage['/tabs.js'].lineData[204] = 0;
  _$jscoverage['/tabs.js'].lineData[205] = 0;
  _$jscoverage['/tabs.js'].lineData[206] = 0;
  _$jscoverage['/tabs.js'].lineData[207] = 0;
  _$jscoverage['/tabs.js'].lineData[209] = 0;
  _$jscoverage['/tabs.js'].lineData[212] = 0;
  _$jscoverage['/tabs.js'].lineData[220] = 0;
  _$jscoverage['/tabs.js'].lineData[228] = 0;
  _$jscoverage['/tabs.js'].lineData[235] = 0;
  _$jscoverage['/tabs.js'].lineData[242] = 0;
  _$jscoverage['/tabs.js'].lineData[251] = 0;
  _$jscoverage['/tabs.js'].lineData[254] = 0;
  _$jscoverage['/tabs.js'].lineData[255] = 0;
  _$jscoverage['/tabs.js'].lineData[256] = 0;
  _$jscoverage['/tabs.js'].lineData[265] = 0;
  _$jscoverage['/tabs.js'].lineData[269] = 0;
  _$jscoverage['/tabs.js'].lineData[270] = 0;
  _$jscoverage['/tabs.js'].lineData[271] = 0;
  _$jscoverage['/tabs.js'].lineData[278] = 0;
  _$jscoverage['/tabs.js'].lineData[279] = 0;
  _$jscoverage['/tabs.js'].lineData[345] = 0;
  _$jscoverage['/tabs.js'].lineData[350] = 0;
  _$jscoverage['/tabs.js'].lineData[375] = 0;
  _$jscoverage['/tabs.js'].lineData[394] = 0;
  _$jscoverage['/tabs.js'].lineData[401] = 0;
  _$jscoverage['/tabs.js'].lineData[403] = 0;
  _$jscoverage['/tabs.js'].lineData[404] = 0;
  _$jscoverage['/tabs.js'].lineData[405] = 0;
  _$jscoverage['/tabs.js'].lineData[407] = 0;
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
  _$jscoverage['/tabs.js'].branchData['33'] = [];
  _$jscoverage['/tabs.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['56'] = [];
  _$jscoverage['/tabs.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['68'] = [];
  _$jscoverage['/tabs.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['95'] = [];
  _$jscoverage['/tabs.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['113'] = [];
  _$jscoverage['/tabs.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['139'] = [];
  _$jscoverage['/tabs.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['140'] = [];
  _$jscoverage['/tabs.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['142'] = [];
  _$jscoverage['/tabs.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['185'] = [];
  _$jscoverage['/tabs.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['205'] = [];
  _$jscoverage['/tabs.js'].branchData['205'][1] = new BranchData();
}
_$jscoverage['/tabs.js'].branchData['205'][1].init(21, 17, 'c.get(\'selected\')');
function visit25_205_1(result) {
  _$jscoverage['/tabs.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['185'][1].init(21, 17, 'c.get(\'selected\')');
function visit24_185_1(result) {
  _$jscoverage['/tabs.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['142'][1].init(121, 11, 'index === 0');
function visit23_142_1(result) {
  _$jscoverage['/tabs.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['140'][1].init(21, 18, 'barCs.length === 1');
function visit22_140_1(result) {
  _$jscoverage['/tabs.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['139'][1].init(406, 19, 'tab.get(\'selected\')');
function visit21_139_1(result) {
  _$jscoverage['/tabs.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['113'][1].init(658, 13, 'item.selected');
function visit20_113_1(result) {
  _$jscoverage['/tabs.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['95'][1].init(259, 28, 'typeof index === \'undefined\'');
function visit19_95_1(result) {
  _$jscoverage['/tabs.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['68'][1].init(1314, 31, '!selected && barChildren.length');
function visit18_68_1(result) {
  _$jscoverage['/tabs.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['56'][1].init(32, 25, 'selected || item.selected');
function visit17_56_1(result) {
  _$jscoverage['/tabs.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['33'][1].init(117, 5, 'items');
function visit16_33_1(result) {
  _$jscoverage['/tabs.js'].branchData['33'][1].ranCondition(result);
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
  _$jscoverage['/tabs.js'].lineData[14]++;
  function setBar(children, barOrientation, bar) {
    _$jscoverage['/tabs.js'].functionData[1]++;
    _$jscoverage['/tabs.js'].lineData[15]++;
    children[BarIndexMap[barOrientation]] = bar;
  }
  _$jscoverage['/tabs.js'].lineData[18]++;
  function setBody(children, barOrientation, body) {
    _$jscoverage['/tabs.js'].functionData[2]++;
    _$jscoverage['/tabs.js'].lineData[19]++;
    children[1 - BarIndexMap[barOrientation]] = body;
  }
  _$jscoverage['/tabs.js'].lineData[27]++;
  var Tabs = Container.extend({
  initializer: function() {
  _$jscoverage['/tabs.js'].functionData[3]++;
  _$jscoverage['/tabs.js'].lineData[29]++;
  var self = this, items = self.get('items');
  _$jscoverage['/tabs.js'].lineData[33]++;
  if (visit16_33_1(items)) {
    _$jscoverage['/tabs.js'].lineData[34]++;
    var children = self.get('children'), barOrientation = self.get('barOrientation'), selected, prefixCls = self.get('prefixCls'), tabItem, panelItem, bar = {
  prefixCls: prefixCls, 
  xclass: 'tabs-bar', 
  changeType: self.get('changeType'), 
  children: []}, body = {
  prefixCls: prefixCls, 
  xclass: 'tabs-body', 
  lazyRender: self.get('lazyRender'), 
  children: []}, barChildren = bar.children, panels = body.children;
    _$jscoverage['/tabs.js'].lineData[55]++;
    S.each(items, function(item) {
  _$jscoverage['/tabs.js'].functionData[4]++;
  _$jscoverage['/tabs.js'].lineData[56]++;
  selected = visit17_56_1(selected || item.selected);
  _$jscoverage['/tabs.js'].lineData[57]++;
  barChildren.push(tabItem = {
  content: item.title, 
  selected: item.selected});
  _$jscoverage['/tabs.js'].lineData[61]++;
  panels.push(panelItem = {
  content: item.content, 
  selected: item.selected});
});
    _$jscoverage['/tabs.js'].lineData[68]++;
    if (visit18_68_1(!selected && barChildren.length)) {
      _$jscoverage['/tabs.js'].lineData[69]++;
      barChildren[0].selected = true;
      _$jscoverage['/tabs.js'].lineData[70]++;
      panels[0].selected = true;
    }
    _$jscoverage['/tabs.js'].lineData[73]++;
    setBar(children, barOrientation, bar);
    _$jscoverage['/tabs.js'].lineData[74]++;
    setBody(children, barOrientation, body);
  }
}, 
  addItem: function(item, index) {
  _$jscoverage['/tabs.js'].functionData[5]++;
  _$jscoverage['/tabs.js'].lineData[87]++;
  var self = this, bar = self.get('bar'), selectedTab, tabItem, panelItem, barChildren = bar.get('children'), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[95]++;
  if (visit19_95_1(typeof index === 'undefined')) {
    _$jscoverage['/tabs.js'].lineData[96]++;
    index = barChildren.length;
  }
  _$jscoverage['/tabs.js'].lineData[99]++;
  tabItem = {
  content: item.title};
  _$jscoverage['/tabs.js'].lineData[103]++;
  panelItem = {
  content: item.content};
  _$jscoverage['/tabs.js'].lineData[107]++;
  bar.addChild(tabItem, index);
  _$jscoverage['/tabs.js'].lineData[109]++;
  selectedTab = barChildren[index];
  _$jscoverage['/tabs.js'].lineData[111]++;
  body.addChild(panelItem, index);
  _$jscoverage['/tabs.js'].lineData[113]++;
  if (visit20_113_1(item.selected)) {
    _$jscoverage['/tabs.js'].lineData[114]++;
    bar.set('selectedTab', selectedTab);
    _$jscoverage['/tabs.js'].lineData[115]++;
    body.set('selectedPanelIndex', index);
  }
  _$jscoverage['/tabs.js'].lineData[118]++;
  return self;
}, 
  removeItemAt: function(index, destroy) {
  _$jscoverage['/tabs.js'].functionData[6]++;
  _$jscoverage['/tabs.js'].lineData[128]++;
  var self = this, bar = self.get('bar'), barCs = bar.get('children'), tab = bar.getChildAt(index), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[139]++;
  if (visit21_139_1(tab.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[140]++;
    if (visit22_140_1(barCs.length === 1)) {
      _$jscoverage['/tabs.js'].lineData[141]++;
      bar.set('selectedTab', null);
    } else {
      _$jscoverage['/tabs.js'].lineData[142]++;
      if (visit23_142_1(index === 0)) {
        _$jscoverage['/tabs.js'].lineData[143]++;
        bar.set('selectedTab', bar.getChildAt(index + 1));
      } else {
        _$jscoverage['/tabs.js'].lineData[145]++;
        bar.set('selectedTab', bar.getChildAt(index - 1));
      }
    }
  }
  _$jscoverage['/tabs.js'].lineData[148]++;
  bar.removeChild(bar.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[149]++;
  body.removeChild(body.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[150]++;
  return self;
}, 
  removeItemByTab: function(tab, destroy) {
  _$jscoverage['/tabs.js'].functionData[7]++;
  _$jscoverage['/tabs.js'].lineData[160]++;
  var index = S.indexOf(tab, this.get('bar').get('children'));
  _$jscoverage['/tabs.js'].lineData[161]++;
  return this.removeItemAt(index, destroy);
}, 
  removeItemByPanel: function(panel, destroy) {
  _$jscoverage['/tabs.js'].functionData[8]++;
  _$jscoverage['/tabs.js'].lineData[171]++;
  var index = S.indexOf(panel, this.get('body').get('children'));
  _$jscoverage['/tabs.js'].lineData[172]++;
  return this.removeItemAt(index, destroy);
}, 
  getSelectedTab: function() {
  _$jscoverage['/tabs.js'].functionData[9]++;
  _$jscoverage['/tabs.js'].lineData[180]++;
  var self = this, bar = self.get('bar'), child = null;
  _$jscoverage['/tabs.js'].lineData[184]++;
  S.each(bar.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[10]++;
  _$jscoverage['/tabs.js'].lineData[185]++;
  if (visit24_185_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[186]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[187]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[189]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[192]++;
  return child;
}, 
  getSelectedPanel: function() {
  _$jscoverage['/tabs.js'].functionData[11]++;
  _$jscoverage['/tabs.js'].lineData[200]++;
  var self = this, body = self.get('body'), child = null;
  _$jscoverage['/tabs.js'].lineData[204]++;
  S.each(body.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[12]++;
  _$jscoverage['/tabs.js'].lineData[205]++;
  if (visit25_205_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[206]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[207]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[209]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[212]++;
  return child;
}, 
  getTabs: function() {
  _$jscoverage['/tabs.js'].functionData[13]++;
  _$jscoverage['/tabs.js'].lineData[220]++;
  return this.get('bar').get('children');
}, 
  getPanels: function() {
  _$jscoverage['/tabs.js'].functionData[14]++;
  _$jscoverage['/tabs.js'].lineData[228]++;
  return this.get('body').get('children');
}, 
  getTabAt: function(index) {
  _$jscoverage['/tabs.js'].functionData[15]++;
  _$jscoverage['/tabs.js'].lineData[235]++;
  return this.get('bar').get('children')[index];
}, 
  getPanelAt: function(index) {
  _$jscoverage['/tabs.js'].functionData[16]++;
  _$jscoverage['/tabs.js'].lineData[242]++;
  return this.get('body').get('children')[index];
}, 
  setSelectedTab: function(tab) {
  _$jscoverage['/tabs.js'].functionData[17]++;
  _$jscoverage['/tabs.js'].lineData[251]++;
  var self = this, bar = self.get('bar'), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[254]++;
  bar.set('selectedTab', tab);
  _$jscoverage['/tabs.js'].lineData[255]++;
  body.set('selectedPanelIndex', S.indexOf(tab, bar.get('children')));
  _$jscoverage['/tabs.js'].lineData[256]++;
  return this;
}, 
  setSelectedPanel: function(panel) {
  _$jscoverage['/tabs.js'].functionData[18]++;
  _$jscoverage['/tabs.js'].lineData[265]++;
  var self = this, bar = self.get('bar'), body = self.get('body'), selectedPanelIndex = S.indexOf(panel, body.get('children'));
  _$jscoverage['/tabs.js'].lineData[269]++;
  body.set('selectedPanelIndex', selectedPanelIndex);
  _$jscoverage['/tabs.js'].lineData[270]++;
  bar.set('selectedTab', self.getTabAt(selectedPanelIndex));
  _$jscoverage['/tabs.js'].lineData[271]++;
  return this;
}, 
  bindUI: function() {
  _$jscoverage['/tabs.js'].functionData[19]++;
  _$jscoverage['/tabs.js'].lineData[278]++;
  this.on('afterSelectedTabChange', function(e) {
  _$jscoverage['/tabs.js'].functionData[20]++;
  _$jscoverage['/tabs.js'].lineData[279]++;
  this.setSelectedTab(e.newVal);
});
}}, {
  ATTRS: {
  items: {}, 
  changeType: {}, 
  lazyRender: {
  value: false}, 
  handleGestureEvents: {
  value: false}, 
  allowTextSelection: {
  value: true}, 
  focusable: {
  value: false}, 
  bar: {
  getter: function() {
  _$jscoverage['/tabs.js'].functionData[21]++;
  _$jscoverage['/tabs.js'].lineData[345]++;
  return this.get('children')[BarIndexMap[this.get('barOrientation')]];
}}, 
  body: {
  getter: function() {
  _$jscoverage['/tabs.js'].functionData[22]++;
  _$jscoverage['/tabs.js'].lineData[350]++;
  return this.get('children')[1 - BarIndexMap[this.get('barOrientation')]];
}}, 
  barOrientation: {
  view: 1, 
  value: 'top'}, 
  xrender: {
  value: Render}}, 
  xclass: 'tabs'});
  _$jscoverage['/tabs.js'].lineData[375]++;
  Tabs.Orientation = {
  TOP: 'top', 
  BOTTOM: 'bottom', 
  LEFT: 'left', 
  RIGHT: 'right'};
  _$jscoverage['/tabs.js'].lineData[394]++;
  var BarIndexMap = {
  top: 0, 
  left: 0, 
  bottom: 1, 
  right: 0};
  _$jscoverage['/tabs.js'].lineData[401]++;
  Tabs.ChangeType = Bar.ChangeType;
  _$jscoverage['/tabs.js'].lineData[403]++;
  Tabs.Bar = Bar;
  _$jscoverage['/tabs.js'].lineData[404]++;
  Tabs.Body = Body;
  _$jscoverage['/tabs.js'].lineData[405]++;
  Tabs.Panel = Panel;
  _$jscoverage['/tabs.js'].lineData[407]++;
  return Tabs;
});
