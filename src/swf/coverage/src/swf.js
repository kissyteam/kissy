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
  _$jscoverage['/swf.js'].lineData[8] = 0;
  _$jscoverage['/swf.js'].lineData[50] = 0;
  _$jscoverage['/swf.js'].lineData[56] = 0;
  _$jscoverage['/swf.js'].lineData[58] = 0;
  _$jscoverage['/swf.js'].lineData[59] = 0;
  _$jscoverage['/swf.js'].lineData[73] = 0;
  _$jscoverage['/swf.js'].lineData[76] = 0;
  _$jscoverage['/swf.js'].lineData[77] = 0;
  _$jscoverage['/swf.js'].lineData[78] = 0;
  _$jscoverage['/swf.js'].lineData[82] = 0;
  _$jscoverage['/swf.js'].lineData[83] = 0;
  _$jscoverage['/swf.js'].lineData[86] = 0;
  _$jscoverage['/swf.js'].lineData[87] = 0;
  _$jscoverage['/swf.js'].lineData[90] = 0;
  _$jscoverage['/swf.js'].lineData[92] = 0;
  _$jscoverage['/swf.js'].lineData[95] = 0;
  _$jscoverage['/swf.js'].lineData[97] = 0;
  _$jscoverage['/swf.js'].lineData[100] = 0;
  _$jscoverage['/swf.js'].lineData[102] = 0;
  _$jscoverage['/swf.js'].lineData[110] = 0;
  _$jscoverage['/swf.js'].lineData[111] = 0;
  _$jscoverage['/swf.js'].lineData[113] = 0;
  _$jscoverage['/swf.js'].lineData[117] = 0;
  _$jscoverage['/swf.js'].lineData[119] = 0;
  _$jscoverage['/swf.js'].lineData[120] = 0;
  _$jscoverage['/swf.js'].lineData[122] = 0;
  _$jscoverage['/swf.js'].lineData[125] = 0;
  _$jscoverage['/swf.js'].lineData[126] = 0;
  _$jscoverage['/swf.js'].lineData[128] = 0;
  _$jscoverage['/swf.js'].lineData[131] = 0;
  _$jscoverage['/swf.js'].lineData[133] = 0;
  _$jscoverage['/swf.js'].lineData[135] = 0;
  _$jscoverage['/swf.js'].lineData[136] = 0;
  _$jscoverage['/swf.js'].lineData[137] = 0;
  _$jscoverage['/swf.js'].lineData[139] = 0;
  _$jscoverage['/swf.js'].lineData[145] = 0;
  _$jscoverage['/swf.js'].lineData[147] = 0;
  _$jscoverage['/swf.js'].lineData[148] = 0;
  _$jscoverage['/swf.js'].lineData[157] = 0;
  _$jscoverage['/swf.js'].lineData[160] = 0;
  _$jscoverage['/swf.js'].lineData[161] = 0;
  _$jscoverage['/swf.js'].lineData[162] = 0;
  _$jscoverage['/swf.js'].lineData[163] = 0;
  _$jscoverage['/swf.js'].lineData[167] = 0;
  _$jscoverage['/swf.js'].lineData[168] = 0;
  _$jscoverage['/swf.js'].lineData[169] = 0;
  _$jscoverage['/swf.js'].lineData[172] = 0;
  _$jscoverage['/swf.js'].lineData[174] = 0;
  _$jscoverage['/swf.js'].lineData[180] = 0;
  _$jscoverage['/swf.js'].lineData[181] = 0;
  _$jscoverage['/swf.js'].lineData[182] = 0;
  _$jscoverage['/swf.js'].lineData[186] = 0;
  _$jscoverage['/swf.js'].lineData[187] = 0;
  _$jscoverage['/swf.js'].lineData[189] = 0;
  _$jscoverage['/swf.js'].lineData[190] = 0;
  _$jscoverage['/swf.js'].lineData[191] = 0;
  _$jscoverage['/swf.js'].lineData[194] = 0;
  _$jscoverage['/swf.js'].lineData[198] = 0;
  _$jscoverage['/swf.js'].lineData[271] = 0;
  _$jscoverage['/swf.js'].lineData[272] = 0;
  _$jscoverage['/swf.js'].lineData[274] = 0;
  _$jscoverage['/swf.js'].lineData[277] = 0;
  _$jscoverage['/swf.js'].lineData[289] = 0;
  _$jscoverage['/swf.js'].lineData[290] = 0;
  _$jscoverage['/swf.js'].lineData[292] = 0;
  _$jscoverage['/swf.js'].lineData[372] = 0;
  _$jscoverage['/swf.js'].lineData[373] = 0;
  _$jscoverage['/swf.js'].lineData[376] = 0;
  _$jscoverage['/swf.js'].lineData[377] = 0;
  _$jscoverage['/swf.js'].lineData[378] = 0;
  _$jscoverage['/swf.js'].lineData[379] = 0;
  _$jscoverage['/swf.js'].lineData[380] = 0;
  _$jscoverage['/swf.js'].lineData[381] = 0;
  _$jscoverage['/swf.js'].lineData[383] = 0;
  _$jscoverage['/swf.js'].lineData[425] = 0;
  _$jscoverage['/swf.js'].lineData[426] = 0;
  _$jscoverage['/swf.js'].lineData[427] = 0;
  _$jscoverage['/swf.js'].lineData[428] = 0;
  _$jscoverage['/swf.js'].lineData[431] = 0;
  _$jscoverage['/swf.js'].lineData[434] = 0;
  _$jscoverage['/swf.js'].lineData[435] = 0;
  _$jscoverage['/swf.js'].lineData[439] = 0;
  _$jscoverage['/swf.js'].lineData[440] = 0;
  _$jscoverage['/swf.js'].lineData[441] = 0;
  _$jscoverage['/swf.js'].lineData[442] = 0;
  _$jscoverage['/swf.js'].lineData[444] = 0;
  _$jscoverage['/swf.js'].lineData[445] = 0;
  _$jscoverage['/swf.js'].lineData[446] = 0;
  _$jscoverage['/swf.js'].lineData[447] = 0;
  _$jscoverage['/swf.js'].lineData[448] = 0;
  _$jscoverage['/swf.js'].lineData[449] = 0;
  _$jscoverage['/swf.js'].lineData[450] = 0;
  _$jscoverage['/swf.js'].lineData[451] = 0;
  _$jscoverage['/swf.js'].lineData[452] = 0;
  _$jscoverage['/swf.js'].lineData[453] = 0;
  _$jscoverage['/swf.js'].lineData[457] = 0;
  _$jscoverage['/swf.js'].lineData[458] = 0;
  _$jscoverage['/swf.js'].lineData[460] = 0;
  _$jscoverage['/swf.js'].lineData[465] = 0;
  _$jscoverage['/swf.js'].lineData[466] = 0;
  _$jscoverage['/swf.js'].lineData[467] = 0;
  _$jscoverage['/swf.js'].lineData[468] = 0;
  _$jscoverage['/swf.js'].lineData[469] = 0;
  _$jscoverage['/swf.js'].lineData[470] = 0;
  _$jscoverage['/swf.js'].lineData[473] = 0;
  _$jscoverage['/swf.js'].lineData[474] = 0;
  _$jscoverage['/swf.js'].lineData[477] = 0;
  _$jscoverage['/swf.js'].lineData[481] = 0;
  _$jscoverage['/swf.js'].lineData[482] = 0;
  _$jscoverage['/swf.js'].lineData[485] = 0;
  _$jscoverage['/swf.js'].lineData[486] = 0;
  _$jscoverage['/swf.js'].lineData[490] = 0;
  _$jscoverage['/swf.js'].lineData[491] = 0;
  _$jscoverage['/swf.js'].lineData[495] = 0;
  _$jscoverage['/swf.js'].lineData[496] = 0;
  _$jscoverage['/swf.js'].lineData[499] = 0;
  _$jscoverage['/swf.js'].lineData[500] = 0;
  _$jscoverage['/swf.js'].lineData[501] = 0;
  _$jscoverage['/swf.js'].lineData[504] = 0;
  _$jscoverage['/swf.js'].lineData[506] = 0;
  _$jscoverage['/swf.js'].lineData[509] = 0;
  _$jscoverage['/swf.js'].lineData[511] = 0;
  _$jscoverage['/swf.js'].lineData[513] = 0;
  _$jscoverage['/swf.js'].lineData[517] = 0;
  _$jscoverage['/swf.js'].lineData[518] = 0;
  _$jscoverage['/swf.js'].lineData[519] = 0;
  _$jscoverage['/swf.js'].lineData[520] = 0;
  _$jscoverage['/swf.js'].lineData[521] = 0;
  _$jscoverage['/swf.js'].lineData[522] = 0;
  _$jscoverage['/swf.js'].lineData[523] = 0;
  _$jscoverage['/swf.js'].lineData[525] = 0;
  _$jscoverage['/swf.js'].lineData[526] = 0;
  _$jscoverage['/swf.js'].lineData[527] = 0;
  _$jscoverage['/swf.js'].lineData[528] = 0;
  _$jscoverage['/swf.js'].lineData[530] = 0;
  _$jscoverage['/swf.js'].lineData[537] = 0;
  _$jscoverage['/swf.js'].lineData[538] = 0;
  _$jscoverage['/swf.js'].lineData[541] = 0;
  _$jscoverage['/swf.js'].lineData[542] = 0;
  _$jscoverage['/swf.js'].lineData[543] = 0;
  _$jscoverage['/swf.js'].lineData[545] = 0;
  _$jscoverage['/swf.js'].lineData[546] = 0;
  _$jscoverage['/swf.js'].lineData[549] = 0;
  _$jscoverage['/swf.js'].lineData[550] = 0;
  _$jscoverage['/swf.js'].lineData[553] = 0;
  _$jscoverage['/swf.js'].lineData[554] = 0;
  _$jscoverage['/swf.js'].lineData[557] = 0;
  _$jscoverage['/swf.js'].lineData[558] = 0;
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
  _$jscoverage['/swf.js'].branchData['73'] = [];
  _$jscoverage['/swf.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['76'] = [];
  _$jscoverage['/swf.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['82'] = [];
  _$jscoverage['/swf.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['86'] = [];
  _$jscoverage['/swf.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['90'] = [];
  _$jscoverage['/swf.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['91'] = [];
  _$jscoverage['/swf.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['95'] = [];
  _$jscoverage['/swf.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['96'] = [];
  _$jscoverage['/swf.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['96'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['100'] = [];
  _$jscoverage['/swf.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['110'] = [];
  _$jscoverage['/swf.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['119'] = [];
  _$jscoverage['/swf.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['125'] = [];
  _$jscoverage['/swf.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['135'] = [];
  _$jscoverage['/swf.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['136'] = [];
  _$jscoverage['/swf.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['147'] = [];
  _$jscoverage['/swf.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['160'] = [];
  _$jscoverage['/swf.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['162'] = [];
  _$jscoverage['/swf.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['168'] = [];
  _$jscoverage['/swf.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['186'] = [];
  _$jscoverage['/swf.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['190'] = [];
  _$jscoverage['/swf.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['271'] = [];
  _$jscoverage['/swf.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['289'] = [];
  _$jscoverage['/swf.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['375'] = [];
  _$jscoverage['/swf.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['376'] = [];
  _$jscoverage['/swf.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['378'] = [];
  _$jscoverage['/swf.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['380'] = [];
  _$jscoverage['/swf.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['427'] = [];
  _$jscoverage['/swf.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['439'] = [];
  _$jscoverage['/swf.js'].branchData['439'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['441'] = [];
  _$jscoverage['/swf.js'].branchData['441'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['445'] = [];
  _$jscoverage['/swf.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['447'] = [];
  _$jscoverage['/swf.js'].branchData['447'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['448'] = [];
  _$jscoverage['/swf.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['448'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['450'] = [];
  _$jscoverage['/swf.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['452'] = [];
  _$jscoverage['/swf.js'].branchData['452'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['457'] = [];
  _$jscoverage['/swf.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['469'] = [];
  _$jscoverage['/swf.js'].branchData['469'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['473'] = [];
  _$jscoverage['/swf.js'].branchData['473'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['490'] = [];
  _$jscoverage['/swf.js'].branchData['490'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['499'] = [];
  _$jscoverage['/swf.js'].branchData['499'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['519'] = [];
  _$jscoverage['/swf.js'].branchData['519'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['542'] = [];
  _$jscoverage['/swf.js'].branchData['542'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['545'] = [];
  _$jscoverage['/swf.js'].branchData['545'][1] = new BranchData();
}
_$jscoverage['/swf.js'].branchData['545'][1].init(123, 4, 'data');
function visit56_545_1(result) {
  _$jscoverage['/swf.js'].branchData['545'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['542'][1].init(18, 23, 'typeof data != \'string\'');
function visit55_542_1(result) {
  _$jscoverage['/swf.js'].branchData['542'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['519'][1].init(44, 5, 'UA.ie');
function visit54_519_1(result) {
  _$jscoverage['/swf.js'].branchData['519'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['499'][1].init(269, 2, 'ie');
function visit53_499_1(result) {
  _$jscoverage['/swf.js'].branchData['499'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['490'][1].init(87, 15, 'ie == undefined');
function visit52_490_1(result) {
  _$jscoverage['/swf.js'].branchData['490'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['473'][1].init(169, 14, 'k == FLASHVARS');
function visit51_473_1(result) {
  _$jscoverage['/swf.js'].branchData['473'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['469'][1].init(52, 11, 'k in PARAMS');
function visit50_469_1(result) {
  _$jscoverage['/swf.js'].branchData['469'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['457'][1].init(891, 19, 'nodeName == "embed"');
function visit49_457_1(result) {
  _$jscoverage['/swf.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['452'][1].init(280, 35, 'Dom.nodeName(params[i]) == "object"');
function visit48_452_1(result) {
  _$jscoverage['/swf.js'].branchData['452'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['450'][1].init(166, 30, 'Dom.nodeName(param) == "embed"');
function visit47_450_1(result) {
  _$jscoverage['/swf.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['448'][2].init(27, 29, 'Dom.attr(param, "name") || ""');
function visit46_448_2(result) {
  _$jscoverage['/swf.js'].branchData['448'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['448'][1].init(27, 55, '(Dom.attr(param, "name") || "").toLowerCase() == "movie"');
function visit45_448_1(result) {
  _$jscoverage['/swf.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['447'][1].init(58, 19, 'param.nodeType == 1');
function visit44_447_1(result) {
  _$jscoverage['/swf.js'].branchData['447'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['445'][1].init(182, 17, 'i < params.length');
function visit43_445_1(result) {
  _$jscoverage['/swf.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['441'][1].init(60, 3, 'url');
function visit42_441_1(result) {
  _$jscoverage['/swf.js'].branchData['441'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['439'][1].init(139, 20, 'nodeName == "object"');
function visit41_439_1(result) {
  _$jscoverage['/swf.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['427'][1].init(18, 27, 'typeof obj[i] == "function"');
function visit40_427_1(result) {
  _$jscoverage['/swf.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['380'][1].init(399, 19, 'nodeName == \'param\'');
function visit39_380_1(result) {
  _$jscoverage['/swf.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['378'][1].init(296, 20, 'nodeName == \'object\'');
function visit38_378_1(result) {
  _$jscoverage['/swf.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['376'][1].init(195, 19, 'nodeName == \'embed\'');
function visit37_376_1(result) {
  _$jscoverage['/swf.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['375'][1].init(90, 38, 'srcElement && Dom.nodeName(srcElement)');
function visit36_375_1(result) {
  _$jscoverage['/swf.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['289'][1].init(26, 20, 'typeof v == \'string\'');
function visit35_289_1(result) {
  _$jscoverage['/swf.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['271'][1].init(26, 20, 'typeof v == \'string\'');
function visit34_271_1(result) {
  _$jscoverage['/swf.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['190'][1].init(26, 25, 'swfObject.readyState == 4');
function visit33_190_1(result) {
  _$jscoverage['/swf.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['186'][1].init(280, 5, 'UA.ie');
function visit32_186_1(result) {
  _$jscoverage['/swf.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['168'][1].init(157, 17, 'args.length !== 0');
function visit31_168_1(result) {
  _$jscoverage['/swf.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['162'][1].init(22, 9, 'swf[func]');
function visit30_162_1(result) {
  _$jscoverage['/swf.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['160'][1].init(107, 10, 'args || []');
function visit29_160_1(result) {
  _$jscoverage['/swf.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['147'][1].init(3215, 19, '!self.get(\'status\')');
function visit28_147_1(result) {
  _$jscoverage['/swf.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['136'][1].init(22, 5, 'UA.ie');
function visit27_136_1(result) {
  _$jscoverage['/swf.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['135'][1].init(2836, 18, 'htmlMode == \'full\'');
function visit26_135_1(result) {
  _$jscoverage['/swf.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['125'][1].init(2530, 26, '\'outerHTML\' in placeHolder');
function visit25_125_1(result) {
  _$jscoverage['/swf.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['119'][1].init(2342, 8, 'elBefore');
function visit24_119_1(result) {
  _$jscoverage['/swf.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['110'][1].init(2032, 18, 'htmlMode == \'full\'');
function visit23_110_1(result) {
  _$jscoverage['/swf.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['100'][1].init(566, 22, 'params.flashVars || {}');
function visit22_100_1(result) {
  _$jscoverage['/swf.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['96'][2].init(77, 32, 'parseInt(attrs.height, 10) < 137');
function visit21_96_2(result) {
  _$jscoverage['/swf.js'].branchData['96'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['96'][1].init(49, 60, '!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137');
function visit20_96_1(result) {
  _$jscoverage['/swf.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['95'][1].init(327, 111, '!(\'height\' in attrs) || (!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137)');
function visit19_95_1(result) {
  _$jscoverage['/swf.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['91'][2].init(75, 31, 'parseInt(attrs.width, 10) < 310');
function visit18_91_2(result) {
  _$jscoverage['/swf.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['91'][1].init(48, 58, '!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310');
function visit17_91_1(result) {
  _$jscoverage['/swf.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['90'][1].init(119, 108, '!(\'width\' in attrs) || (!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310)');
function visit16_90_1(result) {
  _$jscoverage['/swf.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['86'][1].init(134, 14, 'expressInstall');
function visit15_86_1(result) {
  _$jscoverage['/swf.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['82'][1].init(872, 27, 'version && !fpvGTE(version)');
function visit14_82_1(result) {
  _$jscoverage['/swf.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['76'][1].init(701, 6, '!fpv()');
function visit13_76_1(result) {
  _$jscoverage['/swf.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['73'][1].init(619, 29, 'attrs.id || S.guid(\'ks-swf-\')');
function visit12_73_1(result) {
  _$jscoverage['/swf.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].lineData[6]++;
KISSY.add('swf', function(S, Dom, Json, Base, FlashUA, undefined) {
  _$jscoverage['/swf.js'].functionData[0]++;
  _$jscoverage['/swf.js'].lineData[8]++;
  var UA = S.UA, TYPE = 'application/x-shockwave-flash', CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000', FLASHVARS = 'flashvars', EMPTY = '', SPACE = ' ', EQUAL = '=', DOUBLE_QUOTE = '"', LT = '<', GT = '>', doc = S.Env.host.document, fpv = FlashUA.fpv, fpvGEQ = FlashUA.fpvGEQ, fpvGTE = FlashUA.fpvGTE, OBJECT_TAG = 'object', encode = encodeURIComponent, PARAMS = {
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
  _$jscoverage['/swf.js'].lineData[50]++;
  var SWF;
  _$jscoverage['/swf.js'].lineData[56]++;
  return SWF = Base.extend({
  initializer: function() {
  _$jscoverage['/swf.js'].functionData[1]++;
  _$jscoverage['/swf.js'].lineData[58]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[59]++;
  var expressInstall = self.get('expressInstall'), swf, html, id, htmlMode = self.get('htmlMode'), flashVars, params = self.get('params'), attrs = self.get('attrs'), doc = self.get('document'), placeHolder = Dom.create('<span>', undefined, doc), elBefore = self.get('elBefore'), installedSrc = self.get('src'), version = self.get('version');
  _$jscoverage['/swf.js'].lineData[73]++;
  id = attrs.id = visit12_73_1(attrs.id || S.guid('ks-swf-'));
  _$jscoverage['/swf.js'].lineData[76]++;
  if (visit13_76_1(!fpv())) {
    _$jscoverage['/swf.js'].lineData[77]++;
    self.set('status', SWF.Status.NOT_INSTALLED);
    _$jscoverage['/swf.js'].lineData[78]++;
    return;
  }
  _$jscoverage['/swf.js'].lineData[82]++;
  if (visit14_82_1(version && !fpvGTE(version))) {
    _$jscoverage['/swf.js'].lineData[83]++;
    self.set('status', SWF.Status.TOO_LOW);
    _$jscoverage['/swf.js'].lineData[86]++;
    if (visit15_86_1(expressInstall)) {
      _$jscoverage['/swf.js'].lineData[87]++;
      installedSrc = expressInstall;
      _$jscoverage['/swf.js'].lineData[90]++;
      if (visit16_90_1(!('width' in attrs) || (visit17_91_1(!/%$/.test(attrs.width) && visit18_91_2(parseInt(attrs.width, 10) < 310))))) {
        _$jscoverage['/swf.js'].lineData[92]++;
        attrs.width = "310";
      }
      _$jscoverage['/swf.js'].lineData[95]++;
      if (visit19_95_1(!('height' in attrs) || (visit20_96_1(!/%$/.test(attrs.height) && visit21_96_2(parseInt(attrs.height, 10) < 137))))) {
        _$jscoverage['/swf.js'].lineData[97]++;
        attrs.height = "137";
      }
      _$jscoverage['/swf.js'].lineData[100]++;
      flashVars = params.flashVars = visit22_100_1(params.flashVars || {});
      _$jscoverage['/swf.js'].lineData[102]++;
      S.mix(flashVars, {
  MMredirectURL: location.href, 
  MMplayerType: UA.ie ? "ActiveX" : "PlugIn", 
  MMdoctitle: doc.title.slice(0, 47) + " - Flash Player Installation"});
    }
  }
  _$jscoverage['/swf.js'].lineData[110]++;
  if (visit23_110_1(htmlMode == 'full')) {
    _$jscoverage['/swf.js'].lineData[111]++;
    html = _stringSWFFull(installedSrc, attrs, params);
  } else {
    _$jscoverage['/swf.js'].lineData[113]++;
    html = _stringSWFDefault(installedSrc, attrs, params);
  }
  _$jscoverage['/swf.js'].lineData[117]++;
  self.set('html', html);
  _$jscoverage['/swf.js'].lineData[119]++;
  if (visit24_119_1(elBefore)) {
    _$jscoverage['/swf.js'].lineData[120]++;
    Dom.insertBefore(placeHolder, elBefore);
  } else {
    _$jscoverage['/swf.js'].lineData[122]++;
    Dom.append(placeHolder, self.get('render'));
  }
  _$jscoverage['/swf.js'].lineData[125]++;
  if (visit25_125_1('outerHTML' in placeHolder)) {
    _$jscoverage['/swf.js'].lineData[126]++;
    placeHolder.outerHTML = html;
  } else {
    _$jscoverage['/swf.js'].lineData[128]++;
    placeHolder.parentNode.replaceChild(Dom.create(html), placeHolder);
  }
  _$jscoverage['/swf.js'].lineData[131]++;
  swf = Dom.get('#' + id, doc);
  _$jscoverage['/swf.js'].lineData[133]++;
  self.set('swfObject', swf);
  _$jscoverage['/swf.js'].lineData[135]++;
  if (visit26_135_1(htmlMode == 'full')) {
    _$jscoverage['/swf.js'].lineData[136]++;
    if (visit27_136_1(UA.ie)) {
      _$jscoverage['/swf.js'].lineData[137]++;
      self.set('swfObject', swf);
    } else {
      _$jscoverage['/swf.js'].lineData[139]++;
      self.set('swfObject', swf.parentNode);
    }
  }
  _$jscoverage['/swf.js'].lineData[145]++;
  self.set('el', swf);
  _$jscoverage['/swf.js'].lineData[147]++;
  if (visit28_147_1(!self.get('status'))) {
    _$jscoverage['/swf.js'].lineData[148]++;
    self.set('status', SWF.Status.SUCCESS);
  }
}, 
  'callSWF': function(func, args) {
  _$jscoverage['/swf.js'].functionData[2]++;
  _$jscoverage['/swf.js'].lineData[157]++;
  var swf = this.get('el'), ret, params;
  _$jscoverage['/swf.js'].lineData[160]++;
  args = visit29_160_1(args || []);
  _$jscoverage['/swf.js'].lineData[161]++;
  try {
    _$jscoverage['/swf.js'].lineData[162]++;
    if (visit30_162_1(swf[func])) {
      _$jscoverage['/swf.js'].lineData[163]++;
      ret = swf[func].apply(swf, args);
    }
  }  catch (e) {
  _$jscoverage['/swf.js'].lineData[167]++;
  params = "";
  _$jscoverage['/swf.js'].lineData[168]++;
  if (visit31_168_1(args.length !== 0)) {
    _$jscoverage['/swf.js'].lineData[169]++;
    params = "'" + args.join("', '") + "'";
  }
  _$jscoverage['/swf.js'].lineData[172]++;
  ret = (new Function('swf', 'return swf.' + func + '(' + params + ');'))(swf);
}
  _$jscoverage['/swf.js'].lineData[174]++;
  return ret;
}, 
  destroy: function() {
  _$jscoverage['/swf.js'].functionData[3]++;
  _$jscoverage['/swf.js'].lineData[180]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[181]++;
  self.detach();
  _$jscoverage['/swf.js'].lineData[182]++;
  var swfObject = self.get('swfObject');
  _$jscoverage['/swf.js'].lineData[186]++;
  if (visit32_186_1(UA.ie)) {
    _$jscoverage['/swf.js'].lineData[187]++;
    swfObject.style.display = 'none';
    _$jscoverage['/swf.js'].lineData[189]++;
    (function() {
  _$jscoverage['/swf.js'].functionData[4]++;
  _$jscoverage['/swf.js'].lineData[190]++;
  if (visit33_190_1(swfObject.readyState == 4)) {
    _$jscoverage['/swf.js'].lineData[191]++;
    removeObjectInIE(swfObject);
  } else {
    _$jscoverage['/swf.js'].lineData[194]++;
    setTimeout(arguments.callee, 10);
  }
})();
  } else {
    _$jscoverage['/swf.js'].lineData[198]++;
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
  _$jscoverage['/swf.js'].lineData[271]++;
  if (visit34_271_1(typeof v == 'string')) {
    _$jscoverage['/swf.js'].lineData[272]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[274]++;
  return v;
}, 
  valueFn: function() {
  _$jscoverage['/swf.js'].functionData[6]++;
  _$jscoverage['/swf.js'].lineData[277]++;
  return document.body;
}}, 
  elBefore: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[7]++;
  _$jscoverage['/swf.js'].lineData[289]++;
  if (visit35_289_1(typeof v == 'string')) {
    _$jscoverage['/swf.js'].lineData[290]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[292]++;
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
  _$jscoverage['/swf.js'].lineData[372]++;
  swf = Dom.get(swf);
  _$jscoverage['/swf.js'].lineData[373]++;
  var srcElement = getSrcElements(swf)[0], src, nodeName = visit36_375_1(srcElement && Dom.nodeName(srcElement));
  _$jscoverage['/swf.js'].lineData[376]++;
  if (visit37_376_1(nodeName == 'embed')) {
    _$jscoverage['/swf.js'].lineData[377]++;
    return Dom.attr(srcElement, 'src');
  } else {
    _$jscoverage['/swf.js'].lineData[378]++;
    if (visit38_378_1(nodeName == 'object')) {
      _$jscoverage['/swf.js'].lineData[379]++;
      return Dom.attr(srcElement, 'data');
    } else {
      _$jscoverage['/swf.js'].lineData[380]++;
      if (visit39_380_1(nodeName == 'param')) {
        _$jscoverage['/swf.js'].lineData[381]++;
        return Dom.attr(srcElement, 'value');
      }
    }
  }
  _$jscoverage['/swf.js'].lineData[383]++;
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
  _$jscoverage['/swf.js'].lineData[425]++;
  function removeObjectInIE(obj) {
    _$jscoverage['/swf.js'].functionData[9]++;
    _$jscoverage['/swf.js'].lineData[426]++;
    for (var i in obj) {
      _$jscoverage['/swf.js'].lineData[427]++;
      if (visit40_427_1(typeof obj[i] == "function")) {
        _$jscoverage['/swf.js'].lineData[428]++;
        obj[i] = null;
      }
    }
    _$jscoverage['/swf.js'].lineData[431]++;
    obj.parentNode.removeChild(obj);
  }
  _$jscoverage['/swf.js'].lineData[434]++;
  function getSrcElements(swf) {
    _$jscoverage['/swf.js'].functionData[10]++;
    _$jscoverage['/swf.js'].lineData[435]++;
    var url = "", params, i, param, elements = [], nodeName = Dom.nodeName(swf);
    _$jscoverage['/swf.js'].lineData[439]++;
    if (visit41_439_1(nodeName == "object")) {
      _$jscoverage['/swf.js'].lineData[440]++;
      url = Dom.attr(swf, "data");
      _$jscoverage['/swf.js'].lineData[441]++;
      if (visit42_441_1(url)) {
        _$jscoverage['/swf.js'].lineData[442]++;
        elements.push(swf);
      }
      _$jscoverage['/swf.js'].lineData[444]++;
      params = swf.childNodes;
      _$jscoverage['/swf.js'].lineData[445]++;
      for (i = 0; visit43_445_1(i < params.length); i++) {
        _$jscoverage['/swf.js'].lineData[446]++;
        param = params[i];
        _$jscoverage['/swf.js'].lineData[447]++;
        if (visit44_447_1(param.nodeType == 1)) {
          _$jscoverage['/swf.js'].lineData[448]++;
          if (visit45_448_1((visit46_448_2(Dom.attr(param, "name") || "")).toLowerCase() == "movie")) {
            _$jscoverage['/swf.js'].lineData[449]++;
            elements.push(param);
          } else {
            _$jscoverage['/swf.js'].lineData[450]++;
            if (visit47_450_1(Dom.nodeName(param) == "embed")) {
              _$jscoverage['/swf.js'].lineData[451]++;
              elements.push(param);
            } else {
              _$jscoverage['/swf.js'].lineData[452]++;
              if (visit48_452_1(Dom.nodeName(params[i]) == "object")) {
                _$jscoverage['/swf.js'].lineData[453]++;
                elements.push(param);
              }
            }
          }
        }
      }
    } else {
      _$jscoverage['/swf.js'].lineData[457]++;
      if (visit49_457_1(nodeName == "embed")) {
        _$jscoverage['/swf.js'].lineData[458]++;
        elements.push(swf);
      }
    }
    _$jscoverage['/swf.js'].lineData[460]++;
    return elements;
  }
  _$jscoverage['/swf.js'].lineData[465]++;
  function collectionParams(params) {
    _$jscoverage['/swf.js'].functionData[11]++;
    _$jscoverage['/swf.js'].lineData[466]++;
    var par = EMPTY;
    _$jscoverage['/swf.js'].lineData[467]++;
    S.each(params, function(v, k) {
  _$jscoverage['/swf.js'].functionData[12]++;
  _$jscoverage['/swf.js'].lineData[468]++;
  k = k.toLowerCase();
  _$jscoverage['/swf.js'].lineData[469]++;
  if (visit50_469_1(k in PARAMS)) {
    _$jscoverage['/swf.js'].lineData[470]++;
    par += stringParam(k, v);
  } else {
    _$jscoverage['/swf.js'].lineData[473]++;
    if (visit51_473_1(k == FLASHVARS)) {
      _$jscoverage['/swf.js'].lineData[474]++;
      par += stringParam(k, toFlashVars(v));
    }
  }
});
    _$jscoverage['/swf.js'].lineData[477]++;
    return par;
  }
  _$jscoverage['/swf.js'].lineData[481]++;
  function _stringSWFDefault(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[13]++;
    _$jscoverage['/swf.js'].lineData[482]++;
    return _stringSWF(src, attrs, params, UA.ie) + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[485]++;
  function _stringSWF(src, attrs, params, ie) {
    _$jscoverage['/swf.js'].functionData[14]++;
    _$jscoverage['/swf.js'].lineData[486]++;
    var res, attr = EMPTY, par = EMPTY;
    _$jscoverage['/swf.js'].lineData[490]++;
    if (visit52_490_1(ie == undefined)) {
      _$jscoverage['/swf.js'].lineData[491]++;
      ie = UA.ie;
    }
    _$jscoverage['/swf.js'].lineData[495]++;
    S.each(attrs, function(v, k) {
  _$jscoverage['/swf.js'].functionData[15]++;
  _$jscoverage['/swf.js'].lineData[496]++;
  attr += stringAttr(k, v);
});
    _$jscoverage['/swf.js'].lineData[499]++;
    if (visit53_499_1(ie)) {
      _$jscoverage['/swf.js'].lineData[500]++;
      attr += stringAttr('classid', CID);
      _$jscoverage['/swf.js'].lineData[501]++;
      par += stringParam('movie', src);
    } else {
      _$jscoverage['/swf.js'].lineData[504]++;
      attr += stringAttr('data', src);
      _$jscoverage['/swf.js'].lineData[506]++;
      attr += stringAttr('type', TYPE);
    }
    _$jscoverage['/swf.js'].lineData[509]++;
    par += collectionParams(params);
    _$jscoverage['/swf.js'].lineData[511]++;
    res = LT + OBJECT_TAG + attr + GT + par;
    _$jscoverage['/swf.js'].lineData[513]++;
    return res;
  }
  _$jscoverage['/swf.js'].lineData[517]++;
  function _stringSWFFull(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[16]++;
    _$jscoverage['/swf.js'].lineData[518]++;
    var outside, inside;
    _$jscoverage['/swf.js'].lineData[519]++;
    if (visit54_519_1(UA.ie)) {
      _$jscoverage['/swf.js'].lineData[520]++;
      outside = _stringSWF(src, attrs, params, 1);
      _$jscoverage['/swf.js'].lineData[521]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[522]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[523]++;
      inside = _stringSWF(src, attrs, params, 0);
    } else {
      _$jscoverage['/swf.js'].lineData[525]++;
      inside = _stringSWF(src, attrs, params, 0);
      _$jscoverage['/swf.js'].lineData[526]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[527]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[528]++;
      outside = _stringSWF(src, attrs, params, 1);
    }
    _$jscoverage['/swf.js'].lineData[530]++;
    return outside + inside + LT + '/' + OBJECT_TAG + GT + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[537]++;
  function toFlashVars(obj) {
    _$jscoverage['/swf.js'].functionData[17]++;
    _$jscoverage['/swf.js'].lineData[538]++;
    var arr = [], ret;
    _$jscoverage['/swf.js'].lineData[541]++;
    S.each(obj, function(data, prop) {
  _$jscoverage['/swf.js'].functionData[18]++;
  _$jscoverage['/swf.js'].lineData[542]++;
  if (visit55_542_1(typeof data != 'string')) {
    _$jscoverage['/swf.js'].lineData[543]++;
    data = Json.stringify(data);
  }
  _$jscoverage['/swf.js'].lineData[545]++;
  if (visit56_545_1(data)) {
    _$jscoverage['/swf.js'].lineData[546]++;
    arr.push(prop + '=' + encode(data));
  }
});
    _$jscoverage['/swf.js'].lineData[549]++;
    ret = arr.join('&');
    _$jscoverage['/swf.js'].lineData[550]++;
    return ret;
  }
  _$jscoverage['/swf.js'].lineData[553]++;
  function stringParam(key, value) {
    _$jscoverage['/swf.js'].functionData[19]++;
    _$jscoverage['/swf.js'].lineData[554]++;
    return '<param name="' + key + '" value="' + value + '"></param>';
  }
  _$jscoverage['/swf.js'].lineData[557]++;
  function stringAttr(key, value) {
    _$jscoverage['/swf.js'].functionData[20]++;
    _$jscoverage['/swf.js'].lineData[558]++;
    return SPACE + key + EQUAL + DOUBLE_QUOTE + value + DOUBLE_QUOTE;
  }
}, {
  requires: ['dom', 'json', 'base', 'swf/ua']});
