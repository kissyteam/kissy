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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[217] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[264] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[331] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[333] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[335] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[338] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[341] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[367] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[395] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[418] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[420] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[427] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[448] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[464] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[477] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[484] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[497] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[506] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[507] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[540] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[606] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[610] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[617] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[621] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[646] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[702] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[704] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[712] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[721] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[726] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[762] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[772] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[773] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[777] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['142'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['239'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['253'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['262'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['285'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['296'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['311'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['317'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][6] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['472'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['484'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['484'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['504'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['504'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['563'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['565'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['681'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['681'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'][1].init(204, 10, '\'>\' === ch');
function visit168_707_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'][1].init(98, 9, '-1 === ch');
function visit167_705_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'][1].init(188, 10, '\'-\' === ch');
function visit166_703_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].init(90, 9, '-1 === ch');
function visit165_701_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].init(172, 10, '\'-\' === ch');
function visit164_699_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1].init(82, 9, '-1 === ch');
function visit163_697_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1].init(172, 18, 'Utils.isLetter(ch)');
function visit162_683_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['681'][1].init(82, 9, '-1 === ch');
function visit161_681_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['681'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].init(220, 10, '\'-\' === ch');
function visit160_664_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].init(106, 9, '-1 === ch');
function visit159_662_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].init(212, 10, '\'-\' === ch');
function visit158_660_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1].init(106, 9, '-1 === ch');
function visit157_658_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['658'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][3].init(964, 114, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit156_646_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][2].init(964, 256, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit155_646_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][1].init(951, 307, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit154_646_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['646'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1].init(41, 12, '\'\' === quote');
function visit153_616_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1].init(45, 10, 'quoteSmart');
function visit152_615_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['615'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][3].init(708, 10, '\'/\' !== ch');
function visit151_603_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][2].init(693, 9, '-1 !== ch');
function visit150_603_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1].init(646, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit149_603_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1].init(447, 10, 'ch === \'*\'');
function visit148_600_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3].init(305, 10, '\'*\' !== ch');
function visit147_598_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2].init(290, 9, '-1 !== ch');
function visit146_598_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].init(239, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit145_598_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1].init(463, 10, '\'*\' === ch');
function visit144_592_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].init(337, 10, '\'/\' === ch');
function visit143_590_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].init(215, 9, '-1 === ch');
function visit142_588_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].init(41, 12, '\'\' === quote');
function visit141_585_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1].init(45, 10, 'quoteSmart');
function visit140_584_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][3].init(290, 12, 'ch !== quote');
function visit139_576_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][2].init(273, 11, 'ch !== \'\\\\\'');
function visit138_576_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].init(273, 30, '(ch !== \'\\\\\') && (ch !== quote)');
function visit137_576_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1].init(150, 9, '-1 === ch');
function visit136_574_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].init(41, 12, '\'\' !== quote');
function visit135_572_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1].init(46, 10, 'quoteSmart');
function visit134_571_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['565'][1].init(180, 13, '\'"\' === quote');
function visit133_565_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['563'][1].init(41, 12, '\'\' === quote');
function visit132_563_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].init(45, 22, 'quoteSmart && !comment');
function visit131_562_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].init(181, 14, '\'\\\'\' === quote');
function visit130_556_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1].init(41, 12, '\'\' === quote');
function visit129_554_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].init(46, 22, 'quoteSmart && !comment');
function visit128_553_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['504'][1].init(80, 10, '\'?\' === ch');
function visit127_504_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['504'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2].init(336, 10, '\'!\' === ch');
function visit126_502_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].init(45, 91, '\'!\' === ch || \'?\' === ch');
function visit125_502_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1].init(37, 137, 'Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit124_501_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2].init(249, 10, '\'/\' === ch');
function visit123_500_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1].init(249, 175, '\'/\' === ch || Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit122_500_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1].init(72, 9, '-1 === ch');
function visit121_496_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][3].init(2326, 10, '\'<\' === ch');
function visit120_494_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][2].init(2309, 11, '0 === quote');
function visit119_494_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1].init(2309, 28, '(0 === quote) && (\'<\' === ch)');
function visit118_494_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][3].init(474, 10, '\'/\' !== ch');
function visit117_488_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][2].init(459, 9, '-1 !== ch');
function visit116_488_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][1].init(432, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit115_488_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['484'][1].init(247, 10, 'ch === \'*\'');
function visit114_484_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][3].init(147, 10, '\'*\' !== ch');
function visit113_482_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][2].init(132, 9, '-1 !== ch');
function visit112_482_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].init(101, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit111_482_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].init(562, 10, '\'*\' === ch');
function visit110_477_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][3].init(135, 11, '\'\\n\' !== ch');
function visit109_475_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].init(120, 9, '-1 !== ch');
function visit108_475_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].init(93, 27, '(-1 !== ch) && (\'\\n\' !== ch)');
function visit107_475_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['472'][1].init(348, 10, '\'/\' === ch');
function visit106_472_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(249, 9, '-1 === ch');
function visit105_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][4].init(1071, 10, 'ch === \'/\'');
function visit104_464_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][3].init(1054, 11, '0 === quote');
function visit103_464_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][2].init(1054, 28, '(0 === quote) && (ch === \'/\')');
function visit102_464_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1].init(1039, 43, 'quoteSmart && (0 === quote) && (ch === \'/\')');
function visit101_464_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2].init(926, 12, 'ch === quote');
function visit100_461_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1].init(911, 28, 'quoteSmart && (ch === quote)');
function visit99_461_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1].init(60, 12, 'ch !== quote');
function visit98_455_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][4].init(112, 11, '\'\\\\\' !== ch');
function visit97_454_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][3].init(112, 74, '(\'\\\\\' !== ch) && (ch !== quote)');
function visit96_454_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][2].init(98, 9, '-1 !== ch');
function visit95_454_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].init(98, 88, '(-1 !== ch) && (\'\\\\\' !== ch) && (ch !== quote)');
function visit94_454_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][4].init(423, 11, '\'\\\\\' === ch');
function visit93_452_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3].init(406, 11, '0 !== quote');
function visit92_452_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].init(406, 29, '(0 !== quote) && (\'\\\\\' === ch)');
function visit91_452_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].init(391, 44, 'quoteSmart && (0 !== quote) && (\'\\\\\' === ch)');
function visit90_452_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][6].init(200, 11, '\'\\\'\' === ch');
function visit89_448_6(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][5].init(184, 10, '\'"\' === ch');
function visit88_448_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][4].init(184, 28, '(\'"\' === ch) || (\'\\\'\' === ch)');
function visit87_448_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][3].init(166, 11, '0 === quote');
function visit86_448_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][2].init(166, 47, '(0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit85_448_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1].init(151, 62, 'quoteSmart && (0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit84_448_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].init(64, 9, '-1 === ch');
function visit83_445_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1].init(167, 23, '!Utils.isWhitespace(ch)');
function visit82_415_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].init(69, 10, '\'>\' === ch');
function visit81_413_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].init(80, 10, '\'-\' === ch');
function visit80_405_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].init(204, 9, '-1 === ch');
function visit79_400_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'][1].init(79, 10, '\'-\' === ch');
function visit78_397_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].init(304, 10, '\'>\' === ch');
function visit77_384_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'][1].init(166, 9, '-1 === ch');
function visit76_381_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].init(77, 10, '\'-\' === ch');
function visit75_378_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].init(174, 10, '\'-\' === ch');
function visit74_371_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1].init(76, 10, '\'>\' === ch');
function visit73_369_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].init(64, 9, '-1 === ch');
function visit72_363_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1].init(715, 23, '!Utils.isWhitespace(ch)');
function visit71_322_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['317'][1].init(463, 10, '\'=\' === ch');
function visit70_317_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['311'][1].init(142, 9, '-1 === ch');
function visit69_311_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1].init(271, 10, '\'"\' === ch');
function visit68_300_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['296'][1].init(75, 9, '-1 === ch');
function visit67_296_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1].init(271, 11, '\'\\\'\' === ch');
function visit66_289_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['285'][1].init(75, 9, '-1 === ch');
function visit65_285_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].init(238, 22, 'Utils.isWhitespace(ch)');
function visit64_278_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][3].init(83, 10, '\'>\' === ch');
function visit63_275_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][2].init(68, 9, '-1 === ch');
function visit62_275_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][1].init(68, 26, '(-1 === ch) || (\'>\' === ch)');
function visit61_275_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].init(518, 23, '!Utils.isWhitespace(ch)');
function visit60_268_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].init(372, 10, '\'"\' === ch');
function visit59_265_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['262'][1].init(225, 11, '\'\\\'\' === ch');
function visit58_262_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][3].init(65, 10, '\'>\' === ch');
function visit57_259_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][2].init(50, 9, '-1 === ch');
function visit56_259_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1].init(50, 26, '(-1 === ch) || (\'>\' === ch)');
function visit55_259_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['253'][1].init(973, 10, '\'=\' === ch');
function visit54_253_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1].init(574, 22, 'Utils.isWhitespace(ch)');
function visit53_247_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['239'][1].init(33, 10, '\'<\' === ch');
function visit52_239_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][5].init(116, 10, '\'<\' === ch');
function visit51_238_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][4].init(100, 10, '\'>\' === ch');
function visit50_238_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][3].init(100, 27, '(\'>\' === ch) || (\'<\' === ch)');
function visit49_238_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][2].init(85, 9, '-1 === ch');
function visit48_238_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1].init(85, 42, '(-1 === ch) || (\'>\' === ch) || (\'<\' === ch)');
function visit47_238_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][2].init(433, 10, 'ch === \'/\'');
function visit46_230_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][1].init(433, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit45_230_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][2].init(79, 10, 'ch === \'/\'');
function visit44_225_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][1].init(79, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit43_225_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1].init(88, 18, '!attributes.length');
function visit42_223_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1].init(33, 10, '\'<\' === ch');
function visit41_215_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][5].init(114, 10, '\'<\' === ch');
function visit40_214_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][4].init(100, 10, '\'>\' === ch');
function visit39_214_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][3].init(100, 24, '\'>\' === ch || \'<\' === ch');
function visit38_214_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2].init(87, 9, 'ch === -1');
function visit37_214_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].init(87, 37, 'ch === -1 || \'>\' === ch || \'<\' === ch');
function visit36_214_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][3].init(35, 9, 'ch === -1');
function visit35_193_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][2].init(35, 30, 'ch === -1 && attributes.length');
function visit34_193_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][1].init(25, 40, 'strict && ch === -1 && attributes.length');
function visit33_193_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1].init(329, 6, 'strict');
function visit32_191_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['142'][1].init(91, 10, '2 > length');
function visit31_142_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].init(96, 12, '0 !== length');
function visit30_141_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].init(77, 5, 'l > 0');
function visit29_131_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1].init(77, 5, 'l > 0');
function visit28_121_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].init(91, 10, '2 > length');
function visit27_105_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].init(81, 12, '0 !== length');
function visit26_104_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].init(122, 10, '\'-\' === ch');
function visit25_76_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].init(33, 10, '\'>\' === ch');
function visit24_72_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].init(80, 9, 'ch === -1');
function visit23_69_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].init(378, 10, '\'?\' === ch');
function visit22_67_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].init(364, 10, '\'!\' === ch');
function visit21_67_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].init(364, 24, '\'!\' === ch || \'?\' === ch');
function visit20_67_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].init(196, 10, 'ch === \'/\'');
function visit19_64_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].init(196, 32, 'ch === \'/\' || Utils.isLetter(ch)');
function visit18_64_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].init(80, 9, 'ch === -1');
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
      if (visit17_62_1(ch === -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64]++;
        if (visit18_64_1(visit19_64_2(ch === '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[65]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
          if (visit20_67_1(visit21_67_2('!' === ch) || visit22_67_3('?' === ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69]++;
            if (visit23_69_1(ch === -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
              if (visit24_72_1('>' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[75]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76]++;
                if (visit25_76_1('-' === ch)) {
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[115]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121]++;
  if (visit28_121_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131]++;
  if (visit29_131_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141]++;
  if (visit30_141_1(0 !== length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[142]++;
    if (visit31_142_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[144]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[146]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[151]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[155]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[159]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[163]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[167]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191]++;
  if (visit32_191_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193]++;
  if (visit33_193_1(strict && visit34_193_2(visit35_193_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[194]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[211]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214]++;
        if (visit36_214_1(visit37_214_2(ch === -1) || visit38_214_3(visit39_214_4('>' === ch) || visit40_214_5('<' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215]++;
          if (visit41_215_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[217]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223]++;
          if (visit42_223_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225]++;
            if (visit43_225_1(visit44_225_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230]++;
            if (visit45_230_1(visit46_230_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238]++;
        if (visit47_238_1((visit48_238_2(-1 === ch)) || visit49_238_3((visit50_238_4('>' === ch)) || (visit51_238_5('<' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239]++;
          if (visit52_239_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247]++;
          if (visit53_247_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253]++;
            if (visit54_253_1('=' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
        if (visit55_259_1((visit56_259_2(-1 === ch)) || (visit57_259_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262]++;
          if (visit58_262_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[264]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265]++;
            if (visit59_265_1('"' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
              if (visit60_268_1(!Utils.isWhitespace(ch))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275]++;
        if (visit61_275_1((visit62_275_2(-1 === ch)) || (visit63_275_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
          if (visit64_278_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285]++;
        if (visit65_285_1(-1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286]++;
          this.singleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
          if (visit66_289_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
            this.singleQuote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
        if (visit67_296_1(-1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297]++;
          this.doubleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300]++;
          if (visit68_300_1('"' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301]++;
            this.doubleQuote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[303]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311]++;
        if (visit69_311_1(-1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317]++;
          if (visit70_317_1('=' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319]++;
            bookmarks[2] = bookmarks[6];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
            bookmarks[3] = bookmarks[7];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321]++;
            state = 2;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322]++;
            if (visit71_322_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[331]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[333]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[335]++;
        throw new Error('how ** did we get in state ' + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[338]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[341]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363]++;
    if (visit72_363_1(-1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[367]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369]++;
          if (visit73_369_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
            if (visit74_371_1('-' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
              state = 1;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
          if (visit75_378_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
            if (visit76_381_1(-1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
              if (visit77_384_1('>' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[395]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397]++;
          if (visit78_397_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400]++;
            if (visit79_400_1(-1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
          if (visit80_405_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413]++;
          if (visit81_413_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415]++;
            if (visit82_415_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[418]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[420]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422]++;
          throw new Error('how ** did we get in state ' + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[427]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445]++;
    if (visit83_445_1(-1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[448]++;
      if (visit84_448_1(quoteSmart && visit85_448_2((visit86_448_3(0 === quote)) && (visit87_448_4((visit88_448_5('"' === ch)) || (visit89_448_6('\'' === ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452]++;
        if (visit90_452_1(quoteSmart && visit91_452_2((visit92_452_3(0 !== quote)) && (visit93_452_4('\\' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454]++;
          if (visit94_454_1((visit95_454_2(-1 !== ch)) && visit96_454_3((visit97_454_4('\\' !== ch)) && (visit98_455_1(ch !== quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461]++;
          if (visit99_461_1(quoteSmart && (visit100_461_2(ch === quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[464]++;
            if (visit101_464_1(quoteSmart && visit102_464_2((visit103_464_3(0 === quote)) && (visit104_464_4(ch === '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469]++;
              if (visit105_469_1(-1 === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472]++;
                if (visit106_472_1('/' === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474]++;
                    ch = page.getChar(cursor);
                  } while (visit107_475_1((visit108_475_2(-1 !== ch)) && (visit109_475_3('\n' !== ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[477]++;
                  if (visit110_477_1('*' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481]++;
                        ch = page.getChar(cursor);
                      } while (visit111_482_1((visit112_482_2(-1 !== ch)) && (visit113_482_3('*' !== ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[484]++;
                      if (visit114_484_1(ch === '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit115_488_1((visit116_488_2(-1 !== ch)) && (visit117_488_3('/' !== ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494]++;
              if (visit118_494_1((visit119_494_2(0 === quote)) && (visit120_494_3('<' === ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496]++;
                if (visit121_496_1(-1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[497]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500]++;
                  if (visit122_500_1(visit123_500_2('/' === ch) || visit124_501_1(Utils.isLetter(ch) || visit125_502_1(visit126_502_2('!' === ch) || visit127_504_1('?' === ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[506]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[507]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[540]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553]++;
            if (visit128_553_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
              if (visit129_554_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
                if (visit130_556_1('\'' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
            if (visit131_562_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563]++;
              if (visit132_563_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565]++;
                if (visit133_565_1('"' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
            if (visit134_571_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572]++;
              if (visit135_572_1('' !== quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574]++;
                if (visit136_574_1(-1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576]++;
                  if (visit137_576_1((visit138_576_2(ch !== '\\')) && (visit139_576_3(ch !== quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584]++;
            if (visit140_584_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585]++;
              if (visit141_585_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588]++;
                if (visit142_588_1(-1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590]++;
                  if (visit143_590_1('/' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
                    if (visit144_592_1('*' === ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit145_598_1((visit146_598_2(-1 !== ch)) && (visit147_598_3('*' !== ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600]++;
                        if (visit148_600_1(ch === '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit149_603_1((visit150_603_2(-1 !== ch)) && (visit151_603_3('/' !== ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[606]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[610]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615]++;
            if (visit152_615_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616]++;
              if (visit153_616_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[617]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[621]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[646]++;
            if (visit154_646_1(!tagName || (visit155_646_2(visit156_646_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658]++;
            if (visit157_658_1(-1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660]++;
              if (visit158_660_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
                if (visit159_662_1(-1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664]++;
                  if (visit160_664_1('-' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681]++;
        if (visit161_681_1(-1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
          if (visit162_683_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697]++;
        if (visit163_697_1(-1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699]++;
          if (visit164_699_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
            if (visit165_701_1(-1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[702]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
              if (visit166_703_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[704]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705]++;
                if (visit167_705_1(-1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
                  if (visit168_707_1('>' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[712]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717]++;
                mPage.ungetChar(mCursor);
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[721]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723]++;
        throw new Error('unexpected ' + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[726]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728]++;
  return this.makeCData(start, end);
}, 
  singleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[4] + 1, bookmarks[5]), '\''));
}, 
  doubleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[762]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[772]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[773]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[777]++;
  return Lexer;
});
