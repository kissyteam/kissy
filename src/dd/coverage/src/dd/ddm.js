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
  _$jscoverage['/dd/ddm.js'].lineData[9] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[10] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[25] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[43] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[53] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[60] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[63] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[64] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[74] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[76] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[77] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[87] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[89] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[90] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[92] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[97] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[100] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[101] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[102] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[103] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[104] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[105] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[114] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[122] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[127] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[128] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[129] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[131] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[132] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[136] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[138] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[139] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[143] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[145] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[146] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[149] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[153] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[154] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[255] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[256] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[261] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[262] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[263] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[267] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[268] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[269] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[270] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[272] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[273] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[277] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[280] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[281] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[288] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[290] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[291] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[299] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[300] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[301] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[304] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[311] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[315] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[321] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[323] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[328] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[329] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[333] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[341] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[343] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[344] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[345] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[349] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[352] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[353] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[354] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[355] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[357] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[358] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[359] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[360] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[363] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[371] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[373] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[391] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[393] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[397] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[403] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[404] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[406] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[408] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[415] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[417] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[419] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[420] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[422] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[423] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[425] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[429] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[430] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[437] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[438] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[439] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[442] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[443] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[450] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[451] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[452] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[453] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[454] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[458] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[459] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[460] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[461] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[462] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[463] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[468] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[469] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[470] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[471] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[472] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[473] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[479] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[480] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[481] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[482] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[483] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[485] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[493] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[494] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[500] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[501] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[502] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[504] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[507] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[508] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[512] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[520] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[521] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[524] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[525] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[526] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[527] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[531] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[532] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[533] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[534] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[535] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[536] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[538] = 0;
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
  _$jscoverage['/dd/ddm.js'].branchData['17'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['63'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['89'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['96'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['101'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['103'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['127'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['128'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['131'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['138'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['142'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['145'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['150'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['261'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['261'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['272'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['277'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['280'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['300'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['311'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['318'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['320'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['322'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['327'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['333'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['336'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['341'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['344'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['353'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['358'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['359'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['387'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['393'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['406'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['419'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['422'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['429'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['442'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['453'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['461'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['471'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['481'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['481'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['487'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['489'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['489'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['495'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['495'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['497'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['501'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['501'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['501'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['525'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['525'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['525'][1].init(13, 4, 'node');
function visit56_525_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['525'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['501'][3].init(44, 27, 'region.left >= region.right');
function visit55_501_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['501'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['501'][2].init(13, 27, 'region.top >= region.bottom');
function visit54_501_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['501'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['501'][1].init(13, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit53_501_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['497'][1].init(40, 28, 'region.bottom >= pointer.top');
function visit52_497_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][2].init(106, 25, 'region.top <= pointer.top');
function visit51_496_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][1].init(43, 69, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit50_496_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][2].init(61, 28, 'region.right >= pointer.left');
function visit49_495_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][1].init(42, 113, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit48_495_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][2].init(16, 27, 'region.left <= pointer.left');
function visit47_494_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][1].init(16, 156, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit46_494_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['489'][1].init(173, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit45_489_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['489'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['487'][1].init(66, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit44_487_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['481'][1].init(49, 21, '!node.__ddCachedWidth');
function visit43_481_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['481'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['471'][1].init(96, 12, 'drops.length');
function visit42_471_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['461'][1].init(96, 12, 'drops.length');
function visit41_461_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['453'][1].init(125, 23, 'doc.body.releaseCapture');
function visit40_453_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['442'][1].init(315, 19, 'doc.body.setCapture');
function visit39_442_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['429'][1].init(408, 3, 'ie6');
function visit38_429_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['422'][1].init(235, 14, 'cur === \'auto\'');
function visit37_422_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['419'][1].init(171, 2, 'ah');
function visit36_419_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['406'][1].init(63, 74, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit35_406_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['393'][1].init(679, 3, 'ie6');
function visit34_393_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['387'][1].init(459, 31, 'doc.body || doc.documentElement');
function visit33_387_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['359'][1].init(17, 22, 'oldDrop !== activeDrop');
function visit32_359_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['358'][1].init(2204, 10, 'activeDrop');
function visit31_358_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['353'][2].init(2029, 22, 'oldDrop !== activeDrop');
function visit30_353_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['353'][1].init(2018, 33, 'oldDrop && oldDrop !== activeDrop');
function visit29_353_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['344'][1].init(119, 14, 'a === dragArea');
function visit28_344_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['341'][1].init(1363, 17, 'mode === \'strict\'');
function visit27_341_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['336'][1].init(128, 9, 'a > vArea');
function visit26_336_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['333'][1].init(1086, 20, 'mode === \'intersect\'');
function visit25_333_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['327'][1].init(79, 9, 'a < vArea');
function visit24_327_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['322'][1].init(69, 11, '!activeDrop');
function visit23_322_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['320'][1].init(54, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit22_320_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['318'][1].init(510, 16, 'mode === \'point\'');
function visit21_318_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['311'][1].init(337, 5, '!node');
function visit20_311_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['300'][1].init(17, 20, 'drop.get(\'disabled\')');
function visit19_300_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['280'][1].init(694, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit18_280_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['277'][1].init(598, 28, '__activeToDrag || activeDrag');
function visit17_277_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['272'][1].init(102, 20, 'self.__needDropCheck');
function visit16_272_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['261'][2].init(124, 21, 'ev.touches.length > 1');
function visit15_261_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['261'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['261'][1].init(110, 35, 'ev.touches && ev.touches.length > 1');
function visit14_261_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['150'][1].init(872, 10, 'activeDrop');
function visit13_150_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['145'][1].init(737, 11, '!activeDrag');
function visit12_145_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['142'][1].init(658, 10, 'self._shim');
function visit11_142_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['138'][1].init(529, 14, '__activeToDrag');
function visit10_138_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['131'][1].init(122, 10, 'activeDrag');
function visit9_131_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['128'][1].init(21, 14, '__activeToDrag');
function visit8_128_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['127'][1].init(207, 1, 'e');
function visit7_127_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['103'][1].init(57, 29, 'self.get(\'validDrops\').length');
function visit6_103_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['101'][1].init(455, 18, 'drag.get(\'groups\')');
function visit5_101_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['96'][1].init(289, 16, 'drag.get(\'shim\')');
function visit4_96_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['89'][1].init(90, 5, '!drag');
function visit3_89_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['63'][1].init(134, 12, 'index !== -1');
function visit2_63_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['17'][1].init(151, 11, 'UA.ie === 6');
function visit1_17_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[9]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[10]++;
  var UA = S.UA, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_17_1(UA.ie === 6), PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[25]++;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  _$jscoverage['/dd/ddm.js'].lineData[43]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[53]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[60]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[63]++;
  if (visit2_63_1(index !== -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[64]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[74]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[76]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[77]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[87]++;
  var self = this, drag = self.__activeToDrag;
  _$jscoverage['/dd/ddm.js'].lineData[89]++;
  if (visit3_89_1(!drag)) {
    _$jscoverage['/dd/ddm.js'].lineData[90]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[92]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[94]++;
  self.__activeToDrag = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96]++;
  if (visit4_96_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[97]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[100]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[101]++;
  if (visit5_101_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[102]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[103]++;
    if (visit6_103_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[104]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[105]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  _addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[114]++;
  this.get('validDrops').push(drop);
}, 
  _end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[122]++;
  var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get('activeDrag'), activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[127]++;
  if (visit7_127_1(e)) {
    _$jscoverage['/dd/ddm.js'].lineData[128]++;
    if (visit8_128_1(__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[129]++;
      __activeToDrag._move(e);
    }
    _$jscoverage['/dd/ddm.js'].lineData[131]++;
    if (visit9_131_1(activeDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[132]++;
      activeDrag._move(e);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[136]++;
  unRegisterEvent(self);
  _$jscoverage['/dd/ddm.js'].lineData[138]++;
  if (visit10_138_1(__activeToDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[139]++;
    __activeToDrag._end(e);
    _$jscoverage['/dd/ddm.js'].lineData[140]++;
    self.__activeToDrag = 0;
  }
  _$jscoverage['/dd/ddm.js'].lineData[142]++;
  if (visit11_142_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[143]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[145]++;
  if (visit12_145_1(!activeDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[146]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[148]++;
  activeDrag._end(e);
  _$jscoverage['/dd/ddm.js'].lineData[149]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[150]++;
  if (visit13_150_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[151]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[153]++;
  self.setInternal('activeDrag', null);
  _$jscoverage['/dd/ddm.js'].lineData[154]++;
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
  _$jscoverage['/dd/ddm.js'].lineData[255]++;
  function move(ev) {
    _$jscoverage['/dd/ddm.js'].functionData[7]++;
    _$jscoverage['/dd/ddm.js'].lineData[256]++;
    var self = this, drag, __activeToDrag, activeDrag;
    _$jscoverage['/dd/ddm.js'].lineData[261]++;
    if (visit14_261_1(ev.touches && visit15_261_2(ev.touches.length > 1))) {
      _$jscoverage['/dd/ddm.js'].lineData[262]++;
      ddm._end();
      _$jscoverage['/dd/ddm.js'].lineData[263]++;
      return;
    }
    _$jscoverage['/dd/ddm.js'].lineData[267]++;
    if ((__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[268]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[269]++;
      if ((activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[270]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[272]++;
        if (visit16_272_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[273]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[277]++;
    drag = visit17_277_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[280]++;
    if (visit18_280_1(drag && drag.get('preventDefaultOnMove'))) {
      _$jscoverage['/dd/ddm.js'].lineData[281]++;
      ev.preventDefault();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[288]++;
  var throttleMove = UA.ie ? S.throttle(move, MOVE_DELAY) : move;
  _$jscoverage['/dd/ddm.js'].lineData[290]++;
  function notifyDropsMove(self, ev, activeDrag) {
    _$jscoverage['/dd/ddm.js'].functionData[8]++;
    _$jscoverage['/dd/ddm.js'].lineData[291]++;
    var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
    _$jscoverage['/dd/ddm.js'].lineData[299]++;
    S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[300]++;
  if (visit19_300_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[301]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[304]++;
  var a, node = drop.getNodeFromTarget(ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[311]++;
  if (visit20_311_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[315]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[318]++;
  if (visit21_318_1(mode === 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[320]++;
    if (visit22_320_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[321]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[322]++;
      if (visit23_322_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[323]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[324]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[327]++;
        if (visit24_327_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[328]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[329]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[333]++;
    if (visit25_333_1(mode === 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[335]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[336]++;
      if (visit26_336_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[337]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[338]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[341]++;
      if (visit27_341_1(mode === 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[343]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[344]++;
        if (visit28_344_1(a === dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[345]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[346]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[349]++;
  return undefined;
});
    _$jscoverage['/dd/ddm.js'].lineData[352]++;
    oldDrop = self.get('activeDrop');
    _$jscoverage['/dd/ddm.js'].lineData[353]++;
    if (visit29_353_1(oldDrop && visit30_353_2(oldDrop !== activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[354]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[355]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[357]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[358]++;
    if (visit31_358_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[359]++;
      if (visit32_359_1(oldDrop !== activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[360]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[363]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[371]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[373]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit33_387_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[391]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[393]++;
  if (visit34_393_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[397]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[400]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[403]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[404]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[406]++;
  if (visit35_406_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[408]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[415]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[417]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[419]++;
    if (visit36_419_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[420]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[422]++;
    if (visit37_422_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[423]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[425]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[429]++;
    if (visit38_429_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[430]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[437]++;
  function registerEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[438]++;
    $doc.on(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[439]++;
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[442]++;
    if (visit39_442_1(doc.body.setCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[443]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[450]++;
  function unRegisterEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[451]++;
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[452]++;
    $doc.detach(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[453]++;
    if (visit40_453_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[454]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[458]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[15]++;
    _$jscoverage['/dd/ddm.js'].lineData[459]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[460]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[461]++;
    if (visit41_461_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[462]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[16]++;
  _$jscoverage['/dd/ddm.js'].lineData[463]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[468]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[469]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[470]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[471]++;
    if (visit42_471_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[472]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[18]++;
  _$jscoverage['/dd/ddm.js'].lineData[473]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[479]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[480]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[481]++;
    if (visit43_481_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[482]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[483]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[485]++;
    return {
  left: offset.left, 
  right: offset.left + (visit44_487_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit45_489_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[493]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[494]++;
    return visit46_494_1(visit47_494_2(region.left <= pointer.left) && visit48_495_1(visit49_495_2(region.right >= pointer.left) && visit50_496_1(visit51_496_2(region.top <= pointer.top) && visit52_497_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[500]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[501]++;
    if (visit53_501_1(visit54_501_2(region.top >= region.bottom) || visit55_501_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[502]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[504]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[507]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[508]++;
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[512]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[520]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[521]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[524]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[24]++;
    _$jscoverage['/dd/ddm.js'].lineData[525]++;
    if (visit56_525_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[526]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[527]++;
      node.__ddCachedHeight = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[531]++;
  var ddm = new DDM();
  _$jscoverage['/dd/ddm.js'].lineData[532]++;
  ddm.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[533]++;
  ddm.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[534]++;
  ddm.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[535]++;
  ddm.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[536]++;
  ddm.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[538]++;
  return ddm;
});
