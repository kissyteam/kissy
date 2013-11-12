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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[95] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[157] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[280] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[408] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[410] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[412] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[421] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[423] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[425] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[533] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[604] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[619] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[685] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[715] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[719] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[724] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[726] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[729] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[731] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[741] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[742] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[752] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[764] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[765] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[775] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[776] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[780] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['60'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['63'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['95'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['111'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['132'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['181'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['256'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['284'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['295'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['306'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['316'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['383'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['399'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['404'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['412'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['561'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['561'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['597'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['597'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['619'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['619'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['661'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['661'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['663'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['663'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['665'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['665'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['667'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['685'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['685'][1] = new BranchData();
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['709'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['709'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['709'][1].init(207, 9, '\'>\' == ch');
function visit166_709_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['709'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'][1].init(100, 8, '-1 == ch');
function visit165_707_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'][1].init(191, 9, '\'-\' == ch');
function visit164_705_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'][1].init(92, 8, '-1 == ch');
function visit163_703_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['703'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].init(175, 9, '\'-\' == ch');
function visit162_701_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].init(84, 8, '-1 == ch');
function visit161_699_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['685'][1].init(175, 18, 'Utils.isLetter(ch)');
function visit160_685_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['685'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1].init(84, 8, '-1 == ch');
function visit159_683_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['683'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['667'][1].init(223, 9, '\'-\' == ch');
function visit158_667_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['665'][1].init(108, 8, '-1 == ch');
function visit157_665_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['665'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['663'][1].init(215, 9, '\'-\' == ch');
function visit156_663_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['663'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['661'][1].init(108, 8, '-1 == ch');
function visit155_661_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['661'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][3].init(996, 115, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit154_649_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][2].init(996, 258, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit153_649_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][1].init(983, 310, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit152_649_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['649'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['619'][1].init(42, 11, '\'\' == quote');
function visit151_619_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['619'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1].init(46, 10, 'quoteSmart');
function visit150_618_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['618'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][3].init(616, 10, '\'/\' !== ch');
function visit149_606_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][2].init(601, 9, '-1 !== ch');
function visit148_606_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1].init(553, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit147_606_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['606'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1].init(352, 9, 'ch == \'*\'');
function visit146_603_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['603'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][3].init(208, 10, '\'*\' !== ch');
function visit145_601_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][2].init(193, 9, '-1 !== ch');
function visit144_601_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][1].init(141, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit143_601_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['601'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['597'][1].init(468, 9, '\'*\' == ch');
function visit142_597_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['597'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].init(341, 9, '\'/\' == ch');
function visit141_595_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1].init(218, 8, '-1 == ch');
function visit140_593_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].init(42, 11, '\'\' == quote');
function visit139_590_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['590'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].init(46, 10, 'quoteSmart');
function visit138_589_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][3].init(293, 12, 'ch !== quote');
function visit137_581_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][2].init(276, 11, 'ch !== \'\\\\\'');
function visit136_581_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1].init(276, 30, '(ch !== \'\\\\\') && (ch !== quote)');
function visit135_581_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'][1].init(152, 8, '-1 == ch');
function visit134_579_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['579'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'][1].init(42, 12, '\'\' !== quote');
function visit133_577_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['577'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].init(47, 10, 'quoteSmart');
function visit132_576_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].init(182, 12, '\'"\' == quote');
function visit131_570_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].init(42, 11, '\'\' == quote');
function visit130_568_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].init(46, 22, 'quoteSmart && !comment');
function visit129_567_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['561'][1].init(183, 13, '\'\\\'\' == quote');
function visit128_561_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].init(42, 11, '\'\' == quote');
function visit127_559_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].init(47, 22, 'quoteSmart && !comment');
function visit126_558_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].ranCondition(result);
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
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][3].init(2413, 9, '\'<\' == ch');
function visit118_499_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][2].init(2397, 10, '0 == quote');
function visit117_499_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].init(2397, 26, '(0 == quote) && (\'<\' == ch)');
function visit116_499_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][3].init(484, 10, '\'/\' !== ch');
function visit115_493_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][2].init(469, 9, '-1 !== ch');
function visit114_493_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][1].init(441, 26, '(-1 !== ch) && (\'/\' !== ch)');
function visit113_493_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].init(252, 9, 'ch == \'*\'');
function visit112_489_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][3].init(150, 10, '\'*\' !== ch');
function visit111_487_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].init(135, 9, '-1 !== ch');
function visit110_487_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].init(103, 26, '(-1 !== ch) && (\'*\' !== ch)');
function visit109_487_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].init(573, 9, '\'*\' == ch');
function visit108_482_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].init(138, 11, '\'\\n\' !== ch');
function visit107_480_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].init(123, 9, '-1 !== ch');
function visit106_480_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1].init(95, 27, '(-1 !== ch) && (\'\\n\' !== ch)');
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
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][4].init(1134, 9, 'ch == \'/\'');
function visit102_469_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].init(1118, 10, '0 == quote');
function visit101_469_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].init(1118, 26, '(0 == quote) && (ch == \'/\')');
function visit100_469_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(1103, 41, 'quoteSmart && (0 == quote) && (ch == \'/\')');
function visit99_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][2].init(988, 11, 'ch == quote');
function visit98_466_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][1].init(973, 27, 'quoteSmart && (ch == quote)');
function visit97_466_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].init(62, 12, 'ch !== quote');
function visit96_460_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].init(142, 11, '\'\\\\\' !== ch');
function visit95_459_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].init(39, 76, '(\'\\\\\' !== ch) && (ch !== quote)');
function visit94_459_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][2].init(100, 9, '-1 !== ch');
function visit93_458_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].init(100, 116, '(-1 !== ch) && (\'\\\\\' !== ch) && (ch !== quote)');
function visit92_458_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][4].init(449, 11, '\'\\\\\' === ch');
function visit91_456_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][3].init(432, 11, '0 !== quote');
function visit90_456_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][2].init(432, 29, '(0 !== quote) && (\'\\\\\' === ch)');
function visit89_456_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['456'][1].init(417, 44, 'quoteSmart && (0 !== quote) && (\'\\\\\' === ch)');
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
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1].init(199, 22, 'Utils.isWhitespace(ch)');
function visit80_415_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['412'][1].init(70, 9, '\'>\' == ch');
function visit79_412_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['404'][1].init(81, 9, '\'-\' == ch');
function visit78_404_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['399'][1].init(207, 8, '-1 == ch');
function visit77_399_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1].init(80, 9, '\'-\' == ch');
function visit76_396_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['383'][1].init(309, 9, '\'>\' == ch');
function visit75_383_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].init(169, 8, '-1 == ch');
function visit74_380_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].init(78, 9, '\'-\' == ch');
function visit73_377_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].init(167, 9, '\'-\' == ch');
function visit72_371_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1].init(77, 9, '\'>\' == ch');
function visit71_369_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].init(66, 8, '-1 == ch');
function visit70_363_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['316'][1].init(623, 9, '\'=\' == ch');
function visit69_316_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1].init(495, 22, 'Utils.isWhitespace(ch)');
function visit68_313_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['306'][1].init(144, 8, '-1 == ch');
function visit67_306_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['295'][1].init(276, 9, '\'"\' == ch');
function visit66_295_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1].init(76, 8, '-1 == ch');
function visit65_291_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['284'][1].init(276, 10, '\'\\\'\' == ch');
function visit64_284_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1].init(76, 8, '-1 == ch');
function visit63_280_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1].init(265, 22, 'Utils.isWhitespace(ch)');
function visit62_273_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][3].init(83, 9, '\'>\' == ch');
function visit61_269_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][2].init(69, 8, '-1 == ch');
function visit60_269_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1].init(69, 24, '(-1 == ch) || (\'>\' == ch)');
function visit59_269_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1].init(599, 22, 'Utils.isWhitespace(ch)');
function visit58_260_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['256'][1].init(426, 9, '\'"\' == ch');
function visit57_256_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].init(252, 10, '\'\\\'\' == ch');
function visit56_252_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][3].init(65, 9, '\'>\' == ch');
function visit55_248_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][2].init(51, 8, '-1 == ch');
function visit54_248_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].init(51, 24, '(-1 == ch) || (\'>\' == ch)');
function visit53_248_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1].init(986, 9, '\'=\' == ch');
function visit52_243_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].init(581, 22, 'Utils.isWhitespace(ch)');
function visit51_237_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].init(34, 9, '\'<\' == ch');
function visit50_229_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][5].init(116, 9, '\'<\' == ch');
function visit49_228_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][4].init(101, 9, '\'>\' == ch');
function visit48_228_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][3].init(101, 25, '(\'>\' == ch) || (\'<\' == ch)');
function visit47_228_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][2].init(87, 8, '-1 == ch');
function visit46_228_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1].init(87, 39, '(-1 == ch) || (\'>\' == ch) || (\'<\' == ch)');
function visit45_228_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2].init(441, 9, 'ch == "/"');
function visit44_220_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1].init(441, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit43_220_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][2].init(81, 9, 'ch == "/"');
function visit42_215_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1].init(81, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit41_215_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].init(90, 18, '!attributes.length');
function visit40_213_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1].init(34, 9, '\'<\' == ch');
function visit39_205_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][5].init(114, 9, '\'<\' == ch');
function visit38_204_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][4].init(101, 9, '\'>\' == ch');
function visit37_204_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][3].init(101, 22, '\'>\' == ch || \'<\' == ch');
function visit36_204_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][2].init(89, 8, 'ch == -1');
function visit35_204_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1].init(89, 34, 'ch == -1 || \'>\' == ch || \'<\' == ch');
function visit34_204_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][3].init(36, 9, 'ch === -1');
function visit33_183_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][2].init(36, 30, 'ch === -1 && attributes.length');
function visit32_183_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][1].init(26, 40, 'strict && ch === -1 && attributes.length');
function visit31_183_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['181'][1].init(340, 6, 'strict');
function visit30_181_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['132'][1].init(92, 10, '2 > length');
function visit29_132_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].init(100, 12, '0 !== length');
function visit28_131_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1].init(80, 5, 'l > 0');
function visit27_121_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['111'][1].init(80, 5, 'l > 0');
function visit26_111_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['96'][1].init(92, 10, '2 > length');
function visit25_96_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['95'][1].init(85, 12, '0 !== length');
function visit24_95_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].init(124, 9, '\'-\' == ch');
function visit23_67_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['63'][1].init(34, 9, '\'>\' == ch');
function visit22_63_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['60'][1].init(82, 8, 'ch == -1');
function visit21_60_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][3].init(382, 9, '\'?\' == ch');
function visit20_58_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][2].init(369, 9, '\'!\' == ch');
function visit19_58_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1].init(369, 22, '\'!\' == ch || \'?\' == ch');
function visit18_58_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][2].init(199, 9, 'ch == \'/\'');
function visit17_55_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].init(199, 31, 'ch == \'/\' || Utils.isLetter(ch)');
function visit16_55_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1].init(82, 8, 'ch == -1');
function visit15_53_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['53'][1].ranCondition(result);
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38]++;
  var start, ch, ret, cursor = this.cursor, page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44]++;
  start = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45]++;
  ch = page.getChar(cursor);
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47]++;
  switch (ch) {
    case -1:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49]++;
      ret = null;
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50]++;
      break;
    case '<':
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52]++;
      ch = page.getChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53]++;
      if (visit15_53_1(ch == -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55]++;
        if (visit16_55_1(visit17_55_2(ch == '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[57]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[58]++;
          if (visit18_58_1(visit19_58_2('!' == ch) || visit20_58_3('?' == ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[59]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[60]++;
            if (visit21_60_1(ch == -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[63]++;
              if (visit22_63_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[64]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
                if (visit23_67_1('-' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
                  ret = this.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
                  ret = this.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[78]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[79]++;
            ret = this.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84]++;
      ret = this.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[85]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88]++;
  return (ret);
}, 
  makeComment: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[95]++;
  if (visit24_95_1(0 !== length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[96]++;
    if (visit25_96_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100]++;
    ret = this.nodeFactory.createCommentNode(this.page, start, end);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[105]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[109]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[110]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111]++;
  if (visit26_111_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[119]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121]++;
  if (visit27_121_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[130]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131]++;
  if (visit28_131_1(0 !== length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132]++;
    if (visit29_132_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[136]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[139]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[153]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[157]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[171]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181]++;
  if (visit30_181_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[182]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183]++;
  if (visit31_183_1(strict && visit32_183_2(visit33_183_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[184]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[196]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[199]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[201]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[204]++;
        if (visit34_204_1(visit35_204_2(ch == -1) || visit36_204_3(visit37_204_4('>' == ch) || visit38_204_5('<' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205]++;
          if (visit39_205_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
          if (visit40_213_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215]++;
            if (visit41_215_1(visit42_215_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220]++;
            if (visit43_220_1(visit44_220_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[228]++;
        if (visit45_228_1((visit46_228_2(-1 == ch)) || visit47_228_3((visit48_228_4('>' == ch)) || (visit49_228_5('<' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229]++;
          if (visit50_229_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[232]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237]++;
          if (visit51_237_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[243]++;
            if (visit52_243_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248]++;
        if (visit53_248_1((visit54_248_2(-1 == ch)) || (visit55_248_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
          if (visit56_252_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[253]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
            if (visit57_256_1('"' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[260]++;
              if (visit58_260_1(Utils.isWhitespace(ch))) {
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[269]++;
        if (visit59_269_1((visit60_269_2(-1 == ch)) || (visit61_269_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[271]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
          if (visit62_273_1(Utils.isWhitespace(ch))) {
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
        if (visit63_280_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
          this.single_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[282]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
          if (visit64_284_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285]++;
            this.single_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[286]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
        if (visit65_291_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
          this.double_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[293]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[295]++;
          if (visit66_295_1('"' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[296]++;
            this.double_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[306]++;
        if (visit67_306_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[313]++;
          if (visit68_313_1(Utils.isWhitespace(ch))) {
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316]++;
            if (visit69_316_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[318]++;
              bookmarks[2] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[319]++;
              bookmarks[3] = bookmarks[7];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
              state = 2;
            } else {
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
        throw new Error("how ** did we get in state " + state);
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
    if (visit70_363_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[367]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369]++;
          if (visit71_369_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[370]++;
            done = true;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
          if (visit72_371_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[372]++;
            state = 1;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377]++;
          if (visit73_377_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[379]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
            if (visit74_380_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383]++;
              if (visit75_383_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[384]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[387]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[392]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
          if (visit76_396_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[397]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399]++;
            if (visit77_399_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[400]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404]++;
          if (visit78_404_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[405]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[408]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[410]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[412]++;
          if (visit79_412_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[413]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415]++;
            if (visit80_415_1(Utils.isWhitespace(ch))) {
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[421]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[423]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[425]++;
          throw new Error("how ** did we get in state " + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[430]++;
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
        if (visit88_456_1(quoteSmart && visit89_456_2((visit90_456_3(0 !== quote)) && (visit91_456_4('\\' === ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
          if (visit92_458_1((visit93_458_2(-1 !== ch)) && visit94_459_1((visit95_459_2('\\' !== ch)) && (visit96_460_1(ch !== quote))))) {
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
                  } while (visit105_480_1((visit106_480_2(-1 !== ch)) && (visit107_480_3('\n' !== ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
                  if (visit108_482_1('*' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[486]++;
                        ch = page.getChar(cursor);
                      } while (visit109_487_1((visit110_487_2(-1 !== ch)) && (visit111_487_3('*' !== ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[488]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[489]++;
                      if (visit112_489_1(ch == '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit113_493_1((visit114_493_2(-1 !== ch)) && (visit115_493_3('/' !== ch))));
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[533]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[549]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558]++;
            if (visit126_558_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
              if (visit127_559_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561]++;
                if (visit128_561_1('\'' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[565]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
            if (visit129_567_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568]++;
              if (visit130_568_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                if (visit131_570_1('"' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576]++;
            if (visit132_576_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577]++;
              if (visit133_577_1('' !== quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[578]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
                if (visit134_579_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581]++;
                  if (visit135_581_1((visit136_581_2(ch !== '\\')) && (visit137_581_3(ch !== quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[583]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
            if (visit138_589_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590]++;
              if (visit139_590_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
                if (visit140_593_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
                  if (visit141_595_1('/' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597]++;
                    if (visit142_597_1('*' == ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[598]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[599]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[600]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit143_601_1((visit144_601_2(-1 !== ch)) && (visit145_601_3('*' !== ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[602]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603]++;
                        if (visit146_603_1(ch == '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[604]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit147_606_1((visit148_606_2(-1 !== ch)) && (visit149_606_3('/' !== ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[613]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[615]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618]++;
            if (visit150_618_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[619]++;
              if (visit151_619_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[628]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[634]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[649]++;
            if (visit152_649_1(!tagName || (visit153_649_2(visit154_649_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
            if (visit155_661_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[663]++;
              if (visit156_663_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[664]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
                if (visit157_665_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
                  if (visit158_667_1('-' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
        if (visit159_683_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[685]++;
          if (visit160_685_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699]++;
        if (visit161_699_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
          if (visit162_701_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[702]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
            if (visit163_703_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[704]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[705]++;
              if (visit164_705_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
                if (visit165_707_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[709]++;
                  if (visit166_709_1('>' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[714]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[715]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[719]++;
                mPage.ungetChar(mCursor);
              }
            }
          } else {
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[724]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[726]++;
        throw new Error("unexpected " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[729]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[731]++;
  return this.makeCData(start, end);
}, 
  single_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[741]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[742]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
}, 
  double_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[752]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[764]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[765]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[775]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[776]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[780]++;
  return Lexer;
}, {
  requires: ['./cursor', './page', '../nodes/text', '../nodes/cdata', '../utils', '../nodes/attribute', '../nodes/tag', '../nodes/comment']});
