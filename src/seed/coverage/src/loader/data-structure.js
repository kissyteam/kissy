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
  _$jscoverage['/loader/data-structure.js'].lineData[158] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[159] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[160] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[163] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[181] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[190] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[202] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[220] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[223] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[238] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[245] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[248] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[251] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[257] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[260] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[265] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[267] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[275] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[277] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[278] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[289] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[290] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[298] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[306] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[307] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[326] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[327] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[335] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[338] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[339] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[359] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[362] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[364] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[365] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[371] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[374] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[378] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[380] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[381] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[384] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[387] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[393] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[397] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[399] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[402] = 0;
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
  _$jscoverage['/loader/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['206'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['222'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['223'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['245'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['247'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['254'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['260'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['277'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['290'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['307'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['318'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['327'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['338'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['338'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['339'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['340'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['357'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['357'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['358'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['359'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['361'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['380'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['398'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['402'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['402'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['402'][1].init(308, 32, 'packages[pName] || systemPackage');
function visit412_402_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['398'][2].init(56, 23, 'p.length > pName.length');
function visit411_398_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['398'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit410_398_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['380'][1].init(185, 24, 'm.getPackage().isDebug()');
function visit409_380_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['361'][1].init(112, 34, 'normalizedRequiresStatus == status');
function visit408_361_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['359'][1].init(337, 148, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit407_359_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['358'][1].init(24, 14, 'requires || []');
function visit406_358_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['357'][2].init(249, 20, 'requires.length == 0');
function visit405_357_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['357'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['357'][1].init(236, 33, '!requires || requires.length == 0');
function visit404_357_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['340'][1].init(248, 18, '!requiresWithAlias');
function visit403_340_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['339'][1].init(24, 14, 'requires || []');
function visit402_339_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['338'][2].init(161, 20, 'requires.length == 0');
function visit401_338_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['338'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['338'][1].init(148, 33, '!requires || requires.length == 0');
function visit400_338_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['327'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit399_327_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['318'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit398_318_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['307'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit397_307_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['290'][1].init(49, 55, 'self.path || (self.path = defaultComponentJsName(self))');
function visit396_290_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['277'][1].init(75, 14, '!self.fullpath');
function visit395_277_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['260'][1].init(562, 17, 't = self.getTag()');
function visit394_260_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['254'][1].init(212, 171, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit393_254_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['247'][1].init(66, 13, 'self.fullpath');
function visit392_247_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['245'][1].init(206, 17, '!self.fullPathUri');
function visit391_245_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['223'][1].init(21, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit390_223_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['222'][1].init(77, 2, '!v');
function visit389_222_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['206'][1].init(27, 12, 'e.stack || e');
function visit388_206_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['201'][1].init(120, 7, 'i < len');
function visit387_201_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['75'][1].init(46, 15, 'self.packageUri');
function visit386_75_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['64'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit385_64_1(result) {
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
  return self.getBase() + (visit385_64_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[75]++;
  if (visit386_75_1(self.packageUri)) {
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
    _$jscoverage['/loader/data-structure.js'].lineData[158]++;
    module.cjs = 1;
    _$jscoverage['/loader/data-structure.js'].lineData[159]++;
    S.mix(module, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[160]++;
    module.waitedCallbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[163]++;
  Module.prototype = {
  constructor: Module, 
  'resolveByName': function(relativeName) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[172]++;
  return Utils.normalDepModuleName(this.name, relativeName);
}, 
  'resolveByPath': function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[181]++;
  return this.getFullPathUri().resolve(relativePath);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[190]++;
  return S.require(moduleName, this.name);
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[194]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[198]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[199]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201]++;
  for (; visit387_201_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[202]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[203]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[204]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[206]++;
  S.log(visit388_206_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[207]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[208]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[212]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[220]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[222]++;
  if (visit389_222_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[223]++;
    if (visit390_223_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[224]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[226]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[228]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[230]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[238]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[245]++;
  if (visit391_245_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[247]++;
    if (visit392_247_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[248]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[250]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[251]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[252]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[254]++;
      if (visit393_254_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[257]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[259]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[260]++;
      if (visit394_260_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[261]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[262]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[265]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[267]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[275]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[277]++;
  if (visit395_277_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[278]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[279]++;
    self.fullpath = fullPathUri.toString();
  }
  _$jscoverage['/loader/data-structure.js'].lineData[281]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[289]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[290]++;
  return visit396_290_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[298]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[306]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[307]++;
  return visit397_307_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[317]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[318]++;
  return visit398_318_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[326]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[327]++;
  return visit399_327_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[335]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[338]++;
  if (visit400_338_1(!requires || visit401_338_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[339]++;
    return visit402_339_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[340]++;
    if (visit403_340_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[341]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[344]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[352]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[357]++;
  if (visit404_357_1(!requires || visit405_357_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[358]++;
    return visit406_358_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[359]++;
    if (visit407_359_1((normalizedRequires = self.normalizedRequires) && (visit408_361_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[362]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[364]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[365]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[371]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[373]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[32]++;
    _$jscoverage['/loader/data-structure.js'].lineData[374]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[378]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[380]++;
    if (visit409_380_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[381]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[384]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[387]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[392]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[393]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[397]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[398]++;
      if (visit410_398_1(S.startsWith(modNameSlash, p + '/') && visit411_398_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[399]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[402]++;
    return visit412_402_1(packages[pName] || systemPackage);
  }
})(KISSY);
