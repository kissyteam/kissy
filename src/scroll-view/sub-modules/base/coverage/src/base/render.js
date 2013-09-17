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
  _$jscoverage['/base/render.js'].lineData[9] = 0;
  _$jscoverage['/base/render.js'].lineData[28] = 0;
  _$jscoverage['/base/render.js'].lineData[30] = 0;
  _$jscoverage['/base/render.js'].lineData[41] = 0;
  _$jscoverage['/base/render.js'].lineData[44] = 0;
  _$jscoverage['/base/render.js'].lineData[48] = 0;
  _$jscoverage['/base/render.js'].lineData[49] = 0;
  _$jscoverage['/base/render.js'].lineData[50] = 0;
  _$jscoverage['/base/render.js'].lineData[51] = 0;
  _$jscoverage['/base/render.js'].lineData[53] = 0;
  _$jscoverage['/base/render.js'].lineData[55] = 0;
  _$jscoverage['/base/render.js'].lineData[56] = 0;
  _$jscoverage['/base/render.js'].lineData[58] = 0;
  _$jscoverage['/base/render.js'].lineData[59] = 0;
  _$jscoverage['/base/render.js'].lineData[62] = 0;
  _$jscoverage['/base/render.js'].lineData[67] = 0;
  _$jscoverage['/base/render.js'].lineData[70] = 0;
  _$jscoverage['/base/render.js'].lineData[75] = 0;
  _$jscoverage['/base/render.js'].lineData[77] = 0;
  _$jscoverage['/base/render.js'].lineData[81] = 0;
  _$jscoverage['/base/render.js'].lineData[82] = 0;
  _$jscoverage['/base/render.js'].lineData[83] = 0;
  _$jscoverage['/base/render.js'].lineData[88] = 0;
  _$jscoverage['/base/render.js'].lineData[89] = 0;
  _$jscoverage['/base/render.js'].lineData[92] = 0;
  _$jscoverage['/base/render.js'].lineData[93] = 0;
  _$jscoverage['/base/render.js'].lineData[100] = 0;
  _$jscoverage['/base/render.js'].lineData[101] = 0;
  _$jscoverage['/base/render.js'].lineData[102] = 0;
  _$jscoverage['/base/render.js'].lineData[107] = 0;
  _$jscoverage['/base/render.js'].lineData[114] = 0;
  _$jscoverage['/base/render.js'].lineData[118] = 0;
  _$jscoverage['/base/render.js'].lineData[122] = 0;
  _$jscoverage['/base/render.js'].lineData[123] = 0;
  _$jscoverage['/base/render.js'].lineData[125] = 0;
  _$jscoverage['/base/render.js'].lineData[126] = 0;
  _$jscoverage['/base/render.js'].lineData[127] = 0;
  _$jscoverage['/base/render.js'].lineData[130] = 0;
  _$jscoverage['/base/render.js'].lineData[131] = 0;
  _$jscoverage['/base/render.js'].lineData[132] = 0;
  _$jscoverage['/base/render.js'].lineData[136] = 0;
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
  _$jscoverage['/base/render.js'].branchData['55'] = [];
  _$jscoverage['/base/render.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['58'] = [];
  _$jscoverage['/base/render.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['81'] = [];
  _$jscoverage['/base/render.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['83'] = [];
  _$jscoverage['/base/render.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['92'] = [];
  _$jscoverage['/base/render.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['92'][3] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['100'] = [];
  _$jscoverage['/base/render.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/render.js'].branchData['122'] = [];
  _$jscoverage['/base/render.js'].branchData['122'][1] = new BranchData();
}
_$jscoverage['/base/render.js'].branchData['122'][1].init(3928, 11, 'supportCss3');
function visit9_122_1(result) {
  _$jscoverage['/base/render.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['100'][1].init(880, 9, 'pageIndex');
function visit8_100_1(result) {
  _$jscoverage['/base/render.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['92'][3].init(216, 19, 'top <= maxScrollTop');
function visit7_92_3(result) {
  _$jscoverage['/base/render.js'].branchData['92'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['92'][2].init(191, 21, 'left <= maxScrollLeft');
function visit6_92_2(result) {
  _$jscoverage['/base/render.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['92'][1].init(191, 44, 'left <= maxScrollLeft && top <= maxScrollTop');
function visit5_92_1(result) {
  _$jscoverage['/base/render.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['83'][1].init(99, 23, 'typeof snap == \'string\'');
function visit4_83_1(result) {
  _$jscoverage['/base/render.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['81'][1].init(1767, 4, 'snap');
function visit3_81_1(result) {
  _$jscoverage['/base/render.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['58'][1].init(1112, 25, 'scrollWidth > clientWidth');
function visit2_58_1(result) {
  _$jscoverage['/base/render.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].branchData['55'][1].init(1011, 27, 'scrollHeight > clientHeight');
function visit1_55_1(result) {
  _$jscoverage['/base/render.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/render.js'].lineData[6]++;
KISSY.add('scroll-view/base/render', function(S, Node, Container, ContentRenderExtension) {
  _$jscoverage['/base/render.js'].functionData[0]++;
  _$jscoverage['/base/render.js'].lineData[9]++;
  var Features = S.Features, supportCss3 = Features.isTransformSupported(), transformProperty;
  _$jscoverage['/base/render.js'].lineData[28]++;
  var methods = {
  syncUI: function() {
  _$jscoverage['/base/render.js'].functionData[1]++;
  _$jscoverage['/base/render.js'].lineData[30]++;
  var self = this, control = self.control, el = control.el, contentEl = control.contentEl, $contentEl = control.$contentEl;
  _$jscoverage['/base/render.js'].lineData[41]++;
  var scrollHeight = contentEl.offsetHeight, scrollWidth = contentEl.offsetWidth;
  _$jscoverage['/base/render.js'].lineData[44]++;
  var clientHeight = el.clientHeight, allowScroll, clientWidth = el.clientWidth;
  _$jscoverage['/base/render.js'].lineData[48]++;
  control.scrollHeight = scrollHeight;
  _$jscoverage['/base/render.js'].lineData[49]++;
  control.scrollWidth = scrollWidth;
  _$jscoverage['/base/render.js'].lineData[50]++;
  control.clientHeight = clientHeight;
  _$jscoverage['/base/render.js'].lineData[51]++;
  control.clientWidth = clientWidth;
  _$jscoverage['/base/render.js'].lineData[53]++;
  allowScroll = control.allowScroll = {};
  _$jscoverage['/base/render.js'].lineData[55]++;
  if (visit1_55_1(scrollHeight > clientHeight)) {
    _$jscoverage['/base/render.js'].lineData[56]++;
    allowScroll.top = 1;
  }
  _$jscoverage['/base/render.js'].lineData[58]++;
  if (visit2_58_1(scrollWidth > clientWidth)) {
    _$jscoverage['/base/render.js'].lineData[59]++;
    allowScroll.left = 1;
  }
  _$jscoverage['/base/render.js'].lineData[62]++;
  control.minScroll = {
  left: 0, 
  top: 0};
  _$jscoverage['/base/render.js'].lineData[67]++;
  var maxScrollLeft, maxScrollTop;
  _$jscoverage['/base/render.js'].lineData[70]++;
  control.maxScroll = {
  left: maxScrollLeft = scrollWidth - clientWidth, 
  top: maxScrollTop = scrollHeight - clientHeight};
  _$jscoverage['/base/render.js'].lineData[75]++;
  delete control.scrollStep;
  _$jscoverage['/base/render.js'].lineData[77]++;
  var snap = control.get('snap'), scrollLeft = control.get('scrollLeft'), scrollTop = control.get('scrollTop');
  _$jscoverage['/base/render.js'].lineData[81]++;
  if (visit3_81_1(snap)) {
    _$jscoverage['/base/render.js'].lineData[82]++;
    var elOffset = $contentEl.offset();
    _$jscoverage['/base/render.js'].lineData[83]++;
    var pages = control.pages = visit4_83_1(typeof snap == 'string') ? $contentEl.all(snap) : $contentEl.children(), pageIndex = control.get('pageIndex'), pagesOffset = control.pagesOffset = [];
    _$jscoverage['/base/render.js'].lineData[88]++;
    pages.each(function(p, i) {
  _$jscoverage['/base/render.js'].functionData[2]++;
  _$jscoverage['/base/render.js'].lineData[89]++;
  var offset = p.offset(), left = offset.left - elOffset.left, top = offset.top - elOffset.top;
  _$jscoverage['/base/render.js'].lineData[92]++;
  if (visit5_92_1(visit6_92_2(left <= maxScrollLeft) && visit7_92_3(top <= maxScrollTop))) {
    _$jscoverage['/base/render.js'].lineData[93]++;
    pagesOffset[i] = {
  left: left, 
  top: top, 
  index: i};
  }
});
    _$jscoverage['/base/render.js'].lineData[100]++;
    if (visit8_100_1(pageIndex)) {
      _$jscoverage['/base/render.js'].lineData[101]++;
      control.scrollToPage(pageIndex);
      _$jscoverage['/base/render.js'].lineData[102]++;
      return;
    }
  }
  _$jscoverage['/base/render.js'].lineData[107]++;
  control.scrollToWithBounds({
  left: scrollLeft, 
  top: scrollTop});
}, 
  '_onSetScrollLeft': function(v) {
  _$jscoverage['/base/render.js'].functionData[3]++;
  _$jscoverage['/base/render.js'].lineData[114]++;
  this.control.contentEl.style.left = -v + 'px';
}, 
  '_onSetScrollTop': function(v) {
  _$jscoverage['/base/render.js'].functionData[4]++;
  _$jscoverage['/base/render.js'].lineData[118]++;
  this.control.contentEl.style.top = -v + 'px';
}};
  _$jscoverage['/base/render.js'].lineData[122]++;
  if (visit9_122_1(supportCss3)) {
    _$jscoverage['/base/render.js'].lineData[123]++;
    transformProperty = Features.getTransformProperty();
    _$jscoverage['/base/render.js'].lineData[125]++;
    methods._onSetScrollLeft = function(v) {
  _$jscoverage['/base/render.js'].functionData[5]++;
  _$jscoverage['/base/render.js'].lineData[126]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[127]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -v + 'px,' + -control.get('scrollTop') + 'px,0)';
};
    _$jscoverage['/base/render.js'].lineData[130]++;
    methods._onSetScrollTop = function(v) {
  _$jscoverage['/base/render.js'].functionData[6]++;
  _$jscoverage['/base/render.js'].lineData[131]++;
  var control = this.control;
  _$jscoverage['/base/render.js'].lineData[132]++;
  control.contentEl.style[transformProperty] = 'translate3d(' + -control.get('scrollLeft') + 'px,' + -v + 'px,0)';
};
  }
  _$jscoverage['/base/render.js'].lineData[136]++;
  return Container.getDefaultRender().extend([ContentRenderExtension], methods, {
  name: 'ScrollViewRender'});
}, {
  requires: ['node', 'component/container', 'component/extension/content-render']});
