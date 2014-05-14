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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[211] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[264] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[326] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[332] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[351] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[412] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[428] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[429] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[441] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[450] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[513] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[517] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[518] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[523] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[526] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[529] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[534] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[614] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[638] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[648] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[656] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[727] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[743] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['28'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['28'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['211'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['234'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['258'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['271'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['281'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['288'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['302'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['354'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['359'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['368'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['391'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['430'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][6] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['450'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['525'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['525'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['526'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['534'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['543'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].init(216, 10, '\'>\' === ch');
function visit167_674_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].init(100, 17, 'NEGATIVE_1 === ch');
function visit166_672_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].init(200, 10, '\'-\' === ch');
function visit165_670_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'][1].init(92, 17, 'NEGATIVE_1 === ch');
function visit164_668_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].init(184, 10, '\'-\' === ch');
function visit163_666_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].init(84, 17, 'NEGATIVE_1 === ch');
function visit162_664_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1].init(184, 18, 'Utils.isLetter(ch)');
function visit161_650_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1].init(84, 17, 'NEGATIVE_1 === ch');
function visit160_648_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['648'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1].init(232, 10, '\'-\' === ch');
function visit159_632_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1].init(108, 17, 'NEGATIVE_1 === ch');
function visit158_630_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].init(224, 10, '\'-\' === ch');
function visit157_628_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1].init(108, 17, 'NEGATIVE_1 === ch');
function visit156_626_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][3].init(977, 119, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit155_614_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][2].init(977, 266, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit154_614_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][1].init(964, 318, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit153_614_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['614'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].init(42, 12, '\'\' === quote');
function visit152_585_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1].init(46, 10, 'quoteSmart');
function visit151_584_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3].init(637, 10, '\'/\' !== ch');
function visit150_573_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2].init(614, 17, 'NEGATIVE_1 !== ch');
function visit149_573_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1].init(566, 34, '(NEGATIVE_1 !== ch) && (\'/\' !== ch)');
function visit148_573_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].init(364, 10, 'ch === \'*\'');
function visit147_570_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][3].init(220, 10, '\'*\' !== ch');
function visit146_568_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][2].init(197, 17, 'NEGATIVE_1 !== ch');
function visit145_568_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].init(145, 34, '(NEGATIVE_1 !== ch) && (\'*\' !== ch)');
function visit144_568_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1].init(478, 10, '\'*\' === ch');
function visit143_564_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].init(350, 10, '\'/\' === ch');
function visit142_562_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].init(218, 17, 'NEGATIVE_1 === ch');
function visit141_560_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1].init(42, 12, '\'\' === quote');
function visit140_557_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].init(46, 10, 'quoteSmart');
function visit139_556_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][3].init(302, 12, 'ch !== quote');
function visit138_548_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][2].init(285, 11, 'ch !== \'\\\\\'');
function visit137_548_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1].init(285, 30, '(ch !== \'\\\\\') && (ch !== quote)');
function visit136_548_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1].init(152, 17, 'NEGATIVE_1 === ch');
function visit135_546_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1].init(42, 12, '\'\' !== quote');
function visit134_544_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['543'][1].init(47, 10, 'quoteSmart');
function visit133_543_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1].init(183, 13, '\'"\' === quote');
function visit132_537_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1].init(42, 12, '\'\' === quote');
function visit131_535_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['534'][1].init(46, 22, 'quoteSmart && !comment');
function visit130_534_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1].init(184, 14, '\'\\\'\' === quote');
function visit129_528_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['526'][1].init(42, 12, '\'\' === quote');
function visit128_526_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['525'][1].init(47, 22, 'quoteSmart && !comment');
function visit127_525_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].init(82, 10, '\'?\' === ch');
function visit126_477_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].init(252, 10, '\'!\' === ch');
function visit125_475_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].init(46, 93, '\'!\' === ch || \'?\' === ch');
function visit124_475_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1].init(38, 140, 'Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit123_474_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].init(163, 10, '\'/\' === ch');
function visit122_473_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].init(163, 179, '\'/\' === ch || Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit121_473_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1].init(74, 17, 'NEGATIVE_1 === ch');
function visit120_471_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].init(2204, 10, '\'<\' === ch');
function visit119_469_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].init(2187, 11, '0 === quote');
function visit118_469_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(2187, 28, '(0 === quote) && (\'<\' === ch)');
function visit117_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3].init(451, 10, '\'/\' !== ch');
function visit116_465_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2].init(428, 17, 'NEGATIVE_1 !== ch');
function visit115_465_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1].init(400, 34, '(NEGATIVE_1 !== ch) && (\'/\' !== ch)');
function visit114_465_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].init(260, 10, 'ch === \'*\'');
function visit113_462_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].init(158, 10, '\'*\' !== ch');
function visit112_460_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].init(135, 17, 'NEGATIVE_1 !== ch');
function visit111_460_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].init(103, 34, '(NEGATIVE_1 !== ch) && (\'*\' !== ch)');
function visit110_460_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1].init(549, 10, '\'*\' === ch');
function visit109_456_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][3].init(146, 11, '\'\\n\' !== ch');
function visit108_455_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][2].init(123, 17, 'NEGATIVE_1 !== ch');
function visit107_455_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1].init(95, 35, '(NEGATIVE_1 !== ch) && (\'\\n\' !== ch)');
function visit106_455_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].init(343, 10, '\'/\' === ch');
function visit105_452_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['450'][1].init(254, 17, 'NEGATIVE_1 === ch');
function visit104_450_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][4].init(1017, 10, 'ch === \'/\'');
function visit103_445_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3].init(1000, 11, '0 === quote');
function visit102_445_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].init(1000, 28, '(0 === quote) && (ch === \'/\')');
function visit101_445_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].init(985, 43, 'quoteSmart && (0 === quote) && (ch === \'/\')');
function visit100_445_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][2].init(886, 12, 'ch === quote');
function visit99_443_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][1].init(871, 28, 'quoteSmart && (ch === quote)');
function visit98_443_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1].init(61, 12, 'ch !== quote');
function visit97_438_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][4].init(176, 11, '\'\\\\\' !== ch');
function visit96_437_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][3].init(176, 75, '(\'\\\\\' !== ch) && (ch !== quote)');
function visit95_437_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][2].init(153, 17, 'NEGATIVE_1 !== ch');
function visit94_437_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][1].init(153, 98, '(NEGATIVE_1 !== ch) && (\'\\\\\' !== ch) && (ch !== quote)');
function visit93_437_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4].init(329, 11, '\'\\\\\' === ch');
function visit92_434_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3].init(312, 11, '0 !== quote');
function visit91_434_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2].init(312, 29, '(0 !== quote) && (\'\\\\\' === ch)');
function visit90_434_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1].init(297, 44, 'quoteSmart && (0 !== quote) && (\'\\\\\' === ch)');
function visit89_434_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][6].init(196, 11, '\'\\\'\' === ch');
function visit88_432_6(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][5].init(180, 10, '\'"\' === ch');
function visit87_432_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][4].init(180, 28, '(\'"\' === ch) || (\'\\\'\' === ch)');
function visit86_432_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3].init(162, 11, '0 === quote');
function visit85_432_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2].init(162, 47, '(0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit84_432_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].init(147, 62, 'quoteSmart && (0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit83_432_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['430'][1].init(66, 17, 'NEGATIVE_1 === ch');
function visit82_430_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].init(171, 23, '!Utils.isWhitespace(ch)');
function visit81_400_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1].init(70, 10, '\'>\' === ch');
function visit80_398_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['391'][1].init(81, 10, '\'-\' === ch');
function visit79_391_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].init(179, 17, 'NEGATIVE_1 === ch');
function visit78_386_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].init(80, 10, '\'-\' === ch');
function visit77_384_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1].init(285, 10, '\'>\' === ch');
function visit76_373_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].init(169, 17, 'NEGATIVE_1 === ch');
function visit75_371_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['368'][1].init(78, 10, '\'-\' === ch');
function visit74_368_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].init(178, 10, '\'-\' === ch');
function visit73_361_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['359'][1].init(77, 10, '\'>\' === ch');
function visit72_359_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['354'][1].init(66, 17, 'NEGATIVE_1 === ch');
function visit71_354_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1].init(736, 23, '!Utils.isWhitespace(ch)');
function visit70_313_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1].init(479, 10, '\'=\' === ch');
function visit69_308_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['302'][1].init(144, 17, 'NEGATIVE_1 === ch');
function visit68_302_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1].init(259, 10, '\'"\' === ch');
function visit67_291_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['288'][1].init(76, 17, 'NEGATIVE_1 === ch');
function visit66_288_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['281'][1].init(259, 11, '\'\\\'\' === ch');
function visit65_281_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].init(76, 17, 'NEGATIVE_1 === ch');
function visit64_278_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['271'][1].init(250, 22, 'Utils.isWhitespace(ch)');
function visit63_271_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3].init(92, 10, '\'>\' === ch');
function visit62_268_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2].init(69, 17, 'NEGATIVE_1 === ch');
function visit61_268_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].init(69, 34, '(NEGATIVE_1 === ch) || (\'>\' === ch)');
function visit60_268_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].init(536, 23, '!Utils.isWhitespace(ch)');
function visit59_261_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['258'][1].init(387, 10, '\'"\' === ch');
function visit58_258_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1].init(237, 11, '\'\\\'\' === ch');
function visit57_255_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][3].init(74, 10, '\'>\' === ch');
function visit56_252_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][2].init(51, 17, 'NEGATIVE_1 === ch');
function visit55_252_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].init(51, 34, '(NEGATIVE_1 === ch) || (\'>\' === ch)');
function visit54_252_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1].init(948, 10, '\'=\' === ch');
function visit53_246_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1].init(568, 22, 'Utils.isWhitespace(ch)');
function visit52_241_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['234'][1].init(34, 10, '\'<\' === ch');
function visit51_234_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][5].init(126, 10, '\'<\' === ch');
function visit50_233_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][4].init(110, 10, '\'>\' === ch');
function visit49_233_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][3].init(110, 27, '(\'>\' === ch) || (\'<\' === ch)');
function visit48_233_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][2].init(87, 17, 'NEGATIVE_1 === ch');
function visit47_233_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1].init(87, 50, '(NEGATIVE_1 === ch) || (\'>\' === ch) || (\'<\' === ch)');
function visit46_233_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2].init(373, 10, 'ch === \'/\'');
function visit45_224_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].init(373, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit44_224_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][2].init(81, 10, 'ch === \'/\'');
function visit43_221_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].init(81, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit42_221_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1].init(90, 18, '!attributes.length');
function visit41_219_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['211'][1].init(34, 10, '\'<\' === ch');
function visit40_211_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][5].init(116, 10, '\'<\' === ch');
function visit39_210_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][4].init(102, 10, '\'>\' === ch');
function visit38_210_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][3].init(102, 24, '\'>\' === ch || \'<\' === ch');
function visit37_210_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][2].init(89, 9, 'ch === -1');
function visit36_210_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1].init(89, 37, 'ch === -1 || \'>\' === ch || \'<\' === ch');
function visit35_210_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][3].init(32, 9, 'ch === -1');
function visit34_180_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][2].init(32, 30, 'ch === -1 && attributes.length');
function visit33_180_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1].init(22, 40, 'strict && ch === -1 && attributes.length');
function visit32_180_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].init(92, 10, '2 > length');
function visit31_141_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'][1].init(100, 12, '0 !== length');
function visit30_140_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].init(80, 5, 'l > 0');
function visit29_130_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].init(80, 5, 'l > 0');
function visit28_120_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].init(92, 10, '2 > length');
function visit27_105_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].init(85, 12, '0 !== length');
function visit26_104_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].init(124, 10, '\'-\' === ch');
function visit25_76_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].init(34, 10, '\'>\' === ch');
function visit24_72_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].init(82, 9, 'ch === -1');
function visit23_69_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].init(385, 10, '\'?\' === ch');
function visit22_67_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].init(371, 10, '\'!\' === ch');
function visit21_67_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].init(371, 24, '\'!\' === ch || \'?\' === ch');
function visit20_67_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].init(200, 10, 'ch === \'/\'');
function visit19_64_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].init(200, 32, 'ch === \'/\' || Utils.isLetter(ch)');
function visit18_64_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].init(82, 9, 'ch === -1');
function visit17_62_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['28'][1].init(155, 9, 'cfg || {}');
function visit16_28_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7]++;
  var Cursor = require('./cursor');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8]++;
  var NEGATIVE_1 = 0 - 1;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9]++;
  var Page = require('./page');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10]++;
  var TextNode = require('../nodes/text');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11]++;
  var CData = require('../nodes/cdata');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[12]++;
  var Utils = require('../utils');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[13]++;
  var Attribute = require('../nodes/attribute');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14]++;
  var TagNode = require('../nodes/tag');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[15]++;
  var CommentNode = require('../nodes/comment');
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23]++;
  function Lexer(text, cfg) {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[24]++;
    var self = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[25]++;
    self.page = new Page(text);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26]++;
    self.cursor = new Cursor();
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27]++;
    self.nodeFactory = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[28]++;
    this.cfg = visit16_28_1(cfg || {});
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[31]++;
  Lexer.prototype = {
  constructor: Lexer, 
  setPosition: function(p) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[35]++;
  this.cursor.position = p;
}, 
  getPosition: function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39]++;
  return this.cursor.position;
}, 
  nextNode: function(quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48]++;
  var self = this, start, ch, ret, cursor = self.cursor, page = self.page;
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
        ret = self.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64]++;
        if (visit18_64_1(visit19_64_2(ch === '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[65]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66]++;
          ret = self.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
          if (visit20_67_1(visit21_67_2('!' === ch) || visit22_67_3('?' === ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69]++;
            if (visit23_69_1(ch === -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70]++;
              ret = self.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
              if (visit24_72_1('>' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
                ret = self.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[75]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76]++;
                if (visit25_76_1('-' === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[77]++;
                  ret = self.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[82]++;
                  ret = self.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88]++;
            ret = self.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[90]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93]++;
      ret = self.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[97]++;
  return ret;
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
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114]++;
  return ret;
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
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[147]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[153]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[157]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[161]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[165]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[179]++;
  function checkError() {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180]++;
    if (visit32_180_1(strict && visit33_180_2(visit34_180_3(ch === -1) && attributes.length))) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181]++;
      throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[186]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[201]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210]++;
        if (visit35_210_1(visit36_210_2(ch === -1) || visit37_210_3(visit38_210_4('>' === ch) || visit39_210_5('<' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[211]++;
          if (visit40_211_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[214]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[219]++;
          if (visit41_219_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221]++;
            if (visit42_221_1(visit43_221_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
            if (visit44_224_1(visit45_224_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233]++;
        if (visit46_233_1((visit47_233_2(NEGATIVE_1 === ch)) || visit48_233_3((visit49_233_4('>' === ch)) || (visit50_233_5('<' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234]++;
          if (visit51_234_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
          if (visit52_241_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246]++;
            if (visit53_246_1('=' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
        if (visit54_252_1((visit55_252_2(NEGATIVE_1 === ch)) || (visit56_252_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255]++;
          if (visit57_255_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258]++;
            if (visit58_258_1('"' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
              if (visit59_261_1(!Utils.isWhitespace(ch))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[264]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
        if (visit60_268_1((visit61_268_2(NEGATIVE_1 === ch)) || (visit62_268_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271]++;
          if (visit63_271_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
        if (visit64_278_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
          this.singleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
          if (visit65_281_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282]++;
            this.singleQuote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288]++;
        if (visit66_288_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
          this.doubleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
          if (visit67_291_1('"' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
            this.doubleQuote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302]++;
        if (visit68_302_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308]++;
          if (visit69_308_1('=' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
            bookmarks[2] = bookmarks[6];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311]++;
            bookmarks[3] = bookmarks[7];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312]++;
            state = 2;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313]++;
            if (visit70_313_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[324]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[326]++;
        throw new Error('how ** did we get in state ' + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[329]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[332]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[351]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354]++;
    if (visit71_354_1(NEGATIVE_1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359]++;
          if (visit72_359_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
            if (visit73_361_1('-' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
              state = 1;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
          if (visit74_368_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
            if (visit75_371_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
              if (visit76_373_1('>' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
          if (visit77_384_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386]++;
            if (visit78_386_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391]++;
          if (visit79_391_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398]++;
          if (visit80_398_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400]++;
            if (visit81_400_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[403]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407]++;
          throw new Error('how ** did we get in state ' + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[412]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[422]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[428]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[429]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430]++;
    if (visit82_430_1(NEGATIVE_1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432]++;
      if (visit83_432_1(quoteSmart && visit84_432_2((visit85_432_3(0 === quote)) && (visit86_432_4((visit87_432_5('"' === ch)) || (visit88_432_6('\'' === ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434]++;
        if (visit89_434_1(quoteSmart && visit90_434_2((visit91_434_3(0 !== quote)) && (visit92_434_4('\\' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437]++;
          if (visit93_437_1((visit94_437_2(NEGATIVE_1 !== ch)) && visit95_437_3((visit96_437_4('\\' !== ch)) && (visit97_438_1(ch !== quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[441]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443]++;
          if (visit98_443_1(quoteSmart && (visit99_443_2(ch === quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445]++;
            if (visit100_445_1(quoteSmart && visit101_445_2((visit102_445_3(0 === quote)) && (visit103_445_4(ch === '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[450]++;
              if (visit104_450_1(NEGATIVE_1 === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452]++;
                if (visit105_452_1('/' === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454]++;
                    ch = page.getChar(cursor);
                  } while (visit106_455_1((visit107_455_2(NEGATIVE_1 !== ch)) && (visit108_455_3('\n' !== ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456]++;
                  if (visit109_456_1('*' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459]++;
                        ch = page.getChar(cursor);
                      } while (visit110_460_1((visit111_460_2(NEGATIVE_1 !== ch)) && (visit112_460_3('*' !== ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462]++;
                      if (visit113_462_1(ch === '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit114_465_1((visit115_465_2(NEGATIVE_1 !== ch)) && (visit116_465_3('/' !== ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469]++;
              if (visit117_469_1((visit118_469_2(0 === quote)) && (visit119_469_3('<' === ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471]++;
                if (visit120_471_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473]++;
                  if (visit121_473_1(visit122_473_2('/' === ch) || visit123_474_1(Utils.isLetter(ch) || visit124_475_1(visit125_475_2('!' === ch) || visit126_477_1('?' === ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[500]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[511]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[513]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[517]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[518]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[523]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525]++;
            if (visit127_525_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[526]++;
              if (visit128_526_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528]++;
                if (visit129_528_1('\'' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[529]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[534]++;
            if (visit130_534_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535]++;
              if (visit131_535_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537]++;
                if (visit132_537_1('"' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543]++;
            if (visit133_543_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544]++;
              if (visit134_544_1('' !== quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
                if (visit135_546_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
                  if (visit136_548_1((visit137_548_2(ch !== '\\')) && (visit138_548_3(ch !== quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
            if (visit139_556_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557]++;
              if (visit140_557_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
                if (visit141_560_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
                  if (visit142_562_1('/' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
                    if (visit143_564_1('*' === ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit144_568_1((visit145_568_2(NEGATIVE_1 !== ch)) && (visit146_568_3('*' !== ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                        if (visit147_570_1(ch === '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit148_573_1((visit149_573_2(NEGATIVE_1 !== ch)) && (visit150_573_3('/' !== ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584]++;
            if (visit151_584_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585]++;
              if (visit152_585_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[614]++;
            if (visit153_614_1(!tagName || (visit154_614_2(visit155_614_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[623]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626]++;
            if (visit156_626_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628]++;
              if (visit157_628_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630]++;
                if (visit158_630_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632]++;
                  if (visit159_632_1('-' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[638]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[648]++;
        if (visit160_648_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650]++;
          if (visit161_650_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[656]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664]++;
        if (visit162_664_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666]++;
          if (visit163_666_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668]++;
            if (visit164_668_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670]++;
              if (visit165_670_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672]++;
                if (visit166_672_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
                  if (visit167_674_1('>' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
                mPage.ungetChar(mCursor);
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
        throw new Error('unexpected ' + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695]++;
  return this.makeCData(start, end);
}, 
  singleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[4] + 1, bookmarks[5]), '\''));
}, 
  doubleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[727]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[743]++;
  return Lexer;
});
