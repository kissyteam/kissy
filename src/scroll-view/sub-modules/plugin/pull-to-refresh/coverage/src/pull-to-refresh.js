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
if (! _$jscoverage['/pull-to-refresh.js']) {
  _$jscoverage['/pull-to-refresh.js'] = {};
  _$jscoverage['/pull-to-refresh.js'].lineData = [];
  _$jscoverage['/pull-to-refresh.js'].lineData[6] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[7] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[9] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[16] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[20] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[21] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[23] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[27] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[30] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[31] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[35] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[37] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[38] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[39] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[40] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[45] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[46] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[47] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[48] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[49] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[50] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[51] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[52] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[54] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[57] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[63] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[66] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[67] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[69] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[75] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[76] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[77] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[82] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[83] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[84] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[85] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[93] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[94] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[95] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[96] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[97] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[103] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[104] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[105] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[106] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[107] = 0;
  _$jscoverage['/pull-to-refresh.js'].lineData[111] = 0;
}
if (! _$jscoverage['/pull-to-refresh.js'].functionData) {
  _$jscoverage['/pull-to-refresh.js'].functionData = [];
  _$jscoverage['/pull-to-refresh.js'].functionData[0] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[1] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[2] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[3] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[4] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[5] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[6] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[7] = 0;
  _$jscoverage['/pull-to-refresh.js'].functionData[8] = 0;
}
if (! _$jscoverage['/pull-to-refresh.js'].branchData) {
  _$jscoverage['/pull-to-refresh.js'].branchData = {};
  _$jscoverage['/pull-to-refresh.js'].branchData['20'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['37'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['39'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['48'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['66'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/pull-to-refresh.js'].branchData['76'] = [];
  _$jscoverage['/pull-to-refresh.js'].branchData['76'][1] = new BranchData();
}
_$jscoverage['/pull-to-refresh.js'].branchData['76'][1].init(45, 5, 'v < 0');
function visit6_76_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['66'][1].init(729, 6, 'loadFn');
function visit5_66_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['48'][1].init(145, 18, '-b > self.elHeight');
function visit4_48_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['39'][1].init(199, 5, 'b < 0');
function visit3_39_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['37'][1].init(103, 18, '-b > self.elHeight');
function visit2_37_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].branchData['20'][1].init(18, 16, '!this.scrollView');
function visit1_20_1(result) {
  _$jscoverage['/pull-to-refresh.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/pull-to-refresh.js'].lineData[6]++;
KISSY.add('scroll-view/plugin/pull-to-refresh', function(S, Base) {
  _$jscoverage['/pull-to-refresh.js'].functionData[0]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[7]++;
  var substitute = S.substitute;
  _$jscoverage['/pull-to-refresh.js'].lineData[9]++;
  var transformProperty = S.Features.getTransformProperty();
  _$jscoverage['/pull-to-refresh.js'].lineData[16]++;
  return Base.extend({
  pluginId: this.getName(), 
  _onSetState: function(e) {
  _$jscoverage['/pull-to-refresh.js'].functionData[1]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[20]++;
  if (visit1_20_1(!this.scrollView)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[21]++;
    return;
  }
  _$jscoverage['/pull-to-refresh.js'].lineData[23]++;
  var status = e.newVal, self = this, prefixCls = self.scrollView.get('prefixCls'), $el = self.$el;
  _$jscoverage['/pull-to-refresh.js'].lineData[27]++;
  $el.attr('class', prefixCls + 'scroll-view-pull-to-refresh ' + prefixCls + 'scroll-view-' + status);
  _$jscoverage['/pull-to-refresh.js'].lineData[30]++;
  self.labelEl.html(self.get(status + 'Html'));
  _$jscoverage['/pull-to-refresh.js'].lineData[31]++;
  self.elHeight = $el.height();
}, 
  _onScrollMove: function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[2]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[35]++;
  var self = this, b = self.scrollView.get('scrollTop');
  _$jscoverage['/pull-to-refresh.js'].lineData[37]++;
  if (visit2_37_1(-b > self.elHeight)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[38]++;
    self.set('state', 'releasing');
  } else {
    _$jscoverage['/pull-to-refresh.js'].lineData[39]++;
    if (visit3_39_1(b < 0)) {
      _$jscoverage['/pull-to-refresh.js'].lineData[40]++;
      self.set('state', 'pulling');
    }
  }
}, 
  _onDragEnd: function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[3]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[45]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[46]++;
  var scrollView = self.scrollView;
  _$jscoverage['/pull-to-refresh.js'].lineData[47]++;
  var b = scrollView.get('scrollTop');
  _$jscoverage['/pull-to-refresh.js'].lineData[48]++;
  if (visit4_48_1(-b > self.elHeight)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[49]++;
    scrollView.minScroll.top = -self.elHeight;
    _$jscoverage['/pull-to-refresh.js'].lineData[50]++;
    var loadFn = self.get('loadFn');
    _$jscoverage['/pull-to-refresh.js'].lineData[51]++;
    self.set('state', 'loading');
    _$jscoverage['/pull-to-refresh.js'].lineData[52]++;
    function callback() {
      _$jscoverage['/pull-to-refresh.js'].functionData[4]++;
      _$jscoverage['/pull-to-refresh.js'].lineData[54]++;
      scrollView.scrollTo({
  top: -self.elHeight});
      _$jscoverage['/pull-to-refresh.js'].lineData[57]++;
      scrollView.scrollTo({
  top: scrollView.minScroll.top}, {
  duration: scrollView.get('snapDuration'), 
  easing: scrollView.get('snapEasing')});
      _$jscoverage['/pull-to-refresh.js'].lineData[63]++;
      self.set('state', 'pulling');
    }    _$jscoverage['/pull-to-refresh.js'].lineData[66]++;
    if (visit5_66_1(loadFn)) {
      _$jscoverage['/pull-to-refresh.js'].lineData[67]++;
      loadFn.call(self, callback);
    } else {
      _$jscoverage['/pull-to-refresh.js'].lineData[69]++;
      callback.call(self);
    }
  }
}, 
  _onSetScrollTop: function(v) {
  _$jscoverage['/pull-to-refresh.js'].functionData[5]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[75]++;
  v = v.newVal;
  _$jscoverage['/pull-to-refresh.js'].lineData[76]++;
  if (visit6_76_1(v < 0)) {
    _$jscoverage['/pull-to-refresh.js'].lineData[77]++;
    this.el.style[transformProperty] = 'translate3d(0,' + -v + 'px,0)';
  }
}, 
  pluginRenderUI: function(scrollView) {
  _$jscoverage['/pull-to-refresh.js'].functionData[6]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[82]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[83]++;
  self.scrollView = scrollView;
  _$jscoverage['/pull-to-refresh.js'].lineData[84]++;
  var prefixCls = scrollView.get('prefixCls');
  _$jscoverage['/pull-to-refresh.js'].lineData[85]++;
  var el = S.all(substitute('<div class="{prefixCls}scroll-view-pull-to-refresh">' + '<div class="{prefixCls}scroll-view-pull-to-refresh-content">' + '<span class="{prefixCls}scroll-view-pull-icon"></span>' + '<span class="{prefixCls}scroll-view-pull-label"></span>' + '</div>' + '</div>', {
  prefixCls: prefixCls}));
  _$jscoverage['/pull-to-refresh.js'].lineData[93]++;
  self.labelEl = el.one('.' + prefixCls + 'scroll-view-pull-label');
  _$jscoverage['/pull-to-refresh.js'].lineData[94]++;
  scrollView.get('el').prepend(el);
  _$jscoverage['/pull-to-refresh.js'].lineData[95]++;
  self.$el = el;
  _$jscoverage['/pull-to-refresh.js'].lineData[96]++;
  self.el = el[0];
  _$jscoverage['/pull-to-refresh.js'].lineData[97]++;
  self._onSetState({
  newValue: 'pulling'});
}, 
  pluginBindUI: function(scrollView) {
  _$jscoverage['/pull-to-refresh.js'].functionData[7]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[103]++;
  var self = this;
  _$jscoverage['/pull-to-refresh.js'].lineData[104]++;
  scrollView.on('scrollMove', self._onScrollMove, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[105]++;
  scrollView.on('dragend', self._onDragEnd, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[106]++;
  self.on('afterStateChange', self._onSetState, self);
  _$jscoverage['/pull-to-refresh.js'].lineData[107]++;
  scrollView.on('afterScrollTopChange', self._onSetScrollTop, self);
}, 
  pluginDestructor: function() {
  _$jscoverage['/pull-to-refresh.js'].functionData[8]++;
  _$jscoverage['/pull-to-refresh.js'].lineData[111]++;
  this.$el.remove();
}}, {
  ATTRS: {
  pullingHtml: {
  value: 'Pull down to refresh...'}, 
  releasingHtml: {
  value: 'release to refresh...'}, 
  loadingHtml: {
  value: 'loading...'}, 
  loadFn: {}, 
  state: {
  value: 'pulling'}}});
}, {
  requires: ['base']});
