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
if (! _$jscoverage['/xtemplate.js']) {
  _$jscoverage['/xtemplate.js'] = {};
  _$jscoverage['/xtemplate.js'].lineData = [];
  _$jscoverage['/xtemplate.js'].lineData[6] = 0;
  _$jscoverage['/xtemplate.js'].lineData[7] = 0;
  _$jscoverage['/xtemplate.js'].lineData[8] = 0;
  _$jscoverage['/xtemplate.js'].lineData[9] = 0;
  _$jscoverage['/xtemplate.js'].lineData[10] = 0;
  _$jscoverage['/xtemplate.js'].lineData[12] = 0;
  _$jscoverage['/xtemplate.js'].lineData[13] = 0;
  _$jscoverage['/xtemplate.js'].lineData[15] = 0;
  _$jscoverage['/xtemplate.js'].lineData[16] = 0;
  _$jscoverage['/xtemplate.js'].lineData[19] = 0;
  _$jscoverage['/xtemplate.js'].lineData[21] = 0;
  _$jscoverage['/xtemplate.js'].lineData[22] = 0;
  _$jscoverage['/xtemplate.js'].lineData[25] = 0;
  _$jscoverage['/xtemplate.js'].lineData[27] = 0;
  _$jscoverage['/xtemplate.js'].lineData[28] = 0;
  _$jscoverage['/xtemplate.js'].lineData[31] = 0;
  _$jscoverage['/xtemplate.js'].lineData[54] = 0;
  _$jscoverage['/xtemplate.js'].lineData[55] = 0;
  _$jscoverage['/xtemplate.js'].lineData[56] = 0;
  _$jscoverage['/xtemplate.js'].lineData[58] = 0;
  _$jscoverage['/xtemplate.js'].lineData[61] = 0;
  _$jscoverage['/xtemplate.js'].lineData[89] = 0;
}
if (! _$jscoverage['/xtemplate.js'].functionData) {
  _$jscoverage['/xtemplate.js'].functionData = [];
  _$jscoverage['/xtemplate.js'].functionData[0] = 0;
  _$jscoverage['/xtemplate.js'].functionData[1] = 0;
  _$jscoverage['/xtemplate.js'].functionData[2] = 0;
}
if (! _$jscoverage['/xtemplate.js'].branchData) {
  _$jscoverage['/xtemplate.js'].branchData = {};
  _$jscoverage['/xtemplate.js'].branchData['15'] = [];
  _$jscoverage['/xtemplate.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['19'] = [];
  _$jscoverage['/xtemplate.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['21'] = [];
  _$jscoverage['/xtemplate.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['25'] = [];
  _$jscoverage['/xtemplate.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['27'] = [];
  _$jscoverage['/xtemplate.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['55'] = [];
  _$jscoverage['/xtemplate.js'].branchData['55'][1] = new BranchData();
}
_$jscoverage['/xtemplate.js'].branchData['55'][1].init(14, 23, 'typeof tpl === \'string\'');
function visit81_55_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['27'][1].init(338, 9, 'cacheable');
function visit80_27_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['25'][1].init(299, 21, 'config && config.name');
function visit79_25_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['21'][1].init(188, 30, 'cacheable && (fn = cache[tpl])');
function visit78_21_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['19'][2].init(149, 22, 'config.cache !== false');
function visit77_19_2(result) {
  _$jscoverage['/xtemplate.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['19'][1].init(138, 33, '!config || config.cache !== false');
function visit76_19_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['15'][1].init(33, 21, 'config && config.root');
function visit75_15_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xtemplate.js'].functionData[0]++;
  _$jscoverage['/xtemplate.js'].lineData[7]++;
  require('util');
  _$jscoverage['/xtemplate.js'].lineData[8]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/xtemplate.js'].lineData[9]++;
  var Compiler = require('xtemplate/compiler');
  _$jscoverage['/xtemplate.js'].lineData[10]++;
  var cache = XTemplate.cache = {};
  _$jscoverage['/xtemplate.js'].lineData[12]++;
  function compile(tpl, config) {
    _$jscoverage['/xtemplate.js'].functionData[1]++;
    _$jscoverage['/xtemplate.js'].lineData[13]++;
    var fn;
    _$jscoverage['/xtemplate.js'].lineData[15]++;
    if (visit75_15_1(config && config.root)) {
      _$jscoverage['/xtemplate.js'].lineData[16]++;
      config = config.root.config;
    }
    _$jscoverage['/xtemplate.js'].lineData[19]++;
    var cacheable = visit76_19_1(!config || visit77_19_2(config.cache !== false));
    _$jscoverage['/xtemplate.js'].lineData[21]++;
    if (visit78_21_1(cacheable && (fn = cache[tpl]))) {
      _$jscoverage['/xtemplate.js'].lineData[22]++;
      return fn;
    }
    _$jscoverage['/xtemplate.js'].lineData[25]++;
    fn = Compiler.compileToFn(tpl, visit79_25_1(config && config.name));
    _$jscoverage['/xtemplate.js'].lineData[27]++;
    if (visit80_27_1(cacheable)) {
      _$jscoverage['/xtemplate.js'].lineData[28]++;
      cache[tpl] = fn;
    }
    _$jscoverage['/xtemplate.js'].lineData[31]++;
    return fn;
  }
  _$jscoverage['/xtemplate.js'].lineData[54]++;
  function XTemplate(tpl, config) {
    _$jscoverage['/xtemplate.js'].functionData[2]++;
    _$jscoverage['/xtemplate.js'].lineData[55]++;
    if (visit81_55_1(typeof tpl === 'string')) {
      _$jscoverage['/xtemplate.js'].lineData[56]++;
      tpl = compile(tpl, config);
    }
    _$jscoverage['/xtemplate.js'].lineData[58]++;
    XTemplate.superclass.constructor.call(this, tpl, config);
  }
  _$jscoverage['/xtemplate.js'].lineData[61]++;
  S.extend(XTemplate, XTemplateRuntime, {}, {
  Compiler: Compiler, 
  pool: XTemplateRuntime.pool, 
  Scope: XTemplateRuntime.Scope, 
  RunTime: XTemplateRuntime, 
  addCommand: XTemplateRuntime.addCommand, 
  removeCommand: XTemplateRuntime.removeCommand});
  _$jscoverage['/xtemplate.js'].lineData[89]++;
  return XTemplate;
});
