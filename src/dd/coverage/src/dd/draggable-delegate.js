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
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[37] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[41] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[42] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[45] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[51] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[53] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[56] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[57] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[62] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[63] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[66] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[69] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[70] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[71] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[78] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[81] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[82] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[83] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[84] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[85] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[88] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[90] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[97] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[112] = 0;
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
  _$jscoverage['/dd/draggable-delegate.js'].branchData['41'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['50'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['56'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['62'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['81'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['82'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1] = new BranchData();
}
_$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1].init(74, 14, 'target.test(h)');
function visit52_84_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['82'][1].init(37, 19, 'i < handlers.length');
function visit51_82_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['81'][2].init(170, 21, 'target[0] !== node[0]');
function visit50_81_2(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['81'][1].init(160, 31, 'target && target[0] !== node[0]');
function visit49_81_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['62'][1].init(810, 5, '!node');
function visit48_62_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['56'][1].init(594, 7, 'handler');
function visit47_56_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['50'][1].init(417, 15, 'handlers.length');
function visit46_50_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['41'][1].init(110, 30, '!self._checkDragStartValid(ev)');
function visit45_41_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['41'][1].ranCondition(result);
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
  this.get('container')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26]++;
  this[d ? 'detachDragEvent' : 'bindDragEvent']();
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[30]++;
  return this.get('container');
}, 
  onGestureStart: function(ev) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[37]++;
  var self = this, handler, node;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[41]++;
  if (visit45_41_1(!self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[42]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[45]++;
  var handlers = self.get('handlers'), target = $(ev.target);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50]++;
  if (visit46_50_1(handlers.length)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[51]++;
    handler = self._getHandler(target);
  } else {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[53]++;
    handler = target;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[56]++;
  if (visit47_56_1(handler)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[57]++;
    node = self._getNode(handler);
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[62]++;
  if (visit48_62_1(!node)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[63]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[66]++;
  self.setInternal('activeHandler', handler);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[69]++;
  self.setInternal('node', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[70]++;
  self.setInternal('dragNode', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[71]++;
  self._prepare(ev);
}, 
  _getHandler: function(target) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[78]++;
  var self = this, node = self.get('container'), handlers = self.get('handlers');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[81]++;
  while (visit49_81_1(target && visit50_81_2(target[0] !== node[0]))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[82]++;
    for (var i = 0; visit51_82_1(i < handlers.length); i++) {
      _$jscoverage['/dd/draggable-delegate.js'].lineData[83]++;
      var h = handlers[i];
      _$jscoverage['/dd/draggable-delegate.js'].lineData[84]++;
      if (visit52_84_1(target.test(h))) {
        _$jscoverage['/dd/draggable-delegate.js'].lineData[85]++;
        return target;
      }
    }
    _$jscoverage['/dd/draggable-delegate.js'].lineData[88]++;
    target = target.parent();
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[90]++;
  return null;
}, 
  _getNode: function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[97]++;
  return h.closest(this.get('selector'), this.get('container'));
}}, {
  ATTRS: {
  container: {
  setter: function(v) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[112]++;
  return $(v);
}}, 
  selector: {}, 
  handlers: {
  value: [], 
  getter: 0}}});
});
