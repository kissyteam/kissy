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
if (! _$jscoverage['/html-parser/lexer/lexer.js']) {
  _$jscoverage['/html-parser/lexer/lexer.js'] = {};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[162] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[217] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[337] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[338] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[339] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[342] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[347] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[390] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[408] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[417] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[419] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[421] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[484] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[486] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[487] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[497] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[498] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[499] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[508] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[509] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[519] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[604] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[606] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[639] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[687] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[710] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[712] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[715] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[720] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[724] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[733] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[735] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[751] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[762] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[773] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[774] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[784] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[785] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[789] = 0;
}
if (! _$jscoverage['/html-parser/lexer/lexer.js'].functionData) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21] = 0;
}
if (! _$jscoverage['/html-parser/lexer/lexer.js'].branchData) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData = {};
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['27'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['190'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['222'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['282'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['325'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['389'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['392'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['408'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['421'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['424'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['483'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['491'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['491'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['510'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['515'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['518'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['599'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['604'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['604'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['612'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['612'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['627'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['627'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['692'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['692'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['694'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['694'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['710'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['712'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['712'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['714'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['714'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['716'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['716'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['718'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['718'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['718'][1].init(203, 9, '\'>\' == ch');
function visit168_718_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['718'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['716'][1].init(98, 8, '-1 == ch');
function visit167_716_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['716'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['714'][1].init(187, 9, '\'-\' == ch');
function visit166_714_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['714'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['712'][1].init(90, 8, '-1 == ch');
function visit165_712_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['712'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['710'][1].init(171, 9, '\'-\' == ch');
function visit164_710_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1].init(82, 8, '-1 == ch');
function visit163_708_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['694'][1].init(171, 18, 'Utils.isLetter(ch)');
function visit162_694_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['694'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['692'][1].init(82, 8, '-1 == ch');
function visit161_692_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['692'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].init(219, 9, '\'-\' == ch');
function visit160_676_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].init(106, 8, '-1 == ch');
function visit159_674_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].init(211, 9, '\'-\' == ch');
function visit158_672_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].init(106, 8, '-1 == ch');
function visit157_670_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][3].init(964, 114, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit156_658_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][2].init(964, 256, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit155_658_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1].init(951, 307, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit154_658_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].init(41, 11, '\'\' == quote');
function visit153_628_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['627'][1].init(45, 10, 'quoteSmart');
function visit152_627_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['627'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][3].init(607, 10, '\'/\' !== ch');
function visit151_615_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][2].init(592, 9, '-1 !== ch');
function visit150_615_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1].init(545, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit149_615_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['612'][1].init(347, 9, 'ch == \'*\'');
function visit148_612_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['612'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][3].init(205, 10, '\'*\' !== ch');
function visit147_610_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][2].init(190, 9, '-1 !== ch');
function visit146_610_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1].init(139, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit145_610_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1].init(461, 9, '\'*\' == ch');
function visit144_606_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['604'][1].init(336, 9, '\'/\' == ch');
function visit143_604_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['604'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1].init(215, 8, '-1 == ch');
function visit142_602_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['599'][1].init(41, 11, '\'\' == quote');
function visit141_599_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].init(45, 10, 'quoteSmart');
function visit140_598_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][3].init(289, 12, 'ch !== quote');
function visit139_590_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][2].init(272, 11, 'ch !== \'\\\\\'');
function visit138_590_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].init(272, 30, '(ch !== \'\\\\\') && (ch !== quote)');
function visit137_590_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].init(150, 8, '-1 == ch');
function visit136_588_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1].init(41, 12, '\'\' !== quote');
function visit135_586_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].init(46, 10, 'quoteSmart');
function visit134_585_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'][1].init(179, 12, '\'"\' == quote');
function visit133_579_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'][1].init(41, 11, '\'\' == quote');
function visit132_577_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].init(45, 22, 'quoteSmart && !comment');
function visit131_576_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].init(180, 13, '\'\\\'\' == quote');
function visit130_570_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].init(41, 11, '\'\' == quote');
function visit129_568_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].init(46, 22, 'quoteSmart && !comment');
function visit128_567_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['518'][1].init(79, 9, '\'?\' == ch');
function visit127_518_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][2].init(334, 9, '\'!\' == ch');
function visit126_516_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][1].init(45, 89, '\'!\' == ch || \'?\' == ch');
function visit125_516_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['515'][1].init(36, 135, 'Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit124_515_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][2].init(248, 9, '\'/\' == ch');
function visit123_514_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][1].init(248, 172, '\'/\' == ch || Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit122_514_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['514'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['510'][1].init(72, 8, '-1 == ch');
function visit121_510_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][3].init(2360, 9, '\'<\' == ch');
function visit120_508_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][2].init(2344, 10, '0 == quote');
function visit119_508_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][1].init(2344, 26, '(0 == quote) && (\'<\' == ch)');
function visit118_508_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][3].init(473, 10, '\'/\' !== ch');
function visit117_502_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2].init(458, 9, '-1 !== ch');
function visit116_502_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].init(431, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit115_502_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1].init(247, 9, 'ch == \'*\'');
function visit114_498_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][3].init(147, 10, '\'*\' !== ch');
function visit113_496_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][2].init(132, 9, '-1 !== ch');
function visit112_496_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1].init(101, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit111_496_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['491'][1].init(560, 9, '\'*\' == ch');
function visit110_491_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['491'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][3].init(135, 11, '\'\\n\' !== ch');
function visit109_489_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][2].init(120, 9, '-1 !== ch');
function visit108_489_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].init(93, 27, '(-1 !== ch) && (\'\\n\' !== ch)');
function visit107_489_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].init(347, 9, '\'/\' == ch');
function visit106_486_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['483'][1].init(249, 8, '-1 == ch');
function visit105_483_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][4].init(1111, 9, 'ch == \'/\'');
function visit104_478_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][3].init(1095, 10, '0 == quote');
function visit103_478_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][2].init(1095, 26, '(0 == quote) && (ch == \'/\')');
function visit102_478_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][1].init(1080, 41, 'quoteSmart && (0 == quote) && (ch == \'/\')');
function visit101_478_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].init(968, 11, 'ch == quote');
function visit100_475_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].init(953, 27, 'quoteSmart && (ch == quote)');
function visit99_475_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(61, 12, 'ch !== quote');
function visit98_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][2].init(139, 11, '\'\\\\\' !== ch');
function visit97_468_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][1].init(38, 75, '(\'\\\\\' !== ch) && (ch !== quote)');
function visit96_468_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['468'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].init(98, 9, '-1 !== ch');
function visit95_467_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].init(98, 114, '(-1 !== ch) && (\'\\\\\' !== ch) && (ch !== quote)');
function visit94_467_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][4].init(439, 11, '\'\\\\\' === ch');
function visit93_465_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3].init(422, 11, '0 !== quote');
function visit92_465_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2].init(422, 29, '(0 !== quote) && (\'\\\\\' === ch)');
function visit91_465_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1].init(407, 44, 'quoteSmart && (0 !== quote) && (\'\\\\\' === ch)');
function visit90_465_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][3].init(52, 9, '\'"\' == ch');
function visit89_461_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2].init(36, 10, '\'\\\'\' == ch');
function visit88_461_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1].init(36, 26, '(\'\\\'\' == ch) || (\'"\' == ch)');
function visit87_461_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].init(165, 10, '0 == quote');
function visit86_460_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].init(165, 64, '(0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit85_460_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].init(150, 79, 'quoteSmart && (0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit84_460_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].init(64, 8, '-1 == ch');
function visit83_457_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['424'][1].init(195, 22, 'Utils.isWhitespace(ch)');
function visit82_424_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['421'][1].init(69, 9, '\'>\' == ch');
function visit81_421_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].init(80, 9, '\'-\' == ch');
function visit80_413_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['408'][1].init(203, 8, '-1 == ch');
function visit79_408_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].init(79, 9, '\'-\' == ch');
function visit78_405_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['392'][1].init(303, 9, '\'>\' == ch');
function visit77_392_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['389'][1].init(166, 8, '-1 == ch');
function visit76_389_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].init(77, 9, '\'-\' == ch');
function visit75_386_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].init(164, 9, '\'-\' == ch');
function visit74_380_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].init(76, 9, '\'>\' == ch');
function visit73_378_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1].init(64, 8, '-1 == ch');
function visit72_372_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['325'][1].init(611, 9, '\'=\' == ch');
function visit71_325_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1].init(486, 22, 'Utils.isWhitespace(ch)');
function visit70_322_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].init(142, 8, '-1 == ch');
function visit69_315_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1].init(271, 9, '\'"\' == ch');
function visit68_304_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1].init(75, 8, '-1 == ch');
function visit67_300_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1].init(271, 10, '\'\\\'\' == ch');
function visit66_293_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1].init(75, 8, '-1 == ch');
function visit65_289_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['282'][1].init(260, 22, 'Utils.isWhitespace(ch)');
function visit64_282_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][3].init(82, 9, '\'>\' == ch');
function visit63_278_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][2].init(68, 8, '-1 == ch');
function visit62_278_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].init(68, 24, '(-1 == ch) || (\'>\' == ch)');
function visit61_278_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1].init(586, 22, 'Utils.isWhitespace(ch)');
function visit60_269_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].init(417, 9, '\'"\' == ch');
function visit59_265_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].init(247, 10, '\'\\\'\' == ch');
function visit58_261_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][3].init(64, 9, '\'>\' == ch');
function visit57_257_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][2].init(50, 8, '-1 == ch');
function visit56_257_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1].init(50, 24, '(-1 == ch) || (\'>\' == ch)');
function visit55_257_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].init(969, 9, '\'=\' == ch');
function visit54_252_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1].init(570, 22, 'Utils.isWhitespace(ch)');
function visit53_246_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1].init(33, 9, '\'<\' == ch');
function visit52_238_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][5].init(114, 9, '\'<\' == ch');
function visit51_237_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][4].init(99, 9, '\'>\' == ch');
function visit50_237_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][3].init(99, 25, '(\'>\' == ch) || (\'<\' == ch)');
function visit49_237_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][2].init(85, 8, '-1 == ch');
function visit48_237_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].init(85, 39, '(-1 == ch) || (\'>\' == ch) || (\'<\' == ch)');
function visit47_237_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2].init(432, 9, 'ch == "/"');
function visit46_229_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].init(432, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit45_229_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2].init(79, 9, 'ch == "/"');
function visit44_224_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].init(79, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit43_224_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['222'][1].init(88, 18, '!attributes.length');
function visit42_222_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].init(33, 9, '\'<\' == ch');
function visit41_214_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][5].init(112, 9, '\'<\' == ch');
function visit40_213_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][4].init(99, 9, '\'>\' == ch');
function visit39_213_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][3].init(99, 22, '\'>\' == ch || \'<\' == ch');
function visit38_213_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][2].init(87, 8, 'ch == -1');
function visit37_213_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].init(87, 34, 'ch == -1 || \'>\' == ch || \'<\' == ch');
function visit36_213_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][3].init(35, 9, 'ch === -1');
function visit35_192_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][2].init(35, 30, 'ch === -1 && attributes.length');
function visit34_192_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][1].init(25, 40, 'strict && ch === -1 && attributes.length');
function visit33_192_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['190'][1].init(329, 6, 'strict');
function visit32_190_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].init(91, 10, '2 > length');
function visit31_141_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'][1].init(96, 12, '0 !== length');
function visit30_140_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].init(77, 5, 'l > 0');
function visit29_130_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].init(77, 5, 'l > 0');
function visit28_120_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].init(91, 10, '2 > length');
function visit27_105_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].init(81, 12, '0 !== length');
function visit26_104_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].init(122, 9, '\'-\' == ch');
function visit25_76_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].init(33, 9, '\'>\' == ch');
function visit24_72_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].init(80, 8, 'ch == -1');
function visit23_69_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].init(375, 9, '\'?\' == ch');
function visit22_67_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].init(362, 9, '\'!\' == ch');
function visit21_67_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].init(362, 22, '\'!\' == ch || \'?\' == ch');
function visit20_67_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].init(195, 9, 'ch == \'/\'');
function visit19_64_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].init(195, 31, 'ch == \'/\' || Utils.isLetter(ch)');
function visit18_64_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].init(80, 8, 'ch == -1');
function visit17_62_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['27'][1].init(150, 9, 'cfg || {}');
function visit16_27_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7]++;
  var Cursor = require('./cursor');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8]++;
  var Page = require('./page');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9]++;
  var TextNode = require('../nodes/text');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10]++;
  var CData = require('../nodes/cdata');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[12]++;
  var Attribute = require('../nodes/attribute');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[13]++;
  var TagNode = require('../nodes/tag');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14]++;
  var CommentNode = require('../nodes/comment');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[22]++;
  function Lexer(text, cfg) {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23]++;
    var self = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[24]++;
    self.page = new Page(text);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25]++;
    self.cursor = new Cursor();
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26]++;
    self.nodeFactory = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27]++;
    this.cfg = visit16_27_1(cfg || {});
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[30]++;
  Lexer.prototype = {
  constructor: Lexer, 
  setPosition: function(p) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[34]++;
  this.cursor.position = p;
}, 
  getPosition: function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38]++;
  return this.cursor.position;
}, 
  nextNode: function(quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47]++;
  var start, ch, ret, cursor = this.cursor, page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53]++;
  start = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54]++;
  ch = page.getChar(cursor);
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56]++;
  switch (ch) {
    case -1:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58]++;
      ret = null;
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59]++;
      break;
    case '<':
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61]++;
      ch = page.getChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62]++;
      if (visit17_62_1(ch == -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64]++;
        if (visit18_64_1(visit19_64_2(ch == '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[65]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
          if (visit20_67_1(visit21_67_2('!' == ch) || visit22_67_3('?' == ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69]++;
            if (visit23_69_1(ch == -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
              if (visit24_72_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[75]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76]++;
                if (visit25_76_1('-' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[77]++;
                  ret = this.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[82]++;
                  ret = this.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88]++;
            ret = this.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[90]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93]++;
      ret = this.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[97]++;
  return (ret);
}, 
  makeComment: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[101]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[104]++;
  if (visit26_104_1(0 !== length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105]++;
    if (visit27_105_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[107]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109]++;
    ret = this.nodeFactory.createCommentNode(this.page, start, end);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[118]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120]++;
  if (visit28_120_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130]++;
  if (visit29_130_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[137]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[139]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140]++;
  if (visit30_140_1(0 !== length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141]++;
    if (visit31_141_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[143]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[148]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[150]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[154]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[158]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[162]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[166]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190]++;
  if (visit32_190_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192]++;
  if (visit33_192_1(strict && visit34_192_2(visit35_192_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
        if (visit36_213_1(visit37_213_2(ch == -1) || visit38_213_3(visit39_213_4('>' == ch) || visit40_213_5('<' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214]++;
          if (visit41_214_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[217]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222]++;
          if (visit42_222_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
            if (visit43_224_1(visit44_224_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229]++;
            if (visit45_229_1(visit46_229_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237]++;
        if (visit47_237_1((visit48_237_2(-1 == ch)) || visit49_237_3((visit50_237_4('>' == ch)) || (visit51_237_5('<' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238]++;
          if (visit52_238_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246]++;
          if (visit53_246_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
            if (visit54_252_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
        if (visit55_257_1((visit56_257_2(-1 == ch)) || (visit57_257_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
          if (visit58_261_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265]++;
            if (visit59_265_1('"' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269]++;
              if (visit60_269_1(Utils.isWhitespace(ch))) {
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
        if (visit61_278_1((visit62_278_2(-1 == ch)) || (visit63_278_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282]++;
          if (visit64_282_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
        if (visit65_289_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
          this.single_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293]++;
          if (visit66_293_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
            this.single_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300]++;
        if (visit67_300_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301]++;
          this.double_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304]++;
          if (visit68_304_1('"' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305]++;
            this.double_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315]++;
        if (visit69_315_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322]++;
          if (visit70_322_1(Utils.isWhitespace(ch))) {
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[325]++;
            if (visit71_325_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327]++;
              bookmarks[2] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328]++;
              bookmarks[3] = bookmarks[7];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[337]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[338]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[339]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[342]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344]++;
        throw new Error("how ** did we get in state " + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[347]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
    if (visit72_372_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
          if (visit73_378_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379]++;
            done = true;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
          if (visit74_380_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
            state = 1;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386]++;
          if (visit75_386_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389]++;
            if (visit76_389_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[390]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392]++;
              if (visit77_392_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
          if (visit78_405_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[408]++;
            if (visit79_408_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413]++;
          if (visit80_413_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[417]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[419]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[421]++;
          if (visit81_421_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424]++;
            if (visit82_424_1(Utils.isWhitespace(ch))) {
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434]++;
          throw new Error("how ** did we get in state " + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457]++;
    if (visit83_457_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460]++;
      if (visit84_460_1(quoteSmart && visit85_460_2((visit86_460_3(0 == quote)) && (visit87_461_1((visit88_461_2('\'' == ch)) || (visit89_461_3('"' == ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465]++;
        if (visit90_465_1(quoteSmart && visit91_465_2((visit92_465_3(0 !== quote)) && (visit93_465_4('\\' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467]++;
          if (visit94_467_1((visit95_467_2(-1 !== ch)) && visit96_468_1((visit97_468_2('\\' !== ch)) && (visit98_469_1(ch !== quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475]++;
          if (visit99_475_1(quoteSmart && (visit100_475_2(ch == quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478]++;
            if (visit101_478_1(quoteSmart && visit102_478_2((visit103_478_3(0 == quote)) && (visit104_478_4(ch == '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
              if (visit105_483_1(-1 == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[484]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[486]++;
                if (visit106_486_1('/' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[487]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488]++;
                    ch = page.getChar(cursor);
                  } while (visit107_489_1((visit108_489_2(-1 !== ch)) && (visit109_489_3('\n' !== ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491]++;
                  if (visit110_491_1('*' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495]++;
                        ch = page.getChar(cursor);
                      } while (visit111_496_1((visit112_496_2(-1 !== ch)) && (visit113_496_3('*' !== ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[497]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[498]++;
                      if (visit114_498_1(ch == '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[499]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit115_502_1((visit116_502_2(-1 !== ch)) && (visit117_502_3('/' !== ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[508]++;
              if (visit118_508_1((visit119_508_2(0 == quote)) && (visit120_508_3('<' == ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[509]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510]++;
                if (visit121_510_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514]++;
                  if (visit122_514_1(visit123_514_2('/' == ch) || visit124_515_1(Utils.isLetter(ch) || visit125_516_1(visit126_516_2('!' == ch) || visit127_518_1('?' == ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[519]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
            if (visit128_567_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568]++;
              if (visit129_568_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                if (visit130_570_1('\'' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576]++;
            if (visit131_576_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577]++;
              if (visit132_577_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
                if (visit133_579_1('"' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585]++;
            if (visit134_585_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
              if (visit135_586_1('' !== quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588]++;
                if (visit136_588_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590]++;
                  if (visit137_590_1((visit138_590_2(ch !== '\\')) && (visit139_590_3(ch !== quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598]++;
            if (visit140_598_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
              if (visit141_599_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602]++;
                if (visit142_602_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[604]++;
                  if (visit143_604_1('/' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[606]++;
                    if (visit144_606_1('*' == ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit145_610_1((visit146_610_2(-1 !== ch)) && (visit147_610_3('*' !== ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612]++;
                        if (visit148_612_1(ch == '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit149_615_1((visit150_615_2(-1 !== ch)) && (visit151_615_3('/' !== ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
            if (visit152_627_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628]++;
              if (visit153_628_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[639]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658]++;
            if (visit154_658_1(!tagName || (visit155_658_2(visit156_658_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670]++;
            if (visit157_670_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672]++;
              if (visit158_672_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
                if (visit159_674_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
                  if (visit160_676_1('-' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[687]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
        if (visit161_692_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694]++;
          if (visit162_694_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708]++;
        if (visit163_708_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[710]++;
          if (visit164_710_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[712]++;
            if (visit165_712_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714]++;
              if (visit166_714_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[715]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716]++;
                if (visit167_716_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718]++;
                  if (visit168_718_1('>' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[720]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[724]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728]++;
                mPage.ungetChar(mCursor);
              }
            }
          } else {
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[733]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[735]++;
        throw new Error("unexpected " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740]++;
  return this.makeCData(start, end);
}, 
  single_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[751]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
}, 
  double_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[762]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[773]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[774]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[784]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[785]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[789]++;
  return Lexer;
});
