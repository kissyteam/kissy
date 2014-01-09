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
if (! _$jscoverage['/router.js']) {
  _$jscoverage['/router.js'] = {};
  _$jscoverage['/router.js'].lineData = [];
  _$jscoverage['/router.js'].lineData[5] = 0;
  _$jscoverage['/router.js'].lineData[6] = 0;
  _$jscoverage['/router.js'].lineData[7] = 0;
  _$jscoverage['/router.js'].lineData[8] = 0;
  _$jscoverage['/router.js'].lineData[9] = 0;
  _$jscoverage['/router.js'].lineData[10] = 0;
  _$jscoverage['/router.js'].lineData[11] = 0;
  _$jscoverage['/router.js'].lineData[12] = 0;
  _$jscoverage['/router.js'].lineData[13] = 0;
  _$jscoverage['/router.js'].lineData[14] = 0;
  _$jscoverage['/router.js'].lineData[15] = 0;
  _$jscoverage['/router.js'].lineData[16] = 0;
  _$jscoverage['/router.js'].lineData[17] = 0;
  _$jscoverage['/router.js'].lineData[18] = 0;
  _$jscoverage['/router.js'].lineData[19] = 0;
  _$jscoverage['/router.js'].lineData[20] = 0;
  _$jscoverage['/router.js'].lineData[22] = 0;
  _$jscoverage['/router.js'].lineData[25] = 0;
  _$jscoverage['/router.js'].lineData[26] = 0;
  _$jscoverage['/router.js'].lineData[28] = 0;
  _$jscoverage['/router.js'].lineData[29] = 0;
  _$jscoverage['/router.js'].lineData[33] = 0;
  _$jscoverage['/router.js'].lineData[34] = 0;
  _$jscoverage['/router.js'].lineData[36] = 0;
  _$jscoverage['/router.js'].lineData[41] = 0;
  _$jscoverage['/router.js'].lineData[42] = 0;
  _$jscoverage['/router.js'].lineData[43] = 0;
  _$jscoverage['/router.js'].lineData[44] = 0;
  _$jscoverage['/router.js'].lineData[45] = 0;
  _$jscoverage['/router.js'].lineData[46] = 0;
  _$jscoverage['/router.js'].lineData[48] = 0;
  _$jscoverage['/router.js'].lineData[52] = 0;
  _$jscoverage['/router.js'].lineData[53] = 0;
  _$jscoverage['/router.js'].lineData[54] = 0;
  _$jscoverage['/router.js'].lineData[56] = 0;
  _$jscoverage['/router.js'].lineData[57] = 0;
  _$jscoverage['/router.js'].lineData[58] = 0;
  _$jscoverage['/router.js'].lineData[59] = 0;
  _$jscoverage['/router.js'].lineData[61] = 0;
  _$jscoverage['/router.js'].lineData[62] = 0;
  _$jscoverage['/router.js'].lineData[63] = 0;
  _$jscoverage['/router.js'].lineData[64] = 0;
  _$jscoverage['/router.js'].lineData[65] = 0;
  _$jscoverage['/router.js'].lineData[66] = 0;
  _$jscoverage['/router.js'].lineData[67] = 0;
  _$jscoverage['/router.js'].lineData[68] = 0;
  _$jscoverage['/router.js'].lineData[69] = 0;
  _$jscoverage['/router.js'].lineData[71] = 0;
  _$jscoverage['/router.js'].lineData[76] = 0;
  _$jscoverage['/router.js'].lineData[79] = 0;
  _$jscoverage['/router.js'].lineData[80] = 0;
  _$jscoverage['/router.js'].lineData[81] = 0;
  _$jscoverage['/router.js'].lineData[83] = 0;
  _$jscoverage['/router.js'].lineData[84] = 0;
  _$jscoverage['/router.js'].lineData[85] = 0;
  _$jscoverage['/router.js'].lineData[86] = 0;
  _$jscoverage['/router.js'].lineData[87] = 0;
  _$jscoverage['/router.js'].lineData[88] = 0;
  _$jscoverage['/router.js'].lineData[89] = 0;
  _$jscoverage['/router.js'].lineData[90] = 0;
  _$jscoverage['/router.js'].lineData[91] = 0;
  _$jscoverage['/router.js'].lineData[92] = 0;
  _$jscoverage['/router.js'].lineData[93] = 0;
  _$jscoverage['/router.js'].lineData[94] = 0;
  _$jscoverage['/router.js'].lineData[96] = 0;
  _$jscoverage['/router.js'].lineData[97] = 0;
  _$jscoverage['/router.js'].lineData[98] = 0;
  _$jscoverage['/router.js'].lineData[99] = 0;
  _$jscoverage['/router.js'].lineData[103] = 0;
  _$jscoverage['/router.js'].lineData[105] = 0;
  _$jscoverage['/router.js'].lineData[110] = 0;
  _$jscoverage['/router.js'].lineData[113] = 0;
  _$jscoverage['/router.js'].lineData[114] = 0;
  _$jscoverage['/router.js'].lineData[115] = 0;
  _$jscoverage['/router.js'].lineData[116] = 0;
  _$jscoverage['/router.js'].lineData[117] = 0;
  _$jscoverage['/router.js'].lineData[119] = 0;
  _$jscoverage['/router.js'].lineData[120] = 0;
  _$jscoverage['/router.js'].lineData[130] = 0;
  _$jscoverage['/router.js'].lineData[133] = 0;
  _$jscoverage['/router.js'].lineData[148] = 0;
  _$jscoverage['/router.js'].lineData[149] = 0;
  _$jscoverage['/router.js'].lineData[150] = 0;
  _$jscoverage['/router.js'].lineData[151] = 0;
  _$jscoverage['/router.js'].lineData[153] = 0;
  _$jscoverage['/router.js'].lineData[165] = 0;
  _$jscoverage['/router.js'].lineData[166] = 0;
  _$jscoverage['/router.js'].lineData[167] = 0;
  _$jscoverage['/router.js'].lineData[168] = 0;
  _$jscoverage['/router.js'].lineData[169] = 0;
  _$jscoverage['/router.js'].lineData[170] = 0;
  _$jscoverage['/router.js'].lineData[171] = 0;
  _$jscoverage['/router.js'].lineData[174] = 0;
  _$jscoverage['/router.js'].lineData[175] = 0;
  _$jscoverage['/router.js'].lineData[181] = 0;
  _$jscoverage['/router.js'].lineData[183] = 0;
  _$jscoverage['/router.js'].lineData[184] = 0;
  _$jscoverage['/router.js'].lineData[187] = 0;
  _$jscoverage['/router.js'].lineData[189] = 0;
  _$jscoverage['/router.js'].lineData[192] = 0;
  _$jscoverage['/router.js'].lineData[193] = 0;
  _$jscoverage['/router.js'].lineData[201] = 0;
  _$jscoverage['/router.js'].lineData[202] = 0;
  _$jscoverage['/router.js'].lineData[203] = 0;
  _$jscoverage['/router.js'].lineData[211] = 0;
  _$jscoverage['/router.js'].lineData[212] = 0;
  _$jscoverage['/router.js'].lineData[213] = 0;
  _$jscoverage['/router.js'].lineData[214] = 0;
  _$jscoverage['/router.js'].lineData[217] = 0;
  _$jscoverage['/router.js'].lineData[225] = 0;
  _$jscoverage['/router.js'].lineData[226] = 0;
  _$jscoverage['/router.js'].lineData[227] = 0;
  _$jscoverage['/router.js'].lineData[228] = 0;
  _$jscoverage['/router.js'].lineData[229] = 0;
  _$jscoverage['/router.js'].lineData[230] = 0;
  _$jscoverage['/router.js'].lineData[231] = 0;
  _$jscoverage['/router.js'].lineData[232] = 0;
  _$jscoverage['/router.js'].lineData[235] = 0;
  _$jscoverage['/router.js'].lineData[242] = 0;
  _$jscoverage['/router.js'].lineData[243] = 0;
  _$jscoverage['/router.js'].lineData[244] = 0;
  _$jscoverage['/router.js'].lineData[252] = 0;
  _$jscoverage['/router.js'].lineData[253] = 0;
  _$jscoverage['/router.js'].lineData[254] = 0;
  _$jscoverage['/router.js'].lineData[255] = 0;
  _$jscoverage['/router.js'].lineData[258] = 0;
  _$jscoverage['/router.js'].lineData[261] = 0;
  _$jscoverage['/router.js'].lineData[262] = 0;
  _$jscoverage['/router.js'].lineData[263] = 0;
  _$jscoverage['/router.js'].lineData[265] = 0;
  _$jscoverage['/router.js'].lineData[266] = 0;
  _$jscoverage['/router.js'].lineData[267] = 0;
  _$jscoverage['/router.js'].lineData[268] = 0;
  _$jscoverage['/router.js'].lineData[271] = 0;
  _$jscoverage['/router.js'].lineData[273] = 0;
  _$jscoverage['/router.js'].lineData[278] = 0;
  _$jscoverage['/router.js'].lineData[281] = 0;
  _$jscoverage['/router.js'].lineData[284] = 0;
  _$jscoverage['/router.js'].lineData[286] = 0;
  _$jscoverage['/router.js'].lineData[287] = 0;
  _$jscoverage['/router.js'].lineData[289] = 0;
  _$jscoverage['/router.js'].lineData[293] = 0;
  _$jscoverage['/router.js'].lineData[296] = 0;
  _$jscoverage['/router.js'].lineData[297] = 0;
  _$jscoverage['/router.js'].lineData[298] = 0;
  _$jscoverage['/router.js'].lineData[299] = 0;
  _$jscoverage['/router.js'].lineData[301] = 0;
  _$jscoverage['/router.js'].lineData[314] = 0;
  _$jscoverage['/router.js'].lineData[315] = 0;
  _$jscoverage['/router.js'].lineData[317] = 0;
  _$jscoverage['/router.js'].lineData[318] = 0;
  _$jscoverage['/router.js'].lineData[322] = 0;
  _$jscoverage['/router.js'].lineData[323] = 0;
  _$jscoverage['/router.js'].lineData[324] = 0;
  _$jscoverage['/router.js'].lineData[326] = 0;
  _$jscoverage['/router.js'].lineData[327] = 0;
  _$jscoverage['/router.js'].lineData[332] = 0;
  _$jscoverage['/router.js'].lineData[333] = 0;
  _$jscoverage['/router.js'].lineData[336] = 0;
  _$jscoverage['/router.js'].lineData[341] = 0;
  _$jscoverage['/router.js'].lineData[342] = 0;
  _$jscoverage['/router.js'].lineData[348] = 0;
  _$jscoverage['/router.js'].lineData[349] = 0;
  _$jscoverage['/router.js'].lineData[351] = 0;
  _$jscoverage['/router.js'].lineData[352] = 0;
  _$jscoverage['/router.js'].lineData[354] = 0;
  _$jscoverage['/router.js'].lineData[363] = 0;
  _$jscoverage['/router.js'].lineData[364] = 0;
  _$jscoverage['/router.js'].lineData[365] = 0;
  _$jscoverage['/router.js'].lineData[367] = 0;
  _$jscoverage['/router.js'].lineData[372] = 0;
  _$jscoverage['/router.js'].lineData[373] = 0;
  _$jscoverage['/router.js'].lineData[374] = 0;
  _$jscoverage['/router.js'].lineData[375] = 0;
  _$jscoverage['/router.js'].lineData[379] = 0;
  _$jscoverage['/router.js'].lineData[381] = 0;
  _$jscoverage['/router.js'].lineData[383] = 0;
  _$jscoverage['/router.js'].lineData[384] = 0;
  _$jscoverage['/router.js'].lineData[385] = 0;
  _$jscoverage['/router.js'].lineData[388] = 0;
  _$jscoverage['/router.js'].lineData[389] = 0;
  _$jscoverage['/router.js'].lineData[390] = 0;
  _$jscoverage['/router.js'].lineData[391] = 0;
  _$jscoverage['/router.js'].lineData[392] = 0;
  _$jscoverage['/router.js'].lineData[393] = 0;
  _$jscoverage['/router.js'].lineData[394] = 0;
  _$jscoverage['/router.js'].lineData[397] = 0;
  _$jscoverage['/router.js'].lineData[399] = 0;
  _$jscoverage['/router.js'].lineData[406] = 0;
  _$jscoverage['/router.js'].lineData[407] = 0;
  _$jscoverage['/router.js'].lineData[409] = 0;
  _$jscoverage['/router.js'].lineData[410] = 0;
  _$jscoverage['/router.js'].lineData[414] = 0;
  _$jscoverage['/router.js'].lineData[415] = 0;
  _$jscoverage['/router.js'].lineData[419] = 0;
  _$jscoverage['/router.js'].lineData[420] = 0;
  _$jscoverage['/router.js'].lineData[421] = 0;
  _$jscoverage['/router.js'].lineData[422] = 0;
}
if (! _$jscoverage['/router.js'].functionData) {
  _$jscoverage['/router.js'].functionData = [];
  _$jscoverage['/router.js'].functionData[0] = 0;
  _$jscoverage['/router.js'].functionData[1] = 0;
  _$jscoverage['/router.js'].functionData[2] = 0;
  _$jscoverage['/router.js'].functionData[3] = 0;
  _$jscoverage['/router.js'].functionData[4] = 0;
  _$jscoverage['/router.js'].functionData[5] = 0;
  _$jscoverage['/router.js'].functionData[6] = 0;
  _$jscoverage['/router.js'].functionData[7] = 0;
  _$jscoverage['/router.js'].functionData[8] = 0;
  _$jscoverage['/router.js'].functionData[9] = 0;
  _$jscoverage['/router.js'].functionData[10] = 0;
  _$jscoverage['/router.js'].functionData[11] = 0;
  _$jscoverage['/router.js'].functionData[12] = 0;
  _$jscoverage['/router.js'].functionData[13] = 0;
  _$jscoverage['/router.js'].functionData[14] = 0;
  _$jscoverage['/router.js'].functionData[15] = 0;
  _$jscoverage['/router.js'].functionData[16] = 0;
  _$jscoverage['/router.js'].functionData[17] = 0;
  _$jscoverage['/router.js'].functionData[18] = 0;
  _$jscoverage['/router.js'].functionData[19] = 0;
  _$jscoverage['/router.js'].functionData[20] = 0;
  _$jscoverage['/router.js'].functionData[21] = 0;
}
if (! _$jscoverage['/router.js'].branchData) {
  _$jscoverage['/router.js'].branchData = {};
  _$jscoverage['/router.js'].branchData['20'] = [];
  _$jscoverage['/router.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['33'] = [];
  _$jscoverage['/router.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['42'] = [];
  _$jscoverage['/router.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['44'] = [];
  _$jscoverage['/router.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['58'] = [];
  _$jscoverage['/router.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['62'] = [];
  _$jscoverage['/router.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['85'] = [];
  _$jscoverage['/router.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['92'] = [];
  _$jscoverage['/router.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['97'] = [];
  _$jscoverage['/router.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['119'] = [];
  _$jscoverage['/router.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['149'] = [];
  _$jscoverage['/router.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['166'] = [];
  _$jscoverage['/router.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['168'] = [];
  _$jscoverage['/router.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['169'] = [];
  _$jscoverage['/router.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['174'] = [];
  _$jscoverage['/router.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['183'] = [];
  _$jscoverage['/router.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['192'] = [];
  _$jscoverage['/router.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['212'] = [];
  _$jscoverage['/router.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['213'] = [];
  _$jscoverage['/router.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['226'] = [];
  _$jscoverage['/router.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['228'] = [];
  _$jscoverage['/router.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['229'] = [];
  _$jscoverage['/router.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['231'] = [];
  _$jscoverage['/router.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['253'] = [];
  _$jscoverage['/router.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['254'] = [];
  _$jscoverage['/router.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['265'] = [];
  _$jscoverage['/router.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['270'] = [];
  _$jscoverage['/router.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['286'] = [];
  _$jscoverage['/router.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['296'] = [];
  _$jscoverage['/router.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['298'] = [];
  _$jscoverage['/router.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['315'] = [];
  _$jscoverage['/router.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['317'] = [];
  _$jscoverage['/router.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['318'] = [];
  _$jscoverage['/router.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['322'] = [];
  _$jscoverage['/router.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['326'] = [];
  _$jscoverage['/router.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['332'] = [];
  _$jscoverage['/router.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['341'] = [];
  _$jscoverage['/router.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['342'] = [];
  _$jscoverage['/router.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['348'] = [];
  _$jscoverage['/router.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['349'] = [];
  _$jscoverage['/router.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['363'] = [];
  _$jscoverage['/router.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['374'] = [];
  _$jscoverage['/router.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['383'] = [];
  _$jscoverage['/router.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['384'] = [];
  _$jscoverage['/router.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['390'] = [];
  _$jscoverage['/router.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/router.js'].branchData['393'] = [];
  _$jscoverage['/router.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['397'] = [];
  _$jscoverage['/router.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['406'] = [];
  _$jscoverage['/router.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/router.js'].branchData['409'] = [];
  _$jscoverage['/router.js'].branchData['409'][1] = new BranchData();
}
_$jscoverage['/router.js'].branchData['409'][1].init(1658, 12, 'opts.success');
function visit69_409_1(result) {
  _$jscoverage['/router.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['406'][1].init(1576, 17, 'opts.triggerRoute');
function visit68_406_1(result) {
  _$jscoverage['/router.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['397'][1].init(1158, 18, 'needReplaceHistory');
function visit67_397_1(result) {
  _$jscoverage['/router.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['393'][1].init(492, 42, 'supportNativeHistory && utils.hasVid(href)');
function visit66_393_1(result) {
  _$jscoverage['/router.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['390'][2].init(297, 44, 'getVidFromUrlWithHash(href) !== viewUniqueId');
function visit65_390_2(result) {
  _$jscoverage['/router.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['390'][1].init(272, 69, '!supportNativeHistory && getVidFromUrlWithHash(href) !== viewUniqueId');
function visit64_390_1(result) {
  _$jscoverage['/router.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['384'][1].init(22, 18, '!getUrlForRouter()');
function visit63_384_1(result) {
  _$jscoverage['/router.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['383'][1].init(492, 7, 'useHash');
function visit62_383_1(result) {
  _$jscoverage['/router.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['374'][1].init(78, 20, 'supportNativeHistory');
function visit61_374_1(result) {
  _$jscoverage['/router.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['363'][1].init(882, 42, '!utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit60_363_1(result) {
  _$jscoverage['/router.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['349'][1].init(26, 41, 'utils.equalsIgnoreSlash(locPath, urlRoot)');
function visit59_349_1(result) {
  _$jscoverage['/router.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['348'][1].init(216, 11, 'hashIsValid');
function visit58_348_1(result) {
  _$jscoverage['/router.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['342'][1].init(18, 20, 'supportNativeHistory');
function visit57_342_1(result) {
  _$jscoverage['/router.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['341'][1].init(723, 8, '!useHash');
function visit56_341_1(result) {
  _$jscoverage['/router.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['332'][1].init(458, 18, 'opts.useHashChange');
function visit55_332_1(result) {
  _$jscoverage['/router.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['326'][1].init(307, 21, 'useHash === undefined');
function visit54_326_1(result) {
  _$jscoverage['/router.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['322'][1].init(186, 18, 'opts.urlRoot || \'\'');
function visit53_322_1(result) {
  _$jscoverage['/router.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['318'][1].init(21, 42, 'opts.success && opts.success.call(exports)');
function visit52_318_1(result) {
  _$jscoverage['/router.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['317'][1].init(44, 7, 'started');
function visit51_317_1(result) {
  _$jscoverage['/router.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['315'][1].init(17, 10, 'opts || {}');
function visit50_315_1(result) {
  _$jscoverage['/router.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['298'][1].init(183, 4, '!vid');
function visit49_298_1(result) {
  _$jscoverage['/router.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['296'][1].init(93, 25, 'e.newURL || location.href');
function visit48_296_1(result) {
  _$jscoverage['/router.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['286'][1].init(153, 6, '!state');
function visit47_286_1(result) {
  _$jscoverage['/router.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['270'][1].init(80, 45, 'vid !== viewsHistory[viewsHistory.length - 1]');
function visit46_270_1(result) {
  _$jscoverage['/router.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['265'][1].init(77, 45, 'vid === viewsHistory[viewsHistory.length - 2]');
function visit45_265_1(result) {
  _$jscoverage['/router.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['254'][1].init(18, 28, 'routes[i].path === routePath');
function visit44_254_1(result) {
  _$jscoverage['/router.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['253'][1].init(45, 5, 'i < l');
function visit43_253_1(result) {
  _$jscoverage['/router.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['231'][1].init(75, 19, '!r.callbacks.length');
function visit42_231_1(result) {
  _$jscoverage['/router.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['229'][1].init(22, 8, 'callback');
function visit41_229_1(result) {
  _$jscoverage['/router.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['228'][1].init(50, 20, 'r.path === routePath');
function visit40_228_1(result) {
  _$jscoverage['/router.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['226'][1].init(42, 6, 'i >= 0');
function visit39_226_1(result) {
  _$jscoverage['/router.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['213'][1].init(18, 21, 'routes[i].match(path)');
function visit38_213_1(result) {
  _$jscoverage['/router.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['212'][1].init(45, 5, 'i < l');
function visit37_212_1(result) {
  _$jscoverage['/router.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['192'][1].init(1113, 25, 'opts && opts.triggerRoute');
function visit36_192_1(result) {
  _$jscoverage['/router.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['183'][1].init(22, 20, 'supportNativeHistory');
function visit35_183_1(result) {
  _$jscoverage['/router.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['174'][1].init(195, 32, '!useHash && supportNativeHistory');
function visit34_174_1(result) {
  _$jscoverage['/router.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['169'][1].init(18, 8, '!replace');
function visit33_169_1(result) {
  _$jscoverage['/router.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['168'][1].init(79, 26, 'getUrlForRouter() !== path');
function visit32_168_1(result) {
  _$jscoverage['/router.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['166'][1].init(17, 10, 'opts || {}');
function visit31_166_1(result) {
  _$jscoverage['/router.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['149'][1].init(14, 26, 'typeof prefix !== \'string\'');
function visit30_149_1(result) {
  _$jscoverage['/router.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['119'][1].init(189, 21, 'uri.toString() || \'/\'');
function visit29_119_1(result) {
  _$jscoverage['/router.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['97'][1].init(80, 30, 'callbackIndex !== callbacksLen');
function visit28_97_1(result) {
  _$jscoverage['/router.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['92'][1].init(30, 17, 'cause === \'route\'');
function visit27_92_1(result) {
  _$jscoverage['/router.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['85'][1].init(40, 13, 'index !== len');
function visit26_85_1(result) {
  _$jscoverage['/router.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['62'][1].init(76, 53, 'S.startsWith(request.path + \'/\', middleware[0] + \'/\')');
function visit25_62_1(result) {
  _$jscoverage['/router.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['58'][1].init(40, 13, 'index === len');
function visit24_58_1(result) {
  _$jscoverage['/router.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['44'][1].init(84, 32, '!useHash && supportNativeHistory');
function visit23_44_1(result) {
  _$jscoverage['/router.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['42'][1].init(16, 20, 'url || location.href');
function visit22_42_1(result) {
  _$jscoverage['/router.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['33'][1].init(203, 7, 'replace');
function visit21_33_1(result) {
  _$jscoverage['/router.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].branchData['20'][1].init(548, 28, 'history && history.pushState');
function visit20_20_1(result) {
  _$jscoverage['/router.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/router.js'].lineData[5]++;
KISSY.add(function(S, require, exports) {
  _$jscoverage['/router.js'].functionData[0]++;
  _$jscoverage['/router.js'].lineData[6]++;
  var middlewares = [];
  _$jscoverage['/router.js'].lineData[7]++;
  var routes = [];
  _$jscoverage['/router.js'].lineData[8]++;
  var utils = require('./router/utils');
  _$jscoverage['/router.js'].lineData[9]++;
  var Route = require('./router/route');
  _$jscoverage['/router.js'].lineData[10]++;
  var Uri = require('uri');
  _$jscoverage['/router.js'].lineData[11]++;
  var Request = require('./router/request');
  _$jscoverage['/router.js'].lineData[12]++;
  var DomEvent = require('event/dom');
  _$jscoverage['/router.js'].lineData[13]++;
  var started = false;
  _$jscoverage['/router.js'].lineData[14]++;
  var useHash;
  _$jscoverage['/router.js'].lineData[15]++;
  var urlRoot;
  _$jscoverage['/router.js'].lineData[16]++;
  var getVidFromUrlWithHash = utils.getVidFromUrlWithHash;
  _$jscoverage['/router.js'].lineData[17]++;
  var win = S.Env.host;
  _$jscoverage['/router.js'].lineData[18]++;
  var history = win.history;
  _$jscoverage['/router.js'].lineData[19]++;
  var supportNativeHashChange = S.Features.isHashChangeSupported();
  _$jscoverage['/router.js'].lineData[20]++;
  var supportNativeHistory = !!(visit20_20_1(history && history.pushState));
  _$jscoverage['/router.js'].lineData[22]++;
  var BREATH_INTERVAL = 100;
  _$jscoverage['/router.js'].lineData[25]++;
  var viewUniqueId = 10;
  _$jscoverage['/router.js'].lineData[26]++;
  var viewsHistory = [viewUniqueId];
  _$jscoverage['/router.js'].lineData[28]++;
  function setPathByHash(path, replace) {
    _$jscoverage['/router.js'].functionData[1]++;
    _$jscoverage['/router.js'].lineData[29]++;
    var hash = utils.addVid('#!' + path + (supportNativeHashChange ? '' : DomEvent.REPLACE_HISTORY), viewUniqueId);
    _$jscoverage['/router.js'].lineData[33]++;
    if (visit21_33_1(replace)) {
      _$jscoverage['/router.js'].lineData[34]++;
      location.replace(hash);
    } else {
      _$jscoverage['/router.js'].lineData[36]++;
      location.hash = hash;
    }
  }
  _$jscoverage['/router.js'].lineData[41]++;
  function getUrlForRouter(url) {
    _$jscoverage['/router.js'].functionData[2]++;
    _$jscoverage['/router.js'].lineData[42]++;
    url = visit22_42_1(url || location.href);
    _$jscoverage['/router.js'].lineData[43]++;
    var uri = new Uri(url);
    _$jscoverage['/router.js'].lineData[44]++;
    if (visit23_44_1(!useHash && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[45]++;
      var query = uri.query;
      _$jscoverage['/router.js'].lineData[46]++;
      return uri.getPath().substr(urlRoot.length) + (query.has() ? ('?' + query.toString()) : '');
    } else {
      _$jscoverage['/router.js'].lineData[48]++;
      return utils.getHash(uri);
    }
  }
  _$jscoverage['/router.js'].lineData[52]++;
  function fireMiddleWare(request, response, cb) {
    _$jscoverage['/router.js'].functionData[3]++;
    _$jscoverage['/router.js'].lineData[53]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[54]++;
    var len = middlewares.length;
    _$jscoverage['/router.js'].lineData[56]++;
    function next() {
      _$jscoverage['/router.js'].functionData[4]++;
      _$jscoverage['/router.js'].lineData[57]++;
      index++;
      _$jscoverage['/router.js'].lineData[58]++;
      if (visit24_58_1(index === len)) {
        _$jscoverage['/router.js'].lineData[59]++;
        cb(request, response);
      } else {
        _$jscoverage['/router.js'].lineData[61]++;
        var middleware = middlewares[index];
        _$jscoverage['/router.js'].lineData[62]++;
        if (visit25_62_1(S.startsWith(request.path + '/', middleware[0] + '/'))) {
          _$jscoverage['/router.js'].lineData[63]++;
          var prefixLen = middleware[0].length;
          _$jscoverage['/router.js'].lineData[64]++;
          request.url = request.url.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[65]++;
          var path = request.path;
          _$jscoverage['/router.js'].lineData[66]++;
          request.path = request.path.slice(prefixLen);
          _$jscoverage['/router.js'].lineData[67]++;
          middleware[1](request, next);
          _$jscoverage['/router.js'].lineData[68]++;
          request.url = request.originalUrl;
          _$jscoverage['/router.js'].lineData[69]++;
          request.path = path;
        } else {
          _$jscoverage['/router.js'].lineData[71]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[76]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[79]++;
  function fireRoutes(request, response) {
    _$jscoverage['/router.js'].functionData[5]++;
    _$jscoverage['/router.js'].lineData[80]++;
    var index = -1;
    _$jscoverage['/router.js'].lineData[81]++;
    var len = routes.length;
    _$jscoverage['/router.js'].lineData[83]++;
    function next() {
      _$jscoverage['/router.js'].functionData[6]++;
      _$jscoverage['/router.js'].lineData[84]++;
      index++;
      _$jscoverage['/router.js'].lineData[85]++;
      if (visit26_85_1(index !== len)) {
        _$jscoverage['/router.js'].lineData[86]++;
        var route = routes[index];
        _$jscoverage['/router.js'].lineData[87]++;
        if ((request.params = route.match(request.path))) {
          _$jscoverage['/router.js'].lineData[88]++;
          var callbackIndex = -1;
          _$jscoverage['/router.js'].lineData[89]++;
          var callbacks = route.callbacks;
          _$jscoverage['/router.js'].lineData[90]++;
          var callbacksLen = callbacks.length;
          _$jscoverage['/router.js'].lineData[91]++;
          var nextCallback = function(cause) {
  _$jscoverage['/router.js'].functionData[7]++;
  _$jscoverage['/router.js'].lineData[92]++;
  if (visit27_92_1(cause === 'route')) {
    _$jscoverage['/router.js'].lineData[93]++;
    nextCallback = null;
    _$jscoverage['/router.js'].lineData[94]++;
    next();
  } else {
    _$jscoverage['/router.js'].lineData[96]++;
    callbackIndex++;
    _$jscoverage['/router.js'].lineData[97]++;
    if (visit28_97_1(callbackIndex !== callbacksLen)) {
      _$jscoverage['/router.js'].lineData[98]++;
      request.route = route;
      _$jscoverage['/router.js'].lineData[99]++;
      callbacks[callbackIndex](request, response, nextCallback);
    }
  }
};
          _$jscoverage['/router.js'].lineData[103]++;
          nextCallback('');
        } else {
          _$jscoverage['/router.js'].lineData[105]++;
          next();
        }
      }
    }
    _$jscoverage['/router.js'].lineData[110]++;
    next();
  }
  _$jscoverage['/router.js'].lineData[113]++;
  function dispatch(backward, replace) {
    _$jscoverage['/router.js'].functionData[8]++;
    _$jscoverage['/router.js'].lineData[114]++;
    var url = getUrlForRouter();
    _$jscoverage['/router.js'].lineData[115]++;
    var uri = new S.Uri(url);
    _$jscoverage['/router.js'].lineData[116]++;
    var query = uri.query.get();
    _$jscoverage['/router.js'].lineData[117]++;
    uri.query.reset();
    _$jscoverage['/router.js'].lineData[119]++;
    var path = visit29_119_1(uri.toString() || '/');
    _$jscoverage['/router.js'].lineData[120]++;
    var request = new Request({
  query: query, 
  backward: backward, 
  replace: replace, 
  path: path, 
  url: url, 
  originalUrl: url});
    _$jscoverage['/router.js'].lineData[130]++;
    var response = {
  redirect: exports.navigate};
    _$jscoverage['/router.js'].lineData[133]++;
    fireMiddleWare(request, response, fireRoutes);
  }
  _$jscoverage['/router.js'].lineData[148]++;
  exports.use = function(prefix, callback) {
  _$jscoverage['/router.js'].functionData[9]++;
  _$jscoverage['/router.js'].lineData[149]++;
  if (visit30_149_1(typeof prefix !== 'string')) {
    _$jscoverage['/router.js'].lineData[150]++;
    callback = prefix;
    _$jscoverage['/router.js'].lineData[151]++;
    prefix = '';
  }
  _$jscoverage['/router.js'].lineData[153]++;
  middlewares.push([prefix, callback]);
};
  _$jscoverage['/router.js'].lineData[165]++;
  exports.navigate = function(path, opts) {
  _$jscoverage['/router.js'].functionData[10]++;
  _$jscoverage['/router.js'].lineData[166]++;
  opts = visit31_166_1(opts || {});
  _$jscoverage['/router.js'].lineData[167]++;
  var replace = opts.replace;
  _$jscoverage['/router.js'].lineData[168]++;
  if (visit32_168_1(getUrlForRouter() !== path)) {
    _$jscoverage['/router.js'].lineData[169]++;
    if (visit33_169_1(!replace)) {
      _$jscoverage['/router.js'].lineData[170]++;
      viewUniqueId++;
      _$jscoverage['/router.js'].lineData[171]++;
      viewsHistory.push(viewUniqueId);
    }
    _$jscoverage['/router.js'].lineData[174]++;
    if (visit34_174_1(!useHash && supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[175]++;
      history[replace ? 'replaceState' : 'pushState']({
  vid: viewUniqueId}, '', utils.getFullPath(path, urlRoot));
      _$jscoverage['/router.js'].lineData[181]++;
      dispatch(false, replace);
    } else {
      _$jscoverage['/router.js'].lineData[183]++;
      if (visit35_183_1(supportNativeHistory)) {
        _$jscoverage['/router.js'].lineData[184]++;
        history[replace ? 'replaceState' : 'pushState']({
  vid: viewUniqueId}, '', '#!' + path);
        _$jscoverage['/router.js'].lineData[187]++;
        dispatch(false, replace);
      } else {
        _$jscoverage['/router.js'].lineData[189]++;
        setPathByHash(path, replace);
      }
    }
  } else {
    _$jscoverage['/router.js'].lineData[192]++;
    if (visit36_192_1(opts && opts.triggerRoute)) {
      _$jscoverage['/router.js'].lineData[193]++;
      dispatch(false, true);
    }
  }
};
  _$jscoverage['/router.js'].lineData[201]++;
  exports.get = function(routePath) {
  _$jscoverage['/router.js'].functionData[11]++;
  _$jscoverage['/router.js'].lineData[202]++;
  var callbacks = S.makeArray(arguments).slice(1);
  _$jscoverage['/router.js'].lineData[203]++;
  routes.push(new Route(routePath, callbacks));
};
  _$jscoverage['/router.js'].lineData[211]++;
  exports.matchRoute = function(path) {
  _$jscoverage['/router.js'].functionData[12]++;
  _$jscoverage['/router.js'].lineData[212]++;
  for (var i = 0, l = routes.length; visit37_212_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[213]++;
    if (visit38_213_1(routes[i].match(path))) {
      _$jscoverage['/router.js'].lineData[214]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[217]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[225]++;
  exports.removeRoute = function(routePath, callback) {
  _$jscoverage['/router.js'].functionData[13]++;
  _$jscoverage['/router.js'].lineData[226]++;
  for (var i = routes.length - 1; visit39_226_1(i >= 0); i--) {
    _$jscoverage['/router.js'].lineData[227]++;
    var r = routes[i];
    _$jscoverage['/router.js'].lineData[228]++;
    if (visit40_228_1(r.path === routePath)) {
      _$jscoverage['/router.js'].lineData[229]++;
      if (visit41_229_1(callback)) {
        _$jscoverage['/router.js'].lineData[230]++;
        r.removeCallback(callback);
        _$jscoverage['/router.js'].lineData[231]++;
        if (visit42_231_1(!r.callbacks.length)) {
          _$jscoverage['/router.js'].lineData[232]++;
          routes.splice(i, 1);
        }
      } else {
        _$jscoverage['/router.js'].lineData[235]++;
        routes.splice(i, 1);
      }
    }
  }
};
  _$jscoverage['/router.js'].lineData[242]++;
  exports.clearRoutes = function() {
  _$jscoverage['/router.js'].functionData[14]++;
  _$jscoverage['/router.js'].lineData[243]++;
  middlewares = [];
  _$jscoverage['/router.js'].lineData[244]++;
  routes = [];
};
  _$jscoverage['/router.js'].lineData[252]++;
  exports.hasRoute = function(routePath) {
  _$jscoverage['/router.js'].functionData[15]++;
  _$jscoverage['/router.js'].lineData[253]++;
  for (var i = 0, l = routes.length; visit43_253_1(i < l); i++) {
    _$jscoverage['/router.js'].lineData[254]++;
    if (visit44_254_1(routes[i].path === routePath)) {
      _$jscoverage['/router.js'].lineData[255]++;
      return routes[i];
    }
  }
  _$jscoverage['/router.js'].lineData[258]++;
  return false;
};
  _$jscoverage['/router.js'].lineData[261]++;
  function dispatchByVid(vid) {
    _$jscoverage['/router.js'].functionData[16]++;
    _$jscoverage['/router.js'].lineData[262]++;
    var backward = false;
    _$jscoverage['/router.js'].lineData[263]++;
    var replace = false;
    _$jscoverage['/router.js'].lineData[265]++;
    if (visit45_265_1(vid === viewsHistory[viewsHistory.length - 2])) {
      _$jscoverage['/router.js'].lineData[266]++;
      backward = true;
      _$jscoverage['/router.js'].lineData[267]++;
      viewsHistory.pop();
    } else {
      _$jscoverage['/router.js'].lineData[268]++;
      if (visit46_270_1(vid !== viewsHistory[viewsHistory.length - 1])) {
        _$jscoverage['/router.js'].lineData[271]++;
        viewsHistory.push(vid);
      } else {
        _$jscoverage['/router.js'].lineData[273]++;
        replace = true;
      }
    }
    _$jscoverage['/router.js'].lineData[278]++;
    dispatch(backward, replace);
  }
  _$jscoverage['/router.js'].lineData[281]++;
  function onPopState(e) {
    _$jscoverage['/router.js'].functionData[17]++;
    _$jscoverage['/router.js'].lineData[284]++;
    var state = e.originalEvent.state;
    _$jscoverage['/router.js'].lineData[286]++;
    if (visit47_286_1(!state)) {
      _$jscoverage['/router.js'].lineData[287]++;
      return;
    }
    _$jscoverage['/router.js'].lineData[289]++;
    dispatchByVid(state.vid);
  }
  _$jscoverage['/router.js'].lineData[293]++;
  function onHashChange(e) {
    _$jscoverage['/router.js'].functionData[18]++;
    _$jscoverage['/router.js'].lineData[296]++;
    var newURL = visit48_296_1(e.newURL || location.href);
    _$jscoverage['/router.js'].lineData[297]++;
    var vid = getVidFromUrlWithHash(newURL);
    _$jscoverage['/router.js'].lineData[298]++;
    if (visit49_298_1(!vid)) {
      _$jscoverage['/router.js'].lineData[299]++;
      return;
    }
    _$jscoverage['/router.js'].lineData[301]++;
    dispatchByVid(vid);
  }
  _$jscoverage['/router.js'].lineData[314]++;
  exports.start = function(opts) {
  _$jscoverage['/router.js'].functionData[19]++;
  _$jscoverage['/router.js'].lineData[315]++;
  opts = visit50_315_1(opts || {});
  _$jscoverage['/router.js'].lineData[317]++;
  if (visit51_317_1(started)) {
    _$jscoverage['/router.js'].lineData[318]++;
    return visit52_318_1(opts.success && opts.success.call(exports));
  }
  _$jscoverage['/router.js'].lineData[322]++;
  opts.urlRoot = (visit53_322_1(opts.urlRoot || '')).replace(/\/$/, '');
  _$jscoverage['/router.js'].lineData[323]++;
  useHash = opts.useHash;
  _$jscoverage['/router.js'].lineData[324]++;
  urlRoot = opts.urlRoot;
  _$jscoverage['/router.js'].lineData[326]++;
  if (visit54_326_1(useHash === undefined)) {
    _$jscoverage['/router.js'].lineData[327]++;
    useHash = true;
  }
  _$jscoverage['/router.js'].lineData[332]++;
  if (visit55_332_1(opts.useHashChange)) {
    _$jscoverage['/router.js'].lineData[333]++;
    supportNativeHistory = false;
  }
  _$jscoverage['/router.js'].lineData[336]++;
  var locPath = location.pathname, href = location.href, hash = getUrlForRouter(), hashIsValid = location.hash.match(/#!.+/);
  _$jscoverage['/router.js'].lineData[341]++;
  if (visit56_341_1(!useHash)) {
    _$jscoverage['/router.js'].lineData[342]++;
    if (visit57_342_1(supportNativeHistory)) {
      _$jscoverage['/router.js'].lineData[348]++;
      if (visit58_348_1(hashIsValid)) {
        _$jscoverage['/router.js'].lineData[349]++;
        if (visit59_349_1(utils.equalsIgnoreSlash(locPath, urlRoot))) {
          _$jscoverage['/router.js'].lineData[351]++;
          history.replaceState({}, '', utils.getFullPath(hash, urlRoot));
          _$jscoverage['/router.js'].lineData[352]++;
          opts.triggerRoute = 1;
        } else {
          _$jscoverage['/router.js'].lineData[354]++;
          S.error('router: location path must be same with urlRoot!');
        }
      }
    } else {
      _$jscoverage['/router.js'].lineData[363]++;
      if (visit60_363_1(!utils.equalsIgnoreSlash(locPath, urlRoot))) {
        _$jscoverage['/router.js'].lineData[364]++;
        location.replace(utils.addEndSlash(urlRoot) + '#!' + hash);
        _$jscoverage['/router.js'].lineData[365]++;
        return undefined;
      } else {
        _$jscoverage['/router.js'].lineData[367]++;
        useHash = true;
      }
    }
  }
  _$jscoverage['/router.js'].lineData[372]++;
  setTimeout(function() {
  _$jscoverage['/router.js'].functionData[20]++;
  _$jscoverage['/router.js'].lineData[373]++;
  var needReplaceHistory = supportNativeHistory;
  _$jscoverage['/router.js'].lineData[374]++;
  if (visit61_374_1(supportNativeHistory)) {
    _$jscoverage['/router.js'].lineData[375]++;
    DomEvent.on(win, 'popstate', onPopState);
  } else {
    _$jscoverage['/router.js'].lineData[379]++;
    DomEvent.on(win, 'hashchange', onHashChange);
    _$jscoverage['/router.js'].lineData[381]++;
    opts.triggerRoute = 1;
  }
  _$jscoverage['/router.js'].lineData[383]++;
  if (visit62_383_1(useHash)) {
    _$jscoverage['/router.js'].lineData[384]++;
    if (visit63_384_1(!getUrlForRouter())) {
      _$jscoverage['/router.js'].lineData[385]++;
      exports.navigate('/', {
  replace: 1});
      _$jscoverage['/router.js'].lineData[388]++;
      opts.triggerRoute = 0;
      _$jscoverage['/router.js'].lineData[389]++;
      needReplaceHistory = false;
    } else {
      _$jscoverage['/router.js'].lineData[390]++;
      if (visit64_390_1(!supportNativeHistory && visit65_390_2(getVidFromUrlWithHash(href) !== viewUniqueId))) {
        _$jscoverage['/router.js'].lineData[391]++;
        setPathByHash(utils.getHash(new S.Uri(href)), true);
        _$jscoverage['/router.js'].lineData[392]++;
        opts.triggerRoute = 0;
      } else {
        _$jscoverage['/router.js'].lineData[393]++;
        if (visit66_393_1(supportNativeHistory && utils.hasVid(href))) {
          _$jscoverage['/router.js'].lineData[394]++;
          location.replace(href = utils.removeVid(href));
        }
      }
    }
  }
  _$jscoverage['/router.js'].lineData[397]++;
  if (visit67_397_1(needReplaceHistory)) {
    _$jscoverage['/router.js'].lineData[399]++;
    history.replaceState({
  vid: viewUniqueId}, '', href);
  }
  _$jscoverage['/router.js'].lineData[406]++;
  if (visit68_406_1(opts.triggerRoute)) {
    _$jscoverage['/router.js'].lineData[407]++;
    dispatch();
  }
  _$jscoverage['/router.js'].lineData[409]++;
  if (visit69_409_1(opts.success)) {
    _$jscoverage['/router.js'].lineData[410]++;
    opts.success();
  }
}, BREATH_INTERVAL);
  _$jscoverage['/router.js'].lineData[414]++;
  started = true;
  _$jscoverage['/router.js'].lineData[415]++;
  return exports;
};
  _$jscoverage['/router.js'].lineData[419]++;
  exports.stop = function() {
  _$jscoverage['/router.js'].functionData[21]++;
  _$jscoverage['/router.js'].lineData[420]++;
  started = false;
  _$jscoverage['/router.js'].lineData[421]++;
  DomEvent.detach(win, 'hashchange', onHashChange);
  _$jscoverage['/router.js'].lineData[422]++;
  DomEvent.detach(win, 'popstate', onPopState);
};
});
