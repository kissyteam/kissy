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
if (! _$jscoverage['/loader/data-structure.js']) {
  _$jscoverage['/loader/data-structure.js'] = {};
  _$jscoverage['/loader/data-structure.js'].lineData = [];
  _$jscoverage['/loader/data-structure.js'].lineData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[41] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[49] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[57] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[61] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[63] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[74] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[75] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[76] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[78] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[86] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[94] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[102] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[110] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[118] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[126] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[130] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[138] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[142] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[161] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[170] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[179] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[211] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[219] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[221] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[244] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[249] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[251] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[260] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[266] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[276] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[277] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[278] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[297] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[316] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[338] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[343] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[351] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[356] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[361] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[370] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[372] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[377] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[379] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[380] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[383] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[386] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[391] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[396] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[397] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[401] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].functionData) {
  _$jscoverage['/loader/data-structure.js'].functionData = [];
  _$jscoverage['/loader/data-structure.js'].functionData[0] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[1] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[2] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[3] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[4] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[5] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[6] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[7] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[8] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[9] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[10] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[11] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[14] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[15] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[16] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[17] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[18] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[19] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[20] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[21] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[22] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[25] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[26] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[28] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[30] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[31] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[32] = 0;
  _$jscoverage['/loader/data-structure.js'].functionData[33] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['64'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['75'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['200'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['205'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['221'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['222'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['244'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['246'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['253'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['259'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['276'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['289'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['306'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['317'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['326'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['337'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['338'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['339'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['356'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['357'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['358'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['360'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['379'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['397'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['397'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['401'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['401'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['401'][1].init(308, 32, 'packages[pName] || systemPackage');
function visit410_401_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['397'][2].init(56, 23, 'p.length > pName.length');
function visit409_397_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['397'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['397'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit408_397_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['379'][1].init(185, 24, 'm.getPackage().isDebug()');
function visit407_379_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['360'][1].init(112, 34, 'normalizedRequiresStatus == status');
function visit406_360_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['358'][1].init(337, 148, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit405_358_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['357'][1].init(24, 14, 'requires || []');
function visit404_357_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['356'][2].init(249, 20, 'requires.length == 0');
function visit403_356_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['356'][1].init(236, 33, '!requires || requires.length == 0');
function visit402_356_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['339'][1].init(248, 18, '!requiresWithAlias');
function visit401_339_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['338'][1].init(24, 14, 'requires || []');
function visit400_338_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['337'][2].init(161, 20, 'requires.length == 0');
function visit399_337_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['337'][1].init(148, 33, '!requires || requires.length == 0');
function visit398_337_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['326'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit397_326_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['317'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit396_317_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['306'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit395_306_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['289'][1].init(49, 54, 'self.path || (self.path = defaultComponentJsName(self))');
function visit394_289_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['276'][1].init(75, 14, '!self.fullpath');
function visit393_276_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['259'][1].init(562, 17, 't = self.getTag()');
function visit392_259_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['253'][1].init(212, 171, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit391_253_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['246'][1].init(66, 13, 'self.fullpath');
function visit390_246_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['244'][1].init(206, 17, '!self.fullPathUri');
function visit389_244_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['222'][1].init(21, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit388_222_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['221'][1].init(77, 2, '!v');
function visit387_221_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['205'][1].init(27, 12, 'e.stack || e');
function visit386_205_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['200'][1].init(120, 7, 'i < len');
function visit385_200_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['75'][1].init(46, 15, 'self.packageUri');
function visit384_75_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['64'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit383_64_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, undefined = undefined, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[13]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[14]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[24]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[25]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[28]++;
  Package.prototype = {
  constructor: Package, 
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[32]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[41]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[49]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[57]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[61]++;
  var self = this, packageName = self.name;
  _$jscoverage['/loader/data-structure.js'].lineData[63]++;
  return self.getBase() + (visit383_64_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[75]++;
  if (visit384_75_1(self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[76]++;
    return self.packageUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[78]++;
  return self.packageUri = new S.Uri(this.getPrefixUriForCombo());
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[86]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[94]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[102]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[110]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[118]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[126]++;
  return forwardSystemPackage(this, 'group');
}};
  _$jscoverage['/loader/data-structure.js'].lineData[130]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[137]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[138]++;
    var module = this;
    _$jscoverage['/loader/data-structure.js'].lineData[142]++;
    module.exports = {};
    _$jscoverage['/loader/data-structure.js'].lineData[147]++;
    module.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[152]++;
    module.name = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[156]++;
    module.factory = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[157]++;
    S.mix(module, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[158]++;
    module.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[161]++;
  Module.prototype = {
  constructor: Module, 
  'resolveByName': function(relativeName) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[170]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  'resolveByPath': function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[179]++;
  return this.getFullPathUri().resolve(relativePath);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[188]++;
  var moduleNames = Utils.normalizeModNamesWithAlias(S, [moduleName], this.name);
  _$jscoverage['/loader/data-structure.js'].lineData[189]++;
  return Utils.getModules(S, moduleNames)[1];
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[193]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[197]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[198]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200]++;
  for (; visit385_200_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[201]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[202]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[203]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[205]++;
  S.log(visit386_205_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[206]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[207]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[211]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[219]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[221]++;
  if (visit387_221_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[222]++;
    if (visit388_222_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[223]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[225]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[227]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[229]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[237]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[244]++;
  if (visit389_244_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[246]++;
    if (visit390_246_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[247]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[249]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[250]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[251]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[253]++;
      if (visit391_253_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[256]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[258]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[259]++;
      if (visit392_259_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[260]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[261]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[264]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[266]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[274]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[276]++;
  if (visit393_276_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[277]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[278]++;
    self.fullpath = fullPathUri.toString();
  }
  _$jscoverage['/loader/data-structure.js'].lineData[280]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[288]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[289]++;
  return visit394_289_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[297]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[305]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[306]++;
  return visit395_306_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[316]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[317]++;
  return visit396_317_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[325]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[326]++;
  return visit397_326_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[334]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[337]++;
  if (visit398_337_1(!requires || visit399_337_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[338]++;
    return visit400_338_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[339]++;
    if (visit401_339_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[340]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[343]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[351]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[356]++;
  if (visit402_356_1(!requires || visit403_356_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[357]++;
    return visit404_357_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[358]++;
    if (visit405_358_1((normalizedRequires = self.normalizedRequires) && (visit406_360_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[361]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[363]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[364]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[370]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[372]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[32]++;
    _$jscoverage['/loader/data-structure.js'].lineData[373]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[377]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[379]++;
    if (visit407_379_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[380]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[383]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[386]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[391]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[392]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[396]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[397]++;
      if (visit408_397_1(S.startsWith(modNameSlash, p + '/') && visit409_397_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[398]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[401]++;
    return visit410_401_1(packages[pName] || systemPackage);
  }
})(KISSY);
