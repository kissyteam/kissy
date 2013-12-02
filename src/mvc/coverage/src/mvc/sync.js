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
if (! _$jscoverage['/mvc/sync.js']) {
  _$jscoverage['/mvc/sync.js'] = {};
  _$jscoverage['/mvc/sync.js'].lineData = [];
  _$jscoverage['/mvc/sync.js'].lineData[6] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[7] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[8] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[10] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[25] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[26] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[34] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[35] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[37] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[38] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[39] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[44] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[45] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[48] = 0;
  _$jscoverage['/mvc/sync.js'].lineData[51] = 0;
}
if (! _$jscoverage['/mvc/sync.js'].functionData) {
  _$jscoverage['/mvc/sync.js'].functionData = [];
  _$jscoverage['/mvc/sync.js'].functionData[0] = 0;
  _$jscoverage['/mvc/sync.js'].functionData[1] = 0;
}
if (! _$jscoverage['/mvc/sync.js'].branchData) {
  _$jscoverage['/mvc/sync.js'].branchData = {};
  _$jscoverage['/mvc/sync.js'].branchData['34'] = [];
  _$jscoverage['/mvc/sync.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/mvc/sync.js'].branchData['37'] = [];
  _$jscoverage['/mvc/sync.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/mvc/sync.js'].branchData['39'] = [];
  _$jscoverage['/mvc/sync.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/mvc/sync.js'].branchData['44'] = [];
  _$jscoverage['/mvc/sync.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/mvc/sync.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/mvc/sync.js'].branchData['44'][3] = new BranchData();
}
_$jscoverage['/mvc/sync.js'].branchData['44'][3].init(492, 19, 'method === \'update\'');
function visit104_44_3(result) {
  _$jscoverage['/mvc/sync.js'].branchData['44'][3].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].branchData['44'][2].init(469, 19, 'method === \'create\'');
function visit103_44_2(result) {
  _$jscoverage['/mvc/sync.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].branchData['44'][1].init(469, 42, 'method === \'create\' || method === \'update\'');
function visit102_44_1(result) {
  _$jscoverage['/mvc/sync.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].branchData['39'][1].init(63, 23, 'typeof url === \'string\'');
function visit101_39_1(result) {
  _$jscoverage['/mvc/sync.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].branchData['37'][1].init(287, 12, '!ioParam.url');
function visit100_37_1(result) {
  _$jscoverage['/mvc/sync.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].branchData['34'][1].init(223, 18, 'ioParam.data || {}');
function visit99_34_1(result) {
  _$jscoverage['/mvc/sync.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/sync.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/mvc/sync.js'].functionData[0]++;
  _$jscoverage['/mvc/sync.js'].lineData[7]++;
  var io = require('io');
  _$jscoverage['/mvc/sync.js'].lineData[8]++;
  var Json = require('json');
  _$jscoverage['/mvc/sync.js'].lineData[10]++;
  var methodMap = {
  'create': 'POST', 
  'update': 'POST', 
  'delete': 'POST', 
  'read': 'GET'};
  _$jscoverage['/mvc/sync.js'].lineData[25]++;
  function sync(self, method, options) {
    _$jscoverage['/mvc/sync.js'].functionData[1]++;
    _$jscoverage['/mvc/sync.js'].lineData[26]++;
    var type = methodMap[method], ioParam = S.merge({
  type: type, 
  dataType: 'json'}, options), data, url;
    _$jscoverage['/mvc/sync.js'].lineData[34]++;
    data = ioParam.data = visit99_34_1(ioParam.data || {});
    _$jscoverage['/mvc/sync.js'].lineData[35]++;
    data._method = method;
    _$jscoverage['/mvc/sync.js'].lineData[37]++;
    if (visit100_37_1(!ioParam.url)) {
      _$jscoverage['/mvc/sync.js'].lineData[38]++;
      url = self.get('url');
      _$jscoverage['/mvc/sync.js'].lineData[39]++;
      ioParam.url = (visit101_39_1(typeof url === 'string')) ? url : url.call(self);
    }
    _$jscoverage['/mvc/sync.js'].lineData[44]++;
    if (visit102_44_1(visit103_44_2(method === 'create') || visit104_44_3(method === 'update'))) {
      _$jscoverage['/mvc/sync.js'].lineData[45]++;
      data.model = Json.stringify(self.toJSON());
    }
    _$jscoverage['/mvc/sync.js'].lineData[48]++;
    return io(ioParam);
  }
  _$jscoverage['/mvc/sync.js'].lineData[51]++;
  return sync;
});
