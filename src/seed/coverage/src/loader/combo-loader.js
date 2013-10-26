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
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[32] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[35] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[40] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[45] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[53] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[57] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[67] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[76] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[77] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[83] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[84] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[85] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[89] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[91] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[97] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[106] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[108] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[125] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[129] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[132] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[133] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[141] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[147] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[148] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[149] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[150] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[155] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[156] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[163] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[164] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[167] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[170] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[176] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[178] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[179] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[190] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[204] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[205] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[209] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[210] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[213] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[218] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[222] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[223] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[233] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[235] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[242] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[247] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[250] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[261] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[269] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[272] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[274] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[275] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[276] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[277] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[279] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[280] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[281] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[283] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[285] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[286] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[287] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[288] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[289] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[291] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[292] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[294] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[299] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[319] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[320] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[322] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[323] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[325] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[326] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[327] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[328] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[329] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[333] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[336] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[338] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[339] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[354] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[356] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[357] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[369] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[385] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[387] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[390] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[391] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[392] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[393] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[394] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[395] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[397] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[399] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[406] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[408] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[410] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[422] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[423] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[424] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[433] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[436] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[437] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[438] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[446] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[447] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[451] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[459] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[29] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['10'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['15'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['15'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['26'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['40'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['42'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['45'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['88'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['91'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['106'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['125'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['127'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['132'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['151'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['155'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['166'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['178'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['205'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['234'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['242'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['269'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['272'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['274'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['276'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['282'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['285'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['286'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['287'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['318'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['333'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['333'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['339'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['340'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['354'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['355'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['397'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['422'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['427'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['440'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['441'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['450'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['450'][1].init(2750, 23, 'currentComboUrls.length');
function visit350_450_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['441'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit349_441_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['440'][2].init(827, 36, 'currentComboUrls.length > maxFileNum');
function visit348_440_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['440'][1].init(827, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit347_440_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['427'][1].init(244, 25, '!currentMod.canBeCombined');
function visit346_427_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['422'][1].init(1399, 15, 'i < mods.length');
function visit345_422_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['397'][1].init(226, 15, 'tags.length > 1');
function visit344_397_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][3].init(50, 19, 'mods.tags[0] == tag');
function visit343_360_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][2].init(25, 21, 'mods.tags.length == 1');
function visit342_360_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['360'][1].init(25, 44, 'mods.tags.length == 1 && mods.tags[0] == tag');
function visit341_360_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['355'][1].init(1793, 32, '!(mods = typedCombos[comboName])');
function visit340_355_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['354'][1].init(1750, 21, 'comboMods[type] || {}');
function visit339_354_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['340'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit338_340_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['339'][1].init(183, 41, 'groupPrefixUri = comboPrefixes[comboName]');
function visit337_339_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['333'][2].init(749, 82, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit336_333_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['333'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['333'][1].init(729, 112, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit335_333_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['318'][1].init(338, 5, 'i < l');
function visit334_318_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['287'][1].init(29, 20, 'modStatus != LOADING');
function visit333_287_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['286'][1].init(25, 27, '!waitingModules.contains(m)');
function visit332_286_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['285'][1].init(379, 19, 'modStatus != LOADED');
function visit331_285_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['282'][3].init(285, 22, 'modStatus === ATTACHED');
function visit330_282_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['282'][2].init(262, 19, 'modStatus === ERROR');
function visit329_282_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['282'][1].init(262, 45, 'modStatus === ERROR || modStatus === ATTACHED');
function visit328_282_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['276'][1].init(54, 8, 'cache[m]');
function visit327_276_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['274'][1].init(369, 19, 'i < modNames.length');
function visit326_274_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['272'][1].init(331, 11, 'cache || {}');
function visit325_272_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['269'][1].init(229, 9, 'ret || {}');
function visit324_269_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['242'][1].init(150, 7, '!mod.fn');
function visit323_242_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['234'][1].init(25, 9, '\'@DEBUG@\'');
function visit322_234_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['205'][1].init(25, 9, '\'@DEBUG@\'');
function visit321_205_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['178'][1].init(70, 8, '--i > -1');
function visit320_178_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['166'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit319_166_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['165'][1].init(143, 5, 'i < l');
function visit318_165_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['155'][1].init(198, 9, 'ms.length');
function visit317_155_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['151'][1].init(21, 18, 'm.status == LOADED');
function visit316_151_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['132'][1].init(372, 2, 're');
function visit315_132_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['127'][1].init(50, 34, 'script.readyState == \'interactive\'');
function visit314_127_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['125'][1].init(182, 6, 'i >= 0');
function visit313_125_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['106'][1].init(17, 2, 'ie');
function visit312_106_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['91'][1].init(65, 2, 'ie');
function visit311_91_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['88'][1].init(13, 26, 'typeof name === \'function\'');
function visit310_88_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['45'][1].init(162, 2, 'ie');
function visit309_45_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['42'][1].init(55, 22, 'mod.getType() == \'css\'');
function visit308_42_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['40'][1].init(811, 11, '!rs.combine');
function visit307_40_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['26'][1].init(67, 17, 'mod && currentMod');
function visit306_26_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['15'][1].init(17, 10, '!(--count)');
function visit305_15_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['15'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['10'][1].init(21, 17, 'rss && rss.length');
function visit304_10_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[7]++;
  var ie = S.UA.ie;
  _$jscoverage['/loader/combo-loader.js'].lineData[9]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
    var count = visit304_10_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[14]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
      if (visit305_15_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[20]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[25]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  if (visit306_26_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[28]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    Utils.registerModule(runtime, mod.name, currentMod.fn, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[32]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[35]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[40]++;
  if (visit307_40_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    if (visit308_42_1(mod.getType() == 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[45]++;
      if (visit309_45_1(ie)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[53]++;
  S.getScript(rs.fullpath, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[57]++;
  var Loader = S.Loader, logger = S.getLogger('s/loader'), Status = Loader.Status, Utils = Loader.Utils, LOADING = Status.LOADING, LOADED = Status.LOADED, ERROR = Status.ERROR, groupTag = S.now(), ATTACHED = Status.ATTACHED;
  _$jscoverage['/loader/combo-loader.js'].lineData[67]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[76]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[77]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[83]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[84]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[85]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[87]++;
  ComboLoader.add = function(name, fn, config, runtime) {
  _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  if (visit310_88_1(typeof name === 'function')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[89]++;
    config = fn;
    _$jscoverage['/loader/combo-loader.js'].lineData[90]++;
    fn = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[91]++;
    if (visit311_91_1(ie)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
      Utils.registerModule(runtime, name, fn, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[97]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
      currentMod = {
  fn: fn, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[106]++;
    if (visit312_106_1(ie)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[107]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[108]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
    Utils.registerModule(runtime, name, fn, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[125]++;
    for (i = scripts.length - 1; visit313_125_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      if (visit314_127_1(script.readyState == 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[129]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[132]++;
    if (visit315_132_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[133]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[140]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[141]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[147]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[148]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[149]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[150]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  if (visit316_151_1(m.status == LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[155]++;
  if (visit317_155_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[156]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[163]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[164]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    for (var i = 0; visit318_165_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
      if (visit319_166_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[167]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[170]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[175]++;
  function getHash(str) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[176]++;
    var hash = 5381, i;
    _$jscoverage['/loader/combo-loader.js'].lineData[178]++;
    for (i = str.length; visit320_178_1(--i > -1); ) {
      _$jscoverage['/loader/combo-loader.js'].lineData[179]++;
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
    return hash + '';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[185]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[190]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[200]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[204]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[205]++;
  if (visit321_205_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[209]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[210]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[211]++;
  Utils.registerModule(runtime, mod.getName(), S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[213]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[217]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[218]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[219]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[222]++;
  logger.error(msg);
  _$jscoverage['/loader/combo-loader.js'].lineData[223]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[232]++;
  S.each(comboUrls['js'], function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[233]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[234]++;
  if (visit322_234_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[235]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[242]++;
  if (visit323_242_1(!mod.fn)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[246]++;
    logger.error(msg);
    _$jscoverage['/loader/combo-loader.js'].lineData[247]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[250]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[261]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[269]++;
  ret = visit324_269_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[272]++;
  cache = visit325_272_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[274]++;
  for (i = 0; visit326_274_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[275]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[276]++;
    if (visit327_276_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[277]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[279]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[280]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[281]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
    if (visit328_282_1(visit329_282_2(modStatus === ERROR) || visit330_282_3(modStatus === ATTACHED))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[283]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[285]++;
    if (visit331_285_1(modStatus != LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[286]++;
      if (visit332_286_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[287]++;
        if (visit333_287_1(modStatus != LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[288]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[289]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[291]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[292]++;
  waitingModules.remove(mod.getName());
  _$jscoverage['/loader/combo-loader.js'].lineData[294]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[299]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[318]++;
  for (; visit334_318_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[319]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[320]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[321]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[322]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[323]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
    packageName = packageInfo.getName();
    _$jscoverage['/loader/combo-loader.js'].lineData[325]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[326]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[327]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[328]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[329]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[333]++;
    if (visit335_333_1((mod.canBeCombined = visit336_333_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[336]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[338]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[339]++;
      if (visit337_339_1(groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
        if (visit338_340_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[354]++;
    typedCombos = comboMods[type] = visit339_354_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
    if (visit340_355_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[356]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[357]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[358]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
      if (visit341_360_1(visit342_360_2(mods.tags.length == 1) && visit343_360_3(mods.tags[0] == tag))) {
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[369]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[385]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[387]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[390]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[391]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[392]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[393]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[394]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[395]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[397]++;
      var tag = visit344_397_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[399]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[406]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[407]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[408]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[410]++;
      function pushComboUrl() {
        _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
        _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
        res.push({
  combine: 1, 
  fullpath: Utils.getMappedPath(runtime, prefix + currentComboUrls.join(comboSep) + suffix, Config.mappedComboRules), 
  mods: currentComboMods});
      }      _$jscoverage['/loader/combo-loader.js'].lineData[422]++;
      for (var i = 0; visit345_422_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[423]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[424]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
        if (visit346_427_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[433]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[436]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[437]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[438]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[440]++;
        if (visit347_440_1(visit348_440_2(currentComboUrls.length > maxFileNum) || (visit349_441_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[446]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[447]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[450]++;
      if (visit350_450_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[451]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[455]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[459]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
