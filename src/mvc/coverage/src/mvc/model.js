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
if (! _$jscoverage['/mvc/model.js']) {
  _$jscoverage['/mvc/model.js'] = {};
  _$jscoverage['/mvc/model.js'].lineData = [];
  _$jscoverage['/mvc/model.js'].lineData[5] = 0;
  _$jscoverage['/mvc/model.js'].lineData[6] = 0;
  _$jscoverage['/mvc/model.js'].lineData[23] = 0;
  _$jscoverage['/mvc/model.js'].lineData[28] = 0;
  _$jscoverage['/mvc/model.js'].lineData[36] = 0;
  _$jscoverage['/mvc/model.js'].lineData[37] = 0;
  _$jscoverage['/mvc/model.js'].lineData[44] = 0;
  _$jscoverage['/mvc/model.js'].lineData[45] = 0;
  _$jscoverage['/mvc/model.js'].lineData[52] = 0;
  _$jscoverage['/mvc/model.js'].lineData[60] = 0;
  _$jscoverage['/mvc/model.js'].lineData[64] = 0;
  _$jscoverage['/mvc/model.js'].lineData[65] = 0;
  _$jscoverage['/mvc/model.js'].lineData[73] = 0;
  _$jscoverage['/mvc/model.js'].lineData[81] = 0;
  _$jscoverage['/mvc/model.js'].lineData[93] = 0;
  _$jscoverage['/mvc/model.js'].lineData[94] = 0;
  _$jscoverage['/mvc/model.js'].lineData[95] = 0;
  _$jscoverage['/mvc/model.js'].lineData[99] = 0;
  _$jscoverage['/mvc/model.js'].lineData[100] = 0;
  _$jscoverage['/mvc/model.js'].lineData[101] = 0;
  _$jscoverage['/mvc/model.js'].lineData[102] = 0;
  _$jscoverage['/mvc/model.js'].lineData[103] = 0;
  _$jscoverage['/mvc/model.js'].lineData[104] = 0;
  _$jscoverage['/mvc/model.js'].lineData[107] = 0;
  _$jscoverage['/mvc/model.js'].lineData[108] = 0;
  _$jscoverage['/mvc/model.js'].lineData[110] = 0;
  _$jscoverage['/mvc/model.js'].lineData[111] = 0;
  _$jscoverage['/mvc/model.js'].lineData[113] = 0;
  _$jscoverage['/mvc/model.js'].lineData[114] = 0;
  _$jscoverage['/mvc/model.js'].lineData[116] = 0;
  _$jscoverage['/mvc/model.js'].lineData[117] = 0;
  _$jscoverage['/mvc/model.js'].lineData[118] = 0;
  _$jscoverage['/mvc/model.js'].lineData[122] = 0;
  _$jscoverage['/mvc/model.js'].lineData[134] = 0;
  _$jscoverage['/mvc/model.js'].lineData[135] = 0;
  _$jscoverage['/mvc/model.js'].lineData[136] = 0;
  _$jscoverage['/mvc/model.js'].lineData[140] = 0;
  _$jscoverage['/mvc/model.js'].lineData[141] = 0;
  _$jscoverage['/mvc/model.js'].lineData[142] = 0;
  _$jscoverage['/mvc/model.js'].lineData[143] = 0;
  _$jscoverage['/mvc/model.js'].lineData[144] = 0;
  _$jscoverage['/mvc/model.js'].lineData[147] = 0;
  _$jscoverage['/mvc/model.js'].lineData[148] = 0;
  _$jscoverage['/mvc/model.js'].lineData[150] = 0;
  _$jscoverage['/mvc/model.js'].lineData[151] = 0;
  _$jscoverage['/mvc/model.js'].lineData[163] = 0;
  _$jscoverage['/mvc/model.js'].lineData[164] = 0;
  _$jscoverage['/mvc/model.js'].lineData[165] = 0;
  _$jscoverage['/mvc/model.js'].lineData[169] = 0;
  _$jscoverage['/mvc/model.js'].lineData[170] = 0;
  _$jscoverage['/mvc/model.js'].lineData[171] = 0;
  _$jscoverage['/mvc/model.js'].lineData[172] = 0;
  _$jscoverage['/mvc/model.js'].lineData[173] = 0;
  _$jscoverage['/mvc/model.js'].lineData[176] = 0;
  _$jscoverage['/mvc/model.js'].lineData[177] = 0;
  _$jscoverage['/mvc/model.js'].lineData[179] = 0;
  _$jscoverage['/mvc/model.js'].lineData[180] = 0;
  _$jscoverage['/mvc/model.js'].lineData[188] = 0;
  _$jscoverage['/mvc/model.js'].lineData[189] = 0;
  _$jscoverage['/mvc/model.js'].lineData[190] = 0;
  _$jscoverage['/mvc/model.js'].lineData[192] = 0;
  _$jscoverage['/mvc/model.js'].lineData[213] = 0;
  _$jscoverage['/mvc/model.js'].lineData[239] = 0;
  _$jscoverage['/mvc/model.js'].lineData[249] = 0;
  _$jscoverage['/mvc/model.js'].lineData[255] = 0;
  _$jscoverage['/mvc/model.js'].lineData[256] = 0;
  _$jscoverage['/mvc/model.js'].lineData[257] = 0;
  _$jscoverage['/mvc/model.js'].lineData[258] = 0;
  _$jscoverage['/mvc/model.js'].lineData[259] = 0;
  _$jscoverage['/mvc/model.js'].lineData[261] = 0;
  _$jscoverage['/mvc/model.js'].lineData[263] = 0;
  _$jscoverage['/mvc/model.js'].lineData[266] = 0;
  _$jscoverage['/mvc/model.js'].lineData[267] = 0;
  _$jscoverage['/mvc/model.js'].lineData[270] = 0;
  _$jscoverage['/mvc/model.js'].lineData[271] = 0;
  _$jscoverage['/mvc/model.js'].lineData[272] = 0;
  _$jscoverage['/mvc/model.js'].lineData[273] = 0;
  _$jscoverage['/mvc/model.js'].lineData[276] = 0;
  _$jscoverage['/mvc/model.js'].lineData[278] = 0;
  _$jscoverage['/mvc/model.js'].lineData[279] = 0;
  _$jscoverage['/mvc/model.js'].lineData[282] = 0;
  _$jscoverage['/mvc/model.js'].lineData[283] = 0;
}
if (! _$jscoverage['/mvc/model.js'].functionData) {
  _$jscoverage['/mvc/model.js'].functionData = [];
  _$jscoverage['/mvc/model.js'].functionData[0] = 0;
  _$jscoverage['/mvc/model.js'].functionData[1] = 0;
  _$jscoverage['/mvc/model.js'].functionData[2] = 0;
  _$jscoverage['/mvc/model.js'].functionData[3] = 0;
  _$jscoverage['/mvc/model.js'].functionData[4] = 0;
  _$jscoverage['/mvc/model.js'].functionData[5] = 0;
  _$jscoverage['/mvc/model.js'].functionData[6] = 0;
  _$jscoverage['/mvc/model.js'].functionData[7] = 0;
  _$jscoverage['/mvc/model.js'].functionData[8] = 0;
  _$jscoverage['/mvc/model.js'].functionData[9] = 0;
  _$jscoverage['/mvc/model.js'].functionData[10] = 0;
  _$jscoverage['/mvc/model.js'].functionData[11] = 0;
  _$jscoverage['/mvc/model.js'].functionData[12] = 0;
  _$jscoverage['/mvc/model.js'].functionData[13] = 0;
  _$jscoverage['/mvc/model.js'].functionData[14] = 0;
  _$jscoverage['/mvc/model.js'].functionData[15] = 0;
  _$jscoverage['/mvc/model.js'].functionData[16] = 0;
  _$jscoverage['/mvc/model.js'].functionData[17] = 0;
  _$jscoverage['/mvc/model.js'].functionData[18] = 0;
  _$jscoverage['/mvc/model.js'].functionData[19] = 0;
  _$jscoverage['/mvc/model.js'].functionData[20] = 0;
  _$jscoverage['/mvc/model.js'].functionData[21] = 0;
}
if (! _$jscoverage['/mvc/model.js'].branchData) {
  _$jscoverage['/mvc/model.js'].branchData = {};
  _$jscoverage['/mvc/model.js'].branchData['81'] = [];
  _$jscoverage['/mvc/model.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['94'] = [];
  _$jscoverage['/mvc/model.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['101'] = [];
  _$jscoverage['/mvc/model.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['103'] = [];
  _$jscoverage['/mvc/model.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['111'] = [];
  _$jscoverage['/mvc/model.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['113'] = [];
  _$jscoverage['/mvc/model.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['117'] = [];
  _$jscoverage['/mvc/model.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['135'] = [];
  _$jscoverage['/mvc/model.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['141'] = [];
  _$jscoverage['/mvc/model.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['143'] = [];
  _$jscoverage['/mvc/model.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['148'] = [];
  _$jscoverage['/mvc/model.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['164'] = [];
  _$jscoverage['/mvc/model.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['170'] = [];
  _$jscoverage['/mvc/model.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['172'] = [];
  _$jscoverage['/mvc/model.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['177'] = [];
  _$jscoverage['/mvc/model.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['257'] = [];
  _$jscoverage['/mvc/model.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['258'] = [];
  _$jscoverage['/mvc/model.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['271'] = [];
  _$jscoverage['/mvc/model.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['276'] = [];
  _$jscoverage['/mvc/model.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['278'] = [];
  _$jscoverage['/mvc/model.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['282'] = [];
  _$jscoverage['/mvc/model.js'].branchData['282'][1] = new BranchData();
}
_$jscoverage['/mvc/model.js'].branchData['282'][1].init(400, 35, 'base.charAt(base.length - 1) == \'/\'');
function visit48_282_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['278'][1].init(321, 12, 'this.isNew()');
function visit47_278_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['276'][1].init(271, 33, 'getUrl(cv) || this.get("urlRoot")');
function visit46_276_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['271'][1].init(18, 29, 'collections.hasOwnProperty(c)');
function visit45_271_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['258'][1].init(18, 20, 'typeof u == \'string\'');
function visit44_258_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['257'][1].init(30, 23, 'o && (u = o.get("url"))');
function visit43_257_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['177'][1].init(300, 41, 'success && success.apply(this, arguments)');
function visit42_177_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['172'][1].init(99, 1, 'v');
function visit41_172_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['170'][1].init(26, 4, 'resp');
function visit40_170_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['164'][1].init(59, 10, 'opts || {}');
function visit39_164_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['148'][1].init(300, 41, 'success && success.apply(this, arguments)');
function visit38_148_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['143'][1].init(99, 1, 'v');
function visit37_143_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['141'][1].init(26, 4, 'resp');
function visit36_141_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['135'][1].init(59, 10, 'opts || {}');
function visit35_135_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['117'][1].init(63, 13, 'opts.complete');
function visit34_117_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['113'][1].init(790, 31, '!self.isNew() && opts[\'delete\']');
function visit33_113_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['111'][1].init(471, 41, 'success && success.apply(this, arguments)');
function visit32_111_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['103'][1].init(99, 1, 'v');
function visit31_103_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['101'][1].init(77, 4, 'resp');
function visit30_101_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['94'][1].init(59, 10, 'opts || {}');
function visit29_94_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['81'][1].init(28, 33, 'this.isNew() || this.__isModified');
function visit28_81_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].lineData[5]++;
KISSY.add("mvc/model", function(S, Base) {
  _$jscoverage['/mvc/model.js'].functionData[0]++;
  _$jscoverage['/mvc/model.js'].lineData[6]++;
  var blacklist = ["idAttribute", "destroyed", "plugins", "listeners", "clientId", "urlRoot", "url", "parse", "sync"];
  _$jscoverage['/mvc/model.js'].lineData[23]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/mvc/model.js'].functionData[1]++;
  _$jscoverage['/mvc/model.js'].lineData[28]++;
  this.collections = {};
}, 
  addToCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[2]++;
  _$jscoverage['/mvc/model.js'].lineData[36]++;
  this.collections[S.stamp(c)] = c;
  _$jscoverage['/mvc/model.js'].lineData[37]++;
  this.addTarget(c);
}, 
  removeFromCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[3]++;
  _$jscoverage['/mvc/model.js'].lineData[44]++;
  delete this.collections[S.stamp(c)];
  _$jscoverage['/mvc/model.js'].lineData[45]++;
  this.removeTarget(c);
}, 
  getId: function() {
  _$jscoverage['/mvc/model.js'].functionData[4]++;
  _$jscoverage['/mvc/model.js'].lineData[52]++;
  return this.get(this.get("idAttribute"));
}, 
  'setId': function(id) {
  _$jscoverage['/mvc/model.js'].functionData[5]++;
  _$jscoverage['/mvc/model.js'].lineData[60]++;
  return this.set(this.get("idAttribute"), id);
}, 
  setInternal: function() {
  _$jscoverage['/mvc/model.js'].functionData[6]++;
  _$jscoverage['/mvc/model.js'].lineData[64]++;
  this.__isModified = 1;
  _$jscoverage['/mvc/model.js'].lineData[65]++;
  return this.callSuper.apply(this, arguments);
}, 
  isNew: function() {
  _$jscoverage['/mvc/model.js'].functionData[7]++;
  _$jscoverage['/mvc/model.js'].lineData[73]++;
  return !this.getId();
}, 
  isModified: function() {
  _$jscoverage['/mvc/model.js'].functionData[8]++;
  _$jscoverage['/mvc/model.js'].lineData[81]++;
  return !!(visit28_81_1(this.isNew() || this.__isModified));
}, 
  destroy: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[9]++;
  _$jscoverage['/mvc/model.js'].lineData[93]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[94]++;
  opts = visit29_94_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[95]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[99]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[10]++;
  _$jscoverage['/mvc/model.js'].lineData[100]++;
  var lists = self.collections;
  _$jscoverage['/mvc/model.js'].lineData[101]++;
  if (visit30_101_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[102]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[103]++;
    if (visit31_103_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[104]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[107]++;
  for (var l in lists) {
    _$jscoverage['/mvc/model.js'].lineData[108]++;
    lists[l].remove(self, opts);
  }
  _$jscoverage['/mvc/model.js'].lineData[110]++;
  self.fire("destroy");
  _$jscoverage['/mvc/model.js'].lineData[111]++;
  visit32_111_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[113]++;
  if (visit33_113_1(!self.isNew() && opts['delete'])) {
    _$jscoverage['/mvc/model.js'].lineData[114]++;
    self.get("sync").call(self, self, 'delete', opts);
  } else {
    _$jscoverage['/mvc/model.js'].lineData[116]++;
    opts.success();
    _$jscoverage['/mvc/model.js'].lineData[117]++;
    if (visit34_117_1(opts.complete)) {
      _$jscoverage['/mvc/model.js'].lineData[118]++;
      opts.complete();
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[122]++;
  return self;
}, 
  load: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[11]++;
  _$jscoverage['/mvc/model.js'].lineData[134]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[135]++;
  opts = visit35_135_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[136]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[140]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[12]++;
  _$jscoverage['/mvc/model.js'].lineData[141]++;
  if (visit36_141_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[142]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[143]++;
    if (visit37_143_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[144]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[147]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[148]++;
  visit38_148_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[150]++;
  self.get("sync").call(self, self, 'read', opts);
  _$jscoverage['/mvc/model.js'].lineData[151]++;
  return self;
}, 
  save: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[13]++;
  _$jscoverage['/mvc/model.js'].lineData[163]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[164]++;
  opts = visit39_164_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[165]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[169]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[14]++;
  _$jscoverage['/mvc/model.js'].lineData[170]++;
  if (visit40_170_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[171]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[172]++;
    if (visit41_172_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[173]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[176]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[177]++;
  visit42_177_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[179]++;
  self.get("sync").call(self, self, self.isNew() ? 'create' : 'update', opts);
  _$jscoverage['/mvc/model.js'].lineData[180]++;
  return self;
}, 
  toJSON: function() {
  _$jscoverage['/mvc/model.js'].functionData[15]++;
  _$jscoverage['/mvc/model.js'].lineData[188]++;
  var ret = this.getAttrVals();
  _$jscoverage['/mvc/model.js'].lineData[189]++;
  S.each(blacklist, function(b) {
  _$jscoverage['/mvc/model.js'].functionData[16]++;
  _$jscoverage['/mvc/model.js'].lineData[190]++;
  delete ret[b];
});
  _$jscoverage['/mvc/model.js'].lineData[192]++;
  return ret;
}}, {
  ATTRS: {
  idAttribute: {
  value: 'id'}, 
  clientId: {
  valueFn: function() {
  _$jscoverage['/mvc/model.js'].functionData[17]++;
  _$jscoverage['/mvc/model.js'].lineData[213]++;
  return S.guid("mvc-client");
}}, 
  url: {
  value: url}, 
  urlRoot: {
  value: ""}, 
  sync: {
  value: function() {
  _$jscoverage['/mvc/model.js'].functionData[18]++;
  _$jscoverage['/mvc/model.js'].lineData[239]++;
  S.require("mvc").sync.apply(this, arguments);
}}, 
  parse: {
  value: function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[19]++;
  _$jscoverage['/mvc/model.js'].lineData[249]++;
  return resp;
}}}});
  _$jscoverage['/mvc/model.js'].lineData[255]++;
  function getUrl(o) {
    _$jscoverage['/mvc/model.js'].functionData[20]++;
    _$jscoverage['/mvc/model.js'].lineData[256]++;
    var u;
    _$jscoverage['/mvc/model.js'].lineData[257]++;
    if (visit43_257_1(o && (u = o.get("url")))) {
      _$jscoverage['/mvc/model.js'].lineData[258]++;
      if (visit44_258_1(typeof u == 'string')) {
        _$jscoverage['/mvc/model.js'].lineData[259]++;
        return u;
      }
      _$jscoverage['/mvc/model.js'].lineData[261]++;
      return u.call(o);
    }
    _$jscoverage['/mvc/model.js'].lineData[263]++;
    return u;
  }
  _$jscoverage['/mvc/model.js'].lineData[266]++;
  function url() {
    _$jscoverage['/mvc/model.js'].functionData[21]++;
    _$jscoverage['/mvc/model.js'].lineData[267]++;
    var c, cv, collections = this.collections;
    _$jscoverage['/mvc/model.js'].lineData[270]++;
    for (c in collections) {
      _$jscoverage['/mvc/model.js'].lineData[271]++;
      if (visit45_271_1(collections.hasOwnProperty(c))) {
        _$jscoverage['/mvc/model.js'].lineData[272]++;
        cv = collections[c];
        _$jscoverage['/mvc/model.js'].lineData[273]++;
        break;
      }
    }
    _$jscoverage['/mvc/model.js'].lineData[276]++;
    var base = visit46_276_1(getUrl(cv) || this.get("urlRoot"));
    _$jscoverage['/mvc/model.js'].lineData[278]++;
    if (visit47_278_1(this.isNew())) {
      _$jscoverage['/mvc/model.js'].lineData[279]++;
      return base;
    }
    _$jscoverage['/mvc/model.js'].lineData[282]++;
    base = base + (visit48_282_1(base.charAt(base.length - 1) == '/') ? '' : '/');
    _$jscoverage['/mvc/model.js'].lineData[283]++;
    return base + encodeURIComponent(this.getId()) + "/";
  }
}, {
  requires: ['base']});
