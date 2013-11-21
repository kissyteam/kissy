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
  _$jscoverage['/loader/data-structure.js'].lineData[173] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[174] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[183] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[192] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[196] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[200] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[201] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[203] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[204] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[205] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[206] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[208] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[209] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[210] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[214] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[222] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[224] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[225] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[226] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[228] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[230] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[232] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[240] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[247] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[249] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[250] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[252] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[253] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[254] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[256] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[259] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[261] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[262] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[263] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[264] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[267] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[269] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[277] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[279] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[280] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[281] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[283] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[291] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[292] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[300] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[308] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[309] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[319] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[320] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[328] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[329] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[337] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[340] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[341] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[342] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[343] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[346] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[354] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[356] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[357] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[366] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[371] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[372] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[373] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[376] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[378] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[379] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[385] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[387] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[388] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[392] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[394] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[395] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[398] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[401] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[406] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[407] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[411] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[412] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[413] = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[416] = 0;
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
  _$jscoverage['/loader/data-structure.js'].functionData[35] = 0;
}
if (! _$jscoverage['/loader/data-structure.js'].branchData) {
  _$jscoverage['/loader/data-structure.js'].branchData = {};
  _$jscoverage['/loader/data-structure.js'].branchData['64'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['75'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['203'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['208'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['224'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['225'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['247'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['249'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['256'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['262'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['279'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['292'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['309'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['320'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['329'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['340'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['341'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['342'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['371'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['371'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['372'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['373'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['375'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['394'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['412'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['412'][2] = new BranchData();
  _$jscoverage['/loader/data-structure.js'].branchData['416'] = [];
  _$jscoverage['/loader/data-structure.js'].branchData['416'][1] = new BranchData();
}
_$jscoverage['/loader/data-structure.js'].branchData['416'][1].init(308, 32, 'packages[pName] || systemPackage');
function visit415_416_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['412'][2].init(56, 23, 'p.length > pName.length');
function visit414_412_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['412'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['412'][1].init(17, 62, 'S.startsWith(modNameSlash, p + \'/\') && p.length > pName.length');
function visit413_412_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['394'][1].init(185, 24, 'm.getPackage().isDebug()');
function visit412_394_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['375'][1].init(112, 34, 'normalizedRequiresStatus == status');
function visit411_375_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['373'][1].init(337, 148, '(normalizedRequires = self.normalizedRequires) && (normalizedRequiresStatus == status)');
function visit410_373_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['372'][1].init(24, 14, 'requires || []');
function visit409_372_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['371'][2].init(249, 20, 'requires.length == 0');
function visit408_371_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['371'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['371'][1].init(236, 33, '!requires || requires.length == 0');
function visit407_371_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['342'][1].init(248, 18, '!requiresWithAlias');
function visit406_342_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['341'][1].init(24, 14, 'requires || []');
function visit405_341_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['340'][2].init(161, 20, 'requires.length == 0');
function visit404_340_2(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['340'][1].init(148, 33, '!requires || requires.length == 0');
function visit403_340_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['329'][1].init(49, 46, 'self.charset || self.getPackage().getCharset()');
function visit402_329_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['320'][1].init(49, 38, 'self.tag || self.getPackage().getTag()');
function visit401_320_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['309'][1].init(49, 92, 'self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name))');
function visit400_309_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['292'][1].init(49, 55, 'self.path || (self.path = defaultComponentJsName(self))');
function visit399_292_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['279'][1].init(75, 14, '!self.fullpath');
function visit398_279_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['262'][1].init(562, 17, 't = self.getTag()');
function visit397_262_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['256'][1].init(212, 171, 'packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name)');
function visit396_256_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['249'][1].init(66, 13, 'self.fullpath');
function visit395_249_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['247'][1].init(206, 17, '!self.fullPathUri');
function visit394_247_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['225'][1].init(21, 47, 'Path.extname(self.name).toLowerCase() == \'.css\'');
function visit393_225_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['224'][1].init(77, 2, '!v');
function visit392_224_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['208'][1].init(27, 12, 'e.stack || e');
function visit391_208_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['203'][1].init(120, 7, 'i < len');
function visit390_203_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['75'][1].init(46, 15, 'self.packageUri');
function visit389_75_1(result) {
  _$jscoverage['/loader/data-structure.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/data-structure.js'].branchData['64'][1].init(-1, 47, 'packageName && !self.isIgnorePackageNameInUri()');
function visit388_64_1(result) {
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
  return self.getBase() + (visit388_64_1(packageName && !self.isIgnorePackageNameInUri()) ? (packageName + '/') : '');
}, 
  getPackageUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[8]++;
  _$jscoverage['/loader/data-structure.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[75]++;
  if (visit389_75_1(self.packageUri)) {
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
  'use': function(relativeName, fn) {
  _$jscoverage['/loader/data-structure.js'].functionData[16]++;
  _$jscoverage['/loader/data-structure.js'].lineData[173]++;
  relativeName = Utils.getModNamesAsArray(relativeName);
  _$jscoverage['/loader/data-structure.js'].lineData[174]++;
  return KISSY.use(Utils.normalDepModuleName(this.name, relativeName), fn);
}, 
  'resolve': function(relativePath) {
  _$jscoverage['/loader/data-structure.js'].functionData[17]++;
  _$jscoverage['/loader/data-structure.js'].lineData[183]++;
  return this.getFullPathUri().resolve(relativePath);
}, 
  require: function(moduleName) {
  _$jscoverage['/loader/data-structure.js'].functionData[18]++;
  _$jscoverage['/loader/data-structure.js'].lineData[192]++;
  return S.require(moduleName, this.name);
}, 
  wait: function(callback) {
  _$jscoverage['/loader/data-structure.js'].functionData[19]++;
  _$jscoverage['/loader/data-structure.js'].lineData[196]++;
  this.waitedCallbacks.push(callback);
}, 
  notifyAll: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[20]++;
  _$jscoverage['/loader/data-structure.js'].lineData[200]++;
  var callback;
  _$jscoverage['/loader/data-structure.js'].lineData[201]++;
  var len = this.waitedCallbacks.length, i = 0;
  _$jscoverage['/loader/data-structure.js'].lineData[203]++;
  for (; visit390_203_1(i < len); i++) {
    _$jscoverage['/loader/data-structure.js'].lineData[204]++;
    callback = this.waitedCallbacks[i];
    _$jscoverage['/loader/data-structure.js'].lineData[205]++;
    try {
      _$jscoverage['/loader/data-structure.js'].lineData[206]++;
      callback(this);
    }    catch (e) {
  _$jscoverage['/loader/data-structure.js'].lineData[208]++;
  S.log(visit391_208_1(e.stack || e), 'error');
  _$jscoverage['/loader/data-structure.js'].lineData[209]++;
  setTimeout(function() {
  _$jscoverage['/loader/data-structure.js'].functionData[21]++;
  _$jscoverage['/loader/data-structure.js'].lineData[210]++;
  throw e;
}, 0);
}
  }
  _$jscoverage['/loader/data-structure.js'].lineData[214]++;
  this.waitedCallbacks = [];
}, 
  getType: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[22]++;
  _$jscoverage['/loader/data-structure.js'].lineData[222]++;
  var self = this, v = self.type;
  _$jscoverage['/loader/data-structure.js'].lineData[224]++;
  if (visit392_224_1(!v)) {
    _$jscoverage['/loader/data-structure.js'].lineData[225]++;
    if (visit393_225_1(Path.extname(self.name).toLowerCase() == '.css')) {
      _$jscoverage['/loader/data-structure.js'].lineData[226]++;
      v = 'css';
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[228]++;
      v = 'js';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[230]++;
    self.type = v;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[232]++;
  return v;
}, 
  getFullPathUri: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[23]++;
  _$jscoverage['/loader/data-structure.js'].lineData[240]++;
  var self = this, t, fullPathUri, packageBaseUri, packageInfo, packageName, path;
  _$jscoverage['/loader/data-structure.js'].lineData[247]++;
  if (visit394_247_1(!self.fullPathUri)) {
    _$jscoverage['/loader/data-structure.js'].lineData[249]++;
    if (visit395_249_1(self.fullpath)) {
      _$jscoverage['/loader/data-structure.js'].lineData[250]++;
      fullPathUri = new S.Uri(self.fullpath);
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[252]++;
      packageInfo = self.getPackage();
      _$jscoverage['/loader/data-structure.js'].lineData[253]++;
      packageBaseUri = packageInfo.getBaseUri();
      _$jscoverage['/loader/data-structure.js'].lineData[254]++;
      path = self.getPath();
      _$jscoverage['/loader/data-structure.js'].lineData[256]++;
      if (visit396_256_1(packageInfo.isIgnorePackageNameInUri() && (packageName = packageInfo.name))) {
        _$jscoverage['/loader/data-structure.js'].lineData[259]++;
        path = Path.relative(packageName, path);
      }
      _$jscoverage['/loader/data-structure.js'].lineData[261]++;
      fullPathUri = packageBaseUri.resolve(path);
      _$jscoverage['/loader/data-structure.js'].lineData[262]++;
      if (visit397_262_1(t = self.getTag())) {
        _$jscoverage['/loader/data-structure.js'].lineData[263]++;
        t += '.' + self.getType();
        _$jscoverage['/loader/data-structure.js'].lineData[264]++;
        fullPathUri.query.set('t', t);
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[267]++;
    self.fullPathUri = fullPathUri;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[269]++;
  return self.fullPathUri;
}, 
  getFullPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[24]++;
  _$jscoverage['/loader/data-structure.js'].lineData[277]++;
  var self = this, fullPathUri;
  _$jscoverage['/loader/data-structure.js'].lineData[279]++;
  if (visit398_279_1(!self.fullpath)) {
    _$jscoverage['/loader/data-structure.js'].lineData[280]++;
    fullPathUri = self.getFullPathUri();
    _$jscoverage['/loader/data-structure.js'].lineData[281]++;
    self.fullpath = fullPathUri.toString();
  }
  _$jscoverage['/loader/data-structure.js'].lineData[283]++;
  return self.fullpath;
}, 
  getPath: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[25]++;
  _$jscoverage['/loader/data-structure.js'].lineData[291]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[292]++;
  return visit399_292_1(self.path || (self.path = defaultComponentJsName(self)));
}, 
  getName: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[26]++;
  _$jscoverage['/loader/data-structure.js'].lineData[300]++;
  return this.name;
}, 
  getPackage: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[27]++;
  _$jscoverage['/loader/data-structure.js'].lineData[308]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[309]++;
  return visit400_309_1(self.packageInfo || (self.packageInfo = getPackage(self.runtime, self.name)));
}, 
  getTag: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[28]++;
  _$jscoverage['/loader/data-structure.js'].lineData[319]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[320]++;
  return visit401_320_1(self.tag || self.getPackage().getTag());
}, 
  getCharset: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[29]++;
  _$jscoverage['/loader/data-structure.js'].lineData[328]++;
  var self = this;
  _$jscoverage['/loader/data-structure.js'].lineData[329]++;
  return visit402_329_1(self.charset || self.getPackage().getCharset());
}, 
  getRequiresWithAlias: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[30]++;
  _$jscoverage['/loader/data-structure.js'].lineData[337]++;
  var self = this, requiresWithAlias = self.requiresWithAlias, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[340]++;
  if (visit403_340_1(!requires || visit404_340_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[341]++;
    return visit405_341_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[342]++;
    if (visit406_342_1(!requiresWithAlias)) {
      _$jscoverage['/loader/data-structure.js'].lineData[343]++;
      self.requiresWithAlias = requiresWithAlias = Utils.normalizeModNamesWithAlias(self.runtime, requires, self.name);
    }
  }
  _$jscoverage['/loader/data-structure.js'].lineData[346]++;
  return requiresWithAlias;
}, 
  getRequiredMods: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[31]++;
  _$jscoverage['/loader/data-structure.js'].lineData[354]++;
  var self = this, runtime = self.runtime;
  _$jscoverage['/loader/data-structure.js'].lineData[356]++;
  return S.map(self.getNormalizedRequires(), function(r) {
  _$jscoverage['/loader/data-structure.js'].functionData[32]++;
  _$jscoverage['/loader/data-structure.js'].lineData[357]++;
  return Utils.createModuleInfo(runtime, r);
});
}, 
  getNormalizedRequires: function() {
  _$jscoverage['/loader/data-structure.js'].functionData[33]++;
  _$jscoverage['/loader/data-structure.js'].lineData[366]++;
  var self = this, normalizedRequires, normalizedRequiresStatus = self.normalizedRequiresStatus, status = self.status, requires = self.requires;
  _$jscoverage['/loader/data-structure.js'].lineData[371]++;
  if (visit407_371_1(!requires || visit408_371_2(requires.length == 0))) {
    _$jscoverage['/loader/data-structure.js'].lineData[372]++;
    return visit409_372_1(requires || []);
  } else {
    _$jscoverage['/loader/data-structure.js'].lineData[373]++;
    if (visit410_373_1((normalizedRequires = self.normalizedRequires) && (visit411_375_1(normalizedRequiresStatus == status)))) {
      _$jscoverage['/loader/data-structure.js'].lineData[376]++;
      return normalizedRequires;
    } else {
      _$jscoverage['/loader/data-structure.js'].lineData[378]++;
      self.normalizedRequiresStatus = status;
      _$jscoverage['/loader/data-structure.js'].lineData[379]++;
      return self.normalizedRequires = Utils.normalizeModNames(self.runtime, requires, self.name);
    }
  }
}};
  _$jscoverage['/loader/data-structure.js'].lineData[385]++;
  Loader.Module = Module;
  _$jscoverage['/loader/data-structure.js'].lineData[387]++;
  function defaultComponentJsName(m) {
    _$jscoverage['/loader/data-structure.js'].functionData[34]++;
    _$jscoverage['/loader/data-structure.js'].lineData[388]++;
    var name = m.name, extname = '.' + m.getType(), min = '-min';
    _$jscoverage['/loader/data-structure.js'].lineData[392]++;
    name = Path.join(Path.dirname(name), Path.basename(name, extname));
    _$jscoverage['/loader/data-structure.js'].lineData[394]++;
    if (visit412_394_1(m.getPackage().isDebug())) {
      _$jscoverage['/loader/data-structure.js'].lineData[395]++;
      min = '';
    }
    _$jscoverage['/loader/data-structure.js'].lineData[398]++;
    return name + min + extname;
  }
  _$jscoverage['/loader/data-structure.js'].lineData[401]++;
  var systemPackage = new Package({
  name: '', 
  runtime: S});
  _$jscoverage['/loader/data-structure.js'].lineData[406]++;
  function getPackage(self, modName) {
    _$jscoverage['/loader/data-structure.js'].functionData[35]++;
    _$jscoverage['/loader/data-structure.js'].lineData[407]++;
    var packages = self.config('packages'), modNameSlash = modName + '/', pName = '', p;
    _$jscoverage['/loader/data-structure.js'].lineData[411]++;
    for (p in packages) {
      _$jscoverage['/loader/data-structure.js'].lineData[412]++;
      if (visit413_412_1(S.startsWith(modNameSlash, p + '/') && visit414_412_2(p.length > pName.length))) {
        _$jscoverage['/loader/data-structure.js'].lineData[413]++;
        pName = p;
      }
    }
    _$jscoverage['/loader/data-structure.js'].lineData[416]++;
    return visit415_416_1(packages[pName] || systemPackage);
  }
})(KISSY);
