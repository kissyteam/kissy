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
if (! _$jscoverage['/promise.js']) {
  _$jscoverage['/promise.js'] = {};
  _$jscoverage['/promise.js'].lineData = [];
  _$jscoverage['/promise.js'].lineData[6] = 0;
  _$jscoverage['/promise.js'].lineData[7] = 0;
  _$jscoverage['/promise.js'].lineData[8] = 0;
  _$jscoverage['/promise.js'].lineData[12] = 0;
  _$jscoverage['/promise.js'].lineData[14] = 0;
  _$jscoverage['/promise.js'].lineData[15] = 0;
  _$jscoverage['/promise.js'].lineData[24] = 0;
  _$jscoverage['/promise.js'].lineData[26] = 0;
  _$jscoverage['/promise.js'].lineData[28] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[33] = 0;
  _$jscoverage['/promise.js'].lineData[34] = 0;
  _$jscoverage['/promise.js'].lineData[39] = 0;
  _$jscoverage['/promise.js'].lineData[40] = 0;
  _$jscoverage['/promise.js'].lineData[41] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[49] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[60] = 0;
  _$jscoverage['/promise.js'].lineData[61] = 0;
  _$jscoverage['/promise.js'].lineData[62] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[71] = 0;
  _$jscoverage['/promise.js'].lineData[72] = 0;
  _$jscoverage['/promise.js'].lineData[75] = 0;
  _$jscoverage['/promise.js'].lineData[84] = 0;
  _$jscoverage['/promise.js'].lineData[86] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[91] = 0;
  _$jscoverage['/promise.js'].lineData[92] = 0;
  _$jscoverage['/promise.js'].lineData[93] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[106] = 0;
  _$jscoverage['/promise.js'].lineData[113] = 0;
  _$jscoverage['/promise.js'].lineData[114] = 0;
  _$jscoverage['/promise.js'].lineData[119] = 0;
  _$jscoverage['/promise.js'].lineData[120] = 0;
  _$jscoverage['/promise.js'].lineData[123] = 0;
  _$jscoverage['/promise.js'].lineData[124] = 0;
  _$jscoverage['/promise.js'].lineData[125] = 0;
  _$jscoverage['/promise.js'].lineData[136] = 0;
  _$jscoverage['/promise.js'].lineData[137] = 0;
  _$jscoverage['/promise.js'].lineData[138] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[140] = 0;
  _$jscoverage['/promise.js'].lineData[141] = 0;
  _$jscoverage['/promise.js'].lineData[142] = 0;
  _$jscoverage['/promise.js'].lineData[143] = 0;
  _$jscoverage['/promise.js'].lineData[145] = 0;
  _$jscoverage['/promise.js'].lineData[146] = 0;
  _$jscoverage['/promise.js'].lineData[151] = 0;
  _$jscoverage['/promise.js'].lineData[164] = 0;
  _$jscoverage['/promise.js'].lineData[165] = 0;
  _$jscoverage['/promise.js'].lineData[167] = 0;
  _$jscoverage['/promise.js'].lineData[174] = 0;
  _$jscoverage['/promise.js'].lineData[176] = 0;
  _$jscoverage['/promise.js'].lineData[177] = 0;
  _$jscoverage['/promise.js'].lineData[179] = 0;
  _$jscoverage['/promise.js'].lineData[180] = 0;
  _$jscoverage['/promise.js'].lineData[182] = 0;
  _$jscoverage['/promise.js'].lineData[183] = 0;
  _$jscoverage['/promise.js'].lineData[191] = 0;
  _$jscoverage['/promise.js'].lineData[200] = 0;
  _$jscoverage['/promise.js'].lineData[201] = 0;
  _$jscoverage['/promise.js'].lineData[203] = 0;
  _$jscoverage['/promise.js'].lineData[219] = 0;
  _$jscoverage['/promise.js'].lineData[221] = 0;
  _$jscoverage['/promise.js'].lineData[222] = 0;
  _$jscoverage['/promise.js'].lineData[223] = 0;
  _$jscoverage['/promise.js'].lineData[229] = 0;
  _$jscoverage['/promise.js'].lineData[239] = 0;
  _$jscoverage['/promise.js'].lineData[245] = 0;
  _$jscoverage['/promise.js'].lineData[254] = 0;
  _$jscoverage['/promise.js'].lineData[263] = 0;
  _$jscoverage['/promise.js'].lineData[264] = 0;
  _$jscoverage['/promise.js'].lineData[265] = 0;
  _$jscoverage['/promise.js'].lineData[267] = 0;
  _$jscoverage['/promise.js'].lineData[268] = 0;
  _$jscoverage['/promise.js'].lineData[269] = 0;
  _$jscoverage['/promise.js'].lineData[270] = 0;
  _$jscoverage['/promise.js'].lineData[274] = 0;
  _$jscoverage['/promise.js'].lineData[277] = 0;
  _$jscoverage['/promise.js'].lineData[280] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[285] = 0;
  _$jscoverage['/promise.js'].lineData[286] = 0;
  _$jscoverage['/promise.js'].lineData[287] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[299] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[313] = 0;
  _$jscoverage['/promise.js'].lineData[314] = 0;
  _$jscoverage['/promise.js'].lineData[315] = 0;
  _$jscoverage['/promise.js'].lineData[316] = 0;
  _$jscoverage['/promise.js'].lineData[318] = 0;
  _$jscoverage['/promise.js'].lineData[319] = 0;
  _$jscoverage['/promise.js'].lineData[320] = 0;
  _$jscoverage['/promise.js'].lineData[322] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[326] = 0;
  _$jscoverage['/promise.js'].lineData[327] = 0;
  _$jscoverage['/promise.js'].lineData[328] = 0;
  _$jscoverage['/promise.js'].lineData[329] = 0;
  _$jscoverage['/promise.js'].lineData[330] = 0;
  _$jscoverage['/promise.js'].lineData[332] = 0;
  _$jscoverage['/promise.js'].lineData[334] = 0;
  _$jscoverage['/promise.js'].lineData[337] = 0;
  _$jscoverage['/promise.js'].lineData[342] = 0;
  _$jscoverage['/promise.js'].lineData[345] = 0;
  _$jscoverage['/promise.js'].lineData[347] = 0;
  _$jscoverage['/promise.js'].lineData[362] = 0;
  _$jscoverage['/promise.js'].lineData[365] = 0;
  _$jscoverage['/promise.js'].lineData[368] = 0;
  _$jscoverage['/promise.js'].lineData[369] = 0;
  _$jscoverage['/promise.js'].lineData[370] = 0;
  _$jscoverage['/promise.js'].lineData[372] = 0;
  _$jscoverage['/promise.js'].lineData[410] = 0;
  _$jscoverage['/promise.js'].lineData[411] = 0;
  _$jscoverage['/promise.js'].lineData[413] = 0;
  _$jscoverage['/promise.js'].lineData[420] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[472] = 0;
  _$jscoverage['/promise.js'].lineData[473] = 0;
  _$jscoverage['/promise.js'].lineData[474] = 0;
  _$jscoverage['/promise.js'].lineData[476] = 0;
  _$jscoverage['/promise.js'].lineData[477] = 0;
  _$jscoverage['/promise.js'].lineData[479] = 0;
  _$jscoverage['/promise.js'].lineData[480] = 0;
  _$jscoverage['/promise.js'].lineData[481] = 0;
  _$jscoverage['/promise.js'].lineData[482] = 0;
  _$jscoverage['/promise.js'].lineData[485] = 0;
  _$jscoverage['/promise.js'].lineData[490] = 0;
  _$jscoverage['/promise.js'].lineData[494] = 0;
  _$jscoverage['/promise.js'].lineData[502] = 0;
  _$jscoverage['/promise.js'].lineData[503] = 0;
  _$jscoverage['/promise.js'].lineData[505] = 0;
  _$jscoverage['/promise.js'].lineData[506] = 0;
  _$jscoverage['/promise.js'].lineData[508] = 0;
  _$jscoverage['/promise.js'].lineData[509] = 0;
  _$jscoverage['/promise.js'].lineData[511] = 0;
  _$jscoverage['/promise.js'].lineData[513] = 0;
  _$jscoverage['/promise.js'].lineData[514] = 0;
  _$jscoverage['/promise.js'].lineData[516] = 0;
  _$jscoverage['/promise.js'].lineData[519] = 0;
  _$jscoverage['/promise.js'].lineData[520] = 0;
  _$jscoverage['/promise.js'].lineData[523] = 0;
  _$jscoverage['/promise.js'].lineData[524] = 0;
  _$jscoverage['/promise.js'].lineData[527] = 0;
  _$jscoverage['/promise.js'].lineData[531] = 0;
}
if (! _$jscoverage['/promise.js'].functionData) {
  _$jscoverage['/promise.js'].functionData = [];
  _$jscoverage['/promise.js'].functionData[0] = 0;
  _$jscoverage['/promise.js'].functionData[1] = 0;
  _$jscoverage['/promise.js'].functionData[2] = 0;
  _$jscoverage['/promise.js'].functionData[3] = 0;
  _$jscoverage['/promise.js'].functionData[4] = 0;
  _$jscoverage['/promise.js'].functionData[5] = 0;
  _$jscoverage['/promise.js'].functionData[6] = 0;
  _$jscoverage['/promise.js'].functionData[7] = 0;
  _$jscoverage['/promise.js'].functionData[8] = 0;
  _$jscoverage['/promise.js'].functionData[9] = 0;
  _$jscoverage['/promise.js'].functionData[10] = 0;
  _$jscoverage['/promise.js'].functionData[11] = 0;
  _$jscoverage['/promise.js'].functionData[12] = 0;
  _$jscoverage['/promise.js'].functionData[13] = 0;
  _$jscoverage['/promise.js'].functionData[14] = 0;
  _$jscoverage['/promise.js'].functionData[15] = 0;
  _$jscoverage['/promise.js'].functionData[16] = 0;
  _$jscoverage['/promise.js'].functionData[17] = 0;
  _$jscoverage['/promise.js'].functionData[18] = 0;
  _$jscoverage['/promise.js'].functionData[19] = 0;
  _$jscoverage['/promise.js'].functionData[20] = 0;
  _$jscoverage['/promise.js'].functionData[21] = 0;
  _$jscoverage['/promise.js'].functionData[22] = 0;
  _$jscoverage['/promise.js'].functionData[23] = 0;
  _$jscoverage['/promise.js'].functionData[24] = 0;
  _$jscoverage['/promise.js'].functionData[25] = 0;
  _$jscoverage['/promise.js'].functionData[26] = 0;
  _$jscoverage['/promise.js'].functionData[27] = 0;
  _$jscoverage['/promise.js'].functionData[28] = 0;
  _$jscoverage['/promise.js'].functionData[29] = 0;
  _$jscoverage['/promise.js'].functionData[30] = 0;
  _$jscoverage['/promise.js'].functionData[31] = 0;
  _$jscoverage['/promise.js'].functionData[32] = 0;
  _$jscoverage['/promise.js'].functionData[33] = 0;
  _$jscoverage['/promise.js'].functionData[34] = 0;
  _$jscoverage['/promise.js'].functionData[35] = 0;
  _$jscoverage['/promise.js'].functionData[36] = 0;
  _$jscoverage['/promise.js'].functionData[37] = 0;
  _$jscoverage['/promise.js'].functionData[38] = 0;
  _$jscoverage['/promise.js'].functionData[39] = 0;
  _$jscoverage['/promise.js'].functionData[40] = 0;
  _$jscoverage['/promise.js'].functionData[41] = 0;
  _$jscoverage['/promise.js'].functionData[42] = 0;
  _$jscoverage['/promise.js'].functionData[43] = 0;
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['14'] = [];
  _$jscoverage['/promise.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['14'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['26'] = [];
  _$jscoverage['/promise.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['33'] = [];
  _$jscoverage['/promise.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['39'] = [];
  _$jscoverage['/promise.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['41'] = [];
  _$jscoverage['/promise.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['49'] = [];
  _$jscoverage['/promise.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['62'] = [];
  _$jscoverage['/promise.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['71'] = [];
  _$jscoverage['/promise.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['86'] = [];
  _$jscoverage['/promise.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['120'] = [];
  _$jscoverage['/promise.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['138'] = [];
  _$jscoverage['/promise.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['145'] = [];
  _$jscoverage['/promise.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['164'] = [];
  _$jscoverage['/promise.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['176'] = [];
  _$jscoverage['/promise.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['179'] = [];
  _$jscoverage['/promise.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['221'] = [];
  _$jscoverage['/promise.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['226'] = [];
  _$jscoverage['/promise.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['264'] = [];
  _$jscoverage['/promise.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['294'] = [];
  _$jscoverage['/promise.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['308'] = [];
  _$jscoverage['/promise.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['314'] = [];
  _$jscoverage['/promise.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['318'] = [];
  _$jscoverage['/promise.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['326'] = [];
  _$jscoverage['/promise.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['328'] = [];
  _$jscoverage['/promise.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['347'] = [];
  _$jscoverage['/promise.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['347'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['351'] = [];
  _$jscoverage['/promise.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['355'] = [];
  _$jscoverage['/promise.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['365'] = [];
  _$jscoverage['/promise.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['365'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['410'] = [];
  _$jscoverage['/promise.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['473'] = [];
  _$jscoverage['/promise.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['477'] = [];
  _$jscoverage['/promise.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['482'] = [];
  _$jscoverage['/promise.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['513'] = [];
  _$jscoverage['/promise.js'].branchData['513'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['513'][1].init(296, 11, 'result.done');
function visit37_513_1(result) {
  _$jscoverage['/promise.js'].branchData['513'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['482'][1].init(76, 13, '--count === 0');
function visit36_482_1(result) {
  _$jscoverage['/promise.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['477'][1].init(182, 19, 'i < promises.length');
function visit35_477_1(result) {
  _$jscoverage['/promise.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['473'][1].init(60, 6, '!count');
function visit34_473_1(result) {
  _$jscoverage['/promise.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['410'][1].init(18, 22, 'obj instanceof Promise');
function visit33_410_1(result) {
  _$jscoverage['/promise.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['365'][2].init(98, 61, 'obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject');
function visit32_365_2(result) {
  _$jscoverage['/promise.js'].branchData['365'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['365'][1].init(90, 70, 'obj && (obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)');
function visit31_365_1(result) {
  _$jscoverage['/promise.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['355'][1].init(-1, 206, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit30_355_1(result) {
  _$jscoverage['/promise.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['351'][2].init(224, 31, 'obj[PROMISE_PENDINGS] === false');
function visit29_351_2(result) {
  _$jscoverage['/promise.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['351'][1].init(160, 401, '(obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit28_351_1(result) {
  _$jscoverage['/promise.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['347'][2].init(60, 562, '!isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit27_347_2(result) {
  _$jscoverage['/promise.js'].branchData['347'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['347'][1].init(53, 569, 'obj && !isRejected(obj) && (obj[PROMISE_PENDINGS] === false) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_347_1(result) {
  _$jscoverage['/promise.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['328'][1].init(22, 4, 'done');
function visit25_328_1(result) {
  _$jscoverage['/promise.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['326'][1].init(1457, 25, 'value instanceof Promise');
function visit24_326_1(result) {
  _$jscoverage['/promise.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['318'][1].init(143, 24, 'value instanceof Promise');
function visit23_318_1(result) {
  _$jscoverage['/promise.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['314'][1].init(18, 4, 'done');
function visit22_314_1(result) {
  _$jscoverage['/promise.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['308'][1].init(83, 12, 'e.stack || e');
function visit21_308_1(result) {
  _$jscoverage['/promise.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['294'][1].init(168, 12, 'e.stack || e');
function visit20_294_1(result) {
  _$jscoverage['/promise.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['264'][1].init(14, 24, 'reason instanceof Reject');
function visit19_264_1(result) {
  _$jscoverage['/promise.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['226'][1].init(281, 21, 'fulfilled || rejected');
function visit18_226_1(result) {
  _$jscoverage['/promise.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['221'][1].init(28, 12, 'e.stack || e');
function visit17_221_1(result) {
  _$jscoverage['/promise.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['179'][1].init(196, 10, '!listeners');
function visit16_179_1(result) {
  _$jscoverage['/promise.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['176'][1].init(111, 19, 'listeners === false');
function visit15_176_1(result) {
  _$jscoverage['/promise.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['164'][1].init(18, 16, 'progressListener');
function visit14_164_1(result) {
  _$jscoverage['/promise.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['145'][1].init(27, 12, 'e.stack || e');
function visit13_145_1(result) {
  _$jscoverage['/promise.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['138'][1].init(40, 23, 'typeof v === \'function\'');
function visit12_138_1(result) {
  _$jscoverage['/promise.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['120'][1].init(18, 29, 'obj && obj instanceof Promise');
function visit11_120_1(result) {
  _$jscoverage['/promise.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['86'][1].init(87, 47, '(pendings = promise[PROMISE_PENDINGS]) === false');
function visit10_86_1(result) {
  _$jscoverage['/promise.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['71'][1].init(344, 24, 'promise || new Promise()');
function visit9_71_1(result) {
  _$jscoverage['/promise.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['62'][1].init(40, 24, '!(self instanceof Defer)');
function visit8_62_1(result) {
  _$jscoverage['/promise.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['49'][1].init(208, 9, 'fulfilled');
function visit7_49_1(result) {
  _$jscoverage['/promise.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['41'][1].init(398, 12, 'isPromise(v)');
function visit6_41_1(result) {
  _$jscoverage['/promise.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['39'][1].init(306, 8, 'pendings');
function visit5_39_1(result) {
  _$jscoverage['/promise.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['33'][1].init(120, 22, 'pendings === undefined');
function visit4_33_1(result) {
  _$jscoverage['/promise.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['26'][1].init(47, 25, 'promise instanceof Reject');
function visit3_26_1(result) {
  _$jscoverage['/promise.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['14'][2].init(42, 30, 'typeof console !== \'undefined\'');
function visit2_14_2(result) {
  _$jscoverage['/promise.js'].branchData['14'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['14'][1].init(42, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_14_1(result) {
  _$jscoverage['/promise.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var logger = S.getLogger('s/promise');
  _$jscoverage['/promise.js'].lineData[8]++;
  var PROMISE_VALUE = '__promise_value', PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[12]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[14]++;
    if (visit1_14_1(visit2_14_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[15]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[24]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[26]++;
    if (visit3_26_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[28]++;
      rejected.call(promise, promise[PROMISE_VALUE]);
    } else {
      _$jscoverage['/promise.js'].lineData[30]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[33]++;
      if (visit4_33_1(pendings === undefined)) {
        _$jscoverage['/promise.js'].lineData[34]++;
        pendings = promise[PROMISE_PENDINGS] = [];
      }
      _$jscoverage['/promise.js'].lineData[39]++;
      if (visit5_39_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[40]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[41]++;
        if (visit6_41_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[43]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[49]++;
          if (visit7_49_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[50]++;
            fulfilled.call(promise, v);
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[60]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[3]++;
    _$jscoverage['/promise.js'].lineData[61]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[62]++;
    if (visit8_62_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[63]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[71]++;
    self.promise = visit9_71_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[72]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[75]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[84]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[86]++;
  if (visit10_86_1((pendings = promise[PROMISE_PENDINGS]) === false)) {
    _$jscoverage['/promise.js'].lineData[87]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[91]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[92]++;
  pendings = pendings ? [].concat(pendings) : [];
  _$jscoverage['/promise.js'].lineData[93]++;
  promise[PROMISE_PENDINGS] = false;
  _$jscoverage['/promise.js'].lineData[94]++;
  promise[PROMISE_PROGRESS_LISTENERS] = false;
  _$jscoverage['/promise.js'].lineData[95]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[5]++;
  _$jscoverage['/promise.js'].lineData[96]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[98]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[106]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[113]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[114]++;
  listener(message);
});
}};
  _$jscoverage['/promise.js'].lineData[119]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[9]++;
    _$jscoverage['/promise.js'].lineData[120]++;
    return visit11_120_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[123]++;
  function bind(fn, context) {
    _$jscoverage['/promise.js'].functionData[10]++;
    _$jscoverage['/promise.js'].lineData[124]++;
    return function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[125]++;
  return fn.apply(context, arguments);
};
  }
  _$jscoverage['/promise.js'].lineData[136]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[137]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[138]++;
    if (visit12_138_1(typeof v === 'function')) {
      _$jscoverage['/promise.js'].lineData[139]++;
      var defer = new Defer(self);
      _$jscoverage['/promise.js'].lineData[140]++;
      var resolve = bind(defer.resolve, defer);
      _$jscoverage['/promise.js'].lineData[141]++;
      var reject = bind(defer.reject, defer);
      _$jscoverage['/promise.js'].lineData[142]++;
      try {
        _$jscoverage['/promise.js'].lineData[143]++;
        v(resolve, reject);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[145]++;
  logError(visit13_145_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[146]++;
  reject(e);
}
    }
  }
  _$jscoverage['/promise.js'].lineData[151]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[13]++;
  _$jscoverage['/promise.js'].lineData[164]++;
  if (visit14_164_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[165]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[167]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[174]++;
  var self = this, listeners = self[PROMISE_PROGRESS_LISTENERS];
  _$jscoverage['/promise.js'].lineData[176]++;
  if (visit15_176_1(listeners === false)) {
    _$jscoverage['/promise.js'].lineData[177]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[179]++;
  if (visit16_179_1(!listeners)) {
    _$jscoverage['/promise.js'].lineData[180]++;
    listeners = self[PROMISE_PROGRESS_LISTENERS] = [];
  }
  _$jscoverage['/promise.js'].lineData[182]++;
  listeners.push(progressListener);
  _$jscoverage['/promise.js'].lineData[183]++;
  return self;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[191]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[200]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[201]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[203]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[219]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[221]++;
  S.log(visit17_221_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[222]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[223]++;
  throw e;
}, 0);
}, promiseToHandle = visit18_226_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[229]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[239]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[245]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[254]++;
  Promise.prototype['catch'] = Promise.prototype.fail;
  _$jscoverage['/promise.js'].lineData[263]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[24]++;
    _$jscoverage['/promise.js'].lineData[264]++;
    if (visit19_264_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[265]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[267]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[268]++;
    self[PROMISE_VALUE] = reason;
    _$jscoverage['/promise.js'].lineData[269]++;
    self[PROMISE_PENDINGS] = false;
    _$jscoverage['/promise.js'].lineData[270]++;
    self[PROMISE_PROGRESS_LISTENERS] = false;
    _$jscoverage['/promise.js'].lineData[274]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[277]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[280]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[281]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[285]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[26]++;
      _$jscoverage['/promise.js'].lineData[286]++;
      try {
        _$jscoverage['/promise.js'].lineData[287]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[294]++;
  logError(visit20_294_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[295]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[299]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[300]++;
      try {
        _$jscoverage['/promise.js'].lineData[301]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[308]++;
  logError(visit21_308_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[309]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[313]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[314]++;
      if (visit22_314_1(done)) {
        _$jscoverage['/promise.js'].lineData[315]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[316]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[318]++;
      if (visit23_318_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[319]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[320]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[322]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[323]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[326]++;
    if (visit24_326_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[327]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[29]++;
  _$jscoverage['/promise.js'].lineData[328]++;
  if (visit25_328_1(done)) {
    _$jscoverage['/promise.js'].lineData[329]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[330]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[332]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[334]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[337]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[342]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[345]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[30]++;
    _$jscoverage['/promise.js'].lineData[347]++;
    return visit26_347_1(obj && visit27_347_2(!isRejected(obj) && visit28_351_1((visit29_351_2(obj[PROMISE_PENDINGS] === false)) && (visit30_355_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[362]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[365]++;
    return visit31_365_1(obj && (visit32_365_2(obj instanceof Reject || obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[368]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[369]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[370]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[372]++;
  S.mix(Promise, {
  when: when, 
  cast: function(obj) {
  _$jscoverage['/promise.js'].functionData[32]++;
  _$jscoverage['/promise.js'].lineData[410]++;
  if (visit33_410_1(obj instanceof Promise)) {
    _$jscoverage['/promise.js'].lineData[411]++;
    return obj;
  }
  _$jscoverage['/promise.js'].lineData[413]++;
  return when(obj);
}, 
  resolve: function(obj) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[420]++;
  return when(obj);
}, 
  reject: function(obj) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[429]++;
  return new Reject(obj);
}, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[472]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[473]++;
  if (visit34_473_1(!count)) {
    _$jscoverage['/promise.js'].lineData[474]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[476]++;
  var defer = new Defer();
  _$jscoverage['/promise.js'].lineData[477]++;
  for (var i = 0; visit35_477_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[479]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[480]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[481]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[482]++;
  if (visit36_482_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[485]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[490]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[494]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[39]++;
  _$jscoverage['/promise.js'].lineData[502]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[40]++;
  _$jscoverage['/promise.js'].lineData[503]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[505]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[506]++;
    var result;
    _$jscoverage['/promise.js'].lineData[508]++;
    try {
      _$jscoverage['/promise.js'].lineData[509]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[511]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[513]++;
    if (visit37_513_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[514]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[516]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[519]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[42]++;
    _$jscoverage['/promise.js'].lineData[520]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[523]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[43]++;
    _$jscoverage['/promise.js'].lineData[524]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[527]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[531]++;
  return Promise;
});
