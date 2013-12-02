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
if (! _$jscoverage['/dd/draggable.js']) {
  _$jscoverage['/dd/draggable.js'] = {};
  _$jscoverage['/dd/draggable.js'].lineData = [];
  _$jscoverage['/dd/draggable.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[10] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[26] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[27] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[196] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[200] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[202] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[203] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[207] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[210] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[214] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[215] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[217] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[227] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[233] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[238] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[239] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[240] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[241] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[243] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[245] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[249] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[250] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[252] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[254] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[258] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[259] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[262] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[264] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[265] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[277] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[284] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[285] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[288] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[291] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[296] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[297] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[299] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[300] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[306] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[308] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[311] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[312] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[314] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[320] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[321] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[322] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[323] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[328] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[332] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[333] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[337] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[339] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[340] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[343] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[344] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[348] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[353] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[362] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[364] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[365] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[368] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[369] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[370] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[374] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[377] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[380] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[381] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[384] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[386] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[395] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[399] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[401] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[405] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[406] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[407] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[410] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[412] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[413] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[414] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[419] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[423] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[424] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[433] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[434] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[437] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[444] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[445] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[447] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[451] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[455] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[456] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[457] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[458] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[462] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[463] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[476] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[477] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[478] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[501] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[502] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[504] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[520] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[536] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[579] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[580] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[581] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[583] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[584] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[585] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[588] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[589] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[591] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[592] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[594] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[596] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[597] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[624] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[626] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[836] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[838] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[839] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[843] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[844] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[845] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[854] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[855] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[861] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[862] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[870] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[871] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[873] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[874] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[875] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[877] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[881] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].functionData) {
  _$jscoverage['/dd/draggable.js'].functionData = [];
  _$jscoverage['/dd/draggable.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[6] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[7] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[9] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[10] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[11] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[12] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[13] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[14] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[15] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[16] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[17] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[18] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[19] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[20] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[21] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[22] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[23] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[24] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[25] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[26] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[27] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[28] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[29] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[30] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['238'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['250'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['250'][3] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['258'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['264'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['276'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['284'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['296'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['311'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['321'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['332'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['337'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['337'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['338'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['343'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['364'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['380'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['384'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['399'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['406'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['410'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['501'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['501'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['580'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['584'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['588'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['588'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['591'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['873'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['873'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['874'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['874'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['874'][1].init(17, 22, '!self._checkHandler(t)');
function visit94_874_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['874'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['873'][1].init(65, 29, 'self._checkDragStartValid(ev)');
function visit93_873_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['873'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['591'][1].init(338, 10, 'v.nodeType');
function visit92_591_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['588'][1].init(202, 21, 'typeof v === \'string\'');
function visit91_588_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['588'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['584'][1].init(29, 23, 'typeof v === \'function\'');
function visit90_584_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['580'][1].init(62, 10, '!vs.length');
function visit89_580_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['501'][1].init(25, 20, '!(v instanceof Node)');
function visit88_501_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['501'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['410'][1].init(259, 20, 'self.get(\'dragging\')');
function visit87_410_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['406'][1].init(164, 2, 'ie');
function visit86_406_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['399'][1].init(17, 7, 'e || {}');
function visit85_399_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['384'][1].init(1729, 11, 'def && move');
function visit84_384_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['380'][1].init(1629, 40, 'self.fire(\'drag\', customEvent) === false');
function visit83_380_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['364'][1].init(1110, 4, 'move');
function visit82_364_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['343'][1].init(519, 6, '!start');
function visit81_343_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['338'][1].init(79, 55, 'Math.abs(pageY - startMousePos.top) >= clickPixelThresh');
function visit80_338_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['337'][2].init(218, 56, 'Math.abs(pageX - startMousePos.left) >= clickPixelThresh');
function visit79_337_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['337'][1].init(218, 135, 'Math.abs(pageX - startMousePos.left) >= clickPixelThresh || Math.abs(pageY - startMousePos.top) >= clickPixelThresh');
function visit78_337_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['332'][1].init(115, 21, '!self.get(\'dragging\')');
function visit77_332_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['321'][1].init(46, 17, 'self._bufferTimer');
function visit76_321_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['311'][1].init(1626, 10, 'bufferTime');
function visit75_311_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['296'][1].init(1169, 15, 'self._allowMove');
function visit74_296_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['284'][1].init(870, 33, '!Features.isTouchEventSupported()');
function visit73_284_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['276'][1].init(579, 16, 'self.get(\'halt\')');
function visit72_276_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['264'][1].init(109, 2, 'ie');
function visit71_264_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['258'][1].init(17, 3, '!ev');
function visit70_258_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['250'][3].init(79, 14, 'ev.which !== 1');
function visit69_250_3(result) {
  _$jscoverage['/dd/draggable.js'].branchData['250'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['250'][2].init(46, 47, 'self.get(\'primaryButtonOnly\') && ev.which !== 1');
function visit68_250_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['250'][1].init(46, 87, 'self.get(\'primaryButtonOnly\') && ev.which !== 1 || self.get(\'disabled\')');
function visit67_250_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['238'][2].init(51, 16, 'handler[0] === t');
function visit66_238_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['238'][1].init(51, 39, 'handler[0] === t || handler.contains(t)');
function visit65_238_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var Node = require('node'), DDM = require('./ddm'), Base = require('base');
  _$jscoverage['/dd/draggable.js'].lineData[10]++;
  var UA = S.UA, $ = Node.all, each = S.each, Features = S.Features, ie = UA.ie, NULL = null, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[24]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[1]++;
  _$jscoverage['/dd/draggable.js'].lineData[26]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[27]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[196]++;
  self._allowMove = self.get('move');
}, 
  '_onSetNode': function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[200]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[202]++;
  self.setInternal('dragNode', n);
  _$jscoverage['/dd/draggable.js'].lineData[203]++;
  self.bindDragEvent();
}, 
  bindDragEvent: function() {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[207]++;
  var self = this, node = self.get('node');
  _$jscoverage['/dd/draggable.js'].lineData[210]++;
  node.on(Node.Gesture.start, handlePreDragStart, self).on('dragstart', self._fixDragStart);
}, 
  detachDragEvent: function(self) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[214]++;
  self = this;
  _$jscoverage['/dd/draggable.js'].lineData[215]++;
  var node = self.get('node');
  _$jscoverage['/dd/draggable.js'].lineData[217]++;
  node.detach(Node.Gesture.start, handlePreDragStart, self).detach('dragstart', self._fixDragStart);
}, 
  _bufferTimer: NULL, 
  _onSetDisabledChange: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[227]++;
  this.get('dragNode')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
}, 
  _fixDragStart: fixDragStart, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[233]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[238]++;
  if (visit65_238_1(visit66_238_2(handler[0] === t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[239]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[240]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[241]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[243]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[245]++;
  return ret;
}, 
  _checkDragStartValid: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[249]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[250]++;
  if (visit67_250_1(visit68_250_2(self.get('primaryButtonOnly') && visit69_250_3(ev.which !== 1)) || self.get('disabled'))) {
    _$jscoverage['/dd/draggable.js'].lineData[252]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[254]++;
  return 1;
}, 
  _prepare: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[258]++;
  if (visit70_258_1(!ev)) {
    _$jscoverage['/dd/draggable.js'].lineData[259]++;
    return;
  }
  _$jscoverage['/dd/draggable.js'].lineData[262]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[264]++;
  if (visit71_264_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[265]++;
    fixIEMouseDown();
  }
  _$jscoverage['/dd/draggable.js'].lineData[276]++;
  if (visit72_276_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[277]++;
    ev.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[284]++;
  if (visit73_284_1(!Features.isTouchEventSupported())) {
    _$jscoverage['/dd/draggable.js'].lineData[285]++;
    ev.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[288]++;
  var mx = ev.pageX, my = ev.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[291]++;
  self.setInternal('startMousePos', self.mousePos = {
  left: mx, 
  top: my});
  _$jscoverage['/dd/draggable.js'].lineData[296]++;
  if (visit74_296_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[297]++;
    var node = self.get('node'), nxy = node.offset();
    _$jscoverage['/dd/draggable.js'].lineData[299]++;
    self.setInternal('startNodePos', nxy);
    _$jscoverage['/dd/draggable.js'].lineData[300]++;
    self.setInternal('deltaPos', {
  left: mx - nxy.left, 
  top: my - nxy.top});
  }
  _$jscoverage['/dd/draggable.js'].lineData[306]++;
  DDM._regToDrag(self);
  _$jscoverage['/dd/draggable.js'].lineData[308]++;
  var bufferTime = self.get('bufferTime');
  _$jscoverage['/dd/draggable.js'].lineData[311]++;
  if (visit75_311_1(bufferTime)) {
    _$jscoverage['/dd/draggable.js'].lineData[312]++;
    self._bufferTimer = setTimeout(function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[314]++;
  self._start(ev);
}, bufferTime * 1000);
  }
}, 
  _clearBufferTimer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[320]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[321]++;
  if (visit76_321_1(self._bufferTimer)) {
    _$jscoverage['/dd/draggable.js'].lineData[322]++;
    clearTimeout(self._bufferTimer);
    _$jscoverage['/dd/draggable.js'].lineData[323]++;
    self._bufferTimer = 0;
  }
}, 
  _move: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[328]++;
  var self = this, pageX = ev.pageX, pageY = ev.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[332]++;
  if (visit77_332_1(!self.get('dragging'))) {
    _$jscoverage['/dd/draggable.js'].lineData[333]++;
    var startMousePos = self.get('startMousePos'), start = 0, clickPixelThresh = self.get('clickPixelThresh');
    _$jscoverage['/dd/draggable.js'].lineData[337]++;
    if (visit78_337_1(visit79_337_2(Math.abs(pageX - startMousePos.left) >= clickPixelThresh) || visit80_338_1(Math.abs(pageY - startMousePos.top) >= clickPixelThresh))) {
      _$jscoverage['/dd/draggable.js'].lineData[339]++;
      self._start(ev);
      _$jscoverage['/dd/draggable.js'].lineData[340]++;
      start = 1;
    }
    _$jscoverage['/dd/draggable.js'].lineData[343]++;
    if (visit81_343_1(!start)) {
      _$jscoverage['/dd/draggable.js'].lineData[344]++;
      return;
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[348]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[353]++;
  var customEvent = {
  drag: self, 
  left: pageX, 
  top: pageY, 
  pageX: pageX, 
  pageY: pageY, 
  domEvent: ev};
  _$jscoverage['/dd/draggable.js'].lineData[362]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[364]++;
  if (visit82_364_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[365]++;
    var diff = self.get('deltaPos'), left = pageX - diff.left, top = pageY - diff.top;
    _$jscoverage['/dd/draggable.js'].lineData[368]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[369]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[370]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[374]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[377]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[380]++;
  if (visit83_380_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[381]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[384]++;
  if (visit84_384_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[386]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  'stopDrag': function() {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[395]++;
  DDM._end();
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[399]++;
  e = visit85_399_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[401]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[405]++;
  self._clearBufferTimer();
  _$jscoverage['/dd/draggable.js'].lineData[406]++;
  if (visit86_406_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[407]++;
    fixIEMouseUp();
  }
  _$jscoverage['/dd/draggable.js'].lineData[410]++;
  if (visit87_410_1(self.get('dragging'))) {
    _$jscoverage['/dd/draggable.js'].lineData[412]++;
    self.get('node').removeClass(PREFIX_CLS + 'drag-over');
    _$jscoverage['/dd/draggable.js'].lineData[413]++;
    if ((activeDrop = DDM.get('activeDrop'))) {
      _$jscoverage['/dd/draggable.js'].lineData[414]++;
      self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
    } else {
      _$jscoverage['/dd/draggable.js'].lineData[419]++;
      self.fire('dragdropmiss', {
  drag: self});
    }
    _$jscoverage['/dd/draggable.js'].lineData[423]++;
    self.setInternal('dragging', 0);
    _$jscoverage['/dd/draggable.js'].lineData[424]++;
    self.fire('dragend', {
  drag: self, 
  pageX: e.pageX, 
  pageY: e.pageY});
  }
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[433]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[434]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[437]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[444]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[445]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[447]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[451]++;
  this.fire('dragover', e);
}, 
  _start: function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[455]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[456]++;
  self._clearBufferTimer();
  _$jscoverage['/dd/draggable.js'].lineData[457]++;
  self.setInternal('dragging', 1);
  _$jscoverage['/dd/draggable.js'].lineData[458]++;
  self.setInternal('dragStartMousePos', {
  left: ev.pageX, 
  top: ev.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[462]++;
  DDM._start();
  _$jscoverage['/dd/draggable.js'].lineData[463]++;
  self.fire('dragstart', {
  drag: self, 
  pageX: ev.pageX, 
  pageY: ev.pageY});
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[476]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[477]++;
  self.detachDragEvent();
  _$jscoverage['/dd/draggable.js'].lineData[478]++;
  self.detach();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[501]++;
  if (visit88_501_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[502]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[504]++;
  return undefined;
}}, 
  clickPixelThresh: {
  valueFn: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[520]++;
  return DDM.get('clickPixelThresh');
}}, 
  bufferTime: {
  valueFn: function() {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[536]++;
  return DDM.get('bufferTime');
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[579]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[580]++;
  if (visit89_580_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[581]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[583]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[584]++;
  if (visit90_584_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[585]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[588]++;
  if (visit91_588_1(typeof v === 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[589]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[591]++;
  if (visit92_591_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[592]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[594]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[596]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[597]++;
  return vs;
}}, 
  activeHandler: {}, 
  dragging: {
  value: false, 
  setter: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[624]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[626]++;
  self.get('dragNode')[d ? 'addClass' : 'removeClass'](PREFIX_CLS + 'dragging');
}}, 
  mode: {
  value: 'point'}, 
  disabled: {
  value: false}, 
  move: {
  value: false}, 
  primaryButtonOnly: {
  value: true}, 
  halt: {
  value: true}, 
  groups: {
  value: true}, 
  startMousePos: {}, 
  dragStartMousePos: {}, 
  startNodePos: {}, 
  deltaPos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  'POINT': 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[836]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[838]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[26]++;
    _$jscoverage['/dd/draggable.js'].lineData[839]++;
    doc.body.onselectstart = _ieSelectBack;
  }
  _$jscoverage['/dd/draggable.js'].lineData[843]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[27]++;
    _$jscoverage['/dd/draggable.js'].lineData[844]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[845]++;
    doc.body.onselectstart = fixIESelect;
  }
  _$jscoverage['/dd/draggable.js'].lineData[854]++;
  function fixDragStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[855]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[861]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[862]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[870]++;
  var handlePreDragStart = function(ev) {
  _$jscoverage['/dd/draggable.js'].functionData[30]++;
  _$jscoverage['/dd/draggable.js'].lineData[871]++;
  var self = this, t = ev.target;
  _$jscoverage['/dd/draggable.js'].lineData[873]++;
  if (visit93_873_1(self._checkDragStartValid(ev))) {
    _$jscoverage['/dd/draggable.js'].lineData[874]++;
    if (visit94_874_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[875]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[877]++;
    self._prepare(ev);
  }
};
  _$jscoverage['/dd/draggable.js'].lineData[881]++;
  return Draggable;
});
