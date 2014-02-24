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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[11] = 0;
  _$jscoverage['/compiler.js'].lineData[14] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[18] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[22] = 0;
  _$jscoverage['/compiler.js'].lineData[24] = 0;
  _$jscoverage['/compiler.js'].lineData[26] = 0;
  _$jscoverage['/compiler.js'].lineData[28] = 0;
  _$jscoverage['/compiler.js'].lineData[34] = 0;
  _$jscoverage['/compiler.js'].lineData[35] = 0;
  _$jscoverage['/compiler.js'].lineData[38] = 0;
  _$jscoverage['/compiler.js'].lineData[39] = 0;
  _$jscoverage['/compiler.js'].lineData[40] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[45] = 0;
  _$jscoverage['/compiler.js'].lineData[47] = 0;
  _$jscoverage['/compiler.js'].lineData[50] = 0;
  _$jscoverage['/compiler.js'].lineData[51] = 0;
  _$jscoverage['/compiler.js'].lineData[53] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[60] = 0;
  _$jscoverage['/compiler.js'].lineData[61] = 0;
  _$jscoverage['/compiler.js'].lineData[64] = 0;
  _$jscoverage['/compiler.js'].lineData[65] = 0;
  _$jscoverage['/compiler.js'].lineData[68] = 0;
  _$jscoverage['/compiler.js'].lineData[71] = 0;
  _$jscoverage['/compiler.js'].lineData[78] = 0;
  _$jscoverage['/compiler.js'].lineData[79] = 0;
  _$jscoverage['/compiler.js'].lineData[80] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[86] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[92] = 0;
  _$jscoverage['/compiler.js'].lineData[96] = 0;
  _$jscoverage['/compiler.js'].lineData[97] = 0;
  _$jscoverage['/compiler.js'].lineData[100] = 0;
  _$jscoverage['/compiler.js'].lineData[105] = 0;
  _$jscoverage['/compiler.js'].lineData[106] = 0;
  _$jscoverage['/compiler.js'].lineData[107] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[111] = 0;
  _$jscoverage['/compiler.js'].lineData[118] = 0;
  _$jscoverage['/compiler.js'].lineData[122] = 0;
  _$jscoverage['/compiler.js'].lineData[124] = 0;
  _$jscoverage['/compiler.js'].lineData[125] = 0;
  _$jscoverage['/compiler.js'].lineData[126] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[131] = 0;
  _$jscoverage['/compiler.js'].lineData[132] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[142] = 0;
  _$jscoverage['/compiler.js'].lineData[148] = 0;
  _$jscoverage['/compiler.js'].lineData[149] = 0;
  _$jscoverage['/compiler.js'].lineData[151] = 0;
  _$jscoverage['/compiler.js'].lineData[152] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[155] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[161] = 0;
  _$jscoverage['/compiler.js'].lineData[166] = 0;
  _$jscoverage['/compiler.js'].lineData[169] = 0;
  _$jscoverage['/compiler.js'].lineData[170] = 0;
  _$jscoverage['/compiler.js'].lineData[171] = 0;
  _$jscoverage['/compiler.js'].lineData[172] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[179] = 0;
  _$jscoverage['/compiler.js'].lineData[180] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[182] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[189] = 0;
  _$jscoverage['/compiler.js'].lineData[193] = 0;
  _$jscoverage['/compiler.js'].lineData[199] = 0;
  _$jscoverage['/compiler.js'].lineData[200] = 0;
  _$jscoverage['/compiler.js'].lineData[202] = 0;
  _$jscoverage['/compiler.js'].lineData[203] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[210] = 0;
  _$jscoverage['/compiler.js'].lineData[211] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[220] = 0;
  _$jscoverage['/compiler.js'].lineData[223] = 0;
  _$jscoverage['/compiler.js'].lineData[224] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[226] = 0;
  _$jscoverage['/compiler.js'].lineData[227] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[236] = 0;
  _$jscoverage['/compiler.js'].lineData[239] = 0;
  _$jscoverage['/compiler.js'].lineData[243] = 0;
  _$jscoverage['/compiler.js'].lineData[247] = 0;
  _$jscoverage['/compiler.js'].lineData[251] = 0;
  _$jscoverage['/compiler.js'].lineData[255] = 0;
  _$jscoverage['/compiler.js'].lineData[259] = 0;
  _$jscoverage['/compiler.js'].lineData[263] = 0;
  _$jscoverage['/compiler.js'].lineData[267] = 0;
  _$jscoverage['/compiler.js'].lineData[271] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[273] = 0;
  _$jscoverage['/compiler.js'].lineData[275] = 0;
  _$jscoverage['/compiler.js'].lineData[277] = 0;
  _$jscoverage['/compiler.js'].lineData[283] = 0;
  _$jscoverage['/compiler.js'].lineData[287] = 0;
  _$jscoverage['/compiler.js'].lineData[291] = 0;
  _$jscoverage['/compiler.js'].lineData[295] = 0;
  _$jscoverage['/compiler.js'].lineData[302] = 0;
  _$jscoverage['/compiler.js'].lineData[303] = 0;
  _$jscoverage['/compiler.js'].lineData[304] = 0;
  _$jscoverage['/compiler.js'].lineData[305] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[313] = 0;
  _$jscoverage['/compiler.js'].lineData[320] = 0;
  _$jscoverage['/compiler.js'].lineData[322] = 0;
  _$jscoverage['/compiler.js'].lineData[323] = 0;
  _$jscoverage['/compiler.js'].lineData[324] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[330] = 0;
  _$jscoverage['/compiler.js'].lineData[332] = 0;
  _$jscoverage['/compiler.js'].lineData[336] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[340] = 0;
  _$jscoverage['/compiler.js'].lineData[346] = 0;
  _$jscoverage['/compiler.js'].lineData[351] = 0;
  _$jscoverage['/compiler.js'].lineData[361] = 0;
  _$jscoverage['/compiler.js'].lineData[363] = 0;
  _$jscoverage['/compiler.js'].lineData[364] = 0;
  _$jscoverage['/compiler.js'].lineData[365] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[371] = 0;
  _$jscoverage['/compiler.js'].lineData[372] = 0;
  _$jscoverage['/compiler.js'].lineData[373] = 0;
  _$jscoverage['/compiler.js'].lineData[376] = 0;
  _$jscoverage['/compiler.js'].lineData[377] = 0;
  _$jscoverage['/compiler.js'].lineData[379] = 0;
  _$jscoverage['/compiler.js'].lineData[380] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[385] = 0;
  _$jscoverage['/compiler.js'].lineData[386] = 0;
  _$jscoverage['/compiler.js'].lineData[388] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[397] = 0;
  _$jscoverage['/compiler.js'].lineData[404] = 0;
  _$jscoverage['/compiler.js'].lineData[406] = 0;
  _$jscoverage['/compiler.js'].lineData[407] = 0;
  _$jscoverage['/compiler.js'].lineData[408] = 0;
  _$jscoverage['/compiler.js'].lineData[410] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[413] = 0;
  _$jscoverage['/compiler.js'].lineData[414] = 0;
  _$jscoverage['/compiler.js'].lineData[418] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[429] = 0;
  _$jscoverage['/compiler.js'].lineData[436] = 0;
  _$jscoverage['/compiler.js'].lineData[444] = 0;
  _$jscoverage['/compiler.js'].lineData[445] = 0;
  _$jscoverage['/compiler.js'].lineData[455] = 0;
  _$jscoverage['/compiler.js'].lineData[456] = 0;
  _$jscoverage['/compiler.js'].lineData[457] = 0;
  _$jscoverage['/compiler.js'].lineData[466] = 0;
  _$jscoverage['/compiler.js'].lineData[467] = 0;
  _$jscoverage['/compiler.js'].lineData[468] = 0;
  _$jscoverage['/compiler.js'].lineData[470] = 0;
  _$jscoverage['/compiler.js'].lineData[480] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['39'] = [];
  _$jscoverage['/compiler.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['53'] = [];
  _$jscoverage['/compiler.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['78'] = [];
  _$jscoverage['/compiler.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['81'] = [];
  _$jscoverage['/compiler.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['84'] = [];
  _$jscoverage['/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['86'] = [];
  _$jscoverage['/compiler.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['106'] = [];
  _$jscoverage['/compiler.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['110'] = [];
  _$jscoverage['/compiler.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['124'] = [];
  _$jscoverage['/compiler.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['125'] = [];
  _$jscoverage['/compiler.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['130'] = [];
  _$jscoverage['/compiler.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['151'] = [];
  _$jscoverage['/compiler.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['158'] = [];
  _$jscoverage['/compiler.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['169'] = [];
  _$jscoverage['/compiler.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['179'] = [];
  _$jscoverage['/compiler.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['202'] = [];
  _$jscoverage['/compiler.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['207'] = [];
  _$jscoverage['/compiler.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['212'] = [];
  _$jscoverage['/compiler.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['223'] = [];
  _$jscoverage['/compiler.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['228'] = [];
  _$jscoverage['/compiler.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['304'] = [];
  _$jscoverage['/compiler.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['322'] = [];
  _$jscoverage['/compiler.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['330'] = [];
  _$jscoverage['/compiler.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['336'] = [];
  _$jscoverage['/compiler.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['363'] = [];
  _$jscoverage['/compiler.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['371'] = [];
  _$jscoverage['/compiler.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['377'] = [];
  _$jscoverage['/compiler.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['379'] = [];
  _$jscoverage['/compiler.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['385'] = [];
  _$jscoverage['/compiler.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['406'] = [];
  _$jscoverage['/compiler.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['467'] = [];
  _$jscoverage['/compiler.js'].branchData['467'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['467'][1].init(64, 37, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit78_467_1(result) {
  _$jscoverage['/compiler.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['406'][1].init(300, 7, 'code[0]');
function visit77_406_1(result) {
  _$jscoverage['/compiler.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['385'][1].init(1230, 26, 'idString in nativeCommands');
function visit76_385_1(result) {
  _$jscoverage['/compiler.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['379'][1].init(49, 28, 'typeof parts[i] !== \'string\'');
function visit75_379_1(result) {
  _$jscoverage['/compiler.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['377'][1].init(985, 5, 'i < l');
function visit74_377_1(result) {
  _$jscoverage['/compiler.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['371'][1].init(716, 19, 'programNode.inverse');
function visit73_371_1(result) {
  _$jscoverage['/compiler.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['363'][1].init(439, 11, '!configName');
function visit72_363_1(result) {
  _$jscoverage['/compiler.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['336'][1].init(895, 26, 'idString in nativeCommands');
function visit71_336_1(result) {
  _$jscoverage['/compiler.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['330'][1].init(566, 22, 'idString === \'include\'');
function visit70_330_1(result) {
  _$jscoverage['/compiler.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['322'][1].init(291, 17, 'commandConfigCode');
function visit69_322_1(result) {
  _$jscoverage['/compiler.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['304'][1].init(419, 29, 'originalIdString === idString');
function visit68_304_1(result) {
  _$jscoverage['/compiler.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['228'][1].init(83, 17, 'nextIdNameCode[0]');
function visit67_228_1(result) {
  _$jscoverage['/compiler.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['223'][1].init(1160, 4, 'hash');
function visit66_223_1(result) {
  _$jscoverage['/compiler.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['212'][1].init(91, 17, 'nextIdNameCode[0]');
function visit65_212_1(result) {
  _$jscoverage['/compiler.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['207'][1].init(376, 6, 'params');
function visit64_207_1(result) {
  _$jscoverage['/compiler.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['202'][1].init(221, 14, 'params || hash');
function visit63_202_1(result) {
  _$jscoverage['/compiler.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['179'][1].init(1211, 15, '!name1 && name2');
function visit62_179_1(result) {
  _$jscoverage['/compiler.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['169'][1].init(878, 15, 'name1 && !name2');
function visit61_169_1(result) {
  _$jscoverage['/compiler.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['158'][1].init(483, 16, '!name1 && !name2');
function visit60_158_1(result) {
  _$jscoverage['/compiler.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['151'][1].init(252, 14, 'name1 && name2');
function visit59_151_1(result) {
  _$jscoverage['/compiler.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['130'][1].init(1005, 7, '!global');
function visit58_130_1(result) {
  _$jscoverage['/compiler.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['125'][1].init(58, 7, 'i < len');
function visit57_125_1(result) {
  _$jscoverage['/compiler.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['124'][1].init(745, 10, 'statements');
function visit56_124_1(result) {
  _$jscoverage['/compiler.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['110'][1].init(204, 6, 'global');
function visit55_110_1(result) {
  _$jscoverage['/compiler.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['106'][1].init(46, 7, '!global');
function visit54_106_1(result) {
  _$jscoverage['/compiler.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['86'][1].init(88, 17, 'nextIdNameCode[0]');
function visit53_86_1(result) {
  _$jscoverage['/compiler.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(185, 10, 'idPartType');
function visit52_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['81'][1].init(100, 6, '!first');
function visit51_81_1(result) {
  _$jscoverage['/compiler.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['78'][1].init(241, 5, 'i < l');
function visit50_78_1(result) {
  _$jscoverage['/compiler.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['53'][1].init(87, 12, 'm.length % 2');
function visit49_53_1(result) {
  _$jscoverage['/compiler.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['39'][1].init(13, 6, 'isCode');
function visit48_39_1(result) {
  _$jscoverage['/compiler.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var nativeCode = '', t;
  _$jscoverage['/compiler.js'].lineData[11]++;
  var nativeCommands = XTemplateRuntime.nativeCommands, nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[14]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[15]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[18]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[19]++;
    nativeCode += t + 'Command = nativeCommands.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[22]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[24]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[26]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[28]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[34]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[35]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[38]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[39]++;
    if (visit48_39_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[40]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[43]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[45]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[47]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[50]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[51]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[53]++;
  if (visit49_53_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[54]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[56]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[60]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[61]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[64]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[65]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[68]++;
  var gen = {
  getIdStringFromIdParts: function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[71]++;
  var idString = '', self = this, i, l, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[78]++;
  for (i = 0 , l = idParts.length; visit50_78_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[79]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[80]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[81]++;
    if (visit51_81_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[82]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[84]++;
    if (visit52_84_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[85]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[86]++;
      if (visit53_86_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[87]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[88]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[89]++;
        first = true;
      } else {
        _$jscoverage['/compiler.js'].lineData[92]++;
        idString += nextIdNameCode[1][0];
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[96]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[97]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[100]++;
  return idString;
}, 
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[105]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[106]++;
  if (visit54_106_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[107]++;
    source.push('function(scope) {');
  }
  _$jscoverage['/compiler.js'].lineData[109]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[110]++;
  if (visit55_110_1(global)) {
    _$jscoverage['/compiler.js'].lineData[111]++;
    source.push('config = this.config,' + 'engine = this,' + 'moduleWrap,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[118]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[122]++;
    source.push('var ' + nativeCode + ';');
  }
  _$jscoverage['/compiler.js'].lineData[124]++;
  if (visit56_124_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[125]++;
    for (var i = 0, len = statements.length; visit57_125_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[126]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[129]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[130]++;
  if (visit58_130_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[131]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[132]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[134]++;
    return {
  params: ['scope', 'S', 'payload', 'undefined'], 
  source: source};
  }
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[142]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[148]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[149]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[151]++;
  if (visit59_151_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[152]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[153]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[154]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[155]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[158]++;
  if (visit60_158_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[159]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[160]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[161]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[166]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[169]++;
  if (visit61_169_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[170]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[171]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[172]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[176]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[179]++;
  if (visit62_179_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[180]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[181]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[182]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[186]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[189]++;
  return undefined;
}, 
  genConfigFromCommand: function(command) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[193]++;
  var source = [], configName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[199]++;
  params = command.params;
  _$jscoverage['/compiler.js'].lineData[200]++;
  hash = command.hash;
  _$jscoverage['/compiler.js'].lineData[202]++;
  if (visit63_202_1(params || hash)) {
    _$jscoverage['/compiler.js'].lineData[203]++;
    configName = guid('config');
    _$jscoverage['/compiler.js'].lineData[204]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[207]++;
  if (visit64_207_1(params)) {
    _$jscoverage['/compiler.js'].lineData[208]++;
    var paramsName = guid('params');
    _$jscoverage['/compiler.js'].lineData[209]++;
    source.push('var ' + paramsName + ' = [];');
    _$jscoverage['/compiler.js'].lineData[210]++;
    S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[211]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[212]++;
  if (visit65_212_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[213]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[214]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[216]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[217]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
    _$jscoverage['/compiler.js'].lineData[220]++;
    source.push(configName + '.params=' + paramsName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[223]++;
  if (visit66_223_1(hash)) {
    _$jscoverage['/compiler.js'].lineData[224]++;
    var hashName = guid('hash');
    _$jscoverage['/compiler.js'].lineData[225]++;
    source.push('var ' + hashName + ' = {};');
    _$jscoverage['/compiler.js'].lineData[226]++;
    S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[227]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[228]++;
  if (visit67_228_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[229]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[230]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[232]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[233]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
    _$jscoverage['/compiler.js'].lineData[236]++;
    source.push(configName + '.hash=' + hashName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[239]++;
  return [configName, source];
}, 
  'conditionalOrExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[243]++;
  return this.genOpExpression(e, '||');
}, 
  'conditionalAndExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[247]++;
  return this.genOpExpression(e, '&&');
}, 
  'relationalExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[251]++;
  return this.genOpExpression(e, e.opType);
}, 
  'equalityExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[255]++;
  return this.genOpExpression(e, e.opType);
}, 
  'additiveExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[259]++;
  return this.genOpExpression(e, e.opType);
}, 
  'multiplicativeExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[263]++;
  return this.genOpExpression(e, e.opType);
}, 
  'unaryExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[267]++;
  var source = [], name, unaryType = e.unaryType, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[271]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[272]++;
  if ((name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[273]++;
    source.push(name + '=' + unaryType + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[275]++;
    source[source.length - 1] = '' + unaryType + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[277]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[283]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[287]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[291]++;
  return ['', [e.value]];
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[295]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, originalIdString = idNode.string, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[302]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[303]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[304]++;
  if (visit68_304_1(originalIdString === idString)) {
    _$jscoverage['/compiler.js'].lineData[305]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[307]++;
    source.push('var ' + idName + ' = scope.resolve("' + idString + '"' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[309]++;
  return [idName, source];
}, 
  'command': function(command) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[313]++;
  var source = [], idNode = command.id, configName, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[320]++;
  var commandConfigCode = self.genConfigFromCommand(command);
  _$jscoverage['/compiler.js'].lineData[322]++;
  if (visit69_322_1(commandConfigCode)) {
    _$jscoverage['/compiler.js'].lineData[323]++;
    configName = commandConfigCode[0];
    _$jscoverage['/compiler.js'].lineData[324]++;
    pushToArray(source, commandConfigCode[1]);
  }
  _$jscoverage['/compiler.js'].lineData[327]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[330]++;
  if (visit70_330_1(idString === 'include')) {
    _$jscoverage['/compiler.js'].lineData[332]++;
    source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + configName + '.params[0] = moduleWrap.resolveByName(' + configName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[336]++;
  if (visit71_336_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[337]++;
    source.push('var ' + idName + ' = ' + idString + 'Command.call(engine,scope,' + configName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[340]++;
    source.push('var ' + idName + ' = runInlineCommandUtil(engine,scope,' + configName + ',"' + idString + '",' + idNode.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[346]++;
  return [idName, source];
}, 
  'blockStatement': function(block) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[351]++;
  var programNode = block.program, source = [], self = this, command = block.command, commandConfigCode = self.genConfigFromCommand(command), configName = commandConfigCode[0], id = command.id, idString = id.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[361]++;
  pushToArray(source, commandConfigCode[1]);
  _$jscoverage['/compiler.js'].lineData[363]++;
  if (visit72_363_1(!configName)) {
    _$jscoverage['/compiler.js'].lineData[364]++;
    configName = S.guid('config');
    _$jscoverage['/compiler.js'].lineData[365]++;
    source.push('var ' + configName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[368]++;
  source.push(configName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[371]++;
  if (visit73_371_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[372]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[373]++;
    source.push(configName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[376]++;
  var parts = id.parts;
  _$jscoverage['/compiler.js'].lineData[377]++;
  for (var i = 0, l = parts.length; visit74_377_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[379]++;
    if (visit75_379_1(typeof parts[i] !== 'string')) {
      _$jscoverage['/compiler.js'].lineData[380]++;
      idString = self.getIdStringFromIdParts(source, parts);
      _$jscoverage['/compiler.js'].lineData[381]++;
      break;
    }
  }
  _$jscoverage['/compiler.js'].lineData[385]++;
  if (visit76_385_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[386]++;
    source.push('buffer += ' + idString + 'Command.call(engine, scope, ' + configName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[388]++;
    source.push('buffer += runBlockCommandUtil(engine, scope, ' + configName + ', ' + '"' + idString + '", ' + id.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[393]++;
  return source;
}, 
  'expressionStatement': function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[397]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[404]++;
  code = this[type](expression);
  _$jscoverage['/compiler.js'].lineData[406]++;
  if (visit77_406_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[407]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[408]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[410]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[411]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[413]++;
  source.push('buffer += renderOutputUtil(' + expressionOrVariable + ',' + escape + ');');
  _$jscoverage['/compiler.js'].lineData[414]++;
  return source;
}, 
  'contentStatement': function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[418]++;
  return ['buffer += \'' + escapeString(contentStatement.value, false) + '\';'];
}};
  _$jscoverage['/compiler.js'].lineData[422]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[429]++;
  compiler = {
  parse: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[436]++;
  return parser.parse(tpl);
}, 
  compileToStr: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[444]++;
  var func = this.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[445]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[455]++;
  var root = this.parse(tpl);
  _$jscoverage['/compiler.js'].lineData[456]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[457]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[466]++;
  var code = compiler.compile(tpl);
  _$jscoverage['/compiler.js'].lineData[467]++;
  name = visit78_467_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[468]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[470]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[480]++;
  return compiler;
});
