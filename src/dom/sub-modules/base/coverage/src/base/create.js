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
  _$jscoverage['/base/create.js'].lineData[26] = 0;
  _$jscoverage['/base/create.js'].lineData[27] = 0;
  _$jscoverage['/base/create.js'].lineData[30] = 0;
  _$jscoverage['/base/create.js'].lineData[31] = 0;
  _$jscoverage['/base/create.js'].lineData[32] = 0;
  _$jscoverage['/base/create.js'].lineData[33] = 0;
  _$jscoverage['/base/create.js'].lineData[35] = 0;
  _$jscoverage['/base/create.js'].lineData[38] = 0;
  _$jscoverage['/base/create.js'].lineData[39] = 0;
  _$jscoverage['/base/create.js'].lineData[42] = 0;
  _$jscoverage['/base/create.js'].lineData[43] = 0;
  _$jscoverage['/base/create.js'].lineData[45] = 0;
  _$jscoverage['/base/create.js'].lineData[48] = 0;
  _$jscoverage['/base/create.js'].lineData[49] = 0;
  _$jscoverage['/base/create.js'].lineData[51] = 0;
  _$jscoverage['/base/create.js'].lineData[52] = 0;
  _$jscoverage['/base/create.js'].lineData[55] = 0;
  _$jscoverage['/base/create.js'].lineData[56] = 0;
  _$jscoverage['/base/create.js'].lineData[58] = 0;
  _$jscoverage['/base/create.js'].lineData[59] = 0;
  _$jscoverage['/base/create.js'].lineData[65] = 0;
  _$jscoverage['/base/create.js'].lineData[66] = 0;
  _$jscoverage['/base/create.js'].lineData[70] = 0;
  _$jscoverage['/base/create.js'].lineData[71] = 0;
  _$jscoverage['/base/create.js'].lineData[76] = 0;
  _$jscoverage['/base/create.js'].lineData[78] = 0;
  _$jscoverage['/base/create.js'].lineData[79] = 0;
  _$jscoverage['/base/create.js'].lineData[81] = 0;
  _$jscoverage['/base/create.js'].lineData[83] = 0;
  _$jscoverage['/base/create.js'].lineData[88] = 0;
  _$jscoverage['/base/create.js'].lineData[105] = 0;
  _$jscoverage['/base/create.js'].lineData[107] = 0;
  _$jscoverage['/base/create.js'].lineData[108] = 0;
  _$jscoverage['/base/create.js'].lineData[111] = 0;
  _$jscoverage['/base/create.js'].lineData[112] = 0;
  _$jscoverage['/base/create.js'].lineData[116] = 0;
  _$jscoverage['/base/create.js'].lineData[117] = 0;
  _$jscoverage['/base/create.js'].lineData[120] = 0;
  _$jscoverage['/base/create.js'].lineData[121] = 0;
  _$jscoverage['/base/create.js'].lineData[124] = 0;
  _$jscoverage['/base/create.js'].lineData[125] = 0;
  _$jscoverage['/base/create.js'].lineData[128] = 0;
  _$jscoverage['/base/create.js'].lineData[137] = 0;
  _$jscoverage['/base/create.js'].lineData[138] = 0;
  _$jscoverage['/base/create.js'].lineData[141] = 0;
  _$jscoverage['/base/create.js'].lineData[142] = 0;
  _$jscoverage['/base/create.js'].lineData[147] = 0;
  _$jscoverage['/base/create.js'].lineData[149] = 0;
  _$jscoverage['/base/create.js'].lineData[150] = 0;
  _$jscoverage['/base/create.js'].lineData[153] = 0;
  _$jscoverage['/base/create.js'].lineData[155] = 0;
  _$jscoverage['/base/create.js'].lineData[157] = 0;
  _$jscoverage['/base/create.js'].lineData[160] = 0;
  _$jscoverage['/base/create.js'].lineData[162] = 0;
  _$jscoverage['/base/create.js'].lineData[165] = 0;
  _$jscoverage['/base/create.js'].lineData[167] = 0;
  _$jscoverage['/base/create.js'].lineData[169] = 0;
  _$jscoverage['/base/create.js'].lineData[170] = 0;
  _$jscoverage['/base/create.js'].lineData[172] = 0;
  _$jscoverage['/base/create.js'].lineData[174] = 0;
  _$jscoverage['/base/create.js'].lineData[178] = 0;
  _$jscoverage['/base/create.js'].lineData[183] = 0;
  _$jscoverage['/base/create.js'].lineData[184] = 0;
  _$jscoverage['/base/create.js'].lineData[185] = 0;
  _$jscoverage['/base/create.js'].lineData[205] = 0;
  _$jscoverage['/base/create.js'].lineData[210] = 0;
  _$jscoverage['/base/create.js'].lineData[211] = 0;
  _$jscoverage['/base/create.js'].lineData[214] = 0;
  _$jscoverage['/base/create.js'].lineData[216] = 0;
  _$jscoverage['/base/create.js'].lineData[217] = 0;
  _$jscoverage['/base/create.js'].lineData[218] = 0;
  _$jscoverage['/base/create.js'].lineData[219] = 0;
  _$jscoverage['/base/create.js'].lineData[220] = 0;
  _$jscoverage['/base/create.js'].lineData[221] = 0;
  _$jscoverage['/base/create.js'].lineData[223] = 0;
  _$jscoverage['/base/create.js'].lineData[228] = 0;
  _$jscoverage['/base/create.js'].lineData[232] = 0;
  _$jscoverage['/base/create.js'].lineData[235] = 0;
  _$jscoverage['/base/create.js'].lineData[236] = 0;
  _$jscoverage['/base/create.js'].lineData[237] = 0;
  _$jscoverage['/base/create.js'].lineData[238] = 0;
  _$jscoverage['/base/create.js'].lineData[239] = 0;
  _$jscoverage['/base/create.js'].lineData[240] = 0;
  _$jscoverage['/base/create.js'].lineData[243] = 0;
  _$jscoverage['/base/create.js'].lineData[251] = 0;
  _$jscoverage['/base/create.js'].lineData[252] = 0;
  _$jscoverage['/base/create.js'].lineData[253] = 0;
  _$jscoverage['/base/create.js'].lineData[254] = 0;
  _$jscoverage['/base/create.js'].lineData[257] = 0;
  _$jscoverage['/base/create.js'].lineData[269] = 0;
  _$jscoverage['/base/create.js'].lineData[275] = 0;
  _$jscoverage['/base/create.js'].lineData[276] = 0;
  _$jscoverage['/base/create.js'].lineData[279] = 0;
  _$jscoverage['/base/create.js'].lineData[280] = 0;
  _$jscoverage['/base/create.js'].lineData[281] = 0;
  _$jscoverage['/base/create.js'].lineData[283] = 0;
  _$jscoverage['/base/create.js'].lineData[284] = 0;
  _$jscoverage['/base/create.js'].lineData[285] = 0;
  _$jscoverage['/base/create.js'].lineData[288] = 0;
  _$jscoverage['/base/create.js'].lineData[289] = 0;
  _$jscoverage['/base/create.js'].lineData[290] = 0;
  _$jscoverage['/base/create.js'].lineData[291] = 0;
  _$jscoverage['/base/create.js'].lineData[292] = 0;
  _$jscoverage['/base/create.js'].lineData[293] = 0;
  _$jscoverage['/base/create.js'].lineData[294] = 0;
  _$jscoverage['/base/create.js'].lineData[295] = 0;
  _$jscoverage['/base/create.js'].lineData[299] = 0;
  _$jscoverage['/base/create.js'].lineData[300] = 0;
  _$jscoverage['/base/create.js'].lineData[301] = 0;
  _$jscoverage['/base/create.js'].lineData[304] = 0;
  _$jscoverage['/base/create.js'].lineData[313] = 0;
  _$jscoverage['/base/create.js'].lineData[318] = 0;
  _$jscoverage['/base/create.js'].lineData[319] = 0;
  _$jscoverage['/base/create.js'].lineData[320] = 0;
  _$jscoverage['/base/create.js'].lineData[321] = 0;
  _$jscoverage['/base/create.js'].lineData[322] = 0;
  _$jscoverage['/base/create.js'].lineData[323] = 0;
  _$jscoverage['/base/create.js'].lineData[324] = 0;
  _$jscoverage['/base/create.js'].lineData[325] = 0;
  _$jscoverage['/base/create.js'].lineData[333] = 0;
  _$jscoverage['/base/create.js'].lineData[357] = 0;
  _$jscoverage['/base/create.js'].lineData[358] = 0;
  _$jscoverage['/base/create.js'].lineData[359] = 0;
  _$jscoverage['/base/create.js'].lineData[360] = 0;
  _$jscoverage['/base/create.js'].lineData[363] = 0;
  _$jscoverage['/base/create.js'].lineData[368] = 0;
  _$jscoverage['/base/create.js'].lineData[369] = 0;
  _$jscoverage['/base/create.js'].lineData[372] = 0;
  _$jscoverage['/base/create.js'].lineData[378] = 0;
  _$jscoverage['/base/create.js'].lineData[382] = 0;
  _$jscoverage['/base/create.js'].lineData[389] = 0;
  _$jscoverage['/base/create.js'].lineData[390] = 0;
  _$jscoverage['/base/create.js'].lineData[393] = 0;
  _$jscoverage['/base/create.js'].lineData[394] = 0;
  _$jscoverage['/base/create.js'].lineData[398] = 0;
  _$jscoverage['/base/create.js'].lineData[399] = 0;
  _$jscoverage['/base/create.js'].lineData[400] = 0;
  _$jscoverage['/base/create.js'].lineData[401] = 0;
  _$jscoverage['/base/create.js'].lineData[404] = 0;
  _$jscoverage['/base/create.js'].lineData[412] = 0;
  _$jscoverage['/base/create.js'].lineData[414] = 0;
  _$jscoverage['/base/create.js'].lineData[415] = 0;
  _$jscoverage['/base/create.js'].lineData[416] = 0;
  _$jscoverage['/base/create.js'].lineData[424] = 0;
  _$jscoverage['/base/create.js'].lineData[426] = 0;
  _$jscoverage['/base/create.js'].lineData[427] = 0;
  _$jscoverage['/base/create.js'].lineData[428] = 0;
  _$jscoverage['/base/create.js'].lineData[429] = 0;
  _$jscoverage['/base/create.js'].lineData[432] = 0;
  _$jscoverage['/base/create.js'].lineData[433] = 0;
  _$jscoverage['/base/create.js'].lineData[434] = 0;
  _$jscoverage['/base/create.js'].lineData[436] = 0;
  _$jscoverage['/base/create.js'].lineData[438] = 0;
  _$jscoverage['/base/create.js'].lineData[439] = 0;
  _$jscoverage['/base/create.js'].lineData[442] = 0;
  _$jscoverage['/base/create.js'].lineData[443] = 0;
  _$jscoverage['/base/create.js'].lineData[444] = 0;
  _$jscoverage['/base/create.js'].lineData[446] = 0;
  _$jscoverage['/base/create.js'].lineData[452] = 0;
  _$jscoverage['/base/create.js'].lineData[453] = 0;
  _$jscoverage['/base/create.js'].lineData[457] = 0;
  _$jscoverage['/base/create.js'].lineData[458] = 0;
  _$jscoverage['/base/create.js'].lineData[461] = 0;
  _$jscoverage['/base/create.js'].lineData[464] = 0;
  _$jscoverage['/base/create.js'].lineData[465] = 0;
  _$jscoverage['/base/create.js'].lineData[469] = 0;
  _$jscoverage['/base/create.js'].lineData[471] = 0;
  _$jscoverage['/base/create.js'].lineData[476] = 0;
  _$jscoverage['/base/create.js'].lineData[477] = 0;
  _$jscoverage['/base/create.js'].lineData[478] = 0;
  _$jscoverage['/base/create.js'].lineData[479] = 0;
  _$jscoverage['/base/create.js'].lineData[482] = 0;
  _$jscoverage['/base/create.js'].lineData[483] = 0;
  _$jscoverage['/base/create.js'].lineData[486] = 0;
  _$jscoverage['/base/create.js'].lineData[490] = 0;
  _$jscoverage['/base/create.js'].lineData[491] = 0;
  _$jscoverage['/base/create.js'].lineData[495] = 0;
  _$jscoverage['/base/create.js'].lineData[496] = 0;
  _$jscoverage['/base/create.js'].lineData[497] = 0;
  _$jscoverage['/base/create.js'].lineData[498] = 0;
  _$jscoverage['/base/create.js'].lineData[499] = 0;
  _$jscoverage['/base/create.js'].lineData[500] = 0;
  _$jscoverage['/base/create.js'].lineData[503] = 0;
  _$jscoverage['/base/create.js'].lineData[505] = 0;
  _$jscoverage['/base/create.js'].lineData[509] = 0;
  _$jscoverage['/base/create.js'].lineData[525] = 0;
  _$jscoverage['/base/create.js'].lineData[526] = 0;
  _$jscoverage['/base/create.js'].lineData[527] = 0;
  _$jscoverage['/base/create.js'].lineData[528] = 0;
  _$jscoverage['/base/create.js'].lineData[536] = 0;
  _$jscoverage['/base/create.js'].lineData[537] = 0;
  _$jscoverage['/base/create.js'].lineData[540] = 0;
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
  _$jscoverage['/base/create.js'].functionData[20] = 0;
}
if (! _$jscoverage['/base/create.js'].branchData) {
  _$jscoverage['/base/create.js'].branchData = {};
  _$jscoverage['/base/create.js'].branchData['11'] = [];
  _$jscoverage['/base/create.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['14'] = [];
  _$jscoverage['/base/create.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'] = [];
  _$jscoverage['/base/create.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['22'] = [];
  _$jscoverage['/base/create.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['32'] = [];
  _$jscoverage['/base/create.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['39'] = [];
  _$jscoverage['/base/create.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['42'] = [];
  _$jscoverage['/base/create.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['71'] = [];
  _$jscoverage['/base/create.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['76'] = [];
  _$jscoverage['/base/create.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['78'] = [];
  _$jscoverage['/base/create.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['107'] = [];
  _$jscoverage['/base/create.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['111'] = [];
  _$jscoverage['/base/create.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['116'] = [];
  _$jscoverage['/base/create.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['120'] = [];
  _$jscoverage['/base/create.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['124'] = [];
  _$jscoverage['/base/create.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['131'] = [];
  _$jscoverage['/base/create.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['137'] = [];
  _$jscoverage['/base/create.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['149'] = [];
  _$jscoverage['/base/create.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['153'] = [];
  _$jscoverage['/base/create.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['155'] = [];
  _$jscoverage['/base/create.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['160'] = [];
  _$jscoverage['/base/create.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['160'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['167'] = [];
  _$jscoverage['/base/create.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['170'] = [];
  _$jscoverage['/base/create.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['183'] = [];
  _$jscoverage['/base/create.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['210'] = [];
  _$jscoverage['/base/create.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['214'] = [];
  _$jscoverage['/base/create.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['216'] = [];
  _$jscoverage['/base/create.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['218'] = [];
  _$jscoverage['/base/create.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['232'] = [];
  _$jscoverage['/base/create.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['233'] = [];
  _$jscoverage['/base/create.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['233'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['233'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['236'] = [];
  _$jscoverage['/base/create.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['238'] = [];
  _$jscoverage['/base/create.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['251'] = [];
  _$jscoverage['/base/create.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['275'] = [];
  _$jscoverage['/base/create.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['279'] = [];
  _$jscoverage['/base/create.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['280'] = [];
  _$jscoverage['/base/create.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['280'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['289'] = [];
  _$jscoverage['/base/create.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['290'] = [];
  _$jscoverage['/base/create.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['292'] = [];
  _$jscoverage['/base/create.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['318'] = [];
  _$jscoverage['/base/create.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['320'] = [];
  _$jscoverage['/base/create.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['320'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['324'] = [];
  _$jscoverage['/base/create.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['357'] = [];
  _$jscoverage['/base/create.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['368'] = [];
  _$jscoverage['/base/create.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['382'] = [];
  _$jscoverage['/base/create.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['383'] = [];
  _$jscoverage['/base/create.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['389'] = [];
  _$jscoverage['/base/create.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['389'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['393'] = [];
  _$jscoverage['/base/create.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['398'] = [];
  _$jscoverage['/base/create.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['400'] = [];
  _$jscoverage['/base/create.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['414'] = [];
  _$jscoverage['/base/create.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['428'] = [];
  _$jscoverage['/base/create.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['433'] = [];
  _$jscoverage['/base/create.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['438'] = [];
  _$jscoverage['/base/create.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['443'] = [];
  _$jscoverage['/base/create.js'].branchData['443'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['457'] = [];
  _$jscoverage['/base/create.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['469'] = [];
  _$jscoverage['/base/create.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['477'] = [];
  _$jscoverage['/base/create.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['478'] = [];
  _$jscoverage['/base/create.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['482'] = [];
  _$jscoverage['/base/create.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'] = [];
  _$jscoverage['/base/create.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'][2] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['495'][3] = new BranchData();
  _$jscoverage['/base/create.js'].branchData['499'] = [];
  _$jscoverage['/base/create.js'].branchData['499'][1] = new BranchData();
}
_$jscoverage['/base/create.js'].branchData['499'][1].init(189, 7, 'i < len');
function visit186_499_1(result) {
  _$jscoverage['/base/create.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][3].init(106, 24, 'nodes.push || nodes.item');
function visit185_495_3(result) {
  _$jscoverage['/base/create.js'].branchData['495'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][2].init(106, 37, '(nodes.push || nodes.item) && nodes[0]');
function visit184_495_2(result) {
  _$jscoverage['/base/create.js'].branchData['495'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['495'][1].init(96, 47, 'nodes && (nodes.push || nodes.item) && nodes[0]');
function visit183_495_1(result) {
  _$jscoverage['/base/create.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['482'][1].init(178, 48, 'elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit182_482_1(result) {
  _$jscoverage['/base/create.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['478'][1].init(18, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit181_478_1(result) {
  _$jscoverage['/base/create.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['477'][1].init(14, 22, 'S.isPlainObject(props)');
function visit180_477_1(result) {
  _$jscoverage['/base/create.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['469'][1].init(384, 8, 'DOMEvent');
function visit179_469_1(result) {
  _$jscoverage['/base/create.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['457'][2].init(102, 38, 'dest.nodeType == NodeType.ELEMENT_NODE');
function visit178_457_2(result) {
  _$jscoverage['/base/create.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['457'][1].init(102, 59, 'dest.nodeType == NodeType.ELEMENT_NODE && !Dom.hasData(src)');
function visit177_457_1(result) {
  _$jscoverage['/base/create.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['443'][1].init(22, 21, 'cloneChildren[cIndex]');
function visit176_443_1(result) {
  _$jscoverage['/base/create.js'].branchData['443'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['438'][1].init(446, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit175_438_1(result) {
  _$jscoverage['/base/create.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['433'][1].init(22, 15, 'cloneCs[fIndex]');
function visit174_433_1(result) {
  _$jscoverage['/base/create.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['428'][1].init(57, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit173_428_1(result) {
  _$jscoverage['/base/create.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['414'][1].init(119, 6, 'i >= 0');
function visit172_414_1(result) {
  _$jscoverage['/base/create.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['400'][1].init(83, 28, 'deep && deepWithDataAndEvent');
function visit171_400_1(result) {
  _$jscoverage['/base/create.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['398'][1].init(1778, 16, 'withDataAndEvent');
function visit170_398_1(result) {
  _$jscoverage['/base/create.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['393'][1].init(584, 27, 'deep && _fixCloneAttributes');
function visit169_393_1(result) {
  _$jscoverage['/base/create.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['389'][2].init(434, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit168_389_2(result) {
  _$jscoverage['/base/create.js'].branchData['389'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['389'][1].init(411, 60, '_fixCloneAttributes && elemNodeType == NodeType.ELEMENT_NODE');
function visit167_389_1(result) {
  _$jscoverage['/base/create.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['383'][1].init(61, 47, 'elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit166_383_1(result) {
  _$jscoverage['/base/create.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['382'][2].init(882, 37, 'elemNodeType == NodeType.ELEMENT_NODE');
function visit165_382_2(result) {
  _$jscoverage['/base/create.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['382'][1].init(882, 109, 'elemNodeType == NodeType.ELEMENT_NODE || elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit164_382_1(result) {
  _$jscoverage['/base/create.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['368'][1].init(454, 5, '!elem');
function visit163_368_1(result) {
  _$jscoverage['/base/create.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['357'][1].init(22, 24, 'typeof deep === \'object\'');
function visit162_357_1(result) {
  _$jscoverage['/base/create.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['324'][1].init(190, 8, 'DOMEvent');
function visit161_324_1(result) {
  _$jscoverage['/base/create.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['320'][2].init(73, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit160_320_2(result) {
  _$jscoverage['/base/create.js'].branchData['320'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['320'][1].init(60, 49, '!keepData && el.nodeType == NodeType.ELEMENT_NODE');
function visit159_320_1(result) {
  _$jscoverage['/base/create.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['318'][1].init(222, 6, 'i >= 0');
function visit158_318_1(result) {
  _$jscoverage['/base/create.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['292'][1].init(76, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit157_292_1(result) {
  _$jscoverage['/base/create.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['290'][1].init(47, 6, 'i >= 0');
function visit156_290_1(result) {
  _$jscoverage['/base/create.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['289'][1].init(65, 64, '!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML');
function visit155_289_1(result) {
  _$jscoverage['/base/create.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['280'][2].init(46, 41, 'el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit154_280_2(result) {
  _$jscoverage['/base/create.js'].branchData['280'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['280'][1].init(26, 61, 'supportOuterHTML && el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE');
function visit153_280_1(result) {
  _$jscoverage['/base/create.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['279'][1].init(337, 24, 'htmlString === undefined');
function visit152_279_1(result) {
  _$jscoverage['/base/create.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['275'][1].init(229, 3, '!el');
function visit151_275_1(result) {
  _$jscoverage['/base/create.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['251'][1].init(1109, 8, '!success');
function visit150_251_1(result) {
  _$jscoverage['/base/create.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['238'][1].init(86, 38, 'elem.nodeType == NodeType.ELEMENT_NODE');
function visit149_238_1(result) {
  _$jscoverage['/base/create.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['236'][1].init(55, 6, 'i >= 0');
function visit148_236_1(result) {
  _$jscoverage['/base/create.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['233'][3].init(347, 36, 'htmlString.match(RE_TAG) || [\'\', \'\']');
function visit147_233_3(result) {
  _$jscoverage['/base/create.js'].branchData['233'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['233'][2].init(258, 69, '!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)');
function visit146_233_2(result) {
  _$jscoverage['/base/create.js'].branchData['233'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['233'][1].init(73, 145, '(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit145_233_1(result) {
  _$jscoverage['/base/create.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['232'][1].init(182, 219, '!htmlString.match(/<(?:script|style|link)/i) && (!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[(htmlString.match(RE_TAG) || [\'\', \'\'])[1].toLowerCase()]');
function visit144_232_1(result) {
  _$jscoverage['/base/create.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['218'][1].init(215, 46, 'el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE');
function visit143_218_1(result) {
  _$jscoverage['/base/create.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['216'][1].init(96, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit142_216_1(result) {
  _$jscoverage['/base/create.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['214'][1].init(366, 24, 'htmlString === undefined');
function visit141_214_1(result) {
  _$jscoverage['/base/create.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['210'][1].init(258, 3, '!el');
function visit140_210_1(result) {
  _$jscoverage['/base/create.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['183'][1].init(97, 32, 'Dom.nodeName(src) === \'textarea\'');
function visit139_183_1(result) {
  _$jscoverage['/base/create.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['170'][1].init(1249, 12, 'nodes.length');
function visit138_170_1(result) {
  _$jscoverage['/base/create.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['167'][1].init(1030, 18, 'nodes.length === 1');
function visit137_167_1(result) {
  _$jscoverage['/base/create.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['160'][2].init(744, 93, '/\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit136_160_2(result) {
  _$jscoverage['/base/create.js'].branchData['160'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['160'][1].init(715, 122, 'lostLeadingTailWhitespace && /\\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))');
function visit135_160_1(result) {
  _$jscoverage['/base/create.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['155'][1].init(419, 106, 'lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE))');
function visit134_155_1(result) {
  _$jscoverage['/base/create.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['153'][1].init(309, 31, 'creators[tag] || defaultCreator');
function visit133_153_1(result) {
  _$jscoverage['/base/create.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['149'][1].init(165, 36, '(m = RE_TAG.exec(html)) && (k = m[1])');
function visit132_149_1(result) {
  _$jscoverage['/base/create.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['137'][1].init(814, 18, '!R_HTML.test(html)');
function visit131_137_1(result) {
  _$jscoverage['/base/create.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['131'][1].init(127, 15, 'ownerDoc || doc');
function visit130_131_1(result) {
  _$jscoverage['/base/create.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['124'][1].init(449, 5, '_trim');
function visit129_124_1(result) {
  _$jscoverage['/base/create.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['120'][1].init(349, 19, '_trim === undefined');
function visit128_120_1(result) {
  _$jscoverage['/base/create.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['116'][1].init(247, 23, 'typeof html != \'string\'');
function visit127_116_1(result) {
  _$jscoverage['/base/create.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['111'][1].init(141, 13, 'html.nodeType');
function visit126_111_1(result) {
  _$jscoverage['/base/create.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['107'][1].init(57, 5, '!html');
function visit125_107_1(result) {
  _$jscoverage['/base/create.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['78'][1].init(137, 15, 'node.firstChild');
function visit124_78_1(result) {
  _$jscoverage['/base/create.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['76'][2].init(521, 46, 'parent.canHaveChildren && "removeNode" in node');
function visit123_76_2(result) {
  _$jscoverage['/base/create.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['76'][1].init(512, 55, 'oldIE && parent.canHaveChildren && "removeNode" in node');
function visit122_76_1(result) {
  _$jscoverage['/base/create.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['71'][1].init(14, 6, 'parent');
function visit121_71_1(result) {
  _$jscoverage['/base/create.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['42'][1].init(135, 22, 'holder === DEFAULT_DIV');
function visit120_42_1(result) {
  _$jscoverage['/base/create.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['39'][2].init(35, 15, 'ownerDoc != doc');
function visit119_39_2(result) {
  _$jscoverage['/base/create.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['39'][1].init(23, 27, 'ownerDoc && ownerDoc != doc');
function visit118_39_1(result) {
  _$jscoverage['/base/create.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['32'][1].init(62, 8, 'DOMEvent');
function visit117_32_1(result) {
  _$jscoverage['/base/create.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['22'][1].init(630, 41, 'doc && \'outerHTML\' in doc.documentElement');
function visit116_22_1(result) {
  _$jscoverage['/base/create.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][2].init(518, 6, 'ie < 9');
function visit115_19_2(result) {
  _$jscoverage['/base/create.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['19'][1].init(512, 12, 'ie && ie < 9');
function visit114_19_1(result) {
  _$jscoverage['/base/create.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['14'][1].init(255, 29, 'doc && doc.createElement(DIV)');
function visit113_14_1(result) {
  _$jscoverage['/base/create.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].branchData['11'][1].init(138, 33, 'document.documentMode || UA[\'ie\']');
function visit112_11_1(result) {
  _$jscoverage['/base/create.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/create.js'].lineData[6]++;
KISSY.add('dom/base/create', function(S, Dom, undefined) {
  _$jscoverage['/base/create.js'].functionData[0]++;
  _$jscoverage['/base/create.js'].lineData[7]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, UA = S.UA, logger = S.getLogger('s/dom'), ie = visit112_11_1(document.documentMode || UA['ie']), DIV = 'div', PARENT_NODE = 'parentNode', DEFAULT_DIV = visit113_14_1(doc && doc.createElement(DIV)), R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig, RE_TAG = /<([\w:]+)/, R_LEADING_WHITESPACE = /^\s+/, R_TAIL_WHITESPACE = /\s+$/, oldIE = !!(visit114_19_1(ie && visit115_19_2(ie < 9))), lostLeadingTailWhitespace = oldIE, R_HTML = /<|&#?\w+;/, supportOuterHTML = visit116_22_1(doc && 'outerHTML' in doc.documentElement), RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
  _$jscoverage['/base/create.js'].lineData[26]++;
  function getElementsByTagName(el, tag) {
    _$jscoverage['/base/create.js'].functionData[1]++;
    _$jscoverage['/base/create.js'].lineData[27]++;
    return el.getElementsByTagName(tag);
  }
  _$jscoverage['/base/create.js'].lineData[30]++;
  function cleanData(els) {
    _$jscoverage['/base/create.js'].functionData[2]++;
    _$jscoverage['/base/create.js'].lineData[31]++;
    var DOMEvent = S.require('event/dom');
    _$jscoverage['/base/create.js'].lineData[32]++;
    if (visit117_32_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[33]++;
      DOMEvent.detach(els);
    }
    _$jscoverage['/base/create.js'].lineData[35]++;
    Dom.removeData(els);
  }
  _$jscoverage['/base/create.js'].lineData[38]++;
  function getHolderDiv(ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[3]++;
    _$jscoverage['/base/create.js'].lineData[39]++;
    var holder = visit118_39_1(ownerDoc && visit119_39_2(ownerDoc != doc)) ? ownerDoc.createElement(DIV) : DEFAULT_DIV;
    _$jscoverage['/base/create.js'].lineData[42]++;
    if (visit120_42_1(holder === DEFAULT_DIV)) {
      _$jscoverage['/base/create.js'].lineData[43]++;
      holder.innerHTML = '';
    }
    _$jscoverage['/base/create.js'].lineData[45]++;
    return holder;
  }
  _$jscoverage['/base/create.js'].lineData[48]++;
  function defaultCreator(html, ownerDoc) {
    _$jscoverage['/base/create.js'].functionData[4]++;
    _$jscoverage['/base/create.js'].lineData[49]++;
    var frag = getHolderDiv(ownerDoc);
    _$jscoverage['/base/create.js'].lineData[51]++;
    frag.innerHTML = 'm<div>' + html + '<' + '/div>';
    _$jscoverage['/base/create.js'].lineData[52]++;
    return frag.lastChild;
  }
  _$jscoverage['/base/create.js'].lineData[55]++;
  function _empty(node) {
    _$jscoverage['/base/create.js'].functionData[5]++;
    _$jscoverage['/base/create.js'].lineData[56]++;
    try {
      _$jscoverage['/base/create.js'].lineData[58]++;
      node.innerHTML = "";
      _$jscoverage['/base/create.js'].lineData[59]++;
      return;
    }    catch (e) {
}
    _$jscoverage['/base/create.js'].lineData[65]++;
    for (var c; c = node.lastChild; ) {
      _$jscoverage['/base/create.js'].lineData[66]++;
      _destroy(c, node);
    }
  }
  _$jscoverage['/base/create.js'].lineData[70]++;
  function _destroy(node, parent) {
    _$jscoverage['/base/create.js'].functionData[6]++;
    _$jscoverage['/base/create.js'].lineData[71]++;
    if (visit121_71_1(parent)) {
      _$jscoverage['/base/create.js'].lineData[76]++;
      if (visit122_76_1(oldIE && visit123_76_2(parent.canHaveChildren && "removeNode" in node))) {
        _$jscoverage['/base/create.js'].lineData[78]++;
        if (visit124_78_1(node.firstChild)) {
          _$jscoverage['/base/create.js'].lineData[79]++;
          _empty(node);
        }
        _$jscoverage['/base/create.js'].lineData[81]++;
        node.removeNode(false);
      } else {
        _$jscoverage['/base/create.js'].lineData[83]++;
        parent.removeChild(node);
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[88]++;
  S.mix(Dom, {
  create: function(html, props, ownerDoc, _trim) {
  _$jscoverage['/base/create.js'].functionData[7]++;
  _$jscoverage['/base/create.js'].lineData[105]++;
  var ret = null;
  _$jscoverage['/base/create.js'].lineData[107]++;
  if (visit125_107_1(!html)) {
    _$jscoverage['/base/create.js'].lineData[108]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[111]++;
  if (visit126_111_1(html.nodeType)) {
    _$jscoverage['/base/create.js'].lineData[112]++;
    return Dom.clone(html);
  }
  _$jscoverage['/base/create.js'].lineData[116]++;
  if (visit127_116_1(typeof html != 'string')) {
    _$jscoverage['/base/create.js'].lineData[117]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[120]++;
  if (visit128_120_1(_trim === undefined)) {
    _$jscoverage['/base/create.js'].lineData[121]++;
    _trim = true;
  }
  _$jscoverage['/base/create.js'].lineData[124]++;
  if (visit129_124_1(_trim)) {
    _$jscoverage['/base/create.js'].lineData[125]++;
    html = S.trim(html);
  }
  _$jscoverage['/base/create.js'].lineData[128]++;
  var creators = Dom._creators, holder, whitespaceMatch, context = visit130_131_1(ownerDoc || doc), m, tag = DIV, k, nodes;
  _$jscoverage['/base/create.js'].lineData[137]++;
  if (visit131_137_1(!R_HTML.test(html))) {
    _$jscoverage['/base/create.js'].lineData[138]++;
    ret = context.createTextNode(html);
  } else {
    _$jscoverage['/base/create.js'].lineData[141]++;
    if ((m = RE_SIMPLE_TAG.exec(html))) {
      _$jscoverage['/base/create.js'].lineData[142]++;
      ret = context.createElement(m[1]);
    } else {
      _$jscoverage['/base/create.js'].lineData[147]++;
      html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');
      _$jscoverage['/base/create.js'].lineData[149]++;
      if (visit132_149_1((m = RE_TAG.exec(html)) && (k = m[1]))) {
        _$jscoverage['/base/create.js'].lineData[150]++;
        tag = k.toLowerCase();
      }
      _$jscoverage['/base/create.js'].lineData[153]++;
      holder = (visit133_153_1(creators[tag] || defaultCreator))(html, context);
      _$jscoverage['/base/create.js'].lineData[155]++;
      if (visit134_155_1(lostLeadingTailWhitespace && (whitespaceMatch = html.match(R_LEADING_WHITESPACE)))) {
        _$jscoverage['/base/create.js'].lineData[157]++;
        holder.insertBefore(context.createTextNode(whitespaceMatch[0]), holder.firstChild);
      }
      _$jscoverage['/base/create.js'].lineData[160]++;
      if (visit135_160_1(lostLeadingTailWhitespace && visit136_160_2(/\S/.test(html) && (whitespaceMatch = html.match(R_TAIL_WHITESPACE))))) {
        _$jscoverage['/base/create.js'].lineData[162]++;
        holder.appendChild(context.createTextNode(whitespaceMatch[0]));
      }
      _$jscoverage['/base/create.js'].lineData[165]++;
      nodes = holder.childNodes;
      _$jscoverage['/base/create.js'].lineData[167]++;
      if (visit137_167_1(nodes.length === 1)) {
        _$jscoverage['/base/create.js'].lineData[169]++;
        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
      } else {
        _$jscoverage['/base/create.js'].lineData[170]++;
        if (visit138_170_1(nodes.length)) {
          _$jscoverage['/base/create.js'].lineData[172]++;
          ret = nodeListToFragment(nodes);
        } else {
          _$jscoverage['/base/create.js'].lineData[174]++;
          S.error(html + ' : create node error');
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[178]++;
  return attachProps(ret, props);
}, 
  _fixCloneAttributes: function(src, dest) {
  _$jscoverage['/base/create.js'].functionData[8]++;
  _$jscoverage['/base/create.js'].lineData[183]++;
  if (visit139_183_1(Dom.nodeName(src) === 'textarea')) {
    _$jscoverage['/base/create.js'].lineData[184]++;
    dest.defaultValue = src.defaultValue;
    _$jscoverage['/base/create.js'].lineData[185]++;
    dest.value = src.value;
  }
}, 
  _creators: {
  div: defaultCreator}, 
  _defaultCreator: defaultCreator, 
  html: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[9]++;
  _$jscoverage['/base/create.js'].lineData[205]++;
  var els = Dom.query(selector), el = els[0], success = false, valNode, i, elem;
  _$jscoverage['/base/create.js'].lineData[210]++;
  if (visit140_210_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[211]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[214]++;
  if (visit141_214_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[216]++;
    if (visit142_216_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[217]++;
      return el.innerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[218]++;
      if (visit143_218_1(el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[219]++;
        var holder = getHolderDiv(el.ownerDocument);
        _$jscoverage['/base/create.js'].lineData[220]++;
        holder.appendChild(el);
        _$jscoverage['/base/create.js'].lineData[221]++;
        return holder.innerHTML;
      } else {
        _$jscoverage['/base/create.js'].lineData[223]++;
        return null;
      }
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[228]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[232]++;
    if (visit144_232_1(!htmlString.match(/<(?:script|style|link)/i) && visit145_233_1((visit146_233_2(!lostLeadingTailWhitespace || !htmlString.match(R_LEADING_WHITESPACE))) && !creatorsMap[(visit147_233_3(htmlString.match(RE_TAG) || ['', '']))[1].toLowerCase()]))) {
      _$jscoverage['/base/create.js'].lineData[235]++;
      try {
        _$jscoverage['/base/create.js'].lineData[236]++;
        for (i = els.length - 1; visit148_236_1(i >= 0); i--) {
          _$jscoverage['/base/create.js'].lineData[237]++;
          elem = els[i];
          _$jscoverage['/base/create.js'].lineData[238]++;
          if (visit149_238_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
            _$jscoverage['/base/create.js'].lineData[239]++;
            cleanData(getElementsByTagName(elem, '*'));
            _$jscoverage['/base/create.js'].lineData[240]++;
            elem.innerHTML = htmlString;
          }
        }
        _$jscoverage['/base/create.js'].lineData[243]++;
        success = true;
      }      catch (e) {
}
    }
    _$jscoverage['/base/create.js'].lineData[251]++;
    if (visit150_251_1(!success)) {
      _$jscoverage['/base/create.js'].lineData[252]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[253]++;
      Dom.empty(els);
      _$jscoverage['/base/create.js'].lineData[254]++;
      Dom.append(valNode, els, loadScripts);
    }
  }
  _$jscoverage['/base/create.js'].lineData[257]++;
  return undefined;
}, 
  outerHtml: function(selector, htmlString, loadScripts) {
  _$jscoverage['/base/create.js'].functionData[10]++;
  _$jscoverage['/base/create.js'].lineData[269]++;
  var els = Dom.query(selector), holder, i, valNode, length = els.length, el = els[0];
  _$jscoverage['/base/create.js'].lineData[275]++;
  if (visit151_275_1(!el)) {
    _$jscoverage['/base/create.js'].lineData[276]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[279]++;
  if (visit152_279_1(htmlString === undefined)) {
    _$jscoverage['/base/create.js'].lineData[280]++;
    if (visit153_280_1(supportOuterHTML && visit154_280_2(el.nodeType != Dom.DOCUMENT_FRAGMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[281]++;
      return el.outerHTML;
    } else {
      _$jscoverage['/base/create.js'].lineData[283]++;
      holder = getHolderDiv(el.ownerDocument);
      _$jscoverage['/base/create.js'].lineData[284]++;
      holder.appendChild(Dom.clone(el, true));
      _$jscoverage['/base/create.js'].lineData[285]++;
      return holder.innerHTML;
    }
  } else {
    _$jscoverage['/base/create.js'].lineData[288]++;
    htmlString += '';
    _$jscoverage['/base/create.js'].lineData[289]++;
    if (visit155_289_1(!htmlString.match(/<(?:script|style|link)/i) && supportOuterHTML)) {
      _$jscoverage['/base/create.js'].lineData[290]++;
      for (i = length - 1; visit156_290_1(i >= 0); i--) {
        _$jscoverage['/base/create.js'].lineData[291]++;
        el = els[i];
        _$jscoverage['/base/create.js'].lineData[292]++;
        if (visit157_292_1(el.nodeType == NodeType.ELEMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[293]++;
          cleanData(el);
          _$jscoverage['/base/create.js'].lineData[294]++;
          cleanData(getElementsByTagName(el, '*'));
          _$jscoverage['/base/create.js'].lineData[295]++;
          el.outerHTML = htmlString;
        }
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[299]++;
      valNode = Dom.create(htmlString, 0, el.ownerDocument, 0);
      _$jscoverage['/base/create.js'].lineData[300]++;
      Dom.insertBefore(valNode, els, loadScripts);
      _$jscoverage['/base/create.js'].lineData[301]++;
      Dom.remove(els);
    }
  }
  _$jscoverage['/base/create.js'].lineData[304]++;
  return undefined;
}, 
  remove: function(selector, keepData) {
  _$jscoverage['/base/create.js'].functionData[11]++;
  _$jscoverage['/base/create.js'].lineData[313]++;
  var el, els = Dom.query(selector), all, DOMEvent = S.require('event/dom'), i;
  _$jscoverage['/base/create.js'].lineData[318]++;
  for (i = els.length - 1; visit158_318_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[319]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[320]++;
    if (visit159_320_1(!keepData && visit160_320_2(el.nodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[321]++;
      all = S.makeArray(getElementsByTagName(el, '*'));
      _$jscoverage['/base/create.js'].lineData[322]++;
      all.push(el);
      _$jscoverage['/base/create.js'].lineData[323]++;
      Dom.removeData(all);
      _$jscoverage['/base/create.js'].lineData[324]++;
      if (visit161_324_1(DOMEvent)) {
        _$jscoverage['/base/create.js'].lineData[325]++;
        DOMEvent.detach(all);
      }
    }
    _$jscoverage['/base/create.js'].lineData[333]++;
    _destroy(el, el.parentNode);
  }
}, 
  clone: function(selector, deep, withDataAndEvent, deepWithDataAndEvent) {
  _$jscoverage['/base/create.js'].functionData[12]++;
  _$jscoverage['/base/create.js'].lineData[357]++;
  if (visit162_357_1(typeof deep === 'object')) {
    _$jscoverage['/base/create.js'].lineData[358]++;
    deepWithDataAndEvent = deep['deepWithDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[359]++;
    withDataAndEvent = deep['withDataAndEvent'];
    _$jscoverage['/base/create.js'].lineData[360]++;
    deep = deep['deep'];
  }
  _$jscoverage['/base/create.js'].lineData[363]++;
  var elem = Dom.get(selector), clone, _fixCloneAttributes = Dom._fixCloneAttributes, elemNodeType;
  _$jscoverage['/base/create.js'].lineData[368]++;
  if (visit163_368_1(!elem)) {
    _$jscoverage['/base/create.js'].lineData[369]++;
    return null;
  }
  _$jscoverage['/base/create.js'].lineData[372]++;
  elemNodeType = elem.nodeType;
  _$jscoverage['/base/create.js'].lineData[378]++;
  clone = elem.cloneNode(deep);
  _$jscoverage['/base/create.js'].lineData[382]++;
  if (visit164_382_1(visit165_382_2(elemNodeType == NodeType.ELEMENT_NODE) || visit166_383_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE))) {
    _$jscoverage['/base/create.js'].lineData[389]++;
    if (visit167_389_1(_fixCloneAttributes && visit168_389_2(elemNodeType == NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/create.js'].lineData[390]++;
      _fixCloneAttributes(elem, clone);
    }
    _$jscoverage['/base/create.js'].lineData[393]++;
    if (visit169_393_1(deep && _fixCloneAttributes)) {
      _$jscoverage['/base/create.js'].lineData[394]++;
      processAll(_fixCloneAttributes, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[398]++;
  if (visit170_398_1(withDataAndEvent)) {
    _$jscoverage['/base/create.js'].lineData[399]++;
    cloneWithDataAndEvent(elem, clone);
    _$jscoverage['/base/create.js'].lineData[400]++;
    if (visit171_400_1(deep && deepWithDataAndEvent)) {
      _$jscoverage['/base/create.js'].lineData[401]++;
      processAll(cloneWithDataAndEvent, elem, clone);
    }
  }
  _$jscoverage['/base/create.js'].lineData[404]++;
  return clone;
}, 
  empty: function(selector) {
  _$jscoverage['/base/create.js'].functionData[13]++;
  _$jscoverage['/base/create.js'].lineData[412]++;
  var els = Dom.query(selector), el, i;
  _$jscoverage['/base/create.js'].lineData[414]++;
  for (i = els.length - 1; visit172_414_1(i >= 0); i--) {
    _$jscoverage['/base/create.js'].lineData[415]++;
    el = els[i];
    _$jscoverage['/base/create.js'].lineData[416]++;
    Dom.remove(el.childNodes);
  }
}, 
  _nodeListToFragment: nodeListToFragment});
  _$jscoverage['/base/create.js'].lineData[424]++;
  Dom.outerHTML = Dom.outerHtml;
  _$jscoverage['/base/create.js'].lineData[426]++;
  function processAll(fn, elem, clone) {
    _$jscoverage['/base/create.js'].functionData[14]++;
    _$jscoverage['/base/create.js'].lineData[427]++;
    var elemNodeType = elem.nodeType;
    _$jscoverage['/base/create.js'].lineData[428]++;
    if (visit173_428_1(elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
      _$jscoverage['/base/create.js'].lineData[429]++;
      var eCs = elem.childNodes, cloneCs = clone.childNodes, fIndex = 0;
      _$jscoverage['/base/create.js'].lineData[432]++;
      while (eCs[fIndex]) {
        _$jscoverage['/base/create.js'].lineData[433]++;
        if (visit174_433_1(cloneCs[fIndex])) {
          _$jscoverage['/base/create.js'].lineData[434]++;
          processAll(fn, eCs[fIndex], cloneCs[fIndex]);
        }
        _$jscoverage['/base/create.js'].lineData[436]++;
        fIndex++;
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[438]++;
      if (visit175_438_1(elemNodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[439]++;
        var elemChildren = getElementsByTagName(elem, '*'), cloneChildren = getElementsByTagName(clone, '*'), cIndex = 0;
        _$jscoverage['/base/create.js'].lineData[442]++;
        while (elemChildren[cIndex]) {
          _$jscoverage['/base/create.js'].lineData[443]++;
          if (visit176_443_1(cloneChildren[cIndex])) {
            _$jscoverage['/base/create.js'].lineData[444]++;
            fn(elemChildren[cIndex], cloneChildren[cIndex]);
          }
          _$jscoverage['/base/create.js'].lineData[446]++;
          cIndex++;
        }
      }
    }
  }
  _$jscoverage['/base/create.js'].lineData[452]++;
  function cloneWithDataAndEvent(src, dest) {
    _$jscoverage['/base/create.js'].functionData[15]++;
    _$jscoverage['/base/create.js'].lineData[453]++;
    var DOMEvent = S.require('event/dom'), srcData, d;
    _$jscoverage['/base/create.js'].lineData[457]++;
    if (visit177_457_1(visit178_457_2(dest.nodeType == NodeType.ELEMENT_NODE) && !Dom.hasData(src))) {
      _$jscoverage['/base/create.js'].lineData[458]++;
      return;
    }
    _$jscoverage['/base/create.js'].lineData[461]++;
    srcData = Dom.data(src);
    _$jscoverage['/base/create.js'].lineData[464]++;
    for (d in srcData) {
      _$jscoverage['/base/create.js'].lineData[465]++;
      Dom.data(dest, d, srcData[d]);
    }
    _$jscoverage['/base/create.js'].lineData[469]++;
    if (visit179_469_1(DOMEvent)) {
      _$jscoverage['/base/create.js'].lineData[471]++;
      DOMEvent.clone(src, dest);
    }
  }
  _$jscoverage['/base/create.js'].lineData[476]++;
  function attachProps(elem, props) {
    _$jscoverage['/base/create.js'].functionData[16]++;
    _$jscoverage['/base/create.js'].lineData[477]++;
    if (visit180_477_1(S.isPlainObject(props))) {
      _$jscoverage['/base/create.js'].lineData[478]++;
      if (visit181_478_1(elem.nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/create.js'].lineData[479]++;
        Dom.attr(elem, props, true);
      } else {
        _$jscoverage['/base/create.js'].lineData[482]++;
        if (visit182_482_1(elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE)) {
          _$jscoverage['/base/create.js'].lineData[483]++;
          Dom.attr(elem.childNodes, props, true);
        }
      }
    }
    _$jscoverage['/base/create.js'].lineData[486]++;
    return elem;
  }
  _$jscoverage['/base/create.js'].lineData[490]++;
  function nodeListToFragment(nodes) {
    _$jscoverage['/base/create.js'].functionData[17]++;
    _$jscoverage['/base/create.js'].lineData[491]++;
    var ret = null, i, ownerDoc, len;
    _$jscoverage['/base/create.js'].lineData[495]++;
    if (visit183_495_1(nodes && visit184_495_2((visit185_495_3(nodes.push || nodes.item)) && nodes[0]))) {
      _$jscoverage['/base/create.js'].lineData[496]++;
      ownerDoc = nodes[0].ownerDocument;
      _$jscoverage['/base/create.js'].lineData[497]++;
      ret = ownerDoc.createDocumentFragment();
      _$jscoverage['/base/create.js'].lineData[498]++;
      nodes = S.makeArray(nodes);
      _$jscoverage['/base/create.js'].lineData[499]++;
      for (i = 0 , len = nodes.length; visit186_499_1(i < len); i++) {
        _$jscoverage['/base/create.js'].lineData[500]++;
        ret.appendChild(nodes[i]);
      }
    } else {
      _$jscoverage['/base/create.js'].lineData[503]++;
      logger.error('Unable to convert ' + nodes + ' to fragment.');
    }
    _$jscoverage['/base/create.js'].lineData[505]++;
    return ret;
  }
  _$jscoverage['/base/create.js'].lineData[509]++;
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
  _$jscoverage['/base/create.js'].lineData[525]++;
  for (p in creatorsMap) {
    _$jscoverage['/base/create.js'].lineData[526]++;
    (function(tag) {
  _$jscoverage['/base/create.js'].functionData[18]++;
  _$jscoverage['/base/create.js'].lineData[527]++;
  creators[p] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[19]++;
  _$jscoverage['/base/create.js'].lineData[528]++;
  return create('<' + tag + '>' + html + '<' + '/' + tag + '>', undefined, ownerDoc);
};
})(creatorsMap[p]);
  }
  _$jscoverage['/base/create.js'].lineData[536]++;
  creatorsMap['option'] = creatorsMap['optgroup'] = function(html, ownerDoc) {
  _$jscoverage['/base/create.js'].functionData[20]++;
  _$jscoverage['/base/create.js'].lineData[537]++;
  return create('<select multiple="multiple">' + html + '</select>', undefined, ownerDoc);
};
  _$jscoverage['/base/create.js'].lineData[540]++;
  return Dom;
}, {
  requires: ['./api']});
