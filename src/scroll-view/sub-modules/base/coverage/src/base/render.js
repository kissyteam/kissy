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
  _$jscoverage['/base/render.js'].lineData[12] = 0;
  _$jscoverage['/base/render.js'].lineData[31] = 0;
  _$jscoverage['/base/render.js'].lineData[33] = 0;
  _$jscoverage['/base/render.js'].lineData[44] = 0;
  _$jscoverage['/base/render.js'].lineData[47] = 0;
  _$jscoverage['/base/render.js'].lineData[51] = 0;
  _$jscoverage['/base/render.js'].lineData[52] = 0;
  _$jscoverage['/base/render.js'].lineData[53] = 0;
  _$jscoverage['/base/render.js'].lineData[54] = 0;
  _$jscoverage['/base/render.js'].lineData[56] = 0;
  _$jscoverage['/base/render.js'].lineData[58] = 0;
  _$jscoverage['/base/render.js'].lineData[59] = 0;
  _$jscoverage['/base/render.js'].lineData[61] = 0;
  _$jscoverage['/base/render.js'].lineData[62] = 0;
  _$jscoverage['/base/render.js'].lineData[65] = 0;
  _$jscoverage['/base/render.js'].lineData[70] = 0;
  _$jscoverage['/base/render.js'].lineData[73] = 0;
  _$jscoverage['/base/render.js'].lineData[78] = 0;
  _$jscoverage['/base/render.js'].lineData[80] = 0;
  _$jscoverage['/base/render.js'].lineData[84] = 0;
  _$jscoverage['/base/render.js'].lineData[85] = 0;
  _$jscoverage['/base/render.js'].lineData[86] = 0;
  _$jscoverage['/base/render.js'].lineData[91] = 0;
  _$jscoverage['/base/render.js'].lineData[92] = 0;
  _$jscoverage['/base/render.js'].lineData[95] = 0;
  _$jscoverage['/base/render.js'].lineData[96] = 0;
  _$jscoverage['/base/render.js'].lineData[103] = 0;
  _$jscoverage['/base/render.js'].lineData[104] = 0;
  _$jscoverage['/base/render.js'].lineData[105] = 0;
  _$jscoverage['/base/render.js'].lineData[110] = 0;
  _$jscoverage['/base/render.js'].lineData[117] = 0;
  _$jscoverage['/base/render.js'].lineData[121] = 0;
  _$jscoverage['/base/render.js'].lineData[125] = 0;
  _$jscoverage['/base/render.js'].lineData[126] = 0;
  _$jscoverage['/base/render.js'].lineData[128] = 0;
  _$jscoverage['/base/render.js'].lineData[129] = 0;
  _$jscoverage['/base/render.js'].lineData[130] = 0;
  _$jscoverage['/base/render.js'].lineData[133] = 0;
  _$jscoverage['/base/render.js'].lineData[134] = 0;
  _$jscoverage['/base/render.js'].lineData[135] = 0;
  _$jscoverage['/base/render.js'].lineData[139] = 0;
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
  _$jscoverage['/base/render.js'].branchData['58'] = [];
  _$jscoverage['/base/render.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['61'] = [];
  _$jscoverage['/base/render.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['84'] = [];
  _$jscoverage['/base/render.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['86'] = [];
  _$jscoverage['/base/render.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['95'] = [];
  _$jscoverage['/base/render.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['95'][2] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['95'][3] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['103'] = [];
  _$jscoverage['/base/render.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['125'] = [];
  _$jscoverage['/base/render.js'].branchData['125'][1] = new BranchData();
}
_$jscoverage['/base/render.js'].branchData['125'][1].init(3946, 11, 'supportCss3');
function visit9_125_1(result) {
  _$jscoverage['/base/render.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['103'][1].init(862, 9, 'pageIndex');
function visit8_103_1(result) {
  _$jscoverage['/base/render.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['95'][3].init(212, 19, 'top <= maxScrollTop');
function visit7_95_3(result) {
  _$jscoverage['/base/render.js'].branchData['95'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['95'][2].init(187, 21, 'left <= maxScrollLeft');
function visit6_95_2(result) {
  _$jscoverage['/base/render.js'].branchData['95'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['95'][1].init(187, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit5_95_1(result) {
  _$jscoverage['/base/render.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['86'][1].init(97, 24, 'typeof snap === \'string\'');
function visit4_86_1(result) {
  _$jscoverage['/base/render.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['84'][1].init(1715, 4, 'snap');
function visit3_84_1(result) {
  _$jscoverage['/base/render.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['61'][1].init(1083, 25, 'scrollWidth > clientWidth');
function visit2_61_1(result) {
  _$jscoverage['/base/render.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['58'][1].init(985, 27, 'scrollHeight > clientHeight');
function visit1_58_1(result) {
  _$jscoverage['/base/render.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/render.js'].functionData[0]++;
  _$jscoverage['/base/render.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/base/render.js'].lineData[8]++;
  var ContentRenderExtension = require('component/extension/content-render');
  _$jscoverage['/base/render.js'].lineData[12]++;
  var Features = S.Features, supportCss3 = Features.isTransformSupported(), transformProperty;
  _$jscoverage['/base/render.js'].lineData[31]++;
  var methods = {
  syncUI: function() {
  _$jscoverage['/base/render.js'].functionData[1]++;
  _$jscoverage['/base/render.js'].lineData[33]++;
  var self = this, control = self.control, el = control.el, contentEl = control.contentEl, $contentEl = control.$contentEl;
  _$jscoverage['/base/render.js'].lineData[44]++;
  var scrollHeight = contentEl.offsetHeight, scrollWidth = contentEl.offsetWidth;
  _$jscoverage['/base/render.js'].lineData[47]++;
  var clientHeight = el.clientHeight, allowScroll, clientWidth = el.clientWidth;
  _$jscoverage['/base/render.js'].lineData[51]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base/render.js'].lineData[52]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base/render.js'].lineData[53]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base/render.js'].lineData[54]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base/render.js'].lineData[56]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base/render.js'].lineData[58]++;
  if (visit1_58_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base/render.js'].lineData[59]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base/render.js'].lineData[61]++;
  if (visit2_61_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base/render.js'].lineData[62]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base/render.js'].lineData[65]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base/render.js'].lineData[70]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base/render.js'].lineData[73]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base/render.js'].lineData[78]++;
  delete control.scrollStep;
  _$jscoverage['/base/render.js'].lineData[80]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base/render.js'].lineData[84]++;
  if (visit3_84_1(snap)) {
    _$jscoverage['/base/render.js'].lineData[85]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base/render.js'].lineData[86]++;
    var pages = control.pages = visit4_86_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base/render.js'].lineData[91]++;
    pages.each(function(p, i) {
  _$jscoverage['/base/render.js'].functionData[2]++;
  _$jscoverage['/base/render.js'].lineData[92]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base/render.js'].lineData[95]++;
  if (visit5_95_1(visit6_95_2(left <= maxScrollLeft) && visit7_95_3(top <= maxScrollTop))) {
    _$jscoverage['/base/render.js'].lineData[96]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base/render.js'].lineData[103]++;
    if (visit8_103_1(pageIndex)) {
      _$jscoverage['/base/render.js'].lineData[104]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base/render.js'].lineData[105]++;
      return;
    }
  }
  _$jscoverage['/base/render.js'].lineData[110]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
}, 
  '_onSetScrollLeft': function(v) {
  _$jscoverage['/base/render.js'].functionData[3]++;
  _$jscoverage['/base/render.js'].lineData[117]++;
  this.control.contentEl.style.left = -v + 'px';
}, 
  '_onSetScrollTop': function(v) {
  _$jscoverage['/base/render.js'].functionData[4]++;
  _$jscoverage['/base/render.js'].lineData[121]++;
  this.control.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base/render.js'].lineData[125]++;
  if (visit9_125_1(supportCss3)) {
    _$jscoverage['/base/render.js'].lineData[126]++;
    transformProperty = Features.getTransformProperty();
    _$jscoverage['/base/render.js'].lineData[128]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base/render.js'].functionData[5]++;
  _$jscoverage['/base/render.js'].lineData[129]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[130]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -control.get('scrollTop') + 'px,0)';
};
    _$jscoverage['/base/render.js'].lineData[133]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base/render.js'].functionData[6]++;
  _$jscoverage['/base/render.js'].lineData[134]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[135]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -control.get('scrollLeft') + 'px,' + -v + 'px,0)';
};
  }
  _$jscoverage['/base/render.js'].lineData[139]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {
  name: 'ScrollViewRender'});
});
