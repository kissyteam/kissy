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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[7] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[9] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[10] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[26] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[44] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[54] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[61] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[64] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[65] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[75] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[77] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[78] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[88] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[91] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[92] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[102] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[103] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[104] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[105] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[106] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[107] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[116] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[124] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[129] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[130] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[131] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[134] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[138] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[141] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[144] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[145] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[147] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[152] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[153] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[155] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[156] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[257] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[258] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[263] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[264] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[265] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[269] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[270] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[271] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[272] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[274] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[275] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[279] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[282] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[283] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[290] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[292] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[293] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[301] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[302] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[303] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[306] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[317] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[323] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[329] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[330] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[331] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[340] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[343] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[345] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[351] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[354] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[355] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[356] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[357] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[359] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[360] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[361] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[362] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[365] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[373] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[375] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[394] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[396] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[403] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[406] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[407] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[409] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[411] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[418] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[420] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[422] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[423] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[425] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[426] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[428] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[432] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[433] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[440] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[441] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[442] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[445] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[446] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[453] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[454] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[455] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[456] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[457] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[461] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[462] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[463] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[464] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[465] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[466] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[471] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[472] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[473] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[474] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[475] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[476] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[482] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[483] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[484] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[485] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[486] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[488] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[496] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[497] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[503] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[504] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[505] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[507] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[510] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[511] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[515] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[523] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[524] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[527] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[528] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[529] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[530] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[534] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[535] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[536] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[537] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[538] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[539] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[541] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[22] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[23] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[24] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['18'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['64'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['91'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['98'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['103'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['105'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['129'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['130'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['133'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['140'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['144'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['147'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['152'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['263'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['263'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['269'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['271'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['274'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['279'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['282'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['302'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['313'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['320'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['322'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['324'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['329'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['335'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['338'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['343'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['346'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['355'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['361'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['390'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['396'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['409'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['422'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['425'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['432'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['445'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['456'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['464'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['474'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['484'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['490'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['492'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['497'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['497'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['498'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['499'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['500'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['504'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['504'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['504'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['528'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['528'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['528'][1].init(13, 4, 'node');
function visit58_528_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['504'][3].init(44, 27, 'region.left >= region.right');
function visit57_504_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['504'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['504'][2].init(13, 27, 'region.top >= region.bottom');
function visit56_504_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['504'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['504'][1].init(13, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit55_504_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['500'][1].init(40, 28, 'region.bottom >= pointer.top');
function visit54_500_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][2].init(106, 25, 'region.top <= pointer.top');
function visit53_499_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][1].init(43, 69, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit52_499_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['498'][2].init(61, 28, 'region.right >= pointer.left');
function visit51_498_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['498'][1].init(42, 113, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit50_498_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['497'][2].init(16, 27, 'region.left <= pointer.left');
function visit49_497_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['497'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['497'][1].init(16, 156, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit48_497_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][1].init(175, 45, 'node.__dd_cached_height || node.outerHeight()');
function visit47_492_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['490'][1].init(66, 43, 'node.__dd_cached_width || node.outerWidth()');
function visit46_490_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['484'][1].init(49, 23, '!node.__dd_cached_width');
function visit45_484_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['474'][1].init(96, 12, 'drops.length');
function visit44_474_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['464'][1].init(96, 12, 'drops.length');
function visit43_464_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['456'][1].init(125, 23, 'doc.body.releaseCapture');
function visit42_456_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['445'][1].init(315, 19, 'doc.body.setCapture');
function visit41_445_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['432'][1].init(407, 3, 'ie6');
function visit40_432_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['425'][1].init(235, 13, 'cur == \'auto\'');
function visit39_425_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['422'][1].init(171, 2, 'ah');
function visit38_422_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['409'][1].init(63, 74, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit37_409_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['396'][1].init(691, 3, 'ie6');
function visit36_396_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['390'][1].init(471, 31, 'doc.body || doc.documentElement');
function visit35_390_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['361'][1].init(17, 21, 'oldDrop != activeDrop');
function visit34_361_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][1].init(2202, 10, 'activeDrop');
function visit33_360_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['355'][2].init(2028, 21, 'oldDrop != activeDrop');
function visit32_355_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['355'][1].init(2017, 32, 'oldDrop && oldDrop != activeDrop');
function visit31_355_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['346'][1].init(119, 13, 'a == dragArea');
function visit30_346_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['343'][1].init(1364, 16, 'mode == \'strict\'');
function visit29_343_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['338'][1].init(128, 9, 'a > vArea');
function visit28_338_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['335'][1].init(1088, 19, 'mode == \'intersect\'');
function visit27_335_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['329'][1].init(79, 9, 'a < vArea');
function visit26_329_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['324'][1].init(69, 11, '!activeDrop');
function visit25_324_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['322'][1].init(54, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit24_322_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['320'][1].init(513, 15, 'mode == \'point\'');
function visit23_320_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['313'][1].init(340, 5, '!node');
function visit22_313_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['302'][1].init(17, 20, 'drop.get(\'disabled\')');
function visit21_302_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['282'][1].init(690, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit20_282_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['279'][1].init(594, 28, '__activeToDrag || activeDrag');
function visit19_279_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['274'][1].init(102, 20, 'self.__needDropCheck');
function visit18_274_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['271'][1].init(336, 35, 'activeDrag = self.get(\'activeDrag\')');
function visit17_271_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['269'][1].init(238, 36, '__activeToDrag = self.__activeToDrag');
function visit16_269_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['263'][2].init(124, 21, 'ev.touches.length > 1');
function visit15_263_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['263'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['263'][1].init(110, 35, 'ev.touches && ev.touches.length > 1');
function visit14_263_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['152'][1].init(872, 10, 'activeDrop');
function visit13_152_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['147'][1].init(737, 11, '!activeDrag');
function visit12_147_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['144'][1].init(658, 10, 'self._shim');
function visit11_144_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['140'][1].init(529, 14, '__activeToDrag');
function visit10_140_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['133'][1].init(122, 10, 'activeDrag');
function visit9_133_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['130'][1].init(21, 14, '__activeToDrag');
function visit8_130_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['129'][1].init(207, 1, 'e');
function visit7_129_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['105'][1].init(57, 29, 'self.get(\'validDrops\').length');
function visit6_105_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['103'][1].init(498, 18, 'drag.get(\'groups\')');
function visit5_103_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['98'][1].init(332, 16, 'drag.get(\'shim\')');
function visit4_98_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['91'][1].init(133, 5, '!drag');
function visit3_91_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['64'][1].init(134, 11, 'index != -1');
function visit2_64_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['18'][1].init(180, 14, 'UA[\'ie\'] === 6');
function visit1_18_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[9]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[10]++;
  var UA = S.UA, undefined = undefined, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_18_1(UA['ie'] === 6), PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[26]++;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  _$jscoverage['/dd/ddm.js'].lineData[44]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[54]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[61]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[64]++;
  if (visit2_64_1(index != -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[65]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[75]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[77]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[78]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[88]++;
  var self = this, drops = self.get('drops'), drag = self.__activeToDrag;
  _$jscoverage['/dd/ddm.js'].lineData[91]++;
  if (visit3_91_1(!drag)) {
    _$jscoverage['/dd/ddm.js'].lineData[92]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[94]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[96]++;
  self.__activeToDrag = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98]++;
  if (visit4_98_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[99]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[102]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[103]++;
  if (visit5_103_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[104]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[105]++;
    if (visit6_105_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[106]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[107]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  _addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[116]++;
  this.get('validDrops').push(drop);
}, 
  _end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[124]++;
  var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get('activeDrag'), activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[129]++;
  if (visit7_129_1(e)) {
    _$jscoverage['/dd/ddm.js'].lineData[130]++;
    if (visit8_130_1(__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[131]++;
      __activeToDrag._move(e);
    }
    _$jscoverage['/dd/ddm.js'].lineData[133]++;
    if (visit9_133_1(activeDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[134]++;
      activeDrag._move(e);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[138]++;
  unRegisterEvent(self);
  _$jscoverage['/dd/ddm.js'].lineData[140]++;
  if (visit10_140_1(__activeToDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[141]++;
    __activeToDrag._end(e);
    _$jscoverage['/dd/ddm.js'].lineData[142]++;
    self.__activeToDrag = 0;
  }
  _$jscoverage['/dd/ddm.js'].lineData[144]++;
  if (visit11_144_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[145]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[147]++;
  if (visit12_147_1(!activeDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[148]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[150]++;
  activeDrag._end(e);
  _$jscoverage['/dd/ddm.js'].lineData[151]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[152]++;
  if (visit13_152_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[153]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[155]++;
  self.setInternal('activeDrag', null);
  _$jscoverage['/dd/ddm.js'].lineData[156]++;
  self.setInternal('activeDrop', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  clickPixelThresh: {
  value: PIXEL_THRESH}, 
  bufferTime: {
  value: BUFFER_TIME}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  value: []}, 
  validDrops: {
  value: []}}});
  _$jscoverage['/dd/ddm.js'].lineData[257]++;
  function move(ev) {
    _$jscoverage['/dd/ddm.js'].functionData[7]++;
    _$jscoverage['/dd/ddm.js'].lineData[258]++;
    var self = this, drag, __activeToDrag, activeDrag;
    _$jscoverage['/dd/ddm.js'].lineData[263]++;
    if (visit14_263_1(ev.touches && visit15_263_2(ev.touches.length > 1))) {
      _$jscoverage['/dd/ddm.js'].lineData[264]++;
      ddm._end();
      _$jscoverage['/dd/ddm.js'].lineData[265]++;
      return;
    }
    _$jscoverage['/dd/ddm.js'].lineData[269]++;
    if (visit16_269_1(__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[270]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[271]++;
      if (visit17_271_1(activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[272]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[274]++;
        if (visit18_274_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[275]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[279]++;
    drag = visit19_279_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[282]++;
    if (visit20_282_1(drag && drag.get('preventDefaultOnMove'))) {
      _$jscoverage['/dd/ddm.js'].lineData[283]++;
      ev.preventDefault();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[290]++;
  var throttleMove = UA.ie ? S.throttle(move, MOVE_DELAY) : move;
  _$jscoverage['/dd/ddm.js'].lineData[292]++;
  function notifyDropsMove(self, ev, activeDrag) {
    _$jscoverage['/dd/ddm.js'].functionData[8]++;
    _$jscoverage['/dd/ddm.js'].lineData[293]++;
    var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
    _$jscoverage['/dd/ddm.js'].lineData[301]++;
    S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[302]++;
  if (visit21_302_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[303]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[306]++;
  var a, node = drop['getNodeFromTarget'](ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[313]++;
  if (visit22_313_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[317]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[320]++;
  if (visit23_320_1(mode == 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[322]++;
    if (visit24_322_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[323]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[324]++;
      if (visit25_324_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[325]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[326]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[329]++;
        if (visit26_329_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[330]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[331]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[335]++;
    if (visit27_335_1(mode == 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[337]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[338]++;
      if (visit28_338_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[339]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[340]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[343]++;
      if (visit29_343_1(mode == 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[345]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[346]++;
        if (visit30_346_1(a == dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[347]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[348]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[351]++;
  return undefined;
});
    _$jscoverage['/dd/ddm.js'].lineData[354]++;
    oldDrop = self.get('activeDrop');
    _$jscoverage['/dd/ddm.js'].lineData[355]++;
    if (visit31_355_1(oldDrop && visit32_355_2(oldDrop != activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[356]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[357]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[359]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[360]++;
    if (visit33_360_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[361]++;
      if (visit34_361_1(oldDrop != activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[362]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[365]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[373]++;
  function activeShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[10]++;
    _$jscoverage['/dd/ddm.js'].lineData[375]++;
    self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit35_390_1(doc.body || doc.documentElement)).css('opacity', 0);
    _$jscoverage['/dd/ddm.js'].lineData[394]++;
    activeShim = showShim;
    _$jscoverage['/dd/ddm.js'].lineData[396]++;
    if (visit36_396_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[400]++;
      $win.on('resize scroll', adjustShimSize, self);
    }
    _$jscoverage['/dd/ddm.js'].lineData[403]++;
    showShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[406]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[407]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[409]++;
  if (visit37_409_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[411]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[418]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[420]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[422]++;
    if (visit38_422_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[423]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[425]++;
    if (visit39_425_1(cur == 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[426]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[428]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[432]++;
    if (visit40_432_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[433]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[440]++;
  function registerEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[441]++;
    $doc.on(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[442]++;
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[445]++;
    if (visit41_445_1(doc.body.setCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[446]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[453]++;
  function unRegisterEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[454]++;
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[455]++;
    $doc.detach(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[456]++;
    if (visit42_456_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[457]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[461]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[15]++;
    _$jscoverage['/dd/ddm.js'].lineData[462]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[463]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[464]++;
    if (visit43_464_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[465]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[16]++;
  _$jscoverage['/dd/ddm.js'].lineData[466]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[471]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[472]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[473]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[474]++;
    if (visit44_474_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[475]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[18]++;
  _$jscoverage['/dd/ddm.js'].lineData[476]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[482]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[483]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[484]++;
    if (visit45_484_1(!node.__dd_cached_width)) {
      _$jscoverage['/dd/ddm.js'].lineData[485]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[486]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[488]++;
    return {
  left: offset.left, 
  right: offset.left + (visit46_490_1(node.__dd_cached_width || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit47_492_1(node.__dd_cached_height || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[496]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[497]++;
    return visit48_497_1(visit49_497_2(region.left <= pointer.left) && visit50_498_1(visit51_498_2(region.right >= pointer.left) && visit52_499_1(visit53_499_2(region.top <= pointer.top) && visit54_500_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[503]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[504]++;
    if (visit55_504_1(visit56_504_2(region.top >= region.bottom) || visit57_504_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[505]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[507]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[510]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[511]++;
    var t = Math.max(r1['top'], r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1['bottom'], r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[515]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[523]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[524]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[527]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[24]++;
    _$jscoverage['/dd/ddm.js'].lineData[528]++;
    if (visit58_528_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[529]++;
      node.__dd_cached_width = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[530]++;
      node.__dd_cached_height = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[534]++;
  var ddm = new DDM();
  _$jscoverage['/dd/ddm.js'].lineData[535]++;
  ddm.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[536]++;
  ddm.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[537]++;
  ddm.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[538]++;
  ddm.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[539]++;
  ddm.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[541]++;
  return ddm;
});
