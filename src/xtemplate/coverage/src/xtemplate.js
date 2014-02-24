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
  _$jscoverage['/xtemplate.js'].lineData[10] = 0;
  _$jscoverage['/xtemplate.js'].lineData[32] = 0;
  _$jscoverage['/xtemplate.js'].lineData[33] = 0;
  _$jscoverage['/xtemplate.js'].lineData[34] = 0;
  _$jscoverage['/xtemplate.js'].lineData[35] = 0;
  _$jscoverage['/xtemplate.js'].lineData[37] = 0;
  _$jscoverage['/xtemplate.js'].lineData[40] = 0;
  _$jscoverage['/xtemplate.js'].lineData[44] = 0;
  _$jscoverage['/xtemplate.js'].lineData[45] = 0;
  _$jscoverage['/xtemplate.js'].lineData[46] = 0;
  _$jscoverage['/xtemplate.js'].lineData[50] = 0;
  _$jscoverage['/xtemplate.js'].lineData[54] = 0;
  _$jscoverage['/xtemplate.js'].lineData[55] = 0;
  _$jscoverage['/xtemplate.js'].lineData[58] = 0;
  _$jscoverage['/xtemplate.js'].lineData[60] = 0;
  _$jscoverage['/xtemplate.js'].lineData[61] = 0;
  _$jscoverage['/xtemplate.js'].lineData[64] = 0;
  _$jscoverage['/xtemplate.js'].lineData[68] = 0;
  _$jscoverage['/xtemplate.js'].lineData[69] = 0;
  _$jscoverage['/xtemplate.js'].lineData[70] = 0;
  _$jscoverage['/xtemplate.js'].lineData[71] = 0;
  _$jscoverage['/xtemplate.js'].lineData[72] = 0;
  _$jscoverage['/xtemplate.js'].lineData[73] = 0;
  _$jscoverage['/xtemplate.js'].lineData[76] = 0;
  _$jscoverage['/xtemplate.js'].lineData[103] = 0;
}
if (! _$jscoverage['/xtemplate.js'].functionData) {
  _$jscoverage['/xtemplate.js'].functionData = [];
  _$jscoverage['/xtemplate.js'].functionData[0] = 0;
  _$jscoverage['/xtemplate.js'].functionData[1] = 0;
  _$jscoverage['/xtemplate.js'].functionData[2] = 0;
  _$jscoverage['/xtemplate.js'].functionData[3] = 0;
  _$jscoverage['/xtemplate.js'].functionData[4] = 0;
}
if (! _$jscoverage['/xtemplate.js'].branchData) {
  _$jscoverage['/xtemplate.js'].branchData = {};
  _$jscoverage['/xtemplate.js'].branchData['34'] = [];
  _$jscoverage['/xtemplate.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['54'] = [];
  _$jscoverage['/xtemplate.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['60'] = [];
  _$jscoverage['/xtemplate.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['69'] = [];
  _$jscoverage['/xtemplate.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/xtemplate.js'].branchData['72'] = [];
  _$jscoverage['/xtemplate.js'].branchData['72'][1] = new BranchData();
}
_$jscoverage['/xtemplate.js'].branchData['72'][1].init(95, 23, 'typeof tpl === \'string\'');
function visit6_72_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['69'][1].init(48, 14, '!self.compiled');
function visit5_69_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['60'][1].init(259, 10, 'self.cache');
function visit4_60_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['54'][1].init(104, 31, 'self.cache && (fn = cache[tpl])');
function visit3_54_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['34'][2].init(50, 22, 'config.cache === false');
function visit2_34_2(result) {
  _$jscoverage['/xtemplate.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].branchData['34'][1].init(40, 32, 'config && config.cache === false');
function visit1_34_1(result) {
  _$jscoverage['/xtemplate.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xtemplate.js'].functionData[0]++;
  _$jscoverage['/xtemplate.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/xtemplate.js'].lineData[8]++;
  var compiler = require('xtemplate/compiler');
  _$jscoverage['/xtemplate.js'].lineData[10]++;
  var cache = XTemplate.cache = {};
  _$jscoverage['/xtemplate.js'].lineData[32]++;
  function XTemplate(tpl, config) {
    _$jscoverage['/xtemplate.js'].functionData[1]++;
    _$jscoverage['/xtemplate.js'].lineData[33]++;
    var self = this;
    _$jscoverage['/xtemplate.js'].lineData[34]++;
    if (visit1_34_1(config && visit2_34_2(config.cache === false))) {
      _$jscoverage['/xtemplate.js'].lineData[35]++;
      self.cache = false;
    }
    _$jscoverage['/xtemplate.js'].lineData[37]++;
    XTemplate.superclass.constructor.call(self, tpl, config);
  }
  _$jscoverage['/xtemplate.js'].lineData[40]++;
  S.extend(XTemplate, XTemplateRuntime, {
  cache: true, 
  derive: function() {
  _$jscoverage['/xtemplate.js'].functionData[2]++;
  _$jscoverage['/xtemplate.js'].lineData[44]++;
  var engine = XTemplate.superclass.derive.apply(this, arguments);
  _$jscoverage['/xtemplate.js'].lineData[45]++;
  engine.cache = this.cache;
  _$jscoverage['/xtemplate.js'].lineData[46]++;
  return engine;
}, 
  compile: function() {
  _$jscoverage['/xtemplate.js'].functionData[3]++;
  _$jscoverage['/xtemplate.js'].lineData[50]++;
  var fn, self = this, tpl = self.tpl;
  _$jscoverage['/xtemplate.js'].lineData[54]++;
  if (visit3_54_1(self.cache && (fn = cache[tpl]))) {
    _$jscoverage['/xtemplate.js'].lineData[55]++;
    return fn;
  }
  _$jscoverage['/xtemplate.js'].lineData[58]++;
  fn = compiler.compileToFn(tpl, self.name);
  _$jscoverage['/xtemplate.js'].lineData[60]++;
  if (visit4_60_1(self.cache)) {
    _$jscoverage['/xtemplate.js'].lineData[61]++;
    cache[tpl] = fn;
  }
  _$jscoverage['/xtemplate.js'].lineData[64]++;
  return fn;
}, 
  render: function() {
  _$jscoverage['/xtemplate.js'].functionData[4]++;
  _$jscoverage['/xtemplate.js'].lineData[68]++;
  var self = this;
  _$jscoverage['/xtemplate.js'].lineData[69]++;
  if (visit5_69_1(!self.compiled)) {
    _$jscoverage['/xtemplate.js'].lineData[70]++;
    self.compiled = 1;
    _$jscoverage['/xtemplate.js'].lineData[71]++;
    var tpl = self.tpl;
    _$jscoverage['/xtemplate.js'].lineData[72]++;
    if (visit6_72_1(typeof tpl === 'string')) {
      _$jscoverage['/xtemplate.js'].lineData[73]++;
      self.tpl = self.compile();
    }
  }
  _$jscoverage['/xtemplate.js'].lineData[76]++;
  return XTemplate.superclass.render.apply(self, arguments);
}}, {
  compiler: compiler, 
  Scope: XTemplateRuntime.Scope, 
  RunTime: XTemplateRuntime, 
  addCommand: XTemplateRuntime.addCommand, 
  removeCommand: XTemplateRuntime.removeCommand});
  _$jscoverage['/xtemplate.js'].lineData[103]++;
  return XTemplate;
});
