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
if (! _$jscoverage['/editor/htmlDataProcessor.js']) {
  _$jscoverage['/editor/htmlDataProcessor.js'] = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[33] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[39] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[41] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[42] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[48] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[50] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[56] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[57] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[58] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[64] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[83] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[94] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[99] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[102] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[110] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[113] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[116] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[119] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[120] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[127] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[130] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[141] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[142] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[144] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[161] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[164] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[167] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[172] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[174] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[175] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[180] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[181] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[190] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[202] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[205] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[211] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[214] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[215] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[221] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[236] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[237] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[243] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[244] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[248] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[260] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[266] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[267] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[268] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[270] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[275] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[276] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[283] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[298] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[302] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[303] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[305] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[321] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[332] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[336] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[337] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[340] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[341] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[350] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[352] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[358] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[360] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[362] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[367] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[374] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[376] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[380] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[392] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[395] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[397] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[402] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[405] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[407] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[409] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[415] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[417] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[418] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].functionData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30] = 0;
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31] = 0;
}
if (! _$jscoverage['/editor/htmlDataProcessor.js'].branchData) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData = {};
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['38'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['40'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['94'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['116'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['119'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['127'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['141'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['160'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['167'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][3] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][2] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['227'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['236'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['259'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['302'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['350'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['367'] = [];
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['367'][1] = new BranchData();
}
_$jscoverage['/editor/htmlDataProcessor.js'].branchData['367'][1].init(87, 25, '_dataFilter || dataFilter');
function visit369_367_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['350'][1].init(26, 9, 'UA.webkit');
function visit368_350_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['302'][1].init(186, 49, 'attributes.indexOf(\'_ke_saved_\' + attrName) == -1');
function visit367_302_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['259'][1].init(26, 19, '!(\'br\' in dtd[i])');
function visit366_259_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit365_245_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['236'][1].init(141, 9, '!UA[\'ie\']');
function visit364_236_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1].init(67, 26, 'blockNeedsExtension(block)');
function visit363_233_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['227'][1].init(52, 29, 'lastChild.nodeName == \'input\'');
function visit362_227_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][2].init(341, 24, 'block.nodeName == \'form\'');
function visit361_226_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][1].init(191, 82, 'block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit360_226_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].init(147, 274, '!lastChild || block.nodeName == \'form\' && lastChild.nodeName == \'input\'');
function visit359_223_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][2].init(208, 23, 'lastChild.nodeType == 3');
function visit358_214_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1].init(208, 66, 'lastChild.nodeType == 3 && tailNbspRegex.test(lastChild.nodeValue)');
function visit357_214_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][3].init(57, 26, 'lastChild.nodeName == \'br\'');
function visit356_211_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2].init(30, 23, 'lastChild.nodeType == 1');
function visit355_211_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1].init(30, 53, 'lastChild.nodeType == 1 && lastChild.nodeName == \'br\'');
function visit354_211_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1].init(90, 9, 'lastChild');
function visit353_210_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][3].init(210, 18, 'last.nodeType == 3');
function visit352_202_3(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][2].init(210, 45, 'last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit351_202_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][1].init(202, 53, 'last && last.nodeType == 3 && !S.trim(last.nodeValue)');
function visit350_202_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['167'][1].init(5350, 8, 'UA[\'ie\']');
function visit349_167_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['160'][1].init(101, 73, 'contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker');
function visit348_160_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['141'][1].init(34, 10, '!S.trim(v)');
function visit347_141_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['127'][1].init(34, 60, '!(element.childNodes.length) && !(element.attributes.length)');
function visit346_127_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['119'][1].init(370, 12, 'parentHeight');
function visit345_119_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['116'][1].init(202, 11, 'parentWidth');
function visit344_116_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][2].init(255, 27, 'parent.nodeName == \'object\'');
function visit343_113_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][1].init(245, 37, 'parent && parent.nodeName == \'object\'');
function visit342_113_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1].init(136, 40, 'element.getAttribute(savedAttributeName)');
function visit341_101_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1].init(329, 25, 'i < attributeNames.length');
function visit340_99_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['94'][1].init(102, 17, 'attributes.length');
function visit339_94_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][2].init(78, 42, 'child.nodeType == S.DOM.NodeType.TEXT_NODE');
function visit338_42_2(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][1].init(78, 62, 'child.nodeType == S.DOM.NodeType.TEXT_NODE && !child.nodeValue');
function visit337_42_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['40'][1].init(69, 5, 'i < l');
function visit336_40_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].branchData['38'][1].init(203, 1, 'l');
function visit335_38_1(result) {
  _$jscoverage['/editor/htmlDataProcessor.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/htmlDataProcessor.js'].lineData[9]++;
KISSY.add("editor/htmlDataProcessor", function(S, Editor, HtmlParser) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[0]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[11]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[1]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[13]++;
  var Node = S.Node, UA = S.UA, htmlFilter = new HtmlParser.Filter(), dataFilter = new HtmlParser.Filter();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[32]++;
  function filterInline(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[2]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[33]++;
    var childNodes = element.childNodes, i, child, allEmpty, l = childNodes.length;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[38]++;
    if (visit335_38_1(l)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[39]++;
      allEmpty = 1;
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[40]++;
      for (i = 0; visit336_40_1(i < l); i++) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[41]++;
        child = childNodes[i];
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[42]++;
        if (visit337_42_1(visit338_42_2(child.nodeType == S.DOM.NodeType.TEXT_NODE) && !child.nodeValue)) {
        } else {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[44]++;
          allEmpty = 0;
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[45]++;
          break;
        }
      }
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[48]++;
      return allEmpty ? false : undefined;
    } else {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[50]++;
      return false;
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[54]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[3]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[56]++;
  function wrapAsComment(element) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[4]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[57]++;
    var html = HtmlParser.serialize(element);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[58]++;
    return new HtmlParser.Comment(protectedSourceMarker + encodeURIComponent(html).replace(/--/g, "%2D%2D"));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[64]++;
  var defaultDataFilterRules = {
  tagNames: [[/^\?xml.*$/i, ''], [/^.*namespace.*$/i, '']], 
  attributeNames: [[/^on/, 'ke_on'], [/^lang$/, '']], 
  tags: {
  script: wrapAsComment, 
  noscript: wrapAsComment, 
  span: filterInline}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[83]++;
  var defaultHTMLFilterRules = {
  tagNames: [[(/^ke:/), ''], [(/^\?xml:namespace$/), '']], 
  tags: {
  $: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[5]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[92]++;
  var attributes = element.attributes;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[94]++;
  if (visit339_94_1(attributes.length)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[97]++;
    var attributeNames = ['name', 'href', 'src'], savedAttributeName;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[99]++;
    for (var i = 0; visit340_99_1(i < attributeNames.length); i++) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[100]++;
      savedAttributeName = '_ke_saved_' + attributeNames[i];
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[101]++;
      if (visit341_101_1(element.getAttribute(savedAttributeName))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[102]++;
        element.removeAttribute(attributeNames[i]);
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[107]++;
  return element;
}, 
  embed: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[6]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[110]++;
  var parent = element.parentNode;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[113]++;
  if (visit342_113_1(parent && visit343_113_2(parent.nodeName == 'object'))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[114]++;
    var parentWidth = parent.getAttribute("width"), parentHeight = parent.getAttribute("height");
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[116]++;
    if (visit344_116_1(parentWidth)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[117]++;
      element.setAttribute("width", parentWidth);
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[119]++;
    if (visit345_119_1(parentHeight)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[120]++;
      element.setAttribute("width", parentHeight);
    }
  }
}, 
  a: function(element) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[7]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[127]++;
  if (visit346_127_1(!(element.childNodes.length) && !(element.attributes.length))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[128]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[130]++;
  return undefined;
}, 
  span: filterInline, 
  strong: filterInline, 
  em: filterInline, 
  del: filterInline, 
  u: filterInline}, 
  attributes: {
  style: function(v) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[8]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[141]++;
  if (visit347_141_1(!S.trim(v))) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[142]++;
    return false;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[144]++;
  return undefined;
}}, 
  attributeNames: [[(/^_ke_saved_/), ''], [(/^ke_on/), 'on'], [(/^_ke.*/), ''], [(/^ke:.*$/), ''], [(/^_ks.*/), '']], 
  comment: function(contents) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[9]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[160]++;
  if (visit348_160_1(contents.substr(0, protectedSourceMarker.length) == protectedSourceMarker)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[161]++;
    contents = S.trim(S.urlDecode(contents.substr(protectedSourceMarker.length)));
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[162]++;
    return HtmlParser.parse(contents).childNodes[0];
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[164]++;
  return undefined;
}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[167]++;
  if (visit349_167_1(UA['ie'])) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[172]++;
    defaultHTMLFilterRules.attributes.style = function(value) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[10]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[174]++;
  return value.replace(/(^|;)([^:]+)/g, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[11]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[175]++;
  return match.toLowerCase();
});
};
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[180]++;
  htmlFilter.addRules(defaultHTMLFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[181]++;
  dataFilter.addRules(defaultDataFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[190]++;
  (function() {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[12]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[195]++;
  var tailNbspRegex = /^[\t\r\n ]*(?:&nbsp;|\xa0)[\t\r\n ]*$/;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[198]++;
  function lastNoneSpaceChild(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[13]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[199]++;
    var childNodes = block.childNodes, lastIndex = childNodes.length, last = childNodes[lastIndex - 1];
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[202]++;
    while (visit350_202_1(last && visit351_202_2(visit352_202_3(last.nodeType == 3) && !S.trim(last.nodeValue)))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[203]++;
      last = childNodes[--lastIndex];
    }
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[205]++;
    return last;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[208]++;
  function trimFillers(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[14]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[209]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[210]++;
    if (visit353_210_1(lastChild)) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[211]++;
      if (visit354_211_1(visit355_211_2(lastChild.nodeType == 1) && visit356_211_3(lastChild.nodeName == 'br'))) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[212]++;
        block.removeChild(lastChild);
      } else {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[214]++;
        if (visit357_214_1(visit358_214_2(lastChild.nodeType == 3) && tailNbspRegex.test(lastChild.nodeValue))) {
          _$jscoverage['/editor/htmlDataProcessor.js'].lineData[215]++;
          block.removeChild(lastChild);
        }
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[220]++;
  function blockNeedsExtension(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[15]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[221]++;
    var lastChild = lastNoneSpaceChild(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[223]++;
    return visit359_223_1(!lastChild || visit360_226_1(visit361_226_2(block.nodeName == 'form') && visit362_227_1(lastChild.nodeName == 'input')));
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[231]++;
  function extendBlockForDisplay(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[16]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[232]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[233]++;
    if (visit363_233_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[236]++;
      if (visit364_236_1(!UA['ie'])) {
        _$jscoverage['/editor/htmlDataProcessor.js'].lineData[237]++;
        block.appendChild(new HtmlParser.Tag('br'));
      }
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[243]++;
  function extendBlockForOutput(block) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[17]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[244]++;
    trimFillers(block);
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[245]++;
    if (visit365_245_1(blockNeedsExtension(block))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[248]++;
      block.appendChild(new HtmlParser.Text('\xa0'));
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[253]++;
  var dtd = Editor.XHTML_DTD;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[254]++;
  var blockLikeTags = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent), i;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[258]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[259]++;
    if (visit366_259_1(!('br' in dtd[i]))) {
      _$jscoverage['/editor/htmlDataProcessor.js'].lineData[260]++;
      delete blockLikeTags[i];
    }
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[266]++;
  delete blockLikeTags.pre;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[267]++;
  var defaultDataBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[268]++;
  var defaultHTMLBlockFilterRules = {
  tags: {}};
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[270]++;
  for (i in blockLikeTags) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[271]++;
    defaultDataBlockFilterRules.tags[i] = extendBlockForDisplay;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[272]++;
    defaultHTMLBlockFilterRules.tags[i] = extendBlockForOutput;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[275]++;
  dataFilter.addRules(defaultDataBlockFilterRules);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[276]++;
  htmlFilter.addRules(defaultHTMLBlockFilterRules);
})();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[283]++;
  htmlFilter.addRules({
  text: function(text) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[18]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[285]++;
  return text.replace(/\xa0/g, "&nbsp;");
}});
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[292]++;
  var protectElementRegex = /<(a|area|img|input)\b([^>]*)>/gi, protectAttributeRegex = /\b(href|src|name)\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|(?:[^ "'>]+))/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[297]++;
  function protectAttributes(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[19]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[298]++;
    return html.replace(protectElementRegex, function(element, tag, attributes) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[20]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[299]++;
  return '<' + tag + attributes.replace(protectAttributeRegex, function(fullAttr, attrName) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[21]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[302]++;
  if (visit367_302_1(attributes.indexOf('_ke_saved_' + attrName) == -1)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[303]++;
    return ' _ke_saved_' + fullAttr + ' ' + fullAttr;
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[305]++;
  return fullAttr;
}) + '>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[310]++;
  var protectedSourceMarker = '{ke_protected}';
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[312]++;
  var protectElementsRegex = /(?:<textarea[^>]*>[\s\S]*<\/textarea>)|(?:<style[^>]*>[\s\S]*<\/style>)|(?:<script[^>]*>[\s\S]*<\/script>)|(?:<(:?link|meta|base)[^>]*>)/gi, encodedElementsRegex = /<ke:encoded>([^<]*)<\/ke:encoded>/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[315]++;
  var protectElementNamesRegex = /(<\/?)((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi, unprotectElementNamesRegex = /(<\/?)ke:((?:object|embed|param|html|body|head|title|noscript)[^>]*>)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[318]++;
  var protectSelfClosingRegex = /<ke:(param|embed)([^>]*?)\/?>(?!\s*<\/ke:\1)/gi;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[320]++;
  function protectSelfClosingElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[22]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[321]++;
    return html.replace(protectSelfClosingRegex, '<ke:$1$2></ke:$1>');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[324]++;
  function protectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[23]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[325]++;
    return html.replace(protectElementsRegex, function(match) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[24]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[326]++;
  return '<ke:encoded>' + encodeURIComponent(match) + '</ke:encoded>';
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[330]++;
  function unprotectElements(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[25]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[331]++;
    return html.replace(encodedElementsRegex, function(match, encoded) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[26]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[332]++;
  return S.urlDecode(encoded);
});
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[336]++;
  function protectElementsNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[27]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[337]++;
    return html.replace(protectElementNamesRegex, '$1ke:$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[340]++;
  function unprotectElementNames(html) {
    _$jscoverage['/editor/htmlDataProcessor.js'].functionData[28]++;
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[341]++;
    return html.replace(unprotectElementNamesRegex, '$1$2');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[344]++;
  editor.htmlDataProcessor = {
  dataFilter: dataFilter, 
  htmlFilter: htmlFilter, 
  toHtml: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[29]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[350]++;
  if (visit368_350_1(UA.webkit)) {
    _$jscoverage['/editor/htmlDataProcessor.js'].lineData[352]++;
    html = html.replace(/\u200b/g, '');
  }
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[358]++;
  var writer = new HtmlParser.BeautifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[360]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[361]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[362]++;
  return html;
}, 
  toDataFormat: function(html, _dataFilter) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[30]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[367]++;
  _dataFilter = visit369_367_1(_dataFilter || dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[374]++;
  html = protectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[376]++;
  html = protectAttributes(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[380]++;
  html = protectElementsNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[384]++;
  html = protectSelfClosingElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[389]++;
  var div = new Node("<div>");
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[391]++;
  div.html('a' + html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[392]++;
  html = div.html().substr(1);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[395]++;
  html = unprotectElementNames(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[397]++;
  html = unprotectElements(html);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[402]++;
  var writer = new HtmlParser.BasicWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[405]++;
  n.writeHtml(writer, _dataFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[407]++;
  html = writer.getHtml();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[409]++;
  return html;
}, 
  toServer: function(html) {
  _$jscoverage['/editor/htmlDataProcessor.js'].functionData[31]++;
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[415]++;
  var writer = new HtmlParser.MinifyWriter(), n = new HtmlParser.Parser(html).parse();
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[417]++;
  n.writeHtml(writer, htmlFilter);
  _$jscoverage['/editor/htmlDataProcessor.js'].lineData[418]++;
  return writer.getHtml();
}};
}};
}, {
  requires: ['./base', 'html-parser']});
