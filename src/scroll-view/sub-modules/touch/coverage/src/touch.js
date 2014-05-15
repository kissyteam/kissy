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
if (! _$jscoverage['/touch.js']) {
  _$jscoverage['/touch.js'] = {};
  _$jscoverage['/touch.js'].lineData = [];
  _$jscoverage['/touch.js'].lineData[6] = 0;
  _$jscoverage['/touch.js'].lineData[7] = 0;
  _$jscoverage['/touch.js'].lineData[8] = 0;
  _$jscoverage['/touch.js'].lineData[9] = 0;
  _$jscoverage['/touch.js'].lineData[10] = 0;
  _$jscoverage['/touch.js'].lineData[11] = 0;
  _$jscoverage['/touch.js'].lineData[12] = 0;
  _$jscoverage['/touch.js'].lineData[13] = 0;
  _$jscoverage['/touch.js'].lineData[15] = 0;
  _$jscoverage['/touch.js'].lineData[16] = 0;
  _$jscoverage['/touch.js'].lineData[17] = 0;
  _$jscoverage['/touch.js'].lineData[19] = 0;
  _$jscoverage['/touch.js'].lineData[25] = 0;
  _$jscoverage['/touch.js'].lineData[26] = 0;
  _$jscoverage['/touch.js'].lineData[29] = 0;
  _$jscoverage['/touch.js'].lineData[30] = 0;
  _$jscoverage['/touch.js'].lineData[31] = 0;
  _$jscoverage['/touch.js'].lineData[32] = 0;
  _$jscoverage['/touch.js'].lineData[33] = 0;
  _$jscoverage['/touch.js'].lineData[34] = 0;
  _$jscoverage['/touch.js'].lineData[35] = 0;
  _$jscoverage['/touch.js'].lineData[36] = 0;
  _$jscoverage['/touch.js'].lineData[39] = 0;
  _$jscoverage['/touch.js'].lineData[42] = 0;
  _$jscoverage['/touch.js'].lineData[43] = 0;
  _$jscoverage['/touch.js'].lineData[44] = 0;
  _$jscoverage['/touch.js'].lineData[45] = 0;
  _$jscoverage['/touch.js'].lineData[47] = 0;
  _$jscoverage['/touch.js'].lineData[50] = 0;
  _$jscoverage['/touch.js'].lineData[51] = 0;
  _$jscoverage['/touch.js'].lineData[52] = 0;
  _$jscoverage['/touch.js'].lineData[53] = 0;
  _$jscoverage['/touch.js'].lineData[55] = 0;
  _$jscoverage['/touch.js'].lineData[60] = 0;
  _$jscoverage['/touch.js'].lineData[61] = 0;
  _$jscoverage['/touch.js'].lineData[62] = 0;
  _$jscoverage['/touch.js'].lineData[63] = 0;
  _$jscoverage['/touch.js'].lineData[65] = 0;
  _$jscoverage['/touch.js'].lineData[66] = 0;
  _$jscoverage['/touch.js'].lineData[67] = 0;
  _$jscoverage['/touch.js'].lineData[68] = 0;
  _$jscoverage['/touch.js'].lineData[74] = 0;
  _$jscoverage['/touch.js'].lineData[77] = 0;
  _$jscoverage['/touch.js'].lineData[78] = 0;
  _$jscoverage['/touch.js'].lineData[79] = 0;
  _$jscoverage['/touch.js'].lineData[82] = 0;
  _$jscoverage['/touch.js'].lineData[84] = 0;
  _$jscoverage['/touch.js'].lineData[86] = 0;
  _$jscoverage['/touch.js'].lineData[97] = 0;
  _$jscoverage['/touch.js'].lineData[98] = 0;
  _$jscoverage['/touch.js'].lineData[100] = 0;
  _$jscoverage['/touch.js'].lineData[103] = 0;
  _$jscoverage['/touch.js'].lineData[104] = 0;
  _$jscoverage['/touch.js'].lineData[105] = 0;
  _$jscoverage['/touch.js'].lineData[106] = 0;
  _$jscoverage['/touch.js'].lineData[107] = 0;
  _$jscoverage['/touch.js'].lineData[109] = 0;
  _$jscoverage['/touch.js'].lineData[111] = 0;
  _$jscoverage['/touch.js'].lineData[112] = 0;
  _$jscoverage['/touch.js'].lineData[113] = 0;
  _$jscoverage['/touch.js'].lineData[114] = 0;
  _$jscoverage['/touch.js'].lineData[115] = 0;
  _$jscoverage['/touch.js'].lineData[118] = 0;
  _$jscoverage['/touch.js'].lineData[119] = 0;
  _$jscoverage['/touch.js'].lineData[123] = 0;
  _$jscoverage['/touch.js'].lineData[125] = 0;
  _$jscoverage['/touch.js'].lineData[126] = 0;
  _$jscoverage['/touch.js'].lineData[128] = 0;
  _$jscoverage['/touch.js'].lineData[129] = 0;
  _$jscoverage['/touch.js'].lineData[130] = 0;
  _$jscoverage['/touch.js'].lineData[132] = 0;
  _$jscoverage['/touch.js'].lineData[133] = 0;
  _$jscoverage['/touch.js'].lineData[134] = 0;
  _$jscoverage['/touch.js'].lineData[136] = 0;
  _$jscoverage['/touch.js'].lineData[137] = 0;
  _$jscoverage['/touch.js'].lineData[143] = 0;
  _$jscoverage['/touch.js'].lineData[145] = 0;
  _$jscoverage['/touch.js'].lineData[147] = 0;
  _$jscoverage['/touch.js'].lineData[149] = 0;
  _$jscoverage['/touch.js'].lineData[153] = 0;
  _$jscoverage['/touch.js'].lineData[154] = 0;
  _$jscoverage['/touch.js'].lineData[155] = 0;
  _$jscoverage['/touch.js'].lineData[157] = 0;
  _$jscoverage['/touch.js'].lineData[162] = 0;
  _$jscoverage['/touch.js'].lineData[163] = 0;
  _$jscoverage['/touch.js'].lineData[165] = 0;
  _$jscoverage['/touch.js'].lineData[166] = 0;
  _$jscoverage['/touch.js'].lineData[168] = 0;
  _$jscoverage['/touch.js'].lineData[169] = 0;
  _$jscoverage['/touch.js'].lineData[170] = 0;
  _$jscoverage['/touch.js'].lineData[171] = 0;
  _$jscoverage['/touch.js'].lineData[172] = 0;
  _$jscoverage['/touch.js'].lineData[175] = 0;
  _$jscoverage['/touch.js'].lineData[176] = 0;
  _$jscoverage['/touch.js'].lineData[178] = 0;
  _$jscoverage['/touch.js'].lineData[179] = 0;
  _$jscoverage['/touch.js'].lineData[182] = 0;
  _$jscoverage['/touch.js'].lineData[186] = 0;
  _$jscoverage['/touch.js'].lineData[187] = 0;
  _$jscoverage['/touch.js'].lineData[188] = 0;
  _$jscoverage['/touch.js'].lineData[189] = 0;
  _$jscoverage['/touch.js'].lineData[190] = 0;
  _$jscoverage['/touch.js'].lineData[191] = 0;
  _$jscoverage['/touch.js'].lineData[193] = 0;
  _$jscoverage['/touch.js'].lineData[196] = 0;
  _$jscoverage['/touch.js'].lineData[197] = 0;
  _$jscoverage['/touch.js'].lineData[198] = 0;
  _$jscoverage['/touch.js'].lineData[199] = 0;
  _$jscoverage['/touch.js'].lineData[201] = 0;
  _$jscoverage['/touch.js'].lineData[205] = 0;
  _$jscoverage['/touch.js'].lineData[208] = 0;
  _$jscoverage['/touch.js'].lineData[209] = 0;
  _$jscoverage['/touch.js'].lineData[210] = 0;
  _$jscoverage['/touch.js'].lineData[211] = 0;
  _$jscoverage['/touch.js'].lineData[213] = 0;
  _$jscoverage['/touch.js'].lineData[214] = 0;
  _$jscoverage['/touch.js'].lineData[215] = 0;
  _$jscoverage['/touch.js'].lineData[218] = 0;
  _$jscoverage['/touch.js'].lineData[219] = 0;
  _$jscoverage['/touch.js'].lineData[220] = 0;
  _$jscoverage['/touch.js'].lineData[221] = 0;
  _$jscoverage['/touch.js'].lineData[223] = 0;
  _$jscoverage['/touch.js'].lineData[233] = 0;
  _$jscoverage['/touch.js'].lineData[234] = 0;
  _$jscoverage['/touch.js'].lineData[235] = 0;
  _$jscoverage['/touch.js'].lineData[236] = 0;
  _$jscoverage['/touch.js'].lineData[237] = 0;
  _$jscoverage['/touch.js'].lineData[238] = 0;
  _$jscoverage['/touch.js'].lineData[239] = 0;
  _$jscoverage['/touch.js'].lineData[240] = 0;
  _$jscoverage['/touch.js'].lineData[242] = 0;
  _$jscoverage['/touch.js'].lineData[243] = 0;
  _$jscoverage['/touch.js'].lineData[244] = 0;
  _$jscoverage['/touch.js'].lineData[245] = 0;
  _$jscoverage['/touch.js'].lineData[246] = 0;
  _$jscoverage['/touch.js'].lineData[247] = 0;
  _$jscoverage['/touch.js'].lineData[257] = 0;
  _$jscoverage['/touch.js'].lineData[258] = 0;
  _$jscoverage['/touch.js'].lineData[259] = 0;
  _$jscoverage['/touch.js'].lineData[262] = 0;
  _$jscoverage['/touch.js'].lineData[263] = 0;
  _$jscoverage['/touch.js'].lineData[264] = 0;
  _$jscoverage['/touch.js'].lineData[265] = 0;
  _$jscoverage['/touch.js'].lineData[266] = 0;
  _$jscoverage['/touch.js'].lineData[268] = 0;
  _$jscoverage['/touch.js'].lineData[274] = 0;
  _$jscoverage['/touch.js'].lineData[275] = 0;
  _$jscoverage['/touch.js'].lineData[277] = 0;
  _$jscoverage['/touch.js'].lineData[279] = 0;
  _$jscoverage['/touch.js'].lineData[280] = 0;
  _$jscoverage['/touch.js'].lineData[281] = 0;
  _$jscoverage['/touch.js'].lineData[284] = 0;
  _$jscoverage['/touch.js'].lineData[288] = 0;
  _$jscoverage['/touch.js'].lineData[289] = 0;
  _$jscoverage['/touch.js'].lineData[290] = 0;
  _$jscoverage['/touch.js'].lineData[291] = 0;
  _$jscoverage['/touch.js'].lineData[292] = 0;
  _$jscoverage['/touch.js'].lineData[293] = 0;
  _$jscoverage['/touch.js'].lineData[294] = 0;
  _$jscoverage['/touch.js'].lineData[298] = 0;
  _$jscoverage['/touch.js'].lineData[299] = 0;
  _$jscoverage['/touch.js'].lineData[300] = 0;
  _$jscoverage['/touch.js'].lineData[301] = 0;
  _$jscoverage['/touch.js'].lineData[302] = 0;
  _$jscoverage['/touch.js'].lineData[303] = 0;
  _$jscoverage['/touch.js'].lineData[304] = 0;
  _$jscoverage['/touch.js'].lineData[305] = 0;
  _$jscoverage['/touch.js'].lineData[306] = 0;
  _$jscoverage['/touch.js'].lineData[307] = 0;
  _$jscoverage['/touch.js'].lineData[308] = 0;
  _$jscoverage['/touch.js'].lineData[313] = 0;
  _$jscoverage['/touch.js'].lineData[314] = 0;
  _$jscoverage['/touch.js'].lineData[315] = 0;
  _$jscoverage['/touch.js'].lineData[316] = 0;
  _$jscoverage['/touch.js'].lineData[317] = 0;
  _$jscoverage['/touch.js'].lineData[318] = 0;
  _$jscoverage['/touch.js'].lineData[319] = 0;
  _$jscoverage['/touch.js'].lineData[324] = 0;
  _$jscoverage['/touch.js'].lineData[325] = 0;
  _$jscoverage['/touch.js'].lineData[326] = 0;
  _$jscoverage['/touch.js'].lineData[328] = 0;
  _$jscoverage['/touch.js'].lineData[329] = 0;
  _$jscoverage['/touch.js'].lineData[332] = 0;
  _$jscoverage['/touch.js'].lineData[335] = 0;
  _$jscoverage['/touch.js'].lineData[336] = 0;
  _$jscoverage['/touch.js'].lineData[339] = 0;
  _$jscoverage['/touch.js'].lineData[341] = 0;
  _$jscoverage['/touch.js'].lineData[342] = 0;
  _$jscoverage['/touch.js'].lineData[349] = 0;
  _$jscoverage['/touch.js'].lineData[350] = 0;
  _$jscoverage['/touch.js'].lineData[353] = 0;
  _$jscoverage['/touch.js'].lineData[354] = 0;
  _$jscoverage['/touch.js'].lineData[356] = 0;
  _$jscoverage['/touch.js'].lineData[357] = 0;
  _$jscoverage['/touch.js'].lineData[360] = 0;
  _$jscoverage['/touch.js'].lineData[361] = 0;
  _$jscoverage['/touch.js'].lineData[363] = 0;
  _$jscoverage['/touch.js'].lineData[364] = 0;
  _$jscoverage['/touch.js'].lineData[365] = 0;
  _$jscoverage['/touch.js'].lineData[372] = 0;
  _$jscoverage['/touch.js'].lineData[373] = 0;
  _$jscoverage['/touch.js'].lineData[379] = 0;
  _$jscoverage['/touch.js'].lineData[388] = 0;
  _$jscoverage['/touch.js'].lineData[390] = 0;
  _$jscoverage['/touch.js'].lineData[391] = 0;
  _$jscoverage['/touch.js'].lineData[392] = 0;
  _$jscoverage['/touch.js'].lineData[393] = 0;
  _$jscoverage['/touch.js'].lineData[394] = 0;
  _$jscoverage['/touch.js'].lineData[395] = 0;
  _$jscoverage['/touch.js'].lineData[396] = 0;
  _$jscoverage['/touch.js'].lineData[397] = 0;
  _$jscoverage['/touch.js'].lineData[398] = 0;
  _$jscoverage['/touch.js'].lineData[399] = 0;
  _$jscoverage['/touch.js'].lineData[407] = 0;
  _$jscoverage['/touch.js'].lineData[411] = 0;
  _$jscoverage['/touch.js'].lineData[412] = 0;
  _$jscoverage['/touch.js'].lineData[413] = 0;
  _$jscoverage['/touch.js'].lineData[417] = 0;
  _$jscoverage['/touch.js'].lineData[421] = 0;
  _$jscoverage['/touch.js'].lineData[422] = 0;
}
if (! _$jscoverage['/touch.js'].functionData) {
  _$jscoverage['/touch.js'].functionData = [];
  _$jscoverage['/touch.js'].functionData[0] = 0;
  _$jscoverage['/touch.js'].functionData[1] = 0;
  _$jscoverage['/touch.js'].functionData[2] = 0;
  _$jscoverage['/touch.js'].functionData[3] = 0;
  _$jscoverage['/touch.js'].functionData[4] = 0;
  _$jscoverage['/touch.js'].functionData[5] = 0;
  _$jscoverage['/touch.js'].functionData[6] = 0;
  _$jscoverage['/touch.js'].functionData[7] = 0;
  _$jscoverage['/touch.js'].functionData[8] = 0;
  _$jscoverage['/touch.js'].functionData[9] = 0;
  _$jscoverage['/touch.js'].functionData[10] = 0;
  _$jscoverage['/touch.js'].functionData[11] = 0;
  _$jscoverage['/touch.js'].functionData[12] = 0;
  _$jscoverage['/touch.js'].functionData[13] = 0;
  _$jscoverage['/touch.js'].functionData[14] = 0;
  _$jscoverage['/touch.js'].functionData[15] = 0;
  _$jscoverage['/touch.js'].functionData[16] = 0;
  _$jscoverage['/touch.js'].functionData[17] = 0;
  _$jscoverage['/touch.js'].functionData[18] = 0;
  _$jscoverage['/touch.js'].functionData[19] = 0;
}
if (! _$jscoverage['/touch.js'].branchData) {
  _$jscoverage['/touch.js'].branchData = {};
  _$jscoverage['/touch.js'].branchData['16'] = [];
  _$jscoverage['/touch.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['19'] = [];
  _$jscoverage['/touch.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['25'] = [];
  _$jscoverage['/touch.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['29'] = [];
  _$jscoverage['/touch.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['33'] = [];
  _$jscoverage['/touch.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['43'] = [];
  _$jscoverage['/touch.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['44'] = [];
  _$jscoverage['/touch.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['51'] = [];
  _$jscoverage['/touch.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['60'] = [];
  _$jscoverage['/touch.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['62'] = [];
  _$jscoverage['/touch.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['65'] = [];
  _$jscoverage['/touch.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['77'] = [];
  _$jscoverage['/touch.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['82'] = [];
  _$jscoverage['/touch.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['118'] = [];
  _$jscoverage['/touch.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['126'] = [];
  _$jscoverage['/touch.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['126'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['126'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['128'] = [];
  _$jscoverage['/touch.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['143'] = [];
  _$jscoverage['/touch.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['154'] = [];
  _$jscoverage['/touch.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['165'] = [];
  _$jscoverage['/touch.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['165'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['178'] = [];
  _$jscoverage['/touch.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['186'] = [];
  _$jscoverage['/touch.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['188'] = [];
  _$jscoverage['/touch.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['188'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['188'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['190'] = [];
  _$jscoverage['/touch.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['196'] = [];
  _$jscoverage['/touch.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['196'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['196'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['198'] = [];
  _$jscoverage['/touch.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['210'] = [];
  _$jscoverage['/touch.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['220'] = [];
  _$jscoverage['/touch.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['239'] = [];
  _$jscoverage['/touch.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['240'] = [];
  _$jscoverage['/touch.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['244'] = [];
  _$jscoverage['/touch.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['257'] = [];
  _$jscoverage['/touch.js'].branchData['257'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['279'] = [];
  _$jscoverage['/touch.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['280'] = [];
  _$jscoverage['/touch.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['288'] = [];
  _$jscoverage['/touch.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['290'] = [];
  _$jscoverage['/touch.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'] = [];
  _$jscoverage['/touch.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['291'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'] = [];
  _$jscoverage['/touch.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['293'][3] = new BranchData();
  _$jscoverage['/touch.js'].branchData['301'] = [];
  _$jscoverage['/touch.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['303'] = [];
  _$jscoverage['/touch.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['305'] = [];
  _$jscoverage['/touch.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['306'] = [];
  _$jscoverage['/touch.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['314'] = [];
  _$jscoverage['/touch.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['316'] = [];
  _$jscoverage['/touch.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['317'] = [];
  _$jscoverage['/touch.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['324'] = [];
  _$jscoverage['/touch.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['325'] = [];
  _$jscoverage['/touch.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['335'] = [];
  _$jscoverage['/touch.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['356'] = [];
  _$jscoverage['/touch.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['356'][2] = new BranchData();
  _$jscoverage['/touch.js'].branchData['360'] = [];
  _$jscoverage['/touch.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/touch.js'].branchData['363'] = [];
  _$jscoverage['/touch.js'].branchData['363'][1] = new BranchData();
}
_$jscoverage['/touch.js'].branchData['363'][1].init(287, 16, 'self.isScrolling');
function visit65_363_1(result) {
  _$jscoverage['/touch.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['360'][1].init(202, 36, 'self.isScrolling && self.pagesOffset');
function visit64_360_1(result) {
  _$jscoverage['/touch.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['356'][2].init(62, 25, 'e.gestureType === \'touch\'');
function visit63_356_2(result) {
  _$jscoverage['/touch.js'].branchData['356'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['356'][1].init(42, 45, 'self.isScrolling && e.gestureType === \'touch\'');
function visit62_356_1(result) {
  _$jscoverage['/touch.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['335'][1].init(30, 16, 'allowX || allowY');
function visit61_335_1(result) {
  _$jscoverage['/touch.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['325'][1].init(34, 26, 'newPageIndex !== pageIndex');
function visit60_325_1(result) {
  _$jscoverage['/touch.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['324'][1].init(2157, 26, 'newPageIndex !== undefined');
function visit59_324_1(result) {
  _$jscoverage['/touch.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['317'][1].init(42, 23, 'min < nowXY.top - x.top');
function visit58_317_1(result) {
  _$jscoverage['/touch.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['316'][1].init(88, 17, 'x.top < nowXY.top');
function visit57_316_1(result) {
  _$jscoverage['/touch.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['314'][1].init(95, 15, 'i < prepareXLen');
function visit56_314_1(result) {
  _$jscoverage['/touch.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['306'][1].init(42, 23, 'min < x.top - nowXY.top');
function visit55_306_1(result) {
  _$jscoverage['/touch.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['305'][1].init(88, 17, 'x.top > nowXY.top');
function visit54_305_1(result) {
  _$jscoverage['/touch.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['303'][1].init(95, 15, 'i < prepareXLen');
function visit53_303_1(result) {
  _$jscoverage['/touch.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['301'][1].init(978, 11, 'offsetY > 0');
function visit52_301_1(result) {
  _$jscoverage['/touch.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][3].init(201, 24, 'offset.left < nowXY.left');
function visit51_293_3(result) {
  _$jscoverage['/touch.js'].branchData['293'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][2].init(186, 11, 'offsetX < 0');
function visit50_293_2(result) {
  _$jscoverage['/touch.js'].branchData['293'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['293'][1].init(186, 39, 'offsetX < 0 && offset.left < nowXY.left');
function visit49_293_1(result) {
  _$jscoverage['/touch.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][3].init(53, 24, 'offset.left > nowXY.left');
function visit48_291_3(result) {
  _$jscoverage['/touch.js'].branchData['291'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][2].init(38, 11, 'offsetX > 0');
function visit47_291_2(result) {
  _$jscoverage['/touch.js'].branchData['291'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['291'][1].init(38, 39, 'offsetX > 0 && offset.left > nowXY.left');
function visit46_291_1(result) {
  _$jscoverage['/touch.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['290'][1].init(92, 6, 'offset');
function visit45_290_1(result) {
  _$jscoverage['/touch.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['288'][1].init(315, 18, 'i < pagesOffsetLen');
function visit44_288_1(result) {
  _$jscoverage['/touch.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['280'][1].init(26, 16, 'allowX && allowY');
function visit43_280_1(result) {
  _$jscoverage['/touch.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['279'][1].init(1235, 16, 'allowX || allowY');
function visit42_279_1(result) {
  _$jscoverage['/touch.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['257'][1].init(487, 17, '!self.pagesOffset');
function visit41_257_1(result) {
  _$jscoverage['/touch.js'].branchData['257'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['244'][1].init(40, 11, 'count === 2');
function visit40_244_1(result) {
  _$jscoverage['/touch.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['240'][2].init(300, 33, 'Math.abs(offsetY) > snapThreshold');
function visit39_240_2(result) {
  _$jscoverage['/touch.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['240'][1].init(276, 57, 'self.allowScroll.top && Math.abs(offsetY) > snapThreshold');
function visit38_240_1(result) {
  _$jscoverage['/touch.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['239'][2].init(219, 33, 'Math.abs(offsetX) > snapThreshold');
function visit37_239_2(result) {
  _$jscoverage['/touch.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['239'][1].init(194, 58, 'self.allowScroll.left && Math.abs(offsetX) > snapThreshold');
function visit36_239_1(result) {
  _$jscoverage['/touch.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['220'][1].init(40, 25, 'e.gestureType !== \'touch\'');
function visit35_220_1(result) {
  _$jscoverage['/touch.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['210'][1].init(40, 25, 'e.gestureType !== \'touch\'');
function visit34_210_1(result) {
  _$jscoverage['/touch.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['198'][1].init(61, 21, 'self._preventDefaultY');
function visit33_198_1(result) {
  _$jscoverage['/touch.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['196'][3].init(338, 19, 'direction === \'top\'');
function visit32_196_3(result) {
  _$jscoverage['/touch.js'].branchData['196'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['196'][2].init(338, 51, 'direction === \'top\' && !self.allowScroll[direction]');
function visit31_196_2(result) {
  _$jscoverage['/touch.js'].branchData['196'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['196'][1].init(329, 60, 'lockY && direction === \'top\' && !self.allowScroll[direction]');
function visit30_196_1(result) {
  _$jscoverage['/touch.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['190'][1].init(61, 21, 'self._preventDefaultX');
function visit29_190_1(result) {
  _$jscoverage['/touch.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['188'][3].init(69, 20, 'direction === \'left\'');
function visit28_188_3(result) {
  _$jscoverage['/touch.js'].branchData['188'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['188'][2].init(69, 52, 'direction === \'left\' && !self.allowScroll[direction]');
function visit27_188_2(result) {
  _$jscoverage['/touch.js'].branchData['188'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['188'][1].init(60, 61, 'lockX && direction === \'left\' && !self.allowScroll[direction]');
function visit26_188_1(result) {
  _$jscoverage['/touch.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['186'][1].init(270, 14, 'lockX || lockY');
function visit25_186_1(result) {
  _$jscoverage['/touch.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['178'][1].init(42, 25, 'e.gestureType !== \'touch\'');
function visit24_178_1(result) {
  _$jscoverage['/touch.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['165'][3].init(124, 36, 'self.isScrolling && self.pagesOffset');
function visit23_165_3(result) {
  _$jscoverage['/touch.js'].branchData['165'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['165'][2].init(94, 25, 'e.gestureType !== \'touch\'');
function visit22_165_2(result) {
  _$jscoverage['/touch.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['165'][1].init(94, 67, 'e.gestureType !== \'touch\' || (self.isScrolling && self.pagesOffset)');
function visit21_165_1(result) {
  _$jscoverage['/touch.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['154'][1].init(358, 11, 'value === 0');
function visit20_154_1(result) {
  _$jscoverage['/touch.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['143'][1].init(1184, 18, 'value <= minScroll');
function visit19_143_1(result) {
  _$jscoverage['/touch.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['128'][1].init(58, 22, 'fx.lastValue === value');
function visit18_128_1(result) {
  _$jscoverage['/touch.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['126'][3].init(403, 17, 'value < maxScroll');
function visit17_126_3(result) {
  _$jscoverage['/touch.js'].branchData['126'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['126'][2].init(382, 17, 'value > minScroll');
function visit16_126_2(result) {
  _$jscoverage['/touch.js'].branchData['126'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['126'][1].init(382, 38, 'value > minScroll && value < maxScroll');
function visit15_126_1(result) {
  _$jscoverage['/touch.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['118'][1].init(105, 7, 'inertia');
function visit14_118_1(result) {
  _$jscoverage['/touch.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['82'][1].init(1014, 21, 'scrollType === \'left\'');
function visit13_82_1(result) {
  _$jscoverage['/touch.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['77'][1].init(908, 16, 'self.pagesOffset');
function visit12_77_1(result) {
  _$jscoverage['/touch.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['65'][1].init(528, 19, 'bound !== undefined');
function visit11_65_1(result) {
  _$jscoverage['/touch.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['62'][1].init(427, 30, 'scroll > maxScroll[scrollType]');
function visit10_62_1(result) {
  _$jscoverage['/touch.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['60'][1].init(328, 30, 'scroll < minScroll[scrollType]');
function visit9_60_1(result) {
  _$jscoverage['/touch.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['51'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit8_51_1(result) {
  _$jscoverage['/touch.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['44'][1].init(79, 51, '!self.allowScroll[scrollType] && self[\'_\' + lockXY]');
function visit7_44_1(result) {
  _$jscoverage['/touch.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['43'][1].init(23, 21, 'scrollType === \'left\'');
function visit6_43_1(result) {
  _$jscoverage['/touch.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['33'][1].init(662, 30, 'scroll > maxScroll[scrollType]');
function visit5_33_1(result) {
  _$jscoverage['/touch.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['29'][1].init(458, 30, 'scroll < minScroll[scrollType]');
function visit4_29_1(result) {
  _$jscoverage['/touch.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['25'][1].init(319, 13, '!self._bounce');
function visit3_25_1(result) {
  _$jscoverage['/touch.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['19'][1].init(98, 21, 'scrollType === \'left\'');
function visit2_19_1(result) {
  _$jscoverage['/touch.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].branchData['16'][1].init(14, 28, 'forbidDrag(self, scrollType)');
function visit1_16_1(result) {
  _$jscoverage['/touch.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch.js'].functionData[0]++;
  _$jscoverage['/touch.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/touch.js'].lineData[8]++;
  var ScrollViewBase = require('./base');
  _$jscoverage['/touch.js'].lineData[9]++;
  var TimerAnim = require('anim/timer');
  _$jscoverage['/touch.js'].lineData[10]++;
  var OUT_OF_BOUND_FACTOR = 0.5;
  _$jscoverage['/touch.js'].lineData[11]++;
  var MAX_SWIPE_VELOCITY = 6;
  _$jscoverage['/touch.js'].lineData[12]++;
  var BasicGesture = require('event/gesture/basic');
  _$jscoverage['/touch.js'].lineData[13]++;
  var DragGesture = require('event/gesture/drag');
  _$jscoverage['/touch.js'].lineData[15]++;
  function onDragScroll(self, e, scrollType) {
    _$jscoverage['/touch.js'].functionData[1]++;
    _$jscoverage['/touch.js'].lineData[16]++;
    if (visit1_16_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[17]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[19]++;
    var diff = visit2_19_1(scrollType === 'left') ? e.deltaX : e.deltaY, scroll = self.startScroll[scrollType] - diff, bound, minScroll = self.minScroll, maxScroll = self.maxScroll;
    _$jscoverage['/touch.js'].lineData[25]++;
    if (visit3_25_1(!self._bounce)) {
      _$jscoverage['/touch.js'].lineData[26]++;
      scroll = Math.min(Math.max(scroll, minScroll[scrollType]), maxScroll[scrollType]);
    }
    _$jscoverage['/touch.js'].lineData[29]++;
    if (visit4_29_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[30]++;
      bound = minScroll[scrollType] - scroll;
      _$jscoverage['/touch.js'].lineData[31]++;
      bound *= OUT_OF_BOUND_FACTOR;
      _$jscoverage['/touch.js'].lineData[32]++;
      scroll = minScroll[scrollType] - bound;
    } else {
      _$jscoverage['/touch.js'].lineData[33]++;
      if (visit5_33_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[34]++;
        bound = scroll - maxScroll[scrollType];
        _$jscoverage['/touch.js'].lineData[35]++;
        bound *= OUT_OF_BOUND_FACTOR;
        _$jscoverage['/touch.js'].lineData[36]++;
        scroll = maxScroll[scrollType] + bound;
      }
    }
    _$jscoverage['/touch.js'].lineData[39]++;
    self.set('scroll' + util.ucfirst(scrollType), scroll);
  }
  _$jscoverage['/touch.js'].lineData[42]++;
  function forbidDrag(self, scrollType) {
    _$jscoverage['/touch.js'].functionData[2]++;
    _$jscoverage['/touch.js'].lineData[43]++;
    var lockXY = visit6_43_1(scrollType === 'left') ? 'lockX' : 'lockY';
    _$jscoverage['/touch.js'].lineData[44]++;
    if (visit7_44_1(!self.allowScroll[scrollType] && self['_' + lockXY])) {
      _$jscoverage['/touch.js'].lineData[45]++;
      return 1;
    }
    _$jscoverage['/touch.js'].lineData[47]++;
    return 0;
  }
  _$jscoverage['/touch.js'].lineData[50]++;
  function onDragEndAxis(self, e, scrollType, endCallback) {
    _$jscoverage['/touch.js'].functionData[3]++;
    _$jscoverage['/touch.js'].lineData[51]++;
    if (visit8_51_1(forbidDrag(self, scrollType))) {
      _$jscoverage['/touch.js'].lineData[52]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[53]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[55]++;
    var scrollAxis = 'scroll' + util.ucfirst(scrollType), scroll = self.get(scrollAxis), minScroll = self.minScroll, maxScroll = self.maxScroll, bound;
    _$jscoverage['/touch.js'].lineData[60]++;
    if (visit9_60_1(scroll < minScroll[scrollType])) {
      _$jscoverage['/touch.js'].lineData[61]++;
      bound = minScroll[scrollType];
    } else {
      _$jscoverage['/touch.js'].lineData[62]++;
      if (visit10_62_1(scroll > maxScroll[scrollType])) {
        _$jscoverage['/touch.js'].lineData[63]++;
        bound = maxScroll[scrollType];
      }
    }
    _$jscoverage['/touch.js'].lineData[65]++;
    if (visit11_65_1(bound !== undefined)) {
      _$jscoverage['/touch.js'].lineData[66]++;
      var scrollCfg = {};
      _$jscoverage['/touch.js'].lineData[67]++;
      scrollCfg[scrollType] = bound;
      _$jscoverage['/touch.js'].lineData[68]++;
      self.scrollTo(scrollCfg, {
  duration: self.get('bounceDuration'), 
  easing: self.get('bounceEasing'), 
  queue: false, 
  complete: endCallback});
      _$jscoverage['/touch.js'].lineData[74]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[77]++;
    if (visit12_77_1(self.pagesOffset)) {
      _$jscoverage['/touch.js'].lineData[78]++;
      endCallback();
      _$jscoverage['/touch.js'].lineData[79]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[82]++;
    var velocity = visit13_82_1(scrollType === 'left') ? -e.velocityX : -e.velocityY;
    _$jscoverage['/touch.js'].lineData[84]++;
    velocity = Math.min(Math.max(velocity, -MAX_SWIPE_VELOCITY), MAX_SWIPE_VELOCITY);
    _$jscoverage['/touch.js'].lineData[86]++;
    var animCfg = {
  node: {}, 
  to: {}, 
  duration: 9999, 
  queue: false, 
  complete: endCallback, 
  frame: makeMomentumFx(self, velocity, scroll, scrollAxis, maxScroll[scrollType], minScroll[scrollType])};
    _$jscoverage['/touch.js'].lineData[97]++;
    animCfg.node[scrollType] = scroll;
    _$jscoverage['/touch.js'].lineData[98]++;
    animCfg.to[scrollType] = null;
    _$jscoverage['/touch.js'].lineData[100]++;
    self.scrollAnims.push(new TimerAnim(animCfg).run());
  }
  _$jscoverage['/touch.js'].lineData[103]++;
  var FRICTION = 0.5;
  _$jscoverage['/touch.js'].lineData[104]++;
  var ACCELERATION = 20;
  _$jscoverage['/touch.js'].lineData[105]++;
  var THETA = Math.log(1 - (FRICTION / 10));
  _$jscoverage['/touch.js'].lineData[106]++;
  var ALPHA = THETA / ACCELERATION;
  _$jscoverage['/touch.js'].lineData[107]++;
  var SPRING_TENSION = 0.3;
  _$jscoverage['/touch.js'].lineData[109]++;
  function makeMomentumFx(self, startVelocity, startScroll, scrollAxis, maxScroll, minScroll) {
    _$jscoverage['/touch.js'].functionData[4]++;
    _$jscoverage['/touch.js'].lineData[111]++;
    var velocity = startVelocity * ACCELERATION;
    _$jscoverage['/touch.js'].lineData[112]++;
    var inertia = 1;
    _$jscoverage['/touch.js'].lineData[113]++;
    var bounceStartTime = 0;
    _$jscoverage['/touch.js'].lineData[114]++;
    return function(anim, fx) {
  _$jscoverage['/touch.js'].functionData[5]++;
  _$jscoverage['/touch.js'].lineData[115]++;
  var now = util.now(), deltaTime, value;
  _$jscoverage['/touch.js'].lineData[118]++;
  if (visit14_118_1(inertia)) {
    _$jscoverage['/touch.js'].lineData[119]++;
    deltaTime = now - anim.startTime;
    _$jscoverage['/touch.js'].lineData[123]++;
    var frictionFactor = Math.exp(deltaTime * ALPHA);
    _$jscoverage['/touch.js'].lineData[125]++;
    value = parseInt(startScroll + velocity * (1 - frictionFactor) / (0 - THETA), 10);
    _$jscoverage['/touch.js'].lineData[126]++;
    if (visit15_126_1(visit16_126_2(value > minScroll) && visit17_126_3(value < maxScroll))) {
      _$jscoverage['/touch.js'].lineData[128]++;
      if (visit18_128_1(fx.lastValue === value)) {
        _$jscoverage['/touch.js'].lineData[129]++;
        fx.pos = 1;
        _$jscoverage['/touch.js'].lineData[130]++;
        return;
      }
      _$jscoverage['/touch.js'].lineData[132]++;
      fx.lastValue = value;
      _$jscoverage['/touch.js'].lineData[133]++;
      self.set(scrollAxis, value);
      _$jscoverage['/touch.js'].lineData[134]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[136]++;
    inertia = 0;
    _$jscoverage['/touch.js'].lineData[137]++;
    velocity = velocity * frictionFactor;
    _$jscoverage['/touch.js'].lineData[143]++;
    startScroll = visit19_143_1(value <= minScroll) ? minScroll : maxScroll;
    _$jscoverage['/touch.js'].lineData[145]++;
    bounceStartTime = now;
  } else {
    _$jscoverage['/touch.js'].lineData[147]++;
    deltaTime = now - bounceStartTime;
    _$jscoverage['/touch.js'].lineData[149]++;
    var theta = (deltaTime / ACCELERATION), powTime = theta * Math.exp(0 - SPRING_TENSION * theta);
    _$jscoverage['/touch.js'].lineData[153]++;
    value = parseInt(velocity * powTime, 10);
    _$jscoverage['/touch.js'].lineData[154]++;
    if (visit20_154_1(value === 0)) {
      _$jscoverage['/touch.js'].lineData[155]++;
      fx.pos = 1;
    }
    _$jscoverage['/touch.js'].lineData[157]++;
    self.set(scrollAxis, startScroll + value);
  }
};
  }
  _$jscoverage['/touch.js'].lineData[162]++;
  function onDragStartHandler(e) {
    _$jscoverage['/touch.js'].functionData[6]++;
    _$jscoverage['/touch.js'].lineData[163]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[165]++;
    if (visit21_165_1(visit22_165_2(e.gestureType !== 'touch') || (visit23_165_3(self.isScrolling && self.pagesOffset)))) {
      _$jscoverage['/touch.js'].lineData[166]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[168]++;
    self.startScroll = {};
    _$jscoverage['/touch.js'].lineData[169]++;
    self.dragInitDirection = null;
    _$jscoverage['/touch.js'].lineData[170]++;
    self.isScrolling = 1;
    _$jscoverage['/touch.js'].lineData[171]++;
    self.startScroll.left = self.get('scrollLeft');
    _$jscoverage['/touch.js'].lineData[172]++;
    self.startScroll.top = self.get('scrollTop');
  }
  _$jscoverage['/touch.js'].lineData[175]++;
  function onDragPreHandler(e) {
    _$jscoverage['/touch.js'].functionData[7]++;
    _$jscoverage['/touch.js'].lineData[176]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[178]++;
    if (visit24_178_1(e.gestureType !== 'touch')) {
      _$jscoverage['/touch.js'].lineData[179]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[182]++;
    var lockX = self._lockX, lockY = self._lockY;
    _$jscoverage['/touch.js'].lineData[186]++;
    if (visit25_186_1(lockX || lockY)) {
      _$jscoverage['/touch.js'].lineData[187]++;
      var direction = e.direction;
      _$jscoverage['/touch.js'].lineData[188]++;
      if (visit26_188_1(lockX && visit27_188_2(visit28_188_3(direction === 'left') && !self.allowScroll[direction]))) {
        _$jscoverage['/touch.js'].lineData[189]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[190]++;
        if (visit29_190_1(self._preventDefaultX)) {
          _$jscoverage['/touch.js'].lineData[191]++;
          e.preventDefault();
        }
        _$jscoverage['/touch.js'].lineData[193]++;
        return;
      }
      _$jscoverage['/touch.js'].lineData[196]++;
      if (visit30_196_1(lockY && visit31_196_2(visit32_196_3(direction === 'top') && !self.allowScroll[direction]))) {
        _$jscoverage['/touch.js'].lineData[197]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[198]++;
        if (visit33_198_1(self._preventDefaultY)) {
          _$jscoverage['/touch.js'].lineData[199]++;
          e.preventDefault();
        }
        _$jscoverage['/touch.js'].lineData[201]++;
        return;
      }
    }
    _$jscoverage['/touch.js'].lineData[205]++;
    e.preventDefault();
  }
  _$jscoverage['/touch.js'].lineData[208]++;
  function onDragHandler(e) {
    _$jscoverage['/touch.js'].functionData[8]++;
    _$jscoverage['/touch.js'].lineData[209]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[210]++;
    if (visit34_210_1(e.gestureType !== 'touch')) {
      _$jscoverage['/touch.js'].lineData[211]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[213]++;
    onDragScroll(self, e, 'left');
    _$jscoverage['/touch.js'].lineData[214]++;
    onDragScroll(self, e, 'top');
    _$jscoverage['/touch.js'].lineData[215]++;
    self.fire('touchMove');
  }
  _$jscoverage['/touch.js'].lineData[218]++;
  function onDragEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[9]++;
    _$jscoverage['/touch.js'].lineData[219]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[220]++;
    if (visit35_220_1(e.gestureType !== 'touch')) {
      _$jscoverage['/touch.js'].lineData[221]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[223]++;
    self.fire('touchEnd', {
  pageX: e.pageX, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageY: e.pageY, 
  velocityX: e.velocityX, 
  velocityY: e.velocityY});
  }
  _$jscoverage['/touch.js'].lineData[233]++;
  function defaultTouchEndHandler(e) {
    _$jscoverage['/touch.js'].functionData[10]++;
    _$jscoverage['/touch.js'].lineData[234]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[235]++;
    var count = 0;
    _$jscoverage['/touch.js'].lineData[236]++;
    var offsetX = -e.deltaX;
    _$jscoverage['/touch.js'].lineData[237]++;
    var offsetY = -e.deltaY;
    _$jscoverage['/touch.js'].lineData[238]++;
    var snapThreshold = self._snapThresholdCfg;
    _$jscoverage['/touch.js'].lineData[239]++;
    var allowX = visit36_239_1(self.allowScroll.left && visit37_239_2(Math.abs(offsetX) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[240]++;
    var allowY = visit38_240_1(self.allowScroll.top && visit39_240_2(Math.abs(offsetY) > snapThreshold));
    _$jscoverage['/touch.js'].lineData[242]++;
    function endCallback() {
      _$jscoverage['/touch.js'].functionData[11]++;
      _$jscoverage['/touch.js'].lineData[243]++;
      count++;
      _$jscoverage['/touch.js'].lineData[244]++;
      if (visit40_244_1(count === 2)) {
        _$jscoverage['/touch.js'].lineData[245]++;
        var scrollEnd = function() {
  _$jscoverage['/touch.js'].functionData[12]++;
  _$jscoverage['/touch.js'].lineData[246]++;
  self.isScrolling = 0;
  _$jscoverage['/touch.js'].lineData[247]++;
  self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY, 
  deltaX: -offsetX, 
  deltaY: -offsetY, 
  fromPageIndex: pageIndex, 
  pageIndex: self.get('pageIndex')});
};
        _$jscoverage['/touch.js'].lineData[257]++;
        if (visit41_257_1(!self.pagesOffset)) {
          _$jscoverage['/touch.js'].lineData[258]++;
          scrollEnd();
          _$jscoverage['/touch.js'].lineData[259]++;
          return;
        }
        _$jscoverage['/touch.js'].lineData[262]++;
        var snapDuration = self._snapDurationCfg;
        _$jscoverage['/touch.js'].lineData[263]++;
        var snapEasing = self._snapEasingCfg;
        _$jscoverage['/touch.js'].lineData[264]++;
        var pageIndex = self.get('pageIndex');
        _$jscoverage['/touch.js'].lineData[265]++;
        var scrollLeft = self.get('scrollLeft');
        _$jscoverage['/touch.js'].lineData[266]++;
        var scrollTop = self.get('scrollTop');
        _$jscoverage['/touch.js'].lineData[268]++;
        var animCfg = {
  duration: snapDuration, 
  easing: snapEasing, 
  complete: scrollEnd};
        _$jscoverage['/touch.js'].lineData[274]++;
        var pagesOffset = self.pagesOffset;
        _$jscoverage['/touch.js'].lineData[275]++;
        var pagesOffsetLen = pagesOffset.length;
        _$jscoverage['/touch.js'].lineData[277]++;
        self.isScrolling = 0;
        _$jscoverage['/touch.js'].lineData[279]++;
        if (visit42_279_1(allowX || allowY)) {
          _$jscoverage['/touch.js'].lineData[280]++;
          if (visit43_280_1(allowX && allowY)) {
            _$jscoverage['/touch.js'].lineData[281]++;
            var prepareX = [], i, newPageIndex;
            _$jscoverage['/touch.js'].lineData[284]++;
            var nowXY = {
  left: scrollLeft, 
  top: scrollTop};
            _$jscoverage['/touch.js'].lineData[288]++;
            for (i = 0; visit44_288_1(i < pagesOffsetLen); i++) {
              _$jscoverage['/touch.js'].lineData[289]++;
              var offset = pagesOffset[i];
              _$jscoverage['/touch.js'].lineData[290]++;
              if (visit45_290_1(offset)) {
                _$jscoverage['/touch.js'].lineData[291]++;
                if (visit46_291_1(visit47_291_2(offsetX > 0) && visit48_291_3(offset.left > nowXY.left))) {
                  _$jscoverage['/touch.js'].lineData[292]++;
                  prepareX.push(offset);
                } else {
                  _$jscoverage['/touch.js'].lineData[293]++;
                  if (visit49_293_1(visit50_293_2(offsetX < 0) && visit51_293_3(offset.left < nowXY.left))) {
                    _$jscoverage['/touch.js'].lineData[294]++;
                    prepareX.push(offset);
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[298]++;
            var min;
            _$jscoverage['/touch.js'].lineData[299]++;
            var prepareXLen = prepareX.length;
            _$jscoverage['/touch.js'].lineData[300]++;
            var x;
            _$jscoverage['/touch.js'].lineData[301]++;
            if (visit52_301_1(offsetY > 0)) {
              _$jscoverage['/touch.js'].lineData[302]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[303]++;
              for (i = 0; visit53_303_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[304]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[305]++;
                if (visit54_305_1(x.top > nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[306]++;
                  if (visit55_306_1(min < x.top - nowXY.top)) {
                    _$jscoverage['/touch.js'].lineData[307]++;
                    min = x.top - nowXY.top;
                    _$jscoverage['/touch.js'].lineData[308]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            } else {
              _$jscoverage['/touch.js'].lineData[313]++;
              min = Number.MAX_VALUE;
              _$jscoverage['/touch.js'].lineData[314]++;
              for (i = 0; visit56_314_1(i < prepareXLen); i++) {
                _$jscoverage['/touch.js'].lineData[315]++;
                x = prepareX[i];
                _$jscoverage['/touch.js'].lineData[316]++;
                if (visit57_316_1(x.top < nowXY.top)) {
                  _$jscoverage['/touch.js'].lineData[317]++;
                  if (visit58_317_1(min < nowXY.top - x.top)) {
                    _$jscoverage['/touch.js'].lineData[318]++;
                    min = nowXY.top - x.top;
                    _$jscoverage['/touch.js'].lineData[319]++;
                    newPageIndex = prepareX.index;
                  }
                }
              }
            }
            _$jscoverage['/touch.js'].lineData[324]++;
            if (visit59_324_1(newPageIndex !== undefined)) {
              _$jscoverage['/touch.js'].lineData[325]++;
              if (visit60_325_1(newPageIndex !== pageIndex)) {
                _$jscoverage['/touch.js'].lineData[326]++;
                self.scrollToPage(newPageIndex, animCfg);
              } else {
                _$jscoverage['/touch.js'].lineData[328]++;
                self.scrollToPage(newPageIndex);
                _$jscoverage['/touch.js'].lineData[329]++;
                scrollEnd();
              }
            } else {
              _$jscoverage['/touch.js'].lineData[332]++;
              scrollEnd();
            }
          } else {
            _$jscoverage['/touch.js'].lineData[335]++;
            if (visit61_335_1(allowX || allowY)) {
              _$jscoverage['/touch.js'].lineData[336]++;
              var toPageIndex = self.getPageIndexFromXY(allowX ? scrollLeft : scrollTop, allowX, allowX ? offsetX : offsetY);
              _$jscoverage['/touch.js'].lineData[339]++;
              self.scrollToPage(toPageIndex, animCfg);
            } else {
              _$jscoverage['/touch.js'].lineData[341]++;
              self.scrollToPage(pageIndex);
              _$jscoverage['/touch.js'].lineData[342]++;
              scrollEnd();
            }
          }
        }
      }
    }
    _$jscoverage['/touch.js'].lineData[349]++;
    onDragEndAxis(self, e, 'left', endCallback);
    _$jscoverage['/touch.js'].lineData[350]++;
    onDragEndAxis(self, e, 'top', endCallback);
  }
  _$jscoverage['/touch.js'].lineData[353]++;
  function onGestureStart(e) {
    _$jscoverage['/touch.js'].functionData[13]++;
    _$jscoverage['/touch.js'].lineData[354]++;
    var self = this;
    _$jscoverage['/touch.js'].lineData[356]++;
    if (visit62_356_1(self.isScrolling && visit63_356_2(e.gestureType === 'touch'))) {
      _$jscoverage['/touch.js'].lineData[357]++;
      e.preventDefault();
    }
    _$jscoverage['/touch.js'].lineData[360]++;
    if (visit64_360_1(self.isScrolling && self.pagesOffset)) {
      _$jscoverage['/touch.js'].lineData[361]++;
      return;
    }
    _$jscoverage['/touch.js'].lineData[363]++;
    if (visit65_363_1(self.isScrolling)) {
      _$jscoverage['/touch.js'].lineData[364]++;
      self.stopAnimation();
      _$jscoverage['/touch.js'].lineData[365]++;
      self.fire('scrollTouchEnd', {
  pageX: e.pageX, 
  pageY: e.pageY});
    }
  }
  _$jscoverage['/touch.js'].lineData[372]++;
  function bindUI(self) {
    _$jscoverage['/touch.js'].functionData[14]++;
    _$jscoverage['/touch.js'].lineData[373]++;
    var action = self.get('disabled') ? 'detach' : 'on';
    _$jscoverage['/touch.js'].lineData[379]++;
    self.$contentEl[action](DragGesture.DRAG_START, onDragStartHandler, self)[action](BasicGesture.START, onGestureStart, self)[action](DragGesture.DRAG_PRE, onDragPreHandler, self)[action](DragGesture.DRAG, onDragHandler, self)[action](DragGesture.DRAG_END, onDragEndHandler, self);
  }
  _$jscoverage['/touch.js'].lineData[388]++;
  return ScrollViewBase.extend({
  initializer: function() {
  _$jscoverage['/touch.js'].functionData[15]++;
  _$jscoverage['/touch.js'].lineData[390]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[391]++;
  self._preventDefaultY = self.get('preventDefaultY');
  _$jscoverage['/touch.js'].lineData[392]++;
  self._preventDefaultX = self.get('preventDefaultX');
  _$jscoverage['/touch.js'].lineData[393]++;
  self._lockX = self.get('lockX');
  _$jscoverage['/touch.js'].lineData[394]++;
  self._lockY = self.get('lockY');
  _$jscoverage['/touch.js'].lineData[395]++;
  self._bounce = self.get('bounce');
  _$jscoverage['/touch.js'].lineData[396]++;
  self._snapThresholdCfg = self.get('snapThreshold');
  _$jscoverage['/touch.js'].lineData[397]++;
  self._snapDurationCfg = self.get('snapDuration');
  _$jscoverage['/touch.js'].lineData[398]++;
  self._snapEasingCfg = self.get('snapEasing');
  _$jscoverage['/touch.js'].lineData[399]++;
  self.publish('touchEnd', {
  defaultFn: defaultTouchEndHandler, 
  defaultTargetOnly: true});
}, 
  bindUI: function() {
  _$jscoverage['/touch.js'].functionData[16]++;
  _$jscoverage['/touch.js'].lineData[407]++;
  bindUI(this);
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/touch.js'].functionData[17]++;
  _$jscoverage['/touch.js'].lineData[411]++;
  var self = this;
  _$jscoverage['/touch.js'].lineData[412]++;
  self.callSuper(v);
  _$jscoverage['/touch.js'].lineData[413]++;
  bindUI(self);
}, 
  destructor: function() {
  _$jscoverage['/touch.js'].functionData[18]++;
  _$jscoverage['/touch.js'].lineData[417]++;
  this.stopAnimation();
}, 
  stopAnimation: function() {
  _$jscoverage['/touch.js'].functionData[19]++;
  _$jscoverage['/touch.js'].lineData[421]++;
  this.callSuper();
  _$jscoverage['/touch.js'].lineData[422]++;
  this.isScrolling = 0;
}}, {
  ATTRS: {
  lockX: {
  value: true}, 
  preventDefaultX: {
  value: true}, 
  lockY: {
  value: false}, 
  preventDefaultY: {
  value: false}, 
  snapDuration: {
  value: 0.3}, 
  snapEasing: {
  value: 'easeOut'}, 
  snapThreshold: {
  value: 5}, 
  bounce: {
  value: true}, 
  bounceDuration: {
  value: 0.4}, 
  bounceEasing: {
  value: 'easeOut'}}});
});
