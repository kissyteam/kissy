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
  _$jscoverage['/base/render.js'].lineData[11] = 0;
  _$jscoverage['/base/render.js'].lineData[16] = 0;
  _$jscoverage['/base/render.js'].lineData[19] = 0;
  _$jscoverage['/base/render.js'].lineData[35] = 0;
  _$jscoverage['/base/render.js'].lineData[37] = 0;
  _$jscoverage['/base/render.js'].lineData[48] = 0;
  _$jscoverage['/base/render.js'].lineData[51] = 0;
  _$jscoverage['/base/render.js'].lineData[55] = 0;
  _$jscoverage['/base/render.js'].lineData[56] = 0;
  _$jscoverage['/base/render.js'].lineData[57] = 0;
  _$jscoverage['/base/render.js'].lineData[58] = 0;
  _$jscoverage['/base/render.js'].lineData[60] = 0;
  _$jscoverage['/base/render.js'].lineData[62] = 0;
  _$jscoverage['/base/render.js'].lineData[63] = 0;
  _$jscoverage['/base/render.js'].lineData[65] = 0;
  _$jscoverage['/base/render.js'].lineData[66] = 0;
  _$jscoverage['/base/render.js'].lineData[69] = 0;
  _$jscoverage['/base/render.js'].lineData[74] = 0;
  _$jscoverage['/base/render.js'].lineData[77] = 0;
  _$jscoverage['/base/render.js'].lineData[82] = 0;
  _$jscoverage['/base/render.js'].lineData[84] = 0;
  _$jscoverage['/base/render.js'].lineData[88] = 0;
  _$jscoverage['/base/render.js'].lineData[89] = 0;
  _$jscoverage['/base/render.js'].lineData[90] = 0;
  _$jscoverage['/base/render.js'].lineData[95] = 0;
  _$jscoverage['/base/render.js'].lineData[96] = 0;
  _$jscoverage['/base/render.js'].lineData[99] = 0;
  _$jscoverage['/base/render.js'].lineData[100] = 0;
  _$jscoverage['/base/render.js'].lineData[107] = 0;
  _$jscoverage['/base/render.js'].lineData[108] = 0;
  _$jscoverage['/base/render.js'].lineData[109] = 0;
  _$jscoverage['/base/render.js'].lineData[114] = 0;
  _$jscoverage['/base/render.js'].lineData[121] = 0;
  _$jscoverage['/base/render.js'].lineData[125] = 0;
  _$jscoverage['/base/render.js'].lineData[129] = 0;
  _$jscoverage['/base/render.js'].lineData[130] = 0;
  _$jscoverage['/base/render.js'].lineData[132] = 0;
  _$jscoverage['/base/render.js'].lineData[133] = 0;
  _$jscoverage['/base/render.js'].lineData[134] = 0;
  _$jscoverage['/base/render.js'].lineData[139] = 0;
  _$jscoverage['/base/render.js'].lineData[140] = 0;
  _$jscoverage['/base/render.js'].lineData[141] = 0;
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
  _$jscoverage['/base/render.js'].branchData['19'] = [];
  _$jscoverage['/base/render.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['62'] = [];
  _$jscoverage['/base/render.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['65'] = [];
  _$jscoverage['/base/render.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['88'] = [];
  _$jscoverage['/base/render.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['90'] = [];
  _$jscoverage['/base/render.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['99'] = [];
  _$jscoverage['/base/render.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['107'] = [];
  _$jscoverage['/base/render.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['129'] = [];
  _$jscoverage['/base/render.js'].branchData['129'][1] = new BranchData();
}
_$jscoverage['/base/render.js'].branchData['129'][1].init(4129, 11, 'supportCss3');
function visit10_129_1(result) {
  _$jscoverage['/base/render.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['107'][1].init(862, 9, 'pageIndex');
function visit9_107_1(result) {
  _$jscoverage['/base/render.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['99'][3].init(212, 19, 'top <= maxScrollTop');
function visit8_99_3(result) {
  _$jscoverage['/base/render.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['99'][2].init(187, 21, 'left <= maxScrollLeft');
function visit7_99_2(result) {
  _$jscoverage['/base/render.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['99'][1].init(187, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit6_99_1(result) {
  _$jscoverage['/base/render.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['90'][1].init(97, 24, 'typeof snap === \'string\'');
function visit5_90_1(result) {
  _$jscoverage['/base/render.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['88'][1].init(1715, 4, 'snap');
function visit4_88_1(result) {
  _$jscoverage['/base/render.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['65'][1].init(1083, 25, 'scrollWidth > clientWidth');
function visit3_65_1(result) {
  _$jscoverage['/base/render.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['62'][1].init(985, 27, 'scrollHeight > clientHeight');
function visit2_62_1(result) {
  _$jscoverage['/base/render.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['19'][1].init(479, 56, 'S.Features.getVendorCssPropPrefix(\'transform\') !== false');
function visit1_19_1(result) {
  _$jscoverage['/base/render.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/render.js'].functionData[0]++;
  _$jscoverage['/base/render.js'].lineData[7]++;
  var Container = require('component/container');
  _$jscoverage['/base/render.js'].lineData[8]++;
  var ContentRenderExtension = require('component/extension/content-render');
  _$jscoverage['/base/render.js'].lineData[11]++;
  var Features = S.Features, floor = Math.floor, transformProperty;
  _$jscoverage['/base/render.js'].lineData[16]++;
  var isTransform3dSupported = S.Features.isTransform3dSupported();
  _$jscoverage['/base/render.js'].lineData[19]++;
  var supportCss3 = visit1_19_1(S.Features.getVendorCssPropPrefix('transform') !== false);
  _$jscoverage['/base/render.js'].lineData[35]++;
  var methods = {
  syncUI: function() {
  _$jscoverage['/base/render.js'].functionData[1]++;
  _$jscoverage['/base/render.js'].lineData[37]++;
  var self = this, control = self.control, el = control.el, contentEl = control.contentEl, $contentEl = control.$contentEl;
  _$jscoverage['/base/render.js'].lineData[48]++;
  var scrollHeight = contentEl.offsetHeight, scrollWidth = contentEl.offsetWidth;
  _$jscoverage['/base/render.js'].lineData[51]++;
  var clientHeight = el.clientHeight, allowScroll, clientWidth = el.clientWidth;
  _$jscoverage['/base/render.js'].lineData[55]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base/render.js'].lineData[56]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base/render.js'].lineData[57]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base/render.js'].lineData[58]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base/render.js'].lineData[60]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base/render.js'].lineData[62]++;
  if (visit2_62_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base/render.js'].lineData[63]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base/render.js'].lineData[65]++;
  if (visit3_65_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base/render.js'].lineData[66]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base/render.js'].lineData[69]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base/render.js'].lineData[74]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base/render.js'].lineData[77]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base/render.js'].lineData[82]++;
  delete control.scrollStep;
  _$jscoverage['/base/render.js'].lineData[84]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base/render.js'].lineData[88]++;
  if (visit4_88_1(snap)) {
    _$jscoverage['/base/render.js'].lineData[89]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base/render.js'].lineData[90]++;
    var pages = control.pages = visit5_90_1(typeof snap === 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base/render.js'].lineData[95]++;
    pages.each(function(p, i) {
  _$jscoverage['/base/render.js'].functionData[2]++;
  _$jscoverage['/base/render.js'].lineData[96]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base/render.js'].lineData[99]++;
  if (visit6_99_1(visit7_99_2(left <= maxScrollLeft) && visit8_99_3(top <= maxScrollTop))) {
    _$jscoverage['/base/render.js'].lineData[100]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base/render.js'].lineData[107]++;
    if (visit9_107_1(pageIndex)) {
      _$jscoverage['/base/render.js'].lineData[108]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base/render.js'].lineData[109]++;
      return;
    }
  }
  _$jscoverage['/base/render.js'].lineData[114]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
}, 
  '_onSetScrollLeft': function(v) {
  _$jscoverage['/base/render.js'].functionData[3]++;
  _$jscoverage['/base/render.js'].lineData[121]++;
  this.control.contentEl.style.left = -v + 'px';
}, 
  '_onSetScrollTop': function(v) {
  _$jscoverage['/base/render.js'].functionData[4]++;
  _$jscoverage['/base/render.js'].lineData[125]++;
  this.control.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base/render.js'].lineData[129]++;
  if (visit10_129_1(supportCss3)) {
    _$jscoverage['/base/render.js'].lineData[130]++;
    transformProperty = Features.getVendorCssPropName('transform');
    _$jscoverage['/base/render.js'].lineData[132]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base/render.js'].functionData[5]++;
  _$jscoverage['/base/render.js'].lineData[133]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[134]++;
  control.contentEl.style[transformProperty] = 'translateX(' + floor(-v) + 'px)' + ' translateY(' + floor(-control.get('scrollTop')) + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
    _$jscoverage['/base/render.js'].lineData[139]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base/render.js'].functionData[6]++;
  _$jscoverage['/base/render.js'].lineData[140]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[141]++;
  control.contentEl.style[transformProperty] = 'translateX(' + floor(-control.get('scrollLeft')) + 'px)' + ' translateY(' + floor(-v) + 'px)' + (isTransform3dSupported ? ' translateZ(0)' : '');
};
  }
  _$jscoverage['/base/render.js'].lineData[147]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {
  name: 'ScrollViewRender'});
});
