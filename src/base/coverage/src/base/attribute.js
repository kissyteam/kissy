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
if (! _$jscoverage['/base/attribute.js']) {
  _$jscoverage['/base/attribute.js'] = {};
  _$jscoverage['/base/attribute.js'].lineData = [];
  _$jscoverage['/base/attribute.js'].lineData[6] = 0;
  _$jscoverage['/base/attribute.js'].lineData[8] = 0;
  _$jscoverage['/base/attribute.js'].lineData[10] = 0;
  _$jscoverage['/base/attribute.js'].lineData[12] = 0;
  _$jscoverage['/base/attribute.js'].lineData[13] = 0;
  _$jscoverage['/base/attribute.js'].lineData[14] = 0;
  _$jscoverage['/base/attribute.js'].lineData[16] = 0;
  _$jscoverage['/base/attribute.js'].lineData[19] = 0;
  _$jscoverage['/base/attribute.js'].lineData[20] = 0;
  _$jscoverage['/base/attribute.js'].lineData[24] = 0;
  _$jscoverage['/base/attribute.js'].lineData[25] = 0;
  _$jscoverage['/base/attribute.js'].lineData[26] = 0;
  _$jscoverage['/base/attribute.js'].lineData[34] = 0;
  _$jscoverage['/base/attribute.js'].lineData[35] = 0;
  _$jscoverage['/base/attribute.js'].lineData[36] = 0;
  _$jscoverage['/base/attribute.js'].lineData[37] = 0;
  _$jscoverage['/base/attribute.js'].lineData[39] = 0;
  _$jscoverage['/base/attribute.js'].lineData[45] = 0;
  _$jscoverage['/base/attribute.js'].lineData[46] = 0;
  _$jscoverage['/base/attribute.js'].lineData[49] = 0;
  _$jscoverage['/base/attribute.js'].lineData[51] = 0;
  _$jscoverage['/base/attribute.js'].lineData[57] = 0;
  _$jscoverage['/base/attribute.js'].lineData[58] = 0;
  _$jscoverage['/base/attribute.js'].lineData[60] = 0;
  _$jscoverage['/base/attribute.js'].lineData[61] = 0;
  _$jscoverage['/base/attribute.js'].lineData[62] = 0;
  _$jscoverage['/base/attribute.js'].lineData[64] = 0;
  _$jscoverage['/base/attribute.js'].lineData[65] = 0;
  _$jscoverage['/base/attribute.js'].lineData[67] = 0;
  _$jscoverage['/base/attribute.js'].lineData[70] = 0;
  _$jscoverage['/base/attribute.js'].lineData[73] = 0;
  _$jscoverage['/base/attribute.js'].lineData[74] = 0;
  _$jscoverage['/base/attribute.js'].lineData[76] = 0;
  _$jscoverage['/base/attribute.js'].lineData[77] = 0;
  _$jscoverage['/base/attribute.js'].lineData[78] = 0;
  _$jscoverage['/base/attribute.js'].lineData[81] = 0;
  _$jscoverage['/base/attribute.js'].lineData[87] = 0;
  _$jscoverage['/base/attribute.js'].lineData[88] = 0;
  _$jscoverage['/base/attribute.js'].lineData[89] = 0;
  _$jscoverage['/base/attribute.js'].lineData[90] = 0;
  _$jscoverage['/base/attribute.js'].lineData[91] = 0;
  _$jscoverage['/base/attribute.js'].lineData[93] = 0;
  _$jscoverage['/base/attribute.js'].lineData[95] = 0;
  _$jscoverage['/base/attribute.js'].lineData[97] = 0;
  _$jscoverage['/base/attribute.js'].lineData[100] = 0;
  _$jscoverage['/base/attribute.js'].lineData[101] = 0;
  _$jscoverage['/base/attribute.js'].lineData[102] = 0;
  _$jscoverage['/base/attribute.js'].lineData[103] = 0;
  _$jscoverage['/base/attribute.js'].lineData[105] = 0;
  _$jscoverage['/base/attribute.js'].lineData[106] = 0;
  _$jscoverage['/base/attribute.js'].lineData[107] = 0;
  _$jscoverage['/base/attribute.js'].lineData[112] = 0;
  _$jscoverage['/base/attribute.js'].lineData[113] = 0;
  _$jscoverage['/base/attribute.js'].lineData[119] = 0;
  _$jscoverage['/base/attribute.js'].lineData[120] = 0;
  _$jscoverage['/base/attribute.js'].lineData[121] = 0;
  _$jscoverage['/base/attribute.js'].lineData[123] = 0;
  _$jscoverage['/base/attribute.js'].lineData[125] = 0;
  _$jscoverage['/base/attribute.js'].lineData[126] = 0;
  _$jscoverage['/base/attribute.js'].lineData[131] = 0;
  _$jscoverage['/base/attribute.js'].lineData[132] = 0;
  _$jscoverage['/base/attribute.js'].lineData[133] = 0;
  _$jscoverage['/base/attribute.js'].lineData[134] = 0;
  _$jscoverage['/base/attribute.js'].lineData[135] = 0;
  _$jscoverage['/base/attribute.js'].lineData[139] = 0;
  _$jscoverage['/base/attribute.js'].lineData[141] = 0;
  _$jscoverage['/base/attribute.js'].lineData[152] = 0;
  _$jscoverage['/base/attribute.js'].lineData[153] = 0;
  _$jscoverage['/base/attribute.js'].lineData[154] = 0;
  _$jscoverage['/base/attribute.js'].lineData[157] = 0;
  _$jscoverage['/base/attribute.js'].lineData[158] = 0;
  _$jscoverage['/base/attribute.js'].lineData[162] = 0;
  _$jscoverage['/base/attribute.js'].lineData[165] = 0;
  _$jscoverage['/base/attribute.js'].lineData[167] = 0;
  _$jscoverage['/base/attribute.js'].lineData[168] = 0;
  _$jscoverage['/base/attribute.js'].lineData[170] = 0;
  _$jscoverage['/base/attribute.js'].lineData[179] = 0;
  _$jscoverage['/base/attribute.js'].lineData[181] = 0;
  _$jscoverage['/base/attribute.js'].lineData[182] = 0;
  _$jscoverage['/base/attribute.js'].lineData[186] = 0;
  _$jscoverage['/base/attribute.js'].lineData[187] = 0;
  _$jscoverage['/base/attribute.js'].lineData[188] = 0;
  _$jscoverage['/base/attribute.js'].lineData[189] = 0;
  _$jscoverage['/base/attribute.js'].lineData[190] = 0;
  _$jscoverage['/base/attribute.js'].lineData[197] = 0;
  _$jscoverage['/base/attribute.js'].lineData[205] = 0;
  _$jscoverage['/base/attribute.js'].lineData[212] = 0;
  _$jscoverage['/base/attribute.js'].lineData[221] = 0;
  _$jscoverage['/base/attribute.js'].lineData[229] = 0;
  _$jscoverage['/base/attribute.js'].lineData[233] = 0;
  _$jscoverage['/base/attribute.js'].lineData[234] = 0;
  _$jscoverage['/base/attribute.js'].lineData[236] = 0;
  _$jscoverage['/base/attribute.js'].lineData[257] = 0;
  _$jscoverage['/base/attribute.js'].lineData[261] = 0;
  _$jscoverage['/base/attribute.js'].lineData[262] = 0;
  _$jscoverage['/base/attribute.js'].lineData[264] = 0;
  _$jscoverage['/base/attribute.js'].lineData[266] = 0;
  _$jscoverage['/base/attribute.js'].lineData[276] = 0;
  _$jscoverage['/base/attribute.js'].lineData[277] = 0;
  _$jscoverage['/base/attribute.js'].lineData[278] = 0;
  _$jscoverage['/base/attribute.js'].lineData[280] = 0;
  _$jscoverage['/base/attribute.js'].lineData[281] = 0;
  _$jscoverage['/base/attribute.js'].lineData[283] = 0;
  _$jscoverage['/base/attribute.js'].lineData[292] = 0;
  _$jscoverage['/base/attribute.js'].lineData[300] = 0;
  _$jscoverage['/base/attribute.js'].lineData[301] = 0;
  _$jscoverage['/base/attribute.js'].lineData[302] = 0;
  _$jscoverage['/base/attribute.js'].lineData[304] = 0;
  _$jscoverage['/base/attribute.js'].lineData[305] = 0;
  _$jscoverage['/base/attribute.js'].lineData[306] = 0;
  _$jscoverage['/base/attribute.js'].lineData[309] = 0;
  _$jscoverage['/base/attribute.js'].lineData[323] = 0;
  _$jscoverage['/base/attribute.js'].lineData[324] = 0;
  _$jscoverage['/base/attribute.js'].lineData[325] = 0;
  _$jscoverage['/base/attribute.js'].lineData[326] = 0;
  _$jscoverage['/base/attribute.js'].lineData[327] = 0;
  _$jscoverage['/base/attribute.js'].lineData[331] = 0;
  _$jscoverage['/base/attribute.js'].lineData[334] = 0;
  _$jscoverage['/base/attribute.js'].lineData[335] = 0;
  _$jscoverage['/base/attribute.js'].lineData[338] = 0;
  _$jscoverage['/base/attribute.js'].lineData[339] = 0;
  _$jscoverage['/base/attribute.js'].lineData[340] = 0;
  _$jscoverage['/base/attribute.js'].lineData[342] = 0;
  _$jscoverage['/base/attribute.js'].lineData[344] = 0;
  _$jscoverage['/base/attribute.js'].lineData[345] = 0;
  _$jscoverage['/base/attribute.js'].lineData[347] = 0;
  _$jscoverage['/base/attribute.js'].lineData[351] = 0;
  _$jscoverage['/base/attribute.js'].lineData[352] = 0;
  _$jscoverage['/base/attribute.js'].lineData[353] = 0;
  _$jscoverage['/base/attribute.js'].lineData[354] = 0;
  _$jscoverage['/base/attribute.js'].lineData[355] = 0;
  _$jscoverage['/base/attribute.js'].lineData[357] = 0;
  _$jscoverage['/base/attribute.js'].lineData[358] = 0;
  _$jscoverage['/base/attribute.js'].lineData[367] = 0;
  _$jscoverage['/base/attribute.js'].lineData[369] = 0;
  _$jscoverage['/base/attribute.js'].lineData[371] = 0;
  _$jscoverage['/base/attribute.js'].lineData[373] = 0;
  _$jscoverage['/base/attribute.js'].lineData[374] = 0;
  _$jscoverage['/base/attribute.js'].lineData[375] = 0;
  _$jscoverage['/base/attribute.js'].lineData[377] = 0;
  _$jscoverage['/base/attribute.js'].lineData[379] = 0;
  _$jscoverage['/base/attribute.js'].lineData[388] = 0;
  _$jscoverage['/base/attribute.js'].lineData[398] = 0;
  _$jscoverage['/base/attribute.js'].lineData[399] = 0;
  _$jscoverage['/base/attribute.js'].lineData[402] = 0;
  _$jscoverage['/base/attribute.js'].lineData[403] = 0;
  _$jscoverage['/base/attribute.js'].lineData[406] = 0;
  _$jscoverage['/base/attribute.js'].lineData[407] = 0;
  _$jscoverage['/base/attribute.js'].lineData[411] = 0;
  _$jscoverage['/base/attribute.js'].lineData[413] = 0;
  _$jscoverage['/base/attribute.js'].lineData[422] = 0;
  _$jscoverage['/base/attribute.js'].lineData[429] = 0;
  _$jscoverage['/base/attribute.js'].lineData[430] = 0;
  _$jscoverage['/base/attribute.js'].lineData[431] = 0;
  _$jscoverage['/base/attribute.js'].lineData[434] = 0;
  _$jscoverage['/base/attribute.js'].lineData[435] = 0;
  _$jscoverage['/base/attribute.js'].lineData[439] = 0;
  _$jscoverage['/base/attribute.js'].lineData[444] = 0;
  _$jscoverage['/base/attribute.js'].lineData[445] = 0;
  _$jscoverage['/base/attribute.js'].lineData[448] = 0;
  _$jscoverage['/base/attribute.js'].lineData[449] = 0;
  _$jscoverage['/base/attribute.js'].lineData[452] = 0;
  _$jscoverage['/base/attribute.js'].lineData[453] = 0;
  _$jscoverage['/base/attribute.js'].lineData[456] = 0;
  _$jscoverage['/base/attribute.js'].lineData[468] = 0;
  _$jscoverage['/base/attribute.js'].lineData[470] = 0;
  _$jscoverage['/base/attribute.js'].lineData[471] = 0;
  _$jscoverage['/base/attribute.js'].lineData[473] = 0;
  _$jscoverage['/base/attribute.js'].lineData[476] = 0;
  _$jscoverage['/base/attribute.js'].lineData[480] = 0;
  _$jscoverage['/base/attribute.js'].lineData[483] = 0;
  _$jscoverage['/base/attribute.js'].lineData[487] = 0;
  _$jscoverage['/base/attribute.js'].lineData[488] = 0;
  _$jscoverage['/base/attribute.js'].lineData[491] = 0;
  _$jscoverage['/base/attribute.js'].lineData[492] = 0;
  _$jscoverage['/base/attribute.js'].lineData[497] = 0;
  _$jscoverage['/base/attribute.js'].lineData[498] = 0;
  _$jscoverage['/base/attribute.js'].lineData[503] = 0;
  _$jscoverage['/base/attribute.js'].lineData[504] = 0;
  _$jscoverage['/base/attribute.js'].lineData[505] = 0;
  _$jscoverage['/base/attribute.js'].lineData[509] = 0;
  _$jscoverage['/base/attribute.js'].lineData[511] = 0;
  _$jscoverage['/base/attribute.js'].lineData[512] = 0;
  _$jscoverage['/base/attribute.js'].lineData[515] = 0;
  _$jscoverage['/base/attribute.js'].lineData[518] = 0;
  _$jscoverage['/base/attribute.js'].lineData[519] = 0;
  _$jscoverage['/base/attribute.js'].lineData[521] = 0;
  _$jscoverage['/base/attribute.js'].lineData[523] = 0;
  _$jscoverage['/base/attribute.js'].lineData[524] = 0;
  _$jscoverage['/base/attribute.js'].lineData[526] = 0;
  _$jscoverage['/base/attribute.js'].lineData[527] = 0;
  _$jscoverage['/base/attribute.js'].lineData[528] = 0;
  _$jscoverage['/base/attribute.js'].lineData[530] = 0;
  _$jscoverage['/base/attribute.js'].lineData[533] = 0;
  _$jscoverage['/base/attribute.js'].lineData[534] = 0;
  _$jscoverage['/base/attribute.js'].lineData[536] = 0;
  _$jscoverage['/base/attribute.js'].lineData[537] = 0;
  _$jscoverage['/base/attribute.js'].lineData[540] = 0;
}
if (! _$jscoverage['/base/attribute.js'].functionData) {
  _$jscoverage['/base/attribute.js'].functionData = [];
  _$jscoverage['/base/attribute.js'].functionData[0] = 0;
  _$jscoverage['/base/attribute.js'].functionData[1] = 0;
  _$jscoverage['/base/attribute.js'].functionData[2] = 0;
  _$jscoverage['/base/attribute.js'].functionData[3] = 0;
  _$jscoverage['/base/attribute.js'].functionData[4] = 0;
  _$jscoverage['/base/attribute.js'].functionData[5] = 0;
  _$jscoverage['/base/attribute.js'].functionData[6] = 0;
  _$jscoverage['/base/attribute.js'].functionData[7] = 0;
  _$jscoverage['/base/attribute.js'].functionData[8] = 0;
  _$jscoverage['/base/attribute.js'].functionData[9] = 0;
  _$jscoverage['/base/attribute.js'].functionData[10] = 0;
  _$jscoverage['/base/attribute.js'].functionData[11] = 0;
  _$jscoverage['/base/attribute.js'].functionData[12] = 0;
  _$jscoverage['/base/attribute.js'].functionData[13] = 0;
  _$jscoverage['/base/attribute.js'].functionData[14] = 0;
  _$jscoverage['/base/attribute.js'].functionData[15] = 0;
  _$jscoverage['/base/attribute.js'].functionData[16] = 0;
  _$jscoverage['/base/attribute.js'].functionData[17] = 0;
  _$jscoverage['/base/attribute.js'].functionData[18] = 0;
  _$jscoverage['/base/attribute.js'].functionData[19] = 0;
  _$jscoverage['/base/attribute.js'].functionData[20] = 0;
  _$jscoverage['/base/attribute.js'].functionData[21] = 0;
  _$jscoverage['/base/attribute.js'].functionData[22] = 0;
  _$jscoverage['/base/attribute.js'].functionData[23] = 0;
  _$jscoverage['/base/attribute.js'].functionData[24] = 0;
  _$jscoverage['/base/attribute.js'].functionData[25] = 0;
}
if (! _$jscoverage['/base/attribute.js'].branchData) {
  _$jscoverage['/base/attribute.js'].branchData = {};
  _$jscoverage['/base/attribute.js'].branchData['13'] = [];
  _$jscoverage['/base/attribute.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['25'] = [];
  _$jscoverage['/base/attribute.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['36'] = [];
  _$jscoverage['/base/attribute.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['39'] = [];
  _$jscoverage['/base/attribute.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['47'] = [];
  _$jscoverage['/base/attribute.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['47'][3] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['60'] = [];
  _$jscoverage['/base/attribute.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['61'] = [];
  _$jscoverage['/base/attribute.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['64'] = [];
  _$jscoverage['/base/attribute.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['76'] = [];
  _$jscoverage['/base/attribute.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['89'] = [];
  _$jscoverage['/base/attribute.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['90'] = [];
  _$jscoverage['/base/attribute.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['102'] = [];
  _$jscoverage['/base/attribute.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['125'] = [];
  _$jscoverage['/base/attribute.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['131'] = [];
  _$jscoverage['/base/attribute.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['132'] = [];
  _$jscoverage['/base/attribute.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['134'] = [];
  _$jscoverage['/base/attribute.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['134'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['152'] = [];
  _$jscoverage['/base/attribute.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['153'] = [];
  _$jscoverage['/base/attribute.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['157'] = [];
  _$jscoverage['/base/attribute.js'].branchData['157'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['167'] = [];
  _$jscoverage['/base/attribute.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['181'] = [];
  _$jscoverage['/base/attribute.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['186'] = [];
  _$jscoverage['/base/attribute.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['189'] = [];
  _$jscoverage['/base/attribute.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['261'] = [];
  _$jscoverage['/base/attribute.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['280'] = [];
  _$jscoverage['/base/attribute.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['304'] = [];
  _$jscoverage['/base/attribute.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['324'] = [];
  _$jscoverage['/base/attribute.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['326'] = [];
  _$jscoverage['/base/attribute.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['334'] = [];
  _$jscoverage['/base/attribute.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['338'] = [];
  _$jscoverage['/base/attribute.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['339'] = [];
  _$jscoverage['/base/attribute.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['357'] = [];
  _$jscoverage['/base/attribute.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['369'] = [];
  _$jscoverage['/base/attribute.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['373'] = [];
  _$jscoverage['/base/attribute.js'].branchData['373'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['374'] = [];
  _$jscoverage['/base/attribute.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['398'] = [];
  _$jscoverage['/base/attribute.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['402'] = [];
  _$jscoverage['/base/attribute.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['406'] = [];
  _$jscoverage['/base/attribute.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['429'] = [];
  _$jscoverage['/base/attribute.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['444'] = [];
  _$jscoverage['/base/attribute.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['448'] = [];
  _$jscoverage['/base/attribute.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['452'] = [];
  _$jscoverage['/base/attribute.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['470'] = [];
  _$jscoverage['/base/attribute.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['471'] = [];
  _$jscoverage['/base/attribute.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['503'] = [];
  _$jscoverage['/base/attribute.js'].branchData['503'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['505'] = [];
  _$jscoverage['/base/attribute.js'].branchData['505'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['526'] = [];
  _$jscoverage['/base/attribute.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['533'] = [];
  _$jscoverage['/base/attribute.js'].branchData['533'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['536'] = [];
  _$jscoverage['/base/attribute.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['536'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['536'][3] = new BranchData();
}
_$jscoverage['/base/attribute.js'].branchData['536'][3].init(151, 10, 'e !== true');
function visit56_536_3(result) {
  _$jscoverage['/base/attribute.js'].branchData['536'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['536'][2].init(132, 15, 'e !== undefined');
function visit55_536_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['536'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['536'][1].init(132, 29, 'e !== undefined && e !== true');
function visit54_536_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['533'][1].init(441, 52, 'validator && (validator = normalFn(self, validator))');
function visit53_533_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['533'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['526'][1].init(179, 4, 'path');
function visit52_526_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['505'][1].init(55, 88, 'val !== undefined');
function visit51_505_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['505'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['503'][1].init(168, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit50_503_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['503'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['471'][1].init(22, 18, 'self.hasAttr(name)');
function visit49_471_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['470'][1].init(50, 23, 'typeof name == \'string\'');
function visit48_470_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['452'][1].init(973, 4, 'path');
function visit47_452_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['448'][2].init(879, 17, 'ret !== undefined');
function visit46_448_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['448'][1].init(856, 40, '!(name in attrVals) && ret !== undefined');
function visit45_448_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['444'][1].init(722, 43, 'getter && (getter = normalFn(self, getter))');
function visit44_444_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['429'][1].init(205, 24, 'name.indexOf(dot) !== -1');
function visit43_429_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['406'][1].init(716, 22, 'setValue !== undefined');
function visit42_406_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['402'][1].init(627, 20, 'setValue === INVALID');
function visit41_402_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['398'][1].init(486, 43, 'setter && (setter = normalFn(self, setter))');
function visit40_398_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['374'][1].init(22, 13, 'opts[\'error\']');
function visit39_374_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['373'][1].init(1857, 15, 'e !== undefined');
function visit38_373_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['373'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['369'][1].init(1748, 10, 'opts || {}');
function visit37_369_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['357'][1].init(1288, 16, 'attrNames.length');
function visit36_357_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['339'][1].init(26, 13, 'opts[\'error\']');
function visit35_339_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['338'][1].init(531, 13, 'errors.length');
function visit34_338_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['334'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit33_334_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['326'][1].init(56, 10, 'opts || {}');
function visit32_326_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['324'][1].init(48, 21, 'S.isPlainObject(name)');
function visit31_324_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['304'][1].init(138, 18, 'self.hasAttr(name)');
function visit30_304_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['280'][1].init(177, 13, 'initialValues');
function visit29_280_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['261'][1].init(154, 18, 'attr = attrs[name]');
function visit28_261_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['189'][1].init(157, 5, 'attrs');
function visit27_189_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['186'][1].init(530, 15, '!opts[\'silent\']');
function visit26_186_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['181'][1].init(433, 13, 'ret === FALSE');
function visit25_181_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['167'][1].init(62, 17, 'e.target !== this');
function visit24_167_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['157'][1].init(18, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit23_157_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['157'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['153'][1].init(18, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit22_153_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['152'][1].init(1073, 14, 'opts[\'silent\']');
function visit21_152_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['134'][2].init(116, 16, 'subVal === value');
function visit20_134_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['134'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['134'][1].init(108, 24, 'path && subVal === value');
function visit19_134_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['132'][2].init(27, 17, 'prevVal === value');
function visit18_132_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['132'][1].init(18, 26, '!path && prevVal === value');
function visit17_132_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['131'][1].init(485, 11, '!opts.force');
function visit16_131_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['125'][1].init(310, 4, 'path');
function visit15_125_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['102'][1].init(90, 22, 'defaultBeforeFns[name]');
function visit14_102_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['90'][1].init(18, 21, 'prevVal === undefined');
function visit13_90_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['89'][1].init(40, 4, 'path');
function visit12_89_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['76'][1].init(35, 24, 'name.indexOf(\'.\') !== -1');
function visit11_76_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['64'][1].init(111, 14, 'o != undefined');
function visit10_64_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['61'][1].init(30, 7, 'i < len');
function visit9_61_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['60'][1].init(70, 8, 'len >= 0');
function visit8_60_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['47'][3].init(17, 7, 'i < len');
function visit7_47_3(result) {
  _$jscoverage['/base/attribute.js'].branchData['47'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['47'][2].init(60, 14, 'o != undefined');
function visit6_47_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['47'][1].init(48, 25, 'o != undefined && i < len');
function visit5_47_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['39'][1].init(130, 9, 'ret || {}');
function visit4_39_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['36'][1].init(44, 20, '!doNotCreate && !ret');
function visit3_36_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['25'][1].init(21, 16, 'attrName || name');
function visit2_25_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['13'][1].init(14, 25, 'typeof method == \'string\'');
function visit1_13_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].lineData[6]++;
KISSY.add(function(S, undefined) {
  _$jscoverage['/base/attribute.js'].functionData[0]++;
  _$jscoverage['/base/attribute.js'].lineData[8]++;
  var INVALID = {};
  _$jscoverage['/base/attribute.js'].lineData[10]++;
  var FALSE = false;
  _$jscoverage['/base/attribute.js'].lineData[12]++;
  function normalFn(host, method) {
    _$jscoverage['/base/attribute.js'].functionData[1]++;
    _$jscoverage['/base/attribute.js'].lineData[13]++;
    if (visit1_13_1(typeof method == 'string')) {
      _$jscoverage['/base/attribute.js'].lineData[14]++;
      return host[method];
    }
    _$jscoverage['/base/attribute.js'].lineData[16]++;
    return method;
  }
  _$jscoverage['/base/attribute.js'].lineData[19]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/base/attribute.js'].functionData[2]++;
    _$jscoverage['/base/attribute.js'].lineData[20]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/base/attribute.js'].lineData[24]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/base/attribute.js'].functionData[3]++;
    _$jscoverage['/base/attribute.js'].lineData[25]++;
    attrName = visit2_25_1(attrName || name);
    _$jscoverage['/base/attribute.js'].lineData[26]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/base/attribute.js'].lineData[34]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/base/attribute.js'].functionData[4]++;
    _$jscoverage['/base/attribute.js'].lineData[35]++;
    var ret = obj[name];
    _$jscoverage['/base/attribute.js'].lineData[36]++;
    if (visit3_36_1(!doNotCreate && !ret)) {
      _$jscoverage['/base/attribute.js'].lineData[37]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/base/attribute.js'].lineData[39]++;
    return visit4_39_1(ret || {});
  }
  _$jscoverage['/base/attribute.js'].lineData[45]++;
  function getValueByPath(o, path) {
    _$jscoverage['/base/attribute.js'].functionData[5]++;
    _$jscoverage['/base/attribute.js'].lineData[46]++;
    for (var i = 0, len = path.length; visit5_47_1(visit6_47_2(o != undefined) && visit7_47_3(i < len)); i++) {
      _$jscoverage['/base/attribute.js'].lineData[49]++;
      o = o[path[i]];
    }
    _$jscoverage['/base/attribute.js'].lineData[51]++;
    return o;
  }
  _$jscoverage['/base/attribute.js'].lineData[57]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/base/attribute.js'].functionData[6]++;
    _$jscoverage['/base/attribute.js'].lineData[58]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/base/attribute.js'].lineData[60]++;
    if (visit8_60_1(len >= 0)) {
      _$jscoverage['/base/attribute.js'].lineData[61]++;
      for (var i = 0; visit9_61_1(i < len); i++) {
        _$jscoverage['/base/attribute.js'].lineData[62]++;
        o = o[path[i]];
      }
      _$jscoverage['/base/attribute.js'].lineData[64]++;
      if (visit10_64_1(o != undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[65]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/base/attribute.js'].lineData[67]++;
        s = undefined;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[70]++;
    return s;
  }
  _$jscoverage['/base/attribute.js'].lineData[73]++;
  function getPathNamePair(name) {
    _$jscoverage['/base/attribute.js'].functionData[7]++;
    _$jscoverage['/base/attribute.js'].lineData[74]++;
    var path;
    _$jscoverage['/base/attribute.js'].lineData[76]++;
    if (visit11_76_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/base/attribute.js'].lineData[77]++;
      path = name.split('.');
      _$jscoverage['/base/attribute.js'].lineData[78]++;
      name = path.shift();
    }
    _$jscoverage['/base/attribute.js'].lineData[81]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/base/attribute.js'].lineData[87]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/base/attribute.js'].functionData[8]++;
    _$jscoverage['/base/attribute.js'].lineData[88]++;
    var tmp = value;
    _$jscoverage['/base/attribute.js'].lineData[89]++;
    if (visit12_89_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[90]++;
      if (visit13_90_1(prevVal === undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[91]++;
        tmp = {};
      } else {
        _$jscoverage['/base/attribute.js'].lineData[93]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/base/attribute.js'].lineData[95]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/base/attribute.js'].lineData[97]++;
    return tmp;
  }
  _$jscoverage['/base/attribute.js'].lineData[100]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/base/attribute.js'].functionData[9]++;
    _$jscoverage['/base/attribute.js'].lineData[101]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/base/attribute.js'].lineData[102]++;
    if (visit14_102_1(defaultBeforeFns[name])) {
      _$jscoverage['/base/attribute.js'].lineData[103]++;
      return;
    }
    _$jscoverage['/base/attribute.js'].lineData[105]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/base/attribute.js'].lineData[106]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/base/attribute.js'].lineData[107]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/base/attribute.js'].lineData[112]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/base/attribute.js'].functionData[10]++;
    _$jscoverage['/base/attribute.js'].lineData[113]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/base/attribute.js'].lineData[119]++;
    name = pathNamePair.name;
    _$jscoverage['/base/attribute.js'].lineData[120]++;
    path = pathNamePair.path;
    _$jscoverage['/base/attribute.js'].lineData[121]++;
    prevVal = self.get(name);
    _$jscoverage['/base/attribute.js'].lineData[123]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/base/attribute.js'].lineData[125]++;
    if (visit15_125_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[126]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/base/attribute.js'].lineData[131]++;
    if (visit16_131_1(!opts.force)) {
      _$jscoverage['/base/attribute.js'].lineData[132]++;
      if (visit17_132_1(!path && visit18_132_2(prevVal === value))) {
        _$jscoverage['/base/attribute.js'].lineData[133]++;
        return undefined;
      } else {
        _$jscoverage['/base/attribute.js'].lineData[134]++;
        if (visit19_134_1(path && visit20_134_2(subVal === value))) {
          _$jscoverage['/base/attribute.js'].lineData[135]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[139]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/base/attribute.js'].lineData[141]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/base/attribute.js'].lineData[152]++;
    if (visit21_152_1(opts['silent'])) {
      _$jscoverage['/base/attribute.js'].lineData[153]++;
      if (visit22_153_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/base/attribute.js'].lineData[154]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/base/attribute.js'].lineData[157]++;
      if (visit23_157_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/base/attribute.js'].lineData[158]++;
        return FALSE;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[162]++;
    return self;
  }
  _$jscoverage['/base/attribute.js'].lineData[165]++;
  function defaultSetFn(e) {
    _$jscoverage['/base/attribute.js'].functionData[11]++;
    _$jscoverage['/base/attribute.js'].lineData[167]++;
    if (visit24_167_1(e.target !== this)) {
      _$jscoverage['/base/attribute.js'].lineData[168]++;
      return undefined;
    }
    _$jscoverage['/base/attribute.js'].lineData[170]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/base/attribute.js'].lineData[179]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/base/attribute.js'].lineData[181]++;
    if (visit25_181_1(ret === FALSE)) {
      _$jscoverage['/base/attribute.js'].lineData[182]++;
      return ret;
    }
    _$jscoverage['/base/attribute.js'].lineData[186]++;
    if (visit26_186_1(!opts['silent'])) {
      _$jscoverage['/base/attribute.js'].lineData[187]++;
      value = self.__attrVals[name];
      _$jscoverage['/base/attribute.js'].lineData[188]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/base/attribute.js'].lineData[189]++;
      if (visit27_189_1(attrs)) {
        _$jscoverage['/base/attribute.js'].lineData[190]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/base/attribute.js'].lineData[197]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[205]++;
    return undefined;
  }
  _$jscoverage['/base/attribute.js'].lineData[212]++;
  return {
  INVALID: INVALID, 
  getAttrs: function() {
  _$jscoverage['/base/attribute.js'].functionData[12]++;
  _$jscoverage['/base/attribute.js'].lineData[221]++;
  return this.__attrs;
}, 
  getAttrVals: function() {
  _$jscoverage['/base/attribute.js'].functionData[13]++;
  _$jscoverage['/base/attribute.js'].lineData[229]++;
  var self = this, o = {}, a, attrs = self.__attrs;
  _$jscoverage['/base/attribute.js'].lineData[233]++;
  for (a in attrs) {
    _$jscoverage['/base/attribute.js'].lineData[234]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/base/attribute.js'].lineData[236]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/base/attribute.js'].functionData[14]++;
  _$jscoverage['/base/attribute.js'].lineData[257]++;
  var self = this, attrs = self.__attrs, attr, cfg = S.clone(attrConfig);
  _$jscoverage['/base/attribute.js'].lineData[261]++;
  if (visit28_261_1(attr = attrs[name])) {
    _$jscoverage['/base/attribute.js'].lineData[262]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/base/attribute.js'].lineData[264]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/base/attribute.js'].lineData[266]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/base/attribute.js'].functionData[15]++;
  _$jscoverage['/base/attribute.js'].lineData[276]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[277]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/base/attribute.js'].functionData[16]++;
  _$jscoverage['/base/attribute.js'].lineData[278]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/base/attribute.js'].lineData[280]++;
  if (visit29_280_1(initialValues)) {
    _$jscoverage['/base/attribute.js'].lineData[281]++;
    self.set(initialValues);
  }
  _$jscoverage['/base/attribute.js'].lineData[283]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[17]++;
  _$jscoverage['/base/attribute.js'].lineData[292]++;
  return this.__attrs.hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[18]++;
  _$jscoverage['/base/attribute.js'].lineData[300]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[301]++;
  var __attrVals = self.__attrVals;
  _$jscoverage['/base/attribute.js'].lineData[302]++;
  var __attrs = self.__attrs;
  _$jscoverage['/base/attribute.js'].lineData[304]++;
  if (visit30_304_1(self.hasAttr(name))) {
    _$jscoverage['/base/attribute.js'].lineData[305]++;
    delete __attrs[name];
    _$jscoverage['/base/attribute.js'].lineData[306]++;
    delete __attrVals[name];
  }
  _$jscoverage['/base/attribute.js'].lineData[309]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/base/attribute.js'].functionData[19]++;
  _$jscoverage['/base/attribute.js'].lineData[323]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[324]++;
  if (visit31_324_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attribute.js'].lineData[325]++;
    opts = value;
    _$jscoverage['/base/attribute.js'].lineData[326]++;
    opts = visit32_326_1(opts || {});
    _$jscoverage['/base/attribute.js'].lineData[327]++;
    var all = Object(name), attrs = [], e, errors = [];
    _$jscoverage['/base/attribute.js'].lineData[331]++;
    for (name in all) {
      _$jscoverage['/base/attribute.js'].lineData[334]++;
      if (visit33_334_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[335]++;
        errors.push(e);
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[338]++;
    if (visit34_338_1(errors.length)) {
      _$jscoverage['/base/attribute.js'].lineData[339]++;
      if (visit35_339_1(opts['error'])) {
        _$jscoverage['/base/attribute.js'].lineData[340]++;
        opts['error'](errors);
      }
      _$jscoverage['/base/attribute.js'].lineData[342]++;
      return FALSE;
    }
    _$jscoverage['/base/attribute.js'].lineData[344]++;
    for (name in all) {
      _$jscoverage['/base/attribute.js'].lineData[345]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/base/attribute.js'].lineData[347]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/base/attribute.js'].lineData[351]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/base/attribute.js'].functionData[20]++;
  _$jscoverage['/base/attribute.js'].lineData[352]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/base/attribute.js'].lineData[353]++;
  newVals.push(attr.newVal);
  _$jscoverage['/base/attribute.js'].lineData[354]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/base/attribute.js'].lineData[355]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/base/attribute.js'].lineData[357]++;
    if (visit36_357_1(attrNames.length)) {
      _$jscoverage['/base/attribute.js'].lineData[358]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/base/attribute.js'].lineData[367]++;
    return self;
  }
  _$jscoverage['/base/attribute.js'].lineData[369]++;
  opts = visit37_369_1(opts || {});
  _$jscoverage['/base/attribute.js'].lineData[371]++;
  e = validate(self, name, value);
  _$jscoverage['/base/attribute.js'].lineData[373]++;
  if (visit38_373_1(e !== undefined)) {
    _$jscoverage['/base/attribute.js'].lineData[374]++;
    if (visit39_374_1(opts['error'])) {
      _$jscoverage['/base/attribute.js'].lineData[375]++;
      opts['error'](e);
    }
    _$jscoverage['/base/attribute.js'].lineData[377]++;
    return FALSE;
  }
  _$jscoverage['/base/attribute.js'].lineData[379]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/base/attribute.js'].functionData[21]++;
  _$jscoverage['/base/attribute.js'].lineData[388]++;
  var self = this, setValue = undefined, attrConfig = ensureNonEmpty(self.__attrs, name), setter = attrConfig['setter'];
  _$jscoverage['/base/attribute.js'].lineData[398]++;
  if (visit40_398_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/base/attribute.js'].lineData[399]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[402]++;
  if (visit41_402_1(setValue === INVALID)) {
    _$jscoverage['/base/attribute.js'].lineData[403]++;
    return FALSE;
  }
  _$jscoverage['/base/attribute.js'].lineData[406]++;
  if (visit42_406_1(setValue !== undefined)) {
    _$jscoverage['/base/attribute.js'].lineData[407]++;
    value = setValue;
  }
  _$jscoverage['/base/attribute.js'].lineData[411]++;
  self.__attrVals[name] = value;
  _$jscoverage['/base/attribute.js'].lineData[413]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[22]++;
  _$jscoverage['/base/attribute.js'].lineData[422]++;
  var self = this, dot = '.', path, attrVals = self.__attrVals, attrConfig, getter, ret;
  _$jscoverage['/base/attribute.js'].lineData[429]++;
  if (visit43_429_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/base/attribute.js'].lineData[430]++;
    path = name.split(dot);
    _$jscoverage['/base/attribute.js'].lineData[431]++;
    name = path.shift();
  }
  _$jscoverage['/base/attribute.js'].lineData[434]++;
  attrConfig = ensureNonEmpty(self.__attrs, name, 1);
  _$jscoverage['/base/attribute.js'].lineData[435]++;
  getter = attrConfig['getter'];
  _$jscoverage['/base/attribute.js'].lineData[439]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/base/attribute.js'].lineData[444]++;
  if (visit44_444_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/base/attribute.js'].lineData[445]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[448]++;
  if (visit45_448_1(!(name in attrVals) && visit46_448_2(ret !== undefined))) {
    _$jscoverage['/base/attribute.js'].lineData[449]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/base/attribute.js'].lineData[452]++;
  if (visit47_452_1(path)) {
    _$jscoverage['/base/attribute.js'].lineData[453]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/base/attribute.js'].lineData[456]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/base/attribute.js'].functionData[23]++;
  _$jscoverage['/base/attribute.js'].lineData[468]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[470]++;
  if (visit48_470_1(typeof name == 'string')) {
    _$jscoverage['/base/attribute.js'].lineData[471]++;
    if (visit49_471_1(self.hasAttr(name))) {
      _$jscoverage['/base/attribute.js'].lineData[473]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/base/attribute.js'].lineData[476]++;
      return self;
    }
  }
  _$jscoverage['/base/attribute.js'].lineData[480]++;
  opts = (name);
  _$jscoverage['/base/attribute.js'].lineData[483]++;
  var attrs = self.__attrs, values = {};
  _$jscoverage['/base/attribute.js'].lineData[487]++;
  for (name in attrs) {
    _$jscoverage['/base/attribute.js'].lineData[488]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[491]++;
  self.set(values, opts);
  _$jscoverage['/base/attribute.js'].lineData[492]++;
  return self;
}};
  _$jscoverage['/base/attribute.js'].lineData[497]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/base/attribute.js'].functionData[24]++;
    _$jscoverage['/base/attribute.js'].lineData[498]++;
    var attrs = self.__attrs, attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/base/attribute.js'].lineData[503]++;
    if (visit50_503_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/base/attribute.js'].lineData[504]++;
      val = valFn.call(self);
      _$jscoverage['/base/attribute.js'].lineData[505]++;
      if (visit51_505_1(val !== undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[509]++;
        attrConfig.value = val;
      }
      _$jscoverage['/base/attribute.js'].lineData[511]++;
      delete attrConfig.valueFn;
      _$jscoverage['/base/attribute.js'].lineData[512]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/base/attribute.js'].lineData[515]++;
    return attrConfig.value;
  }
  _$jscoverage['/base/attribute.js'].lineData[518]++;
  function validate(self, name, value, all) {
    _$jscoverage['/base/attribute.js'].functionData[25]++;
    _$jscoverage['/base/attribute.js'].lineData[519]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/base/attribute.js'].lineData[521]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/base/attribute.js'].lineData[523]++;
    name = pathNamePair.name;
    _$jscoverage['/base/attribute.js'].lineData[524]++;
    path = pathNamePair.path;
    _$jscoverage['/base/attribute.js'].lineData[526]++;
    if (visit52_526_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[527]++;
      prevVal = self.get(name);
      _$jscoverage['/base/attribute.js'].lineData[528]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/base/attribute.js'].lineData[530]++;
    var attrConfig = ensureNonEmpty(self.__attrs, name), e, validator = attrConfig['validator'];
    _$jscoverage['/base/attribute.js'].lineData[533]++;
    if (visit53_533_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/base/attribute.js'].lineData[534]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/base/attribute.js'].lineData[536]++;
      if (visit54_536_1(visit55_536_2(e !== undefined) && visit56_536_3(e !== true))) {
        _$jscoverage['/base/attribute.js'].lineData[537]++;
        return e;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[540]++;
    return undefined;
  }
});
