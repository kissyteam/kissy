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
if (! _$jscoverage['/editor/selectionFix.js']) {
  _$jscoverage['/editor/selectionFix.js'] = {};
  _$jscoverage['/editor/selectionFix.js'].lineData = [];
  _$jscoverage['/editor/selectionFix.js'].lineData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[14] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[16] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[28] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[35] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[36] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[38] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[39] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[42] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[45] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[49] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[50] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[53] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[54] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[56] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[57] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[58] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[62] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[63] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[66] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[68] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[70] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[72] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[73] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[76] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[79] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[82] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[88] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[91] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[92] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[95] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[96] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[99] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[101] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[102] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[104] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[105] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[107] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[108] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[115] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[116] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[124] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[129] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[130] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[131] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[132] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[143] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[152] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[157] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[160] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[161] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[181] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[182] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[185] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[186] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[191] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[193] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[196] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[197] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[203] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[207] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[210] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[211] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[214] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[217] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[218] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[223] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[224] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[250] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[252] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[254] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[255] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[256] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[260] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[262] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[263] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[276] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[281] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[282] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[284] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[286] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[291] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[292] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[297] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[299] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[302] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[306] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[307] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[309] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[310] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[311] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[312] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[317] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[321] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[323] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[326] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[338] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[341] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[345] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[346] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[349] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[352] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[353] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[357] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[358] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[359] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[362] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[363] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[369] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[371] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[379] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[381] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[382] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[383] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[384] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[385] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[389] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[395] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[396] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[398] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[407] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[411] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[412] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[416] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[417] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[418] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[420] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[421] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[427] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[428] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[429] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[431] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[432] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[434] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[435] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[437] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[440] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[446] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[448] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[455] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[460] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[462] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[464] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[465] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[466] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[467] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[473] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[475] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[477] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[478] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[479] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[481] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[483] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[484] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[485] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[486] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[487] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[488] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[489] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[490] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[491] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[499] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].functionData) {
  _$jscoverage['/editor/selectionFix.js'].functionData = [];
  _$jscoverage['/editor/selectionFix.js'].functionData[0] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[1] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[2] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[3] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[4] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[5] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[6] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[7] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[8] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[9] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[10] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[11] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[12] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[13] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[14] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[15] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[16] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[17] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[18] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[19] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[20] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[21] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[22] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[23] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[24] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[25] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[26] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[27] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[28] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[29] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[30] = 0;
  _$jscoverage['/editor/selectionFix.js'].functionData[31] = 0;
}
if (! _$jscoverage['/editor/selectionFix.js'].branchData) {
  _$jscoverage['/editor/selectionFix.js'].branchData = {};
  _$jscoverage['/editor/selectionFix.js'].branchData['53'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['66'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['70'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['72'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['90'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['91'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['95'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['102'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['125'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['131'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['185'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['191'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['196'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['217'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['262'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['264'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['264'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['265'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['276'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['281'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['293'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['294'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['295'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['299'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['353'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['353'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['359'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['363'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['375'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['383'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['389'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['395'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['397'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['404'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['416'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['417'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['421'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['425'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['427'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['429'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['429'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['430'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['435'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['436'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['436'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['464'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['466'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['466'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['477'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['477'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['483'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['486'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['486'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['487'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['487'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['487'][1].init(179, 6, '!range');
function visit821_487_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['486'][1].init(108, 37, 'selection && selection.getRanges()[0]');
function visit820_486_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['486'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['483'][1].init(149, 16, 'UA.ieMode === 11');
function visit819_483_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['477'][1].init(84, 18, 'document.selection');
function visit818_477_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['477'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['466'][1].init(98, 6, '!UA.ie');
function visit817_466_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['466'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['464'][1].init(4141, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit816_464_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['436'][2].init(149, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit815_436_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['436'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['436'][1].init(42, 81, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit814_436_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['435'][1].init(104, 124, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit813_435_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['430'][2].init(141, 49, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE');
function visit812_430_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['430'][1].init(38, 83, 'element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit811_430_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['430'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['429'][1].init(100, 122, 'element && element[0].nodeType === Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit810_429_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['429'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['427'][1].init(80, 28, 'isBlankParagraph(fixedBlock)');
function visit809_427_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['425'][1].init(216, 35, 'fixedBlock[0] !== body[0].lastChild');
function visit808_425_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['421'][1].init(210, 252, 'fixedBlock && fixedBlock[0] !== body[0].lastChild');
function visit807_421_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['417'][1].init(21, 42, 'range.startContainer.nodeName() === \'html\'');
function visit806_417_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['416'][1].init(1869, 32, 'blockLimit.nodeName() === \'body\'');
function visit805_416_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][2].init(1749, 30, '!range.collapsed || path.block');
function visit804_411_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['411'][1].init(1739, 40, '!range || !range.collapsed || path.block');
function visit803_411_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['404'][2].init(461, 30, 'pathBlock.nodeName() !== \'pre\'');
function visit802_404_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['404'][1].init(130, 121, 'pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit801_404_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][4].init(344, 26, 'lastNode[0].nodeType === 1');
function visit800_402_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][3].init(344, 59, 'lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit799_402_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][2].init(332, 71, 'lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()');
function visit798_402_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['402'][1].init(98, 252, '!(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit797_402_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][1].init(70, 351, 'pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit796_400_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][1].init(156, 422, 'pathBlock && pathBlock._4eIsBlockBoundary() && !(lastNode && lastNode[0].nodeType === 1 && lastNode._4eIsBlockBoundary()) && pathBlock.nodeName() !== \'pre\' && !pathBlock._4eGetBogus()');
function visit795_398_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['397'][1].init(77, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit794_397_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][1].init(33, 29, 'path.block || path.blockLimit');
function visit793_396_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['395'][1].init(1049, 8, 'UA.gecko');
function visit792_395_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['389'][1].init(779, 18, 'blockLimit || body');
function visit791_389_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['389'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['383'][1].init(198, 5, 'range');
function visit790_383_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][1].init(419, 8, '!body[0]');
function visit789_379_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['375'][1].init(189, 37, 'selection && selection.getRanges()[0]');
function visit788_375_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['363'][1].init(20, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit787_363_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['359'][1].init(60, 64, 'element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit786_359_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['353'][2].init(45, 19, 'node.nodeType !== 8');
function visit785_353_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['353'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['353'][1].init(20, 44, 'isNotWhitespace(node) && node.nodeType !== 8');
function visit784_353_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['299'][1].init(1837, 33, 'nativeSel && sel.getRanges()[0]');
function visit783_299_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['295'][1].init(64, 108, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit782_295_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['294'][1].init(62, 173, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit781_294_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['293'][1].init(53, 236, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit780_293_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][4].init(1468, 28, 'nativeSel.type !== \'Control\'');
function visit779_292_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][3].init(1468, 290, 'nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit778_292_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][2].init(1450, 308, 'nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit777_292_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['292'][1].init(1437, 321, 'nativeSel && nativeSel.type && nativeSel.type !== \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit776_292_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['281'][1].init(276, 39, '!doc.queryCommandEnabled(\'InsertImage\')');
function visit775_281_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['276'][3].init(714, 27, 'type === KES.SELECTION_NONE');
function visit774_276_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['276'][2].init(701, 40, 'nativeSel && type === KES.SELECTION_NONE');
function visit773_276_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['276'][1].init(691, 50, 'testIt && nativeSel && type === KES.SELECTION_NONE');
function visit772_276_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['265'][1].init(113, 20, 'sel && doc.selection');
function visit771_265_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['264'][1].init(59, 20, 'sel && sel.getType()');
function visit770_264_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['264'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['262'][1].init(56, 11, 'saveEnabled');
function visit769_262_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['217'][1].init(178, 17, 'evt.relatedTarget');
function visit768_217_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['196'][1].init(119, 14, 'restoreEnabled');
function visit767_196_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['191'][1].init(364, 10, 'savedRange');
function visit766_191_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['185'][1].init(200, 23, 't.nodeName() !== \'body\'');
function visit765_185_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['131'][1].init(67, 23, 't.nodeName() === \'html\'');
function visit764_131_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['125'][1].init(30, 15, 'S.UA.ieMode < 8');
function visit763_125_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['102'][1].init(506, 8, 'startRng');
function visit762_102_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['95'][1].init(228, 37, 'html.scrollHeight > html.clientHeight');
function visit761_95_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['91'][1].init(21, 7, 'started');
function visit760_91_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['90'][1].init(61, 17, 'e.target === html');
function visit759_90_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['72'][1].init(119, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit758_72_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['70'][1].init(133, 8, 'pointRng');
function visit757_70_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['66'][1].init(94, 8, 'e.button');
function visit756_66_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][3].init(165, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit755_53_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][2].init(152, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit754_53_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][1].init(140, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit753_53_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/editor/selectionFix.js'].functionData[0]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[11]++;
  var Editor = require('./base');
  _$jscoverage['/editor/selectionFix.js'].lineData[12]++;
  require('./selection');
  _$jscoverage['/editor/selectionFix.js'].lineData[13]++;
  var KERange = require('./range');
  _$jscoverage['/editor/selectionFix.js'].lineData[14]++;
  var Node = require('node');
  _$jscoverage['/editor/selectionFix.js'].lineData[16]++;
  var TRUE = true, FALSE = false, NULL = null, UA = S.UA, Dom = S.DOM, KES = Editor.SelectionType;
  _$jscoverage['/editor/selectionFix.js'].lineData[27]++;
  function fixCursorForIE(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[1]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[28]++;
    var started, win = editor.get('window')[0], $doc = editor.get('document'), doc = $doc[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[35]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[36]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[38]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[39]++;
        rng.moveToPoint(x, y);
      }      catch (ex) {
  _$jscoverage['/editor/selectionFix.js'].lineData[42]++;
  rng = NULL;
}
      _$jscoverage['/editor/selectionFix.js'].lineData[45]++;
      return rng;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[49]++;
    function endSelection() {
      _$jscoverage['/editor/selectionFix.js'].functionData[3]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[50]++;
      var rng = doc.selection.createRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[53]++;
      if (visit753_53_1(startRng && visit754_53_2(!rng.item && visit755_53_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[54]++;
        startRng.select();
      }
      _$jscoverage['/editor/selectionFix.js'].lineData[56]++;
      $doc.detach('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[57]++;
      $doc.detach('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[58]++;
      startRng = started = 0;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[62]++;
    function selectionChange(e) {
      _$jscoverage['/editor/selectionFix.js'].functionData[4]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[63]++;
      var pointRng;
      _$jscoverage['/editor/selectionFix.js'].lineData[66]++;
      if (visit756_66_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[68]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[70]++;
        if (visit757_70_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
          if (visit758_72_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[73]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[76]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[79]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[82]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[88]++;
    $doc.on('mousedown contextmenu', function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
  if (visit759_90_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[91]++;
    if (visit760_91_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[92]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[95]++;
    if (visit761_95_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[96]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[99]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[101]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[102]++;
    if (visit762_102_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[104]++;
      $doc.on('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[105]++;
      $doc.on('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[107]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[108]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[115]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[116]++;
    var doc = editor.get('document')[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[124]++;
    if (visit763_125_1(S.UA.ieMode < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[129]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[130]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[131]++;
  if (visit764_131_1(t.nodeName() === 'html')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[132]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[143]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[152]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[157]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[160]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[161]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[181]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[182]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[185]++;
  if (visit765_185_1(t.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[186]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[191]++;
  if (visit766_191_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[193]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[196]++;
      if (visit767_196_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[197]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[203]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[207]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[210]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[211]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[214]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[217]++;
  if (visit768_217_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[218]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[223]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[224]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[250]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[252]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[254]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[255]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[256]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[260]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[262]++;
      if (visit769_262_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[263]++;
        var sel = editor.getSelection(), type = visit770_264_1(sel && sel.getType()), nativeSel = visit771_265_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[276]++;
        if (visit772_276_1(testIt && visit773_276_2(nativeSel && visit774_276_3(type === KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[281]++;
          if (visit775_281_1(!doc.queryCommandEnabled('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[282]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[284]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[286]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[291]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[292]++;
        if (visit776_292_1(nativeSel && visit777_292_2(nativeSel.type && visit778_292_3(visit779_292_4(nativeSel.type !== 'Control') && visit780_293_1((parentTag = nativeSel.createRange()) && visit781_294_1((parentTag = parentTag.parentElement()) && visit782_295_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[297]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[299]++;
        savedRange = visit783_299_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[302]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[306]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[307]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[309]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[310]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[311]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[312]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[317]++;
  function fireSelectionChangeForStandard(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[321]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[323]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[326]++;
    editor.get('document').on('mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[338]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[341]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[345]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[346]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[349]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[352]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[353]++;
  return visit784_353_1(isNotWhitespace(node) && visit785_353_2(node.nodeType !== 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[357]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[358]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[359]++;
      return visit786_359_1(element._4eIsBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[362]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[363]++;
      return visit787_363_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[369]++;
    editor.on('selectionChange', function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[371]++;
  var path = ev.path, editorDoc = editor.get('document')[0], body = new Node(editorDoc.body), selection = ev.selection, range = visit788_375_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[379]++;
  if (visit789_379_1(!body[0])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[381]++;
    editorDoc.documentElement.appendChild(editorDoc.createElement('body'));
    _$jscoverage['/editor/selectionFix.js'].lineData[382]++;
    body = new Node(editorDoc.body);
    _$jscoverage['/editor/selectionFix.js'].lineData[383]++;
    if (visit790_383_1(range)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[384]++;
      range.setStart(body, 0);
      _$jscoverage['/editor/selectionFix.js'].lineData[385]++;
      range.collapse(1);
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[389]++;
  blockLimit = visit791_389_1(blockLimit || body);
  _$jscoverage['/editor/selectionFix.js'].lineData[395]++;
  if (visit792_395_1(UA.gecko)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[396]++;
    var pathBlock = visit793_396_1(path.block || path.blockLimit), lastNode = visit794_397_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[398]++;
    if (visit795_398_1(pathBlock && visit796_400_1(pathBlock._4eIsBlockBoundary() && visit797_402_1(!(visit798_402_2(lastNode && visit799_402_3(visit800_402_4(lastNode[0].nodeType === 1) && lastNode._4eIsBlockBoundary()))) && visit801_404_1(visit802_404_2(pathBlock.nodeName() !== 'pre') && !pathBlock._4eGetBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[407]++;
      pathBlock._4eAppendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[411]++;
  if (visit803_411_1(!range || visit804_411_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[412]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[416]++;
  if (visit805_416_1(blockLimit.nodeName() === 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[417]++;
    if (visit806_417_1(range.startContainer.nodeName() === 'html')) {
      _$jscoverage['/editor/selectionFix.js'].lineData[418]++;
      range.setStart(body, 0);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[420]++;
    var fixedBlock = range.fixBlock(TRUE, 'p');
    _$jscoverage['/editor/selectionFix.js'].lineData[421]++;
    if (visit807_421_1(fixedBlock && visit808_425_1(fixedBlock[0] !== body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[427]++;
      if (visit809_427_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[428]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[429]++;
        if (visit810_429_1(element && visit811_430_1(visit812_430_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[431]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[432]++;
          fixedBlock._4eRemove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[434]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[435]++;
          if (visit813_435_1(element && visit814_436_1(visit815_436_2(element[0].nodeType === Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[437]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[440]++;
            fixedBlock._4eRemove();
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[446]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[448]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[455]++;
  var doc = editor.get('document')[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[460]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[462]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[464]++;
  if (visit816_464_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[465]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[466]++;
    if (visit817_466_1(!UA.ie)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[467]++;
      editBlock._4eAppendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[473]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[475]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[477]++;
  if (visit818_477_1(document.selection)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[478]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[479]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[481]++;
    fireSelectionChangeForStandard(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[483]++;
    if (visit819_483_1(UA.ieMode === 11)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[484]++;
      editor.get('document').on('focusin', function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[31]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[485]++;
  var selection = editor.getSelection();
  _$jscoverage['/editor/selectionFix.js'].lineData[486]++;
  var range = visit820_486_1(selection && selection.getRanges()[0]);
  _$jscoverage['/editor/selectionFix.js'].lineData[487]++;
  if (visit821_487_1(!range)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[488]++;
    range = new KERange(this);
    _$jscoverage['/editor/selectionFix.js'].lineData[489]++;
    range.setStart(Node.all(e.target), 0);
    _$jscoverage['/editor/selectionFix.js'].lineData[490]++;
    range.collapse(1);
    _$jscoverage['/editor/selectionFix.js'].lineData[491]++;
    range.select();
  }
});
    }
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[499]++;
  monitorSelectionChange(editor);
}};
});
