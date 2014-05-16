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
  _$jscoverage['/menu/menuitem.js'].lineData[31] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[32] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[35] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[36] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[37] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[43] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[45] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[46] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[47] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[48] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[50] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[52] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[57] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[58] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[62] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[64] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[65] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[67] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[81] = 0;
  _$jscoverage['/menu/menuitem.js'].lineData[82] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].functionData) {
  _$jscoverage['/menu/menuitem.js'].functionData = [];
  _$jscoverage['/menu/menuitem.js'].functionData[0] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[1] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[2] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[3] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[4] = 0;
  _$jscoverage['/menu/menuitem.js'].functionData[5] = 0;
}
if (! _$jscoverage['/menu/menuitem.js'].branchData) {
  _$jscoverage['/menu/menuitem.js'].branchData = {};
  _$jscoverage['/menu/menuitem.js'].branchData['46'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['47'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['50'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['57'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['62'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['64'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['82'] = [];
  _$jscoverage['/menu/menuitem.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/menu/menuitem.js'].branchData['82'][3] = new BranchData();
}
_$jscoverage['/menu/menuitem.js'].branchData['82'][3].init(62, 18, '$el[0] === element');
function visit35_82_3(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['82'][3].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['82'][2].init(62, 43, '$el[0] === element || $el.contains(element)');
function visit34_82_2(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['82'][1].init(54, 52, '$el && ($el[0] === element || $el.contains(element))');
function visit33_82_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['64'][1].init(332, 2, '!p');
function visit32_64_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['62'][1].init(33, 34, '$(e).css(\'overflow\') !== \'visible\'');
function visit31_62_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['57'][1].init(567, 1, 'v');
function visit30_57_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['50'][1].init(26, 1, 'v');
function visit29_50_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['47'][1].init(22, 20, 'self.get(\'rendered\')');
function visit28_47_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['46'][2].init(131, 31, 'e && e.byPassSetHighlightedItem');
function visit27_46_2(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/menu/menuitem.js'].branchData['46'][1].init(129, 34, '!(e && e.byPassSetHighlightedItem)');
function visit26_46_1(result) {
  _$jscoverage['/menu/menuitem.js'].branchData['46'][1].ranCondition(result);
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
  renderData.elAttrs.role = 'menuitem';
}, 
  handleClickInternal: function(ev) {
  _$jscoverage['/menu/menuitem.js'].functionData[2]++;
  _$jscoverage['/menu/menuitem.js'].lineData[31]++;
  var self = this;
  _$jscoverage['/menu/menuitem.js'].lineData[32]++;
  self.callSuper(ev);
  _$jscoverage['/menu/menuitem.js'].lineData[35]++;
  ev.preventDefault();
  _$jscoverage['/menu/menuitem.js'].lineData[36]++;
  self.fire('click');
  _$jscoverage['/menu/menuitem.js'].lineData[37]++;
  return true;
}, 
  _onSetHighlighted: function(v, e) {
  _$jscoverage['/menu/menuitem.js'].functionData[3]++;
  _$jscoverage['/menu/menuitem.js'].lineData[43]++;
  var self = this, parent = self.get('parent');
  _$jscoverage['/menu/menuitem.js'].lineData[45]++;
  self.callSuper(v, e);
  _$jscoverage['/menu/menuitem.js'].lineData[46]++;
  if (visit26_46_1(!(visit27_46_2(e && e.byPassSetHighlightedItem)))) {
    _$jscoverage['/menu/menuitem.js'].lineData[47]++;
    if (visit28_47_1(self.get('rendered'))) {
      _$jscoverage['/menu/menuitem.js'].lineData[48]++;
      parent.set('highlightedItem', v ? self : null);
    } else {
      _$jscoverage['/menu/menuitem.js'].lineData[50]++;
      if (visit29_50_1(v)) {
        _$jscoverage['/menu/menuitem.js'].lineData[52]++;
        parent.set('highlightedItem', self);
      }
    }
  }
  _$jscoverage['/menu/menuitem.js'].lineData[57]++;
  if (visit30_57_1(v)) {
    _$jscoverage['/menu/menuitem.js'].lineData[58]++;
    var el = self.$el, p = el.parent(function(e) {
  _$jscoverage['/menu/menuitem.js'].functionData[4]++;
  _$jscoverage['/menu/menuitem.js'].lineData[62]++;
  return visit31_62_1($(e).css('overflow') !== 'visible');
}, parent.get('el').parent());
    _$jscoverage['/menu/menuitem.js'].lineData[64]++;
    if (visit32_64_1(!p)) {
      _$jscoverage['/menu/menuitem.js'].lineData[65]++;
      return;
    }
    _$jscoverage['/menu/menuitem.js'].lineData[67]++;
    el.scrollIntoView(p, {
  alignWithTop: true, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
}, 
  containsElement: function(element) {
  _$jscoverage['/menu/menuitem.js'].functionData[5]++;
  _$jscoverage['/menu/menuitem.js'].lineData[81]++;
  var $el = this.$el;
  _$jscoverage['/menu/menuitem.js'].lineData[82]++;
  return visit33_82_1($el && (visit34_82_2(visit35_82_3($el[0] === element) || $el.contains(element))));
}}, {
  ATTRS: {
  focusable: {
  value: false}, 
  handleGestureEvents: {
  value: false}}, 
  xclass: 'menuitem'});
});
