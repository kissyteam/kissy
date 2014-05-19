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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[7] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[8] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[9] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[11] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[34] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[39] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[46] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[49] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[50] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[61] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[62] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[64] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[65] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[68] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[69] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[71] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[73] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[82] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[86] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[87] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[95] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[97] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[100] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[107] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[111] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[114] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[116] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[117] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[118] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[119] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[120] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[123] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[124] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[125] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[129] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[131] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[132] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[134] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[137] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[139] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[141] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[145] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[148] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[149] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[153] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[154] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[155] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[156] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[159] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[166] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[169] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[170] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[179] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[181] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[182] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[184] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[185] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[186] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[188] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[189] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[241] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[256] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[265] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[267] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[285] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[287] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[291] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[294] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[297] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[298] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[300] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[301] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[308] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[310] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[312] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[315] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[316] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[318] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[322] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[323] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[328] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[329] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[330] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[331] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[332] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[340] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[341] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[342] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[349] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[350] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[351] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[353] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[361] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[362] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[368] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[369] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[370] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[372] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[375] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[376] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[380] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[388] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[389] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[392] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[393] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[394] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[395] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[401] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[402] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[403] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[404] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[406] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[22] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[23] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['17'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['49'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['64'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['69'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['71'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['96'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['107'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['114'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['116'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['118'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['123'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['129'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['132'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['137'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['140'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['149'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['154'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['155'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['169'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['181'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['185'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['281'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['287'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['300'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['312'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['315'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['322'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['330'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['340'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['349'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['355'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['357'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['362'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['363'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['363'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['364'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['364'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['365'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['369'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['369'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['369'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['393'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['393'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['393'][1].init(14, 4, 'node');
function visit44_393_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['369'][3].init(45, 27, 'region.left >= region.right');
function visit43_369_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['369'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['369'][2].init(14, 27, 'region.top >= region.bottom');
function visit42_369_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['369'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['369'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit41_369_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['365'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit40_365_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['364'][2].init(109, 25, 'region.top <= pointer.top');
function visit39_364_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['364'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['364'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit38_364_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['363'][2].init(63, 28, 'region.right >= pointer.left');
function visit37_363_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['363'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['363'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit36_363_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['362'][2].init(17, 27, 'region.left <= pointer.left');
function visit35_362_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['362'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit34_362_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['357'][1].init(177, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit33_357_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['355'][1].init(68, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit32_355_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['349'][1].init(51, 21, '!node.__ddCachedWidth');
function visit31_349_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['340'][1].init(99, 12, 'drops.length');
function visit30_340_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['330'][1].init(99, 12, 'drops.length');
function visit29_330_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['322'][1].init(422, 3, 'ie6');
function visit28_322_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['315'][1].init(242, 14, 'cur === \'auto\'');
function visit27_315_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['312'][1].init(175, 2, 'ah');
function visit26_312_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['300'][1].init(66, 62, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit25_300_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['287'][1].init(702, 3, 'ie6');
function visit24_287_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['281'][1].init(474, 31, 'doc.body || doc.documentElement');
function visit23_281_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['185'][1].init(219, 10, 'activeDrop');
function visit22_185_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['181'][1].init(102, 10, 'self._shim');
function visit21_181_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['169'][1].init(184, 20, 'self.__needDropCheck');
function visit20_169_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['155'][1].init(22, 22, 'oldDrop !== activeDrop');
function visit19_155_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['154'][1].init(2553, 10, 'activeDrop');
function visit18_154_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['149'][2].init(2353, 22, 'oldDrop !== activeDrop');
function visit17_149_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['149'][1].init(2342, 33, 'oldDrop && oldDrop !== activeDrop');
function visit16_149_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['140'][1].init(134, 14, 'a === dragArea');
function visit15_140_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['137'][1].init(1557, 17, 'mode === \'strict\'');
function visit14_137_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['132'][1].init(143, 9, 'a > vArea');
function visit13_132_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['129'][1].init(1244, 20, 'mode === \'intersect\'');
function visit12_129_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['123'][1].init(89, 9, 'a < vArea');
function visit11_123_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['118'][1].init(79, 11, '!activeDrop');
function visit10_118_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['116'][1].init(64, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit9_116_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['114'][1].init(593, 16, 'mode === \'point\'');
function visit8_114_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['107'][1].init(389, 5, '!node');
function visit7_107_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['96'][1].init(22, 20, 'drop.get(\'disabled\')');
function visit6_96_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['71'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit5_71_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['69'][1].init(299, 18, 'drag.get(\'groups\')');
function visit4_69_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['64'][1].init(128, 16, 'drag.get(\'shim\')');
function visit3_64_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['49'][1].init(141, 12, 'index !== -1');
function visit2_49_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['17'][1].init(165, 11, 'UA.ie === 6');
function visit1_17_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/dd/ddm.js'].lineData[8]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[9]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[11]++;
  var UA = require('ua'), $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_17_1(UA.ie === 6), MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[34]++;
  var DDManger = Base.extend({
  addDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[39]++;
  this.get('drops').push(d);
}, 
  removeDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[46]++;
  var self = this, drops = self.get('drops'), index = util.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[49]++;
  if (visit2_49_1(index !== -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[50]++;
    drops.splice(index, 1);
  }
}, 
  start: function(e, drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[61]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[62]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[64]++;
  if (visit3_64_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[65]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[68]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[69]++;
  if (visit4_69_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[70]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[71]++;
    if (visit5_71_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[72]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[73]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[82]++;
  this.get('validDrops').push(drop);
}, 
  _notifyDropsMove: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[86]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[87]++;
  var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
  _$jscoverage['/dd/ddm.js'].lineData[95]++;
  util.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[96]++;
  if (visit6_96_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[97]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[100]++;
  var a, node = drop.getNodeFromTarget(ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[107]++;
  if (visit7_107_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[111]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[114]++;
  if (visit8_114_1(mode === 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[116]++;
    if (visit9_116_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[117]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[118]++;
      if (visit10_118_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[119]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[120]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[123]++;
        if (visit11_123_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[124]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[125]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[129]++;
    if (visit12_129_1(mode === 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[131]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[132]++;
      if (visit13_132_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[133]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[134]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[137]++;
      if (visit14_137_1(mode === 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[139]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[140]++;
        if (visit15_140_1(a === dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[141]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[142]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[145]++;
  return undefined;
});
  _$jscoverage['/dd/ddm.js'].lineData[148]++;
  oldDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[149]++;
  if (visit16_149_1(oldDrop && visit17_149_2(oldDrop !== activeDrop))) {
    _$jscoverage['/dd/ddm.js'].lineData[150]++;
    oldDrop._handleOut(ev);
    _$jscoverage['/dd/ddm.js'].lineData[151]++;
    activeDrag._handleOut(ev);
  }
  _$jscoverage['/dd/ddm.js'].lineData[153]++;
  self.setInternal('activeDrop', activeDrop);
  _$jscoverage['/dd/ddm.js'].lineData[154]++;
  if (visit18_154_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[155]++;
    if (visit19_155_1(oldDrop !== activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[156]++;
      activeDrop._handleEnter(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[159]++;
      activeDrop._handleOver(ev);
    }
  }
}, 
  move: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[7]++;
  _$jscoverage['/dd/ddm.js'].lineData[166]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[169]++;
  if (visit20_169_1(self.__needDropCheck)) {
    _$jscoverage['/dd/ddm.js'].lineData[170]++;
    self._notifyDropsMove(ev, activeDrag);
  }
}, 
  end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[8]++;
  _$jscoverage['/dd/ddm.js'].lineData[179]++;
  var self = this, activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[181]++;
  if (visit21_181_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[182]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[184]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[185]++;
  if (visit22_185_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[186]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[188]++;
  self.setInternal('activeDrop', null);
  _$jscoverage['/dd/ddm.js'].lineData[189]++;
  self.setInternal('activeDrag', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  valueFn: function() {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[241]++;
  return [];
}}, 
  validDrops: {
  valueFn: function() {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[256]++;
  return [];
}}}});
  _$jscoverage['/dd/ddm.js'].lineData[265]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[11]++;
  _$jscoverage['/dd/ddm.js'].lineData[267]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + self.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit23_281_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[285]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[287]++;
  if (visit24_287_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[291]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[294]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[297]++;
  var adjustShimSize = util.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[12]++;
  _$jscoverage['/dd/ddm.js'].lineData[298]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[300]++;
  if (visit25_300_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[301]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[308]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[13]++;
    _$jscoverage['/dd/ddm.js'].lineData[310]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[312]++;
    if (visit26_312_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[313]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[315]++;
    if (visit27_315_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[316]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[318]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[322]++;
    if (visit28_322_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[323]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[327]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[328]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[329]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[330]++;
    if (visit29_330_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[331]++;
      util.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[15]++;
  _$jscoverage['/dd/ddm.js'].lineData[332]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[337]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[16]++;
    _$jscoverage['/dd/ddm.js'].lineData[338]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[339]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[340]++;
    if (visit30_340_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[341]++;
      util.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[17]++;
  _$jscoverage['/dd/ddm.js'].lineData[342]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[347]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[18]++;
    _$jscoverage['/dd/ddm.js'].lineData[348]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[349]++;
    if (visit31_349_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[350]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[351]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[353]++;
    return {
  left: offset.left, 
  right: offset.left + (visit32_355_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit33_357_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[361]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[362]++;
    return visit34_362_1(visit35_362_2(region.left <= pointer.left) && visit36_363_1(visit37_363_2(region.right >= pointer.left) && visit38_364_1(visit39_364_2(region.top <= pointer.top) && visit40_365_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[368]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[369]++;
    if (visit41_369_1(visit42_369_2(region.top >= region.bottom) || visit43_369_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[370]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[372]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[375]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[376]++;
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[380]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[388]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[22]++;
    _$jscoverage['/dd/ddm.js'].lineData[389]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[392]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[23]++;
    _$jscoverage['/dd/ddm.js'].lineData[393]++;
    if (visit44_393_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[394]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[395]++;
      node.__ddCachedHeight = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[399]++;
  var DDM = new DDManger();
  _$jscoverage['/dd/ddm.js'].lineData[400]++;
  DDM.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  DDM.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  DDM.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[403]++;
  DDM.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[404]++;
  DDM.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[406]++;
  return DDM;
});
