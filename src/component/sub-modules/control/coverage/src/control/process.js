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
if (! _$jscoverage['/control/process.js']) {
  _$jscoverage['/control/process.js'] = {};
  _$jscoverage['/control/process.js'].lineData = [];
  _$jscoverage['/control/process.js'].lineData[6] = 0;
  _$jscoverage['/control/process.js'].lineData[7] = 0;
  _$jscoverage['/control/process.js'].lineData[8] = 0;
  _$jscoverage['/control/process.js'].lineData[9] = 0;
  _$jscoverage['/control/process.js'].lineData[15] = 0;
  _$jscoverage['/control/process.js'].lineData[32] = 0;
  _$jscoverage['/control/process.js'].lineData[33] = 0;
  _$jscoverage['/control/process.js'].lineData[39] = 0;
  _$jscoverage['/control/process.js'].lineData[40] = 0;
  _$jscoverage['/control/process.js'].lineData[41] = 0;
  _$jscoverage['/control/process.js'].lineData[47] = 0;
  _$jscoverage['/control/process.js'].lineData[49] = 0;
  _$jscoverage['/control/process.js'].lineData[51] = 0;
  _$jscoverage['/control/process.js'].lineData[59] = 0;
  _$jscoverage['/control/process.js'].lineData[61] = 0;
  _$jscoverage['/control/process.js'].lineData[62] = 0;
  _$jscoverage['/control/process.js'].lineData[70] = 0;
  _$jscoverage['/control/process.js'].lineData[71] = 0;
  _$jscoverage['/control/process.js'].lineData[72] = 0;
  _$jscoverage['/control/process.js'].lineData[79] = 0;
  _$jscoverage['/control/process.js'].lineData[87] = 0;
  _$jscoverage['/control/process.js'].lineData[88] = 0;
  _$jscoverage['/control/process.js'].lineData[89] = 0;
  _$jscoverage['/control/process.js'].lineData[90] = 0;
  _$jscoverage['/control/process.js'].lineData[96] = 0;
  _$jscoverage['/control/process.js'].lineData[103] = 0;
  _$jscoverage['/control/process.js'].lineData[104] = 0;
  _$jscoverage['/control/process.js'].lineData[105] = 0;
  _$jscoverage['/control/process.js'].lineData[106] = 0;
  _$jscoverage['/control/process.js'].lineData[112] = 0;
  _$jscoverage['/control/process.js'].lineData[114] = 0;
  _$jscoverage['/control/process.js'].lineData[116] = 0;
  _$jscoverage['/control/process.js'].lineData[120] = 0;
  _$jscoverage['/control/process.js'].lineData[123] = 0;
  _$jscoverage['/control/process.js'].lineData[124] = 0;
  _$jscoverage['/control/process.js'].lineData[125] = 0;
  _$jscoverage['/control/process.js'].lineData[127] = 0;
  _$jscoverage['/control/process.js'].lineData[128] = 0;
  _$jscoverage['/control/process.js'].lineData[130] = 0;
  _$jscoverage['/control/process.js'].lineData[131] = 0;
  _$jscoverage['/control/process.js'].lineData[133] = 0;
  _$jscoverage['/control/process.js'].lineData[134] = 0;
  _$jscoverage['/control/process.js'].lineData[136] = 0;
  _$jscoverage['/control/process.js'].lineData[137] = 0;
  _$jscoverage['/control/process.js'].lineData[139] = 0;
  _$jscoverage['/control/process.js'].lineData[140] = 0;
  _$jscoverage['/control/process.js'].lineData[141] = 0;
  _$jscoverage['/control/process.js'].lineData[144] = 0;
  _$jscoverage['/control/process.js'].lineData[185] = 0;
}
if (! _$jscoverage['/control/process.js'].functionData) {
  _$jscoverage['/control/process.js'].functionData = [];
  _$jscoverage['/control/process.js'].functionData[0] = 0;
  _$jscoverage['/control/process.js'].functionData[1] = 0;
  _$jscoverage['/control/process.js'].functionData[2] = 0;
  _$jscoverage['/control/process.js'].functionData[3] = 0;
}
if (! _$jscoverage['/control/process.js'].branchData) {
  _$jscoverage['/control/process.js'].branchData = {};
  _$jscoverage['/control/process.js'].branchData['33'] = [];
  _$jscoverage['/control/process.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['61'] = [];
  _$jscoverage['/control/process.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['125'] = [];
  _$jscoverage['/control/process.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['127'] = [];
  _$jscoverage['/control/process.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['130'] = [];
  _$jscoverage['/control/process.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['133'] = [];
  _$jscoverage['/control/process.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['136'] = [];
  _$jscoverage['/control/process.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['139'] = [];
  _$jscoverage['/control/process.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['140'] = [];
  _$jscoverage['/control/process.js'].branchData['140'][1] = new BranchData();
}
_$jscoverage['/control/process.js'].branchData['140'][1].init(21, 17, 'p.pluginCreateDom');
function visit9_140_1(result) {
  _$jscoverage['/control/process.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['139'][1].init(696, 19, 'self.get(\'created\')');
function visit8_139_1(result) {
  _$jscoverage['/control/process.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['136'][1].init(378, 14, 'p.pluginSyncUI');
function visit7_136_1(result) {
  _$jscoverage['/control/process.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['133'][1].init(280, 14, 'p.pluginBindUI');
function visit6_133_1(result) {
  _$jscoverage['/control/process.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['130'][1].init(177, 16, 'p.pluginRenderUI');
function visit5_130_1(result) {
  _$jscoverage['/control/process.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['127'][1].init(73, 17, 'p.pluginCreateDom');
function visit4_127_1(result) {
  _$jscoverage['/control/process.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['125'][1].init(193, 20, 'self.get(\'rendered\')');
function visit3_125_1(result) {
  _$jscoverage['/control/process.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['61'][1].init(69, 21, '!self.get(\'rendered\')');
function visit2_61_1(result) {
  _$jscoverage['/control/process.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['33'][1].init(46, 20, '!self.get(\'created\')');
function visit1_33_1(result) {
  _$jscoverage['/control/process.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control/process.js'].functionData[0]++;
  _$jscoverage['/control/process.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/control/process.js'].lineData[8]++;
  var __getHook = Base.prototype.__getHook;
  _$jscoverage['/control/process.js'].lineData[9]++;
  var noop = S.noop;
  _$jscoverage['/control/process.js'].lineData[15]++;
  var ControlProcess = Base.extend({
  bindInternal: noop, 
  syncInternal: noop, 
  renderUI: noop, 
  syncUI: noop, 
  bindUI: noop, 
  create: function() {
  _$jscoverage['/control/process.js'].functionData[1]++;
  _$jscoverage['/control/process.js'].lineData[32]++;
  var self = this;
  _$jscoverage['/control/process.js'].lineData[33]++;
  if (visit1_33_1(!self.get('created'))) {
    _$jscoverage['/control/process.js'].lineData[39]++;
    self.fire('beforeCreateDom');
    _$jscoverage['/control/process.js'].lineData[40]++;
    self.createDom();
    _$jscoverage['/control/process.js'].lineData[41]++;
    self.__callPluginsMethod('pluginCreateDom');
    _$jscoverage['/control/process.js'].lineData[47]++;
    self.fire('afterCreateDom');
    _$jscoverage['/control/process.js'].lineData[49]++;
    self.setInternal('created', true);
  }
  _$jscoverage['/control/process.js'].lineData[51]++;
  return self;
}, 
  render: function() {
  _$jscoverage['/control/process.js'].functionData[2]++;
  _$jscoverage['/control/process.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/control/process.js'].lineData[61]++;
  if (visit2_61_1(!self.get('rendered'))) {
    _$jscoverage['/control/process.js'].lineData[62]++;
    self.create();
    _$jscoverage['/control/process.js'].lineData[70]++;
    self.fire('beforeRenderUI');
    _$jscoverage['/control/process.js'].lineData[71]++;
    self.renderUI();
    _$jscoverage['/control/process.js'].lineData[72]++;
    self.__callPluginsMethod('pluginRenderUI');
    _$jscoverage['/control/process.js'].lineData[79]++;
    self.fire('afterRenderUI');
    _$jscoverage['/control/process.js'].lineData[87]++;
    self.fire('beforeBindUI');
    _$jscoverage['/control/process.js'].lineData[88]++;
    ControlProcess.superclass.bindInternal.call(self);
    _$jscoverage['/control/process.js'].lineData[89]++;
    self.bindUI();
    _$jscoverage['/control/process.js'].lineData[90]++;
    self.__callPluginsMethod('pluginBindUI');
    _$jscoverage['/control/process.js'].lineData[96]++;
    self.fire('afterBindUI');
    _$jscoverage['/control/process.js'].lineData[103]++;
    self.fire('beforeSyncUI');
    _$jscoverage['/control/process.js'].lineData[104]++;
    ControlProcess.superclass.syncInternal.call(self);
    _$jscoverage['/control/process.js'].lineData[105]++;
    self.syncUI();
    _$jscoverage['/control/process.js'].lineData[106]++;
    self.__callPluginsMethod('pluginSyncUI');
    _$jscoverage['/control/process.js'].lineData[112]++;
    self.fire('afterSyncUI');
    _$jscoverage['/control/process.js'].lineData[114]++;
    self.setInternal('rendered', true);
  }
  _$jscoverage['/control/process.js'].lineData[116]++;
  return self;
}, 
  plug: function(plugin) {
  _$jscoverage['/control/process.js'].functionData[3]++;
  _$jscoverage['/control/process.js'].lineData[120]++;
  var self = this, p, plugins = self.get('plugins');
  _$jscoverage['/control/process.js'].lineData[123]++;
  self.callSuper(plugin);
  _$jscoverage['/control/process.js'].lineData[124]++;
  p = plugins[plugins.length - 1];
  _$jscoverage['/control/process.js'].lineData[125]++;
  if (visit3_125_1(self.get('rendered'))) {
    _$jscoverage['/control/process.js'].lineData[127]++;
    if (visit4_127_1(p.pluginCreateDom)) {
      _$jscoverage['/control/process.js'].lineData[128]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control/process.js'].lineData[130]++;
    if (visit5_130_1(p.pluginRenderUI)) {
      _$jscoverage['/control/process.js'].lineData[131]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control/process.js'].lineData[133]++;
    if (visit6_133_1(p.pluginBindUI)) {
      _$jscoverage['/control/process.js'].lineData[134]++;
      p.pluginBindUI(self);
    }
    _$jscoverage['/control/process.js'].lineData[136]++;
    if (visit7_136_1(p.pluginSyncUI)) {
      _$jscoverage['/control/process.js'].lineData[137]++;
      p.pluginSyncUI(self);
    }
  } else {
    _$jscoverage['/control/process.js'].lineData[139]++;
    if (visit8_139_1(self.get('created'))) {
      _$jscoverage['/control/process.js'].lineData[140]++;
      if (visit9_140_1(p.pluginCreateDom)) {
        _$jscoverage['/control/process.js'].lineData[141]++;
        p.pluginCreateDom(self);
      }
    }
  }
  _$jscoverage['/control/process.js'].lineData[144]++;
  return self;
}}, {
  __hooks__: {
  createDom: __getHook('__createDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI')}, 
  name: 'ControlProcess', 
  ATTRS: {
  rendered: {
  value: false}, 
  created: {
  value: false}}});
  _$jscoverage['/control/process.js'].lineData[185]++;
  return ControlProcess;
});
