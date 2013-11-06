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
if (! _$jscoverage['/io.js']) {
  _$jscoverage['/io.js'] = {};
  _$jscoverage['/io.js'].lineData = [];
  _$jscoverage['/io.js'].lineData[6] = 0;
  _$jscoverage['/io.js'].lineData[7] = 0;
  _$jscoverage['/io.js'].lineData[9] = 0;
  _$jscoverage['/io.js'].lineData[11] = 0;
  _$jscoverage['/io.js'].lineData[12] = 0;
  _$jscoverage['/io.js'].lineData[13] = 0;
  _$jscoverage['/io.js'].lineData[14] = 0;
  _$jscoverage['/io.js'].lineData[17] = 0;
  _$jscoverage['/io.js'].lineData[27] = 0;
  _$jscoverage['/io.js'].lineData[64] = 0;
  _$jscoverage['/io.js'].lineData[65] = 0;
  _$jscoverage['/io.js'].lineData[68] = 0;
  _$jscoverage['/io.js'].lineData[69] = 0;
  _$jscoverage['/io.js'].lineData[71] = 0;
  _$jscoverage['/io.js'].lineData[87] = 0;
  _$jscoverage['/io.js'].lineData[88] = 0;
  _$jscoverage['/io.js'].lineData[89] = 0;
  _$jscoverage['/io.js'].lineData[91] = 0;
  _$jscoverage['/io.js'].lineData[115] = 0;
  _$jscoverage['/io.js'].lineData[116] = 0;
  _$jscoverage['/io.js'].lineData[117] = 0;
  _$jscoverage['/io.js'].lineData[119] = 0;
  _$jscoverage['/io.js'].lineData[137] = 0;
  _$jscoverage['/io.js'].lineData[138] = 0;
  _$jscoverage['/io.js'].lineData[142] = 0;
  _$jscoverage['/io.js'].lineData[143] = 0;
  _$jscoverage['/io.js'].lineData[145] = 0;
  _$jscoverage['/io.js'].lineData[156] = 0;
  _$jscoverage['/io.js'].lineData[165] = 0;
}
if (! _$jscoverage['/io.js'].functionData) {
  _$jscoverage['/io.js'].functionData = [];
  _$jscoverage['/io.js'].functionData[0] = 0;
  _$jscoverage['/io.js'].functionData[1] = 0;
  _$jscoverage['/io.js'].functionData[2] = 0;
  _$jscoverage['/io.js'].functionData[3] = 0;
  _$jscoverage['/io.js'].functionData[4] = 0;
  _$jscoverage['/io.js'].functionData[5] = 0;
}
if (! _$jscoverage['/io.js'].branchData) {
  _$jscoverage['/io.js'].branchData = {};
  _$jscoverage['/io.js'].branchData['11'] = [];
  _$jscoverage['/io.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/io.js'].branchData['18'] = [];
  _$jscoverage['/io.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/io.js'].branchData['64'] = [];
  _$jscoverage['/io.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/io.js'].branchData['87'] = [];
  _$jscoverage['/io.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/io.js'].branchData['115'] = [];
  _$jscoverage['/io.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/io.js'].branchData['137'] = [];
  _$jscoverage['/io.js'].branchData['137'][1] = new BranchData();
}
_$jscoverage['/io.js'].branchData['137'][1].init(22, 26, 'typeof data === \'function\'');
function visit204_137_1(result) {
  _$jscoverage['/io.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].branchData['115'][1].init(22, 26, 'typeof data === \'function\'');
function visit203_115_1(result) {
  _$jscoverage['/io.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].branchData['87'][1].init(22, 26, 'typeof data === \'function\'');
function visit202_87_1(result) {
  _$jscoverage['/io.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].branchData['64'][1].init(22, 26, 'typeof data === \'function\'');
function visit201_64_1(result) {
  _$jscoverage['/io.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].branchData['18'][1].init(20, 13, 'type || \'get\'');
function visit200_18_1(result) {
  _$jscoverage['/io.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].branchData['11'][1].init(37, 26, 'typeof data === \'function\'');
function visit199_11_1(result) {
  _$jscoverage['/io.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/io.js'].lineData[6]++;
KISSY.add('io', function(S, serializer, IO) {
  _$jscoverage['/io.js'].functionData[0]++;
  _$jscoverage['/io.js'].lineData[7]++;
  var undef = undefined;
  _$jscoverage['/io.js'].lineData[9]++;
  function get(url, data, callback, dataType, type) {
    _$jscoverage['/io.js'].functionData[1]++;
    _$jscoverage['/io.js'].lineData[11]++;
    if (visit199_11_1(typeof data === 'function')) {
      _$jscoverage['/io.js'].lineData[12]++;
      dataType = callback;
      _$jscoverage['/io.js'].lineData[13]++;
      callback = data;
      _$jscoverage['/io.js'].lineData[14]++;
      data = undef;
    }
    _$jscoverage['/io.js'].lineData[17]++;
    return IO({
  type: visit200_18_1(type || 'get'), 
  url: url, 
  data: data, 
  success: callback, 
  dataType: dataType});
  }
  _$jscoverage['/io.js'].lineData[27]++;
  S.mix(IO, {
  serialize: serializer.serialize, 
  get: get, 
  post: function(url, data, callback, dataType) {
  _$jscoverage['/io.js'].functionData[2]++;
  _$jscoverage['/io.js'].lineData[64]++;
  if (visit201_64_1(typeof data === 'function')) {
    _$jscoverage['/io.js'].lineData[65]++;
    dataType = callback;
    _$jscoverage['/io.js'].lineData[68]++;
    callback = data;
    _$jscoverage['/io.js'].lineData[69]++;
    data = undef;
  }
  _$jscoverage['/io.js'].lineData[71]++;
  return get(url, data, callback, dataType, 'post');
}, 
  jsonp: function(url, data, callback) {
  _$jscoverage['/io.js'].functionData[3]++;
  _$jscoverage['/io.js'].lineData[87]++;
  if (visit202_87_1(typeof data === 'function')) {
    _$jscoverage['/io.js'].lineData[88]++;
    callback = data;
    _$jscoverage['/io.js'].lineData[89]++;
    data = undef;
  }
  _$jscoverage['/io.js'].lineData[91]++;
  return get(url, data, callback, 'jsonp');
}, 
  getScript: S.getScript, 
  getJSON: function(url, data, callback) {
  _$jscoverage['/io.js'].functionData[4]++;
  _$jscoverage['/io.js'].lineData[115]++;
  if (visit203_115_1(typeof data === 'function')) {
    _$jscoverage['/io.js'].lineData[116]++;
    callback = data;
    _$jscoverage['/io.js'].lineData[117]++;
    data = undef;
  }
  _$jscoverage['/io.js'].lineData[119]++;
  return get(url, data, callback, 'json');
}, 
  upload: function(url, form, data, callback, dataType) {
  _$jscoverage['/io.js'].functionData[5]++;
  _$jscoverage['/io.js'].lineData[137]++;
  if (visit204_137_1(typeof data === 'function')) {
    _$jscoverage['/io.js'].lineData[138]++;
    dataType = callback;
    _$jscoverage['/io.js'].lineData[142]++;
    callback = data;
    _$jscoverage['/io.js'].lineData[143]++;
    data = undef;
  }
  _$jscoverage['/io.js'].lineData[145]++;
  return IO({
  url: url, 
  type: 'post', 
  dataType: dataType, 
  form: form, 
  data: data, 
  success: callback});
}});
  _$jscoverage['/io.js'].lineData[156]++;
  S.mix(S, {
  'Ajax': IO, 
  'IO': IO, 
  ajax: IO, 
  io: IO, 
  jsonp: IO.jsonp});
  _$jscoverage['/io.js'].lineData[165]++;
  return IO;
}, {
  requires: ['io/form-serializer', 'io/base', 'io/xhr-transport', 'io/script-transport', 'io/jsonp', 'io/form', 'io/iframe-transport', 'io/methods']});
