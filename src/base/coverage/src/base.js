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
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[24] = 0;
  _$jscoverage['/base.js'].lineData[25] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[37] = 0;
  _$jscoverage['/base.js'].lineData[39] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[81] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[99] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[102] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[108] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[133] = 0;
  _$jscoverage['/base.js'].lineData[135] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[161] = 0;
  _$jscoverage['/base.js'].lineData[162] = 0;
  _$jscoverage['/base.js'].lineData[163] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[191] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[241] = 0;
  _$jscoverage['/base.js'].lineData[242] = 0;
  _$jscoverage['/base.js'].lineData[244] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[247] = 0;
  _$jscoverage['/base.js'].lineData[249] = 0;
  _$jscoverage['/base.js'].lineData[251] = 0;
  _$jscoverage['/base.js'].lineData[257] = 0;
  _$jscoverage['/base.js'].lineData[258] = 0;
  _$jscoverage['/base.js'].lineData[259] = 0;
  _$jscoverage['/base.js'].lineData[260] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[345] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[353] = 0;
  _$jscoverage['/base.js'].lineData[357] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[362] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[392] = 0;
  _$jscoverage['/base.js'].lineData[393] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
  _$jscoverage['/base.js'].lineData[419] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[458] = 0;
  _$jscoverage['/base.js'].lineData[459] = 0;
  _$jscoverage['/base.js'].lineData[462] = 0;
  _$jscoverage['/base.js'].lineData[463] = 0;
  _$jscoverage['/base.js'].lineData[464] = 0;
  _$jscoverage['/base.js'].lineData[468] = 0;
  _$jscoverage['/base.js'].lineData[469] = 0;
  _$jscoverage['/base.js'].lineData[470] = 0;
  _$jscoverage['/base.js'].lineData[478] = 0;
  _$jscoverage['/base.js'].lineData[483] = 0;
  _$jscoverage['/base.js'].lineData[484] = 0;
  _$jscoverage['/base.js'].lineData[485] = 0;
  _$jscoverage['/base.js'].lineData[487] = 0;
  _$jscoverage['/base.js'].lineData[492] = 0;
  _$jscoverage['/base.js'].lineData[493] = 0;
  _$jscoverage['/base.js'].lineData[494] = 0;
  _$jscoverage['/base.js'].lineData[495] = 0;
  _$jscoverage['/base.js'].lineData[496] = 0;
  _$jscoverage['/base.js'].lineData[501] = 0;
  _$jscoverage['/base.js'].lineData[502] = 0;
  _$jscoverage['/base.js'].lineData[503] = 0;
  _$jscoverage['/base.js'].lineData[507] = 0;
  _$jscoverage['/base.js'].lineData[508] = 0;
  _$jscoverage['/base.js'].lineData[509] = 0;
  _$jscoverage['/base.js'].lineData[510] = 0;
  _$jscoverage['/base.js'].lineData[511] = 0;
  _$jscoverage['/base.js'].lineData[515] = 0;
  _$jscoverage['/base.js'].lineData[516] = 0;
  _$jscoverage['/base.js'].lineData[517] = 0;
  _$jscoverage['/base.js'].lineData[520] = 0;
  _$jscoverage['/base.js'].lineData[521] = 0;
  _$jscoverage['/base.js'].lineData[522] = 0;
  _$jscoverage['/base.js'].lineData[523] = 0;
  _$jscoverage['/base.js'].lineData[524] = 0;
  _$jscoverage['/base.js'].lineData[525] = 0;
  _$jscoverage['/base.js'].lineData[526] = 0;
  _$jscoverage['/base.js'].lineData[527] = 0;
  _$jscoverage['/base.js'].lineData[528] = 0;
  _$jscoverage['/base.js'].lineData[529] = 0;
  _$jscoverage['/base.js'].lineData[530] = 0;
  _$jscoverage['/base.js'].lineData[531] = 0;
  _$jscoverage['/base.js'].lineData[532] = 0;
  _$jscoverage['/base.js'].lineData[533] = 0;
  _$jscoverage['/base.js'].lineData[535] = 0;
  _$jscoverage['/base.js'].lineData[536] = 0;
  _$jscoverage['/base.js'].lineData[538] = 0;
  _$jscoverage['/base.js'].lineData[539] = 0;
  _$jscoverage['/base.js'].lineData[544] = 0;
  _$jscoverage['/base.js'].lineData[545] = 0;
  _$jscoverage['/base.js'].lineData[548] = 0;
  _$jscoverage['/base.js'].lineData[549] = 0;
  _$jscoverage['/base.js'].lineData[550] = 0;
  _$jscoverage['/base.js'].lineData[555] = 0;
  _$jscoverage['/base.js'].lineData[556] = 0;
  _$jscoverage['/base.js'].lineData[557] = 0;
  _$jscoverage['/base.js'].lineData[558] = 0;
  _$jscoverage['/base.js'].lineData[559] = 0;
  _$jscoverage['/base.js'].lineData[564] = 0;
  _$jscoverage['/base.js'].lineData[565] = 0;
  _$jscoverage['/base.js'].lineData[571] = 0;
  _$jscoverage['/base.js'].lineData[573] = 0;
  _$jscoverage['/base.js'].lineData[575] = 0;
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
  _$jscoverage['/base.js'].branchData['25'] = [];
  _$jscoverage['/base.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['36'] = [];
  _$jscoverage['/base.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'] = [];
  _$jscoverage['/base.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['102'] = [];
  _$jscoverage['/base.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['109'] = [];
  _$jscoverage['/base.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['133'] = [];
  _$jscoverage['/base.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['153'] = [];
  _$jscoverage['/base.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['159'] = [];
  _$jscoverage['/base.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['160'] = [];
  _$jscoverage['/base.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['162'] = [];
  _$jscoverage['/base.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['190'] = [];
  _$jscoverage['/base.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['211'] = [];
  _$jscoverage['/base.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['213'] = [];
  _$jscoverage['/base.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['214'] = [];
  _$jscoverage['/base.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['226'] = [];
  _$jscoverage['/base.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['244'] = [];
  _$jscoverage['/base.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['244'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['245'] = [];
  _$jscoverage['/base.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['258'] = [];
  _$jscoverage['/base.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['343'] = [];
  _$jscoverage['/base.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['349'] = [];
  _$jscoverage['/base.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['350'] = [];
  _$jscoverage['/base.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['352'] = [];
  _$jscoverage['/base.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['357'] = [];
  _$jscoverage['/base.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['369'] = [];
  _$jscoverage['/base.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['373'] = [];
  _$jscoverage['/base.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['376'] = [];
  _$jscoverage['/base.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'] = [];
  _$jscoverage['/base.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['380'] = [];
  _$jscoverage['/base.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['387'] = [];
  _$jscoverage['/base.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['393'] = [];
  _$jscoverage['/base.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['404'] = [];
  _$jscoverage['/base.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['412'] = [];
  _$jscoverage['/base.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['422'] = [];
  _$jscoverage['/base.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['430'] = [];
  _$jscoverage['/base.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['462'] = [];
  _$jscoverage['/base.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['469'] = [];
  _$jscoverage['/base.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['484'] = [];
  _$jscoverage['/base.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['495'] = [];
  _$jscoverage['/base.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['509'] = [];
  _$jscoverage['/base.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['511'] = [];
  _$jscoverage['/base.js'].branchData['511'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['516'] = [];
  _$jscoverage['/base.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['521'] = [];
  _$jscoverage['/base.js'].branchData['521'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['523'] = [];
  _$jscoverage['/base.js'].branchData['523'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['532'] = [];
  _$jscoverage['/base.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['535'] = [];
  _$jscoverage['/base.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['548'] = [];
  _$jscoverage['/base.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['549'] = [];
  _$jscoverage['/base.js'].branchData['549'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['550'] = [];
  _$jscoverage['/base.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['557'] = [];
  _$jscoverage['/base.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['557'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['558'] = [];
  _$jscoverage['/base.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['559'] = [];
  _$jscoverage['/base.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['564'] = [];
  _$jscoverage['/base.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['565'] = [];
  _$jscoverage['/base.js'].branchData['565'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['565'][1].init(37, 10, 'args || []');
function visit126_565_1(result) {
  _$jscoverage['/base.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['564'][1].init(220, 2, 'fn');
function visit125_564_1(result) {
  _$jscoverage['/base.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['559'][1].init(27, 170, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit124_559_1(result) {
  _$jscoverage['/base.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['558'][1].init(30, 7, 'i < len');
function visit123_558_1(result) {
  _$jscoverage['/base.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['557'][2].init(38, 31, 'extensions && extensions.length');
function visit122_557_2(result) {
  _$jscoverage['/base.js'].branchData['557'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['557'][1].init(32, 37, 'len = extensions && extensions.length');
function visit121_557_1(result) {
  _$jscoverage['/base.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['550'][1].init(18, 46, 'plugins[i][method] && plugins[i][method](self)');
function visit120_550_1(result) {
  _$jscoverage['/base.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['549'][1].init(30, 7, 'i < len');
function visit119_549_1(result) {
  _$jscoverage['/base.js'].branchData['549'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['548'][1].init(102, 20, 'len = plugins.length');
function visit118_548_1(result) {
  _$jscoverage['/base.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['535'][1].init(568, 7, 'wrapped');
function visit117_535_1(result) {
  _$jscoverage['/base.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['532'][1].init(478, 13, 'v.__wrapped__');
function visit116_532_1(result) {
  _$jscoverage['/base.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['523'][1].init(56, 11, 'v.__owner__');
function visit115_523_1(result) {
  _$jscoverage['/base.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['521'][1].init(18, 22, 'typeof v == \'function\'');
function visit114_521_1(result) {
  _$jscoverage['/base.js'].branchData['521'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['516'][1].init(18, 7, 'p in px');
function visit113_516_1(result) {
  _$jscoverage['/base.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['511'][1].init(26, 13, 'px[p] || noop');
function visit112_511_1(result) {
  _$jscoverage['/base.js'].branchData['511'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['509'][1].init(65, 17, 'extensions.length');
function visit111_509_1(result) {
  _$jscoverage['/base.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['495'][1].init(18, 28, 'typeof plugin === \'function\'');
function visit110_495_1(result) {
  _$jscoverage['/base.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['484'][1].init(14, 6, 'config');
function visit109_484_1(result) {
  _$jscoverage['/base.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['469'][1].init(14, 5, 'attrs');
function visit108_469_1(result) {
  _$jscoverage['/base.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['462'][1].init(89, 16, 'e.target == self');
function visit107_462_1(result) {
  _$jscoverage['/base.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['430'][1].init(72, 24, 'SubClass.__hooks__ || {}');
function visit106_430_1(result) {
  _$jscoverage['/base.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['422'][1].init(3600, 25, 'SubClass.extend || extend');
function visit105_422_1(result) {
  _$jscoverage['/base.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['412'][1].init(96, 21, 'exp.hasOwnProperty(p)');
function visit104_412_1(result) {
  _$jscoverage['/base.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['404'][1].init(53, 17, 'attrs[name] || {}');
function visit103_404_1(result) {
  _$jscoverage['/base.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['393'][1].init(26, 3, 'ext');
function visit102_393_1(result) {
  _$jscoverage['/base.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['387'][1].init(2020, 17, 'extensions.length');
function visit101_387_1(result) {
  _$jscoverage['/base.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['380'][1].init(1763, 16, 'inheritedStatics');
function visit100_380_1(result) {
  _$jscoverage['/base.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][2].init(1618, 43, 'inheritedStatics !== sx[\'inheritedStatics\']');
function visit99_377_2(result) {
  _$jscoverage['/base.js'].branchData['377'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][1].init(1592, 69, 'sx[\'inheritedStatics\'] && inheritedStatics !== sx[\'inheritedStatics\']');
function visit98_377_1(result) {
  _$jscoverage['/base.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['376'][1].init(1521, 52, 'sp[\'__inheritedStatics__\'] || sx[\'inheritedStatics\']');
function visit97_376_1(result) {
  _$jscoverage['/base.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['373'][1].init(1350, 18, 'sx.__hooks__ || {}');
function visit96_373_1(result) {
  _$jscoverage['/base.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['369'][1].init(1168, 5, 'hooks');
function visit95_369_1(result) {
  _$jscoverage['/base.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['357'][1].init(153, 9, '\'@DEBUG@\'');
function visit94_357_1(result) {
  _$jscoverage['/base.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['352'][1].init(406, 32, 'px.hasOwnProperty(\'constructor\')');
function visit93_352_1(result) {
  _$jscoverage['/base.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['350'][1].init(332, 24, 'sx.name || \'BaseDerived\'');
function visit92_350_1(result) {
  _$jscoverage['/base.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['349'][1].init(302, 8, 'sx || {}');
function visit91_349_1(result) {
  _$jscoverage['/base.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['343'][1].init(104, 22, '!S.isArray(extensions)');
function visit90_343_1(result) {
  _$jscoverage['/base.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['258'][1].init(48, 22, '!self.get(\'destroyed\')');
function visit89_258_1(result) {
  _$jscoverage['/base.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['245'][1].init(144, 14, 'pluginId == id');
function visit88_245_1(result) {
  _$jscoverage['/base.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['244'][2].init(81, 26, 'p.get && p.get(\'pluginId\')');
function visit87_244_2(result) {
  _$jscoverage['/base.js'].branchData['244'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['244'][1].init(81, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit86_244_1(result) {
  _$jscoverage['/base.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['226'][1].init(658, 5, '!keep');
function visit85_226_1(result) {
  _$jscoverage['/base.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(30, 11, 'p != plugin');
function visit84_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['214'][1].init(164, 18, 'pluginId != plugin');
function visit83_214_1(result) {
  _$jscoverage['/base.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['213'][2].init(93, 26, 'p.get && p.get(\'pluginId\')');
function visit82_213_2(result) {
  _$jscoverage['/base.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['213'][1].init(93, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit81_213_1(result) {
  _$jscoverage['/base.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['211'][1].init(26, 8, 'isString');
function visit80_211_1(result) {
  _$jscoverage['/base.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(63, 6, 'plugin');
function visit79_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(75, 25, 'typeof plugin == \'string\'');
function visit78_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['190'][1].init(186, 27, 'plugin[\'pluginInitializer\']');
function visit77_190_1(result) {
  _$jscoverage['/base.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(48, 28, 'typeof plugin === \'function\'');
function visit76_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(64, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit75_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][2].init(435, 31, 'attrs[attributeName].sync !== 0');
function visit74_170_2(result) {
  _$jscoverage['/base.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(177, 120, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit73_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(255, 298, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit72_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['162'][1].init(26, 22, 'attributeName in attrs');
function visit71_162_1(result) {
  _$jscoverage['/base.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['160'][1].init(30, 17, 'cs[i].ATTRS || {}');
function visit70_160_1(result) {
  _$jscoverage['/base.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['159'][1].init(394, 13, 'i < cs.length');
function visit69_159_1(result) {
  _$jscoverage['/base.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['153'][1].init(51, 40, 'c.superclass && c.superclass.constructor');
function visit68_153_1(result) {
  _$jscoverage['/base.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['133'][1].init(67, 7, 'self[m]');
function visit67_133_1(result) {
  _$jscoverage['/base.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(1034, 10, 'args || []');
function visit66_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(829, 7, '!member');
function visit65_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['109'][1].init(570, 5, '!name');
function visit64_109_1(result) {
  _$jscoverage['/base.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['102'][1].init(73, 18, 'method.__wrapped__');
function visit63_102_1(result) {
  _$jscoverage['/base.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][2].init(115, 25, 'typeof self == \'function\'');
function visit62_96_2(result) {
  _$jscoverage['/base.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['96'][1].init(115, 42, 'typeof self == \'function\' && self.__name__');
function visit61_96_1(result) {
  _$jscoverage['/base.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['36'][1].init(545, 7, 'reverse');
function visit60_36_1(result) {
  _$jscoverage['/base.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(375, 7, 'reverse');
function visit59_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(305, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit58_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['25'][1].init(56, 7, 'reverse');
function visit57_25_1(result) {
  _$jscoverage['/base.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add('base', function(S, Attribute) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var ATTRS = 'ATTRS', ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop, RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/base.js'].lineData[13]++;
  function replaceToUpper(_, letter) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return letter.toUpperCase();
  }
  _$jscoverage['/base.js'].lineData[17]++;
  function CamelCase(name) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[18]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/base.js'].lineData[21]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[3]++;
    _$jscoverage['/base.js'].lineData[22]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[23]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[24]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[25]++;
  if (visit57_25_1(reverse)) {
    _$jscoverage['/base.js'].lineData[26]++;
    origFn.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[28]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[31]++;
  var extensions = visit58_31_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[32]++;
  if (visit59_32_1(reverse)) {
    _$jscoverage['/base.js'].lineData[33]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[35]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[36]++;
  if (visit60_36_1(reverse)) {
    _$jscoverage['/base.js'].lineData[37]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[39]++;
    origFn.apply(self, arguments);
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[56]++;
  function Base(config) {
    _$jscoverage['/base.js'].functionData[6]++;
    _$jscoverage['/base.js'].lineData[57]++;
    var self = this, c = self.constructor;
    _$jscoverage['/base.js'].lineData[60]++;
    self.userConfig = config;
    _$jscoverage['/base.js'].lineData[62]++;
    while (c) {
      _$jscoverage['/base.js'].lineData[63]++;
      addAttrs(self, c[ATTRS]);
      _$jscoverage['/base.js'].lineData[64]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/base.js'].lineData[67]++;
    initAttrs(self, config);
    _$jscoverage['/base.js'].lineData[69]++;
    var listeners = self.get("listeners");
    _$jscoverage['/base.js'].lineData[70]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[71]++;
      self.on(n, listeners[n]);
    }
    _$jscoverage['/base.js'].lineData[74]++;
    self.initializer();
    _$jscoverage['/base.js'].lineData[76]++;
    constructPlugins(self);
    _$jscoverage['/base.js'].lineData[77]++;
    callPluginsMethod.call(self, 'pluginInitializer');
    _$jscoverage['/base.js'].lineData[79]++;
    self.bindInternal();
    _$jscoverage['/base.js'].lineData[81]++;
    self.syncInternal();
  }
  _$jscoverage['/base.js'].lineData[84]++;
  S.augment(Base, Attribute, {
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  'callSuper': function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[92]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/base.js'].lineData[96]++;
  if (visit61_96_1(visit62_96_2(typeof self == 'function') && self.__name__)) {
    _$jscoverage['/base.js'].lineData[97]++;
    method = self;
    _$jscoverage['/base.js'].lineData[98]++;
    obj = args[0];
    _$jscoverage['/base.js'].lineData[99]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/base.js'].lineData[101]++;
    method = arguments.callee.caller;
    _$jscoverage['/base.js'].lineData[102]++;
    if (visit63_102_1(method.__wrapped__)) {
      _$jscoverage['/base.js'].lineData[103]++;
      method = method.caller;
    }
    _$jscoverage['/base.js'].lineData[105]++;
    obj = self;
  }
  _$jscoverage['/base.js'].lineData[108]++;
  var name = method.__name__;
  _$jscoverage['/base.js'].lineData[109]++;
  if (visit64_109_1(!name)) {
    _$jscoverage['/base.js'].lineData[111]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[113]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/base.js'].lineData[114]++;
  if (visit65_114_1(!member)) {
    _$jscoverage['/base.js'].lineData[116]++;
    return undefined;
  }
  _$jscoverage['/base.js'].lineData[119]++;
  return member.apply(obj, visit66_119_1(args || []));
}, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[127]++;
  var self = this, attrs = self['getAttrs'](), attr, m;
  _$jscoverage['/base.js'].lineData[131]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[132]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[133]++;
    if (visit67_133_1(self[m])) {
      _$jscoverage['/base.js'].lineData[135]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[145]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[151]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[152]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[153]++;
    c = visit68_153_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[156]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[159]++;
  for (i = 0; visit69_159_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[160]++;
    var ATTRS = visit70_160_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[161]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[162]++;
      if (visit71_162_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[163]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[165]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[167]++;
        if (visit72_167_1((onSetMethod = self[onSetMethodName]) && visit73_170_1(visit74_170_2(attrs[attributeName].sync !== 0) && visit75_171_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[172]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[185]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[186]++;
  if (visit76_186_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[187]++;
    plugin = new plugin();
  }
  _$jscoverage['/base.js'].lineData[190]++;
  if (visit77_190_1(plugin['pluginInitializer'])) {
    _$jscoverage['/base.js'].lineData[191]++;
    plugin['pluginInitializer'](self);
  }
  _$jscoverage['/base.js'].lineData[193]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[194]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[204]++;
  var plugins = [], self = this, isString = visit78_206_1(typeof plugin == 'string');
  _$jscoverage['/base.js'].lineData[208]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[209]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[210]++;
  if (visit79_210_1(plugin)) {
    _$jscoverage['/base.js'].lineData[211]++;
    if (visit80_211_1(isString)) {
      _$jscoverage['/base.js'].lineData[213]++;
      pluginId = visit81_213_1(visit82_213_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[214]++;
      if (visit83_214_1(pluginId != plugin)) {
        _$jscoverage['/base.js'].lineData[215]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[216]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[219]++;
      if (visit84_219_1(p != plugin)) {
        _$jscoverage['/base.js'].lineData[220]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[221]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[226]++;
  if (visit85_226_1(!keep)) {
    _$jscoverage['/base.js'].lineData[227]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[231]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[232]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[241]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[242]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[244]++;
  var pluginId = visit86_244_1(visit87_244_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[245]++;
  if (visit88_245_1(pluginId == id)) {
    _$jscoverage['/base.js'].lineData[246]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[247]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[249]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[251]++;
  return plugin;
}, 
  destructor: S.noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[257]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[258]++;
  if (visit89_258_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[259]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[260]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[261]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[262]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[263]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[268]++;
  S.mix(Base, {
  name: 'Base', 
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
  _$jscoverage['/base.js'].lineData[340]++;
  var SuperClass = this, name, SubClass;
  _$jscoverage['/base.js'].lineData[343]++;
  if (visit90_343_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[344]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[345]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[347]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[349]++;
  sx = visit91_349_1(sx || {});
  _$jscoverage['/base.js'].lineData[350]++;
  name = visit92_350_1(sx.name || 'BaseDerived');
  _$jscoverage['/base.js'].lineData[351]++;
  px = S.merge(px);
  _$jscoverage['/base.js'].lineData[352]++;
  if (visit93_352_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/base.js'].lineData[353]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/base.js'].lineData[357]++;
    if (visit94_357_1('@DEBUG@')) {
      _$jscoverage['/base.js'].lineData[358]++;
      eval("SubClass = function " + CamelCase(name) + "(){ " + "this.callSuper.apply(this, arguments);}");
    } else {
      _$jscoverage['/base.js'].lineData[361]++;
      SubClass = function() {
  _$jscoverage['/base.js'].functionData[17]++;
  _$jscoverage['/base.js'].lineData[362]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/base.js'].lineData[366]++;
  px.constructor = SubClass;
  _$jscoverage['/base.js'].lineData[368]++;
  var hooks = SuperClass.__hooks__;
  _$jscoverage['/base.js'].lineData[369]++;
  if (visit95_369_1(hooks)) {
    _$jscoverage['/base.js'].lineData[370]++;
    sx.__hooks__ = S.merge(hooks, sx.__hooks__);
  }
  _$jscoverage['/base.js'].lineData[372]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[373]++;
  wrapProtoForSuper(px, SubClass, visit96_373_1(sx.__hooks__ || {}));
  _$jscoverage['/base.js'].lineData[374]++;
  var sp = SuperClass.prototype;
  _$jscoverage['/base.js'].lineData[376]++;
  var inheritedStatics = sp['__inheritedStatics__'] = visit97_376_1(sp['__inheritedStatics__'] || sx['inheritedStatics']);
  _$jscoverage['/base.js'].lineData[377]++;
  if (visit98_377_1(sx['inheritedStatics'] && visit99_377_2(inheritedStatics !== sx['inheritedStatics']))) {
    _$jscoverage['/base.js'].lineData[378]++;
    S.mix(inheritedStatics, sx['inheritedStatics']);
  }
  _$jscoverage['/base.js'].lineData[380]++;
  if (visit100_380_1(inheritedStatics)) {
    _$jscoverage['/base.js'].lineData[381]++;
    S.mix(SubClass, inheritedStatics);
  }
  _$jscoverage['/base.js'].lineData[383]++;
  delete sx['inheritedStatics'];
  _$jscoverage['/base.js'].lineData[385]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/base.js'].lineData[387]++;
  if (visit101_387_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[388]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[392]++;
    S.each(extensions['concat'](SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[18]++;
  _$jscoverage['/base.js'].lineData[393]++;
  if (visit102_393_1(ext)) {
    _$jscoverage['/base.js'].lineData[403]++;
    S.each(ext[ATTRS], function(v, name) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[404]++;
  var av = attrs[name] = visit103_404_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[405]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[408]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[410]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[412]++;
      if (visit104_412_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[413]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[418]++;
    SubClass[ATTRS] = attrs;
    _$jscoverage['/base.js'].lineData[419]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[420]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[422]++;
  SubClass.extend = visit105_422_1(SubClass.extend || extend);
  _$jscoverage['/base.js'].lineData[423]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/base.js'].lineData[424]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[428]++;
  function addMembers(px) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[429]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[430]++;
    wrapProtoForSuper(px, SubClass, visit106_430_1(SubClass.__hooks__ || {}));
    _$jscoverage['/base.js'].lineData[431]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/base.js'].lineData[458]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[459]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[462]++;
    if (visit107_462_1(e.target == self)) {
      _$jscoverage['/base.js'].lineData[463]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[464]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[468]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[469]++;
    if (visit108_469_1(attrs)) {
      _$jscoverage['/base.js'].lineData[470]++;
      for (var attr in attrs) {
        _$jscoverage['/base.js'].lineData[478]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[483]++;
  function initAttrs(host, config) {
    _$jscoverage['/base.js'].functionData[23]++;
    _$jscoverage['/base.js'].lineData[484]++;
    if (visit109_484_1(config)) {
      _$jscoverage['/base.js'].lineData[485]++;
      for (var attr in config) {
        _$jscoverage['/base.js'].lineData[487]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/base.js'].lineData[492]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[24]++;
    _$jscoverage['/base.js'].lineData[493]++;
    var plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[494]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[25]++;
  _$jscoverage['/base.js'].lineData[495]++;
  if (visit110_495_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[496]++;
    plugins[i] = new plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[501]++;
  function wrapper(fn) {
    _$jscoverage['/base.js'].functionData[26]++;
    _$jscoverage['/base.js'].lineData[502]++;
    return function() {
  _$jscoverage['/base.js'].functionData[27]++;
  _$jscoverage['/base.js'].lineData[503]++;
  return fn.apply(this, arguments);
};
  }
  _$jscoverage['/base.js'].lineData[507]++;
  function wrapProtoForSuper(px, SubClass, hooks) {
    _$jscoverage['/base.js'].functionData[28]++;
    _$jscoverage['/base.js'].lineData[508]++;
    var extensions = SubClass.__extensions__;
    _$jscoverage['/base.js'].lineData[509]++;
    if (visit111_509_1(extensions.length)) {
      _$jscoverage['/base.js'].lineData[510]++;
      for (p in hooks) {
        _$jscoverage['/base.js'].lineData[511]++;
        px[p] = visit112_511_1(px[p] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[515]++;
    for (var p in hooks) {
      _$jscoverage['/base.js'].lineData[516]++;
      if (visit113_516_1(p in px)) {
        _$jscoverage['/base.js'].lineData[517]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/base.js'].lineData[520]++;
    S.each(px, function(v, p) {
  _$jscoverage['/base.js'].functionData[29]++;
  _$jscoverage['/base.js'].lineData[521]++;
  if (visit114_521_1(typeof v == 'function')) {
    _$jscoverage['/base.js'].lineData[522]++;
    var wrapped = 0;
    _$jscoverage['/base.js'].lineData[523]++;
    if (visit115_523_1(v.__owner__)) {
      _$jscoverage['/base.js'].lineData[524]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/base.js'].lineData[525]++;
      delete v.__owner__;
      _$jscoverage['/base.js'].lineData[526]++;
      delete v.__name__;
      _$jscoverage['/base.js'].lineData[527]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/base.js'].lineData[528]++;
      var newV = wrapper(v);
      _$jscoverage['/base.js'].lineData[529]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/base.js'].lineData[530]++;
      newV.__name__ = p;
      _$jscoverage['/base.js'].lineData[531]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/base.js'].lineData[532]++;
      if (visit116_532_1(v.__wrapped__)) {
        _$jscoverage['/base.js'].lineData[533]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/base.js'].lineData[535]++;
    if (visit117_535_1(wrapped)) {
      _$jscoverage['/base.js'].lineData[536]++;
      px[p] = v = wrapper(v);
    }
    _$jscoverage['/base.js'].lineData[538]++;
    v.__owner__ = SubClass;
    _$jscoverage['/base.js'].lineData[539]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/base.js'].lineData[544]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[30]++;
    _$jscoverage['/base.js'].lineData[545]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[548]++;
    if (visit118_548_1(len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[549]++;
      for (var i = 0; visit119_549_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[550]++;
        visit120_550_1(plugins[i][method] && plugins[i][method](self));
      }
    }
  }
  _$jscoverage['/base.js'].lineData[555]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[31]++;
    _$jscoverage['/base.js'].lineData[556]++;
    var len;
    _$jscoverage['/base.js'].lineData[557]++;
    if (visit121_557_1(len = visit122_557_2(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[558]++;
      for (var i = 0; visit123_558_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[559]++;
        var fn = visit124_559_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[564]++;
        if (visit125_564_1(fn)) {
          _$jscoverage['/base.js'].lineData[565]++;
          fn.apply(self, visit126_565_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[571]++;
  Base.INVALID = Attribute.INVALID;
  _$jscoverage['/base.js'].lineData[573]++;
  S.Base = Base;
  _$jscoverage['/base.js'].lineData[575]++;
  return Base;
}, {
  requires: ['base/attribute', 'event/custom']});
