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
  _$jscoverage['/scrollbar/render.js'].lineData[7] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[8] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[9] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[12] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[14] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[16] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[17] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[26] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[27] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[28] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[29] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[30] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[31] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[32] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[33] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[34] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[38] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[50] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[52] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[53] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[54] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[56] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[57] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[58] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[59] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[60] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[61] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[63] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[68] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[72] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[76] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[80] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[85] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[86] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[88] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[89] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[94] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[95] = 0;
  _$jscoverage['/scrollbar/render.js'].lineData[101] = 0;
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
}
if (! _$jscoverage['/scrollbar/render.js'].branchData) {
  _$jscoverage['/scrollbar/render.js'].branchData = {};
  _$jscoverage['/scrollbar/render.js'].branchData['12'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['52'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['55'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/scrollbar/render.js'].branchData['85'] = [];
  _$jscoverage['/scrollbar/render.js'].branchData['85'][1] = new BranchData();
}
_$jscoverage['/scrollbar/render.js'].branchData['85'][1].init(2951, 11, 'supportCss3');
function visit27_85_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['55'][1].init(41, 22, 'whProperty === \'width\'');
function visit26_55_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['52'][1].init(537, 42, 'scrollView.allowScroll[control.scrollType]');
function visit25_52_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].branchData['12'][1].init(253, 56, 'S.Features.getVendorCssPropPrefix(\'transform\') !== false');
function visit24_12_1(result) {
  _$jscoverage['/scrollbar/render.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/scrollbar/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/scrollbar/render.js'].functionData[0]++;
  _$jscoverage['/scrollbar/render.js'].lineData[7]++;
  var Control = require('component/control');
  _$jscoverage['/scrollbar/render.js'].lineData[8]++;
  var ScrollBarTpl = require('./scrollbar-xtpl');
  _$jscoverage['/scrollbar/render.js'].lineData[9]++;
  var isTransform3dSupported = S.Features.isTransform3dSupported();
  _$jscoverage['/scrollbar/render.js'].lineData[12]++;
  var supportCss3 = visit24_12_1(S.Features.getVendorCssPropPrefix('transform') !== false);
  _$jscoverage['/scrollbar/render.js'].lineData[14]++;
  var methods = {
  beforeCreateDom: function(renderData, childrenElSelectors) {
  _$jscoverage['/scrollbar/render.js'].functionData[1]++;
  _$jscoverage['/scrollbar/render.js'].lineData[16]++;
  renderData.elCls.push(renderData.prefixCls + 'scrollbar-' + renderData.axis);
  _$jscoverage['/scrollbar/render.js'].lineData[17]++;
  S.mix(childrenElSelectors, {
  'dragEl': '#ks-scrollbar-drag-{id}', 
  'downBtn': '#ks-scrollbar-arrow-down-{id}', 
  'upBtn': '#ks-scrollbar-arrow-up-{id}', 
  'trackEl': '#ks-scrollbar-track-{id}'});
}, 
  createDom: function() {
  _$jscoverage['/scrollbar/render.js'].functionData[2]++;
  _$jscoverage['/scrollbar/render.js'].lineData[26]++;
  var control = this.control;
  _$jscoverage['/scrollbar/render.js'].lineData[27]++;
  control.$dragEl = control.get('dragEl');
  _$jscoverage['/scrollbar/render.js'].lineData[28]++;
  control.$trackEl = control.get('trackEl');
  _$jscoverage['/scrollbar/render.js'].lineData[29]++;
  control.$downBtn = control.get('downBtn');
  _$jscoverage['/scrollbar/render.js'].lineData[30]++;
  control.$upBtn = control.get('upBtn');
  _$jscoverage['/scrollbar/render.js'].lineData[31]++;
  control.dragEl = control.$dragEl[0];
  _$jscoverage['/scrollbar/render.js'].lineData[32]++;
  control.trackEl = control.$trackEl[0];
  _$jscoverage['/scrollbar/render.js'].lineData[33]++;
  control.downBtn = control.$downBtn[0];
  _$jscoverage['/scrollbar/render.js'].lineData[34]++;
  control.upBtn = control.$upBtn[0];
}, 
  syncUI: function() {
  _$jscoverage['/scrollbar/render.js'].functionData[3]++;
  _$jscoverage['/scrollbar/render.js'].lineData[38]++;
  var self = this, control = self.control, scrollView = control.get('scrollView'), trackEl = control.trackEl, scrollWHProperty = control.scrollWHProperty, whProperty = control.whProperty, clientWHProperty = control.clientWHProperty, dragWHProperty = control.dragWHProperty, ratio, trackElSize, barSize;
  _$jscoverage['/scrollbar/render.js'].lineData[50]++;
  control.scrollView = scrollView;
  _$jscoverage['/scrollbar/render.js'].lineData[52]++;
  if (visit25_52_1(scrollView.allowScroll[control.scrollType])) {
    _$jscoverage['/scrollbar/render.js'].lineData[53]++;
    control.scrollLength = scrollView[scrollWHProperty];
    _$jscoverage['/scrollbar/render.js'].lineData[54]++;
    trackElSize = control.trackElSize = visit26_55_1(whProperty === 'width') ? trackEl.offsetWidth : trackEl.offsetHeight;
    _$jscoverage['/scrollbar/render.js'].lineData[56]++;
    ratio = scrollView[clientWHProperty] / control.scrollLength;
    _$jscoverage['/scrollbar/render.js'].lineData[57]++;
    barSize = ratio * trackElSize;
    _$jscoverage['/scrollbar/render.js'].lineData[58]++;
    control.set(dragWHProperty, barSize);
    _$jscoverage['/scrollbar/render.js'].lineData[59]++;
    control.barSize = barSize;
    _$jscoverage['/scrollbar/render.js'].lineData[60]++;
    control.fullSync();
    _$jscoverage['/scrollbar/render.js'].lineData[61]++;
    control.set('visible', true);
  } else {
    _$jscoverage['/scrollbar/render.js'].lineData[63]++;
    control.set('visible', false);
  }
}, 
  '_onSetDragHeight': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[4]++;
  _$jscoverage['/scrollbar/render.js'].lineData[68]++;
  this.control.dragEl.style.height = v + 'px';
}, 
  '_onSetDragWidth': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[5]++;
  _$jscoverage['/scrollbar/render.js'].lineData[72]++;
  this.control.dragEl.style.width = v + 'px';
}, 
  '_onSetDragLeft': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[6]++;
  _$jscoverage['/scrollbar/render.js'].lineData[76]++;
  this.control.dragEl.style.left = v + 'px';
}, 
  '_onSetDragTop': function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[7]++;
  _$jscoverage['/scrollbar/render.js'].lineData[80]++;
  this.control.dragEl.style.top = v + 'px';
}};
  _$jscoverage['/scrollbar/render.js'].lineData[85]++;
  if (visit27_85_1(supportCss3)) {
    _$jscoverage['/scrollbar/render.js'].lineData[86]++;
    var transformProperty = S.Features.getVendorCssPropName('transform');
    _$jscoverage['/scrollbar/render.js'].lineData[88]++;
    methods._onSetDragLeft = function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[8]++;
  _$jscoverage['/scrollbar/render.js'].lineData[89]++;
  this.control.dragEl.style[transformProperty] = 'translateX(' + v + 'px)' + ' translateY(' + this.control.get('dragTop') + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
    _$jscoverage['/scrollbar/render.js'].lineData[94]++;
    methods._onSetDragTop = function(v) {
  _$jscoverage['/scrollbar/render.js'].functionData[9]++;
  _$jscoverage['/scrollbar/render.js'].lineData[95]++;
  this.control.dragEl.style[transformProperty] = 'translateX(' + this.control.get('dragLeft') + 'px)' + ' translateY(' + v + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
  }
  _$jscoverage['/scrollbar/render.js'].lineData[101]++;
  return Control.getDefaultRender().extend(methods, {
  ATTRS: {
  contentTpl: {
  value: ScrollBarTpl}}});
});
