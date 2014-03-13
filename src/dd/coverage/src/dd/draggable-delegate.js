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
if (! _$jscoverage['/dd/draggable-delegate.js']) {
  _$jscoverage['/dd/draggable-delegate.js'] = {};
  _$jscoverage['/dd/draggable-delegate.js'].lineData = [];
  _$jscoverage['/dd/draggable-delegate.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[19] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[25] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[27] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[28] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[40] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[44] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[45] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[48] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[53] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[54] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[56] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[59] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[60] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[65] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[66] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[69] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[72] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[73] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[74] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[81] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[84] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[85] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[86] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[87] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[88] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[91] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[93] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[100] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[115] = 0;
}
if (! _$jscoverage['/dd/draggable-delegate.js'].functionData) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData = [];
  _$jscoverage['/dd/draggable-delegate.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6] = 0;
}
if (! _$jscoverage['/dd/draggable-delegate.js'].branchData) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData = {};
  _$jscoverage['/dd/draggable-delegate.js'].branchData['26'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['44'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['53'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['59'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['65'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['85'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1] = new BranchData();
}
_$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1].init(74, 14, 'target.test(h)');
function visit53_87_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['85'][1].init(37, 19, 'i < handlers.length');
function visit52_85_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['84'][2].init(170, 21, 'target[0] !== node[0]');
function visit51_84_2(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1].init(160, 31, 'target && target[0] !== node[0]');
function visit50_84_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['65'][1].init(810, 5, '!node');
function visit49_65_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['59'][1].init(594, 7, 'handler');
function visit48_59_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['53'][1].init(417, 15, 'handlers.length');
function visit47_53_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['44'][1].init(110, 30, '!self._checkDragStartValid(ev)');
function visit46_44_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['26'][1].init(109, 9, 'container');
function visit45_26_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[0]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Draggable = require('./draggable'), PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[19]++;
  return Draggable.extend({
  _onSetNode: S.noop, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[1]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[24]++;
  var self = this;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[25]++;
  var container = self.get('container');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26]++;
  if (visit45_26_1(container)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[27]++;
    container[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
    _$jscoverage['/dd/draggable-delegate.js'].lineData[28]++;
    self[d ? 'stop' : 'start']();
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[33]++;
  return this.get('container');
}, 
  onGestureStart: function(ev) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[40]++;
  var self = this, handler, node;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[44]++;
  if (visit46_44_1(!self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[45]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[48]++;
  var handlers = self.get('handlers'), target = $(ev.target);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[53]++;
  if (visit47_53_1(handlers.length)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[54]++;
    handler = self._getHandler(target);
  } else {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[56]++;
    handler = target;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[59]++;
  if (visit48_59_1(handler)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[60]++;
    node = self._getNode(handler);
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[65]++;
  if (visit49_65_1(!node)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[66]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[69]++;
  self.setInternal('activeHandler', handler);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[72]++;
  self.setInternal('node', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[73]++;
  self.setInternal('dragNode', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[74]++;
  self._prepare(ev);
}, 
  _getHandler: function(target) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[81]++;
  var self = this, node = self.get('container'), handlers = self.get('handlers');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[84]++;
  while (visit50_84_1(target && visit51_84_2(target[0] !== node[0]))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[85]++;
    for (var i = 0; visit52_85_1(i < handlers.length); i++) {
      _$jscoverage['/dd/draggable-delegate.js'].lineData[86]++;
      var h = handlers[i];
      _$jscoverage['/dd/draggable-delegate.js'].lineData[87]++;
      if (visit53_87_1(target.test(h))) {
        _$jscoverage['/dd/draggable-delegate.js'].lineData[88]++;
        return target;
      }
    }
    _$jscoverage['/dd/draggable-delegate.js'].lineData[91]++;
    target = target.parent();
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[93]++;
  return null;
}, 
  _getNode: function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[100]++;
  return h.closest(this.get('selector'), this.get('container'));
}}, {
  ATTRS: {
  container: {
  setter: function(v) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[115]++;
  return $(v);
}}, 
  selector: {}, 
  handlers: {
  value: [], 
  getter: 0}}});
});
