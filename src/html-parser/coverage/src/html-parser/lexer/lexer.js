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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[90] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[194] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[299] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[332] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[337] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[416] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[426] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[440] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[448] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[477] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[486] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[489] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[499] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[501] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[502] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[614] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[617] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[619] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[648] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[687] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[710] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[725] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[730] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[760] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[770] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[771] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[775] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['18'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['90'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['91'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['242'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['251'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['279'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['312'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['416'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['506'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['509'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['509'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['594'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['617'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['617'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['698'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['700'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['702'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['702'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['704'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['706'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['706'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1].init(207, 9, '\'>\' == ch');
function visit166_708_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['706'][1].init(100, 8, '-1 == ch');
function visit165_706_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['706'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['704'][1].init(191, 9, '\'-\' == ch');
function visit164_704_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['702'][1].init(92, 8, '-1 == ch');
function visit163_702_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['702'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['700'][1].init(175, 9, '\'-\' == ch');
function visit162_700_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['698'][1].init(84, 8, '-1 == ch');
function visit161_698_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1].init(175, 18, 'Utils.isLetter(ch)');
function visit160_684_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1].init(84, 8, '-1 == ch');
function visit159_682_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].init(223, 9, '\'-\' == ch');
function visit158_666_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].init(108, 8, '-1 == ch');
function visit157_664_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].init(215, 9, '\'-\' == ch');
function visit156_662_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].init(108, 8, '-1 == ch');
function visit155_660_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][3].init(996, 115, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit154_648_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][2].init(996, 258, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit153_648_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1].init(983, 310, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit152_648_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1].init(42, 11, '\'\' == quote');
function visit151_618_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['617'][1].init(46, 10, 'quoteSmart');
function visit150_617_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['617'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][3].init(613, 9, '\'/\' != ch');
function visit149_605_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][2].init(599, 8, '-1 != ch');
function visit148_605_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][1].init(551, 24, '(-1 != ch) && (\'/\' != ch)');
function visit147_605_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['605'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1].init(350, 9, 'ch == \'*\'');
function visit146_602_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['602'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][3].init(207, 9, '\'*\' != ch');
function visit145_600_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][2].init(193, 8, '-1 != ch');
function visit144_600_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1].init(141, 24, '(-1 != ch) && (\'*\' != ch)');
function visit143_600_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['600'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1].init(468, 9, '\'*\' == ch');
function visit142_596_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['594'][1].init(341, 9, '\'/\' == ch');
function visit141_594_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1].init(218, 8, '-1 == ch');
function visit140_592_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].init(42, 11, '\'\' == quote');
function visit139_589_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].init(46, 10, 'quoteSmart');
function visit138_588_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][3].init(292, 11, 'ch != quote');
function visit137_580_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][2].init(276, 10, 'ch != \'\\\\\'');
function visit136_580_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1].init(276, 28, '(ch != \'\\\\\') && (ch != quote)');
function visit135_580_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1].init(152, 8, '-1 == ch');
function visit134_578_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].init(42, 11, '\'\' != quote');
function visit133_576_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1].init(47, 10, 'quoteSmart');
function visit132_575_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1].init(182, 12, '\'"\' == quote');
function visit131_569_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].init(42, 11, '\'\' == quote');
function visit130_567_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].init(46, 22, 'quoteSmart && !comment');
function visit129_566_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].init(183, 13, '\'\\\'\' == quote');
function visit128_560_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].init(42, 11, '\'\' == quote');
function visit127_558_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1].init(47, 22, 'quoteSmart && !comment');
function visit126_557_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['509'][1].init(81, 9, '\'?\' == ch');
function visit125_509_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['509'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][2].init(342, 9, '\'!\' == ch');
function visit124_507_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][1].init(46, 91, '\'!\' == ch || \'?\' == ch');
function visit123_507_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['507'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['506'][1].init(37, 138, 'Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit122_506_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][2].init(254, 9, '\'/\' == ch');
function visit121_505_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][1].init(254, 176, '\'/\' == ch || Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit120_505_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1].init(74, 8, '-1 == ch');
function visit119_501_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][3].init(2402, 9, '\'<\' == ch');
function visit118_499_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][2].init(2386, 10, '0 == quote');
function visit117_499_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].init(2386, 26, '(0 == quote) && (\'<\' == ch)');
function visit116_499_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][3].init(481, 9, '\'/\' != ch');
function visit115_493_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][2].init(467, 8, '-1 != ch');
function visit114_493_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][1].init(439, 24, '(-1 != ch) && (\'/\' != ch)');
function visit113_493_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].init(250, 9, 'ch == \'*\'');
function visit112_489_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][3].init(149, 9, '\'*\' != ch');
function visit111_487_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].init(135, 8, '-1 != ch');
function visit110_487_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].init(103, 24, '(-1 != ch) && (\'*\' != ch)');
function visit109_487_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].init(571, 9, '\'*\' == ch');
function visit108_482_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].init(137, 10, '\'\\n\' != ch');
function visit107_480_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].init(123, 8, '-1 != ch');
function visit106_480_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1].init(95, 25, '(-1 != ch) && (\'\\n\' != ch)');
function visit105_480_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].init(355, 9, '\'/\' == ch');
function visit104_477_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1].init(254, 8, '-1 == ch');
function visit103_474_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][4].init(1129, 9, 'ch == \'/\'');
function visit102_469_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].init(1113, 10, '0 == quote');
function visit101_469_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].init(1113, 26, '(0 == quote) && (ch == \'/\')');
function visit100_469_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(1098, 41, 'quoteSmart && (0 == quote) && (ch == \'/\')');
function visit99_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][2].init(983, 11, 'ch == quote');
function visit98_466_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][1].init(968, 27, 'quoteSmart && (ch == quote)');
function visit97_466_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].init(61, 11, 'ch != quote');
function visit96_460_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].init(141, 10, '\'\\\\\' != ch');
function visit95_459_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].init(38, 74, '(\'\\\\\' != ch) && (ch != quote)');
function visit94_459_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][2].init(100, 8, '-1 != ch');
function visit93_458_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].init(100, 113, '(-1 != ch) && (\'\\\\\' != ch) && (ch != quote)');
function visit92_458_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][4].init(448, 10, '\'\\\\\' == ch');
function visit91_456_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][3].init(432, 10, '0 != quote');
function visit90_456_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][2].init(432, 27, '(0 != quote) && (\'\\\\\' == ch)');
function visit89_456_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1].init(417, 42, 'quoteSmart && (0 != quote) && (\'\\\\\' == ch)');
function visit88_456_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3].init(53, 9, '\'"\' == ch');
function visit87_452_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].init(37, 10, '\'\\\'\' == ch');
function visit86_452_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].init(37, 26, '(\'\\\'\' == ch) || (\'"\' == ch)');
function visit85_452_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][3].init(170, 10, '0 == quote');
function visit84_451_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2].init(170, 65, '(0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit83_451_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1].init(155, 80, 'quoteSmart && (0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit82_451_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1].init(66, 8, '-1 == ch');
function visit81_448_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['416'][1].init(199, 22, 'Utils.isWhitespace(ch)');
function visit80_416_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].init(70, 9, '\'>\' == ch');
function visit79_413_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].init(81, 9, '\'-\' == ch');
function visit78_405_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].init(207, 8, '-1 == ch');
function visit77_400_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'][1].init(80, 9, '\'-\' == ch');
function visit76_397_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].init(309, 9, '\'>\' == ch');
function visit75_384_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'][1].init(169, 8, '-1 == ch');
function visit74_381_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].init(78, 9, '\'-\' == ch');
function visit73_378_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1].init(167, 9, '\'-\' == ch');
function visit72_372_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1].init(77, 9, '\'>\' == ch');
function visit71_370_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1].init(66, 8, '-1 == ch');
function visit70_364_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].init(623, 9, '\'=\' == ch');
function visit69_315_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['312'][1].init(495, 22, 'Utils.isWhitespace(ch)');
function visit68_312_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1].init(144, 8, '-1 == ch');
function visit67_305_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1].init(276, 9, '\'"\' == ch');
function visit66_294_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1].init(76, 8, '-1 == ch');
function visit65_290_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].init(276, 10, '\'\\\'\' == ch');
function visit64_283_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['279'][1].init(76, 8, '-1 == ch');
function visit63_279_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].init(265, 22, 'Utils.isWhitespace(ch)');
function visit62_272_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3].init(83, 9, '\'>\' == ch');
function visit61_268_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2].init(69, 8, '-1 == ch');
function visit60_268_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].init(69, 24, '(-1 == ch) || (\'>\' == ch)');
function visit59_268_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1].init(599, 22, 'Utils.isWhitespace(ch)');
function visit58_259_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1].init(426, 9, '\'"\' == ch');
function visit57_255_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['251'][1].init(252, 10, '\'\\\'\' == ch');
function visit56_251_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][3].init(65, 9, '\'>\' == ch');
function visit55_247_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][2].init(51, 8, '-1 == ch');
function visit54_247_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1].init(51, 24, '(-1 == ch) || (\'>\' == ch)');
function visit53_247_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['242'][1].init(986, 9, '\'=\' == ch');
function visit52_242_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1].init(581, 22, 'Utils.isWhitespace(ch)');
function visit51_236_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1].init(34, 9, '\'<\' == ch');
function visit50_228_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][5].init(116, 9, '\'<\' == ch');
function visit49_227_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][4].init(101, 9, '\'>\' == ch');
function visit48_227_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][3].init(101, 25, '(\'>\' == ch) || (\'<\' == ch)');
function visit47_227_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][2].init(87, 8, '-1 == ch');
function visit46_227_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][1].init(87, 39, '(-1 == ch) || (\'>\' == ch) || (\'<\' == ch)');
function visit45_227_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][2].init(441, 9, 'ch == "/"');
function visit44_219_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1].init(441, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit43_219_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2].init(81, 9, 'ch == "/"');
function visit42_214_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].init(81, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit41_214_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].init(90, 18, '!attributes.length');
function visit40_212_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1].init(34, 9, '\'<\' == ch');
function visit39_204_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][5].init(114, 9, '\'<\' == ch');
function visit38_203_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][4].init(101, 9, '\'>\' == ch');
function visit37_203_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][3].init(101, 22, '\'>\' == ch || \'<\' == ch');
function visit36_203_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][2].init(89, 8, 'ch == -1');
function visit35_203_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][1].init(89, 34, 'ch == -1 || \'>\' == ch || \'<\' == ch');
function visit34_203_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][3].init(36, 9, 'ch === -1');
function visit33_182_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][2].init(36, 30, 'ch === -1 && attributes.length');
function visit32_182_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][1].init(26, 40, 'strict && ch === -1 && attributes.length');
function visit31_182_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1].init(340, 6, 'strict');
function visit30_180_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].init(92, 10, '2 > length');
function visit29_131_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].init(100, 11, '0 != length');
function visit28_130_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].init(80, 5, 'l > 0');
function visit27_120_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['106'][1].init(80, 5, 'l > 0');
function visit26_106_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['91'][1].init(92, 10, '2 > length');
function visit25_91_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['90'][1].init(85, 11, '0 != length');
function visit24_90_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].init(124, 9, '\'-\' == ch');
function visit23_62_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1].init(34, 9, '\'>\' == ch');
function visit22_58_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].init(82, 8, 'ch == -1');
function visit21_55_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][3].init(382, 9, '\'?\' == ch');
function visit20_53_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][2].init(369, 9, '\'!\' == ch');
function visit19_53_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1].init(369, 22, '\'!\' == ch || \'?\' == ch');
function visit18_53_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][2].init(199, 9, 'ch == \'/\'');
function visit17_50_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][1].init(199, 31, 'ch == \'/\' || Utils.isLetter(ch)');
function visit16_50_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1].init(82, 8, 'ch == -1');
function visit15_48_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['18'][1].init(155, 9, 'cfg || {}');
function visit14_18_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].lineData[6]++;
KISSY.add("html-parser/lexer/lexer", function(S, Cursor, Page, TextNode, CData, Utils, Attribute, TagNode, CommentNode) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[13]++;
  function Lexer(text, cfg) {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14]++;
    var self = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[15]++;
    self.page = new Page(text);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[16]++;
    self.cursor = new Cursor();
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[17]++;
    self.nodeFactory = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[18]++;
    this.cfg = visit14_18_1(cfg || {});
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[21]++;
  Lexer.prototype = {
  constructor: Lexer, 
  setPosition: function(p) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25]++;
  this.cursor.position = p;
}, 
  getPosition: function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[29]++;
  return this.cursor.position;
}, 
  nextNode: function(quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33]++;
  var start, ch, ret, cursor = this.cursor, page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39]++;
  start = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[40]++;
  ch = page.getChar(cursor);
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42]++;
  switch (ch) {
    case -1:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44]++;
      ret = null;
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45]++;
      break;
    case '<':
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47]++;
      ch = page.getChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48]++;
      if (visit15_48_1(ch == -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50]++;
        if (visit16_50_1(visit17_50_2(ch == '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[51]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53]++;
          if (visit18_53_1(visit19_53_2('!' == ch) || visit20_53_3('?' == ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55]++;
            if (visit21_55_1(ch == -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58]++;
              if (visit22_58_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62]++;
                if (visit23_62_1('-' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63]++;
                  ret = this.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
                  ret = this.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[74]++;
            ret = this.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[78]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[79]++;
      ret = this.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[80]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83]++;
  return (ret);
}, 
  makeComment: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[89]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[90]++;
  if (visit24_90_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[91]++;
    if (visit25_91_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[95]++;
    ret = this.nodeFactory.createCommentNode(this.page, start, end);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[104]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[106]++;
  if (visit26_106_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[107]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[118]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120]++;
  if (visit27_120_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[127]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130]++;
  if (visit28_130_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131]++;
    if (visit29_131_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[135]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[140]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[144]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[148]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[152]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[156]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[170]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180]++;
  if (visit30_180_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[182]++;
  if (visit31_182_1(strict && visit32_182_2(visit33_182_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[194]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[200]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203]++;
        if (visit34_203_1(visit35_203_2(ch == -1) || visit36_203_3(visit37_203_4('>' == ch) || visit38_203_5('<' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204]++;
          if (visit39_204_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212]++;
          if (visit40_212_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214]++;
            if (visit41_214_1(visit42_214_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219]++;
            if (visit43_219_1(visit44_219_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[227]++;
        if (visit45_227_1((visit46_227_2(-1 == ch)) || visit47_227_3((visit48_227_4('>' == ch)) || (visit49_227_5('<' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228]++;
          if (visit50_228_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236]++;
          if (visit51_236_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242]++;
            if (visit52_242_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247]++;
        if (visit53_247_1((visit54_247_2(-1 == ch)) || (visit55_247_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251]++;
          if (visit56_251_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255]++;
            if (visit57_255_1('"' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
              if (visit58_259_1(Utils.isWhitespace(ch))) {
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
        if (visit59_268_1((visit60_268_2(-1 == ch)) || (visit61_268_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272]++;
          if (visit62_272_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
        if (visit63_279_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280]++;
          this.single_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
          if (visit64_283_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
            this.single_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
        if (visit65_290_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
          this.double_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
          if (visit66_294_1('"' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295]++;
            this.double_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[299]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305]++;
        if (visit67_305_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312]++;
          if (visit68_312_1(Utils.isWhitespace(ch))) {
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315]++;
            if (visit69_315_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[317]++;
              bookmarks[2] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318]++;
              bookmarks[3] = bookmarks[7];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[332]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334]++;
        throw new Error("how ** did we get in state " + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[337]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
    if (visit70_364_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
          if (visit71_370_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
            done = true;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
          if (visit72_372_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
            state = 1;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
          if (visit73_378_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
            if (visit74_381_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
              if (visit75_384_1('>' == ch)) {
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
          if (visit76_397_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400]++;
            if (visit77_400_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
          if (visit78_405_1('-' == ch)) {
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
          if (visit79_413_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[416]++;
            if (visit80_416_1(Utils.isWhitespace(ch))) {
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[426]++;
          throw new Error("how ** did we get in state " + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[440]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[448]++;
    if (visit81_448_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451]++;
      if (visit82_451_1(quoteSmart && visit83_451_2((visit84_451_3(0 == quote)) && (visit85_452_1((visit86_452_2('\'' == ch)) || (visit87_452_3('"' == ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456]++;
        if (visit88_456_1(quoteSmart && visit89_456_2((visit90_456_3(0 != quote)) && (visit91_456_4('\\' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
          if (visit92_458_1((visit93_458_2(-1 != ch)) && visit94_459_1((visit95_459_2('\\' != ch)) && (visit96_460_1(ch != quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466]++;
          if (visit97_466_1(quoteSmart && (visit98_466_2(ch == quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469]++;
            if (visit99_469_1(quoteSmart && visit100_469_2((visit101_469_3(0 == quote)) && (visit102_469_4(ch == '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474]++;
              if (visit103_474_1(-1 == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[477]++;
                if (visit104_477_1('/' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479]++;
                    ch = page.getChar(cursor);
                  } while (visit105_480_1((visit106_480_2(-1 != ch)) && (visit107_480_3('\n' != ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
                  if (visit108_482_1('*' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[486]++;
                        ch = page.getChar(cursor);
                      } while (visit109_487_1((visit110_487_2(-1 != ch)) && (visit111_487_3('*' != ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[489]++;
                      if (visit112_489_1(ch == '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit113_493_1((visit114_493_2(-1 != ch)) && (visit115_493_3('/' != ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[499]++;
              if (visit116_499_1((visit117_499_2(0 == quote)) && (visit118_499_3('<' == ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[501]++;
                if (visit119_501_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[502]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505]++;
                  if (visit120_505_1(visit121_505_2('/' == ch) || visit122_506_1(Utils.isLetter(ch) || visit123_507_1(visit124_507_2('!' == ch) || visit125_509_1('?' == ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557]++;
            if (visit126_557_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558]++;
              if (visit127_558_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
                if (visit128_560_1('\'' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
            if (visit129_566_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
              if (visit130_567_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                if (visit131_569_1('"' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575]++;
            if (visit132_575_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576]++;
              if (visit133_576_1('' != quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578]++;
                if (visit134_578_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580]++;
                  if (visit135_580_1((visit136_580_2(ch != '\\')) && (visit137_580_3(ch != quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588]++;
            if (visit138_588_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
              if (visit139_589_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
                if (visit140_592_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594]++;
                  if (visit141_594_1('/' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
                    if (visit142_596_1('*' == ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit143_600_1((visit144_600_2(-1 != ch)) && (visit145_600_3('*' != ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602]++;
                        if (visit146_602_1(ch == '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit147_605_1((visit148_605_2(-1 != ch)) && (visit149_605_3('/' != ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[614]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[617]++;
            if (visit150_617_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618]++;
              if (visit151_618_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[619]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[648]++;
            if (visit152_648_1(!tagName || (visit153_648_2(visit154_648_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660]++;
            if (visit155_660_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
              if (visit156_662_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664]++;
                if (visit157_664_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666]++;
                  if (visit158_666_1('-' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
        if (visit159_682_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
          if (visit160_684_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[687]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[689]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698]++;
        if (visit161_698_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700]++;
          if (visit162_700_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[702]++;
            if (visit163_702_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[704]++;
              if (visit164_704_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
                if (visit165_706_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708]++;
                  if (visit166_708_1('>' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[710]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[713]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718]++;
                mPage.ungetChar(mCursor);
              }
            }
          } else {
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[725]++;
        throw new Error("unexpected " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[730]++;
  return this.makeCData(start, end);
}, 
  single_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
}, 
  double_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[750]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[760]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[761]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[770]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[771]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[775]++;
  return Lexer;
}, {
  requires: ['./cursor', './page', '../nodes/text', '../nodes/cdata', '../utils', '../nodes/attribute', '../nodes/tag', '../nodes/comment']});
