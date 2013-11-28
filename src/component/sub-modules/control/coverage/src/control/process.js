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
  _$jscoverage['/control/process.js'].lineData[17] = 0;
  _$jscoverage['/control/process.js'].lineData[23] = 0;
  _$jscoverage['/control/process.js'].lineData[33] = 0;
  _$jscoverage['/control/process.js'].lineData[42] = 0;
  _$jscoverage['/control/process.js'].lineData[43] = 0;
  _$jscoverage['/control/process.js'].lineData[49] = 0;
  _$jscoverage['/control/process.js'].lineData[50] = 0;
  _$jscoverage['/control/process.js'].lineData[51] = 0;
  _$jscoverage['/control/process.js'].lineData[57] = 0;
  _$jscoverage['/control/process.js'].lineData[59] = 0;
  _$jscoverage['/control/process.js'].lineData[61] = 0;
  _$jscoverage['/control/process.js'].lineData[65] = 0;
  _$jscoverage['/control/process.js'].lineData[73] = 0;
  _$jscoverage['/control/process.js'].lineData[75] = 0;
  _$jscoverage['/control/process.js'].lineData[76] = 0;
  _$jscoverage['/control/process.js'].lineData[84] = 0;
  _$jscoverage['/control/process.js'].lineData[85] = 0;
  _$jscoverage['/control/process.js'].lineData[86] = 0;
  _$jscoverage['/control/process.js'].lineData[93] = 0;
  _$jscoverage['/control/process.js'].lineData[101] = 0;
  _$jscoverage['/control/process.js'].lineData[102] = 0;
  _$jscoverage['/control/process.js'].lineData[103] = 0;
  _$jscoverage['/control/process.js'].lineData[104] = 0;
  _$jscoverage['/control/process.js'].lineData[110] = 0;
  _$jscoverage['/control/process.js'].lineData[112] = 0;
  _$jscoverage['/control/process.js'].lineData[113] = 0;
  _$jscoverage['/control/process.js'].lineData[115] = 0;
  _$jscoverage['/control/process.js'].lineData[117] = 0;
  _$jscoverage['/control/process.js'].lineData[124] = 0;
  _$jscoverage['/control/process.js'].lineData[128] = 0;
  _$jscoverage['/control/process.js'].lineData[131] = 0;
  _$jscoverage['/control/process.js'].lineData[132] = 0;
  _$jscoverage['/control/process.js'].lineData[133] = 0;
  _$jscoverage['/control/process.js'].lineData[135] = 0;
  _$jscoverage['/control/process.js'].lineData[136] = 0;
  _$jscoverage['/control/process.js'].lineData[138] = 0;
  _$jscoverage['/control/process.js'].lineData[139] = 0;
  _$jscoverage['/control/process.js'].lineData[141] = 0;
  _$jscoverage['/control/process.js'].lineData[142] = 0;
  _$jscoverage['/control/process.js'].lineData[144] = 0;
  _$jscoverage['/control/process.js'].lineData[145] = 0;
  _$jscoverage['/control/process.js'].lineData[147] = 0;
  _$jscoverage['/control/process.js'].lineData[148] = 0;
  _$jscoverage['/control/process.js'].lineData[149] = 0;
  _$jscoverage['/control/process.js'].lineData[152] = 0;
  _$jscoverage['/control/process.js'].lineData[178] = 0;
  _$jscoverage['/control/process.js'].lineData[179] = 0;
  _$jscoverage['/control/process.js'].lineData[198] = 0;
  _$jscoverage['/control/process.js'].lineData[204] = 0;
  _$jscoverage['/control/process.js'].lineData[205] = 0;
  _$jscoverage['/control/process.js'].lineData[206] = 0;
  _$jscoverage['/control/process.js'].lineData[212] = 0;
  _$jscoverage['/control/process.js'].lineData[215] = 0;
}
if (! _$jscoverage['/control/process.js'].functionData) {
  _$jscoverage['/control/process.js'].functionData = [];
  _$jscoverage['/control/process.js'].functionData[0] = 0;
  _$jscoverage['/control/process.js'].functionData[1] = 0;
  _$jscoverage['/control/process.js'].functionData[2] = 0;
  _$jscoverage['/control/process.js'].functionData[3] = 0;
  _$jscoverage['/control/process.js'].functionData[4] = 0;
  _$jscoverage['/control/process.js'].functionData[5] = 0;
  _$jscoverage['/control/process.js'].functionData[6] = 0;
  _$jscoverage['/control/process.js'].functionData[7] = 0;
  _$jscoverage['/control/process.js'].functionData[8] = 0;
  _$jscoverage['/control/process.js'].functionData[9] = 0;
}
if (! _$jscoverage['/control/process.js'].branchData) {
  _$jscoverage['/control/process.js'].branchData = {};
  _$jscoverage['/control/process.js'].branchData['43'] = [];
  _$jscoverage['/control/process.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['75'] = [];
  _$jscoverage['/control/process.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['133'] = [];
  _$jscoverage['/control/process.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['135'] = [];
  _$jscoverage['/control/process.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['138'] = [];
  _$jscoverage['/control/process.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['141'] = [];
  _$jscoverage['/control/process.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['144'] = [];
  _$jscoverage['/control/process.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['147'] = [];
  _$jscoverage['/control/process.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['148'] = [];
  _$jscoverage['/control/process.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/control/process.js'].branchData['178'] = [];
  _$jscoverage['/control/process.js'].branchData['178'][1] = new BranchData();
}
_$jscoverage['/control/process.js'].branchData['178'][1].init(25, 1, 'v');
function visit10_178_1(result) {
  _$jscoverage['/control/process.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['148'][1].init(21, 17, 'p.pluginCreateDom');
function visit9_148_1(result) {
  _$jscoverage['/control/process.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['147'][1].init(696, 19, 'self.get(\'created\')');
function visit8_147_1(result) {
  _$jscoverage['/control/process.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['144'][1].init(378, 14, 'p.pluginSyncUI');
function visit7_144_1(result) {
  _$jscoverage['/control/process.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['141'][1].init(280, 14, 'p.pluginBindUI');
function visit6_141_1(result) {
  _$jscoverage['/control/process.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['138'][1].init(177, 16, 'p.pluginRenderUI');
function visit5_138_1(result) {
  _$jscoverage['/control/process.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['135'][1].init(73, 17, 'p.pluginCreateDom');
function visit4_135_1(result) {
  _$jscoverage['/control/process.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['133'][1].init(193, 20, 'self.get(\'rendered\')');
function visit3_133_1(result) {
  _$jscoverage['/control/process.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['75'][1].init(69, 21, '!self.get(\'rendered\')');
function visit2_75_1(result) {
  _$jscoverage['/control/process.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].branchData['43'][1].init(46, 20, '!self.get(\'created\')');
function visit1_43_1(result) {
  _$jscoverage['/control/process.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/control/process.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/control/process.js'].functionData[0]++;
  _$jscoverage['/control/process.js'].lineData[7]++;
  var Base = require('base');
  _$jscoverage['/control/process.js'].lineData[8]++;
  var Promise = require('promise');
  _$jscoverage['/control/process.js'].lineData[9]++;
  var Defer = Promise.Defer, __getHook = Base.prototype.__getHook, noop = S.noop;
  _$jscoverage['/control/process.js'].lineData[17]++;
  var ComponentProcess = Base.extend({
  bindInternal: noop, 
  syncInternal: noop, 
  initializer: function() {
  _$jscoverage['/control/process.js'].functionData[1]++;
  _$jscoverage['/control/process.js'].lineData[23]++;
  this._renderedDefer = new Defer();
}, 
  renderUI: noop, 
  syncUI: noop, 
  bindUI: noop, 
  onRendered: function(fn) {
  _$jscoverage['/control/process.js'].functionData[2]++;
  _$jscoverage['/control/process.js'].lineData[33]++;
  return this._renderedDefer.promise.then(fn);
}, 
  create: function() {
  _$jscoverage['/control/process.js'].functionData[3]++;
  _$jscoverage['/control/process.js'].lineData[42]++;
  var self = this;
  _$jscoverage['/control/process.js'].lineData[43]++;
  if (visit1_43_1(!self.get('created'))) {
    _$jscoverage['/control/process.js'].lineData[49]++;
    self.fire('beforeCreateDom');
    _$jscoverage['/control/process.js'].lineData[50]++;
    self.createInternal();
    _$jscoverage['/control/process.js'].lineData[51]++;
    self.__callPluginsMethod('pluginCreateDom');
    _$jscoverage['/control/process.js'].lineData[57]++;
    self.fire('afterCreateDom');
    _$jscoverage['/control/process.js'].lineData[59]++;
    self.setInternal('created', true);
  }
  _$jscoverage['/control/process.js'].lineData[61]++;
  return self;
}, 
  createInternal: function() {
  _$jscoverage['/control/process.js'].functionData[4]++;
  _$jscoverage['/control/process.js'].lineData[65]++;
  this.createDom();
}, 
  render: function() {
  _$jscoverage['/control/process.js'].functionData[5]++;
  _$jscoverage['/control/process.js'].lineData[73]++;
  var self = this;
  _$jscoverage['/control/process.js'].lineData[75]++;
  if (visit2_75_1(!self.get('rendered'))) {
    _$jscoverage['/control/process.js'].lineData[76]++;
    self.create();
    _$jscoverage['/control/process.js'].lineData[84]++;
    self.fire('beforeRenderUI');
    _$jscoverage['/control/process.js'].lineData[85]++;
    self.renderUI();
    _$jscoverage['/control/process.js'].lineData[86]++;
    self.__callPluginsMethod('pluginRenderUI');
    _$jscoverage['/control/process.js'].lineData[93]++;
    self.fire('afterRenderUI');
    _$jscoverage['/control/process.js'].lineData[101]++;
    self.fire('beforeBindUI');
    _$jscoverage['/control/process.js'].lineData[102]++;
    ComponentProcess.superclass.bindInternal.call(self);
    _$jscoverage['/control/process.js'].lineData[103]++;
    self.bindUI();
    _$jscoverage['/control/process.js'].lineData[104]++;
    self.__callPluginsMethod('pluginBindUI');
    _$jscoverage['/control/process.js'].lineData[110]++;
    self.fire('afterBindUI');
    _$jscoverage['/control/process.js'].lineData[112]++;
    ComponentProcess.superclass.syncInternal.call(self);
    _$jscoverage['/control/process.js'].lineData[113]++;
    syncUIs(self);
    _$jscoverage['/control/process.js'].lineData[115]++;
    self.setInternal('rendered', true);
  }
  _$jscoverage['/control/process.js'].lineData[117]++;
  return self;
}, 
  sync: function() {
  _$jscoverage['/control/process.js'].functionData[6]++;
  _$jscoverage['/control/process.js'].lineData[124]++;
  syncUIs(this);
}, 
  plug: function(plugin) {
  _$jscoverage['/control/process.js'].functionData[7]++;
  _$jscoverage['/control/process.js'].lineData[128]++;
  var self = this, p, plugins = self.get('plugins');
  _$jscoverage['/control/process.js'].lineData[131]++;
  self.callSuper(plugin);
  _$jscoverage['/control/process.js'].lineData[132]++;
  p = plugins[plugins.length - 1];
  _$jscoverage['/control/process.js'].lineData[133]++;
  if (visit3_133_1(self.get('rendered'))) {
    _$jscoverage['/control/process.js'].lineData[135]++;
    if (visit4_135_1(p.pluginCreateDom)) {
      _$jscoverage['/control/process.js'].lineData[136]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control/process.js'].lineData[138]++;
    if (visit5_138_1(p.pluginRenderUI)) {
      _$jscoverage['/control/process.js'].lineData[139]++;
      p.pluginCreateDom(self);
    }
    _$jscoverage['/control/process.js'].lineData[141]++;
    if (visit6_141_1(p.pluginBindUI)) {
      _$jscoverage['/control/process.js'].lineData[142]++;
      p.pluginBindUI(self);
    }
    _$jscoverage['/control/process.js'].lineData[144]++;
    if (visit7_144_1(p.pluginSyncUI)) {
      _$jscoverage['/control/process.js'].lineData[145]++;
      p.pluginSyncUI(self);
    }
  } else {
    _$jscoverage['/control/process.js'].lineData[147]++;
    if (visit8_147_1(self.get('created'))) {
      _$jscoverage['/control/process.js'].lineData[148]++;
      if (visit9_148_1(p.pluginCreateDom)) {
        _$jscoverage['/control/process.js'].lineData[149]++;
        p.pluginCreateDom(self);
      }
    }
  }
  _$jscoverage['/control/process.js'].lineData[152]++;
  return self;
}}, {
  __hooks__: {
  createDom: __getHook('__createDom'), 
  renderUI: __getHook('__renderUI'), 
  bindUI: __getHook('__bindUI'), 
  syncUI: __getHook('__syncUI')}, 
  name: 'ComponentProcess', 
  ATTRS: {
  rendered: {
  value: false, 
  setter: function(v) {
  _$jscoverage['/control/process.js'].functionData[8]++;
  _$jscoverage['/control/process.js'].lineData[178]++;
  if (visit10_178_1(v)) {
    _$jscoverage['/control/process.js'].lineData[179]++;
    this._renderedDefer.resolve(this);
  }
}}, 
  created: {
  value: false}}});
  _$jscoverage['/control/process.js'].lineData[198]++;
  function syncUIs(self) {
    _$jscoverage['/control/process.js'].functionData[9]++;
    _$jscoverage['/control/process.js'].lineData[204]++;
    self.fire('beforeSyncUI');
    _$jscoverage['/control/process.js'].lineData[205]++;
    self.syncUI();
    _$jscoverage['/control/process.js'].lineData[206]++;
    self.__callPluginsMethod('pluginSyncUI');
    _$jscoverage['/control/process.js'].lineData[212]++;
    self.fire('afterSyncUI');
  }
  _$jscoverage['/control/process.js'].lineData[215]++;
  return ComponentProcess;
});
