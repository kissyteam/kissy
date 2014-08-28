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
if (! _$jscoverage['/base/selector.js']) {
  _$jscoverage['/base/selector.js'] = {};
  _$jscoverage['/base/selector.js'].lineData = [];
  _$jscoverage['/base/selector.js'].lineData[6] = 0;
  _$jscoverage['/base/selector.js'].lineData[7] = 0;
  _$jscoverage['/base/selector.js'].lineData[8] = 0;
  _$jscoverage['/base/selector.js'].lineData[29] = 0;
  _$jscoverage['/base/selector.js'].lineData[30] = 0;
  _$jscoverage['/base/selector.js'].lineData[31] = 0;
  _$jscoverage['/base/selector.js'].lineData[34] = 0;
  _$jscoverage['/base/selector.js'].lineData[35] = 0;
  _$jscoverage['/base/selector.js'].lineData[36] = 0;
  _$jscoverage['/base/selector.js'].lineData[37] = 0;
  _$jscoverage['/base/selector.js'].lineData[38] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[44] = 0;
  _$jscoverage['/base/selector.js'].lineData[45] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[53] = 0;
  _$jscoverage['/base/selector.js'].lineData[54] = 0;
  _$jscoverage['/base/selector.js'].lineData[55] = 0;
  _$jscoverage['/base/selector.js'].lineData[60] = 0;
  _$jscoverage['/base/selector.js'].lineData[61] = 0;
  _$jscoverage['/base/selector.js'].lineData[62] = 0;
  _$jscoverage['/base/selector.js'].lineData[63] = 0;
  _$jscoverage['/base/selector.js'].lineData[65] = 0;
  _$jscoverage['/base/selector.js'].lineData[68] = 0;
  _$jscoverage['/base/selector.js'].lineData[69] = 0;
  _$jscoverage['/base/selector.js'].lineData[70] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[72] = 0;
  _$jscoverage['/base/selector.js'].lineData[73] = 0;
  _$jscoverage['/base/selector.js'].lineData[75] = 0;
  _$jscoverage['/base/selector.js'].lineData[79] = 0;
  _$jscoverage['/base/selector.js'].lineData[80] = 0;
  _$jscoverage['/base/selector.js'].lineData[81] = 0;
  _$jscoverage['/base/selector.js'].lineData[82] = 0;
  _$jscoverage['/base/selector.js'].lineData[86] = 0;
  _$jscoverage['/base/selector.js'].lineData[87] = 0;
  _$jscoverage['/base/selector.js'].lineData[88] = 0;
  _$jscoverage['/base/selector.js'].lineData[92] = 0;
  _$jscoverage['/base/selector.js'].lineData[93] = 0;
  _$jscoverage['/base/selector.js'].lineData[94] = 0;
  _$jscoverage['/base/selector.js'].lineData[99] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[104] = 0;
  _$jscoverage['/base/selector.js'].lineData[105] = 0;
  _$jscoverage['/base/selector.js'].lineData[114] = 0;
  _$jscoverage['/base/selector.js'].lineData[115] = 0;
  _$jscoverage['/base/selector.js'].lineData[116] = 0;
  _$jscoverage['/base/selector.js'].lineData[117] = 0;
  _$jscoverage['/base/selector.js'].lineData[119] = 0;
  _$jscoverage['/base/selector.js'].lineData[121] = 0;
  _$jscoverage['/base/selector.js'].lineData[122] = 0;
  _$jscoverage['/base/selector.js'].lineData[123] = 0;
  _$jscoverage['/base/selector.js'].lineData[125] = 0;
  _$jscoverage['/base/selector.js'].lineData[126] = 0;
  _$jscoverage['/base/selector.js'].lineData[128] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[130] = 0;
  _$jscoverage['/base/selector.js'].lineData[132] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[134] = 0;
  _$jscoverage['/base/selector.js'].lineData[136] = 0;
  _$jscoverage['/base/selector.js'].lineData[137] = 0;
  _$jscoverage['/base/selector.js'].lineData[139] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[149] = 0;
  _$jscoverage['/base/selector.js'].lineData[150] = 0;
  _$jscoverage['/base/selector.js'].lineData[154] = 0;
  _$jscoverage['/base/selector.js'].lineData[157] = 0;
  _$jscoverage['/base/selector.js'].lineData[158] = 0;
  _$jscoverage['/base/selector.js'].lineData[161] = 0;
  _$jscoverage['/base/selector.js'].lineData[162] = 0;
  _$jscoverage['/base/selector.js'].lineData[163] = 0;
  _$jscoverage['/base/selector.js'].lineData[166] = 0;
  _$jscoverage['/base/selector.js'].lineData[170] = 0;
  _$jscoverage['/base/selector.js'].lineData[171] = 0;
  _$jscoverage['/base/selector.js'].lineData[172] = 0;
  _$jscoverage['/base/selector.js'].lineData[173] = 0;
  _$jscoverage['/base/selector.js'].lineData[176] = 0;
  _$jscoverage['/base/selector.js'].lineData[177] = 0;
  _$jscoverage['/base/selector.js'].lineData[185] = 0;
  _$jscoverage['/base/selector.js'].lineData[186] = 0;
  _$jscoverage['/base/selector.js'].lineData[187] = 0;
  _$jscoverage['/base/selector.js'].lineData[189] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[194] = 0;
  _$jscoverage['/base/selector.js'].lineData[195] = 0;
  _$jscoverage['/base/selector.js'].lineData[201] = 0;
  _$jscoverage['/base/selector.js'].lineData[203] = 0;
  _$jscoverage['/base/selector.js'].lineData[206] = 0;
  _$jscoverage['/base/selector.js'].lineData[207] = 0;
  _$jscoverage['/base/selector.js'].lineData[210] = 0;
  _$jscoverage['/base/selector.js'].lineData[211] = 0;
  _$jscoverage['/base/selector.js'].lineData[212] = 0;
  _$jscoverage['/base/selector.js'].lineData[213] = 0;
  _$jscoverage['/base/selector.js'].lineData[214] = 0;
  _$jscoverage['/base/selector.js'].lineData[215] = 0;
  _$jscoverage['/base/selector.js'].lineData[223] = 0;
  _$jscoverage['/base/selector.js'].lineData[225] = 0;
  _$jscoverage['/base/selector.js'].lineData[228] = 0;
  _$jscoverage['/base/selector.js'].lineData[231] = 0;
  _$jscoverage['/base/selector.js'].lineData[232] = 0;
  _$jscoverage['/base/selector.js'].lineData[236] = 0;
  _$jscoverage['/base/selector.js'].lineData[237] = 0;
  _$jscoverage['/base/selector.js'].lineData[238] = 0;
  _$jscoverage['/base/selector.js'].lineData[239] = 0;
  _$jscoverage['/base/selector.js'].lineData[241] = 0;
  _$jscoverage['/base/selector.js'].lineData[244] = 0;
  _$jscoverage['/base/selector.js'].lineData[245] = 0;
  _$jscoverage['/base/selector.js'].lineData[248] = 0;
  _$jscoverage['/base/selector.js'].lineData[256] = 0;
  _$jscoverage['/base/selector.js'].lineData[257] = 0;
  _$jscoverage['/base/selector.js'].lineData[259] = 0;
  _$jscoverage['/base/selector.js'].lineData[260] = 0;
  _$jscoverage['/base/selector.js'].lineData[265] = 0;
  _$jscoverage['/base/selector.js'].lineData[269] = 0;
  _$jscoverage['/base/selector.js'].lineData[279] = 0;
  _$jscoverage['/base/selector.js'].lineData[283] = 0;
  _$jscoverage['/base/selector.js'].lineData[284] = 0;
  _$jscoverage['/base/selector.js'].lineData[285] = 0;
  _$jscoverage['/base/selector.js'].lineData[286] = 0;
  _$jscoverage['/base/selector.js'].lineData[289] = 0;
  _$jscoverage['/base/selector.js'].lineData[293] = 0;
  _$jscoverage['/base/selector.js'].lineData[319] = 0;
  _$jscoverage['/base/selector.js'].lineData[331] = 0;
  _$jscoverage['/base/selector.js'].lineData[338] = 0;
  _$jscoverage['/base/selector.js'].lineData[339] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[343] = 0;
  _$jscoverage['/base/selector.js'].lineData[344] = 0;
  _$jscoverage['/base/selector.js'].lineData[345] = 0;
  _$jscoverage['/base/selector.js'].lineData[346] = 0;
  _$jscoverage['/base/selector.js'].lineData[349] = 0;
  _$jscoverage['/base/selector.js'].lineData[353] = 0;
  _$jscoverage['/base/selector.js'].lineData[355] = 0;
  _$jscoverage['/base/selector.js'].lineData[356] = 0;
  _$jscoverage['/base/selector.js'].lineData[358] = 0;
  _$jscoverage['/base/selector.js'].lineData[359] = 0;
  _$jscoverage['/base/selector.js'].lineData[360] = 0;
  _$jscoverage['/base/selector.js'].lineData[361] = 0;
  _$jscoverage['/base/selector.js'].lineData[362] = 0;
  _$jscoverage['/base/selector.js'].lineData[363] = 0;
  _$jscoverage['/base/selector.js'].lineData[365] = 0;
  _$jscoverage['/base/selector.js'].lineData[370] = 0;
  _$jscoverage['/base/selector.js'].lineData[383] = 0;
  _$jscoverage['/base/selector.js'].lineData[390] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[394] = 0;
  _$jscoverage['/base/selector.js'].lineData[395] = 0;
  _$jscoverage['/base/selector.js'].lineData[396] = 0;
  _$jscoverage['/base/selector.js'].lineData[397] = 0;
  _$jscoverage['/base/selector.js'].lineData[398] = 0;
  _$jscoverage['/base/selector.js'].lineData[402] = 0;
  _$jscoverage['/base/selector.js'].lineData[403] = 0;
  _$jscoverage['/base/selector.js'].lineData[407] = 0;
  _$jscoverage['/base/selector.js'].lineData[408] = 0;
  _$jscoverage['/base/selector.js'].lineData[411] = 0;
  _$jscoverage['/base/selector.js'].lineData[413] = 0;
  _$jscoverage['/base/selector.js'].lineData[414] = 0;
  _$jscoverage['/base/selector.js'].lineData[415] = 0;
  _$jscoverage['/base/selector.js'].lineData[420] = 0;
  _$jscoverage['/base/selector.js'].lineData[421] = 0;
  _$jscoverage['/base/selector.js'].lineData[423] = 0;
  _$jscoverage['/base/selector.js'].lineData[426] = 0;
  _$jscoverage['/base/selector.js'].lineData[438] = 0;
  _$jscoverage['/base/selector.js'].lineData[439] = 0;
  _$jscoverage['/base/selector.js'].lineData[443] = 0;
}
if (! _$jscoverage['/base/selector.js'].functionData) {
  _$jscoverage['/base/selector.js'].functionData = [];
  _$jscoverage['/base/selector.js'].functionData[0] = 0;
  _$jscoverage['/base/selector.js'].functionData[1] = 0;
  _$jscoverage['/base/selector.js'].functionData[2] = 0;
  _$jscoverage['/base/selector.js'].functionData[3] = 0;
  _$jscoverage['/base/selector.js'].functionData[4] = 0;
  _$jscoverage['/base/selector.js'].functionData[5] = 0;
  _$jscoverage['/base/selector.js'].functionData[6] = 0;
  _$jscoverage['/base/selector.js'].functionData[7] = 0;
  _$jscoverage['/base/selector.js'].functionData[8] = 0;
  _$jscoverage['/base/selector.js'].functionData[9] = 0;
  _$jscoverage['/base/selector.js'].functionData[10] = 0;
  _$jscoverage['/base/selector.js'].functionData[11] = 0;
  _$jscoverage['/base/selector.js'].functionData[12] = 0;
  _$jscoverage['/base/selector.js'].functionData[13] = 0;
  _$jscoverage['/base/selector.js'].functionData[14] = 0;
  _$jscoverage['/base/selector.js'].functionData[15] = 0;
  _$jscoverage['/base/selector.js'].functionData[16] = 0;
  _$jscoverage['/base/selector.js'].functionData[17] = 0;
  _$jscoverage['/base/selector.js'].functionData[18] = 0;
  _$jscoverage['/base/selector.js'].functionData[19] = 0;
  _$jscoverage['/base/selector.js'].functionData[20] = 0;
  _$jscoverage['/base/selector.js'].functionData[21] = 0;
  _$jscoverage['/base/selector.js'].functionData[22] = 0;
  _$jscoverage['/base/selector.js'].functionData[23] = 0;
  _$jscoverage['/base/selector.js'].functionData[24] = 0;
  _$jscoverage['/base/selector.js'].functionData[25] = 0;
  _$jscoverage['/base/selector.js'].functionData[26] = 0;
  _$jscoverage['/base/selector.js'].functionData[27] = 0;
  _$jscoverage['/base/selector.js'].functionData[28] = 0;
  _$jscoverage['/base/selector.js'].functionData[29] = 0;
  _$jscoverage['/base/selector.js'].functionData[30] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['13'] = [];
  _$jscoverage['/base/selector.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['29'] = [];
  _$jscoverage['/base/selector.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['35'] = [];
  _$jscoverage['/base/selector.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['37'] = [];
  _$jscoverage['/base/selector.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['53'] = [];
  _$jscoverage['/base/selector.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['54'] = [];
  _$jscoverage['/base/selector.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['62'] = [];
  _$jscoverage['/base/selector.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['70'] = [];
  _$jscoverage['/base/selector.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['72'] = [];
  _$jscoverage['/base/selector.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['82'] = [];
  _$jscoverage['/base/selector.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['109'] = [];
  _$jscoverage['/base/selector.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'] = [];
  _$jscoverage['/base/selector.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['114'] = [];
  _$jscoverage['/base/selector.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['116'] = [];
  _$jscoverage['/base/selector.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['119'] = [];
  _$jscoverage['/base/selector.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['121'] = [];
  _$jscoverage['/base/selector.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['123'] = [];
  _$jscoverage['/base/selector.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['126'] = [];
  _$jscoverage['/base/selector.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['129'] = [];
  _$jscoverage['/base/selector.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['129'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['130'] = [];
  _$jscoverage['/base/selector.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['134'] = [];
  _$jscoverage['/base/selector.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['137'] = [];
  _$jscoverage['/base/selector.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'] = [];
  _$jscoverage['/base/selector.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['149'] = [];
  _$jscoverage['/base/selector.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['155'] = [];
  _$jscoverage['/base/selector.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['162'] = [];
  _$jscoverage['/base/selector.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['166'] = [];
  _$jscoverage['/base/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['170'] = [];
  _$jscoverage['/base/selector.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['172'] = [];
  _$jscoverage['/base/selector.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['176'] = [];
  _$jscoverage['/base/selector.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['176'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['185'] = [];
  _$jscoverage['/base/selector.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['187'] = [];
  _$jscoverage['/base/selector.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['190'] = [];
  _$jscoverage['/base/selector.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['195'] = [];
  _$jscoverage['/base/selector.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['206'] = [];
  _$jscoverage['/base/selector.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['211'] = [];
  _$jscoverage['/base/selector.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['212'] = [];
  _$jscoverage['/base/selector.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['213'] = [];
  _$jscoverage['/base/selector.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['231'] = [];
  _$jscoverage['/base/selector.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['232'] = [];
  _$jscoverage['/base/selector.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['233'] = [];
  _$jscoverage['/base/selector.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['237'] = [];
  _$jscoverage['/base/selector.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['238'] = [];
  _$jscoverage['/base/selector.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['245'] = [];
  _$jscoverage['/base/selector.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['245'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['245'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['256'] = [];
  _$jscoverage['/base/selector.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['283'] = [];
  _$jscoverage['/base/selector.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['285'] = [];
  _$jscoverage['/base/selector.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['319'] = [];
  _$jscoverage['/base/selector.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['344'] = [];
  _$jscoverage['/base/selector.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['358'] = [];
  _$jscoverage['/base/selector.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['360'] = [];
  _$jscoverage['/base/selector.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['361'] = [];
  _$jscoverage['/base/selector.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['390'] = [];
  _$jscoverage['/base/selector.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['390'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['391'] = [];
  _$jscoverage['/base/selector.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['396'] = [];
  _$jscoverage['/base/selector.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['402'] = [];
  _$jscoverage['/base/selector.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['407'] = [];
  _$jscoverage['/base/selector.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['411'] = [];
  _$jscoverage['/base/selector.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['413'] = [];
  _$jscoverage['/base/selector.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['413'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['415'] = [];
  _$jscoverage['/base/selector.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['420'] = [];
  _$jscoverage['/base/selector.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['439'] = [];
  _$jscoverage['/base/selector.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['439'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['439'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit401_439_2(result) {
  _$jscoverage['/base/selector.js'].branchData['439'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['439'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit400_439_1(result) {
  _$jscoverage['/base/selector.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['420'][1].init(1352, 28, 'typeof filter === \'function\'');
function visit399_420_1(result) {
  _$jscoverage['/base/selector.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['415'][1].init(37, 26, 'getAttr(elem, \'id\') === id');
function visit398_415_1(result) {
  _$jscoverage['/base/selector.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['413'][2].init(773, 12, '!tag && !cls');
function visit397_413_2(result) {
  _$jscoverage['/base/selector.js'].branchData['413'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['413'][1].init(767, 18, 'id && !tag && !cls');
function visit396_413_1(result) {
  _$jscoverage['/base/selector.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['411'][1].init(496, 14, 'clsRe && tagRe');
function visit395_411_1(result) {
  _$jscoverage['/base/selector.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['407'][1].init(352, 3, 'cls');
function visit394_407_1(result) {
  _$jscoverage['/base/selector.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['402'][1].init(175, 3, 'tag');
function visit393_402_1(result) {
  _$jscoverage['/base/selector.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['396'][1].init(136, 3, '!id');
function visit392_396_1(result) {
  _$jscoverage['/base/selector.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['391'][1].init(51, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit391_391_1(result) {
  _$jscoverage['/base/selector.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['390'][2].init(215, 26, 'typeof filter === \'string\'');
function visit390_390_2(result) {
  _$jscoverage['/base/selector.js'].branchData['390'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['390'][1].init(215, 137, 'typeof filter === \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit389_390_1(result) {
  _$jscoverage['/base/selector.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['361'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit388_361_1(result) {
  _$jscoverage['/base/selector.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['360'][1].init(92, 7, 'i < len');
function visit387_360_1(result) {
  _$jscoverage['/base/selector.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['358'][1].init(131, 12, 'hasDuplicate');
function visit386_358_1(result) {
  _$jscoverage['/base/selector.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['344'][1].init(26, 7, 'a === b');
function visit385_344_1(result) {
  _$jscoverage['/base/selector.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['319'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit384_319_1(result) {
  _$jscoverage['/base/selector.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['285'][1].init(61, 20, 'matches.call(n, str)');
function visit383_285_1(result) {
  _$jscoverage['/base/selector.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['283'][1].init(149, 7, 'i < len');
function visit382_283_1(result) {
  _$jscoverage['/base/selector.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['256'][1].init(22, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit381_256_1(result) {
  _$jscoverage['/base/selector.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['245'][3].init(34, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit380_245_3(result) {
  _$jscoverage['/base/selector.js'].branchData['245'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['245'][2].init(17, 13, 'value === \'*\'');
function visit379_245_2(result) {
  _$jscoverage['/base/selector.js'].branchData['245'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['245'][1].init(17, 66, 'value === \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit378_245_1(result) {
  _$jscoverage['/base/selector.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['238'][1].init(66, 20, 'ret && ret.specified');
function visit377_238_1(result) {
  _$jscoverage['/base/selector.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['237'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit376_237_1(result) {
  _$jscoverage['/base/selector.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['233'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit375_233_1(result) {
  _$jscoverage['/base/selector.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['232'][2].init(167, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit374_232_2(result) {
  _$jscoverage['/base/selector.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['232'][1].init(153, 142, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit373_232_1(result) {
  _$jscoverage['/base/selector.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['231'][1].init(109, 26, 'el && getAttr(el, \'class\')');
function visit372_231_1(result) {
  _$jscoverage['/base/selector.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['213'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit371_213_1(result) {
  _$jscoverage['/base/selector.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['212'][1].init(35, 16, 'ci < contextsLen');
function visit370_212_1(result) {
  _$jscoverage['/base/selector.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['211'][1].init(153, 7, 'i < len');
function visit369_211_1(result) {
  _$jscoverage['/base/selector.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['206'][1].init(1049, 14, '!simpleContext');
function visit368_206_1(result) {
  _$jscoverage['/base/selector.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['195'][1].init(651, 23, 'isDomNodeList(selector)');
function visit367_195_1(result) {
  _$jscoverage['/base/selector.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['190'][1].init(455, 17, 'isArray(selector)');
function visit366_190_1(result) {
  _$jscoverage['/base/selector.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['187'][1].init(309, 20, 'selector.getDOMNodes');
function visit365_187_1(result) {
  _$jscoverage['/base/selector.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['185'][1].init(204, 41, 'selector.nodeType || S.isWindow(selector)');
function visit364_185_1(result) {
  _$jscoverage['/base/selector.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['176'][3].init(266, 15, 'contextsLen > 1');
function visit363_176_3(result) {
  _$jscoverage['/base/selector.js'].branchData['176'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['176'][2].init(248, 14, 'ret.length > 1');
function visit362_176_2(result) {
  _$jscoverage['/base/selector.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['176'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit361_176_1(result) {
  _$jscoverage['/base/selector.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['172'][1].init(57, 15, 'i < contextsLen');
function visit360_172_1(result) {
  _$jscoverage['/base/selector.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['170'][1].init(2331, 4, '!ret');
function visit359_170_1(result) {
  _$jscoverage['/base/selector.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['166'][2].init(1209, 18, 'parents.length > 1');
function visit358_166_2(result) {
  _$jscoverage['/base/selector.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['166'][1].init(1198, 29, 'parents && parents.length > 1');
function visit357_166_1(result) {
  _$jscoverage['/base/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['162'][1].init(568, 15, '!parents.length');
function visit356_162_1(result) {
  _$jscoverage['/base/selector.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['155'][1].init(80, 24, 'parentIndex < parentsLen');
function visit355_155_1(result) {
  _$jscoverage['/base/selector.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['149'][1].init(478, 12, 'i < partsLen');
function visit354_149_1(result) {
  _$jscoverage['/base/selector.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][1].init(317, 12, 'i < partsLen');
function visit353_145_1(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['137'][1].init(917, 26, 'isSimpleSelector(selector)');
function visit352_137_1(result) {
  _$jscoverage['/base/selector.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['134'][1].init(755, 27, 'rTagSelector.test(selector)');
function visit351_134_1(result) {
  _$jscoverage['/base/selector.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['130'][1].init(553, 26, 'rIdSelector.test(selector)');
function visit350_130_1(result) {
  _$jscoverage['/base/selector.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['129'][2].init(128, 39, 'el.nodeName.toLowerCase() === RegExp.$1');
function visit349_129_2(result) {
  _$jscoverage['/base/selector.js'].branchData['129'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['129'][1].init(122, 45, 'el && el.nodeName.toLowerCase() === RegExp.$1');
function visit348_129_1(result) {
  _$jscoverage['/base/selector.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['126'][1].init(311, 29, 'rTagIdSelector.test(selector)');
function visit347_126_1(result) {
  _$jscoverage['/base/selector.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['123'][1].init(142, 29, 'rClassSelector.test(selector)');
function visit346_123_1(result) {
  _$jscoverage['/base/selector.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['121'][1].init(51, 19, 'selector === \'body\'');
function visit345_121_1(result) {
  _$jscoverage['/base/selector.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['119'][1].init(60, 13, 'simpleContext');
function visit344_119_1(result) {
  _$jscoverage['/base/selector.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['116'][1].init(370, 16, 'isSelectorString');
function visit343_116_1(result) {
  _$jscoverage['/base/selector.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['114'][1].init(313, 9, '!selector');
function visit342_114_1(result) {
  _$jscoverage['/base/selector.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][2].init(197, 27, '(simpleContext = 1) && [doc]');
function visit341_110_2(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][1].init(155, 21, 'context !== undefined');
function visit340_110_1(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['109'][1].init(101, 28, 'typeof selector === \'string\'');
function visit339_109_1(result) {
  _$jscoverage['/base/selector.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['82'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit338_82_1(result) {
  _$jscoverage['/base/selector.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['72'][1].init(152, 9, 's === \'.\'');
function visit337_72_1(result) {
  _$jscoverage['/base/selector.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['70'][1].init(51, 9, 's === \'#\'');
function visit336_70_1(result) {
  _$jscoverage['/base/selector.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['62'][1].init(54, 5, '!name');
function visit335_62_1(result) {
  _$jscoverage['/base/selector.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['54'][1].init(18, 23, 'f(self[i], i) === false');
function visit334_54_1(result) {
  _$jscoverage['/base/selector.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['53'][1].init(94, 5, 'i < l');
function visit333_53_1(result) {
  _$jscoverage['/base/selector.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['37'][2].init(67, 44, 'elem.className || elem.getAttribute(\'class\')');
function visit332_37_2(result) {
  _$jscoverage['/base/selector.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['37'][1].init(60, 79, '(\' \' + (elem.className || elem.getAttribute(\'class\')) + \' \').indexOf(match) > -1');
function visit331_37_1(result) {
  _$jscoverage['/base/selector.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['35'][1].init(180, 19, 'i < elements.length');
function visit330_35_1(result) {
  _$jscoverage['/base/selector.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['29'][1].init(869, 30, '!supportGetElementsByClassName');
function visit329_29_1(result) {
  _$jscoverage['/base/selector.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['13'][1].init(42, 66, 'docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit328_13_1(result) {
  _$jscoverage['/base/selector.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(45, 109, 'docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit327_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(31, 155, 'docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit326_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(89, 187, 'docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit325_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/selector.js'].lineData[8]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit325_10_1(docElem.matches || visit326_11_1(docElem.webkitMatchesSelector || visit327_12_1(docElem.mozMatchesSelector || visit328_13_1(docElem.oMatchesSelector || docElem.msMatchesSelector)))), supportGetElementsByClassName = 'getElementsByClassName' in doc, getElementsByClassName, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[29]++;
  if (visit329_29_1(!supportGetElementsByClassName)) {
    _$jscoverage['/base/selector.js'].lineData[30]++;
    getElementsByClassName = function(el, match) {
  _$jscoverage['/base/selector.js'].functionData[1]++;
  _$jscoverage['/base/selector.js'].lineData[31]++;
  var result = [], elements = el.getElementsByTagName('*'), i, elem;
  _$jscoverage['/base/selector.js'].lineData[34]++;
  match = ' ' + match + ' ';
  _$jscoverage['/base/selector.js'].lineData[35]++;
  for (i = 0; visit330_35_1(i < elements.length); i++) {
    _$jscoverage['/base/selector.js'].lineData[36]++;
    elem = elements[i];
    _$jscoverage['/base/selector.js'].lineData[37]++;
    if (visit331_37_1((' ' + (visit332_37_2(elem.className || elem.getAttribute('class'))) + ' ').indexOf(match) > -1)) {
      _$jscoverage['/base/selector.js'].lineData[38]++;
      result.push(elem);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[41]++;
  return result;
};
  } else {
    _$jscoverage['/base/selector.js'].lineData[44]++;
    getElementsByClassName = function(el, match) {
  _$jscoverage['/base/selector.js'].functionData[2]++;
  _$jscoverage['/base/selector.js'].lineData[45]++;
  return el.getElementsByClassName(match);
};
  }
  _$jscoverage['/base/selector.js'].lineData[49]++;
  function queryEach(f) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[50]++;
    var self = this, l = self.length, i;
    _$jscoverage['/base/selector.js'].lineData[53]++;
    for (i = 0; visit333_53_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[54]++;
      if (visit334_54_1(f(self[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[55]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[60]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[61]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[62]++;
    if (visit335_62_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[63]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[65]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[68]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[5]++;
    _$jscoverage['/base/selector.js'].lineData[69]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[70]++;
    if (visit336_70_1(s === '#')) {
      _$jscoverage['/base/selector.js'].lineData[71]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[72]++;
      if (visit337_72_1(s === '.')) {
        _$jscoverage['/base/selector.js'].lineData[73]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[75]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[79]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[6]++;
    _$jscoverage['/base/selector.js'].lineData[80]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[7]++;
  _$jscoverage['/base/selector.js'].lineData[81]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[82]++;
  return visit338_82_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[86]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[8]++;
    _$jscoverage['/base/selector.js'].lineData[87]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[9]++;
  _$jscoverage['/base/selector.js'].lineData[88]++;
  return getElementsByClassName(elem, className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[92]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[10]++;
    _$jscoverage['/base/selector.js'].lineData[93]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[11]++;
  _$jscoverage['/base/selector.js'].lineData[94]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[99]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[100]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[101]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[104]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[105]++;
    var ret, i, el, simpleContext, isSelectorString = visit339_109_1(typeof selector === 'string'), contexts = visit340_110_1(context !== undefined) ? query(context) : visit341_110_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[114]++;
    if (visit342_114_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[115]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[116]++;
      if (visit343_116_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[117]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[119]++;
        if (visit344_119_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[121]++;
          if (visit345_121_1(selector === 'body')) {
            _$jscoverage['/base/selector.js'].lineData[122]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[123]++;
            if (visit346_123_1(rClassSelector.test(selector))) {
              _$jscoverage['/base/selector.js'].lineData[125]++;
              ret = makeArray(getElementsByClassName(doc, RegExp.$1));
            } else {
              _$jscoverage['/base/selector.js'].lineData[126]++;
              if (visit347_126_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[128]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[129]++;
                ret = visit348_129_1(el && visit349_129_2(el.nodeName.toLowerCase() === RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[130]++;
                if (visit350_130_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[132]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[133]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[134]++;
                  if (visit351_134_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[136]++;
                    ret = makeArray(doc.getElementsByTagName(selector));
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[137]++;
                    if (visit352_137_1(isSimpleSelector(selector))) {
                      _$jscoverage['/base/selector.js'].lineData[139]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[145]++;
                      for (i = 0 , partsLen = parts.length; visit353_145_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[146]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[149]++;
                      for (i = 0 , partsLen = parts.length; visit354_149_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[150]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[154]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit355_155_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[157]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[158]++;
                          newParents.push.apply(newParents, makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[161]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[162]++;
                        if (visit356_162_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[163]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[166]++;
                      ret = visit357_166_1(parents && visit358_166_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[170]++;
        if (visit359_170_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[171]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[172]++;
          for (i = 0; visit360_172_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[173]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[176]++;
          if (visit361_176_1(visit362_176_2(ret.length > 1) && visit363_176_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[177]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[185]++;
        if (visit364_185_1(selector.nodeType || S.isWindow(selector))) {
          _$jscoverage['/base/selector.js'].lineData[186]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[187]++;
          if (visit365_187_1(selector.getDOMNodes)) {
            _$jscoverage['/base/selector.js'].lineData[189]++;
            ret = selector.getDOMNodes();
          } else {
            _$jscoverage['/base/selector.js'].lineData[190]++;
            if (visit366_190_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[194]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[195]++;
              if (visit367_195_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[201]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[203]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[206]++;
        if (visit368_206_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[207]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[210]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[211]++;
          for (i = 0; visit369_211_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[212]++;
            for (ci = 0; visit370_212_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[213]++;
              if (visit371_213_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[214]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[215]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[223]++;
    ret.each = queryEach;
    _$jscoverage['/base/selector.js'].lineData[225]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[228]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[231]++;
    var className = visit372_231_1(el && getAttr(el, 'class'));
    _$jscoverage['/base/selector.js'].lineData[232]++;
    return visit373_232_1(className && visit374_232_2((className = className.replace(/[\r\t\n]/g, SPACE)) && visit375_233_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[236]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[15]++;
    _$jscoverage['/base/selector.js'].lineData[237]++;
    var ret = visit376_237_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[238]++;
    if (visit377_238_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[239]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[241]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[244]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[16]++;
    _$jscoverage['/base/selector.js'].lineData[245]++;
    return visit378_245_1(visit379_245_2(value === '*') || visit380_245_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[248]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[256]++;
  if (visit381_256_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[257]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[259]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[260]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[265]++;
  return makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[269]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[279]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[283]++;
  for (; visit382_283_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[284]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[285]++;
    if (visit383_285_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[286]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[289]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[293]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[319]++;
  return visit384_319_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[23]++;
  _$jscoverage['/base/selector.js'].lineData[331]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[338]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[24]++;
  _$jscoverage['/base/selector.js'].lineData[339]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[340]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[343]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[25]++;
    _$jscoverage['/base/selector.js'].lineData[344]++;
    if (visit385_344_1(a === b)) {
      _$jscoverage['/base/selector.js'].lineData[345]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[346]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[349]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[353]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[355]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[356]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[358]++;
  if (visit386_358_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[359]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[360]++;
    while (visit387_360_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[361]++;
      if (visit388_361_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[362]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[363]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[365]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[370]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[383]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[390]++;
  if (visit389_390_1(visit390_390_2(typeof filter === 'string') && visit391_391_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[393]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[394]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[395]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[396]++;
    if (visit392_396_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[397]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[398]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[402]++;
  if (visit393_402_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[403]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[407]++;
  if (visit394_407_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[408]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[411]++;
  return visit395_411_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[413]++;
      if (visit396_413_1(id && visit397_413_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[414]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[29]++;
  _$jscoverage['/base/selector.js'].lineData[415]++;
  return visit398_415_1(getAttr(elem, 'id') === id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[420]++;
  if (visit399_420_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[421]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[423]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[426]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[30]++;
  _$jscoverage['/base/selector.js'].lineData[438]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[439]++;
  return visit400_439_1(elements.length && (visit401_439_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[443]++;
  return Dom;
});
