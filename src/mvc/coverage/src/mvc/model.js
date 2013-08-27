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
  _$jscoverage['/mvc/model.js'].lineData[7] = 0;
  _$jscoverage['/mvc/model.js'].lineData[26] = 0;
  _$jscoverage['/mvc/model.js'].lineData[31] = 0;
  _$jscoverage['/mvc/model.js'].lineData[39] = 0;
  _$jscoverage['/mvc/model.js'].lineData[40] = 0;
  _$jscoverage['/mvc/model.js'].lineData[47] = 0;
  _$jscoverage['/mvc/model.js'].lineData[48] = 0;
  _$jscoverage['/mvc/model.js'].lineData[55] = 0;
  _$jscoverage['/mvc/model.js'].lineData[63] = 0;
  _$jscoverage['/mvc/model.js'].lineData[67] = 0;
  _$jscoverage['/mvc/model.js'].lineData[68] = 0;
  _$jscoverage['/mvc/model.js'].lineData[76] = 0;
  _$jscoverage['/mvc/model.js'].lineData[84] = 0;
  _$jscoverage['/mvc/model.js'].lineData[96] = 0;
  _$jscoverage['/mvc/model.js'].lineData[97] = 0;
  _$jscoverage['/mvc/model.js'].lineData[98] = 0;
  _$jscoverage['/mvc/model.js'].lineData[102] = 0;
  _$jscoverage['/mvc/model.js'].lineData[103] = 0;
  _$jscoverage['/mvc/model.js'].lineData[104] = 0;
  _$jscoverage['/mvc/model.js'].lineData[105] = 0;
  _$jscoverage['/mvc/model.js'].lineData[106] = 0;
  _$jscoverage['/mvc/model.js'].lineData[107] = 0;
  _$jscoverage['/mvc/model.js'].lineData[110] = 0;
  _$jscoverage['/mvc/model.js'].lineData[111] = 0;
  _$jscoverage['/mvc/model.js'].lineData[113] = 0;
  _$jscoverage['/mvc/model.js'].lineData[114] = 0;
  _$jscoverage['/mvc/model.js'].lineData[116] = 0;
  _$jscoverage['/mvc/model.js'].lineData[117] = 0;
  _$jscoverage['/mvc/model.js'].lineData[119] = 0;
  _$jscoverage['/mvc/model.js'].lineData[120] = 0;
  _$jscoverage['/mvc/model.js'].lineData[121] = 0;
  _$jscoverage['/mvc/model.js'].lineData[125] = 0;
  _$jscoverage['/mvc/model.js'].lineData[137] = 0;
  _$jscoverage['/mvc/model.js'].lineData[138] = 0;
  _$jscoverage['/mvc/model.js'].lineData[139] = 0;
  _$jscoverage['/mvc/model.js'].lineData[143] = 0;
  _$jscoverage['/mvc/model.js'].lineData[144] = 0;
  _$jscoverage['/mvc/model.js'].lineData[145] = 0;
  _$jscoverage['/mvc/model.js'].lineData[146] = 0;
  _$jscoverage['/mvc/model.js'].lineData[147] = 0;
  _$jscoverage['/mvc/model.js'].lineData[150] = 0;
  _$jscoverage['/mvc/model.js'].lineData[151] = 0;
  _$jscoverage['/mvc/model.js'].lineData[153] = 0;
  _$jscoverage['/mvc/model.js'].lineData[154] = 0;
  _$jscoverage['/mvc/model.js'].lineData[166] = 0;
  _$jscoverage['/mvc/model.js'].lineData[167] = 0;
  _$jscoverage['/mvc/model.js'].lineData[168] = 0;
  _$jscoverage['/mvc/model.js'].lineData[172] = 0;
  _$jscoverage['/mvc/model.js'].lineData[173] = 0;
  _$jscoverage['/mvc/model.js'].lineData[174] = 0;
  _$jscoverage['/mvc/model.js'].lineData[175] = 0;
  _$jscoverage['/mvc/model.js'].lineData[176] = 0;
  _$jscoverage['/mvc/model.js'].lineData[179] = 0;
  _$jscoverage['/mvc/model.js'].lineData[180] = 0;
  _$jscoverage['/mvc/model.js'].lineData[182] = 0;
  _$jscoverage['/mvc/model.js'].lineData[183] = 0;
  _$jscoverage['/mvc/model.js'].lineData[191] = 0;
  _$jscoverage['/mvc/model.js'].lineData[192] = 0;
  _$jscoverage['/mvc/model.js'].lineData[193] = 0;
  _$jscoverage['/mvc/model.js'].lineData[195] = 0;
  _$jscoverage['/mvc/model.js'].lineData[216] = 0;
  _$jscoverage['/mvc/model.js'].lineData[242] = 0;
  _$jscoverage['/mvc/model.js'].lineData[252] = 0;
  _$jscoverage['/mvc/model.js'].lineData[258] = 0;
  _$jscoverage['/mvc/model.js'].lineData[259] = 0;
  _$jscoverage['/mvc/model.js'].lineData[260] = 0;
  _$jscoverage['/mvc/model.js'].lineData[261] = 0;
  _$jscoverage['/mvc/model.js'].lineData[262] = 0;
  _$jscoverage['/mvc/model.js'].lineData[264] = 0;
  _$jscoverage['/mvc/model.js'].lineData[266] = 0;
  _$jscoverage['/mvc/model.js'].lineData[269] = 0;
  _$jscoverage['/mvc/model.js'].lineData[270] = 0;
  _$jscoverage['/mvc/model.js'].lineData[273] = 0;
  _$jscoverage['/mvc/model.js'].lineData[274] = 0;
  _$jscoverage['/mvc/model.js'].lineData[275] = 0;
  _$jscoverage['/mvc/model.js'].lineData[276] = 0;
  _$jscoverage['/mvc/model.js'].lineData[279] = 0;
  _$jscoverage['/mvc/model.js'].lineData[281] = 0;
  _$jscoverage['/mvc/model.js'].lineData[282] = 0;
  _$jscoverage['/mvc/model.js'].lineData[285] = 0;
  _$jscoverage['/mvc/model.js'].lineData[286] = 0;
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
  _$jscoverage['/mvc/model.js'].branchData['84'] = [];
  _$jscoverage['/mvc/model.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['97'] = [];
  _$jscoverage['/mvc/model.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['104'] = [];
  _$jscoverage['/mvc/model.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['106'] = [];
  _$jscoverage['/mvc/model.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['114'] = [];
  _$jscoverage['/mvc/model.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['116'] = [];
  _$jscoverage['/mvc/model.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['120'] = [];
  _$jscoverage['/mvc/model.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['138'] = [];
  _$jscoverage['/mvc/model.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['144'] = [];
  _$jscoverage['/mvc/model.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['146'] = [];
  _$jscoverage['/mvc/model.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['151'] = [];
  _$jscoverage['/mvc/model.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['167'] = [];
  _$jscoverage['/mvc/model.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['173'] = [];
  _$jscoverage['/mvc/model.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['175'] = [];
  _$jscoverage['/mvc/model.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['180'] = [];
  _$jscoverage['/mvc/model.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['260'] = [];
  _$jscoverage['/mvc/model.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['261'] = [];
  _$jscoverage['/mvc/model.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['274'] = [];
  _$jscoverage['/mvc/model.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['279'] = [];
  _$jscoverage['/mvc/model.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['281'] = [];
  _$jscoverage['/mvc/model.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/mvc/model.js'].branchData['285'] = [];
  _$jscoverage['/mvc/model.js'].branchData['285'][1] = new BranchData();
}
_$jscoverage['/mvc/model.js'].branchData['285'][1].init(400, 35, 'base.charAt(base.length - 1) == \'/\'');
function visit48_285_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['281'][1].init(321, 12, 'this.isNew()');
function visit47_281_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['279'][1].init(271, 33, 'getUrl(cv) || this.get("urlRoot")');
function visit46_279_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['274'][1].init(18, 29, 'collections.hasOwnProperty(c)');
function visit45_274_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['261'][1].init(18, 20, 'typeof u == \'string\'');
function visit44_261_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['260'][1].init(30, 23, 'o && (u = o.get("url"))');
function visit43_260_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['180'][1].init(300, 41, 'success && success.apply(this, arguments)');
function visit42_180_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['175'][1].init(99, 1, 'v');
function visit41_175_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['173'][1].init(26, 4, 'resp');
function visit40_173_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['167'][1].init(59, 10, 'opts || {}');
function visit39_167_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['151'][1].init(300, 41, 'success && success.apply(this, arguments)');
function visit38_151_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['146'][1].init(99, 1, 'v');
function visit37_146_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['144'][1].init(26, 4, 'resp');
function visit36_144_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['138'][1].init(59, 10, 'opts || {}');
function visit35_138_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['120'][1].init(63, 13, 'opts.complete');
function visit34_120_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['116'][1].init(790, 31, '!self.isNew() && opts[\'delete\']');
function visit33_116_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['114'][1].init(471, 41, 'success && success.apply(this, arguments)');
function visit32_114_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['106'][1].init(99, 1, 'v');
function visit31_106_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['104'][1].init(77, 4, 'resp');
function visit30_104_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['97'][1].init(59, 10, 'opts || {}');
function visit29_97_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].branchData['84'][1].init(28, 33, 'this.isNew() || this.__isModified');
function visit28_84_1(result) {
  _$jscoverage['/mvc/model.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/mvc/model.js'].lineData[5]++;
KISSY.add("mvc/model", function(S, Base) {
  _$jscoverage['/mvc/model.js'].functionData[0]++;
  _$jscoverage['/mvc/model.js'].lineData[7]++;
  var blacklist = ["idAttribute", "destroyed", "plugins", "listeners", "clientId", "urlRoot", "url", "parse", "sync"];
  _$jscoverage['/mvc/model.js'].lineData[26]++;
  return Base.extend({
  initializer: function() {
  _$jscoverage['/mvc/model.js'].functionData[1]++;
  _$jscoverage['/mvc/model.js'].lineData[31]++;
  this.collections = {};
}, 
  addToCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[2]++;
  _$jscoverage['/mvc/model.js'].lineData[39]++;
  this.collections[S.stamp(c)] = c;
  _$jscoverage['/mvc/model.js'].lineData[40]++;
  this.addTarget(c);
}, 
  removeFromCollection: function(c) {
  _$jscoverage['/mvc/model.js'].functionData[3]++;
  _$jscoverage['/mvc/model.js'].lineData[47]++;
  delete this.collections[S.stamp(c)];
  _$jscoverage['/mvc/model.js'].lineData[48]++;
  this.removeTarget(c);
}, 
  getId: function() {
  _$jscoverage['/mvc/model.js'].functionData[4]++;
  _$jscoverage['/mvc/model.js'].lineData[55]++;
  return this.get(this.get("idAttribute"));
}, 
  'setId': function(id) {
  _$jscoverage['/mvc/model.js'].functionData[5]++;
  _$jscoverage['/mvc/model.js'].lineData[63]++;
  return this.set(this.get("idAttribute"), id);
}, 
  setInternal: function() {
  _$jscoverage['/mvc/model.js'].functionData[6]++;
  _$jscoverage['/mvc/model.js'].lineData[67]++;
  this.__isModified = 1;
  _$jscoverage['/mvc/model.js'].lineData[68]++;
  return this.callSuper.apply(this, arguments);
}, 
  isNew: function() {
  _$jscoverage['/mvc/model.js'].functionData[7]++;
  _$jscoverage['/mvc/model.js'].lineData[76]++;
  return !this.getId();
}, 
  isModified: function() {
  _$jscoverage['/mvc/model.js'].functionData[8]++;
  _$jscoverage['/mvc/model.js'].lineData[84]++;
  return !!(visit28_84_1(this.isNew() || this.__isModified));
}, 
  destroy: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[9]++;
  _$jscoverage['/mvc/model.js'].lineData[96]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[97]++;
  opts = visit29_97_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[98]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[102]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[10]++;
  _$jscoverage['/mvc/model.js'].lineData[103]++;
  var lists = self.collections;
  _$jscoverage['/mvc/model.js'].lineData[104]++;
  if (visit30_104_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[105]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[106]++;
    if (visit31_106_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[107]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[110]++;
  for (var l in lists) {
    _$jscoverage['/mvc/model.js'].lineData[111]++;
    lists[l].remove(self, opts);
  }
  _$jscoverage['/mvc/model.js'].lineData[113]++;
  self.fire("destroy");
  _$jscoverage['/mvc/model.js'].lineData[114]++;
  visit32_114_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[116]++;
  if (visit33_116_1(!self.isNew() && opts['delete'])) {
    _$jscoverage['/mvc/model.js'].lineData[117]++;
    self.get("sync").call(self, self, 'delete', opts);
  } else {
    _$jscoverage['/mvc/model.js'].lineData[119]++;
    opts.success();
    _$jscoverage['/mvc/model.js'].lineData[120]++;
    if (visit34_120_1(opts.complete)) {
      _$jscoverage['/mvc/model.js'].lineData[121]++;
      opts.complete();
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[125]++;
  return self;
}, 
  load: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[11]++;
  _$jscoverage['/mvc/model.js'].lineData[137]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[138]++;
  opts = visit35_138_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[139]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[143]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[12]++;
  _$jscoverage['/mvc/model.js'].lineData[144]++;
  if (visit36_144_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[145]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[146]++;
    if (visit37_146_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[147]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[150]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[151]++;
  visit38_151_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[153]++;
  self.get("sync").call(self, self, 'read', opts);
  _$jscoverage['/mvc/model.js'].lineData[154]++;
  return self;
}, 
  save: function(opts) {
  _$jscoverage['/mvc/model.js'].functionData[13]++;
  _$jscoverage['/mvc/model.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/mvc/model.js'].lineData[167]++;
  opts = visit39_167_1(opts || {});
  _$jscoverage['/mvc/model.js'].lineData[168]++;
  var success = opts.success;
  _$jscoverage['/mvc/model.js'].lineData[172]++;
  opts.success = function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[14]++;
  _$jscoverage['/mvc/model.js'].lineData[173]++;
  if (visit40_173_1(resp)) {
    _$jscoverage['/mvc/model.js'].lineData[174]++;
    var v = self.get("parse").call(self, resp);
    _$jscoverage['/mvc/model.js'].lineData[175]++;
    if (visit41_175_1(v)) {
      _$jscoverage['/mvc/model.js'].lineData[176]++;
      self.set(v, opts);
    }
  }
  _$jscoverage['/mvc/model.js'].lineData[179]++;
  self.__isModified = 0;
  _$jscoverage['/mvc/model.js'].lineData[180]++;
  visit42_180_1(success && success.apply(this, arguments));
};
  _$jscoverage['/mvc/model.js'].lineData[182]++;
  self.get("sync").call(self, self, self.isNew() ? 'create' : 'update', opts);
  _$jscoverage['/mvc/model.js'].lineData[183]++;
  return self;
}, 
  toJSON: function() {
  _$jscoverage['/mvc/model.js'].functionData[15]++;
  _$jscoverage['/mvc/model.js'].lineData[191]++;
  var ret = this.getAttrVals();
  _$jscoverage['/mvc/model.js'].lineData[192]++;
  S.each(blacklist, function(b) {
  _$jscoverage['/mvc/model.js'].functionData[16]++;
  _$jscoverage['/mvc/model.js'].lineData[193]++;
  delete ret[b];
});
  _$jscoverage['/mvc/model.js'].lineData[195]++;
  return ret;
}}, {
  ATTRS: {
  idAttribute: {
  value: 'id'}, 
  clientId: {
  valueFn: function() {
  _$jscoverage['/mvc/model.js'].functionData[17]++;
  _$jscoverage['/mvc/model.js'].lineData[216]++;
  return S.guid("mvc-client");
}}, 
  url: {
  value: url}, 
  urlRoot: {
  value: ""}, 
  sync: {
  value: function() {
  _$jscoverage['/mvc/model.js'].functionData[18]++;
  _$jscoverage['/mvc/model.js'].lineData[242]++;
  S.require("mvc").sync.apply(this, arguments);
}}, 
  parse: {
  value: function(resp) {
  _$jscoverage['/mvc/model.js'].functionData[19]++;
  _$jscoverage['/mvc/model.js'].lineData[252]++;
  return resp;
}}}});
  _$jscoverage['/mvc/model.js'].lineData[258]++;
  function getUrl(o) {
    _$jscoverage['/mvc/model.js'].functionData[20]++;
    _$jscoverage['/mvc/model.js'].lineData[259]++;
    var u;
    _$jscoverage['/mvc/model.js'].lineData[260]++;
    if (visit43_260_1(o && (u = o.get("url")))) {
      _$jscoverage['/mvc/model.js'].lineData[261]++;
      if (visit44_261_1(typeof u == 'string')) {
        _$jscoverage['/mvc/model.js'].lineData[262]++;
        return u;
      }
      _$jscoverage['/mvc/model.js'].lineData[264]++;
      return u.call(o);
    }
    _$jscoverage['/mvc/model.js'].lineData[266]++;
    return u;
  }
  _$jscoverage['/mvc/model.js'].lineData[269]++;
  function url() {
    _$jscoverage['/mvc/model.js'].functionData[21]++;
    _$jscoverage['/mvc/model.js'].lineData[270]++;
    var c, cv, collections = this.collections;
    _$jscoverage['/mvc/model.js'].lineData[273]++;
    for (c in collections) {
      _$jscoverage['/mvc/model.js'].lineData[274]++;
      if (visit45_274_1(collections.hasOwnProperty(c))) {
        _$jscoverage['/mvc/model.js'].lineData[275]++;
        cv = collections[c];
        _$jscoverage['/mvc/model.js'].lineData[276]++;
        break;
      }
    }
    _$jscoverage['/mvc/model.js'].lineData[279]++;
    var base = visit46_279_1(getUrl(cv) || this.get("urlRoot"));
    _$jscoverage['/mvc/model.js'].lineData[281]++;
    if (visit47_281_1(this.isNew())) {
      _$jscoverage['/mvc/model.js'].lineData[282]++;
      return base;
    }
    _$jscoverage['/mvc/model.js'].lineData[285]++;
    base = base + (visit48_285_1(base.charAt(base.length - 1) == '/') ? '' : '/');
    _$jscoverage['/mvc/model.js'].lineData[286]++;
    return base + encodeURIComponent(this.getId()) + "/";
  }
}, {
  requires: ['base']});
