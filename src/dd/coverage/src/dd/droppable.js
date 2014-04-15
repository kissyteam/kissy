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
if (! _$jscoverage['/dd/droppable.js']) {
  _$jscoverage['/dd/droppable.js'] = {};
  _$jscoverage['/dd/droppable.js'].lineData = [];
  _$jscoverage['/dd/droppable.js'].lineData[6] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[7] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[12] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[13] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[14] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[16] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[17] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[18] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[21] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[29] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[31] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[32] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[33] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[117] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[120] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[124] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[129] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[130] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[132] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[133] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[134] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[136] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[137] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[142] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[143] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[145] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[150] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[157] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[159] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[162] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[166] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[168] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[169] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[170] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[174] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[176] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[177] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[181] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[183] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[184] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[192] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[214] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[215] = 0;
}
if (! _$jscoverage['/dd/droppable.js'].functionData) {
  _$jscoverage['/dd/droppable.js'].functionData = [];
  _$jscoverage['/dd/droppable.js'].functionData[0] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[1] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[2] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[3] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[4] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[5] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[6] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[7] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[8] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[9] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[10] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[11] = 0;
  _$jscoverage['/dd/droppable.js'].functionData[12] = 0;
}
if (! _$jscoverage['/dd/droppable.js'].branchData) {
  _$jscoverage['/dd/droppable.js'].branchData = {};
  _$jscoverage['/dd/droppable.js'].branchData['13'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['17'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['120'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['120'][2] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['120'][3] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['129'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['132'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['136'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['143'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['214'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['214'][1] = new BranchData();
}
_$jscoverage['/dd/droppable.js'].branchData['214'][1].init(26, 1, 'v');
function visit99_214_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['143'][1].init(60, 4, 'node');
function visit98_143_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['136'][1].init(527, 4, 'node');
function visit97_136_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['132'][1].init(92, 4, 'node');
function visit96_132_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['129'][1].init(237, 33, 'validDrop(dropGroups, dragGroups)');
function visit95_129_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['120'][3].init(151, 21, 'domNode === proxyNode');
function visit94_120_3(result) {
  _$jscoverage['/dd/droppable.js'].branchData['120'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['120'][2].init(127, 20, 'domNode === dragNode');
function visit93_120_2(result) {
  _$jscoverage['/dd/droppable.js'].branchData['120'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['120'][1].init(127, 45, 'domNode === dragNode || domNode === proxyNode');
function visit92_120_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['17'][1].init(18, 13, 'dragGroups[d]');
function visit91_17_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['13'][1].init(14, 19, 'dragGroups === true');
function visit90_13_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/droppable.js'].functionData[0]++;
  _$jscoverage['/dd/droppable.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Base = require('base'), PREFIX_CLS = DDM.PREFIX_CLS;
  _$jscoverage['/dd/droppable.js'].lineData[12]++;
  function validDrop(dropGroups, dragGroups) {
    _$jscoverage['/dd/droppable.js'].functionData[1]++;
    _$jscoverage['/dd/droppable.js'].lineData[13]++;
    if (visit90_13_1(dragGroups === true)) {
      _$jscoverage['/dd/droppable.js'].lineData[14]++;
      return 1;
    }
    _$jscoverage['/dd/droppable.js'].lineData[16]++;
    for (var d in dropGroups) {
      _$jscoverage['/dd/droppable.js'].lineData[17]++;
      if (visit91_17_1(dragGroups[d])) {
        _$jscoverage['/dd/droppable.js'].lineData[18]++;
        return 1;
      }
    }
    _$jscoverage['/dd/droppable.js'].lineData[21]++;
    return 0;
  }
  _$jscoverage['/dd/droppable.js'].lineData[29]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/dd/droppable.js'].functionData[2]++;
  _$jscoverage['/dd/droppable.js'].lineData[31]++;
  var self = this;
  _$jscoverage['/dd/droppable.js'].lineData[32]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/droppable.js'].lineData[33]++;
  DDM.addDrop(this);
}, 
  getNodeFromTarget: function(ev, dragNode, proxyNode) {
  _$jscoverage['/dd/droppable.js'].functionData[3]++;
  _$jscoverage['/dd/droppable.js'].lineData[117]++;
  var node = this.get('node'), domNode = node[0];
  _$jscoverage['/dd/droppable.js'].lineData[120]++;
  return visit92_120_1(visit93_120_2(domNode === dragNode) || visit94_120_3(domNode === proxyNode)) ? null : node;
}, 
  _active: function() {
  _$jscoverage['/dd/droppable.js'].functionData[4]++;
  _$jscoverage['/dd/droppable.js'].lineData[124]++;
  var self = this, drag = DDM.get('activeDrag'), node = self.get('node'), dropGroups = self.get('groups'), dragGroups = drag.get('groups');
  _$jscoverage['/dd/droppable.js'].lineData[129]++;
  if (visit95_129_1(validDrop(dropGroups, dragGroups))) {
    _$jscoverage['/dd/droppable.js'].lineData[130]++;
    DDM.addValidDrop(self);
    _$jscoverage['/dd/droppable.js'].lineData[132]++;
    if (visit96_132_1(node)) {
      _$jscoverage['/dd/droppable.js'].lineData[133]++;
      node.addClass(PREFIX_CLS + 'drop-active-valid');
      _$jscoverage['/dd/droppable.js'].lineData[134]++;
      DDM.cacheWH(node);
    }
  } else {
    _$jscoverage['/dd/droppable.js'].lineData[136]++;
    if (visit97_136_1(node)) {
      _$jscoverage['/dd/droppable.js'].lineData[137]++;
      node.addClass(PREFIX_CLS + 'drop-active-invalid');
    }
  }
}, 
  _deActive: function() {
  _$jscoverage['/dd/droppable.js'].functionData[5]++;
  _$jscoverage['/dd/droppable.js'].lineData[142]++;
  var node = this.get('node');
  _$jscoverage['/dd/droppable.js'].lineData[143]++;
  if (visit98_143_1(node)) {
    _$jscoverage['/dd/droppable.js'].lineData[145]++;
    node.removeClass(PREFIX_CLS + 'drop-active-valid').removeClass(PREFIX_CLS + 'drop-active-invalid');
  }
}, 
  __getCustomEvt: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[6]++;
  _$jscoverage['/dd/droppable.js'].lineData[150]++;
  return S.mix({
  drag: DDM.get('activeDrag'), 
  drop: this}, ev);
}, 
  _handleOut: function() {
  _$jscoverage['/dd/droppable.js'].functionData[7]++;
  _$jscoverage['/dd/droppable.js'].lineData[157]++;
  var self = this, ret = self.__getCustomEvt();
  _$jscoverage['/dd/droppable.js'].lineData[159]++;
  self.get('node').removeClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[162]++;
  self.fire('dropexit', ret);
}, 
  _handleEnter: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[8]++;
  _$jscoverage['/dd/droppable.js'].lineData[166]++;
  var self = this, e = self.__getCustomEvt(ev);
  _$jscoverage['/dd/droppable.js'].lineData[168]++;
  e.drag._handleEnter(e);
  _$jscoverage['/dd/droppable.js'].lineData[169]++;
  self.get('node').addClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[170]++;
  self.fire('dropenter', e);
}, 
  _handleOver: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[9]++;
  _$jscoverage['/dd/droppable.js'].lineData[174]++;
  var self = this, e = self.__getCustomEvt(ev);
  _$jscoverage['/dd/droppable.js'].lineData[176]++;
  e.drag._handleOver(e);
  _$jscoverage['/dd/droppable.js'].lineData[177]++;
  self.fire('dropover', e);
}, 
  _end: function() {
  _$jscoverage['/dd/droppable.js'].functionData[10]++;
  _$jscoverage['/dd/droppable.js'].lineData[181]++;
  var self = this, ret = self.__getCustomEvt();
  _$jscoverage['/dd/droppable.js'].lineData[183]++;
  self.get('node').removeClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[184]++;
  self.fire('drophit', ret);
}, 
  destructor: function() {
  _$jscoverage['/dd/droppable.js'].functionData[11]++;
  _$jscoverage['/dd/droppable.js'].lineData[192]++;
  DDM.removeDrop(this);
}}, {
  name: 'Droppable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/droppable.js'].functionData[12]++;
  _$jscoverage['/dd/droppable.js'].lineData[214]++;
  if (visit99_214_1(v)) {
    _$jscoverage['/dd/droppable.js'].lineData[215]++;
    return Node.one(v);
  }
}}, 
  groups: {
  value: {}}, 
  disabled: {}}});
});
