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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[323] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[326] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[331] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[346] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[435] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[438] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[464] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[502] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[513] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[515] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[518] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[519] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[524] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[529] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[531] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[534] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[540] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[651] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[719] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[729] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[730] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[741] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[745] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['189'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['263'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['310'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['356'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['375'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['388'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['402'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][6] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['476'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['476'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['527'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['527'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['530'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['539'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['634'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['652'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['652'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].init(216, 10, '\'>\' === ch');
function visit168_676_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].init(100, 17, 'NEGATIVE_1 === ch');
function visit167_674_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['674'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].init(200, 10, '\'-\' === ch');
function visit166_672_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['672'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].init(92, 17, 'NEGATIVE_1 === ch');
function visit165_670_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['670'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'][1].init(184, 10, '\'-\' === ch');
function visit164_668_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['668'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].init(84, 17, 'NEGATIVE_1 === ch');
function visit163_666_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['666'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['652'][1].init(184, 18, 'Utils.isLetter(ch)');
function visit162_652_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['652'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1].init(84, 17, 'NEGATIVE_1 === ch');
function visit161_650_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['650'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['634'][1].init(232, 10, '\'-\' === ch');
function visit160_634_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1].init(108, 17, 'NEGATIVE_1 === ch');
function visit159_632_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['632'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1].init(224, 10, '\'-\' === ch');
function visit158_630_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].init(108, 17, 'NEGATIVE_1 === ch');
function visit157_628_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['628'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][3].init(977, 115, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit156_616_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][2].init(977, 258, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit155_616_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1].init(964, 310, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit154_616_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['616'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1].init(42, 12, '\'\' === quote');
function visit153_587_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1].init(46, 10, 'quoteSmart');
function visit152_586_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['586'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][3].init(637, 10, '\'/\' !== ch');
function visit151_575_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][2].init(614, 17, 'NEGATIVE_1 !== ch');
function visit150_575_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1].init(566, 34, '(NEGATIVE_1 !== ch) && (\'/\' !== ch)');
function visit149_575_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['575'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].init(364, 10, 'ch === \'*\'');
function visit148_572_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][3].init(220, 10, '\'*\' !== ch');
function visit147_570_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][2].init(197, 17, 'NEGATIVE_1 !== ch');
function visit146_570_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].init(145, 34, '(NEGATIVE_1 !== ch) && (\'*\' !== ch)');
function visit145_570_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].init(478, 10, '\'*\' === ch');
function visit144_566_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1].init(350, 10, '\'/\' === ch');
function visit143_564_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].init(218, 17, 'NEGATIVE_1 === ch');
function visit142_562_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].init(42, 12, '\'\' === quote');
function visit141_559_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].init(46, 10, 'quoteSmart');
function visit140_558_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][3].init(302, 12, 'ch !== quote');
function visit139_550_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][2].init(285, 11, 'ch !== \'\\\\\'');
function visit138_550_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1].init(285, 30, '(ch !== \'\\\\\') && (ch !== quote)');
function visit137_550_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1].init(152, 17, 'NEGATIVE_1 === ch');
function visit136_548_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['548'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1].init(42, 12, '\'\' !== quote');
function visit135_546_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1].init(47, 10, 'quoteSmart');
function visit134_545_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['539'][1].init(183, 13, '\'"\' === quote');
function visit133_539_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1].init(42, 12, '\'\' === quote');
function visit132_537_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1].init(46, 22, 'quoteSmart && !comment');
function visit131_536_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['530'][1].init(184, 14, '\'\\\'\' === quote');
function visit130_530_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1].init(42, 12, '\'\' === quote');
function visit129_528_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['527'][1].init(47, 22, 'quoteSmart && !comment');
function visit128_527_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['527'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1].init(82, 10, '\'?\' === ch');
function visit127_479_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][2].init(252, 10, '\'!\' === ch');
function visit126_477_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].init(46, 93, '\'!\' === ch || \'?\' === ch');
function visit125_477_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['476'][1].init(38, 140, 'Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit124_476_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['476'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].init(163, 10, '\'/\' === ch');
function visit123_475_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].init(163, 179, '\'/\' === ch || Utils.isLetter(ch) || \'!\' === ch || \'?\' === ch');
function visit122_475_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].init(74, 17, 'NEGATIVE_1 === ch');
function visit121_473_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][3].init(2204, 10, '\'<\' === ch');
function visit120_471_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][2].init(2187, 11, '0 === quote');
function visit119_471_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1].init(2187, 28, '(0 === quote) && (\'<\' === ch)');
function visit118_471_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3].init(451, 10, '\'/\' !== ch');
function visit117_467_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].init(428, 17, 'NEGATIVE_1 !== ch');
function visit116_467_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].init(400, 34, '(NEGATIVE_1 !== ch) && (\'/\' !== ch)');
function visit115_467_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1].init(260, 10, 'ch === \'*\'');
function visit114_464_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3].init(158, 10, '\'*\' !== ch');
function visit113_462_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2].init(135, 17, 'NEGATIVE_1 !== ch');
function visit112_462_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].init(103, 34, '(NEGATIVE_1 !== ch) && (\'*\' !== ch)');
function visit111_462_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].init(549, 10, '\'*\' === ch');
function visit110_458_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][3].init(146, 11, '\'\\n\' !== ch');
function visit109_457_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][2].init(123, 17, 'NEGATIVE_1 !== ch');
function visit108_457_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].init(95, 35, '(NEGATIVE_1 !== ch) && (\'\\n\' !== ch)');
function visit107_457_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].init(343, 10, '\'/\' === ch');
function visit106_454_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].init(254, 17, 'NEGATIVE_1 === ch');
function visit105_452_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][4].init(1017, 10, 'ch === \'/\'');
function visit104_447_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][3].init(1000, 11, '0 === quote');
function visit103_447_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][2].init(1000, 28, '(0 === quote) && (ch === \'/\')');
function visit102_447_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][1].init(985, 43, 'quoteSmart && (0 === quote) && (ch === \'/\')');
function visit101_447_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].init(886, 12, 'ch === quote');
function visit100_445_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].init(871, 28, 'quoteSmart && (ch === quote)');
function visit99_445_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1].init(61, 12, 'ch !== quote');
function visit98_440_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][4].init(176, 11, '\'\\\\\' !== ch');
function visit97_439_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][3].init(176, 75, '(\'\\\\\' !== ch) && (ch !== quote)');
function visit96_439_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2].init(153, 17, 'NEGATIVE_1 !== ch');
function visit95_439_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1].init(153, 98, '(NEGATIVE_1 !== ch) && (\'\\\\\' !== ch) && (ch !== quote)');
function visit94_439_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4].init(329, 11, '\'\\\\\' === ch');
function visit93_436_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3].init(312, 11, '0 !== quote');
function visit92_436_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2].init(312, 29, '(0 !== quote) && (\'\\\\\' === ch)');
function visit91_436_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1].init(297, 44, 'quoteSmart && (0 !== quote) && (\'\\\\\' === ch)');
function visit90_436_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][6].init(196, 11, '\'\\\'\' === ch');
function visit89_434_6(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][6].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][5].init(180, 10, '\'"\' === ch');
function visit88_434_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4].init(180, 28, '(\'"\' === ch) || (\'\\\'\' === ch)');
function visit87_434_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3].init(162, 11, '0 === quote');
function visit86_434_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2].init(162, 47, '(0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit85_434_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1].init(147, 62, 'quoteSmart && (0 === quote) && ((\'"\' === ch) || (\'\\\'\' === ch))');
function visit84_434_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].init(66, 17, 'NEGATIVE_1 === ch');
function visit83_432_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['402'][1].init(171, 23, '!Utils.isWhitespace(ch)');
function visit82_402_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].init(70, 10, '\'>\' === ch');
function visit81_400_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].init(81, 10, '\'-\' === ch');
function visit80_393_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['388'][1].init(179, 17, 'NEGATIVE_1 === ch');
function visit79_388_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].init(80, 10, '\'-\' === ch');
function visit78_386_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['375'][1].init(285, 10, '\'>\' === ch');
function visit77_375_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1].init(169, 17, 'NEGATIVE_1 === ch');
function visit76_373_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1].init(78, 10, '\'-\' === ch');
function visit75_370_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].init(178, 10, '\'-\' === ch');
function visit74_363_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].init(77, 10, '\'>\' === ch');
function visit73_361_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['356'][1].init(66, 17, 'NEGATIVE_1 === ch');
function visit72_356_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].init(736, 23, '!Utils.isWhitespace(ch)');
function visit71_315_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['310'][1].init(479, 10, '\'=\' === ch');
function visit70_310_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1].init(144, 17, 'NEGATIVE_1 === ch');
function visit69_304_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1].init(259, 10, '\'"\' === ch');
function visit68_293_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1].init(76, 17, 'NEGATIVE_1 === ch');
function visit67_290_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].init(259, 11, '\'\\\'\' === ch');
function visit66_283_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1].init(76, 17, 'NEGATIVE_1 === ch');
function visit65_280_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1].init(250, 22, 'Utils.isWhitespace(ch)');
function visit64_273_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][3].init(92, 10, '\'>\' === ch');
function visit63_270_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][2].init(69, 17, 'NEGATIVE_1 === ch');
function visit62_270_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][1].init(69, 34, '(NEGATIVE_1 === ch) || (\'>\' === ch)');
function visit61_270_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['263'][1].init(536, 23, '!Utils.isWhitespace(ch)');
function visit60_263_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1].init(387, 10, '\'"\' === ch');
function visit59_260_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1].init(237, 11, '\'\\\'\' === ch');
function visit58_257_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][3].init(74, 10, '\'>\' === ch');
function visit57_254_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][2].init(51, 17, 'NEGATIVE_1 === ch');
function visit56_254_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1].init(51, 34, '(NEGATIVE_1 === ch) || (\'>\' === ch)');
function visit55_254_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].init(948, 10, '\'=\' === ch');
function visit54_248_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1].init(568, 22, 'Utils.isWhitespace(ch)');
function visit53_243_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1].init(34, 10, '\'<\' === ch');
function visit52_236_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][5].init(126, 10, '\'<\' === ch');
function visit51_235_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][4].init(110, 10, '\'>\' === ch');
function visit50_235_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][3].init(110, 27, '(\'>\' === ch) || (\'<\' === ch)');
function visit49_235_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][2].init(87, 17, 'NEGATIVE_1 === ch');
function visit48_235_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1].init(87, 50, '(NEGATIVE_1 === ch) || (\'>\' === ch) || (\'<\' === ch)');
function visit47_235_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][2].init(373, 10, 'ch === \'/\'');
function visit46_226_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][1].init(373, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit45_226_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][2].init(81, 10, 'ch === \'/\'');
function visit44_223_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1].init(81, 53, 'ch === \'/\' || Utils.isValidAttributeNameStartChar(ch)');
function visit43_223_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].init(90, 18, '!attributes.length');
function visit42_221_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].init(34, 10, '\'<\' === ch');
function visit41_213_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][5].init(116, 10, '\'<\' === ch');
function visit40_212_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][4].init(102, 10, '\'>\' === ch');
function visit39_212_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][3].init(102, 24, '\'>\' === ch || \'<\' === ch');
function visit38_212_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2].init(89, 9, 'ch === -1');
function visit37_212_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].init(89, 37, 'ch === -1 || \'>\' === ch || \'<\' === ch');
function visit36_212_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][3].init(36, 9, 'ch === -1');
function visit35_191_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][2].init(36, 30, 'ch === -1 && attributes.length');
function visit34_191_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1].init(26, 40, 'strict && ch === -1 && attributes.length');
function visit33_191_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['189'][1].init(340, 6, 'strict');
function visit32_189_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['189'][1].ranCondition(result);
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
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[189]++;
  if (visit32_189_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191]++;
  if (visit33_191_1(strict && visit34_191_2(visit35_191_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212]++;
        if (visit36_212_1(visit37_212_2(ch === -1) || visit38_212_3(visit39_212_4('>' === ch) || visit40_212_5('<' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
          if (visit41_213_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221]++;
          if (visit42_221_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223]++;
            if (visit43_223_1(visit44_223_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226]++;
            if (visit45_226_1(visit46_226_2(ch === '/') || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235]++;
        if (visit47_235_1((visit48_235_2(NEGATIVE_1 === ch)) || visit49_235_3((visit50_235_4('>' === ch)) || (visit51_235_5('<' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236]++;
          if (visit52_236_1('<' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243]++;
          if (visit53_243_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248]++;
            if (visit54_248_1('=' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
        if (visit55_254_1((visit56_254_2(NEGATIVE_1 === ch)) || (visit57_254_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
          if (visit58_257_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260]++;
            if (visit59_260_1('"' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263]++;
              if (visit60_263_1(!Utils.isWhitespace(ch))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
        if (visit61_270_1((visit62_270_2(NEGATIVE_1 === ch)) || (visit63_270_3('>' === ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
          if (visit64_273_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280]++;
        if (visit65_280_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
          this.singleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
          if (visit66_283_1('\'' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
            this.singleQuote(attributes, bookmarks);
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
        if (visit67_290_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
          this.doubleQuote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293]++;
          if (visit68_293_1('"' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
            this.doubleQuote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[304]++;
        if (visit69_304_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[307]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
          if (visit70_310_1('=' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312]++;
            bookmarks[2] = bookmarks[6];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313]++;
            bookmarks[3] = bookmarks[7];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314]++;
            state = 2;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[315]++;
            if (visit71_315_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[323]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[324]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[326]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[328]++;
        throw new Error('how ** did we get in state ' + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[331]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[346]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356]++;
    if (visit72_356_1(NEGATIVE_1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[359]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
          if (visit73_361_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363]++;
            if (visit74_363_1('-' === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
              state = 1;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
          if (visit75_370_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
            if (visit76_373_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375]++;
              if (visit77_375_1('>' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[376]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386]++;
          if (visit78_386_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388]++;
            if (visit79_388_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393]++;
          if (visit80_393_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400]++;
          if (visit81_400_1('>' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[401]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402]++;
            if (visit82_402_1(!Utils.isWhitespace(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409]++;
          throw new Error('how ** did we get in state ' + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[414]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[432]++;
    if (visit83_432_1(NEGATIVE_1 === ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[434]++;
      if (visit84_434_1(quoteSmart && visit85_434_2((visit86_434_3(0 === quote)) && (visit87_434_4((visit88_434_5('"' === ch)) || (visit89_434_6('\'' === ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[435]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436]++;
        if (visit90_436_1(quoteSmart && visit91_436_2((visit92_436_3(0 !== quote)) && (visit93_436_4('\\' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[438]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439]++;
          if (visit94_439_1((visit95_439_2(NEGATIVE_1 !== ch)) && visit96_439_3((visit97_439_4('\\' !== ch)) && (visit98_440_1(ch !== quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[445]++;
          if (visit99_445_1(quoteSmart && (visit100_445_2(ch === quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447]++;
            if (visit101_447_1(quoteSmart && visit102_447_2((visit103_447_3(0 === quote)) && (visit104_447_4(ch === '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[452]++;
              if (visit105_452_1(NEGATIVE_1 === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454]++;
                if (visit106_454_1('/' === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456]++;
                    ch = page.getChar(cursor);
                  } while (visit107_457_1((visit108_457_2(NEGATIVE_1 !== ch)) && (visit109_457_3('\n' !== ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
                  if (visit110_458_1('*' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[461]++;
                        ch = page.getChar(cursor);
                      } while (visit111_462_1((visit112_462_2(NEGATIVE_1 !== ch)) && (visit113_462_3('*' !== ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[464]++;
                      if (visit114_464_1(ch === '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit115_467_1((visit116_467_2(NEGATIVE_1 !== ch)) && (visit117_467_3('/' !== ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471]++;
              if (visit118_471_1((visit119_471_2(0 === quote)) && (visit120_471_3('<' === ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[473]++;
                if (visit121_473_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[474]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475]++;
                  if (visit122_475_1(visit123_475_2('/' === ch) || visit124_476_1(Utils.isLetter(ch) || visit125_477_1(visit126_477_2('!' === ch) || visit127_479_1('?' === ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[502]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[512]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[513]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[515]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[516]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[518]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[519]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[524]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527]++;
            if (visit128_527_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528]++;
              if (visit129_528_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[529]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530]++;
                if (visit130_530_1('\'' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[531]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[534]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536]++;
            if (visit131_536_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537]++;
              if (visit132_537_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539]++;
                if (visit133_539_1('"' === quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[540]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
            if (visit134_545_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
              if (visit135_546_1('' !== quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
                if (visit136_548_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
                  if (visit137_550_1((visit138_550_2(ch !== '\\')) && (visit139_550_3(ch !== quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558]++;
            if (visit140_558_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
              if (visit141_559_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
                if (visit142_562_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
                  if (visit143_564_1('/' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
                    if (visit144_566_1('*' === ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit145_570_1((visit146_570_2(NEGATIVE_1 !== ch)) && (visit147_570_3('*' !== ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572]++;
                        if (visit148_572_1(ch === '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit149_575_1((visit150_575_2(NEGATIVE_1 !== ch)) && (visit151_575_3('/' !== ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
            if (visit152_586_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587]++;
              if (visit153_587_1('' === quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616]++;
            if (visit154_616_1(!tagName || (visit155_616_2(visit156_616_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[625]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628]++;
            if (visit157_628_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[629]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630]++;
              if (visit158_630_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[631]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632]++;
                if (visit159_632_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[633]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634]++;
                  if (visit160_634_1('-' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650]++;
        if (visit161_650_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[651]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652]++;
          if (visit162_652_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666]++;
        if (visit163_666_1(NEGATIVE_1 === ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668]++;
          if (visit164_668_1('-' === ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670]++;
            if (visit165_670_1(NEGATIVE_1 === ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672]++;
              if (visit166_672_1('-' === ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
                if (visit167_674_1(NEGATIVE_1 === ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
                  if (visit168_676_1('>' === ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686]++;
                mPage.ungetChar(mCursor);
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
        throw new Error('unexpected ' + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697]++;
  return this.makeCData(start, end);
}, 
  singleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[4] + 1, bookmarks[5]), '\''));
}, 
  doubleQuote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[719]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[729]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[730]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[740]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[741]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), '=', page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[745]++;
  return Lexer;
});
