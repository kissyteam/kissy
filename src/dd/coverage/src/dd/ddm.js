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
  _$jscoverage['/dd/ddm.js'].lineData[24] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[41] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[51] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[58] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[61] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[62] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[74] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[75] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[85] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[87] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[88] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[90] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[92] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[95] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[100] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[101] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[102] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[103] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[112] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[120] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[125] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[126] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[127] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[129] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[130] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[134] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[136] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[137] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[138] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[141] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[143] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[144] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[146] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[147] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[149] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[152] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[253] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[254] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[259] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[260] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[261] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[265] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[266] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[267] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[268] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[270] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[271] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[275] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[278] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[279] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[286] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[288] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[289] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[297] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[298] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[299] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[302] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[309] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[316] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[319] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[321] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[331] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[333] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[334] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[341] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[342] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[343] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[344] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[350] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[351] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[352] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[353] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[355] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[356] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[357] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[358] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[361] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[369] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[371] = 0;
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
  _$jscoverage['/dd/ddm.js'].branchData['16'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['61'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['87'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['94'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['99'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['101'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['125'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['126'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['129'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['136'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['140'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['143'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['148'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['259'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['259'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['270'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['275'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['278'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['298'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['309'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['316'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['318'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['320'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['325'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['331'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['334'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['339'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['342'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['342'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['351'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['351'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['356'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['357'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['357'][1] = new BranchData();
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
_$jscoverage['/dd/ddm.js'].branchData['523'][1].init(13, 4, 'node');
function visit56_523_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['523'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][3].init(44, 27, 'region.left >= region.right');
function visit55_499_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][2].init(13, 27, 'region.top >= region.bottom');
function visit54_499_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['499'][1].init(13, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit53_499_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][1].init(40, 28, 'region.bottom >= pointer.top');
function visit52_495_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][2].init(106, 25, 'region.top <= pointer.top');
function visit51_494_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][1].init(43, 69, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit50_494_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][2].init(61, 28, 'region.right >= pointer.left');
function visit49_493_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][1].init(42, 113, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit48_493_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][2].init(16, 27, 'region.left <= pointer.left');
function visit47_492_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['492'][1].init(16, 156, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit46_492_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['487'][1].init(173, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit45_487_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['485'][1].init(66, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit44_485_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['479'][1].init(49, 21, '!node.__ddCachedWidth');
function visit43_479_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['479'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['469'][1].init(96, 12, 'drops.length');
function visit42_469_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['459'][1].init(96, 12, 'drops.length');
function visit41_459_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['451'][1].init(125, 23, 'doc.body.releaseCapture');
function visit40_451_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['440'][1].init(315, 19, 'doc.body.setCapture');
function visit39_440_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['427'][1].init(408, 3, 'ie6');
function visit38_427_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['420'][1].init(235, 14, 'cur === \'auto\'');
function visit37_420_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['420'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['417'][1].init(171, 2, 'ah');
function visit36_417_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['404'][1].init(63, 74, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit35_404_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['391'][1].init(679, 3, 'ie6');
function visit34_391_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['385'][1].init(459, 31, 'doc.body || doc.documentElement');
function visit33_385_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['357'][1].init(17, 22, 'oldDrop !== activeDrop');
function visit32_357_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['356'][1].init(2204, 10, 'activeDrop');
function visit31_356_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['351'][2].init(2029, 22, 'oldDrop !== activeDrop');
function visit30_351_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['351'][1].init(2018, 33, 'oldDrop && oldDrop !== activeDrop');
function visit29_351_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['342'][1].init(119, 14, 'a === dragArea');
function visit28_342_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['339'][1].init(1363, 17, 'mode === \'strict\'');
function visit27_339_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['334'][1].init(128, 9, 'a > vArea');
function visit26_334_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['331'][1].init(1086, 20, 'mode === \'intersect\'');
function visit25_331_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['325'][1].init(79, 9, 'a < vArea');
function visit24_325_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['320'][1].init(69, 11, '!activeDrop');
function visit23_320_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['318'][1].init(54, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit22_318_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['316'][1].init(510, 16, 'mode === \'point\'');
function visit21_316_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['309'][1].init(337, 5, '!node');
function visit20_309_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['298'][1].init(17, 20, 'drop.get(\'disabled\')');
function visit19_298_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['278'][1].init(694, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit18_278_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['275'][1].init(598, 28, '__activeToDrag || activeDrag');
function visit17_275_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['270'][1].init(102, 20, 'self.__needDropCheck');
function visit16_270_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['259'][2].init(124, 21, 'ev.touches.length > 1');
function visit15_259_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['259'][1].init(110, 35, 'ev.touches && ev.touches.length > 1');
function visit14_259_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['148'][1].init(872, 10, 'activeDrop');
function visit13_148_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['143'][1].init(737, 11, '!activeDrag');
function visit12_143_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['140'][1].init(658, 10, 'self._shim');
function visit11_140_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['136'][1].init(529, 14, '__activeToDrag');
function visit10_136_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['129'][1].init(122, 10, 'activeDrag');
function visit9_129_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['126'][1].init(21, 14, '__activeToDrag');
function visit8_126_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['125'][1].init(207, 1, 'e');
function visit7_125_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['101'][1].init(57, 29, 'self.get(\'validDrops\').length');
function visit6_101_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['99'][1].init(455, 18, 'drag.get(\'groups\')');
function visit5_99_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['94'][1].init(289, 16, 'drag.get(\'shim\')');
function visit4_94_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['87'][1].init(90, 5, '!drag');
function visit3_87_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['61'][1].init(134, 12, 'index !== -1');
function visit2_61_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['16'][1].init(150, 11, 'UA.ie === 6');
function visit1_16_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[9]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[10]++;
  var UA = S.UA, $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_16_1(UA.ie === 6), PIXEL_THRESH = 3, BUFFER_TIME = 1, MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[24]++;
  var Gesture = Node.Gesture, DRAG_MOVE_EVENT = Gesture.move, DRAG_END_EVENT = Gesture.end;
  _$jscoverage['/dd/ddm.js'].lineData[41]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[51]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[58]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[61]++;
  if (visit2_61_1(index !== -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[62]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[72]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[74]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[75]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[85]++;
  var self = this, drag = self.__activeToDrag;
  _$jscoverage['/dd/ddm.js'].lineData[87]++;
  if (visit3_87_1(!drag)) {
    _$jscoverage['/dd/ddm.js'].lineData[88]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[90]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[92]++;
  self.__activeToDrag = 0;
  _$jscoverage['/dd/ddm.js'].lineData[94]++;
  if (visit4_94_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[95]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[98]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[99]++;
  if (visit5_99_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[100]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[101]++;
    if (visit6_101_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[102]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[103]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  _addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[112]++;
  this.get('validDrops').push(drop);
}, 
  _end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[120]++;
  var self = this, __activeToDrag = self.__activeToDrag, activeDrag = self.get('activeDrag'), activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[125]++;
  if (visit7_125_1(e)) {
    _$jscoverage['/dd/ddm.js'].lineData[126]++;
    if (visit8_126_1(__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[127]++;
      __activeToDrag._move(e);
    }
    _$jscoverage['/dd/ddm.js'].lineData[129]++;
    if (visit9_129_1(activeDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[130]++;
      activeDrag._move(e);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[134]++;
  unRegisterEvent(self);
  _$jscoverage['/dd/ddm.js'].lineData[136]++;
  if (visit10_136_1(__activeToDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[137]++;
    __activeToDrag._end(e);
    _$jscoverage['/dd/ddm.js'].lineData[138]++;
    self.__activeToDrag = 0;
  }
  _$jscoverage['/dd/ddm.js'].lineData[140]++;
  if (visit11_140_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[141]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[143]++;
  if (visit12_143_1(!activeDrag)) {
    _$jscoverage['/dd/ddm.js'].lineData[144]++;
    return;
  }
  _$jscoverage['/dd/ddm.js'].lineData[146]++;
  activeDrag._end(e);
  _$jscoverage['/dd/ddm.js'].lineData[147]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[148]++;
  if (visit13_148_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[149]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[151]++;
  self.setInternal('activeDrag', null);
  _$jscoverage['/dd/ddm.js'].lineData[152]++;
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
  _$jscoverage['/dd/ddm.js'].lineData[253]++;
  function move(ev) {
    _$jscoverage['/dd/ddm.js'].functionData[7]++;
    _$jscoverage['/dd/ddm.js'].lineData[254]++;
    var self = this, drag, __activeToDrag, activeDrag;
    _$jscoverage['/dd/ddm.js'].lineData[259]++;
    if (visit14_259_1(ev.touches && visit15_259_2(ev.touches.length > 1))) {
      _$jscoverage['/dd/ddm.js'].lineData[260]++;
      ddm._end();
      _$jscoverage['/dd/ddm.js'].lineData[261]++;
      return;
    }
    _$jscoverage['/dd/ddm.js'].lineData[265]++;
    if ((__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[266]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[267]++;
      if ((activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[268]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[270]++;
        if (visit16_270_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[271]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[275]++;
    drag = visit17_275_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[278]++;
    if (visit18_278_1(drag && drag.get('preventDefaultOnMove'))) {
      _$jscoverage['/dd/ddm.js'].lineData[279]++;
      ev.preventDefault();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[286]++;
  var throttleMove = UA.ie ? S.throttle(move, MOVE_DELAY) : move;
  _$jscoverage['/dd/ddm.js'].lineData[288]++;
  function notifyDropsMove(self, ev, activeDrag) {
    _$jscoverage['/dd/ddm.js'].functionData[8]++;
    _$jscoverage['/dd/ddm.js'].lineData[289]++;
    var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
    _$jscoverage['/dd/ddm.js'].lineData[297]++;
    S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[298]++;
  if (visit19_298_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[299]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[302]++;
  var a, node = drop.getNodeFromTarget(ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[309]++;
  if (visit20_309_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[313]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[316]++;
  if (visit21_316_1(mode === 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[318]++;
    if (visit22_318_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[319]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[320]++;
      if (visit23_320_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[321]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[322]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[325]++;
        if (visit24_325_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[326]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[327]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[331]++;
    if (visit25_331_1(mode === 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[333]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[334]++;
      if (visit26_334_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[335]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[336]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[339]++;
      if (visit27_339_1(mode === 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[341]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[342]++;
        if (visit28_342_1(a === dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[343]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[344]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[347]++;
  return undefined;
});
    _$jscoverage['/dd/ddm.js'].lineData[350]++;
    oldDrop = self.get('activeDrop');
    _$jscoverage['/dd/ddm.js'].lineData[351]++;
    if (visit29_351_1(oldDrop && visit30_351_2(oldDrop !== activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[352]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[353]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[355]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[356]++;
    if (visit31_356_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[357]++;
      if (visit32_357_1(oldDrop !== activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[358]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[361]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[369]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[371]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit33_385_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[389]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[391]++;
  if (visit34_391_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[395]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[398]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[404]++;
  if (visit35_404_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
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
    if (visit36_417_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[418]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[420]++;
    if (visit37_420_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[421]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[423]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[427]++;
    if (visit38_427_1(ie6)) {
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
    if (visit39_440_1(doc.body.setCapture)) {
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
    if (visit40_451_1(doc.body.releaseCapture)) {
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
    if (visit41_459_1(drops.length)) {
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
    if (visit42_469_1(drops.length)) {
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
    if (visit43_479_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[480]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[481]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[483]++;
    return {
  left: offset.left, 
  right: offset.left + (visit44_485_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit45_487_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[491]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[492]++;
    return visit46_492_1(visit47_492_2(region.left <= pointer.left) && visit48_493_1(visit49_493_2(region.right >= pointer.left) && visit50_494_1(visit51_494_2(region.top <= pointer.top) && visit52_495_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[498]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[499]++;
    if (visit53_499_1(visit54_499_2(region.top >= region.bottom) || visit55_499_3(region.left >= region.right))) {
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
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
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
    if (visit56_523_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[524]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[525]++;
      node.__ddCachedHeight = node.outerHeight();
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
});
