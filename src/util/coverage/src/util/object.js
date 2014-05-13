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
if (! _$jscoverage['/util/object.js']) {
  _$jscoverage['/util/object.js'] = {};
  _$jscoverage['/util/object.js'].lineData = [];
  _$jscoverage['/util/object.js'].lineData[6] = 0;
  _$jscoverage['/util/object.js'].lineData[7] = 0;
  _$jscoverage['/util/object.js'].lineData[8] = 0;
  _$jscoverage['/util/object.js'].lineData[9] = 0;
  _$jscoverage['/util/object.js'].lineData[11] = 0;
  _$jscoverage['/util/object.js'].lineData[12] = 0;
  _$jscoverage['/util/object.js'].lineData[22] = 0;
  _$jscoverage['/util/object.js'].lineData[33] = 0;
  _$jscoverage['/util/object.js'].lineData[41] = 0;
  _$jscoverage['/util/object.js'].lineData[43] = 0;
  _$jscoverage['/util/object.js'].lineData[45] = 0;
  _$jscoverage['/util/object.js'].lineData[46] = 0;
  _$jscoverage['/util/object.js'].lineData[50] = 0;
  _$jscoverage['/util/object.js'].lineData[51] = 0;
  _$jscoverage['/util/object.js'].lineData[52] = 0;
  _$jscoverage['/util/object.js'].lineData[53] = 0;
  _$jscoverage['/util/object.js'].lineData[54] = 0;
  _$jscoverage['/util/object.js'].lineData[59] = 0;
  _$jscoverage['/util/object.js'].lineData[70] = 0;
  _$jscoverage['/util/object.js'].lineData[71] = 0;
  _$jscoverage['/util/object.js'].lineData[79] = 0;
  _$jscoverage['/util/object.js'].lineData[81] = 0;
  _$jscoverage['/util/object.js'].lineData[82] = 0;
  _$jscoverage['/util/object.js'].lineData[83] = 0;
  _$jscoverage['/util/object.js'].lineData[84] = 0;
  _$jscoverage['/util/object.js'].lineData[86] = 0;
  _$jscoverage['/util/object.js'].lineData[87] = 0;
  _$jscoverage['/util/object.js'].lineData[91] = 0;
  _$jscoverage['/util/object.js'].lineData[93] = 0;
  _$jscoverage['/util/object.js'].lineData[94] = 0;
  _$jscoverage['/util/object.js'].lineData[99] = 0;
  _$jscoverage['/util/object.js'].lineData[111] = 0;
  _$jscoverage['/util/object.js'].lineData[119] = 0;
  _$jscoverage['/util/object.js'].lineData[120] = 0;
  _$jscoverage['/util/object.js'].lineData[121] = 0;
  _$jscoverage['/util/object.js'].lineData[124] = 0;
  _$jscoverage['/util/object.js'].lineData[135] = 0;
  _$jscoverage['/util/object.js'].lineData[136] = 0;
  _$jscoverage['/util/object.js'].lineData[137] = 0;
  _$jscoverage['/util/object.js'].lineData[138] = 0;
  _$jscoverage['/util/object.js'].lineData[139] = 0;
  _$jscoverage['/util/object.js'].lineData[140] = 0;
  _$jscoverage['/util/object.js'].lineData[141] = 0;
  _$jscoverage['/util/object.js'].lineData[144] = 0;
  _$jscoverage['/util/object.js'].lineData[147] = 0;
  _$jscoverage['/util/object.js'].lineData[172] = 0;
  _$jscoverage['/util/object.js'].lineData[173] = 0;
  _$jscoverage['/util/object.js'].lineData[177] = 0;
  _$jscoverage['/util/object.js'].lineData[178] = 0;
  _$jscoverage['/util/object.js'].lineData[181] = 0;
  _$jscoverage['/util/object.js'].lineData[182] = 0;
  _$jscoverage['/util/object.js'].lineData[183] = 0;
  _$jscoverage['/util/object.js'].lineData[184] = 0;
  _$jscoverage['/util/object.js'].lineData[188] = 0;
  _$jscoverage['/util/object.js'].lineData[189] = 0;
  _$jscoverage['/util/object.js'].lineData[192] = 0;
  _$jscoverage['/util/object.js'].lineData[195] = 0;
  _$jscoverage['/util/object.js'].lineData[196] = 0;
  _$jscoverage['/util/object.js'].lineData[197] = 0;
  _$jscoverage['/util/object.js'].lineData[199] = 0;
  _$jscoverage['/util/object.js'].lineData[212] = 0;
  _$jscoverage['/util/object.js'].lineData[213] = 0;
  _$jscoverage['/util/object.js'].lineData[216] = 0;
  _$jscoverage['/util/object.js'].lineData[217] = 0;
  _$jscoverage['/util/object.js'].lineData[219] = 0;
  _$jscoverage['/util/object.js'].lineData[232] = 0;
  _$jscoverage['/util/object.js'].lineData[240] = 0;
  _$jscoverage['/util/object.js'].lineData[242] = 0;
  _$jscoverage['/util/object.js'].lineData[243] = 0;
  _$jscoverage['/util/object.js'].lineData[244] = 0;
  _$jscoverage['/util/object.js'].lineData[245] = 0;
  _$jscoverage['/util/object.js'].lineData[247] = 0;
  _$jscoverage['/util/object.js'].lineData[248] = 0;
  _$jscoverage['/util/object.js'].lineData[249] = 0;
  _$jscoverage['/util/object.js'].lineData[252] = 0;
  _$jscoverage['/util/object.js'].lineData[253] = 0;
  _$jscoverage['/util/object.js'].lineData[254] = 0;
  _$jscoverage['/util/object.js'].lineData[255] = 0;
  _$jscoverage['/util/object.js'].lineData[257] = 0;
  _$jscoverage['/util/object.js'].lineData[260] = 0;
  _$jscoverage['/util/object.js'].lineData[275] = 0;
  _$jscoverage['/util/object.js'].lineData[276] = 0;
  _$jscoverage['/util/object.js'].lineData[277] = 0;
  _$jscoverage['/util/object.js'].lineData[279] = 0;
  _$jscoverage['/util/object.js'].lineData[280] = 0;
  _$jscoverage['/util/object.js'].lineData[282] = 0;
  _$jscoverage['/util/object.js'].lineData[283] = 0;
  _$jscoverage['/util/object.js'].lineData[287] = 0;
  _$jscoverage['/util/object.js'].lineData[292] = 0;
  _$jscoverage['/util/object.js'].lineData[295] = 0;
  _$jscoverage['/util/object.js'].lineData[296] = 0;
  _$jscoverage['/util/object.js'].lineData[297] = 0;
  _$jscoverage['/util/object.js'].lineData[300] = 0;
  _$jscoverage['/util/object.js'].lineData[301] = 0;
  _$jscoverage['/util/object.js'].lineData[305] = 0;
  _$jscoverage['/util/object.js'].lineData[306] = 0;
  _$jscoverage['/util/object.js'].lineData[309] = 0;
  _$jscoverage['/util/object.js'].lineData[326] = 0;
  _$jscoverage['/util/object.js'].lineData[330] = 0;
  _$jscoverage['/util/object.js'].lineData[331] = 0;
  _$jscoverage['/util/object.js'].lineData[332] = 0;
  _$jscoverage['/util/object.js'].lineData[333] = 0;
  _$jscoverage['/util/object.js'].lineData[334] = 0;
  _$jscoverage['/util/object.js'].lineData[337] = 0;
  _$jscoverage['/util/object.js'].lineData[354] = 0;
  _$jscoverage['/util/object.js'].lineData[356] = 0;
  _$jscoverage['/util/object.js'].lineData[358] = 0;
  _$jscoverage['/util/object.js'].lineData[359] = 0;
  _$jscoverage['/util/object.js'].lineData[360] = 0;
  _$jscoverage['/util/object.js'].lineData[361] = 0;
  _$jscoverage['/util/object.js'].lineData[363] = 0;
  _$jscoverage['/util/object.js'].lineData[367] = 0;
  _$jscoverage['/util/object.js'].lineData[368] = 0;
  _$jscoverage['/util/object.js'].lineData[372] = 0;
  _$jscoverage['/util/object.js'].lineData[375] = 0;
  _$jscoverage['/util/object.js'].lineData[376] = 0;
  _$jscoverage['/util/object.js'].lineData[377] = 0;
  _$jscoverage['/util/object.js'].lineData[378] = 0;
  _$jscoverage['/util/object.js'].lineData[380] = 0;
  _$jscoverage['/util/object.js'].lineData[381] = 0;
  _$jscoverage['/util/object.js'].lineData[383] = 0;
  _$jscoverage['/util/object.js'].lineData[384] = 0;
  _$jscoverage['/util/object.js'].lineData[387] = 0;
  _$jscoverage['/util/object.js'].lineData[388] = 0;
  _$jscoverage['/util/object.js'].lineData[389] = 0;
  _$jscoverage['/util/object.js'].lineData[393] = 0;
  _$jscoverage['/util/object.js'].lineData[394] = 0;
  _$jscoverage['/util/object.js'].lineData[395] = 0;
  _$jscoverage['/util/object.js'].lineData[397] = 0;
  _$jscoverage['/util/object.js'].lineData[400] = 0;
  _$jscoverage['/util/object.js'].lineData[403] = 0;
  _$jscoverage['/util/object.js'].lineData[406] = 0;
  _$jscoverage['/util/object.js'].lineData[407] = 0;
  _$jscoverage['/util/object.js'].lineData[408] = 0;
  _$jscoverage['/util/object.js'].lineData[409] = 0;
  _$jscoverage['/util/object.js'].lineData[410] = 0;
  _$jscoverage['/util/object.js'].lineData[412] = 0;
  _$jscoverage['/util/object.js'].lineData[416] = 0;
  _$jscoverage['/util/object.js'].lineData[419] = 0;
  _$jscoverage['/util/object.js'].lineData[420] = 0;
  _$jscoverage['/util/object.js'].lineData[423] = 0;
  _$jscoverage['/util/object.js'].lineData[427] = 0;
  _$jscoverage['/util/object.js'].lineData[428] = 0;
  _$jscoverage['/util/object.js'].lineData[431] = 0;
  _$jscoverage['/util/object.js'].lineData[433] = 0;
  _$jscoverage['/util/object.js'].lineData[434] = 0;
  _$jscoverage['/util/object.js'].lineData[436] = 0;
  _$jscoverage['/util/object.js'].lineData[438] = 0;
  _$jscoverage['/util/object.js'].lineData[439] = 0;
  _$jscoverage['/util/object.js'].lineData[442] = 0;
  _$jscoverage['/util/object.js'].lineData[443] = 0;
  _$jscoverage['/util/object.js'].lineData[444] = 0;
  _$jscoverage['/util/object.js'].lineData[448] = 0;
  _$jscoverage['/util/object.js'].lineData[451] = 0;
  _$jscoverage['/util/object.js'].lineData[452] = 0;
  _$jscoverage['/util/object.js'].lineData[454] = 0;
  _$jscoverage['/util/object.js'].lineData[455] = 0;
  _$jscoverage['/util/object.js'].lineData[460] = 0;
  _$jscoverage['/util/object.js'].lineData[461] = 0;
  _$jscoverage['/util/object.js'].lineData[466] = 0;
  _$jscoverage['/util/object.js'].lineData[467] = 0;
  _$jscoverage['/util/object.js'].lineData[473] = 0;
  _$jscoverage['/util/object.js'].lineData[475] = 0;
  _$jscoverage['/util/object.js'].lineData[476] = 0;
  _$jscoverage['/util/object.js'].lineData[478] = 0;
  _$jscoverage['/util/object.js'].lineData[479] = 0;
  _$jscoverage['/util/object.js'].lineData[480] = 0;
  _$jscoverage['/util/object.js'].lineData[481] = 0;
  _$jscoverage['/util/object.js'].lineData[483] = 0;
  _$jscoverage['/util/object.js'].lineData[484] = 0;
  _$jscoverage['/util/object.js'].lineData[485] = 0;
  _$jscoverage['/util/object.js'].lineData[491] = 0;
  _$jscoverage['/util/object.js'].lineData[493] = 0;
  _$jscoverage['/util/object.js'].lineData[503] = 0;
  _$jscoverage['/util/object.js'].lineData[504] = 0;
  _$jscoverage['/util/object.js'].lineData[505] = 0;
  _$jscoverage['/util/object.js'].lineData[507] = 0;
  _$jscoverage['/util/object.js'].lineData[508] = 0;
  _$jscoverage['/util/object.js'].lineData[510] = 0;
  _$jscoverage['/util/object.js'].lineData[512] = 0;
  _$jscoverage['/util/object.js'].lineData[518] = 0;
}
if (! _$jscoverage['/util/object.js'].functionData) {
  _$jscoverage['/util/object.js'].functionData = [];
  _$jscoverage['/util/object.js'].functionData[0] = 0;
  _$jscoverage['/util/object.js'].functionData[1] = 0;
  _$jscoverage['/util/object.js'].functionData[2] = 0;
  _$jscoverage['/util/object.js'].functionData[3] = 0;
  _$jscoverage['/util/object.js'].functionData[4] = 0;
  _$jscoverage['/util/object.js'].functionData[5] = 0;
  _$jscoverage['/util/object.js'].functionData[6] = 0;
  _$jscoverage['/util/object.js'].functionData[7] = 0;
  _$jscoverage['/util/object.js'].functionData[8] = 0;
  _$jscoverage['/util/object.js'].functionData[9] = 0;
  _$jscoverage['/util/object.js'].functionData[10] = 0;
  _$jscoverage['/util/object.js'].functionData[11] = 0;
  _$jscoverage['/util/object.js'].functionData[12] = 0;
  _$jscoverage['/util/object.js'].functionData[13] = 0;
  _$jscoverage['/util/object.js'].functionData[14] = 0;
  _$jscoverage['/util/object.js'].functionData[15] = 0;
  _$jscoverage['/util/object.js'].functionData[16] = 0;
  _$jscoverage['/util/object.js'].functionData[17] = 0;
  _$jscoverage['/util/object.js'].functionData[18] = 0;
  _$jscoverage['/util/object.js'].functionData[19] = 0;
  _$jscoverage['/util/object.js'].functionData[20] = 0;
}
if (! _$jscoverage['/util/object.js'].branchData) {
  _$jscoverage['/util/object.js'].branchData = {};
  _$jscoverage['/util/object.js'].branchData['40'] = [];
  _$jscoverage['/util/object.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['45'] = [];
  _$jscoverage['/util/object.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['50'] = [];
  _$jscoverage['/util/object.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['51'] = [];
  _$jscoverage['/util/object.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['53'] = [];
  _$jscoverage['/util/object.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['70'] = [];
  _$jscoverage['/util/object.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['75'] = [];
  _$jscoverage['/util/object.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['77'] = [];
  _$jscoverage['/util/object.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['79'] = [];
  _$jscoverage['/util/object.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['81'] = [];
  _$jscoverage['/util/object.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['83'] = [];
  _$jscoverage['/util/object.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['86'] = [];
  _$jscoverage['/util/object.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['92'] = [];
  _$jscoverage['/util/object.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['93'] = [];
  _$jscoverage['/util/object.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['110'] = [];
  _$jscoverage['/util/object.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['120'] = [];
  _$jscoverage['/util/object.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['135'] = [];
  _$jscoverage['/util/object.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['137'] = [];
  _$jscoverage['/util/object.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['139'] = [];
  _$jscoverage['/util/object.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['172'] = [];
  _$jscoverage['/util/object.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['181'] = [];
  _$jscoverage['/util/object.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['181'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['188'] = [];
  _$jscoverage['/util/object.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['216'] = [];
  _$jscoverage['/util/object.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['242'] = [];
  _$jscoverage['/util/object.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['247'] = [];
  _$jscoverage['/util/object.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['252'] = [];
  _$jscoverage['/util/object.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['275'] = [];
  _$jscoverage['/util/object.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['276'] = [];
  _$jscoverage['/util/object.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['279'] = [];
  _$jscoverage['/util/object.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['282'] = [];
  _$jscoverage['/util/object.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['300'] = [];
  _$jscoverage['/util/object.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['305'] = [];
  _$jscoverage['/util/object.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['330'] = [];
  _$jscoverage['/util/object.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['333'] = [];
  _$jscoverage['/util/object.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['334'] = [];
  _$jscoverage['/util/object.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['359'] = [];
  _$jscoverage['/util/object.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['377'] = [];
  _$jscoverage['/util/object.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['394'] = [];
  _$jscoverage['/util/object.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['408'] = [];
  _$jscoverage['/util/object.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['410'] = [];
  _$jscoverage['/util/object.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['420'] = [];
  _$jscoverage['/util/object.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['427'] = [];
  _$jscoverage['/util/object.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['427'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['431'] = [];
  _$jscoverage['/util/object.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['433'] = [];
  _$jscoverage['/util/object.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['438'] = [];
  _$jscoverage['/util/object.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['442'] = [];
  _$jscoverage['/util/object.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['442'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['442'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['443'] = [];
  _$jscoverage['/util/object.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['448'] = [];
  _$jscoverage['/util/object.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['454'] = [];
  _$jscoverage['/util/object.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['454'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['454'][3] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['466'] = [];
  _$jscoverage['/util/object.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['473'] = [];
  _$jscoverage['/util/object.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['476'] = [];
  _$jscoverage['/util/object.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['479'] = [];
  _$jscoverage['/util/object.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['503'] = [];
  _$jscoverage['/util/object.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['504'] = [];
  _$jscoverage['/util/object.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['507'] = [];
  _$jscoverage['/util/object.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['510'] = [];
  _$jscoverage['/util/object.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['510'][2] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['511'] = [];
  _$jscoverage['/util/object.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/util/object.js'].branchData['511'][2] = new BranchData();
}
_$jscoverage['/util/object.js'].branchData['511'][2].init(50, 43, 'f.call(input, input[k], k, input) !== FALSE');
function visit151_511_2(result) {
  _$jscoverage['/util/object.js'].branchData['511'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['511'][1].init(43, 51, '!f || (f.call(input, input[k], k, input) !== FALSE)');
function visit150_511_1(result) {
  _$jscoverage['/util/object.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['510'][2].init(24, 18, 'k !== CLONE_MARKER');
function visit149_510_2(result) {
  _$jscoverage['/util/object.js'].branchData['510'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['510'][1].init(24, 96, 'k !== CLONE_MARKER && (!f || (f.call(input, input[k], k, input) !== FALSE))');
function visit148_510_1(result) {
  _$jscoverage['/util/object.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['507'][1].init(2136, 13, 'isPlainObject');
function visit147_507_1(result) {
  _$jscoverage['/util/object.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['504'][1].init(30, 22, 'i < destination.length');
function visit146_504_1(result) {
  _$jscoverage['/util/object.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['503'][1].init(1953, 7, 'isArray');
function visit145_503_1(result) {
  _$jscoverage['/util/object.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['479'][1].init(93, 66, 'util.inArray(Constructor, [Boolean, String, Number, Date, RegExp])');
function visit144_479_1(result) {
  _$jscoverage['/util/object.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['476'][1].init(515, 25, 'typeof input === \'object\'');
function visit143_476_1(result) {
  _$jscoverage['/util/object.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['473'][1].init(385, 19, 'input[CLONE_MARKER]');
function visit142_473_1(result) {
  _$jscoverage['/util/object.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['466'][1].init(134, 6, '!input');
function visit141_466_1(result) {
  _$jscoverage['/util/object.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['454'][3].init(1095, 15, 'ov || !(p in r)');
function visit140_454_3(result) {
  _$jscoverage['/util/object.js'].branchData['454'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['454'][2].init(1077, 13, 'src !== undef');
function visit139_454_2(result) {
  _$jscoverage['/util/object.js'].branchData['454'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['454'][1].init(1077, 34, 'src !== undef && (ov || !(p in r))');
function visit138_454_1(result) {
  _$jscoverage['/util/object.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['448'][2].init(139, 50, 'util.isArray(target) || util.isPlainObject(target)');
function visit137_448_2(result) {
  _$jscoverage['/util/object.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['448'][1].init(128, 62, 'target && (util.isArray(target) || util.isPlainObject(target))');
function visit136_448_1(result) {
  _$jscoverage['/util/object.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['443'][1].init(22, 27, 'src[MIX_CIRCULAR_DETECTION]');
function visit135_443_1(result) {
  _$jscoverage['/util/object.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['442'][3].init(465, 44, 'util.isArray(src) || util.isPlainObject(src)');
function visit134_442_3(result) {
  _$jscoverage['/util/object.js'].branchData['442'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['442'][2].init(457, 53, 'src && (util.isArray(src) || util.isPlainObject(src))');
function visit133_442_2(result) {
  _$jscoverage['/util/object.js'].branchData['442'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['442'][1].init(449, 61, 'deep && src && (util.isArray(src) || util.isPlainObject(src))');
function visit132_442_1(result) {
  _$jscoverage['/util/object.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['438'][1].init(332, 2, 'wl');
function visit131_438_1(result) {
  _$jscoverage['/util/object.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['433'][1].init(65, 16, 'target === undef');
function visit130_433_1(result) {
  _$jscoverage['/util/object.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['431'][1].init(118, 14, 'target === src');
function visit129_431_1(result) {
  _$jscoverage['/util/object.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['427'][2].init(77, 17, '!(p in r) || deep');
function visit128_427_2(result) {
  _$jscoverage['/util/object.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['427'][1].init(71, 23, 'ov || !(p in r) || deep');
function visit127_427_1(result) {
  _$jscoverage['/util/object.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['420'][1].init(17, 19, 'k === \'constructor\'');
function visit126_420_1(result) {
  _$jscoverage['/util/object.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['410'][1].init(44, 28, 'p !== MIX_CIRCULAR_DETECTION');
function visit125_410_1(result) {
  _$jscoverage['/util/object.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['408'][1].init(315, 7, 'i < len');
function visit124_408_1(result) {
  _$jscoverage['/util/object.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['394'][1].init(14, 8, '!s || !r');
function visit123_394_1(result) {
  _$jscoverage['/util/object.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['377'][1].init(37, 12, 'objectCreate');
function visit122_377_1(result) {
  _$jscoverage['/util/object.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['359'][1].init(84, 15, 'v[CLONE_MARKER]');
function visit121_359_1(result) {
  _$jscoverage['/util/object.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['334'][1].init(36, 13, 'o[p[j]] || {}');
function visit120_334_1(result) {
  _$jscoverage['/util/object.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['333'][2].init(133, 12, 'j < p.length');
function visit119_333_2(result) {
  _$jscoverage['/util/object.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['333'][1].init(106, 16, 'host[p[0]] === o');
function visit118_333_1(result) {
  _$jscoverage['/util/object.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['330'][1].init(149, 5, 'i < l');
function visit117_330_1(result) {
  _$jscoverage['/util/object.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['305'][1].init(855, 2, 'sx');
function visit116_305_1(result) {
  _$jscoverage['/util/object.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['300'][1].init(743, 2, 'px');
function visit115_300_1(result) {
  _$jscoverage['/util/object.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['282'][1].init(224, 8, '!s || !r');
function visit114_282_1(result) {
  _$jscoverage['/util/object.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['279'][1].init(123, 2, '!s');
function visit113_279_1(result) {
  _$jscoverage['/util/object.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['276'][1].init(22, 2, '!r');
function visit112_276_1(result) {
  _$jscoverage['/util/object.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['275'][1].init(18, 9, '\'@DEBUG@\'');
function visit111_275_1(result) {
  _$jscoverage['/util/object.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['252'][1].init(534, 7, 'i < len');
function visit110_252_1(result) {
  _$jscoverage['/util/object.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['247'][1].init(417, 23, 'typeof ov !== \'boolean\'');
function visit109_247_1(result) {
  _$jscoverage['/util/object.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['242'][1].init(285, 17, '!util.isArray(wl)');
function visit108_242_1(result) {
  _$jscoverage['/util/object.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['216'][1].init(158, 5, 'i < l');
function visit107_216_1(result) {
  _$jscoverage['/util/object.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['188'][1].init(524, 12, 'ov === undef');
function visit106_188_1(result) {
  _$jscoverage['/util/object.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['181'][2].init(284, 24, 'typeof wl !== \'function\'');
function visit105_181_2(result) {
  _$jscoverage['/util/object.js'].branchData['181'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['181'][1].init(277, 32, 'wl && (typeof wl !== \'function\')');
function visit104_181_1(result) {
  _$jscoverage['/util/object.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['172'][1].init(18, 22, 'typeof ov === \'object\'');
function visit103_172_1(result) {
  _$jscoverage['/util/object.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['139'][1].init(162, 9, '!readOnly');
function visit102_139_1(result) {
  _$jscoverage['/util/object.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['137'][1].init(99, 4, 'guid');
function visit101_137_1(result) {
  _$jscoverage['/util/object.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['135'][1].init(23, 22, 'marker || STAMP_MARKER');
function visit100_135_1(result) {
  _$jscoverage['/util/object.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['120'][1].init(22, 11, 'p !== undef');
function visit99_120_1(result) {
  _$jscoverage['/util/object.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['110'][1].init(2778, 69, 'Date.now || function() {\n  return +new Date();\n}');
function visit98_110_1(result) {
  _$jscoverage['/util/object.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['93'][1].init(30, 42, 'fn.call(context, val, i, object) === false');
function visit97_93_1(result) {
  _$jscoverage['/util/object.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['92'][1].init(47, 10, 'i < length');
function visit96_92_1(result) {
  _$jscoverage['/util/object.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['86'][1].init(125, 52, 'fn.call(context, object[key], key, object) === false');
function visit95_86_1(result) {
  _$jscoverage['/util/object.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['83'][1].init(76, 15, 'i < keys.length');
function visit94_83_1(result) {
  _$jscoverage['/util/object.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['81'][1].init(402, 5, 'isObj');
function visit93_81_1(result) {
  _$jscoverage['/util/object.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['79'][1].init(362, 15, 'context || null');
function visit92_79_1(result) {
  _$jscoverage['/util/object.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['77'][3].init(267, 45, 'toString.call(object) === \'[object Function]\'');
function visit91_77_3(result) {
  _$jscoverage['/util/object.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['77'][2].init(247, 16, 'length === undef');
function visit90_77_2(result) {
  _$jscoverage['/util/object.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['77'][1].init(247, 65, 'length === undef || toString.call(object) === \'[object Function]\'');
function visit89_77_1(result) {
  _$jscoverage['/util/object.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['75'][1].init(119, 23, 'object && object.length');
function visit88_75_1(result) {
  _$jscoverage['/util/object.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['70'][1].init(18, 6, 'object');
function visit87_70_1(result) {
  _$jscoverage['/util/object.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['53'][1].init(70, 19, 'o.hasOwnProperty(p)');
function visit86_53_1(result) {
  _$jscoverage['/util/object.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['51'][1].init(54, 6, 'i >= 0');
function visit85_51_1(result) {
  _$jscoverage['/util/object.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['50'][1].init(241, 10, 'hasEnumBug');
function visit84_50_1(result) {
  _$jscoverage['/util/object.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['45'][1].init(62, 19, 'o.hasOwnProperty(p)');
function visit83_45_1(result) {
  _$jscoverage['/util/object.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].branchData['40'][1].init(179, 582, 'Object.keys || function(o) {\n  var result = [], p, i;\n  for (p in o) {\n    if (o.hasOwnProperty(p)) {\n      result.push(p);\n    }\n  }\n  if (hasEnumBug) {\n    for (i = enumProperties.length - 1; i >= 0; i--) {\n      p = enumProperties[i];\n      if (o.hasOwnProperty(p)) {\n        result.push(p);\n      }\n    }\n  }\n  return result;\n}');
function visit82_40_1(result) {
  _$jscoverage['/util/object.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/object.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/object.js'].functionData[0]++;
  _$jscoverage['/util/object.js'].lineData[7]++;
  var util = require('./base');
  _$jscoverage['/util/object.js'].lineData[8]++;
  var undef;
  _$jscoverage['/util/object.js'].lineData[9]++;
  var FALSE = false, CLONE_MARKER = '__~ks_cloned';
  _$jscoverage['/util/object.js'].lineData[11]++;
  var logger = S.getLogger('util');
  _$jscoverage['/util/object.js'].lineData[12]++;
  var MIX_CIRCULAR_DETECTION = '__MIX_CIRCULAR', STAMP_MARKER = '__~ks_stamped', host = S.Env.host, TRUE = true, EMPTY = '', toString = ({}).toString, Obj = Object, objectCreate = Obj.create;
  _$jscoverage['/util/object.js'].lineData[22]++;
  var hasEnumBug = !({
  toString: 1}.propertyIsEnumerable('toString')), enumProperties = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toString', 'toLocaleString', 'valueOf'];
  _$jscoverage['/util/object.js'].lineData[33]++;
  mix(util, {
  keys: visit82_40_1(Object.keys || function(o) {
  _$jscoverage['/util/object.js'].functionData[1]++;
  _$jscoverage['/util/object.js'].lineData[41]++;
  var result = [], p, i;
  _$jscoverage['/util/object.js'].lineData[43]++;
  for (p in o) {
    _$jscoverage['/util/object.js'].lineData[45]++;
    if (visit83_45_1(o.hasOwnProperty(p))) {
      _$jscoverage['/util/object.js'].lineData[46]++;
      result.push(p);
    }
  }
  _$jscoverage['/util/object.js'].lineData[50]++;
  if (visit84_50_1(hasEnumBug)) {
    _$jscoverage['/util/object.js'].lineData[51]++;
    for (i = enumProperties.length - 1; visit85_51_1(i >= 0); i--) {
      _$jscoverage['/util/object.js'].lineData[52]++;
      p = enumProperties[i];
      _$jscoverage['/util/object.js'].lineData[53]++;
      if (visit86_53_1(o.hasOwnProperty(p))) {
        _$jscoverage['/util/object.js'].lineData[54]++;
        result.push(p);
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[59]++;
  return result;
}), 
  each: function(object, fn, context) {
  _$jscoverage['/util/object.js'].functionData[2]++;
  _$jscoverage['/util/object.js'].lineData[70]++;
  if (visit87_70_1(object)) {
    _$jscoverage['/util/object.js'].lineData[71]++;
    var key, val, keys, i = 0, length = visit88_75_1(object && object.length), isObj = visit89_77_1(visit90_77_2(length === undef) || visit91_77_3(toString.call(object) === '[object Function]'));
    _$jscoverage['/util/object.js'].lineData[79]++;
    context = visit92_79_1(context || null);
    _$jscoverage['/util/object.js'].lineData[81]++;
    if (visit93_81_1(isObj)) {
      _$jscoverage['/util/object.js'].lineData[82]++;
      keys = util.keys(object);
      _$jscoverage['/util/object.js'].lineData[83]++;
      for (; visit94_83_1(i < keys.length); i++) {
        _$jscoverage['/util/object.js'].lineData[84]++;
        key = keys[i];
        _$jscoverage['/util/object.js'].lineData[86]++;
        if (visit95_86_1(fn.call(context, object[key], key, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[87]++;
          break;
        }
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[91]++;
      for (val = object[0]; visit96_92_1(i < length); val = object[++i]) {
        _$jscoverage['/util/object.js'].lineData[93]++;
        if (visit97_93_1(fn.call(context, val, i, object) === false)) {
          _$jscoverage['/util/object.js'].lineData[94]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[99]++;
  return object;
}, 
  now: visit98_110_1(Date.now || function() {
  _$jscoverage['/util/object.js'].functionData[3]++;
  _$jscoverage['/util/object.js'].lineData[111]++;
  return +new Date();
}), 
  isEmptyObject: function(o) {
  _$jscoverage['/util/object.js'].functionData[4]++;
  _$jscoverage['/util/object.js'].lineData[119]++;
  for (var p in o) {
    _$jscoverage['/util/object.js'].lineData[120]++;
    if (visit99_120_1(p !== undef)) {
      _$jscoverage['/util/object.js'].lineData[121]++;
      return false;
    }
  }
  _$jscoverage['/util/object.js'].lineData[124]++;
  return true;
}, 
  stamp: function(o, readOnly, marker) {
  _$jscoverage['/util/object.js'].functionData[5]++;
  _$jscoverage['/util/object.js'].lineData[135]++;
  marker = visit100_135_1(marker || STAMP_MARKER);
  _$jscoverage['/util/object.js'].lineData[136]++;
  var guid = o[marker];
  _$jscoverage['/util/object.js'].lineData[137]++;
  if (visit101_137_1(guid)) {
    _$jscoverage['/util/object.js'].lineData[138]++;
    return guid;
  } else {
    _$jscoverage['/util/object.js'].lineData[139]++;
    if (visit102_139_1(!readOnly)) {
      _$jscoverage['/util/object.js'].lineData[140]++;
      try {
        _$jscoverage['/util/object.js'].lineData[141]++;
        guid = o[marker] = util.guid(marker);
      }      catch (e) {
  _$jscoverage['/util/object.js'].lineData[144]++;
  guid = undef;
}
    }
  }
  _$jscoverage['/util/object.js'].lineData[147]++;
  return guid;
}, 
  mix: function(r, s, ov, wl, deep) {
  _$jscoverage['/util/object.js'].functionData[6]++;
  _$jscoverage['/util/object.js'].lineData[172]++;
  if (visit103_172_1(typeof ov === 'object')) {
    _$jscoverage['/util/object.js'].lineData[173]++;
    wl = ov.whitelist;
    _$jscoverage['/util/object.js'].lineData[177]++;
    deep = ov.deep;
    _$jscoverage['/util/object.js'].lineData[178]++;
    ov = ov.overwrite;
  }
  _$jscoverage['/util/object.js'].lineData[181]++;
  if (visit104_181_1(wl && (visit105_181_2(typeof wl !== 'function')))) {
    _$jscoverage['/util/object.js'].lineData[182]++;
    var originalWl = wl;
    _$jscoverage['/util/object.js'].lineData[183]++;
    wl = function(name, val) {
  _$jscoverage['/util/object.js'].functionData[7]++;
  _$jscoverage['/util/object.js'].lineData[184]++;
  return util.inArray(name, originalWl) ? val : undef;
};
  }
  _$jscoverage['/util/object.js'].lineData[188]++;
  if (visit106_188_1(ov === undef)) {
    _$jscoverage['/util/object.js'].lineData[189]++;
    ov = TRUE;
  }
  _$jscoverage['/util/object.js'].lineData[192]++;
  var cache = [], c, i = 0;
  _$jscoverage['/util/object.js'].lineData[195]++;
  mixInternal(r, s, ov, wl, deep, cache);
  _$jscoverage['/util/object.js'].lineData[196]++;
  while ((c = cache[i++])) {
    _$jscoverage['/util/object.js'].lineData[197]++;
    delete c[MIX_CIRCULAR_DETECTION];
  }
  _$jscoverage['/util/object.js'].lineData[199]++;
  return r;
}, 
  merge: function(varArgs) {
  _$jscoverage['/util/object.js'].functionData[8]++;
  _$jscoverage['/util/object.js'].lineData[212]++;
  varArgs = util.makeArray(arguments);
  _$jscoverage['/util/object.js'].lineData[213]++;
  var o = {}, i, l = varArgs.length;
  _$jscoverage['/util/object.js'].lineData[216]++;
  for (i = 0; visit107_216_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[217]++;
    util.mix(o, varArgs[i]);
  }
  _$jscoverage['/util/object.js'].lineData[219]++;
  return o;
}, 
  augment: function(r, varArgs) {
  _$jscoverage['/util/object.js'].functionData[9]++;
  _$jscoverage['/util/object.js'].lineData[232]++;
  var args = util.makeArray(arguments), len = args.length - 2, i = 1, proto, arg, ov = args[len], wl = args[len + 1];
  _$jscoverage['/util/object.js'].lineData[240]++;
  args[1] = varArgs;
  _$jscoverage['/util/object.js'].lineData[242]++;
  if (visit108_242_1(!util.isArray(wl))) {
    _$jscoverage['/util/object.js'].lineData[243]++;
    ov = wl;
    _$jscoverage['/util/object.js'].lineData[244]++;
    wl = undef;
    _$jscoverage['/util/object.js'].lineData[245]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[247]++;
  if (visit109_247_1(typeof ov !== 'boolean')) {
    _$jscoverage['/util/object.js'].lineData[248]++;
    ov = undef;
    _$jscoverage['/util/object.js'].lineData[249]++;
    len++;
  }
  _$jscoverage['/util/object.js'].lineData[252]++;
  for (; visit110_252_1(i < len); i++) {
    _$jscoverage['/util/object.js'].lineData[253]++;
    arg = args[i];
    _$jscoverage['/util/object.js'].lineData[254]++;
    if ((proto = arg.prototype)) {
      _$jscoverage['/util/object.js'].lineData[255]++;
      arg = util.mix({}, proto, true, removeConstructor);
    }
    _$jscoverage['/util/object.js'].lineData[257]++;
    util.mix(r.prototype, arg, ov, wl);
  }
  _$jscoverage['/util/object.js'].lineData[260]++;
  return r;
}, 
  extend: function(r, s, px, sx) {
  _$jscoverage['/util/object.js'].functionData[10]++;
  _$jscoverage['/util/object.js'].lineData[275]++;
  if (visit111_275_1('@DEBUG@')) {
    _$jscoverage['/util/object.js'].lineData[276]++;
    if (visit112_276_1(!r)) {
      _$jscoverage['/util/object.js'].lineData[277]++;
      logger.error('extend r is null');
    }
    _$jscoverage['/util/object.js'].lineData[279]++;
    if (visit113_279_1(!s)) {
      _$jscoverage['/util/object.js'].lineData[280]++;
      logger.error('extend s is null');
    }
    _$jscoverage['/util/object.js'].lineData[282]++;
    if (visit114_282_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[283]++;
      return r;
    }
  }
  _$jscoverage['/util/object.js'].lineData[287]++;
  var sp = s.prototype, rp;
  _$jscoverage['/util/object.js'].lineData[292]++;
  sp.constructor = s;
  _$jscoverage['/util/object.js'].lineData[295]++;
  rp = createObject(sp, r);
  _$jscoverage['/util/object.js'].lineData[296]++;
  r.prototype = util.mix(rp, r.prototype);
  _$jscoverage['/util/object.js'].lineData[297]++;
  r.superclass = sp;
  _$jscoverage['/util/object.js'].lineData[300]++;
  if (visit115_300_1(px)) {
    _$jscoverage['/util/object.js'].lineData[301]++;
    util.mix(rp, px);
  }
  _$jscoverage['/util/object.js'].lineData[305]++;
  if (visit116_305_1(sx)) {
    _$jscoverage['/util/object.js'].lineData[306]++;
    util.mix(r, sx);
  }
  _$jscoverage['/util/object.js'].lineData[309]++;
  return r;
}, 
  namespace: function() {
  _$jscoverage['/util/object.js'].functionData[11]++;
  _$jscoverage['/util/object.js'].lineData[326]++;
  var args = util.makeArray(arguments), l = args.length, o = null, i, j, p;
  _$jscoverage['/util/object.js'].lineData[330]++;
  for (i = 0; visit117_330_1(i < l); i++) {
    _$jscoverage['/util/object.js'].lineData[331]++;
    p = (EMPTY + args[i]).split('.');
    _$jscoverage['/util/object.js'].lineData[332]++;
    o = host;
    _$jscoverage['/util/object.js'].lineData[333]++;
    for (j = (visit118_333_1(host[p[0]] === o)) ? 1 : 0; visit119_333_2(j < p.length); ++j) {
      _$jscoverage['/util/object.js'].lineData[334]++;
      o = o[p[j]] = visit120_334_1(o[p[j]] || {});
    }
  }
  _$jscoverage['/util/object.js'].lineData[337]++;
  return o;
}, 
  clone: function(input, filter) {
  _$jscoverage['/util/object.js'].functionData[12]++;
  _$jscoverage['/util/object.js'].lineData[354]++;
  var memory = {}, ret = cloneInternal(input, filter, memory);
  _$jscoverage['/util/object.js'].lineData[356]++;
  util.each(memory, function(v) {
  _$jscoverage['/util/object.js'].functionData[13]++;
  _$jscoverage['/util/object.js'].lineData[358]++;
  v = v.input;
  _$jscoverage['/util/object.js'].lineData[359]++;
  if (visit121_359_1(v[CLONE_MARKER])) {
    _$jscoverage['/util/object.js'].lineData[360]++;
    try {
      _$jscoverage['/util/object.js'].lineData[361]++;
      delete v[CLONE_MARKER];
    }    catch (e) {
  _$jscoverage['/util/object.js'].lineData[363]++;
  v[CLONE_MARKER] = undefined;
}
  }
});
  _$jscoverage['/util/object.js'].lineData[367]++;
  memory = null;
  _$jscoverage['/util/object.js'].lineData[368]++;
  return ret;
}});
  _$jscoverage['/util/object.js'].lineData[372]++;
  function Empty() {
    _$jscoverage['/util/object.js'].functionData[14]++;
  }
  _$jscoverage['/util/object.js'].lineData[375]++;
  function createObject(proto, constructor) {
    _$jscoverage['/util/object.js'].functionData[15]++;
    _$jscoverage['/util/object.js'].lineData[376]++;
    var newProto;
    _$jscoverage['/util/object.js'].lineData[377]++;
    if (visit122_377_1(objectCreate)) {
      _$jscoverage['/util/object.js'].lineData[378]++;
      newProto = objectCreate(proto);
    } else {
      _$jscoverage['/util/object.js'].lineData[380]++;
      Empty.prototype = proto;
      _$jscoverage['/util/object.js'].lineData[381]++;
      newProto = new Empty();
    }
    _$jscoverage['/util/object.js'].lineData[383]++;
    newProto.constructor = constructor;
    _$jscoverage['/util/object.js'].lineData[384]++;
    return newProto;
  }
  _$jscoverage['/util/object.js'].lineData[387]++;
  function mix(r, s) {
    _$jscoverage['/util/object.js'].functionData[16]++;
    _$jscoverage['/util/object.js'].lineData[388]++;
    for (var i in s) {
      _$jscoverage['/util/object.js'].lineData[389]++;
      r[i] = s[i];
    }
  }
  _$jscoverage['/util/object.js'].lineData[393]++;
  function mixInternal(r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[17]++;
    _$jscoverage['/util/object.js'].lineData[394]++;
    if (visit123_394_1(!s || !r)) {
      _$jscoverage['/util/object.js'].lineData[395]++;
      return r;
    }
    _$jscoverage['/util/object.js'].lineData[397]++;
    var i, p, keys, len;
    _$jscoverage['/util/object.js'].lineData[400]++;
    s[MIX_CIRCULAR_DETECTION] = r;
    _$jscoverage['/util/object.js'].lineData[403]++;
    cache.push(s);
    _$jscoverage['/util/object.js'].lineData[406]++;
    keys = util.keys(s);
    _$jscoverage['/util/object.js'].lineData[407]++;
    len = keys.length;
    _$jscoverage['/util/object.js'].lineData[408]++;
    for (i = 0; visit124_408_1(i < len); i++) {
      _$jscoverage['/util/object.js'].lineData[409]++;
      p = keys[i];
      _$jscoverage['/util/object.js'].lineData[410]++;
      if (visit125_410_1(p !== MIX_CIRCULAR_DETECTION)) {
        _$jscoverage['/util/object.js'].lineData[412]++;
        _mix(p, r, s, ov, wl, deep, cache);
      }
    }
    _$jscoverage['/util/object.js'].lineData[416]++;
    return r;
  }
  _$jscoverage['/util/object.js'].lineData[419]++;
  function removeConstructor(k, v) {
    _$jscoverage['/util/object.js'].functionData[18]++;
    _$jscoverage['/util/object.js'].lineData[420]++;
    return visit126_420_1(k === 'constructor') ? undef : v;
  }
  _$jscoverage['/util/object.js'].lineData[423]++;
  function _mix(p, r, s, ov, wl, deep, cache) {
    _$jscoverage['/util/object.js'].functionData[19]++;
    _$jscoverage['/util/object.js'].lineData[427]++;
    if (visit127_427_1(ov || visit128_427_2(!(p in r) || deep))) {
      _$jscoverage['/util/object.js'].lineData[428]++;
      var target = r[p], src = s[p];
      _$jscoverage['/util/object.js'].lineData[431]++;
      if (visit129_431_1(target === src)) {
        _$jscoverage['/util/object.js'].lineData[433]++;
        if (visit130_433_1(target === undef)) {
          _$jscoverage['/util/object.js'].lineData[434]++;
          r[p] = target;
        }
        _$jscoverage['/util/object.js'].lineData[436]++;
        return;
      }
      _$jscoverage['/util/object.js'].lineData[438]++;
      if (visit131_438_1(wl)) {
        _$jscoverage['/util/object.js'].lineData[439]++;
        src = wl.call(s, p, src);
      }
      _$jscoverage['/util/object.js'].lineData[442]++;
      if (visit132_442_1(deep && visit133_442_2(src && (visit134_442_3(util.isArray(src) || util.isPlainObject(src)))))) {
        _$jscoverage['/util/object.js'].lineData[443]++;
        if (visit135_443_1(src[MIX_CIRCULAR_DETECTION])) {
          _$jscoverage['/util/object.js'].lineData[444]++;
          r[p] = src[MIX_CIRCULAR_DETECTION];
        } else {
          _$jscoverage['/util/object.js'].lineData[448]++;
          var clone = visit136_448_1(target && (visit137_448_2(util.isArray(target) || util.isPlainObject(target)))) ? target : (util.isArray(src) ? [] : {});
          _$jscoverage['/util/object.js'].lineData[451]++;
          r[p] = clone;
          _$jscoverage['/util/object.js'].lineData[452]++;
          mixInternal(clone, src, ov, wl, TRUE, cache);
        }
      } else {
        _$jscoverage['/util/object.js'].lineData[454]++;
        if (visit138_454_1(visit139_454_2(src !== undef) && (visit140_454_3(ov || !(p in r))))) {
          _$jscoverage['/util/object.js'].lineData[455]++;
          r[p] = src;
        }
      }
    }
  }
  _$jscoverage['/util/object.js'].lineData[460]++;
  function cloneInternal(input, f, memory) {
    _$jscoverage['/util/object.js'].functionData[20]++;
    _$jscoverage['/util/object.js'].lineData[461]++;
    var destination = input, isArray, isPlainObject, k, stamp;
    _$jscoverage['/util/object.js'].lineData[466]++;
    if (visit141_466_1(!input)) {
      _$jscoverage['/util/object.js'].lineData[467]++;
      return destination;
    }
    _$jscoverage['/util/object.js'].lineData[473]++;
    if (visit142_473_1(input[CLONE_MARKER])) {
      _$jscoverage['/util/object.js'].lineData[475]++;
      return memory[input[CLONE_MARKER]].destination;
    } else {
      _$jscoverage['/util/object.js'].lineData[476]++;
      if (visit143_476_1(typeof input === 'object')) {
        _$jscoverage['/util/object.js'].lineData[478]++;
        var Constructor = input.constructor;
        _$jscoverage['/util/object.js'].lineData[479]++;
        if (visit144_479_1(util.inArray(Constructor, [Boolean, String, Number, Date, RegExp]))) {
          _$jscoverage['/util/object.js'].lineData[480]++;
          destination = new Constructor(input.valueOf());
        } else {
          _$jscoverage['/util/object.js'].lineData[481]++;
          if ((isArray = util.isArray(input))) {
            _$jscoverage['/util/object.js'].lineData[483]++;
            destination = f ? util.filter(input, f) : input.concat();
          } else {
            _$jscoverage['/util/object.js'].lineData[484]++;
            if ((isPlainObject = util.isPlainObject(input))) {
              _$jscoverage['/util/object.js'].lineData[485]++;
              destination = {};
            }
          }
        }
        _$jscoverage['/util/object.js'].lineData[491]++;
        input[CLONE_MARKER] = (stamp = util.guid('c'));
        _$jscoverage['/util/object.js'].lineData[493]++;
        memory[stamp] = {
  destination: destination, 
  input: input};
      }
    }
    _$jscoverage['/util/object.js'].lineData[503]++;
    if (visit145_503_1(isArray)) {
      _$jscoverage['/util/object.js'].lineData[504]++;
      for (var i = 0; visit146_504_1(i < destination.length); i++) {
        _$jscoverage['/util/object.js'].lineData[505]++;
        destination[i] = cloneInternal(destination[i], f, memory);
      }
    } else {
      _$jscoverage['/util/object.js'].lineData[507]++;
      if (visit147_507_1(isPlainObject)) {
        _$jscoverage['/util/object.js'].lineData[508]++;
        for (k in input) {
          _$jscoverage['/util/object.js'].lineData[510]++;
          if (visit148_510_1(visit149_510_2(k !== CLONE_MARKER) && (visit150_511_1(!f || (visit151_511_2(f.call(input, input[k], k, input) !== FALSE)))))) {
            _$jscoverage['/util/object.js'].lineData[512]++;
            destination[k] = cloneInternal(input[k], f, memory);
          }
        }
      }
    }
    _$jscoverage['/util/object.js'].lineData[518]++;
    return destination;
  }
});
