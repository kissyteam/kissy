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
  _$jscoverage['/flash-bridge.js'].lineData[5] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[6] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[8] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[9] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[12] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[14] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[17] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[18] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[19] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[20] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[25] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[33] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[38] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[42] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[46] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[47] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[52] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[53] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[54] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[55] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[56] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[59] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[60] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[61] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[62] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[63] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[64] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[75] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[78] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[81] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[82] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[83] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[84] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[88] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[89] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[90] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[92] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[96] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[97] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[101] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[102] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[103] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[104] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[107] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[108] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[113] = 0;
  _$jscoverage['/flash-bridge.js'].lineData[115] = 0;
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
  _$jscoverage['/flash-bridge.js'].branchData['18'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['19'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['23'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['46'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['60'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['81'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['83'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['89'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/flash-bridge.js'].branchData['104'] = [];
  _$jscoverage['/flash-bridge.js'].branchData['104'][1] = new BranchData();
}
_$jscoverage['/flash-bridge.js'].branchData['104'][1].init(105, 8, 'instance');
function visit9_104_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['89'][1].init(48, 11, 'self._ready');
function visit8_89_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['83'][1].init(168, 4, 'type');
function visit7_83_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['81'][1].init(86, 14, 'type === \'log\'');
function visit6_81_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['60'][1].init(60, 18, 'i < methods.length');
function visit5_60_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['46'][1].init(1185, 12, 'cfg.ajbridge');
function visit4_46_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['23'][1].init(125, 22, 'params.flashVars || {}');
function visit3_23_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['19'][1].init(240, 16, 'cfg.params || {}');
function visit2_19_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].branchData['18'][1].init(197, 15, 'cfg.attrs || {}');
function visit1_18_1(result) {
  _$jscoverage['/flash-bridge.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/flash-bridge.js'].lineData[5]++;
KISSY.add("editor/plugin/flash-bridge", function(S, SWF, Editor) {
  _$jscoverage['/flash-bridge.js'].functionData[0]++;
  _$jscoverage['/flash-bridge.js'].lineData[6]++;
  var instances = {};
  _$jscoverage['/flash-bridge.js'].lineData[8]++;
  function FlashBridge(cfg) {
    _$jscoverage['/flash-bridge.js'].functionData[1]++;
    _$jscoverage['/flash-bridge.js'].lineData[9]++;
    this._init(cfg);
  }
  _$jscoverage['/flash-bridge.js'].lineData[12]++;
  S.augment(FlashBridge, S.EventTarget, {
  _init: function(cfg) {
  _$jscoverage['/flash-bridge.js'].functionData[2]++;
  _$jscoverage['/flash-bridge.js'].lineData[14]++;
  var self = this, id = S.guid("flashbridge-"), callback = "KISSY.Editor.FlashBridge.EventHandler";
  _$jscoverage['/flash-bridge.js'].lineData[17]++;
  cfg.id = id;
  _$jscoverage['/flash-bridge.js'].lineData[18]++;
  cfg.attrs = visit1_18_1(cfg.attrs || {});
  _$jscoverage['/flash-bridge.js'].lineData[19]++;
  cfg.params = visit2_19_1(cfg.params || {});
  _$jscoverage['/flash-bridge.js'].lineData[20]++;
  var attrs = cfg.attrs, params = cfg.params, flashVars = params.flashVars = visit3_23_1(params.flashVars || {});
  _$jscoverage['/flash-bridge.js'].lineData[25]++;
  S.mix(attrs, {
  width: 1, 
  height: 1}, false);
  _$jscoverage['/flash-bridge.js'].lineData[33]++;
  S.mix(params, {
  allowScriptAccess: 'always', 
  allowNetworking: 'all', 
  scale: 'noScale'}, false);
  _$jscoverage['/flash-bridge.js'].lineData[38]++;
  S.mix(flashVars, {
  shareData: false, 
  useCompression: false}, false);
  _$jscoverage['/flash-bridge.js'].lineData[42]++;
  var swfCore = {
  YUISwfId: id, 
  YUIBridgeCallback: callback};
  _$jscoverage['/flash-bridge.js'].lineData[46]++;
  if (visit4_46_1(cfg.ajbridge)) {
    _$jscoverage['/flash-bridge.js'].lineData[47]++;
    swfCore = {
  swfID: id, 
  jsEntry: callback};
  }
  _$jscoverage['/flash-bridge.js'].lineData[52]++;
  S.mix(flashVars, swfCore);
  _$jscoverage['/flash-bridge.js'].lineData[53]++;
  instances[id] = self;
  _$jscoverage['/flash-bridge.js'].lineData[54]++;
  self.id = id;
  _$jscoverage['/flash-bridge.js'].lineData[55]++;
  self.swf = new SWF(cfg);
  _$jscoverage['/flash-bridge.js'].lineData[56]++;
  self._expose(cfg.methods);
}, 
  _expose: function(methods) {
  _$jscoverage['/flash-bridge.js'].functionData[3]++;
  _$jscoverage['/flash-bridge.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/flash-bridge.js'].lineData[60]++;
  for (var i = 0; visit5_60_1(i < methods.length); i++) {
    _$jscoverage['/flash-bridge.js'].lineData[61]++;
    var m = methods[i];
    _$jscoverage['/flash-bridge.js'].lineData[62]++;
    (function(m) {
  _$jscoverage['/flash-bridge.js'].functionData[4]++;
  _$jscoverage['/flash-bridge.js'].lineData[63]++;
  self[m] = function() {
  _$jscoverage['/flash-bridge.js'].functionData[5]++;
  _$jscoverage['/flash-bridge.js'].lineData[64]++;
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
  _$jscoverage['/flash-bridge.js'].lineData[81]++;
  if (visit6_81_1(type === 'log')) {
    _$jscoverage['/flash-bridge.js'].lineData[82]++;
    S.log(event.message);
  } else {
    _$jscoverage['/flash-bridge.js'].lineData[83]++;
    if (visit7_83_1(type)) {
      _$jscoverage['/flash-bridge.js'].lineData[84]++;
      self.fire(type, event);
    }
  }
}, 
  ready: function(fn) {
  _$jscoverage['/flash-bridge.js'].functionData[8]++;
  _$jscoverage['/flash-bridge.js'].lineData[88]++;
  var self = this;
  _$jscoverage['/flash-bridge.js'].lineData[89]++;
  if (visit8_89_1(self._ready)) {
    _$jscoverage['/flash-bridge.js'].lineData[90]++;
    fn.call(this);
  } else {
    _$jscoverage['/flash-bridge.js'].lineData[92]++;
    self.on("contentReady", fn);
  }
}, 
  destroy: function() {
  _$jscoverage['/flash-bridge.js'].functionData[9]++;
  _$jscoverage['/flash-bridge.js'].lineData[96]++;
  this.swf.destroy();
  _$jscoverage['/flash-bridge.js'].lineData[97]++;
  delete instances[this.id];
}});
  _$jscoverage['/flash-bridge.js'].lineData[101]++;
  FlashBridge.EventHandler = function(id, event) {
  _$jscoverage['/flash-bridge.js'].functionData[10]++;
  _$jscoverage['/flash-bridge.js'].lineData[102]++;
  S.log("flash fire event : " + event.type);
  _$jscoverage['/flash-bridge.js'].lineData[103]++;
  var instance = instances[id];
  _$jscoverage['/flash-bridge.js'].lineData[104]++;
  if (visit9_104_1(instance)) {
    _$jscoverage['/flash-bridge.js'].lineData[107]++;
    setTimeout(function() {
  _$jscoverage['/flash-bridge.js'].functionData[11]++;
  _$jscoverage['/flash-bridge.js'].lineData[108]++;
  instance._eventHandler.call(instance, event);
}, 100);
  }
};
  _$jscoverage['/flash-bridge.js'].lineData[113]++;
  Editor.FlashBridge = FlashBridge;
  _$jscoverage['/flash-bridge.js'].lineData[115]++;
  return FlashBridge;
}, {
  requires: ['swf', 'editor']});
