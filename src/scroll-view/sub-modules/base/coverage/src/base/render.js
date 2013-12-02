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
if (! _$jscoverage['/base/render.js']) {
  _$jscoverage['/base/render.js'] = {};
  _$jscoverage['/base/render.js'].lineData = [];
  _$jscoverage['/base/render.js'].lineData[6] = 0;
  _$jscoverage['/base/render.js'].lineData[7] = 0;
  _$jscoverage['/base/render.js'].lineData[8] = 0;
  _$jscoverage['/base/render.js'].lineData[9] = 0;
  _$jscoverage['/base/render.js'].lineData[14] = 0;
  _$jscoverage['/base/render.js'].lineData[33] = 0;
  _$jscoverage['/base/render.js'].lineData[35] = 0;
  _$jscoverage['/base/render.js'].lineData[46] = 0;
  _$jscoverage['/base/render.js'].lineData[49] = 0;
  _$jscoverage['/base/render.js'].lineData[53] = 0;
  _$jscoverage['/base/render.js'].lineData[54] = 0;
  _$jscoverage['/base/render.js'].lineData[55] = 0;
  _$jscoverage['/base/render.js'].lineData[56] = 0;
  _$jscoverage['/base/render.js'].lineData[58] = 0;
  _$jscoverage['/base/render.js'].lineData[60] = 0;
  _$jscoverage['/base/render.js'].lineData[61] = 0;
  _$jscoverage['/base/render.js'].lineData[63] = 0;
  _$jscoverage['/base/render.js'].lineData[64] = 0;
  _$jscoverage['/base/render.js'].lineData[67] = 0;
  _$jscoverage['/base/render.js'].lineData[72] = 0;
  _$jscoverage['/base/render.js'].lineData[75] = 0;
  _$jscoverage['/base/render.js'].lineData[80] = 0;
  _$jscoverage['/base/render.js'].lineData[82] = 0;
  _$jscoverage['/base/render.js'].lineData[86] = 0;
  _$jscoverage['/base/render.js'].lineData[87] = 0;
  _$jscoverage['/base/render.js'].lineData[88] = 0;
  _$jscoverage['/base/render.js'].lineData[93] = 0;
  _$jscoverage['/base/render.js'].lineData[94] = 0;
  _$jscoverage['/base/render.js'].lineData[97] = 0;
  _$jscoverage['/base/render.js'].lineData[98] = 0;
  _$jscoverage['/base/render.js'].lineData[105] = 0;
  _$jscoverage['/base/render.js'].lineData[106] = 0;
  _$jscoverage['/base/render.js'].lineData[107] = 0;
  _$jscoverage['/base/render.js'].lineData[112] = 0;
  _$jscoverage['/base/render.js'].lineData[119] = 0;
  _$jscoverage['/base/render.js'].lineData[123] = 0;
  _$jscoverage['/base/render.js'].lineData[127] = 0;
  _$jscoverage['/base/render.js'].lineData[128] = 0;
  _$jscoverage['/base/render.js'].lineData[130] = 0;
  _$jscoverage['/base/render.js'].lineData[131] = 0;
  _$jscoverage['/base/render.js'].lineData[132] = 0;
  _$jscoverage['/base/render.js'].lineData[138] = 0;
  _$jscoverage['/base/render.js'].lineData[139] = 0;
  _$jscoverage['/base/render.js'].lineData[140] = 0;
  _$jscoverage['/base/render.js'].lineData[147] = 0;
}
if (! _$jscoverage['/base/render.js'].functionData) {
  _$jscoverage['/base/render.js'].functionData = [];
  _$jscoverage['/base/render.js'].functionData[0] = 0;
  _$jscoverage['/base/render.js'].functionData[1] = 0;
  _$jscoverage['/base/render.js'].functionData[2] = 0;
  _$jscoverage['/base/render.js'].functionData[3] = 0;
  _$jscoverage['/base/render.js'].functionData[4] = 0;
  _$jscoverage['/base/render.js'].functionData[5] = 0;
  _$jscoverage['/base/render.js'].functionData[6] = 0;
}
if (! _$jscoverage['/base/render.js'].branchData) {
  _$jscoverage['/base/render.js'].branchData = {};
  _$jscoverage['/base/render.js'].branchData['60'] = [];
  _$jscoverage['/base/render.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['63'] = [];
  _$jscoverage['/base/render.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['86'] = [];
  _$jscoverage['/base/render.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['88'] = [];
  _$jscoverage['/base/render.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['97'] = [];
  _$jscoverage['/base/render.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['97'][3] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['105'] = [];
  _$jscoverage['/base/render.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['127'] = [];
  _$jscoverage['/base/render.js'].branchData['127'][1] = new BranchData();
}
_$jscoverage['/base/render.js'].branchData['127'][1].init(4108, 11, 'supportCss3');
function visit9_127_1(result) {
  _$jscoverage['/base/render.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['105'][1].init(862, 9, 'pageIndex');
function visit8_105_1(result) {
  _$jscoverage['/base/render.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['97'][3].init(212, 19, 'top <= maxScrollTop');
function visit7_97_3(result) {
  _$jscoverage['/base/render.js'].branchData['97'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['97'][2].init(187, 21, 'left <= maxScrollLeft');
function visit6_97_2(result) {
  _$jscoverage['/base/render.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['97'][1].init(187, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit5_97_1(result) {
  _$jscoverage['/base/render.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['88'][1].init(97, 24, 'typeof snap === \'string\'');
function visit4_88_1(result) {
  _$jscoverage['/base/render.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['86'][1].init(1715, 4, 'snap');
function visit3_86_1(result) {
  _$jscoverage['/base/render.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['63'][1].init(1083, 25, 'scrollWidth > clientWidth');
function visit2_63_1(result) {
  _$jscoverage['/base/render.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['60'][1].init(985, 27, 'scrollHeight > clientHeight');
function visit1_60_1(result) {
  _$jscoverage['/base/render.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/render.js'].functionData[0]++;
  _$jscoverage['/base/render.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/base/render.js'].lineData[8]++;
  var ContentRenderExtension = require('component/extension/content-render');
  _$jscoverage['/base/render.js'].lineData[9]++;
  var translateTpl = S.Features.isTransform3dSupported() ? 'translate3d({translateX}px,{translateY}px,0)' : 'translate({translateX}px,{translateY}px)';
  _$jscoverage['/base/render.js'].lineData[14]++;
  var Features = S.Features, supportCss3 = Features.isTransformSupported(), transformProperty;
  _$jscoverage['/base/render.js'].lineData[33]++;
  var methods = {
  syncUI: function() {
  _$jscoverage['/base/render.js'].functionData[1]++;
  _$jscoverage['/base/render.js'].lineData[35]++;
  var self = this, control = self.control, el = control.el, contentEl = control.contentEl, $contentEl = control.$contentEl;
  _$jscoverage['/base/render.js'].lineData[46]++;
  var scrollHeight = contentEl.offsetHeight, scrollWidth = contentEl.offsetWidth;
  _$jscoverage['/base/render.js'].lineData[49]++;
  var clientHeight = el.clientHeight, allowScroll, clientWidth = el.clientWidth;
  _$jscoverage['/base/render.js'].lineData[53]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base/render.js'].lineData[54]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base/render.js'].lineData[55]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base/render.js'].lineData[56]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base/render.js'].lineData[58]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base/render.js'].lineData[60]++;
  if (visit1_60_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base/render.js'].lineData[61]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base/render.js'].lineData[63]++;
  if (visit2_63_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base/render.js'].lineData[64]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base/render.js'].lineData[67]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base/render.js'].lineData[72]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base/render.js'].lineData[75]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base/render.js'].lineData[80]++;
  delete control.scrollStep;
  _$jscoverage['/base/render.js'].lineData[82]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base/render.js'].lineData[86]++;
  if (visit3_86_1(snap)) {
    _$jscoverage['/base/render.js'].lineData[87]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base/render.js'].lineData[88]++;
    var pages = control.pages = visit4_88_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base/render.js'].lineData[93]++;
    pages.each(function(p, i) {
  _$jscoverage['/base/render.js'].functionData[2]++;
  _$jscoverage['/base/render.js'].lineData[94]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base/render.js'].lineData[97]++;
  if (visit5_97_1(visit6_97_2(left <= maxScrollLeft) && visit7_97_3(top <= maxScrollTop))) {
    _$jscoverage['/base/render.js'].lineData[98]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base/render.js'].lineData[105]++;
    if (visit8_105_1(pageIndex)) {
      _$jscoverage['/base/render.js'].lineData[106]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base/render.js'].lineData[107]++;
      return;
    }
  }
  _$jscoverage['/base/render.js'].lineData[112]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
}, 
  '_onSetScrollLeft': function(v) {
  _$jscoverage['/base/render.js'].functionData[3]++;
  _$jscoverage['/base/render.js'].lineData[119]++;
  this.control.contentEl.style.left = -v + 'px';
}, 
  '_onSetScrollTop': function(v) {
  _$jscoverage['/base/render.js'].functionData[4]++;
  _$jscoverage['/base/render.js'].lineData[123]++;
  this.control.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base/render.js'].lineData[127]++;
  if (visit9_127_1(supportCss3)) {
    _$jscoverage['/base/render.js'].lineData[128]++;
    transformProperty = Features.getTransformProperty();
    _$jscoverage['/base/render.js'].lineData[130]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base/render.js'].functionData[5]++;
  _$jscoverage['/base/render.js'].lineData[131]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[132]++;
  control.contentEl.style[transformProperty] = S.substitute(translateTpl, {
  translateX: -v, 
  translateY: -control.get('scrollTop')});
};
    _$jscoverage['/base/render.js'].lineData[138]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base/render.js'].functionData[6]++;
  _$jscoverage['/base/render.js'].lineData[139]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[140]++;
  control.contentEl.style[transformProperty] = S.substitute(translateTpl, {
  translateX: -control.get('scrollLeft'), 
  translateY: -v});
};
  }
  _$jscoverage['/base/render.js'].lineData[147]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {
  name: 'ScrollViewRender'});
});
