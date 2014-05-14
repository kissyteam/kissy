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
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[27] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[28] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[35] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[42] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[46] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[47] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[55] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[56] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[58] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[61] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[62] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[67] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[68] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[71] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[74] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[75] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[76] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[83] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[86] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[87] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[88] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[89] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[90] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[93] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[95] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[102] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[117] = 0;
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
  _$jscoverage['/dd/draggable-delegate.js'].functionData[7] = 0;
}
if (! _$jscoverage['/dd/draggable-delegate.js'].branchData) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData = {};
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['46'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['55'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['61'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['67'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['86'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['86'][2] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['89'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['89'][1] = new BranchData();
}
_$jscoverage['/dd/draggable-delegate.js'].branchData['89'][1].init(76, 14, 'target.test(h)');
function visit53_89_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1].init(38, 19, 'i < handlers.length');
function visit52_87_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['86'][2].init(174, 21, 'target[0] !== node[0]');
function visit51_86_2(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['86'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['86'][1].init(164, 31, 'target && target[0] !== node[0]');
function visit50_86_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['67'][1].init(836, 5, '!node');
function visit49_67_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['61'][1].init(614, 7, 'handler');
function visit48_61_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['55'][1].init(431, 15, 'handlers.length');
function visit47_55_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['46'][1].init(115, 30, '!self._checkDragStartValid(ev)');
function visit46_46_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1].init(112, 9, 'container');
function visit45_28_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[0]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Draggable = require('./draggable'), PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[19]++;
  return Draggable.extend({
  _onSetNode: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[1]++;
}, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[26]++;
  var self = this;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[27]++;
  var container = self.get('container');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[28]++;
  if (visit45_28_1(container)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[29]++;
    container[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
    _$jscoverage['/dd/draggable-delegate.js'].lineData[30]++;
    self[d ? 'stop' : 'start']();
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[35]++;
  return this.get('container');
}, 
  onGestureStart: function(ev) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[42]++;
  var self = this, handler, node;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[46]++;
  if (visit46_46_1(!self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[47]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50]++;
  var handlers = self.get('handlers'), target = $(ev.target);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[55]++;
  if (visit47_55_1(handlers.length)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[56]++;
    handler = self._getHandler(target);
  } else {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[58]++;
    handler = target;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[61]++;
  if (visit48_61_1(handler)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[62]++;
    node = self._getNode(handler);
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[67]++;
  if (visit49_67_1(!node)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[68]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[71]++;
  self.setInternal('activeHandler', handler);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[74]++;
  self.setInternal('node', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[75]++;
  self.setInternal('dragNode', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[76]++;
  self._prepare(ev);
}, 
  _getHandler: function(target) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[83]++;
  var self = this, node = self.get('container'), handlers = self.get('handlers');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[86]++;
  while (visit50_86_1(target && visit51_86_2(target[0] !== node[0]))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[87]++;
    for (var i = 0; visit52_87_1(i < handlers.length); i++) {
      _$jscoverage['/dd/draggable-delegate.js'].lineData[88]++;
      var h = handlers[i];
      _$jscoverage['/dd/draggable-delegate.js'].lineData[89]++;
      if (visit53_89_1(target.test(h))) {
        _$jscoverage['/dd/draggable-delegate.js'].lineData[90]++;
        return target;
      }
    }
    _$jscoverage['/dd/draggable-delegate.js'].lineData[93]++;
    target = target.parent();
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[95]++;
  return null;
}, 
  _getNode: function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[102]++;
  return h.closest(this.get('selector'), this.get('container'));
}}, {
  ATTRS: {
  container: {
  setter: function(v) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[7]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[117]++;
  return $(v);
}}, 
  selector: {}, 
  handlers: {
  value: [], 
  getter: 0}}});
});
