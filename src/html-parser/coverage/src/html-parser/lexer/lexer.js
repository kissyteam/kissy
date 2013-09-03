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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[32] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[80] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[86] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[188] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[232] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[323] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[333] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[347] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[358] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[390] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[417] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[419] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[440] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[441] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[442] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[450] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[489] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[493] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[498] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[503] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[504] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[509] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[610] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[656] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[721] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[732] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[733] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[742] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[743] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[754] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[763] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[764] = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[768] = 0;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['11'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['83'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['113'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['123'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['173'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][5] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['244'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['298'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['357'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['365'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['374'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['390'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['406'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['409'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['441'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['453'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][4] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['470'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['551'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['551'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['582'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['582'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['611'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['611'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][2] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][3] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['653'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['653'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['655'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['655'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['657'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['657'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['659'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['659'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['675'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['675'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['677'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['677'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['691'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['691'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['693'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['693'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['695'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['695'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1] = new BranchData();
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'] = [];
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1] = new BranchData();
}
_$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].init(207, 9, '\'>\' == ch');
function visit166_701_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['701'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].init(100, 8, '-1 == ch');
function visit165_699_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['699'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1].init(191, 9, '\'-\' == ch');
function visit164_697_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['697'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['695'][1].init(92, 8, '-1 == ch');
function visit163_695_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['695'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['693'][1].init(175, 9, '\'-\' == ch');
function visit162_693_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['693'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['691'][1].init(84, 8, '-1 == ch');
function visit161_691_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['691'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['677'][1].init(175, 18, 'Utils.isLetter(ch)');
function visit160_677_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['677'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['675'][1].init(84, 8, '-1 == ch');
function visit159_675_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['675'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['659'][1].init(223, 9, '\'-\' == ch');
function visit158_659_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['659'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['657'][1].init(108, 8, '-1 == ch');
function visit157_657_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['657'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['655'][1].init(215, 9, '\'-\' == ch');
function visit156_655_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['655'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['653'][1].init(108, 8, '-1 == ch');
function visit155_653_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['653'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][3].init(1038, 115, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName');
function visit154_641_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][2].init(1038, 258, 'mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/))');
function visit153_641_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][1].init(1025, 310, '!tagName || (mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\\w/)))');
function visit152_641_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['641'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['611'][1].init(42, 11, '\'\' == quote');
function visit151_611_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['611'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1].init(46, 10, 'quoteSmart');
function visit150_610_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['610'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3].init(613, 9, '\'/\' != ch');
function visit149_598_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2].init(599, 8, '-1 != ch');
function visit148_598_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].init(551, 24, '(-1 != ch) && (\'/\' != ch)');
function visit147_598_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].init(350, 9, 'ch == \'*\'');
function visit146_595_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][3].init(207, 9, '\'*\' != ch');
function visit145_593_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][2].init(193, 8, '-1 != ch');
function visit144_593_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1].init(141, 24, '(-1 != ch) && (\'*\' != ch)');
function visit143_593_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['593'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].init(468, 9, '\'*\' == ch');
function visit142_589_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['589'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1].init(341, 9, '\'/\' == ch');
function visit141_587_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['587'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].init(218, 8, '-1 == ch');
function visit140_585_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['582'][1].init(42, 11, '\'\' == quote');
function visit139_582_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['582'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1].init(46, 10, 'quoteSmart');
function visit138_581_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['581'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3].init(292, 11, 'ch != quote');
function visit137_573_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2].init(276, 10, 'ch != \'\\\\\'');
function visit136_573_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1].init(276, 28, '(ch != \'\\\\\') && (ch != quote)');
function visit135_573_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1].init(152, 8, '-1 == ch');
function visit134_571_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1].init(42, 11, '\'\' != quote');
function visit133_569_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].init(47, 10, 'quoteSmart');
function visit132_568_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].init(182, 12, '\'"\' == quote');
function visit131_562_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['562'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].init(42, 11, '\'\' == quote');
function visit130_560_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['560'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].init(46, 22, 'quoteSmart && !comment');
function visit129_559_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].init(183, 13, '\'\\\'\' == quote');
function visit128_553_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['553'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['551'][1].init(42, 11, '\'\' == quote');
function visit127_551_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['551'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1].init(47, 22, 'quoteSmart && !comment');
function visit126_550_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['550'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].init(81, 9, '\'?\' == ch');
function visit125_502_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2].init(342, 9, '\'!\' == ch');
function visit124_500_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1].init(46, 91, '\'!\' == ch || \'?\' == ch');
function visit123_500_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].init(37, 138, 'Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit122_499_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][2].init(254, 9, '\'/\' == ch');
function visit121_498_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1].init(254, 176, '\'/\' == ch || Utils.isLetter(ch) || \'!\' == ch || \'?\' == ch');
function visit120_498_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['498'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1].init(74, 8, '-1 == ch');
function visit119_494_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][3].init(2402, 9, '\'<\' == ch');
function visit118_492_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][2].init(2386, 10, '0 == quote');
function visit117_492_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][1].init(2386, 26, '(0 == quote) && (\'<\' == ch)');
function visit116_492_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][3].init(481, 9, '\'/\' != ch');
function visit115_486_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][2].init(467, 8, '-1 != ch');
function visit114_486_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].init(439, 24, '(-1 != ch) && (\'/\' != ch)');
function visit113_486_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].init(250, 9, 'ch == \'*\'');
function visit112_482_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].init(149, 9, '\'*\' != ch');
function visit111_480_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].init(135, 8, '-1 != ch');
function visit110_480_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1].init(103, 24, '(-1 != ch) && (\'*\' != ch)');
function visit109_480_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].init(571, 9, '\'*\' == ch');
function visit108_475_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3].init(137, 10, '\'\\n\' != ch');
function visit107_473_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].init(123, 8, '-1 != ch');
function visit106_473_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].init(95, 25, '(-1 != ch) && (\'\\n\' != ch)');
function visit105_473_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['470'][1].init(355, 9, '\'/\' == ch');
function visit104_470_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].init(254, 8, '-1 == ch');
function visit103_467_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][4].init(1129, 9, 'ch == \'/\'');
function visit102_462_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3].init(1113, 10, '0 == quote');
function visit101_462_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2].init(1113, 26, '(0 == quote) && (ch == \'/\')');
function visit100_462_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].init(1098, 41, 'quoteSmart && (0 == quote) && (ch == \'/\')');
function visit99_462_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].init(983, 11, 'ch == quote');
function visit98_459_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].init(968, 27, 'quoteSmart && (ch == quote)');
function visit97_459_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['453'][1].init(61, 11, 'ch != quote');
function visit96_453_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].init(141, 10, '\'\\\\\' != ch');
function visit95_452_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].init(38, 74, '(\'\\\\\' != ch) && (ch != quote)');
function visit94_452_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2].init(100, 8, '-1 != ch');
function visit93_451_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1].init(100, 113, '(-1 != ch) && (\'\\\\\' != ch) && (ch != quote)');
function visit92_451_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4].init(448, 10, '\'\\\\\' == ch');
function visit91_449_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3].init(432, 10, '0 != quote');
function visit90_449_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2].init(432, 27, '(0 != quote) && (\'\\\\\' == ch)');
function visit89_449_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1].init(417, 42, 'quoteSmart && (0 != quote) && (\'\\\\\' == ch)');
function visit88_449_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3].init(53, 9, '\'"\' == ch');
function visit87_445_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].init(37, 10, '\'\\\'\' == ch');
function visit86_445_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].init(37, 26, '(\'\\\'\' == ch) || (\'"\' == ch)');
function visit85_445_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][3].init(170, 10, '0 == quote');
function visit84_444_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][2].init(170, 65, '(0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit83_444_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][1].init(155, 80, 'quoteSmart && (0 == quote) && ((\'\\\'\' == ch) || (\'"\' == ch))');
function visit82_444_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['441'][1].init(66, 8, '-1 == ch');
function visit81_441_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['409'][1].init(199, 22, 'Utils.isWhitespace(ch)');
function visit80_409_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['406'][1].init(70, 9, '\'>\' == ch');
function visit79_406_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1].init(81, 9, '\'-\' == ch');
function visit78_398_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].init(207, 8, '-1 == ch');
function visit77_393_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['390'][1].init(80, 9, '\'-\' == ch');
function visit76_390_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].init(309, 9, '\'>\' == ch');
function visit75_377_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['374'][1].init(169, 8, '-1 == ch');
function visit74_374_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].init(78, 9, '\'-\' == ch');
function visit73_371_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['365'][1].init(167, 9, '\'-\' == ch');
function visit72_365_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].init(77, 9, '\'>\' == ch');
function visit71_363_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['357'][1].init(66, 8, '-1 == ch');
function visit70_357_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1].init(623, 9, '\'=\' == ch');
function visit69_308_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1].init(495, 22, 'Utils.isWhitespace(ch)');
function visit68_305_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['298'][1].init(144, 8, '-1 == ch');
function visit67_298_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1].init(276, 9, '\'"\' == ch');
function visit66_287_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].init(76, 8, '-1 == ch');
function visit65_283_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1].init(276, 10, '\'\\\'\' == ch');
function visit64_276_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].init(76, 8, '-1 == ch');
function visit63_272_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].init(265, 22, 'Utils.isWhitespace(ch)');
function visit62_265_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][3].init(83, 9, '\'>\' == ch');
function visit61_261_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][2].init(69, 8, '-1 == ch');
function visit60_261_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].init(69, 24, '(-1 == ch) || (\'>\' == ch)');
function visit59_261_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].init(599, 22, 'Utils.isWhitespace(ch)');
function visit58_252_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].init(426, 9, '\'"\' == ch');
function visit57_248_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['244'][1].init(252, 10, '\'\\\'\' == ch');
function visit56_244_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][3].init(65, 9, '\'>\' == ch');
function visit55_240_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][2].init(51, 8, '-1 == ch');
function visit54_240_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][1].init(51, 24, '(-1 == ch) || (\'>\' == ch)');
function visit53_240_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1].init(986, 9, '\'=\' == ch');
function visit52_235_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].init(581, 22, 'Utils.isWhitespace(ch)');
function visit51_229_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].init(34, 9, '\'<\' == ch');
function visit50_221_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][5].init(116, 9, '\'<\' == ch');
function visit49_220_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][4].init(101, 9, '\'>\' == ch');
function visit48_220_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][3].init(101, 25, '(\'>\' == ch) || (\'<\' == ch)');
function visit47_220_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2].init(87, 8, '-1 == ch');
function visit46_220_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1].init(87, 39, '(-1 == ch) || (\'>\' == ch) || (\'<\' == ch)');
function visit45_220_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2].init(441, 9, 'ch == "/"');
function visit44_212_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].init(441, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit43_212_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][2].init(81, 9, 'ch == "/"');
function visit42_207_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][1].init(81, 52, 'ch == "/" || Utils.isValidAttributeNameStartChar(ch)');
function visit41_207_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1].init(90, 18, '!attributes.length');
function visit40_205_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1].init(34, 9, '\'<\' == ch');
function visit39_197_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][5].init(114, 9, '\'<\' == ch');
function visit38_196_5(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][5].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][4].init(101, 9, '\'>\' == ch');
function visit37_196_4(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][4].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][3].init(101, 22, '\'>\' == ch || \'<\' == ch');
function visit36_196_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][2].init(89, 8, 'ch == -1');
function visit35_196_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][1].init(89, 34, 'ch == -1 || \'>\' == ch || \'<\' == ch');
function visit34_196_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][3].init(36, 9, 'ch === -1');
function visit33_175_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][2].init(36, 30, 'ch === -1 && attributes.length');
function visit32_175_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][1].init(26, 40, 'strict && ch === -1 && attributes.length');
function visit31_175_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['173'][1].init(340, 6, 'strict');
function visit30_173_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1].init(92, 10, '2 > length');
function visit29_124_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['123'][1].init(100, 11, '0 != length');
function visit28_123_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['113'][1].init(80, 5, 'l > 0');
function visit27_113_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['99'][1].init(80, 5, 'l > 0');
function visit26_99_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1].init(92, 10, '2 > length');
function visit25_84_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['83'][1].init(85, 11, '0 != length');
function visit24_83_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].init(124, 9, '\'-\' == ch');
function visit23_55_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['51'][1].init(34, 9, '\'>\' == ch');
function visit22_51_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1].init(82, 8, 'ch == -1');
function visit21_48_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][3].init(382, 9, '\'?\' == ch');
function visit20_46_3(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][2].init(369, 9, '\'!\' == ch');
function visit19_46_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][1].init(369, 22, '\'!\' == ch || \'?\' == ch');
function visit18_46_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][2].init(199, 9, 'ch == \'/\'');
function visit17_43_2(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][1].init(199, 31, 'ch == \'/\' || Utils.isLetter(ch)');
function visit16_43_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['41'][1].init(82, 8, 'ch == -1');
function visit15_41_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].branchData['11'][1].init(155, 9, 'cfg || {}');
function visit14_11_1(result) {
  _$jscoverage['/html-parser/lexer/lexer.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/lexer/lexer.js'].lineData[5]++;
KISSY.add("html-parser/lexer/lexer", function(S, Cursor, Page, TextNode, CData, Utils, Attribute, TagNode, CommentNode) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[0]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[6]++;
  function Lexer(text, cfg) {
    _$jscoverage['/html-parser/lexer/lexer.js'].functionData[1]++;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[7]++;
    var self = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[8]++;
    self.page = new Page(text);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[9]++;
    self.cursor = new Cursor();
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[10]++;
    self.nodeFactory = this;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[11]++;
    this.cfg = visit14_11_1(cfg || {});
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[14]++;
  Lexer.prototype = {
  constructor: Lexer, 
  setPosition: function(p) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[2]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[18]++;
  this.cursor.position = p;
}, 
  getPosition: function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[3]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[22]++;
  return this.cursor.position;
}, 
  nextNode: function(quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[4]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[26]++;
  var start, ch, ret, cursor = this.cursor, page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[32]++;
  start = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[33]++;
  ch = page.getChar(cursor);
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[35]++;
  switch (ch) {
    case -1:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[37]++;
      ret = null;
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[38]++;
      break;
    case '<':
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[40]++;
      ch = page.getChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[41]++;
      if (visit15_41_1(ch == -1)) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[42]++;
        ret = this.makeString(start, cursor.position);
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[43]++;
        if (visit16_43_1(visit17_43_2(ch == '/') || Utils.isLetter(ch))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[44]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[45]++;
          ret = this.parseTag(start);
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[46]++;
          if (visit18_46_1(visit19_46_2('!' == ch) || visit20_46_3('?' == ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[47]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[48]++;
            if (visit21_48_1(ch == -1)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[49]++;
              ret = this.makeString(start, cursor.position);
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[51]++;
              if (visit22_51_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[52]++;
                ret = this.makeComment(start, cursor.position);
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[54]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[55]++;
                if (visit23_55_1('-' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[56]++;
                  ret = this.parseComment(start, quoteSmart);
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[60]++;
                  page.ungetChar(cursor);
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[61]++;
                  ret = this.parseTag(start);
                }
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[66]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[67]++;
            ret = this.parseString(start, quoteSmart);
          }
        }
      }
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[69]++;
      break;
    default:
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[71]++;
      page.ungetChar(cursor);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[72]++;
      ret = this.parseString(start, quoteSmart);
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[73]++;
      break;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[76]++;
  return (ret);
}, 
  makeComment: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[5]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[80]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[82]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[83]++;
  if (visit24_83_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[84]++;
    if (visit25_84_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[86]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[88]++;
    ret = this.nodeFactory.createCommentNode(this.page, start, end);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[91]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[93]++;
  return (ret);
}, 
  makeString: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[6]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[97]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[98]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[99]++;
  if (visit26_99_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[100]++;
    ret = this.nodeFactory.createStringNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[102]++;
  return ret;
}, 
  makeCData: function(start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[7]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[111]++;
  var ret = null, l;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[112]++;
  l = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[113]++;
  if (visit27_113_1(l > 0)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[114]++;
    ret = this.nodeFactory.createCDataNode(this.page, start, end);
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[116]++;
  return ret;
}, 
  makeTag: function(start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[8]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[120]++;
  var length, ret;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[122]++;
  length = end - start;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[123]++;
  if (visit28_123_1(0 != length)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[124]++;
    if (visit29_124_1(2 > length)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[126]++;
      return (this.makeString(start, end));
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[128]++;
    ret = this.nodeFactory.createTagNode(this.page, start, end, attributes);
  } else {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[131]++;
    ret = null;
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[133]++;
  return ret;
}, 
  createTagNode: function(page, start, end, attributes) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[9]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[137]++;
  return new TagNode(page, start, end, attributes);
}, 
  createStringNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[10]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[141]++;
  return new TextNode(page, start, end);
}, 
  createCDataNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[11]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[145]++;
  return new CData(page, start, end);
}, 
  createCommentNode: function(page, start, end) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[12]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[149]++;
  return new CommentNode(page, start, end);
}, 
  parseTag: function(start) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[13]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[163]++;
  var done, bookmarks = [], attributes = [], ch, cfg = this.cfg, strict = cfg.strict, checkError = S.noop, page = this.page, state = 0, cursor = this.cursor;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[173]++;
  if (visit30_173_1(strict)) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[174]++;
    checkError = function() {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[14]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[175]++;
  if (visit31_175_1(strict && visit32_175_2(visit33_175_3(ch === -1) && attributes.length))) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[176]++;
    throw new Error(attributes[0].name + ' syntax error at row ' + (page.row(cursor) + 1) + ' , col ' + (page.col(cursor) + 1));
  }
};
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[187]++;
  bookmarks[0] = cursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[188]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[190]++;
    bookmarks[state + 1] = cursor.position;
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[191]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[193]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[196]++;
        if (visit34_196_1(visit35_196_2(ch == -1) || visit36_196_3(visit37_196_4('>' == ch) || visit38_196_5('<' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[197]++;
          if (visit39_197_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[199]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[200]++;
            bookmarks[state + 1] = cursor.position;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[202]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[205]++;
          if (visit40_205_1(!attributes.length)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[207]++;
            if (visit41_207_1(visit42_207_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[208]++;
              state = 1;
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[212]++;
            if (visit43_212_1(visit44_212_2(ch == "/") || Utils.isValidAttributeNameStartChar(ch))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[213]++;
              state = 1;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[216]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[220]++;
        if (visit45_220_1((visit46_220_2(-1 == ch)) || visit47_220_3((visit48_220_4('>' == ch)) || (visit49_220_5('<' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[221]++;
          if (visit50_221_1('<' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[223]++;
            page.ungetChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[224]++;
            bookmarks[state + 1] = cursor.getPosition;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[226]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[227]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[229]++;
          if (visit51_229_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[232]++;
            bookmarks[6] = bookmarks[2];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[233]++;
            state = 6;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[235]++;
            if (visit52_235_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[236]++;
              state = 2;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[237]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[240]++;
        if (visit53_240_1((visit54_240_2(-1 == ch)) || (visit55_240_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[241]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[242]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[244]++;
          if (visit56_244_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[245]++;
            state = 4;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[246]++;
            bookmarks[4] = bookmarks[3];
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[248]++;
            if (visit57_248_1('"' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[249]++;
              state = 5;
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[250]++;
              bookmarks[5] = bookmarks[3];
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[252]++;
              if (visit58_252_1(Utils.isWhitespace(ch))) {
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[258]++;
                state = 3;
              }
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[259]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[261]++;
        if (visit59_261_1((visit60_261_2(-1 == ch)) || (visit61_261_3('>' == ch)))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[262]++;
          this.naked(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[263]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[265]++;
          if (visit62_265_1(Utils.isWhitespace(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[266]++;
            this.naked(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[267]++;
            bookmarks[0] = bookmarks[4];
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[268]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[270]++;
        break;
      case 4:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[272]++;
        if (visit63_272_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[273]++;
          this.single_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[274]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[276]++;
          if (visit64_276_1('\'' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[277]++;
            this.single_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[278]++;
            bookmarks[0] = bookmarks[5] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[279]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[281]++;
        break;
      case 5:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[283]++;
        if (visit65_283_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[284]++;
          this.double_quote(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[285]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[287]++;
          if (visit66_287_1('"' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[288]++;
            this.double_quote(attributes, bookmarks);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[289]++;
            bookmarks[0] = bookmarks[6] + 1;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[290]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[292]++;
        break;
      case 6:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[298]++;
        if (visit67_298_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[300]++;
          this.standalone(attributes, bookmarks);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[301]++;
          bookmarks[0] = bookmarks[6];
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[302]++;
          page.ungetChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[303]++;
          state = 0;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[305]++;
          if (visit68_305_1(Utils.isWhitespace(ch))) {
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[308]++;
            if (visit69_308_1('=' == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[310]++;
              bookmarks[2] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[311]++;
              bookmarks[3] = bookmarks[7];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[312]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[320]++;
              this.standalone(attributes, bookmarks);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[321]++;
              bookmarks[0] = bookmarks[6];
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[322]++;
              page.ungetChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[323]++;
              state = 0;
            }
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[325]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[327]++;
        throw new Error("how ** did we get in state " + state);
    }
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[330]++;
    checkError();
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[333]++;
  return this.makeTag(start, cursor.position, attributes);
}, 
  parseComment: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[15]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[347]++;
  var done, ch, page = this.page, cursor = this.cursor, state;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[353]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[354]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[355]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[356]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[357]++;
    if (visit70_357_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[358]++;
      done = true;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[361]++;
      switch (state) {
        case 0:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[363]++;
          if (visit71_363_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[364]++;
            done = true;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[365]++;
          if (visit72_365_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[366]++;
            state = 1;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[368]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[369]++;
          break;
        case 1:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[371]++;
          if (visit73_371_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[373]++;
            ch = page.getChar(cursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[374]++;
            if (visit74_374_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[375]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[377]++;
              if (visit75_377_1('>' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[378]++;
                done = true;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[381]++;
                page.ungetChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[382]++;
                state = 2;
              }
            }
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[386]++;
            return this.parseString(start, quoteSmart);
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[388]++;
          break;
        case 2:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[390]++;
          if (visit76_390_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[391]++;
            state = 3;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[393]++;
            if (visit77_393_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[394]++;
              return this.parseString(start, quoteSmart);
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[396]++;
          break;
        case 3:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[398]++;
          if (visit78_398_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[399]++;
            state = 4;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[402]++;
            state = 2;
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[404]++;
          break;
        case 4:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[406]++;
          if (visit79_406_1('>' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[407]++;
            done = true;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[409]++;
            if (visit80_409_1(Utils.isWhitespace(ch))) {
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[415]++;
              state = 2;
            }
          }
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[417]++;
          break;
        default:
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[419]++;
          throw new Error("how ** did we get in state " + state);
      }
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[424]++;
  return this.makeComment(start, cursor.position);
}, 
  parseString: function(start, quoteSmart) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[16]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[433]++;
  var done = 0, ch, page = this.page, cursor = this.cursor, quote = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[439]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[440]++;
    ch = page.getChar(cursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[441]++;
    if (visit81_441_1(-1 == ch)) {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[442]++;
      done = 1;
    } else {
      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[444]++;
      if (visit82_444_1(quoteSmart && visit83_444_2((visit84_444_3(0 == quote)) && (visit85_445_1((visit86_445_2('\'' == ch)) || (visit87_445_3('"' == ch))))))) {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[446]++;
        quote = ch;
      } else {
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[449]++;
        if (visit88_449_1(quoteSmart && visit89_449_2((visit90_449_3(0 != quote)) && (visit91_449_4('\\' == ch))))) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[450]++;
          ch = page.getChar(cursor);
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[451]++;
          if (visit92_451_1((visit93_451_2(-1 != ch)) && visit94_452_1((visit95_452_2('\\' != ch)) && (visit96_453_1(ch != quote))))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[456]++;
            page.ungetChar(cursor);
          }
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[459]++;
          if (visit97_459_1(quoteSmart && (visit98_459_2(ch == quote)))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[460]++;
            quote = 0;
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[462]++;
            if (visit99_462_1(quoteSmart && visit100_462_2((visit101_462_3(0 == quote)) && (visit102_462_4(ch == '/'))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[466]++;
              ch = page.getChar(cursor);
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[467]++;
              if (visit103_467_1(-1 == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[468]++;
                done = 1;
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[470]++;
                if (visit104_470_1('/' == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[471]++;
                  do {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[472]++;
                    ch = page.getChar(cursor);
                  } while (visit105_473_1((visit106_473_2(-1 != ch)) && (visit107_473_3('\n' != ch))));
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[475]++;
                  if (visit108_475_1('*' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[476]++;
                    do {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[478]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[479]++;
                        ch = page.getChar(cursor);
                      } while (visit109_480_1((visit110_480_2(-1 != ch)) && (visit111_480_3('*' != ch))));
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[481]++;
                      ch = page.getChar(cursor);
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[482]++;
                      if (visit112_482_1(ch == '*')) {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[483]++;
                        page.ungetChar(cursor);
                      }
                    } while (visit113_486_1((visit114_486_2(-1 != ch)) && (visit115_486_3('/' != ch))));
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[489]++;
                    page.ungetChar(cursor);
                  }
                }
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[492]++;
              if (visit116_492_1((visit117_492_2(0 == quote)) && (visit118_492_3('<' == ch)))) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[493]++;
                ch = page.getChar(cursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[494]++;
                if (visit119_494_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[495]++;
                  done = 1;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[498]++;
                  if (visit120_498_1(visit121_498_2('/' == ch) || visit122_499_1(Utils.isLetter(ch) || visit123_500_1(visit124_500_2('!' == ch) || visit125_502_1('?' == ch))))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[503]++;
                    done = 1;
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[504]++;
                    page.ungetChar(cursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[505]++;
                    page.ungetChar(cursor);
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[509]++;
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
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[514]++;
  return this.makeString(start, cursor.position);
}, 
  parseCDATA: function(quoteSmart, tagName) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[17]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[525]++;
  var start, state, done, quote, ch, end, comment, mCursor = this.cursor, mPage = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[535]++;
  start = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[536]++;
  state = 0;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[537]++;
  done = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[538]++;
  quote = '';
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[539]++;
  comment = false;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[541]++;
  while (!done) {
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[542]++;
    ch = mPage.getChar(mCursor);
    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[543]++;
    switch (state) {
      case 0:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[545]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[547]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[548]++;
            break;
          case '\'':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[550]++;
            if (visit126_550_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[551]++;
              if (visit127_551_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[552]++;
                quote = '\'';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[553]++;
                if (visit128_553_1('\'' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[554]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[557]++;
            break;
          case '"':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[559]++;
            if (visit129_559_1(quoteSmart && !comment)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[560]++;
              if (visit130_560_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[561]++;
                quote = '"';
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[562]++;
                if (visit131_562_1('"' == quote)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[563]++;
                  quote = '';
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[566]++;
            break;
          case '\\':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[568]++;
            if (visit132_568_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[569]++;
              if (visit133_569_1('' != quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[570]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[571]++;
                if (visit134_571_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[572]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[573]++;
                  if (visit135_573_1((visit136_573_2(ch != '\\')) && (visit137_573_3(ch != quote)))) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[575]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[579]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[581]++;
            if (visit138_581_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[582]++;
              if (visit139_582_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[584]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[585]++;
                if (visit140_585_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[586]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[587]++;
                  if (visit141_587_1('/' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[588]++;
                    comment = true;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[589]++;
                    if (visit142_589_1('*' == ch)) {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[590]++;
                      do {
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[591]++;
                        do {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[592]++;
                          ch = mPage.getChar(mCursor);
                        } while (visit143_593_1((visit144_593_2(-1 != ch)) && (visit145_593_3('*' != ch))));
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[594]++;
                        ch = mPage.getChar(mCursor);
                        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[595]++;
                        if (visit146_595_1(ch == '*')) {
                          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[596]++;
                          mPage.ungetChar(mCursor);
                        }
                      } while (visit147_598_1((visit148_598_2(-1 != ch)) && (visit149_598_3('/' != ch))));
                    } else {
                      _$jscoverage['/html-parser/lexer/lexer.js'].lineData[601]++;
                      mPage.ungetChar(mCursor);
                    }
                  }
                }
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[605]++;
            break;
          case '\n':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[607]++;
            comment = false;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[608]++;
            break;
          case '<':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[610]++;
            if (visit150_610_1(quoteSmart)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[611]++;
              if (visit151_611_1('' == quote)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[612]++;
                state = 1;
              }
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[616]++;
              state = 1;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[618]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[620]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[622]++;
        break;
      case 1:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[624]++;
        switch (ch) {
          case -1:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[626]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[627]++;
            break;
          case '/':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[641]++;
            if (visit152_641_1(!tagName || (visit153_641_2(visit154_641_3(mPage.getText(mCursor.position, mCursor.position + tagName.length) === tagName) && !(mPage.getText(mCursor.position + tagName.length, mCursor.position + tagName.length + 1).match(/\w/)))))) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[645]++;
              state = 2;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[647]++;
              state = 0;
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[650]++;
            break;
          case '!':
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[652]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[653]++;
            if (visit155_653_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[654]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[655]++;
              if (visit156_655_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[656]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[657]++;
                if (visit157_657_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[658]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[659]++;
                  if (visit158_659_1('-' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[660]++;
                    state = 3;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[662]++;
                    state = 0;
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[666]++;
                state = 0;
              }
            }
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[667]++;
            break;
          default:
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[669]++;
            state = 0;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[670]++;
            break;
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[672]++;
        break;
      case 2:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[674]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[675]++;
        if (visit159_675_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[676]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[677]++;
          if (visit160_677_1(Utils.isLetter(ch))) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[680]++;
            done = true;
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[682]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[683]++;
            mPage.ungetChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[684]++;
            mPage.ungetChar(mCursor);
          } else {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[686]++;
            state = 0;
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[688]++;
        break;
      case 3:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[690]++;
        comment = false;
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[691]++;
        if (visit161_691_1(-1 == ch)) {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[692]++;
          done = true;
        } else {
          _$jscoverage['/html-parser/lexer/lexer.js'].lineData[693]++;
          if (visit162_693_1('-' == ch)) {
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[694]++;
            ch = mPage.getChar(mCursor);
            _$jscoverage['/html-parser/lexer/lexer.js'].lineData[695]++;
            if (visit163_695_1(-1 == ch)) {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[696]++;
              done = true;
            } else {
              _$jscoverage['/html-parser/lexer/lexer.js'].lineData[697]++;
              if (visit164_697_1('-' == ch)) {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[698]++;
                ch = mPage.getChar(mCursor);
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[699]++;
                if (visit165_699_1(-1 == ch)) {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[700]++;
                  done = true;
                } else {
                  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[701]++;
                  if (visit166_701_1('>' == ch)) {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[703]++;
                    state = 0;
                  } else {
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[706]++;
                    mPage.ungetChar(mCursor);
                    _$jscoverage['/html-parser/lexer/lexer.js'].lineData[707]++;
                    mPage.ungetChar(mCursor);
                  }
                }
              } else {
                _$jscoverage['/html-parser/lexer/lexer.js'].lineData[711]++;
                mPage.ungetChar(mCursor);
              }
            }
          } else {
          }
        }
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[716]++;
        break;
      default:
        _$jscoverage['/html-parser/lexer/lexer.js'].lineData[718]++;
        throw new Error("unexpected " + state);
    }
  }
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[721]++;
  end = mCursor.position;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[723]++;
  return this.makeCData(start, end);
}, 
  single_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[18]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[732]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[733]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[4] + 1, bookmarks[5]), "'"));
}, 
  double_quote: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[19]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[742]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[743]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[5] + 1, bookmarks[6]), '"'));
}, 
  standalone: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[20]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[753]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[754]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2])));
}, 
  naked: function(attributes, bookmarks) {
  _$jscoverage['/html-parser/lexer/lexer.js'].functionData[21]++;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[763]++;
  var page = this.page;
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[764]++;
  attributes.push(new Attribute(page.getText(bookmarks[1], bookmarks[2]), "=", page.getText(bookmarks[3], bookmarks[4])));
}};
  _$jscoverage['/html-parser/lexer/lexer.js'].lineData[768]++;
  return Lexer;
}, {
  requires: ['./cursor', './page', '../nodes/text', '../nodes/cdata', '../utils', '../nodes/attribute', '../nodes/tag', '../nodes/comment']});
