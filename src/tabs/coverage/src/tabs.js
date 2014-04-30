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
  _$jscoverage['/tabs.js'].lineData[22] = 0;
  _$jscoverage['/tabs.js'].lineData[23] = 0;
  _$jscoverage['/tabs.js'].lineData[26] = 0;
  _$jscoverage['/tabs.js'].lineData[27] = 0;
  _$jscoverage['/tabs.js'].lineData[30] = 0;
  _$jscoverage['/tabs.js'].lineData[31] = 0;
  _$jscoverage['/tabs.js'].lineData[32] = 0;
  _$jscoverage['/tabs.js'].lineData[33] = 0;
  _$jscoverage['/tabs.js'].lineData[34] = 0;
  _$jscoverage['/tabs.js'].lineData[35] = 0;
  _$jscoverage['/tabs.js'].lineData[43] = 0;
  _$jscoverage['/tabs.js'].lineData[45] = 0;
  _$jscoverage['/tabs.js'].lineData[49] = 0;
  _$jscoverage['/tabs.js'].lineData[50] = 0;
  _$jscoverage['/tabs.js'].lineData[71] = 0;
  _$jscoverage['/tabs.js'].lineData[72] = 0;
  _$jscoverage['/tabs.js'].lineData[73] = 0;
  _$jscoverage['/tabs.js'].lineData[74] = 0;
  _$jscoverage['/tabs.js'].lineData[80] = 0;
  _$jscoverage['/tabs.js'].lineData[81] = 0;
  _$jscoverage['/tabs.js'].lineData[82] = 0;
  _$jscoverage['/tabs.js'].lineData[85] = 0;
  _$jscoverage['/tabs.js'].lineData[86] = 0;
  _$jscoverage['/tabs.js'].lineData[92] = 0;
  _$jscoverage['/tabs.js'].lineData[96] = 0;
  _$jscoverage['/tabs.js'].lineData[100] = 0;
  _$jscoverage['/tabs.js'].lineData[101] = 0;
  _$jscoverage['/tabs.js'].lineData[130] = 0;
  _$jscoverage['/tabs.js'].lineData[138] = 0;
  _$jscoverage['/tabs.js'].lineData[139] = 0;
  _$jscoverage['/tabs.js'].lineData[142] = 0;
  _$jscoverage['/tabs.js'].lineData[144] = 0;
  _$jscoverage['/tabs.js'].lineData[148] = 0;
  _$jscoverage['/tabs.js'].lineData[150] = 0;
  _$jscoverage['/tabs.js'].lineData[152] = 0;
  _$jscoverage['/tabs.js'].lineData[154] = 0;
  _$jscoverage['/tabs.js'].lineData[155] = 0;
  _$jscoverage['/tabs.js'].lineData[156] = 0;
  _$jscoverage['/tabs.js'].lineData[159] = 0;
  _$jscoverage['/tabs.js'].lineData[169] = 0;
  _$jscoverage['/tabs.js'].lineData[180] = 0;
  _$jscoverage['/tabs.js'].lineData[181] = 0;
  _$jscoverage['/tabs.js'].lineData[182] = 0;
  _$jscoverage['/tabs.js'].lineData[183] = 0;
  _$jscoverage['/tabs.js'].lineData[184] = 0;
  _$jscoverage['/tabs.js'].lineData[186] = 0;
  _$jscoverage['/tabs.js'].lineData[189] = 0;
  _$jscoverage['/tabs.js'].lineData[190] = 0;
  _$jscoverage['/tabs.js'].lineData[191] = 0;
  _$jscoverage['/tabs.js'].lineData[201] = 0;
  _$jscoverage['/tabs.js'].lineData[202] = 0;
  _$jscoverage['/tabs.js'].lineData[212] = 0;
  _$jscoverage['/tabs.js'].lineData[213] = 0;
  _$jscoverage['/tabs.js'].lineData[221] = 0;
  _$jscoverage['/tabs.js'].lineData[225] = 0;
  _$jscoverage['/tabs.js'].lineData[226] = 0;
  _$jscoverage['/tabs.js'].lineData[227] = 0;
  _$jscoverage['/tabs.js'].lineData[228] = 0;
  _$jscoverage['/tabs.js'].lineData[230] = 0;
  _$jscoverage['/tabs.js'].lineData[233] = 0;
  _$jscoverage['/tabs.js'].lineData[241] = 0;
  _$jscoverage['/tabs.js'].lineData[245] = 0;
  _$jscoverage['/tabs.js'].lineData[246] = 0;
  _$jscoverage['/tabs.js'].lineData[247] = 0;
  _$jscoverage['/tabs.js'].lineData[248] = 0;
  _$jscoverage['/tabs.js'].lineData[250] = 0;
  _$jscoverage['/tabs.js'].lineData[253] = 0;
  _$jscoverage['/tabs.js'].lineData[261] = 0;
  _$jscoverage['/tabs.js'].lineData[269] = 0;
  _$jscoverage['/tabs.js'].lineData[276] = 0;
  _$jscoverage['/tabs.js'].lineData[283] = 0;
  _$jscoverage['/tabs.js'].lineData[292] = 0;
  _$jscoverage['/tabs.js'].lineData[295] = 0;
  _$jscoverage['/tabs.js'].lineData[296] = 0;
  _$jscoverage['/tabs.js'].lineData[297] = 0;
  _$jscoverage['/tabs.js'].lineData[306] = 0;
  _$jscoverage['/tabs.js'].lineData[310] = 0;
  _$jscoverage['/tabs.js'].lineData[311] = 0;
  _$jscoverage['/tabs.js'].lineData[312] = 0;
  _$jscoverage['/tabs.js'].lineData[316] = 0;
  _$jscoverage['/tabs.js'].lineData[319] = 0;
  _$jscoverage['/tabs.js'].lineData[368] = 0;
  _$jscoverage['/tabs.js'].lineData[373] = 0;
  _$jscoverage['/tabs.js'].lineData[387] = 0;
  _$jscoverage['/tabs.js'].lineData[388] = 0;
  _$jscoverage['/tabs.js'].lineData[399] = 0;
  _$jscoverage['/tabs.js'].lineData[418] = 0;
  _$jscoverage['/tabs.js'].lineData[425] = 0;
  _$jscoverage['/tabs.js'].lineData[427] = 0;
  _$jscoverage['/tabs.js'].lineData[428] = 0;
  _$jscoverage['/tabs.js'].lineData[429] = 0;
  _$jscoverage['/tabs.js'].lineData[431] = 0;
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
  _$jscoverage['/tabs.js'].functionData[23] = 0;
  _$jscoverage['/tabs.js'].functionData[24] = 0;
  _$jscoverage['/tabs.js'].functionData[25] = 0;
  _$jscoverage['/tabs.js'].functionData[26] = 0;
  _$jscoverage['/tabs.js'].functionData[27] = 0;
  _$jscoverage['/tabs.js'].functionData[28] = 0;
}
if (! _$jscoverage['/tabs.js'].branchData) {
  _$jscoverage['/tabs.js'].branchData = {};
  _$jscoverage['/tabs.js'].branchData['49'] = [];
  _$jscoverage['/tabs.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['72'] = [];
  _$jscoverage['/tabs.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['80'] = [];
  _$jscoverage['/tabs.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['138'] = [];
  _$jscoverage['/tabs.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['154'] = [];
  _$jscoverage['/tabs.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['180'] = [];
  _$jscoverage['/tabs.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['181'] = [];
  _$jscoverage['/tabs.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['183'] = [];
  _$jscoverage['/tabs.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['226'] = [];
  _$jscoverage['/tabs.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['246'] = [];
  _$jscoverage['/tabs.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['388'] = [];
  _$jscoverage['/tabs.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/tabs.js'].branchData['388'][2] = new BranchData();
}
_$jscoverage['/tabs.js'].branchData['388'][2].init(120, 29, 'orientation && orientation[1]');
function visit31_388_2(result) {
  _$jscoverage['/tabs.js'].branchData['388'][2].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['388'][1].init(120, 42, 'orientation && orientation[1] || undefined');
function visit30_388_1(result) {
  _$jscoverage['/tabs.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['246'][1].init(22, 17, 'c.get(\'selected\')');
function visit29_246_1(result) {
  _$jscoverage['/tabs.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['226'][1].init(22, 17, 'c.get(\'selected\')');
function visit28_226_1(result) {
  _$jscoverage['/tabs.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['183'][1].init(124, 11, 'index === 0');
function visit27_183_1(result) {
  _$jscoverage['/tabs.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['181'][1].init(22, 18, 'barCs.length === 1');
function visit26_181_1(result) {
  _$jscoverage['/tabs.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['180'][1].init(418, 19, 'tab.get(\'selected\')');
function visit25_180_1(result) {
  _$jscoverage['/tabs.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['154'][1].init(666, 13, 'item.selected');
function visit24_154_1(result) {
  _$jscoverage['/tabs.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['138'][1].init(268, 28, 'typeof index === \'undefined\'');
function visit23_138_1(result) {
  _$jscoverage['/tabs.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['80'][1].init(1262, 31, '!selected && barChildren.length');
function visit22_80_1(result) {
  _$jscoverage['/tabs.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['72'][1].init(33, 25, 'selected || item.selected');
function visit21_72_1(result) {
  _$jscoverage['/tabs.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs.js'].branchData['49'][1].init(122, 5, 'items');
function visit20_49_1(result) {
  _$jscoverage['/tabs.js'].branchData['49'][1].ranCondition(result);
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
  var CLS = 'top bottom left right';
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
  _$jscoverage['/tabs.js'].lineData[22]++;
  function afterTabClose(e) {
    _$jscoverage['/tabs.js'].functionData[3]++;
    _$jscoverage['/tabs.js'].lineData[23]++;
    this.removeItemByTab(e.target);
  }
  _$jscoverage['/tabs.js'].lineData[26]++;
  function afterSelectedTabChange(e) {
    _$jscoverage['/tabs.js'].functionData[4]++;
    _$jscoverage['/tabs.js'].lineData[27]++;
    this.setSelectedTab(e.newVal);
  }
  _$jscoverage['/tabs.js'].lineData[30]++;
  function fromTabItemConfigToTabConfig(item) {
    _$jscoverage['/tabs.js'].functionData[5]++;
    _$jscoverage['/tabs.js'].lineData[31]++;
    var ret = {};
    _$jscoverage['/tabs.js'].lineData[32]++;
    ret.content = item.title;
    _$jscoverage['/tabs.js'].lineData[33]++;
    ret.selected = item.selected;
    _$jscoverage['/tabs.js'].lineData[34]++;
    ret.closable = item.closable;
    _$jscoverage['/tabs.js'].lineData[35]++;
    return ret;
  }
  _$jscoverage['/tabs.js'].lineData[43]++;
  var Tabs = Container.extend({
  initializer: function() {
  _$jscoverage['/tabs.js'].functionData[6]++;
  _$jscoverage['/tabs.js'].lineData[45]++;
  var self = this, items = self.get('items');
  _$jscoverage['/tabs.js'].lineData[49]++;
  if (visit20_49_1(items)) {
    _$jscoverage['/tabs.js'].lineData[50]++;
    var children = self.get('children'), barOrientation = self.get('barOrientation'), selected, prefixCls = self.get('prefixCls'), tabItem, panelItem, bar = {
  prefixCls: prefixCls, 
  xclass: 'tabs-bar', 
  changeType: self.get('changeType'), 
  children: []}, body = {
  prefixCls: prefixCls, 
  xclass: 'tabs-body', 
  lazyRender: self.get('lazyRender'), 
  children: []}, barChildren = bar.children, panels = body.children;
    _$jscoverage['/tabs.js'].lineData[71]++;
    S.each(items, function(item) {
  _$jscoverage['/tabs.js'].functionData[7]++;
  _$jscoverage['/tabs.js'].lineData[72]++;
  selected = visit21_72_1(selected || item.selected);
  _$jscoverage['/tabs.js'].lineData[73]++;
  barChildren.push(tabItem = fromTabItemConfigToTabConfig(item));
  _$jscoverage['/tabs.js'].lineData[74]++;
  panels.push(panelItem = {
  content: item.content, 
  selected: item.selected});
});
    _$jscoverage['/tabs.js'].lineData[80]++;
    if (visit22_80_1(!selected && barChildren.length)) {
      _$jscoverage['/tabs.js'].lineData[81]++;
      barChildren[0].selected = true;
      _$jscoverage['/tabs.js'].lineData[82]++;
      panels[0].selected = true;
    }
    _$jscoverage['/tabs.js'].lineData[85]++;
    setBar(children, barOrientation, bar);
    _$jscoverage['/tabs.js'].lineData[86]++;
    setBody(children, barOrientation, body);
  }
}, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/tabs.js'].functionData[8]++;
  _$jscoverage['/tabs.js'].lineData[92]++;
  renderData.elCls.push(this.getBaseCssClass(this.get('barOrientation')));
}, 
  decorateDom: function() {
  _$jscoverage['/tabs.js'].functionData[9]++;
  _$jscoverage['/tabs.js'].lineData[96]++;
  this.get('bar').set('changeType', this.get('changeType'));
}, 
  bindUI: function() {
  _$jscoverage['/tabs.js'].functionData[10]++;
  _$jscoverage['/tabs.js'].lineData[100]++;
  this.on('afterSelectedTabChange', afterSelectedTabChange);
  _$jscoverage['/tabs.js'].lineData[101]++;
  this.on('afterTabClose', afterTabClose);
}, 
  addItem: function(item, index) {
  _$jscoverage['/tabs.js'].functionData[11]++;
  _$jscoverage['/tabs.js'].lineData[130]++;
  var self = this, bar = self.get('bar'), selectedTab, tabItem, panelItem, barChildren = bar.get('children'), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[138]++;
  if (visit23_138_1(typeof index === 'undefined')) {
    _$jscoverage['/tabs.js'].lineData[139]++;
    index = barChildren.length;
  }
  _$jscoverage['/tabs.js'].lineData[142]++;
  tabItem = fromTabItemConfigToTabConfig(item);
  _$jscoverage['/tabs.js'].lineData[144]++;
  panelItem = {
  content: item.content};
  _$jscoverage['/tabs.js'].lineData[148]++;
  bar.addChild(tabItem, index);
  _$jscoverage['/tabs.js'].lineData[150]++;
  selectedTab = barChildren[index];
  _$jscoverage['/tabs.js'].lineData[152]++;
  body.addChild(panelItem, index);
  _$jscoverage['/tabs.js'].lineData[154]++;
  if (visit24_154_1(item.selected)) {
    _$jscoverage['/tabs.js'].lineData[155]++;
    bar.set('selectedTab', selectedTab);
    _$jscoverage['/tabs.js'].lineData[156]++;
    body.set('selectedPanelIndex', index);
  }
  _$jscoverage['/tabs.js'].lineData[159]++;
  return self;
}, 
  removeItemAt: function(index, destroy) {
  _$jscoverage['/tabs.js'].functionData[12]++;
  _$jscoverage['/tabs.js'].lineData[169]++;
  var self = this, bar = self.get('bar'), barCs = bar.get('children'), tab = bar.getChildAt(index), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[180]++;
  if (visit25_180_1(tab.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[181]++;
    if (visit26_181_1(barCs.length === 1)) {
      _$jscoverage['/tabs.js'].lineData[182]++;
      bar.set('selectedTab', null);
    } else {
      _$jscoverage['/tabs.js'].lineData[183]++;
      if (visit27_183_1(index === 0)) {
        _$jscoverage['/tabs.js'].lineData[184]++;
        bar.set('selectedTab', bar.getChildAt(index + 1));
      } else {
        _$jscoverage['/tabs.js'].lineData[186]++;
        bar.set('selectedTab', bar.getChildAt(index - 1));
      }
    }
  }
  _$jscoverage['/tabs.js'].lineData[189]++;
  bar.removeChild(bar.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[190]++;
  body.removeChild(body.getChildAt(index), destroy);
  _$jscoverage['/tabs.js'].lineData[191]++;
  return self;
}, 
  removeItemByTab: function(tab, destroy) {
  _$jscoverage['/tabs.js'].functionData[13]++;
  _$jscoverage['/tabs.js'].lineData[201]++;
  var index = S.indexOf(tab, this.get('bar').get('children'));
  _$jscoverage['/tabs.js'].lineData[202]++;
  return this.removeItemAt(index, destroy);
}, 
  removeItemByPanel: function(panel, destroy) {
  _$jscoverage['/tabs.js'].functionData[14]++;
  _$jscoverage['/tabs.js'].lineData[212]++;
  var index = S.indexOf(panel, this.get('body').get('children'));
  _$jscoverage['/tabs.js'].lineData[213]++;
  return this.removeItemAt(index, destroy);
}, 
  getSelectedTab: function() {
  _$jscoverage['/tabs.js'].functionData[15]++;
  _$jscoverage['/tabs.js'].lineData[221]++;
  var self = this, bar = self.get('bar'), child = null;
  _$jscoverage['/tabs.js'].lineData[225]++;
  S.each(bar.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[16]++;
  _$jscoverage['/tabs.js'].lineData[226]++;
  if (visit28_226_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[227]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[228]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[230]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[233]++;
  return child;
}, 
  getSelectedPanel: function() {
  _$jscoverage['/tabs.js'].functionData[17]++;
  _$jscoverage['/tabs.js'].lineData[241]++;
  var self = this, body = self.get('body'), child = null;
  _$jscoverage['/tabs.js'].lineData[245]++;
  S.each(body.get('children'), function(c) {
  _$jscoverage['/tabs.js'].functionData[18]++;
  _$jscoverage['/tabs.js'].lineData[246]++;
  if (visit29_246_1(c.get('selected'))) {
    _$jscoverage['/tabs.js'].lineData[247]++;
    child = c;
    _$jscoverage['/tabs.js'].lineData[248]++;
    return false;
  }
  _$jscoverage['/tabs.js'].lineData[250]++;
  return undefined;
});
  _$jscoverage['/tabs.js'].lineData[253]++;
  return child;
}, 
  getTabs: function() {
  _$jscoverage['/tabs.js'].functionData[19]++;
  _$jscoverage['/tabs.js'].lineData[261]++;
  return this.get('bar').get('children');
}, 
  getPanels: function() {
  _$jscoverage['/tabs.js'].functionData[20]++;
  _$jscoverage['/tabs.js'].lineData[269]++;
  return this.get('body').get('children');
}, 
  getTabAt: function(index) {
  _$jscoverage['/tabs.js'].functionData[21]++;
  _$jscoverage['/tabs.js'].lineData[276]++;
  return this.get('bar').get('children')[index];
}, 
  getPanelAt: function(index) {
  _$jscoverage['/tabs.js'].functionData[22]++;
  _$jscoverage['/tabs.js'].lineData[283]++;
  return this.get('body').get('children')[index];
}, 
  setSelectedTab: function(tab) {
  _$jscoverage['/tabs.js'].functionData[23]++;
  _$jscoverage['/tabs.js'].lineData[292]++;
  var self = this, bar = self.get('bar'), body = self.get('body');
  _$jscoverage['/tabs.js'].lineData[295]++;
  bar.set('selectedTab', tab);
  _$jscoverage['/tabs.js'].lineData[296]++;
  body.set('selectedPanelIndex', S.indexOf(tab, bar.get('children')));
  _$jscoverage['/tabs.js'].lineData[297]++;
  return this;
}, 
  setSelectedPanel: function(panel) {
  _$jscoverage['/tabs.js'].functionData[24]++;
  _$jscoverage['/tabs.js'].lineData[306]++;
  var self = this, bar = self.get('bar'), body = self.get('body'), selectedPanelIndex = S.indexOf(panel, body.get('children'));
  _$jscoverage['/tabs.js'].lineData[310]++;
  body.set('selectedPanelIndex', selectedPanelIndex);
  _$jscoverage['/tabs.js'].lineData[311]++;
  bar.set('selectedTab', self.getTabAt(selectedPanelIndex));
  _$jscoverage['/tabs.js'].lineData[312]++;
  return this;
}, 
  _onSetBarOrientation: function(v) {
  _$jscoverage['/tabs.js'].functionData[25]++;
  _$jscoverage['/tabs.js'].lineData[316]++;
  var self = this, el = self.$el;
  _$jscoverage['/tabs.js'].lineData[319]++;
  el.removeClass(self.getBaseCssClass(CLS)).addClass(self.getBaseCssClass(v));
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
  _$jscoverage['/tabs.js'].functionData[26]++;
  _$jscoverage['/tabs.js'].lineData[368]++;
  return this.get('children')[BarIndexMap[this.get('barOrientation')]];
}}, 
  body: {
  getter: function() {
  _$jscoverage['/tabs.js'].functionData[27]++;
  _$jscoverage['/tabs.js'].lineData[373]++;
  return this.get('children')[1 - BarIndexMap[this.get('barOrientation')]];
}}, 
  barOrientation: {
  render: 1, 
  sync: 0, 
  value: 'top', 
  parse: function(el) {
  _$jscoverage['/tabs.js'].functionData[28]++;
  _$jscoverage['/tabs.js'].lineData[387]++;
  var orientation = el[0].className.match(/(top|bottom|left|right)\b/);
  _$jscoverage['/tabs.js'].lineData[388]++;
  return visit30_388_1(visit31_388_2(orientation && orientation[1]) || undefined);
}}}, 
  xclass: 'tabs'});
  _$jscoverage['/tabs.js'].lineData[399]++;
  Tabs.Orientation = {
  TOP: 'top', 
  BOTTOM: 'bottom', 
  LEFT: 'left', 
  RIGHT: 'right'};
  _$jscoverage['/tabs.js'].lineData[418]++;
  var BarIndexMap = {
  top: 0, 
  left: 0, 
  bottom: 1, 
  right: 0};
  _$jscoverage['/tabs.js'].lineData[425]++;
  Tabs.ChangeType = Bar.ChangeType;
  _$jscoverage['/tabs.js'].lineData[427]++;
  Tabs.Bar = Bar;
  _$jscoverage['/tabs.js'].lineData[428]++;
  Tabs.Body = Body;
  _$jscoverage['/tabs.js'].lineData[429]++;
  Tabs.Panel = Panel;
  _$jscoverage['/tabs.js'].lineData[431]++;
  return Tabs;
});
