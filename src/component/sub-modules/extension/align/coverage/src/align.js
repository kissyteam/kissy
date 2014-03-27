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
if (! _$jscoverage['/align.js']) {
  _$jscoverage['/align.js'] = {};
  _$jscoverage['/align.js'].lineData = [];
  _$jscoverage['/align.js'].lineData[6] = 0;
  _$jscoverage['/align.js'].lineData[7] = 0;
  _$jscoverage['/align.js'].lineData[8] = 0;
  _$jscoverage['/align.js'].lineData[18] = 0;
  _$jscoverage['/align.js'].lineData[34] = 0;
  _$jscoverage['/align.js'].lineData[40] = 0;
  _$jscoverage['/align.js'].lineData[41] = 0;
  _$jscoverage['/align.js'].lineData[44] = 0;
  _$jscoverage['/align.js'].lineData[45] = 0;
  _$jscoverage['/align.js'].lineData[46] = 0;
  _$jscoverage['/align.js'].lineData[47] = 0;
  _$jscoverage['/align.js'].lineData[50] = 0;
  _$jscoverage['/align.js'].lineData[57] = 0;
  _$jscoverage['/align.js'].lineData[58] = 0;
  _$jscoverage['/align.js'].lineData[75] = 0;
  _$jscoverage['/align.js'].lineData[77] = 0;
  _$jscoverage['/align.js'].lineData[84] = 0;
  _$jscoverage['/align.js'].lineData[86] = 0;
  _$jscoverage['/align.js'].lineData[87] = 0;
  _$jscoverage['/align.js'].lineData[89] = 0;
  _$jscoverage['/align.js'].lineData[90] = 0;
  _$jscoverage['/align.js'].lineData[93] = 0;
  _$jscoverage['/align.js'].lineData[95] = 0;
  _$jscoverage['/align.js'].lineData[100] = 0;
  _$jscoverage['/align.js'].lineData[101] = 0;
  _$jscoverage['/align.js'].lineData[102] = 0;
  _$jscoverage['/align.js'].lineData[103] = 0;
  _$jscoverage['/align.js'].lineData[104] = 0;
  _$jscoverage['/align.js'].lineData[108] = 0;
  _$jscoverage['/align.js'].lineData[109] = 0;
  _$jscoverage['/align.js'].lineData[110] = 0;
  _$jscoverage['/align.js'].lineData[116] = 0;
  _$jscoverage['/align.js'].lineData[117] = 0;
  _$jscoverage['/align.js'].lineData[122] = 0;
  _$jscoverage['/align.js'].lineData[127] = 0;
  _$jscoverage['/align.js'].lineData[128] = 0;
  _$jscoverage['/align.js'].lineData[130] = 0;
  _$jscoverage['/align.js'].lineData[132] = 0;
  _$jscoverage['/align.js'].lineData[138] = 0;
  _$jscoverage['/align.js'].lineData[139] = 0;
  _$jscoverage['/align.js'].lineData[143] = 0;
  _$jscoverage['/align.js'].lineData[144] = 0;
  _$jscoverage['/align.js'].lineData[148] = 0;
  _$jscoverage['/align.js'].lineData[149] = 0;
  _$jscoverage['/align.js'].lineData[155] = 0;
  _$jscoverage['/align.js'].lineData[156] = 0;
  _$jscoverage['/align.js'].lineData[160] = 0;
  _$jscoverage['/align.js'].lineData[163] = 0;
  _$jscoverage['/align.js'].lineData[167] = 0;
  _$jscoverage['/align.js'].lineData[169] = 0;
  _$jscoverage['/align.js'].lineData[173] = 0;
  _$jscoverage['/align.js'].lineData[174] = 0;
  _$jscoverage['/align.js'].lineData[178] = 0;
  _$jscoverage['/align.js'].lineData[181] = 0;
  _$jscoverage['/align.js'].lineData[185] = 0;
  _$jscoverage['/align.js'].lineData[187] = 0;
  _$jscoverage['/align.js'].lineData[190] = 0;
  _$jscoverage['/align.js'].lineData[193] = 0;
  _$jscoverage['/align.js'].lineData[194] = 0;
  _$jscoverage['/align.js'].lineData[195] = 0;
  _$jscoverage['/align.js'].lineData[196] = 0;
  _$jscoverage['/align.js'].lineData[197] = 0;
  _$jscoverage['/align.js'].lineData[200] = 0;
  _$jscoverage['/align.js'].lineData[203] = 0;
  _$jscoverage['/align.js'].lineData[204] = 0;
  _$jscoverage['/align.js'].lineData[205] = 0;
  _$jscoverage['/align.js'].lineData[212] = 0;
  _$jscoverage['/align.js'].lineData[215] = 0;
  _$jscoverage['/align.js'].lineData[217] = 0;
  _$jscoverage['/align.js'].lineData[219] = 0;
  _$jscoverage['/align.js'].lineData[255] = 0;
  _$jscoverage['/align.js'].lineData[256] = 0;
  _$jscoverage['/align.js'].lineData[258] = 0;
  _$jscoverage['/align.js'].lineData[259] = 0;
  _$jscoverage['/align.js'].lineData[260] = 0;
  _$jscoverage['/align.js'].lineData[261] = 0;
  _$jscoverage['/align.js'].lineData[263] = 0;
  _$jscoverage['/align.js'].lineData[264] = 0;
  _$jscoverage['/align.js'].lineData[268] = 0;
  _$jscoverage['/align.js'].lineData[269] = 0;
  _$jscoverage['/align.js'].lineData[271] = 0;
  _$jscoverage['/align.js'].lineData[272] = 0;
  _$jscoverage['/align.js'].lineData[273] = 0;
  _$jscoverage['/align.js'].lineData[282] = 0;
  _$jscoverage['/align.js'].lineData[283] = 0;
  _$jscoverage['/align.js'].lineData[289] = 0;
  _$jscoverage['/align.js'].lineData[290] = 0;
  _$jscoverage['/align.js'].lineData[292] = 0;
  _$jscoverage['/align.js'].lineData[293] = 0;
  _$jscoverage['/align.js'].lineData[294] = 0;
  _$jscoverage['/align.js'].lineData[295] = 0;
  _$jscoverage['/align.js'].lineData[298] = 0;
  _$jscoverage['/align.js'].lineData[299] = 0;
  _$jscoverage['/align.js'].lineData[300] = 0;
  _$jscoverage['/align.js'].lineData[301] = 0;
  _$jscoverage['/align.js'].lineData[304] = 0;
  _$jscoverage['/align.js'].lineData[307] = 0;
  _$jscoverage['/align.js'].lineData[308] = 0;
  _$jscoverage['/align.js'].lineData[309] = 0;
  _$jscoverage['/align.js'].lineData[313] = 0;
  _$jscoverage['/align.js'].lineData[314] = 0;
  _$jscoverage['/align.js'].lineData[315] = 0;
  _$jscoverage['/align.js'].lineData[319] = 0;
  _$jscoverage['/align.js'].lineData[320] = 0;
  _$jscoverage['/align.js'].lineData[323] = 0;
  _$jscoverage['/align.js'].lineData[326] = 0;
  _$jscoverage['/align.js'].lineData[327] = 0;
  _$jscoverage['/align.js'].lineData[328] = 0;
  _$jscoverage['/align.js'].lineData[332] = 0;
  _$jscoverage['/align.js'].lineData[333] = 0;
  _$jscoverage['/align.js'].lineData[346] = 0;
  _$jscoverage['/align.js'].lineData[347] = 0;
  _$jscoverage['/align.js'].lineData[348] = 0;
  _$jscoverage['/align.js'].lineData[350] = 0;
  _$jscoverage['/align.js'].lineData[355] = 0;
  _$jscoverage['/align.js'].lineData[357] = 0;
  _$jscoverage['/align.js'].lineData[359] = 0;
  _$jscoverage['/align.js'].lineData[361] = 0;
  _$jscoverage['/align.js'].lineData[364] = 0;
  _$jscoverage['/align.js'].lineData[367] = 0;
  _$jscoverage['/align.js'].lineData[370] = 0;
  _$jscoverage['/align.js'].lineData[371] = 0;
  _$jscoverage['/align.js'].lineData[373] = 0;
  _$jscoverage['/align.js'].lineData[378] = 0;
  _$jscoverage['/align.js'].lineData[382] = 0;
  _$jscoverage['/align.js'].lineData[383] = 0;
  _$jscoverage['/align.js'].lineData[385] = 0;
  _$jscoverage['/align.js'].lineData[390] = 0;
  _$jscoverage['/align.js'].lineData[394] = 0;
  _$jscoverage['/align.js'].lineData[395] = 0;
  _$jscoverage['/align.js'].lineData[396] = 0;
  _$jscoverage['/align.js'].lineData[399] = 0;
  _$jscoverage['/align.js'].lineData[403] = 0;
  _$jscoverage['/align.js'].lineData[406] = 0;
  _$jscoverage['/align.js'].lineData[410] = 0;
  _$jscoverage['/align.js'].lineData[411] = 0;
  _$jscoverage['/align.js'].lineData[420] = 0;
  _$jscoverage['/align.js'].lineData[428] = 0;
  _$jscoverage['/align.js'].lineData[429] = 0;
  _$jscoverage['/align.js'].lineData[432] = 0;
  _$jscoverage['/align.js'].lineData[433] = 0;
  _$jscoverage['/align.js'].lineData[436] = 0;
  _$jscoverage['/align.js'].lineData[446] = 0;
  _$jscoverage['/align.js'].lineData[447] = 0;
  _$jscoverage['/align.js'].lineData[452] = 0;
  _$jscoverage['/align.js'].lineData[456] = 0;
  _$jscoverage['/align.js'].lineData[457] = 0;
  _$jscoverage['/align.js'].lineData[458] = 0;
  _$jscoverage['/align.js'].lineData[463] = 0;
}
if (! _$jscoverage['/align.js'].functionData) {
  _$jscoverage['/align.js'].functionData = [];
  _$jscoverage['/align.js'].functionData[0] = 0;
  _$jscoverage['/align.js'].functionData[1] = 0;
  _$jscoverage['/align.js'].functionData[2] = 0;
  _$jscoverage['/align.js'].functionData[3] = 0;
  _$jscoverage['/align.js'].functionData[4] = 0;
  _$jscoverage['/align.js'].functionData[5] = 0;
  _$jscoverage['/align.js'].functionData[6] = 0;
  _$jscoverage['/align.js'].functionData[7] = 0;
  _$jscoverage['/align.js'].functionData[8] = 0;
  _$jscoverage['/align.js'].functionData[9] = 0;
  _$jscoverage['/align.js'].functionData[10] = 0;
  _$jscoverage['/align.js'].functionData[11] = 0;
  _$jscoverage['/align.js'].functionData[12] = 0;
  _$jscoverage['/align.js'].functionData[13] = 0;
  _$jscoverage['/align.js'].functionData[14] = 0;
  _$jscoverage['/align.js'].functionData[15] = 0;
  _$jscoverage['/align.js'].functionData[16] = 0;
  _$jscoverage['/align.js'].functionData[17] = 0;
  _$jscoverage['/align.js'].functionData[18] = 0;
  _$jscoverage['/align.js'].functionData[19] = 0;
  _$jscoverage['/align.js'].functionData[20] = 0;
  _$jscoverage['/align.js'].functionData[21] = 0;
}
if (! _$jscoverage['/align.js'].branchData) {
  _$jscoverage['/align.js'].branchData = {};
  _$jscoverage['/align.js'].branchData['38'] = [];
  _$jscoverage['/align.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['38'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['40'] = [];
  _$jscoverage['/align.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['41'] = [];
  _$jscoverage['/align.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['44'] = [];
  _$jscoverage['/align.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['44'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['46'] = [];
  _$jscoverage['/align.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['77'] = [];
  _$jscoverage['/align.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['77'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['81'] = [];
  _$jscoverage['/align.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['81'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'] = [];
  _$jscoverage['/align.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'] = [];
  _$jscoverage['/align.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['110'] = [];
  _$jscoverage['/align.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['110'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['110'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['110'][4] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'] = [];
  _$jscoverage['/align.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'] = [];
  _$jscoverage['/align.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['139'] = [];
  _$jscoverage['/align.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['140'] = [];
  _$jscoverage['/align.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['144'] = [];
  _$jscoverage['/align.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['144'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['145'] = [];
  _$jscoverage['/align.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['155'] = [];
  _$jscoverage['/align.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['160'] = [];
  _$jscoverage['/align.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['161'] = [];
  _$jscoverage['/align.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['161'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'] = [];
  _$jscoverage['/align.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['167'] = [];
  _$jscoverage['/align.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['173'] = [];
  _$jscoverage['/align.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['173'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['178'] = [];
  _$jscoverage['/align.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['179'] = [];
  _$jscoverage['/align.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'] = [];
  _$jscoverage['/align.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['185'] = [];
  _$jscoverage['/align.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['258'] = [];
  _$jscoverage['/align.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['292'] = [];
  _$jscoverage['/align.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['294'] = [];
  _$jscoverage['/align.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['298'] = [];
  _$jscoverage['/align.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['300'] = [];
  _$jscoverage['/align.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['308'] = [];
  _$jscoverage['/align.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['308'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['314'] = [];
  _$jscoverage['/align.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['332'] = [];
  _$jscoverage['/align.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['346'] = [];
  _$jscoverage['/align.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['347'] = [];
  _$jscoverage['/align.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['347'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['348'] = [];
  _$jscoverage['/align.js'].branchData['348'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['367'] = [];
  _$jscoverage['/align.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['370'] = [];
  _$jscoverage['/align.js'].branchData['370'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['382'] = [];
  _$jscoverage['/align.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['394'] = [];
  _$jscoverage['/align.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['403'] = [];
  _$jscoverage['/align.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['406'] = [];
  _$jscoverage['/align.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['410'] = [];
  _$jscoverage['/align.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['428'] = [];
  _$jscoverage['/align.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['432'] = [];
  _$jscoverage['/align.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['457'] = [];
  _$jscoverage['/align.js'].branchData['457'][1] = new BranchData();
}
_$jscoverage['/align.js'].branchData['457'][1].init(46, 8, 'self.$el');
function visit69_457_1(result) {
  _$jscoverage['/align.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['432'][1].init(3175, 38, 'newElRegion.height !== elRegion.height');
function visit68_432_1(result) {
  _$jscoverage['/align.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['428'][1].init(3020, 36, 'newElRegion.width !== elRegion.width');
function visit67_428_1(result) {
  _$jscoverage['/align.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['410'][1].init(1459, 48, 'newOverflowCfg.adjustX || newOverflowCfg.adjustY');
function visit66_410_1(result) {
  _$jscoverage['/align.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['406'][1].init(1316, 83, 'overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect)');
function visit65_406_1(result) {
  _$jscoverage['/align.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['403'][1].init(1189, 83, 'overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect)');
function visit64_403_1(result) {
  _$jscoverage['/align.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['394'][1].init(857, 4, 'fail');
function visit63_394_1(result) {
  _$jscoverage['/align.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['382'][1].init(447, 43, 'isFailY(elFuturePos, elRegion, visibleRect)');
function visit62_382_1(result) {
  _$jscoverage['/align.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['370'][1].init(50, 43, 'isFailX(elFuturePos, elRegion, visibleRect)');
function visit61_370_1(result) {
  _$jscoverage['/align.js'].branchData['370'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['367'][2].init(809, 36, 'overflow.adjustX || overflow.adjustY');
function visit60_367_2(result) {
  _$jscoverage['/align.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['367'][1].init(793, 53, 'visibleRect && (overflow.adjustX || overflow.adjustY)');
function visit59_367_1(result) {
  _$jscoverage['/align.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['348'][1].init(132, 14, 'overflow || {}');
function visit58_348_1(result) {
  _$jscoverage['/align.js'].branchData['348'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['347'][2].init(70, 27, 'offset && [].concat(offset)');
function visit57_347_2(result) {
  _$jscoverage['/align.js'].branchData['347'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['347'][1].init(70, 37, 'offset && [].concat(offset) || [0, 0]');
function visit56_347_1(result) {
  _$jscoverage['/align.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['346'][1].init(32, 14, 'refNode || win');
function visit55_346_1(result) {
  _$jscoverage['/align.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['332'][1].init(17, 13, 'v && v.points');
function visit54_332_1(result) {
  _$jscoverage['/align.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['314'][1].init(13, 19, 'this.get(\'visible\')');
function visit53_314_1(result) {
  _$jscoverage['/align.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['308'][2].init(13, 17, 'e.target === this');
function visit52_308_2(result) {
  _$jscoverage['/align.js'].branchData['308'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['308'][1].init(13, 29, 'e.target === this && e.newVal');
function visit51_308_1(result) {
  _$jscoverage['/align.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['300'][1].init(378, 9, 'H === \'r\'');
function visit50_300_1(result) {
  _$jscoverage['/align.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['298'][1].init(321, 9, 'H === \'c\'');
function visit49_298_1(result) {
  _$jscoverage['/align.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['294'][1].init(266, 9, 'V === \'b\'');
function visit48_294_1(result) {
  _$jscoverage['/align.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['292'][1].init(209, 9, 'V === \'c\'');
function visit47_292_1(result) {
  _$jscoverage['/align.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['258'][1].init(70, 20, '!S.isWindow(domNode)');
function visit46_258_1(result) {
  _$jscoverage['/align.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['185'][2].init(1382, 42, 'pos.top + size.height > visibleRect.bottom');
function visit45_185_2(result) {
  _$jscoverage['/align.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['185'][1].init(1362, 62, 'overflow.adjustY && pos.top + size.height > visibleRect.bottom');
function visit44_185_1(result) {
  _$jscoverage['/align.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][1].init(41, 42, 'pos.top + size.height > visibleRect.bottom');
function visit43_180_1(result) {
  _$jscoverage['/align.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['179'][2].init(1123, 26, 'pos.top >= visibleRect.top');
function visit42_179_2(result) {
  _$jscoverage['/align.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['179'][1].init(36, 84, 'pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit41_179_1(result) {
  _$jscoverage['/align.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['178'][1].init(1084, 121, 'overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit40_178_1(result) {
  _$jscoverage['/align.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['173'][2].init(914, 25, 'pos.top < visibleRect.top');
function visit39_173_2(result) {
  _$jscoverage['/align.js'].branchData['173'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['173'][1].init(894, 45, 'overflow.adjustY && pos.top < visibleRect.top');
function visit38_173_1(result) {
  _$jscoverage['/align.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['167'][2].init(658, 41, 'pos.left + size.width > visibleRect.right');
function visit37_167_2(result) {
  _$jscoverage['/align.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['167'][1].init(638, 61, 'overflow.adjustX && pos.left + size.width > visibleRect.right');
function visit36_167_1(result) {
  _$jscoverage['/align.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][1].init(43, 41, 'pos.left + size.width > visibleRect.right');
function visit35_162_1(result) {
  _$jscoverage['/align.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['161'][2].init(401, 28, 'pos.left >= visibleRect.left');
function visit34_161_2(result) {
  _$jscoverage['/align.js'].branchData['161'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['161'][1].init(35, 85, 'pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit33_161_1(result) {
  _$jscoverage['/align.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['160'][1].init(363, 121, 'overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit32_160_1(result) {
  _$jscoverage['/align.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['155'][2].init(189, 27, 'pos.left < visibleRect.left');
function visit31_155_2(result) {
  _$jscoverage['/align.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['155'][1].init(169, 47, 'overflow.adjustX && pos.left < visibleRect.left');
function visit30_155_1(result) {
  _$jscoverage['/align.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['145'][1].init(48, 54, 'elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit29_145_1(result) {
  _$jscoverage['/align.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['144'][2].init(16, 33, 'elFuturePos.top < visibleRect.top');
function visit28_144_2(result) {
  _$jscoverage['/align.js'].branchData['144'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['144'][1].init(16, 103, 'elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit27_144_1(result) {
  _$jscoverage['/align.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['140'][1].init(50, 53, 'elFuturePos.left + elRegion.width > visibleRect.right');
function visit26_140_1(result) {
  _$jscoverage['/align.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['139'][2].init(16, 35, 'elFuturePos.left < visibleRect.left');
function visit25_139_2(result) {
  _$jscoverage['/align.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['139'][1].init(16, 104, 'elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right');
function visit24_139_1(result) {
  _$jscoverage['/align.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][1].init(119, 36, 'visibleRect.right > visibleRect.left');
function visit23_112_1(result) {
  _$jscoverage['/align.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][2].init(70, 36, 'visibleRect.bottom > visibleRect.top');
function visit22_111_2(result) {
  _$jscoverage['/align.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][1].init(36, 88, 'visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit21_111_1(result) {
  _$jscoverage['/align.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['110'][4].init(32, 21, 'visibleRect.left >= 0');
function visit20_110_4(result) {
  _$jscoverage['/align.js'].branchData['110'][4].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['110'][3].init(23, 125, 'visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit19_110_3(result) {
  _$jscoverage['/align.js'].branchData['110'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['110'][2].init(7, 20, 'visibleRect.top >= 0');
function visit18_110_2(result) {
  _$jscoverage['/align.js'].branchData['110'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['110'][1].init(-1, 149, 'visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit17_110_1(result) {
  _$jscoverage['/align.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][1].init(45, 35, '$(el).css(\'overflow\') !== \'visible\'');
function visit16_83_1(result) {
  _$jscoverage['/align.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][2].init(307, 22, 'el !== documentElement');
function visit15_82_2(result) {
  _$jscoverage['/align.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][1].init(34, 81, 'el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit14_82_1(result) {
  _$jscoverage['/align.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['81'][2].init(270, 11, 'el !== body');
function visit13_81_2(result) {
  _$jscoverage['/align.js'].branchData['81'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['81'][1].init(270, 116, 'el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit12_81_1(result) {
  _$jscoverage['/align.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['77'][3].init(96, 20, 'el.clientWidth !== 0');
function visit11_77_3(result) {
  _$jscoverage['/align.js'].branchData['77'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['77'][2].init(86, 30, '!UA.ie || el.clientWidth !== 0');
function visit10_77_2(result) {
  _$jscoverage['/align.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['77'][1].init(86, 388, '(!UA.ie || el.clientWidth !== 0) && (el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\')');
function visit9_77_1(result) {
  _$jscoverage['/align.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['46'][1].init(72, 26, 'positionStyle !== \'static\'');
function visit8_46_1(result) {
  _$jscoverage['/align.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['44'][2].init(1049, 15, 'parent !== body');
function visit7_44_2(result) {
  _$jscoverage['/align.js'].branchData['44'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['44'][1].init(1039, 25, 'parent && parent !== body');
function visit6_44_1(result) {
  _$jscoverage['/align.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['41'][1].init(20, 41, 'element.nodeName.toLowerCase() === \'html\'');
function visit5_41_1(result) {
  _$jscoverage['/align.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['40'][1].init(881, 11, '!skipStatic');
function visit4_40_1(result) {
  _$jscoverage['/align.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['38'][3].init(191, 28, 'positionStyle === \'absolute\'');
function visit3_38_3(result) {
  _$jscoverage['/align.js'].branchData['38'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['38'][2].init(162, 25, 'positionStyle === \'fixed\'');
function visit2_38_2(result) {
  _$jscoverage['/align.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['38'][1].init(162, 57, 'positionStyle === \'fixed\' || positionStyle === \'absolute\'');
function visit1_38_1(result) {
  _$jscoverage['/align.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/align.js'].functionData[0]++;
  _$jscoverage['/align.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/align.js'].lineData[8]++;
  var win = S.Env.host, $ = Node.all, UA = require('ua');
  _$jscoverage['/align.js'].lineData[18]++;
  function getOffsetParent(element) {
    _$jscoverage['/align.js'].functionData[1]++;
    _$jscoverage['/align.js'].lineData[34]++;
    var doc = element.ownerDocument, body = doc.body, parent, positionStyle = $(element).css('position'), skipStatic = visit1_38_1(visit2_38_2(positionStyle === 'fixed') || visit3_38_3(positionStyle === 'absolute'));
    _$jscoverage['/align.js'].lineData[40]++;
    if (visit4_40_1(!skipStatic)) {
      _$jscoverage['/align.js'].lineData[41]++;
      return visit5_41_1(element.nodeName.toLowerCase() === 'html') ? null : element.parentNode;
    }
    _$jscoverage['/align.js'].lineData[44]++;
    for (parent = element.parentNode; visit6_44_1(parent && visit7_44_2(parent !== body)); parent = parent.parentNode) {
      _$jscoverage['/align.js'].lineData[45]++;
      positionStyle = $(parent).css('position');
      _$jscoverage['/align.js'].lineData[46]++;
      if (visit8_46_1(positionStyle !== 'static')) {
        _$jscoverage['/align.js'].lineData[47]++;
        return parent;
      }
    }
    _$jscoverage['/align.js'].lineData[50]++;
    return null;
  }
  _$jscoverage['/align.js'].lineData[57]++;
  function getVisibleRectForElement(element) {
    _$jscoverage['/align.js'].functionData[2]++;
    _$jscoverage['/align.js'].lineData[58]++;
    var visibleRect = {
  left: 0, 
  right: Infinity, 
  top: 0, 
  bottom: Infinity}, el, scrollX, scrollY, winSize, doc = element.ownerDocument, $win = $(doc).getWindow(), body = doc.body, documentElement = doc.documentElement;
    _$jscoverage['/align.js'].lineData[75]++;
    for (el = element; (el = getOffsetParent(el)); ) {
      _$jscoverage['/align.js'].lineData[77]++;
      if (visit9_77_1((visit10_77_2(!UA.ie || visit11_77_3(el.clientWidth !== 0))) && (visit12_81_1(visit13_81_2(el !== body) && visit14_82_1(visit15_82_2(el !== documentElement) && visit16_83_1($(el).css('overflow') !== 'visible')))))) {
        _$jscoverage['/align.js'].lineData[84]++;
        var pos = $(el).offset();
        _$jscoverage['/align.js'].lineData[86]++;
        pos.left += el.clientLeft;
        _$jscoverage['/align.js'].lineData[87]++;
        pos.top += el.clientTop;
        _$jscoverage['/align.js'].lineData[89]++;
        visibleRect.top = Math.max(visibleRect.top, pos.top);
        _$jscoverage['/align.js'].lineData[90]++;
        visibleRect.right = Math.min(visibleRect.right, pos.left + el.clientWidth);
        _$jscoverage['/align.js'].lineData[93]++;
        visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
        _$jscoverage['/align.js'].lineData[95]++;
        visibleRect.left = Math.max(visibleRect.left, pos.left);
      }
    }
    _$jscoverage['/align.js'].lineData[100]++;
    scrollX = $win.scrollLeft();
    _$jscoverage['/align.js'].lineData[101]++;
    scrollY = $win.scrollTop();
    _$jscoverage['/align.js'].lineData[102]++;
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    _$jscoverage['/align.js'].lineData[103]++;
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    _$jscoverage['/align.js'].lineData[104]++;
    winSize = {
  width: $win.width(), 
  height: $win.height()};
    _$jscoverage['/align.js'].lineData[108]++;
    visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
    _$jscoverage['/align.js'].lineData[109]++;
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
    _$jscoverage['/align.js'].lineData[110]++;
    return visit17_110_1(visit18_110_2(visibleRect.top >= 0) && visit19_110_3(visit20_110_4(visibleRect.left >= 0) && visit21_111_1(visit22_111_2(visibleRect.bottom > visibleRect.top) && visit23_112_1(visibleRect.right > visibleRect.left)))) ? visibleRect : null;
  }
  _$jscoverage['/align.js'].lineData[116]++;
  function getElFuturePos(elRegion, refNodeRegion, points, offset) {
    _$jscoverage['/align.js'].functionData[3]++;
    _$jscoverage['/align.js'].lineData[117]++;
    var xy, diff, p1, p2;
    _$jscoverage['/align.js'].lineData[122]++;
    xy = {
  left: elRegion.left, 
  top: elRegion.top};
    _$jscoverage['/align.js'].lineData[127]++;
    p1 = getAlignOffset(refNodeRegion, points[0]);
    _$jscoverage['/align.js'].lineData[128]++;
    p2 = getAlignOffset(elRegion, points[1]);
    _$jscoverage['/align.js'].lineData[130]++;
    diff = [p2.left - p1.left, p2.top - p1.top];
    _$jscoverage['/align.js'].lineData[132]++;
    return {
  left: xy.left - diff[0] + (+offset[0]), 
  top: xy.top - diff[1] + (+offset[1])};
  }
  _$jscoverage['/align.js'].lineData[138]++;
  function isFailX(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[4]++;
    _$jscoverage['/align.js'].lineData[139]++;
    return visit24_139_1(visit25_139_2(elFuturePos.left < visibleRect.left) || visit26_140_1(elFuturePos.left + elRegion.width > visibleRect.right));
  }
  _$jscoverage['/align.js'].lineData[143]++;
  function isFailY(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[5]++;
    _$jscoverage['/align.js'].lineData[144]++;
    return visit27_144_1(visit28_144_2(elFuturePos.top < visibleRect.top) || visit29_145_1(elFuturePos.top + elRegion.height > visibleRect.bottom));
  }
  _$jscoverage['/align.js'].lineData[148]++;
  function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
    _$jscoverage['/align.js'].functionData[6]++;
    _$jscoverage['/align.js'].lineData[149]++;
    var pos = S.clone(elFuturePos), size = {
  width: elRegion.width, 
  height: elRegion.height};
    _$jscoverage['/align.js'].lineData[155]++;
    if (visit30_155_1(overflow.adjustX && visit31_155_2(pos.left < visibleRect.left))) {
      _$jscoverage['/align.js'].lineData[156]++;
      pos.left = visibleRect.left;
    }
    _$jscoverage['/align.js'].lineData[160]++;
    if (visit32_160_1(overflow.resizeWidth && visit33_161_1(visit34_161_2(pos.left >= visibleRect.left) && visit35_162_1(pos.left + size.width > visibleRect.right)))) {
      _$jscoverage['/align.js'].lineData[163]++;
      size.width -= (pos.left + size.width) - visibleRect.right;
    }
    _$jscoverage['/align.js'].lineData[167]++;
    if (visit36_167_1(overflow.adjustX && visit37_167_2(pos.left + size.width > visibleRect.right))) {
      _$jscoverage['/align.js'].lineData[169]++;
      pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
    }
    _$jscoverage['/align.js'].lineData[173]++;
    if (visit38_173_1(overflow.adjustY && visit39_173_2(pos.top < visibleRect.top))) {
      _$jscoverage['/align.js'].lineData[174]++;
      pos.top = visibleRect.top;
    }
    _$jscoverage['/align.js'].lineData[178]++;
    if (visit40_178_1(overflow.resizeHeight && visit41_179_1(visit42_179_2(pos.top >= visibleRect.top) && visit43_180_1(pos.top + size.height > visibleRect.bottom)))) {
      _$jscoverage['/align.js'].lineData[181]++;
      size.height -= (pos.top + size.height) - visibleRect.bottom;
    }
    _$jscoverage['/align.js'].lineData[185]++;
    if (visit44_185_1(overflow.adjustY && visit45_185_2(pos.top + size.height > visibleRect.bottom))) {
      _$jscoverage['/align.js'].lineData[187]++;
      pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
    }
    _$jscoverage['/align.js'].lineData[190]++;
    return S.mix(pos, size);
  }
  _$jscoverage['/align.js'].lineData[193]++;
  function flip(points, reg, map) {
    _$jscoverage['/align.js'].functionData[7]++;
    _$jscoverage['/align.js'].lineData[194]++;
    var ret = [];
    _$jscoverage['/align.js'].lineData[195]++;
    S.each(points, function(p) {
  _$jscoverage['/align.js'].functionData[8]++;
  _$jscoverage['/align.js'].lineData[196]++;
  ret.push(p.replace(reg, function(m) {
  _$jscoverage['/align.js'].functionData[9]++;
  _$jscoverage['/align.js'].lineData[197]++;
  return map[m];
}));
});
    _$jscoverage['/align.js'].lineData[200]++;
    return ret;
  }
  _$jscoverage['/align.js'].lineData[203]++;
  function flipOffset(offset, index) {
    _$jscoverage['/align.js'].functionData[10]++;
    _$jscoverage['/align.js'].lineData[204]++;
    offset[index] = -offset[index];
    _$jscoverage['/align.js'].lineData[205]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[212]++;
  function Align() {
    _$jscoverage['/align.js'].functionData[11]++;
  }
  _$jscoverage['/align.js'].lineData[215]++;
  Align.__getOffsetParent = getOffsetParent;
  _$jscoverage['/align.js'].lineData[217]++;
  Align.__getVisibleRectForElement = getVisibleRectForElement;
  _$jscoverage['/align.js'].lineData[219]++;
  Align.ATTRS = {
  align: {
  value: {}}};
  _$jscoverage['/align.js'].lineData[255]++;
  function getRegion(node) {
    _$jscoverage['/align.js'].functionData[12]++;
    _$jscoverage['/align.js'].lineData[256]++;
    var offset, w, h, domNode = node[0];
    _$jscoverage['/align.js'].lineData[258]++;
    if (visit46_258_1(!S.isWindow(domNode))) {
      _$jscoverage['/align.js'].lineData[259]++;
      offset = node.offset();
      _$jscoverage['/align.js'].lineData[260]++;
      w = node.outerWidth();
      _$jscoverage['/align.js'].lineData[261]++;
      h = node.outerHeight();
    } else {
      _$jscoverage['/align.js'].lineData[263]++;
      var $win = $(domNode).getWindow();
      _$jscoverage['/align.js'].lineData[264]++;
      offset = {
  left: $win.scrollLeft(), 
  top: $win.scrollTop()};
      _$jscoverage['/align.js'].lineData[268]++;
      w = $win.width();
      _$jscoverage['/align.js'].lineData[269]++;
      h = $win.height();
    }
    _$jscoverage['/align.js'].lineData[271]++;
    offset.width = w;
    _$jscoverage['/align.js'].lineData[272]++;
    offset.height = h;
    _$jscoverage['/align.js'].lineData[273]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[282]++;
  function getAlignOffset(region, align) {
    _$jscoverage['/align.js'].functionData[13]++;
    _$jscoverage['/align.js'].lineData[283]++;
    var V = align.charAt(0), H = align.charAt(1), w = region.width, h = region.height, x, y;
    _$jscoverage['/align.js'].lineData[289]++;
    x = region.left;
    _$jscoverage['/align.js'].lineData[290]++;
    y = region.top;
    _$jscoverage['/align.js'].lineData[292]++;
    if (visit47_292_1(V === 'c')) {
      _$jscoverage['/align.js'].lineData[293]++;
      y += h / 2;
    } else {
      _$jscoverage['/align.js'].lineData[294]++;
      if (visit48_294_1(V === 'b')) {
        _$jscoverage['/align.js'].lineData[295]++;
        y += h;
      }
    }
    _$jscoverage['/align.js'].lineData[298]++;
    if (visit49_298_1(H === 'c')) {
      _$jscoverage['/align.js'].lineData[299]++;
      x += w / 2;
    } else {
      _$jscoverage['/align.js'].lineData[300]++;
      if (visit50_300_1(H === 'r')) {
        _$jscoverage['/align.js'].lineData[301]++;
        x += w;
      }
    }
    _$jscoverage['/align.js'].lineData[304]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/align.js'].lineData[307]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/align.js'].functionData[14]++;
    _$jscoverage['/align.js'].lineData[308]++;
    if (visit51_308_1(visit52_308_2(e.target === this) && e.newVal)) {
      _$jscoverage['/align.js'].lineData[309]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[313]++;
  function onResize() {
    _$jscoverage['/align.js'].functionData[15]++;
    _$jscoverage['/align.js'].lineData[314]++;
    if (visit53_314_1(this.get('visible'))) {
      _$jscoverage['/align.js'].lineData[315]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[319]++;
  function realign() {
    _$jscoverage['/align.js'].functionData[16]++;
    _$jscoverage['/align.js'].lineData[320]++;
    this._onSetAlign(this.get('align'));
  }
  _$jscoverage['/align.js'].lineData[323]++;
  Align.prototype = {
  __bindUI: function() {
  _$jscoverage['/align.js'].functionData[17]++;
  _$jscoverage['/align.js'].lineData[326]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[327]++;
  self.on('beforeVisibleChange', beforeVisibleChange, self);
  _$jscoverage['/align.js'].lineData[328]++;
  self.$el.getWindow().on('resize', onResize, self);
}, 
  _onSetAlign: function(v) {
  _$jscoverage['/align.js'].functionData[18]++;
  _$jscoverage['/align.js'].lineData[332]++;
  if (visit54_332_1(v && v.points)) {
    _$jscoverage['/align.js'].lineData[333]++;
    this.align(v.node, v.points, v.offset, v.overflow);
  }
}, 
  align: function(refNode, points, offset, overflow) {
  _$jscoverage['/align.js'].functionData[19]++;
  _$jscoverage['/align.js'].lineData[346]++;
  refNode = Node.one(visit55_346_1(refNode || win));
  _$jscoverage['/align.js'].lineData[347]++;
  offset = visit56_347_1(visit57_347_2(offset && [].concat(offset)) || [0, 0]);
  _$jscoverage['/align.js'].lineData[348]++;
  overflow = visit58_348_1(overflow || {});
  _$jscoverage['/align.js'].lineData[350]++;
  var self = this, el = self.$el, fail = 0;
  _$jscoverage['/align.js'].lineData[355]++;
  var visibleRect = getVisibleRectForElement(el[0]);
  _$jscoverage['/align.js'].lineData[357]++;
  var elRegion = getRegion(el);
  _$jscoverage['/align.js'].lineData[359]++;
  var refNodeRegion = getRegion(refNode);
  _$jscoverage['/align.js'].lineData[361]++;
  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
  _$jscoverage['/align.js'].lineData[364]++;
  var newElRegion = S.merge(elRegion, elFuturePos);
  _$jscoverage['/align.js'].lineData[367]++;
  if (visit59_367_1(visibleRect && (visit60_367_2(overflow.adjustX || overflow.adjustY)))) {
    _$jscoverage['/align.js'].lineData[370]++;
    if (visit61_370_1(isFailX(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[371]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[373]++;
      points = flip(points, /[lr]/ig, {
  l: 'r', 
  r: 'l'});
      _$jscoverage['/align.js'].lineData[378]++;
      offset = flipOffset(offset, 0);
    }
    _$jscoverage['/align.js'].lineData[382]++;
    if (visit62_382_1(isFailY(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[383]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[385]++;
      points = flip(points, /[tb]/ig, {
  t: 'b', 
  b: 't'});
      _$jscoverage['/align.js'].lineData[390]++;
      offset = flipOffset(offset, 1);
    }
    _$jscoverage['/align.js'].lineData[394]++;
    if (visit63_394_1(fail)) {
      _$jscoverage['/align.js'].lineData[395]++;
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
      _$jscoverage['/align.js'].lineData[396]++;
      S.mix(newElRegion, elFuturePos);
    }
    _$jscoverage['/align.js'].lineData[399]++;
    var newOverflowCfg = {};
    _$jscoverage['/align.js'].lineData[403]++;
    newOverflowCfg.adjustX = visit64_403_1(overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[406]++;
    newOverflowCfg.adjustY = visit65_406_1(overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[410]++;
    if (visit66_410_1(newOverflowCfg.adjustX || newOverflowCfg.adjustY)) {
      _$jscoverage['/align.js'].lineData[411]++;
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  _$jscoverage['/align.js'].lineData[420]++;
  self.set({
  x: newElRegion.left, 
  y: newElRegion.top}, {
  force: 1});
  _$jscoverage['/align.js'].lineData[428]++;
  if (visit67_428_1(newElRegion.width !== elRegion.width)) {
    _$jscoverage['/align.js'].lineData[429]++;
    self.set('width', el.width() + newElRegion.width - elRegion.width);
  }
  _$jscoverage['/align.js'].lineData[432]++;
  if (visit68_432_1(newElRegion.height !== elRegion.height)) {
    _$jscoverage['/align.js'].lineData[433]++;
    self.set('height', el.height() + newElRegion.height - elRegion.height);
  }
  _$jscoverage['/align.js'].lineData[436]++;
  return self;
}, 
  center: function(node) {
  _$jscoverage['/align.js'].functionData[20]++;
  _$jscoverage['/align.js'].lineData[446]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[447]++;
  self.set('align', {
  node: node, 
  points: ['cc', 'cc'], 
  offset: [0, 0]});
  _$jscoverage['/align.js'].lineData[452]++;
  return self;
}, 
  __destructor: function() {
  _$jscoverage['/align.js'].functionData[21]++;
  _$jscoverage['/align.js'].lineData[456]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[457]++;
  if (visit69_457_1(self.$el)) {
    _$jscoverage['/align.js'].lineData[458]++;
    self.$el.getWindow().detach('resize', onResize, self);
  }
}};
  _$jscoverage['/align.js'].lineData[463]++;
  return Align;
});
