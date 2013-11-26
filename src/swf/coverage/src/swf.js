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
if (! _$jscoverage['/swf.js']) {
  _$jscoverage['/swf.js'] = {};
  _$jscoverage['/swf.js'].lineData = [];
  _$jscoverage['/swf.js'].lineData[6] = 0;
  _$jscoverage['/swf.js'].lineData[7] = 0;
  _$jscoverage['/swf.js'].lineData[8] = 0;
  _$jscoverage['/swf.js'].lineData[9] = 0;
  _$jscoverage['/swf.js'].lineData[10] = 0;
  _$jscoverage['/swf.js'].lineData[12] = 0;
  _$jscoverage['/swf.js'].lineData[54] = 0;
  _$jscoverage['/swf.js'].lineData[60] = 0;
  _$jscoverage['/swf.js'].lineData[62] = 0;
  _$jscoverage['/swf.js'].lineData[63] = 0;
  _$jscoverage['/swf.js'].lineData[64] = 0;
  _$jscoverage['/swf.js'].lineData[78] = 0;
  _$jscoverage['/swf.js'].lineData[81] = 0;
  _$jscoverage['/swf.js'].lineData[82] = 0;
  _$jscoverage['/swf.js'].lineData[83] = 0;
  _$jscoverage['/swf.js'].lineData[87] = 0;
  _$jscoverage['/swf.js'].lineData[88] = 0;
  _$jscoverage['/swf.js'].lineData[91] = 0;
  _$jscoverage['/swf.js'].lineData[92] = 0;
  _$jscoverage['/swf.js'].lineData[95] = 0;
  _$jscoverage['/swf.js'].lineData[97] = 0;
  _$jscoverage['/swf.js'].lineData[100] = 0;
  _$jscoverage['/swf.js'].lineData[102] = 0;
  _$jscoverage['/swf.js'].lineData[105] = 0;
  _$jscoverage['/swf.js'].lineData[107] = 0;
  _$jscoverage['/swf.js'].lineData[115] = 0;
  _$jscoverage['/swf.js'].lineData[116] = 0;
  _$jscoverage['/swf.js'].lineData[118] = 0;
  _$jscoverage['/swf.js'].lineData[122] = 0;
  _$jscoverage['/swf.js'].lineData[124] = 0;
  _$jscoverage['/swf.js'].lineData[125] = 0;
  _$jscoverage['/swf.js'].lineData[127] = 0;
  _$jscoverage['/swf.js'].lineData[130] = 0;
  _$jscoverage['/swf.js'].lineData[131] = 0;
  _$jscoverage['/swf.js'].lineData[133] = 0;
  _$jscoverage['/swf.js'].lineData[136] = 0;
  _$jscoverage['/swf.js'].lineData[138] = 0;
  _$jscoverage['/swf.js'].lineData[140] = 0;
  _$jscoverage['/swf.js'].lineData[141] = 0;
  _$jscoverage['/swf.js'].lineData[142] = 0;
  _$jscoverage['/swf.js'].lineData[144] = 0;
  _$jscoverage['/swf.js'].lineData[150] = 0;
  _$jscoverage['/swf.js'].lineData[152] = 0;
  _$jscoverage['/swf.js'].lineData[153] = 0;
  _$jscoverage['/swf.js'].lineData[162] = 0;
  _$jscoverage['/swf.js'].lineData[165] = 0;
  _$jscoverage['/swf.js'].lineData[166] = 0;
  _$jscoverage['/swf.js'].lineData[167] = 0;
  _$jscoverage['/swf.js'].lineData[168] = 0;
  _$jscoverage['/swf.js'].lineData[172] = 0;
  _$jscoverage['/swf.js'].lineData[173] = 0;
  _$jscoverage['/swf.js'].lineData[174] = 0;
  _$jscoverage['/swf.js'].lineData[177] = 0;
  _$jscoverage['/swf.js'].lineData[179] = 0;
  _$jscoverage['/swf.js'].lineData[185] = 0;
  _$jscoverage['/swf.js'].lineData[186] = 0;
  _$jscoverage['/swf.js'].lineData[187] = 0;
  _$jscoverage['/swf.js'].lineData[191] = 0;
  _$jscoverage['/swf.js'].lineData[192] = 0;
  _$jscoverage['/swf.js'].lineData[194] = 0;
  _$jscoverage['/swf.js'].lineData[195] = 0;
  _$jscoverage['/swf.js'].lineData[196] = 0;
  _$jscoverage['/swf.js'].lineData[199] = 0;
  _$jscoverage['/swf.js'].lineData[203] = 0;
  _$jscoverage['/swf.js'].lineData[276] = 0;
  _$jscoverage['/swf.js'].lineData[277] = 0;
  _$jscoverage['/swf.js'].lineData[279] = 0;
  _$jscoverage['/swf.js'].lineData[282] = 0;
  _$jscoverage['/swf.js'].lineData[294] = 0;
  _$jscoverage['/swf.js'].lineData[295] = 0;
  _$jscoverage['/swf.js'].lineData[297] = 0;
  _$jscoverage['/swf.js'].lineData[377] = 0;
  _$jscoverage['/swf.js'].lineData[378] = 0;
  _$jscoverage['/swf.js'].lineData[381] = 0;
  _$jscoverage['/swf.js'].lineData[382] = 0;
  _$jscoverage['/swf.js'].lineData[383] = 0;
  _$jscoverage['/swf.js'].lineData[384] = 0;
  _$jscoverage['/swf.js'].lineData[385] = 0;
  _$jscoverage['/swf.js'].lineData[386] = 0;
  _$jscoverage['/swf.js'].lineData[388] = 0;
  _$jscoverage['/swf.js'].lineData[430] = 0;
  _$jscoverage['/swf.js'].lineData[431] = 0;
  _$jscoverage['/swf.js'].lineData[432] = 0;
  _$jscoverage['/swf.js'].lineData[433] = 0;
  _$jscoverage['/swf.js'].lineData[436] = 0;
  _$jscoverage['/swf.js'].lineData[439] = 0;
  _$jscoverage['/swf.js'].lineData[440] = 0;
  _$jscoverage['/swf.js'].lineData[444] = 0;
  _$jscoverage['/swf.js'].lineData[445] = 0;
  _$jscoverage['/swf.js'].lineData[446] = 0;
  _$jscoverage['/swf.js'].lineData[447] = 0;
  _$jscoverage['/swf.js'].lineData[449] = 0;
  _$jscoverage['/swf.js'].lineData[450] = 0;
  _$jscoverage['/swf.js'].lineData[451] = 0;
  _$jscoverage['/swf.js'].lineData[452] = 0;
  _$jscoverage['/swf.js'].lineData[453] = 0;
  _$jscoverage['/swf.js'].lineData[454] = 0;
  _$jscoverage['/swf.js'].lineData[455] = 0;
  _$jscoverage['/swf.js'].lineData[456] = 0;
  _$jscoverage['/swf.js'].lineData[457] = 0;
  _$jscoverage['/swf.js'].lineData[458] = 0;
  _$jscoverage['/swf.js'].lineData[462] = 0;
  _$jscoverage['/swf.js'].lineData[463] = 0;
  _$jscoverage['/swf.js'].lineData[465] = 0;
  _$jscoverage['/swf.js'].lineData[470] = 0;
  _$jscoverage['/swf.js'].lineData[471] = 0;
  _$jscoverage['/swf.js'].lineData[472] = 0;
  _$jscoverage['/swf.js'].lineData[473] = 0;
  _$jscoverage['/swf.js'].lineData[474] = 0;
  _$jscoverage['/swf.js'].lineData[475] = 0;
  _$jscoverage['/swf.js'].lineData[478] = 0;
  _$jscoverage['/swf.js'].lineData[479] = 0;
  _$jscoverage['/swf.js'].lineData[482] = 0;
  _$jscoverage['/swf.js'].lineData[486] = 0;
  _$jscoverage['/swf.js'].lineData[487] = 0;
  _$jscoverage['/swf.js'].lineData[490] = 0;
  _$jscoverage['/swf.js'].lineData[491] = 0;
  _$jscoverage['/swf.js'].lineData[496] = 0;
  _$jscoverage['/swf.js'].lineData[497] = 0;
  _$jscoverage['/swf.js'].lineData[500] = 0;
  _$jscoverage['/swf.js'].lineData[501] = 0;
  _$jscoverage['/swf.js'].lineData[502] = 0;
  _$jscoverage['/swf.js'].lineData[505] = 0;
  _$jscoverage['/swf.js'].lineData[507] = 0;
  _$jscoverage['/swf.js'].lineData[510] = 0;
  _$jscoverage['/swf.js'].lineData[512] = 0;
  _$jscoverage['/swf.js'].lineData[514] = 0;
  _$jscoverage['/swf.js'].lineData[518] = 0;
  _$jscoverage['/swf.js'].lineData[519] = 0;
  _$jscoverage['/swf.js'].lineData[520] = 0;
  _$jscoverage['/swf.js'].lineData[521] = 0;
  _$jscoverage['/swf.js'].lineData[522] = 0;
  _$jscoverage['/swf.js'].lineData[523] = 0;
  _$jscoverage['/swf.js'].lineData[524] = 0;
  _$jscoverage['/swf.js'].lineData[526] = 0;
  _$jscoverage['/swf.js'].lineData[527] = 0;
  _$jscoverage['/swf.js'].lineData[528] = 0;
  _$jscoverage['/swf.js'].lineData[529] = 0;
  _$jscoverage['/swf.js'].lineData[531] = 0;
  _$jscoverage['/swf.js'].lineData[538] = 0;
  _$jscoverage['/swf.js'].lineData[539] = 0;
  _$jscoverage['/swf.js'].lineData[542] = 0;
  _$jscoverage['/swf.js'].lineData[543] = 0;
  _$jscoverage['/swf.js'].lineData[544] = 0;
  _$jscoverage['/swf.js'].lineData[546] = 0;
  _$jscoverage['/swf.js'].lineData[547] = 0;
  _$jscoverage['/swf.js'].lineData[550] = 0;
  _$jscoverage['/swf.js'].lineData[551] = 0;
  _$jscoverage['/swf.js'].lineData[554] = 0;
  _$jscoverage['/swf.js'].lineData[555] = 0;
  _$jscoverage['/swf.js'].lineData[558] = 0;
  _$jscoverage['/swf.js'].lineData[559] = 0;
}
if (! _$jscoverage['/swf.js'].functionData) {
  _$jscoverage['/swf.js'].functionData = [];
  _$jscoverage['/swf.js'].functionData[0] = 0;
  _$jscoverage['/swf.js'].functionData[1] = 0;
  _$jscoverage['/swf.js'].functionData[2] = 0;
  _$jscoverage['/swf.js'].functionData[3] = 0;
  _$jscoverage['/swf.js'].functionData[4] = 0;
  _$jscoverage['/swf.js'].functionData[5] = 0;
  _$jscoverage['/swf.js'].functionData[6] = 0;
  _$jscoverage['/swf.js'].functionData[7] = 0;
  _$jscoverage['/swf.js'].functionData[8] = 0;
  _$jscoverage['/swf.js'].functionData[9] = 0;
  _$jscoverage['/swf.js'].functionData[10] = 0;
  _$jscoverage['/swf.js'].functionData[11] = 0;
  _$jscoverage['/swf.js'].functionData[12] = 0;
  _$jscoverage['/swf.js'].functionData[13] = 0;
  _$jscoverage['/swf.js'].functionData[14] = 0;
  _$jscoverage['/swf.js'].functionData[15] = 0;
  _$jscoverage['/swf.js'].functionData[16] = 0;
  _$jscoverage['/swf.js'].functionData[17] = 0;
  _$jscoverage['/swf.js'].functionData[18] = 0;
  _$jscoverage['/swf.js'].functionData[19] = 0;
  _$jscoverage['/swf.js'].functionData[20] = 0;
}
if (! _$jscoverage['/swf.js'].branchData) {
  _$jscoverage['/swf.js'].branchData = {};
  _$jscoverage['/swf.js'].branchData['78'] = [];
  _$jscoverage['/swf.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['81'] = [];
  _$jscoverage['/swf.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['87'] = [];
  _$jscoverage['/swf.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['91'] = [];
  _$jscoverage['/swf.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['95'] = [];
  _$jscoverage['/swf.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['96'] = [];
  _$jscoverage['/swf.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['100'] = [];
  _$jscoverage['/swf.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['101'] = [];
  _$jscoverage['/swf.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['105'] = [];
  _$jscoverage['/swf.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['115'] = [];
  _$jscoverage['/swf.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['124'] = [];
  _$jscoverage['/swf.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['130'] = [];
  _$jscoverage['/swf.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['140'] = [];
  _$jscoverage['/swf.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['141'] = [];
  _$jscoverage['/swf.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['152'] = [];
  _$jscoverage['/swf.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['165'] = [];
  _$jscoverage['/swf.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['167'] = [];
  _$jscoverage['/swf.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['173'] = [];
  _$jscoverage['/swf.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['191'] = [];
  _$jscoverage['/swf.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['195'] = [];
  _$jscoverage['/swf.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['276'] = [];
  _$jscoverage['/swf.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['294'] = [];
  _$jscoverage['/swf.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['380'] = [];
  _$jscoverage['/swf.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['381'] = [];
  _$jscoverage['/swf.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['383'] = [];
  _$jscoverage['/swf.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['385'] = [];
  _$jscoverage['/swf.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['432'] = [];
  _$jscoverage['/swf.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['444'] = [];
  _$jscoverage['/swf.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['446'] = [];
  _$jscoverage['/swf.js'].branchData['446'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['450'] = [];
  _$jscoverage['/swf.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['452'] = [];
  _$jscoverage['/swf.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['453'] = [];
  _$jscoverage['/swf.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['453'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['455'] = [];
  _$jscoverage['/swf.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['457'] = [];
  _$jscoverage['/swf.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['462'] = [];
  _$jscoverage['/swf.js'].branchData['462'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['474'] = [];
  _$jscoverage['/swf.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['478'] = [];
  _$jscoverage['/swf.js'].branchData['478'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['500'] = [];
  _$jscoverage['/swf.js'].branchData['500'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['520'] = [];
  _$jscoverage['/swf.js'].branchData['520'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['543'] = [];
  _$jscoverage['/swf.js'].branchData['543'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['546'] = [];
  _$jscoverage['/swf.js'].branchData['546'][1] = new BranchData();
}
_$jscoverage['/swf.js'].branchData['546'][1].init(119, 4, 'data');
function visit55_546_1(result) {
  _$jscoverage['/swf.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['543'][1].init(17, 23, 'typeof data != \'string\'');
function visit54_543_1(result) {
  _$jscoverage['/swf.js'].branchData['543'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['520'][1].init(42, 6, 'OLD_IE');
function visit53_520_1(result) {
  _$jscoverage['/swf.js'].branchData['520'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['500'][1].init(189, 2, 'ie');
function visit52_500_1(result) {
  _$jscoverage['/swf.js'].branchData['500'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['478'][1].init(163, 14, 'k == FLASHVARS');
function visit51_478_1(result) {
  _$jscoverage['/swf.js'].branchData['478'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['474'][1].init(50, 11, 'k in PARAMS');
function visit50_474_1(result) {
  _$jscoverage['/swf.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['462'][1].init(868, 19, 'nodeName == "embed"');
function visit49_462_1(result) {
  _$jscoverage['/swf.js'].branchData['462'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['457'][1].init(275, 35, 'Dom.nodeName(params[i]) == "object"');
function visit48_457_1(result) {
  _$jscoverage['/swf.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['455'][1].init(163, 30, 'Dom.nodeName(param) == "embed"');
function visit47_455_1(result) {
  _$jscoverage['/swf.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['453'][2].init(26, 29, 'Dom.attr(param, "name") || ""');
function visit46_453_2(result) {
  _$jscoverage['/swf.js'].branchData['453'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['453'][1].init(26, 55, '(Dom.attr(param, "name") || "").toLowerCase() == "movie"');
function visit45_453_1(result) {
  _$jscoverage['/swf.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['452'][1].init(56, 19, 'param.nodeType == 1');
function visit44_452_1(result) {
  _$jscoverage['/swf.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['450'][1].init(176, 17, 'i < params.length');
function visit43_450_1(result) {
  _$jscoverage['/swf.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['446'][1].init(58, 3, 'url');
function visit42_446_1(result) {
  _$jscoverage['/swf.js'].branchData['446'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['444'][1].init(134, 20, 'nodeName == "object"');
function visit41_444_1(result) {
  _$jscoverage['/swf.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['432'][1].init(17, 27, 'typeof obj[i] == "function"');
function visit40_432_1(result) {
  _$jscoverage['/swf.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['385'][1].init(390, 19, 'nodeName == \'param\'');
function visit39_385_1(result) {
  _$jscoverage['/swf.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['383'][1].init(289, 20, 'nodeName == \'object\'');
function visit38_383_1(result) {
  _$jscoverage['/swf.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['381'][1].init(190, 19, 'nodeName == \'embed\'');
function visit37_381_1(result) {
  _$jscoverage['/swf.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['380'][1].init(88, 38, 'srcElement && Dom.nodeName(srcElement)');
function visit36_380_1(result) {
  _$jscoverage['/swf.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['294'][1].init(25, 20, 'typeof v == \'string\'');
function visit35_294_1(result) {
  _$jscoverage['/swf.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['276'][1].init(25, 20, 'typeof v == \'string\'');
function visit34_276_1(result) {
  _$jscoverage['/swf.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['195'][1].init(25, 25, 'swfObject.readyState == 4');
function visit33_195_1(result) {
  _$jscoverage['/swf.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['191'][1].init(273, 6, 'OLD_IE');
function visit32_191_1(result) {
  _$jscoverage['/swf.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['173'][1].init(154, 17, 'args.length !== 0');
function visit31_173_1(result) {
  _$jscoverage['/swf.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['167'][1].init(21, 9, 'swf[func]');
function visit30_167_1(result) {
  _$jscoverage['/swf.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['165'][1].init(103, 10, 'args || []');
function visit29_165_1(result) {
  _$jscoverage['/swf.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['152'][1].init(3178, 19, '!self.get(\'status\')');
function visit28_152_1(result) {
  _$jscoverage['/swf.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['141'][1].init(21, 6, 'OLD_IE');
function visit27_141_1(result) {
  _$jscoverage['/swf.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['140'][1].init(2810, 18, 'htmlMode == \'full\'');
function visit26_140_1(result) {
  _$jscoverage['/swf.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['130'][1].init(2514, 26, '\'outerHTML\' in placeHolder');
function visit25_130_1(result) {
  _$jscoverage['/swf.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['124'][1].init(2332, 8, 'elBefore');
function visit24_124_1(result) {
  _$jscoverage['/swf.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['115'][1].init(2031, 18, 'htmlMode == \'full\'');
function visit23_115_1(result) {
  _$jscoverage['/swf.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['105'][1].init(552, 22, 'params.flashVars || {}');
function visit22_105_1(result) {
  _$jscoverage['/swf.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['101'][2].init(76, 32, 'parseInt(attrs.height, 10) < 137');
function visit21_101_2(result) {
  _$jscoverage['/swf.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['101'][1].init(48, 60, '!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137');
function visit20_101_1(result) {
  _$jscoverage['/swf.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['100'][1].init(318, 110, '!(\'height\' in attrs) || (!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137)');
function visit19_100_1(result) {
  _$jscoverage['/swf.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['96'][2].init(74, 31, 'parseInt(attrs.width, 10) < 310');
function visit18_96_2(result) {
  _$jscoverage['/swf.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['96'][1].init(47, 58, '!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310');
function visit17_96_1(result) {
  _$jscoverage['/swf.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['95'][1].init(115, 107, '!(\'width\' in attrs) || (!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310)');
function visit16_95_1(result) {
  _$jscoverage['/swf.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['91'][1].init(130, 14, 'expressInstall');
function visit15_91_1(result) {
  _$jscoverage['/swf.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['87'][1].init(898, 27, 'version && !fpvGTE(version)');
function visit14_87_1(result) {
  _$jscoverage['/swf.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['81'][1].init(733, 6, '!fpv()');
function visit13_81_1(result) {
  _$jscoverage['/swf.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['78'][1].init(654, 29, 'attrs.id || S.guid(\'ks-swf-\')');
function visit12_78_1(result) {
  _$jscoverage['/swf.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/swf.js'].functionData[0]++;
  _$jscoverage['/swf.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/swf.js'].lineData[8]++;
  var Json = require('json');
  _$jscoverage['/swf.js'].lineData[9]++;
  var Attribute = require('attribute');
  _$jscoverage['/swf.js'].lineData[10]++;
  var FlashUA = require('swf/ua');
  _$jscoverage['/swf.js'].lineData[12]++;
  var OLD_IE = !!S.Env.host['ActiveXObject'], TYPE = 'application/x-shockwave-flash', CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000', FLASHVARS = 'flashvars', EMPTY = '', SPACE = ' ', EQUAL = '=', DOUBLE_QUOTE = '"', LT = '<', GT = '>', doc = S.Env.host.document, fpv = FlashUA.fpv, fpvGEQ = FlashUA.fpvGEQ, fpvGTE = FlashUA.fpvGTE, OBJECT_TAG = 'object', encode = encodeURIComponent, PARAMS = {
  wmode: EMPTY, 
  allowscriptaccess: EMPTY, 
  allownetworking: EMPTY, 
  allowfullscreen: EMPTY, 
  play: 'false', 
  loop: EMPTY, 
  menu: EMPTY, 
  quality: EMPTY, 
  scale: EMPTY, 
  salign: EMPTY, 
  bgcolor: EMPTY, 
  devicefont: EMPTY, 
  hasPriority: EMPTY, 
  base: EMPTY, 
  swliveconnect: EMPTY, 
  seamlesstabbing: EMPTY};
  _$jscoverage['/swf.js'].lineData[54]++;
  var SWF;
  _$jscoverage['/swf.js'].lineData[60]++;
  return SWF = Attribute.extend({
  constructor: function() {
  _$jscoverage['/swf.js'].functionData[1]++;
  _$jscoverage['/swf.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[63]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/swf.js'].lineData[64]++;
  var expressInstall = self.get('expressInstall'), swf, html, id, htmlMode = self.get('htmlMode'), flashVars, params = self.get('params'), attrs = self.get('attrs'), doc = self.get('document'), placeHolder = Dom.create('<span>', undefined, doc), elBefore = self.get('elBefore'), installedSrc = self.get('src'), version = self.get('version');
  _$jscoverage['/swf.js'].lineData[78]++;
  id = attrs.id = visit12_78_1(attrs.id || S.guid('ks-swf-'));
  _$jscoverage['/swf.js'].lineData[81]++;
  if (visit13_81_1(!fpv())) {
    _$jscoverage['/swf.js'].lineData[82]++;
    self.set('status', SWF.Status.NOT_INSTALLED);
    _$jscoverage['/swf.js'].lineData[83]++;
    return;
  }
  _$jscoverage['/swf.js'].lineData[87]++;
  if (visit14_87_1(version && !fpvGTE(version))) {
    _$jscoverage['/swf.js'].lineData[88]++;
    self.set('status', SWF.Status.TOO_LOW);
    _$jscoverage['/swf.js'].lineData[91]++;
    if (visit15_91_1(expressInstall)) {
      _$jscoverage['/swf.js'].lineData[92]++;
      installedSrc = expressInstall;
      _$jscoverage['/swf.js'].lineData[95]++;
      if (visit16_95_1(!('width' in attrs) || (visit17_96_1(!/%$/.test(attrs.width) && visit18_96_2(parseInt(attrs.width, 10) < 310))))) {
        _$jscoverage['/swf.js'].lineData[97]++;
        attrs.width = "310";
      }
      _$jscoverage['/swf.js'].lineData[100]++;
      if (visit19_100_1(!('height' in attrs) || (visit20_101_1(!/%$/.test(attrs.height) && visit21_101_2(parseInt(attrs.height, 10) < 137))))) {
        _$jscoverage['/swf.js'].lineData[102]++;
        attrs.height = "137";
      }
      _$jscoverage['/swf.js'].lineData[105]++;
      flashVars = params.flashVars = visit22_105_1(params.flashVars || {});
      _$jscoverage['/swf.js'].lineData[107]++;
      S.mix(flashVars, {
  MMredirectURL: location.href, 
  MMplayerType: OLD_IE ? "ActiveX" : "PlugIn", 
  MMdoctitle: doc.title.slice(0, 47) + " - Flash Player Installation"});
    }
  }
  _$jscoverage['/swf.js'].lineData[115]++;
  if (visit23_115_1(htmlMode == 'full')) {
    _$jscoverage['/swf.js'].lineData[116]++;
    html = _stringSWFFull(installedSrc, attrs, params);
  } else {
    _$jscoverage['/swf.js'].lineData[118]++;
    html = _stringSWFDefault(installedSrc, attrs, params);
  }
  _$jscoverage['/swf.js'].lineData[122]++;
  self.set('html', html);
  _$jscoverage['/swf.js'].lineData[124]++;
  if (visit24_124_1(elBefore)) {
    _$jscoverage['/swf.js'].lineData[125]++;
    Dom.insertBefore(placeHolder, elBefore);
  } else {
    _$jscoverage['/swf.js'].lineData[127]++;
    Dom.append(placeHolder, self.get('render'));
  }
  _$jscoverage['/swf.js'].lineData[130]++;
  if (visit25_130_1('outerHTML' in placeHolder)) {
    _$jscoverage['/swf.js'].lineData[131]++;
    placeHolder.outerHTML = html;
  } else {
    _$jscoverage['/swf.js'].lineData[133]++;
    placeHolder.parentNode.replaceChild(Dom.create(html), placeHolder);
  }
  _$jscoverage['/swf.js'].lineData[136]++;
  swf = Dom.get('#' + id, doc);
  _$jscoverage['/swf.js'].lineData[138]++;
  self.set('swfObject', swf);
  _$jscoverage['/swf.js'].lineData[140]++;
  if (visit26_140_1(htmlMode == 'full')) {
    _$jscoverage['/swf.js'].lineData[141]++;
    if (visit27_141_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[142]++;
      self.set('swfObject', swf);
    } else {
      _$jscoverage['/swf.js'].lineData[144]++;
      self.set('swfObject', swf.parentNode);
    }
  }
  _$jscoverage['/swf.js'].lineData[150]++;
  self.set('el', swf);
  _$jscoverage['/swf.js'].lineData[152]++;
  if (visit28_152_1(!self.get('status'))) {
    _$jscoverage['/swf.js'].lineData[153]++;
    self.set('status', SWF.Status.SUCCESS);
  }
}, 
  'callSWF': function(func, args) {
  _$jscoverage['/swf.js'].functionData[2]++;
  _$jscoverage['/swf.js'].lineData[162]++;
  var swf = this.get('el'), ret, params;
  _$jscoverage['/swf.js'].lineData[165]++;
  args = visit29_165_1(args || []);
  _$jscoverage['/swf.js'].lineData[166]++;
  try {
    _$jscoverage['/swf.js'].lineData[167]++;
    if (visit30_167_1(swf[func])) {
      _$jscoverage['/swf.js'].lineData[168]++;
      ret = swf[func].apply(swf, args);
    }
  }  catch (e) {
  _$jscoverage['/swf.js'].lineData[172]++;
  params = "";
  _$jscoverage['/swf.js'].lineData[173]++;
  if (visit31_173_1(args.length !== 0)) {
    _$jscoverage['/swf.js'].lineData[174]++;
    params = "'" + args.join("', '") + "'";
  }
  _$jscoverage['/swf.js'].lineData[177]++;
  ret = (new Function('swf', 'return swf.' + func + '(' + params + ');'))(swf);
}
  _$jscoverage['/swf.js'].lineData[179]++;
  return ret;
}, 
  destroy: function() {
  _$jscoverage['/swf.js'].functionData[3]++;
  _$jscoverage['/swf.js'].lineData[185]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[186]++;
  self.detach();
  _$jscoverage['/swf.js'].lineData[187]++;
  var swfObject = self.get('swfObject');
  _$jscoverage['/swf.js'].lineData[191]++;
  if (visit32_191_1(OLD_IE)) {
    _$jscoverage['/swf.js'].lineData[192]++;
    swfObject.style.display = 'none';
    _$jscoverage['/swf.js'].lineData[194]++;
    (function() {
  _$jscoverage['/swf.js'].functionData[4]++;
  _$jscoverage['/swf.js'].lineData[195]++;
  if (visit33_195_1(swfObject.readyState == 4)) {
    _$jscoverage['/swf.js'].lineData[196]++;
    removeObjectInIE(swfObject);
  } else {
    _$jscoverage['/swf.js'].lineData[199]++;
    setTimeout(arguments.callee, 10);
  }
})();
  } else {
    _$jscoverage['/swf.js'].lineData[203]++;
    swfObject.parentNode.removeChild(swfObject);
  }
}}, {
  ATTRS: {
  expressInstall: {
  value: S.config('base') + 'swf/assets/expressInstall.swf'}, 
  src: {}, 
  version: {
  value: "9"}, 
  params: {
  value: {}}, 
  attrs: {
  value: {}}, 
  render: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[5]++;
  _$jscoverage['/swf.js'].lineData[276]++;
  if (visit34_276_1(typeof v == 'string')) {
    _$jscoverage['/swf.js'].lineData[277]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[279]++;
  return v;
}, 
  valueFn: function() {
  _$jscoverage['/swf.js'].functionData[6]++;
  _$jscoverage['/swf.js'].lineData[282]++;
  return document.body;
}}, 
  elBefore: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[7]++;
  _$jscoverage['/swf.js'].lineData[294]++;
  if (visit35_294_1(typeof v == 'string')) {
    _$jscoverage['/swf.js'].lineData[295]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[297]++;
  return v;
}}, 
  document: {
  value: doc}, 
  status: {}, 
  el: {}, 
  swfObject: {}, 
  html: {}, 
  htmlMode: {
  value: 'default'}}, 
  getSrc: function(swf) {
  _$jscoverage['/swf.js'].functionData[8]++;
  _$jscoverage['/swf.js'].lineData[377]++;
  swf = Dom.get(swf);
  _$jscoverage['/swf.js'].lineData[378]++;
  var srcElement = getSrcElements(swf)[0], src, nodeName = visit36_380_1(srcElement && Dom.nodeName(srcElement));
  _$jscoverage['/swf.js'].lineData[381]++;
  if (visit37_381_1(nodeName == 'embed')) {
    _$jscoverage['/swf.js'].lineData[382]++;
    return Dom.attr(srcElement, 'src');
  } else {
    _$jscoverage['/swf.js'].lineData[383]++;
    if (visit38_383_1(nodeName == 'object')) {
      _$jscoverage['/swf.js'].lineData[384]++;
      return Dom.attr(srcElement, 'data');
    } else {
      _$jscoverage['/swf.js'].lineData[385]++;
      if (visit39_385_1(nodeName == 'param')) {
        _$jscoverage['/swf.js'].lineData[386]++;
        return Dom.attr(srcElement, 'value');
      }
    }
  }
  _$jscoverage['/swf.js'].lineData[388]++;
  return null;
}, 
  Status: {
  TOO_LOW: 'flash version is too low', 
  NOT_INSTALLED: 'flash is not installed', 
  SUCCESS: 'success'}, 
  HtmlMode: {
  DEFAULT: 'default', 
  FULL: 'full'}, 
  fpv: fpv, 
  fpvGEQ: fpvGEQ, 
  fpvGTE: fpvGTE});
  _$jscoverage['/swf.js'].lineData[430]++;
  function removeObjectInIE(obj) {
    _$jscoverage['/swf.js'].functionData[9]++;
    _$jscoverage['/swf.js'].lineData[431]++;
    for (var i in obj) {
      _$jscoverage['/swf.js'].lineData[432]++;
      if (visit40_432_1(typeof obj[i] == "function")) {
        _$jscoverage['/swf.js'].lineData[433]++;
        obj[i] = null;
      }
    }
    _$jscoverage['/swf.js'].lineData[436]++;
    obj.parentNode.removeChild(obj);
  }
  _$jscoverage['/swf.js'].lineData[439]++;
  function getSrcElements(swf) {
    _$jscoverage['/swf.js'].functionData[10]++;
    _$jscoverage['/swf.js'].lineData[440]++;
    var url = "", params, i, param, elements = [], nodeName = Dom.nodeName(swf);
    _$jscoverage['/swf.js'].lineData[444]++;
    if (visit41_444_1(nodeName == "object")) {
      _$jscoverage['/swf.js'].lineData[445]++;
      url = Dom.attr(swf, "data");
      _$jscoverage['/swf.js'].lineData[446]++;
      if (visit42_446_1(url)) {
        _$jscoverage['/swf.js'].lineData[447]++;
        elements.push(swf);
      }
      _$jscoverage['/swf.js'].lineData[449]++;
      params = swf.childNodes;
      _$jscoverage['/swf.js'].lineData[450]++;
      for (i = 0; visit43_450_1(i < params.length); i++) {
        _$jscoverage['/swf.js'].lineData[451]++;
        param = params[i];
        _$jscoverage['/swf.js'].lineData[452]++;
        if (visit44_452_1(param.nodeType == 1)) {
          _$jscoverage['/swf.js'].lineData[453]++;
          if (visit45_453_1((visit46_453_2(Dom.attr(param, "name") || "")).toLowerCase() == "movie")) {
            _$jscoverage['/swf.js'].lineData[454]++;
            elements.push(param);
          } else {
            _$jscoverage['/swf.js'].lineData[455]++;
            if (visit47_455_1(Dom.nodeName(param) == "embed")) {
              _$jscoverage['/swf.js'].lineData[456]++;
              elements.push(param);
            } else {
              _$jscoverage['/swf.js'].lineData[457]++;
              if (visit48_457_1(Dom.nodeName(params[i]) == "object")) {
                _$jscoverage['/swf.js'].lineData[458]++;
                elements.push(param);
              }
            }
          }
        }
      }
    } else {
      _$jscoverage['/swf.js'].lineData[462]++;
      if (visit49_462_1(nodeName == "embed")) {
        _$jscoverage['/swf.js'].lineData[463]++;
        elements.push(swf);
      }
    }
    _$jscoverage['/swf.js'].lineData[465]++;
    return elements;
  }
  _$jscoverage['/swf.js'].lineData[470]++;
  function collectionParams(params) {
    _$jscoverage['/swf.js'].functionData[11]++;
    _$jscoverage['/swf.js'].lineData[471]++;
    var par = EMPTY;
    _$jscoverage['/swf.js'].lineData[472]++;
    S.each(params, function(v, k) {
  _$jscoverage['/swf.js'].functionData[12]++;
  _$jscoverage['/swf.js'].lineData[473]++;
  k = k.toLowerCase();
  _$jscoverage['/swf.js'].lineData[474]++;
  if (visit50_474_1(k in PARAMS)) {
    _$jscoverage['/swf.js'].lineData[475]++;
    par += stringParam(k, v);
  } else {
    _$jscoverage['/swf.js'].lineData[478]++;
    if (visit51_478_1(k == FLASHVARS)) {
      _$jscoverage['/swf.js'].lineData[479]++;
      par += stringParam(k, toFlashVars(v));
    }
  }
});
    _$jscoverage['/swf.js'].lineData[482]++;
    return par;
  }
  _$jscoverage['/swf.js'].lineData[486]++;
  function _stringSWFDefault(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[13]++;
    _$jscoverage['/swf.js'].lineData[487]++;
    return _stringSWF(src, attrs, params, OLD_IE) + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[490]++;
  function _stringSWF(src, attrs, params, ie) {
    _$jscoverage['/swf.js'].functionData[14]++;
    _$jscoverage['/swf.js'].lineData[491]++;
    var res, attr = EMPTY, par = EMPTY;
    _$jscoverage['/swf.js'].lineData[496]++;
    S.each(attrs, function(v, k) {
  _$jscoverage['/swf.js'].functionData[15]++;
  _$jscoverage['/swf.js'].lineData[497]++;
  attr += stringAttr(k, v);
});
    _$jscoverage['/swf.js'].lineData[500]++;
    if (visit52_500_1(ie)) {
      _$jscoverage['/swf.js'].lineData[501]++;
      attr += stringAttr('classid', CID);
      _$jscoverage['/swf.js'].lineData[502]++;
      par += stringParam('movie', src);
    } else {
      _$jscoverage['/swf.js'].lineData[505]++;
      attr += stringAttr('data', src);
      _$jscoverage['/swf.js'].lineData[507]++;
      attr += stringAttr('type', TYPE);
    }
    _$jscoverage['/swf.js'].lineData[510]++;
    par += collectionParams(params);
    _$jscoverage['/swf.js'].lineData[512]++;
    res = LT + OBJECT_TAG + attr + GT + par;
    _$jscoverage['/swf.js'].lineData[514]++;
    return res;
  }
  _$jscoverage['/swf.js'].lineData[518]++;
  function _stringSWFFull(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[16]++;
    _$jscoverage['/swf.js'].lineData[519]++;
    var outside, inside;
    _$jscoverage['/swf.js'].lineData[520]++;
    if (visit53_520_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[521]++;
      outside = _stringSWF(src, attrs, params, 1);
      _$jscoverage['/swf.js'].lineData[522]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[523]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[524]++;
      inside = _stringSWF(src, attrs, params, 0);
    } else {
      _$jscoverage['/swf.js'].lineData[526]++;
      inside = _stringSWF(src, attrs, params, 0);
      _$jscoverage['/swf.js'].lineData[527]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[528]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[529]++;
      outside = _stringSWF(src, attrs, params, 1);
    }
    _$jscoverage['/swf.js'].lineData[531]++;
    return outside + inside + LT + '/' + OBJECT_TAG + GT + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[538]++;
  function toFlashVars(obj) {
    _$jscoverage['/swf.js'].functionData[17]++;
    _$jscoverage['/swf.js'].lineData[539]++;
    var arr = [], ret;
    _$jscoverage['/swf.js'].lineData[542]++;
    S.each(obj, function(data, prop) {
  _$jscoverage['/swf.js'].functionData[18]++;
  _$jscoverage['/swf.js'].lineData[543]++;
  if (visit54_543_1(typeof data != 'string')) {
    _$jscoverage['/swf.js'].lineData[544]++;
    data = Json.stringify(data);
  }
  _$jscoverage['/swf.js'].lineData[546]++;
  if (visit55_546_1(data)) {
    _$jscoverage['/swf.js'].lineData[547]++;
    arr.push(prop + '=' + encode(data));
  }
});
    _$jscoverage['/swf.js'].lineData[550]++;
    ret = arr.join('&');
    _$jscoverage['/swf.js'].lineData[551]++;
    return ret;
  }
  _$jscoverage['/swf.js'].lineData[554]++;
  function stringParam(key, value) {
    _$jscoverage['/swf.js'].functionData[19]++;
    _$jscoverage['/swf.js'].lineData[555]++;
    return '<param name="' + key + '" value="' + value + '"></param>';
  }
  _$jscoverage['/swf.js'].lineData[558]++;
  function stringAttr(key, value) {
    _$jscoverage['/swf.js'].functionData[20]++;
    _$jscoverage['/swf.js'].lineData[559]++;
    return SPACE + key + EQUAL + DOUBLE_QUOTE + value + DOUBLE_QUOTE;
  }
});
