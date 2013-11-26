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
  _$jscoverage['/editor/selectionFix.js'].lineData[75] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[77] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[80] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[86] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[87] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[88] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[89] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[90] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[93] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[94] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[97] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[99] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[100] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[102] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[103] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[105] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[106] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[113] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[114] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[122] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[127] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[128] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[129] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[130] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[141] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[150] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[155] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[158] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[159] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[179] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[180] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[183] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[184] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[188] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[190] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[193] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[194] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[200] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[204] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[207] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[208] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[211] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[214] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[215] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[219] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[220] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[244] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[246] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[248] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[250] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[251] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[252] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[256] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[258] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[259] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[272] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[277] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[278] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[280] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[282] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[287] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[288] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[293] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[295] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[298] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[302] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[303] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[305] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[306] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[307] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[308] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[313] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[317] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[319] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[322] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[334] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[337] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[341] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[342] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[345] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[348] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[349] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[353] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[354] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[355] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[358] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[359] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[365] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[367] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[375] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[377] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[378] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[379] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[380] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[381] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[385] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[391] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[392] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[394] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[403] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[407] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[408] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[412] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[413] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[414] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[416] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[417] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[423] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[424] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[425] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[427] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[428] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[430] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[431] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[433] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[436] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[443] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[445] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[452] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[457] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[459] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[461] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[462] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[463] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[464] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[470] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[472] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[474] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[475] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[476] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[478] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[480] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[481] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[482] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[483] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[484] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[485] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[486] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[487] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[488] = 0;
  _$jscoverage['/editor/selectionFix.js'].lineData[496] = 0;
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
  _$jscoverage['/editor/selectionFix.js'].branchData['88'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['89'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['93'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['100'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['123'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['129'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['183'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['188'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['193'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['214'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['258'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['260'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['261'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['277'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['289'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['290'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['291'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['295'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['349'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['349'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['355'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['359'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['371'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['375'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['379'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['385'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['391'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['392'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['393'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['394'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['396'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][3] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][4] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['407'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['407'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['412'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['413'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['417'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['421'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['423'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['425'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['426'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['426'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['426'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['431'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['432'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['432'][2] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['461'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['461'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['463'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['463'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['474'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['474'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['480'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['480'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['483'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['483'][1] = new BranchData();
  _$jscoverage['/editor/selectionFix.js'].branchData['484'] = [];
  _$jscoverage['/editor/selectionFix.js'].branchData['484'][1] = new BranchData();
}
_$jscoverage['/editor/selectionFix.js'].branchData['484'][1].init(179, 6, '!range');
function visit819_484_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['484'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['483'][1].init(108, 37, 'selection && selection.getRanges()[0]');
function visit818_483_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['483'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['480'][1].init(149, 15, 'UA.ieMode == 11');
function visit817_480_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['480'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['474'][1].init(84, 14, 'UA.ieMode < 11');
function visit816_474_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['474'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['463'][1].init(98, 9, '!UA[\'ie\']');
function visit815_463_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['463'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['461'][1].init(4184, 41, 'lastPath.blockLimit.nodeName() !== \'body\'');
function visit814_461_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['461'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['432'][2].init(149, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit813_432_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['432'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['432'][1].init(42, 80, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit812_432_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['431'][1].init(104, 123, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit811_431_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['426'][2].init(141, 48, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit810_426_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['426'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['426'][1].init(38, 82, 'element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit809_426_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['426'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['425'][1].init(100, 121, 'element && element[0].nodeType == Dom.NodeType.ELEMENT_NODE && !cannotCursorPlaced[element]');
function visit808_425_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['423'][1].init(80, 28, 'isBlankParagraph(fixedBlock)');
function visit807_423_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['423'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['421'][1].init(216, 34, 'fixedBlock[0] != body[0].lastChild');
function visit806_421_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['417'][1].init(209, 251, 'fixedBlock && fixedBlock[0] != body[0].lastChild');
function visit805_417_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['413'][1].init(21, 41, 'range.startContainer.nodeName() == \'html\'');
function visit804_413_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['412'][1].init(1874, 31, 'blockLimit.nodeName() == "body"');
function visit803_412_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['407'][2].init(1754, 30, '!range.collapsed || path.block');
function visit802_407_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['407'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['407'][1].init(1744, 40, '!range || !range.collapsed || path.block');
function visit801_407_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][2].init(462, 29, 'pathBlock.nodeName() != \'pre\'');
function visit800_400_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['400'][1].init(130, 121, 'pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit799_400_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][4].init(345, 25, 'lastNode[0].nodeType == 1');
function visit798_398_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][3].init(345, 59, 'lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit797_398_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][2].init(333, 71, 'lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()');
function visit796_398_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['398'][1].init(99, 252, '!(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit795_398_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['396'][1].init(70, 352, 'pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit794_396_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['396'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['394'][1].init(156, 423, 'pathBlock && pathBlock._4e_isBlockBoundary() && !(lastNode && lastNode[0].nodeType == 1 && lastNode._4e_isBlockBoundary()) && pathBlock.nodeName() != \'pre\' && !pathBlock._4e_getBogus()');
function visit793_394_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['393'][1].init(77, 39, 'pathBlock && pathBlock.last(isNotEmpty)');
function visit792_393_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['392'][1].init(33, 29, 'path.block || path.blockLimit');
function visit791_392_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['391'][1].init(1049, 11, 'UA[\'gecko\']');
function visit790_391_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['385'][1].init(779, 18, 'blockLimit || body');
function visit789_385_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['379'][1].init(198, 5, 'range');
function visit788_379_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['379'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['375'][1].init(419, 8, '!body[0]');
function visit787_375_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['371'][1].init(189, 37, 'selection && selection.getRanges()[0]');
function visit786_371_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['359'][1].init(20, 44, 'isNotWhitespace(node) && isNotBookmark(node)');
function visit785_359_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['355'][1].init(60, 65, 'element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]');
function visit784_355_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['349'][2].init(45, 18, 'node.nodeType != 8');
function visit783_349_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['349'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['349'][1].init(20, 43, 'isNotWhitespace(node) && node.nodeType != 8');
function visit782_349_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['295'][1].init(1838, 33, 'nativeSel && sel.getRanges()[0]');
function visit781_295_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['291'][1].init(64, 108, '(parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit780_291_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['290'][1].init(62, 173, '(parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit779_290_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['289'][1].init(52, 236, '(parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit778_289_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][4].init(1470, 27, 'nativeSel.type != \'Control\'');
function visit777_288_4(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][4].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][3].init(1470, 289, 'nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit776_288_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][2].init(1452, 307, 'nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit775_288_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['288'][1].init(1439, 320, 'nativeSel && nativeSel.type && nativeSel.type != \'Control\' && (parentTag = nativeSel.createRange()) && (parentTag = parentTag.parentElement()) && (parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {\n  input: 1, \n  textarea: 1}');
function visit774_288_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['288'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['277'][1].init(276, 42, '!doc[\'queryCommandEnabled\'](\'InsertImage\')');
function visit773_277_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][3].init(714, 26, 'type == KES.SELECTION_NONE');
function visit772_272_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][2].init(701, 39, 'nativeSel && type == KES.SELECTION_NONE');
function visit771_272_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['272'][1].init(691, 49, 'testIt && nativeSel && type == KES.SELECTION_NONE');
function visit770_272_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['261'][1].init(113, 20, 'sel && doc.selection');
function visit769_261_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['260'][1].init(59, 20, 'sel && sel.getType()');
function visit768_260_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['258'][1].init(56, 11, 'saveEnabled');
function visit767_258_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['214'][1].init(178, 17, 'evt.relatedTarget');
function visit766_214_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['193'][1].init(119, 14, 'restoreEnabled');
function visit765_193_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['188'][1].init(347, 10, 'savedRange');
function visit764_188_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['183'][1].init(200, 22, 't.nodeName() != \'body\'');
function visit763_183_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['129'][1].init(67, 23, 't.nodeName() === "html"');
function visit762_129_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['123'][1].init(30, 15, 'S.UA.ieMode < 8');
function visit761_123_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['100'][1].init(506, 8, 'startRng');
function visit760_100_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['93'][1].init(228, 37, 'html.scrollHeight > html.clientHeight');
function visit759_93_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['89'][1].init(21, 7, 'started');
function visit758_89_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['88'][1].init(61, 17, 'e.target === html');
function visit757_88_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['72'][1].init(119, 55, 'pointRng.compareEndPoints(\'StartToStart\', startRng) > 0');
function visit756_72_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['70'][1].init(133, 8, 'pointRng');
function visit755_70_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['66'][1].init(94, 8, 'e.button');
function visit754_66_1(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][3].init(165, 45, 'rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit753_53_3(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][2].init(152, 58, '!rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit752_53_2(result) {
  _$jscoverage['/editor/selectionFix.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/selectionFix.js'].branchData['53'][1].init(140, 70, 'startRng && !rng.item && rng.compareEndPoints(\'StartToEnd\', rng) === 0');
function visit751_53_1(result) {
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
    var started, win = editor.get("window")[0], $doc = editor.get("document"), doc = $doc[0], startRng;
    _$jscoverage['/editor/selectionFix.js'].lineData[35]++;
    function rngFromPoint(x, y) {
      _$jscoverage['/editor/selectionFix.js'].functionData[2]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[36]++;
      var rng = doc.body.createTextRange();
      _$jscoverage['/editor/selectionFix.js'].lineData[38]++;
      try {
        _$jscoverage['/editor/selectionFix.js'].lineData[39]++;
        rng['moveToPoint'](x, y);
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
      if (visit751_53_1(startRng && visit752_53_2(!rng.item && visit753_53_3(rng.compareEndPoints('StartToEnd', rng) === 0)))) {
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
      if (visit754_66_1(e.button)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[68]++;
        pointRng = rngFromPoint(e.pageX, e.pageY);
        _$jscoverage['/editor/selectionFix.js'].lineData[70]++;
        if (visit755_70_1(pointRng)) {
          _$jscoverage['/editor/selectionFix.js'].lineData[72]++;
          if (visit756_72_1(pointRng.compareEndPoints('StartToStart', startRng) > 0)) {
            _$jscoverage['/editor/selectionFix.js'].lineData[73]++;
            pointRng.setEndPoint('StartToStart', startRng);
          } else {
            _$jscoverage['/editor/selectionFix.js'].lineData[75]++;
            pointRng.setEndPoint('EndToEnd', startRng);
          }
          _$jscoverage['/editor/selectionFix.js'].lineData[77]++;
          pointRng.select();
        }
      } else {
        _$jscoverage['/editor/selectionFix.js'].lineData[80]++;
        endSelection();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[86]++;
    $doc.on("mousedown contextmenu", function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[5]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[87]++;
  var html = doc.documentElement;
  _$jscoverage['/editor/selectionFix.js'].lineData[88]++;
  if (visit757_88_1(e.target === html)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[89]++;
    if (visit758_89_1(started)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[90]++;
      endSelection();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[93]++;
    if (visit759_93_1(html.scrollHeight > html.clientHeight)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[94]++;
      return;
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[97]++;
    started = 1;
    _$jscoverage['/editor/selectionFix.js'].lineData[99]++;
    startRng = rngFromPoint(e.pageX, e.pageY);
    _$jscoverage['/editor/selectionFix.js'].lineData[100]++;
    if (visit760_100_1(startRng)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[102]++;
      $doc.on('mouseup', endSelection);
      _$jscoverage['/editor/selectionFix.js'].lineData[103]++;
      $doc.on('mousemove', selectionChange);
      _$jscoverage['/editor/selectionFix.js'].lineData[105]++;
      win.focus();
      _$jscoverage['/editor/selectionFix.js'].lineData[106]++;
      startRng.select();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[113]++;
  function fixSelectionForIEWhenDocReady(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[6]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[114]++;
    var doc = editor.get("document")[0], body = new Node(doc.body), html = new Node(doc.documentElement);
    _$jscoverage['/editor/selectionFix.js'].lineData[122]++;
    if (visit761_123_1(S.UA.ieMode < 8)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[127]++;
      html.on('click', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[7]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[128]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[129]++;
  if (visit762_129_1(t.nodeName() === "html")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[130]++;
    editor.getSelection().getNative().createRange().select();
  }
});
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[141]++;
    var savedRange, saveEnabled, restoreEnabled = TRUE;
    _$jscoverage['/editor/selectionFix.js'].lineData[150]++;
    html.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[8]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[155]++;
  restoreEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[158]++;
    html.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[9]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[159]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[179]++;
    body.on('focusin', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[10]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[180]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor/selectionFix.js'].lineData[183]++;
  if (visit763_183_1(t.nodeName() != 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[184]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[188]++;
  if (visit764_188_1(savedRange)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[190]++;
    try {
      _$jscoverage['/editor/selectionFix.js'].lineData[193]++;
      if (visit765_193_1(restoreEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[194]++;
        savedRange.select();
      }
    }    catch (e) {
}
    _$jscoverage['/editor/selectionFix.js'].lineData[200]++;
    savedRange = NULL;
  }
});
    _$jscoverage['/editor/selectionFix.js'].lineData[204]++;
    body.on('focus', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[11]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[207]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[208]++;
  saveSelection();
});
    _$jscoverage['/editor/selectionFix.js'].lineData[211]++;
    body.on('beforedeactivate', function(evt) {
  _$jscoverage['/editor/selectionFix.js'].functionData[12]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[214]++;
  if (visit766_214_1(evt.relatedTarget)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[215]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[219]++;
  saveEnabled = FALSE;
  _$jscoverage['/editor/selectionFix.js'].lineData[220]++;
  restoreEnabled = TRUE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[244]++;
    body.on('mousedown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[13]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[246]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[248]++;
    body.on('mouseup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[14]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[250]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[251]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[15]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[252]++;
  saveSelection(TRUE);
}, 0);
});
    _$jscoverage['/editor/selectionFix.js'].lineData[256]++;
    function saveSelection(testIt) {
      _$jscoverage['/editor/selectionFix.js'].functionData[16]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[258]++;
      if (visit767_258_1(saveEnabled)) {
        _$jscoverage['/editor/selectionFix.js'].lineData[259]++;
        var sel = editor.getSelection(), type = visit768_260_1(sel && sel.getType()), nativeSel = visit769_261_1(sel && doc.selection);
        _$jscoverage['/editor/selectionFix.js'].lineData[272]++;
        if (visit770_272_1(testIt && visit771_272_2(nativeSel && visit772_272_3(type == KES.SELECTION_NONE)))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[277]++;
          if (visit773_277_1(!doc['queryCommandEnabled']('InsertImage'))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[278]++;
            setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[17]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[280]++;
  saveSelection(TRUE);
}, 50);
            _$jscoverage['/editor/selectionFix.js'].lineData[282]++;
            return;
          }
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[287]++;
        var parentTag;
        _$jscoverage['/editor/selectionFix.js'].lineData[288]++;
        if (visit774_288_1(nativeSel && visit775_288_2(nativeSel.type && visit776_288_3(visit777_288_4(nativeSel.type != 'Control') && visit778_289_1((parentTag = nativeSel.createRange()) && visit779_290_1((parentTag = parentTag.parentElement()) && visit780_291_1((parentTag = parentTag.nodeName) && parentTag.toLowerCase() in {
  input: 1, 
  textarea: 1}))))))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[293]++;
          return;
        }
        _$jscoverage['/editor/selectionFix.js'].lineData[295]++;
        savedRange = visit781_295_1(nativeSel && sel.getRanges()[0]);
        _$jscoverage['/editor/selectionFix.js'].lineData[298]++;
        editor.checkSelectionChange();
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[302]++;
    body.on('keydown', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[18]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[303]++;
  saveEnabled = FALSE;
});
    _$jscoverage['/editor/selectionFix.js'].lineData[305]++;
    body.on('keyup', function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[19]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[306]++;
  saveEnabled = TRUE;
  _$jscoverage['/editor/selectionFix.js'].lineData[307]++;
  setTimeout(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[20]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[308]++;
  saveSelection();
}, 0);
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[313]++;
  function fireSelectionChangeForStandard(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[21]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[317]++;
    function monitor() {
      _$jscoverage['/editor/selectionFix.js'].functionData[22]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[319]++;
      editor.checkSelectionChange();
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[322]++;
    editor.get("document").on('mouseup keyup ' + 'selectionchange', monitor);
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[334]++;
  function monitorSelectionChange(editor) {
    _$jscoverage['/editor/selectionFix.js'].functionData[23]++;
    _$jscoverage['/editor/selectionFix.js'].lineData[337]++;
    var emptyParagraphRegexp = /\s*<(p|div|address|h\d|center)[^>]*>\s*(?:<br[^>]*>|&nbsp;|\u00A0|&#160;|(<!--[\s\S]*?-->))?\s*(:?<\/\1>)?(?=\s*$|<\/body>)/gi;
    _$jscoverage['/editor/selectionFix.js'].lineData[341]++;
    function isBlankParagraph(block) {
      _$jscoverage['/editor/selectionFix.js'].functionData[24]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[342]++;
      return block.outerHtml().match(emptyParagraphRegexp);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[345]++;
    var isNotWhitespace = Editor.Walker.whitespaces(TRUE), isNotBookmark = Editor.Walker.bookmark(FALSE, TRUE);
    _$jscoverage['/editor/selectionFix.js'].lineData[348]++;
    var nextValidEl = function(node) {
  _$jscoverage['/editor/selectionFix.js'].functionData[25]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[349]++;
  return visit782_349_1(isNotWhitespace(node) && visit783_349_2(node.nodeType != 8));
};
    _$jscoverage['/editor/selectionFix.js'].lineData[353]++;
    function cannotCursorPlaced(element) {
      _$jscoverage['/editor/selectionFix.js'].functionData[26]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[354]++;
      var dtd = Editor.XHTML_DTD;
      _$jscoverage['/editor/selectionFix.js'].lineData[355]++;
      return visit784_355_1(element._4e_isBlockBoundary() && dtd.$empty[element.nodeName()]);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[358]++;
    function isNotEmpty(node) {
      _$jscoverage['/editor/selectionFix.js'].functionData[27]++;
      _$jscoverage['/editor/selectionFix.js'].lineData[359]++;
      return visit785_359_1(isNotWhitespace(node) && isNotBookmark(node));
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[365]++;
    editor.on("selectionChange", function(ev) {
  _$jscoverage['/editor/selectionFix.js'].functionData[28]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[367]++;
  var path = ev.path, editorDoc = editor.get("document")[0], body = new Node(editorDoc.body), selection = ev.selection, range = visit786_371_1(selection && selection.getRanges()[0]), blockLimit = path.blockLimit;
  _$jscoverage['/editor/selectionFix.js'].lineData[375]++;
  if (visit787_375_1(!body[0])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[377]++;
    editorDoc.documentElement.appendChild(editorDoc.createElement('body'));
    _$jscoverage['/editor/selectionFix.js'].lineData[378]++;
    body = new Node(editorDoc.body);
    _$jscoverage['/editor/selectionFix.js'].lineData[379]++;
    if (visit788_379_1(range)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[380]++;
      range.setStart(body, 0);
      _$jscoverage['/editor/selectionFix.js'].lineData[381]++;
      range.collapse(1);
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[385]++;
  blockLimit = visit789_385_1(blockLimit || body);
  _$jscoverage['/editor/selectionFix.js'].lineData[391]++;
  if (visit790_391_1(UA['gecko'])) {
    _$jscoverage['/editor/selectionFix.js'].lineData[392]++;
    var pathBlock = visit791_392_1(path.block || path.blockLimit), lastNode = visit792_393_1(pathBlock && pathBlock.last(isNotEmpty));
    _$jscoverage['/editor/selectionFix.js'].lineData[394]++;
    if (visit793_394_1(pathBlock && visit794_396_1(pathBlock._4e_isBlockBoundary() && visit795_398_1(!(visit796_398_2(lastNode && visit797_398_3(visit798_398_4(lastNode[0].nodeType == 1) && lastNode._4e_isBlockBoundary()))) && visit799_400_1(visit800_400_2(pathBlock.nodeName() != 'pre') && !pathBlock._4e_getBogus()))))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[403]++;
      pathBlock._4e_appendBogus();
    }
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[407]++;
  if (visit801_407_1(!range || visit802_407_2(!range.collapsed || path.block))) {
    _$jscoverage['/editor/selectionFix.js'].lineData[408]++;
    return;
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[412]++;
  if (visit803_412_1(blockLimit.nodeName() == "body")) {
    _$jscoverage['/editor/selectionFix.js'].lineData[413]++;
    if (visit804_413_1(range.startContainer.nodeName() == 'html')) {
      _$jscoverage['/editor/selectionFix.js'].lineData[414]++;
      range.setStart(body, 0);
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[416]++;
    var fixedBlock = range.fixBlock(TRUE, "p");
    _$jscoverage['/editor/selectionFix.js'].lineData[417]++;
    if (visit805_417_1(fixedBlock && visit806_421_1(fixedBlock[0] != body[0].lastChild))) {
      _$jscoverage['/editor/selectionFix.js'].lineData[423]++;
      if (visit807_423_1(isBlankParagraph(fixedBlock))) {
        _$jscoverage['/editor/selectionFix.js'].lineData[424]++;
        var element = fixedBlock.next(nextValidEl, 1);
        _$jscoverage['/editor/selectionFix.js'].lineData[425]++;
        if (visit808_425_1(element && visit809_426_1(visit810_426_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
          _$jscoverage['/editor/selectionFix.js'].lineData[427]++;
          range.moveToElementEditablePosition(element);
          _$jscoverage['/editor/selectionFix.js'].lineData[428]++;
          fixedBlock._4e_remove();
        } else {
          _$jscoverage['/editor/selectionFix.js'].lineData[430]++;
          element = fixedBlock.prev(nextValidEl, 1);
          _$jscoverage['/editor/selectionFix.js'].lineData[431]++;
          if (visit811_431_1(element && visit812_432_1(visit813_432_2(element[0].nodeType == Dom.NodeType.ELEMENT_NODE) && !cannotCursorPlaced[element]))) {
            _$jscoverage['/editor/selectionFix.js'].lineData[433]++;
            range.moveToElementEditablePosition(element, isBlankParagraph(element) ? FALSE : TRUE);
            _$jscoverage['/editor/selectionFix.js'].lineData[436]++;
            fixedBlock._4e_remove();
          } else {
          }
        }
      }
    }
    _$jscoverage['/editor/selectionFix.js'].lineData[443]++;
    range.select();
    _$jscoverage['/editor/selectionFix.js'].lineData[445]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[452]++;
  var doc = editor.get("document")[0], lastRange = new Editor.Range(doc), lastPath, editBlock;
  _$jscoverage['/editor/selectionFix.js'].lineData[457]++;
  lastRange.moveToElementEditablePosition(body, TRUE);
  _$jscoverage['/editor/selectionFix.js'].lineData[459]++;
  lastPath = new Editor.ElementPath(lastRange.startContainer);
  _$jscoverage['/editor/selectionFix.js'].lineData[461]++;
  if (visit814_461_1(lastPath.blockLimit.nodeName() !== 'body')) {
    _$jscoverage['/editor/selectionFix.js'].lineData[462]++;
    editBlock = new Node(doc.createElement('p')).appendTo(body);
    _$jscoverage['/editor/selectionFix.js'].lineData[463]++;
    if (visit815_463_1(!UA['ie'])) {
      _$jscoverage['/editor/selectionFix.js'].lineData[464]++;
      editBlock._4e_appendBogus();
    }
  }
});
  }
  _$jscoverage['/editor/selectionFix.js'].lineData[470]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/selectionFix.js'].functionData[29]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[472]++;
  editor.docReady(function() {
  _$jscoverage['/editor/selectionFix.js'].functionData[30]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[474]++;
  if (visit816_474_1(UA.ieMode < 11)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[475]++;
    fixCursorForIE(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[476]++;
    fixSelectionForIEWhenDocReady(editor);
  } else {
    _$jscoverage['/editor/selectionFix.js'].lineData[478]++;
    fireSelectionChangeForStandard(editor);
    _$jscoverage['/editor/selectionFix.js'].lineData[480]++;
    if (visit817_480_1(UA.ieMode == 11)) {
      _$jscoverage['/editor/selectionFix.js'].lineData[481]++;
      editor.get('document').on('focusin', function(e) {
  _$jscoverage['/editor/selectionFix.js'].functionData[31]++;
  _$jscoverage['/editor/selectionFix.js'].lineData[482]++;
  var selection = editor.getSelection();
  _$jscoverage['/editor/selectionFix.js'].lineData[483]++;
  var range = visit818_483_1(selection && selection.getRanges()[0]);
  _$jscoverage['/editor/selectionFix.js'].lineData[484]++;
  if (visit819_484_1(!range)) {
    _$jscoverage['/editor/selectionFix.js'].lineData[485]++;
    range = new KERange(this);
    _$jscoverage['/editor/selectionFix.js'].lineData[486]++;
    range.setStart(Node.all(e.target), 0);
    _$jscoverage['/editor/selectionFix.js'].lineData[487]++;
    range.collapse(1);
    _$jscoverage['/editor/selectionFix.js'].lineData[488]++;
    range.select();
  }
});
    }
  }
});
  _$jscoverage['/editor/selectionFix.js'].lineData[496]++;
  monitorSelectionChange(editor);
}};
});
