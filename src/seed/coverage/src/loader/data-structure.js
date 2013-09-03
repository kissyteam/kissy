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
  _$jscoverage['/loader/data-structure.js'].lineData[12] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[13] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[23] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[24] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[27] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[29] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[38] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[46] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[54] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[58] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[60] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[68] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[69] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[70] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[72] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[80] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[88] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[96] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[104] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[112] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[120] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[124] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[131] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[132] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[133] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[134] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[137] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[139] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[143] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[144] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[146] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[147] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[148] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[149] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[151] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[152] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[156] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[164] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[172] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[175] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[176] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[178] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[180] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[182] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[186] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[193] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[194] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[195] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[197] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[198] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[199] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[207] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[212] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[236] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[237] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[246] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[273] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[274] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[282] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[283] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[293] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[294] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[299] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[302] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[303] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[304] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[305] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[312] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[317] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[318] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[319] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[322] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[324] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[325] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[331] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[333] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[334] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[338] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[344] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[347] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[352] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[353] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[358] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[359] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[362] = 0;
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
  _$jscoverage['/loader/data-structure.js'].functionData[34] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['61'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['69'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['146'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['174'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['175'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['193'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['194'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['201'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['207'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['224'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['237'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['263'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['274'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['283'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['302'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['303'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['304'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['317'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['318'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['319'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['321'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['340'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['358'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['362'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['362'][1].init(318, 32, 'packages[pName] || systemPackage');
function visit366_362_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['358'][2].init(57, 23, 'p.length > pName.length');
function visit365_358_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['358'][1].init(18, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit364_358_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['340'][1].init(192, 24, 'm.getPackage().isDebug()');
function visit363_340_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['321'][1].init(114, 34, 'normalizedRequiresStatus == status');
function visit362_321_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['319'][1].init(345, 150, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit361_319_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['318'][1].init(25, 14, 'requires || []');
function visit360_318_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['317'][2].init(255, 20, 'requires.length == 0');
function visit359_317_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['317'][1].init(242, 33, '!requires || requires.length == 0');
function visit358_317_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['304'][1].init(254, 18, '!requiresWithAlias');
function visit357_304_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['303'][1].init(25, 14, 'requires || []');
function visit356_303_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['302'][2].init(165, 20, 'requires.length == 0');
function visit355_302_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['302'][1].init(152, 33, '!requires || requires.length == 0');
function visit354_302_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['283'][1].init(51, 46, 'self.charset || self.getPackage().getCharset()');
function visit353_283_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['274'][1].init(51, 38, 'self.tag || self.getPackage().getTag()');
function visit352_274_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['263'][1].init(51, 93, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit351_263_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['237'][1].init(51, 72, 'self.path || (self.path = defaultComponentJsName(self))');
function visit350_237_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['224'][1].init(78, 14, '!self.fullpath');
function visit349_224_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['207'][1].init(578, 17, 't = self.getTag()');
function visit348_207_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['201'][1].init(217, 178, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName())');
function visit347_201_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['201'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['194'][1].init(22, 13, 'self.fullpath');
function visit346_194_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['193'][1].init(214, 17, '!self.fullpathUri');
function visit345_193_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['175'][1].init(22, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit344_175_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['174'][1].init(80, 2, '!v');
function visit343_174_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['146'][1].init(118, 7, 'i < len');
function visit342_146_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['69'][1].init(48, 15, 'self.packageUri');
function visit341_69_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['61'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit340_61_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/data-structure.js'].functionData[0]++;
  _$jscoverage['/loader/data-structure.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, IGNORE_PACKAGE_NAME_IN_URI = 'ignorePackageNameInUri', Utils = Loader.Utils;
  _$jscoverage['/loader/data-structure.js'].lineData[12]++;
  function forwardSystemPackage(self, property) {
    _$jscoverage['/loader/data-structure.js'].functionData[1]++;
    _$jscoverage['/loader/data-structure.js'].lineData[13]++;
    return property in self ? self[property] : self.runtime.Config[property];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[23]++;
  function Package(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[2]++;
    _$jscoverage['/loader/data-structure.js'].lineData[24]++;
    S.mix(this, cfg);
  }
  _$jscoverage['/loader/data-structure.js'].lineData[27]++;
  S.augment(Package, {
  reset: function(cfg) {
  _$jscoverage['/loader/data-structure.js'].functionData[3]++;
  _$jscoverage['/loader/data-structure.js'].lineData[29]++;
  S.mix(this, cfg);
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[4]++;
  _$jscoverage['/loader/data-structure.js'].lineData[38]++;
  return forwardSystemPackage(this, 'tag');
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[5]++;
  _$jscoverage['/loader/data-structure.js'].lineData[46]++;
  return this.name;
}, 
  'getBase': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[6]++;
  _$jscoverage['/loader/data-structure.js'].lineData[54]++;
  return forwardSystemPackage(this, 'base');
}, 
  getPrefixUriForCombo: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[7]++;
  _$jscoverage['/loader/data-structure.js'].lineData[58]++;
  var self = this, packageName = self.getName();
  _$jscoverage['/loader/data-structure.js'].lineData[60]++;
  return self.getBase() + (visit340_61_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[68]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[69]++;
  if (visit341_69_1(self.packageUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[70]++;
    return self.packageUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[72]++;
  return self.packageUri = new S.Uri(this.getPrefixUriForCombo());
}, 
  getBaseUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[9]++;
  _$jscoverage['/loader/data-structure.js'].lineData[80]++;
  return forwardSystemPackage(this, 'baseUri');
}, 
  isDebug: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[10]++;
  _$jscoverage['/loader/data-structure.js'].lineData[88]++;
  return forwardSystemPackage(this, 'debug');
}, 
  isIgnorePackageNameInUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[11]++;
  _$jscoverage['/loader/data-structure.js'].lineData[96]++;
  return forwardSystemPackage(this, IGNORE_PACKAGE_NAME_IN_URI);
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[12]++;
  _$jscoverage['/loader/data-structure.js'].lineData[104]++;
  return forwardSystemPackage(this, 'charset');
}, 
  isCombine: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[13]++;
  _$jscoverage['/loader/data-structure.js'].lineData[112]++;
  return forwardSystemPackage(this, 'combine');
}, 
  getGroup: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[14]++;
  _$jscoverage['/loader/data-structure.js'].lineData[120]++;
  return forwardSystemPackage(this, 'group');
}});
  _$jscoverage['/loader/data-structure.js'].lineData[124]++;
  Loader.Package = Package;
  _$jscoverage['/loader/data-structure.js'].lineData[131]++;
  function Module(cfg) {
    _$jscoverage['/loader/data-structure.js'].functionData[15]++;
    _$jscoverage['/loader/data-structure.js'].lineData[132]++;
    this.status = Loader.Status.INIT;
    _$jscoverage['/loader/data-structure.js'].lineData[133]++;
    S.mix(this, cfg);
    _$jscoverage['/loader/data-structure.js'].lineData[134]++;
    this.callbacks = [];
  }
  _$jscoverage['/loader/data-structure.js'].lineData[137]++;
  S.augment(Module, {
  addCallback: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[139]++;
  this.callbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[143]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[144]++;
  var len = this.callbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[146]++;
  for (; visit342_146_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[147]++;
    callback = this.callbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[148]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[149]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[151]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[152]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[156]++;
  this.callbacks = [];
}, 
  setValue: function(v) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[164]++;
  this.value = v;
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[172]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[174]++;
  if (visit343_174_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[175]++;
    if (visit344_175_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[176]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[178]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[180]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[182]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[186]++;
  var self = this, t, fullpathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[193]++;
  if (visit345_193_1(!self.fullpathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[194]++;
    if (visit346_194_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[195]++;
      fullpathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[197]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[198]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[199]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[201]++;
      if (visit347_201_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.getName()))) {
        _$jscoverage['/loader/data-structure.js'].lineData[204]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[206]++;
      fullpathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[207]++;
      if (visit348_207_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[208]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[209]++;
        fullpathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[212]++;
    self.fullpathUri = fullpathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[214]++;
  return self.fullpathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[222]++;
  var self = this, fullpathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[224]++;
  if (visit349_224_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[225]++;
    fullpathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[226]++;
    self.fullpath = Utils.getMappedPath(self.runtime, fullpathUri.toString());
  }
  _$jscoverage['/loader/data-structure.js'].lineData[228]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[236]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[237]++;
  return visit350_237_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getValue: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[246]++;
  return this.value;
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[254]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[262]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[263]++;
  return visit351_263_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[273]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[274]++;
  return visit352_274_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[282]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[283]++;
  return visit353_283_1(self.charset || self.getPackage().getCharset());
}, 
  'getRequiredMods': function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[291]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[293]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[294]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[299]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[302]++;
  if (visit354_302_1(!requires || visit355_302_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[303]++;
    return visit356_303_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[304]++;
    if (visit357_304_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[305]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[308]++;
  return requiresWithAlias;
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[312]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[317]++;
  if (visit358_317_1(!requires || visit359_317_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[318]++;
    return visit360_318_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[319]++;
    if (visit361_319_1((normalizedRequires = self.normalizedRequires) && (visit362_321_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[322]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[324]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[325]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}});
  _$jscoverage['/loader/data-structure.js'].lineData[331]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[333]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[33]++;
    _$jscoverage['/loader/data-structure.js'].lineData[334]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[338]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[340]++;
    if (visit363_340_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[341]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[344]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[347]++;
  var systemPackage = new Loader.Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[352]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[34]++;
    _$jscoverage['/loader/data-structure.js'].lineData[353]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[357]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[358]++;
      if (visit364_358_1(S.startsWith(modNameSlash, p + '/') && visit365_358_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[359]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[362]++;
    return visit366_362_1(packages[pName] || systemPackage);
  }
})(KISSY);
