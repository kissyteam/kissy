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
if (! _$jscoverage['/base/create.js']) {
  _$jscoverage['/base/create.js'] = {};
  _$jscoverage['/base/create.js'].lineData = [];
  _$jscoverage['/base/create.js'].lineData[6] = 0;
  _$jscoverage['/base/create.js'].lineData[7] = 0;
  _$jscoverage['/base/create.js'].lineData[8] = 0;
  _$jscoverage['/base/create.js'].lineData[9] = 0;
  _$jscoverage['/base/create.js'].lineData[28] = 0;
  _$jscoverage['/base/create.js'].lineData[29] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[33] = 0;
  _$jscoverage['/base/create.js'].lineData[36] = 0;
  _$jscoverage['/base/create.js'].lineData[37] = 0;
  _$jscoverage['/base/create.js'].lineData[39] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[45] = 0;
  _$jscoverage['/base/create.js'].lineData[46] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[50] = 0;
  _$jscoverage['/base/create.js'].lineData[52] = 0;
  _$jscoverage['/base/create.js'].lineData[53] = 0;
  _$jscoverage['/base/create.js'].lineData[59] = 0;
  _$jscoverage['/base/create.js'].lineData[60] = 0;
  _$jscoverage['/base/create.js'].lineData[64] = 0;
  _$jscoverage['/base/create.js'].lineData[65] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[72] = 0;
  _$jscoverage['/base/create.js'].lineData[73] = 0;
  _$jscoverage['/base/create.js'].lineData[75] = 0;
  _$jscoverage['/base/create.js'].lineData[77] = 0;
  _$jscoverage['/base/create.js'].lineData[82] = 0;
  _$jscoverage['/base/create.js'].lineData[100] = 0;
  _$jscoverage['/base/create.js'].lineData[102] = 0;
  _$jscoverage['/base/create.js'].lineData[103] = 0;
  _$jscoverage['/base/create.js'].lineData[106] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[111] = 0;
  _$jscoverage['/base/create.js'].lineData[112] = 0;
  _$jscoverage['/base/create.js'].lineData[115] = 0;
  _$jscoverage['/base/create.js'].lineData[116] = 0;
  _$jscoverage['/base/create.js'].lineData[119] = 0;
  _$jscoverage['/base/create.js'].lineData[120] = 0;
  _$jscoverage['/base/create.js'].lineData[123] = 0;
  _$jscoverage['/base/create.js'].lineData[132] = 0;
  _$jscoverage['/base/create.js'].lineData[133] = 0;
  _$jscoverage['/base/create.js'].lineData[136] = 0;
  _$jscoverage['/base/create.js'].lineData[137] = 0;
  _$jscoverage['/base/create.js'].lineData[142] = 0;
  _$jscoverage['/base/create.js'].lineData[144] = 0;
  _$jscoverage['/base/create.js'].lineData[145] = 0;
  _$jscoverage['/base/create.js'].lineData[148] = 0;
  _$jscoverage['/base/create.js'].lineData[150] = 0;
  _$jscoverage['/base/create.js'].lineData[152] = 0;
  _$jscoverage['/base/create.js'].lineData[155] = 0;
  _$jscoverage['/base/create.js'].lineData[157] = 0;
  _$jscoverage['/base/create.js'].lineData[160] = 0;
  _$jscoverage['/base/create.js'].lineData[162] = 0;
  _$jscoverage['/base/create.js'].lineData[164] = 0;
  _$jscoverage['/base/create.js'].lineData[165] = 0;
  _$jscoverage['/base/create.js'].lineData[167] = 0;
  _$jscoverage['/base/create.js'].lineData[169] = 0;
  _$jscoverage['/base/create.js'].lineData[173] = 0;
  _$jscoverage['/base/create.js'].lineData[178] = 0;
  _$jscoverage['/base/create.js'].lineData[179] = 0;
  _$jscoverage['/base/create.js'].lineData[180] = 0;
  _$jscoverage['/base/create.js'].lineData[200] = 0;
  _$jscoverage['/base/create.js'].lineData[205] = 0;
  _$jscoverage['/base/create.js'].lineData[206] = 0;
  _$jscoverage['/base/create.js'].lineData[209] = 0;
  _$jscoverage['/base/create.js'].lineData[211] = 0;
  _$jscoverage['/base/create.js'].lineData[212] = 0;
  _$jscoverage['/base/create.js'].lineData[213] = 0;
  _$jscoverage['/base/create.js'].lineData[214] = 0;
  _$jscoverage['/base/create.js'].lineData[215] = 0;
  _$jscoverage['/base/create.js'].lineData[216] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[223] = 0;
  _$jscoverage['/base/create.js'].lineData[227] = 0;
  _$jscoverage['/base/create.js'].lineData[230] = 0;
  _$jscoverage['/base/create.js'].lineData[231] = 0;
  _$jscoverage['/base/create.js'].lineData[232] = 0;
  _$jscoverage['/base/create.js'].lineData[233] = 0;
  _$jscoverage['/base/create.js'].lineData[234] = 0;
  _$jscoverage['/base/create.js'].lineData[235] = 0;
  _$jscoverage['/base/create.js'].lineData[238] = 0;
  _$jscoverage['/base/create.js'].lineData[246] = 0;
  _$jscoverage['/base/create.js'].lineData[247] = 0;
  _$jscoverage['/base/create.js'].lineData[248] = 0;
  _$jscoverage['/base/create.js'].lineData[249] = 0;
  _$jscoverage['/base/create.js'].lineData[252] = 0;
  _$jscoverage['/base/create.js'].lineData[264] = 0;
  _$jscoverage['/base/create.js'].lineData[270] = 0;
  _$jscoverage['/base/create.js'].lineData[271] = 0;
  _$jscoverage['/base/create.js'].lineData[274] = 0;
  _$jscoverage['/base/create.js'].lineData[275] = 0;
  _$jscoverage['/base/create.js'].lineData[276] = 0;
  _$jscoverage['/base/create.js'].lineData[278] = 0;
  _$jscoverage['/base/create.js'].lineData[279] = 0;
  _$jscoverage['/base/create.js'].lineData[280] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[286] = 0;
  _$jscoverage['/base/create.js'].lineData[287] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[289] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[294] = 0;
  _$jscoverage['/base/create.js'].lineData[295] = 0;
  _$jscoverage['/base/create.js'].lineData[298] = 0;
  _$jscoverage['/base/create.js'].lineData[307] = 0;
  _$jscoverage['/base/create.js'].lineData[312] = 0;
  _$jscoverage['/base/create.js'].lineData[313] = 0;
  _$jscoverage['/base/create.js'].lineData[314] = 0;
  _$jscoverage['/base/create.js'].lineData[315] = 0;
  _$jscoverage['/base/create.js'].lineData[316] = 0;
  _$jscoverage['/base/create.js'].lineData[317] = 0;
  _$jscoverage['/base/create.js'].lineData[318] = 0;
  _$jscoverage['/base/create.js'].lineData[319] = 0;
  _$jscoverage['/base/create.js'].lineData[320] = 0;
  _$jscoverage['/base/create.js'].lineData[328] = 0;
  _$jscoverage['/base/create.js'].lineData[352] = 0;
  _$jscoverage['/base/create.js'].lineData[353] = 0;
  _$jscoverage['/base/create.js'].lineData[354] = 0;
  _$jscoverage['/base/create.js'].lineData[355] = 0;
  _$jscoverage['/base/create.js'].lineData[358] = 0;
  _$jscoverage['/base/create.js'].lineData[363] = 0;
  _$jscoverage['/base/create.js'].lineData[364] = 0;
  _$jscoverage['/base/create.js'].lineData[367] = 0;
  _$jscoverage['/base/create.js'].lineData[373] = 0;
  _$jscoverage['/base/create.js'].lineData[377] = 0;
  _$jscoverage['/base/create.js'].lineData[384] = 0;
  _$jscoverage['/base/create.js'].lineData[385] = 0;
  _$jscoverage['/base/create.js'].lineData[388] = 0;
  _$jscoverage['/base/create.js'].lineData[389] = 0;
  _$jscoverage['/base/create.js'].lineData[393] = 0;
  _$jscoverage['/base/create.js'].lineData[394] = 0;
  _$jscoverage['/base/create.js'].lineData[395] = 0;
  _$jscoverage['/base/create.js'].lineData[396] = 0;
  _$jscoverage['/base/create.js'].lineData[399] = 0;
  _$jscoverage['/base/create.js'].lineData[407] = 0;
  _$jscoverage['/base/create.js'].lineData[409] = 0;
  _$jscoverage['/base/create.js'].lineData[410] = 0;
  _$jscoverage['/base/create.js'].lineData[411] = 0;
  _$jscoverage['/base/create.js'].lineData[419] = 0;
  _$jscoverage['/base/create.js'].lineData[421] = 0;
  _$jscoverage['/base/create.js'].lineData[422] = 0;
  _$jscoverage['/base/create.js'].lineData[423] = 0;
  _$jscoverage['/base/create.js'].lineData[424] = 0;
  _$jscoverage['/base/create.js'].lineData[427] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[429] = 0;
  _$jscoverage['/base/create.js'].lineData[431] = 0;
  _$jscoverage['/base/create.js'].lineData[433] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[437] = 0;
  _$jscoverage['/base/create.js'].lineData[438] = 0;
  _$jscoverage['/base/create.js'].lineData[439] = 0;
  _$jscoverage['/base/create.js'].lineData[441] = 0;
  _$jscoverage['/base/create.js'].lineData[447] = 0;
  _$jscoverage['/base/create.js'].lineData[448] = 0;
  _$jscoverage['/base/create.js'].lineData[451] = 0;
  _$jscoverage['/base/create.js'].lineData[452] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[456] = 0;
  _$jscoverage['/base/create.js'].lineData[459] = 0;
  _$jscoverage['/base/create.js'].lineData[460] = 0;
  _$jscoverage['/base/create.js'].lineData[464] = 0;
  _$jscoverage['/base/create.js'].lineData[466] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[472] = 0;
  _$jscoverage['/base/create.js'].lineData[473] = 0;
  _$jscoverage['/base/create.js'].lineData[474] = 0;
  _$jscoverage['/base/create.js'].lineData[477] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[481] = 0;
  _$jscoverage['/base/create.js'].lineData[485] = 0;
  _$jscoverage['/base/create.js'].lineData[486] = 0;
  _$jscoverage['/base/create.js'].lineData[490] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[492] = 0;
  _$jscoverage['/base/create.js'].lineData[493] = 0;
  _$jscoverage['/base/create.js'].lineData[494] = 0;
  _$jscoverage['/base/create.js'].lineData[495] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[500] = 0;
  _$jscoverage['/base/create.js'].lineData[504] = 0;
  _$jscoverage['/base/create.js'].lineData[520] = 0;
  _$jscoverage['/base/create.js'].lineData[522] = 0;
  _$jscoverage['/base/create.js'].lineData[523] = 0;
  _$jscoverage['/base/create.js'].lineData[524] = 0;
  _$jscoverage['/base/create.js'].lineData[532] = 0;
  _$jscoverage['/base/create.js'].lineData[533] = 0;
  _$jscoverage['/base/create.js'].lineData[535] = 0;
  _$jscoverage['/base/create.js'].lineData[536] = 0;
}
if (! _$jscoverage['/base/create.js'].functionData) {
  _$jscoverage['/base/create.js'].functionData = [];
  _$jscoverage['/base/create.js'].functionData[0] = 0;
  _$jscoverage['/base/create.js'].functionData[1] = 0;
  _$jscoverage['/base/create.js'].functionData[2] = 0;
  _$jscoverage['/base/create.js'].functionData[3] = 0;
  _$jscoverage['/base/create.js'].functionData[4] = 0;
  _$jscoverage['/base/create.js'].functionData[5] = 0;
  _$jscoverage['/base/create.js'].functionData[6] = 0;
  _$jscoverage['/base/create.js'].functionData[7] = 0;
  _$jscoverage['/base/create.js'].functionData[8] = 0;
  _$jscoverage['/base/create.js'].functionData[9] = 0;
  _$jscoverage['/base/create.js'].functionData[10] = 0;
  _$jscoverage['/base/create.js'].functionData[11] = 0;
  _$jscoverage['/base/create.js'].functionData[12] = 0;
  _$jscoverage['/base/create.js'].functionData[13] = 0;
  _$jscoverage['/base/create.js'].functionData[14] = 0;
  _$jscoverage['/base/create.js'].functionData[15] = 0;
  _$jscoverage['/base/create.js'].functionData[16] = 0;
  _$jscoverage['/base/create.js'].functionData[17] = 0;
  _$jscoverage['/base/create.js'].functionData[18] = 0;
  _$jscoverage['/base/create.js'].functionData[19] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['16'] = [];
  _$jscoverage['/base/create.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'] = [];
  _$jscoverage['/base/create.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['21'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['24'] = [];
  _$jscoverage['/base/create.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'] = [];
  _$jscoverage['/base/create.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['36'] = [];
  _$jscoverage['/base/create.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['65'] = [];
  _$jscoverage['/base/create.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'] = [];
  _$jscoverage['/base/create.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['70'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['72'] = [];
  _$jscoverage['/base/create.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['102'] = [];
  _$jscoverage['/base/create.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['106'] = [];
  _$jscoverage['/base/create.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['111'] = [];
  _$jscoverage['/base/create.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['115'] = [];
  _$jscoverage['/base/create.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['119'] = [];
  _$jscoverage['/base/create.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['126'] = [];
  _$jscoverage['/base/create.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['132'] = [];
  _$jscoverage['/base/create.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['144'] = [];
  _$jscoverage['/base/create.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['148'] = [];
  _$jscoverage['/base/create.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['150'] = [];
  _$jscoverage['/base/create.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['155'] = [];
  _$jscoverage['/base/create.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['162'] = [];
  _$jscoverage['/base/create.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['165'] = [];
  _$jscoverage['/base/create.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['178'] = [];
  _$jscoverage['/base/create.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['205'] = [];
  _$jscoverage['/base/create.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['209'] = [];
  _$jscoverage['/base/create.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['211'] = [];
  _$jscoverage['/base/create.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['213'] = [];
  _$jscoverage['/base/create.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['227'] = [];
  _$jscoverage['/base/create.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['228'] = [];
  _$jscoverage['/base/create.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['228'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['231'] = [];
  _$jscoverage['/base/create.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['233'] = [];
  _$jscoverage['/base/create.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['246'] = [];
  _$jscoverage['/base/create.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['270'] = [];
  _$jscoverage['/base/create.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['274'] = [];
  _$jscoverage['/base/create.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['275'] = [];
  _$jscoverage['/base/create.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['275'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['284'] = [];
  _$jscoverage['/base/create.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['285'] = [];
  _$jscoverage['/base/create.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['287'] = [];
  _$jscoverage['/base/create.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['312'] = [];
  _$jscoverage['/base/create.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['313'] = [];
  _$jscoverage['/base/create.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['315'] = [];
  _$jscoverage['/base/create.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['315'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['319'] = [];
  _$jscoverage['/base/create.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['352'] = [];
  _$jscoverage['/base/create.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['363'] = [];
  _$jscoverage['/base/create.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['377'] = [];
  _$jscoverage['/base/create.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['377'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['378'] = [];
  _$jscoverage['/base/create.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'] = [];
  _$jscoverage['/base/create.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['384'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['388'] = [];
  _$jscoverage['/base/create.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['393'] = [];
  _$jscoverage['/base/create.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['395'] = [];
  _$jscoverage['/base/create.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['409'] = [];
  _$jscoverage['/base/create.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['423'] = [];
  _$jscoverage['/base/create.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['428'] = [];
  _$jscoverage['/base/create.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['433'] = [];
  _$jscoverage['/base/create.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['438'] = [];
  _$jscoverage['/base/create.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['451'] = [];
  _$jscoverage['/base/create.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['452'] = [];
  _$jscoverage['/base/create.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['452'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['464'] = [];
  _$jscoverage['/base/create.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['472'] = [];
  _$jscoverage['/base/create.js'].branchData['472'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['473'] = [];
  _$jscoverage['/base/create.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['477'] = [];
  _$jscoverage['/base/create.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['490'] = [];
  _$jscoverage['/base/create.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['490'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['490'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['494'] = [];
  _$jscoverage['/base/create.js'].branchData['494'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['494'][1].init(185, 7, 'i < len');
function visit184_494_1(result) {
  _$jscoverage['/base/create.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['490'][3].init(101, 24, 'nodes.push || nodes.item');
function visit183_490_3(result) {
  _$jscoverage['/base/create.js'].branchData['490'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['490'][2].init(101, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit182_490_2(result) {
  _$jscoverage['/base/create.js'].branchData['490'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['490'][1].init(91, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit181_490_1(result) {
  _$jscoverage['/base/create.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['477'][1].init(174, 49, 'elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit180_477_1(result) {
  _$jscoverage['/base/create.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['473'][1].init(17, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit179_473_1(result) {
  _$jscoverage['/base/create.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['472'][1].init(13, 22, 'S.isPlainObject(props)');
function visit178_472_1(result) {
  _$jscoverage['/base/create.js'].branchData['472'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['464'][1].init(422, 26, 'DOMEvent && DOMEvent.clone');
function visit177_464_1(result) {
  _$jscoverage['/base/create.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['452'][2].init(151, 39, 'dest.nodeType === NodeType.ELEMENT_NODE');
function visit176_452_2(result) {
  _$jscoverage['/base/create.js'].branchData['452'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['452'][1].init(151, 60, 'dest.nodeType === NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit175_452_1(result) {
  _$jscoverage['/base/create.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['451'][1].init(109, 28, 'DOMEvent && DOMEvent.exports');
function visit174_451_1(result) {
  _$jscoverage['/base/create.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['438'][1].init(21, 21, 'cloneChildren[cIndex]');
function visit173_438_1(result) {
  _$jscoverage['/base/create.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['433'][1].init(435, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit172_433_1(result) {
  _$jscoverage['/base/create.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['428'][1].init(21, 15, 'cloneCs[fIndex]');
function visit171_428_1(result) {
  _$jscoverage['/base/create.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['423'][1].init(55, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit170_423_1(result) {
  _$jscoverage['/base/create.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['409'][1].init(116, 6, 'i >= 0');
function visit169_409_1(result) {
  _$jscoverage['/base/create.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['395'][1].init(81, 28, 'deep && deepWithDataAndEvent');
function visit168_395_1(result) {
  _$jscoverage['/base/create.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['393'][1].init(1730, 16, 'withDataAndEvent');
function visit167_393_1(result) {
  _$jscoverage['/base/create.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['388'][1].init(575, 27, 'deep && _fixCloneAttributes');
function visit166_388_1(result) {
  _$jscoverage['/base/create.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][2].init(428, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit165_384_2(result) {
  _$jscoverage['/base/create.js'].branchData['384'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['384'][1].init(405, 61, '_fixCloneAttributes && elemNodeType === NodeType.ELEMENT_NODE');
function visit164_384_1(result) {
  _$jscoverage['/base/create.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['378'][1].init(61, 48, 'elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit163_378_1(result) {
  _$jscoverage['/base/create.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['377'][2].init(847, 38, 'elemNodeType === NodeType.ELEMENT_NODE');
function visit162_377_2(result) {
  _$jscoverage['/base/create.js'].branchData['377'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['377'][1].init(847, 110, 'elemNodeType === NodeType.ELEMENT_NODE || elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit161_377_1(result) {
  _$jscoverage['/base/create.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['363'][1].init(433, 5, '!elem');
function visit160_363_1(result) {
  _$jscoverage['/base/create.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['352'][1].init(21, 24, 'typeof deep === \'object\'');
function visit159_352_1(result) {
  _$jscoverage['/base/create.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['319'][1].init(186, 27, 'DOMEvent && DOMEvent.detach');
function visit158_319_1(result) {
  _$jscoverage['/base/create.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['315'][2].init(71, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit157_315_2(result) {
  _$jscoverage['/base/create.js'].branchData['315'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['315'][1].init(58, 50, '!keepData && el.nodeType === NodeType.ELEMENT_NODE');
function visit156_315_1(result) {
  _$jscoverage['/base/create.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['313'][1].init(279, 6, 'i >= 0');
function visit155_313_1(result) {
  _$jscoverage['/base/create.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['312'][1].init(208, 28, 'DOMEvent && DOMEvent.exports');
function visit154_312_1(result) {
  _$jscoverage['/base/create.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['287'][1].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit153_287_1(result) {
  _$jscoverage['/base/create.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['285'][1].init(46, 6, 'i >= 0');
function visit152_285_1(result) {
  _$jscoverage['/base/create.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['284'][1].init(63, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit151_284_1(result) {
  _$jscoverage['/base/create.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['275'][2].init(45, 42, 'el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit150_275_2(result) {
  _$jscoverage['/base/create.js'].branchData['275'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['275'][1].init(25, 62, 'supportOuterHTML && el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE');
function visit149_275_1(result) {
  _$jscoverage['/base/create.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['274'][1].init(326, 24, 'htmlString === undefined');
function visit148_274_1(result) {
  _$jscoverage['/base/create.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['270'][1].init(222, 3, '!el');
function visit147_270_1(result) {
  _$jscoverage['/base/create.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['246'][1].init(1090, 8, '!success');
function visit146_246_1(result) {
  _$jscoverage['/base/create.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['233'][1].init(84, 39, 'elem.nodeType === NodeType.ELEMENT_NODE');
function visit145_233_1(result) {
  _$jscoverage['/base/create.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['231'][1].init(54, 6, 'i >= 0');
function visit144_231_1(result) {
  _$jscoverage['/base/create.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['228'][3].init(341, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit143_228_3(result) {
  _$jscoverage['/base/create.js'].branchData['228'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['228'][2].init(252, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit142_228_2(result) {
  _$jscoverage['/base/create.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['228'][1].init(72, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit141_228_1(result) {
  _$jscoverage['/base/create.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['227'][1].init(177, 218, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit140_227_1(result) {
  _$jscoverage['/base/create.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['213'][1].init(212, 47, 'el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE');
function visit139_213_1(result) {
  _$jscoverage['/base/create.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['211'][1].init(94, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit138_211_1(result) {
  _$jscoverage['/base/create.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['209'][1].init(355, 24, 'htmlString === undefined');
function visit137_209_1(result) {
  _$jscoverage['/base/create.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['205'][1].init(251, 3, '!el');
function visit136_205_1(result) {
  _$jscoverage['/base/create.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['178'][1].init(95, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit135_178_1(result) {
  _$jscoverage['/base/create.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['165'][1].init(1224, 12, 'nodes.length');
function visit134_165_1(result) {
  _$jscoverage['/base/create.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['162'][1].init(1008, 18, 'nodes.length === 1');
function visit133_162_1(result) {
  _$jscoverage['/base/create.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['155'][2].init(729, 92, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit132_155_2(result) {
  _$jscoverage['/base/create.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['155'][1].init(700, 121, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit131_155_1(result) {
  _$jscoverage['/base/create.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['150'][1].init(409, 105, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit130_150_1(result) {
  _$jscoverage['/base/create.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['148'][1].init(301, 31, 'creators[tag] || defaultCreator');
function visit129_148_1(result) {
  _$jscoverage['/base/create.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['144'][1].init(161, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit128_144_1(result) {
  _$jscoverage['/base/create.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['132'][1].init(782, 18, '!R_HTML.test(html)');
function visit127_132_1(result) {
  _$jscoverage['/base/create.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['126'][1].init(124, 15, 'ownerDoc || doc');
function visit126_126_1(result) {
  _$jscoverage['/base/create.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['119'][1].init(430, 5, '_trim');
function visit125_119_1(result) {
  _$jscoverage['/base/create.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['115'][1].init(334, 19, '_trim === undefined');
function visit124_115_1(result) {
  _$jscoverage['/base/create.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['111'][1].init(235, 24, 'typeof html !== \'string\'');
function visit123_111_1(result) {
  _$jscoverage['/base/create.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['106'][1].init(134, 13, 'html.nodeType');
function visit122_106_1(result) {
  _$jscoverage['/base/create.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['102'][1].init(54, 5, '!html');
function visit121_102_1(result) {
  _$jscoverage['/base/create.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['72'][1].init(135, 15, 'node.firstChild');
function visit120_72_1(result) {
  _$jscoverage['/base/create.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][2].init(516, 46, 'parent.canHaveChildren && \'removeNode\' in node');
function visit119_70_2(result) {
  _$jscoverage['/base/create.js'].branchData['70'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['70'][1].init(507, 55, 'oldIE && parent.canHaveChildren && \'removeNode\' in node');
function visit118_70_1(result) {
  _$jscoverage['/base/create.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['65'][1].init(13, 6, 'parent');
function visit117_65_1(result) {
  _$jscoverage['/base/create.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['36'][1].init(132, 22, 'holder === DEFAULT_DIV');
function visit116_36_1(result) {
  _$jscoverage['/base/create.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][2].init(34, 16, 'ownerDoc !== doc');
function visit115_33_2(result) {
  _$jscoverage['/base/create.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['33'][1].init(22, 28, 'ownerDoc && ownerDoc !== doc');
function visit114_33_1(result) {
  _$jscoverage['/base/create.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['24'][1].init(553, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit113_24_1(result) {
  _$jscoverage['/base/create.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][2].init(444, 6, 'ie < 9');
function visit112_21_2(result) {
  _$jscoverage['/base/create.js'].branchData['21'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['21'][1].init(438, 12, 'ie && ie < 9');
function visit111_21_1(result) {
  _$jscoverage['/base/create.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['16'][1].init(186, 29, 'doc && doc.createElement(DIV)');
function visit110_16_1(result) {
  _$jscoverage['/base/create.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/create.js'].lineData[8]++;
  var logger = S.getLogger('s/dom');
  _$jscoverage['/base/create.js'].lineData[9]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, ie = UA.ieMode, DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit110_16_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit111_21_1(ie && visit112_21_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit113_24_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[28]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[29]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[32]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[33]++;
    var holder = visit114_33_1(ownerDoc && visit115_33_2(ownerDoc !== doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[36]++;
    if (visit116_36_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[37]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[39]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[42]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[43]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[45]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[46]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[49]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[50]++;
    try {
      _$jscoverage['/base/create.js'].lineData[52]++;
      node.innerHTML = '';
      _$jscoverage['/base/create.js'].lineData[53]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[59]++;
    for (var c; (c = node.lastChild); ) {
      _$jscoverage['/base/create.js'].lineData[60]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[64]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[65]++;
    if (visit117_65_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[70]++;
      if (visit118_70_1(oldIE && visit119_70_2(parent.canHaveChildren && 'removeNode' in node))) {
        _$jscoverage['/base/create.js'].lineData[72]++;
        if (visit120_72_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[73]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[75]++;
        node.removeNode(false);
      } else {
        _$jscoverage['/base/create.js'].lineData[77]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[82]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[6]++;
  _$jscoverage['/base/create.js'].lineData[100]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[102]++;
  if (visit121_102_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[103]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[106]++;
  if (visit122_106_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[107]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[111]++;
  if (visit123_111_1(typeof html !== 'string')) {
    _$jscoverage['/base/create.js'].lineData[112]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[115]++;
  if (visit124_115_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[116]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[119]++;
  if (visit125_119_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[120]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[123]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit126_126_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[132]++;
  if (visit127_132_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[133]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[136]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[137]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[142]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[144]++;
      if (visit128_144_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[145]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[148]++;
      holder = (visit129_148_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[150]++;
      if (visit130_150_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[152]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[155]++;
      if (visit131_155_1(lostLeadingTailWhitespace && visit132_155_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[157]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[160]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[162]++;
      if (visit133_162_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[164]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[165]++;
        if (visit134_165_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[167]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[169]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[173]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[178]++;
  if (visit135_178_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[179]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[180]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[200]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[205]++;
  if (visit136_205_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[206]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[209]++;
  if (visit137_209_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[211]++;
    if (visit138_211_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[212]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[213]++;
      if (visit139_213_1(el.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[214]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[215]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[216]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[218]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[223]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[227]++;
    if (visit140_227_1(!htmlString.match(/<(?:script|style|link)/i) && visit141_228_1((visit142_228_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit143_228_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[230]++;
      try {
        _$jscoverage['/base/create.js'].lineData[231]++;
        for (i = els.length - 1; visit144_231_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[232]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[233]++;
          if (visit145_233_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[234]++;
            Dom.cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[235]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[238]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[246]++;
    if (visit146_246_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[247]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[248]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[249]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[252]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[264]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[270]++;
  if (visit147_270_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[271]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[274]++;
  if (visit148_274_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[275]++;
    if (visit149_275_1(supportOuterHTML && visit150_275_2(el.nodeType !== Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[276]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[278]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[279]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[280]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[283]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[284]++;
    if (visit151_284_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[285]++;
      for (i = length - 1; visit152_285_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[286]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[287]++;
        if (visit153_287_1(el.nodeType === NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[288]++;
          Dom.cleanData(el, 1);
          _$jscoverage['/base/create.js'].lineData[289]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[293]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[294]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[295]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[298]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[307]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.Env.mods['event/dom/base'], i;
  _$jscoverage['/base/create.js'].lineData[312]++;
  DOMEvent = visit154_312_1(DOMEvent && DOMEvent.exports);
  _$jscoverage['/base/create.js'].lineData[313]++;
  for (i = els.length - 1; visit155_313_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[314]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[315]++;
    if (visit156_315_1(!keepData && visit157_315_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[316]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[317]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[318]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[319]++;
      if (visit158_319_1(DOMEvent && DOMEvent.detach)) {
        _$jscoverage['/base/create.js'].lineData[320]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[328]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[352]++;
  if (visit159_352_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[353]++;
    deepWithDataAndEvent = deep.deepWithDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[354]++;
    withDataAndEvent = deep.withDataAndEvent;
    _$jscoverage['/base/create.js'].lineData[355]++;
    deep = deep.deep;
  }
  _$jscoverage['/base/create.js'].lineData[358]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[363]++;
  if (visit160_363_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[364]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[367]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[373]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[377]++;
  if (visit161_377_1(visit162_377_2(elemNodeType === NodeType.ELEMENT_NODE) || visit163_378_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[384]++;
    if (visit164_384_1(_fixCloneAttributes && visit165_384_2(elemNodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[385]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[388]++;
    if (visit166_388_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[389]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[393]++;
  if (visit167_393_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[394]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[395]++;
    if (visit168_395_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[396]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[399]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[407]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[409]++;
  for (i = els.length - 1; visit169_409_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[410]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[411]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[419]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[421]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[13]++;
    _$jscoverage['/base/create.js'].lineData[422]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[423]++;
    if (visit170_423_1(elemNodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[424]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[427]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[428]++;
        if (visit171_428_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[429]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[431]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[433]++;
      if (visit172_433_1(elemNodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[434]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[437]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[438]++;
          if (visit173_438_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[439]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[441]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[447]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[448]++;
    var DOMEvent = S.Env.mods['event/dom/base'], srcData, d;
    _$jscoverage['/base/create.js'].lineData[451]++;
    DOMEvent = visit174_451_1(DOMEvent && DOMEvent.exports);
    _$jscoverage['/base/create.js'].lineData[452]++;
    if (visit175_452_1(visit176_452_2(dest.nodeType === NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[453]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[456]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[459]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[460]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[464]++;
    if (visit177_464_1(DOMEvent && DOMEvent.clone)) {
      _$jscoverage['/base/create.js'].lineData[466]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[471]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[472]++;
    if (visit178_472_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[473]++;
      if (visit179_473_1(elem.nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[474]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[477]++;
        if (visit180_477_1(elem.nodeType === NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[478]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[481]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[485]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[486]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[490]++;
    if (visit181_490_1(nodes && visit182_490_2((visit183_490_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[491]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[492]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[493]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[494]++;
      for (i = 0 , len = nodes.length; visit184_494_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[495]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[498]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[500]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[504]++;
  var creators = Dom._creators, create = Dom.create, creatorsMap = {
  area: 'map', 
  thead: 'table', 
  td: 'tr', 
  th: 'tr', 
  tr: 'tbody', 
  tbody: 'table', 
  tfoot: 'table', 
  caption: 'table', 
  colgroup: 'table', 
  col: 'colgroup', 
  legend: 'fieldset'}, p;
  _$jscoverage['/base/create.js'].lineData[520]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[522]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[17]++;
  _$jscoverage['/base/create.js'].lineData[523]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[524]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[532]++;
  creators.option = creators.optgroup = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[533]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[535]++;
  creatorsMap.option = creatorsMap.optgroup = 1;
  _$jscoverage['/base/create.js'].lineData[536]++;
  return Dom;
});
