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
  _$jscoverage['/scrollbar.js'].lineData[5] = 0;
  _$jscoverage['/scrollbar.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar.js'].lineData[10] = 0;
  _$jscoverage['/scrollbar.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar.js'].lineData[15] = 0;
  _$jscoverage['/scrollbar.js'].lineData[21] = 0;
  _$jscoverage['/scrollbar.js'].lineData[22] = 0;
  _$jscoverage['/scrollbar.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar.js'].lineData[37] = 0;
  _$jscoverage['/scrollbar.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar.js'].lineData[39] = 0;
  _$jscoverage['/scrollbar.js'].lineData[40] = 0;
  _$jscoverage['/scrollbar.js'].lineData[43] = 0;
  _$jscoverage['/scrollbar.js'].lineData[44] = 0;
  _$jscoverage['/scrollbar.js'].lineData[46] = 0;
  _$jscoverage['/scrollbar.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar.js'].lineData[58] = 0;
}
if (! _$jscoverage['/scrollbar.js'].functionData) {
  _$jscoverage['/scrollbar.js'].functionData = [];
  _$jscoverage['/scrollbar.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar.js'].functionData[2] = 0;
}
if (! _$jscoverage['/scrollbar.js'].branchData) {
  _$jscoverage['/scrollbar.js'].branchData = {};
  _$jscoverage['/scrollbar.js'].branchData['21'] = [];
  _$jscoverage['/scrollbar.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['25'] = [];
  _$jscoverage['/scrollbar.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['27'] = [];
  _$jscoverage['/scrollbar.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['31'] = [];
  _$jscoverage['/scrollbar.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['37'] = [];
  _$jscoverage['/scrollbar.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['39'] = [];
  _$jscoverage['/scrollbar.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['43'] = [];
  _$jscoverage['/scrollbar.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['52'] = [];
  _$jscoverage['/scrollbar.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/scrollbar.js'].branchData['56'] = [];
  _$jscoverage['/scrollbar.js'].branchData['56'][1] = new BranchData();
}
_$jscoverage['/scrollbar.js'].branchData['56'][1].init(184, 15, 'self.scrollBarY');
function visit32_56_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['52'][1].init(48, 15, 'self.scrollBarX');
function visit31_52_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['43'][1].init(97, 23, 'autoHideY !== undefined');
function visit30_43_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['39'][1].init(1075, 29, 'scrollView.allowScroll[\'top\']');
function visit29_39_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['37'][1].init(990, 15, 'self.scrollBarY');
function visit28_37_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['31'][1].init(97, 23, 'autoHideX !== undefined');
function visit27_31_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['27'][1].init(657, 30, 'scrollView.allowScroll[\'left\']');
function visit26_27_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['25'][1].init(572, 15, 'self.scrollBarX');
function visit25_25_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].branchData['21'][1].init(467, 23, 'minLength !== undefined');
function visit24_21_1(result) {
  _$jscoverage['/scrollbar.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar.js'].lineData[5]++;
KISSY.add('scroll-view/plugin/scrollbar', function(S, Base, ScrollBar) {
  _$jscoverage['/scrollbar.js'].functionData[0]++;
  _$jscoverage['/scrollbar.js'].lineData[6]++;
  return Base.extend({
  pluginId: this.getName(), 
  pluginSyncUI: function(scrollView) {
  _$jscoverage['/scrollbar.js'].functionData[1]++;
  _$jscoverage['/scrollbar.js'].lineData[10]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[11]++;
  var minLength = self.get('minLength');
  _$jscoverage['/scrollbar.js'].lineData[12]++;
  var autoHideX = self.get('autoHideX');
  _$jscoverage['/scrollbar.js'].lineData[13]++;
  var autoHideY = self.get('autoHideY');
  _$jscoverage['/scrollbar.js'].lineData[14]++;
  var my;
  _$jscoverage['/scrollbar.js'].lineData[15]++;
  var cfg = {
  scrollView: scrollView, 
  allowDrag: self.get('allowDrag'), 
  elBefore: scrollView.$contentEl};
  _$jscoverage['/scrollbar.js'].lineData[21]++;
  if (visit24_21_1(minLength !== undefined)) {
    _$jscoverage['/scrollbar.js'].lineData[22]++;
    cfg.minLength = minLength;
  }
  _$jscoverage['/scrollbar.js'].lineData[25]++;
  if (visit25_25_1(self.scrollBarX)) {
    _$jscoverage['/scrollbar.js'].lineData[26]++;
    self.scrollBarX.sync();
  } else {
    _$jscoverage['/scrollbar.js'].lineData[27]++;
    if (visit26_27_1(scrollView.allowScroll['left'])) {
      _$jscoverage['/scrollbar.js'].lineData[28]++;
      my = {
  axis: 'x'};
      _$jscoverage['/scrollbar.js'].lineData[31]++;
      if (visit27_31_1(autoHideX !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[32]++;
        cfg.autoHide = autoHideX;
      }
      _$jscoverage['/scrollbar.js'].lineData[34]++;
      self.scrollBarX = new ScrollBar(S.merge(cfg, my)).render();
    }
  }
  _$jscoverage['/scrollbar.js'].lineData[37]++;
  if (visit28_37_1(self.scrollBarY)) {
    _$jscoverage['/scrollbar.js'].lineData[38]++;
    self.scrollBarY.sync();
  } else {
    _$jscoverage['/scrollbar.js'].lineData[39]++;
    if (visit29_39_1(scrollView.allowScroll['top'])) {
      _$jscoverage['/scrollbar.js'].lineData[40]++;
      my = {
  axis: 'y'};
      _$jscoverage['/scrollbar.js'].lineData[43]++;
      if (visit30_43_1(autoHideY !== undefined)) {
        _$jscoverage['/scrollbar.js'].lineData[44]++;
        cfg.autoHide = autoHideY;
      }
      _$jscoverage['/scrollbar.js'].lineData[46]++;
      self.scrollBarY = new ScrollBar(S.merge(cfg, my)).render();
    }
  }
}, 
  pluginDestructor: function() {
  _$jscoverage['/scrollbar.js'].functionData[2]++;
  _$jscoverage['/scrollbar.js'].lineData[51]++;
  var self = this;
  _$jscoverage['/scrollbar.js'].lineData[52]++;
  if (visit31_52_1(self.scrollBarX)) {
    _$jscoverage['/scrollbar.js'].lineData[53]++;
    self.scrollBarX.destroy();
    _$jscoverage['/scrollbar.js'].lineData[54]++;
    self.scrollBarX = null;
  }
  _$jscoverage['/scrollbar.js'].lineData[56]++;
  if (visit32_56_1(self.scrollBarY)) {
    _$jscoverage['/scrollbar.js'].lineData[57]++;
    self.scrollBarY.destroy();
    _$jscoverage['/scrollbar.js'].lineData[58]++;
    self.scrollBarY = null;
  }
}});
}, {
  requires: ['base', './scrollbar/control']});
