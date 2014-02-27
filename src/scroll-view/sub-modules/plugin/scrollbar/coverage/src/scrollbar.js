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
  _$jscoverage['/scrollbar.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar.js'].lineData[18] = 0;
  _$jscoverage['/scrollbar.js'].lineData[19] = 0;
  _$jscoverage['/scrollbar.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar.js'].lineData[41] = 0;
  _$jscoverage['/scrollbar.js'].lineData[42] = 0;
  _$jscoverage['/scrollbar.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar.js'].lineData[45] = 0;
  _$jscoverage['/scrollbar.js'].lineData[47] = 0;
  _$jscoverage['/scrollbar.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar.js'].lineData[62] = 0;
  _$jscoverage['/scrollbar.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar.js'].lineData[67] = 0;
  _$jscoverage['/scrollbar.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar.js'].lineData[69] = 0;
  _$jscoverage['/scrollbar.js'].lineData[71] = 0;
  _$jscoverage['/scrollbar.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar.js'].lineData[73] = 0;
  _$jscoverage['/scrollbar.js'].lineData[75] = 0;
}
if (! _$jscoverage['/scrollbar.js'].functionData) {
  _$jscoverage['/scrollbar.js'].functionData = [];
  _$jscoverage['/scrollbar.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar.js'].functionData[3] = 0;
}
if (! _$jscoverage['/scrollbar.js'].branchData) {
  _$jscoverage['/scrollbar.js'].branchData = {};
  _$jscoverage['/scrollbar.js'].branchData['18'] = [];
  _$jscoverage['/scrollbar.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['25'] = [];
  _$jscoverage['/scrollbar.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['28'] = [];
  _$jscoverage['/scrollbar.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['34'] = [];
  _$jscoverage['/scrollbar.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['41'] = [];
  _$jscoverage['/scrollbar.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['44'] = [];
  _$jscoverage['/scrollbar.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['67'] = [];
  _$jscoverage['/scrollbar.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['71'] = [];
  _$jscoverage['/scrollbar.js'].branchData['71'][1] = new BranchData();
}
_$jscoverage['/scrollbar.js'].branchData['71'][1].init(178, 15, 'self.scrollBarY');
function visit34_71_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['67'][1].init(46, 15, 'self.scrollBarX');
function visit33_67_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['44'][1].init(326, 23, 'autoHideY !== undefined');
function visit32_44_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['41'][1].init(226, 23, 'minLength !== undefined');
function visit31_41_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['34'][1].init(780, 46, '!self.scrollBarY && scrollView.allowScroll.top');
function visit30_34_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['28'][1].init(326, 23, 'autoHideX !== undefined');
function visit29_28_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['25'][1].init(226, 23, 'minLength !== undefined');
function visit28_25_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['18'][1].init(239, 47, '!self.scrollBarX && scrollView.allowScroll.left');
function visit27_18_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar.js'].functionData[0]++;
  _$jscoverage['/scrollbar.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/scrollbar.js'].lineData[8]++;
  var ScrollBar = require('./scrollbar/control');
  _$jscoverage['/scrollbar.js'].lineData[10]++;
  function onScrollViewReflow() {
    _$jscoverage['/scrollbar.js'].functionData[1]++;
    _$jscoverage['/scrollbar.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/scrollbar.js'].lineData[12]++;
    var scrollView = self.scrollView;
    _$jscoverage['/scrollbar.js'].lineData[13]++;
    var minLength = self.get('minLength');
    _$jscoverage['/scrollbar.js'].lineData[14]++;
    var autoHideX = self.get('autoHideX');
    _$jscoverage['/scrollbar.js'].lineData[15]++;
    var autoHideY = self.get('autoHideY');
    _$jscoverage['/scrollbar.js'].lineData[16]++;
    var cfg;
    _$jscoverage['/scrollbar.js'].lineData[18]++;
    if (visit27_18_1(!self.scrollBarX && scrollView.allowScroll.left)) {
      _$jscoverage['/scrollbar.js'].lineData[19]++;
      cfg = {
  axis: 'x', 
  scrollView: scrollView, 
  elBefore: scrollView.$contentEl};
      _$jscoverage['/scrollbar.js'].lineData[25]++;
      if (visit28_25_1(minLength !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[26]++;
        cfg.minLength = minLength;
      }
      _$jscoverage['/scrollbar.js'].lineData[28]++;
      if (visit29_28_1(autoHideX !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[29]++;
        cfg.autoHide = autoHideX;
      }
      _$jscoverage['/scrollbar.js'].lineData[31]++;
      self.scrollBarX = new ScrollBar(cfg).render();
    }
    _$jscoverage['/scrollbar.js'].lineData[34]++;
    if (visit30_34_1(!self.scrollBarY && scrollView.allowScroll.top)) {
      _$jscoverage['/scrollbar.js'].lineData[35]++;
      cfg = {
  axis: 'y', 
  scrollView: scrollView, 
  elBefore: scrollView.$contentEl};
      _$jscoverage['/scrollbar.js'].lineData[41]++;
      if (visit31_41_1(minLength !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[42]++;
        cfg.minLength = minLength;
      }
      _$jscoverage['/scrollbar.js'].lineData[44]++;
      if (visit32_44_1(autoHideY !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[45]++;
        cfg.autoHide = autoHideY;
      }
      _$jscoverage['/scrollbar.js'].lineData[47]++;
      self.scrollBarY = new ScrollBar(cfg).render();
    }
  }
  _$jscoverage['/scrollbar.js'].lineData[56]++;
  return Base.extend({
  pluginId: this.getName(), 
  pluginBindUI: function(scrollView) {
  _$jscoverage['/scrollbar.js'].functionData[2]++;
  _$jscoverage['/scrollbar.js'].lineData[60]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[61]++;
  self.scrollView = scrollView;
  _$jscoverage['/scrollbar.js'].lineData[62]++;
  scrollView.on('reflow', onScrollViewReflow, self);
}, 
  pluginDestructor: function(scrollView) {
  _$jscoverage['/scrollbar.js'].functionData[3]++;
  _$jscoverage['/scrollbar.js'].lineData[66]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[67]++;
  if (visit33_67_1(self.scrollBarX)) {
    _$jscoverage['/scrollbar.js'].lineData[68]++;
    self.scrollBarX.destroy();
    _$jscoverage['/scrollbar.js'].lineData[69]++;
    self.scrollBarX = null;
  }
  _$jscoverage['/scrollbar.js'].lineData[71]++;
  if (visit34_71_1(self.scrollBarY)) {
    _$jscoverage['/scrollbar.js'].lineData[72]++;
    self.scrollBarY.destroy();
    _$jscoverage['/scrollbar.js'].lineData[73]++;
    self.scrollBarY = null;
  }
  _$jscoverage['/scrollbar.js'].lineData[75]++;
  scrollView.detach('reflow', onScrollViewReflow, self);
}}, {
  ATTRS: {
  minLength: {}, 
  autoHideX: {}, 
  autoHideY: {}}});
});
