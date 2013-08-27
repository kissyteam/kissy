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
  _$jscoverage['/delegate-children.js'].lineData[8] = 0;
  _$jscoverage['/delegate-children.js'].lineData[14] = 0;
  _$jscoverage['/delegate-children.js'].lineData[15] = 0;
  _$jscoverage['/delegate-children.js'].lineData[16] = 0;
  _$jscoverage['/delegate-children.js'].lineData[18] = 0;
  _$jscoverage['/delegate-children.js'].lineData[22] = 0;
  _$jscoverage['/delegate-children.js'].lineData[23] = 0;
  _$jscoverage['/delegate-children.js'].lineData[24] = 0;
  _$jscoverage['/delegate-children.js'].lineData[26] = 0;
  _$jscoverage['/delegate-children.js'].lineData[27] = 0;
  _$jscoverage['/delegate-children.js'].lineData[32] = 0;
  _$jscoverage['/delegate-children.js'].lineData[33] = 0;
  _$jscoverage['/delegate-children.js'].lineData[34] = 0;
  _$jscoverage['/delegate-children.js'].lineData[36] = 0;
  _$jscoverage['/delegate-children.js'].lineData[40] = 0;
  _$jscoverage['/delegate-children.js'].lineData[42] = 0;
  _$jscoverage['/delegate-children.js'].lineData[43] = 0;
  _$jscoverage['/delegate-children.js'].lineData[44] = 0;
  _$jscoverage['/delegate-children.js'].lineData[45] = 0;
  _$jscoverage['/delegate-children.js'].lineData[47] = 0;
  _$jscoverage['/delegate-children.js'].lineData[49] = 0;
  _$jscoverage['/delegate-children.js'].lineData[50] = 0;
  _$jscoverage['/delegate-children.js'].lineData[52] = 0;
  _$jscoverage['/delegate-children.js'].lineData[53] = 0;
  _$jscoverage['/delegate-children.js'].lineData[55] = 0;
  _$jscoverage['/delegate-children.js'].lineData[56] = 0;
  _$jscoverage['/delegate-children.js'].lineData[58] = 0;
  _$jscoverage['/delegate-children.js'].lineData[59] = 0;
  _$jscoverage['/delegate-children.js'].lineData[61] = 0;
  _$jscoverage['/delegate-children.js'].lineData[62] = 0;
  _$jscoverage['/delegate-children.js'].lineData[64] = 0;
  _$jscoverage['/delegate-children.js'].lineData[65] = 0;
  _$jscoverage['/delegate-children.js'].lineData[67] = 0;
  _$jscoverage['/delegate-children.js'].lineData[68] = 0;
  _$jscoverage['/delegate-children.js'].lineData[70] = 0;
  _$jscoverage['/delegate-children.js'].lineData[77] = 0;
  _$jscoverage['/delegate-children.js'].lineData[82] = 0;
  _$jscoverage['/delegate-children.js'].lineData[83] = 0;
  _$jscoverage['/delegate-children.js'].lineData[86] = 0;
  _$jscoverage['/delegate-children.js'].lineData[87] = 0;
  _$jscoverage['/delegate-children.js'].lineData[91] = 0;
  _$jscoverage['/delegate-children.js'].lineData[102] = 0;
  _$jscoverage['/delegate-children.js'].lineData[106] = 0;
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
  _$jscoverage['/delegate-children.js'].branchData['9'] = [];
  _$jscoverage['/delegate-children.js'].branchData['9'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['15'] = [];
  _$jscoverage['/delegate-children.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['23'] = [];
  _$jscoverage['/delegate-children.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['26'] = [];
  _$jscoverage['/delegate-children.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['42'] = [];
  _$jscoverage['/delegate-children.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['44'] = [];
  _$jscoverage['/delegate-children.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['82'] = [];
  _$jscoverage['/delegate-children.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['86'] = [];
  _$jscoverage['/delegate-children.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['88'] = [];
  _$jscoverage['/delegate-children.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['88'][2] = new BranchData();
}
_$jscoverage['/delegate-children.js'].branchData['88'][2].init(67, 6, 'ie < 9');
function visit10_88_2(result) {
  _$jscoverage['/delegate-children.js'].branchData['88'][2].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['88'][1].init(61, 12, 'ie && ie < 9');
function visit9_88_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['86'][1].init(274, 22, '!isTouchEventSupported');
function visit8_86_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['82'][1].init(173, 14, 'Gesture.cancel');
function visit7_82_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['44'][1].init(78, 35, 'control && !control.get("disabled")');
function visit6_44_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['42'][1].init(18, 21, '!this.get("disabled")');
function visit5_42_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['26'][1].init(89, 2, 'el');
function visit4_26_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['23'][1].init(14, 16, 'e.target == this');
function visit3_23_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['15'][1].init(14, 16, 'e.target == this');
function visit2_15_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['9'][1].init(28, 41, 'S.Env.host.document.documentMode || UA.ie');
function visit1_9_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['9'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].lineData[6]++;
KISSY.add("component/extension/delegate-children", function(S, Node, Manager) {
  _$jscoverage['/delegate-children.js'].functionData[0]++;
  _$jscoverage['/delegate-children.js'].lineData[8]++;
  var UA = S.UA, ie = visit1_9_1(S.Env.host.document.documentMode || UA.ie), Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/delegate-children.js'].lineData[14]++;
  function onRenderChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[1]++;
    _$jscoverage['/delegate-children.js'].lineData[15]++;
    if (visit2_15_1(e.target == this)) {
      _$jscoverage['/delegate-children.js'].lineData[16]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[18]++;
      el.addClass(this.__childClsTag);
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[22]++;
  function onRemoveChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[2]++;
    _$jscoverage['/delegate-children.js'].lineData[23]++;
    if (visit3_23_1(e.target == this)) {
      _$jscoverage['/delegate-children.js'].lineData[24]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[26]++;
      if (visit4_26_1(el)) {
        _$jscoverage['/delegate-children.js'].lineData[27]++;
        el.removeClass(this.__childClsTag);
      }
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[32]++;
  function DelegateChildren() {
    _$jscoverage['/delegate-children.js'].functionData[3]++;
    _$jscoverage['/delegate-children.js'].lineData[33]++;
    var self = this;
    _$jscoverage['/delegate-children.js'].lineData[34]++;
    self.__childClsTag = S.guid('ks-component-child');
    _$jscoverage['/delegate-children.js'].lineData[36]++;
    self.on('afterRenderChild', onRenderChild, self).on('afterRemoveChild', onRemoveChild, self);
  }
  _$jscoverage['/delegate-children.js'].lineData[40]++;
  S.augment(DelegateChildren, {
  handleChildrenEvents: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[4]++;
  _$jscoverage['/delegate-children.js'].lineData[42]++;
  if (visit5_42_1(!this.get("disabled"))) {
    _$jscoverage['/delegate-children.js'].lineData[43]++;
    var control = this.getOwnerControl(e);
    _$jscoverage['/delegate-children.js'].lineData[44]++;
    if (visit6_44_1(control && !control.get("disabled"))) {
      _$jscoverage['/delegate-children.js'].lineData[45]++;
      e.stopPropagation();
      _$jscoverage['/delegate-children.js'].lineData[47]++;
      switch (e.type) {
        case Gesture.start:
          _$jscoverage['/delegate-children.js'].lineData[49]++;
          control.handleMouseDown(e);
          _$jscoverage['/delegate-children.js'].lineData[50]++;
          break;
        case Gesture.end:
          _$jscoverage['/delegate-children.js'].lineData[52]++;
          control.handleMouseUp(e);
          _$jscoverage['/delegate-children.js'].lineData[53]++;
          break;
        case Gesture.tap:
          _$jscoverage['/delegate-children.js'].lineData[55]++;
          control.handleClick(e);
          _$jscoverage['/delegate-children.js'].lineData[56]++;
          break;
        case "mouseenter":
          _$jscoverage['/delegate-children.js'].lineData[58]++;
          control.handleMouseEnter(e);
          _$jscoverage['/delegate-children.js'].lineData[59]++;
          break;
        case "mouseleave":
          _$jscoverage['/delegate-children.js'].lineData[61]++;
          control.handleMouseLeave(e);
          _$jscoverage['/delegate-children.js'].lineData[62]++;
          break;
        case "contextmenu":
          _$jscoverage['/delegate-children.js'].lineData[64]++;
          control.handleContextMenu(e);
          _$jscoverage['/delegate-children.js'].lineData[65]++;
          break;
        case "dblclick":
          _$jscoverage['/delegate-children.js'].lineData[67]++;
          control.handleDblClick(e);
          _$jscoverage['/delegate-children.js'].lineData[68]++;
          break;
        default:
          _$jscoverage['/delegate-children.js'].lineData[70]++;
          S.error(e.type + " unhandled!");
      }
    }
  }
}, 
  __bindUI: function() {
  _$jscoverage['/delegate-children.js'].functionData[5]++;
  _$jscoverage['/delegate-children.js'].lineData[77]++;
  var self = this, events = Gesture.start + " " + Gesture.end + " " + Gesture.tap;
  _$jscoverage['/delegate-children.js'].lineData[82]++;
  if (visit7_82_1(Gesture.cancel)) {
    _$jscoverage['/delegate-children.js'].lineData[83]++;
    events += ' ' + Gesture.cancel;
  }
  _$jscoverage['/delegate-children.js'].lineData[86]++;
  if (visit8_86_1(!isTouchEventSupported)) {
    _$jscoverage['/delegate-children.js'].lineData[87]++;
    events += " mouseenter mouseleave contextmenu " + (visit9_88_1(ie && visit10_88_2(ie < 9)) ? "dblclick " : "");
  }
  _$jscoverage['/delegate-children.js'].lineData[91]++;
  self.$el.delegate(events, '.' + self.__childClsTag, self.handleChildrenEvents, self);
}, 
  getOwnerControl: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[6]++;
  _$jscoverage['/delegate-children.js'].lineData[102]++;
  return Manager.getComponent(e.currentTarget.id);
}});
  _$jscoverage['/delegate-children.js'].lineData[106]++;
  return DelegateChildren;
}, {
  requires: ['node', 'component/manager']});
