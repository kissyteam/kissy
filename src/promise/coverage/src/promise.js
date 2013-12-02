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
  _$jscoverage['/promise.js'].lineData[14] = 0;
  _$jscoverage['/promise.js'].lineData[16] = 0;
  _$jscoverage['/promise.js'].lineData[17] = 0;
  _$jscoverage['/promise.js'].lineData[26] = 0;
  _$jscoverage['/promise.js'].lineData[28] = 0;
  _$jscoverage['/promise.js'].lineData[30] = 0;
  _$jscoverage['/promise.js'].lineData[31] = 0;
  _$jscoverage['/promise.js'].lineData[34] = 0;
  _$jscoverage['/promise.js'].lineData[39] = 0;
  _$jscoverage['/promise.js'].lineData[40] = 0;
  _$jscoverage['/promise.js'].lineData[43] = 0;
  _$jscoverage['/promise.js'].lineData[44] = 0;
  _$jscoverage['/promise.js'].lineData[50] = 0;
  _$jscoverage['/promise.js'].lineData[51] = 0;
  _$jscoverage['/promise.js'].lineData[52] = 0;
  _$jscoverage['/promise.js'].lineData[63] = 0;
  _$jscoverage['/promise.js'].lineData[64] = 0;
  _$jscoverage['/promise.js'].lineData[65] = 0;
  _$jscoverage['/promise.js'].lineData[66] = 0;
  _$jscoverage['/promise.js'].lineData[74] = 0;
  _$jscoverage['/promise.js'].lineData[75] = 0;
  _$jscoverage['/promise.js'].lineData[78] = 0;
  _$jscoverage['/promise.js'].lineData[87] = 0;
  _$jscoverage['/promise.js'].lineData[89] = 0;
  _$jscoverage['/promise.js'].lineData[90] = 0;
  _$jscoverage['/promise.js'].lineData[94] = 0;
  _$jscoverage['/promise.js'].lineData[95] = 0;
  _$jscoverage['/promise.js'].lineData[96] = 0;
  _$jscoverage['/promise.js'].lineData[97] = 0;
  _$jscoverage['/promise.js'].lineData[98] = 0;
  _$jscoverage['/promise.js'].lineData[99] = 0;
  _$jscoverage['/promise.js'].lineData[101] = 0;
  _$jscoverage['/promise.js'].lineData[109] = 0;
  _$jscoverage['/promise.js'].lineData[116] = 0;
  _$jscoverage['/promise.js'].lineData[117] = 0;
  _$jscoverage['/promise.js'].lineData[118] = 0;
  _$jscoverage['/promise.js'].lineData[124] = 0;
  _$jscoverage['/promise.js'].lineData[125] = 0;
  _$jscoverage['/promise.js'].lineData[135] = 0;
  _$jscoverage['/promise.js'].lineData[136] = 0;
  _$jscoverage['/promise.js'].lineData[138] = 0;
  _$jscoverage['/promise.js'].lineData[139] = 0;
  _$jscoverage['/promise.js'].lineData[141] = 0;
  _$jscoverage['/promise.js'].lineData[142] = 0;
  _$jscoverage['/promise.js'].lineData[146] = 0;
  _$jscoverage['/promise.js'].lineData[159] = 0;
  _$jscoverage['/promise.js'].lineData[160] = 0;
  _$jscoverage['/promise.js'].lineData[162] = 0;
  _$jscoverage['/promise.js'].lineData[169] = 0;
  _$jscoverage['/promise.js'].lineData[170] = 0;
  _$jscoverage['/promise.js'].lineData[172] = 0;
  _$jscoverage['/promise.js'].lineData[180] = 0;
  _$jscoverage['/promise.js'].lineData[189] = 0;
  _$jscoverage['/promise.js'].lineData[190] = 0;
  _$jscoverage['/promise.js'].lineData[192] = 0;
  _$jscoverage['/promise.js'].lineData[208] = 0;
  _$jscoverage['/promise.js'].lineData[210] = 0;
  _$jscoverage['/promise.js'].lineData[211] = 0;
  _$jscoverage['/promise.js'].lineData[212] = 0;
  _$jscoverage['/promise.js'].lineData[218] = 0;
  _$jscoverage['/promise.js'].lineData[228] = 0;
  _$jscoverage['/promise.js'].lineData[234] = 0;
  _$jscoverage['/promise.js'].lineData[245] = 0;
  _$jscoverage['/promise.js'].lineData[246] = 0;
  _$jscoverage['/promise.js'].lineData[247] = 0;
  _$jscoverage['/promise.js'].lineData[249] = 0;
  _$jscoverage['/promise.js'].lineData[250] = 0;
  _$jscoverage['/promise.js'].lineData[251] = 0;
  _$jscoverage['/promise.js'].lineData[252] = 0;
  _$jscoverage['/promise.js'].lineData[254] = 0;
  _$jscoverage['/promise.js'].lineData[257] = 0;
  _$jscoverage['/promise.js'].lineData[261] = 0;
  _$jscoverage['/promise.js'].lineData[262] = 0;
  _$jscoverage['/promise.js'].lineData[266] = 0;
  _$jscoverage['/promise.js'].lineData[267] = 0;
  _$jscoverage['/promise.js'].lineData[268] = 0;
  _$jscoverage['/promise.js'].lineData[275] = 0;
  _$jscoverage['/promise.js'].lineData[276] = 0;
  _$jscoverage['/promise.js'].lineData[280] = 0;
  _$jscoverage['/promise.js'].lineData[281] = 0;
  _$jscoverage['/promise.js'].lineData[282] = 0;
  _$jscoverage['/promise.js'].lineData[289] = 0;
  _$jscoverage['/promise.js'].lineData[290] = 0;
  _$jscoverage['/promise.js'].lineData[294] = 0;
  _$jscoverage['/promise.js'].lineData[295] = 0;
  _$jscoverage['/promise.js'].lineData[296] = 0;
  _$jscoverage['/promise.js'].lineData[297] = 0;
  _$jscoverage['/promise.js'].lineData[299] = 0;
  _$jscoverage['/promise.js'].lineData[300] = 0;
  _$jscoverage['/promise.js'].lineData[301] = 0;
  _$jscoverage['/promise.js'].lineData[303] = 0;
  _$jscoverage['/promise.js'].lineData[304] = 0;
  _$jscoverage['/promise.js'].lineData[307] = 0;
  _$jscoverage['/promise.js'].lineData[308] = 0;
  _$jscoverage['/promise.js'].lineData[309] = 0;
  _$jscoverage['/promise.js'].lineData[310] = 0;
  _$jscoverage['/promise.js'].lineData[311] = 0;
  _$jscoverage['/promise.js'].lineData[313] = 0;
  _$jscoverage['/promise.js'].lineData[315] = 0;
  _$jscoverage['/promise.js'].lineData[318] = 0;
  _$jscoverage['/promise.js'].lineData[323] = 0;
  _$jscoverage['/promise.js'].lineData[326] = 0;
  _$jscoverage['/promise.js'].lineData[328] = 0;
  _$jscoverage['/promise.js'].lineData[342] = 0;
  _$jscoverage['/promise.js'].lineData[343] = 0;
  _$jscoverage['/promise.js'].lineData[348] = 0;
  _$jscoverage['/promise.js'].lineData[349] = 0;
  _$jscoverage['/promise.js'].lineData[350] = 0;
  _$jscoverage['/promise.js'].lineData[352] = 0;
  _$jscoverage['/promise.js'].lineData[424] = 0;
  _$jscoverage['/promise.js'].lineData[425] = 0;
  _$jscoverage['/promise.js'].lineData[426] = 0;
  _$jscoverage['/promise.js'].lineData[428] = 0;
  _$jscoverage['/promise.js'].lineData[429] = 0;
  _$jscoverage['/promise.js'].lineData[431] = 0;
  _$jscoverage['/promise.js'].lineData[432] = 0;
  _$jscoverage['/promise.js'].lineData[433] = 0;
  _$jscoverage['/promise.js'].lineData[434] = 0;
  _$jscoverage['/promise.js'].lineData[437] = 0;
  _$jscoverage['/promise.js'].lineData[442] = 0;
  _$jscoverage['/promise.js'].lineData[446] = 0;
  _$jscoverage['/promise.js'].lineData[454] = 0;
  _$jscoverage['/promise.js'].lineData[455] = 0;
  _$jscoverage['/promise.js'].lineData[457] = 0;
  _$jscoverage['/promise.js'].lineData[458] = 0;
  _$jscoverage['/promise.js'].lineData[460] = 0;
  _$jscoverage['/promise.js'].lineData[461] = 0;
  _$jscoverage['/promise.js'].lineData[463] = 0;
  _$jscoverage['/promise.js'].lineData[465] = 0;
  _$jscoverage['/promise.js'].lineData[466] = 0;
  _$jscoverage['/promise.js'].lineData[468] = 0;
  _$jscoverage['/promise.js'].lineData[471] = 0;
  _$jscoverage['/promise.js'].lineData[472] = 0;
  _$jscoverage['/promise.js'].lineData[475] = 0;
  _$jscoverage['/promise.js'].lineData[476] = 0;
  _$jscoverage['/promise.js'].lineData[479] = 0;
  _$jscoverage['/promise.js'].lineData[483] = 0;
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
}
if (! _$jscoverage['/promise.js'].branchData) {
  _$jscoverage['/promise.js'].branchData = {};
  _$jscoverage['/promise.js'].branchData['16'] = [];
  _$jscoverage['/promise.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['16'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['28'] = [];
  _$jscoverage['/promise.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['39'] = [];
  _$jscoverage['/promise.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['43'] = [];
  _$jscoverage['/promise.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['50'] = [];
  _$jscoverage['/promise.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['65'] = [];
  _$jscoverage['/promise.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['74'] = [];
  _$jscoverage['/promise.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['89'] = [];
  _$jscoverage['/promise.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['125'] = [];
  _$jscoverage['/promise.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['139'] = [];
  _$jscoverage['/promise.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['159'] = [];
  _$jscoverage['/promise.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['169'] = [];
  _$jscoverage['/promise.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['210'] = [];
  _$jscoverage['/promise.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['215'] = [];
  _$jscoverage['/promise.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['246'] = [];
  _$jscoverage['/promise.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['251'] = [];
  _$jscoverage['/promise.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['275'] = [];
  _$jscoverage['/promise.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['289'] = [];
  _$jscoverage['/promise.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['295'] = [];
  _$jscoverage['/promise.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['299'] = [];
  _$jscoverage['/promise.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['307'] = [];
  _$jscoverage['/promise.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['309'] = [];
  _$jscoverage['/promise.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['328'] = [];
  _$jscoverage['/promise.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['329'] = [];
  _$jscoverage['/promise.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['331'] = [];
  _$jscoverage['/promise.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['335'] = [];
  _$jscoverage['/promise.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['343'] = [];
  _$jscoverage['/promise.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['344'] = [];
  _$jscoverage['/promise.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['344'][2] = new BranchData();
  _$jscoverage['/promise.js'].branchData['425'] = [];
  _$jscoverage['/promise.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['429'] = [];
  _$jscoverage['/promise.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['434'] = [];
  _$jscoverage['/promise.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/promise.js'].branchData['465'] = [];
  _$jscoverage['/promise.js'].branchData['465'][1] = new BranchData();
}
_$jscoverage['/promise.js'].branchData['465'][1].init(288, 11, 'result.done');
function visit35_465_1(result) {
  _$jscoverage['/promise.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['434'][1].init(74, 13, '--count === 0');
function visit34_434_1(result) {
  _$jscoverage['/promise.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['429'][1].init(176, 19, 'i < promises.length');
function visit33_429_1(result) {
  _$jscoverage['/promise.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['425'][1].init(58, 6, '!count');
function visit32_425_1(result) {
  _$jscoverage['/promise.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['344'][2].init(49, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit31_344_2(result) {
  _$jscoverage['/promise.js'].branchData['344'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['344'][1].init(30, 90, '(obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit30_344_1(result) {
  _$jscoverage['/promise.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['343'][1].init(16, 121, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (obj[PROMISE_VALUE] instanceof Reject)');
function visit29_343_1(result) {
  _$jscoverage['/promise.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['335'][1].init(-1, 203, '!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE])');
function visit28_335_1(result) {
  _$jscoverage['/promise.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['331'][2].init(149, 35, 'obj[PROMISE_PENDINGS] === undefined');
function visit27_331_2(result) {
  _$jscoverage['/promise.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['331'][1].init(62, 397, '(obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit26_331_1(result) {
  _$jscoverage['/promise.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['329'][1].init(31, 460, 'isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit25_329_1(result) {
  _$jscoverage['/promise.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['328'][1].init(51, 492, '!isRejected(obj) && isPromise(obj) && (obj[PROMISE_PENDINGS] === undefined) && (!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))');
function visit24_328_1(result) {
  _$jscoverage['/promise.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['309'][1].init(21, 4, 'done');
function visit23_309_1(result) {
  _$jscoverage['/promise.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['307'][1].init(1411, 25, 'value instanceof Promise');
function visit22_307_1(result) {
  _$jscoverage['/promise.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['299'][1].init(138, 24, 'value instanceof Promise');
function visit21_299_1(result) {
  _$jscoverage['/promise.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['295'][1].init(17, 4, 'done');
function visit20_295_1(result) {
  _$jscoverage['/promise.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['289'][1].init(81, 12, 'e.stack || e');
function visit19_289_1(result) {
  _$jscoverage['/promise.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['275'][1].init(164, 12, 'e.stack || e');
function visit18_275_1(result) {
  _$jscoverage['/promise.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['251'][1].init(155, 38, 'self[PROMISE_VALUE] instanceof Promise');
function visit17_251_1(result) {
  _$jscoverage['/promise.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['246'][1].init(13, 24, 'reason instanceof Reject');
function visit16_246_1(result) {
  _$jscoverage['/promise.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['215'][1].init(274, 21, 'fulfilled || rejected');
function visit15_215_1(result) {
  _$jscoverage['/promise.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['210'][1].init(27, 12, 'e.stack || e');
function visit14_210_1(result) {
  _$jscoverage['/promise.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['169'][1].init(17, 32, 'this[PROMISE_PROGRESS_LISTENERS]');
function visit13_169_1(result) {
  _$jscoverage['/promise.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['159'][1].init(17, 16, 'progressListener');
function visit12_159_1(result) {
  _$jscoverage['/promise.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['139'][1].init(121, 15, 'v === undefined');
function visit11_139_1(result) {
  _$jscoverage['/promise.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['125'][1].init(17, 29, 'obj && obj instanceof Promise');
function visit10_125_1(result) {
  _$jscoverage['/promise.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['89'][1].init(83, 39, '!(pendings = promise[PROMISE_PENDINGS])');
function visit9_89_1(result) {
  _$jscoverage['/promise.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['74'][1].init(333, 24, 'promise || new Promise()');
function visit8_74_1(result) {
  _$jscoverage['/promise.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['65'][1].init(38, 24, '!(self instanceof Defer)');
function visit7_65_1(result) {
  _$jscoverage['/promise.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['50'][1].init(203, 9, 'fulfilled');
function visit6_50_1(result) {
  _$jscoverage['/promise.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['43'][1].init(324, 12, 'isPromise(v)');
function visit5_43_1(result) {
  _$jscoverage['/promise.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['39'][1].init(180, 8, 'pendings');
function visit4_39_1(result) {
  _$jscoverage['/promise.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['28'][1].init(45, 25, 'promise instanceof Reject');
function visit3_28_1(result) {
  _$jscoverage['/promise.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['16'][2].init(40, 30, 'typeof console !== \'undefined\'');
function visit2_16_2(result) {
  _$jscoverage['/promise.js'].branchData['16'][2].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].branchData['16'][1].init(40, 47, 'typeof console !== \'undefined\' && console.error');
function visit1_16_1(result) {
  _$jscoverage['/promise.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/promise.js'].lineData[6]++;
KISSY.add(function(S) {
  _$jscoverage['/promise.js'].functionData[0]++;
  _$jscoverage['/promise.js'].lineData[7]++;
  var logger = S.getLogger('s/promise');
  _$jscoverage['/promise.js'].lineData[8]++;
  var PROMISE_VALUE = '__promise_value', processImmediate = S.setImmediate, PROMISE_PROGRESS_LISTENERS = '__promise_progress_listeners', PROMISE_PENDINGS = '__promise_pendings';
  _$jscoverage['/promise.js'].lineData[14]++;
  function logError(str) {
    _$jscoverage['/promise.js'].functionData[1]++;
    _$jscoverage['/promise.js'].lineData[16]++;
    if (visit1_16_1(visit2_16_2(typeof console !== 'undefined') && console.error)) {
      _$jscoverage['/promise.js'].lineData[17]++;
      console.error(str);
    }
  }
  _$jscoverage['/promise.js'].lineData[26]++;
  function promiseWhen(promise, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[2]++;
    _$jscoverage['/promise.js'].lineData[28]++;
    if (visit3_28_1(promise instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[30]++;
      processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[3]++;
  _$jscoverage['/promise.js'].lineData[31]++;
  rejected.call(promise, promise[PROMISE_VALUE]);
});
    } else {
      _$jscoverage['/promise.js'].lineData[34]++;
      var v = promise[PROMISE_VALUE], pendings = promise[PROMISE_PENDINGS];
      _$jscoverage['/promise.js'].lineData[39]++;
      if (visit4_39_1(pendings)) {
        _$jscoverage['/promise.js'].lineData[40]++;
        pendings.push([fulfilled, rejected]);
      } else {
        _$jscoverage['/promise.js'].lineData[43]++;
        if (visit5_43_1(isPromise(v))) {
          _$jscoverage['/promise.js'].lineData[44]++;
          promiseWhen(v, fulfilled, rejected);
        } else {
          _$jscoverage['/promise.js'].lineData[50]++;
          if (visit6_50_1(fulfilled)) {
            _$jscoverage['/promise.js'].lineData[51]++;
            processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[4]++;
  _$jscoverage['/promise.js'].lineData[52]++;
  fulfilled.call(promise, v);
});
          }
        }
      }
    }
  }
  _$jscoverage['/promise.js'].lineData[63]++;
  function Defer(promise) {
    _$jscoverage['/promise.js'].functionData[5]++;
    _$jscoverage['/promise.js'].lineData[64]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[65]++;
    if (visit7_65_1(!(self instanceof Defer))) {
      _$jscoverage['/promise.js'].lineData[66]++;
      return new Defer(promise);
    }
    _$jscoverage['/promise.js'].lineData[74]++;
    self.promise = visit8_74_1(promise || new Promise());
    _$jscoverage['/promise.js'].lineData[75]++;
    self.promise.defer = self;
  }
  _$jscoverage['/promise.js'].lineData[78]++;
  Defer.prototype = {
  constructor: Defer, 
  resolve: function(value) {
  _$jscoverage['/promise.js'].functionData[6]++;
  _$jscoverage['/promise.js'].lineData[87]++;
  var promise = this.promise, pendings;
  _$jscoverage['/promise.js'].lineData[89]++;
  if (visit9_89_1(!(pendings = promise[PROMISE_PENDINGS]))) {
    _$jscoverage['/promise.js'].lineData[90]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[94]++;
  promise[PROMISE_VALUE] = value;
  _$jscoverage['/promise.js'].lineData[95]++;
  pendings = [].concat(pendings);
  _$jscoverage['/promise.js'].lineData[96]++;
  promise[PROMISE_PENDINGS] = undefined;
  _$jscoverage['/promise.js'].lineData[97]++;
  promise[PROMISE_PROGRESS_LISTENERS] = undefined;
  _$jscoverage['/promise.js'].lineData[98]++;
  S.each(pendings, function(p) {
  _$jscoverage['/promise.js'].functionData[7]++;
  _$jscoverage['/promise.js'].lineData[99]++;
  promiseWhen(promise, p[0], p[1]);
});
  _$jscoverage['/promise.js'].lineData[101]++;
  return value;
}, 
  reject: function(reason) {
  _$jscoverage['/promise.js'].functionData[8]++;
  _$jscoverage['/promise.js'].lineData[109]++;
  return this.resolve(new Reject(reason));
}, 
  notify: function(message) {
  _$jscoverage['/promise.js'].functionData[9]++;
  _$jscoverage['/promise.js'].lineData[116]++;
  S.each(this.promise[PROMISE_PROGRESS_LISTENERS], function(listener) {
  _$jscoverage['/promise.js'].functionData[10]++;
  _$jscoverage['/promise.js'].lineData[117]++;
  processImmediate(function() {
  _$jscoverage['/promise.js'].functionData[11]++;
  _$jscoverage['/promise.js'].lineData[118]++;
  listener(message);
});
});
}};
  _$jscoverage['/promise.js'].lineData[124]++;
  function isPromise(obj) {
    _$jscoverage['/promise.js'].functionData[12]++;
    _$jscoverage['/promise.js'].lineData[125]++;
    return visit10_125_1(obj && obj instanceof Promise);
  }
  _$jscoverage['/promise.js'].lineData[135]++;
  function Promise(v) {
    _$jscoverage['/promise.js'].functionData[13]++;
    _$jscoverage['/promise.js'].lineData[136]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[138]++;
    self[PROMISE_VALUE] = v;
    _$jscoverage['/promise.js'].lineData[139]++;
    if (visit11_139_1(v === undefined)) {
      _$jscoverage['/promise.js'].lineData[141]++;
      self[PROMISE_PENDINGS] = [];
      _$jscoverage['/promise.js'].lineData[142]++;
      self[PROMISE_PROGRESS_LISTENERS] = [];
    }
  }
  _$jscoverage['/promise.js'].lineData[146]++;
  Promise.prototype = {
  constructor: Promise, 
  then: function(fulfilled, rejected, progressListener) {
  _$jscoverage['/promise.js'].functionData[14]++;
  _$jscoverage['/promise.js'].lineData[159]++;
  if (visit12_159_1(progressListener)) {
    _$jscoverage['/promise.js'].lineData[160]++;
    this.progress(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[162]++;
  return when(this, fulfilled, rejected);
}, 
  progress: function(progressListener) {
  _$jscoverage['/promise.js'].functionData[15]++;
  _$jscoverage['/promise.js'].lineData[169]++;
  if (visit13_169_1(this[PROMISE_PROGRESS_LISTENERS])) {
    _$jscoverage['/promise.js'].lineData[170]++;
    this[PROMISE_PROGRESS_LISTENERS].push(progressListener);
  }
  _$jscoverage['/promise.js'].lineData[172]++;
  return this;
}, 
  fail: function(rejected) {
  _$jscoverage['/promise.js'].functionData[16]++;
  _$jscoverage['/promise.js'].lineData[180]++;
  return when(this, 0, rejected);
}, 
  fin: function(callback) {
  _$jscoverage['/promise.js'].functionData[17]++;
  _$jscoverage['/promise.js'].lineData[189]++;
  return when(this, function(value) {
  _$jscoverage['/promise.js'].functionData[18]++;
  _$jscoverage['/promise.js'].lineData[190]++;
  return callback(value, true);
}, function(reason) {
  _$jscoverage['/promise.js'].functionData[19]++;
  _$jscoverage['/promise.js'].lineData[192]++;
  return callback(reason, false);
});
}, 
  done: function(fulfilled, rejected) {
  _$jscoverage['/promise.js'].functionData[20]++;
  _$jscoverage['/promise.js'].lineData[208]++;
  var self = this, onUnhandledError = function(e) {
  _$jscoverage['/promise.js'].functionData[21]++;
  _$jscoverage['/promise.js'].lineData[210]++;
  S.log(visit14_210_1(e.stack || e), 'error');
  _$jscoverage['/promise.js'].lineData[211]++;
  setTimeout(function() {
  _$jscoverage['/promise.js'].functionData[22]++;
  _$jscoverage['/promise.js'].lineData[212]++;
  throw e;
}, 0);
}, promiseToHandle = visit15_215_1(fulfilled || rejected) ? self.then(fulfilled, rejected) : self;
  _$jscoverage['/promise.js'].lineData[218]++;
  promiseToHandle.fail(onUnhandledError);
}, 
  isResolved: function() {
  _$jscoverage['/promise.js'].functionData[23]++;
  _$jscoverage['/promise.js'].lineData[228]++;
  return isResolved(this);
}, 
  isRejected: function() {
  _$jscoverage['/promise.js'].functionData[24]++;
  _$jscoverage['/promise.js'].lineData[234]++;
  return isRejected(this);
}};
  _$jscoverage['/promise.js'].lineData[245]++;
  function Reject(reason) {
    _$jscoverage['/promise.js'].functionData[25]++;
    _$jscoverage['/promise.js'].lineData[246]++;
    if (visit16_246_1(reason instanceof Reject)) {
      _$jscoverage['/promise.js'].lineData[247]++;
      return reason;
    }
    _$jscoverage['/promise.js'].lineData[249]++;
    var self = this;
    _$jscoverage['/promise.js'].lineData[250]++;
    Promise.apply(self, arguments);
    _$jscoverage['/promise.js'].lineData[251]++;
    if (visit17_251_1(self[PROMISE_VALUE] instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[252]++;
      logger.error('assert.not(this.__promise_value instanceof promise) in Reject constructor');
    }
    _$jscoverage['/promise.js'].lineData[254]++;
    return self;
  }
  _$jscoverage['/promise.js'].lineData[257]++;
  S.extend(Reject, Promise);
  _$jscoverage['/promise.js'].lineData[261]++;
  function when(value, fulfilled, rejected) {
    _$jscoverage['/promise.js'].functionData[26]++;
    _$jscoverage['/promise.js'].lineData[262]++;
    var defer = new Defer(), done = 0;
    _$jscoverage['/promise.js'].lineData[266]++;
    function _fulfilled(value) {
      _$jscoverage['/promise.js'].functionData[27]++;
      _$jscoverage['/promise.js'].lineData[267]++;
      try {
        _$jscoverage['/promise.js'].lineData[268]++;
        return fulfilled ? fulfilled.call(this, value) : value;
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[275]++;
  logError(visit18_275_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[276]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[280]++;
    function _rejected(reason) {
      _$jscoverage['/promise.js'].functionData[28]++;
      _$jscoverage['/promise.js'].lineData[281]++;
      try {
        _$jscoverage['/promise.js'].lineData[282]++;
        return rejected ? rejected.call(this, reason) : new Reject(reason);
      }      catch (e) {
  _$jscoverage['/promise.js'].lineData[289]++;
  logError(visit19_289_1(e.stack || e));
  _$jscoverage['/promise.js'].lineData[290]++;
  return new Reject(e);
}
    }
    _$jscoverage['/promise.js'].lineData[294]++;
    function finalFulfill(value) {
      _$jscoverage['/promise.js'].functionData[29]++;
      _$jscoverage['/promise.js'].lineData[295]++;
      if (visit20_295_1(done)) {
        _$jscoverage['/promise.js'].lineData[296]++;
        logger.error('already done at fulfilled');
        _$jscoverage['/promise.js'].lineData[297]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[299]++;
      if (visit21_299_1(value instanceof Promise)) {
        _$jscoverage['/promise.js'].lineData[300]++;
        logger.error('assert.not(value instanceof Promise) in when');
        _$jscoverage['/promise.js'].lineData[301]++;
        return;
      }
      _$jscoverage['/promise.js'].lineData[303]++;
      done = 1;
      _$jscoverage['/promise.js'].lineData[304]++;
      defer.resolve(_fulfilled.call(this, value));
    }
    _$jscoverage['/promise.js'].lineData[307]++;
    if (visit22_307_1(value instanceof Promise)) {
      _$jscoverage['/promise.js'].lineData[308]++;
      promiseWhen(value, finalFulfill, function(reason) {
  _$jscoverage['/promise.js'].functionData[30]++;
  _$jscoverage['/promise.js'].lineData[309]++;
  if (visit23_309_1(done)) {
    _$jscoverage['/promise.js'].lineData[310]++;
    logger.error('already done at rejected');
    _$jscoverage['/promise.js'].lineData[311]++;
    return;
  }
  _$jscoverage['/promise.js'].lineData[313]++;
  done = 1;
  _$jscoverage['/promise.js'].lineData[315]++;
  defer.resolve(_rejected.call(this, reason));
});
    } else {
      _$jscoverage['/promise.js'].lineData[318]++;
      finalFulfill(value);
    }
    _$jscoverage['/promise.js'].lineData[323]++;
    return defer.promise;
  }
  _$jscoverage['/promise.js'].lineData[326]++;
  function isResolved(obj) {
    _$jscoverage['/promise.js'].functionData[31]++;
    _$jscoverage['/promise.js'].lineData[328]++;
    return visit24_328_1(!isRejected(obj) && visit25_329_1(isPromise(obj) && visit26_331_1((visit27_331_2(obj[PROMISE_PENDINGS] === undefined)) && (visit28_335_1(!isPromise(obj[PROMISE_VALUE]) || isResolved(obj[PROMISE_VALUE]))))));
  }
  _$jscoverage['/promise.js'].lineData[342]++;
  function isRejected(obj) {
    _$jscoverage['/promise.js'].functionData[32]++;
    _$jscoverage['/promise.js'].lineData[343]++;
    return visit29_343_1(isPromise(obj) && visit30_344_1((visit31_344_2(obj[PROMISE_PENDINGS] === undefined)) && (obj[PROMISE_VALUE] instanceof Reject)));
  }
  _$jscoverage['/promise.js'].lineData[348]++;
  KISSY.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[349]++;
  KISSY.Promise = Promise;
  _$jscoverage['/promise.js'].lineData[350]++;
  Promise.Defer = Defer;
  _$jscoverage['/promise.js'].lineData[352]++;
  S.mix(Promise, {
  when: when, 
  isPromise: isPromise, 
  isResolved: isResolved, 
  isRejected: isRejected, 
  all: function(promises) {
  _$jscoverage['/promise.js'].functionData[33]++;
  _$jscoverage['/promise.js'].lineData[424]++;
  var count = promises.length;
  _$jscoverage['/promise.js'].lineData[425]++;
  if (visit32_425_1(!count)) {
    _$jscoverage['/promise.js'].lineData[426]++;
    return null;
  }
  _$jscoverage['/promise.js'].lineData[428]++;
  var defer = new Defer();
  _$jscoverage['/promise.js'].lineData[429]++;
  for (var i = 0; visit33_429_1(i < promises.length); i++) {
    _$jscoverage['/promise.js'].lineData[431]++;
    (function(promise, i) {
  _$jscoverage['/promise.js'].functionData[34]++;
  _$jscoverage['/promise.js'].lineData[432]++;
  when(promise, function(value) {
  _$jscoverage['/promise.js'].functionData[35]++;
  _$jscoverage['/promise.js'].lineData[433]++;
  promises[i] = value;
  _$jscoverage['/promise.js'].lineData[434]++;
  if (visit34_434_1(--count === 0)) {
    _$jscoverage['/promise.js'].lineData[437]++;
    defer.resolve(promises);
  }
}, function(r) {
  _$jscoverage['/promise.js'].functionData[36]++;
  _$jscoverage['/promise.js'].lineData[442]++;
  defer.reject(r);
});
})(promises[i], i);
  }
  _$jscoverage['/promise.js'].lineData[446]++;
  return defer.promise;
}, 
  async: function(generatorFunc) {
  _$jscoverage['/promise.js'].functionData[37]++;
  _$jscoverage['/promise.js'].lineData[454]++;
  return function() {
  _$jscoverage['/promise.js'].functionData[38]++;
  _$jscoverage['/promise.js'].lineData[455]++;
  var generator = generatorFunc.apply(this, arguments);
  _$jscoverage['/promise.js'].lineData[457]++;
  function doAction(action, arg) {
    _$jscoverage['/promise.js'].functionData[39]++;
    _$jscoverage['/promise.js'].lineData[458]++;
    var result;
    _$jscoverage['/promise.js'].lineData[460]++;
    try {
      _$jscoverage['/promise.js'].lineData[461]++;
      result = generator[action](arg);
    }    catch (e) {
  _$jscoverage['/promise.js'].lineData[463]++;
  return new Reject(e);
}
    _$jscoverage['/promise.js'].lineData[465]++;
    if (visit35_465_1(result.done)) {
      _$jscoverage['/promise.js'].lineData[466]++;
      return result.value;
    }
    _$jscoverage['/promise.js'].lineData[468]++;
    return when(result.value, next, throwEx);
  }
  _$jscoverage['/promise.js'].lineData[471]++;
  function next(v) {
    _$jscoverage['/promise.js'].functionData[40]++;
    _$jscoverage['/promise.js'].lineData[472]++;
    return doAction('next', v);
  }
  _$jscoverage['/promise.js'].lineData[475]++;
  function throwEx(e) {
    _$jscoverage['/promise.js'].functionData[41]++;
    _$jscoverage['/promise.js'].lineData[476]++;
    return doAction('throw', e);
  }
  _$jscoverage['/promise.js'].lineData[479]++;
  return next();
};
}});
  _$jscoverage['/promise.js'].lineData[483]++;
  return Promise;
});
