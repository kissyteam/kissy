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
  _$jscoverage['/dd/draggable-delegate.js'].lineData[10] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[16] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[17] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[22] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[25] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[31] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[36] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[37] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[42] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[43] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[46] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[49] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[51] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[60] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[68] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[72] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[77] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[80] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[84] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[87] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[94] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[97] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[98] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[99] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[100] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[101] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[104] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[106] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[113] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[128] = 0;
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
  _$jscoverage['/dd/draggable-delegate.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].functionData[9] = 0;
}
if (! _$jscoverage['/dd/draggable-delegate.js'].branchData) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData = {};
  _$jscoverage['/dd/draggable-delegate.js'].branchData['21'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['30'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['36'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['42'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['97'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['97'][2] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['100'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['100'][1] = new BranchData();
}
_$jscoverage['/dd/draggable-delegate.js'].branchData['100'][1].init(74, 14, 'target.test(h)');
function visit64_100_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1].init(37, 19, 'i < handlers.length');
function visit63_98_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['97'][2].init(170, 21, 'target[0] !== node[0]');
function visit62_97_2(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['97'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['97'][1].init(160, 31, 'target && target[0] !== node[0]');
function visit61_97_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['42'][1].init(642, 5, '!node');
function visit60_42_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['36'][1].init(466, 7, 'handler');
function visit59_36_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['30'][1].init(329, 15, 'handlers.length');
function visit58_30_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['21'][1].init(78, 30, '!self._checkDragStartValid(ev)');
function visit57_21_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[0]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Draggable = require('./draggable');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[10]++;
  var PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[16]++;
  var handlePreDragStart = function(ev) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[1]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[17]++;
  var self = this, handler, node;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[21]++;
  if (visit57_21_1(!self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[22]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[25]++;
  var handlers = self.get('handlers'), target = $(ev.target);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[30]++;
  if (visit58_30_1(handlers.length)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[31]++;
    handler = self._getHandler(target);
  } else {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[33]++;
    handler = target;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[36]++;
  if (visit59_36_1(handler)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[37]++;
    node = self._getNode(handler);
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[42]++;
  if (visit60_42_1(!node)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[43]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[46]++;
  self.setInternal('activeHandler', handler);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[49]++;
  self.setInternal('node', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[50]++;
  self.setInternal('dragNode', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[51]++;
  self._prepare(ev);
};
  _$jscoverage['/dd/draggable-delegate.js'].lineData[60]++;
  return Draggable.extend({
  _onSetNode: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2]++;
}, 
  '_onSetContainer': function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[68]++;
  this.bindDragEvent();
}, 
  _onSetDisabledChange: function(d) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[72]++;
  this.get('container')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
}, 
  bindDragEvent: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[77]++;
  var self = this, node = self.get('container');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[80]++;
  node.on(Node.Gesture.start, handlePreDragStart, self).on('dragstart', self._fixDragStart);
}, 
  detachDragEvent: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[84]++;
  var self = this;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[87]++;
  self.get('container').detach(Node.Gesture.start, handlePreDragStart, self).detach('dragstart', self._fixDragStart);
}, 
  _getHandler: function(target) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[7]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[94]++;
  var self = this, node = self.get('container'), handlers = self.get('handlers');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[97]++;
  while (visit61_97_1(target && visit62_97_2(target[0] !== node[0]))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[98]++;
    for (var i = 0; visit63_98_1(i < handlers.length); i++) {
      _$jscoverage['/dd/draggable-delegate.js'].lineData[99]++;
      var h = handlers[i];
      _$jscoverage['/dd/draggable-delegate.js'].lineData[100]++;
      if (visit64_100_1(target.test(h))) {
        _$jscoverage['/dd/draggable-delegate.js'].lineData[101]++;
        return target;
      }
    }
    _$jscoverage['/dd/draggable-delegate.js'].lineData[104]++;
    target = target.parent();
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[106]++;
  return null;
}, 
  _getNode: function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[8]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[113]++;
  return h.closest(this.get('selector'), this.get('container'));
}}, {
  ATTRS: {
  container: {
  setter: function(v) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[9]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[128]++;
  return $(v);
}}, 
  selector: {}, 
  handlers: {
  value: [], 
  getter: 0}}});
});
