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
if (! _$jscoverage['/tabs/body.js']) {
  _$jscoverage['/tabs/body.js'] = {};
  _$jscoverage['/tabs/body.js'].lineData = [];
  _$jscoverage['/tabs/body.js'].lineData[6] = 0;
  _$jscoverage['/tabs/body.js'].lineData[8] = 0;
  _$jscoverage['/tabs/body.js'].lineData[11] = 0;
  _$jscoverage['/tabs/body.js'].lineData[12] = 0;
  _$jscoverage['/tabs/body.js'].lineData[13] = 0;
  _$jscoverage['/tabs/body.js'].lineData[17] = 0;
  _$jscoverage['/tabs/body.js'].lineData[18] = 0;
  _$jscoverage['/tabs/body.js'].lineData[19] = 0;
  _$jscoverage['/tabs/body.js'].lineData[21] = 0;
  _$jscoverage['/tabs/body.js'].lineData[27] = 0;
  _$jscoverage['/tabs/body.js'].lineData[29] = 0;
  _$jscoverage['/tabs/body.js'].lineData[30] = 0;
  _$jscoverage['/tabs/body.js'].lineData[31] = 0;
  _$jscoverage['/tabs/body.js'].lineData[32] = 0;
  _$jscoverage['/tabs/body.js'].lineData[34] = 0;
  _$jscoverage['/tabs/body.js'].lineData[39] = 0;
  _$jscoverage['/tabs/body.js'].lineData[43] = 0;
  _$jscoverage['/tabs/body.js'].lineData[47] = 0;
  _$jscoverage['/tabs/body.js'].lineData[48] = 0;
  _$jscoverage['/tabs/body.js'].lineData[50] = 0;
  _$jscoverage['/tabs/body.js'].lineData[78] = 0;
  _$jscoverage['/tabs/body.js'].lineData[79] = 0;
  _$jscoverage['/tabs/body.js'].lineData[80] = 0;
  _$jscoverage['/tabs/body.js'].lineData[81] = 0;
  _$jscoverage['/tabs/body.js'].lineData[82] = 0;
  _$jscoverage['/tabs/body.js'].lineData[85] = 0;
  _$jscoverage['/tabs/body.js'].lineData[88] = 0;
}
if (! _$jscoverage['/tabs/body.js'].functionData) {
  _$jscoverage['/tabs/body.js'].functionData = [];
  _$jscoverage['/tabs/body.js'].functionData[0] = 0;
  _$jscoverage['/tabs/body.js'].functionData[1] = 0;
  _$jscoverage['/tabs/body.js'].functionData[2] = 0;
  _$jscoverage['/tabs/body.js'].functionData[3] = 0;
  _$jscoverage['/tabs/body.js'].functionData[4] = 0;
  _$jscoverage['/tabs/body.js'].functionData[5] = 0;
  _$jscoverage['/tabs/body.js'].functionData[6] = 0;
  _$jscoverage['/tabs/body.js'].functionData[7] = 0;
  _$jscoverage['/tabs/body.js'].functionData[8] = 0;
}
if (! _$jscoverage['/tabs/body.js'].branchData) {
  _$jscoverage['/tabs/body.js'].branchData = {};
  _$jscoverage['/tabs/body.js'].branchData['17'] = [];
  _$jscoverage['/tabs/body.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/tabs/body.js'].branchData['18'] = [];
  _$jscoverage['/tabs/body.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/tabs/body.js'].branchData['30'] = [];
  _$jscoverage['/tabs/body.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/tabs/body.js'].branchData['48'] = [];
  _$jscoverage['/tabs/body.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/tabs/body.js'].branchData['79'] = [];
  _$jscoverage['/tabs/body.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/tabs/body.js'].branchData['81'] = [];
  _$jscoverage['/tabs/body.js'].branchData['81'][1] = new BranchData();
}
_$jscoverage['/tabs/body.js'].branchData['81'][1].init(68, 18, '!c.get(\'selected\')');
function visit12_81_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].branchData['79'][1].init(14, 22, 'self.get(\'lazyRender\')');
function visit11_79_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].branchData['48'][1].init(85, 22, 'this.get(\'lazyRender\')');
function visit10_48_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].branchData['30'][1].init(22, 17, 'c.get("selected")');
function visit9_30_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].branchData['18'][1].init(26, 31, 'hidePanel = children[e.prevVal]');
function visit8_18_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].branchData['17'][1].init(182, 18, 'children[newIndex]');
function visit7_17_1(result) {
  _$jscoverage['/tabs/body.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/tabs/body.js'].lineData[6]++;
KISSY.add("tabs/body", function(S, Container, Extension, undefined) {
  _$jscoverage['/tabs/body.js'].functionData[0]++;
  _$jscoverage['/tabs/body.js'].lineData[8]++;
  var TabBody = Container.extend({
  bindUI: function() {
  _$jscoverage['/tabs/body.js'].functionData[1]++;
  _$jscoverage['/tabs/body.js'].lineData[11]++;
  var self = this;
  _$jscoverage['/tabs/body.js'].lineData[12]++;
  self.on("afterSelectedPanelIndexChange", function(e) {
  _$jscoverage['/tabs/body.js'].functionData[2]++;
  _$jscoverage['/tabs/body.js'].lineData[13]++;
  var showPanel, children = self.get('children'), newIndex = e.newVal, hidePanel;
  _$jscoverage['/tabs/body.js'].lineData[17]++;
  if (visit7_17_1(children[newIndex])) {
    _$jscoverage['/tabs/body.js'].lineData[18]++;
    if (visit8_18_1(hidePanel = children[e.prevVal])) {
      _$jscoverage['/tabs/body.js'].lineData[19]++;
      hidePanel.set("selected", false);
    }
    _$jscoverage['/tabs/body.js'].lineData[21]++;
    self.selectPanelByIndex(newIndex);
  }
});
}, 
  syncUI: function() {
  _$jscoverage['/tabs/body.js'].functionData[3]++;
  _$jscoverage['/tabs/body.js'].lineData[27]++;
  var self = this, children = self.get("children");
  _$jscoverage['/tabs/body.js'].lineData[29]++;
  S.each(children, function(c, i) {
  _$jscoverage['/tabs/body.js'].functionData[4]++;
  _$jscoverage['/tabs/body.js'].lineData[30]++;
  if (visit9_30_1(c.get("selected"))) {
    _$jscoverage['/tabs/body.js'].lineData[31]++;
    self.set("selectedPanelIndex", i);
    _$jscoverage['/tabs/body.js'].lineData[32]++;
    return false;
  }
  _$jscoverage['/tabs/body.js'].lineData[34]++;
  return undefined;
});
}, 
  createChild: function(index) {
  _$jscoverage['/tabs/body.js'].functionData[5]++;
  _$jscoverage['/tabs/body.js'].lineData[39]++;
  return checkLazy(this, 'createChild', index);
}, 
  renderChild: function(index) {
  _$jscoverage['/tabs/body.js'].functionData[6]++;
  _$jscoverage['/tabs/body.js'].lineData[43]++;
  return checkLazy(this, 'renderChild', index);
}, 
  selectPanelByIndex: function(newIndex) {
  _$jscoverage['/tabs/body.js'].functionData[7]++;
  _$jscoverage['/tabs/body.js'].lineData[47]++;
  this.get('children')[newIndex].set("selected", true);
  _$jscoverage['/tabs/body.js'].lineData[48]++;
  if (visit10_48_1(this.get('lazyRender'))) {
    _$jscoverage['/tabs/body.js'].lineData[50]++;
    this.renderChild(newIndex);
  }
}}, {
  ATTRS: {
  selectedPanelIndex: {}, 
  allowTextSelection: {
  value: true}, 
  focusable: {
  value: false}, 
  lazyRender: {}, 
  handleMouseEvents: {
  value: false}, 
  defaultChildCfg: {
  value: {
  xclass: 'tabs-panel'}}}, 
  xclass: 'tabs-body'});
  _$jscoverage['/tabs/body.js'].lineData[78]++;
  function checkLazy(self, method, index) {
    _$jscoverage['/tabs/body.js'].functionData[8]++;
    _$jscoverage['/tabs/body.js'].lineData[79]++;
    if (visit11_79_1(self.get('lazyRender'))) {
      _$jscoverage['/tabs/body.js'].lineData[80]++;
      var c = self.get('children')[index];
      _$jscoverage['/tabs/body.js'].lineData[81]++;
      if (visit12_81_1(!c.get('selected'))) {
        _$jscoverage['/tabs/body.js'].lineData[82]++;
        return c;
      }
    }
    _$jscoverage['/tabs/body.js'].lineData[85]++;
    return TabBody.superclass[method].call(self, index);
  }
  _$jscoverage['/tabs/body.js'].lineData[88]++;
  return TabBody;
}, {
  requires: ['component/container']});
