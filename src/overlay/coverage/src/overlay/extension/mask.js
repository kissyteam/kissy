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
if (! _$jscoverage['/overlay/extension/mask.js']) {
  _$jscoverage['/overlay/extension/mask.js'] = {};
  _$jscoverage['/overlay/extension/mask.js'].lineData = [];
  _$jscoverage['/overlay/extension/mask.js'].lineData[6] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[7] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[12] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[13] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[16] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[17] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[20] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[21] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[45] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[46] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[47] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[49] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[56] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[59] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[94] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[97] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[98] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[100] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[101] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[103] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[107] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[109] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[111] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[113] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[114] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[117] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[123] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[125] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[127] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[129] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[130] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[134] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[135] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[138] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[139] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[140] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[141] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[144] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[147] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[149] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[150] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[151] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[156] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[159] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[160] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[161] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[162] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[164] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[169] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[170] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[171] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[176] = 0;
}
if (! _$jscoverage['/overlay/extension/mask.js'].functionData) {
  _$jscoverage['/overlay/extension/mask.js'].functionData = [];
  _$jscoverage['/overlay/extension/mask.js'].functionData[0] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[1] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[2] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[3] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[4] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[5] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[6] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[7] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[8] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[9] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[10] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[11] = 0;
  _$jscoverage['/overlay/extension/mask.js'].functionData[12] = 0;
}
if (! _$jscoverage['/overlay/extension/mask.js'].branchData) {
  _$jscoverage['/overlay/extension/mask.js'].branchData = {};
  _$jscoverage['/overlay/extension/mask.js'].branchData['9'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['100'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['109'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['113'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['140'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'][1] = new BranchData();
}
_$jscoverage['/overlay/extension/mask.js'].branchData['161'][1].init(70, 17, 'mask.closeOnClick');
function visit28_161_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['150'][1].init(46, 16, 'self.get(\'mask\')');
function visit27_150_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['140'][1].init(77, 16, '!isNaN(elZIndex)');
function visit26_140_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['113'][1].init(94, 15, 'effect === NONE');
function visit25_113_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['109'][1].init(23, 19, 'mask.effect || NONE');
function visit24_109_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['100'][1].init(126, 5, 'shown');
function visit23_100_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['9'][1].init(61, 11, 'UA.ie === 6');
function visit22_9_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/overlay/extension/mask.js'].functionData[0]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[7]++;
  var UA = S.UA, Node = require('node'), ie6 = (visit22_9_1(UA.ie === 6)), $ = Node.all;
  _$jscoverage['/overlay/extension/mask.js'].lineData[12]++;
  function docWidth() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[1]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[13]++;
    return ie6 ? ('expression(KISSY.DOM.docWidth())') : '100%';
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[16]++;
  function docHeight() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[2]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[17]++;
    return ie6 ? ('expression(KISSY.DOM.docHeight())') : '100%';
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[20]++;
  function initMask(self, hiddenCls) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[3]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[21]++;
    var maskCls = self.view.getBaseCssClasses('mask'), mask = $('<div ' + ' style="width:' + docWidth() + ';' + 'left:0;' + 'top:0;' + 'height:' + docHeight() + ';' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';"' + ' class="' + maskCls + ' ' + hiddenCls + '">' + (ie6 ? '<' + 'iframe ' + 'style="position:absolute;' + 'left:' + '0' + ';' + 'top:' + '0' + ';' + 'background:red;' + 'width: expression(this.parentNode.offsetWidth);' + 'height: expression(this.parentNode.offsetHeight);' + 'filter:alpha(opacity=0);' + 'z-index:-1;"></iframe>' : '') + '</div>').prependTo('body');
    _$jscoverage['/overlay/extension/mask.js'].lineData[45]++;
    mask.unselectable();
    _$jscoverage['/overlay/extension/mask.js'].lineData[46]++;
    mask.on('mousedown', function(e) {
  _$jscoverage['/overlay/extension/mask.js'].functionData[4]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[47]++;
  e.preventDefault();
});
    _$jscoverage['/overlay/extension/mask.js'].lineData[49]++;
    return mask;
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[56]++;
  function Mask() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[5]++;
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[59]++;
  Mask.ATTRS = {
  mask: {
  value: false}, 
  maskNode: {}};
  _$jscoverage['/overlay/extension/mask.js'].lineData[94]++;
  var NONE = 'none', effects = {
  fade: ['Out', 'In'], 
  slide: ['Up', 'Down']};
  _$jscoverage['/overlay/extension/mask.js'].lineData[97]++;
  function setMaskVisible(self, shown) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[6]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[98]++;
    var maskNode = self.get('maskNode'), hiddenCls = self.view.getBaseCssClasses('mask-hidden');
    _$jscoverage['/overlay/extension/mask.js'].lineData[100]++;
    if (visit23_100_1(shown)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[101]++;
      maskNode.removeClass(hiddenCls);
    } else {
      _$jscoverage['/overlay/extension/mask.js'].lineData[103]++;
      maskNode.addClass(hiddenCls);
    }
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[107]++;
  function processMask(mask, el, show, self) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[7]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[109]++;
    var effect = visit24_109_1(mask.effect || NONE);
    _$jscoverage['/overlay/extension/mask.js'].lineData[111]++;
    setMaskVisible(self, show);
    _$jscoverage['/overlay/extension/mask.js'].lineData[113]++;
    if (visit25_113_1(effect === NONE)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[114]++;
      return;
    }
    _$jscoverage['/overlay/extension/mask.js'].lineData[117]++;
    var duration = mask.duration, easing = mask.easing, m, index = show ? 1 : 0;
    _$jscoverage['/overlay/extension/mask.js'].lineData[123]++;
    el.stop(1, 1);
    _$jscoverage['/overlay/extension/mask.js'].lineData[125]++;
    el.css('display', show ? NONE : 'block');
    _$jscoverage['/overlay/extension/mask.js'].lineData[127]++;
    m = effect + effects[effect][index];
    _$jscoverage['/overlay/extension/mask.js'].lineData[129]++;
    el[m](duration, function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[8]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[130]++;
  el.css('display', '');
}, easing);
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[134]++;
  function afterVisibleChange(e) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[9]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[135]++;
    var v, self = this, maskNode = self.get('maskNode');
    _$jscoverage['/overlay/extension/mask.js'].lineData[138]++;
    if ((v = e.newVal)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[139]++;
      var elZIndex = Number(self.$el.css('z-index'));
      _$jscoverage['/overlay/extension/mask.js'].lineData[140]++;
      if (visit26_140_1(!isNaN(elZIndex))) {
        _$jscoverage['/overlay/extension/mask.js'].lineData[141]++;
        maskNode.css('z-index', elZIndex);
      }
    }
    _$jscoverage['/overlay/extension/mask.js'].lineData[144]++;
    processMask(self.get('mask'), maskNode, v, self);
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[147]++;
  Mask.prototype = {
  __renderUI: function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[10]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[149]++;
  var self = this;
  _$jscoverage['/overlay/extension/mask.js'].lineData[150]++;
  if (visit27_150_1(self.get('mask'))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[151]++;
    self.set('maskNode', initMask(self, self.get('visible') ? '' : self.view.getBaseCssClasses('mask-hidden')));
  }
}, 
  __bindUI: function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[11]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[156]++;
  var self = this, maskNode, mask;
  _$jscoverage['/overlay/extension/mask.js'].lineData[159]++;
  if ((mask = self.get('mask'))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[160]++;
    maskNode = self.get('maskNode');
    _$jscoverage['/overlay/extension/mask.js'].lineData[161]++;
    if (visit28_161_1(mask.closeOnClick)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[162]++;
      maskNode.on(Node.Gesture.tap, self.close, self);
    }
    _$jscoverage['/overlay/extension/mask.js'].lineData[164]++;
    self.on('afterVisibleChange', afterVisibleChange);
  }
}, 
  __destructor: function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[12]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[169]++;
  var mask;
  _$jscoverage['/overlay/extension/mask.js'].lineData[170]++;
  if ((mask = this.get('maskNode'))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[171]++;
    mask.remove();
  }
}};
  _$jscoverage['/overlay/extension/mask.js'].lineData[176]++;
  return Mask;
});
