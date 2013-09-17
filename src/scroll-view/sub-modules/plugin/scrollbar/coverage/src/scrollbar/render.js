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
if (! _$jscoverage['/scrollbar/render.js']) {
  _$jscoverage['/scrollbar/render.js'] = {};
  _$jscoverage['/scrollbar/render.js'].lineData = [];
  _$jscoverage['/scrollbar/render.js'].lineData[6] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[11] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[13] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[23] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[24] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[25] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[35] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[48] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[51] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[55] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[66] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[81] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[82] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[83] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[87] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[88] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[91] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[92] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[93] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[98] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[102] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[106] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[110] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[114] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[116] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[118] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[119] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[122] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[123] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[128] = 0;
}
if (! _$jscoverage['/scrollbar/render.js'].functionData) {
  _$jscoverage['/scrollbar/render.js'].functionData = [];
  _$jscoverage['/scrollbar/render.js'].functionData[0] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[1] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[2] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[3] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[4] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[5] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[6] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[7] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[8] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[9] = 0;
  _$jscoverage['/scrollbar/render.js'].functionData[10] = 0;
}
if (! _$jscoverage['/scrollbar/render.js'].branchData) {
  _$jscoverage['/scrollbar/render.js'].branchData = {};
  _$jscoverage['/scrollbar/render.js'].branchData['50'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['53'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['81'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['86'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['116'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['116'][1] = new BranchData();
}
_$jscoverage['/scrollbar/render.js'].branchData['116'][1].init(4534, 11, 'supportCss3');
function visit24_116_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['86'][1].init(1100, 15, 'val < minScroll');
function visit23_86_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['81'][1].init(773, 15, 'val > maxScroll');
function visit22_81_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['53'][1].init(42, 21, 'whProperty == \'width\'');
function visit21_53_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['50'][1].init(605, 42, 'scrollView.allowScroll[control.scrollType]');
function visit20_50_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].lineData[6]++;
KISSY.add('scroll-view/plugin/scrollbar/render', function(S, Control, ScrollBarTpl) {
  _$jscoverage['/scrollbar/render.js'].functionData[0]++;
  _$jscoverage['/scrollbar/render.js'].lineData[9]++;
  var supportCss3 = S.Features.isTransformSupported();
  _$jscoverage['/scrollbar/render.js'].lineData[11]++;
  var methods = {
  beforeCreateDom: function(renderData, childrenElSelectors) {
  _$jscoverage['/scrollbar/render.js'].functionData[1]++;
  _$jscoverage['/scrollbar/render.js'].lineData[13]++;
  renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
  _$jscoverage['/scrollbar/render.js'].lineData[14]++;
  S.mix(childrenElSelectors, {
  'dragEl': '#ks-scrollbar-drag-{id}', 
  'downBtn': '#ks-scrollbar-arrow-down-{id}', 
  'upBtn': '#ks-scrollbar-arrow-up-{id}', 
  'trackEl': '#ks-scrollbar-track-{id}'});
}, 
  createDom: function() {
  _$jscoverage['/scrollbar/render.js'].functionData[2]++;
  _$jscoverage['/scrollbar/render.js'].lineData[23]++;
  var control = this.control;
  _$jscoverage['/scrollbar/render.js'].lineData[24]++;
  control.$dragEl = control.get('dragEl');
  _$jscoverage['/scrollbar/render.js'].lineData[25]++;
  control.$trackEl = control.get('trackEl');
  _$jscoverage['/scrollbar/render.js'].lineData[26]++;
  control.$downBtn = control.get('downBtn');
  _$jscoverage['/scrollbar/render.js'].lineData[27]++;
  control.$upBtn = control.get('upBtn');
  _$jscoverage['/scrollbar/render.js'].lineData[28]++;
  control.dragEl = control.$dragEl[0];
  _$jscoverage['/scrollbar/render.js'].lineData[29]++;
  control.trackEl = control.$trackEl[0];
  _$jscoverage['/scrollbar/render.js'].lineData[30]++;
  control.downBtn = control.$downBtn[0];
  _$jscoverage['/scrollbar/render.js'].lineData[31]++;
  control.upBtn = control.$upBtn[0];
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/render.js'].functionData[3]++;
  _$jscoverage['/scrollbar/render.js'].lineData[35]++;
  var self = this, control = self.control, scrollView = control.get('scrollView'), trackEl = control.trackEl, scrollWHProperty = control.scrollWHProperty, whProperty = control.whProperty, clientWHProperty = control.clientWHProperty, dragWHProperty = control.dragWHProperty, ratio, trackElSize, barSize, rendered = control.get('rendered');
  _$jscoverage['/scrollbar/render.js'].lineData[48]++;
  control.scrollView = scrollView;
  _$jscoverage['/scrollbar/render.js'].lineData[50]++;
  if (visit20_50_1(scrollView.allowScroll[control.scrollType])) {
    _$jscoverage['/scrollbar/render.js'].lineData[51]++;
    control.scrollLength = scrollView[scrollWHProperty];
    _$jscoverage['/scrollbar/render.js'].lineData[52]++;
    trackElSize = control.trackElSize = visit21_53_1(whProperty == 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
    _$jscoverage['/scrollbar/render.js'].lineData[54]++;
    ratio = scrollView[clientWHProperty] / control.scrollLength;
    _$jscoverage['/scrollbar/render.js'].lineData[55]++;
    barSize = ratio * trackElSize;
    _$jscoverage['/scrollbar/render.js'].lineData[56]++;
    control.set(dragWHProperty, barSize);
    _$jscoverage['/scrollbar/render.js'].lineData[57]++;
    control.barSize = barSize;
    _$jscoverage['/scrollbar/render.js'].lineData[58]++;
    self.syncOnScrollChange();
    _$jscoverage['/scrollbar/render.js'].lineData[59]++;
    control.set('visible', true);
  } else {
    _$jscoverage['/scrollbar/render.js'].lineData[61]++;
    control.set('visible', false);
  }
}, 
  syncOnScrollChange: function() {
  _$jscoverage['/scrollbar/render.js'].functionData[4]++;
  _$jscoverage['/scrollbar/render.js'].lineData[66]++;
  var self = this, control = self.control, scrollType = control.scrollType, scrollView = control.scrollView, dragLTProperty = control.dragLTProperty, dragWHProperty = control.dragWHProperty, trackElSize = control.trackElSize, barSize = control.barSize, contentSize = control.scrollLength, val = scrollView.get(control.scrollProperty), maxScrollOffset = scrollView.maxScroll, minScrollOffset = scrollView.minScroll, minScroll = minScrollOffset[scrollType], maxScroll = maxScrollOffset[scrollType], dragVal;
  _$jscoverage['/scrollbar/render.js'].lineData[81]++;
  if (visit22_81_1(val > maxScroll)) {
    _$jscoverage['/scrollbar/render.js'].lineData[82]++;
    dragVal = maxScroll / contentSize * trackElSize;
    _$jscoverage['/scrollbar/render.js'].lineData[83]++;
    control.set(dragWHProperty, barSize - (val - maxScroll));
    _$jscoverage['/scrollbar/render.js'].lineData[85]++;
    control.set(dragLTProperty, dragVal + barSize - control.get(dragWHProperty));
  } else {
    _$jscoverage['/scrollbar/render.js'].lineData[86]++;
    if (visit23_86_1(val < minScroll)) {
      _$jscoverage['/scrollbar/render.js'].lineData[87]++;
      dragVal = minScroll / contentSize * trackElSize;
      _$jscoverage['/scrollbar/render.js'].lineData[88]++;
      control.set(dragWHProperty, barSize - (minScroll - val));
      _$jscoverage['/scrollbar/render.js'].lineData[89]++;
      control.set(dragLTProperty, dragVal);
    } else {
      _$jscoverage['/scrollbar/render.js'].lineData[91]++;
      dragVal = val / contentSize * trackElSize;
      _$jscoverage['/scrollbar/render.js'].lineData[92]++;
      control.set(dragLTProperty, dragVal);
      _$jscoverage['/scrollbar/render.js'].lineData[93]++;
      control.set(dragWHProperty, barSize);
    }
  }
}, 
  '_onSetDragHeight': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[5]++;
  _$jscoverage['/scrollbar/render.js'].lineData[98]++;
  this.control.dragEl.style.height = v + 'px';
}, 
  '_onSetDragWidth': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[6]++;
  _$jscoverage['/scrollbar/render.js'].lineData[102]++;
  this.control.dragEl.style.width = v + 'px';
}, 
  '_onSetDragLeft': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[7]++;
  _$jscoverage['/scrollbar/render.js'].lineData[106]++;
  this.control.dragEl.style.left = v + 'px';
}, 
  '_onSetDragTop': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[8]++;
  _$jscoverage['/scrollbar/render.js'].lineData[110]++;
  this.control.dragEl.style.top = v + 'px';
}};
  _$jscoverage['/scrollbar/render.js'].lineData[114]++;
  var transformProperty = S.Features.getTransformProperty();
  _$jscoverage['/scrollbar/render.js'].lineData[116]++;
  if (visit24_116_1(supportCss3)) {
    _$jscoverage['/scrollbar/render.js'].lineData[118]++;
    methods._onSetDragLeft = function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[9]++;
  _$jscoverage['/scrollbar/render.js'].lineData[119]++;
  this.control.dragEl.style[transformProperty] = 'translateX(' + v + 'px) translateZ(0)';
};
    _$jscoverage['/scrollbar/render.js'].lineData[122]++;
    methods._onSetDragTop = function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[10]++;
  _$jscoverage['/scrollbar/render.js'].lineData[123]++;
  this.control.dragEl.style[transformProperty] = 'translateY(' + v + 'px) translateZ(0)';
};
  }
  _$jscoverage['/scrollbar/render.js'].lineData[128]++;
  return Control.getDefaultRender().extend(methods, {
  ATTRS: {
  contentTpl: {
  value: ScrollBarTpl}}});
}, {
  requires: ['component/control', './scrollbar-xtpl']});
