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
  _$jscoverage['/base/attr.js'].lineData[39] = 0;
  _$jscoverage['/base/attr.js'].lineData[40] = 0;
  _$jscoverage['/base/attr.js'].lineData[74] = 0;
  _$jscoverage['/base/attr.js'].lineData[80] = 0;
  _$jscoverage['/base/attr.js'].lineData[81] = 0;
  _$jscoverage['/base/attr.js'].lineData[83] = 0;
  _$jscoverage['/base/attr.js'].lineData[86] = 0;
  _$jscoverage['/base/attr.js'].lineData[87] = 0;
  _$jscoverage['/base/attr.js'].lineData[89] = 0;
  _$jscoverage['/base/attr.js'].lineData[91] = 0;
  _$jscoverage['/base/attr.js'].lineData[93] = 0;
  _$jscoverage['/base/attr.js'].lineData[109] = 0;
  _$jscoverage['/base/attr.js'].lineData[117] = 0;
  _$jscoverage['/base/attr.js'].lineData[118] = 0;
  _$jscoverage['/base/attr.js'].lineData[119] = 0;
  _$jscoverage['/base/attr.js'].lineData[120] = 0;
  _$jscoverage['/base/attr.js'].lineData[124] = 0;
  _$jscoverage['/base/attr.js'].lineData[125] = 0;
  _$jscoverage['/base/attr.js'].lineData[126] = 0;
  _$jscoverage['/base/attr.js'].lineData[127] = 0;
  _$jscoverage['/base/attr.js'].lineData[128] = 0;
  _$jscoverage['/base/attr.js'].lineData[129] = 0;
  _$jscoverage['/base/attr.js'].lineData[133] = 0;
  _$jscoverage['/base/attr.js'].lineData[137] = 0;
  _$jscoverage['/base/attr.js'].lineData[139] = 0;
  _$jscoverage['/base/attr.js'].lineData[140] = 0;
  _$jscoverage['/base/attr.js'].lineData[143] = 0;
  _$jscoverage['/base/attr.js'].lineData[144] = 0;
  _$jscoverage['/base/attr.js'].lineData[146] = 0;
  _$jscoverage['/base/attr.js'].lineData[153] = 0;
  _$jscoverage['/base/attr.js'].lineData[154] = 0;
  _$jscoverage['/base/attr.js'].lineData[158] = 0;
  _$jscoverage['/base/attr.js'].lineData[161] = 0;
  _$jscoverage['/base/attr.js'].lineData[162] = 0;
  _$jscoverage['/base/attr.js'].lineData[163] = 0;
  _$jscoverage['/base/attr.js'].lineData[165] = 0;
  _$jscoverage['/base/attr.js'].lineData[172] = 0;
  _$jscoverage['/base/attr.js'].lineData[174] = 0;
  _$jscoverage['/base/attr.js'].lineData[178] = 0;
  _$jscoverage['/base/attr.js'].lineData[179] = 0;
  _$jscoverage['/base/attr.js'].lineData[183] = 0;
  _$jscoverage['/base/attr.js'].lineData[184] = 0;
  _$jscoverage['/base/attr.js'].lineData[185] = 0;
  _$jscoverage['/base/attr.js'].lineData[186] = 0;
  _$jscoverage['/base/attr.js'].lineData[187] = 0;
  _$jscoverage['/base/attr.js'].lineData[189] = 0;
  _$jscoverage['/base/attr.js'].lineData[193] = 0;
  _$jscoverage['/base/attr.js'].lineData[223] = 0;
  _$jscoverage['/base/attr.js'].lineData[229] = 0;
  _$jscoverage['/base/attr.js'].lineData[230] = 0;
  _$jscoverage['/base/attr.js'].lineData[231] = 0;
  _$jscoverage['/base/attr.js'].lineData[233] = 0;
  _$jscoverage['/base/attr.js'].lineData[237] = 0;
  _$jscoverage['/base/attr.js'].lineData[238] = 0;
  _$jscoverage['/base/attr.js'].lineData[239] = 0;
  _$jscoverage['/base/attr.js'].lineData[240] = 0;
  _$jscoverage['/base/attr.js'].lineData[241] = 0;
  _$jscoverage['/base/attr.js'].lineData[242] = 0;
  _$jscoverage['/base/attr.js'].lineData[243] = 0;
  _$jscoverage['/base/attr.js'].lineData[245] = 0;
  _$jscoverage['/base/attr.js'].lineData[249] = 0;
  _$jscoverage['/base/attr.js'].lineData[250] = 0;
  _$jscoverage['/base/attr.js'].lineData[253] = 0;
  _$jscoverage['/base/attr.js'].lineData[263] = 0;
  _$jscoverage['/base/attr.js'].lineData[267] = 0;
  _$jscoverage['/base/attr.js'].lineData[268] = 0;
  _$jscoverage['/base/attr.js'].lineData[269] = 0;
  _$jscoverage['/base/attr.js'].lineData[270] = 0;
  _$jscoverage['/base/attr.js'].lineData[273] = 0;
  _$jscoverage['/base/attr.js'].lineData[282] = 0;
  _$jscoverage['/base/attr.js'].lineData[283] = 0;
  _$jscoverage['/base/attr.js'].lineData[286] = 0;
  _$jscoverage['/base/attr.js'].lineData[287] = 0;
  _$jscoverage['/base/attr.js'].lineData[288] = 0;
  _$jscoverage['/base/attr.js'].lineData[289] = 0;
  _$jscoverage['/base/attr.js'].lineData[290] = 0;
  _$jscoverage['/base/attr.js'].lineData[338] = 0;
  _$jscoverage['/base/attr.js'].lineData[345] = 0;
  _$jscoverage['/base/attr.js'].lineData[346] = 0;
  _$jscoverage['/base/attr.js'].lineData[347] = 0;
  _$jscoverage['/base/attr.js'].lineData[348] = 0;
  _$jscoverage['/base/attr.js'].lineData[350] = 0;
  _$jscoverage['/base/attr.js'].lineData[354] = 0;
  _$jscoverage['/base/attr.js'].lineData[355] = 0;
  _$jscoverage['/base/attr.js'].lineData[359] = 0;
  _$jscoverage['/base/attr.js'].lineData[361] = 0;
  _$jscoverage['/base/attr.js'].lineData[362] = 0;
  _$jscoverage['/base/attr.js'].lineData[366] = 0;
  _$jscoverage['/base/attr.js'].lineData[368] = 0;
  _$jscoverage['/base/attr.js'].lineData[369] = 0;
  _$jscoverage['/base/attr.js'].lineData[370] = 0;
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
  _$jscoverage['/base/attr.js'].lineData[534] = 0;
  _$jscoverage['/base/attr.js'].lineData[535] = 0;
  _$jscoverage['/base/attr.js'].lineData[537] = 0;
  _$jscoverage['/base/attr.js'].lineData[538] = 0;
  _$jscoverage['/base/attr.js'].lineData[541] = 0;
  _$jscoverage['/base/attr.js'].lineData[553] = 0;
  _$jscoverage['/base/attr.js'].lineData[555] = 0;
  _$jscoverage['/base/attr.js'].lineData[557] = 0;
  _$jscoverage['/base/attr.js'].lineData[558] = 0;
  _$jscoverage['/base/attr.js'].lineData[560] = 0;
  _$jscoverage['/base/attr.js'].lineData[561] = 0;
  _$jscoverage['/base/attr.js'].lineData[562] = 0;
  _$jscoverage['/base/attr.js'].lineData[563] = 0;
  _$jscoverage['/base/attr.js'].lineData[564] = 0;
  _$jscoverage['/base/attr.js'].lineData[565] = 0;
  _$jscoverage['/base/attr.js'].lineData[566] = 0;
  _$jscoverage['/base/attr.js'].lineData[567] = 0;
  _$jscoverage['/base/attr.js'].lineData[569] = 0;
  _$jscoverage['/base/attr.js'].lineData[571] = 0;
  _$jscoverage['/base/attr.js'].lineData[572] = 0;
  _$jscoverage['/base/attr.js'].lineData[576] = 0;
  _$jscoverage['/base/attr.js'].lineData[580] = 0;
  _$jscoverage['/base/attr.js'].lineData[584] = 0;
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
  _$jscoverage['/base/attr.js'].branchData['10'] = [];
  _$jscoverage['/base/attr.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['40'] = [];
  _$jscoverage['/base/attr.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['42'] = [];
  _$jscoverage['/base/attr.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['43'] = [];
  _$jscoverage['/base/attr.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['81'] = [];
  _$jscoverage['/base/attr.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['86'] = [];
  _$jscoverage['/base/attr.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['87'] = [];
  _$jscoverage['/base/attr.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['114'] = [];
  _$jscoverage['/base/attr.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['117'] = [];
  _$jscoverage['/base/attr.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['119'] = [];
  _$jscoverage['/base/attr.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['127'] = [];
  _$jscoverage['/base/attr.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['128'] = [];
  _$jscoverage['/base/attr.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['143'] = [];
  _$jscoverage['/base/attr.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['158'] = [];
  _$jscoverage['/base/attr.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['161'] = [];
  _$jscoverage['/base/attr.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['179'] = [];
  _$jscoverage['/base/attr.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['184'] = [];
  _$jscoverage['/base/attr.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['186'] = [];
  _$jscoverage['/base/attr.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['229'] = [];
  _$jscoverage['/base/attr.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['237'] = [];
  _$jscoverage['/base/attr.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['239'] = [];
  _$jscoverage['/base/attr.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['240'] = [];
  _$jscoverage['/base/attr.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['242'] = [];
  _$jscoverage['/base/attr.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['249'] = [];
  _$jscoverage['/base/attr.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['267'] = [];
  _$jscoverage['/base/attr.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['269'] = [];
  _$jscoverage['/base/attr.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['282'] = [];
  _$jscoverage['/base/attr.js'].branchData['282'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['286'] = [];
  _$jscoverage['/base/attr.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['345'] = [];
  _$jscoverage['/base/attr.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['354'] = [];
  _$jscoverage['/base/attr.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['361'] = [];
  _$jscoverage['/base/attr.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['366'] = [];
  _$jscoverage['/base/attr.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['368'] = [];
  _$jscoverage['/base/attr.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['370'] = [];
  _$jscoverage['/base/attr.js'].branchData['370'][1] = new BranchData();
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
  _$jscoverage['/base/attr.js'].branchData['534'] = [];
  _$jscoverage['/base/attr.js'].branchData['534'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['535'] = [];
  _$jscoverage['/base/attr.js'].branchData['535'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['537'] = [];
  _$jscoverage['/base/attr.js'].branchData['537'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['537'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['555'] = [];
  _$jscoverage['/base/attr.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['561'] = [];
  _$jscoverage['/base/attr.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['564'] = [];
  _$jscoverage['/base/attr.js'].branchData['564'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['566'] = [];
  _$jscoverage['/base/attr.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'] = [];
  _$jscoverage['/base/attr.js'].branchData['571'][1] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'][2] = new BranchData();
  _$jscoverage['/base/attr.js'].branchData['571'][3] = new BranchData();
}
_$jscoverage['/base/attr.js'].branchData['571'][3].init(534, 40, 'nodeType === NodeType.CDATA_SECTION_NODE');
function visit100_571_3(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['571'][2].init(499, 31, 'nodeType === NodeType.TEXT_NODE');
function visit99_571_2(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['571'][1].init(499, 75, 'nodeType === NodeType.TEXT_NODE || nodeType === NodeType.CDATA_SECTION_NODE');
function visit98_571_1(result) {
  _$jscoverage['/base/attr.js'].branchData['571'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['566'][1].init(108, 19, '\'textContent\' in el');
function visit97_566_1(result) {
  _$jscoverage['/base/attr.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['564'][1].init(117, 34, 'nodeType === NodeType.ELEMENT_NODE');
function visit96_564_1(result) {
  _$jscoverage['/base/attr.js'].branchData['564'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['561'][1].init(95, 6, 'i >= 0');
function visit95_561_1(result) {
  _$jscoverage['/base/attr.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['555'][1].init(92, 17, 'val === undefined');
function visit94_555_1(result) {
  _$jscoverage['/base/attr.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['537'][2].init(821, 42, 'hook.set(elem, val, \'value\') === undefined');
function visit93_537_2(result) {
  _$jscoverage['/base/attr.js'].branchData['537'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['537'][1].init(805, 59, '!hookHasSet || (hook.set(elem, val, \'value\') === undefined)');
function visit92_537_1(result) {
  _$jscoverage['/base/attr.js'].branchData['537'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['535'][1].init(677, 23, 'hook && (\'set\' in hook)');
function visit91_535_1(result) {
  _$jscoverage['/base/attr.js'].branchData['535'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['534'][1].init(590, 47, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit90_534_1(result) {
  _$jscoverage['/base/attr.js'].branchData['534'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['530'][1].init(471, 14, 'S.isArray(val)');
function visit89_530_1(result) {
  _$jscoverage['/base/attr.js'].branchData['530'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['528'][1].init(375, 23, 'typeof val === \'number\'');
function visit88_528_1(result) {
  _$jscoverage['/base/attr.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['526'][1].init(292, 11, 'val == null');
function visit87_526_1(result) {
  _$jscoverage['/base/attr.js'].branchData['526'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['519'][1].init(62, 19, 'elem.nodeType !== 1');
function visit86_519_1(result) {
  _$jscoverage['/base/attr.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['517'][1].init(1030, 6, 'i >= 0');
function visit85_517_1(result) {
  _$jscoverage['/base/attr.js'].branchData['517'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['510'][1].init(260, 11, 'ret == null');
function visit84_510_1(result) {
  _$jscoverage['/base/attr.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['506'][1].init(367, 23, 'typeof ret === \'string\'');
function visit83_506_1(result) {
  _$jscoverage['/base/attr.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['500'][1].init(46, 44, '(ret = hook.get(elem, \'value\')) !== undefined');
function visit82_500_1(result) {
  _$jscoverage['/base/attr.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['499'][2].init(125, 91, '\'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit81_499_2(result) {
  _$jscoverage['/base/attr.js'].branchData['499'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['499'][1].init(117, 99, 'hook && \'get\' in hook && (ret = hook.get(elem, \'value\')) !== undefined');
function visit80_499_1(result) {
  _$jscoverage['/base/attr.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['497'][1].init(33, 51, 'valHooks[nodeName(elem)] || valHooks[elem.type]');
function visit79_497_1(result) {
  _$jscoverage['/base/attr.js'].branchData['497'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['496'][1].init(77, 4, 'elem');
function visit78_496_1(result) {
  _$jscoverage['/base/attr.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['492'][1].init(101, 19, 'value === undefined');
function visit77_492_1(result) {
  _$jscoverage['/base/attr.js'].branchData['492'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['473'][1].init(64, 27, 'elems[i].hasAttribute(name)');
function visit76_473_1(result) {
  _$jscoverage['/base/attr.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['471'][1].init(136, 7, 'i < len');
function visit75_471_1(result) {
  _$jscoverage['/base/attr.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['462'][1].init(133, 30, 'attrNode && attrNode.specified');
function visit74_462_1(result) {
  _$jscoverage['/base/attr.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['459'][1].init(415, 16, 'i < elems.length');
function visit73_459_1(result) {
  _$jscoverage['/base/attr.js'].branchData['459'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['450'][1].init(10473, 38, 'docElement && !docElement.hasAttribute');
function visit72_450_1(result) {
  _$jscoverage['/base/attr.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['436'][2].init(204, 23, 'propFix[name] || name');
function visit71_436_2(result) {
  _$jscoverage['/base/attr.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['436'][1].init(168, 66, 'R_BOOLEAN.test(name) && (propName = propFix[name] || name) in el');
function visit70_436_1(result) {
  _$jscoverage['/base/attr.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['433'][1].init(60, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit69_433_1(result) {
  _$jscoverage['/base/attr.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['431'][1].init(241, 6, 'i >= 0');
function visit68_431_1(result) {
  _$jscoverage['/base/attr.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['427'][1].init(69, 21, 'attrFix[name] || name');
function visit67_427_1(result) {
  _$jscoverage['/base/attr.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['408'][1].init(189, 36, 'attrNormalizer && attrNormalizer.set');
function visit66_408_1(result) {
  _$jscoverage['/base/attr.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['405'][1].init(34, 23, 'nodeName(el) === \'form\'');
function visit65_405_1(result) {
  _$jscoverage['/base/attr.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['404'][2].init(74, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit64_404_2(result) {
  _$jscoverage['/base/attr.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['404'][1].init(68, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit63_404_1(result) {
  _$jscoverage['/base/attr.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['402'][1].init(47, 6, 'i >= 0');
function visit62_402_1(result) {
  _$jscoverage['/base/attr.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['399'][1].init(1005, 12, 'ret === null');
function visit61_399_1(result) {
  _$jscoverage['/base/attr.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['391'][1].init(105, 32, '!attrNode || !attrNode.specified');
function visit60_391_1(result) {
  _$jscoverage['/base/attr.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['389'][1].init(495, 10, 'ret === \'\'');
function visit59_389_1(result) {
  _$jscoverage['/base/attr.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['383'][1].init(275, 36, 'attrNormalizer && attrNormalizer.get');
function visit58_383_1(result) {
  _$jscoverage['/base/attr.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['380'][1].init(132, 23, 'nodeName(el) === \'form\'');
function visit57_380_1(result) {
  _$jscoverage['/base/attr.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][2].init(32, 37, 'el.nodeType === NodeType.ELEMENT_NODE');
function visit56_378_2(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['378'][1].init(26, 43, 'el && el.nodeType === NodeType.ELEMENT_NODE');
function visit55_378_1(result) {
  _$jscoverage['/base/attr.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['377'][1].init(2929, 17, 'val === undefined');
function visit54_377_1(result) {
  _$jscoverage['/base/attr.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['370'][1].init(2689, 25, 'R_INVALID_CHAR.test(name)');
function visit53_370_1(result) {
  _$jscoverage['/base/attr.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['368'][1].init(2588, 20, 'R_BOOLEAN.test(name)');
function visit52_368_1(result) {
  _$jscoverage['/base/attr.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['366'][1].init(2542, 21, 'attrFix[name] || name');
function visit51_366_1(result) {
  _$jscoverage['/base/attr.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['361'][1].init(2386, 20, 'pass && attrFn[name]');
function visit50_361_1(result) {
  _$jscoverage['/base/attr.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['354'][1].init(2189, 20, 'pass && attrFn[name]');
function visit49_354_1(result) {
  _$jscoverage['/base/attr.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['345'][1].init(1891, 21, 'S.isPlainObject(name)');
function visit48_345_1(result) {
  _$jscoverage['/base/attr.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['286'][1].init(193, 6, 'i >= 0');
function visit47_286_1(result) {
  _$jscoverage['/base/attr.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['282'][1].init(25, 23, 'propFix[name] || name');
function visit46_282_1(result) {
  _$jscoverage['/base/attr.js'].branchData['282'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['269'][1].init(62, 31, 'getProp(el, name) !== undefined');
function visit45_269_1(result) {
  _$jscoverage['/base/attr.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['267'][1].init(170, 7, 'i < len');
function visit44_267_1(result) {
  _$jscoverage['/base/attr.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['249'][1].init(26, 12, 'elems.length');
function visit43_249_1(result) {
  _$jscoverage['/base/attr.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['242'][1].init(72, 16, 'hook && hook.set');
function visit42_242_1(result) {
  _$jscoverage['/base/attr.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['240'][1].init(49, 6, 'i >= 0');
function visit41_240_1(result) {
  _$jscoverage['/base/attr.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['239'][1].init(559, 19, 'value !== undefined');
function visit40_239_1(result) {
  _$jscoverage['/base/attr.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['237'][1].init(470, 23, 'propFix[name] || name');
function visit39_237_1(result) {
  _$jscoverage['/base/attr.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['229'][1].init(186, 21, 'S.isPlainObject(name)');
function visit38_229_1(result) {
  _$jscoverage['/base/attr.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['186'][1].init(90, 16, 'hook && hook.get');
function visit37_186_1(result) {
  _$jscoverage['/base/attr.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['184'][1].init(17, 21, 'propFix[name] || name');
function visit36_184_1(result) {
  _$jscoverage['/base/attr.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['179'][1].init(17, 13, 'value == null');
function visit35_179_1(result) {
  _$jscoverage['/base/attr.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['161'][1].init(22, 16, 'S.isArray(value)');
function visit34_161_1(result) {
  _$jscoverage['/base/attr.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['158'][1].init(155, 35, 'elem.getAttribute(\'value\') === null');
function visit33_158_1(result) {
  _$jscoverage['/base/attr.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['143'][1].init(277, 14, '!values.length');
function visit32_143_1(result) {
  _$jscoverage['/base/attr.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['128'][1].init(30, 19, 'options[i].selected');
function visit31_128_1(result) {
  _$jscoverage['/base/attr.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['127'][1].init(696, 7, 'i < len');
function visit30_127_1(result) {
  _$jscoverage['/base/attr.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['119'][1].init(416, 3, 'one');
function visit29_119_1(result) {
  _$jscoverage['/base/attr.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['117'][1].init(332, 9, 'index < 0');
function visit28_117_1(result) {
  _$jscoverage['/base/attr.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['114'][1].init(200, 34, 'String(elem.type) === \'select-one\'');
function visit27_114_1(result) {
  _$jscoverage['/base/attr.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['87'][1].init(131, 16, 'propName in elem');
function visit26_87_1(result) {
  _$jscoverage['/base/attr.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['86'][1].init(81, 23, 'propFix[name] || name');
function visit25_86_1(result) {
  _$jscoverage['/base/attr.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['81'][1].init(53, 15, 'value === false');
function visit24_81_1(result) {
  _$jscoverage['/base/attr.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['43'][1].init(61, 40, 'R_CLICKABLE.test(el.nodeName) && el.href');
function visit23_43_1(result) {
  _$jscoverage['/base/attr.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['42'][1].init(-1, 102, 'R_FOCUSABLE.test(el.nodeName) || R_CLICKABLE.test(el.nodeName) && el.href');
function visit22_42_1(result) {
  _$jscoverage['/base/attr.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['40'][1].init(216, 40, 'attributeNode && attributeNode.specified');
function visit21_40_1(result) {
  _$jscoverage['/base/attr.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].branchData['10'][1].init(86, 26, 'doc && doc.documentElement');
function visit20_10_1(result) {
  _$jscoverage['/base/attr.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attr.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/attr.js'].functionData[0]++;
  _$jscoverage['/base/attr.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/attr.js'].lineData[8]++;
  var doc = S.Env.host.document, NodeType = Dom.NodeType, docElement = visit20_10_1(doc && doc.documentElement), EMPTY = '', nodeName = Dom.nodeName, R_BOOLEAN = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, R_FOCUSABLE = /^(?:button|input|object|select|textarea)$/i, R_CLICKABLE = /^a(?:rea)?$/i, R_INVALID_CHAR = /:|^on/, R_RETURN = /\r/g, attrFix = {}, attrFn = {
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
  _$jscoverage['/base/attr.js'].lineData[39]++;
  var attributeNode = el.getAttributeNode('tabindex');
  _$jscoverage['/base/attr.js'].lineData[40]++;
  return visit21_40_1(attributeNode && attributeNode.specified) ? parseInt(attributeNode.value, 10) : visit22_42_1(R_FOCUSABLE.test(el.nodeName) || visit23_43_1(R_CLICKABLE.test(el.nodeName) && el.href)) ? 0 : undefined;
}}}, propFix = {
  hidefocus: 'hideFocus', 
  tabindex: 'tabIndex', 
  readonly: 'readOnly', 
  'for': 'htmlFor', 
  'class': 'className', 
  maxlength: 'maxLength', 
  cellspacing: 'cellSpacing', 
  cellpadding: 'cellPadding', 
  rowspan: 'rowSpan', 
  colspan: 'colSpan', 
  usemap: 'useMap', 
  frameborder: 'frameBorder', 
  contenteditable: 'contentEditable'}, boolHook = {
  get: function(elem, name) {
  _$jscoverage['/base/attr.js'].functionData[2]++;
  _$jscoverage['/base/attr.js'].lineData[74]++;
  return Dom.prop(elem, name) ? name.toLowerCase() : undefined;
}, 
  set: function(elem, value, name) {
  _$jscoverage['/base/attr.js'].functionData[3]++;
  _$jscoverage['/base/attr.js'].lineData[80]++;
  var propName;
  _$jscoverage['/base/attr.js'].lineData[81]++;
  if (visit24_81_1(value === false)) {
    _$jscoverage['/base/attr.js'].lineData[83]++;
    Dom.removeAttr(elem, name);
  } else {
    _$jscoverage['/base/attr.js'].lineData[86]++;
    propName = visit25_86_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[87]++;
    if (visit26_87_1(propName in elem)) {
      _$jscoverage['/base/attr.js'].lineData[89]++;
      elem[propName] = true;
    }
    _$jscoverage['/base/attr.js'].lineData[91]++;
    elem.setAttribute(name, name.toLowerCase());
  }
  _$jscoverage['/base/attr.js'].lineData[93]++;
  return name;
}}, propHooks = {}, attrNodeHook = {}, valHooks = {
  select: {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[4]++;
  _$jscoverage['/base/attr.js'].lineData[109]++;
  var index = elem.selectedIndex, options = elem.options, ret, i, len, one = (visit27_114_1(String(elem.type) === 'select-one'));
  _$jscoverage['/base/attr.js'].lineData[117]++;
  if (visit28_117_1(index < 0)) {
    _$jscoverage['/base/attr.js'].lineData[118]++;
    return null;
  } else {
    _$jscoverage['/base/attr.js'].lineData[119]++;
    if (visit29_119_1(one)) {
      _$jscoverage['/base/attr.js'].lineData[120]++;
      return Dom.val(options[index]);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[124]++;
  ret = [];
  _$jscoverage['/base/attr.js'].lineData[125]++;
  i = 0;
  _$jscoverage['/base/attr.js'].lineData[126]++;
  len = options.length;
  _$jscoverage['/base/attr.js'].lineData[127]++;
  for (; visit30_127_1(i < len); ++i) {
    _$jscoverage['/base/attr.js'].lineData[128]++;
    if (visit31_128_1(options[i].selected)) {
      _$jscoverage['/base/attr.js'].lineData[129]++;
      ret.push(Dom.val(options[i]));
    }
  }
  _$jscoverage['/base/attr.js'].lineData[133]++;
  return ret;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[5]++;
  _$jscoverage['/base/attr.js'].lineData[137]++;
  var values = S.makeArray(value), opts = elem.options;
  _$jscoverage['/base/attr.js'].lineData[139]++;
  S.each(opts, function(opt) {
  _$jscoverage['/base/attr.js'].functionData[6]++;
  _$jscoverage['/base/attr.js'].lineData[140]++;
  opt.selected = S.inArray(Dom.val(opt), values);
});
  _$jscoverage['/base/attr.js'].lineData[143]++;
  if (visit32_143_1(!values.length)) {
    _$jscoverage['/base/attr.js'].lineData[144]++;
    elem.selectedIndex = -1;
  }
  _$jscoverage['/base/attr.js'].lineData[146]++;
  return values;
}}};
  _$jscoverage['/base/attr.js'].lineData[153]++;
  S.each(['radio', 'checkbox'], function(r) {
  _$jscoverage['/base/attr.js'].functionData[7]++;
  _$jscoverage['/base/attr.js'].lineData[154]++;
  valHooks[r] = {
  get: function(elem) {
  _$jscoverage['/base/attr.js'].functionData[8]++;
  _$jscoverage['/base/attr.js'].lineData[158]++;
  return visit33_158_1(elem.getAttribute('value') === null) ? 'on' : elem.value;
}, 
  set: function(elem, value) {
  _$jscoverage['/base/attr.js'].functionData[9]++;
  _$jscoverage['/base/attr.js'].lineData[161]++;
  if (visit34_161_1(S.isArray(value))) {
    _$jscoverage['/base/attr.js'].lineData[162]++;
    elem.checked = S.inArray(Dom.val(elem), value);
    _$jscoverage['/base/attr.js'].lineData[163]++;
    return 1;
  }
  _$jscoverage['/base/attr.js'].lineData[165]++;
  return undefined;
}};
});
  _$jscoverage['/base/attr.js'].lineData[172]++;
  attrHooks.style = {
  get: function(el) {
  _$jscoverage['/base/attr.js'].functionData[10]++;
  _$jscoverage['/base/attr.js'].lineData[174]++;
  return el.style.cssText;
}};
  _$jscoverage['/base/attr.js'].lineData[178]++;
  function toStr(value) {
    _$jscoverage['/base/attr.js'].functionData[11]++;
    _$jscoverage['/base/attr.js'].lineData[179]++;
    return visit35_179_1(value == null) ? '' : value + '';
  }
  _$jscoverage['/base/attr.js'].lineData[183]++;
  function getProp(elem, name) {
    _$jscoverage['/base/attr.js'].functionData[12]++;
    _$jscoverage['/base/attr.js'].lineData[184]++;
    name = visit36_184_1(propFix[name] || name);
    _$jscoverage['/base/attr.js'].lineData[185]++;
    var hook = propHooks[name];
    _$jscoverage['/base/attr.js'].lineData[186]++;
    if (visit37_186_1(hook && hook.get)) {
      _$jscoverage['/base/attr.js'].lineData[187]++;
      return hook.get(elem, name);
    } else {
      _$jscoverage['/base/attr.js'].lineData[189]++;
      return elem[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[193]++;
  S.mix(Dom, {
  _valHooks: valHooks, 
  _propFix: propFix, 
  _attrHooks: attrHooks, 
  _propHooks: propHooks, 
  _attrNodeHook: attrNodeHook, 
  _attrFix: attrFix, 
  prop: function(selector, name, value) {
  _$jscoverage['/base/attr.js'].functionData[13]++;
  _$jscoverage['/base/attr.js'].lineData[223]++;
  var elems = Dom.query(selector), i, elem, hook;
  _$jscoverage['/base/attr.js'].lineData[229]++;
  if (visit38_229_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[230]++;
    S.each(name, function(v, k) {
  _$jscoverage['/base/attr.js'].functionData[14]++;
  _$jscoverage['/base/attr.js'].lineData[231]++;
  Dom.prop(elems, k, v);
});
    _$jscoverage['/base/attr.js'].lineData[233]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[237]++;
  name = visit39_237_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[238]++;
  hook = propHooks[name];
  _$jscoverage['/base/attr.js'].lineData[239]++;
  if (visit40_239_1(value !== undefined)) {
    _$jscoverage['/base/attr.js'].lineData[240]++;
    for (i = elems.length - 1; visit41_240_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[241]++;
      elem = elems[i];
      _$jscoverage['/base/attr.js'].lineData[242]++;
      if (visit42_242_1(hook && hook.set)) {
        _$jscoverage['/base/attr.js'].lineData[243]++;
        hook.set(elem, value, name);
      } else {
        _$jscoverage['/base/attr.js'].lineData[245]++;
        elem[name] = value;
      }
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[249]++;
    if (visit43_249_1(elems.length)) {
      _$jscoverage['/base/attr.js'].lineData[250]++;
      return getProp(elems[0], name);
    }
  }
  _$jscoverage['/base/attr.js'].lineData[253]++;
  return undefined;
}, 
  hasProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[15]++;
  _$jscoverage['/base/attr.js'].lineData[263]++;
  var elems = Dom.query(selector), i, len = elems.length, el;
  _$jscoverage['/base/attr.js'].lineData[267]++;
  for (i = 0; visit44_267_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[268]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[269]++;
    if (visit45_269_1(getProp(el, name) !== undefined)) {
      _$jscoverage['/base/attr.js'].lineData[270]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[273]++;
  return false;
}, 
  removeProp: function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[16]++;
  _$jscoverage['/base/attr.js'].lineData[282]++;
  name = visit46_282_1(propFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[283]++;
  var elems = Dom.query(selector), i, el;
  _$jscoverage['/base/attr.js'].lineData[286]++;
  for (i = elems.length - 1; visit47_286_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[287]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[288]++;
    try {
      _$jscoverage['/base/attr.js'].lineData[289]++;
      el[name] = undefined;
      _$jscoverage['/base/attr.js'].lineData[290]++;
      delete el[name];
    }    catch (e) {
}
  }
}, 
  attr: function(selector, name, val, pass) {
  _$jscoverage['/base/attr.js'].functionData[17]++;
  _$jscoverage['/base/attr.js'].lineData[338]++;
  var els = Dom.query(selector), attrNormalizer, i, el = els[0], ret;
  _$jscoverage['/base/attr.js'].lineData[345]++;
  if (visit48_345_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attr.js'].lineData[346]++;
    pass = val;
    _$jscoverage['/base/attr.js'].lineData[347]++;
    for (var k in name) {
      _$jscoverage['/base/attr.js'].lineData[348]++;
      Dom.attr(els, k, name[k], pass);
    }
    _$jscoverage['/base/attr.js'].lineData[350]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[354]++;
  if (visit49_354_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[355]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[359]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[361]++;
  if (visit50_361_1(pass && attrFn[name])) {
    _$jscoverage['/base/attr.js'].lineData[362]++;
    return Dom[name](selector, val);
  }
  _$jscoverage['/base/attr.js'].lineData[366]++;
  name = visit51_366_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[368]++;
  if (visit52_368_1(R_BOOLEAN.test(name))) {
    _$jscoverage['/base/attr.js'].lineData[369]++;
    attrNormalizer = boolHook;
  } else {
    _$jscoverage['/base/attr.js'].lineData[370]++;
    if (visit53_370_1(R_INVALID_CHAR.test(name))) {
      _$jscoverage['/base/attr.js'].lineData[372]++;
      attrNormalizer = attrNodeHook;
    } else {
      _$jscoverage['/base/attr.js'].lineData[374]++;
      attrNormalizer = attrHooks[name];
    }
  }
  _$jscoverage['/base/attr.js'].lineData[377]++;
  if (visit54_377_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[378]++;
    if (visit55_378_1(el && visit56_378_2(el.nodeType === NodeType.ELEMENT_NODE))) {
      _$jscoverage['/base/attr.js'].lineData[380]++;
      if (visit57_380_1(nodeName(el) === 'form')) {
        _$jscoverage['/base/attr.js'].lineData[381]++;
        attrNormalizer = attrNodeHook;
      }
      _$jscoverage['/base/attr.js'].lineData[383]++;
      if (visit58_383_1(attrNormalizer && attrNormalizer.get)) {
        _$jscoverage['/base/attr.js'].lineData[384]++;
        return attrNormalizer.get(el, name);
      }
      _$jscoverage['/base/attr.js'].lineData[387]++;
      ret = el.getAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[389]++;
      if (visit59_389_1(ret === '')) {
        _$jscoverage['/base/attr.js'].lineData[390]++;
        var attrNode = el.getAttributeNode(name);
        _$jscoverage['/base/attr.js'].lineData[391]++;
        if (visit60_391_1(!attrNode || !attrNode.specified)) {
          _$jscoverage['/base/attr.js'].lineData[392]++;
          return undefined;
        }
      }
      _$jscoverage['/base/attr.js'].lineData[399]++;
      return visit61_399_1(ret === null) ? undefined : ret;
    }
  } else {
    _$jscoverage['/base/attr.js'].lineData[402]++;
    for (i = els.length - 1; visit62_402_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[403]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[404]++;
      if (visit63_404_1(el && visit64_404_2(el.nodeType === NodeType.ELEMENT_NODE))) {
        _$jscoverage['/base/attr.js'].lineData[405]++;
        if (visit65_405_1(nodeName(el) === 'form')) {
          _$jscoverage['/base/attr.js'].lineData[406]++;
          attrNormalizer = attrNodeHook;
        }
        _$jscoverage['/base/attr.js'].lineData[408]++;
        if (visit66_408_1(attrNormalizer && attrNormalizer.set)) {
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
  _$jscoverage['/base/attr.js'].functionData[18]++;
  _$jscoverage['/base/attr.js'].lineData[426]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[427]++;
  name = visit67_427_1(attrFix[name] || name);
  _$jscoverage['/base/attr.js'].lineData[428]++;
  var els = Dom.query(selector), propName, el, i;
  _$jscoverage['/base/attr.js'].lineData[431]++;
  for (i = els.length - 1; visit68_431_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[432]++;
    el = els[i];
    _$jscoverage['/base/attr.js'].lineData[433]++;
    if (visit69_433_1(el.nodeType === NodeType.ELEMENT_NODE)) {
      _$jscoverage['/base/attr.js'].lineData[434]++;
      el.removeAttribute(name);
      _$jscoverage['/base/attr.js'].lineData[436]++;
      if (visit70_436_1(R_BOOLEAN.test(name) && (propName = visit71_436_2(propFix[name] || name)) in el)) {
        _$jscoverage['/base/attr.js'].lineData[437]++;
        el[propName] = false;
      }
    }
  }
}, 
  hasAttr: visit72_450_1(docElement && !docElement.hasAttribute) ? function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[19]++;
  _$jscoverage['/base/attr.js'].lineData[452]++;
  name = name.toLowerCase();
  _$jscoverage['/base/attr.js'].lineData[453]++;
  var elems = Dom.query(selector), i, el, attrNode;
  _$jscoverage['/base/attr.js'].lineData[459]++;
  for (i = 0; visit73_459_1(i < elems.length); i++) {
    _$jscoverage['/base/attr.js'].lineData[460]++;
    el = elems[i];
    _$jscoverage['/base/attr.js'].lineData[461]++;
    attrNode = el.getAttributeNode(name);
    _$jscoverage['/base/attr.js'].lineData[462]++;
    if (visit74_462_1(attrNode && attrNode.specified)) {
      _$jscoverage['/base/attr.js'].lineData[463]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[466]++;
  return false;
} : function(selector, name) {
  _$jscoverage['/base/attr.js'].functionData[20]++;
  _$jscoverage['/base/attr.js'].lineData[469]++;
  var elems = Dom.query(selector), i, len = elems.length;
  _$jscoverage['/base/attr.js'].lineData[471]++;
  for (i = 0; visit75_471_1(i < len); i++) {
    _$jscoverage['/base/attr.js'].lineData[473]++;
    if (visit76_473_1(elems[i].hasAttribute(name))) {
      _$jscoverage['/base/attr.js'].lineData[474]++;
      return true;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[477]++;
  return false;
}, 
  val: function(selector, value) {
  _$jscoverage['/base/attr.js'].functionData[21]++;
  _$jscoverage['/base/attr.js'].lineData[489]++;
  var hook, ret, elem, els, i, val;
  _$jscoverage['/base/attr.js'].lineData[492]++;
  if (visit77_492_1(value === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[494]++;
    elem = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[496]++;
    if (visit78_496_1(elem)) {
      _$jscoverage['/base/attr.js'].lineData[497]++;
      hook = visit79_497_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
      _$jscoverage['/base/attr.js'].lineData[499]++;
      if (visit80_499_1(hook && visit81_499_2('get' in hook && visit82_500_1((ret = hook.get(elem, 'value')) !== undefined)))) {
        _$jscoverage['/base/attr.js'].lineData[501]++;
        return ret;
      }
      _$jscoverage['/base/attr.js'].lineData[504]++;
      ret = elem.value;
      _$jscoverage['/base/attr.js'].lineData[506]++;
      return visit83_506_1(typeof ret === 'string') ? ret.replace(R_RETURN, '') : visit84_510_1(ret == null) ? '' : ret;
    }
    _$jscoverage['/base/attr.js'].lineData[513]++;
    return undefined;
  }
  _$jscoverage['/base/attr.js'].lineData[516]++;
  els = Dom.query(selector);
  _$jscoverage['/base/attr.js'].lineData[517]++;
  for (i = els.length - 1; visit85_517_1(i >= 0); i--) {
    _$jscoverage['/base/attr.js'].lineData[518]++;
    elem = els[i];
    _$jscoverage['/base/attr.js'].lineData[519]++;
    if (visit86_519_1(elem.nodeType !== 1)) {
      _$jscoverage['/base/attr.js'].lineData[520]++;
      return undefined;
    }
    _$jscoverage['/base/attr.js'].lineData[523]++;
    val = value;
    _$jscoverage['/base/attr.js'].lineData[526]++;
    if (visit87_526_1(val == null)) {
      _$jscoverage['/base/attr.js'].lineData[527]++;
      val = '';
    } else {
      _$jscoverage['/base/attr.js'].lineData[528]++;
      if (visit88_528_1(typeof val === 'number')) {
        _$jscoverage['/base/attr.js'].lineData[529]++;
        val += '';
      } else {
        _$jscoverage['/base/attr.js'].lineData[530]++;
        if (visit89_530_1(S.isArray(val))) {
          _$jscoverage['/base/attr.js'].lineData[531]++;
          val = S.map(val, toStr);
        }
      }
    }
    _$jscoverage['/base/attr.js'].lineData[534]++;
    hook = visit90_534_1(valHooks[nodeName(elem)] || valHooks[elem.type]);
    _$jscoverage['/base/attr.js'].lineData[535]++;
    var hookHasSet = visit91_535_1(hook && ('set' in hook));
    _$jscoverage['/base/attr.js'].lineData[537]++;
    if (visit92_537_1(!hookHasSet || (visit93_537_2(hook.set(elem, val, 'value') === undefined)))) {
      _$jscoverage['/base/attr.js'].lineData[538]++;
      elem.value = val;
    }
  }
  _$jscoverage['/base/attr.js'].lineData[541]++;
  return undefined;
}, 
  text: function(selector, val) {
  _$jscoverage['/base/attr.js'].functionData[22]++;
  _$jscoverage['/base/attr.js'].lineData[553]++;
  var el, els, i, nodeType;
  _$jscoverage['/base/attr.js'].lineData[555]++;
  if (visit94_555_1(val === undefined)) {
    _$jscoverage['/base/attr.js'].lineData[557]++;
    el = Dom.get(selector);
    _$jscoverage['/base/attr.js'].lineData[558]++;
    return Dom._getText(el);
  } else {
    _$jscoverage['/base/attr.js'].lineData[560]++;
    els = Dom.query(selector);
    _$jscoverage['/base/attr.js'].lineData[561]++;
    for (i = els.length - 1; visit95_561_1(i >= 0); i--) {
      _$jscoverage['/base/attr.js'].lineData[562]++;
      el = els[i];
      _$jscoverage['/base/attr.js'].lineData[563]++;
      nodeType = el.nodeType;
      _$jscoverage['/base/attr.js'].lineData[564]++;
      if (visit96_564_1(nodeType === NodeType.ELEMENT_NODE)) {
        _$jscoverage['/base/attr.js'].lineData[565]++;
        Dom.cleanData(el.getElementsByTagName('*'));
        _$jscoverage['/base/attr.js'].lineData[566]++;
        if (visit97_566_1('textContent' in el)) {
          _$jscoverage['/base/attr.js'].lineData[567]++;
          el.textContent = val;
        } else {
          _$jscoverage['/base/attr.js'].lineData[569]++;
          el.innerText = val;
        }
      } else {
        _$jscoverage['/base/attr.js'].lineData[571]++;
        if (visit98_571_1(visit99_571_2(nodeType === NodeType.TEXT_NODE) || visit100_571_3(nodeType === NodeType.CDATA_SECTION_NODE))) {
          _$jscoverage['/base/attr.js'].lineData[572]++;
          el.nodeValue = val;
        }
      }
    }
  }
  _$jscoverage['/base/attr.js'].lineData[576]++;
  return undefined;
}, 
  _getText: function(el) {
  _$jscoverage['/base/attr.js'].functionData[23]++;
  _$jscoverage['/base/attr.js'].lineData[580]++;
  return el.textContent;
}});
  _$jscoverage['/base/attr.js'].lineData[584]++;
  return Dom;
});
