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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[8] = 0;
  _$jscoverage['/promise.js'].lineData[9] = 0;
  _$jscoverage['/promise.js'].lineData[13] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[25] = 0;
  _$jscoverage['/promise.js'].lineData[27] = 0;
  _$jscoverage['/promise.js'].lineData[29] = 0;
  _$jscoverage['/promise.js'].lineData[31] = 0;
  _$jscoverage['/promise.js'].lineData[34] = 0;
  _$jscoverage['/promise.js'].lineData[35] = 0;
  _$jscoverage['/promise.js'].lineData[40] = 0;
  _$jscoverage['/promise.js'].lineData[41] = 0;
  _$jscoverage['/promise.js'].lineData[42] = 0;
  _$jscoverage['/promise.js'].lineData[44] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[51] = 0;
  _$jscoverage['/promise.js'].lineData[61] = 0;
  _$jscoverage['/promise.js'].lineData[62] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[64] = 0;
  _$jscoverage['/promise.js'].lineData[72] = 0;
  _$jscoverage['/promise.js'].lineData[73] = 0;
  _$jscoverage['/promise.js'].lineData[76] = 0;
  _$jscoverage['/promise.js'].lineData[85] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[88] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[107] = 0;
  _$jscoverage['/promise.js'].lineData[114] = 0;
  _$jscoverage['/promise.js'].lineData[115] = 0;
  _$jscoverage['/promise.js'].lineData[120] = 0;
  _$jscoverage['/promise.js'].lineData[121] = 0;
  _$jscoverage['/promise.js'].lineData[124] = 0;
  _$jscoverage['/promise.js'].lineData[125] = 0;
  _$jscoverage['/promise.js'].lineData[126] = 0;
  _$jscoverage['/promise.js'].lineData[137] = 0;
  _$jscoverage['/promise.js'].lineData[138] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[140] = 0;
  _$jscoverage['/promise.js'].lineData[141] = 0;
  _$jscoverage['/promise.js'].lineData[142] = 0;
  _$jscoverage['/promise.js'].lineData[143] = 0;
  _$jscoverage['/promise.js'].lineData[144] = 0;
  _$jscoverage['/promise.js'].lineData[146] = 0;
  _$jscoverage['/promise.js'].lineData[147] = 0;
  _$jscoverage['/promise.js'].lineData[152] = 0;
  _$jscoverage['/promise.js'].lineData[165] = 0;
  _$jscoverage['/promise.js'].lineData[166] = 0;
  _$jscoverage['/promise.js'].lineData[168] = 0;
  _$jscoverage['/promise.js'].lineData[175] = 0;
  _$jscoverage['/promise.js'].lineData[177] = 0;
  _$jscoverage['/promise.js'].lineData[178] = 0;
  _$jscoverage['/promise.js'].lineData[180] = 0;
  _$jscoverage['/promise.js'].lineData[181] = 0;
  _$jscoverage['/promise.js'].lineData[183] = 0;
  _$jscoverage['/promise.js'].lineData[184] = 0;
  _$jscoverage['/promise.js'].lineData[192] = 0;
  _$jscoverage['/promise.js'].lineData[201] = 0;
  _$jscoverage['/promise.js'].lineData[202] = 0;
  _$jscoverage['/promise.js'].lineData[204] = 0;
  _$jscoverage['/promise.js'].lineData[220] = 0;
  _$jscoverage['/promise.js'].lineData[222] = 0;
  _$jscoverage['/promise.js'].lineData[223] = 0;
  _$jscoverage['/promise.js'].lineData[224] = 0;
  _$jscoverage['/promise.js'].lineData[230] = 0;
  _$jscoverage['/promise.js'].lineData[240] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[255] = 0;
  _$jscoverage['/promise.js'].lineData[264] = 0;
  _$jscoverage['/promise.js'].lineData[265] = 0;
  _$jscoverage['/promise.js'].lineData[266] = 0;
  _$jscoverage['/promise.js'].lineData[268] = 0;
  _$jscoverage['/promise.js'].lineData[269] = 0;
  _$jscoverage['/promise.js'].lineData[270] = 0;
  _$jscoverage['/promise.js'].lineData[271] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[278] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[282] = 0;
  _$jscoverage['/promise.js'].lineData[286] = 0;
  _$jscoverage['/promise.js'].lineData[287] = 0;
  _$jscoverage['/promise.js'].lineData[288] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[302] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[310] = 0;
  _$jscoverage['/promise.js'].lineData[314] = 0;
  _$jscoverage['/promise.js'].lineData[315] = 0;
  _$jscoverage['/promise.js'].lineData[316] = 0;
  _$jscoverage['/promise.js'].lineData[317] = 0;
  _$jscoverage['/promise.js'].lineData[319] = 0;
  _$jscoverage['/promise.js'].lineData[320] = 0;
  _$jscoverage['/promise.js'].lineData[321] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[324] = 0;
  _$jscoverage['/promise.js'].lineData[327] = 0;
  _$jscoverage['/promise.js'].lineData[328] = 0;
  _$jscoverage['/promise.js'].lineData[329] = 0;
  _$jscoverage['/promise.js'].lineData[330] = 0;
  _$jscoverage['/promise.js'].lineData[331] = 0;
  _$jscoverage['/promise.js'].lineData[333] = 0;
  _$jscoverage['/promise.js'].lineData[335] = 0;
  _$jscoverage['/promise.js'].lineData[338] = 0;
  _$jscoverage['/promise.js'].lineData[343] = 0;
  _$jscoverage['/promise.js'].lineData[346] = 0;
  _$jscoverage['/promise.js'].lineData[348] = 0;
  _$jscoverage['/promise.js'].lineData[363] = 0;
  _$jscoverage['/promise.js'].lineData[366] = 0;
  _$jscoverage['/promise.js'].lineData[369] = 0;
  _$jscoverage['/promise.js'].lineData[370] = 0;
  _$jscoverage['/promise.js'].lineData[371] = 0;
  _$jscoverage['/promise.js'].lineData[373] = 0;
  _$jscoverage['/promise.js'].lineData[411] = 0;
  _$jscoverage['/promise.js'].lineData[412] = 0;
  _$jscoverage['/promise.js'].lineData[414] = 0;
  _$jscoverage['/promise.js'].lineData[421] = 0;
  _$jscoverage['/promise.js'].lineData[430] = 0;
  _$jscoverage['/promise.js'].lineData[473] = 0;
  _$jscoverage['/promise.js'].lineData[474] = 0;
  _$jscoverage['/promise.js'].lineData[475] = 0;
  _$jscoverage['/promise.js'].lineData[477] = 0;
  _$jscoverage['/promise.js'].lineData[478] = 0;
  _$jscoverage['/promise.js'].lineData[480] = 0;
  _$jscoverage['/promise.js'].lineData[481] = 0;
  _$jscoverage['/promise.js'].lineData[482] = 0;
  _$jscoverage['/promise.js'].lineData[483] = 0;
  _$jscoverage['/promise.js'].lineData[486] = 0;
  _$jscoverage['/promise.js'].lineData[491] = 0;
  _$jscoverage['/promise.js'].lineData[495] = 0;
  _$jscoverage['/promise.js'].lineData[503] = 0;
  _$jscoverage['/promise.js'].lineData[504] = 0;
  _$jscoverage['/promise.js'].lineData[506] = 0;
  _$jscoverage['/promise.js'].lineData[507] = 0;
  _$jscoverage['/promise.js'].lineData[509] = 0;
  _$jscoverage['/promise.js'].lineData[510] = 0;
  _$jscoverage['/promise.js'].lineData[512] = 0;
  _$jscoverage['/promise.js'].lineData[514] = 0;
  _$jscoverage['/promise.js'].lineData[515] = 0;
  _$jscoverage['/promise.js'].lineData[517] = 0;
  _$jscoverage['/promise.js'].lineData[520] = 0;
  _$jscoverage['/promise.js'].lineData[521] = 0;
  _$jscoverage['/promise.js'].lineData[524] = 0;
  _$jscoverage['/promise.js'].lineData[525] = 0;
  _$jscoverage['/promise.js'].lineData[528] = 0;
  _$jscoverage['/promise.js'].lineData[532] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
  _$jscoverage['/promise.js'].functionData[42] = 0;
  _$jscoverage['/promise.js'].functionData[43] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['15'] = [];
  _$jscoverage['/promise.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['15'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['27'] = [];
  _$jscoverage['/promise.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['34'] = [];
  _$jscoverage['/promise.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['40'] = [];
  _$jscoverage['/promise.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['42'] = [];
  _$jscoverage['/promise.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['50'] = [];
  _$jscoverage['/promise.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['63'] = [];
  _$jscoverage['/promise.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['72'] = [];
  _$jscoverage['/promise.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['87'] = [];
  _$jscoverage['/promise.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['121'] = [];
  _$jscoverage['/promise.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['139'] = [];
  _$jscoverage['/promise.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['146'] = [];
  _$jscoverage['/promise.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['165'] = [];
  _$jscoverage['/promise.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['177'] = [];
  _$jscoverage['/promise.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['180'] = [];
  _$jscoverage['/promise.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['222'] = [];
  _$jscoverage['/promise.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['227'] = [];
  _$jscoverage['/promise.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['265'] = [];
  _$jscoverage['/promise.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['295'] = [];
  _$jscoverage['/promise.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['309'] = [];
  _$jscoverage['/promise.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['315'] = [];
  _$jscoverage['/promise.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['319'] = [];
  _$jscoverage['/promise.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['327'] = [];
  _$jscoverage['/promise.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['329'] = [];
  _$jscoverage['/promise.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['348'] = [];
  _$jscoverage['/promise.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['348'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['352'] = [];
  _$jscoverage['/promise.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['356'] = [];
  _$jscoverage['/promise.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['366'] = [];
  _$jscoverage['/promise.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['411'] = [];
  _$jscoverage['/promise.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['474'] = [];
  _$jscoverage['/promise.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['478'] = [];
  _$jscoverage['/promise.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['483'] = [];
  _$jscoverage['/promise.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['514'] = [];
  _$jscoverage['/promise.js'].branchData['514'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['514'][1].init(296, 11, 'result.done');
function visit37_514_1(result) {
  _$jscoverage['/promise.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['483'][1].init(76, 13, '--count === 0');
function visit36_483_1(result) {
  _$jscoverage['/promise.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['478'][1].init(182, 19, 'i < promises.length');
function visit35_478_1(result) {
  _$jscoverage['/promise.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['474'][1].init(60, 6, '!count');
function visit34_474_1(result) {
  _$jscoverage['/promise.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['411'][1].init(18, 22, 'obj instanceof Promise');
function visit33_411_1(result) {
  _$jscoverage['/promise.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['366'][2].init(98, 61, 'obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject');
function visit32_366_2(result) {
  _$jscoverage['/promise.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['366'][1].init(90, 70, 'obj && (obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)');
function visit31_366_1(result) {
  _$jscoverage['/promise.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['356'][1].init(-1, 194, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit30_356_1(result) {
  _$jscoverage['/promise.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['352'][2].init(224, 31, 'obj[PROMISE_PENDINGS] === false');
function visit29_352_2(result) {
  _$jscoverage['/promise.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['352'][1].init(160, 389, '(obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit28_352_1(result) {
  _$jscoverage['/promise.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['348'][2].init(60, 550, '!isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit27_348_2(result) {
  _$jscoverage['/promise.js'].branchData['348'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['348'][1].init(53, 557, 'obj && !isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_348_1(result) {
  _$jscoverage['/promise.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['329'][1].init(22, 4, 'done');
function visit25_329_1(result) {
  _$jscoverage['/promise.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['327'][1].init(1457, 25, 'value instanceof Promise');
function visit24_327_1(result) {
  _$jscoverage['/promise.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['319'][1].init(143, 24, 'value instanceof Promise');
function visit23_319_1(result) {
  _$jscoverage['/promise.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['315'][1].init(18, 4, 'done');
function visit22_315_1(result) {
  _$jscoverage['/promise.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['309'][1].init(83, 12, 'e.stack || e');
function visit21_309_1(result) {
  _$jscoverage['/promise.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['295'][1].init(168, 12, 'e.stack || e');
function visit20_295_1(result) {
  _$jscoverage['/promise.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['265'][1].init(14, 24, 'reason instanceof Reject');
function visit19_265_1(result) {
  _$jscoverage['/promise.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['227'][1].init(281, 21, 'fulfilled || rejected');
function visit18_227_1(result) {
  _$jscoverage['/promise.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['222'][1].init(28, 12, 'e.stack || e');
function visit17_222_1(result) {
  _$jscoverage['/promise.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['180'][1].init(196, 10, '!listeners');
function visit16_180_1(result) {
  _$jscoverage['/promise.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['177'][1].init(111, 19, 'listeners === false');
function visit15_177_1(result) {
  _$jscoverage['/promise.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['165'][1].init(18, 16, 'progressListener');
function visit14_165_1(result) {
  _$jscoverage['/promise.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['146'][1].init(27, 12, 'e.stack || e');
function visit13_146_1(result) {
  _$jscoverage['/promise.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['139'][1].init(40, 23, 'typeof v === \'function\'');
function visit12_139_1(result) {
  _$jscoverage['/promise.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['121'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit11_121_1(result) {
  _$jscoverage['/promise.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['87'][1].init(87, 47, '(pendings = promise[PROMISE_PENDINGS]) === false');
function visit10_87_1(result) {
  _$jscoverage['/promise.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['72'][1].init(344, 24, 'promise || new Promise()');
function visit9_72_1(result) {
  _$jscoverage['/promise.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['63'][1].init(40, 24, '!(self instanceof Defer)');
function visit8_63_1(result) {
  _$jscoverage['/promise.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['50'][1].init(208, 9, 'fulfilled');
function visit7_50_1(result) {
  _$jscoverage['/promise.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['42'][1].init(398, 12, 'isPromise(v)');
function visit6_42_1(result) {
  _$jscoverage['/promise.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['40'][1].init(306, 8, 'pendings');
function visit5_40_1(result) {
  _$jscoverage['/promise.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['34'][1].init(120, 22, 'pendings === undefined');
function visit4_34_1(result) {
  _$jscoverage['/promise.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['27'][1].init(47, 25, 'promise instanceof Reject');
function visit3_27_1(result) {
  _$jscoverage['/promise.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][2].init(42, 30, 'typeof console !== \'undefined\'');
function visit2_15_2(result) {
  _$jscoverage['/promise.js'].branchData['15'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['15'][1].init(42, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_15_1(result) {
  _$jscoverage['/promise.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/promise.js'].lineData[8]++;
  var logger = S.getLogger('s/promise');
  _$jscoverage['/promise.js'].lineData[9]++;
  var PROMISE_VALUE = '__promise_value', PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[13]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[15]++;
    if (visit1_15_1(visit2_15_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[16]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[25]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[27]++;
    if (visit3_27_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[29]++;
      rejected.call(promise, promise[PROMISE_VALUE]);
    } else {
      _$jscoverage['/promise.js'].lineData[31]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[34]++;
      if (visit4_34_1(pendings === undefined)) {
        _$jscoverage['/promise.js'].lineData[35]++;
        pendings = promise[PROMISE_PENDINGS] = [];
      }
      _$jscoverage['/promise.js'].lineData[40]++;
      if (visit5_40_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[41]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[42]++;
        if (visit6_42_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[44]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[50]++;
          if (visit7_50_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[51]++;
            fulfilled.call(promise, v);
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[61]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[3]++;
    _$jscoverage['/promise.js'].lineData[62]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[63]++;
    if (visit8_63_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[64]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[72]++;
    self.promise = visit9_72_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[73]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[76]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[85]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[87]++;
  if (visit10_87_1((pendings = promise[PROMISE_PENDINGS]) === false)) {
    _$jscoverage['/promise.js'].lineData[88]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[92]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[93]++;
  pendings = pendings ? [].concat(pendings) : [];
  _$jscoverage['/promise.js'].lineData[94]++;
  promise[PROMISE_PENDINGS] = false;
  _$jscoverage['/promise.js'].lineData[95]++;
  promise[PROMISE_PROGRESS_LISTENERS] = false;
  _$jscoverage['/promise.js'].lineData[96]++;
  util.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[5]++;
  _$jscoverage['/promise.js'].lineData[97]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[99]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[107]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[114]++;
  util.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[115]++;
  listener(message);
});
}};
  _$jscoverage['/promise.js'].lineData[120]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[9]++;
    _$jscoverage['/promise.js'].lineData[121]++;
    return visit11_121_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[124]++;
  function bind(fn, context) {
    _$jscoverage['/promise.js'].functionData[10]++;
    _$jscoverage['/promise.js'].lineData[125]++;
    return function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[126]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/promise.js'].lineData[137]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[138]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[139]++;
    if (visit12_139_1(typeof v === 'function')) {
      _$jscoverage['/promise.js'].lineData[140]++;
      var defer = new Defer(self);
      _$jscoverage['/promise.js'].lineData[141]++;
      var resolve = bind(defer.resolve, defer);
      _$jscoverage['/promise.js'].lineData[142]++;
      var reject = bind(defer.reject, defer);
      _$jscoverage['/promise.js'].lineData[143]++;
      try {
        _$jscoverage['/promise.js'].lineData[144]++;
        v(resolve, reject);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[146]++;
  logError(visit13_146_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[147]++;
  reject(e);
}
    }
  }
  _$jscoverage['/promise.js'].lineData[152]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[13]++;
  _$jscoverage['/promise.js'].lineData[165]++;
  if (visit14_165_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[166]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[168]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[175]++;
  var self = this, listeners = self[PROMISE_PROGRESS_LISTENERS];
  _$jscoverage['/promise.js'].lineData[177]++;
  if (visit15_177_1(listeners === false)) {
    _$jscoverage['/promise.js'].lineData[178]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[180]++;
  if (visit16_180_1(!listeners)) {
    _$jscoverage['/promise.js'].lineData[181]++;
    listeners = self[PROMISE_PROGRESS_LISTENERS] = [];
  }
  _$jscoverage['/promise.js'].lineData[183]++;
  listeners.push(progressListener);
  _$jscoverage['/promise.js'].lineData[184]++;
  return self;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[192]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[201]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[202]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[204]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[220]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[222]++;
  S.log(visit17_222_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[223]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[224]++;
  throw e;
}, 0);
}, promiseToHandle = visit18_227_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[230]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[240]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[246]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[255]++;
  Promise.prototype['catch'] = Promise.prototype.fail;
  _$jscoverage['/promise.js'].lineData[264]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[24]++;
    _$jscoverage['/promise.js'].lineData[265]++;
    if (visit19_265_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[266]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[268]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[269]++;
    self[PROMISE_VALUE] = reason;
    _$jscoverage['/promise.js'].lineData[270]++;
    self[PROMISE_PENDINGS] = false;
    _$jscoverage['/promise.js'].lineData[271]++;
    self[PROMISE_PROGRESS_LISTENERS] = false;
    _$jscoverage['/promise.js'].lineData[275]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[278]++;
  util.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[281]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[282]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[286]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[26]++;
      _$jscoverage['/promise.js'].lineData[287]++;
      try {
        _$jscoverage['/promise.js'].lineData[288]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[295]++;
  logError(visit20_295_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[296]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[300]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[301]++;
      try {
        _$jscoverage['/promise.js'].lineData[302]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[309]++;
  logError(visit21_309_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[310]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[314]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[315]++;
      if (visit22_315_1(done)) {
        _$jscoverage['/promise.js'].lineData[316]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[317]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[319]++;
      if (visit23_319_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[320]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[321]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[323]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[324]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[327]++;
    if (visit24_327_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[328]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[29]++;
  _$jscoverage['/promise.js'].lineData[329]++;
  if (visit25_329_1(done)) {
    _$jscoverage['/promise.js'].lineData[330]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[331]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[333]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[335]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[338]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[343]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[346]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[30]++;
    _$jscoverage['/promise.js'].lineData[348]++;
    return visit26_348_1(obj && visit27_348_2(!isRejected(obj) && visit28_352_1((visit29_352_2(obj[PROMISE_PENDINGS] === false)) && (visit30_356_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[363]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[366]++;
    return visit31_366_1(obj && (visit32_366_2(obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[369]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[370]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[371]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[373]++;
  util.mix(Promise, {
  when: when, 
  cast: function(obj) {
  _$jscoverage['/promise.js'].functionData[32]++;
  _$jscoverage['/promise.js'].lineData[411]++;
  if (visit33_411_1(obj instanceof Promise)) {
    _$jscoverage['/promise.js'].lineData[412]++;
    return obj;
  }
  _$jscoverage['/promise.js'].lineData[414]++;
  return when(obj);
}, 
  resolve: function(obj) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[421]++;
  return when(obj);
}, 
  reject: function(obj) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[430]++;
  return new Reject(obj);
}, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[473]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[474]++;
  if (visit34_474_1(!count)) {
    _$jscoverage['/promise.js'].lineData[475]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[477]++;
  var defer = new Defer();
  _$jscoverage['/promise.js'].lineData[478]++;
  for (var i = 0; visit35_478_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[480]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[481]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[482]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[483]++;
  if (visit36_483_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[486]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[491]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[495]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[39]++;
  _$jscoverage['/promise.js'].lineData[503]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[40]++;
  _$jscoverage['/promise.js'].lineData[504]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[506]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[507]++;
    var result;
    _$jscoverage['/promise.js'].lineData[509]++;
    try {
      _$jscoverage['/promise.js'].lineData[510]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[512]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[514]++;
    if (visit37_514_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[515]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[517]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[520]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[42]++;
    _$jscoverage['/promise.js'].lineData[521]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[524]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[43]++;
    _$jscoverage['/promise.js'].lineData[525]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[528]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[532]++;
  return Promise;
});
