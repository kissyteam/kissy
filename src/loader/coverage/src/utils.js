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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[25] = 0;
  _$jscoverage['/utils.js'].lineData[26] = 0;
  _$jscoverage['/utils.js'].lineData[27] = 0;
  _$jscoverage['/utils.js'].lineData[29] = 0;
  _$jscoverage['/utils.js'].lineData[32] = 0;
  _$jscoverage['/utils.js'].lineData[33] = 0;
  _$jscoverage['/utils.js'].lineData[35] = 0;
  _$jscoverage['/utils.js'].lineData[39] = 0;
  _$jscoverage['/utils.js'].lineData[41] = 0;
  _$jscoverage['/utils.js'].lineData[42] = 0;
  _$jscoverage['/utils.js'].lineData[44] = 0;
  _$jscoverage['/utils.js'].lineData[45] = 0;
  _$jscoverage['/utils.js'].lineData[47] = 0;
  _$jscoverage['/utils.js'].lineData[50] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[52] = 0;
  _$jscoverage['/utils.js'].lineData[53] = 0;
  _$jscoverage['/utils.js'].lineData[54] = 0;
  _$jscoverage['/utils.js'].lineData[55] = 0;
  _$jscoverage['/utils.js'].lineData[56] = 0;
  _$jscoverage['/utils.js'].lineData[58] = 0;
  _$jscoverage['/utils.js'].lineData[61] = 0;
  _$jscoverage['/utils.js'].lineData[64] = 0;
  _$jscoverage['/utils.js'].lineData[65] = 0;
  _$jscoverage['/utils.js'].lineData[67] = 0;
  _$jscoverage['/utils.js'].lineData[68] = 0;
  _$jscoverage['/utils.js'].lineData[72] = 0;
  _$jscoverage['/utils.js'].lineData[73] = 0;
  _$jscoverage['/utils.js'].lineData[74] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[78] = 0;
  _$jscoverage['/utils.js'].lineData[81] = 0;
  _$jscoverage['/utils.js'].lineData[85] = 0;
  _$jscoverage['/utils.js'].lineData[86] = 0;
  _$jscoverage['/utils.js'].lineData[89] = 0;
  _$jscoverage['/utils.js'].lineData[91] = 0;
  _$jscoverage['/utils.js'].lineData[92] = 0;
  _$jscoverage['/utils.js'].lineData[94] = 0;
  _$jscoverage['/utils.js'].lineData[95] = 0;
  _$jscoverage['/utils.js'].lineData[96] = 0;
  _$jscoverage['/utils.js'].lineData[97] = 0;
  _$jscoverage['/utils.js'].lineData[98] = 0;
  _$jscoverage['/utils.js'].lineData[102] = 0;
  _$jscoverage['/utils.js'].lineData[103] = 0;
  _$jscoverage['/utils.js'].lineData[104] = 0;
  _$jscoverage['/utils.js'].lineData[105] = 0;
  _$jscoverage['/utils.js'].lineData[106] = 0;
  _$jscoverage['/utils.js'].lineData[112] = 0;
  _$jscoverage['/utils.js'].lineData[113] = 0;
  _$jscoverage['/utils.js'].lineData[114] = 0;
  _$jscoverage['/utils.js'].lineData[115] = 0;
  _$jscoverage['/utils.js'].lineData[117] = 0;
  _$jscoverage['/utils.js'].lineData[120] = 0;
  _$jscoverage['/utils.js'].lineData[121] = 0;
  _$jscoverage['/utils.js'].lineData[124] = 0;
  _$jscoverage['/utils.js'].lineData[125] = 0;
  _$jscoverage['/utils.js'].lineData[126] = 0;
  _$jscoverage['/utils.js'].lineData[128] = 0;
  _$jscoverage['/utils.js'].lineData[131] = 0;
  _$jscoverage['/utils.js'].lineData[138] = 0;
  _$jscoverage['/utils.js'].lineData[142] = 0;
  _$jscoverage['/utils.js'].lineData[143] = 0;
  _$jscoverage['/utils.js'].lineData[144] = 0;
  _$jscoverage['/utils.js'].lineData[147] = 0;
  _$jscoverage['/utils.js'].lineData[151] = 0;
  _$jscoverage['/utils.js'].lineData[152] = 0;
  _$jscoverage['/utils.js'].lineData[156] = 0;
  _$jscoverage['/utils.js'].lineData[166] = 0;
  _$jscoverage['/utils.js'].lineData[167] = 0;
  _$jscoverage['/utils.js'].lineData[168] = 0;
  _$jscoverage['/utils.js'].lineData[170] = 0;
  _$jscoverage['/utils.js'].lineData[171] = 0;
  _$jscoverage['/utils.js'].lineData[172] = 0;
  _$jscoverage['/utils.js'].lineData[173] = 0;
  _$jscoverage['/utils.js'].lineData[174] = 0;
  _$jscoverage['/utils.js'].lineData[175] = 0;
  _$jscoverage['/utils.js'].lineData[176] = 0;
  _$jscoverage['/utils.js'].lineData[177] = 0;
  _$jscoverage['/utils.js'].lineData[179] = 0;
  _$jscoverage['/utils.js'].lineData[182] = 0;
  _$jscoverage['/utils.js'].lineData[186] = 0;
  _$jscoverage['/utils.js'].lineData[187] = 0;
  _$jscoverage['/utils.js'].lineData[188] = 0;
  _$jscoverage['/utils.js'].lineData[198] = 0;
  _$jscoverage['/utils.js'].lineData[208] = 0;
  _$jscoverage['/utils.js'].lineData[209] = 0;
  _$jscoverage['/utils.js'].lineData[212] = 0;
  _$jscoverage['/utils.js'].lineData[214] = 0;
  _$jscoverage['/utils.js'].lineData[215] = 0;
  _$jscoverage['/utils.js'].lineData[217] = 0;
  _$jscoverage['/utils.js'].lineData[225] = 0;
  _$jscoverage['/utils.js'].lineData[226] = 0;
  _$jscoverage['/utils.js'].lineData[227] = 0;
  _$jscoverage['/utils.js'].lineData[229] = 0;
  _$jscoverage['/utils.js'].lineData[239] = 0;
  _$jscoverage['/utils.js'].lineData[241] = 0;
  _$jscoverage['/utils.js'].lineData[244] = 0;
  _$jscoverage['/utils.js'].lineData[245] = 0;
  _$jscoverage['/utils.js'].lineData[249] = 0;
  _$jscoverage['/utils.js'].lineData[253] = 0;
  _$jscoverage['/utils.js'].lineData[262] = 0;
  _$jscoverage['/utils.js'].lineData[268] = 0;
  _$jscoverage['/utils.js'].lineData[269] = 0;
  _$jscoverage['/utils.js'].lineData[270] = 0;
  _$jscoverage['/utils.js'].lineData[271] = 0;
  _$jscoverage['/utils.js'].lineData[272] = 0;
  _$jscoverage['/utils.js'].lineData[273] = 0;
  _$jscoverage['/utils.js'].lineData[274] = 0;
  _$jscoverage['/utils.js'].lineData[276] = 0;
  _$jscoverage['/utils.js'].lineData[278] = 0;
  _$jscoverage['/utils.js'].lineData[279] = 0;
  _$jscoverage['/utils.js'].lineData[281] = 0;
  _$jscoverage['/utils.js'].lineData[284] = 0;
  _$jscoverage['/utils.js'].lineData[288] = 0;
  _$jscoverage['/utils.js'].lineData[296] = 0;
  _$jscoverage['/utils.js'].lineData[298] = 0;
  _$jscoverage['/utils.js'].lineData[299] = 0;
  _$jscoverage['/utils.js'].lineData[308] = 0;
  _$jscoverage['/utils.js'].lineData[311] = 0;
  _$jscoverage['/utils.js'].lineData[313] = 0;
  _$jscoverage['/utils.js'].lineData[314] = 0;
  _$jscoverage['/utils.js'].lineData[316] = 0;
  _$jscoverage['/utils.js'].lineData[317] = 0;
  _$jscoverage['/utils.js'].lineData[319] = 0;
  _$jscoverage['/utils.js'].lineData[321] = 0;
  _$jscoverage['/utils.js'].lineData[322] = 0;
  _$jscoverage['/utils.js'].lineData[331] = 0;
  _$jscoverage['/utils.js'].lineData[334] = 0;
  _$jscoverage['/utils.js'].lineData[340] = 0;
  _$jscoverage['/utils.js'].lineData[341] = 0;
  _$jscoverage['/utils.js'].lineData[348] = 0;
  _$jscoverage['/utils.js'].lineData[350] = 0;
  _$jscoverage['/utils.js'].lineData[354] = 0;
  _$jscoverage['/utils.js'].lineData[357] = 0;
  _$jscoverage['/utils.js'].lineData[366] = 0;
  _$jscoverage['/utils.js'].lineData[367] = 0;
  _$jscoverage['/utils.js'].lineData[369] = 0;
  _$jscoverage['/utils.js'].lineData[383] = 0;
  _$jscoverage['/utils.js'].lineData[387] = 0;
  _$jscoverage['/utils.js'].lineData[388] = 0;
  _$jscoverage['/utils.js'].lineData[389] = 0;
  _$jscoverage['/utils.js'].lineData[390] = 0;
  _$jscoverage['/utils.js'].lineData[392] = 0;
  _$jscoverage['/utils.js'].lineData[402] = 0;
  _$jscoverage['/utils.js'].lineData[404] = 0;
  _$jscoverage['/utils.js'].lineData[406] = 0;
  _$jscoverage['/utils.js'].lineData[409] = 0;
  _$jscoverage['/utils.js'].lineData[410] = 0;
  _$jscoverage['/utils.js'].lineData[415] = 0;
  _$jscoverage['/utils.js'].lineData[416] = 0;
  _$jscoverage['/utils.js'].lineData[418] = 0;
  _$jscoverage['/utils.js'].lineData[428] = 0;
  _$jscoverage['/utils.js'].lineData[430] = 0;
  _$jscoverage['/utils.js'].lineData[433] = 0;
  _$jscoverage['/utils.js'].lineData[434] = 0;
  _$jscoverage['/utils.js'].lineData[435] = 0;
  _$jscoverage['/utils.js'].lineData[439] = 0;
  _$jscoverage['/utils.js'].lineData[441] = 0;
  _$jscoverage['/utils.js'].lineData[445] = 0;
  _$jscoverage['/utils.js'].lineData[451] = 0;
  _$jscoverage['/utils.js'].lineData[460] = 0;
  _$jscoverage['/utils.js'].lineData[462] = 0;
  _$jscoverage['/utils.js'].lineData[463] = 0;
  _$jscoverage['/utils.js'].lineData[466] = 0;
  _$jscoverage['/utils.js'].lineData[470] = 0;
  _$jscoverage['/utils.js'].lineData[476] = 0;
  _$jscoverage['/utils.js'].lineData[477] = 0;
  _$jscoverage['/utils.js'].lineData[479] = 0;
  _$jscoverage['/utils.js'].lineData[483] = 0;
  _$jscoverage['/utils.js'].lineData[486] = 0;
  _$jscoverage['/utils.js'].lineData[487] = 0;
  _$jscoverage['/utils.js'].lineData[489] = 0;
  _$jscoverage['/utils.js'].lineData[490] = 0;
  _$jscoverage['/utils.js'].lineData[492] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
  _$jscoverage['/utils.js'].functionData[4] = 0;
  _$jscoverage['/utils.js'].functionData[5] = 0;
  _$jscoverage['/utils.js'].functionData[6] = 0;
  _$jscoverage['/utils.js'].functionData[7] = 0;
  _$jscoverage['/utils.js'].functionData[8] = 0;
  _$jscoverage['/utils.js'].functionData[9] = 0;
  _$jscoverage['/utils.js'].functionData[10] = 0;
  _$jscoverage['/utils.js'].functionData[11] = 0;
  _$jscoverage['/utils.js'].functionData[12] = 0;
  _$jscoverage['/utils.js'].functionData[13] = 0;
  _$jscoverage['/utils.js'].functionData[14] = 0;
  _$jscoverage['/utils.js'].functionData[15] = 0;
  _$jscoverage['/utils.js'].functionData[16] = 0;
  _$jscoverage['/utils.js'].functionData[17] = 0;
  _$jscoverage['/utils.js'].functionData[18] = 0;
  _$jscoverage['/utils.js'].functionData[19] = 0;
  _$jscoverage['/utils.js'].functionData[20] = 0;
  _$jscoverage['/utils.js'].functionData[21] = 0;
  _$jscoverage['/utils.js'].functionData[22] = 0;
  _$jscoverage['/utils.js'].functionData[23] = 0;
  _$jscoverage['/utils.js'].functionData[24] = 0;
  _$jscoverage['/utils.js'].functionData[25] = 0;
  _$jscoverage['/utils.js'].functionData[26] = 0;
  _$jscoverage['/utils.js'].functionData[27] = 0;
  _$jscoverage['/utils.js'].functionData[28] = 0;
  _$jscoverage['/utils.js'].functionData[29] = 0;
  _$jscoverage['/utils.js'].functionData[30] = 0;
  _$jscoverage['/utils.js'].functionData[31] = 0;
  _$jscoverage['/utils.js'].functionData[32] = 0;
  _$jscoverage['/utils.js'].functionData[33] = 0;
  _$jscoverage['/utils.js'].functionData[34] = 0;
  _$jscoverage['/utils.js'].functionData[35] = 0;
  _$jscoverage['/utils.js'].functionData[36] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['26'] = [];
  _$jscoverage['/utils.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['32'] = [];
  _$jscoverage['/utils.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['41'] = [];
  _$jscoverage['/utils.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['44'] = [];
  _$jscoverage['/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['52'] = [];
  _$jscoverage['/utils.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['56'] = [];
  _$jscoverage['/utils.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['68'] = [];
  _$jscoverage['/utils.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['74'] = [];
  _$jscoverage['/utils.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['75'] = [];
  _$jscoverage['/utils.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['82'] = [];
  _$jscoverage['/utils.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['85'] = [];
  _$jscoverage['/utils.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['85'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['94'] = [];
  _$jscoverage['/utils.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['96'] = [];
  _$jscoverage['/utils.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['97'] = [];
  _$jscoverage['/utils.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['104'] = [];
  _$jscoverage['/utils.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['105'] = [];
  _$jscoverage['/utils.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['120'] = [];
  _$jscoverage['/utils.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['121'] = [];
  _$jscoverage['/utils.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['138'] = [];
  _$jscoverage['/utils.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['143'] = [];
  _$jscoverage['/utils.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['152'] = [];
  _$jscoverage['/utils.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['152'][3] = new BranchData();
  _$jscoverage['/utils.js'].branchData['155'] = [];
  _$jscoverage['/utils.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['167'] = [];
  _$jscoverage['/utils.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['173'] = [];
  _$jscoverage['/utils.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['175'] = [];
  _$jscoverage['/utils.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['176'] = [];
  _$jscoverage['/utils.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['188'] = [];
  _$jscoverage['/utils.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['198'] = [];
  _$jscoverage['/utils.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['208'] = [];
  _$jscoverage['/utils.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['214'] = [];
  _$jscoverage['/utils.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['244'] = [];
  _$jscoverage['/utils.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['270'] = [];
  _$jscoverage['/utils.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['273'] = [];
  _$jscoverage['/utils.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['276'] = [];
  _$jscoverage['/utils.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['278'] = [];
  _$jscoverage['/utils.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['298'] = [];
  _$jscoverage['/utils.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['313'] = [];
  _$jscoverage['/utils.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['317'] = [];
  _$jscoverage['/utils.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['334'] = [];
  _$jscoverage['/utils.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['344'] = [];
  _$jscoverage['/utils.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['348'] = [];
  _$jscoverage['/utils.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['366'] = [];
  _$jscoverage['/utils.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['388'] = [];
  _$jscoverage['/utils.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['404'] = [];
  _$jscoverage['/utils.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['406'] = [];
  _$jscoverage['/utils.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['409'] = [];
  _$jscoverage['/utils.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['415'] = [];
  _$jscoverage['/utils.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['433'] = [];
  _$jscoverage['/utils.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['433'][2] = new BranchData();
  _$jscoverage['/utils.js'].branchData['462'] = [];
  _$jscoverage['/utils.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['489'] = [];
  _$jscoverage['/utils.js'].branchData['489'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['489'][1].init(56, 46, '!(m = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/))');
function visit290_489_1(result) {
  _$jscoverage['/utils.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['462'][1].init(85, 8, '--i > -1');
function visit289_462_1(result) {
  _$jscoverage['/utils.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['433'][2].init(162, 28, 'module.factory !== undefined');
function visit288_433_2(result) {
  _$jscoverage['/utils.js'].branchData['433'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['433'][1].init(152, 38, 'module && module.factory !== undefined');
function visit287_433_1(result) {
  _$jscoverage['/utils.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['415'][1].init(544, 10, 'refModName');
function visit286_415_1(result) {
  _$jscoverage['/utils.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['409'][1].init(143, 11, 'modNames[i]');
function visit285_409_1(result) {
  _$jscoverage['/utils.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['406'][1].init(84, 5, 'i < l');
function visit284_406_1(result) {
  _$jscoverage['/utils.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['404'][1].init(68, 8, 'modNames');
function visit283_404_1(result) {
  _$jscoverage['/utils.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['388'][1].init(57, 19, 'i < modNames.length');
function visit282_388_1(result) {
  _$jscoverage['/utils.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['366'][1].init(18, 28, 'typeof modNames === \'string\'');
function visit281_366_1(result) {
  _$jscoverage['/utils.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['348'][1].init(703, 21, 'exports !== undefined');
function visit280_348_1(result) {
  _$jscoverage['/utils.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['344'][1].init(28, 27, 'requires && requires.length');
function visit279_344_1(result) {
  _$jscoverage['/utils.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['334'][1].init(89, 29, 'typeof factory === \'function\'');
function visit278_334_1(result) {
  _$jscoverage['/utils.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['317'][1].init(308, 5, 'm.cjs');
function visit277_317_1(result) {
  _$jscoverage['/utils.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['313'][1].init(193, 19, 'status >= ATTACHING');
function visit276_313_1(result) {
  _$jscoverage['/utils.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['298'][1].init(84, 5, 'i < l');
function visit275_298_1(result) {
  _$jscoverage['/utils.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['278'][1].init(403, 5, 'allOk');
function visit274_278_1(result) {
  _$jscoverage['/utils.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['276'][2].init(164, 21, 'm.status >= ATTACHING');
function visit273_276_2(result) {
  _$jscoverage['/utils.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['276'][1].init(159, 26, 'm && m.status >= ATTACHING');
function visit272_276_1(result) {
  _$jscoverage['/utils.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['273'][2].init(142, 18, 'i < unalias.length');
function visit271_273_2(result) {
  _$jscoverage['/utils.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['273'][1].init(133, 27, 'allOk && i < unalias.length');
function visit270_273_1(result) {
  _$jscoverage['/utils.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['270'][2].init(80, 26, 'module.getType() !== \'css\'');
function visit269_270_2(result) {
  _$jscoverage['/utils.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['270'][1].init(70, 36, 'module && module.getType() !== \'css\'');
function visit268_270_1(result) {
  _$jscoverage['/utils.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['244'][1].init(161, 6, 'module');
function visit267_244_1(result) {
  _$jscoverage['/utils.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['214'][1].init(199, 5, 'i < l');
function visit266_214_1(result) {
  _$jscoverage['/utils.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['208'][1].init(18, 27, 'typeof depName === \'string\'');
function visit265_208_1(result) {
  _$jscoverage['/utils.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['198'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit264_198_1(result) {
  _$jscoverage['/utils.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['188'][1].init(119, 29, 'urlParts1[0] === urlParts2[0]');
function visit263_188_1(result) {
  _$jscoverage['/utils.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['176'][1].init(114, 16, 'subPart === \'..\'');
function visit262_176_1(result) {
  _$jscoverage['/utils.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['175'][1].init(66, 15, 'subPart === \'.\'');
function visit261_175_1(result) {
  _$jscoverage['/utils.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['173'][1].init(307, 5, 'i < l');
function visit260_173_1(result) {
  _$jscoverage['/utils.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['167'][1].init(66, 17, 'firstChar !== \'.\'');
function visit259_167_1(result) {
  _$jscoverage['/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['155'][1].init(588, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit258_155_1(result) {
  _$jscoverage['/utils.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['152'][3].init(84, 32, 'str.indexOf(suffix, ind) === ind');
function visit257_152_3(result) {
  _$jscoverage['/utils.js'].branchData['152'][3].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['152'][2].init(72, 8, 'ind >= 0');
function visit256_152_2(result) {
  _$jscoverage['/utils.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['152'][1].init(72, 44, 'ind >= 0 && str.indexOf(suffix, ind) === ind');
function visit255_152_1(result) {
  _$jscoverage['/utils.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['143'][1].init(22, 15, 'p !== undefined');
function visit254_143_1(result) {
  _$jscoverage['/utils.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['138'][1].init(21, 32, 'str.lastIndexOf(prefix, 0) === 0');
function visit253_138_1(result) {
  _$jscoverage['/utils.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['121'][1].init(17, 56, 'Object.prototype.toString.call(obj) === \'[object Array]\'');
function visit252_121_1(result) {
  _$jscoverage['/utils.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['120'][1].init(3186, 114, 'Array.isArray || function(obj) {\n  return Object.prototype.toString.call(obj) === \'[object Array]\';\n}');
function visit251_120_1(result) {
  _$jscoverage['/utils.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['105'][1].init(22, 44, 'fn(obj[myKeys[i]], myKeys[i], obj) === false');
function visit250_105_1(result) {
  _$jscoverage['/utils.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['104'][1].init(86, 5, 'i < l');
function visit249_104_1(result) {
  _$jscoverage['/utils.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['97'][1].init(22, 28, 'fn(obj[i], i, obj) === false');
function visit248_97_1(result) {
  _$jscoverage['/utils.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['96'][1].init(50, 5, 'i < l');
function visit247_96_1(result) {
  _$jscoverage['/utils.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['94'][1].init(58, 12, 'isArray(obj)');
function visit246_94_1(result) {
  _$jscoverage['/utils.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['85'][2].init(2274, 76, '(m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))');
function visit245_85_2(result) {
  _$jscoverage['/utils.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['85'][1].init(2274, 85, '((m = ua.match(/AppleWebKit\\/([\\d.]*)/)) || (m = ua.match(/Safari\\/([\\d.]*)/))) && m[1]');
function visit244_85_1(result) {
  _$jscoverage['/utils.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['82'][2].init(21, 20, 'host.navigator || {}');
function visit243_82_2(result) {
  _$jscoverage['/utils.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['82'][1].init(21, 37, '(host.navigator || {}).userAgent || \'\'');
function visit242_82_1(result) {
  _$jscoverage['/utils.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['75'][1].init(83, 12, 'm[1] || m[2]');
function visit241_75_1(result) {
  _$jscoverage['/utils.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['74'][1].init(34, 98, '(m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\\s|:)?([0-9.]+)/)) && (v = (m[1] || m[2]))');
function visit240_74_1(result) {
  _$jscoverage['/utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['68'][1].init(22, 9, 'c++ === 0');
function visit239_68_1(result) {
  _$jscoverage['/utils.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['56'][1].init(170, 12, 'Plugin.alias');
function visit238_56_1(result) {
  _$jscoverage['/utils.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['52'][1].init(54, 12, 'index !== -1');
function visit237_52_1(result) {
  _$jscoverage['/utils.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['44'][1].init(134, 27, 'Utils.endsWith(name, \'.js\')');
function visit236_44_1(result) {
  _$jscoverage['/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['41'][1].init(40, 36, 'name.charAt(name.length - 1) === \'/\'');
function visit235_41_1(result) {
  _$jscoverage['/utils.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['32'][1].init(103, 5, 'i < l');
function visit234_32_1(result) {
  _$jscoverage['/utils.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['26'][1].init(14, 21, 'typeof s === \'string\'');
function visit233_26_1(result) {
  _$jscoverage['/utils.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Loader = S.Loader, Env = S.Env, host = Env.host, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ATTACHING = data.ATTACHING, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/utils.js'].lineData[25]++;
  function addIndexAndRemoveJsExt(s) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[26]++;
    if (visit233_26_1(typeof s === 'string')) {
      _$jscoverage['/utils.js'].lineData[27]++;
      return addIndexAndRemoveJsExtFromName(s);
    } else {
      _$jscoverage['/utils.js'].lineData[29]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/utils.js'].lineData[32]++;
      for (; visit234_32_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[33]++;
        ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
      }
      _$jscoverage['/utils.js'].lineData[35]++;
      return ret;
    }
  }
  _$jscoverage['/utils.js'].lineData[39]++;
  function addIndexAndRemoveJsExtFromName(name) {
    _$jscoverage['/utils.js'].functionData[2]++;
    _$jscoverage['/utils.js'].lineData[41]++;
    if (visit235_41_1(name.charAt(name.length - 1) === '/')) {
      _$jscoverage['/utils.js'].lineData[42]++;
      name += 'index';
    }
    _$jscoverage['/utils.js'].lineData[44]++;
    if (visit236_44_1(Utils.endsWith(name, '.js'))) {
      _$jscoverage['/utils.js'].lineData[45]++;
      name = name.slice(0, -3);
    }
    _$jscoverage['/utils.js'].lineData[47]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[50]++;
  function pluginAlias(name) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[51]++;
    var index = name.indexOf('!');
    _$jscoverage['/utils.js'].lineData[52]++;
    if (visit237_52_1(index !== -1)) {
      _$jscoverage['/utils.js'].lineData[53]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/utils.js'].lineData[54]++;
      name = name.substring(index + 1);
      _$jscoverage['/utils.js'].lineData[55]++;
      var Plugin = S.require(pluginName);
      _$jscoverage['/utils.js'].lineData[56]++;
      if (visit238_56_1(Plugin.alias)) {
        _$jscoverage['/utils.js'].lineData[58]++;
        name = Plugin.alias(S, name, pluginName);
      }
    }
    _$jscoverage['/utils.js'].lineData[61]++;
    return name;
  }
  _$jscoverage['/utils.js'].lineData[64]++;
  function numberify(s) {
    _$jscoverage['/utils.js'].functionData[4]++;
    _$jscoverage['/utils.js'].lineData[65]++;
    var c = 0;
    _$jscoverage['/utils.js'].lineData[67]++;
    return parseFloat(s.replace(/\./g, function() {
  _$jscoverage['/utils.js'].functionData[5]++;
  _$jscoverage['/utils.js'].lineData[68]++;
  return (visit239_68_1(c++ === 0)) ? '.' : '';
}));
  }
  _$jscoverage['/utils.js'].lineData[72]++;
  function getIEVersion() {
    _$jscoverage['/utils.js'].functionData[6]++;
    _$jscoverage['/utils.js'].lineData[73]++;
    var m, v;
    _$jscoverage['/utils.js'].lineData[74]++;
    if (visit240_74_1((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) && (v = (visit241_75_1(m[1] || m[2]))))) {
      _$jscoverage['/utils.js'].lineData[76]++;
      return numberify(v);
    }
    _$jscoverage['/utils.js'].lineData[78]++;
    return undefined;
  }
  _$jscoverage['/utils.js'].lineData[81]++;
  var m, ua = visit242_82_1((visit243_82_2(host.navigator || {})).userAgent || '');
  _$jscoverage['/utils.js'].lineData[85]++;
  if (visit244_85_1((visit245_85_2((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/)))) && m[1])) {
    _$jscoverage['/utils.js'].lineData[86]++;
    Utils.webkit = numberify(m[1]);
  }
  _$jscoverage['/utils.js'].lineData[89]++;
  var urlReg = /http(s)?:\/\/([^/]+)(?::(\d+))?/;
  _$jscoverage['/utils.js'].lineData[91]++;
  function each(obj, fn) {
    _$jscoverage['/utils.js'].functionData[7]++;
    _$jscoverage['/utils.js'].lineData[92]++;
    var i = 0, myKeys, l;
    _$jscoverage['/utils.js'].lineData[94]++;
    if (visit246_94_1(isArray(obj))) {
      _$jscoverage['/utils.js'].lineData[95]++;
      l = obj.length;
      _$jscoverage['/utils.js'].lineData[96]++;
      for (; visit247_96_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[97]++;
        if (visit248_97_1(fn(obj[i], i, obj) === false)) {
          _$jscoverage['/utils.js'].lineData[98]++;
          break;
        }
      }
    } else {
      _$jscoverage['/utils.js'].lineData[102]++;
      myKeys = keys(obj);
      _$jscoverage['/utils.js'].lineData[103]++;
      l = myKeys.length;
      _$jscoverage['/utils.js'].lineData[104]++;
      for (; visit249_104_1(i < l); i++) {
        _$jscoverage['/utils.js'].lineData[105]++;
        if (visit250_105_1(fn(obj[myKeys[i]], myKeys[i], obj) === false)) {
          _$jscoverage['/utils.js'].lineData[106]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[112]++;
  function keys(obj) {
    _$jscoverage['/utils.js'].functionData[8]++;
    _$jscoverage['/utils.js'].lineData[113]++;
    var ret = [];
    _$jscoverage['/utils.js'].lineData[114]++;
    for (var key in obj) {
      _$jscoverage['/utils.js'].lineData[115]++;
      ret.push(key);
    }
    _$jscoverage['/utils.js'].lineData[117]++;
    return ret;
  }
  _$jscoverage['/utils.js'].lineData[120]++;
  var isArray = visit251_120_1(Array.isArray || function(obj) {
  _$jscoverage['/utils.js'].functionData[9]++;
  _$jscoverage['/utils.js'].lineData[121]++;
  return visit252_121_1(Object.prototype.toString.call(obj) === '[object Array]');
});
  _$jscoverage['/utils.js'].lineData[124]++;
  function mix(to, from) {
    _$jscoverage['/utils.js'].functionData[10]++;
    _$jscoverage['/utils.js'].lineData[125]++;
    for (var i in from) {
      _$jscoverage['/utils.js'].lineData[126]++;
      to[i] = from[i];
    }
    _$jscoverage['/utils.js'].lineData[128]++;
    return to;
  }
  _$jscoverage['/utils.js'].lineData[131]++;
  mix(Utils, {
  mix: mix, 
  noop: function() {
  _$jscoverage['/utils.js'].functionData[11]++;
}, 
  startsWith: function(str, prefix) {
  _$jscoverage['/utils.js'].functionData[12]++;
  _$jscoverage['/utils.js'].lineData[138]++;
  return visit253_138_1(str.lastIndexOf(prefix, 0) === 0);
}, 
  isEmptyObject: function(o) {
  _$jscoverage['/utils.js'].functionData[13]++;
  _$jscoverage['/utils.js'].lineData[142]++;
  for (var p in o) {
    _$jscoverage['/utils.js'].lineData[143]++;
    if (visit254_143_1(p !== undefined)) {
      _$jscoverage['/utils.js'].lineData[144]++;
      return false;
    }
  }
  _$jscoverage['/utils.js'].lineData[147]++;
  return true;
}, 
  endsWith: function(str, suffix) {
  _$jscoverage['/utils.js'].functionData[14]++;
  _$jscoverage['/utils.js'].lineData[151]++;
  var ind = str.length - suffix.length;
  _$jscoverage['/utils.js'].lineData[152]++;
  return visit255_152_1(visit256_152_2(ind >= 0) && visit257_152_3(str.indexOf(suffix, ind) === ind));
}, 
  now: visit258_155_1(Date.now || function() {
  _$jscoverage['/utils.js'].functionData[15]++;
  _$jscoverage['/utils.js'].lineData[156]++;
  return +new Date();
}), 
  each: each, 
  keys: keys, 
  isArray: isArray, 
  normalizePath: function(parentPath, subPath) {
  _$jscoverage['/utils.js'].functionData[16]++;
  _$jscoverage['/utils.js'].lineData[166]++;
  var firstChar = subPath.charAt(0);
  _$jscoverage['/utils.js'].lineData[167]++;
  if (visit259_167_1(firstChar !== '.')) {
    _$jscoverage['/utils.js'].lineData[168]++;
    return subPath;
  }
  _$jscoverage['/utils.js'].lineData[170]++;
  var parts = parentPath.split('/');
  _$jscoverage['/utils.js'].lineData[171]++;
  var subParts = subPath.split('/');
  _$jscoverage['/utils.js'].lineData[172]++;
  parts.pop();
  _$jscoverage['/utils.js'].lineData[173]++;
  for (var i = 0, l = subParts.length; visit260_173_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[174]++;
    var subPart = subParts[i];
    _$jscoverage['/utils.js'].lineData[175]++;
    if (visit261_175_1(subPart === '.')) {
    } else {
      _$jscoverage['/utils.js'].lineData[176]++;
      if (visit262_176_1(subPart === '..')) {
        _$jscoverage['/utils.js'].lineData[177]++;
        parts.pop();
      } else {
        _$jscoverage['/utils.js'].lineData[179]++;
        parts.push(subPart);
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[182]++;
  return parts.join('/');
}, 
  isSameOriginAs: function(url1, url2) {
  _$jscoverage['/utils.js'].functionData[17]++;
  _$jscoverage['/utils.js'].lineData[186]++;
  var urlParts1 = url1.match(urlReg);
  _$jscoverage['/utils.js'].lineData[187]++;
  var urlParts2 = url2.match(urlReg);
  _$jscoverage['/utils.js'].lineData[188]++;
  return visit263_188_1(urlParts1[0] === urlParts2[0]);
}, 
  ie: getIEVersion(), 
  docHead: function() {
  _$jscoverage['/utils.js'].functionData[18]++;
  _$jscoverage['/utils.js'].lineData[198]++;
  return visit264_198_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/utils.js'].functionData[19]++;
  _$jscoverage['/utils.js'].lineData[208]++;
  if (visit265_208_1(typeof depName === 'string')) {
    _$jscoverage['/utils.js'].lineData[209]++;
    return Utils.normalizePath(moduleName, depName);
  }
  _$jscoverage['/utils.js'].lineData[212]++;
  var i = 0, l;
  _$jscoverage['/utils.js'].lineData[214]++;
  for (l = depName.length; visit266_214_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[215]++;
    depName[i] = Utils.normalizePath(moduleName, depName[i]);
  }
  _$jscoverage['/utils.js'].lineData[217]++;
  return depName;
}, 
  createModulesInfo: function(modNames) {
  _$jscoverage['/utils.js'].functionData[20]++;
  _$jscoverage['/utils.js'].lineData[225]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[226]++;
  Utils.each(modNames, function(m, i) {
  _$jscoverage['/utils.js'].functionData[21]++;
  _$jscoverage['/utils.js'].lineData[227]++;
  ret[i] = Utils.createModuleInfo(m);
});
  _$jscoverage['/utils.js'].lineData[229]++;
  return ret;
}, 
  createModuleInfo: function(modName, cfg) {
  _$jscoverage['/utils.js'].functionData[22]++;
  _$jscoverage['/utils.js'].lineData[239]++;
  modName = addIndexAndRemoveJsExtFromName(modName);
  _$jscoverage['/utils.js'].lineData[241]++;
  var mods = Env.mods, module = mods[modName];
  _$jscoverage['/utils.js'].lineData[244]++;
  if (visit267_244_1(module)) {
    _$jscoverage['/utils.js'].lineData[245]++;
    return module;
  }
  _$jscoverage['/utils.js'].lineData[249]++;
  mods[modName] = module = new Loader.Module(mix({
  name: modName}, cfg));
  _$jscoverage['/utils.js'].lineData[253]++;
  return module;
}, 
  getModules: function(modNames) {
  _$jscoverage['/utils.js'].functionData[23]++;
  _$jscoverage['/utils.js'].lineData[262]++;
  var mods = [S], module, unalias, allOk, m, runtimeMods = Env.mods;
  _$jscoverage['/utils.js'].lineData[268]++;
  Utils.each(modNames, function(modName) {
  _$jscoverage['/utils.js'].functionData[24]++;
  _$jscoverage['/utils.js'].lineData[269]++;
  module = runtimeMods[modName];
  _$jscoverage['/utils.js'].lineData[270]++;
  if (visit268_270_1(module && visit269_270_2(module.getType() !== 'css'))) {
    _$jscoverage['/utils.js'].lineData[271]++;
    unalias = module.getNormalizedAlias();
    _$jscoverage['/utils.js'].lineData[272]++;
    allOk = true;
    _$jscoverage['/utils.js'].lineData[273]++;
    for (var i = 0; visit270_273_1(allOk && visit271_273_2(i < unalias.length)); i++) {
      _$jscoverage['/utils.js'].lineData[274]++;
      m = runtimeMods[unalias[i]];
      _$jscoverage['/utils.js'].lineData[276]++;
      allOk = visit272_276_1(m && visit273_276_2(m.status >= ATTACHING));
    }
    _$jscoverage['/utils.js'].lineData[278]++;
    if (visit274_278_1(allOk)) {
      _$jscoverage['/utils.js'].lineData[279]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/utils.js'].lineData[281]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/utils.js'].lineData[284]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/utils.js'].lineData[288]++;
  return mods;
}, 
  attachModsRecursively: function(modNames) {
  _$jscoverage['/utils.js'].functionData[25]++;
  _$jscoverage['/utils.js'].lineData[296]++;
  var i, l = modNames.length;
  _$jscoverage['/utils.js'].lineData[298]++;
  for (i = 0; visit275_298_1(i < l); i++) {
    _$jscoverage['/utils.js'].lineData[299]++;
    Utils.attachModRecursively(modNames[i]);
  }
}, 
  attachModRecursively: function(modName) {
  _$jscoverage['/utils.js'].functionData[26]++;
  _$jscoverage['/utils.js'].lineData[308]++;
  var mods = Env.mods, status, m = mods[modName];
  _$jscoverage['/utils.js'].lineData[311]++;
  status = m.status;
  _$jscoverage['/utils.js'].lineData[313]++;
  if (visit276_313_1(status >= ATTACHING)) {
    _$jscoverage['/utils.js'].lineData[314]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[316]++;
  m.status = ATTACHING;
  _$jscoverage['/utils.js'].lineData[317]++;
  if (visit277_317_1(m.cjs)) {
    _$jscoverage['/utils.js'].lineData[319]++;
    Utils.attachMod(m);
  } else {
    _$jscoverage['/utils.js'].lineData[321]++;
    Utils.attachModsRecursively(m.getNormalizedRequires());
    _$jscoverage['/utils.js'].lineData[322]++;
    Utils.attachMod(m);
  }
}, 
  attachMod: function(module) {
  _$jscoverage['/utils.js'].functionData[27]++;
  _$jscoverage['/utils.js'].lineData[331]++;
  var factory = module.factory, exports;
  _$jscoverage['/utils.js'].lineData[334]++;
  if (visit278_334_1(typeof factory === 'function')) {
    _$jscoverage['/utils.js'].lineData[340]++;
    var requires = module.requires;
    _$jscoverage['/utils.js'].lineData[341]++;
    exports = factory.apply(module, (module.cjs ? [S, visit279_344_1(requires && requires.length) ? module.require : undefined, module.exports, module] : Utils.getModules(module.getRequiresWithAlias())));
    _$jscoverage['/utils.js'].lineData[348]++;
    if (visit280_348_1(exports !== undefined)) {
      _$jscoverage['/utils.js'].lineData[350]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/utils.js'].lineData[354]++;
    module.exports = factory;
  }
  _$jscoverage['/utils.js'].lineData[357]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/utils.js'].functionData[28]++;
  _$jscoverage['/utils.js'].lineData[366]++;
  if (visit281_366_1(typeof modNames === 'string')) {
    _$jscoverage['/utils.js'].lineData[367]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/utils.js'].lineData[369]++;
  return modNames;
}, 
  normalizeModNames: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[29]++;
  _$jscoverage['/utils.js'].lineData[383]++;
  return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
}, 
  unalias: function(modNames) {
  _$jscoverage['/utils.js'].functionData[30]++;
  _$jscoverage['/utils.js'].lineData[387]++;
  var ret = [];
  _$jscoverage['/utils.js'].lineData[388]++;
  for (var i = 0; visit282_388_1(i < modNames.length); i++) {
    _$jscoverage['/utils.js'].lineData[389]++;
    var mod = Utils.createModuleInfo(modNames[i]);
    _$jscoverage['/utils.js'].lineData[390]++;
    ret.push.apply(ret, mod.getNormalizedAlias());
  }
  _$jscoverage['/utils.js'].lineData[392]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(modNames, refModName) {
  _$jscoverage['/utils.js'].functionData[31]++;
  _$jscoverage['/utils.js'].lineData[402]++;
  var ret = [], i, l;
  _$jscoverage['/utils.js'].lineData[404]++;
  if (visit283_404_1(modNames)) {
    _$jscoverage['/utils.js'].lineData[406]++;
    for (i = 0 , l = modNames.length; visit284_406_1(i < l); i++) {
      _$jscoverage['/utils.js'].lineData[409]++;
      if (visit285_409_1(modNames[i])) {
        _$jscoverage['/utils.js'].lineData[410]++;
        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
      }
    }
  }
  _$jscoverage['/utils.js'].lineData[415]++;
  if (visit286_415_1(refModName)) {
    _$jscoverage['/utils.js'].lineData[416]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/utils.js'].lineData[418]++;
  return ret;
}, 
  registerModule: function(name, factory, config) {
  _$jscoverage['/utils.js'].functionData[32]++;
  _$jscoverage['/utils.js'].lineData[428]++;
  name = addIndexAndRemoveJsExtFromName(name);
  _$jscoverage['/utils.js'].lineData[430]++;
  var mods = Env.mods, module = mods[name];
  _$jscoverage['/utils.js'].lineData[433]++;
  if (visit287_433_1(module && visit288_433_2(module.factory !== undefined))) {
    _$jscoverage['/utils.js'].lineData[434]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/utils.js'].lineData[435]++;
    return;
  }
  _$jscoverage['/utils.js'].lineData[439]++;
  Utils.createModuleInfo(name);
  _$jscoverage['/utils.js'].lineData[441]++;
  module = mods[name];
  _$jscoverage['/utils.js'].lineData[445]++;
  mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/utils.js'].lineData[451]++;
  mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/utils.js'].functionData[33]++;
  _$jscoverage['/utils.js'].lineData[460]++;
  var hash = 5381, i;
  _$jscoverage['/utils.js'].lineData[462]++;
  for (i = str.length; visit289_462_1(--i > -1); ) {
    _$jscoverage['/utils.js'].lineData[463]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/utils.js'].lineData[466]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn) {
  _$jscoverage['/utils.js'].functionData[34]++;
  _$jscoverage['/utils.js'].lineData[470]++;
  var requires = [];
  _$jscoverage['/utils.js'].lineData[476]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp, function(match, dep) {
  _$jscoverage['/utils.js'].functionData[35]++;
  _$jscoverage['/utils.js'].lineData[477]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/utils.js'].lineData[479]++;
  return requires;
}});
  _$jscoverage['/utils.js'].lineData[483]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;
  _$jscoverage['/utils.js'].lineData[486]++;
  function getRequireVal(str) {
    _$jscoverage['/utils.js'].functionData[36]++;
    _$jscoverage['/utils.js'].lineData[487]++;
    var m;
    _$jscoverage['/utils.js'].lineData[489]++;
    if (visit290_489_1(!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/)))) {
      _$jscoverage['/utils.js'].lineData[490]++;
      S.error('can not find required mod in require call: ' + str);
    }
    _$jscoverage['/utils.js'].lineData[492]++;
    return m[1];
  }
})(KISSY);
