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
  _$jscoverage['/loader/data-structure.js'].lineData[157] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[162] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[171] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[184] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[185] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[188] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[189] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[227] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[229] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[231] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[233] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[235] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[241] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[242] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[243] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[258] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[260] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[270] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[271] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[288] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[321] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[322] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[323] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[347] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[355] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[356] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[360] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[362] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[363] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[366] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[369] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[374] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[375] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[379] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[380] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[381] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[384] = 0;
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
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['64'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['75'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['183'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['188'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['204'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['205'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['227'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['228'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['235'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['241'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['258'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['271'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['289'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['300'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['309'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['320'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['320'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['321'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['322'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['339'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['340'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['341'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['343'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['362'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['380'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['380'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['384'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['384'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['384'][1].init(308, 32, 'packages[pName] || systemPackage');
function visit416_384_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['380'][2].init(56, 23, 'p.length > pName.length');
function visit415_380_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['380'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['380'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit414_380_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['362'][1].init(185, 24, 'm.getPackage().isDebug()');
function visit413_362_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['343'][1].init(112, 34, 'normalizedRequiresStatus == status');
function visit412_343_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['341'][1].init(337, 148, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit411_341_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['340'][1].init(24, 14, 'requires || []');
function visit410_340_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['339'][2].init(249, 20, 'requires.length == 0');
function visit409_339_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['339'][1].init(236, 33, '!requires || requires.length == 0');
function visit408_339_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['322'][1].init(248, 18, '!requiresWithAlias');
function visit407_322_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['321'][1].init(24, 14, 'requires || []');
function visit406_321_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['320'][2].init(161, 20, 'requires.length == 0');
function visit405_320_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['320'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['320'][1].init(148, 33, '!requires || requires.length == 0');
function visit404_320_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['309'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit403_309_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['300'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit402_300_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['289'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit401_289_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['271'][1].init(49, 71, 'self.path || (self.path = defaultComponentJsName(self))');
function visit400_271_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['258'][1].init(75, 14, '!self.fullpath');
function visit399_258_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['241'][1].init(562, 17, 't = self.getTag()');
function visit398_241_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['235'][1].init(212, 171, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit397_235_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['228'][1].init(21, 13, 'self.fullpath');
function visit396_228_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['227'][1].init(206, 17, '!self.fullPathUri');
function visit395_227_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['205'][1].init(21, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit394_205_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['204'][1].init(77, 2, '!v');
function visit393_204_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['188'][1].init(27, 12, 'e.stack || e');
function visit392_188_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['183'][1].init(120, 7, 'i < len');
function visit391_183_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['75'][1].init(46, 15, 'self.packageUri');
function visit390_75_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['64'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit389_64_1(result) {
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
  return self.getBase() + (visit389_64_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[75]++;
  if (visit390_75_1(self.packageUri)) {
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
    _$jscoverage['/loader/data-structure.js'].lineData[157]++;
    module.factory = undefined;
    _$jscoverage['/loader/data-structure.js'].lineData[158]++;
    S.mix(module, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[159]++;
    module.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[162]++;
  Module.prototype = {
  constructor: Module, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[171]++;
  var moduleNames = Utils.normalizeModNamesWithAlias(S, [moduleName], this.name);
  _$jscoverage['/loader/data-structure.js'].lineData[172]++;
  return Utils.getModules(S, moduleNames)[1];
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[176]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[180]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[181]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183]++;
  for (; visit391_183_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[184]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[185]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[186]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[188]++;
  S.log(visit392_188_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[189]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[190]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[194]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[202]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[204]++;
  if (visit393_204_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[205]++;
    if (visit394_205_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[206]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[208]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[210]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[212]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[220]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[227]++;
  if (visit395_227_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[228]++;
    if (visit396_228_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[229]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[231]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[232]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[233]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[235]++;
      if (visit397_235_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[238]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[240]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[241]++;
      if (visit398_241_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[242]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[243]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[246]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[248]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[256]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[258]++;
  if (visit399_258_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[259]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[260]++;
    self.fullpath = Utils.getMappedPath(self.runtime, fullPathUri.toString());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[262]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[270]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[271]++;
  return visit400_271_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[280]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[288]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[289]++;
  return visit401_289_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[299]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[300]++;
  return visit402_300_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[308]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[309]++;
  return visit403_309_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[317]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[320]++;
  if (visit404_320_1(!requires || visit405_320_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[321]++;
    return visit406_321_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[322]++;
    if (visit407_322_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[323]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[326]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[334]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[339]++;
  if (visit408_339_1(!requires || visit409_339_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[340]++;
    return visit410_340_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[341]++;
    if (visit411_341_1((normalizedRequires = self.normalizedRequires) && (visit412_343_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[344]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[346]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[347]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[353]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[355]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[30]++;
    _$jscoverage['/loader/data-structure.js'].lineData[356]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[360]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[362]++;
    if (visit413_362_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[363]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[366]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[369]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[374]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[31]++;
    _$jscoverage['/loader/data-structure.js'].lineData[375]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[379]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[380]++;
      if (visit414_380_1(S.startsWith(modNameSlash, p + '/') && visit415_380_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[381]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[384]++;
    return visit416_384_1(packages[pName] || systemPackage);
  }
})(KISSY);
