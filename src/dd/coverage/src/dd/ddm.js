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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[7] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[22] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[39] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[49] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[56] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[59] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[60] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[73] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[83] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[86] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[87] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[89] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[91] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[93] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[97] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[100] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[101] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[102] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[111] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[119] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[124] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[125] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[126] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[128] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[129] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[135] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[136] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[137] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[139] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[143] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[145] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[146] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[147] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[252] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[253] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[258] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[259] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[260] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[264] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[265] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[266] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[267] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[269] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[270] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[274] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[277] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[278] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[285] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[287] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[288] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[296] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[297] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[298] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[301] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[308] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[312] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[315] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[317] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[319] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[321] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[330] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[332] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[333] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[334] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[340] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[341] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[342] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[343] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[349] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[350] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[351] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[352] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[354] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[355] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[356] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[357] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[360] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[368] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[370] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[389] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[391] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[395] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[398] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[401] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[402] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[404] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[406] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[413] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[415] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[417] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[418] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[420] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[421] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[423] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[427] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[428] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[435] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[436] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[437] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[440] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[441] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[448] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[449] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[450] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[451] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[452] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[456] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[457] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[458] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[459] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[460] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[461] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[466] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[467] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[468] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[469] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[470] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[471] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[477] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[478] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[479] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[480] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[481] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[483] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[491] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[492] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[498] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[499] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[500] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[502] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[505] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[506] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[510] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[518] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[519] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[522] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[523] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[524] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[525] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[529] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[530] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[531] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[532] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[533] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[534] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[536] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[22] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[23] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[24] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['14'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['59'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['86'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['93'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['98'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['100'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['124'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['125'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['128'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['135'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['139'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['142'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['147'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['258'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['258'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['264'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['266'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['269'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['274'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['277'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['297'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['308'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['315'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['317'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['319'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['324'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['330'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['333'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['338'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['341'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['350'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['355'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['356'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['385'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['391'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['404'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['417'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['420'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['420'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['427'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['440'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['451'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['459'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['469'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['479'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['479'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['485'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['487'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['492'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['492'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['493'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['493'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['495'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['499'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['499'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['523'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['523'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['523'][1].init(14, 4, 'node');
function visit58_523_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][3].init(45, 27, 'region.left >= region.right');
function visit57_499_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][2].init(14, 27, 'region.top >= region.bottom');
function visit56_499_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit55_499_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit54_495_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][2].init(109, 25, 'region.top <= pointer.top');
function visit53_494_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit52_494_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][2].init(63, 28, 'region.right >= pointer.left');
function visit51_493_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit50_493_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][2].init(17, 27, 'region.left <= pointer.left');
function visit49_492_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit48_492_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['487'][1].init(179, 45, 'node.__dd_cached_height || node.outerHeight()');
function visit47_487_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['485'][1].init(68, 43, 'node.__dd_cached_width || node.outerWidth()');
function visit46_485_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['479'][1].init(51, 23, '!node.__dd_cached_width');
function visit45_479_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['469'][1].init(99, 12, 'drops.length');
function visit44_469_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['459'][1].init(99, 12, 'drops.length');
function visit43_459_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['451'][1].init(128, 23, 'doc.body.releaseCapture');
function visit42_451_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['440'][1].init(320, 19, 'doc.body.setCapture');
function visit41_440_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['427'][1].init(421, 3, 'ie6');
function visit40_427_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['420'][1].init(242, 13, 'cur == \'auto\'');
function visit39_420_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['417'][1].init(175, 2, 'ah');
function visit38_417_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['404'][1].init(66, 75, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit37_404_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['391'][1].init(714, 3, 'ie6');
function visit36_391_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['385'][1].init(486, 31, 'doc.body || doc.documentElement');
function visit35_385_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['356'][1].init(18, 21, 'oldDrop != activeDrop');
function visit34_356_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['355'][1].init(2270, 10, 'activeDrop');
function visit33_355_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['350'][2].init(2091, 21, 'oldDrop != activeDrop');
function visit32_350_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['350'][1].init(2080, 32, 'oldDrop && oldDrop != activeDrop');
function visit31_350_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['341'][1].init(122, 13, 'a == dragArea');
function visit30_341_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['338'][1].init(1406, 16, 'mode == \'strict\'');
function visit29_338_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['333'][1].init(131, 9, 'a > vArea');
function visit28_333_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['330'][1].init(1122, 19, 'mode == \'intersect\'');
function visit27_330_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['324'][1].init(81, 9, 'a < vArea');
function visit26_324_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['319'][1].init(71, 11, '!activeDrop');
function visit25_319_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['317'][1].init(56, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit24_317_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['315'][1].init(532, 15, 'mode == \'point\'');
function visit23_315_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['308'][1].init(352, 5, '!node');
function visit22_308_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['297'][1].init(18, 20, 'drop.get(\'disabled\')');
function visit21_297_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['277'][1].init(715, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit20_277_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['274'][1].init(616, 28, '__activeToDrag || activeDrag');
function visit19_274_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['269'][1].init(105, 20, 'self.__needDropCheck');
function visit18_269_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['266'][1].init(350, 35, 'activeDrag = self.get(\'activeDrag\')');
function visit17_266_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['264'][1].init(250, 36, '__activeToDrag = self.__activeToDrag');
function visit16_264_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['258'][2].init(130, 21, 'ev.touches.length > 1');
function visit15_258_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['258'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['258'][1].init(116, 35, 'ev.touches && ev.touches.length > 1');
function visit14_258_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['147'][1].init(901, 10, 'activeDrop');
function visit13_147_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['142'][1].init(761, 11, '!activeDrag');
function visit12_142_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['139'][1].init(679, 10, 'self._shim');
function visit11_139_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['135'][1].init(546, 14, '__activeToDrag');
function visit10_135_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['128'][1].init(126, 10, 'activeDrag');
function visit9_128_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['125'][1].init(22, 14, '__activeToDrag');
function visit8_125_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['124'][1].init(213, 1, 'e');
function visit7_124_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['100'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit6_100_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['98'][1].init(514, 18, 'drag.get(\'groups\')');
function visit5_98_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['93'][1].init(343, 16, 'drag.get(\'shim\')');
function visit4_93_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['86'][1].init(137, 5, '!drag');
function visit3_86_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['59'][1].init(138, 11, 'index != -1');
function visit2_59_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['14'][1].init(196, 14, 'UA[\'ie\'] === 6');
function visit1_14_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add('dd/ddm', function(S, Node, Base, undefined) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var UA = S.UA, $ = Node.all, logger = S.getLogger('dd/ddm'), win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_14_1(UA['ie'] === 6), PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[22]++;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  _$jscoverage['/dd/ddm.js'].lineData[39]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[49]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[56]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[59]++;
  if (visit2_59_1(index != -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[60]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[70]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[72]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[73]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[83]++;
  var self = this, drops = self.get('drops'), drag = self.__activeToDrag;
  _$jscoverage['/dd/ddm.js'].lineData[86]++;
  if (visit3_86_1(!drag)) {
    _$jscoverage['/dd/ddm.js'].lineData[87]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[89]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[91]++;
  self.__activeToDrag = 0;
  _$jscoverage['/dd/ddm.js'].lineData[93]++;
  if (visit4_93_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[94]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[97]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98]++;
  if (visit5_98_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[99]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[100]++;
    if (visit6_100_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[101]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[102]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  _addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[111]++;
  this.get('validDrops').push(drop);
}, 
  _end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[119]++;
  var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get('activeDrag'), activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[124]++;
  if (visit7_124_1(e)) {
    _$jscoverage['/dd/ddm.js'].lineData[125]++;
    if (visit8_125_1(__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[126]++;
      __activeToDrag._move(e);
    }
    _$jscoverage['/dd/ddm.js'].lineData[128]++;
    if (visit9_128_1(activeDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[129]++;
      activeDrag._move(e);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[133]++;
  unRegisterEvent(self);
  _$jscoverage['/dd/ddm.js'].lineData[135]++;
  if (visit10_135_1(__activeToDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[136]++;
    __activeToDrag._end(e);
    _$jscoverage['/dd/ddm.js'].lineData[137]++;
    self.__activeToDrag = 0;
  }
  _$jscoverage['/dd/ddm.js'].lineData[139]++;
  if (visit11_139_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[140]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[142]++;
  if (visit12_142_1(!activeDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[143]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[145]++;
  activeDrag._end(e);
  _$jscoverage['/dd/ddm.js'].lineData[146]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[147]++;
  if (visit13_147_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[148]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[150]++;
  self.setInternal('activeDrag', null);
  _$jscoverage['/dd/ddm.js'].lineData[151]++;
  self.setInternal('activeDrop', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  clickPixelThresh: {
  value: PIXEL_THRESH}, 
  bufferTime: {
  value: BUFFER_TIME}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  value: []}, 
  validDrops: {
  value: []}}});
  _$jscoverage['/dd/ddm.js'].lineData[252]++;
  function move(ev) {
    _$jscoverage['/dd/ddm.js'].functionData[7]++;
    _$jscoverage['/dd/ddm.js'].lineData[253]++;
    var self = this, drag, __activeToDrag, activeDrag;
    _$jscoverage['/dd/ddm.js'].lineData[258]++;
    if (visit14_258_1(ev.touches && visit15_258_2(ev.touches.length > 1))) {
      _$jscoverage['/dd/ddm.js'].lineData[259]++;
      ddm._end();
      _$jscoverage['/dd/ddm.js'].lineData[260]++;
      return;
    }
    _$jscoverage['/dd/ddm.js'].lineData[264]++;
    if (visit16_264_1(__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[265]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[266]++;
      if (visit17_266_1(activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[267]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[269]++;
        if (visit18_269_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[270]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[274]++;
    drag = visit19_274_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[277]++;
    if (visit20_277_1(drag && drag.get('preventDefaultOnMove'))) {
      _$jscoverage['/dd/ddm.js'].lineData[278]++;
      ev.preventDefault();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[285]++;
  var throttleMove = UA.ie ? S.throttle(move, MOVE_DELAY) : move;
  _$jscoverage['/dd/ddm.js'].lineData[287]++;
  function notifyDropsMove(self, ev, activeDrag) {
    _$jscoverage['/dd/ddm.js'].functionData[8]++;
    _$jscoverage['/dd/ddm.js'].lineData[288]++;
    var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
    _$jscoverage['/dd/ddm.js'].lineData[296]++;
    S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[297]++;
  if (visit21_297_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[298]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[301]++;
  var a, node = drop['getNodeFromTarget'](ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[308]++;
  if (visit22_308_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[312]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[315]++;
  if (visit23_315_1(mode == 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[317]++;
    if (visit24_317_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[318]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[319]++;
      if (visit25_319_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[320]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[321]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[324]++;
        if (visit26_324_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[325]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[326]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[330]++;
    if (visit27_330_1(mode == 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[332]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[333]++;
      if (visit28_333_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[334]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[335]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[338]++;
      if (visit29_338_1(mode == 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[340]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[341]++;
        if (visit30_341_1(a == dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[342]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[343]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[346]++;
  return undefined;
});
    _$jscoverage['/dd/ddm.js'].lineData[349]++;
    oldDrop = self.get('activeDrop');
    _$jscoverage['/dd/ddm.js'].lineData[350]++;
    if (visit31_350_1(oldDrop && visit32_350_2(oldDrop != activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[351]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[352]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[354]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[355]++;
    if (visit33_355_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[356]++;
      if (visit34_356_1(oldDrop != activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[357]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[360]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[368]++;
  function activeShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[10]++;
    _$jscoverage['/dd/ddm.js'].lineData[370]++;
    self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit35_385_1(doc.body || doc.documentElement)).css('opacity', 0);
    _$jscoverage['/dd/ddm.js'].lineData[389]++;
    activeShim = showShim;
    _$jscoverage['/dd/ddm.js'].lineData[391]++;
    if (visit36_391_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[395]++;
      $win.on('resize scroll', adjustShimSize, self);
    }
    _$jscoverage['/dd/ddm.js'].lineData[398]++;
    showShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[404]++;
  if (visit37_404_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[406]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[413]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[415]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[417]++;
    if (visit38_417_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[418]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[420]++;
    if (visit39_420_1(cur == 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[421]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[423]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[427]++;
    if (visit40_427_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[428]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[435]++;
  function registerEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[436]++;
    $doc.on(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[437]++;
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[440]++;
    if (visit41_440_1(doc.body.setCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[441]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[448]++;
  function unRegisterEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[449]++;
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[450]++;
    $doc.detach(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[451]++;
    if (visit42_451_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[452]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[456]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[15]++;
    _$jscoverage['/dd/ddm.js'].lineData[457]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[458]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[459]++;
    if (visit43_459_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[460]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[16]++;
  _$jscoverage['/dd/ddm.js'].lineData[461]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[466]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[467]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[468]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[469]++;
    if (visit44_469_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[470]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[18]++;
  _$jscoverage['/dd/ddm.js'].lineData[471]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[477]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[478]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[479]++;
    if (visit45_479_1(!node.__dd_cached_width)) {
      _$jscoverage['/dd/ddm.js'].lineData[480]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[481]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[483]++;
    return {
  left: offset.left, 
  right: offset.left + (visit46_485_1(node.__dd_cached_width || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit47_487_1(node.__dd_cached_height || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[491]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[492]++;
    return visit48_492_1(visit49_492_2(region.left <= pointer.left) && visit50_493_1(visit51_493_2(region.right >= pointer.left) && visit52_494_1(visit53_494_2(region.top <= pointer.top) && visit54_495_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[498]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[499]++;
    if (visit55_499_1(visit56_499_2(region.top >= region.bottom) || visit57_499_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[500]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[502]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[505]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[506]++;
    var t = Math.max(r1['top'], r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1['bottom'], r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[510]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[518]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[519]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[522]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[24]++;
    _$jscoverage['/dd/ddm.js'].lineData[523]++;
    if (visit58_523_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[524]++;
      node.__dd_cached_width = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[525]++;
      node.__dd_cached_height = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[529]++;
  var ddm = new DDM();
  _$jscoverage['/dd/ddm.js'].lineData[530]++;
  ddm.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[531]++;
  ddm.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[532]++;
  ddm.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[533]++;
  ddm.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[534]++;
  ddm.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[536]++;
  return ddm;
}, {
  requires: ['node', 'base']});
