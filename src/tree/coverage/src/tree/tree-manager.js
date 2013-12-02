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
if (! _$jscoverage['/tree/tree-manager.js']) {
  _$jscoverage['/tree/tree-manager.js'] = {};
  _$jscoverage['/tree/tree-manager.js'].lineData = [];
  _$jscoverage['/tree/tree-manager.js'].lineData[6] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[7] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[8] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[10] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[20] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[23] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[56] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[60] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[65] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[66] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[69] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[76] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[77] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[86] = 0;
  _$jscoverage['/tree/tree-manager.js'].lineData[90] = 0;
}
if (! _$jscoverage['/tree/tree-manager.js'].functionData) {
  _$jscoverage['/tree/tree-manager.js'].functionData = [];
  _$jscoverage['/tree/tree-manager.js'].functionData[0] = 0;
  _$jscoverage['/tree/tree-manager.js'].functionData[1] = 0;
  _$jscoverage['/tree/tree-manager.js'].functionData[2] = 0;
  _$jscoverage['/tree/tree-manager.js'].functionData[3] = 0;
  _$jscoverage['/tree/tree-manager.js'].functionData[4] = 0;
}
if (! _$jscoverage['/tree/tree-manager.js'].branchData) {
  _$jscoverage['/tree/tree-manager.js'].branchData = {};
  _$jscoverage['/tree/tree-manager.js'].branchData['65'] = [];
  _$jscoverage['/tree/tree-manager.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/tree/tree-manager.js'].branchData['66'] = [];
  _$jscoverage['/tree/tree-manager.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/tree/tree-manager.js'].branchData['66'][2] = new BranchData();
  _$jscoverage['/tree/tree-manager.js'].branchData['76'] = [];
  _$jscoverage['/tree/tree-manager.js'].branchData['76'][1] = new BranchData();
}
_$jscoverage['/tree/tree-manager.js'].branchData['76'][1].init(39, 15, 'n && ev.prevVal');
function visit68_76_1(result) {
  _$jscoverage['/tree/tree-manager.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/tree-manager.js'].branchData['66'][2].init(34, 6, 'ie < 9');
function visit67_66_2(result) {
  _$jscoverage['/tree/tree-manager.js'].branchData['66'][2].ranCondition(result);
  return result;
}_$jscoverage['/tree/tree-manager.js'].branchData['66'][1].init(28, 12, 'ie && ie < 9');
function visit66_66_1(result) {
  _$jscoverage['/tree/tree-manager.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/tree-manager.js'].branchData['65'][1].init(191, 22, '!isTouchEventSupported');
function visit65_65_1(result) {
  _$jscoverage['/tree/tree-manager.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/tree/tree-manager.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/tree/tree-manager.js'].functionData[0]++;
  _$jscoverage['/tree/tree-manager.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/tree/tree-manager.js'].lineData[8]++;
  var DelegateChildrenExtension = require('component/extension/delegate-children');
  _$jscoverage['/tree/tree-manager.js'].lineData[10]++;
  var UA = S.UA, ie = UA.ieMode, Features = S.Features, Gesture = Node.Gesture, isTouchEventSupported = Features.isTouchEventSupported();
  _$jscoverage['/tree/tree-manager.js'].lineData[20]++;
  function TreeManager() {
    _$jscoverage['/tree/tree-manager.js'].functionData[1]++;
  }
  _$jscoverage['/tree/tree-manager.js'].lineData[23]++;
  TreeManager.ATTRS = {
  showRootNode: {
  value: true, 
  view: 1}, 
  selectedItem: {}, 
  focusable: {
  value: true}, 
  handleMouseEvents: {
  value: true}};
  _$jscoverage['/tree/tree-manager.js'].lineData[56]++;
  S.augment(TreeManager, DelegateChildrenExtension, {
  isTree: 1, 
  __bindUI: function() {
  _$jscoverage['/tree/tree-manager.js'].functionData[2]++;
  _$jscoverage['/tree/tree-manager.js'].lineData[60]++;
  var self = this, prefixCls = self.get('prefixCls'), delegateCls = prefixCls + 'tree-node', events = Gesture.tap;
  _$jscoverage['/tree/tree-manager.js'].lineData[65]++;
  if (visit65_65_1(!isTouchEventSupported)) {
    _$jscoverage['/tree/tree-manager.js'].lineData[66]++;
    events += (visit66_66_1(ie && visit67_66_2(ie < 9)) ? ' dblclick ' : '');
  }
  _$jscoverage['/tree/tree-manager.js'].lineData[69]++;
  self.$el.delegate(events, '.' + delegateCls, self.handleChildrenEvents, self);
}, 
  '_onSetSelectedItem': function(n, ev) {
  _$jscoverage['/tree/tree-manager.js'].functionData[3]++;
  _$jscoverage['/tree/tree-manager.js'].lineData[76]++;
  if (visit68_76_1(n && ev.prevVal)) {
    _$jscoverage['/tree/tree-manager.js'].lineData[77]++;
    ev.prevVal.set('selected', false, {
  data: {
  byPassSetTreeSelectedItem: 1}});
  }
}, 
  '_onSetShowRootNode': function(v) {
  _$jscoverage['/tree/tree-manager.js'].functionData[4]++;
  _$jscoverage['/tree/tree-manager.js'].lineData[86]++;
  this.get('rowEl')[v ? 'show' : 'hide']();
}});
  _$jscoverage['/tree/tree-manager.js'].lineData[90]++;
  return TreeManager;
});
