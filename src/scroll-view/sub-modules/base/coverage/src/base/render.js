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
  _$jscoverage['/base/render.js'].lineData[5] = 0;
  _$jscoverage['/base/render.js'].lineData[8] = 0;
  _$jscoverage['/base/render.js'].lineData[27] = 0;
  _$jscoverage['/base/render.js'].lineData[29] = 0;
  _$jscoverage['/base/render.js'].lineData[40] = 0;
  _$jscoverage['/base/render.js'].lineData[43] = 0;
  _$jscoverage['/base/render.js'].lineData[47] = 0;
  _$jscoverage['/base/render.js'].lineData[48] = 0;
  _$jscoverage['/base/render.js'].lineData[49] = 0;
  _$jscoverage['/base/render.js'].lineData[50] = 0;
  _$jscoverage['/base/render.js'].lineData[52] = 0;
  _$jscoverage['/base/render.js'].lineData[54] = 0;
  _$jscoverage['/base/render.js'].lineData[55] = 0;
  _$jscoverage['/base/render.js'].lineData[57] = 0;
  _$jscoverage['/base/render.js'].lineData[58] = 0;
  _$jscoverage['/base/render.js'].lineData[61] = 0;
  _$jscoverage['/base/render.js'].lineData[66] = 0;
  _$jscoverage['/base/render.js'].lineData[69] = 0;
  _$jscoverage['/base/render.js'].lineData[74] = 0;
  _$jscoverage['/base/render.js'].lineData[76] = 0;
  _$jscoverage['/base/render.js'].lineData[80] = 0;
  _$jscoverage['/base/render.js'].lineData[81] = 0;
  _$jscoverage['/base/render.js'].lineData[82] = 0;
  _$jscoverage['/base/render.js'].lineData[87] = 0;
  _$jscoverage['/base/render.js'].lineData[88] = 0;
  _$jscoverage['/base/render.js'].lineData[91] = 0;
  _$jscoverage['/base/render.js'].lineData[92] = 0;
  _$jscoverage['/base/render.js'].lineData[99] = 0;
  _$jscoverage['/base/render.js'].lineData[100] = 0;
  _$jscoverage['/base/render.js'].lineData[101] = 0;
  _$jscoverage['/base/render.js'].lineData[106] = 0;
  _$jscoverage['/base/render.js'].lineData[113] = 0;
  _$jscoverage['/base/render.js'].lineData[117] = 0;
  _$jscoverage['/base/render.js'].lineData[121] = 0;
  _$jscoverage['/base/render.js'].lineData[122] = 0;
  _$jscoverage['/base/render.js'].lineData[124] = 0;
  _$jscoverage['/base/render.js'].lineData[125] = 0;
  _$jscoverage['/base/render.js'].lineData[126] = 0;
  _$jscoverage['/base/render.js'].lineData[129] = 0;
  _$jscoverage['/base/render.js'].lineData[130] = 0;
  _$jscoverage['/base/render.js'].lineData[131] = 0;
  _$jscoverage['/base/render.js'].lineData[135] = 0;
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
  _$jscoverage['/base/render.js'].branchData['54'] = [];
  _$jscoverage['/base/render.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['57'] = [];
  _$jscoverage['/base/render.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['80'] = [];
  _$jscoverage['/base/render.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['82'] = [];
  _$jscoverage['/base/render.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['91'] = [];
  _$jscoverage['/base/render.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['99'] = [];
  _$jscoverage['/base/render.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['121'] = [];
  _$jscoverage['/base/render.js'].branchData['121'][1] = new BranchData();
}
_$jscoverage['/base/render.js'].branchData['121'][1].init(3928, 11, 'supportCss3');
function visit9_121_1(result) {
  _$jscoverage['/base/render.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['99'][1].init(880, 9, 'pageIndex');
function visit8_99_1(result) {
  _$jscoverage['/base/render.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['91'][3].init(216, 19, 'top <= maxScrollTop');
function visit7_91_3(result) {
  _$jscoverage['/base/render.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['91'][2].init(191, 21, 'left <= maxScrollLeft');
function visit6_91_2(result) {
  _$jscoverage['/base/render.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['91'][1].init(191, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit5_91_1(result) {
  _$jscoverage['/base/render.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['82'][1].init(99, 23, 'typeof snap == \'string\'');
function visit4_82_1(result) {
  _$jscoverage['/base/render.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['80'][1].init(1767, 4, 'snap');
function visit3_80_1(result) {
  _$jscoverage['/base/render.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['57'][1].init(1112, 25, 'scrollWidth > clientWidth');
function visit2_57_1(result) {
  _$jscoverage['/base/render.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['54'][1].init(1011, 27, 'scrollHeight > clientHeight');
function visit1_54_1(result) {
  _$jscoverage['/base/render.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].lineData[5]++;
KISSY.add('scroll-view/base/render', function(S, Node, Container, ContentRenderExtension) {
  _$jscoverage['/base/render.js'].functionData[0]++;
  _$jscoverage['/base/render.js'].lineData[8]++;
  var Features = S.Features, supportCss3 = Features.isTransformSupported(), transformProperty;
  _$jscoverage['/base/render.js'].lineData[27]++;
  var methods = {
  syncUI: function() {
  _$jscoverage['/base/render.js'].functionData[1]++;
  _$jscoverage['/base/render.js'].lineData[29]++;
  var self = this, control = self.control, el = control.el, contentEl = control.contentEl, $contentEl = control.$contentEl;
  _$jscoverage['/base/render.js'].lineData[40]++;
  var scrollHeight = contentEl.offsetHeight, scrollWidth = contentEl.offsetWidth;
  _$jscoverage['/base/render.js'].lineData[43]++;
  var clientHeight = el.clientHeight, allowScroll, clientWidth = el.clientWidth;
  _$jscoverage['/base/render.js'].lineData[47]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base/render.js'].lineData[48]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base/render.js'].lineData[49]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base/render.js'].lineData[50]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base/render.js'].lineData[52]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base/render.js'].lineData[54]++;
  if (visit1_54_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base/render.js'].lineData[55]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base/render.js'].lineData[57]++;
  if (visit2_57_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base/render.js'].lineData[58]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base/render.js'].lineData[61]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base/render.js'].lineData[66]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base/render.js'].lineData[69]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base/render.js'].lineData[74]++;
  delete control.scrollStep;
  _$jscoverage['/base/render.js'].lineData[76]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base/render.js'].lineData[80]++;
  if (visit3_80_1(snap)) {
    _$jscoverage['/base/render.js'].lineData[81]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base/render.js'].lineData[82]++;
    var pages = control.pages = visit4_82_1(typeof snap == 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base/render.js'].lineData[87]++;
    pages.each(function(p, i) {
  _$jscoverage['/base/render.js'].functionData[2]++;
  _$jscoverage['/base/render.js'].lineData[88]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base/render.js'].lineData[91]++;
  if (visit5_91_1(visit6_91_2(left <= maxScrollLeft) && visit7_91_3(top <= maxScrollTop))) {
    _$jscoverage['/base/render.js'].lineData[92]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base/render.js'].lineData[99]++;
    if (visit8_99_1(pageIndex)) {
      _$jscoverage['/base/render.js'].lineData[100]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base/render.js'].lineData[101]++;
      return;
    }
  }
  _$jscoverage['/base/render.js'].lineData[106]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
}, 
  '_onSetScrollLeft': function(v) {
  _$jscoverage['/base/render.js'].functionData[3]++;
  _$jscoverage['/base/render.js'].lineData[113]++;
  this.control.contentEl.style.left = -v + 'px';
}, 
  '_onSetScrollTop': function(v) {
  _$jscoverage['/base/render.js'].functionData[4]++;
  _$jscoverage['/base/render.js'].lineData[117]++;
  this.control.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base/render.js'].lineData[121]++;
  if (visit9_121_1(supportCss3)) {
    _$jscoverage['/base/render.js'].lineData[122]++;
    transformProperty = Features.getTransformProperty();
    _$jscoverage['/base/render.js'].lineData[124]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base/render.js'].functionData[5]++;
  _$jscoverage['/base/render.js'].lineData[125]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[126]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -control.get('scrollTop') + 'px,0)';
};
    _$jscoverage['/base/render.js'].lineData[129]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base/render.js'].functionData[6]++;
  _$jscoverage['/base/render.js'].lineData[130]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[131]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -control.get('scrollLeft') + 'px,' + -v + 'px,0)';
};
  }
  _$jscoverage['/base/render.js'].lineData[135]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {
  name: 'ScrollViewRender'});
}, {
  requires: ['node', 'component/container', 'component/extension/content-render']});
