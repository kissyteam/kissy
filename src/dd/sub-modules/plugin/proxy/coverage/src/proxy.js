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
if (! _$jscoverage['/proxy.js']) {
  _$jscoverage['/proxy.js'] = {};
  _$jscoverage['/proxy.js'].lineData = [];
  _$jscoverage['/proxy.js'].lineData[6] = 0;
  _$jscoverage['/proxy.js'].lineData[7] = 0;
  _$jscoverage['/proxy.js'].lineData[11] = 0;
  _$jscoverage['/proxy.js'].lineData[20] = 0;
  _$jscoverage['/proxy.js'].lineData[30] = 0;
  _$jscoverage['/proxy.js'].lineData[32] = 0;
  _$jscoverage['/proxy.js'].lineData[33] = 0;
  _$jscoverage['/proxy.js'].lineData[36] = 0;
  _$jscoverage['/proxy.js'].lineData[37] = 0;
  _$jscoverage['/proxy.js'].lineData[38] = 0;
  _$jscoverage['/proxy.js'].lineData[39] = 0;
  _$jscoverage['/proxy.js'].lineData[40] = 0;
  _$jscoverage['/proxy.js'].lineData[43] = 0;
  _$jscoverage['/proxy.js'].lineData[45] = 0;
  _$jscoverage['/proxy.js'].lineData[46] = 0;
  _$jscoverage['/proxy.js'].lineData[47] = 0;
  _$jscoverage['/proxy.js'].lineData[48] = 0;
  _$jscoverage['/proxy.js'].lineData[49] = 0;
  _$jscoverage['/proxy.js'].lineData[50] = 0;
  _$jscoverage['/proxy.js'].lineData[51] = 0;
  _$jscoverage['/proxy.js'].lineData[52] = 0;
  _$jscoverage['/proxy.js'].lineData[56] = 0;
  _$jscoverage['/proxy.js'].lineData[57] = 0;
  _$jscoverage['/proxy.js'].lineData[59] = 0;
  _$jscoverage['/proxy.js'].lineData[60] = 0;
  _$jscoverage['/proxy.js'].lineData[62] = 0;
  _$jscoverage['/proxy.js'].lineData[63] = 0;
  _$jscoverage['/proxy.js'].lineData[64] = 0;
  _$jscoverage['/proxy.js'].lineData[66] = 0;
  _$jscoverage['/proxy.js'].lineData[68] = 0;
  _$jscoverage['/proxy.js'].lineData[69] = 0;
  _$jscoverage['/proxy.js'].lineData[70] = 0;
  _$jscoverage['/proxy.js'].lineData[75] = 0;
  _$jscoverage['/proxy.js'].lineData[83] = 0;
  _$jscoverage['/proxy.js'].lineData[97] = 0;
}
if (! _$jscoverage['/proxy.js'].functionData) {
  _$jscoverage['/proxy.js'].functionData = [];
  _$jscoverage['/proxy.js'].functionData[0] = 0;
  _$jscoverage['/proxy.js'].functionData[1] = 0;
  _$jscoverage['/proxy.js'].functionData[2] = 0;
  _$jscoverage['/proxy.js'].functionData[3] = 0;
  _$jscoverage['/proxy.js'].functionData[4] = 0;
  _$jscoverage['/proxy.js'].functionData[5] = 0;
}
if (! _$jscoverage['/proxy.js'].branchData) {
  _$jscoverage['/proxy.js'].branchData = {};
  _$jscoverage['/proxy.js'].branchData['36'] = [];
  _$jscoverage['/proxy.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['37'] = [];
  _$jscoverage['/proxy.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['51'] = [];
  _$jscoverage['/proxy.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['59'] = [];
  _$jscoverage['/proxy.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['62'] = [];
  _$jscoverage['/proxy.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/proxy.js'].branchData['69'] = [];
  _$jscoverage['/proxy.js'].branchData['69'][1] = new BranchData();
}
_$jscoverage['/proxy.js'].branchData['69'][1].init(496, 14, 'hideNodeOnDrag');
function visit6_69_1(result) {
  _$jscoverage['/proxy.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['62'][1].init(239, 24, 'self.get(\'destroyOnEnd\')');
function visit5_62_1(result) {
  _$jscoverage['/proxy.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['59'][1].init(124, 21, 'self.get(\'moveOnEnd\')');
function visit4_59_1(result) {
  _$jscoverage['/proxy.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['51'][1].init(780, 14, 'hideNodeOnDrag');
function visit3_51_1(result) {
  _$jscoverage['/proxy.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['37'][1].init(25, 26, 'typeof node === \'function\'');
function visit2_37_1(result) {
  _$jscoverage['/proxy.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].branchData['36'][1].init(151, 22, '!self.get(\'proxyNode\')');
function visit1_36_1(result) {
  _$jscoverage['/proxy.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/proxy.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/proxy.js'].functionData[0]++;
  _$jscoverage['/proxy.js'].lineData[7]++;
  var Node = require('node'), DD = require('dd'), Base = require('base');
  _$jscoverage['/proxy.js'].lineData[11]++;
  var DDM = DD.DDM, PROXY_EVENT = '.-ks-proxy' + S.now();
  _$jscoverage['/proxy.js'].lineData[20]++;
  return Base.extend({
  pluginId: 'dd/plugin/proxy', 
  pluginInitializer: function(drag) {
  _$jscoverage['/proxy.js'].functionData[1]++;
  _$jscoverage['/proxy.js'].lineData[30]++;
  var self = this, hideNodeOnDrag = self.get('hideNodeOnDrag');
  _$jscoverage['/proxy.js'].lineData[32]++;
  function start() {
    _$jscoverage['/proxy.js'].functionData[2]++;
    _$jscoverage['/proxy.js'].lineData[33]++;
    var node = self.get('node'), dragNode = drag.get('node');
    _$jscoverage['/proxy.js'].lineData[36]++;
    if (visit1_36_1(!self.get('proxyNode'))) {
      _$jscoverage['/proxy.js'].lineData[37]++;
      if (visit2_37_1(typeof node === 'function')) {
        _$jscoverage['/proxy.js'].lineData[38]++;
        node = node(drag);
        _$jscoverage['/proxy.js'].lineData[39]++;
        node.addClass('ks-dd-proxy');
        _$jscoverage['/proxy.js'].lineData[40]++;
        self.set('proxyNode', node);
      }
    } else {
      _$jscoverage['/proxy.js'].lineData[43]++;
      node = self.get('proxyNode');
    }
    _$jscoverage['/proxy.js'].lineData[45]++;
    node.show();
    _$jscoverage['/proxy.js'].lineData[46]++;
    dragNode.parent().append(node);
    _$jscoverage['/proxy.js'].lineData[47]++;
    DDM.cacheWH(node);
    _$jscoverage['/proxy.js'].lineData[48]++;
    node.offset(dragNode.offset());
    _$jscoverage['/proxy.js'].lineData[49]++;
    drag.setInternal('dragNode', dragNode);
    _$jscoverage['/proxy.js'].lineData[50]++;
    drag.setInternal('node', node);
    _$jscoverage['/proxy.js'].lineData[51]++;
    if (visit3_51_1(hideNodeOnDrag)) {
      _$jscoverage['/proxy.js'].lineData[52]++;
      dragNode.css('visibility', 'hidden');
    }
  }
  _$jscoverage['/proxy.js'].lineData[56]++;
  function end() {
    _$jscoverage['/proxy.js'].functionData[3]++;
    _$jscoverage['/proxy.js'].lineData[57]++;
    var node = self.get('proxyNode'), dragNode = drag.get('dragNode');
    _$jscoverage['/proxy.js'].lineData[59]++;
    if (visit4_59_1(self.get('moveOnEnd'))) {
      _$jscoverage['/proxy.js'].lineData[60]++;
      dragNode.offset(node.offset());
    }
    _$jscoverage['/proxy.js'].lineData[62]++;
    if (visit5_62_1(self.get('destroyOnEnd'))) {
      _$jscoverage['/proxy.js'].lineData[63]++;
      node.remove();
      _$jscoverage['/proxy.js'].lineData[64]++;
      self.set('proxyNode', 0);
    } else {
      _$jscoverage['/proxy.js'].lineData[66]++;
      node.hide();
    }
    _$jscoverage['/proxy.js'].lineData[68]++;
    drag.setInternal('node', dragNode);
    _$jscoverage['/proxy.js'].lineData[69]++;
    if (visit6_69_1(hideNodeOnDrag)) {
      _$jscoverage['/proxy.js'].lineData[70]++;
      dragNode.css('visibility', '');
    }
  }
  _$jscoverage['/proxy.js'].lineData[75]++;
  drag.on('dragstart' + PROXY_EVENT, start).on('dragend' + PROXY_EVENT, end);
}, 
  pluginDestructor: function(drag) {
  _$jscoverage['/proxy.js'].functionData[4]++;
  _$jscoverage['/proxy.js'].lineData[83]++;
  drag.detach(PROXY_EVENT);
}}, {
  ATTRS: {
  node: {
  value: function(drag) {
  _$jscoverage['/proxy.js'].functionData[5]++;
  _$jscoverage['/proxy.js'].lineData[97]++;
  return new Node(drag.get('node').clone(true));
}}, 
  hideNodeOnDrag: {
  value: false}, 
  destroyOnEnd: {
  value: false}, 
  moveOnEnd: {
  value: true}, 
  proxyNode: {}}});
});
