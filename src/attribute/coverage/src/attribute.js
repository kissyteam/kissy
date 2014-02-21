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
  _$jscoverage['/attribute.js'].lineData[7] = 0;
  _$jscoverage['/attribute.js'].lineData[8] = 0;
  _$jscoverage['/attribute.js'].lineData[9] = 0;
  _$jscoverage['/attribute.js'].lineData[11] = 0;
  _$jscoverage['/attribute.js'].lineData[13] = 0;
  _$jscoverage['/attribute.js'].lineData[14] = 0;
  _$jscoverage['/attribute.js'].lineData[17] = 0;
  _$jscoverage['/attribute.js'].lineData[18] = 0;
  _$jscoverage['/attribute.js'].lineData[22] = 0;
  _$jscoverage['/attribute.js'].lineData[24] = 0;
  _$jscoverage['/attribute.js'].lineData[26] = 0;
  _$jscoverage['/attribute.js'].lineData[27] = 0;
  _$jscoverage['/attribute.js'].lineData[28] = 0;
  _$jscoverage['/attribute.js'].lineData[30] = 0;
  _$jscoverage['/attribute.js'].lineData[33] = 0;
  _$jscoverage['/attribute.js'].lineData[34] = 0;
  _$jscoverage['/attribute.js'].lineData[37] = 0;
  _$jscoverage['/attribute.js'].lineData[38] = 0;
  _$jscoverage['/attribute.js'].lineData[42] = 0;
  _$jscoverage['/attribute.js'].lineData[43] = 0;
  _$jscoverage['/attribute.js'].lineData[44] = 0;
  _$jscoverage['/attribute.js'].lineData[52] = 0;
  _$jscoverage['/attribute.js'].lineData[53] = 0;
  _$jscoverage['/attribute.js'].lineData[54] = 0;
  _$jscoverage['/attribute.js'].lineData[55] = 0;
  _$jscoverage['/attribute.js'].lineData[57] = 0;
  _$jscoverage['/attribute.js'].lineData[63] = 0;
  _$jscoverage['/attribute.js'].lineData[64] = 0;
  _$jscoverage['/attribute.js'].lineData[67] = 0;
  _$jscoverage['/attribute.js'].lineData[69] = 0;
  _$jscoverage['/attribute.js'].lineData[75] = 0;
  _$jscoverage['/attribute.js'].lineData[76] = 0;
  _$jscoverage['/attribute.js'].lineData[78] = 0;
  _$jscoverage['/attribute.js'].lineData[79] = 0;
  _$jscoverage['/attribute.js'].lineData[80] = 0;
  _$jscoverage['/attribute.js'].lineData[82] = 0;
  _$jscoverage['/attribute.js'].lineData[83] = 0;
  _$jscoverage['/attribute.js'].lineData[85] = 0;
  _$jscoverage['/attribute.js'].lineData[88] = 0;
  _$jscoverage['/attribute.js'].lineData[91] = 0;
  _$jscoverage['/attribute.js'].lineData[92] = 0;
  _$jscoverage['/attribute.js'].lineData[94] = 0;
  _$jscoverage['/attribute.js'].lineData[95] = 0;
  _$jscoverage['/attribute.js'].lineData[96] = 0;
  _$jscoverage['/attribute.js'].lineData[99] = 0;
  _$jscoverage['/attribute.js'].lineData[105] = 0;
  _$jscoverage['/attribute.js'].lineData[106] = 0;
  _$jscoverage['/attribute.js'].lineData[107] = 0;
  _$jscoverage['/attribute.js'].lineData[108] = 0;
  _$jscoverage['/attribute.js'].lineData[109] = 0;
  _$jscoverage['/attribute.js'].lineData[111] = 0;
  _$jscoverage['/attribute.js'].lineData[113] = 0;
  _$jscoverage['/attribute.js'].lineData[115] = 0;
  _$jscoverage['/attribute.js'].lineData[118] = 0;
  _$jscoverage['/attribute.js'].lineData[119] = 0;
  _$jscoverage['/attribute.js'].lineData[120] = 0;
  _$jscoverage['/attribute.js'].lineData[121] = 0;
  _$jscoverage['/attribute.js'].lineData[123] = 0;
  _$jscoverage['/attribute.js'].lineData[124] = 0;
  _$jscoverage['/attribute.js'].lineData[125] = 0;
  _$jscoverage['/attribute.js'].lineData[132] = 0;
  _$jscoverage['/attribute.js'].lineData[133] = 0;
  _$jscoverage['/attribute.js'].lineData[139] = 0;
  _$jscoverage['/attribute.js'].lineData[140] = 0;
  _$jscoverage['/attribute.js'].lineData[141] = 0;
  _$jscoverage['/attribute.js'].lineData[143] = 0;
  _$jscoverage['/attribute.js'].lineData[145] = 0;
  _$jscoverage['/attribute.js'].lineData[146] = 0;
  _$jscoverage['/attribute.js'].lineData[151] = 0;
  _$jscoverage['/attribute.js'].lineData[152] = 0;
  _$jscoverage['/attribute.js'].lineData[153] = 0;
  _$jscoverage['/attribute.js'].lineData[154] = 0;
  _$jscoverage['/attribute.js'].lineData[155] = 0;
  _$jscoverage['/attribute.js'].lineData[159] = 0;
  _$jscoverage['/attribute.js'].lineData[161] = 0;
  _$jscoverage['/attribute.js'].lineData[172] = 0;
  _$jscoverage['/attribute.js'].lineData[173] = 0;
  _$jscoverage['/attribute.js'].lineData[174] = 0;
  _$jscoverage['/attribute.js'].lineData[177] = 0;
  _$jscoverage['/attribute.js'].lineData[178] = 0;
  _$jscoverage['/attribute.js'].lineData[182] = 0;
  _$jscoverage['/attribute.js'].lineData[185] = 0;
  _$jscoverage['/attribute.js'].lineData[186] = 0;
  _$jscoverage['/attribute.js'].lineData[195] = 0;
  _$jscoverage['/attribute.js'].lineData[197] = 0;
  _$jscoverage['/attribute.js'].lineData[198] = 0;
  _$jscoverage['/attribute.js'].lineData[202] = 0;
  _$jscoverage['/attribute.js'].lineData[203] = 0;
  _$jscoverage['/attribute.js'].lineData[204] = 0;
  _$jscoverage['/attribute.js'].lineData[205] = 0;
  _$jscoverage['/attribute.js'].lineData[206] = 0;
  _$jscoverage['/attribute.js'].lineData[213] = 0;
  _$jscoverage['/attribute.js'].lineData[221] = 0;
  _$jscoverage['/attribute.js'].lineData[228] = 0;
  _$jscoverage['/attribute.js'].lineData[229] = 0;
  _$jscoverage['/attribute.js'].lineData[232] = 0;
  _$jscoverage['/attribute.js'].lineData[234] = 0;
  _$jscoverage['/attribute.js'].lineData[235] = 0;
  _$jscoverage['/attribute.js'].lineData[236] = 0;
  _$jscoverage['/attribute.js'].lineData[239] = 0;
  _$jscoverage['/attribute.js'].lineData[242] = 0;
  _$jscoverage['/attribute.js'].lineData[243] = 0;
  _$jscoverage['/attribute.js'].lineData[245] = 0;
  _$jscoverage['/attribute.js'].lineData[246] = 0;
  _$jscoverage['/attribute.js'].lineData[247] = 0;
  _$jscoverage['/attribute.js'].lineData[250] = 0;
  _$jscoverage['/attribute.js'].lineData[251] = 0;
  _$jscoverage['/attribute.js'].lineData[252] = 0;
  _$jscoverage['/attribute.js'].lineData[253] = 0;
  _$jscoverage['/attribute.js'].lineData[254] = 0;
  _$jscoverage['/attribute.js'].lineData[255] = 0;
  _$jscoverage['/attribute.js'].lineData[256] = 0;
  _$jscoverage['/attribute.js'].lineData[257] = 0;
  _$jscoverage['/attribute.js'].lineData[258] = 0;
  _$jscoverage['/attribute.js'].lineData[259] = 0;
  _$jscoverage['/attribute.js'].lineData[260] = 0;
  _$jscoverage['/attribute.js'].lineData[261] = 0;
  _$jscoverage['/attribute.js'].lineData[262] = 0;
  _$jscoverage['/attribute.js'].lineData[263] = 0;
  _$jscoverage['/attribute.js'].lineData[265] = 0;
  _$jscoverage['/attribute.js'].lineData[266] = 0;
  _$jscoverage['/attribute.js'].lineData[268] = 0;
  _$jscoverage['/attribute.js'].lineData[269] = 0;
  _$jscoverage['/attribute.js'].lineData[274] = 0;
  _$jscoverage['/attribute.js'].lineData[275] = 0;
  _$jscoverage['/attribute.js'].lineData[276] = 0;
  _$jscoverage['/attribute.js'].lineData[277] = 0;
  _$jscoverage['/attribute.js'].lineData[280] = 0;
  _$jscoverage['/attribute.js'].lineData[281] = 0;
  _$jscoverage['/attribute.js'].lineData[283] = 0;
  _$jscoverage['/attribute.js'].lineData[284] = 0;
  _$jscoverage['/attribute.js'].lineData[285] = 0;
  _$jscoverage['/attribute.js'].lineData[287] = 0;
  _$jscoverage['/attribute.js'].lineData[288] = 0;
  _$jscoverage['/attribute.js'].lineData[289] = 0;
  _$jscoverage['/attribute.js'].lineData[291] = 0;
  _$jscoverage['/attribute.js'].lineData[292] = 0;
  _$jscoverage['/attribute.js'].lineData[293] = 0;
  _$jscoverage['/attribute.js'].lineData[297] = 0;
  _$jscoverage['/attribute.js'].lineData[299] = 0;
  _$jscoverage['/attribute.js'].lineData[303] = 0;
  _$jscoverage['/attribute.js'].lineData[304] = 0;
  _$jscoverage['/attribute.js'].lineData[308] = 0;
  _$jscoverage['/attribute.js'].lineData[309] = 0;
  _$jscoverage['/attribute.js'].lineData[310] = 0;
  _$jscoverage['/attribute.js'].lineData[311] = 0;
  _$jscoverage['/attribute.js'].lineData[313] = 0;
  _$jscoverage['/attribute.js'].lineData[314] = 0;
  _$jscoverage['/attribute.js'].lineData[315] = 0;
  _$jscoverage['/attribute.js'].lineData[317] = 0;
  _$jscoverage['/attribute.js'].lineData[318] = 0;
  _$jscoverage['/attribute.js'].lineData[319] = 0;
  _$jscoverage['/attribute.js'].lineData[321] = 0;
  _$jscoverage['/attribute.js'].lineData[322] = 0;
  _$jscoverage['/attribute.js'].lineData[323] = 0;
  _$jscoverage['/attribute.js'].lineData[326] = 0;
  _$jscoverage['/attribute.js'].lineData[327] = 0;
  _$jscoverage['/attribute.js'].lineData[328] = 0;
  _$jscoverage['/attribute.js'].lineData[336] = 0;
  _$jscoverage['/attribute.js'].lineData[341] = 0;
  _$jscoverage['/attribute.js'].lineData[342] = 0;
  _$jscoverage['/attribute.js'].lineData[343] = 0;
  _$jscoverage['/attribute.js'].lineData[345] = 0;
  _$jscoverage['/attribute.js'].lineData[350] = 0;
  _$jscoverage['/attribute.js'].lineData[354] = 0;
  _$jscoverage['/attribute.js'].lineData[358] = 0;
  _$jscoverage['/attribute.js'].lineData[359] = 0;
  _$jscoverage['/attribute.js'].lineData[360] = 0;
  _$jscoverage['/attribute.js'].lineData[361] = 0;
  _$jscoverage['/attribute.js'].lineData[364] = 0;
  _$jscoverage['/attribute.js'].lineData[365] = 0;
  _$jscoverage['/attribute.js'].lineData[366] = 0;
  _$jscoverage['/attribute.js'].lineData[368] = 0;
  _$jscoverage['/attribute.js'].lineData[371] = 0;
  _$jscoverage['/attribute.js'].lineData[372] = 0;
  _$jscoverage['/attribute.js'].lineData[374] = 0;
  _$jscoverage['/attribute.js'].lineData[376] = 0;
  _$jscoverage['/attribute.js'].lineData[377] = 0;
  _$jscoverage['/attribute.js'].lineData[379] = 0;
  _$jscoverage['/attribute.js'].lineData[382] = 0;
  _$jscoverage['/attribute.js'].lineData[391] = 0;
  _$jscoverage['/attribute.js'].lineData[399] = 0;
  _$jscoverage['/attribute.js'].lineData[403] = 0;
  _$jscoverage['/attribute.js'].lineData[404] = 0;
  _$jscoverage['/attribute.js'].lineData[406] = 0;
  _$jscoverage['/attribute.js'].lineData[427] = 0;
  _$jscoverage['/attribute.js'].lineData[431] = 0;
  _$jscoverage['/attribute.js'].lineData[432] = 0;
  _$jscoverage['/attribute.js'].lineData[434] = 0;
  _$jscoverage['/attribute.js'].lineData[436] = 0;
  _$jscoverage['/attribute.js'].lineData[446] = 0;
  _$jscoverage['/attribute.js'].lineData[447] = 0;
  _$jscoverage['/attribute.js'].lineData[448] = 0;
  _$jscoverage['/attribute.js'].lineData[450] = 0;
  _$jscoverage['/attribute.js'].lineData[451] = 0;
  _$jscoverage['/attribute.js'].lineData[453] = 0;
  _$jscoverage['/attribute.js'].lineData[462] = 0;
  _$jscoverage['/attribute.js'].lineData[470] = 0;
  _$jscoverage['/attribute.js'].lineData[471] = 0;
  _$jscoverage['/attribute.js'].lineData[472] = 0;
  _$jscoverage['/attribute.js'].lineData[474] = 0;
  _$jscoverage['/attribute.js'].lineData[475] = 0;
  _$jscoverage['/attribute.js'].lineData[476] = 0;
  _$jscoverage['/attribute.js'].lineData[479] = 0;
  _$jscoverage['/attribute.js'].lineData[493] = 0;
  _$jscoverage['/attribute.js'].lineData[494] = 0;
  _$jscoverage['/attribute.js'].lineData[495] = 0;
  _$jscoverage['/attribute.js'].lineData[496] = 0;
  _$jscoverage['/attribute.js'].lineData[497] = 0;
  _$jscoverage['/attribute.js'].lineData[500] = 0;
  _$jscoverage['/attribute.js'].lineData[503] = 0;
  _$jscoverage['/attribute.js'].lineData[504] = 0;
  _$jscoverage['/attribute.js'].lineData[507] = 0;
  _$jscoverage['/attribute.js'].lineData[508] = 0;
  _$jscoverage['/attribute.js'].lineData[509] = 0;
  _$jscoverage['/attribute.js'].lineData[511] = 0;
  _$jscoverage['/attribute.js'].lineData[513] = 0;
  _$jscoverage['/attribute.js'].lineData[514] = 0;
  _$jscoverage['/attribute.js'].lineData[516] = 0;
  _$jscoverage['/attribute.js'].lineData[520] = 0;
  _$jscoverage['/attribute.js'].lineData[521] = 0;
  _$jscoverage['/attribute.js'].lineData[522] = 0;
  _$jscoverage['/attribute.js'].lineData[523] = 0;
  _$jscoverage['/attribute.js'].lineData[524] = 0;
  _$jscoverage['/attribute.js'].lineData[526] = 0;
  _$jscoverage['/attribute.js'].lineData[527] = 0;
  _$jscoverage['/attribute.js'].lineData[536] = 0;
  _$jscoverage['/attribute.js'].lineData[538] = 0;
  _$jscoverage['/attribute.js'].lineData[540] = 0;
  _$jscoverage['/attribute.js'].lineData[542] = 0;
  _$jscoverage['/attribute.js'].lineData[543] = 0;
  _$jscoverage['/attribute.js'].lineData[544] = 0;
  _$jscoverage['/attribute.js'].lineData[546] = 0;
  _$jscoverage['/attribute.js'].lineData[548] = 0;
  _$jscoverage['/attribute.js'].lineData[557] = 0;
  _$jscoverage['/attribute.js'].lineData[566] = 0;
  _$jscoverage['/attribute.js'].lineData[567] = 0;
  _$jscoverage['/attribute.js'].lineData[570] = 0;
  _$jscoverage['/attribute.js'].lineData[571] = 0;
  _$jscoverage['/attribute.js'].lineData[574] = 0;
  _$jscoverage['/attribute.js'].lineData[575] = 0;
  _$jscoverage['/attribute.js'].lineData[579] = 0;
  _$jscoverage['/attribute.js'].lineData[581] = 0;
  _$jscoverage['/attribute.js'].lineData[590] = 0;
  _$jscoverage['/attribute.js'].lineData[597] = 0;
  _$jscoverage['/attribute.js'].lineData[598] = 0;
  _$jscoverage['/attribute.js'].lineData[599] = 0;
  _$jscoverage['/attribute.js'].lineData[602] = 0;
  _$jscoverage['/attribute.js'].lineData[603] = 0;
  _$jscoverage['/attribute.js'].lineData[607] = 0;
  _$jscoverage['/attribute.js'].lineData[612] = 0;
  _$jscoverage['/attribute.js'].lineData[613] = 0;
  _$jscoverage['/attribute.js'].lineData[616] = 0;
  _$jscoverage['/attribute.js'].lineData[617] = 0;
  _$jscoverage['/attribute.js'].lineData[620] = 0;
  _$jscoverage['/attribute.js'].lineData[621] = 0;
  _$jscoverage['/attribute.js'].lineData[624] = 0;
  _$jscoverage['/attribute.js'].lineData[636] = 0;
  _$jscoverage['/attribute.js'].lineData[638] = 0;
  _$jscoverage['/attribute.js'].lineData[639] = 0;
  _$jscoverage['/attribute.js'].lineData[641] = 0;
  _$jscoverage['/attribute.js'].lineData[644] = 0;
  _$jscoverage['/attribute.js'].lineData[648] = 0;
  _$jscoverage['/attribute.js'].lineData[651] = 0;
  _$jscoverage['/attribute.js'].lineData[655] = 0;
  _$jscoverage['/attribute.js'].lineData[656] = 0;
  _$jscoverage['/attribute.js'].lineData[659] = 0;
  _$jscoverage['/attribute.js'].lineData[660] = 0;
  _$jscoverage['/attribute.js'].lineData[665] = 0;
  _$jscoverage['/attribute.js'].lineData[666] = 0;
  _$jscoverage['/attribute.js'].lineData[671] = 0;
  _$jscoverage['/attribute.js'].lineData[672] = 0;
  _$jscoverage['/attribute.js'].lineData[673] = 0;
  _$jscoverage['/attribute.js'].lineData[677] = 0;
  _$jscoverage['/attribute.js'].lineData[679] = 0;
  _$jscoverage['/attribute.js'].lineData[680] = 0;
  _$jscoverage['/attribute.js'].lineData[683] = 0;
  _$jscoverage['/attribute.js'].lineData[686] = 0;
  _$jscoverage['/attribute.js'].lineData[687] = 0;
  _$jscoverage['/attribute.js'].lineData[689] = 0;
  _$jscoverage['/attribute.js'].lineData[691] = 0;
  _$jscoverage['/attribute.js'].lineData[692] = 0;
  _$jscoverage['/attribute.js'].lineData[694] = 0;
  _$jscoverage['/attribute.js'].lineData[695] = 0;
  _$jscoverage['/attribute.js'].lineData[696] = 0;
  _$jscoverage['/attribute.js'].lineData[698] = 0;
  _$jscoverage['/attribute.js'].lineData[701] = 0;
  _$jscoverage['/attribute.js'].lineData[702] = 0;
  _$jscoverage['/attribute.js'].lineData[704] = 0;
  _$jscoverage['/attribute.js'].lineData[705] = 0;
  _$jscoverage['/attribute.js'].lineData[708] = 0;
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
  _$jscoverage['/attribute.js'].functionData[27] = 0;
  _$jscoverage['/attribute.js'].functionData[28] = 0;
  _$jscoverage['/attribute.js'].functionData[29] = 0;
  _$jscoverage['/attribute.js'].functionData[30] = 0;
  _$jscoverage['/attribute.js'].functionData[31] = 0;
  _$jscoverage['/attribute.js'].functionData[32] = 0;
  _$jscoverage['/attribute.js'].functionData[33] = 0;
  _$jscoverage['/attribute.js'].functionData[34] = 0;
  _$jscoverage['/attribute.js'].functionData[35] = 0;
  _$jscoverage['/attribute.js'].functionData[36] = 0;
  _$jscoverage['/attribute.js'].functionData[37] = 0;
}
if (! _$jscoverage['/attribute.js'].branchData) {
  _$jscoverage['/attribute.js'].branchData = {};
  _$jscoverage['/attribute.js'].branchData['27'] = [];
  _$jscoverage['/attribute.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['34'] = [];
  _$jscoverage['/attribute.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['43'] = [];
  _$jscoverage['/attribute.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['54'] = [];
  _$jscoverage['/attribute.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['57'] = [];
  _$jscoverage['/attribute.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'] = [];
  _$jscoverage['/attribute.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['65'][3] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['78'] = [];
  _$jscoverage['/attribute.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['79'] = [];
  _$jscoverage['/attribute.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['82'] = [];
  _$jscoverage['/attribute.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['94'] = [];
  _$jscoverage['/attribute.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['107'] = [];
  _$jscoverage['/attribute.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['108'] = [];
  _$jscoverage['/attribute.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['120'] = [];
  _$jscoverage['/attribute.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['145'] = [];
  _$jscoverage['/attribute.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['151'] = [];
  _$jscoverage['/attribute.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'] = [];
  _$jscoverage['/attribute.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['152'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['154'] = [];
  _$jscoverage['/attribute.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['154'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['172'] = [];
  _$jscoverage['/attribute.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['173'] = [];
  _$jscoverage['/attribute.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['177'] = [];
  _$jscoverage['/attribute.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['197'] = [];
  _$jscoverage['/attribute.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['202'] = [];
  _$jscoverage['/attribute.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['205'] = [];
  _$jscoverage['/attribute.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['243'] = [];
  _$jscoverage['/attribute.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['246'] = [];
  _$jscoverage['/attribute.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['251'] = [];
  _$jscoverage['/attribute.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['253'] = [];
  _$jscoverage['/attribute.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['262'] = [];
  _$jscoverage['/attribute.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['265'] = [];
  _$jscoverage['/attribute.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['283'] = [];
  _$jscoverage['/attribute.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['284'] = [];
  _$jscoverage['/attribute.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['288'] = [];
  _$jscoverage['/attribute.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['291'] = [];
  _$jscoverage['/attribute.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['292'] = [];
  _$jscoverage['/attribute.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['297'] = [];
  _$jscoverage['/attribute.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['314'] = [];
  _$jscoverage['/attribute.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['318'] = [];
  _$jscoverage['/attribute.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['321'] = [];
  _$jscoverage['/attribute.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['327'] = [];
  _$jscoverage['/attribute.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['342'] = [];
  _$jscoverage['/attribute.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['358'] = [];
  _$jscoverage['/attribute.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['365'] = [];
  _$jscoverage['/attribute.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['372'] = [];
  _$jscoverage['/attribute.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['377'] = [];
  _$jscoverage['/attribute.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['382'] = [];
  _$jscoverage['/attribute.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['391'] = [];
  _$jscoverage['/attribute.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['450'] = [];
  _$jscoverage['/attribute.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['474'] = [];
  _$jscoverage['/attribute.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['494'] = [];
  _$jscoverage['/attribute.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['496'] = [];
  _$jscoverage['/attribute.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['503'] = [];
  _$jscoverage['/attribute.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['507'] = [];
  _$jscoverage['/attribute.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['508'] = [];
  _$jscoverage['/attribute.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['526'] = [];
  _$jscoverage['/attribute.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['538'] = [];
  _$jscoverage['/attribute.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['542'] = [];
  _$jscoverage['/attribute.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['543'] = [];
  _$jscoverage['/attribute.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['566'] = [];
  _$jscoverage['/attribute.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['570'] = [];
  _$jscoverage['/attribute.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['574'] = [];
  _$jscoverage['/attribute.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['597'] = [];
  _$jscoverage['/attribute.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['612'] = [];
  _$jscoverage['/attribute.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['616'] = [];
  _$jscoverage['/attribute.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['616'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['620'] = [];
  _$jscoverage['/attribute.js'].branchData['620'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['638'] = [];
  _$jscoverage['/attribute.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['639'] = [];
  _$jscoverage['/attribute.js'].branchData['639'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['671'] = [];
  _$jscoverage['/attribute.js'].branchData['671'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['673'] = [];
  _$jscoverage['/attribute.js'].branchData['673'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['694'] = [];
  _$jscoverage['/attribute.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['701'] = [];
  _$jscoverage['/attribute.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['704'] = [];
  _$jscoverage['/attribute.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['704'][2] = new BranchData();
  _$jscoverage['/attribute.js'].branchData['704'][3] = new BranchData();
}
_$jscoverage['/attribute.js'].branchData['704'][3].init(148, 10, 'e !== true');
function visit79_704_3(result) {
  _$jscoverage['/attribute.js'].branchData['704'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['704'][2].init(129, 15, 'e !== undefined');
function visit78_704_2(result) {
  _$jscoverage['/attribute.js'].branchData['704'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['704'][1].init(129, 29, 'e !== undefined && e !== true');
function visit77_704_1(result) {
  _$jscoverage['/attribute.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['701'][1].init(426, 52, 'validator && (validator = normalFn(self, validator))');
function visit76_701_1(result) {
  _$jscoverage['/attribute.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['694'][1].init(171, 4, 'path');
function visit75_694_1(result) {
  _$jscoverage['/attribute.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['673'][1].init(53, 85, 'val !== undefined');
function visit74_673_1(result) {
  _$jscoverage['/attribute.js'].branchData['673'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['671'][1].init(165, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit73_671_1(result) {
  _$jscoverage['/attribute.js'].branchData['671'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['639'][1].init(21, 18, 'self.hasAttr(name)');
function visit72_639_1(result) {
  _$jscoverage['/attribute.js'].branchData['639'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['638'][1].init(47, 24, 'typeof name === \'string\'');
function visit71_638_1(result) {
  _$jscoverage['/attribute.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['620'][1].init(944, 4, 'path');
function visit70_620_1(result) {
  _$jscoverage['/attribute.js'].branchData['620'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['616'][2].init(854, 17, 'ret !== undefined');
function visit69_616_2(result) {
  _$jscoverage['/attribute.js'].branchData['616'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['616'][1].init(831, 40, '!(name in attrVals) && ret !== undefined');
function visit68_616_1(result) {
  _$jscoverage['/attribute.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['612'][1].init(701, 43, 'getter && (getter = normalFn(self, getter))');
function visit67_612_1(result) {
  _$jscoverage['/attribute.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['597'][1].init(199, 24, 'name.indexOf(dot) !== -1');
function visit66_597_1(result) {
  _$jscoverage['/attribute.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['574'][1].init(669, 22, 'setValue !== undefined');
function visit65_574_1(result) {
  _$jscoverage['/attribute.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['570'][1].init(584, 20, 'setValue === INVALID');
function visit64_570_1(result) {
  _$jscoverage['/attribute.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['566'][1].init(447, 43, 'setter && (setter = normalFn(self, setter))');
function visit63_566_1(result) {
  _$jscoverage['/attribute.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['543'][1].init(21, 10, 'opts.error');
function visit62_543_1(result) {
  _$jscoverage['/attribute.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['542'][1].init(1780, 15, 'e !== undefined');
function visit61_542_1(result) {
  _$jscoverage['/attribute.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['538'][1].init(1675, 10, 'opts || {}');
function visit60_538_1(result) {
  _$jscoverage['/attribute.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['526'][1].init(1226, 16, 'attrNames.length');
function visit59_526_1(result) {
  _$jscoverage['/attribute.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['508'][1].init(25, 10, 'opts.error');
function visit58_508_1(result) {
  _$jscoverage['/attribute.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['507'][1].init(494, 13, 'errors.length');
function visit57_507_1(result) {
  _$jscoverage['/attribute.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['503'][1].init(129, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit56_503_1(result) {
  _$jscoverage['/attribute.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['496'][1].init(54, 10, 'opts || {}');
function visit55_496_1(result) {
  _$jscoverage['/attribute.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['494'][1].init(49, 21, 'S.isPlainObject(name)');
function visit54_494_1(result) {
  _$jscoverage['/attribute.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['474'][1].init(138, 18, 'self.hasAttr(name)');
function visit53_474_1(result) {
  _$jscoverage['/attribute.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['450'][1].init(172, 13, 'initialValues');
function visit52_450_1(result) {
  _$jscoverage['/attribute.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['391'][1].init(20, 35, 'this.__attrs || (this.__attrs = {})');
function visit51_391_1(result) {
  _$jscoverage['/attribute.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['382'][1].init(1047, 10, 'args || []');
function visit50_382_1(result) {
  _$jscoverage['/attribute.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['377'][1].init(847, 7, '!member');
function visit49_377_1(result) {
  _$jscoverage['/attribute.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['372'][1].init(593, 5, '!name');
function visit48_372_1(result) {
  _$jscoverage['/attribute.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['365'][1].init(111, 18, 'method.__wrapped__');
function visit47_365_1(result) {
  _$jscoverage['/attribute.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['358'][2].init(110, 26, 'typeof self === \'function\'');
function visit46_358_2(result) {
  _$jscoverage['/attribute.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['358'][1].init(110, 43, 'typeof self === \'function\' && self.__name__');
function visit45_358_1(result) {
  _$jscoverage['/attribute.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['342'][1].init(13, 6, 'config');
function visit44_342_1(result) {
  _$jscoverage['/attribute.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['327'][1].init(13, 5, 'attrs');
function visit43_327_1(result) {
  _$jscoverage['/attribute.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['321'][1].init(1581, 19, 'sx.extend || extend');
function visit42_321_1(result) {
  _$jscoverage['/attribute.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['318'][1].init(1474, 18, 'sxInheritedStatics');
function visit41_318_1(result) {
  _$jscoverage['/attribute.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['314'][1].init(56, 25, 'sx.inheritedStatics || {}');
function visit40_314_1(result) {
  _$jscoverage['/attribute.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['297'][1].init(138, 9, '\'@DEBUG@\'');
function visit39_297_1(result) {
  _$jscoverage['/attribute.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['292'][1].init(373, 32, 'px.hasOwnProperty(\'constructor\')');
function visit38_292_1(result) {
  _$jscoverage['/attribute.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['291'][1].init(330, 29, 'sx.name || \'AttributeDerived\'');
function visit37_291_1(result) {
  _$jscoverage['/attribute.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['288'][1].init(38, 18, 'sx.__hooks__ || {}');
function visit36_288_1(result) {
  _$jscoverage['/attribute.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['284'][1].init(90, 8, 'px || {}');
function visit35_284_1(result) {
  _$jscoverage['/attribute.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['283'][1].init(67, 8, 'sx || {}');
function visit34_283_1(result) {
  _$jscoverage['/attribute.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['265'][1].init(551, 7, 'wrapped');
function visit33_265_1(result) {
  _$jscoverage['/attribute.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['262'][1].init(464, 13, 'v.__wrapped__');
function visit32_262_1(result) {
  _$jscoverage['/attribute.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['253'][1].init(54, 11, 'v.__owner__');
function visit31_253_1(result) {
  _$jscoverage['/attribute.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['251'][1].init(17, 23, 'typeof v === \'function\'');
function visit30_251_1(result) {
  _$jscoverage['/attribute.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['246'][1].init(17, 7, 'p in px');
function visit29_246_1(result) {
  _$jscoverage['/attribute.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['243'][1].init(21, 24, 'SubClass.__hooks__ || {}');
function visit28_243_1(result) {
  _$jscoverage['/attribute.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['205'][1].init(156, 5, 'attrs');
function visit27_205_1(result) {
  _$jscoverage['/attribute.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['202'][1].init(389, 12, '!opts.silent');
function visit26_202_1(result) {
  _$jscoverage['/attribute.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['197'][1].init(297, 13, 'ret === FALSE');
function visit25_197_1(result) {
  _$jscoverage['/attribute.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['177'][1].init(17, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit24_177_1(result) {
  _$jscoverage['/attribute.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['173'][1].init(17, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit23_173_1(result) {
  _$jscoverage['/attribute.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['172'][1].init(1033, 11, 'opts.silent');
function visit22_172_1(result) {
  _$jscoverage['/attribute.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['154'][2].init(113, 16, 'subVal === value');
function visit21_154_2(result) {
  _$jscoverage['/attribute.js'].branchData['154'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['154'][1].init(105, 24, 'path && subVal === value');
function visit20_154_1(result) {
  _$jscoverage['/attribute.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][2].init(26, 17, 'prevVal === value');
function visit19_152_2(result) {
  _$jscoverage['/attribute.js'].branchData['152'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['152'][1].init(17, 26, '!path && prevVal === value');
function visit18_152_1(result) {
  _$jscoverage['/attribute.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['151'][1].init(466, 11, '!opts.force');
function visit17_151_1(result) {
  _$jscoverage['/attribute.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['145'][1].init(297, 4, 'path');
function visit16_145_1(result) {
  _$jscoverage['/attribute.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['120'][1].init(88, 22, 'defaultBeforeFns[name]');
function visit15_120_1(result) {
  _$jscoverage['/attribute.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['108'][1].init(17, 21, 'prevVal === undefined');
function visit14_108_1(result) {
  _$jscoverage['/attribute.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['107'][1].init(38, 4, 'path');
function visit13_107_1(result) {
  _$jscoverage['/attribute.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['94'][1].init(32, 24, 'name.indexOf(\'.\') !== -1');
function visit12_94_1(result) {
  _$jscoverage['/attribute.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['82'][1].init(107, 15, 'o !== undefined');
function visit11_82_1(result) {
  _$jscoverage['/attribute.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['79'][1].init(29, 7, 'i < len');
function visit10_79_1(result) {
  _$jscoverage['/attribute.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['78'][1].init(67, 8, 'len >= 0');
function visit9_78_1(result) {
  _$jscoverage['/attribute.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][3].init(18, 7, 'i < len');
function visit8_65_3(result) {
  _$jscoverage['/attribute.js'].branchData['65'][3].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][2].init(58, 15, 'o !== undefined');
function visit7_65_2(result) {
  _$jscoverage['/attribute.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['65'][1].init(47, 26, 'o !== undefined && i < len');
function visit6_65_1(result) {
  _$jscoverage['/attribute.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['57'][1].init(125, 9, 'ret || {}');
function visit5_57_1(result) {
  _$jscoverage['/attribute.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['54'][1].init(42, 20, '!doNotCreate && !ret');
function visit4_54_1(result) {
  _$jscoverage['/attribute.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['43'][1].init(20, 16, 'attrName || name');
function visit3_43_1(result) {
  _$jscoverage['/attribute.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['34'][1].init(16, 41, 'self.__attrVals || (self.__attrVals = {})');
function visit2_34_1(result) {
  _$jscoverage['/attribute.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].branchData['27'][1].init(13, 26, 'typeof method === \'string\'');
function visit1_27_1(result) {
  _$jscoverage['/attribute.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/attribute.js'].lineData[6]++;
KISSY.add(function(S, require, exports, module) {
  _$jscoverage['/attribute.js'].functionData[0]++;
  _$jscoverage['/attribute.js'].lineData[7]++;
  var RE_DASH = /(?:^|-)([a-z])/ig;
  _$jscoverage['/attribute.js'].lineData[8]++;
  var CustomEvent = require('event/custom');
  _$jscoverage['/attribute.js'].lineData[9]++;
  module.exports = Attribute;
  _$jscoverage['/attribute.js'].lineData[11]++;
  var bind = S.bind;
  _$jscoverage['/attribute.js'].lineData[13]++;
  function replaceToUpper() {
    _$jscoverage['/attribute.js'].functionData[1]++;
    _$jscoverage['/attribute.js'].lineData[14]++;
    return arguments[1].toUpperCase();
  }
  _$jscoverage['/attribute.js'].lineData[17]++;
  function camelCase(name) {
    _$jscoverage['/attribute.js'].functionData[2]++;
    _$jscoverage['/attribute.js'].lineData[18]++;
    return name.replace(RE_DASH, replaceToUpper);
  }
  _$jscoverage['/attribute.js'].lineData[22]++;
  var INVALID = {};
  _$jscoverage['/attribute.js'].lineData[24]++;
  var FALSE = false;
  _$jscoverage['/attribute.js'].lineData[26]++;
  function normalFn(host, method) {
    _$jscoverage['/attribute.js'].functionData[3]++;
    _$jscoverage['/attribute.js'].lineData[27]++;
    if (visit1_27_1(typeof method === 'string')) {
      _$jscoverage['/attribute.js'].lineData[28]++;
      return host[method];
    }
    _$jscoverage['/attribute.js'].lineData[30]++;
    return method;
  }
  _$jscoverage['/attribute.js'].lineData[33]++;
  function getAttrVals(self) {
    _$jscoverage['/attribute.js'].functionData[4]++;
    _$jscoverage['/attribute.js'].lineData[34]++;
    return visit2_34_1(self.__attrVals || (self.__attrVals = {}));
  }
  _$jscoverage['/attribute.js'].lineData[37]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/attribute.js'].functionData[5]++;
    _$jscoverage['/attribute.js'].lineData[38]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/attribute.js'].lineData[42]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/attribute.js'].functionData[6]++;
    _$jscoverage['/attribute.js'].lineData[43]++;
    attrName = visit3_43_1(attrName || name);
    _$jscoverage['/attribute.js'].lineData[44]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/attribute.js'].lineData[52]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/attribute.js'].functionData[7]++;
    _$jscoverage['/attribute.js'].lineData[53]++;
    var ret = obj[name];
    _$jscoverage['/attribute.js'].lineData[54]++;
    if (visit4_54_1(!doNotCreate && !ret)) {
      _$jscoverage['/attribute.js'].lineData[55]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/attribute.js'].lineData[57]++;
    return visit5_57_1(ret || {});
  }
  _$jscoverage['/attribute.js'].lineData[63]++;
  function getValueByPath(o, path) {
    _$jscoverage['/attribute.js'].functionData[8]++;
    _$jscoverage['/attribute.js'].lineData[64]++;
    for (var i = 0, len = path.length; visit6_65_1(visit7_65_2(o !== undefined) && visit8_65_3(i < len)); i++) {
      _$jscoverage['/attribute.js'].lineData[67]++;
      o = o[path[i]];
    }
    _$jscoverage['/attribute.js'].lineData[69]++;
    return o;
  }
  _$jscoverage['/attribute.js'].lineData[75]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/attribute.js'].functionData[9]++;
    _$jscoverage['/attribute.js'].lineData[76]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/attribute.js'].lineData[78]++;
    if (visit9_78_1(len >= 0)) {
      _$jscoverage['/attribute.js'].lineData[79]++;
      for (var i = 0; visit10_79_1(i < len); i++) {
        _$jscoverage['/attribute.js'].lineData[80]++;
        o = o[path[i]];
      }
      _$jscoverage['/attribute.js'].lineData[82]++;
      if (visit11_82_1(o !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[83]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/attribute.js'].lineData[85]++;
        s = undefined;
      }
    }
    _$jscoverage['/attribute.js'].lineData[88]++;
    return s;
  }
  _$jscoverage['/attribute.js'].lineData[91]++;
  function getPathNamePair(name) {
    _$jscoverage['/attribute.js'].functionData[10]++;
    _$jscoverage['/attribute.js'].lineData[92]++;
    var path;
    _$jscoverage['/attribute.js'].lineData[94]++;
    if (visit12_94_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/attribute.js'].lineData[95]++;
      path = name.split('.');
      _$jscoverage['/attribute.js'].lineData[96]++;
      name = path.shift();
    }
    _$jscoverage['/attribute.js'].lineData[99]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/attribute.js'].lineData[105]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/attribute.js'].functionData[11]++;
    _$jscoverage['/attribute.js'].lineData[106]++;
    var tmp = value;
    _$jscoverage['/attribute.js'].lineData[107]++;
    if (visit13_107_1(path)) {
      _$jscoverage['/attribute.js'].lineData[108]++;
      if (visit14_108_1(prevVal === undefined)) {
        _$jscoverage['/attribute.js'].lineData[109]++;
        tmp = {};
      } else {
        _$jscoverage['/attribute.js'].lineData[111]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/attribute.js'].lineData[113]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[115]++;
    return tmp;
  }
  _$jscoverage['/attribute.js'].lineData[118]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/attribute.js'].functionData[12]++;
    _$jscoverage['/attribute.js'].lineData[119]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/attribute.js'].lineData[120]++;
    if (visit15_120_1(defaultBeforeFns[name])) {
      _$jscoverage['/attribute.js'].lineData[121]++;
      return;
    }
    _$jscoverage['/attribute.js'].lineData[123]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/attribute.js'].lineData[124]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/attribute.js'].lineData[125]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn, 
  defaultTargetOnly: true});
  }
  _$jscoverage['/attribute.js'].lineData[132]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/attribute.js'].functionData[13]++;
    _$jscoverage['/attribute.js'].lineData[133]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/attribute.js'].lineData[139]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[140]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[141]++;
    prevVal = self.get(name);
    _$jscoverage['/attribute.js'].lineData[143]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/attribute.js'].lineData[145]++;
    if (visit16_145_1(path)) {
      _$jscoverage['/attribute.js'].lineData[146]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/attribute.js'].lineData[151]++;
    if (visit17_151_1(!opts.force)) {
      _$jscoverage['/attribute.js'].lineData[152]++;
      if (visit18_152_1(!path && visit19_152_2(prevVal === value))) {
        _$jscoverage['/attribute.js'].lineData[153]++;
        return undefined;
      } else {
        _$jscoverage['/attribute.js'].lineData[154]++;
        if (visit20_154_1(path && visit21_154_2(subVal === value))) {
          _$jscoverage['/attribute.js'].lineData[155]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/attribute.js'].lineData[159]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/attribute.js'].lineData[161]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/attribute.js'].lineData[172]++;
    if (visit22_172_1(opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[173]++;
      if (visit23_173_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[174]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/attribute.js'].lineData[177]++;
      if (visit24_177_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/attribute.js'].lineData[178]++;
        return FALSE;
      }
    }
    _$jscoverage['/attribute.js'].lineData[182]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[185]++;
  function defaultSetFn(e) {
    _$jscoverage['/attribute.js'].functionData[14]++;
    _$jscoverage['/attribute.js'].lineData[186]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/attribute.js'].lineData[195]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/attribute.js'].lineData[197]++;
    if (visit25_197_1(ret === FALSE)) {
      _$jscoverage['/attribute.js'].lineData[198]++;
      return ret;
    }
    _$jscoverage['/attribute.js'].lineData[202]++;
    if (visit26_202_1(!opts.silent)) {
      _$jscoverage['/attribute.js'].lineData[203]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/attribute.js'].lineData[204]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/attribute.js'].lineData[205]++;
      if (visit27_205_1(attrs)) {
        _$jscoverage['/attribute.js'].lineData[206]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/attribute.js'].lineData[213]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/attribute.js'].lineData[221]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[228]++;
  function Attribute(config) {
    _$jscoverage['/attribute.js'].functionData[15]++;
    _$jscoverage['/attribute.js'].lineData[229]++;
    var self = this, c = self.constructor;
    _$jscoverage['/attribute.js'].lineData[232]++;
    self.userConfig = config;
    _$jscoverage['/attribute.js'].lineData[234]++;
    while (c) {
      _$jscoverage['/attribute.js'].lineData[235]++;
      addAttrs(self, c.ATTRS);
      _$jscoverage['/attribute.js'].lineData[236]++;
      c = c.superclass ? c.superclass.constructor : null;
    }
    _$jscoverage['/attribute.js'].lineData[239]++;
    initAttrs(self, config);
  }
  _$jscoverage['/attribute.js'].lineData[242]++;
  function wrapProtoForSuper(px, SubClass) {
    _$jscoverage['/attribute.js'].functionData[16]++;
    _$jscoverage['/attribute.js'].lineData[243]++;
    var hooks = visit28_243_1(SubClass.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[245]++;
    for (var p in hooks) {
      _$jscoverage['/attribute.js'].lineData[246]++;
      if (visit29_246_1(p in px)) {
        _$jscoverage['/attribute.js'].lineData[247]++;
        px[p] = hooks[p](px[p]);
      }
    }
    _$jscoverage['/attribute.js'].lineData[250]++;
    S.each(px, function(v, p) {
  _$jscoverage['/attribute.js'].functionData[17]++;
  _$jscoverage['/attribute.js'].lineData[251]++;
  if (visit30_251_1(typeof v === 'function')) {
    _$jscoverage['/attribute.js'].lineData[252]++;
    var wrapped = 0;
    _$jscoverage['/attribute.js'].lineData[253]++;
    if (visit31_253_1(v.__owner__)) {
      _$jscoverage['/attribute.js'].lineData[254]++;
      var originalOwner = v.__owner__;
      _$jscoverage['/attribute.js'].lineData[255]++;
      delete v.__owner__;
      _$jscoverage['/attribute.js'].lineData[256]++;
      delete v.__name__;
      _$jscoverage['/attribute.js'].lineData[257]++;
      wrapped = v.__wrapped__ = 1;
      _$jscoverage['/attribute.js'].lineData[258]++;
      var newV = bind(v);
      _$jscoverage['/attribute.js'].lineData[259]++;
      newV.__owner__ = originalOwner;
      _$jscoverage['/attribute.js'].lineData[260]++;
      newV.__name__ = p;
      _$jscoverage['/attribute.js'].lineData[261]++;
      originalOwner.prototype[p] = newV;
    } else {
      _$jscoverage['/attribute.js'].lineData[262]++;
      if (visit32_262_1(v.__wrapped__)) {
        _$jscoverage['/attribute.js'].lineData[263]++;
        wrapped = 1;
      }
    }
    _$jscoverage['/attribute.js'].lineData[265]++;
    if (visit33_265_1(wrapped)) {
      _$jscoverage['/attribute.js'].lineData[266]++;
      px[p] = v = bind(v);
    }
    _$jscoverage['/attribute.js'].lineData[268]++;
    v.__owner__ = SubClass;
    _$jscoverage['/attribute.js'].lineData[269]++;
    v.__name__ = p;
  }
});
  }
  _$jscoverage['/attribute.js'].lineData[274]++;
  function addMembers(px) {
    _$jscoverage['/attribute.js'].functionData[18]++;
    _$jscoverage['/attribute.js'].lineData[275]++;
    var SubClass = this;
    _$jscoverage['/attribute.js'].lineData[276]++;
    wrapProtoForSuper(px, SubClass);
    _$jscoverage['/attribute.js'].lineData[277]++;
    S.mix(SubClass.prototype, px);
  }
  _$jscoverage['/attribute.js'].lineData[280]++;
  Attribute.extend = function extend(px, sx) {
  _$jscoverage['/attribute.js'].functionData[19]++;
  _$jscoverage['/attribute.js'].lineData[281]++;
  var SubClass, SuperClass = this;
  _$jscoverage['/attribute.js'].lineData[283]++;
  sx = visit34_283_1(sx || {});
  _$jscoverage['/attribute.js'].lineData[284]++;
  px = visit35_284_1(px || {});
  _$jscoverage['/attribute.js'].lineData[285]++;
  var hooks, sxHooks = sx.__hooks__;
  _$jscoverage['/attribute.js'].lineData[287]++;
  if ((hooks = SuperClass.__hooks__)) {
    _$jscoverage['/attribute.js'].lineData[288]++;
    sxHooks = sx.__hooks__ = visit36_288_1(sx.__hooks__ || {});
    _$jscoverage['/attribute.js'].lineData[289]++;
    S.mix(sxHooks, hooks, false);
  }
  _$jscoverage['/attribute.js'].lineData[291]++;
  var name = visit37_291_1(sx.name || 'AttributeDerived');
  _$jscoverage['/attribute.js'].lineData[292]++;
  if (visit38_292_1(px.hasOwnProperty('constructor'))) {
    _$jscoverage['/attribute.js'].lineData[293]++;
    SubClass = px.constructor;
  } else {
    _$jscoverage['/attribute.js'].lineData[297]++;
    if (visit39_297_1('@DEBUG@')) {
      _$jscoverage['/attribute.js'].lineData[299]++;
      SubClass = new Function('return function ' + camelCase(name) + '(){ ' + 'this.callSuper.apply(this, arguments);' + '}')();
    } else {
      _$jscoverage['/attribute.js'].lineData[303]++;
      SubClass = function() {
  _$jscoverage['/attribute.js'].functionData[20]++;
  _$jscoverage['/attribute.js'].lineData[304]++;
  this.callSuper.apply(this, arguments);
};
    }
  }
  _$jscoverage['/attribute.js'].lineData[308]++;
  px.constructor = SubClass;
  _$jscoverage['/attribute.js'].lineData[309]++;
  SubClass.__hooks__ = sxHooks;
  _$jscoverage['/attribute.js'].lineData[310]++;
  wrapProtoForSuper(px, SubClass);
  _$jscoverage['/attribute.js'].lineData[311]++;
  var inheritedStatics, sxInheritedStatics = sx.inheritedStatics;
  _$jscoverage['/attribute.js'].lineData[313]++;
  if ((inheritedStatics = SuperClass.inheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[314]++;
    sxInheritedStatics = sx.inheritedStatics = visit40_314_1(sx.inheritedStatics || {});
    _$jscoverage['/attribute.js'].lineData[315]++;
    S.mix(sxInheritedStatics, inheritedStatics, false);
  }
  _$jscoverage['/attribute.js'].lineData[317]++;
  S.extend(SubClass, SuperClass, px, sx);
  _$jscoverage['/attribute.js'].lineData[318]++;
  if (visit41_318_1(sxInheritedStatics)) {
    _$jscoverage['/attribute.js'].lineData[319]++;
    S.mix(SubClass, sxInheritedStatics);
  }
  _$jscoverage['/attribute.js'].lineData[321]++;
  SubClass.extend = visit42_321_1(sx.extend || extend);
  _$jscoverage['/attribute.js'].lineData[322]++;
  SubClass.addMembers = addMembers;
  _$jscoverage['/attribute.js'].lineData[323]++;
  return SubClass;
};
  _$jscoverage['/attribute.js'].lineData[326]++;
  function addAttrs(host, attrs) {
    _$jscoverage['/attribute.js'].functionData[21]++;
    _$jscoverage['/attribute.js'].lineData[327]++;
    if (visit43_327_1(attrs)) {
      _$jscoverage['/attribute.js'].lineData[328]++;
      for (var attr in attrs) {
        _$jscoverage['/attribute.js'].lineData[336]++;
        host.addAttr(attr, attrs[attr], false);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[341]++;
  function initAttrs(host, config) {
    _$jscoverage['/attribute.js'].functionData[22]++;
    _$jscoverage['/attribute.js'].lineData[342]++;
    if (visit44_342_1(config)) {
      _$jscoverage['/attribute.js'].lineData[343]++;
      for (var attr in config) {
        _$jscoverage['/attribute.js'].lineData[345]++;
        host.setInternal(attr, config[attr]);
      }
    }
  }
  _$jscoverage['/attribute.js'].lineData[350]++;
  S.augment(Attribute, CustomEvent.Target, {
  INVALID: INVALID, 
  'callSuper': function() {
  _$jscoverage['/attribute.js'].functionData[23]++;
  _$jscoverage['/attribute.js'].lineData[354]++;
  var method, obj, self = this, args = arguments;
  _$jscoverage['/attribute.js'].lineData[358]++;
  if (visit45_358_1(visit46_358_2(typeof self === 'function') && self.__name__)) {
    _$jscoverage['/attribute.js'].lineData[359]++;
    method = self;
    _$jscoverage['/attribute.js'].lineData[360]++;
    obj = args[0];
    _$jscoverage['/attribute.js'].lineData[361]++;
    args = Array.prototype.slice.call(args, 1);
  } else {
    _$jscoverage['/attribute.js'].lineData[364]++;
    method = arguments.callee.caller;
    _$jscoverage['/attribute.js'].lineData[365]++;
    if (visit47_365_1(method.__wrapped__)) {
      _$jscoverage['/attribute.js'].lineData[366]++;
      method = method.caller;
    }
    _$jscoverage['/attribute.js'].lineData[368]++;
    obj = self;
  }
  _$jscoverage['/attribute.js'].lineData[371]++;
  var name = method.__name__;
  _$jscoverage['/attribute.js'].lineData[372]++;
  if (visit48_372_1(!name)) {
    _$jscoverage['/attribute.js'].lineData[374]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[376]++;
  var member = method.__owner__.superclass[name];
  _$jscoverage['/attribute.js'].lineData[377]++;
  if (visit49_377_1(!member)) {
    _$jscoverage['/attribute.js'].lineData[379]++;
    return undefined;
  }
  _$jscoverage['/attribute.js'].lineData[382]++;
  return member.apply(obj, visit50_382_1(args || []));
}, 
  getAttrs: function() {
  _$jscoverage['/attribute.js'].functionData[24]++;
  _$jscoverage['/attribute.js'].lineData[391]++;
  return visit51_391_1(this.__attrs || (this.__attrs = {}));
}, 
  getAttrVals: function() {
  _$jscoverage['/attribute.js'].functionData[25]++;
  _$jscoverage['/attribute.js'].lineData[399]++;
  var self = this, o = {}, a, attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[403]++;
  for (a in attrs) {
    _$jscoverage['/attribute.js'].lineData[404]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/attribute.js'].lineData[406]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/attribute.js'].functionData[26]++;
  _$jscoverage['/attribute.js'].lineData[427]++;
  var self = this, attrs = self.getAttrs(), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/attribute.js'].lineData[431]++;
  if ((attr = attrs[name])) {
    _$jscoverage['/attribute.js'].lineData[432]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/attribute.js'].lineData[434]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/attribute.js'].lineData[436]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/attribute.js'].functionData[27]++;
  _$jscoverage['/attribute.js'].lineData[446]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[447]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/attribute.js'].functionData[28]++;
  _$jscoverage['/attribute.js'].lineData[448]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/attribute.js'].lineData[450]++;
  if (visit52_450_1(initialValues)) {
    _$jscoverage['/attribute.js'].lineData[451]++;
    self.set(initialValues);
  }
  _$jscoverage['/attribute.js'].lineData[453]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[29]++;
  _$jscoverage['/attribute.js'].lineData[462]++;
  return this.getAttrs().hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/attribute.js'].functionData[30]++;
  _$jscoverage['/attribute.js'].lineData[470]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[471]++;
  var __attrVals = getAttrVals(self);
  _$jscoverage['/attribute.js'].lineData[472]++;
  var __attrs = self.getAttrs();
  _$jscoverage['/attribute.js'].lineData[474]++;
  if (visit53_474_1(self.hasAttr(name))) {
    _$jscoverage['/attribute.js'].lineData[475]++;
    delete __attrs[name];
    _$jscoverage['/attribute.js'].lineData[476]++;
    delete __attrVals[name];
  }
  _$jscoverage['/attribute.js'].lineData[479]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/attribute.js'].functionData[31]++;
  _$jscoverage['/attribute.js'].lineData[493]++;
  var self = this, e;
  _$jscoverage['/attribute.js'].lineData[494]++;
  if (visit54_494_1(S.isPlainObject(name))) {
    _$jscoverage['/attribute.js'].lineData[495]++;
    opts = value;
    _$jscoverage['/attribute.js'].lineData[496]++;
    opts = visit55_496_1(opts || {});
    _$jscoverage['/attribute.js'].lineData[497]++;
    var all = Object(name), attrs = [], errors = [];
    _$jscoverage['/attribute.js'].lineData[500]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[503]++;
      if (visit56_503_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[504]++;
        errors.push(e);
      }
    }
    _$jscoverage['/attribute.js'].lineData[507]++;
    if (visit57_507_1(errors.length)) {
      _$jscoverage['/attribute.js'].lineData[508]++;
      if (visit58_508_1(opts.error)) {
        _$jscoverage['/attribute.js'].lineData[509]++;
        opts.error(errors);
      }
      _$jscoverage['/attribute.js'].lineData[511]++;
      return FALSE;
    }
    _$jscoverage['/attribute.js'].lineData[513]++;
    for (name in all) {
      _$jscoverage['/attribute.js'].lineData[514]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/attribute.js'].lineData[516]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/attribute.js'].lineData[520]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/attribute.js'].functionData[32]++;
  _$jscoverage['/attribute.js'].lineData[521]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/attribute.js'].lineData[522]++;
  newVals.push(attr.newVal);
  _$jscoverage['/attribute.js'].lineData[523]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/attribute.js'].lineData[524]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/attribute.js'].lineData[526]++;
    if (visit59_526_1(attrNames.length)) {
      _$jscoverage['/attribute.js'].lineData[527]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/attribute.js'].lineData[536]++;
    return self;
  }
  _$jscoverage['/attribute.js'].lineData[538]++;
  opts = visit60_538_1(opts || {});
  _$jscoverage['/attribute.js'].lineData[540]++;
  e = validate(self, name, value);
  _$jscoverage['/attribute.js'].lineData[542]++;
  if (visit61_542_1(e !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[543]++;
    if (visit62_543_1(opts.error)) {
      _$jscoverage['/attribute.js'].lineData[544]++;
      opts.error(e);
    }
    _$jscoverage['/attribute.js'].lineData[546]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[548]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/attribute.js'].functionData[33]++;
  _$jscoverage['/attribute.js'].lineData[557]++;
  var self = this, setValue, attrConfig = ensureNonEmpty(self.getAttrs(), name), setter = attrConfig.setter;
  _$jscoverage['/attribute.js'].lineData[566]++;
  if (visit63_566_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/attribute.js'].lineData[567]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/attribute.js'].lineData[570]++;
  if (visit64_570_1(setValue === INVALID)) {
    _$jscoverage['/attribute.js'].lineData[571]++;
    return FALSE;
  }
  _$jscoverage['/attribute.js'].lineData[574]++;
  if (visit65_574_1(setValue !== undefined)) {
    _$jscoverage['/attribute.js'].lineData[575]++;
    value = setValue;
  }
  _$jscoverage['/attribute.js'].lineData[579]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/attribute.js'].lineData[581]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/attribute.js'].functionData[34]++;
  _$jscoverage['/attribute.js'].lineData[590]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/attribute.js'].lineData[597]++;
  if (visit66_597_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/attribute.js'].lineData[598]++;
    path = name.split(dot);
    _$jscoverage['/attribute.js'].lineData[599]++;
    name = path.shift();
  }
  _$jscoverage['/attribute.js'].lineData[602]++;
  attrConfig = ensureNonEmpty(self.getAttrs(), name, 1);
  _$jscoverage['/attribute.js'].lineData[603]++;
  getter = attrConfig.getter;
  _$jscoverage['/attribute.js'].lineData[607]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/attribute.js'].lineData[612]++;
  if (visit67_612_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/attribute.js'].lineData[613]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/attribute.js'].lineData[616]++;
  if (visit68_616_1(!(name in attrVals) && visit69_616_2(ret !== undefined))) {
    _$jscoverage['/attribute.js'].lineData[617]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/attribute.js'].lineData[620]++;
  if (visit70_620_1(path)) {
    _$jscoverage['/attribute.js'].lineData[621]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/attribute.js'].lineData[624]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/attribute.js'].functionData[35]++;
  _$jscoverage['/attribute.js'].lineData[636]++;
  var self = this;
  _$jscoverage['/attribute.js'].lineData[638]++;
  if (visit71_638_1(typeof name === 'string')) {
    _$jscoverage['/attribute.js'].lineData[639]++;
    if (visit72_639_1(self.hasAttr(name))) {
      _$jscoverage['/attribute.js'].lineData[641]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/attribute.js'].lineData[644]++;
      return self;
    }
  }
  _$jscoverage['/attribute.js'].lineData[648]++;
  opts = (name);
  _$jscoverage['/attribute.js'].lineData[651]++;
  var attrs = self.getAttrs(), values = {};
  _$jscoverage['/attribute.js'].lineData[655]++;
  for (name in attrs) {
    _$jscoverage['/attribute.js'].lineData[656]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/attribute.js'].lineData[659]++;
  self.set(values, opts);
  _$jscoverage['/attribute.js'].lineData[660]++;
  return self;
}});
  _$jscoverage['/attribute.js'].lineData[665]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/attribute.js'].functionData[36]++;
    _$jscoverage['/attribute.js'].lineData[666]++;
    var attrs = self.getAttrs(), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/attribute.js'].lineData[671]++;
    if (visit73_671_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/attribute.js'].lineData[672]++;
      val = valFn.call(self);
      _$jscoverage['/attribute.js'].lineData[673]++;
      if (visit74_673_1(val !== undefined)) {
        _$jscoverage['/attribute.js'].lineData[677]++;
        attrConfig.value = val;
      }
      _$jscoverage['/attribute.js'].lineData[679]++;
      delete attrConfig.valueFn;
      _$jscoverage['/attribute.js'].lineData[680]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/attribute.js'].lineData[683]++;
    return attrConfig.value;
  }
  _$jscoverage['/attribute.js'].lineData[686]++;
  function validate(self, name, value, all) {
    _$jscoverage['/attribute.js'].functionData[37]++;
    _$jscoverage['/attribute.js'].lineData[687]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/attribute.js'].lineData[689]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/attribute.js'].lineData[691]++;
    name = pathNamePair.name;
    _$jscoverage['/attribute.js'].lineData[692]++;
    path = pathNamePair.path;
    _$jscoverage['/attribute.js'].lineData[694]++;
    if (visit75_694_1(path)) {
      _$jscoverage['/attribute.js'].lineData[695]++;
      prevVal = self.get(name);
      _$jscoverage['/attribute.js'].lineData[696]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/attribute.js'].lineData[698]++;
    var attrConfig = ensureNonEmpty(self.getAttrs(), name), e, validator = attrConfig.validator;
    _$jscoverage['/attribute.js'].lineData[701]++;
    if (visit76_701_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/attribute.js'].lineData[702]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/attribute.js'].lineData[704]++;
      if (visit77_704_1(visit78_704_2(e !== undefined) && visit79_704_3(e !== true))) {
        _$jscoverage['/attribute.js'].lineData[705]++;
        return e;
      }
    }
    _$jscoverage['/attribute.js'].lineData[708]++;
    return undefined;
  }
});
