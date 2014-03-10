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
if (! _$jscoverage['/compiler.js']) {
  _$jscoverage['/compiler.js'] = {};
  _$jscoverage['/compiler.js'].lineData = [];
  _$jscoverage['/compiler.js'].lineData[6] = 0;
  _$jscoverage['/compiler.js'].lineData[7] = 0;
  _$jscoverage['/compiler.js'].lineData[8] = 0;
  _$jscoverage['/compiler.js'].lineData[10] = 0;
  _$jscoverage['/compiler.js'].lineData[12] = 0;
  _$jscoverage['/compiler.js'].lineData[15] = 0;
  _$jscoverage['/compiler.js'].lineData[16] = 0;
  _$jscoverage['/compiler.js'].lineData[19] = 0;
  _$jscoverage['/compiler.js'].lineData[20] = 0;
  _$jscoverage['/compiler.js'].lineData[25] = 0;
  _$jscoverage['/compiler.js'].lineData[27] = 0;
  _$jscoverage['/compiler.js'].lineData[29] = 0;
  _$jscoverage['/compiler.js'].lineData[31] = 0;
  _$jscoverage['/compiler.js'].lineData[37] = 0;
  _$jscoverage['/compiler.js'].lineData[38] = 0;
  _$jscoverage['/compiler.js'].lineData[41] = 0;
  _$jscoverage['/compiler.js'].lineData[42] = 0;
  _$jscoverage['/compiler.js'].lineData[43] = 0;
  _$jscoverage['/compiler.js'].lineData[46] = 0;
  _$jscoverage['/compiler.js'].lineData[48] = 0;
  _$jscoverage['/compiler.js'].lineData[50] = 0;
  _$jscoverage['/compiler.js'].lineData[53] = 0;
  _$jscoverage['/compiler.js'].lineData[54] = 0;
  _$jscoverage['/compiler.js'].lineData[56] = 0;
  _$jscoverage['/compiler.js'].lineData[57] = 0;
  _$jscoverage['/compiler.js'].lineData[59] = 0;
  _$jscoverage['/compiler.js'].lineData[63] = 0;
  _$jscoverage['/compiler.js'].lineData[64] = 0;
  _$jscoverage['/compiler.js'].lineData[67] = 0;
  _$jscoverage['/compiler.js'].lineData[68] = 0;
  _$jscoverage['/compiler.js'].lineData[71] = 0;
  _$jscoverage['/compiler.js'].lineData[74] = 0;
  _$jscoverage['/compiler.js'].lineData[81] = 0;
  _$jscoverage['/compiler.js'].lineData[82] = 0;
  _$jscoverage['/compiler.js'].lineData[83] = 0;
  _$jscoverage['/compiler.js'].lineData[84] = 0;
  _$jscoverage['/compiler.js'].lineData[85] = 0;
  _$jscoverage['/compiler.js'].lineData[87] = 0;
  _$jscoverage['/compiler.js'].lineData[88] = 0;
  _$jscoverage['/compiler.js'].lineData[89] = 0;
  _$jscoverage['/compiler.js'].lineData[90] = 0;
  _$jscoverage['/compiler.js'].lineData[91] = 0;
  _$jscoverage['/compiler.js'].lineData[92] = 0;
  _$jscoverage['/compiler.js'].lineData[95] = 0;
  _$jscoverage['/compiler.js'].lineData[99] = 0;
  _$jscoverage['/compiler.js'].lineData[100] = 0;
  _$jscoverage['/compiler.js'].lineData[103] = 0;
  _$jscoverage['/compiler.js'].lineData[108] = 0;
  _$jscoverage['/compiler.js'].lineData[109] = 0;
  _$jscoverage['/compiler.js'].lineData[110] = 0;
  _$jscoverage['/compiler.js'].lineData[112] = 0;
  _$jscoverage['/compiler.js'].lineData[113] = 0;
  _$jscoverage['/compiler.js'].lineData[114] = 0;
  _$jscoverage['/compiler.js'].lineData[123] = 0;
  _$jscoverage['/compiler.js'].lineData[127] = 0;
  _$jscoverage['/compiler.js'].lineData[129] = 0;
  _$jscoverage['/compiler.js'].lineData[130] = 0;
  _$jscoverage['/compiler.js'].lineData[131] = 0;
  _$jscoverage['/compiler.js'].lineData[134] = 0;
  _$jscoverage['/compiler.js'].lineData[135] = 0;
  _$jscoverage['/compiler.js'].lineData[136] = 0;
  _$jscoverage['/compiler.js'].lineData[137] = 0;
  _$jscoverage['/compiler.js'].lineData[139] = 0;
  _$jscoverage['/compiler.js'].lineData[147] = 0;
  _$jscoverage['/compiler.js'].lineData[153] = 0;
  _$jscoverage['/compiler.js'].lineData[154] = 0;
  _$jscoverage['/compiler.js'].lineData[156] = 0;
  _$jscoverage['/compiler.js'].lineData[157] = 0;
  _$jscoverage['/compiler.js'].lineData[158] = 0;
  _$jscoverage['/compiler.js'].lineData[159] = 0;
  _$jscoverage['/compiler.js'].lineData[160] = 0;
  _$jscoverage['/compiler.js'].lineData[163] = 0;
  _$jscoverage['/compiler.js'].lineData[164] = 0;
  _$jscoverage['/compiler.js'].lineData[165] = 0;
  _$jscoverage['/compiler.js'].lineData[166] = 0;
  _$jscoverage['/compiler.js'].lineData[171] = 0;
  _$jscoverage['/compiler.js'].lineData[174] = 0;
  _$jscoverage['/compiler.js'].lineData[175] = 0;
  _$jscoverage['/compiler.js'].lineData[176] = 0;
  _$jscoverage['/compiler.js'].lineData[177] = 0;
  _$jscoverage['/compiler.js'].lineData[181] = 0;
  _$jscoverage['/compiler.js'].lineData[184] = 0;
  _$jscoverage['/compiler.js'].lineData[185] = 0;
  _$jscoverage['/compiler.js'].lineData[186] = 0;
  _$jscoverage['/compiler.js'].lineData[187] = 0;
  _$jscoverage['/compiler.js'].lineData[191] = 0;
  _$jscoverage['/compiler.js'].lineData[194] = 0;
  _$jscoverage['/compiler.js'].lineData[198] = 0;
  _$jscoverage['/compiler.js'].lineData[204] = 0;
  _$jscoverage['/compiler.js'].lineData[205] = 0;
  _$jscoverage['/compiler.js'].lineData[207] = 0;
  _$jscoverage['/compiler.js'].lineData[208] = 0;
  _$jscoverage['/compiler.js'].lineData[209] = 0;
  _$jscoverage['/compiler.js'].lineData[212] = 0;
  _$jscoverage['/compiler.js'].lineData[213] = 0;
  _$jscoverage['/compiler.js'].lineData[214] = 0;
  _$jscoverage['/compiler.js'].lineData[215] = 0;
  _$jscoverage['/compiler.js'].lineData[216] = 0;
  _$jscoverage['/compiler.js'].lineData[217] = 0;
  _$jscoverage['/compiler.js'].lineData[218] = 0;
  _$jscoverage['/compiler.js'].lineData[219] = 0;
  _$jscoverage['/compiler.js'].lineData[221] = 0;
  _$jscoverage['/compiler.js'].lineData[222] = 0;
  _$jscoverage['/compiler.js'].lineData[225] = 0;
  _$jscoverage['/compiler.js'].lineData[228] = 0;
  _$jscoverage['/compiler.js'].lineData[229] = 0;
  _$jscoverage['/compiler.js'].lineData[230] = 0;
  _$jscoverage['/compiler.js'].lineData[231] = 0;
  _$jscoverage['/compiler.js'].lineData[232] = 0;
  _$jscoverage['/compiler.js'].lineData[233] = 0;
  _$jscoverage['/compiler.js'].lineData[234] = 0;
  _$jscoverage['/compiler.js'].lineData[235] = 0;
  _$jscoverage['/compiler.js'].lineData[237] = 0;
  _$jscoverage['/compiler.js'].lineData[238] = 0;
  _$jscoverage['/compiler.js'].lineData[241] = 0;
  _$jscoverage['/compiler.js'].lineData[244] = 0;
  _$jscoverage['/compiler.js'].lineData[248] = 0;
  _$jscoverage['/compiler.js'].lineData[252] = 0;
  _$jscoverage['/compiler.js'].lineData[256] = 0;
  _$jscoverage['/compiler.js'].lineData[260] = 0;
  _$jscoverage['/compiler.js'].lineData[264] = 0;
  _$jscoverage['/compiler.js'].lineData[268] = 0;
  _$jscoverage['/compiler.js'].lineData[272] = 0;
  _$jscoverage['/compiler.js'].lineData[276] = 0;
  _$jscoverage['/compiler.js'].lineData[277] = 0;
  _$jscoverage['/compiler.js'].lineData[278] = 0;
  _$jscoverage['/compiler.js'].lineData[280] = 0;
  _$jscoverage['/compiler.js'].lineData[282] = 0;
  _$jscoverage['/compiler.js'].lineData[288] = 0;
  _$jscoverage['/compiler.js'].lineData[292] = 0;
  _$jscoverage['/compiler.js'].lineData[296] = 0;
  _$jscoverage['/compiler.js'].lineData[300] = 0;
  _$jscoverage['/compiler.js'].lineData[307] = 0;
  _$jscoverage['/compiler.js'].lineData[308] = 0;
  _$jscoverage['/compiler.js'].lineData[309] = 0;
  _$jscoverage['/compiler.js'].lineData[310] = 0;
  _$jscoverage['/compiler.js'].lineData[312] = 0;
  _$jscoverage['/compiler.js'].lineData[314] = 0;
  _$jscoverage['/compiler.js'].lineData[318] = 0;
  _$jscoverage['/compiler.js'].lineData[325] = 0;
  _$jscoverage['/compiler.js'].lineData[327] = 0;
  _$jscoverage['/compiler.js'].lineData[328] = 0;
  _$jscoverage['/compiler.js'].lineData[329] = 0;
  _$jscoverage['/compiler.js'].lineData[332] = 0;
  _$jscoverage['/compiler.js'].lineData[335] = 0;
  _$jscoverage['/compiler.js'].lineData[337] = 0;
  _$jscoverage['/compiler.js'].lineData[341] = 0;
  _$jscoverage['/compiler.js'].lineData[342] = 0;
  _$jscoverage['/compiler.js'].lineData[345] = 0;
  _$jscoverage['/compiler.js'].lineData[351] = 0;
  _$jscoverage['/compiler.js'].lineData[356] = 0;
  _$jscoverage['/compiler.js'].lineData[366] = 0;
  _$jscoverage['/compiler.js'].lineData[368] = 0;
  _$jscoverage['/compiler.js'].lineData[369] = 0;
  _$jscoverage['/compiler.js'].lineData[370] = 0;
  _$jscoverage['/compiler.js'].lineData[373] = 0;
  _$jscoverage['/compiler.js'].lineData[376] = 0;
  _$jscoverage['/compiler.js'].lineData[377] = 0;
  _$jscoverage['/compiler.js'].lineData[378] = 0;
  _$jscoverage['/compiler.js'].lineData[381] = 0;
  _$jscoverage['/compiler.js'].lineData[382] = 0;
  _$jscoverage['/compiler.js'].lineData[384] = 0;
  _$jscoverage['/compiler.js'].lineData[385] = 0;
  _$jscoverage['/compiler.js'].lineData[386] = 0;
  _$jscoverage['/compiler.js'].lineData[390] = 0;
  _$jscoverage['/compiler.js'].lineData[391] = 0;
  _$jscoverage['/compiler.js'].lineData[393] = 0;
  _$jscoverage['/compiler.js'].lineData[398] = 0;
  _$jscoverage['/compiler.js'].lineData[402] = 0;
  _$jscoverage['/compiler.js'].lineData[409] = 0;
  _$jscoverage['/compiler.js'].lineData[411] = 0;
  _$jscoverage['/compiler.js'].lineData[412] = 0;
  _$jscoverage['/compiler.js'].lineData[413] = 0;
  _$jscoverage['/compiler.js'].lineData[415] = 0;
  _$jscoverage['/compiler.js'].lineData[416] = 0;
  _$jscoverage['/compiler.js'].lineData[419] = 0;
  _$jscoverage['/compiler.js'].lineData[420] = 0;
  _$jscoverage['/compiler.js'].lineData[422] = 0;
  _$jscoverage['/compiler.js'].lineData[427] = 0;
  _$jscoverage['/compiler.js'].lineData[431] = 0;
  _$jscoverage['/compiler.js'].lineData[435] = 0;
  _$jscoverage['/compiler.js'].lineData[442] = 0;
  _$jscoverage['/compiler.js'].lineData[450] = 0;
  _$jscoverage['/compiler.js'].lineData[459] = 0;
  _$jscoverage['/compiler.js'].lineData[460] = 0;
  _$jscoverage['/compiler.js'].lineData[471] = 0;
  _$jscoverage['/compiler.js'].lineData[472] = 0;
  _$jscoverage['/compiler.js'].lineData[473] = 0;
  _$jscoverage['/compiler.js'].lineData[482] = 0;
  _$jscoverage['/compiler.js'].lineData[483] = 0;
  _$jscoverage['/compiler.js'].lineData[484] = 0;
  _$jscoverage['/compiler.js'].lineData[486] = 0;
  _$jscoverage['/compiler.js'].lineData[496] = 0;
}
if (! _$jscoverage['/compiler.js'].functionData) {
  _$jscoverage['/compiler.js'].functionData = [];
  _$jscoverage['/compiler.js'].functionData[0] = 0;
  _$jscoverage['/compiler.js'].functionData[1] = 0;
  _$jscoverage['/compiler.js'].functionData[2] = 0;
  _$jscoverage['/compiler.js'].functionData[3] = 0;
  _$jscoverage['/compiler.js'].functionData[4] = 0;
  _$jscoverage['/compiler.js'].functionData[5] = 0;
  _$jscoverage['/compiler.js'].functionData[6] = 0;
  _$jscoverage['/compiler.js'].functionData[7] = 0;
  _$jscoverage['/compiler.js'].functionData[8] = 0;
  _$jscoverage['/compiler.js'].functionData[9] = 0;
  _$jscoverage['/compiler.js'].functionData[10] = 0;
  _$jscoverage['/compiler.js'].functionData[11] = 0;
  _$jscoverage['/compiler.js'].functionData[12] = 0;
  _$jscoverage['/compiler.js'].functionData[13] = 0;
  _$jscoverage['/compiler.js'].functionData[14] = 0;
  _$jscoverage['/compiler.js'].functionData[15] = 0;
  _$jscoverage['/compiler.js'].functionData[16] = 0;
  _$jscoverage['/compiler.js'].functionData[17] = 0;
  _$jscoverage['/compiler.js'].functionData[18] = 0;
  _$jscoverage['/compiler.js'].functionData[19] = 0;
  _$jscoverage['/compiler.js'].functionData[20] = 0;
  _$jscoverage['/compiler.js'].functionData[21] = 0;
  _$jscoverage['/compiler.js'].functionData[22] = 0;
  _$jscoverage['/compiler.js'].functionData[23] = 0;
  _$jscoverage['/compiler.js'].functionData[24] = 0;
  _$jscoverage['/compiler.js'].functionData[25] = 0;
  _$jscoverage['/compiler.js'].functionData[26] = 0;
  _$jscoverage['/compiler.js'].functionData[27] = 0;
  _$jscoverage['/compiler.js'].functionData[28] = 0;
  _$jscoverage['/compiler.js'].functionData[29] = 0;
  _$jscoverage['/compiler.js'].functionData[30] = 0;
  _$jscoverage['/compiler.js'].functionData[31] = 0;
}
if (! _$jscoverage['/compiler.js'].branchData) {
  _$jscoverage['/compiler.js'].branchData = {};
  _$jscoverage['/compiler.js'].branchData['20'] = [];
  _$jscoverage['/compiler.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['42'] = [];
  _$jscoverage['/compiler.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['56'] = [];
  _$jscoverage['/compiler.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['81'] = [];
  _$jscoverage['/compiler.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['84'] = [];
  _$jscoverage['/compiler.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['87'] = [];
  _$jscoverage['/compiler.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['89'] = [];
  _$jscoverage['/compiler.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['109'] = [];
  _$jscoverage['/compiler.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['113'] = [];
  _$jscoverage['/compiler.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['129'] = [];
  _$jscoverage['/compiler.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['130'] = [];
  _$jscoverage['/compiler.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['135'] = [];
  _$jscoverage['/compiler.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['156'] = [];
  _$jscoverage['/compiler.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['163'] = [];
  _$jscoverage['/compiler.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['174'] = [];
  _$jscoverage['/compiler.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['184'] = [];
  _$jscoverage['/compiler.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['207'] = [];
  _$jscoverage['/compiler.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['212'] = [];
  _$jscoverage['/compiler.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['217'] = [];
  _$jscoverage['/compiler.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['228'] = [];
  _$jscoverage['/compiler.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['233'] = [];
  _$jscoverage['/compiler.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['309'] = [];
  _$jscoverage['/compiler.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['327'] = [];
  _$jscoverage['/compiler.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'] = [];
  _$jscoverage['/compiler.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'][2] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['335'][3] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['341'] = [];
  _$jscoverage['/compiler.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['368'] = [];
  _$jscoverage['/compiler.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['376'] = [];
  _$jscoverage['/compiler.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['382'] = [];
  _$jscoverage['/compiler.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['384'] = [];
  _$jscoverage['/compiler.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['390'] = [];
  _$jscoverage['/compiler.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['411'] = [];
  _$jscoverage['/compiler.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['419'] = [];
  _$jscoverage['/compiler.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/compiler.js'].branchData['482'] = [];
  _$jscoverage['/compiler.js'].branchData['482'][1] = new BranchData();
}
_$jscoverage['/compiler.js'].branchData['482'][1].init(20, 39, 'name || (\'xtemplate\' + (xtemplateId++))');
function visit81_482_1(result) {
  _$jscoverage['/compiler.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['419'][1].init(577, 6, 'escape');
function visit80_419_1(result) {
  _$jscoverage['/compiler.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['411'][1].init(300, 7, 'code[0]');
function visit79_411_1(result) {
  _$jscoverage['/compiler.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['390'][1].init(1230, 26, 'idString in nativeCommands');
function visit78_390_1(result) {
  _$jscoverage['/compiler.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['384'][1].init(49, 28, 'typeof parts[i] !== \'string\'');
function visit77_384_1(result) {
  _$jscoverage['/compiler.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['382'][1].init(985, 5, 'i < l');
function visit76_382_1(result) {
  _$jscoverage['/compiler.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['376'][1].init(716, 19, 'programNode.inverse');
function visit75_376_1(result) {
  _$jscoverage['/compiler.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['368'][1].init(439, 11, '!optionName');
function visit74_368_1(result) {
  _$jscoverage['/compiler.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['341'][1].init(927, 26, 'idString in nativeCommands');
function visit73_341_1(result) {
  _$jscoverage['/compiler.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][3].init(599, 21, 'idString === \'extend\'');
function visit72_335_3(result) {
  _$jscoverage['/compiler.js'].branchData['335'][3].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][2].init(573, 22, 'idString === \'include\'');
function visit71_335_2(result) {
  _$jscoverage['/compiler.js'].branchData['335'][2].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['335'][1].init(573, 47, 'idString === \'include\' || idString === \'extend\'');
function visit70_335_1(result) {
  _$jscoverage['/compiler.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['327'][1].init(291, 17, 'commandConfigCode');
function visit69_327_1(result) {
  _$jscoverage['/compiler.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['309'][1].init(419, 29, 'originalIdString === idString');
function visit68_309_1(result) {
  _$jscoverage['/compiler.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['233'][1].init(83, 17, 'nextIdNameCode[0]');
function visit67_233_1(result) {
  _$jscoverage['/compiler.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['228'][1].init(1160, 4, 'hash');
function visit66_228_1(result) {
  _$jscoverage['/compiler.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['217'][1].init(91, 17, 'nextIdNameCode[0]');
function visit65_217_1(result) {
  _$jscoverage['/compiler.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['212'][1].init(376, 6, 'params');
function visit64_212_1(result) {
  _$jscoverage['/compiler.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['207'][1].init(221, 14, 'params || hash');
function visit63_207_1(result) {
  _$jscoverage['/compiler.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['184'][1].init(1211, 15, '!name1 && name2');
function visit62_184_1(result) {
  _$jscoverage['/compiler.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['174'][1].init(878, 15, 'name1 && !name2');
function visit61_174_1(result) {
  _$jscoverage['/compiler.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['163'][1].init(483, 16, '!name1 && !name2');
function visit60_163_1(result) {
  _$jscoverage['/compiler.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['156'][1].init(252, 14, 'name1 && name2');
function visit59_156_1(result) {
  _$jscoverage['/compiler.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['135'][1].init(1064, 7, '!global');
function visit58_135_1(result) {
  _$jscoverage['/compiler.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['130'][1].init(58, 7, 'i < len');
function visit57_130_1(result) {
  _$jscoverage['/compiler.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['129'][1].init(804, 10, 'statements');
function visit56_129_1(result) {
  _$jscoverage['/compiler.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['113'][1].init(204, 6, 'global');
function visit55_113_1(result) {
  _$jscoverage['/compiler.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['109'][1].init(46, 7, '!global');
function visit54_109_1(result) {
  _$jscoverage['/compiler.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['89'][1].init(88, 17, 'nextIdNameCode[0]');
function visit53_89_1(result) {
  _$jscoverage['/compiler.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['87'][1].init(185, 10, 'idPartType');
function visit52_87_1(result) {
  _$jscoverage['/compiler.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['84'][1].init(100, 6, '!first');
function visit51_84_1(result) {
  _$jscoverage['/compiler.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['81'][1].init(241, 5, 'i < l');
function visit50_81_1(result) {
  _$jscoverage['/compiler.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['56'][1].init(87, 12, 'm.length % 2');
function visit49_56_1(result) {
  _$jscoverage['/compiler.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['42'][1].init(13, 6, 'isCode');
function visit48_42_1(result) {
  _$jscoverage['/compiler.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].branchData['20'][1].init(28, 27, 'S.indexOf(t, keywords) > -1');
function visit47_20_1(result) {
  _$jscoverage['/compiler.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/compiler.js'].functionData[0]++;
  _$jscoverage['/compiler.js'].lineData[7]++;
  var XTemplateRuntime = require('xtemplate/runtime');
  _$jscoverage['/compiler.js'].lineData[8]++;
  var nativeCode = '', t;
  _$jscoverage['/compiler.js'].lineData[10]++;
  var keywords = ['if', 'with', 'debugger'];
  _$jscoverage['/compiler.js'].lineData[12]++;
  var nativeCommands = XTemplateRuntime.nativeCommands, nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/compiler.js'].lineData[15]++;
  for (t in nativeUtils) {
    _$jscoverage['/compiler.js'].lineData[16]++;
    nativeCode += t + 'Util = utils.' + t + ',';
  }
  _$jscoverage['/compiler.js'].lineData[19]++;
  for (t in nativeCommands) {
    _$jscoverage['/compiler.js'].lineData[20]++;
    nativeCode += t + (visit47_20_1(S.indexOf(t, keywords) > -1) ? ('Command = nativeCommands["' + t + '"]') : ('Command = nativeCommands.' + t)) + ',';
  }
  _$jscoverage['/compiler.js'].lineData[25]++;
  nativeCode = nativeCode.slice(0, -1);
  _$jscoverage['/compiler.js'].lineData[27]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/compiler.js'].lineData[29]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/compiler.js'].lineData[31]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, variableId = 0, xtemplateId = 0;
  _$jscoverage['/compiler.js'].lineData[37]++;
  function guid(str) {
    _$jscoverage['/compiler.js'].functionData[1]++;
    _$jscoverage['/compiler.js'].lineData[38]++;
    return str + (variableId++);
  }
  _$jscoverage['/compiler.js'].lineData[41]++;
  function escapeString(str, isCode) {
    _$jscoverage['/compiler.js'].functionData[2]++;
    _$jscoverage['/compiler.js'].lineData[42]++;
    if (visit48_42_1(isCode)) {
      _$jscoverage['/compiler.js'].lineData[43]++;
      str = escapeSingleQuoteInCodeString(str, false);
    } else {
      _$jscoverage['/compiler.js'].lineData[46]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/compiler.js'].lineData[48]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/compiler.js'].lineData[50]++;
    return str;
  }
  _$jscoverage['/compiler.js'].lineData[53]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/compiler.js'].functionData[3]++;
    _$jscoverage['/compiler.js'].lineData[54]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/compiler.js'].functionData[4]++;
  _$jscoverage['/compiler.js'].lineData[56]++;
  if (visit49_56_1(m.length % 2)) {
    _$jscoverage['/compiler.js'].lineData[57]++;
    m = '\\' + m;
  }
  _$jscoverage['/compiler.js'].lineData[59]++;
  return m;
});
  }
  _$jscoverage['/compiler.js'].lineData[63]++;
  function pushToArray(to, from) {
    _$jscoverage['/compiler.js'].functionData[5]++;
    _$jscoverage['/compiler.js'].lineData[64]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/compiler.js'].lineData[67]++;
  function lastOfArray(arr) {
    _$jscoverage['/compiler.js'].functionData[6]++;
    _$jscoverage['/compiler.js'].lineData[68]++;
    return arr[arr.length - 1];
  }
  _$jscoverage['/compiler.js'].lineData[71]++;
  var gen = {
  getIdStringFromIdParts: function(source, idParts) {
  _$jscoverage['/compiler.js'].functionData[7]++;
  _$jscoverage['/compiler.js'].lineData[74]++;
  var idString = '', self = this, i, l, idPart, idPartType, nextIdNameCode, first = true;
  _$jscoverage['/compiler.js'].lineData[81]++;
  for (i = 0 , l = idParts.length; visit50_81_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[82]++;
    idPart = idParts[i];
    _$jscoverage['/compiler.js'].lineData[83]++;
    idPartType = idPart.type;
    _$jscoverage['/compiler.js'].lineData[84]++;
    if (visit51_84_1(!first)) {
      _$jscoverage['/compiler.js'].lineData[85]++;
      idString += '.';
    }
    _$jscoverage['/compiler.js'].lineData[87]++;
    if (visit52_87_1(idPartType)) {
      _$jscoverage['/compiler.js'].lineData[88]++;
      nextIdNameCode = self[idPartType](idPart);
      _$jscoverage['/compiler.js'].lineData[89]++;
      if (visit53_89_1(nextIdNameCode[0])) {
        _$jscoverage['/compiler.js'].lineData[90]++;
        pushToArray(source, nextIdNameCode[1]);
        _$jscoverage['/compiler.js'].lineData[91]++;
        idString += '"+' + nextIdNameCode[0] + '+"';
        _$jscoverage['/compiler.js'].lineData[92]++;
        first = true;
      } else {
        _$jscoverage['/compiler.js'].lineData[95]++;
        idString += nextIdNameCode[1][0];
      }
    } else {
      _$jscoverage['/compiler.js'].lineData[99]++;
      idString += idPart;
      _$jscoverage['/compiler.js'].lineData[100]++;
      first = false;
    }
  }
  _$jscoverage['/compiler.js'].lineData[103]++;
  return idString;
}, 
  genFunction: function(statements, global) {
  _$jscoverage['/compiler.js'].functionData[8]++;
  _$jscoverage['/compiler.js'].lineData[108]++;
  var source = [];
  _$jscoverage['/compiler.js'].lineData[109]++;
  if (visit54_109_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[110]++;
    source.push('function(scope) {');
  }
  _$jscoverage['/compiler.js'].lineData[112]++;
  source.push('var buffer = ""' + (global ? ',' : ';'));
  _$jscoverage['/compiler.js'].lineData[113]++;
  if (visit55_113_1(global)) {
    _$jscoverage['/compiler.js'].lineData[114]++;
    source.push('engine = this,' + 'moduleWrap,' + 'escapeHtml = S.escapeHtml,' + 'nativeCommands = engine.nativeCommands,' + 'utils = engine.utils;');
    _$jscoverage['/compiler.js'].lineData[123]++;
    source.push('if (typeof module !== "undefined" && module.kissy) {' + 'moduleWrap = module;' + '}');
    _$jscoverage['/compiler.js'].lineData[127]++;
    source.push('var ' + nativeCode + ';');
  }
  _$jscoverage['/compiler.js'].lineData[129]++;
  if (visit56_129_1(statements)) {
    _$jscoverage['/compiler.js'].lineData[130]++;
    for (var i = 0, len = statements.length; visit57_130_1(i < len); i++) {
      _$jscoverage['/compiler.js'].lineData[131]++;
      pushToArray(source, this[statements[i].type](statements[i]));
    }
  }
  _$jscoverage['/compiler.js'].lineData[134]++;
  source.push('return buffer;');
  _$jscoverage['/compiler.js'].lineData[135]++;
  if (visit58_135_1(!global)) {
    _$jscoverage['/compiler.js'].lineData[136]++;
    source.push('}');
    _$jscoverage['/compiler.js'].lineData[137]++;
    return source;
  } else {
    _$jscoverage['/compiler.js'].lineData[139]++;
    return {
  params: ['scope', 'S', 'payload', 'undefined'], 
  source: source};
  }
}, 
  genOpExpression: function(e, type) {
  _$jscoverage['/compiler.js'].functionData[9]++;
  _$jscoverage['/compiler.js'].lineData[147]++;
  var source = [], name1, name2, code1 = this[e.op1.type](e.op1), code2 = this[e.op2.type](e.op2);
  _$jscoverage['/compiler.js'].lineData[153]++;
  name1 = code1[0];
  _$jscoverage['/compiler.js'].lineData[154]++;
  name2 = code2[0];
  _$jscoverage['/compiler.js'].lineData[156]++;
  if (visit59_156_1(name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[157]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[158]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[159]++;
    source.push(name1 + type + name2);
    _$jscoverage['/compiler.js'].lineData[160]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[163]++;
  if (visit60_163_1(!name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[164]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[165]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[166]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[171]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[174]++;
  if (visit61_174_1(name1 && !name2)) {
    _$jscoverage['/compiler.js'].lineData[175]++;
    pushToArray(source, code1[1]);
    _$jscoverage['/compiler.js'].lineData[176]++;
    pushToArray(source, code2[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[177]++;
    source.push(name1 + type + '(' + lastOfArray(code2[1]) + ')');
    _$jscoverage['/compiler.js'].lineData[181]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[184]++;
  if (visit62_184_1(!name1 && name2)) {
    _$jscoverage['/compiler.js'].lineData[185]++;
    pushToArray(source, code1[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[186]++;
    pushToArray(source, code2[1]);
    _$jscoverage['/compiler.js'].lineData[187]++;
    source.push('(' + lastOfArray(code1[1]) + ')' + type + name2);
    _$jscoverage['/compiler.js'].lineData[191]++;
    return ['', source];
  }
  _$jscoverage['/compiler.js'].lineData[194]++;
  return undefined;
}, 
  genOptionFromCommand: function(command) {
  _$jscoverage['/compiler.js'].functionData[10]++;
  _$jscoverage['/compiler.js'].lineData[198]++;
  var source = [], optionName, params, hash, self = this;
  _$jscoverage['/compiler.js'].lineData[204]++;
  params = command.params;
  _$jscoverage['/compiler.js'].lineData[205]++;
  hash = command.hash;
  _$jscoverage['/compiler.js'].lineData[207]++;
  if (visit63_207_1(params || hash)) {
    _$jscoverage['/compiler.js'].lineData[208]++;
    optionName = guid('option');
    _$jscoverage['/compiler.js'].lineData[209]++;
    source.push('var ' + optionName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[212]++;
  if (visit64_212_1(params)) {
    _$jscoverage['/compiler.js'].lineData[213]++;
    var paramsName = guid('params');
    _$jscoverage['/compiler.js'].lineData[214]++;
    source.push('var ' + paramsName + ' = [];');
    _$jscoverage['/compiler.js'].lineData[215]++;
    S.each(params, function(param) {
  _$jscoverage['/compiler.js'].functionData[11]++;
  _$jscoverage['/compiler.js'].lineData[216]++;
  var nextIdNameCode = self[param.type](param);
  _$jscoverage['/compiler.js'].lineData[217]++;
  if (visit65_217_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[218]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[219]++;
    source.push(paramsName + '.push(' + nextIdNameCode[0] + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[221]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[222]++;
    source.push(paramsName + '.push(' + lastOfArray(nextIdNameCode[1]) + ');');
  }
});
    _$jscoverage['/compiler.js'].lineData[225]++;
    source.push(optionName + '.params=' + paramsName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[228]++;
  if (visit66_228_1(hash)) {
    _$jscoverage['/compiler.js'].lineData[229]++;
    var hashName = guid('hash');
    _$jscoverage['/compiler.js'].lineData[230]++;
    source.push('var ' + hashName + ' = {};');
    _$jscoverage['/compiler.js'].lineData[231]++;
    S.each(hash.value, function(v, key) {
  _$jscoverage['/compiler.js'].functionData[12]++;
  _$jscoverage['/compiler.js'].lineData[232]++;
  var nextIdNameCode = self[v.type](v);
  _$jscoverage['/compiler.js'].lineData[233]++;
  if (visit67_233_1(nextIdNameCode[0])) {
    _$jscoverage['/compiler.js'].lineData[234]++;
    pushToArray(source, nextIdNameCode[1]);
    _$jscoverage['/compiler.js'].lineData[235]++;
    source.push(hashName + '["' + key + '"] = ' + nextIdNameCode[0] + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[237]++;
    pushToArray(source, nextIdNameCode[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[238]++;
    source.push(hashName + '["' + key + '"] = ' + lastOfArray(nextIdNameCode[1]) + ';');
  }
});
    _$jscoverage['/compiler.js'].lineData[241]++;
    source.push(optionName + '.hash=' + hashName + ';');
  }
  _$jscoverage['/compiler.js'].lineData[244]++;
  return [optionName, source];
}, 
  'conditionalOrExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[13]++;
  _$jscoverage['/compiler.js'].lineData[248]++;
  return this.genOpExpression(e, '||');
}, 
  'conditionalAndExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[14]++;
  _$jscoverage['/compiler.js'].lineData[252]++;
  return this.genOpExpression(e, '&&');
}, 
  'relationalExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[15]++;
  _$jscoverage['/compiler.js'].lineData[256]++;
  return this.genOpExpression(e, e.opType);
}, 
  'equalityExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[16]++;
  _$jscoverage['/compiler.js'].lineData[260]++;
  return this.genOpExpression(e, e.opType);
}, 
  'additiveExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[17]++;
  _$jscoverage['/compiler.js'].lineData[264]++;
  return this.genOpExpression(e, e.opType);
}, 
  'multiplicativeExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[18]++;
  _$jscoverage['/compiler.js'].lineData[268]++;
  return this.genOpExpression(e, e.opType);
}, 
  'unaryExpression': function(e) {
  _$jscoverage['/compiler.js'].functionData[19]++;
  _$jscoverage['/compiler.js'].lineData[272]++;
  var source = [], name, unaryType = e.unaryType, code = this[e.value.type](e.value);
  _$jscoverage['/compiler.js'].lineData[276]++;
  arrayPush.apply(source, code[1]);
  _$jscoverage['/compiler.js'].lineData[277]++;
  if ((name = code[0])) {
    _$jscoverage['/compiler.js'].lineData[278]++;
    source.push(name + '=' + unaryType + name + ';');
  } else {
    _$jscoverage['/compiler.js'].lineData[280]++;
    source[source.length - 1] = '' + unaryType + lastOfArray(source);
  }
  _$jscoverage['/compiler.js'].lineData[282]++;
  return [name, source];
}, 
  'string': function(e) {
  _$jscoverage['/compiler.js'].functionData[20]++;
  _$jscoverage['/compiler.js'].lineData[288]++;
  return ['', ["'" + escapeString(e.value, true) + "'"]];
}, 
  'number': function(e) {
  _$jscoverage['/compiler.js'].functionData[21]++;
  _$jscoverage['/compiler.js'].lineData[292]++;
  return ['', [e.value]];
}, 
  'boolean': function(e) {
  _$jscoverage['/compiler.js'].functionData[22]++;
  _$jscoverage['/compiler.js'].lineData[296]++;
  return ['', [e.value]];
}, 
  'id': function(idNode) {
  _$jscoverage['/compiler.js'].functionData[23]++;
  _$jscoverage['/compiler.js'].lineData[300]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, originalIdString = idNode.string, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[307]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[308]++;
  var depthParam = depth ? (',' + depth) : '';
  _$jscoverage['/compiler.js'].lineData[309]++;
  if (visit68_309_1(originalIdString === idString)) {
    _$jscoverage['/compiler.js'].lineData[310]++;
    source.push('var ' + idName + ' = scope.resolve(["' + idParts.join('","') + '"]' + depthParam + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[312]++;
    source.push('var ' + idName + ' = scope.resolve("' + idString + '"' + depthParam + ');');
  }
  _$jscoverage['/compiler.js'].lineData[314]++;
  return [idName, source];
}, 
  'command': function(command) {
  _$jscoverage['/compiler.js'].functionData[24]++;
  _$jscoverage['/compiler.js'].lineData[318]++;
  var source = [], idNode = command.id, optionName, idParts = idNode.parts, idName = guid('id'), self = this;
  _$jscoverage['/compiler.js'].lineData[325]++;
  var commandConfigCode = self.genOptionFromCommand(command);
  _$jscoverage['/compiler.js'].lineData[327]++;
  if (visit69_327_1(commandConfigCode)) {
    _$jscoverage['/compiler.js'].lineData[328]++;
    optionName = commandConfigCode[0];
    _$jscoverage['/compiler.js'].lineData[329]++;
    pushToArray(source, commandConfigCode[1]);
  }
  _$jscoverage['/compiler.js'].lineData[332]++;
  var idString = self.getIdStringFromIdParts(source, idParts);
  _$jscoverage['/compiler.js'].lineData[335]++;
  if (visit70_335_1(visit71_335_2(idString === 'include') || visit72_335_3(idString === 'extend'))) {
    _$jscoverage['/compiler.js'].lineData[337]++;
    source.push('if(moduleWrap) {re' + 'quire("' + command.params[0].value + '");' + optionName + '.params[0] = moduleWrap.resolveByName(' + optionName + '.params[0]);' + '}');
  }
  _$jscoverage['/compiler.js'].lineData[341]++;
  if (visit73_341_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[342]++;
    source.push('var ' + idName + ' = ' + idString + 'Command.call(engine,scope,' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[345]++;
    source.push('var ' + idName + ' = callCommandUtil(engine,scope,' + optionName + ',"' + idString + '",' + idNode.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[351]++;
  return [idName, source];
}, 
  'blockStatement': function(block) {
  _$jscoverage['/compiler.js'].functionData[25]++;
  _$jscoverage['/compiler.js'].lineData[356]++;
  var programNode = block.program, source = [], self = this, command = block.command, commandConfigCode = self.genOptionFromCommand(command), optionName = commandConfigCode[0], id = command.id, idString = id.string, inverseFn;
  _$jscoverage['/compiler.js'].lineData[366]++;
  pushToArray(source, commandConfigCode[1]);
  _$jscoverage['/compiler.js'].lineData[368]++;
  if (visit74_368_1(!optionName)) {
    _$jscoverage['/compiler.js'].lineData[369]++;
    optionName = S.guid('option');
    _$jscoverage['/compiler.js'].lineData[370]++;
    source.push('var ' + optionName + ' = {};');
  }
  _$jscoverage['/compiler.js'].lineData[373]++;
  source.push(optionName + '.fn=' + self.genFunction(programNode.statements).join('\n') + ';');
  _$jscoverage['/compiler.js'].lineData[376]++;
  if (visit75_376_1(programNode.inverse)) {
    _$jscoverage['/compiler.js'].lineData[377]++;
    inverseFn = self.genFunction(programNode.inverse).join('\n');
    _$jscoverage['/compiler.js'].lineData[378]++;
    source.push(optionName + '.inverse=' + inverseFn + ';');
  }
  _$jscoverage['/compiler.js'].lineData[381]++;
  var parts = id.parts;
  _$jscoverage['/compiler.js'].lineData[382]++;
  for (var i = 0, l = parts.length; visit76_382_1(i < l); i++) {
    _$jscoverage['/compiler.js'].lineData[384]++;
    if (visit77_384_1(typeof parts[i] !== 'string')) {
      _$jscoverage['/compiler.js'].lineData[385]++;
      idString = self.getIdStringFromIdParts(source, parts);
      _$jscoverage['/compiler.js'].lineData[386]++;
      break;
    }
  }
  _$jscoverage['/compiler.js'].lineData[390]++;
  if (visit78_390_1(idString in nativeCommands)) {
    _$jscoverage['/compiler.js'].lineData[391]++;
    source.push('buffer += ' + idString + 'Command.call(engine, scope, ' + optionName + ',payload);');
  } else {
    _$jscoverage['/compiler.js'].lineData[393]++;
    source.push('buffer += callCommandUtil(engine, scope, ' + optionName + ', ' + '"' + idString + '", ' + id.lineNumber + ');');
  }
  _$jscoverage['/compiler.js'].lineData[398]++;
  return source;
}, 
  'expressionStatement': function(expressionStatement) {
  _$jscoverage['/compiler.js'].functionData[26]++;
  _$jscoverage['/compiler.js'].lineData[402]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/compiler.js'].lineData[409]++;
  code = this[type](expression);
  _$jscoverage['/compiler.js'].lineData[411]++;
  if (visit79_411_1(code[0])) {
    _$jscoverage['/compiler.js'].lineData[412]++;
    pushToArray(source, code[1]);
    _$jscoverage['/compiler.js'].lineData[413]++;
    expressionOrVariable = code[0];
  } else {
    _$jscoverage['/compiler.js'].lineData[415]++;
    pushToArray(source, code[1].slice(0, -1));
    _$jscoverage['/compiler.js'].lineData[416]++;
    expressionOrVariable = lastOfArray(code[1]);
  }
  _$jscoverage['/compiler.js'].lineData[419]++;
  if (visit80_419_1(escape)) {
    _$jscoverage['/compiler.js'].lineData[420]++;
    source.push('buffer += escapeHtml(' + expressionOrVariable + ');');
  } else {
    _$jscoverage['/compiler.js'].lineData[422]++;
    source.push('if(' + expressionOrVariable + ' || ' + expressionOrVariable + ' === 0) { ' + 'buffer += ' + expressionOrVariable + ';' + ' }');
  }
  _$jscoverage['/compiler.js'].lineData[427]++;
  return source;
}, 
  'contentStatement': function(contentStatement) {
  _$jscoverage['/compiler.js'].functionData[27]++;
  _$jscoverage['/compiler.js'].lineData[431]++;
  return ['buffer += \'' + escapeString(contentStatement.value, false) + '\';'];
}};
  _$jscoverage['/compiler.js'].lineData[435]++;
  var compiler;
  _$jscoverage['/compiler.js'].lineData[442]++;
  compiler = {
  parse: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[28]++;
  _$jscoverage['/compiler.js'].lineData[450]++;
  return parser.parse(name, tpl);
}, 
  compileToStr: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[29]++;
  _$jscoverage['/compiler.js'].lineData[459]++;
  var func = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[460]++;
  return 'function(' + func.params.join(',') + '){\n' + func.source.join('\n') + '}';
}, 
  compile: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[30]++;
  _$jscoverage['/compiler.js'].lineData[471]++;
  var root = compiler.parse(name, tpl);
  _$jscoverage['/compiler.js'].lineData[472]++;
  variableId = 0;
  _$jscoverage['/compiler.js'].lineData[473]++;
  return gen.genFunction(root.statements, true);
}, 
  compileToFn: function(tpl, name) {
  _$jscoverage['/compiler.js'].functionData[31]++;
  _$jscoverage['/compiler.js'].lineData[482]++;
  name = visit81_482_1(name || ('xtemplate' + (xtemplateId++)));
  _$jscoverage['/compiler.js'].lineData[483]++;
  var code = compiler.compile(tpl, name);
  _$jscoverage['/compiler.js'].lineData[484]++;
  var sourceURL = 'sourceURL=' + name + '.js';
  _$jscoverage['/compiler.js'].lineData[486]++;
  return Function.apply(null, [].concat(code.params).concat(code.source.join('\n') + '\n//@ ' + sourceURL + '\n//# ' + sourceURL));
}};
  _$jscoverage['/compiler.js'].lineData[496]++;
  return compiler;
});
