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
if (! _$jscoverage['/util/add-event.js']) {
  _$jscoverage['/util/add-event.js'] = {};
  _$jscoverage['/util/add-event.js'].lineData = [];
  _$jscoverage['/util/add-event.js'].lineData[6] = 0;
  _$jscoverage['/util/add-event.js'].lineData[7] = 0;
  _$jscoverage['/util/add-event.js'].lineData[8] = 0;
  _$jscoverage['/util/add-event.js'].lineData[9] = 0;
  _$jscoverage['/util/add-event.js'].lineData[10] = 0;
  _$jscoverage['/util/add-event.js'].lineData[11] = 0;
  _$jscoverage['/util/add-event.js'].lineData[12] = 0;
  _$jscoverage['/util/add-event.js'].lineData[18] = 0;
  _$jscoverage['/util/add-event.js'].lineData[19] = 0;
  _$jscoverage['/util/add-event.js'].lineData[22] = 0;
  _$jscoverage['/util/add-event.js'].lineData[23] = 0;
  _$jscoverage['/util/add-event.js'].lineData[26] = 0;
  _$jscoverage['/util/add-event.js'].lineData[27] = 0;
  _$jscoverage['/util/add-event.js'].lineData[31] = 0;
  _$jscoverage['/util/add-event.js'].lineData[33] = 0;
  _$jscoverage['/util/add-event.js'].lineData[35] = 0;
  _$jscoverage['/util/add-event.js'].lineData[36] = 0;
  _$jscoverage['/util/add-event.js'].lineData[38] = 0;
  _$jscoverage['/util/add-event.js'].lineData[39] = 0;
  _$jscoverage['/util/add-event.js'].lineData[40] = 0;
  _$jscoverage['/util/add-event.js'].lineData[42] = 0;
  _$jscoverage['/util/add-event.js'].lineData[44] = 0;
  _$jscoverage['/util/add-event.js'].lineData[45] = 0;
  _$jscoverage['/util/add-event.js'].lineData[47] = 0;
  _$jscoverage['/util/add-event.js'].lineData[50] = 0;
  _$jscoverage['/util/add-event.js'].lineData[51] = 0;
  _$jscoverage['/util/add-event.js'].lineData[52] = 0;
  _$jscoverage['/util/add-event.js'].lineData[53] = 0;
  _$jscoverage['/util/add-event.js'].lineData[54] = 0;
  _$jscoverage['/util/add-event.js'].lineData[55] = 0;
  _$jscoverage['/util/add-event.js'].lineData[56] = 0;
  _$jscoverage['/util/add-event.js'].lineData[58] = 0;
  _$jscoverage['/util/add-event.js'].lineData[59] = 0;
  _$jscoverage['/util/add-event.js'].lineData[60] = 0;
  _$jscoverage['/util/add-event.js'].lineData[63] = 0;
  _$jscoverage['/util/add-event.js'].lineData[64] = 0;
  _$jscoverage['/util/add-event.js'].lineData[65] = 0;
  _$jscoverage['/util/add-event.js'].lineData[66] = 0;
  _$jscoverage['/util/add-event.js'].lineData[67] = 0;
  _$jscoverage['/util/add-event.js'].lineData[69] = 0;
  _$jscoverage['/util/add-event.js'].lineData[71] = 0;
  _$jscoverage['/util/add-event.js'].lineData[74] = 0;
  _$jscoverage['/util/add-event.js'].lineData[82] = 0;
  _$jscoverage['/util/add-event.js'].lineData[84] = 0;
  _$jscoverage['/util/add-event.js'].lineData[86] = 0;
  _$jscoverage['/util/add-event.js'].lineData[87] = 0;
  _$jscoverage['/util/add-event.js'].lineData[89] = 0;
  _$jscoverage['/util/add-event.js'].lineData[93] = 0;
  _$jscoverage['/util/add-event.js'].lineData[94] = 0;
  _$jscoverage['/util/add-event.js'].lineData[98] = 0;
  _$jscoverage['/util/add-event.js'].lineData[103] = 0;
  _$jscoverage['/util/add-event.js'].lineData[104] = 0;
  _$jscoverage['/util/add-event.js'].lineData[105] = 0;
  _$jscoverage['/util/add-event.js'].lineData[106] = 0;
  _$jscoverage['/util/add-event.js'].lineData[107] = 0;
  _$jscoverage['/util/add-event.js'].lineData[113] = 0;
  _$jscoverage['/util/add-event.js'].lineData[118] = 0;
  _$jscoverage['/util/add-event.js'].lineData[119] = 0;
  _$jscoverage['/util/add-event.js'].lineData[120] = 0;
  _$jscoverage['/util/add-event.js'].lineData[121] = 0;
  _$jscoverage['/util/add-event.js'].lineData[127] = 0;
  _$jscoverage['/util/add-event.js'].lineData[131] = 0;
  _$jscoverage['/util/add-event.js'].lineData[132] = 0;
  _$jscoverage['/util/add-event.js'].lineData[137] = 0;
  _$jscoverage['/util/add-event.js'].lineData[138] = 0;
  _$jscoverage['/util/add-event.js'].lineData[144] = 0;
  _$jscoverage['/util/add-event.js'].lineData[145] = 0;
  _$jscoverage['/util/add-event.js'].lineData[147] = 0;
  _$jscoverage['/util/add-event.js'].lineData[149] = 0;
  _$jscoverage['/util/add-event.js'].lineData[150] = 0;
  _$jscoverage['/util/add-event.js'].lineData[151] = 0;
  _$jscoverage['/util/add-event.js'].lineData[152] = 0;
  _$jscoverage['/util/add-event.js'].lineData[153] = 0;
  _$jscoverage['/util/add-event.js'].lineData[154] = 0;
  _$jscoverage['/util/add-event.js'].lineData[162] = 0;
  _$jscoverage['/util/add-event.js'].lineData[163] = 0;
  _$jscoverage['/util/add-event.js'].lineData[165] = 0;
  _$jscoverage['/util/add-event.js'].lineData[167] = 0;
  _$jscoverage['/util/add-event.js'].lineData[169] = 0;
  _$jscoverage['/util/add-event.js'].lineData[170] = 0;
  _$jscoverage['/util/add-event.js'].lineData[173] = 0;
  _$jscoverage['/util/add-event.js'].lineData[177] = 0;
  _$jscoverage['/util/add-event.js'].lineData[181] = 0;
  _$jscoverage['/util/add-event.js'].lineData[182] = 0;
  _$jscoverage['/util/add-event.js'].lineData[185] = 0;
  _$jscoverage['/util/add-event.js'].lineData[187] = 0;
  _$jscoverage['/util/add-event.js'].lineData[188] = 0;
  _$jscoverage['/util/add-event.js'].lineData[189] = 0;
  _$jscoverage['/util/add-event.js'].lineData[190] = 0;
  _$jscoverage['/util/add-event.js'].lineData[192] = 0;
  _$jscoverage['/util/add-event.js'].lineData[194] = 0;
  _$jscoverage['/util/add-event.js'].lineData[195] = 0;
  _$jscoverage['/util/add-event.js'].lineData[196] = 0;
  _$jscoverage['/util/add-event.js'].lineData[197] = 0;
  _$jscoverage['/util/add-event.js'].lineData[199] = 0;
  _$jscoverage['/util/add-event.js'].lineData[200] = 0;
  _$jscoverage['/util/add-event.js'].lineData[202] = 0;
  _$jscoverage['/util/add-event.js'].lineData[203] = 0;
  _$jscoverage['/util/add-event.js'].lineData[204] = 0;
  _$jscoverage['/util/add-event.js'].lineData[205] = 0;
  _$jscoverage['/util/add-event.js'].lineData[206] = 0;
  _$jscoverage['/util/add-event.js'].lineData[210] = 0;
  _$jscoverage['/util/add-event.js'].lineData[214] = 0;
  _$jscoverage['/util/add-event.js'].lineData[215] = 0;
  _$jscoverage['/util/add-event.js'].lineData[216] = 0;
  _$jscoverage['/util/add-event.js'].lineData[217] = 0;
  _$jscoverage['/util/add-event.js'].lineData[218] = 0;
  _$jscoverage['/util/add-event.js'].lineData[219] = 0;
  _$jscoverage['/util/add-event.js'].lineData[221] = 0;
  _$jscoverage['/util/add-event.js'].lineData[222] = 0;
  _$jscoverage['/util/add-event.js'].lineData[223] = 0;
  _$jscoverage['/util/add-event.js'].lineData[224] = 0;
  _$jscoverage['/util/add-event.js'].lineData[225] = 0;
  _$jscoverage['/util/add-event.js'].lineData[228] = 0;
  _$jscoverage['/util/add-event.js'].lineData[231] = 0;
  _$jscoverage['/util/add-event.js'].lineData[232] = 0;
  _$jscoverage['/util/add-event.js'].lineData[233] = 0;
  _$jscoverage['/util/add-event.js'].lineData[234] = 0;
  _$jscoverage['/util/add-event.js'].lineData[237] = 0;
  _$jscoverage['/util/add-event.js'].lineData[241] = 0;
  _$jscoverage['/util/add-event.js'].lineData[243] = 0;
  _$jscoverage['/util/add-event.js'].lineData[244] = 0;
  _$jscoverage['/util/add-event.js'].lineData[245] = 0;
  _$jscoverage['/util/add-event.js'].lineData[247] = 0;
  _$jscoverage['/util/add-event.js'].lineData[248] = 0;
  _$jscoverage['/util/add-event.js'].lineData[249] = 0;
  _$jscoverage['/util/add-event.js'].lineData[250] = 0;
  _$jscoverage['/util/add-event.js'].lineData[251] = 0;
  _$jscoverage['/util/add-event.js'].lineData[254] = 0;
  _$jscoverage['/util/add-event.js'].lineData[258] = 0;
  _$jscoverage['/util/add-event.js'].lineData[260] = 0;
  _$jscoverage['/util/add-event.js'].lineData[261] = 0;
  _$jscoverage['/util/add-event.js'].lineData[262] = 0;
  _$jscoverage['/util/add-event.js'].lineData[266] = 0;
  _$jscoverage['/util/add-event.js'].lineData[267] = 0;
  _$jscoverage['/util/add-event.js'].lineData[268] = 0;
  _$jscoverage['/util/add-event.js'].lineData[269] = 0;
  _$jscoverage['/util/add-event.js'].lineData[270] = 0;
  _$jscoverage['/util/add-event.js'].lineData[272] = 0;
  _$jscoverage['/util/add-event.js'].lineData[273] = 0;
  _$jscoverage['/util/add-event.js'].lineData[274] = 0;
  _$jscoverage['/util/add-event.js'].lineData[275] = 0;
  _$jscoverage['/util/add-event.js'].lineData[276] = 0;
  _$jscoverage['/util/add-event.js'].lineData[277] = 0;
  _$jscoverage['/util/add-event.js'].lineData[283] = 0;
  _$jscoverage['/util/add-event.js'].lineData[288] = 0;
  _$jscoverage['/util/add-event.js'].lineData[289] = 0;
  _$jscoverage['/util/add-event.js'].lineData[291] = 0;
  _$jscoverage['/util/add-event.js'].lineData[292] = 0;
  _$jscoverage['/util/add-event.js'].lineData[294] = 0;
  _$jscoverage['/util/add-event.js'].lineData[295] = 0;
  _$jscoverage['/util/add-event.js'].lineData[296] = 0;
  _$jscoverage['/util/add-event.js'].lineData[298] = 0;
  _$jscoverage['/util/add-event.js'].lineData[301] = 0;
  _$jscoverage['/util/add-event.js'].lineData[302] = 0;
  _$jscoverage['/util/add-event.js'].lineData[305] = 0;
  _$jscoverage['/util/add-event.js'].lineData[306] = 0;
  _$jscoverage['/util/add-event.js'].lineData[308] = 0;
  _$jscoverage['/util/add-event.js'].lineData[309] = 0;
  _$jscoverage['/util/add-event.js'].lineData[310] = 0;
  _$jscoverage['/util/add-event.js'].lineData[315] = 0;
  _$jscoverage['/util/add-event.js'].lineData[316] = 0;
  _$jscoverage['/util/add-event.js'].lineData[317] = 0;
  _$jscoverage['/util/add-event.js'].lineData[318] = 0;
  _$jscoverage['/util/add-event.js'].lineData[319] = 0;
  _$jscoverage['/util/add-event.js'].lineData[325] = 0;
  _$jscoverage['/util/add-event.js'].lineData[328] = 0;
  _$jscoverage['/util/add-event.js'].lineData[329] = 0;
  _$jscoverage['/util/add-event.js'].lineData[331] = 0;
  _$jscoverage['/util/add-event.js'].lineData[332] = 0;
  _$jscoverage['/util/add-event.js'].lineData[333] = 0;
  _$jscoverage['/util/add-event.js'].lineData[341] = 0;
  _$jscoverage['/util/add-event.js'].lineData[342] = 0;
  _$jscoverage['/util/add-event.js'].lineData[343] = 0;
  _$jscoverage['/util/add-event.js'].lineData[344] = 0;
  _$jscoverage['/util/add-event.js'].lineData[349] = 0;
  _$jscoverage['/util/add-event.js'].lineData[350] = 0;
  _$jscoverage['/util/add-event.js'].lineData[351] = 0;
  _$jscoverage['/util/add-event.js'].lineData[352] = 0;
  _$jscoverage['/util/add-event.js'].lineData[353] = 0;
  _$jscoverage['/util/add-event.js'].lineData[354] = 0;
  _$jscoverage['/util/add-event.js'].lineData[360] = 0;
  _$jscoverage['/util/add-event.js'].lineData[362] = 0;
  _$jscoverage['/util/add-event.js'].lineData[363] = 0;
  _$jscoverage['/util/add-event.js'].lineData[364] = 0;
  _$jscoverage['/util/add-event.js'].lineData[368] = 0;
  _$jscoverage['/util/add-event.js'].lineData[369] = 0;
  _$jscoverage['/util/add-event.js'].lineData[372] = 0;
  _$jscoverage['/util/add-event.js'].lineData[373] = 0;
  _$jscoverage['/util/add-event.js'].lineData[376] = 0;
  _$jscoverage['/util/add-event.js'].lineData[377] = 0;
  _$jscoverage['/util/add-event.js'].lineData[378] = 0;
  _$jscoverage['/util/add-event.js'].lineData[381] = 0;
  _$jscoverage['/util/add-event.js'].lineData[382] = 0;
  _$jscoverage['/util/add-event.js'].lineData[383] = 0;
  _$jscoverage['/util/add-event.js'].lineData[386] = 0;
  _$jscoverage['/util/add-event.js'].lineData[387] = 0;
  _$jscoverage['/util/add-event.js'].lineData[389] = 0;
  _$jscoverage['/util/add-event.js'].lineData[390] = 0;
  _$jscoverage['/util/add-event.js'].lineData[392] = 0;
  _$jscoverage['/util/add-event.js'].lineData[393] = 0;
  _$jscoverage['/util/add-event.js'].lineData[397] = 0;
  _$jscoverage['/util/add-event.js'].lineData[398] = 0;
  _$jscoverage['/util/add-event.js'].lineData[400] = 0;
  _$jscoverage['/util/add-event.js'].lineData[401] = 0;
  _$jscoverage['/util/add-event.js'].lineData[402] = 0;
  _$jscoverage['/util/add-event.js'].lineData[404] = 0;
  _$jscoverage['/util/add-event.js'].lineData[405] = 0;
  _$jscoverage['/util/add-event.js'].lineData[406] = 0;
  _$jscoverage['/util/add-event.js'].lineData[411] = 0;
  _$jscoverage['/util/add-event.js'].lineData[412] = 0;
  _$jscoverage['/util/add-event.js'].lineData[413] = 0;
  _$jscoverage['/util/add-event.js'].lineData[415] = 0;
  _$jscoverage['/util/add-event.js'].lineData[416] = 0;
  _$jscoverage['/util/add-event.js'].lineData[417] = 0;
  _$jscoverage['/util/add-event.js'].lineData[418] = 0;
  _$jscoverage['/util/add-event.js'].lineData[419] = 0;
  _$jscoverage['/util/add-event.js'].lineData[420] = 0;
  _$jscoverage['/util/add-event.js'].lineData[421] = 0;
  _$jscoverage['/util/add-event.js'].lineData[423] = 0;
  _$jscoverage['/util/add-event.js'].lineData[424] = 0;
}
if (! _$jscoverage['/util/add-event.js'].functionData) {
  _$jscoverage['/util/add-event.js'].functionData = [];
  _$jscoverage['/util/add-event.js'].functionData[0] = 0;
  _$jscoverage['/util/add-event.js'].functionData[1] = 0;
  _$jscoverage['/util/add-event.js'].functionData[2] = 0;
  _$jscoverage['/util/add-event.js'].functionData[3] = 0;
  _$jscoverage['/util/add-event.js'].functionData[4] = 0;
  _$jscoverage['/util/add-event.js'].functionData[5] = 0;
  _$jscoverage['/util/add-event.js'].functionData[6] = 0;
  _$jscoverage['/util/add-event.js'].functionData[7] = 0;
  _$jscoverage['/util/add-event.js'].functionData[8] = 0;
  _$jscoverage['/util/add-event.js'].functionData[9] = 0;
  _$jscoverage['/util/add-event.js'].functionData[10] = 0;
  _$jscoverage['/util/add-event.js'].functionData[11] = 0;
  _$jscoverage['/util/add-event.js'].functionData[12] = 0;
  _$jscoverage['/util/add-event.js'].functionData[13] = 0;
  _$jscoverage['/util/add-event.js'].functionData[14] = 0;
  _$jscoverage['/util/add-event.js'].functionData[15] = 0;
  _$jscoverage['/util/add-event.js'].functionData[16] = 0;
  _$jscoverage['/util/add-event.js'].functionData[17] = 0;
  _$jscoverage['/util/add-event.js'].functionData[18] = 0;
  _$jscoverage['/util/add-event.js'].functionData[19] = 0;
  _$jscoverage['/util/add-event.js'].functionData[20] = 0;
  _$jscoverage['/util/add-event.js'].functionData[21] = 0;
  _$jscoverage['/util/add-event.js'].functionData[22] = 0;
  _$jscoverage['/util/add-event.js'].functionData[23] = 0;
  _$jscoverage['/util/add-event.js'].functionData[24] = 0;
  _$jscoverage['/util/add-event.js'].functionData[25] = 0;
  _$jscoverage['/util/add-event.js'].functionData[26] = 0;
  _$jscoverage['/util/add-event.js'].functionData[27] = 0;
  _$jscoverage['/util/add-event.js'].functionData[28] = 0;
  _$jscoverage['/util/add-event.js'].functionData[29] = 0;
  _$jscoverage['/util/add-event.js'].functionData[30] = 0;
  _$jscoverage['/util/add-event.js'].functionData[31] = 0;
  _$jscoverage['/util/add-event.js'].functionData[32] = 0;
  _$jscoverage['/util/add-event.js'].functionData[33] = 0;
}
if (! _$jscoverage['/util/add-event.js'].branchData) {
  _$jscoverage['/util/add-event.js'].branchData = {};
  _$jscoverage['/util/add-event.js'].branchData['27'] = [];
  _$jscoverage['/util/add-event.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['35'] = [];
  _$jscoverage['/util/add-event.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['36'] = [];
  _$jscoverage['/util/add-event.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['47'] = [];
  _$jscoverage['/util/add-event.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['53'] = [];
  _$jscoverage['/util/add-event.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['86'] = [];
  _$jscoverage['/util/add-event.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['103'] = [];
  _$jscoverage['/util/add-event.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['105'] = [];
  _$jscoverage['/util/add-event.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['118'] = [];
  _$jscoverage['/util/add-event.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['120'] = [];
  _$jscoverage['/util/add-event.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['127'] = [];
  _$jscoverage['/util/add-event.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['131'] = [];
  _$jscoverage['/util/add-event.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['137'] = [];
  _$jscoverage['/util/add-event.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['147'] = [];
  _$jscoverage['/util/add-event.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['153'] = [];
  _$jscoverage['/util/add-event.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['165'] = [];
  _$jscoverage['/util/add-event.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['169'] = [];
  _$jscoverage['/util/add-event.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['169'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['182'] = [];
  _$jscoverage['/util/add-event.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['182'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['187'] = [];
  _$jscoverage['/util/add-event.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['189'] = [];
  _$jscoverage['/util/add-event.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['194'] = [];
  _$jscoverage['/util/add-event.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['199'] = [];
  _$jscoverage['/util/add-event.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['214'] = [];
  _$jscoverage['/util/add-event.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['217'] = [];
  _$jscoverage['/util/add-event.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['218'] = [];
  _$jscoverage['/util/add-event.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['222'] = [];
  _$jscoverage['/util/add-event.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['224'] = [];
  _$jscoverage['/util/add-event.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['231'] = [];
  _$jscoverage['/util/add-event.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['243'] = [];
  _$jscoverage['/util/add-event.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['244'] = [];
  _$jscoverage['/util/add-event.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['248'] = [];
  _$jscoverage['/util/add-event.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['250'] = [];
  _$jscoverage['/util/add-event.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['260'] = [];
  _$jscoverage['/util/add-event.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['261'] = [];
  _$jscoverage['/util/add-event.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['267'] = [];
  _$jscoverage['/util/add-event.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['272'] = [];
  _$jscoverage['/util/add-event.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['274'] = [];
  _$jscoverage['/util/add-event.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['276'] = [];
  _$jscoverage['/util/add-event.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['291'] = [];
  _$jscoverage['/util/add-event.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['294'] = [];
  _$jscoverage['/util/add-event.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['296'] = [];
  _$jscoverage['/util/add-event.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['301'] = [];
  _$jscoverage['/util/add-event.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['301'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['305'] = [];
  _$jscoverage['/util/add-event.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['309'] = [];
  _$jscoverage['/util/add-event.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['309'][2] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['309'][3] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['315'] = [];
  _$jscoverage['/util/add-event.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['317'] = [];
  _$jscoverage['/util/add-event.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['328'] = [];
  _$jscoverage['/util/add-event.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['350'] = [];
  _$jscoverage['/util/add-event.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['352'] = [];
  _$jscoverage['/util/add-event.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['389'] = [];
  _$jscoverage['/util/add-event.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['392'] = [];
  _$jscoverage['/util/add-event.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['400'] = [];
  _$jscoverage['/util/add-event.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['401'] = [];
  _$jscoverage['/util/add-event.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['404'] = [];
  _$jscoverage['/util/add-event.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['412'] = [];
  _$jscoverage['/util/add-event.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/util/add-event.js'].branchData['421'] = [];
  _$jscoverage['/util/add-event.js'].branchData['421'][1] = new BranchData();
}
_$jscoverage['/util/add-event.js'].branchData['421'][1].init(309, 19, 'config.order || 100');
function visit65_421_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['412'][1].init(14, 26, 'typeof events === \'string\'');
function visit64_412_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['404'][1].init(109, 27, '!handle.eventHandles.length');
function visit63_404_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['401'][1].init(18, 5, 'event');
function visit62_401_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['400'][1].init(96, 6, 'handle');
function visit61_400_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['392'][1].init(199, 5, 'event');
function visit60_392_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['389'][1].init(96, 7, '!handle');
function visit59_389_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['352'][1].init(68, 26, '!eventHandles[event].count');
function visit58_352_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['350'][1].init(69, 19, 'eventHandles[event]');
function visit57_350_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['328'][1].init(155, 19, 'eventHandles[event]');
function visit56_328_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['317'][1].init(60, 15, 'eventHandles[e]');
function visit55_317_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['315'][1].init(1245, 5, 'i < l');
function visit54_315_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['309'][3].init(500, 26, 'h[method](event) === false');
function visit53_309_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['309'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['309'][2].init(487, 39, 'h[method] && h[method](event) === false');
function visit52_309_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['309'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['309'][1].init(473, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit51_309_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['305'][1].init(337, 11, 'h.processed');
function visit50_305_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['301'][2].init(211, 37, 'gestureType !== h.requiredGestureType');
function visit49_301_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['301'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['301'][1].init(186, 62, 'h.requiredGestureType && gestureType !== h.requiredGestureType');
function visit48_301_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['296'][1].init(59, 15, 'eventHandles[e]');
function visit47_296_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['294'][1].init(476, 5, 'i < l');
function visit46_294_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['291'][1].init(351, 28, '!event.changedTouches.length');
function visit45_291_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['276'][1].init(78, 20, '!self.touches.length');
function visit44_276_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['274'][1].init(627, 20, 'isPointerEvent(type)');
function visit43_274_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['272'][1].init(544, 18, 'isMouseEvent(type)');
function visit42_272_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['267'][1].init(306, 18, 'isTouchEvent(type)');
function visit41_267_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['261'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit40_261_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['260'][1].init(84, 18, 'isMouseEvent(type)');
function visit39_260_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['250'][1].init(386, 19, '!isTouchEvent(type)');
function visit38_250_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['248'][1].init(281, 20, 'isPointerEvent(type)');
function visit37_248_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['244'][1].init(22, 36, 'self.isEventSimulatedFromTouch(type)');
function visit36_244_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['243'][1].init(84, 18, 'isMouseEvent(type)');
function visit35_243_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['231'][1].init(906, 5, 'i < l');
function visit34_231_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['224'][1].init(75, 25, 'self.touches.length === 1');
function visit33_224_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['222'][1].init(506, 20, 'isPointerEvent(type)');
function visit32_222_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['218'][1].init(22, 37, 'self.isEventSimulatedFromTouch(event)');
function visit31_218_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['217'][1].init(308, 18, 'isMouseEvent(type)');
function visit30_217_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['214'][1].init(158, 18, 'isTouchEvent(type)');
function visit29_214_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['199'][1].init(879, 10, 'touchEvent');
function visit28_199_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['194'][2].init(697, 22, 'touchList.length === 1');
function visit27_194_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['194'][1].init(684, 35, 'touchList && touchList.length === 1');
function visit26_194_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['189'][1].init(141, 18, 'isMouseEvent(type)');
function visit25_189_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['187'][1].init(22, 20, 'isPointerEvent(type)');
function visit24_187_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['182'][3].init(54, 22, 'type === \'touchcancel\'');
function visit23_182_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['182'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['182'][2].init(31, 19, 'type === \'touchend\'');
function visit22_182_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['182'][1].init(31, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit21_182_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['169'][3].init(215, 14, 'dy <= DUP_DIST');
function visit20_169_3(result) {
  _$jscoverage['/util/add-event.js'].branchData['169'][3].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['169'][2].init(197, 14, 'dx <= DUP_DIST');
function visit19_169_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['169'][1].init(197, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit18_169_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['165'][2].init(166, 5, 'i < l');
function visit17_165_2(result) {
  _$jscoverage['/util/add-event.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['165'][1].init(166, 21, 'i < l && (t = lts[i])');
function visit16_165_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['153'][1].init(72, 6, 'i > -1');
function visit15_153_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['147'][1].init(169, 22, 'this.isPrimaryTouch(t)');
function visit14_147_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['137'][1].init(18, 28, 'this.isPrimaryTouch(inTouch)');
function visit13_137_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['131'][1].init(18, 24, 'this.firstTouch === null');
function visit12_131_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['127'][1].init(21, 38, 'this.firstTouch === inTouch.identifier');
function visit11_127_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['120'][1].init(59, 29, 'touch.pointerId === pointerId');
function visit10_120_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['118'][1].init(201, 5, 'i < l');
function visit9_118_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['105'][1].init(59, 29, 'touch.pointerId === pointerId');
function visit8_105_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['103'][1].init(201, 5, 'i < l');
function visit7_103_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['86'][1].init(224, 33, '!isPointerEvent(gestureMoveEvent)');
function visit6_86_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['53'][1].init(1631, 30, 'Feature.isMsPointerSupported()');
function visit5_53_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['47'][1].init(1347, 28, 'Feature.isPointerSupported()');
function visit4_47_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['36'][1].init(14, 6, 'UA.ios');
function visit3_36_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['35'][1].init(838, 31, 'Feature.isTouchEventSupported()');
function visit2_35_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].branchData['27'][1].init(17, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit1_27_1(result) {
  _$jscoverage['/util/add-event.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/util/add-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/util/add-event.js'].functionData[0]++;
  _$jscoverage['/util/add-event.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/util/add-event.js'].lineData[8]++;
  var eventHandleMap = {};
  _$jscoverage['/util/add-event.js'].lineData[9]++;
  var UA = require('ua');
  _$jscoverage['/util/add-event.js'].lineData[10]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/util/add-event.js'].lineData[11]++;
  var Special = DomEvent.Special;
  _$jscoverage['/util/add-event.js'].lineData[12]++;
  var key = S.guid('touch-handle'), Feature = S.Feature, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/util/add-event.js'].lineData[18]++;
  function isTouchEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[1]++;
    _$jscoverage['/util/add-event.js'].lineData[19]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/util/add-event.js'].lineData[22]++;
  function isMouseEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[2]++;
    _$jscoverage['/util/add-event.js'].lineData[23]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/util/add-event.js'].lineData[26]++;
  function isPointerEvent(type) {
    _$jscoverage['/util/add-event.js'].functionData[3]++;
    _$jscoverage['/util/add-event.js'].lineData[27]++;
    return visit1_27_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/util/add-event.js'].lineData[31]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/util/add-event.js'].lineData[33]++;
  var DUP_DIST = 25;
  _$jscoverage['/util/add-event.js'].lineData[35]++;
  if (visit2_35_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/util/add-event.js'].lineData[36]++;
    if (visit3_36_1(UA.ios)) {
      _$jscoverage['/util/add-event.js'].lineData[38]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/util/add-event.js'].lineData[39]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/util/add-event.js'].lineData[40]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/util/add-event.js'].lineData[42]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/util/add-event.js'].lineData[44]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/util/add-event.js'].lineData[45]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/util/add-event.js'].lineData[47]++;
    if (visit4_47_1(Feature.isPointerSupported())) {
      _$jscoverage['/util/add-event.js'].lineData[50]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/util/add-event.js'].lineData[51]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/util/add-event.js'].lineData[52]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/util/add-event.js'].lineData[53]++;
      if (visit5_53_1(Feature.isMsPointerSupported())) {
        _$jscoverage['/util/add-event.js'].lineData[54]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/util/add-event.js'].lineData[55]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/util/add-event.js'].lineData[56]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/util/add-event.js'].lineData[58]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/util/add-event.js'].lineData[59]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/util/add-event.js'].lineData[60]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[63]++;
  function DocumentHandler(doc) {
    _$jscoverage['/util/add-event.js'].functionData[4]++;
    _$jscoverage['/util/add-event.js'].lineData[64]++;
    var self = this;
    _$jscoverage['/util/add-event.js'].lineData[65]++;
    self.doc = doc;
    _$jscoverage['/util/add-event.js'].lineData[66]++;
    self.eventHandles = [];
    _$jscoverage['/util/add-event.js'].lineData[67]++;
    self.init();
    _$jscoverage['/util/add-event.js'].lineData[69]++;
    self.touches = [];
    _$jscoverage['/util/add-event.js'].lineData[71]++;
    self.inTouch = 0;
  }
  _$jscoverage['/util/add-event.js'].lineData[74]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/util/add-event.js'].functionData[5]++;
  _$jscoverage['/util/add-event.js'].lineData[82]++;
  var self = this, doc = self.doc;
  _$jscoverage['/util/add-event.js'].lineData[84]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/util/add-event.js'].lineData[86]++;
  if (visit6_86_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/util/add-event.js'].lineData[87]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/util/add-event.js'].lineData[89]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[6]++;
  _$jscoverage['/util/add-event.js'].lineData[93]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/util/add-event.js'].lineData[94]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[7]++;
  _$jscoverage['/util/add-event.js'].lineData[98]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/util/add-event.js'].lineData[103]++;
  for (; visit7_103_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[104]++;
    touch = touches[i];
    _$jscoverage['/util/add-event.js'].lineData[105]++;
    if (visit8_105_1(touch.pointerId === pointerId)) {
      _$jscoverage['/util/add-event.js'].lineData[106]++;
      touches.splice(i, 1);
      _$jscoverage['/util/add-event.js'].lineData[107]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/util/add-event.js'].functionData[8]++;
  _$jscoverage['/util/add-event.js'].lineData[113]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/util/add-event.js'].lineData[118]++;
  for (; visit9_118_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[119]++;
    touch = touches[i];
    _$jscoverage['/util/add-event.js'].lineData[120]++;
    if (visit10_120_1(touch.pointerId === pointerId)) {
      _$jscoverage['/util/add-event.js'].lineData[121]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[9]++;
  _$jscoverage['/util/add-event.js'].lineData[127]++;
  return visit11_127_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[10]++;
  _$jscoverage['/util/add-event.js'].lineData[131]++;
  if (visit12_131_1(this.firstTouch === null)) {
    _$jscoverage['/util/add-event.js'].lineData[132]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/util/add-event.js'].functionData[11]++;
  _$jscoverage['/util/add-event.js'].lineData[137]++;
  if (visit13_137_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/util/add-event.js'].lineData[138]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/util/add-event.js'].functionData[12]++;
  _$jscoverage['/util/add-event.js'].lineData[144]++;
  var lts = this.lastTouches;
  _$jscoverage['/util/add-event.js'].lineData[145]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/util/add-event.js'].lineData[147]++;
  if (visit14_147_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/util/add-event.js'].lineData[149]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/util/add-event.js'].lineData[150]++;
    lts.push(lt);
    _$jscoverage['/util/add-event.js'].lineData[151]++;
    setTimeout(function() {
  _$jscoverage['/util/add-event.js'].functionData[13]++;
  _$jscoverage['/util/add-event.js'].lineData[152]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/util/add-event.js'].lineData[153]++;
  if (visit15_153_1(i > -1)) {
    _$jscoverage['/util/add-event.js'].lineData[154]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/util/add-event.js'].functionData[14]++;
  _$jscoverage['/util/add-event.js'].lineData[162]++;
  var lts = this.lastTouches;
  _$jscoverage['/util/add-event.js'].lineData[163]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/util/add-event.js'].lineData[165]++;
  for (var i = 0, l = lts.length, t; visit16_165_1(visit17_165_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/util/add-event.js'].lineData[167]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/util/add-event.js'].lineData[169]++;
    if (visit18_169_1(visit19_169_2(dx <= DUP_DIST) && visit20_169_3(dy <= DUP_DIST))) {
      _$jscoverage['/util/add-event.js'].lineData[170]++;
      return true;
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[173]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/util/add-event.js'].functionData[15]++;
  _$jscoverage['/util/add-event.js'].lineData[177]++;
  var type = e.type, notUp, touchEvent, touchList;
  _$jscoverage['/util/add-event.js'].lineData[181]++;
  if ((touchEvent = isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[182]++;
    touchList = (visit21_182_1(visit22_182_2(type === 'touchend') || visit23_182_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/util/add-event.js'].lineData[185]++;
    e.gestureType = 'touch';
  } else {
    _$jscoverage['/util/add-event.js'].lineData[187]++;
    if (visit24_187_1(isPointerEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[188]++;
      e.gestureType = e.originalEvent.pointerType;
    } else {
      _$jscoverage['/util/add-event.js'].lineData[189]++;
      if (visit25_189_1(isMouseEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[190]++;
        e.gestureType = 'mouse';
      }
    }
    _$jscoverage['/util/add-event.js'].lineData[192]++;
    touchList = this.touches;
  }
  _$jscoverage['/util/add-event.js'].lineData[194]++;
  if (visit26_194_1(touchList && visit27_194_2(touchList.length === 1))) {
    _$jscoverage['/util/add-event.js'].lineData[195]++;
    e.which = 1;
    _$jscoverage['/util/add-event.js'].lineData[196]++;
    e.pageX = touchList[0].pageX;
    _$jscoverage['/util/add-event.js'].lineData[197]++;
    e.pageY = touchList[0].pageY;
  }
  _$jscoverage['/util/add-event.js'].lineData[199]++;
  if (visit28_199_1(touchEvent)) {
    _$jscoverage['/util/add-event.js'].lineData[200]++;
    return e;
  }
  _$jscoverage['/util/add-event.js'].lineData[202]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/util/add-event.js'].lineData[203]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/util/add-event.js'].lineData[204]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/util/add-event.js'].lineData[205]++;
  e.changedTouches = touchList;
  _$jscoverage['/util/add-event.js'].lineData[206]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[16]++;
  _$jscoverage['/util/add-event.js'].lineData[210]++;
  var e, h, self = this, type = event.type, eventHandles = self.eventHandles;
  _$jscoverage['/util/add-event.js'].lineData[214]++;
  if (visit29_214_1(isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[215]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/util/add-event.js'].lineData[216]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/util/add-event.js'].lineData[217]++;
    if (visit30_217_1(isMouseEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[218]++;
      if (visit31_218_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/util/add-event.js'].lineData[219]++;
        return;
      }
      _$jscoverage['/util/add-event.js'].lineData[221]++;
      self.touches = [event];
    } else {
      _$jscoverage['/util/add-event.js'].lineData[222]++;
      if (visit32_222_1(isPointerEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[223]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/util/add-event.js'].lineData[224]++;
        if (visit33_224_1(self.touches.length === 1)) {
          _$jscoverage['/util/add-event.js'].lineData[225]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/util/add-event.js'].lineData[228]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[231]++;
  for (var i = 0, l = eventHandles.length; visit34_231_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[232]++;
    e = eventHandles[i];
    _$jscoverage['/util/add-event.js'].lineData[233]++;
    h = eventHandles[e].handle;
    _$jscoverage['/util/add-event.js'].lineData[234]++;
    h.isActive = 1;
  }
  _$jscoverage['/util/add-event.js'].lineData[237]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[17]++;
  _$jscoverage['/util/add-event.js'].lineData[241]++;
  var self = this, type = event.type;
  _$jscoverage['/util/add-event.js'].lineData[243]++;
  if (visit35_243_1(isMouseEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[244]++;
    if (visit36_244_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/util/add-event.js'].lineData[245]++;
      return;
    }
    _$jscoverage['/util/add-event.js'].lineData[247]++;
    self.touches = [event];
  } else {
    _$jscoverage['/util/add-event.js'].lineData[248]++;
    if (visit37_248_1(isPointerEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[249]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/util/add-event.js'].lineData[250]++;
      if (visit38_250_1(!isTouchEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[251]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[254]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[18]++;
  _$jscoverage['/util/add-event.js'].lineData[258]++;
  var self = this, type = event.type;
  _$jscoverage['/util/add-event.js'].lineData[260]++;
  if (visit39_260_1(isMouseEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[261]++;
    if (visit40_261_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/util/add-event.js'].lineData[262]++;
      return;
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[266]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/util/add-event.js'].lineData[267]++;
  if (visit41_267_1(isTouchEvent(type))) {
    _$jscoverage['/util/add-event.js'].lineData[268]++;
    self.dupMouse(event);
    _$jscoverage['/util/add-event.js'].lineData[269]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/util/add-event.js'].functionData[19]++;
  _$jscoverage['/util/add-event.js'].lineData[270]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/util/add-event.js'].lineData[272]++;
    if (visit42_272_1(isMouseEvent(type))) {
      _$jscoverage['/util/add-event.js'].lineData[273]++;
      self.touches = [];
    } else {
      _$jscoverage['/util/add-event.js'].lineData[274]++;
      if (visit43_274_1(isPointerEvent(type))) {
        _$jscoverage['/util/add-event.js'].lineData[275]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/util/add-event.js'].lineData[276]++;
        if (visit44_276_1(!self.touches.length)) {
          _$jscoverage['/util/add-event.js'].lineData[277]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/util/add-event.js'].functionData[20]++;
  _$jscoverage['/util/add-event.js'].lineData[283]++;
  var self = this, eventHandles = self.eventHandles, handleArray = eventHandles.concat(), e, h;
  _$jscoverage['/util/add-event.js'].lineData[288]++;
  event = self.normalize(event);
  _$jscoverage['/util/add-event.js'].lineData[289]++;
  var gestureType = event.gestureType;
  _$jscoverage['/util/add-event.js'].lineData[291]++;
  if (visit45_291_1(!event.changedTouches.length)) {
    _$jscoverage['/util/add-event.js'].lineData[292]++;
    return;
  }
  _$jscoverage['/util/add-event.js'].lineData[294]++;
  for (var i = 0, l = handleArray.length; visit46_294_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[295]++;
    e = handleArray[i];
    _$jscoverage['/util/add-event.js'].lineData[296]++;
    if (visit47_296_1(eventHandles[e])) {
      _$jscoverage['/util/add-event.js'].lineData[298]++;
      h = eventHandles[e].handle;
      _$jscoverage['/util/add-event.js'].lineData[301]++;
      if (visit48_301_1(h.requiredGestureType && visit49_301_2(gestureType !== h.requiredGestureType))) {
        _$jscoverage['/util/add-event.js'].lineData[302]++;
        continue;
      }
      _$jscoverage['/util/add-event.js'].lineData[305]++;
      if (visit50_305_1(h.processed)) {
        _$jscoverage['/util/add-event.js'].lineData[306]++;
        continue;
      }
      _$jscoverage['/util/add-event.js'].lineData[308]++;
      h.processed = 1;
      _$jscoverage['/util/add-event.js'].lineData[309]++;
      if (visit51_309_1(h.isActive && visit52_309_2(h[method] && visit53_309_3(h[method](event) === false)))) {
        _$jscoverage['/util/add-event.js'].lineData[310]++;
        h.isActive = 0;
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[315]++;
  for (i = 0 , l = handleArray.length; visit54_315_1(i < l); i++) {
    _$jscoverage['/util/add-event.js'].lineData[316]++;
    e = eventHandles[i];
    _$jscoverage['/util/add-event.js'].lineData[317]++;
    if (visit55_317_1(eventHandles[e])) {
      _$jscoverage['/util/add-event.js'].lineData[318]++;
      h = eventHandles[e].handle;
      _$jscoverage['/util/add-event.js'].lineData[319]++;
      h.processed = 0;
    }
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[21]++;
  _$jscoverage['/util/add-event.js'].lineData[325]++;
  var self = this, eventHandles = self.eventHandles, handle = eventHandleMap[event].handle;
  _$jscoverage['/util/add-event.js'].lineData[328]++;
  if (visit56_328_1(eventHandles[event])) {
    _$jscoverage['/util/add-event.js'].lineData[329]++;
    eventHandles[event].count++;
  } else {
    _$jscoverage['/util/add-event.js'].lineData[331]++;
    eventHandles.push(event);
    _$jscoverage['/util/add-event.js'].lineData[332]++;
    self.sortEventHandles();
    _$jscoverage['/util/add-event.js'].lineData[333]++;
    eventHandles[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  sortEventHandles: function() {
  _$jscoverage['/util/add-event.js'].functionData[22]++;
  _$jscoverage['/util/add-event.js'].lineData[341]++;
  this.eventHandles.sort(function(e1, e2) {
  _$jscoverage['/util/add-event.js'].functionData[23]++;
  _$jscoverage['/util/add-event.js'].lineData[342]++;
  var e1Config = eventHandleMap[e1];
  _$jscoverage['/util/add-event.js'].lineData[343]++;
  var e2Config = eventHandleMap[e2];
  _$jscoverage['/util/add-event.js'].lineData[344]++;
  return e1Config.order - e2Config.order;
});
}, 
  removeEventHandle: function(event) {
  _$jscoverage['/util/add-event.js'].functionData[24]++;
  _$jscoverage['/util/add-event.js'].lineData[349]++;
  var eventHandles = this.eventHandles;
  _$jscoverage['/util/add-event.js'].lineData[350]++;
  if (visit57_350_1(eventHandles[event])) {
    _$jscoverage['/util/add-event.js'].lineData[351]++;
    eventHandles[event].count--;
    _$jscoverage['/util/add-event.js'].lineData[352]++;
    if (visit58_352_1(!eventHandles[event].count)) {
      _$jscoverage['/util/add-event.js'].lineData[353]++;
      eventHandles.splice(S.indexOf(event, eventHandles), 1);
      _$jscoverage['/util/add-event.js'].lineData[354]++;
      delete eventHandles[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/util/add-event.js'].functionData[25]++;
  _$jscoverage['/util/add-event.js'].lineData[360]++;
  var self = this, doc = self.doc;
  _$jscoverage['/util/add-event.js'].lineData[362]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/util/add-event.js'].lineData[363]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/util/add-event.js'].lineData[364]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/util/add-event.js'].lineData[368]++;
  function setup(event) {
    _$jscoverage['/util/add-event.js'].functionData[26]++;
    _$jscoverage['/util/add-event.js'].lineData[369]++;
    addDocumentHandle(this, event);
  }
  _$jscoverage['/util/add-event.js'].lineData[372]++;
  function tearDown(event) {
    _$jscoverage['/util/add-event.js'].functionData[27]++;
    _$jscoverage['/util/add-event.js'].lineData[373]++;
    removeDocumentHandle(this, event);
  }
  _$jscoverage['/util/add-event.js'].lineData[376]++;
  function setupExtra(event) {
    _$jscoverage['/util/add-event.js'].functionData[28]++;
    _$jscoverage['/util/add-event.js'].lineData[377]++;
    setup.call(this, event);
    _$jscoverage['/util/add-event.js'].lineData[378]++;
    eventHandleMap[event].setup.apply(this, arguments);
  }
  _$jscoverage['/util/add-event.js'].lineData[381]++;
  function tearDownExtra(event) {
    _$jscoverage['/util/add-event.js'].functionData[29]++;
    _$jscoverage['/util/add-event.js'].lineData[382]++;
    tearDown.call(this, event);
    _$jscoverage['/util/add-event.js'].lineData[383]++;
    eventHandleMap[event].tearDown.apply(this, arguments);
  }
  _$jscoverage['/util/add-event.js'].lineData[386]++;
  function addDocumentHandle(el, event) {
    _$jscoverage['/util/add-event.js'].functionData[30]++;
    _$jscoverage['/util/add-event.js'].lineData[387]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/util/add-event.js'].lineData[389]++;
    if (visit59_389_1(!handle)) {
      _$jscoverage['/util/add-event.js'].lineData[390]++;
      Dom.data(doc, key, handle = new DocumentHandler(doc));
    }
    _$jscoverage['/util/add-event.js'].lineData[392]++;
    if (visit60_392_1(event)) {
      _$jscoverage['/util/add-event.js'].lineData[393]++;
      handle.addEventHandle(event);
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[397]++;
  function removeDocumentHandle(el, event) {
    _$jscoverage['/util/add-event.js'].functionData[31]++;
    _$jscoverage['/util/add-event.js'].lineData[398]++;
    var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
    _$jscoverage['/util/add-event.js'].lineData[400]++;
    if (visit61_400_1(handle)) {
      _$jscoverage['/util/add-event.js'].lineData[401]++;
      if (visit62_401_1(event)) {
        _$jscoverage['/util/add-event.js'].lineData[402]++;
        handle.removeEventHandle(event);
      }
      _$jscoverage['/util/add-event.js'].lineData[404]++;
      if (visit63_404_1(!handle.eventHandles.length)) {
        _$jscoverage['/util/add-event.js'].lineData[405]++;
        handle.destroy();
        _$jscoverage['/util/add-event.js'].lineData[406]++;
        Dom.removeData(doc, key);
      }
    }
  }
  _$jscoverage['/util/add-event.js'].lineData[411]++;
  return function(events, config) {
  _$jscoverage['/util/add-event.js'].functionData[32]++;
  _$jscoverage['/util/add-event.js'].lineData[412]++;
  if (visit64_412_1(typeof events === 'string')) {
    _$jscoverage['/util/add-event.js'].lineData[413]++;
    events = [events];
  }
  _$jscoverage['/util/add-event.js'].lineData[415]++;
  S.each(events, function(event) {
  _$jscoverage['/util/add-event.js'].functionData[33]++;
  _$jscoverage['/util/add-event.js'].lineData[416]++;
  var specialEvent = {};
  _$jscoverage['/util/add-event.js'].lineData[417]++;
  specialEvent.setup = config.setup ? setupExtra : setup;
  _$jscoverage['/util/add-event.js'].lineData[418]++;
  specialEvent.tearDown = config.tearDown ? tearDownExtra : tearDown;
  _$jscoverage['/util/add-event.js'].lineData[419]++;
  specialEvent.add = config.add;
  _$jscoverage['/util/add-event.js'].lineData[420]++;
  specialEvent.remove = config.remove;
  _$jscoverage['/util/add-event.js'].lineData[421]++;
  config.order = visit65_421_1(config.order || 100);
  _$jscoverage['/util/add-event.js'].lineData[423]++;
  eventHandleMap[event] = config;
  _$jscoverage['/util/add-event.js'].lineData[424]++;
  Special[event] = specialEvent;
});
};
});
