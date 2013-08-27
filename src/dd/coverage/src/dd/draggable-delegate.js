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
  _$jscoverage['/dd/draggable-delegate.js'].lineData[8] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[14] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[15] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[19] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[20] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[28] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[31] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[34] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[35] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[40] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[41] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[44] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[47] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[48] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[49] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[58] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[66] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[70] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[75] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[78] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[82] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[85] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[92] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[96] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[97] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[98] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[99] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[100] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[102] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[104] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[105] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[107] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[109] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[116] = 0;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[131] = 0;
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
  _$jscoverage['/dd/draggable-delegate.js'].functionData[10] = 0;
}
if (! _$jscoverage['/dd/draggable-delegate.js'].branchData) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData = {};
  _$jscoverage['/dd/draggable-delegate.js'].branchData['19'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['34'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['40'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['96'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dd/draggable-delegate.js'].branchData['104'] = [];
  _$jscoverage['/dd/draggable-delegate.js'].branchData['104'][1] = new BranchData();
}
_$jscoverage['/dd/draggable-delegate.js'].branchData['104'][1].init(307, 3, 'ret');
function visit67_104_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1].init(30, 14, 'target.test(h)');
function visit66_98_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['96'][2].init(212, 21, 'target[0] !== node[0]');
function visit65_96_2(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['96'][1].init(202, 31, 'target && target[0] !== node[0]');
function visit64_96_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['40'][1].init(668, 5, '!node');
function visit63_40_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['34'][1].init(486, 7, 'handler');
function visit62_34_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1].init(343, 15, 'handlers.length');
function visit61_28_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].branchData['19'][1].init(83, 30, '!self._checkDragStartValid(ev)');
function visit60_19_1(result) {
  _$jscoverage['/dd/draggable-delegate.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable-delegate.js'].lineData[6]++;
KISSY.add('dd/draggable-delegate', function(S, DDM, Draggable, Node) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[0]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[8]++;
  var PREFIX_CLS = DDM.PREFIX_CLS, $ = Node.all;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[14]++;
  var handlePreDragStart = function(ev) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[1]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[15]++;
  var self = this, handler, node;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[19]++;
  if (visit60_19_1(!self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[20]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[23]++;
  var handlers = self.get('handlers'), target = $(ev.target);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[28]++;
  if (visit61_28_1(handlers.length)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[29]++;
    handler = self._getHandler(target);
  } else {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[31]++;
    handler = target;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[34]++;
  if (visit62_34_1(handler)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[35]++;
    node = self._getNode(handler);
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[40]++;
  if (visit63_40_1(!node)) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[41]++;
    return;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[44]++;
  self.setInternal('activeHandler', handler);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[47]++;
  self.setInternal('node', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[48]++;
  self.setInternal('dragNode', node);
  _$jscoverage['/dd/draggable-delegate.js'].lineData[49]++;
  self._prepare(ev);
};
  _$jscoverage['/dd/draggable-delegate.js'].lineData[58]++;
  return Draggable.extend({
  _onSetNode: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[2]++;
}, 
  '_onSetContainer': function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[3]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[66]++;
  this.bindDragEvent();
}, 
  _onSetDisabledChange: function(d) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[4]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[70]++;
  this.get('container')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
}, 
  bindDragEvent: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[5]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[75]++;
  var self = this, node = self.get('container');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[78]++;
  node.on(Node.Gesture.start, handlePreDragStart, self).on('dragstart', self._fixDragStart);
}, 
  detachDragEvent: function() {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[6]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[82]++;
  var self = this;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[85]++;
  self.get('container').detach(Node.Gesture.start, handlePreDragStart, self).detach('dragstart', self._fixDragStart);
}, 
  _getHandler: function(target) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[7]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[92]++;
  var self = this, ret = undefined, node = self.get('container'), handlers = self.get('handlers');
  _$jscoverage['/dd/draggable-delegate.js'].lineData[96]++;
  while (visit64_96_1(target && visit65_96_2(target[0] !== node[0]))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[97]++;
    S.each(handlers, function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[8]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[98]++;
  if (visit66_98_1(target.test(h))) {
    _$jscoverage['/dd/draggable-delegate.js'].lineData[99]++;
    ret = target;
    _$jscoverage['/dd/draggable-delegate.js'].lineData[100]++;
    return false;
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[102]++;
  return undefined;
});
    _$jscoverage['/dd/draggable-delegate.js'].lineData[104]++;
    if (visit67_104_1(ret)) {
      _$jscoverage['/dd/draggable-delegate.js'].lineData[105]++;
      break;
    }
    _$jscoverage['/dd/draggable-delegate.js'].lineData[107]++;
    target = target.parent();
  }
  _$jscoverage['/dd/draggable-delegate.js'].lineData[109]++;
  return ret;
}, 
  _getNode: function(h) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[9]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[116]++;
  return h.closest(this.get('selector'), this.get('container'));
}}, {
  ATTRS: {
  container: {
  setter: function(v) {
  _$jscoverage['/dd/draggable-delegate.js'].functionData[10]++;
  _$jscoverage['/dd/draggable-delegate.js'].lineData[131]++;
  return $(v);
}}, 
  selector: {}, 
  handlers: {
  value: [], 
  getter: 0}}});
}, {
  requires: ['./ddm', './draggable', 'node']});
