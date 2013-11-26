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
if (! _$jscoverage['/base/attr.js']) {
  _$jscoverage['/base/attr.js'] = {};
  _$jscoverage['/base/attr.js'].lineData = [];
  _$jscoverage['/base/attr.js'].lineData[6] = 0;
  _$jscoverage['/base/attr.js'].lineData[7] = 0;
  _$jscoverage['/base/attr.js'].lineData[8] = 0;
  _$jscoverage['/base/attr.js'].lineData[41] = 0;
  _$jscoverage['/base/attr.js'].lineData[42] = 0;
  _$jscoverage['/base/attr.js'].lineData[76] = 0;
  _$jscoverage['/base/attr.js'].lineData[82] = 0;
  _$jscoverage['/base/attr.js'].lineData[83] = 0;
  _$jscoverage['/base/attr.js'].lineData[85] = 0;
  _$jscoverage['/base/attr.js'].lineData[88] = 0;
  _$jscoverage['/base/attr.js'].lineData[89] = 0;
  _$jscoverage['/base/attr.js'].lineData[91] = 0;
  _$jscoverage['/base/attr.js'].lineData[93] = 0;
  _$jscoverage['/base/attr.js'].lineData[95] = 0;
  _$jscoverage['/base/attr.js'].lineData[111] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[121] = 0;
  _$jscoverage['/base/attr.js'].lineData[122] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[130] = 0;
  _$jscoverage['/base/attr.js'].lineData[131] = 0;
  _$jscoverage['/base/attr.js'].lineData[135] = 0;
  _$jscoverage['/base/attr.js'].lineData[139] = 0;
  _$jscoverage['/base/attr.js'].lineData[141] = 0;
  _$jscoverage['/base/attr.js'].lineData[142] = 0;
  _$jscoverage['/base/attr.js'].lineData[145] = 0;
  _$jscoverage['/base/attr.js'].lineData[146] = 0;
  _$jscoverage['/base/attr.js'].lineData[148] = 0;
  _$jscoverage['/base/attr.js'].lineData[155] = 0;
  _$jscoverage['/base/attr.js'].lineData[156] = 0;
  _$jscoverage['/base/attr.js'].lineData[160] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[164] = 0;
  _$jscoverage['/base/attr.js'].lineData[166] = 0;
  _$jscoverage['/base/attr.js'].lineData[173] = 0;
  _$jscoverage['/base/attr.js'].lineData[175] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[180] = 0;
  _$jscoverage['/base/attr.js'].lineData[181] = 0;
  _$jscoverage['/base/attr.js'].lineData[182] = 0;
  _$jscoverage['/base/attr.js'].lineData[183] = 0;
  _$jscoverage['/base/attr.js'].lineData[185] = 0;
  _$jscoverage['/base/attr.js'].lineData[189] = 0;
  _$jscoverage['/base/attr.js'].lineData[222] = 0;
  _$jscoverage['/base/attr.js'].lineData[228] = 0;
  _$jscoverage['/base/attr.js'].lineData[229] = 0;
  _$jscoverage['/base/attr.js'].lineData[230] = 0;
  _$jscoverage['/base/attr.js'].lineData[232] = 0;
  _$jscoverage['/base/attr.js'].lineData[236] = 0;
  _$jscoverage['/base/attr.js'].lineData[237] = 0;
  _$jscoverage['/base/attr.js'].lineData[238] = 0;
  _$jscoverage['/base/attr.js'].lineData[239] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[242] = 0;
  _$jscoverage['/base/attr.js'].lineData[244] = 0;
  _$jscoverage['/base/attr.js'].lineData[248] = 0;
  _$jscoverage['/base/attr.js'].lineData[249] = 0;
  _$jscoverage['/base/attr.js'].lineData[252] = 0;
  _$jscoverage['/base/attr.js'].lineData[262] = 0;
  _$jscoverage['/base/attr.js'].lineData[266] = 0;
  _$jscoverage['/base/attr.js'].lineData[267] = 0;
  _$jscoverage['/base/attr.js'].lineData[268] = 0;
  _$jscoverage['/base/attr.js'].lineData[269] = 0;
  _$jscoverage['/base/attr.js'].lineData[272] = 0;
  _$jscoverage['/base/attr.js'].lineData[281] = 0;
  _$jscoverage['/base/attr.js'].lineData[282] = 0;
  _$jscoverage['/base/attr.js'].lineData[285] = 0;
  _$jscoverage['/base/attr.js'].lineData[286] = 0;
  _$jscoverage['/base/attr.js'].lineData[287] = 0;
  _$jscoverage['/base/attr.js'].lineData[288] = 0;
  _$jscoverage['/base/attr.js'].lineData[289] = 0;
  _$jscoverage['/base/attr.js'].lineData[337] = 0;
  _$jscoverage['/base/attr.js'].lineData[344] = 0;
  _$jscoverage['/base/attr.js'].lineData[345] = 0;
  _$jscoverage['/base/attr.js'].lineData[346] = 0;
  _$jscoverage['/base/attr.js'].lineData[347] = 0;
  _$jscoverage['/base/attr.js'].lineData[349] = 0;
  _$jscoverage['/base/attr.js'].lineData[353] = 0;
  _$jscoverage['/base/attr.js'].lineData[354] = 0;
  _$jscoverage['/base/attr.js'].lineData[358] = 0;
  _$jscoverage['/base/attr.js'].lineData[360] = 0;
  _$jscoverage['/base/attr.js'].lineData[361] = 0;
  _$jscoverage['/base/attr.js'].lineData[365] = 0;
  _$jscoverage['/base/attr.js'].lineData[367] = 0;
  _$jscoverage['/base/attr.js'].lineData[368] = 0;
  _$jscoverage['/base/attr.js'].lineData[371] = 0;
  _$jscoverage['/base/attr.js'].lineData[372] = 0;
  _$jscoverage['/base/attr.js'].lineData[374] = 0;
  _$jscoverage['/base/attr.js'].lineData[377] = 0;
  _$jscoverage['/base/attr.js'].lineData[378] = 0;
  _$jscoverage['/base/attr.js'].lineData[380] = 0;
  _$jscoverage['/base/attr.js'].lineData[381] = 0;
  _$jscoverage['/base/attr.js'].lineData[383] = 0;
  _$jscoverage['/base/attr.js'].lineData[384] = 0;
  _$jscoverage['/base/attr.js'].lineData[387] = 0;
  _$jscoverage['/base/attr.js'].lineData[389] = 0;
  _$jscoverage['/base/attr.js'].lineData[390] = 0;
  _$jscoverage['/base/attr.js'].lineData[391] = 0;
  _$jscoverage['/base/attr.js'].lineData[392] = 0;
  _$jscoverage['/base/attr.js'].lineData[399] = 0;
  _$jscoverage['/base/attr.js'].lineData[402] = 0;
  _$jscoverage['/base/attr.js'].lineData[403] = 0;
  _$jscoverage['/base/attr.js'].lineData[404] = 0;
  _$jscoverage['/base/attr.js'].lineData[405] = 0;
  _$jscoverage['/base/attr.js'].lineData[406] = 0;
  _$jscoverage['/base/attr.js'].lineData[408] = 0;
  _$jscoverage['/base/attr.js'].lineData[409] = 0;
  _$jscoverage['/base/attr.js'].lineData[412] = 0;
  _$jscoverage['/base/attr.js'].lineData[417] = 0;
  _$jscoverage['/base/attr.js'].lineData[426] = 0;
  _$jscoverage['/base/attr.js'].lineData[427] = 0;
  _$jscoverage['/base/attr.js'].lineData[428] = 0;
  _$jscoverage['/base/attr.js'].lineData[431] = 0;
  _$jscoverage['/base/attr.js'].lineData[432] = 0;
  _$jscoverage['/base/attr.js'].lineData[433] = 0;
  _$jscoverage['/base/attr.js'].lineData[434] = 0;
  _$jscoverage['/base/attr.js'].lineData[436] = 0;
  _$jscoverage['/base/attr.js'].lineData[437] = 0;
  _$jscoverage['/base/attr.js'].lineData[452] = 0;
  _$jscoverage['/base/attr.js'].lineData[453] = 0;
  _$jscoverage['/base/attr.js'].lineData[459] = 0;
  _$jscoverage['/base/attr.js'].lineData[460] = 0;
  _$jscoverage['/base/attr.js'].lineData[461] = 0;
  _$jscoverage['/base/attr.js'].lineData[462] = 0;
  _$jscoverage['/base/attr.js'].lineData[463] = 0;
  _$jscoverage['/base/attr.js'].lineData[466] = 0;
  _$jscoverage['/base/attr.js'].lineData[469] = 0;
  _$jscoverage['/base/attr.js'].lineData[471] = 0;
  _$jscoverage['/base/attr.js'].lineData[473] = 0;
  _$jscoverage['/base/attr.js'].lineData[474] = 0;
  _$jscoverage['/base/attr.js'].lineData[477] = 0;
  _$jscoverage['/base/attr.js'].lineData[489] = 0;
  _$jscoverage['/base/attr.js'].lineData[492] = 0;
  _$jscoverage['/base/attr.js'].lineData[494] = 0;
  _$jscoverage['/base/attr.js'].lineData[496] = 0;
  _$jscoverage['/base/attr.js'].lineData[497] = 0;
  _$jscoverage['/base/attr.js'].lineData[499] = 0;
  _$jscoverage['/base/attr.js'].lineData[501] = 0;
  _$jscoverage['/base/attr.js'].lineData[504] = 0;
  _$jscoverage['/base/attr.js'].lineData[506] = 0;
  _$jscoverage['/base/attr.js'].lineData[513] = 0;
  _$jscoverage['/base/attr.js'].lineData[516] = 0;
  _$jscoverage['/base/attr.js'].lineData[517] = 0;
  _$jscoverage['/base/attr.js'].lineData[518] = 0;
  _$jscoverage['/base/attr.js'].lineData[519] = 0;
  _$jscoverage['/base/attr.js'].lineData[520] = 0;
  _$jscoverage['/base/attr.js'].lineData[523] = 0;
  _$jscoverage['/base/attr.js'].lineData[526] = 0;
  _$jscoverage['/base/attr.js'].lineData[527] = 0;
  _$jscoverage['/base/attr.js'].lineData[528] = 0;
  _$jscoverage['/base/attr.js'].lineData[529] = 0;
  _$jscoverage['/base/attr.js'].lineData[530] = 0;
  _$jscoverage['/base/attr.js'].lineData[531] = 0;
  _$jscoverage['/base/attr.js'].lineData[532] = 0;
  _$jscoverage['/base/attr.js'].lineData[536] = 0;
  _$jscoverage['/base/attr.js'].lineData[539] = 0;
  _$jscoverage['/base/attr.js'].lineData[540] = 0;
  _$jscoverage['/base/attr.js'].lineData[543] = 0;
  _$jscoverage['/base/attr.js'].lineData[555] = 0;
  _$jscoverage['/base/attr.js'].lineData[557] = 0;
  _$jscoverage['/base/attr.js'].lineData[559] = 0;
  _$jscoverage['/base/attr.js'].lineData[560] = 0;
  _$jscoverage['/base/attr.js'].lineData[562] = 0;
  _$jscoverage['/base/attr.js'].lineData[563] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[568] = 0;
  _$jscoverage['/base/attr.js'].lineData[569] = 0;
  _$jscoverage['/base/attr.js'].lineData[571] = 0;
  _$jscoverage['/base/attr.js'].lineData[574] = 0;
  _$jscoverage['/base/attr.js'].lineData[575] = 0;
  _$jscoverage['/base/attr.js'].lineData[579] = 0;
  _$jscoverage['/base/attr.js'].lineData[583] = 0;
  _$jscoverage['/base/attr.js'].lineData[587] = 0;
}
if (! _$jscoverage['/base/attr.js'].functionData) {
  _$jscoverage['/base/attr.js'].functionData = [];
  _$jscoverage['/base/attr.js'].functionData[0] = 0;
  _$jscoverage['/base/attr.js'].functionData[1] = 0;
  _$jscoverage['/base/attr.js'].functionData[2] = 0;
  _$jscoverage['/base/attr.js'].functionData[3] = 0;
  _$jscoverage['/base/attr.js'].functionData[4] = 0;
  _$jscoverage['/base/attr.js'].functionData[5] = 0;
  _$jscoverage['/base/attr.js'].functionData[6] = 0;
  _$jscoverage['/base/attr.js'].functionData[7] = 0;
  _$jscoverage['/base/attr.js'].functionData[8] = 0;
  _$jscoverage['/base/attr.js'].functionData[9] = 0;
  _$jscoverage['/base/attr.js'].functionData[10] = 0;
  _$jscoverage['/base/attr.js'].functionData[11] = 0;
  _$jscoverage['/base/attr.js'].functionData[12] = 0;
  _$jscoverage['/base/attr.js'].functionData[13] = 0;
  _$jscoverage['/base/attr.js'].functionData[14] = 0;
  _$jscoverage['/base/attr.js'].functionData[15] = 0;
  _$jscoverage['/base/attr.js'].functionData[16] = 0;
  _$jscoverage['/base/attr.js'].functionData[17] = 0;
  _$jscoverage['/base/attr.js'].functionData[18] = 0;
  _$jscoverage['/base/attr.js'].functionData[19] = 0;
  _$jscoverage['/base/attr.js'].functionData[20] = 0;
  _$jscoverage['/base/attr.js'].functionData[21] = 0;
  _$jscoverage['/base/attr.js'].functionData[22] = 0;
  _$jscoverage['/base/attr.js'].functionData[23] = 0;
}
if (! _$jscoverage['/base/attr.js'].branchData) {
  _$jscoverage['/base/attr.js'].branchData = {};
  _$jscoverage['/base/attr.js'].branchData['11'] = [];
  _$jscoverage['/base/attr.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['42'] = [];
  _$jscoverage['/base/attr.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['44'] = [];
  _$jscoverage['/base/attr.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['45'] = [];
  _$jscoverage['/base/attr.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['83'] = [];
  _$jscoverage['/base/attr.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['88'] = [];
  _$jscoverage['/base/attr.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['89'] = [];
  _$jscoverage['/base/attr.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['116'] = [];
  _$jscoverage['/base/attr.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['119'] = [];
  _$jscoverage['/base/attr.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['121'] = [];
  _$jscoverage['/base/attr.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['129'] = [];
  _$jscoverage['/base/attr.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['130'] = [];
  _$jscoverage['/base/attr.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['145'] = [];
  _$jscoverage['/base/attr.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['160'] = [];
  _$jscoverage['/base/attr.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['163'] = [];
  _$jscoverage['/base/attr.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['180'] = [];
  _$jscoverage['/base/attr.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['182'] = [];
  _$jscoverage['/base/attr.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['228'] = [];
  _$jscoverage['/base/attr.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['236'] = [];
  _$jscoverage['/base/attr.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['238'] = [];
  _$jscoverage['/base/attr.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['239'] = [];
  _$jscoverage['/base/attr.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['241'] = [];
  _$jscoverage['/base/attr.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['248'] = [];
  _$jscoverage['/base/attr.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['266'] = [];
  _$jscoverage['/base/attr.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['268'] = [];
  _$jscoverage['/base/attr.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['281'] = [];
  _$jscoverage['/base/attr.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['285'] = [];
  _$jscoverage['/base/attr.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['344'] = [];
  _$jscoverage['/base/attr.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['353'] = [];
  _$jscoverage['/base/attr.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['360'] = [];
  _$jscoverage['/base/attr.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['365'] = [];
  _$jscoverage['/base/attr.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['367'] = [];
  _$jscoverage['/base/attr.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['371'] = [];
  _$jscoverage['/base/attr.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['377'] = [];
  _$jscoverage['/base/attr.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['378'] = [];
  _$jscoverage['/base/attr.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['378'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['380'] = [];
  _$jscoverage['/base/attr.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['383'] = [];
  _$jscoverage['/base/attr.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['389'] = [];
  _$jscoverage['/base/attr.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['391'] = [];
  _$jscoverage['/base/attr.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['399'] = [];
  _$jscoverage['/base/attr.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['402'] = [];
  _$jscoverage['/base/attr.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['404'] = [];
  _$jscoverage['/base/attr.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['405'] = [];
  _$jscoverage['/base/attr.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['408'] = [];
  _$jscoverage['/base/attr.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['427'] = [];
  _$jscoverage['/base/attr.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['431'] = [];
  _$jscoverage['/base/attr.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['433'] = [];
  _$jscoverage['/base/attr.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['436'] = [];
  _$jscoverage['/base/attr.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['450'] = [];
  _$jscoverage['/base/attr.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['459'] = [];
  _$jscoverage['/base/attr.js'].branchData['459'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['462'] = [];
  _$jscoverage['/base/attr.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['471'] = [];
  _$jscoverage['/base/attr.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['473'] = [];
  _$jscoverage['/base/attr.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['492'] = [];
  _$jscoverage['/base/attr.js'].branchData['492'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['496'] = [];
  _$jscoverage['/base/attr.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['497'] = [];
  _$jscoverage['/base/attr.js'].branchData['497'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['499'] = [];
  _$jscoverage['/base/attr.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['499'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['500'] = [];
  _$jscoverage['/base/attr.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['506'] = [];
  _$jscoverage['/base/attr.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['510'] = [];
  _$jscoverage['/base/attr.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['517'] = [];
  _$jscoverage['/base/attr.js'].branchData['517'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['519'] = [];
  _$jscoverage['/base/attr.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['526'] = [];
  _$jscoverage['/base/attr.js'].branchData['526'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['528'] = [];
  _$jscoverage['/base/attr.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['530'] = [];
  _$jscoverage['/base/attr.js'].branchData['530'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['532'] = [];
  _$jscoverage['/base/attr.js'].branchData['532'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['536'] = [];
  _$jscoverage['/base/attr.js'].branchData['536'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['539'] = [];
  _$jscoverage['/base/attr.js'].branchData['539'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['539'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['539'][3] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['557'] = [];
  _$jscoverage['/base/attr.js'].branchData['557'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['563'] = [];
  _$jscoverage['/base/attr.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['566'] = [];
  _$jscoverage['/base/attr.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['568'] = [];
  _$jscoverage['/base/attr.js'].branchData['568'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['574'] = [];
  _$jscoverage['/base/attr.js'].branchData['574'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['574'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['574'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['574'][3].init(546, 39, 'nodeType == NodeType.CDATA_SECTION_NODE');
function visit100_574_3(result) {
  _$jscoverage['/base/attr.js'].branchData['574'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['574'][2].init(512, 30, 'nodeType == NodeType.TEXT_NODE');
function visit99_574_2(result) {
  _$jscoverage['/base/attr.js'].branchData['574'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['574'][1].init(512, 73, 'nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE');
function visit98_574_1(result) {
  _$jscoverage['/base/attr.js'].branchData['574'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['568'][1].init(106, 19, '\'textContent\' in el');
function visit97_568_1(result) {
  _$jscoverage['/base/attr.js'].branchData['568'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['566'][1].init(114, 33, 'nodeType == NodeType.ELEMENT_NODE');
function visit96_566_1(result) {
  _$jscoverage['/base/attr.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['563'][1].init(93, 6, 'i >= 0');
function visit95_563_1(result) {
  _$jscoverage['/base/attr.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['557'][1].init(89, 17, 'val === undefined');
function visit94_557_1(result) {
  _$jscoverage['/base/attr.js'].branchData['557'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['539'][3].init(863, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_539_3(result) {
  _$jscoverage['/base/attr.js'].branchData['539'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['539'][2].init(843, 62, '!(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit92_539_2(result) {
  _$jscoverage['/base/attr.js'].branchData['539'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['539'][1].init(834, 71, '!hook || !(\'set\' in hook) || hook.set(elem, val, \'value\') === undefined');
function visit91_539_1(result) {
  _$jscoverage['/base/attr.js'].branchData['539'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['536'][1].init(680, 50, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_536_1(result) {
  _$jscoverage['/base/attr.js'].branchData['536'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['532'][1].init(36, 13, 'value == null');
function visit89_532_1(result) {
  _$jscoverage['/base/attr.js'].branchData['532'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['530'][1].init(458, 14, 'S.isArray(val)');
function visit88_530_1(result) {
  _$jscoverage['/base/attr.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['528'][1].init(364, 23, 'typeof val === \'number\'');
function visit87_528_1(result) {
  _$jscoverage['/base/attr.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['526'][1].init(283, 11, 'val == null');
function visit86_526_1(result) {
  _$jscoverage['/base/attr.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['519'][1].init(60, 19, 'elem.nodeType !== 1');
function visit85_519_1(result) {
  _$jscoverage['/base/attr.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['517'][1].init(1001, 6, 'i >= 0');
function visit84_517_1(result) {
  _$jscoverage['/base/attr.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['510'][1].init(256, 11, 'ret == null');
function visit83_510_1(result) {
  _$jscoverage['/base/attr.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['506'][1].init(357, 23, 'typeof ret === \'string\'');
function visit82_506_1(result) {
  _$jscoverage['/base/attr.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][1].init(45, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit81_500_1(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['499'][2].init(122, 90, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_499_2(result) {
  _$jscoverage['/base/attr.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['499'][1].init(114, 98, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit79_499_1(result) {
  _$jscoverage['/base/attr.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['497'][1].init(32, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit78_497_1(result) {
  _$jscoverage['/base/attr.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['496'][1].init(73, 4, 'elem');
function visit77_496_1(result) {
  _$jscoverage['/base/attr.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['492'][1].init(97, 19, 'value === undefined');
function visit76_492_1(result) {
  _$jscoverage['/base/attr.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['473'][1].init(62, 27, 'elems[i].hasAttribute(name)');
function visit75_473_1(result) {
  _$jscoverage['/base/attr.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['471'][1].init(133, 7, 'i < len');
function visit74_471_1(result) {
  _$jscoverage['/base/attr.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['462'][1].init(130, 30, 'attrNode && attrNode.specified');
function visit73_462_1(result) {
  _$jscoverage['/base/attr.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['459'][1].init(407, 16, 'i < elems.length');
function visit72_459_1(result) {
  _$jscoverage['/base/attr.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['450'][1].init(10259, 38, 'docElement && !docElement.hasAttribute');
function visit71_450_1(result) {
  _$jscoverage['/base/attr.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['436'][2].init(201, 23, 'propFix[name] || name');
function visit70_436_2(result) {
  _$jscoverage['/base/attr.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['436'][1].init(165, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit69_436_1(result) {
  _$jscoverage['/base/attr.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['433'][1].init(58, 36, 'el.nodeType == NodeType.ELEMENT_NODE');
function visit68_433_1(result) {
  _$jscoverage['/base/attr.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['431'][1].init(235, 6, 'i >= 0');
function visit67_431_1(result) {
  _$jscoverage['/base/attr.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['427'][1].init(67, 21, 'attrFix[name] || name');
function visit66_427_1(result) {
  _$jscoverage['/base/attr.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['408'][1].init(184, 36, 'attrNormalizer && attrNormalizer.set');
function visit65_408_1(result) {
  _$jscoverage['/base/attr.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][1].init(33, 22, 'nodeName(el) == \'form\'');
function visit64_405_1(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['404'][2].init(72, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit63_404_2(result) {
  _$jscoverage['/base/attr.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['404'][1].init(66, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit62_404_1(result) {
  _$jscoverage['/base/attr.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['402'][1].init(46, 6, 'i >= 0');
function visit61_402_1(result) {
  _$jscoverage['/base/attr.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['399'][1].init(983, 12, 'ret === null');
function visit60_399_1(result) {
  _$jscoverage['/base/attr.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['391'][1].init(103, 32, '!attrNode || !attrNode.specified');
function visit59_391_1(result) {
  _$jscoverage['/base/attr.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['389'][1].init(483, 10, 'ret === ""');
function visit58_389_1(result) {
  _$jscoverage['/base/attr.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['383'][1].init(269, 36, 'attrNormalizer && attrNormalizer.get');
function visit57_383_1(result) {
  _$jscoverage['/base/attr.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['380'][1].init(130, 22, 'nodeName(el) == \'form\'');
function visit56_380_1(result) {
  _$jscoverage['/base/attr.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][2].init(31, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit55_378_2(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][1].init(25, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit54_378_1(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['377'][1].init(2870, 17, 'val === undefined');
function visit53_377_1(result) {
  _$jscoverage['/base/attr.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['371'][1].init(2673, 25, 'R_INVALID_CHAR.test(name)');
function visit52_371_1(result) {
  _$jscoverage['/base/attr.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['367'][1].init(2526, 20, 'R_BOOLEAN.test(name)');
function visit51_367_1(result) {
  _$jscoverage['/base/attr.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['365'][1].init(2482, 21, 'attrFix[name] || name');
function visit50_365_1(result) {
  _$jscoverage['/base/attr.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['360'][1].init(2331, 20, 'pass && attrFn[name]');
function visit49_360_1(result) {
  _$jscoverage['/base/attr.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['353'][1].init(2141, 20, 'pass && attrFn[name]');
function visit48_353_1(result) {
  _$jscoverage['/base/attr.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['344'][1].init(1852, 21, 'S.isPlainObject(name)');
function visit47_344_1(result) {
  _$jscoverage['/base/attr.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['285'][1].init(188, 6, 'i >= 0');
function visit46_285_1(result) {
  _$jscoverage['/base/attr.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['281'][1].init(24, 23, 'propFix[name] || name');
function visit45_281_1(result) {
  _$jscoverage['/base/attr.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['268'][1].init(60, 31, 'getProp(el, name) !== undefined');
function visit44_268_1(result) {
  _$jscoverage['/base/attr.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['266'][1].init(165, 7, 'i < len');
function visit43_266_1(result) {
  _$jscoverage['/base/attr.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['248'][1].init(25, 12, 'elems.length');
function visit42_248_1(result) {
  _$jscoverage['/base/attr.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['241'][1].init(70, 16, 'hook && hook.set');
function visit41_241_1(result) {
  _$jscoverage['/base/attr.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['239'][1].init(48, 6, 'i >= 0');
function visit40_239_1(result) {
  _$jscoverage['/base/attr.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['238'][1].init(542, 19, 'value !== undefined');
function visit39_238_1(result) {
  _$jscoverage['/base/attr.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['236'][1].init(455, 23, 'propFix[name] || name');
function visit38_236_1(result) {
  _$jscoverage['/base/attr.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['228'][1].init(179, 21, 'S.isPlainObject(name)');
function visit37_228_1(result) {
  _$jscoverage['/base/attr.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['182'][1].init(87, 16, 'hook && hook.get');
function visit36_182_1(result) {
  _$jscoverage['/base/attr.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['180'][1].init(16, 21, 'propFix[name] || name');
function visit35_180_1(result) {
  _$jscoverage['/base/attr.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['163'][1].init(21, 16, 'S.isArray(value)');
function visit34_163_1(result) {
  _$jscoverage['/base/attr.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['160'][1].init(152, 35, 'elem.getAttribute(\'value\') === null');
function visit33_160_1(result) {
  _$jscoverage['/base/attr.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['145'][1].init(270, 14, '!values.length');
function visit32_145_1(result) {
  _$jscoverage['/base/attr.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['130'][1].init(29, 19, 'options[i].selected');
function visit31_130_1(result) {
  _$jscoverage['/base/attr.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['129'][1].init(677, 7, 'i < len');
function visit30_129_1(result) {
  _$jscoverage['/base/attr.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['121'][1].init(405, 3, 'one');
function visit29_121_1(result) {
  _$jscoverage['/base/attr.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['119'][1].init(323, 9, 'index < 0');
function visit28_119_1(result) {
  _$jscoverage['/base/attr.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['116'][1].init(195, 34, 'String(elem.type) === \'select-one\'');
function visit27_116_1(result) {
  _$jscoverage['/base/attr.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['89'][1].init(128, 16, 'propName in elem');
function visit26_89_1(result) {
  _$jscoverage['/base/attr.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['88'][1].init(79, 23, 'propFix[name] || name');
function visit25_88_1(result) {
  _$jscoverage['/base/attr.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['83'][1].init(51, 15, 'value === false');
function visit24_83_1(result) {
  _$jscoverage['/base/attr.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['45'][1].init(60, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_45_1(result) {
  _$jscoverage['/base/attr.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['44'][1].init(-1, 101, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_44_1(result) {
  _$jscoverage['/base/attr.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['42'][1].init(213, 40, 'attributeNode && attributeNode.specified');
function visit21_42_1(result) {
  _$jscoverage['/base/attr.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['11'][1].init(113, 26, 'doc && doc.documentElement');
function visit20_11_1(result) {
  _$jscoverage['/base/attr.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var doc = S.Env.host.document, undefined = undefined, NodeType = Dom.NodeType, docElement = visit20_11_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
  val: 1, 
  css: 1, 
  html: 1, 
  text: 1, 
  data: 1, 
  width: 1, 
  height: 1, 
  offset: 1, 
  scrollTop: 1, 
  scrollLeft: 1}, attrHooks = {
  tabindex: {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[1]++;
  _$jscoverage['/base/attr.js'].lineData[41]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[42]++;
  return visit21_42_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_44_1(R_FOCUSABLE.test(el.nodeName) || visit23_45_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  'hidefocus': 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  'cellspacing': 'cellSpacing', 
  'cellpadding': 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  'frameborder': 'frameBorder', 
  'contenteditable': 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[76]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[82]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[83]++;
  if (visit24_83_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[85]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[88]++;
    propName = visit25_88_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[89]++;
    if (visit26_89_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[91]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[93]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[95]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[111]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_116_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[119]++;
  if (visit28_119_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[120]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[121]++;
    if (visit29_121_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[122]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[126]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[127]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[128]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[129]++;
  for (; visit30_129_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[130]++;
    if (visit31_130_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[131]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[135]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[139]++;
  var values = S.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[141]++;
  S.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[142]++;
  opt.selected = S.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[145]++;
  if (visit32_145_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[146]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[148]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[155]++;
  S.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[156]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[160]++;
  return visit33_160_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[163]++;
  if (visit34_163_1(S.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[164]++;
    return elem.checked = S.inArray(Dom.val(elem), value);
  }
  _$jscoverage['/base/attr.js'].lineData[166]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[173]++;
  attrHooks['style'] = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[175]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[179]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[180]++;
    name = visit35_180_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[181]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[182]++;
    if (visit36_182_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[183]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[185]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[189]++;
  S.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[12]++;
  _$jscoverage['/base/attr.js'].lineData[222]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[228]++;
  if (visit37_228_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[229]++;
    S.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[230]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[232]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[236]++;
  name = visit38_236_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[237]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[238]++;
  if (visit39_238_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[239]++;
    for (i = elems.length - 1; visit40_239_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[240]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[241]++;
      if (visit41_241_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[242]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[244]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[248]++;
    if (visit42_248_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[249]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[252]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[262]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[266]++;
  for (i = 0; visit43_266_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[267]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[268]++;
    if (visit44_268_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[269]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[272]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[281]++;
  name = visit45_281_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[282]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[285]++;
  for (i = elems.length - 1; visit46_285_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[286]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[287]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[288]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[289]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[337]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[344]++;
  if (visit47_344_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[345]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[346]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[347]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[349]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[353]++;
  if (visit48_353_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[354]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[358]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[360]++;
  if (visit49_360_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[361]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[365]++;
  name = visit50_365_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[367]++;
  if (visit51_367_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[368]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[371]++;
    if (visit52_371_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[372]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[374]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[377]++;
  if (visit53_377_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[378]++;
    if (visit54_378_1(el && visit55_378_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[380]++;
      if (visit56_380_1(nodeName(el) == 'form')) {
        _$jscoverage['/base/attr.js'].lineData[381]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[383]++;
      if (visit57_383_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[384]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[387]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[389]++;
      if (visit58_389_1(ret === "")) {
        _$jscoverage['/base/attr.js'].lineData[390]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[391]++;
        if (visit59_391_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[392]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[399]++;
      return visit60_399_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[402]++;
    for (i = els.length - 1; visit61_402_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[403]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[404]++;
      if (visit62_404_1(el && visit63_404_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[405]++;
        if (visit64_405_1(nodeName(el) == 'form')) {
          _$jscoverage['/base/attr.js'].lineData[406]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[408]++;
        if (visit65_408_1(attrNormalizer && attrNormalizer.set)) {
          _$jscoverage['/base/attr.js'].lineData[409]++;
          attrNormalizer.set(el, val, name);
        } else {
          _$jscoverage['/base/attr.js'].lineData[412]++;
          el.setAttribute(name, EMPTY + val);
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[417]++;
  return undefined;
}, 
  removeAttr: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[426]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[427]++;
  name = visit66_427_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[428]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[431]++;
  for (i = els.length - 1; visit67_431_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[432]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[433]++;
    if (visit68_433_1(el.nodeType == NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[434]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[436]++;
      if (visit69_436_1(R_BOOLEAN.test(name) && (propName = visit70_436_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[437]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit71_450_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[452]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[453]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[459]++;
  for (i = 0; visit72_459_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[460]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[461]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[462]++;
    if (visit73_462_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[463]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[466]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[469]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[471]++;
  for (i = 0; visit74_471_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[473]++;
    if (visit75_473_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[474]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[477]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[489]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[492]++;
  if (visit76_492_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[494]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[496]++;
    if (visit77_496_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[497]++;
      hook = visit78_497_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[499]++;
      if (visit79_499_1(hook && visit80_499_2('get' in hook && visit81_500_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[501]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[504]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[506]++;
      return visit82_506_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit83_510_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[513]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[516]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[517]++;
  for (i = els.length - 1; visit84_517_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[518]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[519]++;
    if (visit85_519_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[520]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[523]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[526]++;
    if (visit86_526_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[527]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[528]++;
      if (visit87_528_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[529]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[530]++;
        if (visit88_530_1(S.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[531]++;
          val = S.map(val, function(value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[532]++;
  return visit89_532_1(value == null) ? '' : value + '';
});
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[536]++;
    hook = visit90_536_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[539]++;
    if (visit91_539_1(!hook || visit92_539_2(!('set' in hook) || visit93_539_3(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[540]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[543]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[555]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[557]++;
  if (visit94_557_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[559]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[560]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[562]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[563]++;
    for (i = els.length - 1; visit95_563_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[564]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[565]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[566]++;
      if (visit96_566_1(nodeType == NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[567]++;
        Dom.cleanData(el.getElementsByTagName('*'));
        _$jscoverage['/base/attr.js'].lineData[568]++;
        if (visit97_568_1('textContent' in el)) {
          _$jscoverage['/base/attr.js'].lineData[569]++;
          el.textContent = val;
        } else {
          _$jscoverage['/base/attr.js'].lineData[571]++;
          el.innerText = val;
        }
      } else {
        _$jscoverage['/base/attr.js'].lineData[574]++;
        if (visit98_574_1(visit99_574_2(nodeType == NodeType.TEXT_NODE) || visit100_574_3(nodeType == NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[575]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[579]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[583]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[587]++;
  return Dom;
});
