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
if (! _$jscoverage['/attribute.js']) {
  _$jscoverage['/attribute.js'] = {};
  _$jscoverage['/attribute.js'].lineData = [];
  _$jscoverage['/attribute.js'].lineData[6] = 0;
  _$jscoverage['/attribute.js'].lineData[8] = 0;
  _$jscoverage['/attribute.js'].lineData[10] = 0;
  _$jscoverage['/attribute.js'].lineData[12] = 0;
  _$jscoverage['/attribute.js'].lineData[13] = 0;
  _$jscoverage['/attribute.js'].lineData[14] = 0;
  _$jscoverage['/attribute.js'].lineData[16] = 0;
  _$jscoverage['/attribute.js'].lineData[19] = 0;
  _$jscoverage['/attribute.js'].lineData[20] = 0;
  _$jscoverage['/attribute.js'].lineData[23] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[29] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[38] = 0;
  _$jscoverage['/attribute.js'].lineData[39] = 0;
  _$jscoverage['/attribute.js'].lineData[40] = 0;
  _$jscoverage['/attribute.js'].lineData[41] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[49] = 0;
  _$jscoverage['/attribute.js'].lineData[50] = 0;
  _$jscoverage['/attribute.js'].lineData[53] = 0;
  _$jscoverage['/attribute.js'].lineData[55] = 0;
  _$jscoverage['/attribute.js'].lineData[61] = 0;
  _$jscoverage['/attribute.js'].lineData[62] = 0;
  _$jscoverage['/attribute.js'].lineData[64] = 0;
  _$jscoverage['/attribute.js'].lineData[65] = 0;
  _$jscoverage['/attribute.js'].lineData[66] = 0;
  _$jscoverage['/attribute.js'].lineData[68] = 0;
  _$jscoverage['/attribute.js'].lineData[69] = 0;
  _$jscoverage['/attribute.js'].lineData[71] = 0;
  _$jscoverage['/attribute.js'].lineData[74] = 0;
  _$jscoverage['/attribute.js'].lineData[77] = 0;
  _$jscoverage['/attribute.js'].lineData[78] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[81] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[92] = 0;
  _$jscoverage['/attribute.js'].lineData[93] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[95] = 0;
  _$jscoverage['/attribute.js'].lineData[97] = 0;
  _$jscoverage['/attribute.js'].lineData[99] = 0;
  _$jscoverage['/attribute.js'].lineData[101] = 0;
  _$jscoverage['/attribute.js'].lineData[104] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[109] = 0;
  _$jscoverage['/attribute.js'].lineData[110] = 0;
  _$jscoverage['/attribute.js'].lineData[111] = 0;
  _$jscoverage['/attribute.js'].lineData[116] = 0;
  _$jscoverage['/attribute.js'].lineData[117] = 0;
  _$jscoverage['/attribute.js'].lineData[123] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[127] = 0;
  _$jscoverage['/attribute.js'].lineData[129] = 0;
  _$jscoverage['/attribute.js'].lineData[130] = 0;
  _$jscoverage['/attribute.js'].lineData[135] = 0;
  _$jscoverage['/attribute.js'].lineData[136] = 0;
  _$jscoverage['/attribute.js'].lineData[137] = 0;
  _$jscoverage['/attribute.js'].lineData[138] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[143] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[156] = 0;
  _$jscoverage['/attribute.js'].lineData[157] = 0;
  _$jscoverage['/attribute.js'].lineData[158] = 0;
  _$jscoverage['/attribute.js'].lineData[161] = 0;
  _$jscoverage['/attribute.js'].lineData[162] = 0;
  _$jscoverage['/attribute.js'].lineData[166] = 0;
  _$jscoverage['/attribute.js'].lineData[169] = 0;
  _$jscoverage['/attribute.js'].lineData[171] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[174] = 0;
  _$jscoverage['/attribute.js'].lineData[183] = 0;
  _$jscoverage['/attribute.js'].lineData[185] = 0;
  _$jscoverage['/attribute.js'].lineData[186] = 0;
  _$jscoverage['/attribute.js'].lineData[190] = 0;
  _$jscoverage['/attribute.js'].lineData[191] = 0;
  _$jscoverage['/attribute.js'].lineData[192] = 0;
  _$jscoverage['/attribute.js'].lineData[193] = 0;
  _$jscoverage['/attribute.js'].lineData[194] = 0;
  _$jscoverage['/attribute.js'].lineData[201] = 0;
  _$jscoverage['/attribute.js'].lineData[209] = 0;
  _$jscoverage['/attribute.js'].lineData[216] = 0;
  _$jscoverage['/attribute.js'].lineData[225] = 0;
  _$jscoverage['/attribute.js'].lineData[233] = 0;
  _$jscoverage['/attribute.js'].lineData[237] = 0;
  _$jscoverage['/attribute.js'].lineData[238] = 0;
  _$jscoverage['/attribute.js'].lineData[240] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[266] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[270] = 0;
  _$jscoverage['/attribute.js'].lineData[280] = 0;
  _$jscoverage['/attribute.js'].lineData[281] = 0;
  _$jscoverage['/attribute.js'].lineData[282] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[296] = 0;
  _$jscoverage['/attribute.js'].lineData[304] = 0;
  _$jscoverage['/attribute.js'].lineData[305] = 0;
  _$jscoverage['/attribute.js'].lineData[306] = 0;
  _$jscoverage['/attribute.js'].lineData[308] = 0;
  _$jscoverage['/attribute.js'].lineData[309] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[313] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[328] = 0;
  _$jscoverage['/attribute.js'].lineData[329] = 0;
  _$jscoverage['/attribute.js'].lineData[330] = 0;
  _$jscoverage['/attribute.js'].lineData[331] = 0;
  _$jscoverage['/attribute.js'].lineData[335] = 0;
  _$jscoverage['/attribute.js'].lineData[338] = 0;
  _$jscoverage['/attribute.js'].lineData[339] = 0;
  _$jscoverage['/attribute.js'].lineData[342] = 0;
  _$jscoverage['/attribute.js'].lineData[343] = 0;
  _$jscoverage['/attribute.js'].lineData[344] = 0;
  _$jscoverage['/attribute.js'].lineData[346] = 0;
  _$jscoverage['/attribute.js'].lineData[348] = 0;
  _$jscoverage['/attribute.js'].lineData[349] = 0;
  _$jscoverage['/attribute.js'].lineData[351] = 0;
  _$jscoverage['/attribute.js'].lineData[355] = 0;
  _$jscoverage['/attribute.js'].lineData[356] = 0;
  _$jscoverage['/attribute.js'].lineData[357] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[359] = 0;
  _$jscoverage['/attribute.js'].lineData[361] = 0;
  _$jscoverage['/attribute.js'].lineData[362] = 0;
  _$jscoverage['/attribute.js'].lineData[371] = 0;
  _$jscoverage['/attribute.js'].lineData[373] = 0;
  _$jscoverage['/attribute.js'].lineData[375] = 0;
  _$jscoverage['/attribute.js'].lineData[377] = 0;
  _$jscoverage['/attribute.js'].lineData[378] = 0;
  _$jscoverage['/attribute.js'].lineData[379] = 0;
  _$jscoverage['/attribute.js'].lineData[381] = 0;
  _$jscoverage['/attribute.js'].lineData[383] = 0;
  _$jscoverage['/attribute.js'].lineData[392] = 0;
  _$jscoverage['/attribute.js'].lineData[402] = 0;
  _$jscoverage['/attribute.js'].lineData[403] = 0;
  _$jscoverage['/attribute.js'].lineData[406] = 0;
  _$jscoverage['/attribute.js'].lineData[407] = 0;
  _$jscoverage['/attribute.js'].lineData[410] = 0;
  _$jscoverage['/attribute.js'].lineData[411] = 0;
  _$jscoverage['/attribute.js'].lineData[415] = 0;
  _$jscoverage['/attribute.js'].lineData[417] = 0;
  _$jscoverage['/attribute.js'].lineData[426] = 0;
  _$jscoverage['/attribute.js'].lineData[433] = 0;
  _$jscoverage['/attribute.js'].lineData[434] = 0;
  _$jscoverage['/attribute.js'].lineData[435] = 0;
  _$jscoverage['/attribute.js'].lineData[438] = 0;
  _$jscoverage['/attribute.js'].lineData[439] = 0;
  _$jscoverage['/attribute.js'].lineData[443] = 0;
  _$jscoverage['/attribute.js'].lineData[448] = 0;
  _$jscoverage['/attribute.js'].lineData[449] = 0;
  _$jscoverage['/attribute.js'].lineData[452] = 0;
  _$jscoverage['/attribute.js'].lineData[453] = 0;
  _$jscoverage['/attribute.js'].lineData[456] = 0;
  _$jscoverage['/attribute.js'].lineData[457] = 0;
  _$jscoverage['/attribute.js'].lineData[460] = 0;
  _$jscoverage['/attribute.js'].lineData[472] = 0;
  _$jscoverage['/attribute.js'].lineData[474] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[477] = 0;
  _$jscoverage['/attribute.js'].lineData[480] = 0;
  _$jscoverage['/attribute.js'].lineData[484] = 0;
  _$jscoverage['/attribute.js'].lineData[487] = 0;
  _$jscoverage['/attribute.js'].lineData[491] = 0;
  _$jscoverage['/attribute.js'].lineData[492] = 0;
  _$jscoverage['/attribute.js'].lineData[495] = 0;
  _$jscoverage['/attribute.js'].lineData[496] = 0;
  _$jscoverage['/attribute.js'].lineData[501] = 0;
  _$jscoverage['/attribute.js'].lineData[502] = 0;
  _$jscoverage['/attribute.js'].lineData[507] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[509] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[515] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[519] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[525] = 0;
  _$jscoverage['/attribute.js'].lineData[527] = 0;
  _$jscoverage['/attribute.js'].lineData[528] = 0;
  _$jscoverage['/attribute.js'].lineData[530] = 0;
  _$jscoverage['/attribute.js'].lineData[531] = 0;
  _$jscoverage['/attribute.js'].lineData[532] = 0;
  _$jscoverage['/attribute.js'].lineData[534] = 0;
  _$jscoverage['/attribute.js'].lineData[537] = 0;
  _$jscoverage['/attribute.js'].lineData[538] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[541] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
}
if (! _$jscoverage['/attribute.js'].functionData) {
  _$jscoverage['/attribute.js'].functionData = [];
  _$jscoverage['/attribute.js'].functionData[0] = 0;
  _$jscoverage['/attribute.js'].functionData[1] = 0;
  _$jscoverage['/attribute.js'].functionData[2] = 0;
  _$jscoverage['/attribute.js'].functionData[3] = 0;
  _$jscoverage['/attribute.js'].functionData[4] = 0;
  _$jscoverage['/attribute.js'].functionData[5] = 0;
  _$jscoverage['/attribute.js'].functionData[6] = 0;
  _$jscoverage['/attribute.js'].functionData[7] = 0;
  _$jscoverage['/attribute.js'].functionData[8] = 0;
  _$jscoverage['/attribute.js'].functionData[9] = 0;
  _$jscoverage['/attribute.js'].functionData[10] = 0;
  _$jscoverage['/attribute.js'].functionData[11] = 0;
  _$jscoverage['/attribute.js'].functionData[12] = 0;
  _$jscoverage['/attribute.js'].functionData[13] = 0;
  _$jscoverage['/attribute.js'].functionData[14] = 0;
  _$jscoverage['/attribute.js'].functionData[15] = 0;
  _$jscoverage['/attribute.js'].functionData[16] = 0;
  _$jscoverage['/attribute.js'].functionData[17] = 0;
  _$jscoverage['/attribute.js'].functionData[18] = 0;
  _$jscoverage['/attribute.js'].functionData[19] = 0;
  _$jscoverage['/attribute.js'].functionData[20] = 0;
  _$jscoverage['/attribute.js'].functionData[21] = 0;
  _$jscoverage['/attribute.js'].functionData[22] = 0;
  _$jscoverage['/attribute.js'].functionData[23] = 0;
  _$jscoverage['/attribute.js'].functionData[24] = 0;
  _$jscoverage['/attribute.js'].functionData[25] = 0;
  _$jscoverage['/attribute.js'].functionData[26] = 0;
}
if (! _$jscoverage['/attribute.js'].branchData) {
  _$jscoverage['/attribute.js'].branchData = {};
  _$jscoverage['/attribute.js'].branchData['13'] = [];
  _$jscoverage['/attribute.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['20'] = [];
  _$jscoverage['/attribute.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['29'] = [];
  _$jscoverage['/attribute.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['40'] = [];
  _$jscoverage['/attribute.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['43'] = [];
  _$jscoverage['/attribute.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['51'] = [];
  _$jscoverage['/attribute.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['51'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['64'] = [];
  _$jscoverage['/attribute.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'] = [];
  _$jscoverage['/attribute.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['68'] = [];
  _$jscoverage['/attribute.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['80'] = [];
  _$jscoverage['/attribute.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['93'] = [];
  _$jscoverage['/attribute.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['94'] = [];
  _$jscoverage['/attribute.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['106'] = [];
  _$jscoverage['/attribute.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['129'] = [];
  _$jscoverage['/attribute.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['135'] = [];
  _$jscoverage['/attribute.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['136'] = [];
  _$jscoverage['/attribute.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['138'] = [];
  _$jscoverage['/attribute.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['156'] = [];
  _$jscoverage['/attribute.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['157'] = [];
  _$jscoverage['/attribute.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['161'] = [];
  _$jscoverage['/attribute.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['171'] = [];
  _$jscoverage['/attribute.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['185'] = [];
  _$jscoverage['/attribute.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['190'] = [];
  _$jscoverage['/attribute.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['193'] = [];
  _$jscoverage['/attribute.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['225'] = [];
  _$jscoverage['/attribute.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['265'] = [];
  _$jscoverage['/attribute.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['284'] = [];
  _$jscoverage['/attribute.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['308'] = [];
  _$jscoverage['/attribute.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['328'] = [];
  _$jscoverage['/attribute.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['330'] = [];
  _$jscoverage['/attribute.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['338'] = [];
  _$jscoverage['/attribute.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['342'] = [];
  _$jscoverage['/attribute.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['343'] = [];
  _$jscoverage['/attribute.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['361'] = [];
  _$jscoverage['/attribute.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['373'] = [];
  _$jscoverage['/attribute.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['377'] = [];
  _$jscoverage['/attribute.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['378'] = [];
  _$jscoverage['/attribute.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['402'] = [];
  _$jscoverage['/attribute.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['406'] = [];
  _$jscoverage['/attribute.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['410'] = [];
  _$jscoverage['/attribute.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['433'] = [];
  _$jscoverage['/attribute.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['448'] = [];
  _$jscoverage['/attribute.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['452'] = [];
  _$jscoverage['/attribute.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['456'] = [];
  _$jscoverage['/attribute.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['474'] = [];
  _$jscoverage['/attribute.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['475'] = [];
  _$jscoverage['/attribute.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['507'] = [];
  _$jscoverage['/attribute.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['509'] = [];
  _$jscoverage['/attribute.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['530'] = [];
  _$jscoverage['/attribute.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['537'] = [];
  _$jscoverage['/attribute.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['540'] = [];
  _$jscoverage['/attribute.js'].branchData['540'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['540'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['540'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['540'][3].init(148, 10, 'e !== true');
function visit58_540_3(result) {
  _$jscoverage['/attribute.js'].branchData['540'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['540'][2].init(129, 15, 'e !== undefined');
function visit57_540_2(result) {
  _$jscoverage['/attribute.js'].branchData['540'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['540'][1].init(129, 29, 'e !== undefined && e !== true');
function visit56_540_1(result) {
  _$jscoverage['/attribute.js'].branchData['540'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['537'][1].init(429, 52, 'validator && (validator = normalFn(self, validator))');
function visit55_537_1(result) {
  _$jscoverage['/attribute.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['530'][1].init(171, 4, 'path');
function visit54_530_1(result) {
  _$jscoverage['/attribute.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['509'][1].init(53, 85, 'val !== undefined');
function visit53_509_1(result) {
  _$jscoverage['/attribute.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['507'][1].init(165, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit52_507_1(result) {
  _$jscoverage['/attribute.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['475'][1].init(21, 18, 'self.hasAttr(name)');
function visit51_475_1(result) {
  _$jscoverage['/attribute.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['474'][1].init(47, 23, 'typeof name == \'string\'');
function visit50_474_1(result) {
  _$jscoverage['/attribute.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['456'][1].init(947, 4, 'path');
function visit49_456_1(result) {
  _$jscoverage['/attribute.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['452'][2].init(857, 17, 'ret !== undefined');
function visit48_452_2(result) {
  _$jscoverage['/attribute.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['452'][1].init(834, 40, '!(name in attrVals) && ret !== undefined');
function visit47_452_1(result) {
  _$jscoverage['/attribute.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['448'][1].init(704, 43, 'getter && (getter = normalFn(self, getter))');
function visit46_448_1(result) {
  _$jscoverage['/attribute.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['433'][1].init(199, 24, 'name.indexOf(dot) !== -1');
function visit45_433_1(result) {
  _$jscoverage['/attribute.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['410'][1].init(700, 22, 'setValue !== undefined');
function visit44_410_1(result) {
  _$jscoverage['/attribute.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['406'][1].init(615, 20, 'setValue === INVALID');
function visit43_406_1(result) {
  _$jscoverage['/attribute.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['402'][1].init(478, 43, 'setter && (setter = normalFn(self, setter))');
function visit42_402_1(result) {
  _$jscoverage['/attribute.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['378'][1].init(21, 13, 'opts[\'error\']');
function visit41_378_1(result) {
  _$jscoverage['/attribute.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['377'][1].init(1806, 15, 'e !== undefined');
function visit40_377_1(result) {
  _$jscoverage['/attribute.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['373'][1].init(1701, 10, 'opts || {}');
function visit39_373_1(result) {
  _$jscoverage['/attribute.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['361'][1].init(1255, 16, 'attrNames.length');
function visit38_361_1(result) {
  _$jscoverage['/attribute.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['343'][1].init(25, 13, 'opts[\'error\']');
function visit37_343_1(result) {
  _$jscoverage['/attribute.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['342'][1].init(517, 13, 'errors.length');
function visit36_342_1(result) {
  _$jscoverage['/attribute.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['338'][1].init(129, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit35_338_1(result) {
  _$jscoverage['/attribute.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['330'][1].init(54, 10, 'opts || {}');
function visit34_330_1(result) {
  _$jscoverage['/attribute.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['328'][1].init(46, 21, 'S.isPlainObject(name)');
function visit33_328_1(result) {
  _$jscoverage['/attribute.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['308'][1].init(138, 18, 'self.hasAttr(name)');
function visit32_308_1(result) {
  _$jscoverage['/attribute.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['284'][1].init(172, 13, 'initialValues');
function visit31_284_1(result) {
  _$jscoverage['/attribute.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['265'][1].init(152, 18, 'attr = attrs[name]');
function visit30_265_1(result) {
  _$jscoverage['/attribute.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['225'][1].init(20, 35, 'this.__attrs || (this.__attrs = {})');
function visit29_225_1(result) {
  _$jscoverage['/attribute.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['193'][1].init(156, 5, 'attrs');
function visit28_193_1(result) {
  _$jscoverage['/attribute.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['190'][1].init(509, 15, '!opts[\'silent\']');
function visit27_190_1(result) {
  _$jscoverage['/attribute.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['185'][1].init(417, 13, 'ret === FALSE');
function visit26_185_1(result) {
  _$jscoverage['/attribute.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['171'][1].init(60, 17, 'e.target !== this');
function visit25_171_1(result) {
  _$jscoverage['/attribute.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['161'][1].init(17, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit24_161_1(result) {
  _$jscoverage['/attribute.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['157'][1].init(17, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit23_157_1(result) {
  _$jscoverage['/attribute.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['156'][1].init(1033, 14, 'opts[\'silent\']');
function visit22_156_1(result) {
  _$jscoverage['/attribute.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['138'][2].init(113, 16, 'subVal === value');
function visit21_138_2(result) {
  _$jscoverage['/attribute.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['138'][1].init(105, 24, 'path && subVal === value');
function visit20_138_1(result) {
  _$jscoverage['/attribute.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['136'][2].init(26, 17, 'prevVal === value');
function visit19_136_2(result) {
  _$jscoverage['/attribute.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['136'][1].init(17, 26, '!path && prevVal === value');
function visit18_136_1(result) {
  _$jscoverage['/attribute.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['135'][1].init(466, 11, '!opts.force');
function visit17_135_1(result) {
  _$jscoverage['/attribute.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['129'][1].init(297, 4, 'path');
function visit16_129_1(result) {
  _$jscoverage['/attribute.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['106'][1].init(88, 22, 'defaultBeforeFns[name]');
function visit15_106_1(result) {
  _$jscoverage['/attribute.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['94'][1].init(17, 21, 'prevVal === undefined');
function visit14_94_1(result) {
  _$jscoverage['/attribute.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['93'][1].init(38, 4, 'path');
function visit13_93_1(result) {
  _$jscoverage['/attribute.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['80'][1].init(32, 24, 'name.indexOf(\'.\') !== -1');
function visit12_80_1(result) {
  _$jscoverage['/attribute.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['68'][1].init(107, 14, 'o != undefined');
function visit11_68_1(result) {
  _$jscoverage['/attribute.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][1].init(29, 7, 'i < len');
function visit10_65_1(result) {
  _$jscoverage['/attribute.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['64'][1].init(67, 8, 'len >= 0');
function visit9_64_1(result) {
  _$jscoverage['/attribute.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['51'][3].init(17, 7, 'i < len');
function visit8_51_3(result) {
  _$jscoverage['/attribute.js'].branchData['51'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['51'][2].init(58, 14, 'o != undefined');
function visit7_51_2(result) {
  _$jscoverage['/attribute.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['51'][1].init(47, 25, 'o != undefined && i < len');
function visit6_51_1(result) {
  _$jscoverage['/attribute.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['43'][1].init(125, 9, 'ret || {}');
function visit5_43_1(result) {
  _$jscoverage['/attribute.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['40'][1].init(42, 20, '!doNotCreate && !ret');
function visit4_40_1(result) {
  _$jscoverage['/attribute.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['29'][1].init(20, 16, 'attrName || name');
function visit3_29_1(result) {
  _$jscoverage['/attribute.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['20'][1].init(16, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit2_20_1(result) {
  _$jscoverage['/attribute.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['13'][1].init(13, 25, 'typeof method == \'string\'');
function visit1_13_1(result) {
  _$jscoverage['/attribute.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[10]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[12]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[13]++;
    if (visit1_13_1(typeof method == 'string')) {
      _$jscoverage['/attribute.js'].lineData[14]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[16]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[19]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[2]++;
    _$jscoverage['/attribute.js'].lineData[20]++;
    return visit2_20_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[23]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[24]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[28]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[29]++;
    attrName = visit3_29_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[30]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[38]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[39]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[40]++;
    if (visit4_40_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[41]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[43]++;
    return visit5_43_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[49]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[50]++;
    for (var i = 0, len = path.length; visit6_51_1(visit7_51_2(o != undefined) && visit8_51_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[53]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[55]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[61]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[62]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[64]++;
    if (visit9_64_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[65]++;
      for (var i = 0; visit10_65_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[66]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[68]++;
      if (visit11_68_1(o != undefined)) {
        _$jscoverage['/attribute.js'].lineData[69]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[71]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[74]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[77]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[78]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[80]++;
    if (visit12_80_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[81]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[82]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[85]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[91]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[92]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[93]++;
    if (visit13_93_1(path)) {
      _$jscoverage['/attribute.js'].lineData[94]++;
      if (visit14_94_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[95]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[97]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[99]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[101]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[104]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[105]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[106]++;
    if (visit15_106_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[107]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[109]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[110]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[111]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/attribute.js'].lineData[116]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[117]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[123]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[124]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[125]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[127]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[129]++;
    if (visit16_129_1(path)) {
      _$jscoverage['/attribute.js'].lineData[130]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[135]++;
    if (visit17_135_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[136]++;
      if (visit18_136_1(!path && visit19_136_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[137]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[138]++;
        if (visit20_138_1(path && visit21_138_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[139]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[143]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[145]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[156]++;
    if (visit22_156_1(opts['silent'])) {
      _$jscoverage['/attribute.js'].lineData[157]++;
      if (visit23_157_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[158]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[161]++;
      if (visit24_161_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[162]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[166]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[169]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[171]++;
    if (visit25_171_1(e.target !== this)) {
      _$jscoverage['/attribute.js'].lineData[172]++;
      return undefined;
    }
    _$jscoverage['/attribute.js'].lineData[174]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[183]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[185]++;
    if (visit26_185_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[186]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[190]++;
    if (visit27_190_1(!opts['silent'])) {
      _$jscoverage['/attribute.js'].lineData[191]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[192]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[193]++;
      if (visit28_193_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[194]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[201]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[209]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[216]++;
  return {
  INVALID: INVALID, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[13]++;
  _$jscoverage['/attribute.js'].lineData[225]++;
  return visit29_225_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[14]++;
  _$jscoverage['/attribute.js'].lineData[233]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[237]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[238]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[240]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[15]++;
  _$jscoverage['/attribute.js'].lineData[261]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[265]++;
  if (visit30_265_1(attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[266]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[268]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[270]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[16]++;
  _$jscoverage['/attribute.js'].lineData[280]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[281]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[282]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[284]++;
  if (visit31_284_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[285]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[287]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[18]++;
  _$jscoverage['/attribute.js'].lineData[296]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[304]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[305]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[306]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[308]++;
  if (visit32_308_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[309]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[310]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[313]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[327]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[328]++;
  if (visit33_328_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[329]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[330]++;
    opts = visit34_330_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[331]++;
    var all = Object(name), attrs = [], e, errors = [];
    _$jscoverage['/attribute.js'].lineData[335]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[338]++;
      if (visit35_338_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[339]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[342]++;
    if (visit36_342_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[343]++;
      if (visit37_343_1(opts['error'])) {
        _$jscoverage['/attribute.js'].lineData[344]++;
        opts['error'](errors);
      }
      _$jscoverage['/attribute.js'].lineData[346]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[348]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[349]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[351]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[355]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[21]++;
  _$jscoverage['/attribute.js'].lineData[356]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[357]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[358]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[359]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[361]++;
    if (visit38_361_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[362]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[371]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[373]++;
  opts = visit39_373_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[375]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[377]++;
  if (visit40_377_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[378]++;
    if (visit41_378_1(opts['error'])) {
      _$jscoverage['/attribute.js'].lineData[379]++;
      opts['error'](e);
    }
    _$jscoverage['/attribute.js'].lineData[381]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[383]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[22]++;
  _$jscoverage['/attribute.js'].lineData[392]++;
  var self = this, setValue = undefined, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig['setter'];
  _$jscoverage['/attribute.js'].lineData[402]++;
  if (visit42_402_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[403]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[406]++;
  if (visit43_406_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[407]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[410]++;
  if (visit44_410_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[411]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[415]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[417]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[426]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[433]++;
  if (visit45_433_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[434]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[435]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[438]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[439]++;
  getter = attrConfig['getter'];
  _$jscoverage['/attribute.js'].lineData[443]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[448]++;
  if (visit46_448_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[449]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[452]++;
  if (visit47_452_1(!(name in attrVals) && visit48_452_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[453]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[456]++;
  if (visit49_456_1(path)) {
    _$jscoverage['/attribute.js'].lineData[457]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[460]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[472]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[474]++;
  if (visit50_474_1(typeof name == 'string')) {
    _$jscoverage['/attribute.js'].lineData[475]++;
    if (visit51_475_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[477]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[480]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[484]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[487]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[491]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[492]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[495]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[496]++;
  return self;
}};
  _$jscoverage['/attribute.js'].lineData[501]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[25]++;
    _$jscoverage['/attribute.js'].lineData[502]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[507]++;
    if (visit52_507_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[508]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[509]++;
      if (visit53_509_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[513]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[515]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[516]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[519]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[522]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[26]++;
    _$jscoverage['/attribute.js'].lineData[523]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[525]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[527]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[528]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[530]++;
    if (visit54_530_1(path)) {
      _$jscoverage['/attribute.js'].lineData[531]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[532]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[534]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig['validator'];
    _$jscoverage['/attribute.js'].lineData[537]++;
    if (visit55_537_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[538]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[540]++;
      if (visit56_540_1(visit57_540_2(e !== undefined) && visit58_540_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[541]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[544]++;
    return undefined;
  }
});
