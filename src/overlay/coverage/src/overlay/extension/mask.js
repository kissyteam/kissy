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
  _$jscoverage['/overlay/extension/mask.js'].lineData[11] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[12] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[15] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[16] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[19] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[20] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[44] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[45] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[46] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[48] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[55] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[58] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[93] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[96] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[97] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[99] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[100] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[102] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[106] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[108] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[110] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[112] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[113] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[116] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[122] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[124] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[126] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[128] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[129] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[133] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[134] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[137] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[138] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[139] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[140] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[143] = 0;
  _$jscoverage['/overlay/extension/mask.js'].lineData[146] = 0;
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
  _$jscoverage['/overlay/extension/mask.js'].branchData['8'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['99'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['108'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['112'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['137'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['139'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['159'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/overlay/extension/mask.js'].branchData['170'] = [];
  _$jscoverage['/overlay/extension/mask.js'].branchData['170'][1] = new BranchData();
}
_$jscoverage['/overlay/extension/mask.js'].branchData['170'][1].init(41, 27, 'mask = this.get("maskNode")');
function visit25_170_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['161'][1].init(72, 20, 'mask[\'closeOnClick\']');
function visit24_161_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['159'][1].init(98, 23, 'mask = self.get("mask")');
function visit23_159_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['150'][1].init(48, 16, 'self.get(\'mask\')');
function visit22_150_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['139'][1].init(79, 16, '!isNaN(elZIndex)');
function visit21_139_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['137'][1].init(102, 12, 'v = e.newVal');
function visit20_137_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['112'][1].init(100, 14, 'effect == NONE');
function visit19_112_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['108'][1].init(25, 19, 'mask.effect || NONE');
function visit18_108_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['99'][1].init(129, 5, 'shown');
function visit17_99_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].branchData['8'][1].init(30, 14, 'UA[\'ie\'] === 6');
function visit16_8_1(result) {
  _$jscoverage['/overlay/extension/mask.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/overlay/extension/mask.js'].lineData[6]++;
KISSY.add("overlay/extension/mask", function(S, Node) {
  _$jscoverage['/overlay/extension/mask.js'].functionData[0]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[7]++;
  var UA = S.UA, ie6 = (visit16_8_1(UA['ie'] === 6)), $ = Node.all;
  _$jscoverage['/overlay/extension/mask.js'].lineData[11]++;
  function docWidth() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[1]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[12]++;
    return ie6 ? ("expression(KISSY.DOM.docWidth())") : "100%";
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[15]++;
  function docHeight() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[2]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[16]++;
    return ie6 ? ("expression(KISSY.DOM.docHeight())") : "100%";
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[19]++;
  function initMask(self) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[3]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[20]++;
    var maskCls = self.view.getBaseCssClasses('mask'), mask = $("<div " + " style='width:" + docWidth() + ";" + "left:0;" + "top:0;" + "height:" + docHeight() + ";" + "position:" + (ie6 ? "absolute" : "fixed") + ";'" + " class='" + maskCls + "'>" + (ie6 ? "<" + "iframe " + "style='position:absolute;" + "left:" + "0" + ";" + "top:" + "0" + ";" + "background:red;" + "width: expression(this.parentNode.offsetWidth);" + "height: expression(this.parentNode.offsetHeight);" + "filter:alpha(opacity=0);" + "z-index:-1;'></iframe>" : "") + "</div>").prependTo("body");
    _$jscoverage['/overlay/extension/mask.js'].lineData[44]++;
    mask['unselectable']();
    _$jscoverage['/overlay/extension/mask.js'].lineData[45]++;
    mask.on("mousedown", function(e) {
  _$jscoverage['/overlay/extension/mask.js'].functionData[4]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[46]++;
  e.preventDefault();
});
    _$jscoverage['/overlay/extension/mask.js'].lineData[48]++;
    return mask;
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[55]++;
  function Mask() {
    _$jscoverage['/overlay/extension/mask.js'].functionData[5]++;
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[58]++;
  Mask.ATTRS = {
  mask: {
  value: false}, 
  maskNode: {}};
  _$jscoverage['/overlay/extension/mask.js'].lineData[93]++;
  var NONE = 'none', effects = {
  fade: ["Out", "In"], 
  slide: ["Up", "Down"]};
  _$jscoverage['/overlay/extension/mask.js'].lineData[96]++;
  function setMaskVisible(self, shown) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[6]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[97]++;
    var maskNode = self.get('maskNode'), hiddenCls = self.view.getBaseCssClasses('mask-hidden');
    _$jscoverage['/overlay/extension/mask.js'].lineData[99]++;
    if (visit17_99_1(shown)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[100]++;
      maskNode.removeClass(hiddenCls);
    } else {
      _$jscoverage['/overlay/extension/mask.js'].lineData[102]++;
      maskNode.addClass(hiddenCls);
    }
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[106]++;
  function processMask(mask, el, show, self) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[7]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[108]++;
    var effect = visit18_108_1(mask.effect || NONE);
    _$jscoverage['/overlay/extension/mask.js'].lineData[110]++;
    setMaskVisible(self, show);
    _$jscoverage['/overlay/extension/mask.js'].lineData[112]++;
    if (visit19_112_1(effect == NONE)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[113]++;
      return;
    }
    _$jscoverage['/overlay/extension/mask.js'].lineData[116]++;
    var duration = mask.duration, easing = mask.easing, m, index = show ? 1 : 0;
    _$jscoverage['/overlay/extension/mask.js'].lineData[122]++;
    el.stop(1, 1);
    _$jscoverage['/overlay/extension/mask.js'].lineData[124]++;
    el.css('display', show ? NONE : 'block');
    _$jscoverage['/overlay/extension/mask.js'].lineData[126]++;
    m = effect + effects[effect][index];
    _$jscoverage['/overlay/extension/mask.js'].lineData[128]++;
    el[m](duration, function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[8]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[129]++;
  el.css('display', '');
}, easing);
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[133]++;
  function afterVisibleChange(e) {
    _$jscoverage['/overlay/extension/mask.js'].functionData[9]++;
    _$jscoverage['/overlay/extension/mask.js'].lineData[134]++;
    var v, self = this, maskNode = self.get('maskNode');
    _$jscoverage['/overlay/extension/mask.js'].lineData[137]++;
    if (visit20_137_1(v = e.newVal)) {
      _$jscoverage['/overlay/extension/mask.js'].lineData[138]++;
      var elZIndex = Number(self.$el.css('z-index'));
      _$jscoverage['/overlay/extension/mask.js'].lineData[139]++;
      if (visit21_139_1(!isNaN(elZIndex))) {
        _$jscoverage['/overlay/extension/mask.js'].lineData[140]++;
        maskNode.css('z-index', elZIndex);
      }
    }
    _$jscoverage['/overlay/extension/mask.js'].lineData[143]++;
    processMask(self.get('mask'), maskNode, v, self);
  }
  _$jscoverage['/overlay/extension/mask.js'].lineData[146]++;
  Mask.prototype = {
  __renderUI: function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[10]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[149]++;
  var self = this;
  _$jscoverage['/overlay/extension/mask.js'].lineData[150]++;
  if (visit22_150_1(self.get('mask'))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[151]++;
    self.set('maskNode', initMask(self));
  }
}, 
  __bindUI: function() {
  _$jscoverage['/overlay/extension/mask.js'].functionData[11]++;
  _$jscoverage['/overlay/extension/mask.js'].lineData[156]++;
  var self = this, maskNode, mask;
  _$jscoverage['/overlay/extension/mask.js'].lineData[159]++;
  if (visit23_159_1(mask = self.get("mask"))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[160]++;
    maskNode = self.get('maskNode');
    _$jscoverage['/overlay/extension/mask.js'].lineData[161]++;
    if (visit24_161_1(mask['closeOnClick'])) {
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
  if (visit25_170_1(mask = this.get("maskNode"))) {
    _$jscoverage['/overlay/extension/mask.js'].lineData[171]++;
    mask.remove();
  }
}};
  _$jscoverage['/overlay/extension/mask.js'].lineData[176]++;
  return Mask;
}, {
  requires: ["node"]});
