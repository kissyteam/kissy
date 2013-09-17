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
  _$jscoverage['/dd/ddm.js'].lineData[40] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[50] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[57] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[60] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[61] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[71] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[73] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[74] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[84] = 0;
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
  _$jscoverage['/dd/ddm.js'].lineData[390] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[392] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[396] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[402] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[403] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[405] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[407] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[414] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[416] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[418] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[419] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[421] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[422] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[424] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[428] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[429] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[436] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[437] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[438] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[441] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[442] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[449] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[450] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[451] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[452] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[453] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[457] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[458] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[459] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[460] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[461] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[462] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[467] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[468] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[469] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[470] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[471] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[472] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[478] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[479] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[480] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[481] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[482] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[484] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[492] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[493] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[499] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[500] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[501] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[503] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[506] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[507] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[511] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[519] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[520] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[523] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[524] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[525] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[526] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[530] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[531] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[532] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[533] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[534] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[535] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[537] = 0;
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
  _$jscoverage['/dd/ddm.js'].branchData['60'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['60'][1] = new BranchData();
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
  _$jscoverage['/dd/ddm.js'].branchData['265'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['267'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['267'][1] = new BranchData();
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
  _$jscoverage['/dd/ddm.js'].branchData['386'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['392'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['405'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['418'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['421'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['428'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['441'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['452'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['460'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['470'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['470'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['480'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['486'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['488'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['488'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['493'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['493'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['493'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['494'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['494'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['495'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['495'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['495'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['496'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['500'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['500'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['500'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['524'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['524'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['524'][1].init(14, 4, 'node');
function visit58_524_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['524'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['500'][3].init(45, 27, 'region.left >= region.right');
function visit57_500_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['500'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['500'][2].init(14, 27, 'region.top >= region.bottom');
function visit56_500_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['500'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['500'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit55_500_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['496'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit54_496_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][2].init(109, 25, 'region.top <= pointer.top');
function visit53_495_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['495'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit52_495_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['495'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][2].init(63, 28, 'region.right >= pointer.left');
function visit51_494_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['494'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit50_494_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['494'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][2].init(17, 27, 'region.left <= pointer.left');
function visit49_493_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['493'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit48_493_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['493'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['488'][1].init(179, 45, 'node.__dd_cached_height || node.outerHeight()');
function visit47_488_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['488'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['486'][1].init(68, 43, 'node.__dd_cached_width || node.outerWidth()');
function visit46_486_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['480'][1].init(51, 23, '!node.__dd_cached_width');
function visit45_480_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['470'][1].init(99, 12, 'drops.length');
function visit44_470_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['470'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['460'][1].init(99, 12, 'drops.length');
function visit43_460_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['452'][1].init(128, 23, 'doc.body.releaseCapture');
function visit42_452_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['441'][1].init(320, 19, 'doc.body.setCapture');
function visit41_441_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['428'][1].init(421, 3, 'ie6');
function visit40_428_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['421'][1].init(242, 13, 'cur == \'auto\'');
function visit39_421_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['418'][1].init(175, 2, 'ah');
function visit38_418_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['405'][1].init(66, 75, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit37_405_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['392'][1].init(714, 3, 'ie6');
function visit36_392_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['386'][1].init(486, 31, 'doc.body || doc.documentElement');
function visit35_386_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['357'][1].init(18, 21, 'oldDrop != activeDrop');
function visit34_357_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['356'][1].init(2270, 10, 'activeDrop');
function visit33_356_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['351'][2].init(2091, 21, 'oldDrop != activeDrop');
function visit32_351_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['351'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['351'][1].init(2080, 32, 'oldDrop && oldDrop != activeDrop');
function visit31_351_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['342'][1].init(122, 13, 'a == dragArea');
function visit30_342_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['342'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['339'][1].init(1406, 16, 'mode == \'strict\'');
function visit29_339_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['334'][1].init(131, 9, 'a > vArea');
function visit28_334_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['331'][1].init(1122, 19, 'mode == \'intersect\'');
function visit27_331_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['325'][1].init(81, 9, 'a < vArea');
function visit26_325_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['320'][1].init(71, 11, '!activeDrop');
function visit25_320_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['318'][1].init(56, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit24_318_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['316'][1].init(532, 15, 'mode == \'point\'');
function visit23_316_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['309'][1].init(352, 5, '!node');
function visit22_309_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['298'][1].init(18, 20, 'drop.get(\'disabled\')');
function visit21_298_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['278'][1].init(715, 40, 'drag && drag.get(\'preventDefaultOnMove\')');
function visit20_278_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['275'][1].init(616, 28, '__activeToDrag || activeDrag');
function visit19_275_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['270'][1].init(105, 20, 'self.__needDropCheck');
function visit18_270_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['267'][1].init(350, 35, 'activeDrag = self.get(\'activeDrag\')');
function visit17_267_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['265'][1].init(250, 36, '__activeToDrag = self.__activeToDrag');
function visit16_265_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['259'][2].init(130, 21, 'ev.touches.length > 1');
function visit15_259_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['259'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['259'][1].init(116, 35, 'ev.touches && ev.touches.length > 1');
function visit14_259_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['148'][1].init(901, 10, 'activeDrop');
function visit13_148_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['143'][1].init(761, 11, '!activeDrag');
function visit12_143_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['140'][1].init(679, 10, 'self._shim');
function visit11_140_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['136'][1].init(546, 14, '__activeToDrag');
function visit10_136_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['129'][1].init(126, 10, 'activeDrag');
function visit9_129_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['126'][1].init(22, 14, '__activeToDrag');
function visit8_126_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['125'][1].init(213, 1, 'e');
function visit7_125_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['101'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit6_101_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['99'][1].init(514, 18, 'drag.get(\'groups\')');
function visit5_99_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['94'][1].init(343, 16, 'drag.get(\'shim\')');
function visit4_94_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['87'][1].init(137, 5, '!drag');
function visit3_87_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['60'][1].init(138, 11, 'index != -1');
function visit2_60_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['60'][1].ranCondition(result);
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
  _$jscoverage['/dd/ddm.js'].lineData[40]++;
  var DDM = Base.extend({
  __activeToDrag: 0, 
  _regDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[50]++;
  this.get('drops').push(d);
}, 
  _unRegDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[57]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[60]++;
  if (visit2_60_1(index != -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[61]++;
    drops.splice(index, 1);
  }
}, 
  _regToDrag: function(drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[71]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[73]++;
  self.__activeToDrag = drag;
  _$jscoverage['/dd/ddm.js'].lineData[74]++;
  registerEvent(self);
}, 
  _start: function() {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[84]++;
  var self = this, drops = self.get('drops'), drag = self.__activeToDrag;
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
    if (visit16_265_1(__activeToDrag = self.__activeToDrag)) {
      _$jscoverage['/dd/ddm.js'].lineData[266]++;
      __activeToDrag._move(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[267]++;
      if (visit17_267_1(activeDrag = self.get('activeDrag'))) {
        _$jscoverage['/dd/ddm.js'].lineData[268]++;
        activeDrag._move(ev);
        _$jscoverage['/dd/ddm.js'].lineData[270]++;
        if (visit18_270_1(self.__needDropCheck)) {
          _$jscoverage['/dd/ddm.js'].lineData[271]++;
          notifyDropsMove(self, ev, activeDrag);
        }
      }
    }
    _$jscoverage['/dd/ddm.js'].lineData[275]++;
    drag = visit19_275_1(__activeToDrag || activeDrag);
    _$jscoverage['/dd/ddm.js'].lineData[278]++;
    if (visit20_278_1(drag && drag.get('preventDefaultOnMove'))) {
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
  if (visit21_298_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[299]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[302]++;
  var a, node = drop['getNodeFromTarget'](ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[309]++;
  if (visit22_309_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[313]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[316]++;
  if (visit23_316_1(mode == 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[318]++;
    if (visit24_318_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[319]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[320]++;
      if (visit25_320_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[321]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[322]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[325]++;
        if (visit26_325_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[326]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[327]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[331]++;
    if (visit27_331_1(mode == 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[333]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[334]++;
      if (visit28_334_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[335]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[336]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[339]++;
      if (visit29_339_1(mode == 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[341]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[342]++;
        if (visit30_342_1(a == dragArea)) {
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
    if (visit31_351_1(oldDrop && visit32_351_2(oldDrop != activeDrop))) {
      _$jscoverage['/dd/ddm.js'].lineData[352]++;
      oldDrop._handleOut(ev);
      _$jscoverage['/dd/ddm.js'].lineData[353]++;
      activeDrag._handleOut(ev);
    }
    _$jscoverage['/dd/ddm.js'].lineData[355]++;
    self.setInternal('activeDrop', activeDrop);
    _$jscoverage['/dd/ddm.js'].lineData[356]++;
    if (visit33_356_1(activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[357]++;
      if (visit34_357_1(oldDrop != activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[358]++;
        activeDrop._handleEnter(ev);
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[361]++;
        activeDrop._handleOver(ev);
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[369]++;
  function activeShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[10]++;
    _$jscoverage['/dd/ddm.js'].lineData[371]++;
    self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + ddm.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit35_386_1(doc.body || doc.documentElement)).css('opacity', 0);
    _$jscoverage['/dd/ddm.js'].lineData[390]++;
    activeShim = showShim;
    _$jscoverage['/dd/ddm.js'].lineData[392]++;
    if (visit36_392_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[396]++;
      $win.on('resize scroll', adjustShimSize, self);
    }
    _$jscoverage['/dd/ddm.js'].lineData[399]++;
    showShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[403]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[405]++;
  if (visit37_405_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[407]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[414]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[416]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[418]++;
    if (visit38_418_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[419]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[421]++;
    if (visit39_421_1(cur == 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[422]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[424]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[428]++;
    if (visit40_428_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[429]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[436]++;
  function registerEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[437]++;
    $doc.on(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[438]++;
    $doc.on(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[441]++;
    if (visit41_441_1(doc.body.setCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[442]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[449]++;
  function unRegisterEvent(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[450]++;
    $doc.detach(DRAG_MOVE_EVENT, throttleMove, self);
    _$jscoverage['/dd/ddm.js'].lineData[451]++;
    $doc.detach(DRAG_END_EVENT, self._end, self);
    _$jscoverage['/dd/ddm.js'].lineData[452]++;
    if (visit42_452_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/ddm.js'].lineData[453]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[457]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[15]++;
    _$jscoverage['/dd/ddm.js'].lineData[458]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[459]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[460]++;
    if (visit43_460_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[461]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[16]++;
  _$jscoverage['/dd/ddm.js'].lineData[462]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[467]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[468]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[469]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[470]++;
    if (visit44_470_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[471]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[18]++;
  _$jscoverage['/dd/ddm.js'].lineData[472]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[478]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[479]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[480]++;
    if (visit45_480_1(!node.__dd_cached_width)) {
      _$jscoverage['/dd/ddm.js'].lineData[481]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[482]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[484]++;
    return {
  left: offset.left, 
  right: offset.left + (visit46_486_1(node.__dd_cached_width || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit47_488_1(node.__dd_cached_height || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[492]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[493]++;
    return visit48_493_1(visit49_493_2(region.left <= pointer.left) && visit50_494_1(visit51_494_2(region.right >= pointer.left) && visit52_495_1(visit53_495_2(region.top <= pointer.top) && visit54_496_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[499]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[500]++;
    if (visit55_500_1(visit56_500_2(region.top >= region.bottom) || visit57_500_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[501]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[503]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[506]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[507]++;
    var t = Math.max(r1['top'], r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1['bottom'], r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[511]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[519]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[520]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[523]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[24]++;
    _$jscoverage['/dd/ddm.js'].lineData[524]++;
    if (visit58_524_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[525]++;
      node.__dd_cached_width = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[526]++;
      node.__dd_cached_height = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[530]++;
  var ddm = new DDM();
  _$jscoverage['/dd/ddm.js'].lineData[531]++;
  ddm.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[532]++;
  ddm.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[533]++;
  ddm.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[534]++;
  ddm.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[535]++;
  ddm.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[537]++;
  return ddm;
}, {
  requires: ['node', 'base']});
