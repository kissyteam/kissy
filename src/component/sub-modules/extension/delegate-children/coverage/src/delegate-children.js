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
if (! _$jscoverage['/delegate-children.js']) {
  _$jscoverage['/delegate-children.js'] = {};
  _$jscoverage['/delegate-children.js'].lineData = [];
  _$jscoverage['/delegate-children.js'].lineData[6] = 0;
  _$jscoverage['/delegate-children.js'].lineData[7] = 0;
  _$jscoverage['/delegate-children.js'].lineData[9] = 0;
  _$jscoverage['/delegate-children.js'].lineData[15] = 0;
  _$jscoverage['/delegate-children.js'].lineData[16] = 0;
  _$jscoverage['/delegate-children.js'].lineData[17] = 0;
  _$jscoverage['/delegate-children.js'].lineData[19] = 0;
  _$jscoverage['/delegate-children.js'].lineData[23] = 0;
  _$jscoverage['/delegate-children.js'].lineData[24] = 0;
  _$jscoverage['/delegate-children.js'].lineData[25] = 0;
  _$jscoverage['/delegate-children.js'].lineData[27] = 0;
  _$jscoverage['/delegate-children.js'].lineData[28] = 0;
  _$jscoverage['/delegate-children.js'].lineData[37] = 0;
  _$jscoverage['/delegate-children.js'].lineData[38] = 0;
  _$jscoverage['/delegate-children.js'].lineData[39] = 0;
  _$jscoverage['/delegate-children.js'].lineData[41] = 0;
  _$jscoverage['/delegate-children.js'].lineData[44] = 0;
  _$jscoverage['/delegate-children.js'].lineData[46] = 0;
  _$jscoverage['/delegate-children.js'].lineData[47] = 0;
  _$jscoverage['/delegate-children.js'].lineData[48] = 0;
  _$jscoverage['/delegate-children.js'].lineData[49] = 0;
  _$jscoverage['/delegate-children.js'].lineData[51] = 0;
  _$jscoverage['/delegate-children.js'].lineData[53] = 0;
  _$jscoverage['/delegate-children.js'].lineData[54] = 0;
  _$jscoverage['/delegate-children.js'].lineData[56] = 0;
  _$jscoverage['/delegate-children.js'].lineData[57] = 0;
  _$jscoverage['/delegate-children.js'].lineData[59] = 0;
  _$jscoverage['/delegate-children.js'].lineData[60] = 0;
  _$jscoverage['/delegate-children.js'].lineData[62] = 0;
  _$jscoverage['/delegate-children.js'].lineData[63] = 0;
  _$jscoverage['/delegate-children.js'].lineData[65] = 0;
  _$jscoverage['/delegate-children.js'].lineData[66] = 0;
  _$jscoverage['/delegate-children.js'].lineData[68] = 0;
  _$jscoverage['/delegate-children.js'].lineData[69] = 0;
  _$jscoverage['/delegate-children.js'].lineData[71] = 0;
  _$jscoverage['/delegate-children.js'].lineData[72] = 0;
  _$jscoverage['/delegate-children.js'].lineData[74] = 0;
  _$jscoverage['/delegate-children.js'].lineData[81] = 0;
  _$jscoverage['/delegate-children.js'].lineData[86] = 0;
  _$jscoverage['/delegate-children.js'].lineData[87] = 0;
  _$jscoverage['/delegate-children.js'].lineData[90] = 0;
  _$jscoverage['/delegate-children.js'].lineData[93] = 0;
  _$jscoverage['/delegate-children.js'].lineData[104] = 0;
  _$jscoverage['/delegate-children.js'].lineData[108] = 0;
}
if (! _$jscoverage['/delegate-children.js'].functionData) {
  _$jscoverage['/delegate-children.js'].functionData = [];
  _$jscoverage['/delegate-children.js'].functionData[0] = 0;
  _$jscoverage['/delegate-children.js'].functionData[1] = 0;
  _$jscoverage['/delegate-children.js'].functionData[2] = 0;
  _$jscoverage['/delegate-children.js'].functionData[3] = 0;
  _$jscoverage['/delegate-children.js'].functionData[4] = 0;
  _$jscoverage['/delegate-children.js'].functionData[5] = 0;
  _$jscoverage['/delegate-children.js'].functionData[6] = 0;
}
if (! _$jscoverage['/delegate-children.js'].branchData) {
  _$jscoverage['/delegate-children.js'].branchData = {};
  _$jscoverage['/delegate-children.js'].branchData['16'] = [];
  _$jscoverage['/delegate-children.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['24'] = [];
  _$jscoverage['/delegate-children.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['27'] = [];
  _$jscoverage['/delegate-children.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['46'] = [];
  _$jscoverage['/delegate-children.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['48'] = [];
  _$jscoverage['/delegate-children.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['86'] = [];
  _$jscoverage['/delegate-children.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['91'] = [];
  _$jscoverage['/delegate-children.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['91'][2] = new BranchData();
}
_$jscoverage['/delegate-children.js'].branchData['91'][2].init(62, 6, 'ie < 9');
function visit8_91_2(result) {
  _$jscoverage['/delegate-children.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['91'][1].init(56, 12, 'ie && ie < 9');
function visit7_91_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['86'][1].init(167, 14, 'Gesture.cancel');
function visit6_86_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['48'][1].init(76, 35, 'control && !control.get(\'disabled\')');
function visit5_48_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['46'][1].init(17, 21, '!this.get(\'disabled\')');
function visit4_46_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['27'][1].init(86, 2, 'el');
function visit3_27_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['24'][1].init(13, 17, 'e.target === this');
function visit2_24_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['16'][1].init(13, 17, 'e.target === this');
function visit1_16_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/delegate-children.js'].functionData[0]++;
  _$jscoverage['/delegate-children.js'].lineData[7]++;
  var Node = require('node'), Manager = require('component/manager');
  _$jscoverage['/delegate-children.js'].lineData[9]++;
  var UA = S.UA, ie = UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/delegate-children.js'].lineData[15]++;
  function onRenderChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[1]++;
    _$jscoverage['/delegate-children.js'].lineData[16]++;
    if (visit1_16_1(e.target === this)) {
      _$jscoverage['/delegate-children.js'].lineData[17]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[19]++;
      el.addClass(this.__childClsTag);
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[23]++;
  function onRemoveChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[2]++;
    _$jscoverage['/delegate-children.js'].lineData[24]++;
    if (visit2_24_1(e.target === this)) {
      _$jscoverage['/delegate-children.js'].lineData[25]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[27]++;
      if (visit3_27_1(el)) {
        _$jscoverage['/delegate-children.js'].lineData[28]++;
        el.removeClass(this.__childClsTag);
      }
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[37]++;
  function DelegateChildren() {
    _$jscoverage['/delegate-children.js'].functionData[3]++;
    _$jscoverage['/delegate-children.js'].lineData[38]++;
    var self = this;
    _$jscoverage['/delegate-children.js'].lineData[39]++;
    self.__childClsTag = S.guid('ks-component-child');
    _$jscoverage['/delegate-children.js'].lineData[41]++;
    self.on('afterRenderChild', onRenderChild, self).on('afterRemoveChild', onRemoveChild, self);
  }
  _$jscoverage['/delegate-children.js'].lineData[44]++;
  S.augment(DelegateChildren, {
  handleChildrenEvents: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[4]++;
  _$jscoverage['/delegate-children.js'].lineData[46]++;
  if (visit4_46_1(!this.get('disabled'))) {
    _$jscoverage['/delegate-children.js'].lineData[47]++;
    var control = this.getOwnerControl(e);
    _$jscoverage['/delegate-children.js'].lineData[48]++;
    if (visit5_48_1(control && !control.get('disabled'))) {
      _$jscoverage['/delegate-children.js'].lineData[49]++;
      e.stopPropagation();
      _$jscoverage['/delegate-children.js'].lineData[51]++;
      switch (e.type) {
        case Gesture.start:
          _$jscoverage['/delegate-children.js'].lineData[53]++;
          control.handleMouseDown(e);
          _$jscoverage['/delegate-children.js'].lineData[54]++;
          break;
        case Gesture.end:
          _$jscoverage['/delegate-children.js'].lineData[56]++;
          control.handleMouseUp(e);
          _$jscoverage['/delegate-children.js'].lineData[57]++;
          break;
        case Gesture.tap:
          _$jscoverage['/delegate-children.js'].lineData[59]++;
          control.handleClick(e);
          _$jscoverage['/delegate-children.js'].lineData[60]++;
          break;
        case 'mouseenter':
          _$jscoverage['/delegate-children.js'].lineData[62]++;
          control.handleMouseEnter(e);
          _$jscoverage['/delegate-children.js'].lineData[63]++;
          break;
        case 'mouseleave':
          _$jscoverage['/delegate-children.js'].lineData[65]++;
          control.handleMouseLeave(e);
          _$jscoverage['/delegate-children.js'].lineData[66]++;
          break;
        case 'contextmenu':
          _$jscoverage['/delegate-children.js'].lineData[68]++;
          control.handleContextMenu(e);
          _$jscoverage['/delegate-children.js'].lineData[69]++;
          break;
        case 'dblclick':
          _$jscoverage['/delegate-children.js'].lineData[71]++;
          control.handleDblClick(e);
          _$jscoverage['/delegate-children.js'].lineData[72]++;
          break;
        default:
          _$jscoverage['/delegate-children.js'].lineData[74]++;
          S.error(e.type + ' unhandled!');
      }
    }
  }
}, 
  __bindUI: function() {
  _$jscoverage['/delegate-children.js'].functionData[5]++;
  _$jscoverage['/delegate-children.js'].lineData[81]++;
  var self = this, events = Gesture.start + ' ' + Gesture.end + ' ' + Gesture.tap;
  _$jscoverage['/delegate-children.js'].lineData[86]++;
  if (visit6_86_1(Gesture.cancel)) {
    _$jscoverage['/delegate-children.js'].lineData[87]++;
    events += ' ' + Gesture.cancel;
  }
  _$jscoverage['/delegate-children.js'].lineData[90]++;
  events += ' mouseenter mouseleave contextmenu ' + (visit7_91_1(ie && visit8_91_2(ie < 9)) ? 'dblclick ' : '');
  _$jscoverage['/delegate-children.js'].lineData[93]++;
  self.$el.delegate(events, '.' + self.__childClsTag, self.handleChildrenEvents, self);
}, 
  getOwnerControl: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[6]++;
  _$jscoverage['/delegate-children.js'].lineData[104]++;
  return Manager.getComponent(e.currentTarget.id);
}});
  _$jscoverage['/delegate-children.js'].lineData[108]++;
  return DelegateChildren;
});
