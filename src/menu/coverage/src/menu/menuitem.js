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
if (! _$jscoverage['/menu/menuitem.js']) {
  _$jscoverage['/menu/menuitem.js'] = {};
  _$jscoverage['/menu/menuitem.js'].lineData = [];
  _$jscoverage['/menu/menuitem.js'].lineData[6] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[7] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[8] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[16] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[20] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[22] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[23] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[37] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[38] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[41] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[43] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[44] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[46] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[47] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[53] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[55] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[56] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[57] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[58] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[60] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[62] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[67] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[68] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[72] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[74] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[75] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[77] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[86] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[88] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[97] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[98] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[122] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].functionData) {
  _$jscoverage['/menu/menuitem.js'].functionData = [];
  _$jscoverage['/menu/menuitem.js'].functionData[0] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[1] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[2] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[3] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[4] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[5] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[6] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[7] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].branchData) {
  _$jscoverage['/menu/menuitem.js'].branchData = {};
  _$jscoverage['/menu/menuitem.js'].branchData['22'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['43'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['56'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['56'][2] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['57'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['60'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['67'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['72'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['74'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['98'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['98'][3] = new BranchData();
}
_$jscoverage['/menu/menuitem.js'].branchData['98'][3].init(62, 18, '$el[0] === element');
function visit37_98_3(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['98'][2].init(62, 43, '$el[0] === element || $el.contains(element)');
function visit36_98_2(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['98'][1].init(54, 52, '$el && ($el[0] === element || $el.contains(element))');
function visit35_98_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['74'][1].init(332, 2, '!p');
function visit34_74_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['72'][1].init(33, 34, '$(e).css(\'overflow\') !== \'visible\'');
function visit33_72_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['67'][1].init(567, 1, 'v');
function visit32_67_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['60'][1].init(26, 1, 'v');
function visit31_60_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['57'][1].init(22, 20, 'self.get(\'rendered\')');
function visit30_57_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['56'][2].init(131, 31, 'e && e.byPassSetHighlightedItem');
function visit29_56_2(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['56'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['56'][1].init(129, 34, '!(e && e.byPassSetHighlightedItem)');
function visit28_56_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['43'][1].init(242, 22, 'self.get(\'selectable\')');
function visit27_43_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['22'][1].init(128, 19, 'renderData.selected');
function visit26_22_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menu/menuitem.js'].functionData[0]++;
  _$jscoverage['/menu/menuitem.js'].lineData[7]++;
  var Control = require('component/control');
  _$jscoverage['/menu/menuitem.js'].lineData[8]++;
  var $ = require('node').all;
  _$jscoverage['/menu/menuitem.js'].lineData[16]++;
  return Control.extend({
  isMenuItem: 1, 
  beforeCreateDom: function(renderData) {
  _$jscoverage['/menu/menuitem.js'].functionData[1]++;
  _$jscoverage['/menu/menuitem.js'].lineData[20]++;
  renderData.elAttrs.role = renderData.selectable ? 'menuitemradio' : 'menuitem';
  _$jscoverage['/menu/menuitem.js'].lineData[22]++;
  if (visit26_22_1(renderData.selected)) {
    _$jscoverage['/menu/menuitem.js'].lineData[23]++;
    renderData.elCls.push(this.getBaseCssClasses('selected'));
  }
}, 
  handleClickInternal: function(ev) {
  _$jscoverage['/menu/menuitem.js'].functionData[2]++;
  _$jscoverage['/menu/menuitem.js'].lineData[37]++;
  var self = this;
  _$jscoverage['/menu/menuitem.js'].lineData[38]++;
  self.callSuper(ev);
  _$jscoverage['/menu/menuitem.js'].lineData[41]++;
  ev.preventDefault();
  _$jscoverage['/menu/menuitem.js'].lineData[43]++;
  if (visit27_43_1(self.get('selectable'))) {
    _$jscoverage['/menu/menuitem.js'].lineData[44]++;
    self.set('selected', true);
  }
  _$jscoverage['/menu/menuitem.js'].lineData[46]++;
  self.fire('click');
  _$jscoverage['/menu/menuitem.js'].lineData[47]++;
  return true;
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/menuitem.js'].functionData[3]++;
  _$jscoverage['/menu/menuitem.js'].lineData[53]++;
  var self = this, parent = self.get('parent');
  _$jscoverage['/menu/menuitem.js'].lineData[55]++;
  self.callSuper(v, e);
  _$jscoverage['/menu/menuitem.js'].lineData[56]++;
  if (visit28_56_1(!(visit29_56_2(e && e.byPassSetHighlightedItem)))) {
    _$jscoverage['/menu/menuitem.js'].lineData[57]++;
    if (visit30_57_1(self.get('rendered'))) {
      _$jscoverage['/menu/menuitem.js'].lineData[58]++;
      parent.set('highlightedItem', v ? self : null);
    } else {
      _$jscoverage['/menu/menuitem.js'].lineData[60]++;
      if (visit31_60_1(v)) {
        _$jscoverage['/menu/menuitem.js'].lineData[62]++;
        parent.set('highlightedItem', self);
      }
    }
  }
  _$jscoverage['/menu/menuitem.js'].lineData[67]++;
  if (visit32_67_1(v)) {
    _$jscoverage['/menu/menuitem.js'].lineData[68]++;
    var el = self.$el, p = el.parent(function(e) {
  _$jscoverage['/menu/menuitem.js'].functionData[4]++;
  _$jscoverage['/menu/menuitem.js'].lineData[72]++;
  return visit33_72_1($(e).css('overflow') !== 'visible');
}, parent.get('el').parent());
    _$jscoverage['/menu/menuitem.js'].lineData[74]++;
    if (visit34_74_1(!p)) {
      _$jscoverage['/menu/menuitem.js'].lineData[75]++;
      return;
    }
    _$jscoverage['/menu/menuitem.js'].lineData[77]++;
    el.scrollIntoView(p, {
  alignWithTop: true, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  _onSetSelected: function(v) {
  _$jscoverage['/menu/menuitem.js'].functionData[5]++;
  _$jscoverage['/menu/menuitem.js'].lineData[86]++;
  var self = this, cls = self.getBaseCssClasses('selected');
  _$jscoverage['/menu/menuitem.js'].lineData[88]++;
  self.$el[v ? 'addClass' : 'removeClass'](cls);
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/menuitem.js'].functionData[6]++;
  _$jscoverage['/menu/menuitem.js'].lineData[97]++;
  var $el = this.$el;
  _$jscoverage['/menu/menuitem.js'].lineData[98]++;
  return visit35_98_1($el && (visit36_98_2(visit37_98_3($el[0] === element) || $el.contains(element))));
}}, {
  ATTRS: {
  focusable: {
  value: false}, 
  handleGestureEvents: {
  value: false}, 
  selectable: {
  sync: 0, 
  render: 1, 
  parse: function(el) {
  _$jscoverage['/menu/menuitem.js'].functionData[7]++;
  _$jscoverage['/menu/menuitem.js'].lineData[122]++;
  return el.hasClass(this.getBaseCssClass('selectable'));
}}, 
  value: {}, 
  selected: {
  sync: 0, 
  render: 1}}, 
  xclass: 'menuitem'});
});
