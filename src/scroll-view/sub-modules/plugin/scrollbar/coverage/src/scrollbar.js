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
if (! _$jscoverage['/scrollbar.js']) {
  _$jscoverage['/scrollbar.js'] = {};
  _$jscoverage['/scrollbar.js'].lineData = [];
  _$jscoverage['/scrollbar.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar.js'].lineData[20] = 0;
  _$jscoverage['/scrollbar.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar.js'].lineData[64] = 0;
  _$jscoverage['/scrollbar.js'].lineData[65] = 0;
}
if (! _$jscoverage['/scrollbar.js'].functionData) {
  _$jscoverage['/scrollbar.js'].functionData = [];
  _$jscoverage['/scrollbar.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar.js'].functionData[2] = 0;
}
if (! _$jscoverage['/scrollbar.js'].branchData) {
  _$jscoverage['/scrollbar.js'].branchData = {};
  _$jscoverage['/scrollbar.js'].branchData['28'] = [];
  _$jscoverage['/scrollbar.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['32'] = [];
  _$jscoverage['/scrollbar.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['34'] = [];
  _$jscoverage['/scrollbar.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['38'] = [];
  _$jscoverage['/scrollbar.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['44'] = [];
  _$jscoverage['/scrollbar.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['46'] = [];
  _$jscoverage['/scrollbar.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['50'] = [];
  _$jscoverage['/scrollbar.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['59'] = [];
  _$jscoverage['/scrollbar.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['63'] = [];
  _$jscoverage['/scrollbar.js'].branchData['63'][1] = new BranchData();
}
_$jscoverage['/scrollbar.js'].branchData['63'][1].init(178, 15, 'self.scrollBarY');
function visit38_63_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['59'][1].init(46, 15, 'self.scrollBarX');
function visit37_59_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['50'][1].init(93, 23, 'autoHideY !== undefined');
function visit36_50_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['46'][1].init(992, 26, 'scrollView.allowScroll.top');
function visit35_46_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['44'][1].init(909, 15, 'self.scrollBarY');
function visit34_44_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['38'][1].init(93, 23, 'autoHideX !== undefined');
function visit33_38_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['34'][1].init(589, 27, 'scrollView.allowScroll.left');
function visit32_34_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['32'][1].init(506, 15, 'self.scrollBarX');
function visit31_32_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['28'][1].init(405, 23, 'minLength !== undefined');
function visit30_28_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar.js'].functionData[0]++;
  _$jscoverage['/scrollbar.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/scrollbar.js'].lineData[8]++;
  var ScrollBar = require('./scrollbar/control');
  _$jscoverage['/scrollbar.js'].lineData[14]++;
  return Base.extend({
  pluginId: this.getName(), 
  pluginSyncUI: function(scrollView) {
  _$jscoverage['/scrollbar.js'].functionData[1]++;
  _$jscoverage['/scrollbar.js'].lineData[18]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[19]++;
  var minLength = self.get('minLength');
  _$jscoverage['/scrollbar.js'].lineData[20]++;
  var autoHideX = self.get('autoHideX');
  _$jscoverage['/scrollbar.js'].lineData[21]++;
  var autoHideY = self.get('autoHideY');
  _$jscoverage['/scrollbar.js'].lineData[22]++;
  var my;
  _$jscoverage['/scrollbar.js'].lineData[23]++;
  var cfg = {
  scrollView: scrollView, 
  elBefore: scrollView.$contentEl};
  _$jscoverage['/scrollbar.js'].lineData[28]++;
  if (visit30_28_1(minLength !== undefined)) {
    _$jscoverage['/scrollbar.js'].lineData[29]++;
    cfg.minLength = minLength;
  }
  _$jscoverage['/scrollbar.js'].lineData[32]++;
  if (visit31_32_1(self.scrollBarX)) {
    _$jscoverage['/scrollbar.js'].lineData[33]++;
    self.scrollBarX.sync();
  } else {
    _$jscoverage['/scrollbar.js'].lineData[34]++;
    if (visit32_34_1(scrollView.allowScroll.left)) {
      _$jscoverage['/scrollbar.js'].lineData[35]++;
      my = {
  axis: 'x'};
      _$jscoverage['/scrollbar.js'].lineData[38]++;
      if (visit33_38_1(autoHideX !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[39]++;
        cfg.autoHide = autoHideX;
      }
      _$jscoverage['/scrollbar.js'].lineData[41]++;
      self.scrollBarX = new ScrollBar(S.merge(cfg, my)).render();
    }
  }
  _$jscoverage['/scrollbar.js'].lineData[44]++;
  if (visit34_44_1(self.scrollBarY)) {
    _$jscoverage['/scrollbar.js'].lineData[45]++;
    self.scrollBarY.sync();
  } else {
    _$jscoverage['/scrollbar.js'].lineData[46]++;
    if (visit35_46_1(scrollView.allowScroll.top)) {
      _$jscoverage['/scrollbar.js'].lineData[47]++;
      my = {
  axis: 'y'};
      _$jscoverage['/scrollbar.js'].lineData[50]++;
      if (visit36_50_1(autoHideY !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[51]++;
        cfg.autoHide = autoHideY;
      }
      _$jscoverage['/scrollbar.js'].lineData[53]++;
      self.scrollBarY = new ScrollBar(S.merge(cfg, my)).render();
    }
  }
}, 
  pluginDestructor: function() {
  _$jscoverage['/scrollbar.js'].functionData[2]++;
  _$jscoverage['/scrollbar.js'].lineData[58]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[59]++;
  if (visit37_59_1(self.scrollBarX)) {
    _$jscoverage['/scrollbar.js'].lineData[60]++;
    self.scrollBarX.destroy();
    _$jscoverage['/scrollbar.js'].lineData[61]++;
    self.scrollBarX = null;
  }
  _$jscoverage['/scrollbar.js'].lineData[63]++;
  if (visit38_63_1(self.scrollBarY)) {
    _$jscoverage['/scrollbar.js'].lineData[64]++;
    self.scrollBarY.destroy();
    _$jscoverage['/scrollbar.js'].lineData[65]++;
    self.scrollBarY = null;
  }
}}, {
  ATTRS: {
  minLength: {}, 
  autoHideX: {}, 
  autoHideY: {}}});
});
