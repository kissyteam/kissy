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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[8] = 0;
  _$jscoverage['/base.js'].lineData[10] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[23] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[36] = 0;
  _$jscoverage['/base.js'].lineData[54] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[57] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[61] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[69] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[95] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[132] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[147] = 0;
  _$jscoverage['/base.js'].lineData[148] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[157] = 0;
  _$jscoverage['/base.js'].lineData[167] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[190] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[204] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[226] = 0;
  _$jscoverage['/base.js'].lineData[227] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[248] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[310] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[313] = 0;
  _$jscoverage['/base.js'].lineData[315] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[320] = 0;
  _$jscoverage['/base.js'].lineData[321] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[333] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[338] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[351] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[370] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[405] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[415] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[424] = 0;
  _$jscoverage['/base.js'].lineData[425] = 0;
  _$jscoverage['/base.js'].lineData[426] = 0;
  _$jscoverage['/base.js'].lineData[427] = 0;
  _$jscoverage['/base.js'].lineData[428] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[436] = 0;
  _$jscoverage['/base.js'].lineData[437] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[439] = 0;
  _$jscoverage['/base.js'].lineData[440] = 0;
  _$jscoverage['/base.js'].lineData[445] = 0;
  _$jscoverage['/base.js'].lineData[446] = 0;
  _$jscoverage['/base.js'].lineData[452] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
  _$jscoverage['/base.js'].functionData[22] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['19'] = [];
  _$jscoverage['/base.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['27'] = [];
  _$jscoverage['/base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['28'] = [];
  _$jscoverage['/base.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['35'] = [];
  _$jscoverage['/base.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['60'] = [];
  _$jscoverage['/base.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['113'] = [];
  _$jscoverage['/base.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['119'] = [];
  _$jscoverage['/base.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['120'] = [];
  _$jscoverage['/base.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['122'] = [];
  _$jscoverage['/base.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['127'] = [];
  _$jscoverage['/base.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'] = [];
  _$jscoverage['/base.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['130'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['131'] = [];
  _$jscoverage['/base.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'] = [];
  _$jscoverage['/base.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['152'] = [];
  _$jscoverage['/base.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['169'] = [];
  _$jscoverage['/base.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'] = [];
  _$jscoverage['/base.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['176'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['177'] = [];
  _$jscoverage['/base.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['182'] = [];
  _$jscoverage['/base.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['189'] = [];
  _$jscoverage['/base.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'] = [];
  _$jscoverage['/base.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['208'] = [];
  _$jscoverage['/base.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['222'] = [];
  _$jscoverage['/base.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['305'] = [];
  _$jscoverage['/base.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['315'] = [];
  _$jscoverage['/base.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['321'] = [];
  _$jscoverage['/base.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['332'] = [];
  _$jscoverage['/base.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['340'] = [];
  _$jscoverage['/base.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['350'] = [];
  _$jscoverage['/base.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['350'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['363'] = [];
  _$jscoverage['/base.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['367'] = [];
  _$jscoverage['/base.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['370'] = [];
  _$jscoverage['/base.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['404'] = [];
  _$jscoverage['/base.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['413'] = [];
  _$jscoverage['/base.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['424'] = [];
  _$jscoverage['/base.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['427'] = [];
  _$jscoverage['/base.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['429'] = [];
  _$jscoverage['/base.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['438'] = [];
  _$jscoverage['/base.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'] = [];
  _$jscoverage['/base.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['440'] = [];
  _$jscoverage['/base.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['445'] = [];
  _$jscoverage['/base.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['446'] = [];
  _$jscoverage['/base.js'].branchData['446'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['446'][1].init(37, 10, 'args || []');
function visit50_446_1(result) {
  _$jscoverage['/base.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['445'][1].init(220, 2, 'fn');
function visit49_445_1(result) {
  _$jscoverage['/base.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['440'][1].init(27, 170, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit48_440_1(result) {
  _$jscoverage['/base.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['439'][1].init(30, 7, 'i < len');
function visit47_439_1(result) {
  _$jscoverage['/base.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['438'][1].init(39, 31, 'extensions && extensions.length');
function visit46_438_1(result) {
  _$jscoverage['/base.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['429'][1].init(64, 2, 'fn');
function visit45_429_1(result) {
  _$jscoverage['/base.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['427'][1].init(30, 7, 'i < len');
function visit44_427_1(result) {
  _$jscoverage['/base.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['424'][1].init(109, 10, 'args || []');
function visit43_424_1(result) {
  _$jscoverage['/base.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['413'][1].init(18, 28, 'typeof plugin === \'function\'');
function visit42_413_1(result) {
  _$jscoverage['/base.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['404'][1].init(89, 17, 'e.target === self');
function visit41_404_1(result) {
  _$jscoverage['/base.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['370'][1].init(212, 13, 'px[h] || noop');
function visit40_370_1(result) {
  _$jscoverage['/base.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['367'][1].init(85, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit39_367_1(result) {
  _$jscoverage['/base.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['363'][1].init(161, 26, 'extensions.length && hooks');
function visit38_363_1(result) {
  _$jscoverage['/base.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['350'][2].init(2026, 15, 'sx && sx.extend');
function visit37_350_2(result) {
  _$jscoverage['/base.js'].branchData['350'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['350'][1].init(2026, 25, 'sx && sx.extend || extend');
function visit36_350_1(result) {
  _$jscoverage['/base.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['340'][1].init(96, 21, 'exp.hasOwnProperty(p)');
function visit35_340_1(result) {
  _$jscoverage['/base.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['332'][1].init(53, 17, 'attrs[name] || {}');
function visit34_332_1(result) {
  _$jscoverage['/base.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['321'][1].init(26, 3, 'ext');
function visit33_321_1(result) {
  _$jscoverage['/base.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['315'][1].init(439, 17, 'extensions.length');
function visit32_315_1(result) {
  _$jscoverage['/base.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['305'][1].init(18, 25, '!util.isArray(extensions)');
function visit31_305_1(result) {
  _$jscoverage['/base.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['222'][1].init(99, 22, '!self.get(\'destroyed\')');
function visit30_222_1(result) {
  _$jscoverage['/base.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['208'][1].init(144, 15, 'pluginId === id');
function visit29_208_1(result) {
  _$jscoverage['/base.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][2].init(81, 26, 'p.get && p.get(\'pluginId\')');
function visit28_207_2(result) {
  _$jscoverage['/base.js'].branchData['207'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][1].init(81, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit27_207_1(result) {
  _$jscoverage['/base.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['189'][1].init(660, 5, '!keep');
function visit26_189_1(result) {
  _$jscoverage['/base.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['182'][1].init(30, 12, 'p !== plugin');
function visit25_182_1(result) {
  _$jscoverage['/base.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['177'][1].init(164, 19, 'pluginId !== plugin');
function visit24_177_1(result) {
  _$jscoverage['/base.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][2].init(93, 26, 'p.get && p.get(\'pluginId\')');
function visit23_176_2(result) {
  _$jscoverage['/base.js'].branchData['176'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['176'][1].init(93, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit22_176_1(result) {
  _$jscoverage['/base.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(26, 8, 'isString');
function visit21_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(63, 6, 'plugin');
function visit20_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['169'][1].init(75, 26, 'typeof plugin === \'string\'');
function visit19_169_1(result) {
  _$jscoverage['/base.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['152'][1].init(273, 24, 'plugin.pluginInitializer');
function visit18_152_1(result) {
  _$jscoverage['/base.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][1].init(48, 28, 'typeof plugin === \'function\'');
function visit17_146_1(result) {
  _$jscoverage['/base.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['131'][1].init(64, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit16_131_1(result) {
  _$jscoverage['/base.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][2].init(435, 31, 'attrs[attributeName].sync !== 0');
function visit15_130_2(result) {
  _$jscoverage['/base.js'].branchData['130'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['130'][1].init(177, 120, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit14_130_1(result) {
  _$jscoverage['/base.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['127'][1].init(255, 298, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit13_127_1(result) {
  _$jscoverage['/base.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['122'][1].init(26, 22, 'attributeName in attrs');
function visit12_122_1(result) {
  _$jscoverage['/base.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['120'][1].init(30, 17, 'cs[i].ATTRS || {}');
function visit11_120_1(result) {
  _$jscoverage['/base.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['119'][1].init(394, 13, 'i < cs.length');
function visit10_119_1(result) {
  _$jscoverage['/base.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['113'][1].init(51, 40, 'c.superclass && c.superclass.constructor');
function visit9_113_1(result) {
  _$jscoverage['/base.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(67, 7, 'self[m]');
function visit8_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['60'][1].init(184, 9, 'listeners');
function visit7_60_1(result) {
  _$jscoverage['/base.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['35'][1].init(26, 15, 'origFn !== noop');
function visit6_35_1(result) {
  _$jscoverage['/base.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(657, 7, 'reverse');
function visit5_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['28'][1].init(487, 7, 'reverse');
function visit4_28_1(result) {
  _$jscoverage['/base.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['27'][1].init(417, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit3_27_1(result) {
  _$jscoverage['/base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['19'][1].init(26, 15, 'origFn !== noop');
function visit2_19_1(result) {
  _$jscoverage['/base.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(56, 7, 'reverse');
function visit1_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/base.js'].lineData[8]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[10]++;
  var ucfirst = util.ucfirst, ON_SET = '_onSet', noop = util.noop;
  _$jscoverage['/base.js'].lineData[14]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[15]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[16]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[17]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[18]++;
  if (visit1_18_1(reverse)) {
    _$jscoverage['/base.js'].lineData[19]++;
    if (visit2_19_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[20]++;
      origFn.apply(self, arguments);
    }
  } else {
    _$jscoverage['/base.js'].lineData[23]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[27]++;
  var extensions = visit3_27_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[28]++;
  if (visit4_28_1(reverse)) {
    _$jscoverage['/base.js'].lineData[29]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[31]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[32]++;
  if (visit5_32_1(reverse)) {
    _$jscoverage['/base.js'].lineData[33]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[35]++;
    if (visit6_35_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[36]++;
      origFn.apply(self, arguments);
    }
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[54]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[56]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[57]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[59]++;
  var listeners = self.get('listeners');
  _$jscoverage['/base.js'].lineData[60]++;
  if (visit7_60_1(listeners)) {
    _$jscoverage['/base.js'].lineData[61]++;
    for (var n in listeners) {
      _$jscoverage['/base.js'].lineData[62]++;
      self.on(n, listeners[n]);
    }
  }
  _$jscoverage['/base.js'].lineData[66]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[68]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[69]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[71]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[73]++;
  self.syncInternal();
}, 
  initializer: noop, 
  __getHook: __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[87]++;
  var self = this, attrs = self.getAttrs(), attr, m;
  _$jscoverage['/base.js'].lineData[91]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[92]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[93]++;
    if (visit8_93_1(self[m])) {
      _$jscoverage['/base.js'].lineData[95]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[105]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[111]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[112]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[113]++;
    c = visit9_113_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[116]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[119]++;
  for (i = 0; visit10_119_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[120]++;
    var ATTRS = visit11_120_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[121]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[122]++;
      if (visit12_122_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[123]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[125]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[127]++;
        if (visit13_127_1((onSetMethod = self[onSetMethodName]) && visit14_130_1(visit15_130_2(attrs[attributeName].sync !== 0) && visit16_131_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[132]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  plug: function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[145]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[146]++;
  if (visit17_146_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[147]++;
    var Plugin = plugin;
    _$jscoverage['/base.js'].lineData[148]++;
    plugin = new Plugin();
  }
  _$jscoverage['/base.js'].lineData[152]++;
  if (visit18_152_1(plugin.pluginInitializer)) {
    _$jscoverage['/base.js'].lineData[154]++;
    plugin.pluginInitializer(self);
  }
  _$jscoverage['/base.js'].lineData[156]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[157]++;
  return self;
}, 
  unplug: function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[167]++;
  var plugins = [], self = this, isString = visit19_169_1(typeof plugin === 'string');
  _$jscoverage['/base.js'].lineData[171]++;
  util.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[172]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[173]++;
  if (visit20_173_1(plugin)) {
    _$jscoverage['/base.js'].lineData[174]++;
    if (visit21_174_1(isString)) {
      _$jscoverage['/base.js'].lineData[176]++;
      pluginId = visit22_176_1(visit23_176_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[177]++;
      if (visit24_177_1(pluginId !== plugin)) {
        _$jscoverage['/base.js'].lineData[178]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[179]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[182]++;
      if (visit25_182_1(p !== plugin)) {
        _$jscoverage['/base.js'].lineData[183]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[184]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[189]++;
  if (visit26_189_1(!keep)) {
    _$jscoverage['/base.js'].lineData[190]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[194]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[195]++;
  return self;
}, 
  getPlugin: function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[204]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[205]++;
  util.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[207]++;
  var pluginId = visit27_207_1(visit28_207_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[208]++;
  if (visit29_208_1(pluginId === id)) {
    _$jscoverage['/base.js'].lineData[209]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[210]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[212]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[214]++;
  return plugin;
}, 
  destructor: noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[220]++;
  var self = this, args = util.makeArray(arguments);
  _$jscoverage['/base.js'].lineData[222]++;
  if (visit30_222_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[223]++;
    callPluginsMethod.call(self, 'pluginDestructor', args);
    _$jscoverage['/base.js'].lineData[224]++;
    self.destructor.apply(self, args);
    _$jscoverage['/base.js'].lineData[225]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[226]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[227]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[232]++;
  util.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  valueFn: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[248]++;
  return [];
}}, 
  destroyed: {
  value: false}, 
  listeners: {}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[305]++;
  if (visit31_305_1(!util.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[306]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[307]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[308]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[310]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[311]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[313]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[315]++;
  if (visit32_315_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[316]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[320]++;
    util.each(extensions.concat(SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[321]++;
  if (visit33_321_1(ext)) {
    _$jscoverage['/base.js'].lineData[331]++;
    util.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[332]++;
  var av = attrs[name] = visit34_332_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[333]++;
  util.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[336]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[338]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[340]++;
      if (visit35_340_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[341]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[346]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[347]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[348]++;
    util.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[350]++;
  SubClass.extend = visit36_350_1(visit37_350_2(sx && sx.extend) || extend);
  _$jscoverage['/base.js'].lineData[351]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[352]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[356]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[358]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[359]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[360]++;
    var extensions = self.__extensions__, hooks = self.__hooks__, proto = self.prototype;
    _$jscoverage['/base.js'].lineData[363]++;
    if (visit38_363_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[365]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[367]++;
        if (visit39_367_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[368]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[370]++;
        px[h] = visit40_370_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[373]++;
    return addMembers.call(self, px);
  }
  _$jscoverage['/base.js'].lineData[400]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[401]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[404]++;
    if (visit41_404_1(e.target === self)) {
      _$jscoverage['/base.js'].lineData[405]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[406]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[410]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[19]++;
    _$jscoverage['/base.js'].lineData[411]++;
    var plugins = self.get('plugins'), Plugin;
    _$jscoverage['/base.js'].lineData[412]++;
    util.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[20]++;
  _$jscoverage['/base.js'].lineData[413]++;
  if (visit42_413_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[414]++;
    Plugin = plugin;
    _$jscoverage['/base.js'].lineData[415]++;
    plugins[i] = new Plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[420]++;
  function callPluginsMethod(method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[421]++;
    var len, fn, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[424]++;
    args = visit43_424_1(args || []);
    _$jscoverage['/base.js'].lineData[425]++;
    args = [self].concat(args);
    _$jscoverage['/base.js'].lineData[426]++;
    if ((len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[427]++;
      for (var i = 0; visit44_427_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[428]++;
        fn = plugins[i][method];
        _$jscoverage['/base.js'].lineData[429]++;
        if (visit45_429_1(fn)) {
          _$jscoverage['/base.js'].lineData[430]++;
          fn.apply(plugins[i], args);
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[436]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[22]++;
    _$jscoverage['/base.js'].lineData[437]++;
    var len;
    _$jscoverage['/base.js'].lineData[438]++;
    if ((len = visit46_438_1(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[439]++;
      for (var i = 0; visit47_439_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[440]++;
        var fn = visit48_440_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[445]++;
        if (visit49_445_1(fn)) {
          _$jscoverage['/base.js'].lineData[446]++;
          fn.apply(self, visit50_446_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[452]++;
  return Base;
});
