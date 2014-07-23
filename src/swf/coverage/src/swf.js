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
  _$jscoverage['/swf.js'].lineData[51] = 0;
  _$jscoverage['/swf.js'].lineData[57] = 0;
  _$jscoverage['/swf.js'].lineData[59] = 0;
  _$jscoverage['/swf.js'].lineData[60] = 0;
  _$jscoverage['/swf.js'].lineData[61] = 0;
  _$jscoverage['/swf.js'].lineData[75] = 0;
  _$jscoverage['/swf.js'].lineData[78] = 0;
  _$jscoverage['/swf.js'].lineData[79] = 0;
  _$jscoverage['/swf.js'].lineData[80] = 0;
  _$jscoverage['/swf.js'].lineData[84] = 0;
  _$jscoverage['/swf.js'].lineData[85] = 0;
  _$jscoverage['/swf.js'].lineData[88] = 0;
  _$jscoverage['/swf.js'].lineData[89] = 0;
  _$jscoverage['/swf.js'].lineData[92] = 0;
  _$jscoverage['/swf.js'].lineData[94] = 0;
  _$jscoverage['/swf.js'].lineData[97] = 0;
  _$jscoverage['/swf.js'].lineData[99] = 0;
  _$jscoverage['/swf.js'].lineData[102] = 0;
  _$jscoverage['/swf.js'].lineData[104] = 0;
  _$jscoverage['/swf.js'].lineData[112] = 0;
  _$jscoverage['/swf.js'].lineData[113] = 0;
  _$jscoverage['/swf.js'].lineData[115] = 0;
  _$jscoverage['/swf.js'].lineData[119] = 0;
  _$jscoverage['/swf.js'].lineData[121] = 0;
  _$jscoverage['/swf.js'].lineData[122] = 0;
  _$jscoverage['/swf.js'].lineData[124] = 0;
  _$jscoverage['/swf.js'].lineData[127] = 0;
  _$jscoverage['/swf.js'].lineData[128] = 0;
  _$jscoverage['/swf.js'].lineData[130] = 0;
  _$jscoverage['/swf.js'].lineData[133] = 0;
  _$jscoverage['/swf.js'].lineData[135] = 0;
  _$jscoverage['/swf.js'].lineData[136] = 0;
  _$jscoverage['/swf.js'].lineData[137] = 0;
  _$jscoverage['/swf.js'].lineData[139] = 0;
  _$jscoverage['/swf.js'].lineData[142] = 0;
  _$jscoverage['/swf.js'].lineData[147] = 0;
  _$jscoverage['/swf.js'].lineData[149] = 0;
  _$jscoverage['/swf.js'].lineData[150] = 0;
  _$jscoverage['/swf.js'].lineData[159] = 0;
  _$jscoverage['/swf.js'].lineData[162] = 0;
  _$jscoverage['/swf.js'].lineData[163] = 0;
  _$jscoverage['/swf.js'].lineData[164] = 0;
  _$jscoverage['/swf.js'].lineData[165] = 0;
  _$jscoverage['/swf.js'].lineData[169] = 0;
  _$jscoverage['/swf.js'].lineData[170] = 0;
  _$jscoverage['/swf.js'].lineData[171] = 0;
  _$jscoverage['/swf.js'].lineData[175] = 0;
  _$jscoverage['/swf.js'].lineData[177] = 0;
  _$jscoverage['/swf.js'].lineData[183] = 0;
  _$jscoverage['/swf.js'].lineData[184] = 0;
  _$jscoverage['/swf.js'].lineData[188] = 0;
  _$jscoverage['/swf.js'].lineData[189] = 0;
  _$jscoverage['/swf.js'].lineData[191] = 0;
  _$jscoverage['/swf.js'].lineData[192] = 0;
  _$jscoverage['/swf.js'].lineData[193] = 0;
  _$jscoverage['/swf.js'].lineData[196] = 0;
  _$jscoverage['/swf.js'].lineData[200] = 0;
  _$jscoverage['/swf.js'].lineData[273] = 0;
  _$jscoverage['/swf.js'].lineData[274] = 0;
  _$jscoverage['/swf.js'].lineData[276] = 0;
  _$jscoverage['/swf.js'].lineData[279] = 0;
  _$jscoverage['/swf.js'].lineData[291] = 0;
  _$jscoverage['/swf.js'].lineData[292] = 0;
  _$jscoverage['/swf.js'].lineData[294] = 0;
  _$jscoverage['/swf.js'].lineData[374] = 0;
  _$jscoverage['/swf.js'].lineData[375] = 0;
  _$jscoverage['/swf.js'].lineData[377] = 0;
  _$jscoverage['/swf.js'].lineData[378] = 0;
  _$jscoverage['/swf.js'].lineData[379] = 0;
  _$jscoverage['/swf.js'].lineData[380] = 0;
  _$jscoverage['/swf.js'].lineData[381] = 0;
  _$jscoverage['/swf.js'].lineData[382] = 0;
  _$jscoverage['/swf.js'].lineData[384] = 0;
  _$jscoverage['/swf.js'].lineData[428] = 0;
  _$jscoverage['/swf.js'].lineData[429] = 0;
  _$jscoverage['/swf.js'].lineData[430] = 0;
  _$jscoverage['/swf.js'].lineData[431] = 0;
  _$jscoverage['/swf.js'].lineData[434] = 0;
  _$jscoverage['/swf.js'].lineData[437] = 0;
  _$jscoverage['/swf.js'].lineData[438] = 0;
  _$jscoverage['/swf.js'].lineData[442] = 0;
  _$jscoverage['/swf.js'].lineData[443] = 0;
  _$jscoverage['/swf.js'].lineData[444] = 0;
  _$jscoverage['/swf.js'].lineData[445] = 0;
  _$jscoverage['/swf.js'].lineData[447] = 0;
  _$jscoverage['/swf.js'].lineData[448] = 0;
  _$jscoverage['/swf.js'].lineData[449] = 0;
  _$jscoverage['/swf.js'].lineData[450] = 0;
  _$jscoverage['/swf.js'].lineData[451] = 0;
  _$jscoverage['/swf.js'].lineData[452] = 0;
  _$jscoverage['/swf.js'].lineData[453] = 0;
  _$jscoverage['/swf.js'].lineData[454] = 0;
  _$jscoverage['/swf.js'].lineData[455] = 0;
  _$jscoverage['/swf.js'].lineData[456] = 0;
  _$jscoverage['/swf.js'].lineData[460] = 0;
  _$jscoverage['/swf.js'].lineData[461] = 0;
  _$jscoverage['/swf.js'].lineData[463] = 0;
  _$jscoverage['/swf.js'].lineData[467] = 0;
  _$jscoverage['/swf.js'].lineData[468] = 0;
  _$jscoverage['/swf.js'].lineData[469] = 0;
  _$jscoverage['/swf.js'].lineData[470] = 0;
  _$jscoverage['/swf.js'].lineData[471] = 0;
  _$jscoverage['/swf.js'].lineData[472] = 0;
  _$jscoverage['/swf.js'].lineData[475] = 0;
  _$jscoverage['/swf.js'].lineData[476] = 0;
  _$jscoverage['/swf.js'].lineData[479] = 0;
  _$jscoverage['/swf.js'].lineData[482] = 0;
  _$jscoverage['/swf.js'].lineData[483] = 0;
  _$jscoverage['/swf.js'].lineData[486] = 0;
  _$jscoverage['/swf.js'].lineData[487] = 0;
  _$jscoverage['/swf.js'].lineData[492] = 0;
  _$jscoverage['/swf.js'].lineData[493] = 0;
  _$jscoverage['/swf.js'].lineData[496] = 0;
  _$jscoverage['/swf.js'].lineData[497] = 0;
  _$jscoverage['/swf.js'].lineData[498] = 0;
  _$jscoverage['/swf.js'].lineData[501] = 0;
  _$jscoverage['/swf.js'].lineData[503] = 0;
  _$jscoverage['/swf.js'].lineData[506] = 0;
  _$jscoverage['/swf.js'].lineData[508] = 0;
  _$jscoverage['/swf.js'].lineData[510] = 0;
  _$jscoverage['/swf.js'].lineData[514] = 0;
  _$jscoverage['/swf.js'].lineData[515] = 0;
  _$jscoverage['/swf.js'].lineData[516] = 0;
  _$jscoverage['/swf.js'].lineData[517] = 0;
  _$jscoverage['/swf.js'].lineData[518] = 0;
  _$jscoverage['/swf.js'].lineData[519] = 0;
  _$jscoverage['/swf.js'].lineData[520] = 0;
  _$jscoverage['/swf.js'].lineData[522] = 0;
  _$jscoverage['/swf.js'].lineData[523] = 0;
  _$jscoverage['/swf.js'].lineData[524] = 0;
  _$jscoverage['/swf.js'].lineData[525] = 0;
  _$jscoverage['/swf.js'].lineData[527] = 0;
  _$jscoverage['/swf.js'].lineData[534] = 0;
  _$jscoverage['/swf.js'].lineData[535] = 0;
  _$jscoverage['/swf.js'].lineData[537] = 0;
  _$jscoverage['/swf.js'].lineData[538] = 0;
  _$jscoverage['/swf.js'].lineData[539] = 0;
  _$jscoverage['/swf.js'].lineData[541] = 0;
  _$jscoverage['/swf.js'].lineData[542] = 0;
  _$jscoverage['/swf.js'].lineData[545] = 0;
  _$jscoverage['/swf.js'].lineData[546] = 0;
  _$jscoverage['/swf.js'].lineData[549] = 0;
  _$jscoverage['/swf.js'].lineData[550] = 0;
  _$jscoverage['/swf.js'].lineData[553] = 0;
  _$jscoverage['/swf.js'].lineData[554] = 0;
  _$jscoverage['/swf.js'].lineData[557] = 0;
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
  _$jscoverage['/swf.js'].branchData['75'] = [];
  _$jscoverage['/swf.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['78'] = [];
  _$jscoverage['/swf.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['84'] = [];
  _$jscoverage['/swf.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['88'] = [];
  _$jscoverage['/swf.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['92'] = [];
  _$jscoverage['/swf.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['93'] = [];
  _$jscoverage['/swf.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['93'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['97'] = [];
  _$jscoverage['/swf.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['98'] = [];
  _$jscoverage['/swf.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['102'] = [];
  _$jscoverage['/swf.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['112'] = [];
  _$jscoverage['/swf.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['121'] = [];
  _$jscoverage['/swf.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['127'] = [];
  _$jscoverage['/swf.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['135'] = [];
  _$jscoverage['/swf.js'].branchData['135'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['136'] = [];
  _$jscoverage['/swf.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['149'] = [];
  _$jscoverage['/swf.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['162'] = [];
  _$jscoverage['/swf.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['164'] = [];
  _$jscoverage['/swf.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['170'] = [];
  _$jscoverage['/swf.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['188'] = [];
  _$jscoverage['/swf.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['192'] = [];
  _$jscoverage['/swf.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['273'] = [];
  _$jscoverage['/swf.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['291'] = [];
  _$jscoverage['/swf.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['376'] = [];
  _$jscoverage['/swf.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['377'] = [];
  _$jscoverage['/swf.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['379'] = [];
  _$jscoverage['/swf.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['381'] = [];
  _$jscoverage['/swf.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['430'] = [];
  _$jscoverage['/swf.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['442'] = [];
  _$jscoverage['/swf.js'].branchData['442'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['444'] = [];
  _$jscoverage['/swf.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['448'] = [];
  _$jscoverage['/swf.js'].branchData['448'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['450'] = [];
  _$jscoverage['/swf.js'].branchData['450'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['451'] = [];
  _$jscoverage['/swf.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['451'][2] = new BranchData();
  _$jscoverage['/swf.js'].branchData['453'] = [];
  _$jscoverage['/swf.js'].branchData['453'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['455'] = [];
  _$jscoverage['/swf.js'].branchData['455'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['460'] = [];
  _$jscoverage['/swf.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['471'] = [];
  _$jscoverage['/swf.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['475'] = [];
  _$jscoverage['/swf.js'].branchData['475'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['496'] = [];
  _$jscoverage['/swf.js'].branchData['496'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['516'] = [];
  _$jscoverage['/swf.js'].branchData['516'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['538'] = [];
  _$jscoverage['/swf.js'].branchData['538'][1] = new BranchData();
  _$jscoverage['/swf.js'].branchData['541'] = [];
  _$jscoverage['/swf.js'].branchData['541'][1] = new BranchData();
}
_$jscoverage['/swf.js'].branchData['541'][1].init(120, 4, 'data');
function visit54_541_1(result) {
  _$jscoverage['/swf.js'].branchData['541'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['538'][1].init(17, 24, 'typeof data !== \'string\'');
function visit53_538_1(result) {
  _$jscoverage['/swf.js'].branchData['538'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['516'][1].init(42, 6, 'OLD_IE');
function visit52_516_1(result) {
  _$jscoverage['/swf.js'].branchData['516'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['496'][1].init(189, 2, 'ie');
function visit51_496_1(result) {
  _$jscoverage['/swf.js'].branchData['496'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['475'][1].init(163, 15, 'k === FLASHVARS');
function visit50_475_1(result) {
  _$jscoverage['/swf.js'].branchData['475'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['471'][1].init(50, 11, 'k in PARAMS');
function visit49_471_1(result) {
  _$jscoverage['/swf.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['460'][1].init(873, 20, 'nodeName === \'embed\'');
function visit48_460_1(result) {
  _$jscoverage['/swf.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['455'][1].init(277, 36, 'Dom.nodeName(params[i]) === \'object\'');
function visit47_455_1(result) {
  _$jscoverage['/swf.js'].branchData['455'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['453'][1].init(164, 31, 'Dom.nodeName(param) === \'embed\'');
function visit46_453_1(result) {
  _$jscoverage['/swf.js'].branchData['453'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['451'][2].init(26, 29, 'Dom.attr(param, \'name\') || \'\'');
function visit45_451_2(result) {
  _$jscoverage['/swf.js'].branchData['451'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['451'][1].init(26, 56, '(Dom.attr(param, \'name\') || \'\').toLowerCase() === \'movie\'');
function visit44_451_1(result) {
  _$jscoverage['/swf.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['450'][1].init(56, 20, 'param.nodeType === 1');
function visit43_450_1(result) {
  _$jscoverage['/swf.js'].branchData['450'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['448'][1].init(176, 17, 'i < params.length');
function visit42_448_1(result) {
  _$jscoverage['/swf.js'].branchData['448'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['444'][1].init(58, 3, 'url');
function visit41_444_1(result) {
  _$jscoverage['/swf.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['442'][1].init(134, 21, 'nodeName === \'object\'');
function visit40_442_1(result) {
  _$jscoverage['/swf.js'].branchData['442'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['430'][1].init(17, 28, 'typeof obj[i] === \'function\'');
function visit39_430_1(result) {
  _$jscoverage['/swf.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['381'][1].init(371, 20, 'nodeName === \'param\'');
function visit38_381_1(result) {
  _$jscoverage['/swf.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['379'][1].init(269, 21, 'nodeName === \'object\'');
function visit37_379_1(result) {
  _$jscoverage['/swf.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['377'][1].init(169, 20, 'nodeName === \'embed\'');
function visit36_377_1(result) {
  _$jscoverage['/swf.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['376'][1].init(67, 38, 'srcElement && Dom.nodeName(srcElement)');
function visit35_376_1(result) {
  _$jscoverage['/swf.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['291'][1].init(25, 21, 'typeof v === \'string\'');
function visit34_291_1(result) {
  _$jscoverage['/swf.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['273'][1].init(25, 21, 'typeof v === \'string\'');
function visit33_273_1(result) {
  _$jscoverage['/swf.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['192'][1].init(25, 26, 'swfObject.readyState === 4');
function visit32_192_1(result) {
  _$jscoverage['/swf.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['188'][1].init(246, 6, 'OLD_IE');
function visit31_188_1(result) {
  _$jscoverage['/swf.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['170'][1].init(154, 17, 'args.length !== 0');
function visit30_170_1(result) {
  _$jscoverage['/swf.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['164'][1].init(21, 9, 'swf[func]');
function visit29_164_1(result) {
  _$jscoverage['/swf.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['162'][1].init(103, 10, 'args || []');
function visit28_162_1(result) {
  _$jscoverage['/swf.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['149'][1].init(3190, 19, '!self.get(\'status\')');
function visit27_149_1(result) {
  _$jscoverage['/swf.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['136'][1].init(21, 6, 'OLD_IE');
function visit26_136_1(result) {
  _$jscoverage['/swf.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['135'][1].init(2756, 19, 'htmlMode === \'full\'');
function visit25_135_1(result) {
  _$jscoverage['/swf.js'].branchData['135'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['127'][1].init(2501, 26, '\'outerHTML\' in placeHolder');
function visit24_127_1(result) {
  _$jscoverage['/swf.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['121'][1].init(2319, 8, 'elBefore');
function visit23_121_1(result) {
  _$jscoverage['/swf.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['112'][1].init(2016, 19, 'htmlMode === \'full\'');
function visit22_112_1(result) {
  _$jscoverage['/swf.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['102'][1].init(552, 22, 'params.flashVars || {}');
function visit21_102_1(result) {
  _$jscoverage['/swf.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['98'][2].init(76, 32, 'parseInt(attrs.height, 10) < 137');
function visit20_98_2(result) {
  _$jscoverage['/swf.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['98'][1].init(48, 60, '!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137');
function visit19_98_1(result) {
  _$jscoverage['/swf.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['97'][1].init(318, 110, '!(\'height\' in attrs) || (!/%$/.test(attrs.height) && parseInt(attrs.height, 10) < 137)');
function visit18_97_1(result) {
  _$jscoverage['/swf.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['93'][2].init(74, 31, 'parseInt(attrs.width, 10) < 310');
function visit17_93_2(result) {
  _$jscoverage['/swf.js'].branchData['93'][2].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['93'][1].init(47, 58, '!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310');
function visit16_93_1(result) {
  _$jscoverage['/swf.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['92'][1].init(115, 107, '!(\'width\' in attrs) || (!/%$/.test(attrs.width) && parseInt(attrs.width, 10) < 310)');
function visit15_92_1(result) {
  _$jscoverage['/swf.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['88'][1].init(130, 14, 'expressInstall');
function visit14_88_1(result) {
  _$jscoverage['/swf.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['84'][1].init(883, 27, 'version && !fpvGTE(version)');
function visit13_84_1(result) {
  _$jscoverage['/swf.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['78'][1].init(718, 6, '!fpv()');
function visit12_78_1(result) {
  _$jscoverage['/swf.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/swf.js'].branchData['75'][1].init(639, 29, 'attrs.id || S.guid(\'ks-swf-\')');
function visit11_75_1(result) {
  _$jscoverage['/swf.js'].branchData['75'][1].ranCondition(result);
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
  var OLD_IE = !!S.Env.host.ActiveXObject, TYPE = 'application/x-shockwave-flash', CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000', FLASHVARS = 'flashvars', EMPTY = '', LT = '<', GT = '>', doc = S.Env.host.document, fpv = FlashUA.fpv, fpvGEQ = FlashUA.fpvGEQ, fpvGTE = FlashUA.fpvGTE, OBJECT_TAG = 'object', encode = encodeURIComponent, PARAMS = {
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
  _$jscoverage['/swf.js'].lineData[51]++;
  var SWF;
  _$jscoverage['/swf.js'].lineData[57]++;
  SWF = Attribute.extend({
  constructor: function(config) {
  _$jscoverage['/swf.js'].functionData[1]++;
  _$jscoverage['/swf.js'].lineData[59]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[60]++;
  self.callSuper(config);
  _$jscoverage['/swf.js'].lineData[61]++;
  var expressInstall = self.get('expressInstall'), swf, html, id, htmlMode = self.get('htmlMode'), flashVars, params = self.get('params'), attrs = self.get('attrs'), doc = self.get('document'), placeHolder = Dom.create('<span>', undefined, doc), elBefore = self.get('elBefore'), installedSrc = self.get('src'), version = self.get('version');
  _$jscoverage['/swf.js'].lineData[75]++;
  id = attrs.id = visit11_75_1(attrs.id || S.guid('ks-swf-'));
  _$jscoverage['/swf.js'].lineData[78]++;
  if (visit12_78_1(!fpv())) {
    _$jscoverage['/swf.js'].lineData[79]++;
    self.set('status', SWF.Status.NOT_INSTALLED);
    _$jscoverage['/swf.js'].lineData[80]++;
    return;
  }
  _$jscoverage['/swf.js'].lineData[84]++;
  if (visit13_84_1(version && !fpvGTE(version))) {
    _$jscoverage['/swf.js'].lineData[85]++;
    self.set('status', SWF.Status.TOO_LOW);
    _$jscoverage['/swf.js'].lineData[88]++;
    if (visit14_88_1(expressInstall)) {
      _$jscoverage['/swf.js'].lineData[89]++;
      installedSrc = expressInstall;
      _$jscoverage['/swf.js'].lineData[92]++;
      if (visit15_92_1(!('width' in attrs) || (visit16_93_1(!/%$/.test(attrs.width) && visit17_93_2(parseInt(attrs.width, 10) < 310))))) {
        _$jscoverage['/swf.js'].lineData[94]++;
        attrs.width = '310';
      }
      _$jscoverage['/swf.js'].lineData[97]++;
      if (visit18_97_1(!('height' in attrs) || (visit19_98_1(!/%$/.test(attrs.height) && visit20_98_2(parseInt(attrs.height, 10) < 137))))) {
        _$jscoverage['/swf.js'].lineData[99]++;
        attrs.height = '137';
      }
      _$jscoverage['/swf.js'].lineData[102]++;
      flashVars = params.flashVars = visit21_102_1(params.flashVars || {});
      _$jscoverage['/swf.js'].lineData[104]++;
      S.mix(flashVars, {
  MMredirectURL: location.href, 
  MMplayerType: OLD_IE ? 'ActiveX' : 'PlugIn', 
  MMdoctitle: doc.title.slice(0, 47) + ' - Flash Player Installation'});
    }
  }
  _$jscoverage['/swf.js'].lineData[112]++;
  if (visit22_112_1(htmlMode === 'full')) {
    _$jscoverage['/swf.js'].lineData[113]++;
    html = _stringSWFFull(installedSrc, attrs, params);
  } else {
    _$jscoverage['/swf.js'].lineData[115]++;
    html = _stringSWFDefault(installedSrc, attrs, params);
  }
  _$jscoverage['/swf.js'].lineData[119]++;
  self.set('html', html);
  _$jscoverage['/swf.js'].lineData[121]++;
  if (visit23_121_1(elBefore)) {
    _$jscoverage['/swf.js'].lineData[122]++;
    Dom.insertBefore(placeHolder, elBefore);
  } else {
    _$jscoverage['/swf.js'].lineData[124]++;
    Dom.append(placeHolder, self.get('render'));
  }
  _$jscoverage['/swf.js'].lineData[127]++;
  if (visit24_127_1('outerHTML' in placeHolder)) {
    _$jscoverage['/swf.js'].lineData[128]++;
    placeHolder.outerHTML = html;
  } else {
    _$jscoverage['/swf.js'].lineData[130]++;
    placeHolder.parentNode.replaceChild(Dom.create(html), placeHolder);
  }
  _$jscoverage['/swf.js'].lineData[133]++;
  swf = Dom.get('#' + id, doc);
  _$jscoverage['/swf.js'].lineData[135]++;
  if (visit25_135_1(htmlMode === 'full')) {
    _$jscoverage['/swf.js'].lineData[136]++;
    if (visit26_136_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[137]++;
      self.set('swfObject', swf);
    } else {
      _$jscoverage['/swf.js'].lineData[139]++;
      self.set('swfObject', swf.parentNode);
    }
  } else {
    _$jscoverage['/swf.js'].lineData[142]++;
    self.set('swfObject', swf);
  }
  _$jscoverage['/swf.js'].lineData[147]++;
  self.set('el', swf);
  _$jscoverage['/swf.js'].lineData[149]++;
  if (visit27_149_1(!self.get('status'))) {
    _$jscoverage['/swf.js'].lineData[150]++;
    self.set('status', SWF.Status.SUCCESS);
  }
}, 
  'callSWF': function(func, args) {
  _$jscoverage['/swf.js'].functionData[2]++;
  _$jscoverage['/swf.js'].lineData[159]++;
  var swf = this.get('el'), ret, params;
  _$jscoverage['/swf.js'].lineData[162]++;
  args = visit28_162_1(args || []);
  _$jscoverage['/swf.js'].lineData[163]++;
  try {
    _$jscoverage['/swf.js'].lineData[164]++;
    if (visit29_164_1(swf[func])) {
      _$jscoverage['/swf.js'].lineData[165]++;
      ret = swf[func].apply(swf, args);
    }
  }  catch (e) {
  _$jscoverage['/swf.js'].lineData[169]++;
  params = '';
  _$jscoverage['/swf.js'].lineData[170]++;
  if (visit30_170_1(args.length !== 0)) {
    _$jscoverage['/swf.js'].lineData[171]++;
    params = '"' + args.join('", "') + '"';
  }
  _$jscoverage['/swf.js'].lineData[175]++;
  ret = (new Function('swf', 'return swf.' + func + '(' + params + ');'))(swf);
}
  _$jscoverage['/swf.js'].lineData[177]++;
  return ret;
}, 
  destroy: function() {
  _$jscoverage['/swf.js'].functionData[3]++;
  _$jscoverage['/swf.js'].lineData[183]++;
  var self = this;
  _$jscoverage['/swf.js'].lineData[184]++;
  var swfObject = self.get('swfObject');
  _$jscoverage['/swf.js'].lineData[188]++;
  if (visit31_188_1(OLD_IE)) {
    _$jscoverage['/swf.js'].lineData[189]++;
    swfObject.style.display = 'none';
    _$jscoverage['/swf.js'].lineData[191]++;
    (function remove() {
  _$jscoverage['/swf.js'].functionData[4]++;
  _$jscoverage['/swf.js'].lineData[192]++;
  if (visit32_192_1(swfObject.readyState === 4)) {
    _$jscoverage['/swf.js'].lineData[193]++;
    removeObjectInIE(swfObject);
  } else {
    _$jscoverage['/swf.js'].lineData[196]++;
    setTimeout(remove, 10);
  }
})();
  } else {
    _$jscoverage['/swf.js'].lineData[200]++;
    swfObject.parentNode.removeChild(swfObject);
  }
}}, {
  ATTRS: {
  expressInstall: {
  value: S.config('base') + 'swf/assets/expressInstall.swf'}, 
  src: {}, 
  version: {
  value: '9'}, 
  params: {
  value: {}}, 
  attrs: {
  value: {}}, 
  render: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[5]++;
  _$jscoverage['/swf.js'].lineData[273]++;
  if (visit33_273_1(typeof v === 'string')) {
    _$jscoverage['/swf.js'].lineData[274]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[276]++;
  return v;
}, 
  valueFn: function() {
  _$jscoverage['/swf.js'].functionData[6]++;
  _$jscoverage['/swf.js'].lineData[279]++;
  return document.body;
}}, 
  elBefore: {
  setter: function(v) {
  _$jscoverage['/swf.js'].functionData[7]++;
  _$jscoverage['/swf.js'].lineData[291]++;
  if (visit34_291_1(typeof v === 'string')) {
    _$jscoverage['/swf.js'].lineData[292]++;
    v = Dom.get(v, this.get('document'));
  }
  _$jscoverage['/swf.js'].lineData[294]++;
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
  _$jscoverage['/swf.js'].lineData[374]++;
  swf = Dom.get(swf);
  _$jscoverage['/swf.js'].lineData[375]++;
  var srcElement = getSrcElements(swf)[0], nodeName = visit35_376_1(srcElement && Dom.nodeName(srcElement));
  _$jscoverage['/swf.js'].lineData[377]++;
  if (visit36_377_1(nodeName === 'embed')) {
    _$jscoverage['/swf.js'].lineData[378]++;
    return Dom.attr(srcElement, 'src');
  } else {
    _$jscoverage['/swf.js'].lineData[379]++;
    if (visit37_379_1(nodeName === 'object')) {
      _$jscoverage['/swf.js'].lineData[380]++;
      return Dom.attr(srcElement, 'data');
    } else {
      _$jscoverage['/swf.js'].lineData[381]++;
      if (visit38_381_1(nodeName === 'param')) {
        _$jscoverage['/swf.js'].lineData[382]++;
        return Dom.attr(srcElement, 'value');
      }
    }
  }
  _$jscoverage['/swf.js'].lineData[384]++;
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
  _$jscoverage['/swf.js'].lineData[428]++;
  function removeObjectInIE(obj) {
    _$jscoverage['/swf.js'].functionData[9]++;
    _$jscoverage['/swf.js'].lineData[429]++;
    for (var i in obj) {
      _$jscoverage['/swf.js'].lineData[430]++;
      if (visit39_430_1(typeof obj[i] === 'function')) {
        _$jscoverage['/swf.js'].lineData[431]++;
        obj[i] = null;
      }
    }
    _$jscoverage['/swf.js'].lineData[434]++;
    obj.parentNode.removeChild(obj);
  }
  _$jscoverage['/swf.js'].lineData[437]++;
  function getSrcElements(swf) {
    _$jscoverage['/swf.js'].functionData[10]++;
    _$jscoverage['/swf.js'].lineData[438]++;
    var url = '', params, i, param, elements = [], nodeName = Dom.nodeName(swf);
    _$jscoverage['/swf.js'].lineData[442]++;
    if (visit40_442_1(nodeName === 'object')) {
      _$jscoverage['/swf.js'].lineData[443]++;
      url = Dom.attr(swf, 'data');
      _$jscoverage['/swf.js'].lineData[444]++;
      if (visit41_444_1(url)) {
        _$jscoverage['/swf.js'].lineData[445]++;
        elements.push(swf);
      }
      _$jscoverage['/swf.js'].lineData[447]++;
      params = swf.childNodes;
      _$jscoverage['/swf.js'].lineData[448]++;
      for (i = 0; visit42_448_1(i < params.length); i++) {
        _$jscoverage['/swf.js'].lineData[449]++;
        param = params[i];
        _$jscoverage['/swf.js'].lineData[450]++;
        if (visit43_450_1(param.nodeType === 1)) {
          _$jscoverage['/swf.js'].lineData[451]++;
          if (visit44_451_1((visit45_451_2(Dom.attr(param, 'name') || '')).toLowerCase() === 'movie')) {
            _$jscoverage['/swf.js'].lineData[452]++;
            elements.push(param);
          } else {
            _$jscoverage['/swf.js'].lineData[453]++;
            if (visit46_453_1(Dom.nodeName(param) === 'embed')) {
              _$jscoverage['/swf.js'].lineData[454]++;
              elements.push(param);
            } else {
              _$jscoverage['/swf.js'].lineData[455]++;
              if (visit47_455_1(Dom.nodeName(params[i]) === 'object')) {
                _$jscoverage['/swf.js'].lineData[456]++;
                elements.push(param);
              }
            }
          }
        }
      }
    } else {
      _$jscoverage['/swf.js'].lineData[460]++;
      if (visit48_460_1(nodeName === 'embed')) {
        _$jscoverage['/swf.js'].lineData[461]++;
        elements.push(swf);
      }
    }
    _$jscoverage['/swf.js'].lineData[463]++;
    return elements;
  }
  _$jscoverage['/swf.js'].lineData[467]++;
  function collectionParams(params) {
    _$jscoverage['/swf.js'].functionData[11]++;
    _$jscoverage['/swf.js'].lineData[468]++;
    var par = EMPTY;
    _$jscoverage['/swf.js'].lineData[469]++;
    S.each(params, function(v, k) {
  _$jscoverage['/swf.js'].functionData[12]++;
  _$jscoverage['/swf.js'].lineData[470]++;
  k = k.toLowerCase();
  _$jscoverage['/swf.js'].lineData[471]++;
  if (visit49_471_1(k in PARAMS)) {
    _$jscoverage['/swf.js'].lineData[472]++;
    par += stringParam(k, v);
  } else {
    _$jscoverage['/swf.js'].lineData[475]++;
    if (visit50_475_1(k === FLASHVARS)) {
      _$jscoverage['/swf.js'].lineData[476]++;
      par += stringParam(k, toFlashVars(v));
    }
  }
});
    _$jscoverage['/swf.js'].lineData[479]++;
    return par;
  }
  _$jscoverage['/swf.js'].lineData[482]++;
  function _stringSWFDefault(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[13]++;
    _$jscoverage['/swf.js'].lineData[483]++;
    return _stringSWF(src, attrs, params, OLD_IE) + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[486]++;
  function _stringSWF(src, attrs, params, ie) {
    _$jscoverage['/swf.js'].functionData[14]++;
    _$jscoverage['/swf.js'].lineData[487]++;
    var res, attr = EMPTY, par = EMPTY;
    _$jscoverage['/swf.js'].lineData[492]++;
    S.each(attrs, function(v, k) {
  _$jscoverage['/swf.js'].functionData[15]++;
  _$jscoverage['/swf.js'].lineData[493]++;
  attr += stringAttr(k, v);
});
    _$jscoverage['/swf.js'].lineData[496]++;
    if (visit51_496_1(ie)) {
      _$jscoverage['/swf.js'].lineData[497]++;
      attr += stringAttr('classid', CID);
      _$jscoverage['/swf.js'].lineData[498]++;
      par += stringParam('movie', src);
    } else {
      _$jscoverage['/swf.js'].lineData[501]++;
      attr += stringAttr('data', src);
      _$jscoverage['/swf.js'].lineData[503]++;
      attr += stringAttr('type', TYPE);
    }
    _$jscoverage['/swf.js'].lineData[506]++;
    par += collectionParams(params);
    _$jscoverage['/swf.js'].lineData[508]++;
    res = LT + OBJECT_TAG + attr + GT + par;
    _$jscoverage['/swf.js'].lineData[510]++;
    return res;
  }
  _$jscoverage['/swf.js'].lineData[514]++;
  function _stringSWFFull(src, attrs, params) {
    _$jscoverage['/swf.js'].functionData[16]++;
    _$jscoverage['/swf.js'].lineData[515]++;
    var outside, inside;
    _$jscoverage['/swf.js'].lineData[516]++;
    if (visit52_516_1(OLD_IE)) {
      _$jscoverage['/swf.js'].lineData[517]++;
      outside = _stringSWF(src, attrs, params, 1);
      _$jscoverage['/swf.js'].lineData[518]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[519]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[520]++;
      inside = _stringSWF(src, attrs, params, 0);
    } else {
      _$jscoverage['/swf.js'].lineData[522]++;
      inside = _stringSWF(src, attrs, params, 0);
      _$jscoverage['/swf.js'].lineData[523]++;
      delete attrs.id;
      _$jscoverage['/swf.js'].lineData[524]++;
      delete attrs.style;
      _$jscoverage['/swf.js'].lineData[525]++;
      outside = _stringSWF(src, attrs, params, 1);
    }
    _$jscoverage['/swf.js'].lineData[527]++;
    return outside + inside + LT + '/' + OBJECT_TAG + GT + LT + '/' + OBJECT_TAG + GT;
  }
  _$jscoverage['/swf.js'].lineData[534]++;
  function toFlashVars(obj) {
    _$jscoverage['/swf.js'].functionData[17]++;
    _$jscoverage['/swf.js'].lineData[535]++;
    var arr = [], ret;
    _$jscoverage['/swf.js'].lineData[537]++;
    S.each(obj, function(data, prop) {
  _$jscoverage['/swf.js'].functionData[18]++;
  _$jscoverage['/swf.js'].lineData[538]++;
  if (visit53_538_1(typeof data !== 'string')) {
    _$jscoverage['/swf.js'].lineData[539]++;
    data = Json.stringify(data);
  }
  _$jscoverage['/swf.js'].lineData[541]++;
  if (visit54_541_1(data)) {
    _$jscoverage['/swf.js'].lineData[542]++;
    arr.push(prop + '=' + encode(data));
  }
});
    _$jscoverage['/swf.js'].lineData[545]++;
    ret = arr.join('&');
    _$jscoverage['/swf.js'].lineData[546]++;
    return ret;
  }
  _$jscoverage['/swf.js'].lineData[549]++;
  function stringParam(key, value) {
    _$jscoverage['/swf.js'].functionData[19]++;
    _$jscoverage['/swf.js'].lineData[550]++;
    return '<param name="' + key + '" value="' + value + '"></param>';
  }
  _$jscoverage['/swf.js'].lineData[553]++;
  function stringAttr(key, value) {
    _$jscoverage['/swf.js'].functionData[20]++;
    _$jscoverage['/swf.js'].lineData[554]++;
    return ' ' + key + '=' + '"' + value + '"';
  }
  _$jscoverage['/swf.js'].lineData[557]++;
  return SWF;
});
