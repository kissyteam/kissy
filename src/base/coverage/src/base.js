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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[38] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[40] = 0;
  _$jscoverage['/base.js'].lineData[42] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[82] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[106] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[134] = 0;
  _$jscoverage['/base.js'].lineData[138] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[142] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[158] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[166] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[168] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[234] = 0;
  _$jscoverage['/base.js'].lineData[238] = 0;
  _$jscoverage['/base.js'].lineData[239] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[252] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[256] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[399] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[435] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[465] = 0;
  _$jscoverage['/base.js'].lineData[466] = 0;
  _$jscoverage['/base.js'].lineData[469] = 0;
  _$jscoverage['/base.js'].lineData[470] = 0;
  _$jscoverage['/base.js'].lineData[471] = 0;
  _$jscoverage['/base.js'].lineData[475] = 0;
  _$jscoverage['/base.js'].lineData[476] = 0;
  _$jscoverage['/base.js'].lineData[477] = 0;
  _$jscoverage['/base.js'].lineData[485] = 0;
  _$jscoverage['/base.js'].lineData[490] = 0;
  _$jscoverage['/base.js'].lineData[491] = 0;
  _$jscoverage['/base.js'].lineData[492] = 0;
  _$jscoverage['/base.js'].lineData[494] = 0;
  _$jscoverage['/base.js'].lineData[499] = 0;
  _$jscoverage['/base.js'].lineData[500] = 0;
  _$jscoverage['/base.js'].lineData[501] = 0;
  _$jscoverage['/base.js'].lineData[502] = 0;
  _$jscoverage['/base.js'].lineData[503] = 0;
  _$jscoverage['/base.js'].lineData[508] = 0;
  _$jscoverage['/base.js'].lineData[509] = 0;
  _$jscoverage['/base.js'].lineData[510] = 0;
  _$jscoverage['/base.js'].lineData[514] = 0;
  _$jscoverage['/base.js'].lineData[515] = 0;
  _$jscoverage['/base.js'].lineData[516] = 0;
  _$jscoverage['/base.js'].lineData[517] = 0;
  _$jscoverage['/base.js'].lineData[518] = 0;
  _$jscoverage['/base.js'].lineData[522] = 0;
  _$jscoverage['/base.js'].lineData[523] = 0;
  _$jscoverage['/base.js'].lineData[524] = 0;
  _$jscoverage['/base.js'].lineData[527] = 0;
  _$jscoverage['/base.js'].lineData[528] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[534] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[536] = 0;
  _$jscoverage['/base.js'].lineData[537] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[539] = 0;
  _$jscoverage['/base.js'].lineData[540] = 0;
  _$jscoverage['/base.js'].lineData[542] = 0;
  _$jscoverage['/base.js'].lineData[543] = 0;
  _$jscoverage['/base.js'].lineData[545] = 0;
  _$jscoverage['/base.js'].lineData[546] = 0;
  _$jscoverage['/base.js'].lineData[551] = 0;
  _$jscoverage['/base.js'].lineData[552] = 0;
  _$jscoverage['/base.js'].lineData[555] = 0;
  _$jscoverage['/base.js'].lineData[556] = 0;
  _$jscoverage['/base.js'].lineData[557] = 0;
  _$jscoverage['/base.js'].lineData[562] = 0;
  _$jscoverage['/base.js'].lineData[563] = 0;
  _$jscoverage['/base.js'].lineData[564] = 0;
  _$jscoverage['/base.js'].lineData[565] = 0;
  _$jscoverage['/base.js'].lineData[566] = 0;
  _$jscoverage['/base.js'].lineData[571] = 0;
  _$jscoverage['/base.js'].lineData[572] = 0;
  _$jscoverage['/base.js'].lineData[578] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
  _$jscoverage['/base.js'].functionData[23] = 0;
  _$jscoverage['/base.js'].functionData[24] = 0;
  _$jscoverage['/base.js'].functionData[25] = 0;
  _$jscoverage['/base.js'].functionData[26] = 0;
  _$jscoverage['/base.js'].functionData[27] = 0;
  _$jscoverage['/base.js'].functionData[28] = 0;
  _$jscoverage['/base.js'].functionData[29] = 0;
  _$jscoverage['/base.js'].functionData[30] = 0;
  _$jscoverage['/base.js'].functionData[31] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['28'] = [];
  _$jscoverage['/base.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['35'] = [];
  _$jscoverage['/base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['39'] = [];
  _$jscoverage['/base.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['103'] = [];
  _$jscoverage['/base.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['103'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['116'] = [];
  _$jscoverage['/base.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['121'] = [];
  _$jscoverage['/base.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['126'] = [];
  _$jscoverage['/base.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['140'] = [];
  _$jscoverage['/base.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['160'] = [];
  _$jscoverage['/base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['166'] = [];
  _$jscoverage['/base.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['169'] = [];
  _$jscoverage['/base.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'] = [];
  _$jscoverage['/base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['178'] = [];
  _$jscoverage['/base.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'] = [];
  _$jscoverage['/base.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['213'] = [];
  _$jscoverage['/base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['217'] = [];
  _$jscoverage['/base.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['218'] = [];
  _$jscoverage['/base.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['220'] = [];
  _$jscoverage['/base.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['221'] = [];
  _$jscoverage['/base.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['226'] = [];
  _$jscoverage['/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['233'] = [];
  _$jscoverage['/base.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['251'] = [];
  _$jscoverage['/base.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['251'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['252'] = [];
  _$jscoverage['/base.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['265'] = [];
  _$jscoverage['/base.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['350'] = [];
  _$jscoverage['/base.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['356'] = [];
  _$jscoverage['/base.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['357'] = [];
  _$jscoverage['/base.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['364'] = [];
  _$jscoverage['/base.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['376'] = [];
  _$jscoverage['/base.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['380'] = [];
  _$jscoverage['/base.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['383'] = [];
  _$jscoverage['/base.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['384'] = [];
  _$jscoverage['/base.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['387'] = [];
  _$jscoverage['/base.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['394'] = [];
  _$jscoverage['/base.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['400'] = [];
  _$jscoverage['/base.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['411'] = [];
  _$jscoverage['/base.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['419'] = [];
  _$jscoverage['/base.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['429'] = [];
  _$jscoverage['/base.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['437'] = [];
  _$jscoverage['/base.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['469'] = [];
  _$jscoverage['/base.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['476'] = [];
  _$jscoverage['/base.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['491'] = [];
  _$jscoverage['/base.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['502'] = [];
  _$jscoverage['/base.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['516'] = [];
  _$jscoverage['/base.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['518'] = [];
  _$jscoverage['/base.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['523'] = [];
  _$jscoverage['/base.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['528'] = [];
  _$jscoverage['/base.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['530'] = [];
  _$jscoverage['/base.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['539'] = [];
  _$jscoverage['/base.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['542'] = [];
  _$jscoverage['/base.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['555'] = [];
  _$jscoverage['/base.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['556'] = [];
  _$jscoverage['/base.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['557'] = [];
  _$jscoverage['/base.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['564'] = [];
  _$jscoverage['/base.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['564'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['565'] = [];
  _$jscoverage['/base.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['566'] = [];
  _$jscoverage['/base.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['571'] = [];
  _$jscoverage['/base.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['572'] = [];
  _$jscoverage['/base.js'].branchData['572'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['572'][1].init(36, 10, 'args || []');
function visit126_572_1(result) {
  _$jscoverage['/base.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['571'][1].init(214, 2, 'fn');
function visit125_571_1(result) {
  _$jscoverage['/base.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['566'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit124_566_1(result) {
  _$jscoverage['/base.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['565'][1].init(29, 7, 'i < len');
function visit123_565_1(result) {
  _$jscoverage['/base.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['564'][2].init(36, 31, 'extensions && extensions.length');
function visit122_564_2(result) {
  _$jscoverage['/base.js'].branchData['564'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['564'][1].init(30, 37, 'len = extensions && extensions.length');
function visit121_564_1(result) {
  _$jscoverage['/base.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['557'][1].init(17, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit120_557_1(result) {
  _$jscoverage['/base.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['556'][1].init(29, 7, 'i < len');
function visit119_556_1(result) {
  _$jscoverage['/base.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['555'][1].init(98, 20, 'len = plugins.length');
function visit118_555_1(result) {
  _$jscoverage['/base.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['542'][1].init(554, 7, 'wrapped');
function visit117_542_1(result) {
  _$jscoverage['/base.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['539'][1].init(467, 13, 'v.__wrapped__');
function visit116_539_1(result) {
  _$jscoverage['/base.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['530'][1].init(54, 11, 'v.__owner__');
function visit115_530_1(result) {
  _$jscoverage['/base.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['528'][1].init(17, 22, 'typeof v == \'function\'');
function visit114_528_1(result) {
  _$jscoverage['/base.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['523'][1].init(17, 7, 'p in px');
function visit113_523_1(result) {
  _$jscoverage['/base.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['518'][1].init(25, 13, 'px[p] || noop');
function visit112_518_1(result) {
  _$jscoverage['/base.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['516'][1].init(63, 17, 'extensions.length');
function visit111_516_1(result) {
  _$jscoverage['/base.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['502'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit110_502_1(result) {
  _$jscoverage['/base.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['491'][1].init(13, 6, 'config');
function visit109_491_1(result) {
  _$jscoverage['/base.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['476'][1].init(13, 5, 'attrs');
function visit108_476_1(result) {
  _$jscoverage['/base.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['469'][1].init(85, 16, 'e.target == self');
function visit107_469_1(result) {
  _$jscoverage['/base.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['437'][1].init(70, 24, 'SubClass.__hooks__ || {}');
function visit106_437_1(result) {
  _$jscoverage['/base.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['429'][1].init(3517, 25, 'SubClass.extend || extend');
function visit105_429_1(result) {
  _$jscoverage['/base.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['419'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit104_419_1(result) {
  _$jscoverage['/base.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['411'][1].init(52, 17, 'attrs[name] || {}');
function visit103_411_1(result) {
  _$jscoverage['/base.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['400'][1].init(25, 3, 'ext');
function visit102_400_1(result) {
  _$jscoverage['/base.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['394'][1].init(1972, 17, 'extensions.length');
function visit101_394_1(result) {
  _$jscoverage['/base.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['387'][1].init(1722, 16, 'inheritedStatics');
function visit100_387_1(result) {
  _$jscoverage['/base.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['384'][2].init(1580, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit99_384_2(result) {
  _$jscoverage['/base.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['384'][1].init(1554, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit98_384_1(result) {
  _$jscoverage['/base.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['383'][1].init(1484, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit97_383_1(result) {
  _$jscoverage['/base.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['380'][1].init(1316, 18, 'sx.__hooks__ || {}');
function visit96_380_1(result) {
  _$jscoverage['/base.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['376'][1].init(1138, 5, 'hooks');
function visit95_376_1(result) {
  _$jscoverage['/base.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['364'][1].init(150, 9, '\'@DEBUG@\'');
function visit94_364_1(result) {
  _$jscoverage['/base.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(393, 32, 'px.hasOwnProperty(\'constructor\')');
function visit93_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['357'][1].init(321, 24, 'sx.name || \'BaseDerived\'');
function visit92_357_1(result) {
  _$jscoverage['/base.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['356'][1].init(292, 8, 'sx || {}');
function visit91_356_1(result) {
  _$jscoverage['/base.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['350'][1].init(100, 22, '!S.isArray(extensions)');
function visit90_350_1(result) {
  _$jscoverage['/base.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['265'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit89_265_1(result) {
  _$jscoverage['/base.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['252'][1].init(141, 14, 'pluginId == id');
function visit88_252_1(result) {
  _$jscoverage['/base.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['251'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit87_251_2(result) {
  _$jscoverage['/base.js'].branchData['251'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['251'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit86_251_1(result) {
  _$jscoverage['/base.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['233'][1].init(640, 5, '!keep');
function visit85_233_1(result) {
  _$jscoverage['/base.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['226'][1].init(29, 11, 'p != plugin');
function visit84_226_1(result) {
  _$jscoverage['/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['221'][1].init(161, 18, 'pluginId != plugin');
function visit83_221_1(result) {
  _$jscoverage['/base.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['220'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit82_220_2(result) {
  _$jscoverage['/base.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['220'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit81_220_1(result) {
  _$jscoverage['/base.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['218'][1].init(25, 8, 'isString');
function visit80_218_1(result) {
  _$jscoverage['/base.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['217'][1].init(61, 6, 'plugin');
function visit79_217_1(result) {
  _$jscoverage['/base.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['213'][1].init(73, 25, 'typeof plugin == \'string\'');
function visit78_213_1(result) {
  _$jscoverage['/base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][1].init(180, 27, 'plugin[\'pluginInitializer\']');
function visit77_197_1(result) {
  _$jscoverage['/base.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit76_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['178'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit75_178_1(result) {
  _$jscoverage['/base.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit74_177_2(result) {
  _$jscoverage['/base.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit73_177_1(result) {
  _$jscoverage['/base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit72_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['169'][1].init(25, 22, 'attributeName in attrs');
function visit71_169_1(result) {
  _$jscoverage['/base.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit70_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['166'][1].init(379, 13, 'i < cs.length');
function visit69_166_1(result) {
  _$jscoverage['/base.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['160'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit68_160_1(result) {
  _$jscoverage['/base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['140'][1].init(65, 7, 'self[m]');
function visit67_140_1(result) {
  _$jscoverage['/base.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['126'][1].init(1006, 10, 'args || []');
function visit66_126_1(result) {
  _$jscoverage['/base.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['121'][1].init(806, 7, '!member');
function visit65_121_1(result) {
  _$jscoverage['/base.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['116'][1].init(552, 5, '!name');
function visit64_116_1(result) {
  _$jscoverage['/base.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(71, 18, 'method.__wrapped__');
function visit63_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['103'][2].init(110, 25, 'typeof self == \'function\'');
function visit62_103_2(result) {
  _$jscoverage['/base.js'].branchData['103'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['103'][1].init(110, 42, 'typeof self == \'function\' && self.__name__');
function visit61_103_1(result) {
  _$jscoverage['/base.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['39'][1].init(532, 7, 'reverse');
function visit60_39_1(result) {
  _$jscoverage['/base.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['35'][1].init(366, 7, 'reverse');
function visit59_35_1(result) {
  _$jscoverage['/base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(297, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit58_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['28'][1].init(54, 7, 'reverse');
function visit57_28_1(result) {
  _$jscoverage['/base.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = KISSY.require('base/attribute');
  _$jscoverage['/base.js'].lineData[8]++;
  var CustomEvent = KISSY.require('event/custom');
  _$jscoverage['/base.js'].lineData[10]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[16]++;
  function replaceToUpper() {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[17]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[20]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[21]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[24]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[25]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[26]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[27]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[28]++;
  if (visit57_28_1(reverse)) {
    _$jscoverage['/base.js'].lineData[29]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[31]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[34]++;
  var extensions = visit58_34_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[35]++;
  if (visit59_35_1(reverse)) {
    _$jscoverage['/base.js'].lineData[36]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[38]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[39]++;
  if (visit60_39_1(reverse)) {
    _$jscoverage['/base.js'].lineData[40]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[42]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[58]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[59]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[61]++;
    Base.superclass.constructor.apply(this, arguments);
    _$jscoverage['/base.js'].lineData[62]++;
    self.__attrs = {};
    _$jscoverage['/base.js'].lineData[63]++;
    self.__attrVals = {};
    _$jscoverage['/base.js'].lineData[65]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[67]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[68]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[69]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[72]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[74]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[75]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[76]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[79]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[81]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[82]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[84]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[86]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[89]++;
  S.augment(Base, Attribute);
  _$jscoverage['/base.js'].lineData[91]++;
  S.extend(Base, CustomEvent.Target, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[99]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[103]++;
  if (visit61_103_1(visit62_103_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[104]++;
    method = self;
    _$jscoverage['/base.js'].lineData[105]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[106]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[108]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[109]++;
    if (visit63_109_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[110]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[112]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[115]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[116]++;
  if (visit64_116_1(!name)) {
    _$jscoverage['/base.js'].lineData[118]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[120]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[121]++;
  if (visit65_121_1(!member)) {
    _$jscoverage['/base.js'].lineData[123]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[126]++;
  return member.apply(obj, visit66_126_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[134]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[138]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[139]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[140]++;
    if (visit67_140_1(self[m])) {
      _$jscoverage['/base.js'].lineData[142]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[152]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[158]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[159]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[160]++;
    c = visit68_160_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[163]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[166]++;
  for (i = 0; visit69_166_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[167]++;
    var ATTRS = visit70_167_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[168]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[169]++;
      if (visit71_169_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[170]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[172]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[174]++;
        if (visit72_174_1((onSetMethod = self[onSetMethodName]) && visit73_177_1(visit74_177_2(attrs[attributeName].sync !== 0) && visit75_178_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[179]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[192]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[193]++;
  if (visit76_193_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[194]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[197]++;
  if (visit77_197_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[198]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[200]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[201]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[211]++;
  var plugins = [], self = this, isString = visit78_213_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[215]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[216]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[217]++;
  if (visit79_217_1(plugin)) {
    _$jscoverage['/base.js'].lineData[218]++;
    if (visit80_218_1(isString)) {
      _$jscoverage['/base.js'].lineData[220]++;
      pluginId = visit81_220_1(visit82_220_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[221]++;
      if (visit83_221_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[222]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[223]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[226]++;
      if (visit84_226_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[227]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[228]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[233]++;
  if (visit85_233_1(!keep)) {
    _$jscoverage['/base.js'].lineData[234]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[238]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[239]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[248]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[249]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[251]++;
  var pluginId = visit86_251_1(visit87_251_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[252]++;
  if (visit88_252_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[253]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[254]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[256]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[258]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[264]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[265]++;
  if (visit89_265_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[266]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[267]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[268]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[269]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[270]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[275]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[347]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[350]++;
  if (visit90_350_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[351]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[352]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[354]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[356]++;
  sx = visit91_356_1(sx || {});
  _$jscoverage['/base.js'].lineData[357]++;
  name = visit92_357_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[358]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[359]++;
  if (visit93_359_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[360]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[364]++;
    if (visit94_364_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[365]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[368]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[369]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[373]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[375]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[376]++;
  if (visit95_376_1(hooks)) {
    _$jscoverage['/base.js'].lineData[377]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[379]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[380]++;
  wrapProtoForSuper(px, SubClass, visit96_380_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[381]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[383]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit97_383_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[384]++;
  if (visit98_384_1(sx['inheritedStatics'] && visit99_384_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[385]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[387]++;
  if (visit100_387_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[388]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[390]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[392]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[394]++;
  if (visit101_394_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[395]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[399]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[400]++;
  if (visit102_400_1(ext)) {
    _$jscoverage['/base.js'].lineData[410]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[411]++;
  var av = attrs[name] = visit103_411_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[412]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[415]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[417]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[419]++;
      if (visit104_419_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[420]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[425]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[426]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[427]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[429]++;
  SubClass.extend = visit105_429_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[430]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[431]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[435]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[436]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[437]++;
    wrapProtoForSuper(px, SubClass, visit106_437_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[438]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[465]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[466]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[469]++;
    if (visit107_469_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[470]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[471]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[475]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[476]++;
    if (visit108_476_1(attrs)) {
      _$jscoverage['/base.js'].lineData[477]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[485]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[490]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[491]++;
    if (visit109_491_1(config)) {
      _$jscoverage['/base.js'].lineData[492]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[494]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[499]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[500]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[501]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[502]++;
  if (visit110_502_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[503]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[508]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[509]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[510]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[514]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[515]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[516]++;
    if (visit111_516_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[517]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[518]++;
        px[p] = visit112_518_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[522]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[523]++;
      if (visit113_523_1(p in px)) {
        _$jscoverage['/base.js'].lineData[524]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[527]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[528]++;
  if (visit114_528_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[529]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[530]++;
    if (visit115_530_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[531]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[532]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[533]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[534]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[535]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[536]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[537]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[538]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[539]++;
      if (visit116_539_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[540]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[542]++;
    if (visit117_542_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[543]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[545]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[546]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[551]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[552]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[555]++;
    if (visit118_555_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[556]++;
      for (var i = 0; visit119_556_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[557]++;
        visit120_557_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[562]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[563]++;
    var len;
    _$jscoverage['/base.js'].lineData[564]++;
    if (visit121_564_1(len = visit122_564_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[565]++;
      for (var i = 0; visit123_565_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[566]++;
        var fn = visit124_566_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[571]++;
        if (visit125_571_1(fn)) {
          _$jscoverage['/base.js'].lineData[572]++;
          fn.apply(self, visit126_572_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[578]++;
  return Base;
});
