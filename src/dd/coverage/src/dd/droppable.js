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
  _$jscoverage['/dd/droppable.js'].lineData[11] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[13] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[14] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[15] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[17] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[18] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[19] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[22] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[30] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[32] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[33] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[34] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[118] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[121] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[125] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[130] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[131] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[133] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[134] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[135] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[137] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[138] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[143] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[144] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[146] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[151] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[158] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[160] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[163] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[167] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[169] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[170] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[171] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[175] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[177] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[178] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[182] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[184] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[185] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[193] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[215] = 0;
  _$jscoverage['/dd/droppable.js'].lineData[216] = 0;
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
  _$jscoverage['/dd/droppable.js'].branchData['14'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['18'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['121'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['121'][2] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['121'][3] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['130'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['133'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['137'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['144'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dd/droppable.js'].branchData['215'] = [];
  _$jscoverage['/dd/droppable.js'].branchData['215'][1] = new BranchData();
}
_$jscoverage['/dd/droppable.js'].branchData['215'][1].init(26, 1, 'v');
function visit100_215_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['144'][1].init(60, 4, 'node');
function visit99_144_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['137'][1].init(527, 4, 'node');
function visit98_137_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['133'][1].init(92, 4, 'node');
function visit97_133_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['130'][1].init(237, 33, 'validDrop(dropGroups, dragGroups)');
function visit96_130_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['121'][3].init(151, 21, 'domNode === proxyNode');
function visit95_121_3(result) {
  _$jscoverage['/dd/droppable.js'].branchData['121'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['121'][2].init(127, 20, 'domNode === dragNode');
function visit94_121_2(result) {
  _$jscoverage['/dd/droppable.js'].branchData['121'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['121'][1].init(127, 45, 'domNode === dragNode || domNode === proxyNode');
function visit93_121_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['18'][1].init(18, 13, 'dragGroups[d]');
function visit92_18_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].branchData['14'][1].init(14, 19, 'dragGroups === true');
function visit91_14_1(result) {
  _$jscoverage['/dd/droppable.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/droppable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/droppable.js'].functionData[0]++;
  _$jscoverage['/dd/droppable.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Base = require('base'), PREFIX_CLS = DDM.PREFIX_CLS;
  _$jscoverage['/dd/droppable.js'].lineData[11]++;
  var util = require('util');
  _$jscoverage['/dd/droppable.js'].lineData[13]++;
  function validDrop(dropGroups, dragGroups) {
    _$jscoverage['/dd/droppable.js'].functionData[1]++;
    _$jscoverage['/dd/droppable.js'].lineData[14]++;
    if (visit91_14_1(dragGroups === true)) {
      _$jscoverage['/dd/droppable.js'].lineData[15]++;
      return 1;
    }
    _$jscoverage['/dd/droppable.js'].lineData[17]++;
    for (var d in dropGroups) {
      _$jscoverage['/dd/droppable.js'].lineData[18]++;
      if (visit92_18_1(dragGroups[d])) {
        _$jscoverage['/dd/droppable.js'].lineData[19]++;
        return 1;
      }
    }
    _$jscoverage['/dd/droppable.js'].lineData[22]++;
    return 0;
  }
  _$jscoverage['/dd/droppable.js'].lineData[30]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/dd/droppable.js'].functionData[2]++;
  _$jscoverage['/dd/droppable.js'].lineData[32]++;
  var self = this;
  _$jscoverage['/dd/droppable.js'].lineData[33]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/droppable.js'].lineData[34]++;
  DDM.addDrop(this);
}, 
  getNodeFromTarget: function(ev, dragNode, proxyNode) {
  _$jscoverage['/dd/droppable.js'].functionData[3]++;
  _$jscoverage['/dd/droppable.js'].lineData[118]++;
  var node = this.get('node'), domNode = node[0];
  _$jscoverage['/dd/droppable.js'].lineData[121]++;
  return visit93_121_1(visit94_121_2(domNode === dragNode) || visit95_121_3(domNode === proxyNode)) ? null : node;
}, 
  _active: function() {
  _$jscoverage['/dd/droppable.js'].functionData[4]++;
  _$jscoverage['/dd/droppable.js'].lineData[125]++;
  var self = this, drag = DDM.get('activeDrag'), node = self.get('node'), dropGroups = self.get('groups'), dragGroups = drag.get('groups');
  _$jscoverage['/dd/droppable.js'].lineData[130]++;
  if (visit96_130_1(validDrop(dropGroups, dragGroups))) {
    _$jscoverage['/dd/droppable.js'].lineData[131]++;
    DDM.addValidDrop(self);
    _$jscoverage['/dd/droppable.js'].lineData[133]++;
    if (visit97_133_1(node)) {
      _$jscoverage['/dd/droppable.js'].lineData[134]++;
      node.addClass(PREFIX_CLS + 'drop-active-valid');
      _$jscoverage['/dd/droppable.js'].lineData[135]++;
      DDM.cacheWH(node);
    }
  } else {
    _$jscoverage['/dd/droppable.js'].lineData[137]++;
    if (visit98_137_1(node)) {
      _$jscoverage['/dd/droppable.js'].lineData[138]++;
      node.addClass(PREFIX_CLS + 'drop-active-invalid');
    }
  }
}, 
  _deActive: function() {
  _$jscoverage['/dd/droppable.js'].functionData[5]++;
  _$jscoverage['/dd/droppable.js'].lineData[143]++;
  var node = this.get('node');
  _$jscoverage['/dd/droppable.js'].lineData[144]++;
  if (visit99_144_1(node)) {
    _$jscoverage['/dd/droppable.js'].lineData[146]++;
    node.removeClass(PREFIX_CLS + 'drop-active-valid').removeClass(PREFIX_CLS + 'drop-active-invalid');
  }
}, 
  __getCustomEvt: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[6]++;
  _$jscoverage['/dd/droppable.js'].lineData[151]++;
  return util.mix({
  drag: DDM.get('activeDrag'), 
  drop: this}, ev);
}, 
  _handleOut: function() {
  _$jscoverage['/dd/droppable.js'].functionData[7]++;
  _$jscoverage['/dd/droppable.js'].lineData[158]++;
  var self = this, ret = self.__getCustomEvt();
  _$jscoverage['/dd/droppable.js'].lineData[160]++;
  self.get('node').removeClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[163]++;
  self.fire('dropexit', ret);
}, 
  _handleEnter: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[8]++;
  _$jscoverage['/dd/droppable.js'].lineData[167]++;
  var self = this, e = self.__getCustomEvt(ev);
  _$jscoverage['/dd/droppable.js'].lineData[169]++;
  e.drag._handleEnter(e);
  _$jscoverage['/dd/droppable.js'].lineData[170]++;
  self.get('node').addClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[171]++;
  self.fire('dropenter', e);
}, 
  _handleOver: function(ev) {
  _$jscoverage['/dd/droppable.js'].functionData[9]++;
  _$jscoverage['/dd/droppable.js'].lineData[175]++;
  var self = this, e = self.__getCustomEvt(ev);
  _$jscoverage['/dd/droppable.js'].lineData[177]++;
  e.drag._handleOver(e);
  _$jscoverage['/dd/droppable.js'].lineData[178]++;
  self.fire('dropover', e);
}, 
  _end: function() {
  _$jscoverage['/dd/droppable.js'].functionData[10]++;
  _$jscoverage['/dd/droppable.js'].lineData[182]++;
  var self = this, ret = self.__getCustomEvt();
  _$jscoverage['/dd/droppable.js'].lineData[184]++;
  self.get('node').removeClass(PREFIX_CLS + 'drop-over');
  _$jscoverage['/dd/droppable.js'].lineData[185]++;
  self.fire('drophit', ret);
}, 
  destructor: function() {
  _$jscoverage['/dd/droppable.js'].functionData[11]++;
  _$jscoverage['/dd/droppable.js'].lineData[193]++;
  DDM.removeDrop(this);
}}, {
  name: 'Droppable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/droppable.js'].functionData[12]++;
  _$jscoverage['/dd/droppable.js'].lineData[215]++;
  if (visit100_215_1(v)) {
    _$jscoverage['/dd/droppable.js'].lineData[216]++;
    return Node.one(v);
  }
}}, 
  groups: {
  value: {}}, 
  disabled: {}}});
});
