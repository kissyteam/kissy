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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[85] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[101] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[115] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[117] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[125] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[299] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[341] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[342] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[343] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[345] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[348] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[351] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[358] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[420] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[426] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[427] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[428] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[429] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[438] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[501] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[523] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[524] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[526] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[533] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[638] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[639] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[651] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[685] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[727] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[748] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753] = 0;
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
}
if (! _$jscoverage['/html-parser/lexer/lexer.js'].branchData) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData = {};
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['42'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['52'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['85'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['100'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['114'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['125'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['187'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['195'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['218'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['297'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['344'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['350'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['352'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['358'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['385'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['428'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['481'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['538'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['547'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['547'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['638'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['638'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['640'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['640'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['642'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['642'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['644'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['644'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['678'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['678'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['680'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['680'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['686'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['686'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['686'][1].init(207, 9, '\'>\' == ch');
function visit158_686_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['686'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1].init(100, 8, '-1 == ch');
function visit157_684_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['684'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1].init(191, 9, '\'-\' == ch');
function visit156_682_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['682'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['680'][1].init(92, 8, '-1 == ch');
function visit155_680_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['680'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['678'][1].init(175, 9, '\'-\' == ch');
function visit154_678_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['678'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].init(84, 8, '-1 == ch');
function visit153_676_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['676'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].init(175, 18, 'Utils.isLetter(ch)');
function visit152_662_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['662'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].init(84, 8, '-1 == ch');
function visit151_660_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['660'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['644'][1].init(223, 9, '\'-\' == ch');
function visit150_644_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['644'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['642'][1].init(108, 8, '-1 == ch');
function visit149_642_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['642'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['640'][1].init(215, 9, '\'-\' == ch');
function visit148_640_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['640'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['638'][1].init(108, 8, '-1 == ch');
function visit147_638_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['638'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][3].init(1038, 115, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit146_626_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][2].init(1038, 258, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit145_626_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1].init(1025, 310, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit144_626_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['626'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1].init(42, 11, '\'\' == quote');
function visit143_596_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['596'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].init(46, 10, 'quoteSmart');
function visit142_595_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][3].init(613, 9, '\'/\' != ch');
function visit141_583_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][2].init(599, 8, '-1 != ch');
function visit140_583_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][1].init(551, 24, '(-1 != ch) && (\'/\' != ch)');
function visit139_583_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['583'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1].init(350, 9, 'ch == \'*\'');
function visit138_580_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][3].init(207, 9, '\'*\' != ch');
function visit137_578_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][2].init(193, 8, '-1 != ch');
function visit136_578_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1].init(141, 24, '(-1 != ch) && (\'*\' != ch)');
function visit135_578_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['578'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1].init(468, 9, '\'*\' == ch');
function visit134_574_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].init(341, 9, '\'/\' == ch');
function visit133_572_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].init(218, 8, '-1 == ch');
function visit132_570_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['570'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].init(42, 11, '\'\' == quote');
function visit131_567_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['567'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].init(46, 10, 'quoteSmart');
function visit130_566_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][3].init(292, 11, 'ch != quote');
function visit129_558_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][2].init(276, 10, 'ch != \'\\\\\'');
function visit128_558_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].init(276, 28, '(ch != \'\\\\\') && (ch != quote)');
function visit127_558_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].init(152, 8, '-1 == ch');
function visit126_556_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['556'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1].init(42, 11, '\'\' != quote');
function visit125_554_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['554'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].init(47, 10, 'quoteSmart');
function visit124_553_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['547'][1].init(182, 12, '\'"\' == quote');
function visit123_547_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['547'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1].init(42, 11, '\'\' == quote');
function visit122_545_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1].init(46, 22, 'quoteSmart && !comment');
function visit121_544_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['544'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['538'][1].init(183, 13, '\'\\\'\' == quote');
function visit120_538_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1].init(42, 11, '\'\' == quote');
function visit119_536_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1].init(47, 22, 'quoteSmart && !comment');
function visit118_535_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].init(81, 9, '\'?\' == ch');
function visit117_489_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].init(342, 9, '\'!\' == ch');
function visit116_487_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].init(46, 91, '\'!\' == ch || \'?\' == ch');
function visit115_487_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].init(37, 138, 'Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit114_486_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][2].init(254, 9, '\'/\' == ch');
function visit113_485_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][1].init(254, 176, '\'/\' == ch || Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit112_485_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['481'][1].init(74, 8, '-1 == ch');
function visit111_481_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][3].init(2402, 9, '\'<\' == ch');
function visit110_479_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][2].init(2386, 10, '0 == quote');
function visit109_479_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1].init(2386, 26, '(0 == quote) && (\'<\' == ch)');
function visit108_479_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3].init(481, 9, '\'/\' != ch');
function visit107_473_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].init(467, 8, '-1 != ch');
function visit106_473_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].init(439, 24, '(-1 != ch) && (\'/\' != ch)');
function visit105_473_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].init(250, 9, 'ch == \'*\'');
function visit104_469_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3].init(149, 9, '\'*\' != ch');
function visit103_467_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].init(135, 8, '-1 != ch');
function visit102_467_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].init(103, 24, '(-1 != ch) && (\'*\' != ch)');
function visit101_467_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].init(571, 9, '\'*\' == ch');
function visit100_462_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].init(137, 10, '\'\\n\' != ch');
function visit99_460_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].init(123, 8, '-1 != ch');
function visit98_460_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].init(95, 25, '(-1 != ch) && (\'\\n\' != ch)');
function visit97_460_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].init(355, 9, '\'/\' == ch');
function visit96_457_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].init(254, 8, '-1 == ch');
function visit95_454_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['454'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4].init(1129, 9, 'ch == \'/\'');
function visit94_449_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3].init(1113, 10, '0 == quote');
function visit93_449_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2].init(1113, 26, '(0 == quote) && (ch == \'/\')');
function visit92_449_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1].init(1098, 41, 'quoteSmart && (0 == quote) && (ch == \'/\')');
function visit91_449_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][2].init(983, 11, 'ch == quote');
function visit90_446_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][1].init(968, 27, 'quoteSmart && (ch == quote)');
function visit89_446_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1].init(61, 11, 'ch != quote');
function visit88_440_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2].init(141, 10, '\'\\\\\' != ch');
function visit87_439_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1].init(38, 74, '(\'\\\\\' != ch) && (ch != quote)');
function visit86_439_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][2].init(100, 8, '-1 != ch');
function visit85_438_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1].init(100, 113, '(-1 != ch) && (\'\\\\\' != ch) && (ch != quote)');
function visit84_438_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4].init(448, 10, '\'\\\\\' == ch');
function visit83_436_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3].init(432, 10, '0 != quote');
function visit82_436_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2].init(432, 27, '(0 != quote) && (\'\\\\\' == ch)');
function visit81_436_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1].init(417, 42, 'quoteSmart && (0 != quote) && (\'\\\\\' == ch)');
function visit80_436_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3].init(53, 9, '\'"\' == ch');
function visit79_432_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2].init(37, 10, '\'\\\'\' == ch');
function visit78_432_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].init(37, 26, '(\'\\\'\' == ch) || (\'"\' == ch)');
function visit77_432_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][3].init(170, 10, '0 == quote');
function visit76_431_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][2].init(170, 65, '(0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit75_431_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][1].init(155, 80, 'quoteSmart && (0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit74_431_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['428'][1].init(66, 8, '-1 == ch');
function visit73_428_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1].init(199, 22, 'Utils.isWhitespace(ch)');
function visit72_396_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].init(70, 9, '\'>\' == ch');
function visit71_393_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['385'][1].init(81, 9, '\'-\' == ch');
function visit70_385_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].init(207, 8, '-1 == ch');
function visit69_380_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].init(80, 9, '\'-\' == ch');
function visit68_377_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1].init(309, 9, '\'>\' == ch');
function visit67_364_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].init(169, 8, '-1 == ch');
function visit66_361_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['358'][1].init(78, 9, '\'-\' == ch');
function visit65_358_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['352'][1].init(167, 9, '\'-\' == ch');
function visit64_352_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['350'][1].init(77, 9, '\'>\' == ch');
function visit63_350_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['344'][1].init(66, 8, '-1 == ch');
function visit62_344_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['297'][1].init(624, 9, '\'=\' == ch');
function visit61_297_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1].init(496, 22, 'Utils.isWhitespace(ch)');
function visit60_294_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1].init(145, 8, '-1 == ch');
function visit59_287_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1].init(276, 9, '\'"\' == ch');
function visit58_276_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].init(76, 8, '-1 == ch');
function visit57_272_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].init(276, 10, '\'\\\'\' == ch');
function visit56_265_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].init(76, 8, '-1 == ch');
function visit55_261_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1].init(265, 22, 'Utils.isWhitespace(ch)');
function visit54_254_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][3].init(83, 9, '\'>\' == ch');
function visit53_250_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][2].init(69, 8, '-1 == ch');
function visit52_250_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][1].init(69, 24, '(-1 == ch) || (\'>\' == ch)');
function visit51_250_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1].init(599, 22, 'Utils.isWhitespace(ch)');
function visit50_241_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].init(426, 9, '\'"\' == ch');
function visit49_237_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1].init(252, 10, '\'\\\'\' == ch');
function visit48_233_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][3].init(65, 9, '\'>\' == ch');
function visit47_229_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2].init(51, 8, '-1 == ch');
function visit46_229_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].init(51, 24, '(-1 == ch) || (\'>\' == ch)');
function visit45_229_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].init(961, 9, '\'=\' == ch');
function visit44_224_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['218'][1].init(556, 22, 'Utils.isWhitespace(ch)');
function visit43_218_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1].init(34, 9, '\'<\' == ch');
function visit42_210_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][5].init(91, 9, '\'<\' == ch');
function visit41_209_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][4].init(76, 9, '\'>\' == ch');
function visit40_209_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][3].init(76, 25, '(\'>\' == ch) || (\'<\' == ch)');
function visit39_209_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][2].init(62, 8, '-1 == ch');
function visit38_209_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][1].init(62, 39, '(-1 == ch) || (\'>\' == ch) || (\'<\' == ch)');
function visit37_209_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][2].init(441, 9, 'ch == "/"');
function visit36_202_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][1].init(441, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit35_202_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][2].init(81, 9, 'ch == "/"');
function visit34_197_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1].init(81, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit33_197_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['195'][1].init(90, 18, '!attributes.length');
function visit32_195_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['187'][1].init(34, 9, '\'<\' == ch');
function visit31_187_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][5].init(114, 9, '\'<\' == ch');
function visit30_186_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][4].init(101, 9, '\'>\' == ch');
function visit29_186_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][3].init(101, 22, '\'>\' == ch || \'<\' == ch');
function visit28_186_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][2].init(89, 8, 'ch == -1');
function visit27_186_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][1].init(89, 34, 'ch == -1 || \'>\' == ch || \'<\' == ch');
function visit26_186_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['125'][1].init(92, 10, '2 > length');
function visit25_125_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1].init(100, 11, '0 != length');
function visit24_124_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['114'][1].init(80, 5, 'l > 0');
function visit23_114_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['100'][1].init(80, 5, 'l > 0');
function visit22_100_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['85'][1].init(92, 10, '2 > length');
function visit21_85_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1].init(85, 11, '0 != length');
function visit20_84_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['56'][1].init(124, 9, '\'-\' == ch');
function visit19_56_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['52'][1].init(34, 9, '\'>\' == ch');
function visit18_52_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['49'][1].init(82, 8, 'ch == -1');
function visit17_49_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][3].init(382, 9, '\'?\' == ch');
function visit16_47_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][2].init(369, 9, '\'!\' == ch');
function visit15_47_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][1].init(369, 22, '\'!\' == ch || \'?\' == ch');
function visit14_47_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][2].init(199, 9, 'ch == \'/\'');
function visit13_44_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][1].init(199, 31, 'ch == \'/\' || Utils.isLetter(ch)');
function visit12_44_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['42'][1].init(82, 8, 'ch == -1');
function visit11_42_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].lineData[5]++;
KISSY.add("html-parser/lexer/lexer", function(S, Cursor, Page, TextNode, CData, Utils, Attribute, TagNode, CommentNode) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7]++;
  function Lexer(text) {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8]++;
    var self = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9]++;
    self.page = new Page(text);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10]++;
    self.cursor = new Cursor();
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11]++;
    self.nodeFactory = this;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14]++;
  Lexer.prototype = {
  constructor: Lexer, 
  setPosition: function(p) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[19]++;
  this.cursor.position = p;
}, 
  getPosition: function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[23]++;
  return this.cursor.position;
}, 
  nextNode: function(quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[27]++;
  var start, ch, ret, cursor = this.cursor, page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33]++;
  start = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[34]++;
  ch = page.getChar(cursor);
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[36]++;
  switch (ch) {
    case -1:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38]++;
      ret = null;
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[39]++;
      break;
    case '<':
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[41]++;
      ch = page.getChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42]++;
      if (visit11_42_1(ch == -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[43]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44]++;
        if (visit12_44_1(visit13_44_2(ch == '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[46]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47]++;
          if (visit14_47_1(visit15_47_2('!' == ch) || visit16_47_3('?' == ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49]++;
            if (visit17_49_1(ch == -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[50]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52]++;
              if (visit18_52_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[53]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56]++;
                if (visit19_56_1('-' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[57]++;
                  ret = this.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[62]++;
                  ret = this.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[68]++;
            ret = this.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[70]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
      ret = this.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[74]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[77]++;
  return (ret);
}, 
  makeComment: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[81]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84]++;
  if (visit20_84_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[85]++;
    if (visit21_85_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[87]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[89]++;
    ret = this.nodeFactory.createCommentNode(this.page, start, end);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[92]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[94]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[99]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100]++;
  if (visit22_100_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[101]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[103]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[113]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114]++;
  if (visit23_114_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[115]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[117]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[121]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124]++;
  if (visit24_124_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[125]++;
    if (visit25_125_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[127]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[129]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[132]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[134]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[138]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[142]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[146]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[150]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[164]++;
  var done, bookmarks = [], attributes = [], ch, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[177]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[178]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[180]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[181]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[183]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[186]++;
        if (visit26_186_1(visit27_186_2(ch == -1) || visit28_186_3(visit29_186_4('>' == ch) || visit30_186_5('<' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[187]++;
          if (visit31_187_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[189]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[192]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[195]++;
          if (visit32_195_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197]++;
            if (visit33_197_1(visit34_197_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[198]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202]++;
            if (visit35_202_1(visit36_202_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[203]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[206]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[209]++;
        if (visit37_209_1((visit38_209_2(-1 == ch)) || visit39_209_3((visit40_209_4('>' == ch)) || (visit41_209_5('<' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[210]++;
          if (visit42_210_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[215]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[218]++;
          if (visit43_218_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[222]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
            if (visit44_224_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[225]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229]++;
        if (visit45_229_1((visit46_229_2(-1 == ch)) || (visit47_229_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[230]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[231]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233]++;
          if (visit48_233_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[234]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237]++;
            if (visit49_237_1('"' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[238]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[239]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
              if (visit50_241_1(Utils.isWhitespace(ch))) {
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[247]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250]++;
        if (visit51_250_1((visit52_250_2(-1 == ch)) || (visit53_250_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[251]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[254]++;
          if (visit54_254_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[255]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[256]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[257]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
        if (visit55_261_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262]++;
          this.single_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265]++;
          if (visit56_265_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
            this.single_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272]++;
        if (visit57_272_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
          this.double_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
          if (visit58_276_1('"' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277]++;
            this.double_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287]++;
        if (visit59_287_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[291]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[294]++;
          if (visit60_294_1(Utils.isWhitespace(ch))) {
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[297]++;
            if (visit61_297_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[299]++;
              bookmarks[2] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300]++;
              bookmarks[3] = bookmarks[7];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[309]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[314]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[316]++;
        throw new Error("how ** did we get in state " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[334]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[340]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[341]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[342]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[343]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[344]++;
    if (visit62_344_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[345]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[348]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[350]++;
          if (visit63_350_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[351]++;
            done = true;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[352]++;
          if (visit64_352_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353]++;
            state = 1;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[358]++;
          if (visit65_358_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[360]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
            if (visit66_361_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[362]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
              if (visit67_364_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377]++;
          if (visit68_377_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[380]++;
            if (visit69_380_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[383]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[385]++;
          if (visit70_385_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[389]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393]++;
          if (visit71_393_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
            if (visit72_396_1(Utils.isWhitespace(ch))) {
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406]++;
          throw new Error("how ** did we get in state " + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[411]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[420]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[426]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[427]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[428]++;
    if (visit73_428_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[429]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[431]++;
      if (visit74_431_1(quoteSmart && visit75_431_2((visit76_431_3(0 == quote)) && (visit77_432_1((visit78_432_2('\'' == ch)) || (visit79_432_3('"' == ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[436]++;
        if (visit80_436_1(quoteSmart && visit81_436_2((visit82_436_3(0 != quote)) && (visit83_436_4('\\' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[437]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[438]++;
          if (visit84_438_1((visit85_438_2(-1 != ch)) && visit86_439_1((visit87_439_2('\\' != ch)) && (visit88_440_1(ch != quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[443]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446]++;
          if (visit89_446_1(quoteSmart && (visit90_446_2(ch == quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[447]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
            if (visit91_449_1(quoteSmart && visit92_449_2((visit93_449_3(0 == quote)) && (visit94_449_4(ch == '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[453]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[454]++;
              if (visit95_454_1(-1 == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[455]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[457]++;
                if (visit96_457_1('/' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[458]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459]++;
                    ch = page.getChar(cursor);
                  } while (visit97_460_1((visit98_460_2(-1 != ch)) && (visit99_460_3('\n' != ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462]++;
                  if (visit100_462_1('*' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[463]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[465]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466]++;
                        ch = page.getChar(cursor);
                      } while (visit101_467_1((visit102_467_2(-1 != ch)) && (visit103_467_3('*' != ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[469]++;
                      if (visit104_469_1(ch == '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit105_473_1((visit106_473_2(-1 != ch)) && (visit107_473_3('/' != ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479]++;
              if (visit108_479_1((visit109_479_2(0 == quote)) && (visit110_479_3('<' == ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[480]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481]++;
                if (visit111_481_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[485]++;
                  if (visit112_485_1(visit113_485_2('/' == ch) || visit114_486_1(Utils.isLetter(ch) || visit115_487_1(visit116_487_2('!' == ch) || visit117_489_1('?' == ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[490]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[491]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[496]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[501]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[510]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[520]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[521]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[522]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[523]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[524]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[526]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[527]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[528]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[530]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[532]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[533]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535]++;
            if (visit118_535_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536]++;
              if (visit119_536_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538]++;
                if (visit120_538_1('\'' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[544]++;
            if (visit121_544_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
              if (visit122_545_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[546]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547]++;
                if (visit123_547_1('"' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553]++;
            if (visit124_553_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
              if (visit125_554_1('' != quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[555]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[556]++;
                if (visit126_556_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[558]++;
                  if (visit127_558_1((visit128_558_2(ch != '\\')) && (visit129_558_3(ch != quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[564]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
            if (visit130_566_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[567]++;
              if (visit131_567_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                if (visit132_570_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572]++;
                  if (visit133_572_1('/' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[574]++;
                    if (visit134_574_1('*' == ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[576]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[577]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit135_578_1((visit136_578_2(-1 != ch)) && (visit137_578_3('*' != ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[580]++;
                        if (visit138_580_1(ch == '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit139_583_1((visit140_583_2(-1 != ch)) && (visit141_583_3('/' != ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[593]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
            if (visit142_595_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
              if (visit143_596_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[597]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[603]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[609]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626]++;
            if (visit144_626_1(!tagName || (visit145_626_2(visit146_626_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[630]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[632]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[635]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[637]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[638]++;
            if (visit147_638_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[639]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[640]++;
              if (visit148_640_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[642]++;
                if (visit149_642_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[643]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[644]++;
                  if (visit150_644_1('-' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[651]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660]++;
        if (visit151_660_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[661]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
          if (visit152_662_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[665]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[668]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[671]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[673]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
        if (visit153_676_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[678]++;
          if (visit154_678_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[679]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680]++;
            if (visit155_680_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[681]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
              if (visit156_682_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
                if (visit157_684_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[685]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686]++;
                  if (visit158_686_1('>' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696]++;
                mPage.ungetChar(mCursor);
              }
            }
          } else {
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
        throw new Error("unexpected " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[708]++;
  return this.makeCData(start, end);
}, 
  single_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[717]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
}, 
  double_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[727]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[728]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[738]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[739]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[748]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[749]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753]++;
  return Lexer;
}, {
  requires: ['./cursor', './page', '../nodes/text', '../nodes/cdata', '../utils', '../nodes/attribute', '../nodes/tag', '../nodes/comment']});
