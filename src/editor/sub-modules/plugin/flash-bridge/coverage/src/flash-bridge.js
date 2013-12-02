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
if (! _$jscoverage['/flash-bridge.js']) {
  _$jscoverage['/flash-bridge.js'] = {};
  _$jscoverage['/flash-bridge.js'].lineData = [];
  _$jscoverage['/flash-bridge.js'].lineData[6] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[7] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[8] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[9] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[11] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[12] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[14] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[15] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[18] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[20] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[23] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[24] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[25] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[26] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[29] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[37] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[42] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[46] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[50] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[51] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[56] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[57] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[58] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[59] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[60] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[63] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[64] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[65] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[67] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[68] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[69] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[75] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[78] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[80] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[81] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[82] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[83] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[87] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[88] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[89] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[91] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[95] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[96] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[100] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[101] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[102] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[103] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[106] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[107] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[112] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[114] = 0;
}
if (! _$jscoverage['/flash-bridge.js'].functionData) {
  _$jscoverage['/flash-bridge.js'].functionData = [];
  _$jscoverage['/flash-bridge.js'].functionData[0] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[1] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[2] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[3] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[4] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[5] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[6] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[7] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[8] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[9] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[10] = 0;
  _$jscoverage['/flash-bridge.js'].functionData[11] = 0;
}
if (! _$jscoverage['/flash-bridge.js'].branchData) {
  _$jscoverage['/flash-bridge.js'].branchData = {};
  _$jscoverage['/flash-bridge.js'].branchData['24'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['25'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['28'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['50'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['64'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['80'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['82'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['88'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['103'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['103'][1] = new BranchData();
}
_$jscoverage['/flash-bridge.js'].branchData['103'][1].init(102, 8, 'instance');
function visit9_103_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['88'][1].init(46, 11, 'self._ready');
function visit8_88_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['82'][1].init(168, 4, 'type');
function visit7_82_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['80'][1].init(81, 14, 'type === \'log\'');
function visit6_80_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['64'][1].init(58, 18, 'i < methods.length');
function visit5_64_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['50'][1].init(1149, 12, 'cfg.ajbridge');
function visit4_50_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['28'][1].init(106, 22, 'params.flashVars || {}');
function visit3_28_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['25'][1].init(248, 16, 'cfg.params || {}');
function visit2_25_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['24'][1].init(206, 15, 'cfg.attrs || {}');
function visit1_24_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/flash-bridge.js'].functionData[0]++;
  _$jscoverage['/flash-bridge.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/flash-bridge.js'].lineData[8]++;
  var SWF = require('swf');
  _$jscoverage['/flash-bridge.js'].lineData[9]++;
  var Event = require('event');
  _$jscoverage['/flash-bridge.js'].lineData[11]++;
  var instances = {};
  _$jscoverage['/flash-bridge.js'].lineData[12]++;
  var logger = S.getLogger('s/editor/plugin/flash-bridge');
  _$jscoverage['/flash-bridge.js'].lineData[14]++;
  function FlashBridge(cfg) {
    _$jscoverage['/flash-bridge.js'].functionData[1]++;
    _$jscoverage['/flash-bridge.js'].lineData[15]++;
    this._init(cfg);
  }
  _$jscoverage['/flash-bridge.js'].lineData[18]++;
  S.augment(FlashBridge, Event.Target, {
  _init: function(cfg) {
  _$jscoverage['/flash-bridge.js'].functionData[2]++;
  _$jscoverage['/flash-bridge.js'].lineData[20]++;
  var self = this, id = S.guid('flash-bridge-'), callback = 'KISSY.require(\'editor\').FlashBridge.EventHandler';
  _$jscoverage['/flash-bridge.js'].lineData[23]++;
  cfg.id = id;
  _$jscoverage['/flash-bridge.js'].lineData[24]++;
  cfg.attrs = visit1_24_1(cfg.attrs || {});
  _$jscoverage['/flash-bridge.js'].lineData[25]++;
  cfg.params = visit2_25_1(cfg.params || {});
  _$jscoverage['/flash-bridge.js'].lineData[26]++;
  var attrs = cfg.attrs, params = cfg.params, flashVars = params.flashVars = visit3_28_1(params.flashVars || {});
  _$jscoverage['/flash-bridge.js'].lineData[29]++;
  S.mix(attrs, {
  width: 1, 
  height: 1}, false);
  _$jscoverage['/flash-bridge.js'].lineData[37]++;
  S.mix(params, {
  allowScriptAccess: 'always', 
  allowNetworking: 'all', 
  scale: 'noScale'}, false);
  _$jscoverage['/flash-bridge.js'].lineData[42]++;
  S.mix(flashVars, {
  shareData: false, 
  useCompression: false}, false);
  _$jscoverage['/flash-bridge.js'].lineData[46]++;
  var swfCore = {
  YUISwfId: id, 
  YUIBridgeCallback: callback};
  _$jscoverage['/flash-bridge.js'].lineData[50]++;
  if (visit4_50_1(cfg.ajbridge)) {
    _$jscoverage['/flash-bridge.js'].lineData[51]++;
    swfCore = {
  swfID: id, 
  jsEntry: callback};
  }
  _$jscoverage['/flash-bridge.js'].lineData[56]++;
  S.mix(flashVars, swfCore);
  _$jscoverage['/flash-bridge.js'].lineData[57]++;
  instances[id] = self;
  _$jscoverage['/flash-bridge.js'].lineData[58]++;
  self.id = id;
  _$jscoverage['/flash-bridge.js'].lineData[59]++;
  self.swf = new SWF(cfg);
  _$jscoverage['/flash-bridge.js'].lineData[60]++;
  self._expose(cfg.methods);
}, 
  _expose: function(methods) {
  _$jscoverage['/flash-bridge.js'].functionData[3]++;
  _$jscoverage['/flash-bridge.js'].lineData[63]++;
  var self = this;
  _$jscoverage['/flash-bridge.js'].lineData[64]++;
  for (var i = 0; visit5_64_1(i < methods.length); i++) {
    _$jscoverage['/flash-bridge.js'].lineData[65]++;
    var m = methods[i];
    _$jscoverage['/flash-bridge.js'].lineData[67]++;
    (function(m) {
  _$jscoverage['/flash-bridge.js'].functionData[4]++;
  _$jscoverage['/flash-bridge.js'].lineData[68]++;
  self[m] = function() {
  _$jscoverage['/flash-bridge.js'].functionData[5]++;
  _$jscoverage['/flash-bridge.js'].lineData[69]++;
  return self._callSWF(m, S.makeArray(arguments));
};
})(m);
  }
}, 
  _callSWF: function(func, args) {
  _$jscoverage['/flash-bridge.js'].functionData[6]++;
  _$jscoverage['/flash-bridge.js'].lineData[75]++;
  return this.swf.callSWF(func, args);
}, 
  _eventHandler: function(event) {
  _$jscoverage['/flash-bridge.js'].functionData[7]++;
  _$jscoverage['/flash-bridge.js'].lineData[78]++;
  var self = this, type = event.type;
  _$jscoverage['/flash-bridge.js'].lineData[80]++;
  if (visit6_80_1(type === 'log')) {
    _$jscoverage['/flash-bridge.js'].lineData[81]++;
    logger.debug(event.message);
  } else {
    _$jscoverage['/flash-bridge.js'].lineData[82]++;
    if (visit7_82_1(type)) {
      _$jscoverage['/flash-bridge.js'].lineData[83]++;
      self.fire(type, event);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/flash-bridge.js'].functionData[8]++;
  _$jscoverage['/flash-bridge.js'].lineData[87]++;
  var self = this;
  _$jscoverage['/flash-bridge.js'].lineData[88]++;
  if (visit8_88_1(self._ready)) {
    _$jscoverage['/flash-bridge.js'].lineData[89]++;
    fn.call(this);
  } else {
    _$jscoverage['/flash-bridge.js'].lineData[91]++;
    self.on('contentReady', fn);
  }
}, 
  destroy: function() {
  _$jscoverage['/flash-bridge.js'].functionData[9]++;
  _$jscoverage['/flash-bridge.js'].lineData[95]++;
  this.swf.destroy();
  _$jscoverage['/flash-bridge.js'].lineData[96]++;
  delete instances[this.id];
}});
  _$jscoverage['/flash-bridge.js'].lineData[100]++;
  FlashBridge.EventHandler = function(id, event) {
  _$jscoverage['/flash-bridge.js'].functionData[10]++;
  _$jscoverage['/flash-bridge.js'].lineData[101]++;
  logger.debug('fire event: ' + event.type);
  _$jscoverage['/flash-bridge.js'].lineData[102]++;
  var instance = instances[id];
  _$jscoverage['/flash-bridge.js'].lineData[103]++;
  if (visit9_103_1(instance)) {
    _$jscoverage['/flash-bridge.js'].lineData[106]++;
    setTimeout(function() {
  _$jscoverage['/flash-bridge.js'].functionData[11]++;
  _$jscoverage['/flash-bridge.js'].lineData[107]++;
  instance._eventHandler.call(instance, event);
}, 100);
  }
};
  _$jscoverage['/flash-bridge.js'].lineData[112]++;
  Editor.FlashBridge = FlashBridge;
  _$jscoverage['/flash-bridge.js'].lineData[114]++;
  return FlashBridge;
});
