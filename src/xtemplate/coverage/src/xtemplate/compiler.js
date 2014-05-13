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
if (! _$jscoverage['/xtemplate/compiler.js']) {
  _$jscoverage['/xtemplate/compiler.js'] = {};
  _$jscoverage['/xtemplate/compiler.js'].lineData = [];
  _$jscoverage['/xtemplate/compiler.js'].lineData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[16] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[20] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[22] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[24] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[29] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[33] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[38] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[40] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[42] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[44] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[47] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[48] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[49] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[50] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[51] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[52] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[53] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[55] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[57] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[58] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[63] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[64] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[69] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[71] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[76] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[77] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[80] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[81] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[84] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[85] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[88] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[89] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[92] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[93] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[95] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[96] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[98] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[102] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[103] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[104] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[107] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[110] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[113] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[116] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[117] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[120] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[121] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[129] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[130] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[131] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[132] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[133] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[134] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[135] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[136] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[137] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[138] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[139] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[140] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[142] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[143] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[145] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[152] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[153] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[154] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[156] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[159] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[160] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[161] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[162] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[165] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[166] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[167] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[168] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[169] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[170] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[171] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[172] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[173] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[176] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[179] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[181] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[185] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[186] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[187] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[188] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[190] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[191] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[192] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[195] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[196] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[200] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[201] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[203] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[204] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[210] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[211] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[213] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[217] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[218] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[219] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[220] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[221] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[222] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[223] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[225] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[228] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[229] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[230] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[231] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[232] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[233] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[234] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[236] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[239] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[245] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[246] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[255] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[256] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[257] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[259] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[260] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[261] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[262] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[263] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[267] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[269] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[271] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[277] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[278] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[279] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[282] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[283] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[289] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[290] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[298] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[299] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[308] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[309] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[314] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[320] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[334] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[335] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[344] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[351] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[358] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[363] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[365] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[370] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[377] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[381] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[385] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[392] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[394] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[395] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[397] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[402] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[410] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[423] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[424] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[430] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[437] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[445] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[455] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[456] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[469] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[470] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[471] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[472] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[481] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[483] = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[490] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].functionData) {
  _$jscoverage['/xtemplate/compiler.js'].functionData = [];
  _$jscoverage['/xtemplate/compiler.js'].functionData[0] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[1] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[2] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[3] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[4] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[5] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[6] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[7] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[8] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[9] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[10] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[11] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[12] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[13] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[14] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[15] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[16] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[17] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[18] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[19] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[20] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[21] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[22] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[23] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[24] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[25] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[26] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[27] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[28] = 0;
  _$jscoverage['/xtemplate/compiler.js'].functionData[29] = 0;
}
if (! _$jscoverage['/xtemplate/compiler.js'].branchData) {
  _$jscoverage['/xtemplate/compiler.js'].branchData = {};
  _$jscoverage['/xtemplate/compiler.js'].branchData['95'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['103'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['137'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['153'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['160'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['165'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['167'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['170'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['187'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['217'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['228'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['259'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['262'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][3] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['277'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['289'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['308'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/xtemplate/compiler.js'].branchData['481'] = [];
  _$jscoverage['/xtemplate/compiler.js'].branchData['481'][1] = new BranchData();
}
_$jscoverage['/xtemplate/compiler.js'].branchData['481'][1].init(54, 25, 'name || guid(\'xtemplate\')');
function visit82_481_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['308'][1].init(2231, 6, 'idName');
function visit81_308_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['289'][1].init(1537, 5, 'block');
function visit80_289_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['282'][1].init(1250, 26, 'idString in nativeCommands');
function visit79_282_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['277'][1].init(1132, 6, '!block');
function visit78_277_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['269'][3].init(91, 21, 'idString === \'extend\'');
function visit77_269_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['269'][2].init(65, 22, 'idString === \'include\'');
function visit76_269_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['269'][1].init(65, 47, 'idString === \'include\' || idString === \'extend\'');
function visit75_269_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['267'][1].init(779, 20, 'xtplAstToJs.isModule');
function visit74_267_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['262'][1].init(168, 19, 'programNode.inverse');
function visit73_262_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['259'][1].init(429, 5, 'block');
function visit72_259_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['228'][1].init(708, 4, 'hash');
function visit71_228_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['217'][1].init(217, 6, 'params');
function visit70_217_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['200'][1].init(141, 7, 'i < len');
function visit69_200_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['187'][1].init(104, 7, 'i < len');
function visit68_187_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['170'][1].init(103, 10, 'idPartType');
function visit67_170_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['167'][1].init(73, 5, 'i < l');
function visit66_167_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['165'][1].init(349, 5, 'check');
function visit65_165_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['160'][1].init(18, 15, 'idParts[i].type');
function visit64_160_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['159'][1].init(208, 5, 'i < l');
function visit63_159_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['153'][1].init(14, 20, 'idParts.length === 1');
function visit62_153_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['137'][1].init(35, 13, 'type === \'&&\'');
function visit61_137_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['136'][3].init(543, 13, 'type === \'||\'');
function visit60_136_3(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][3].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['136'][2].init(526, 13, 'type === \'&&\'');
function visit59_136_2(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][2].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['136'][1].init(526, 30, 'type === \'&&\' || type === \'||\'');
function visit58_136_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['103'][1].init(14, 6, 'isCode');
function visit57_103_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].branchData['95'][1].init(89, 12, 'm.length % 2');
function visit56_95_1(result) {
  _$jscoverage['/xtemplate/compiler.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/xtemplate/compiler.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[0]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/xtemplate/compiler.js'].lineData[10]++;
  var TOP_DECLARATION = ['var tpl = this,', 'nativeCommands = tpl.root.nativeCommands,', 'utils = tpl.root.utils;'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[14]++;
  var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer, {lineNumber});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[16]++;
  var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, [{idParts}], {lineNumber});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[18]++;
  var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}], {depth},{lineNumber});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[20]++;
  var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}],{depth});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[22]++;
  var REQUIRE_MODULE = 're' + 'quire("{name}");';
  _$jscoverage['/xtemplate/compiler.js'].lineData[24]++;
  var CHECK_BUFFER = ['if({name} && {name}.isBuffer){', 'buffer = {name};', '{name} = undefined;', '}'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[29]++;
  var FUNC = ['function({params}){', '{body}', '}'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[33]++;
  var SOURCE_URL = ['', '//# sourceURL = {name}.js'].join('\n');
  _$jscoverage['/xtemplate/compiler.js'].lineData[38]++;
  var DECLARE_NATIVE_COMMANDS = '{name}Command = nativeCommands["{name}"]';
  _$jscoverage['/xtemplate/compiler.js'].lineData[40]++;
  var DECLARE_UTILS = '{name}Util = utils["{name}"]';
  _$jscoverage['/xtemplate/compiler.js'].lineData[42]++;
  var BUFFER_WRITE = 'buffer.write({value},{escape});';
  _$jscoverage['/xtemplate/compiler.js'].lineData[44]++;
  var RETURN_BUFFER = 'return buffer;';
  _$jscoverage['/xtemplate/compiler.js'].lineData[47]++;
  var XTemplateRuntime = require('./runtime');
  _$jscoverage['/xtemplate/compiler.js'].lineData[48]++;
  var parser = require('./compiler/parser');
  _$jscoverage['/xtemplate/compiler.js'].lineData[49]++;
  parser.yy = require('./compiler/ast');
  _$jscoverage['/xtemplate/compiler.js'].lineData[50]++;
  var nativeCode = [];
  _$jscoverage['/xtemplate/compiler.js'].lineData[51]++;
  var substitute = util.substitute;
  _$jscoverage['/xtemplate/compiler.js'].lineData[52]++;
  var nativeCommands = XTemplateRuntime.nativeCommands;
  _$jscoverage['/xtemplate/compiler.js'].lineData[53]++;
  var nativeUtils = XTemplateRuntime.utils;
  _$jscoverage['/xtemplate/compiler.js'].lineData[55]++;
  var t;
  _$jscoverage['/xtemplate/compiler.js'].lineData[57]++;
  for (t in nativeUtils) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[58]++;
    nativeCode.push(substitute(DECLARE_UTILS, {
  name: t}));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[63]++;
  for (t in nativeCommands) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[64]++;
    nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, {
  name: t}));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[69]++;
  nativeCode = 'var ' + nativeCode.join(',\n') + ';';
  _$jscoverage['/xtemplate/compiler.js'].lineData[71]++;
  var doubleReg = /\\*"/g, singleReg = /\\*'/g, arrayPush = [].push, uuid = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[76]++;
  function guid(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[1]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[77]++;
    return str + (uuid++);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[80]++;
  function wrapByDoubleQuote(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[2]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[81]++;
    return '"' + str + '"';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[84]++;
  function wrapBySingleQuote(str) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[3]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[85]++;
    return '\'' + str + '\'';
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[88]++;
  function joinArrayOfString(arr) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[4]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[89]++;
    return wrapByDoubleQuote(arr.join('","'));
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[92]++;
  function escapeSingleQuoteInCodeString(str, isDouble) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[5]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[93]++;
    return str.replace(isDouble ? doubleReg : singleReg, function(m) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[6]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[95]++;
  if (visit56_95_1(m.length % 2)) {
    _$jscoverage['/xtemplate/compiler.js'].lineData[96]++;
    m = '\\' + m;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[98]++;
  return m;
});
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[102]++;
  function escapeString(str, isCode) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[7]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[103]++;
    if (visit57_103_1(isCode)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[104]++;
      str = escapeSingleQuoteInCodeString(str, 0);
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[107]++;
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[110]++;
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    _$jscoverage['/xtemplate/compiler.js'].lineData[113]++;
    return str;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[116]++;
  function pushToArray(to, from) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[8]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[117]++;
    arrayPush.apply(to, from);
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[120]++;
  function opExpression(e) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[9]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[121]++;
    var source = [], type = e.opType, exp1, exp2, code1Source, code2Source, code1 = xtplAstToJs[e.op1.type](e.op1), code2 = xtplAstToJs[e.op2.type](e.op2);
    _$jscoverage['/xtemplate/compiler.js'].lineData[129]++;
    exp1 = code1.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[130]++;
    exp2 = code2.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[131]++;
    var exp = guid('exp');
    _$jscoverage['/xtemplate/compiler.js'].lineData[132]++;
    code1Source = code1.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[133]++;
    code2Source = code2.source;
    _$jscoverage['/xtemplate/compiler.js'].lineData[134]++;
    pushToArray(source, code1Source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[135]++;
    source.push('var ' + exp + ' = ' + exp1 + ';');
    _$jscoverage['/xtemplate/compiler.js'].lineData[136]++;
    if (visit58_136_1(visit59_136_2(type === '&&') || visit60_136_3(type === '||'))) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[137]++;
      source.push('if(' + (visit61_137_1(type === '&&') ? '' : '!') + '(' + exp1 + ')){');
      _$jscoverage['/xtemplate/compiler.js'].lineData[138]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[139]++;
      source.push(exp + ' = ' + exp2 + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[140]++;
      source.push('}');
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[142]++;
      pushToArray(source, code2Source);
      _$jscoverage['/xtemplate/compiler.js'].lineData[143]++;
      source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[145]++;
    return {
  exp: exp, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[152]++;
  function getIdStringFromIdParts(source, idParts) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[10]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[153]++;
    if (visit62_153_1(idParts.length === 1)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[154]++;
      return null;
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[156]++;
    var i, l, idPart, idPartType, check = 0, nextIdNameCode;
    _$jscoverage['/xtemplate/compiler.js'].lineData[159]++;
    for (i = 0 , l = idParts.length; visit63_159_1(i < l); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[160]++;
      if (visit64_160_1(idParts[i].type)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[161]++;
        check = 1;
        _$jscoverage['/xtemplate/compiler.js'].lineData[162]++;
        break;
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[165]++;
    if (visit65_165_1(check)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[166]++;
      var ret = [];
      _$jscoverage['/xtemplate/compiler.js'].lineData[167]++;
      for (i = 0 , l = idParts.length; visit66_167_1(i < l); i++) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[168]++;
        idPart = idParts[i];
        _$jscoverage['/xtemplate/compiler.js'].lineData[169]++;
        idPartType = idPart.type;
        _$jscoverage['/xtemplate/compiler.js'].lineData[170]++;
        if (visit67_170_1(idPartType)) {
          _$jscoverage['/xtemplate/compiler.js'].lineData[171]++;
          nextIdNameCode = xtplAstToJs[idPartType](idPart);
          _$jscoverage['/xtemplate/compiler.js'].lineData[172]++;
          pushToArray(source, nextIdNameCode.source);
          _$jscoverage['/xtemplate/compiler.js'].lineData[173]++;
          ret.push(nextIdNameCode.exp);
        } else {
          _$jscoverage['/xtemplate/compiler.js'].lineData[176]++;
          ret.push(wrapByDoubleQuote(idPart));
        }
      }
      _$jscoverage['/xtemplate/compiler.js'].lineData[179]++;
      return ret;
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[181]++;
      return null;
    }
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[185]++;
  function genFunction(statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[11]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[186]++;
    var source = ['function(scope, buffer) {'];
    _$jscoverage['/xtemplate/compiler.js'].lineData[187]++;
    for (var i = 0, len = statements.length; visit68_187_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[188]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[190]++;
    source.push(RETURN_BUFFER);
    _$jscoverage['/xtemplate/compiler.js'].lineData[191]++;
    source.push('}');
    _$jscoverage['/xtemplate/compiler.js'].lineData[192]++;
    return source;
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[195]++;
  function genTopFunction(xtplAstToJs, statements) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[12]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[196]++;
    var source = [TOP_DECLARATION, nativeCode];
    _$jscoverage['/xtemplate/compiler.js'].lineData[200]++;
    for (var i = 0, len = statements.length; visit69_200_1(i < len); i++) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[201]++;
      pushToArray(source, xtplAstToJs[statements[i].type](statements[i]).source);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[203]++;
    source.push(RETURN_BUFFER);
    _$jscoverage['/xtemplate/compiler.js'].lineData[204]++;
    return {
  params: ['scope', 'buffer', 'undefined'], 
  source: source.join('\n')};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[210]++;
  function genOptionFromFunction(func, escape) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[13]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[211]++;
    var optionName = guid('option');
    _$jscoverage['/xtemplate/compiler.js'].lineData[213]++;
    var source = ['var ' + optionName + ' = {' + (escape ? 'escape: 1' : '') + '};'], params = func.params, hash = func.hash;
    _$jscoverage['/xtemplate/compiler.js'].lineData[217]++;
    if (visit70_217_1(params)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[218]++;
      var paramsName = guid('params');
      _$jscoverage['/xtemplate/compiler.js'].lineData[219]++;
      source.push('var ' + paramsName + ' = [];');
      _$jscoverage['/xtemplate/compiler.js'].lineData[220]++;
      util.each(params, function(param) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[14]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[221]++;
  var nextIdNameCode = xtplAstToJs[param.type](param);
  _$jscoverage['/xtemplate/compiler.js'].lineData[222]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[223]++;
  source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[225]++;
      source.push(optionName + '.params = ' + paramsName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[228]++;
    if (visit71_228_1(hash)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[229]++;
      var hashName = guid('hash');
      _$jscoverage['/xtemplate/compiler.js'].lineData[230]++;
      source.push('var ' + hashName + ' = {};');
      _$jscoverage['/xtemplate/compiler.js'].lineData[231]++;
      util.each(hash.value, function(v, key) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[15]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[232]++;
  var nextIdNameCode = xtplAstToJs[v.type](v);
  _$jscoverage['/xtemplate/compiler.js'].lineData[233]++;
  pushToArray(source, nextIdNameCode.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[234]++;
  source.push(hashName + '[' + wrapByDoubleQuote(key) + '] = ' + nextIdNameCode.exp + ';');
});
      _$jscoverage['/xtemplate/compiler.js'].lineData[236]++;
      source.push(optionName + '.hash = ' + hashName + ';');
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[239]++;
    return {
  exp: optionName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[245]++;
  function generateFunction(xtplAstToJs, func, escape, block) {
    _$jscoverage['/xtemplate/compiler.js'].functionData[16]++;
    _$jscoverage['/xtemplate/compiler.js'].lineData[246]++;
    var source = [], functionConfigCode, optionName, id = func.id, idName, idString = id.string, idParts = id.parts, lineNumber = id.lineNumber;
    _$jscoverage['/xtemplate/compiler.js'].lineData[255]++;
    functionConfigCode = genOptionFromFunction(func, escape);
    _$jscoverage['/xtemplate/compiler.js'].lineData[256]++;
    optionName = functionConfigCode.exp;
    _$jscoverage['/xtemplate/compiler.js'].lineData[257]++;
    pushToArray(source, functionConfigCode.source);
    _$jscoverage['/xtemplate/compiler.js'].lineData[259]++;
    if (visit72_259_1(block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[260]++;
      var programNode = block.program;
      _$jscoverage['/xtemplate/compiler.js'].lineData[261]++;
      source.push(optionName + '.fn = ' + genFunction(programNode.statements).join('\n') + ';');
      _$jscoverage['/xtemplate/compiler.js'].lineData[262]++;
      if (visit73_262_1(programNode.inverse)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[263]++;
        source.push(optionName + '.inverse = ' + genFunction(programNode.inverse).join('\n') + ';');
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[267]++;
    if (visit74_267_1(xtplAstToJs.isModule)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[269]++;
      if (visit75_269_1(visit76_269_2(idString === 'include') || visit77_269_3(idString === 'extend'))) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[271]++;
        source.push(substitute(REQUIRE_MODULE, {
  name: func.params[0].value}));
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[277]++;
    if (visit78_277_1(!block)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[278]++;
      idName = guid('callRet');
      _$jscoverage['/xtemplate/compiler.js'].lineData[279]++;
      source.push('var ' + idName);
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[282]++;
    if (visit79_282_1(idString in nativeCommands)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[283]++;
      source.push(substitute(CALL_NATIVE_COMMAND, {
  lhs: block ? 'buffer' : idName, 
  name: idString, 
  option: optionName, 
  lineNumber: lineNumber}));
    } else {
      _$jscoverage['/xtemplate/compiler.js'].lineData[289]++;
      if (visit80_289_1(block)) {
        _$jscoverage['/xtemplate/compiler.js'].lineData[290]++;
        source.push(substitute(CALL_CUSTOM_COMMAND, {
  option: optionName, 
  idParts: joinArrayOfString(idParts), 
  lineNumber: lineNumber}));
      } else {
        _$jscoverage['/xtemplate/compiler.js'].lineData[298]++;
        var newParts = getIdStringFromIdParts(source, idParts);
        _$jscoverage['/xtemplate/compiler.js'].lineData[299]++;
        source.push(substitute(CALL_FUNCTION, {
  lhs: idName, 
  option: optionName, 
  idParts: (newParts ? newParts.join(',') : joinArrayOfString(idParts)), 
  depth: id.depth, 
  lineNumber: lineNumber}));
      }
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[308]++;
    if (visit81_308_1(idName)) {
      _$jscoverage['/xtemplate/compiler.js'].lineData[309]++;
      source.push(substitute(CHECK_BUFFER, {
  name: idName}));
    }
    _$jscoverage['/xtemplate/compiler.js'].lineData[314]++;
    return {
  exp: idName, 
  source: source};
  }
  _$jscoverage['/xtemplate/compiler.js'].lineData[320]++;
  var xtplAstToJs = {
  conditionalOrExpression: opExpression, 
  conditionalAndExpression: opExpression, 
  relationalExpression: opExpression, 
  equalityExpression: opExpression, 
  additiveExpression: opExpression, 
  multiplicativeExpression: opExpression, 
  unaryExpression: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[17]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[334]++;
  var code = xtplAstToJs[e.value.type](e.value);
  _$jscoverage['/xtemplate/compiler.js'].lineData[335]++;
  return {
  exp: e.unaryType + '(' + code.exp + ')', 
  source: code.source};
}, 
  string: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[18]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[344]++;
  return {
  exp: wrapBySingleQuote(escapeString(e.value, 1)), 
  source: []};
}, 
  number: function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[19]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[351]++;
  return {
  exp: e.value, 
  source: []};
}, 
  id: function(idNode) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[20]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[358]++;
  var source = [], depth = idNode.depth, idParts = idNode.parts, idName = guid('id');
  _$jscoverage['/xtemplate/compiler.js'].lineData[363]++;
  var newParts = getIdStringFromIdParts(source, idParts);
  _$jscoverage['/xtemplate/compiler.js'].lineData[365]++;
  source.push(substitute(SCOPE_RESOLVE, {
  lhs: idName, 
  idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts), 
  depth: depth}));
  _$jscoverage['/xtemplate/compiler.js'].lineData[370]++;
  return {
  exp: idName, 
  source: source};
}, 
  'function': function(func, escape) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[21]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[377]++;
  return generateFunction(this, func, escape);
}, 
  blockStatement: function(block) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[22]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[381]++;
  return generateFunction(this, block.func, block.escape, block);
}, 
  expressionStatement: function(expressionStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[23]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[385]++;
  var source = [], escape = expressionStatement.escape, code, expression = expressionStatement.value, type = expression.type, expressionOrVariable;
  _$jscoverage['/xtemplate/compiler.js'].lineData[392]++;
  code = xtplAstToJs[type](expression, escape);
  _$jscoverage['/xtemplate/compiler.js'].lineData[394]++;
  pushToArray(source, code.source);
  _$jscoverage['/xtemplate/compiler.js'].lineData[395]++;
  expressionOrVariable = code.exp;
  _$jscoverage['/xtemplate/compiler.js'].lineData[397]++;
  source.push(substitute(BUFFER_WRITE, {
  value: expressionOrVariable, 
  escape: !!escape}));
  _$jscoverage['/xtemplate/compiler.js'].lineData[402]++;
  return {
  exp: '', 
  source: source};
}, 
  contentStatement: function(contentStatement) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[24]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[410]++;
  return {
  exp: '', 
  source: [substitute(BUFFER_WRITE, {
  value: wrapBySingleQuote(escapeString(contentStatement.value, 0)), 
  escape: 0})]};
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[423]++;
  xtplAstToJs['boolean'] = function(e) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[25]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[424]++;
  return {
  exp: e.value, 
  source: []};
};
  _$jscoverage['/xtemplate/compiler.js'].lineData[430]++;
  var compiler;
  _$jscoverage['/xtemplate/compiler.js'].lineData[437]++;
  compiler = {
  parse: function(tplContent, name) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[26]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[445]++;
  return parser.parse(tplContent, name);
}, 
  compileToStr: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[27]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[455]++;
  var func = compiler.compile(tplContent, name, isModule);
  _$jscoverage['/xtemplate/compiler.js'].lineData[456]++;
  return substitute(FUNC, {
  params: func.params.join(','), 
  body: func.source});
}, 
  compile: function(tplContent, name, isModule) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[28]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[469]++;
  var root = compiler.parse(tplContent, name);
  _$jscoverage['/xtemplate/compiler.js'].lineData[470]++;
  uuid = 0;
  _$jscoverage['/xtemplate/compiler.js'].lineData[471]++;
  xtplAstToJs.isModule = isModule;
  _$jscoverage['/xtemplate/compiler.js'].lineData[472]++;
  return genTopFunction(xtplAstToJs, root.statements);
}, 
  compileToFn: function(tplContent, name) {
  _$jscoverage['/xtemplate/compiler.js'].functionData[29]++;
  _$jscoverage['/xtemplate/compiler.js'].lineData[481]++;
  var code = compiler.compile(tplContent, visit82_481_1(name || guid('xtemplate')));
  _$jscoverage['/xtemplate/compiler.js'].lineData[483]++;
  return Function.apply(null, code.params.concat(code.source + substitute(SOURCE_URL, {
  name: name})));
}};
  _$jscoverage['/xtemplate/compiler.js'].lineData[490]++;
  return compiler;
});
