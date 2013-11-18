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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[32] = 0;
  _$jscoverage['/loader/utils.js'].lineData[34] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[38] = 0;
  _$jscoverage['/loader/utils.js'].lineData[40] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[47] = 0;
  _$jscoverage['/loader/utils.js'].lineData[49] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[56] = 0;
  _$jscoverage['/loader/utils.js'].lineData[57] = 0;
  _$jscoverage['/loader/utils.js'].lineData[60] = 0;
  _$jscoverage['/loader/utils.js'].lineData[62] = 0;
  _$jscoverage['/loader/utils.js'].lineData[67] = 0;
  _$jscoverage['/loader/utils.js'].lineData[70] = 0;
  _$jscoverage['/loader/utils.js'].lineData[76] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[88] = 0;
  _$jscoverage['/loader/utils.js'].lineData[89] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[93] = 0;
  _$jscoverage['/loader/utils.js'].lineData[95] = 0;
  _$jscoverage['/loader/utils.js'].lineData[98] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[102] = 0;
  _$jscoverage['/loader/utils.js'].lineData[104] = 0;
  _$jscoverage['/loader/utils.js'].lineData[113] = 0;
  _$jscoverage['/loader/utils.js'].lineData[114] = 0;
  _$jscoverage['/loader/utils.js'].lineData[126] = 0;
  _$jscoverage['/loader/utils.js'].lineData[128] = 0;
  _$jscoverage['/loader/utils.js'].lineData[131] = 0;
  _$jscoverage['/loader/utils.js'].lineData[132] = 0;
  _$jscoverage['/loader/utils.js'].lineData[136] = 0;
  _$jscoverage['/loader/utils.js'].lineData[141] = 0;
  _$jscoverage['/loader/utils.js'].lineData[151] = 0;
  _$jscoverage['/loader/utils.js'].lineData[161] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[171] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[173] = 0;
  _$jscoverage['/loader/utils.js'].lineData[175] = 0;
  _$jscoverage['/loader/utils.js'].lineData[176] = 0;
  _$jscoverage['/loader/utils.js'].lineData[178] = 0;
  _$jscoverage['/loader/utils.js'].lineData[181] = 0;
  _$jscoverage['/loader/utils.js'].lineData[185] = 0;
  _$jscoverage['/loader/utils.js'].lineData[194] = 0;
  _$jscoverage['/loader/utils.js'].lineData[196] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[203] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[206] = 0;
  _$jscoverage['/loader/utils.js'].lineData[210] = 0;
  _$jscoverage['/loader/utils.js'].lineData[211] = 0;
  _$jscoverage['/loader/utils.js'].lineData[212] = 0;
  _$jscoverage['/loader/utils.js'].lineData[214] = 0;
  _$jscoverage['/loader/utils.js'].lineData[218] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[222] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[225] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[232] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[238] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[244] = 0;
  _$jscoverage['/loader/utils.js'].lineData[247] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[250] = 0;
  _$jscoverage['/loader/utils.js'].lineData[253] = 0;
  _$jscoverage['/loader/utils.js'].lineData[262] = 0;
  _$jscoverage['/loader/utils.js'].lineData[265] = 0;
  _$jscoverage['/loader/utils.js'].lineData[266] = 0;
  _$jscoverage['/loader/utils.js'].lineData[267] = 0;
  _$jscoverage['/loader/utils.js'].lineData[269] = 0;
  _$jscoverage['/loader/utils.js'].lineData[271] = 0;
  _$jscoverage['/loader/utils.js'].lineData[273] = 0;
  _$jscoverage['/loader/utils.js'].lineData[274] = 0;
  _$jscoverage['/loader/utils.js'].lineData[284] = 0;
  _$jscoverage['/loader/utils.js'].lineData[285] = 0;
  _$jscoverage['/loader/utils.js'].lineData[288] = 0;
  _$jscoverage['/loader/utils.js'].lineData[291] = 0;
  _$jscoverage['/loader/utils.js'].lineData[295] = 0;
  _$jscoverage['/loader/utils.js'].lineData[298] = 0;
  _$jscoverage['/loader/utils.js'].lineData[300] = 0;
  _$jscoverage['/loader/utils.js'].lineData[304] = 0;
  _$jscoverage['/loader/utils.js'].lineData[307] = 0;
  _$jscoverage['/loader/utils.js'].lineData[316] = 0;
  _$jscoverage['/loader/utils.js'].lineData[317] = 0;
  _$jscoverage['/loader/utils.js'].lineData[319] = 0;
  _$jscoverage['/loader/utils.js'].lineData[334] = 0;
  _$jscoverage['/loader/utils.js'].lineData[345] = 0;
  _$jscoverage['/loader/utils.js'].lineData[352] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[354] = 0;
  _$jscoverage['/loader/utils.js'].lineData[355] = 0;
  _$jscoverage['/loader/utils.js'].lineData[356] = 0;
  _$jscoverage['/loader/utils.js'].lineData[357] = 0;
  _$jscoverage['/loader/utils.js'].lineData[358] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[362] = 0;
  _$jscoverage['/loader/utils.js'].lineData[366] = 0;
  _$jscoverage['/loader/utils.js'].lineData[377] = 0;
  _$jscoverage['/loader/utils.js'].lineData[378] = 0;
  _$jscoverage['/loader/utils.js'].lineData[380] = 0;
  _$jscoverage['/loader/utils.js'].lineData[383] = 0;
  _$jscoverage['/loader/utils.js'].lineData[384] = 0;
  _$jscoverage['/loader/utils.js'].lineData[389] = 0;
  _$jscoverage['/loader/utils.js'].lineData[390] = 0;
  _$jscoverage['/loader/utils.js'].lineData[392] = 0;
  _$jscoverage['/loader/utils.js'].lineData[403] = 0;
  _$jscoverage['/loader/utils.js'].lineData[405] = 0;
  _$jscoverage['/loader/utils.js'].lineData[408] = 0;
  _$jscoverage['/loader/utils.js'].lineData[409] = 0;
  _$jscoverage['/loader/utils.js'].lineData[410] = 0;
  _$jscoverage['/loader/utils.js'].lineData[414] = 0;
  _$jscoverage['/loader/utils.js'].lineData[416] = 0;
  _$jscoverage['/loader/utils.js'].lineData[420] = 0;
  _$jscoverage['/loader/utils.js'].lineData[426] = 0;
  _$jscoverage['/loader/utils.js'].lineData[435] = 0;
  _$jscoverage['/loader/utils.js'].lineData[437] = 0;
  _$jscoverage['/loader/utils.js'].lineData[438] = 0;
  _$jscoverage['/loader/utils.js'].lineData[441] = 0;
  _$jscoverage['/loader/utils.js'].lineData[445] = 0;
  _$jscoverage['/loader/utils.js'].lineData[446] = 0;
  _$jscoverage['/loader/utils.js'].lineData[452] = 0;
  _$jscoverage['/loader/utils.js'].lineData[453] = 0;
  _$jscoverage['/loader/utils.js'].lineData[455] = 0;
  _$jscoverage['/loader/utils.js'].lineData[459] = 0;
  _$jscoverage['/loader/utils.js'].lineData[464] = 0;
  _$jscoverage['/loader/utils.js'].lineData[465] = 0;
  _$jscoverage['/loader/utils.js'].lineData[467] = 0;
  _$jscoverage['/loader/utils.js'].lineData[468] = 0;
  _$jscoverage['/loader/utils.js'].lineData[471] = 0;
  _$jscoverage['/loader/utils.js'].lineData[475] = 0;
  _$jscoverage['/loader/utils.js'].lineData[476] = 0;
  _$jscoverage['/loader/utils.js'].lineData[479] = 0;
  _$jscoverage['/loader/utils.js'].lineData[480] = 0;
  _$jscoverage['/loader/utils.js'].lineData[481] = 0;
  _$jscoverage['/loader/utils.js'].lineData[482] = 0;
  _$jscoverage['/loader/utils.js'].lineData[483] = 0;
  _$jscoverage['/loader/utils.js'].lineData[486] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
  _$jscoverage['/loader/utils.js'].functionData[24] = 0;
  _$jscoverage['/loader/utils.js'].functionData[25] = 0;
  _$jscoverage['/loader/utils.js'].functionData[26] = 0;
  _$jscoverage['/loader/utils.js'].functionData[27] = 0;
  _$jscoverage['/loader/utils.js'].functionData[28] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['31'] = [];
  _$jscoverage['/loader/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['37'] = [];
  _$jscoverage['/loader/utils.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['46'] = [];
  _$jscoverage['/loader/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['54'] = [];
  _$jscoverage['/loader/utils.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['60'] = [];
  _$jscoverage['/loader/utils.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['76'] = [];
  _$jscoverage['/loader/utils.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['88'] = [];
  _$jscoverage['/loader/utils.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['92'] = [];
  _$jscoverage['/loader/utils.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['93'] = [];
  _$jscoverage['/loader/utils.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['101'] = [];
  _$jscoverage['/loader/utils.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['131'] = [];
  _$jscoverage['/loader/utils.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['169'] = [];
  _$jscoverage['/loader/utils.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['173'] = [];
  _$jscoverage['/loader/utils.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['173'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['175'] = [];
  _$jscoverage['/loader/utils.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['196'] = [];
  _$jscoverage['/loader/utils.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['203'] = [];
  _$jscoverage['/loader/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['205'] = [];
  _$jscoverage['/loader/utils.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['210'] = [];
  _$jscoverage['/loader/utils.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['211'] = [];
  _$jscoverage['/loader/utils.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['221'] = [];
  _$jscoverage['/loader/utils.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['224'] = [];
  _$jscoverage['/loader/utils.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['228'] = [];
  _$jscoverage['/loader/utils.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['232'] = [];
  _$jscoverage['/loader/utils.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['235'] = [];
  _$jscoverage['/loader/utils.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['238'] = [];
  _$jscoverage['/loader/utils.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['239'] = [];
  _$jscoverage['/loader/utils.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['247'] = [];
  _$jscoverage['/loader/utils.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['266'] = [];
  _$jscoverage['/loader/utils.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['269'] = [];
  _$jscoverage['/loader/utils.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['284'] = [];
  _$jscoverage['/loader/utils.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['291'] = [];
  _$jscoverage['/loader/utils.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['298'] = [];
  _$jscoverage['/loader/utils.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['316'] = [];
  _$jscoverage['/loader/utils.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['354'] = [];
  _$jscoverage['/loader/utils.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['355'] = [];
  _$jscoverage['/loader/utils.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['357'] = [];
  _$jscoverage['/loader/utils.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['358'] = [];
  _$jscoverage['/loader/utils.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['378'] = [];
  _$jscoverage['/loader/utils.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['380'] = [];
  _$jscoverage['/loader/utils.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['383'] = [];
  _$jscoverage['/loader/utils.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['389'] = [];
  _$jscoverage['/loader/utils.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['408'] = [];
  _$jscoverage['/loader/utils.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['437'] = [];
  _$jscoverage['/loader/utils.js'].branchData['437'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['445'] = [];
  _$jscoverage['/loader/utils.js'].branchData['445'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['467'] = [];
  _$jscoverage['/loader/utils.js'].branchData['467'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['480'] = [];
  _$jscoverage['/loader/utils.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['482'] = [];
  _$jscoverage['/loader/utils.js'].branchData['482'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['482'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['482'][2].init(70, 24, 'module.status !== status');
function visit517_482_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['482'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['482'][1].init(59, 35, '!module || module.status !== status');
function visit516_482_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['482'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['480'][1].init(140, 19, 'i < modNames.length');
function visit515_480_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['467'][1].init(56, 43, 'm = str.match(/^\\s*["\']([^\'"\\s]+)["\']\\s*$/)');
function visit514_467_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['445'][1].init(21, 9, 'mode || 0');
function visit513_445_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['437'][1].init(85, 8, '--i > -1');
function visit512_437_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['437'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['408'][2].init(151, 28, 'module.factory !== undefined');
function visit511_408_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['408'][1].init(141, 38, 'module && module.factory !== undefined');
function visit510_408_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['389'][1].init(522, 10, 'refModName');
function visit509_389_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['383'][1].init(143, 11, 'modNames[i]');
function visit508_383_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['380'][1].init(84, 5, 'i < l');
function visit507_380_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['378'][1].init(51, 8, 'modNames');
function visit506_378_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['358'][1].init(34, 9, '!alias[j]');
function visit505_358_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['357'][1].init(86, 6, 'j >= 0');
function visit504_357_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['355'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit503_355_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['354'][1].init(68, 6, 'i >= 0');
function visit502_354_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['316'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit501_316_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['298'][1].init(386, 21, 'exports !== undefined');
function visit500_298_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['291'][1].init(196, 29, 'typeof factory === \'function\'');
function visit499_291_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['284'][1].init(18, 32, 'module.status != READY_TO_ATTACH');
function visit498_284_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['269'][1].init(232, 5, 'm.cjs');
function visit497_269_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['266'][1].init(153, 18, 'status == ATTACHED');
function visit496_266_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['247'][1].init(1001, 108, 'Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit495_247_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['239'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit494_239_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['238'][1].init(674, 9, '\'@DEBUG@\'');
function visit493_238_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['235'][1].init(574, 16, 'status != LOADED');
function visit492_235_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['232'][1].init(466, 25, 'status >= READY_TO_ATTACH');
function visit491_232_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['228'][1].init(331, 15, 'status == ERROR');
function visit490_228_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['224'][1].init(213, 2, '!m');
function visit489_224_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['221'][1].init(121, 16, 'modName in cache');
function visit488_221_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['211'][1].init(22, 81, 's && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit487_211_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['210'][1].init(340, 5, 'i < l');
function visit486_210_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['205'][1].init(176, 11, 'cache || {}');
function visit485_205_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['203'][1].init(77, 11, 'stack || []');
function visit484_203_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['196'][1].init(84, 5, 'i < l');
function visit483_196_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['175'][1].init(295, 5, 'allOk');
function visit482_175_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][3].init(88, 20, 'm.status == ATTACHED');
function visit481_173_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit480_173_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit479_173_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['169'][2].init(81, 25, 'module.getType() != \'css\'');
function visit478_169_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['169'][1].init(70, 36, '!module || module.getType() != \'css\'');
function visit477_169_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['131'][1].init(150, 6, 'module');
function visit476_131_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['101'][1].init(476, 5, 'i < l');
function visit475_101_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['93'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit474_93_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['92'][1].init(126, 26, 'typeof depName == \'string\'');
function visit473_92_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['88'][1].init(47, 8, '!depName');
function visit472_88_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['76'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit471_76_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['60'][1].init(26, 12, 'Plugin.alias');
function visit470_60_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['54'][1].init(54, 11, 'index != -1');
function visit469_54_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['46'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit468_46_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['37'][1].init(103, 5, 'i < l');
function visit467_37_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['31'][1].init(14, 20, 'typeof s == \'string\'');
function visit466_31_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, TRUE = !0, FALSE = !1, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, READY_TO_ATTACH = data.READY_TO_ATTACH, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[30]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[31]++;
    if (visit466_31_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[34]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[37]++;
      for (; visit467_37_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[38]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[40]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[44]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[46]++;
    if (visit468_46_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[47]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[49]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[52]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[53]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[54]++;
    if (visit469_54_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[55]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[56]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[57]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[60]++;
  if (visit470_60_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[62]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[67]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[70]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[76]++;
  return visit471_76_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[86]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[88]++;
  if (visit472_88_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[89]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[92]++;
  if (visit473_92_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[93]++;
    if (visit474_93_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[95]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[98]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[101]++;
  for (l = depName.length; visit475_101_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[102]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[104]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[113]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[114]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[126]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[128]++;
  var mods = runtime.Env.mods, module = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[131]++;
  if (visit476_131_1(module)) {
    _$jscoverage['/loader/utils.js'].lineData[132]++;
    return module;
  }
  _$jscoverage['/loader/utils.js'].lineData[136]++;
  mods[modName] = module = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[141]++;
  return module;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[151]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[161]++;
  var mods = [runtime], module, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[167]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[168]++;
  module = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[169]++;
  if (visit477_169_1(!module || visit478_169_2(module.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[170]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[171]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[172]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[173]++;
  return visit479_173_1(a && visit480_173_2(m && visit481_173_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[175]++;
    if (visit482_175_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[176]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[178]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[181]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[185]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[194]++;
  var i, l = modNames.length;
  _$jscoverage['/loader/utils.js'].lineData[196]++;
  for (i = 0; visit483_196_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[197]++;
    Utils.attachModRecursively(modNames[i], runtime);
  }
}, 
  checkModsLoadRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[203]++;
  stack = visit484_203_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[205]++;
  cache = visit485_205_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[206]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[210]++;
  for (i = 0; visit486_210_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[211]++;
    s = visit487_211_1(s && Utils.checkModLoadRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[212]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[214]++;
  return !!s;
}, 
  checkModLoadRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[218]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[221]++;
  if (visit488_221_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[222]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[224]++;
  if (visit489_224_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[225]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[227]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[228]++;
  if (visit490_228_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[229]++;
    errorList.push(m);
    _$jscoverage['/loader/utils.js'].lineData[230]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[232]++;
  if (visit491_232_1(status >= READY_TO_ATTACH)) {
    _$jscoverage['/loader/utils.js'].lineData[233]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[235]++;
  if (visit492_235_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[236]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[238]++;
  if (visit493_238_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[239]++;
    if (visit494_239_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[240]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[241]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[242]++;
      return cache[modName] = FALSE;
    }
    _$jscoverage['/loader/utils.js'].lineData[244]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[247]++;
  if (visit495_247_1(Utils.checkModsLoadRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[249]++;
    m.status = READY_TO_ATTACH;
    _$jscoverage['/loader/utils.js'].lineData[250]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[253]++;
  return cache[modName] = FALSE;
}, 
  attachModRecursively: function(modName, runtime) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[262]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[265]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[266]++;
  if (visit496_266_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[267]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[269]++;
  if (visit497_269_1(m.cjs)) {
    _$jscoverage['/loader/utils.js'].lineData[271]++;
    Utils.attachMod(runtime, m);
  } else {
    _$jscoverage['/loader/utils.js'].lineData[273]++;
    Utils.attachModsRecursively(m.getNormalizedRequires(), runtime);
    _$jscoverage['/loader/utils.js'].lineData[274]++;
    Utils.attachMod(runtime, m);
  }
}, 
  attachMod: function(runtime, module) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[284]++;
  if (visit498_284_1(module.status != READY_TO_ATTACH)) {
    _$jscoverage['/loader/utils.js'].lineData[285]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[288]++;
  var factory = module.factory, exports = undefined;
  _$jscoverage['/loader/utils.js'].lineData[291]++;
  if (visit499_291_1(typeof factory === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[295]++;
    exports = factory.apply(module, (module.cjs ? [runtime] : Utils.getModules(runtime, module.getRequiresWithAlias())));
    _$jscoverage['/loader/utils.js'].lineData[298]++;
    if (visit500_298_1(exports !== undefined)) {
      _$jscoverage['/loader/utils.js'].lineData[300]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[304]++;
    module.exports = factory;
  }
  _$jscoverage['/loader/utils.js'].lineData[307]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[316]++;
  if (visit501_316_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[317]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[319]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[334]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[345]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[352]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[353]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[354]++;
    for (i = ret.length - 1; visit502_354_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[355]++;
      if (visit503_355_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[356]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[357]++;
        for (j = alias.length - 1; visit504_357_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[358]++;
          if (visit505_358_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[359]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[362]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[366]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[377]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[378]++;
  if (visit506_378_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[380]++;
    for (i = 0 , l = modNames.length; visit507_380_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[383]++;
      if (visit508_383_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[384]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[389]++;
  if (visit509_389_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[390]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[392]++;
  return ret;
}, 
  registerModule: function(runtime, name, factory, config) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[403]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[405]++;
  var mods = runtime.Env.mods, module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[408]++;
  if (visit510_408_1(module && visit511_408_2(module.factory !== undefined))) {
    _$jscoverage['/loader/utils.js'].lineData[409]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[410]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[414]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[416]++;
  module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[420]++;
  S.mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/loader/utils.js'].lineData[426]++;
  S.mix(module, config);
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[24]++;
  _$jscoverage['/loader/utils.js'].lineData[435]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[437]++;
  for (i = str.length; visit512_437_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[438]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[441]++;
  return hash + '';
}, 
  getRequiresFromFn: function(fn, mode) {
  _$jscoverage['/loader/utils.js'].functionData[25]++;
  _$jscoverage['/loader/utils.js'].lineData[445]++;
  mode = visit513_445_1(mode || 0);
  _$jscoverage['/loader/utils.js'].lineData[446]++;
  var requires = [];
  _$jscoverage['/loader/utils.js'].lineData[452]++;
  fn.toString().replace(commentRegExp, '').replace(requireRegExp[mode], function(match, dep) {
  _$jscoverage['/loader/utils.js'].functionData[26]++;
  _$jscoverage['/loader/utils.js'].lineData[453]++;
  requires.push(getRequireVal(dep));
});
  _$jscoverage['/loader/utils.js'].lineData[455]++;
  return requires;
}});
  _$jscoverage['/loader/utils.js'].lineData[459]++;
  var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, requireRegExp = [/[^.'"]\s*module.require\s*\((.+)\);/g, /[^.'"]\s*KISSY.require\s*\((.+)\);/g];
  _$jscoverage['/loader/utils.js'].lineData[464]++;
  function getRequireVal(str) {
    _$jscoverage['/loader/utils.js'].functionData[27]++;
    _$jscoverage['/loader/utils.js'].lineData[465]++;
    var m;
    _$jscoverage['/loader/utils.js'].lineData[467]++;
    if (visit514_467_1(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
      _$jscoverage['/loader/utils.js'].lineData[468]++;
      return m[1];
    } else {
      _$jscoverage['/loader/utils.js'].lineData[471]++;
      return new Function('return (' + str + ')')();
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[475]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[28]++;
    _$jscoverage['/loader/utils.js'].lineData[476]++;
    var mods = runtime.Env.mods, module, i;
    _$jscoverage['/loader/utils.js'].lineData[479]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[480]++;
    for (i = 0; visit515_480_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[481]++;
      module = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[482]++;
      if (visit516_482_1(!module || visit517_482_2(module.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[483]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[486]++;
    return 1;
  }
})(KISSY);
