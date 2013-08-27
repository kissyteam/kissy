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
if (! _$jscoverage['/base/attribute.js']) {
  _$jscoverage['/base/attribute.js'] = {};
  _$jscoverage['/base/attribute.js'].lineData = [];
  _$jscoverage['/base/attribute.js'].lineData[6] = 0;
  _$jscoverage['/base/attribute.js'].lineData[9] = 0;
  _$jscoverage['/base/attribute.js'].lineData[11] = 0;
  _$jscoverage['/base/attribute.js'].lineData[13] = 0;
  _$jscoverage['/base/attribute.js'].lineData[15] = 0;
  _$jscoverage['/base/attribute.js'].lineData[16] = 0;
  _$jscoverage['/base/attribute.js'].lineData[17] = 0;
  _$jscoverage['/base/attribute.js'].lineData[19] = 0;
  _$jscoverage['/base/attribute.js'].lineData[22] = 0;
  _$jscoverage['/base/attribute.js'].lineData[23] = 0;
  _$jscoverage['/base/attribute.js'].lineData[27] = 0;
  _$jscoverage['/base/attribute.js'].lineData[28] = 0;
  _$jscoverage['/base/attribute.js'].lineData[29] = 0;
  _$jscoverage['/base/attribute.js'].lineData[44] = 0;
  _$jscoverage['/base/attribute.js'].lineData[45] = 0;
  _$jscoverage['/base/attribute.js'].lineData[46] = 0;
  _$jscoverage['/base/attribute.js'].lineData[47] = 0;
  _$jscoverage['/base/attribute.js'].lineData[49] = 0;
  _$jscoverage['/base/attribute.js'].lineData[52] = 0;
  _$jscoverage['/base/attribute.js'].lineData[65] = 0;
  _$jscoverage['/base/attribute.js'].lineData[69] = 0;
  _$jscoverage['/base/attribute.js'].lineData[76] = 0;
  _$jscoverage['/base/attribute.js'].lineData[82] = 0;
  _$jscoverage['/base/attribute.js'].lineData[83] = 0;
  _$jscoverage['/base/attribute.js'].lineData[86] = 0;
  _$jscoverage['/base/attribute.js'].lineData[88] = 0;
  _$jscoverage['/base/attribute.js'].lineData[94] = 0;
  _$jscoverage['/base/attribute.js'].lineData[95] = 0;
  _$jscoverage['/base/attribute.js'].lineData[97] = 0;
  _$jscoverage['/base/attribute.js'].lineData[98] = 0;
  _$jscoverage['/base/attribute.js'].lineData[99] = 0;
  _$jscoverage['/base/attribute.js'].lineData[101] = 0;
  _$jscoverage['/base/attribute.js'].lineData[102] = 0;
  _$jscoverage['/base/attribute.js'].lineData[104] = 0;
  _$jscoverage['/base/attribute.js'].lineData[107] = 0;
  _$jscoverage['/base/attribute.js'].lineData[110] = 0;
  _$jscoverage['/base/attribute.js'].lineData[111] = 0;
  _$jscoverage['/base/attribute.js'].lineData[113] = 0;
  _$jscoverage['/base/attribute.js'].lineData[114] = 0;
  _$jscoverage['/base/attribute.js'].lineData[115] = 0;
  _$jscoverage['/base/attribute.js'].lineData[118] = 0;
  _$jscoverage['/base/attribute.js'].lineData[124] = 0;
  _$jscoverage['/base/attribute.js'].lineData[125] = 0;
  _$jscoverage['/base/attribute.js'].lineData[126] = 0;
  _$jscoverage['/base/attribute.js'].lineData[127] = 0;
  _$jscoverage['/base/attribute.js'].lineData[128] = 0;
  _$jscoverage['/base/attribute.js'].lineData[130] = 0;
  _$jscoverage['/base/attribute.js'].lineData[132] = 0;
  _$jscoverage['/base/attribute.js'].lineData[134] = 0;
  _$jscoverage['/base/attribute.js'].lineData[137] = 0;
  _$jscoverage['/base/attribute.js'].lineData[138] = 0;
  _$jscoverage['/base/attribute.js'].lineData[139] = 0;
  _$jscoverage['/base/attribute.js'].lineData[140] = 0;
  _$jscoverage['/base/attribute.js'].lineData[142] = 0;
  _$jscoverage['/base/attribute.js'].lineData[143] = 0;
  _$jscoverage['/base/attribute.js'].lineData[144] = 0;
  _$jscoverage['/base/attribute.js'].lineData[149] = 0;
  _$jscoverage['/base/attribute.js'].lineData[150] = 0;
  _$jscoverage['/base/attribute.js'].lineData[156] = 0;
  _$jscoverage['/base/attribute.js'].lineData[157] = 0;
  _$jscoverage['/base/attribute.js'].lineData[158] = 0;
  _$jscoverage['/base/attribute.js'].lineData[160] = 0;
  _$jscoverage['/base/attribute.js'].lineData[162] = 0;
  _$jscoverage['/base/attribute.js'].lineData[163] = 0;
  _$jscoverage['/base/attribute.js'].lineData[168] = 0;
  _$jscoverage['/base/attribute.js'].lineData[169] = 0;
  _$jscoverage['/base/attribute.js'].lineData[170] = 0;
  _$jscoverage['/base/attribute.js'].lineData[171] = 0;
  _$jscoverage['/base/attribute.js'].lineData[172] = 0;
  _$jscoverage['/base/attribute.js'].lineData[176] = 0;
  _$jscoverage['/base/attribute.js'].lineData[178] = 0;
  _$jscoverage['/base/attribute.js'].lineData[189] = 0;
  _$jscoverage['/base/attribute.js'].lineData[190] = 0;
  _$jscoverage['/base/attribute.js'].lineData[191] = 0;
  _$jscoverage['/base/attribute.js'].lineData[194] = 0;
  _$jscoverage['/base/attribute.js'].lineData[195] = 0;
  _$jscoverage['/base/attribute.js'].lineData[199] = 0;
  _$jscoverage['/base/attribute.js'].lineData[202] = 0;
  _$jscoverage['/base/attribute.js'].lineData[204] = 0;
  _$jscoverage['/base/attribute.js'].lineData[205] = 0;
  _$jscoverage['/base/attribute.js'].lineData[207] = 0;
  _$jscoverage['/base/attribute.js'].lineData[216] = 0;
  _$jscoverage['/base/attribute.js'].lineData[218] = 0;
  _$jscoverage['/base/attribute.js'].lineData[219] = 0;
  _$jscoverage['/base/attribute.js'].lineData[223] = 0;
  _$jscoverage['/base/attribute.js'].lineData[224] = 0;
  _$jscoverage['/base/attribute.js'].lineData[225] = 0;
  _$jscoverage['/base/attribute.js'].lineData[226] = 0;
  _$jscoverage['/base/attribute.js'].lineData[227] = 0;
  _$jscoverage['/base/attribute.js'].lineData[234] = 0;
  _$jscoverage['/base/attribute.js'].lineData[242] = 0;
  _$jscoverage['/base/attribute.js'].lineData[269] = 0;
  _$jscoverage['/base/attribute.js'].lineData[273] = 0;
  _$jscoverage['/base/attribute.js'].lineData[281] = 0;
  _$jscoverage['/base/attribute.js'].lineData[289] = 0;
  _$jscoverage['/base/attribute.js'].lineData[293] = 0;
  _$jscoverage['/base/attribute.js'].lineData[294] = 0;
  _$jscoverage['/base/attribute.js'].lineData[296] = 0;
  _$jscoverage['/base/attribute.js'].lineData[317] = 0;
  _$jscoverage['/base/attribute.js'].lineData[321] = 0;
  _$jscoverage['/base/attribute.js'].lineData[322] = 0;
  _$jscoverage['/base/attribute.js'].lineData[324] = 0;
  _$jscoverage['/base/attribute.js'].lineData[326] = 0;
  _$jscoverage['/base/attribute.js'].lineData[336] = 0;
  _$jscoverage['/base/attribute.js'].lineData[337] = 0;
  _$jscoverage['/base/attribute.js'].lineData[338] = 0;
  _$jscoverage['/base/attribute.js'].lineData[340] = 0;
  _$jscoverage['/base/attribute.js'].lineData[341] = 0;
  _$jscoverage['/base/attribute.js'].lineData[343] = 0;
  _$jscoverage['/base/attribute.js'].lineData[352] = 0;
  _$jscoverage['/base/attribute.js'].lineData[360] = 0;
  _$jscoverage['/base/attribute.js'].lineData[362] = 0;
  _$jscoverage['/base/attribute.js'].lineData[363] = 0;
  _$jscoverage['/base/attribute.js'].lineData[364] = 0;
  _$jscoverage['/base/attribute.js'].lineData[367] = 0;
  _$jscoverage['/base/attribute.js'].lineData[381] = 0;
  _$jscoverage['/base/attribute.js'].lineData[382] = 0;
  _$jscoverage['/base/attribute.js'].lineData[383] = 0;
  _$jscoverage['/base/attribute.js'].lineData[384] = 0;
  _$jscoverage['/base/attribute.js'].lineData[385] = 0;
  _$jscoverage['/base/attribute.js'].lineData[389] = 0;
  _$jscoverage['/base/attribute.js'].lineData[392] = 0;
  _$jscoverage['/base/attribute.js'].lineData[393] = 0;
  _$jscoverage['/base/attribute.js'].lineData[396] = 0;
  _$jscoverage['/base/attribute.js'].lineData[397] = 0;
  _$jscoverage['/base/attribute.js'].lineData[398] = 0;
  _$jscoverage['/base/attribute.js'].lineData[400] = 0;
  _$jscoverage['/base/attribute.js'].lineData[402] = 0;
  _$jscoverage['/base/attribute.js'].lineData[403] = 0;
  _$jscoverage['/base/attribute.js'].lineData[405] = 0;
  _$jscoverage['/base/attribute.js'].lineData[409] = 0;
  _$jscoverage['/base/attribute.js'].lineData[410] = 0;
  _$jscoverage['/base/attribute.js'].lineData[411] = 0;
  _$jscoverage['/base/attribute.js'].lineData[412] = 0;
  _$jscoverage['/base/attribute.js'].lineData[413] = 0;
  _$jscoverage['/base/attribute.js'].lineData[415] = 0;
  _$jscoverage['/base/attribute.js'].lineData[416] = 0;
  _$jscoverage['/base/attribute.js'].lineData[425] = 0;
  _$jscoverage['/base/attribute.js'].lineData[427] = 0;
  _$jscoverage['/base/attribute.js'].lineData[429] = 0;
  _$jscoverage['/base/attribute.js'].lineData[431] = 0;
  _$jscoverage['/base/attribute.js'].lineData[432] = 0;
  _$jscoverage['/base/attribute.js'].lineData[433] = 0;
  _$jscoverage['/base/attribute.js'].lineData[435] = 0;
  _$jscoverage['/base/attribute.js'].lineData[437] = 0;
  _$jscoverage['/base/attribute.js'].lineData[446] = 0;
  _$jscoverage['/base/attribute.js'].lineData[456] = 0;
  _$jscoverage['/base/attribute.js'].lineData[457] = 0;
  _$jscoverage['/base/attribute.js'].lineData[460] = 0;
  _$jscoverage['/base/attribute.js'].lineData[461] = 0;
  _$jscoverage['/base/attribute.js'].lineData[464] = 0;
  _$jscoverage['/base/attribute.js'].lineData[465] = 0;
  _$jscoverage['/base/attribute.js'].lineData[469] = 0;
  _$jscoverage['/base/attribute.js'].lineData[471] = 0;
  _$jscoverage['/base/attribute.js'].lineData[480] = 0;
  _$jscoverage['/base/attribute.js'].lineData[487] = 0;
  _$jscoverage['/base/attribute.js'].lineData[488] = 0;
  _$jscoverage['/base/attribute.js'].lineData[489] = 0;
  _$jscoverage['/base/attribute.js'].lineData[492] = 0;
  _$jscoverage['/base/attribute.js'].lineData[493] = 0;
  _$jscoverage['/base/attribute.js'].lineData[497] = 0;
  _$jscoverage['/base/attribute.js'].lineData[502] = 0;
  _$jscoverage['/base/attribute.js'].lineData[503] = 0;
  _$jscoverage['/base/attribute.js'].lineData[506] = 0;
  _$jscoverage['/base/attribute.js'].lineData[507] = 0;
  _$jscoverage['/base/attribute.js'].lineData[510] = 0;
  _$jscoverage['/base/attribute.js'].lineData[511] = 0;
  _$jscoverage['/base/attribute.js'].lineData[514] = 0;
  _$jscoverage['/base/attribute.js'].lineData[526] = 0;
  _$jscoverage['/base/attribute.js'].lineData[528] = 0;
  _$jscoverage['/base/attribute.js'].lineData[529] = 0;
  _$jscoverage['/base/attribute.js'].lineData[531] = 0;
  _$jscoverage['/base/attribute.js'].lineData[534] = 0;
  _$jscoverage['/base/attribute.js'].lineData[538] = 0;
  _$jscoverage['/base/attribute.js'].lineData[541] = 0;
  _$jscoverage['/base/attribute.js'].lineData[545] = 0;
  _$jscoverage['/base/attribute.js'].lineData[546] = 0;
  _$jscoverage['/base/attribute.js'].lineData[549] = 0;
  _$jscoverage['/base/attribute.js'].lineData[550] = 0;
  _$jscoverage['/base/attribute.js'].lineData[555] = 0;
  _$jscoverage['/base/attribute.js'].lineData[556] = 0;
  _$jscoverage['/base/attribute.js'].lineData[561] = 0;
  _$jscoverage['/base/attribute.js'].lineData[562] = 0;
  _$jscoverage['/base/attribute.js'].lineData[563] = 0;
  _$jscoverage['/base/attribute.js'].lineData[567] = 0;
  _$jscoverage['/base/attribute.js'].lineData[569] = 0;
  _$jscoverage['/base/attribute.js'].lineData[570] = 0;
  _$jscoverage['/base/attribute.js'].lineData[573] = 0;
  _$jscoverage['/base/attribute.js'].lineData[576] = 0;
  _$jscoverage['/base/attribute.js'].lineData[577] = 0;
  _$jscoverage['/base/attribute.js'].lineData[579] = 0;
  _$jscoverage['/base/attribute.js'].lineData[581] = 0;
  _$jscoverage['/base/attribute.js'].lineData[582] = 0;
  _$jscoverage['/base/attribute.js'].lineData[584] = 0;
  _$jscoverage['/base/attribute.js'].lineData[585] = 0;
  _$jscoverage['/base/attribute.js'].lineData[586] = 0;
  _$jscoverage['/base/attribute.js'].lineData[588] = 0;
  _$jscoverage['/base/attribute.js'].lineData[591] = 0;
  _$jscoverage['/base/attribute.js'].lineData[592] = 0;
  _$jscoverage['/base/attribute.js'].lineData[594] = 0;
  _$jscoverage['/base/attribute.js'].lineData[595] = 0;
  _$jscoverage['/base/attribute.js'].lineData[598] = 0;
  _$jscoverage['/base/attribute.js'].lineData[601] = 0;
}
if (! _$jscoverage['/base/attribute.js'].functionData) {
  _$jscoverage['/base/attribute.js'].functionData = [];
  _$jscoverage['/base/attribute.js'].functionData[0] = 0;
  _$jscoverage['/base/attribute.js'].functionData[1] = 0;
  _$jscoverage['/base/attribute.js'].functionData[2] = 0;
  _$jscoverage['/base/attribute.js'].functionData[3] = 0;
  _$jscoverage['/base/attribute.js'].functionData[4] = 0;
  _$jscoverage['/base/attribute.js'].functionData[5] = 0;
  _$jscoverage['/base/attribute.js'].functionData[6] = 0;
  _$jscoverage['/base/attribute.js'].functionData[7] = 0;
  _$jscoverage['/base/attribute.js'].functionData[8] = 0;
  _$jscoverage['/base/attribute.js'].functionData[9] = 0;
  _$jscoverage['/base/attribute.js'].functionData[10] = 0;
  _$jscoverage['/base/attribute.js'].functionData[11] = 0;
  _$jscoverage['/base/attribute.js'].functionData[12] = 0;
  _$jscoverage['/base/attribute.js'].functionData[13] = 0;
  _$jscoverage['/base/attribute.js'].functionData[14] = 0;
  _$jscoverage['/base/attribute.js'].functionData[15] = 0;
  _$jscoverage['/base/attribute.js'].functionData[16] = 0;
  _$jscoverage['/base/attribute.js'].functionData[17] = 0;
  _$jscoverage['/base/attribute.js'].functionData[18] = 0;
  _$jscoverage['/base/attribute.js'].functionData[19] = 0;
  _$jscoverage['/base/attribute.js'].functionData[20] = 0;
  _$jscoverage['/base/attribute.js'].functionData[21] = 0;
  _$jscoverage['/base/attribute.js'].functionData[22] = 0;
  _$jscoverage['/base/attribute.js'].functionData[23] = 0;
  _$jscoverage['/base/attribute.js'].functionData[24] = 0;
  _$jscoverage['/base/attribute.js'].functionData[25] = 0;
  _$jscoverage['/base/attribute.js'].functionData[26] = 0;
  _$jscoverage['/base/attribute.js'].functionData[27] = 0;
  _$jscoverage['/base/attribute.js'].functionData[28] = 0;
}
if (! _$jscoverage['/base/attribute.js'].branchData) {
  _$jscoverage['/base/attribute.js'].branchData = {};
  _$jscoverage['/base/attribute.js'].branchData['16'] = [];
  _$jscoverage['/base/attribute.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['28'] = [];
  _$jscoverage['/base/attribute.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['46'] = [];
  _$jscoverage['/base/attribute.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['49'] = [];
  _$jscoverage['/base/attribute.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['84'] = [];
  _$jscoverage['/base/attribute.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['84'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['84'][3] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['97'] = [];
  _$jscoverage['/base/attribute.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['98'] = [];
  _$jscoverage['/base/attribute.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['101'] = [];
  _$jscoverage['/base/attribute.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['113'] = [];
  _$jscoverage['/base/attribute.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['126'] = [];
  _$jscoverage['/base/attribute.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['127'] = [];
  _$jscoverage['/base/attribute.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['139'] = [];
  _$jscoverage['/base/attribute.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['162'] = [];
  _$jscoverage['/base/attribute.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['168'] = [];
  _$jscoverage['/base/attribute.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['169'] = [];
  _$jscoverage['/base/attribute.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['169'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['171'] = [];
  _$jscoverage['/base/attribute.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['189'] = [];
  _$jscoverage['/base/attribute.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['190'] = [];
  _$jscoverage['/base/attribute.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['194'] = [];
  _$jscoverage['/base/attribute.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['204'] = [];
  _$jscoverage['/base/attribute.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['218'] = [];
  _$jscoverage['/base/attribute.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['223'] = [];
  _$jscoverage['/base/attribute.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['226'] = [];
  _$jscoverage['/base/attribute.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['321'] = [];
  _$jscoverage['/base/attribute.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['340'] = [];
  _$jscoverage['/base/attribute.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['362'] = [];
  _$jscoverage['/base/attribute.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['382'] = [];
  _$jscoverage['/base/attribute.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['384'] = [];
  _$jscoverage['/base/attribute.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['392'] = [];
  _$jscoverage['/base/attribute.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['396'] = [];
  _$jscoverage['/base/attribute.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['397'] = [];
  _$jscoverage['/base/attribute.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['415'] = [];
  _$jscoverage['/base/attribute.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['427'] = [];
  _$jscoverage['/base/attribute.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['431'] = [];
  _$jscoverage['/base/attribute.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['432'] = [];
  _$jscoverage['/base/attribute.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['456'] = [];
  _$jscoverage['/base/attribute.js'].branchData['456'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['460'] = [];
  _$jscoverage['/base/attribute.js'].branchData['460'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['464'] = [];
  _$jscoverage['/base/attribute.js'].branchData['464'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['487'] = [];
  _$jscoverage['/base/attribute.js'].branchData['487'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['502'] = [];
  _$jscoverage['/base/attribute.js'].branchData['502'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['506'] = [];
  _$jscoverage['/base/attribute.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['506'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['510'] = [];
  _$jscoverage['/base/attribute.js'].branchData['510'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['528'] = [];
  _$jscoverage['/base/attribute.js'].branchData['528'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['529'] = [];
  _$jscoverage['/base/attribute.js'].branchData['529'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['561'] = [];
  _$jscoverage['/base/attribute.js'].branchData['561'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['563'] = [];
  _$jscoverage['/base/attribute.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['584'] = [];
  _$jscoverage['/base/attribute.js'].branchData['584'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['591'] = [];
  _$jscoverage['/base/attribute.js'].branchData['591'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['594'] = [];
  _$jscoverage['/base/attribute.js'].branchData['594'][1] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['594'][2] = new BranchData();
  _$jscoverage['/base/attribute.js'].branchData['594'][3] = new BranchData();
}
_$jscoverage['/base/attribute.js'].branchData['594'][3].init(151, 10, 'e !== true');
function visit56_594_3(result) {
  _$jscoverage['/base/attribute.js'].branchData['594'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['594'][2].init(132, 15, 'e !== undefined');
function visit55_594_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['594'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['594'][1].init(132, 29, 'e !== undefined && e !== true');
function visit54_594_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['594'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['591'][1].init(443, 52, 'validator && (validator = normalFn(self, validator))');
function visit53_591_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['591'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['584'][1].init(179, 4, 'path');
function visit52_584_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['584'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['563'][1].init(55, 88, 'val !== undefined');
function visit51_563_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['561'][1].init(170, 40, 'valFn && (valFn = normalFn(self, valFn))');
function visit50_561_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['561'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['529'][1].init(22, 18, 'self.hasAttr(name)');
function visit49_529_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['529'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['528'][1].init(50, 23, 'typeof name == \'string\'');
function visit48_528_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['528'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['510'][1].init(977, 4, 'path');
function visit47_510_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['510'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['506'][2].init(883, 17, 'ret !== undefined');
function visit46_506_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['506'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['506'][1].init(860, 40, '!(name in attrVals) && ret !== undefined');
function visit45_506_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['502'][1].init(726, 43, 'getter && (getter = normalFn(self, getter))');
function visit44_502_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['502'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['487'][1].init(207, 24, 'name.indexOf(dot) !== -1');
function visit43_487_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['487'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['464'][1].init(718, 22, 'setValue !== undefined');
function visit42_464_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['464'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['460'][1].init(629, 20, 'setValue === INVALID');
function visit41_460_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['460'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['456'][1].init(488, 43, 'setter && (setter = normalFn(self, setter))');
function visit40_456_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['456'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['432'][1].init(22, 13, 'opts[\'error\']');
function visit39_432_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['431'][1].init(1857, 15, 'e !== undefined');
function visit38_431_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['427'][1].init(1748, 10, 'opts || {}');
function visit37_427_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['415'][1].init(1288, 16, 'attrNames.length');
function visit36_415_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['397'][1].init(26, 13, 'opts[\'error\']');
function visit35_397_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['396'][1].init(531, 13, 'errors.length');
function visit34_396_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['392'][1].init(132, 55, '(e = validate(self, name, all[name], all)) !== undefined');
function visit33_392_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['384'][1].init(56, 10, 'opts || {}');
function visit32_384_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['382'][1].init(48, 21, 'S.isPlainObject(name)');
function visit31_382_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['362'][1].init(50, 18, 'self.hasAttr(name)');
function visit30_362_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['340'][1].init(177, 13, 'initialValues');
function visit29_340_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['321'][1].init(156, 18, 'attr = attrs[name]');
function visit28_321_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['226'][1].init(159, 5, 'attrs');
function visit27_226_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['223'][1].init(530, 15, '!opts[\'silent\']');
function visit26_223_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['218'][1].init(433, 13, 'ret === FALSE');
function visit25_218_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['204'][1].init(62, 17, 'e.target !== this');
function visit24_204_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['194'][1].init(18, 79, 'FALSE === self.fire(whenAttrChangeEventName(\'before\', name), beforeEventObject)');
function visit23_194_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['190'][1].init(18, 52, 'FALSE === defaultSetFn.call(self, beforeEventObject)');
function visit22_190_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['189'][1].init(1073, 14, 'opts[\'silent\']');
function visit21_189_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['171'][2].init(116, 16, 'subVal === value');
function visit20_171_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['171'][1].init(108, 24, 'path && subVal === value');
function visit19_171_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['169'][2].init(27, 17, 'prevVal === value');
function visit18_169_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['169'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['169'][1].init(18, 26, '!path && prevVal === value');
function visit17_169_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['168'][1].init(485, 11, '!opts.force');
function visit16_168_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['162'][1].init(310, 4, 'path');
function visit15_162_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['139'][1].init(90, 22, 'defaultBeforeFns[name]');
function visit14_139_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['127'][1].init(18, 21, 'prevVal === undefined');
function visit13_127_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['126'][1].init(40, 4, 'path');
function visit12_126_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['113'][1].init(35, 24, 'name.indexOf(\'.\') !== -1');
function visit11_113_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['101'][1].init(111, 14, 'o != undefined');
function visit10_101_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['98'][1].init(30, 7, 'i < len');
function visit9_98_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['97'][1].init(70, 8, 'len >= 0');
function visit8_97_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['84'][3].init(17, 7, 'i < len');
function visit7_84_3(result) {
  _$jscoverage['/base/attribute.js'].branchData['84'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['84'][2].init(60, 14, 'o != undefined');
function visit6_84_2(result) {
  _$jscoverage['/base/attribute.js'].branchData['84'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['84'][1].init(48, 25, 'o != undefined && i < len');
function visit5_84_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['49'][1].init(130, 9, 'ret || {}');
function visit4_49_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['46'][1].init(44, 20, '!doNotCreate && !ret');
function visit3_46_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['28'][1].init(21, 16, 'attrName || name');
function visit2_28_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].branchData['16'][1].init(14, 25, 'typeof method == \'string\'');
function visit1_16_1(result) {
  _$jscoverage['/base/attribute.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/attribute.js'].lineData[6]++;
KISSY.add('base/attribute', function(S, CustomEvent, undefined) {
  _$jscoverage['/base/attribute.js'].functionData[0]++;
  _$jscoverage['/base/attribute.js'].lineData[9]++;
  Attribute.INVALID = {};
  _$jscoverage['/base/attribute.js'].lineData[11]++;
  var INVALID = Attribute.INVALID;
  _$jscoverage['/base/attribute.js'].lineData[13]++;
  var FALSE = false;
  _$jscoverage['/base/attribute.js'].lineData[15]++;
  function normalFn(host, method) {
    _$jscoverage['/base/attribute.js'].functionData[1]++;
    _$jscoverage['/base/attribute.js'].lineData[16]++;
    if (visit1_16_1(typeof method == 'string')) {
      _$jscoverage['/base/attribute.js'].lineData[17]++;
      return host[method];
    }
    _$jscoverage['/base/attribute.js'].lineData[19]++;
    return method;
  }
  _$jscoverage['/base/attribute.js'].lineData[22]++;
  function whenAttrChangeEventName(when, name) {
    _$jscoverage['/base/attribute.js'].functionData[2]++;
    _$jscoverage['/base/attribute.js'].lineData[23]++;
    return when + S.ucfirst(name) + 'Change';
  }
  _$jscoverage['/base/attribute.js'].lineData[27]++;
  function __fireAttrChange(self, when, name, prevVal, newVal, subAttrName, attrName, data) {
    _$jscoverage['/base/attribute.js'].functionData[3]++;
    _$jscoverage['/base/attribute.js'].lineData[28]++;
    attrName = visit2_28_1(attrName || name);
    _$jscoverage['/base/attribute.js'].lineData[29]++;
    return self.fire(whenAttrChangeEventName(when, name), S.mix({
  attrName: attrName, 
  subAttrName: subAttrName, 
  prevVal: prevVal, 
  newVal: newVal}, data));
  }
  _$jscoverage['/base/attribute.js'].lineData[44]++;
  function ensureNonEmpty(obj, name, doNotCreate) {
    _$jscoverage['/base/attribute.js'].functionData[4]++;
    _$jscoverage['/base/attribute.js'].lineData[45]++;
    var ret = obj[name];
    _$jscoverage['/base/attribute.js'].lineData[46]++;
    if (visit3_46_1(!doNotCreate && !ret)) {
      _$jscoverage['/base/attribute.js'].lineData[47]++;
      obj[name] = ret = {};
    }
    _$jscoverage['/base/attribute.js'].lineData[49]++;
    return visit4_49_1(ret || {});
  }
  _$jscoverage['/base/attribute.js'].lineData[52]++;
  function getAttrs(self) {
    _$jscoverage['/base/attribute.js'].functionData[5]++;
    _$jscoverage['/base/attribute.js'].lineData[65]++;
    return ensureNonEmpty(self, '__attrs');
  }
  _$jscoverage['/base/attribute.js'].lineData[69]++;
  function getAttrVals(self) {
    _$jscoverage['/base/attribute.js'].functionData[6]++;
    _$jscoverage['/base/attribute.js'].lineData[76]++;
    return ensureNonEmpty(self, '__attrVals');
  }
  _$jscoverage['/base/attribute.js'].lineData[82]++;
  function getValueByPath(o, path) {
    _$jscoverage['/base/attribute.js'].functionData[7]++;
    _$jscoverage['/base/attribute.js'].lineData[83]++;
    for (var i = 0, len = path.length; visit5_84_1(visit6_84_2(o != undefined) && visit7_84_3(i < len)); i++) {
      _$jscoverage['/base/attribute.js'].lineData[86]++;
      o = o[path[i]];
    }
    _$jscoverage['/base/attribute.js'].lineData[88]++;
    return o;
  }
  _$jscoverage['/base/attribute.js'].lineData[94]++;
  function setValueByPath(o, path, val) {
    _$jscoverage['/base/attribute.js'].functionData[8]++;
    _$jscoverage['/base/attribute.js'].lineData[95]++;
    var len = path.length - 1, s = o;
    _$jscoverage['/base/attribute.js'].lineData[97]++;
    if (visit8_97_1(len >= 0)) {
      _$jscoverage['/base/attribute.js'].lineData[98]++;
      for (var i = 0; visit9_98_1(i < len); i++) {
        _$jscoverage['/base/attribute.js'].lineData[99]++;
        o = o[path[i]];
      }
      _$jscoverage['/base/attribute.js'].lineData[101]++;
      if (visit10_101_1(o != undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[102]++;
        o[path[i]] = val;
      } else {
        _$jscoverage['/base/attribute.js'].lineData[104]++;
        s = undefined;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[107]++;
    return s;
  }
  _$jscoverage['/base/attribute.js'].lineData[110]++;
  function getPathNamePair(name) {
    _$jscoverage['/base/attribute.js'].functionData[9]++;
    _$jscoverage['/base/attribute.js'].lineData[111]++;
    var path;
    _$jscoverage['/base/attribute.js'].lineData[113]++;
    if (visit11_113_1(name.indexOf('.') !== -1)) {
      _$jscoverage['/base/attribute.js'].lineData[114]++;
      path = name.split('.');
      _$jscoverage['/base/attribute.js'].lineData[115]++;
      name = path.shift();
    }
    _$jscoverage['/base/attribute.js'].lineData[118]++;
    return {
  path: path, 
  name: name};
  }
  _$jscoverage['/base/attribute.js'].lineData[124]++;
  function getValueBySubValue(prevVal, path, value) {
    _$jscoverage['/base/attribute.js'].functionData[10]++;
    _$jscoverage['/base/attribute.js'].lineData[125]++;
    var tmp = value;
    _$jscoverage['/base/attribute.js'].lineData[126]++;
    if (visit12_126_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[127]++;
      if (visit13_127_1(prevVal === undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[128]++;
        tmp = {};
      } else {
        _$jscoverage['/base/attribute.js'].lineData[130]++;
        tmp = S.clone(prevVal);
      }
      _$jscoverage['/base/attribute.js'].lineData[132]++;
      setValueByPath(tmp, path, value);
    }
    _$jscoverage['/base/attribute.js'].lineData[134]++;
    return tmp;
  }
  _$jscoverage['/base/attribute.js'].lineData[137]++;
  function prepareDefaultSetFn(self, name) {
    _$jscoverage['/base/attribute.js'].functionData[11]++;
    _$jscoverage['/base/attribute.js'].lineData[138]++;
    var defaultBeforeFns = ensureNonEmpty(self, '__defaultBeforeFns');
    _$jscoverage['/base/attribute.js'].lineData[139]++;
    if (visit14_139_1(defaultBeforeFns[name])) {
      _$jscoverage['/base/attribute.js'].lineData[140]++;
      return;
    }
    _$jscoverage['/base/attribute.js'].lineData[142]++;
    defaultBeforeFns[name] = 1;
    _$jscoverage['/base/attribute.js'].lineData[143]++;
    var beforeChangeEventName = whenAttrChangeEventName('before', name);
    _$jscoverage['/base/attribute.js'].lineData[144]++;
    self.publish(beforeChangeEventName, {
  defaultFn: defaultSetFn});
  }
  _$jscoverage['/base/attribute.js'].lineData[149]++;
  function setInternal(self, name, value, opts, attrs) {
    _$jscoverage['/base/attribute.js'].functionData[12]++;
    _$jscoverage['/base/attribute.js'].lineData[150]++;
    var path, subVal, prevVal, pathNamePair = getPathNamePair(name), fullName = name;
    _$jscoverage['/base/attribute.js'].lineData[156]++;
    name = pathNamePair.name;
    _$jscoverage['/base/attribute.js'].lineData[157]++;
    path = pathNamePair.path;
    _$jscoverage['/base/attribute.js'].lineData[158]++;
    prevVal = self.get(name);
    _$jscoverage['/base/attribute.js'].lineData[160]++;
    prepareDefaultSetFn(self, name);
    _$jscoverage['/base/attribute.js'].lineData[162]++;
    if (visit15_162_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[163]++;
      subVal = getValueByPath(prevVal, path);
    }
    _$jscoverage['/base/attribute.js'].lineData[168]++;
    if (visit16_168_1(!opts.force)) {
      _$jscoverage['/base/attribute.js'].lineData[169]++;
      if (visit17_169_1(!path && visit18_169_2(prevVal === value))) {
        _$jscoverage['/base/attribute.js'].lineData[170]++;
        return undefined;
      } else {
        _$jscoverage['/base/attribute.js'].lineData[171]++;
        if (visit19_171_1(path && visit20_171_2(subVal === value))) {
          _$jscoverage['/base/attribute.js'].lineData[172]++;
          return undefined;
        }
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[176]++;
    value = getValueBySubValue(prevVal, path, value);
    _$jscoverage['/base/attribute.js'].lineData[178]++;
    var beforeEventObject = S.mix({
  attrName: name, 
  subAttrName: fullName, 
  prevVal: prevVal, 
  newVal: value, 
  _opts: opts, 
  _attrs: attrs, 
  target: self}, opts.data);
    _$jscoverage['/base/attribute.js'].lineData[189]++;
    if (visit21_189_1(opts['silent'])) {
      _$jscoverage['/base/attribute.js'].lineData[190]++;
      if (visit22_190_1(FALSE === defaultSetFn.call(self, beforeEventObject))) {
        _$jscoverage['/base/attribute.js'].lineData[191]++;
        return FALSE;
      }
    } else {
      _$jscoverage['/base/attribute.js'].lineData[194]++;
      if (visit23_194_1(FALSE === self.fire(whenAttrChangeEventName('before', name), beforeEventObject))) {
        _$jscoverage['/base/attribute.js'].lineData[195]++;
        return FALSE;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[199]++;
    return self;
  }
  _$jscoverage['/base/attribute.js'].lineData[202]++;
  function defaultSetFn(e) {
    _$jscoverage['/base/attribute.js'].functionData[13]++;
    _$jscoverage['/base/attribute.js'].lineData[204]++;
    if (visit24_204_1(e.target !== this)) {
      _$jscoverage['/base/attribute.js'].lineData[205]++;
      return undefined;
    }
    _$jscoverage['/base/attribute.js'].lineData[207]++;
    var self = this, value = e.newVal, prevVal = e.prevVal, name = e.attrName, fullName = e.subAttrName, attrs = e._attrs, opts = e._opts;
    _$jscoverage['/base/attribute.js'].lineData[216]++;
    var ret = self.setInternal(name, value);
    _$jscoverage['/base/attribute.js'].lineData[218]++;
    if (visit25_218_1(ret === FALSE)) {
      _$jscoverage['/base/attribute.js'].lineData[219]++;
      return ret;
    }
    _$jscoverage['/base/attribute.js'].lineData[223]++;
    if (visit26_223_1(!opts['silent'])) {
      _$jscoverage['/base/attribute.js'].lineData[224]++;
      value = getAttrVals(self)[name];
      _$jscoverage['/base/attribute.js'].lineData[225]++;
      __fireAttrChange(self, 'after', name, prevVal, value, fullName, null, opts.data);
      _$jscoverage['/base/attribute.js'].lineData[226]++;
      if (visit27_226_1(attrs)) {
        _$jscoverage['/base/attribute.js'].lineData[227]++;
        attrs.push({
  prevVal: prevVal, 
  newVal: value, 
  attrName: name, 
  subAttrName: fullName});
      } else {
        _$jscoverage['/base/attribute.js'].lineData[234]++;
        __fireAttrChange(self, '', '*', [prevVal], [value], [fullName], [name], opts.data);
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[242]++;
    return undefined;
  }
  _$jscoverage['/base/attribute.js'].lineData[269]++;
  function Attribute() {
    _$jscoverage['/base/attribute.js'].functionData[14]++;
  }
  _$jscoverage['/base/attribute.js'].lineData[273]++;
  S.augment(Attribute, CustomEvent.Target, {
  getAttrs: function() {
  _$jscoverage['/base/attribute.js'].functionData[15]++;
  _$jscoverage['/base/attribute.js'].lineData[281]++;
  return getAttrs(this);
}, 
  getAttrVals: function() {
  _$jscoverage['/base/attribute.js'].functionData[16]++;
  _$jscoverage['/base/attribute.js'].lineData[289]++;
  var self = this, o = {}, a, attrs = getAttrs(self);
  _$jscoverage['/base/attribute.js'].lineData[293]++;
  for (a in attrs) {
    _$jscoverage['/base/attribute.js'].lineData[294]++;
    o[a] = self.get(a);
  }
  _$jscoverage['/base/attribute.js'].lineData[296]++;
  return o;
}, 
  addAttr: function(name, attrConfig, override) {
  _$jscoverage['/base/attribute.js'].functionData[17]++;
  _$jscoverage['/base/attribute.js'].lineData[317]++;
  var self = this, attrs = getAttrs(self), attr, cfg = S.clone(attrConfig);
  _$jscoverage['/base/attribute.js'].lineData[321]++;
  if (visit28_321_1(attr = attrs[name])) {
    _$jscoverage['/base/attribute.js'].lineData[322]++;
    S.mix(attr, cfg, override);
  } else {
    _$jscoverage['/base/attribute.js'].lineData[324]++;
    attrs[name] = cfg;
  }
  _$jscoverage['/base/attribute.js'].lineData[326]++;
  return self;
}, 
  addAttrs: function(attrConfigs, initialValues) {
  _$jscoverage['/base/attribute.js'].functionData[18]++;
  _$jscoverage['/base/attribute.js'].lineData[336]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[337]++;
  S.each(attrConfigs, function(attrConfig, name) {
  _$jscoverage['/base/attribute.js'].functionData[19]++;
  _$jscoverage['/base/attribute.js'].lineData[338]++;
  self.addAttr(name, attrConfig);
});
  _$jscoverage['/base/attribute.js'].lineData[340]++;
  if (visit29_340_1(initialValues)) {
    _$jscoverage['/base/attribute.js'].lineData[341]++;
    self.set(initialValues);
  }
  _$jscoverage['/base/attribute.js'].lineData[343]++;
  return self;
}, 
  hasAttr: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[20]++;
  _$jscoverage['/base/attribute.js'].lineData[352]++;
  return getAttrs(this).hasOwnProperty(name);
}, 
  removeAttr: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[21]++;
  _$jscoverage['/base/attribute.js'].lineData[360]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[362]++;
  if (visit30_362_1(self.hasAttr(name))) {
    _$jscoverage['/base/attribute.js'].lineData[363]++;
    delete getAttrs(self)[name];
    _$jscoverage['/base/attribute.js'].lineData[364]++;
    delete getAttrVals(self)[name];
  }
  _$jscoverage['/base/attribute.js'].lineData[367]++;
  return self;
}, 
  set: function(name, value, opts) {
  _$jscoverage['/base/attribute.js'].functionData[22]++;
  _$jscoverage['/base/attribute.js'].lineData[381]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[382]++;
  if (visit31_382_1(S.isPlainObject(name))) {
    _$jscoverage['/base/attribute.js'].lineData[383]++;
    opts = value;
    _$jscoverage['/base/attribute.js'].lineData[384]++;
    opts = visit32_384_1(opts || {});
    _$jscoverage['/base/attribute.js'].lineData[385]++;
    var all = Object(name), attrs = [], e, errors = [];
    _$jscoverage['/base/attribute.js'].lineData[389]++;
    for (name in all) {
      _$jscoverage['/base/attribute.js'].lineData[392]++;
      if (visit33_392_1((e = validate(self, name, all[name], all)) !== undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[393]++;
        errors.push(e);
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[396]++;
    if (visit34_396_1(errors.length)) {
      _$jscoverage['/base/attribute.js'].lineData[397]++;
      if (visit35_397_1(opts['error'])) {
        _$jscoverage['/base/attribute.js'].lineData[398]++;
        opts['error'](errors);
      }
      _$jscoverage['/base/attribute.js'].lineData[400]++;
      return FALSE;
    }
    _$jscoverage['/base/attribute.js'].lineData[402]++;
    for (name in all) {
      _$jscoverage['/base/attribute.js'].lineData[403]++;
      setInternal(self, name, all[name], opts, attrs);
    }
    _$jscoverage['/base/attribute.js'].lineData[405]++;
    var attrNames = [], prevVals = [], newVals = [], subAttrNames = [];
    _$jscoverage['/base/attribute.js'].lineData[409]++;
    S.each(attrs, function(attr) {
  _$jscoverage['/base/attribute.js'].functionData[23]++;
  _$jscoverage['/base/attribute.js'].lineData[410]++;
  prevVals.push(attr.prevVal);
  _$jscoverage['/base/attribute.js'].lineData[411]++;
  newVals.push(attr.newVal);
  _$jscoverage['/base/attribute.js'].lineData[412]++;
  attrNames.push(attr.attrName);
  _$jscoverage['/base/attribute.js'].lineData[413]++;
  subAttrNames.push(attr.subAttrName);
});
    _$jscoverage['/base/attribute.js'].lineData[415]++;
    if (visit36_415_1(attrNames.length)) {
      _$jscoverage['/base/attribute.js'].lineData[416]++;
      __fireAttrChange(self, '', '*', prevVals, newVals, subAttrNames, attrNames, opts.data);
    }
    _$jscoverage['/base/attribute.js'].lineData[425]++;
    return self;
  }
  _$jscoverage['/base/attribute.js'].lineData[427]++;
  opts = visit37_427_1(opts || {});
  _$jscoverage['/base/attribute.js'].lineData[429]++;
  e = validate(self, name, value);
  _$jscoverage['/base/attribute.js'].lineData[431]++;
  if (visit38_431_1(e !== undefined)) {
    _$jscoverage['/base/attribute.js'].lineData[432]++;
    if (visit39_432_1(opts['error'])) {
      _$jscoverage['/base/attribute.js'].lineData[433]++;
      opts['error'](e);
    }
    _$jscoverage['/base/attribute.js'].lineData[435]++;
    return FALSE;
  }
  _$jscoverage['/base/attribute.js'].lineData[437]++;
  return setInternal(self, name, value, opts);
}, 
  setInternal: function(name, value) {
  _$jscoverage['/base/attribute.js'].functionData[24]++;
  _$jscoverage['/base/attribute.js'].lineData[446]++;
  var self = this, setValue = undefined, attrConfig = ensureNonEmpty(getAttrs(self), name), setter = attrConfig['setter'];
  _$jscoverage['/base/attribute.js'].lineData[456]++;
  if (visit40_456_1(setter && (setter = normalFn(self, setter)))) {
    _$jscoverage['/base/attribute.js'].lineData[457]++;
    setValue = setter.call(self, value, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[460]++;
  if (visit41_460_1(setValue === INVALID)) {
    _$jscoverage['/base/attribute.js'].lineData[461]++;
    return FALSE;
  }
  _$jscoverage['/base/attribute.js'].lineData[464]++;
  if (visit42_464_1(setValue !== undefined)) {
    _$jscoverage['/base/attribute.js'].lineData[465]++;
    value = setValue;
  }
  _$jscoverage['/base/attribute.js'].lineData[469]++;
  getAttrVals(self)[name] = value;
  _$jscoverage['/base/attribute.js'].lineData[471]++;
  return undefined;
}, 
  get: function(name) {
  _$jscoverage['/base/attribute.js'].functionData[25]++;
  _$jscoverage['/base/attribute.js'].lineData[480]++;
  var self = this, dot = '.', path, attrVals = getAttrVals(self), attrConfig, getter, ret;
  _$jscoverage['/base/attribute.js'].lineData[487]++;
  if (visit43_487_1(name.indexOf(dot) !== -1)) {
    _$jscoverage['/base/attribute.js'].lineData[488]++;
    path = name.split(dot);
    _$jscoverage['/base/attribute.js'].lineData[489]++;
    name = path.shift();
  }
  _$jscoverage['/base/attribute.js'].lineData[492]++;
  attrConfig = ensureNonEmpty(getAttrs(self), name, 1);
  _$jscoverage['/base/attribute.js'].lineData[493]++;
  getter = attrConfig['getter'];
  _$jscoverage['/base/attribute.js'].lineData[497]++;
  ret = name in attrVals ? attrVals[name] : getDefAttrVal(self, name);
  _$jscoverage['/base/attribute.js'].lineData[502]++;
  if (visit44_502_1(getter && (getter = normalFn(self, getter)))) {
    _$jscoverage['/base/attribute.js'].lineData[503]++;
    ret = getter.call(self, ret, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[506]++;
  if (visit45_506_1(!(name in attrVals) && visit46_506_2(ret !== undefined))) {
    _$jscoverage['/base/attribute.js'].lineData[507]++;
    attrVals[name] = ret;
  }
  _$jscoverage['/base/attribute.js'].lineData[510]++;
  if (visit47_510_1(path)) {
    _$jscoverage['/base/attribute.js'].lineData[511]++;
    ret = getValueByPath(ret, path);
  }
  _$jscoverage['/base/attribute.js'].lineData[514]++;
  return ret;
}, 
  reset: function(name, opts) {
  _$jscoverage['/base/attribute.js'].functionData[26]++;
  _$jscoverage['/base/attribute.js'].lineData[526]++;
  var self = this;
  _$jscoverage['/base/attribute.js'].lineData[528]++;
  if (visit48_528_1(typeof name == 'string')) {
    _$jscoverage['/base/attribute.js'].lineData[529]++;
    if (visit49_529_1(self.hasAttr(name))) {
      _$jscoverage['/base/attribute.js'].lineData[531]++;
      return self.set(name, getDefAttrVal(self, name), opts);
    } else {
      _$jscoverage['/base/attribute.js'].lineData[534]++;
      return self;
    }
  }
  _$jscoverage['/base/attribute.js'].lineData[538]++;
  opts = (name);
  _$jscoverage['/base/attribute.js'].lineData[541]++;
  var attrs = getAttrs(self), values = {};
  _$jscoverage['/base/attribute.js'].lineData[545]++;
  for (name in attrs) {
    _$jscoverage['/base/attribute.js'].lineData[546]++;
    values[name] = getDefAttrVal(self, name);
  }
  _$jscoverage['/base/attribute.js'].lineData[549]++;
  self.set(values, opts);
  _$jscoverage['/base/attribute.js'].lineData[550]++;
  return self;
}});
  _$jscoverage['/base/attribute.js'].lineData[555]++;
  function getDefAttrVal(self, name) {
    _$jscoverage['/base/attribute.js'].functionData[27]++;
    _$jscoverage['/base/attribute.js'].lineData[556]++;
    var attrs = getAttrs(self), attrConfig = ensureNonEmpty(attrs, name, 1), valFn = attrConfig.valueFn, val;
    _$jscoverage['/base/attribute.js'].lineData[561]++;
    if (visit50_561_1(valFn && (valFn = normalFn(self, valFn)))) {
      _$jscoverage['/base/attribute.js'].lineData[562]++;
      val = valFn.call(self);
      _$jscoverage['/base/attribute.js'].lineData[563]++;
      if (visit51_563_1(val !== undefined)) {
        _$jscoverage['/base/attribute.js'].lineData[567]++;
        attrConfig.value = val;
      }
      _$jscoverage['/base/attribute.js'].lineData[569]++;
      delete attrConfig.valueFn;
      _$jscoverage['/base/attribute.js'].lineData[570]++;
      attrs[name] = attrConfig;
    }
    _$jscoverage['/base/attribute.js'].lineData[573]++;
    return attrConfig.value;
  }
  _$jscoverage['/base/attribute.js'].lineData[576]++;
  function validate(self, name, value, all) {
    _$jscoverage['/base/attribute.js'].functionData[28]++;
    _$jscoverage['/base/attribute.js'].lineData[577]++;
    var path, prevVal, pathNamePair;
    _$jscoverage['/base/attribute.js'].lineData[579]++;
    pathNamePair = getPathNamePair(name);
    _$jscoverage['/base/attribute.js'].lineData[581]++;
    name = pathNamePair.name;
    _$jscoverage['/base/attribute.js'].lineData[582]++;
    path = pathNamePair.path;
    _$jscoverage['/base/attribute.js'].lineData[584]++;
    if (visit52_584_1(path)) {
      _$jscoverage['/base/attribute.js'].lineData[585]++;
      prevVal = self.get(name);
      _$jscoverage['/base/attribute.js'].lineData[586]++;
      value = getValueBySubValue(prevVal, path, value);
    }
    _$jscoverage['/base/attribute.js'].lineData[588]++;
    var attrConfig = ensureNonEmpty(getAttrs(self), name), e, validator = attrConfig['validator'];
    _$jscoverage['/base/attribute.js'].lineData[591]++;
    if (visit53_591_1(validator && (validator = normalFn(self, validator)))) {
      _$jscoverage['/base/attribute.js'].lineData[592]++;
      e = validator.call(self, value, name, all);
      _$jscoverage['/base/attribute.js'].lineData[594]++;
      if (visit54_594_1(visit55_594_2(e !== undefined) && visit56_594_3(e !== true))) {
        _$jscoverage['/base/attribute.js'].lineData[595]++;
        return e;
      }
    }
    _$jscoverage['/base/attribute.js'].lineData[598]++;
    return undefined;
  }
  _$jscoverage['/base/attribute.js'].lineData[601]++;
  return Attribute;
}, {
  requires: ['event/custom']});
