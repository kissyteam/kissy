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
if (! _$jscoverage['/base/observable.js']) {
  _$jscoverage['/base/observable.js'] = {};
  _$jscoverage['/base/observable.js'].lineData = [];
  _$jscoverage['/base/observable.js'].lineData[6] = 0;
  _$jscoverage['/base/observable.js'].lineData[7] = 0;
  _$jscoverage['/base/observable.js'].lineData[8] = 0;
  _$jscoverage['/base/observable.js'].lineData[9] = 0;
  _$jscoverage['/base/observable.js'].lineData[10] = 0;
  _$jscoverage['/base/observable.js'].lineData[11] = 0;
  _$jscoverage['/base/observable.js'].lineData[12] = 0;
  _$jscoverage['/base/observable.js'].lineData[18] = 0;
  _$jscoverage['/base/observable.js'].lineData[19] = 0;
  _$jscoverage['/base/observable.js'].lineData[28] = 0;
  _$jscoverage['/base/observable.js'].lineData[29] = 0;
  _$jscoverage['/base/observable.js'].lineData[30] = 0;
  _$jscoverage['/base/observable.js'].lineData[31] = 0;
  _$jscoverage['/base/observable.js'].lineData[38] = 0;
  _$jscoverage['/base/observable.js'].lineData[41] = 0;
  _$jscoverage['/base/observable.js'].lineData[48] = 0;
  _$jscoverage['/base/observable.js'].lineData[49] = 0;
  _$jscoverage['/base/observable.js'].lineData[56] = 0;
  _$jscoverage['/base/observable.js'].lineData[57] = 0;
  _$jscoverage['/base/observable.js'].lineData[58] = 0;
  _$jscoverage['/base/observable.js'].lineData[59] = 0;
  _$jscoverage['/base/observable.js'].lineData[78] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[102] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[105] = 0;
  _$jscoverage['/base/observable.js'].lineData[106] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[109] = 0;
  _$jscoverage['/base/observable.js'].lineData[111] = 0;
  _$jscoverage['/base/observable.js'].lineData[112] = 0;
  _$jscoverage['/base/observable.js'].lineData[115] = 0;
  _$jscoverage['/base/observable.js'].lineData[116] = 0;
  _$jscoverage['/base/observable.js'].lineData[122] = 0;
  _$jscoverage['/base/observable.js'].lineData[128] = 0;
  _$jscoverage['/base/observable.js'].lineData[129] = 0;
  _$jscoverage['/base/observable.js'].lineData[139] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[142] = 0;
  _$jscoverage['/base/observable.js'].lineData[143] = 0;
  _$jscoverage['/base/observable.js'].lineData[144] = 0;
  _$jscoverage['/base/observable.js'].lineData[147] = 0;
  _$jscoverage['/base/observable.js'].lineData[149] = 0;
  _$jscoverage['/base/observable.js'].lineData[151] = 0;
  _$jscoverage['/base/observable.js'].lineData[156] = 0;
  _$jscoverage['/base/observable.js'].lineData[157] = 0;
  _$jscoverage['/base/observable.js'].lineData[164] = 0;
  _$jscoverage['/base/observable.js'].lineData[173] = 0;
  _$jscoverage['/base/observable.js'].lineData[175] = 0;
  _$jscoverage['/base/observable.js'].lineData[184] = 0;
  _$jscoverage['/base/observable.js'].lineData[185] = 0;
  _$jscoverage['/base/observable.js'].lineData[188] = 0;
  _$jscoverage['/base/observable.js'].lineData[189] = 0;
  _$jscoverage['/base/observable.js'].lineData[190] = 0;
  _$jscoverage['/base/observable.js'].lineData[195] = 0;
  _$jscoverage['/base/observable.js'].lineData[198] = 0;
  _$jscoverage['/base/observable.js'].lineData[199] = 0;
  _$jscoverage['/base/observable.js'].lineData[205] = 0;
  _$jscoverage['/base/observable.js'].lineData[217] = 0;
  _$jscoverage['/base/observable.js'].lineData[218] = 0;
  _$jscoverage['/base/observable.js'].lineData[220] = 0;
  _$jscoverage['/base/observable.js'].lineData[223] = 0;
  _$jscoverage['/base/observable.js'].lineData[226] = 0;
  _$jscoverage['/base/observable.js'].lineData[227] = 0;
  _$jscoverage['/base/observable.js'].lineData[228] = 0;
  _$jscoverage['/base/observable.js'].lineData[230] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[232] = 0;
  _$jscoverage['/base/observable.js'].lineData[233] = 0;
  _$jscoverage['/base/observable.js'].lineData[237] = 0;
  _$jscoverage['/base/observable.js'].lineData[238] = 0;
  _$jscoverage['/base/observable.js'].lineData[240] = 0;
  _$jscoverage['/base/observable.js'].lineData[243] = 0;
  _$jscoverage['/base/observable.js'].lineData[246] = 0;
  _$jscoverage['/base/observable.js'].lineData[249] = 0;
  _$jscoverage['/base/observable.js'].lineData[251] = 0;
  _$jscoverage['/base/observable.js'].lineData[255] = 0;
  _$jscoverage['/base/observable.js'].lineData[258] = 0;
  _$jscoverage['/base/observable.js'].lineData[261] = 0;
  _$jscoverage['/base/observable.js'].lineData[264] = 0;
  _$jscoverage['/base/observable.js'].lineData[272] = 0;
  _$jscoverage['/base/observable.js'].lineData[278] = 0;
  _$jscoverage['/base/observable.js'].lineData[279] = 0;
  _$jscoverage['/base/observable.js'].lineData[280] = 0;
  _$jscoverage['/base/observable.js'].lineData[284] = 0;
  _$jscoverage['/base/observable.js'].lineData[287] = 0;
  _$jscoverage['/base/observable.js'].lineData[288] = 0;
  _$jscoverage['/base/observable.js'].lineData[289] = 0;
  _$jscoverage['/base/observable.js'].lineData[291] = 0;
  _$jscoverage['/base/observable.js'].lineData[292] = 0;
  _$jscoverage['/base/observable.js'].lineData[293] = 0;
  _$jscoverage['/base/observable.js'].lineData[295] = 0;
  _$jscoverage['/base/observable.js'].lineData[299] = 0;
  _$jscoverage['/base/observable.js'].lineData[300] = 0;
  _$jscoverage['/base/observable.js'].lineData[310] = 0;
  _$jscoverage['/base/observable.js'].lineData[321] = 0;
  _$jscoverage['/base/observable.js'].lineData[322] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[326] = 0;
  _$jscoverage['/base/observable.js'].lineData[329] = 0;
  _$jscoverage['/base/observable.js'].lineData[332] = 0;
  _$jscoverage['/base/observable.js'].lineData[333] = 0;
  _$jscoverage['/base/observable.js'].lineData[335] = 0;
  _$jscoverage['/base/observable.js'].lineData[336] = 0;
  _$jscoverage['/base/observable.js'].lineData[337] = 0;
  _$jscoverage['/base/observable.js'].lineData[338] = 0;
  _$jscoverage['/base/observable.js'].lineData[367] = 0;
  _$jscoverage['/base/observable.js'].lineData[369] = 0;
  _$jscoverage['/base/observable.js'].lineData[370] = 0;
  _$jscoverage['/base/observable.js'].lineData[372] = 0;
  _$jscoverage['/base/observable.js'].lineData[373] = 0;
  _$jscoverage['/base/observable.js'].lineData[375] = 0;
  _$jscoverage['/base/observable.js'].lineData[376] = 0;
  _$jscoverage['/base/observable.js'].lineData[381] = 0;
  _$jscoverage['/base/observable.js'].lineData[384] = 0;
  _$jscoverage['/base/observable.js'].lineData[387] = 0;
  _$jscoverage['/base/observable.js'].lineData[391] = 0;
  _$jscoverage['/base/observable.js'].lineData[398] = 0;
  _$jscoverage['/base/observable.js'].lineData[399] = 0;
  _$jscoverage['/base/observable.js'].lineData[400] = 0;
  _$jscoverage['/base/observable.js'].lineData[401] = 0;
  _$jscoverage['/base/observable.js'].lineData[404] = 0;
  _$jscoverage['/base/observable.js'].lineData[405] = 0;
  _$jscoverage['/base/observable.js'].lineData[408] = 0;
  _$jscoverage['/base/observable.js'].lineData[412] = 0;
  _$jscoverage['/base/observable.js'].lineData[413] = 0;
  _$jscoverage['/base/observable.js'].lineData[414] = 0;
  _$jscoverage['/base/observable.js'].lineData[420] = 0;
  _$jscoverage['/base/observable.js'].lineData[428] = 0;
  _$jscoverage['/base/observable.js'].lineData[430] = 0;
  _$jscoverage['/base/observable.js'].lineData[432] = 0;
  _$jscoverage['/base/observable.js'].lineData[433] = 0;
  _$jscoverage['/base/observable.js'].lineData[435] = 0;
  _$jscoverage['/base/observable.js'].lineData[436] = 0;
  _$jscoverage['/base/observable.js'].lineData[439] = 0;
  _$jscoverage['/base/observable.js'].lineData[443] = 0;
  _$jscoverage['/base/observable.js'].lineData[444] = 0;
  _$jscoverage['/base/observable.js'].lineData[445] = 0;
  _$jscoverage['/base/observable.js'].lineData[446] = 0;
  _$jscoverage['/base/observable.js'].lineData[448] = 0;
  _$jscoverage['/base/observable.js'].lineData[451] = 0;
}
if (! _$jscoverage['/base/observable.js'].functionData) {
  _$jscoverage['/base/observable.js'].functionData = [];
  _$jscoverage['/base/observable.js'].functionData[0] = 0;
  _$jscoverage['/base/observable.js'].functionData[1] = 0;
  _$jscoverage['/base/observable.js'].functionData[2] = 0;
  _$jscoverage['/base/observable.js'].functionData[3] = 0;
  _$jscoverage['/base/observable.js'].functionData[4] = 0;
  _$jscoverage['/base/observable.js'].functionData[5] = 0;
  _$jscoverage['/base/observable.js'].functionData[6] = 0;
  _$jscoverage['/base/observable.js'].functionData[7] = 0;
  _$jscoverage['/base/observable.js'].functionData[8] = 0;
  _$jscoverage['/base/observable.js'].functionData[9] = 0;
  _$jscoverage['/base/observable.js'].functionData[10] = 0;
}
if (! _$jscoverage['/base/observable.js'].branchData) {
  _$jscoverage['/base/observable.js'].branchData = {};
  _$jscoverage['/base/observable.js'].branchData['43'] = [];
  _$jscoverage['/base/observable.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['48'] = [];
  _$jscoverage['/base/observable.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['90'] = [];
  _$jscoverage['/base/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['97'] = [];
  _$jscoverage['/base/observable.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['98'] = [];
  _$jscoverage['/base/observable.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['99'] = [];
  _$jscoverage['/base/observable.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['99'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['103'] = [];
  _$jscoverage['/base/observable.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['108'] = [];
  _$jscoverage['/base/observable.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['111'] = [];
  _$jscoverage['/base/observable.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['115'] = [];
  _$jscoverage['/base/observable.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['122'] = [];
  _$jscoverage['/base/observable.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['128'] = [];
  _$jscoverage['/base/observable.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'] = [];
  _$jscoverage['/base/observable.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['147'] = [];
  _$jscoverage['/base/observable.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['147'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['156'] = [];
  _$jscoverage['/base/observable.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['156'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['173'] = [];
  _$jscoverage['/base/observable.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['179'] = [];
  _$jscoverage['/base/observable.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['180'] = [];
  _$jscoverage['/base/observable.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['184'] = [];
  _$jscoverage['/base/observable.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['184'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['188'] = [];
  _$jscoverage['/base/observable.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['198'] = [];
  _$jscoverage['/base/observable.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'] = [];
  _$jscoverage['/base/observable.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['221'] = [];
  _$jscoverage['/base/observable.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'] = [];
  _$jscoverage['/base/observable.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['232'] = [];
  _$jscoverage['/base/observable.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['232'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['232'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['237'] = [];
  _$jscoverage['/base/observable.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['237'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['241'] = [];
  _$jscoverage['/base/observable.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['243'] = [];
  _$jscoverage['/base/observable.js'].branchData['243'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['249'] = [];
  _$jscoverage['/base/observable.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['274'] = [];
  _$jscoverage['/base/observable.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['278'] = [];
  _$jscoverage['/base/observable.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['279'] = [];
  _$jscoverage['/base/observable.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['284'] = [];
  _$jscoverage['/base/observable.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['287'] = [];
  _$jscoverage['/base/observable.js'].branchData['287'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['291'] = [];
  _$jscoverage['/base/observable.js'].branchData['291'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['299'] = [];
  _$jscoverage['/base/observable.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['312'] = [];
  _$jscoverage['/base/observable.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['321'] = [];
  _$jscoverage['/base/observable.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['325'] = [];
  _$jscoverage['/base/observable.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['332'] = [];
  _$jscoverage['/base/observable.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['333'] = [];
  _$jscoverage['/base/observable.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['335'] = [];
  _$jscoverage['/base/observable.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['337'] = [];
  _$jscoverage['/base/observable.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['339'] = [];
  _$jscoverage['/base/observable.js'].branchData['339'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['339'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['341'] = [];
  _$jscoverage['/base/observable.js'].branchData['341'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['341'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['341'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['356'] = [];
  _$jscoverage['/base/observable.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['357'] = [];
  _$jscoverage['/base/observable.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['359'] = [];
  _$jscoverage['/base/observable.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['359'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['360'] = [];
  _$jscoverage['/base/observable.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['365'] = [];
  _$jscoverage['/base/observable.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['369'] = [];
  _$jscoverage['/base/observable.js'].branchData['369'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['372'] = [];
  _$jscoverage['/base/observable.js'].branchData['372'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['375'] = [];
  _$jscoverage['/base/observable.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['395'] = [];
  _$jscoverage['/base/observable.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['398'] = [];
  _$jscoverage['/base/observable.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['400'] = [];
  _$jscoverage['/base/observable.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['404'] = [];
  _$jscoverage['/base/observable.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['404'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['412'] = [];
  _$jscoverage['/base/observable.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['432'] = [];
  _$jscoverage['/base/observable.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['435'] = [];
  _$jscoverage['/base/observable.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['445'] = [];
  _$jscoverage['/base/observable.js'].branchData['445'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['445'][1].init(73, 30, '!domEventObservables && create');
function visit183_445_1(result) {
  _$jscoverage['/base/observable.js'].branchData['445'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['435'][1].init(237, 19, 'domEventObservables');
function visit182_435_1(result) {
  _$jscoverage['/base/observable.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['432'][1].init(113, 25, 'domEventObservablesHolder');
function visit181_432_1(result) {
  _$jscoverage['/base/observable.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['412'][1].init(715, 36, 'S.isEmptyObject(domEventObservables)');
function visit180_412_1(result) {
  _$jscoverage['/base/observable.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['404'][2].init(211, 49, 's[\'tearDown\'].call(currentTarget, type) === false');
function visit179_404_2(result) {
  _$jscoverage['/base/observable.js'].branchData['404'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['404'][1].init(193, 67, '!s[\'tearDown\'] || s[\'tearDown\'].call(currentTarget, type) === false');
function visit178_404_1(result) {
  _$jscoverage['/base/observable.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['400'][1].init(82, 19, '!self.hasObserver()');
function visit177_400_1(result) {
  _$jscoverage['/base/observable.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['398'][1].init(297, 9, 'eventDesc');
function visit176_398_1(result) {
  _$jscoverage['/base/observable.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['395'][1].init(131, 19, 'Special[type] || {}');
function visit175_395_1(result) {
  _$jscoverage['/base/observable.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['375'][1].init(309, 8, 's.remove');
function visit174_375_1(result) {
  _$jscoverage['/base/observable.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['372'][1].init(174, 31, 'observer.last && self.lastCount');
function visit173_372_1(result) {
  _$jscoverage['/base/observable.js'].branchData['372'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['369'][1].init(29, 37, 'observer.filter && self.delegateCount');
function visit172_369_1(result) {
  _$jscoverage['/base/observable.js'].branchData['369'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['365'][1].init(382, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit171_365_1(result) {
  _$jscoverage['/base/observable.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['360'][1].init(84, 27, '!filter && !observer.filter');
function visit170_360_1(result) {
  _$jscoverage['/base/observable.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['359'][3].init(102, 25, 'filter != observer.filter');
function visit169_359_3(result) {
  _$jscoverage['/base/observable.js'].branchData['359'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['359'][2].init(92, 35, 'filter && filter != observer.filter');
function visit168_359_2(result) {
  _$jscoverage['/base/observable.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['359'][1].init(-1, 113, '(filter && filter != observer.filter) || (!filter && !observer.filter)');
function visit167_359_1(result) {
  _$jscoverage['/base/observable.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['357'][1].init(-1, 247, 'hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))');
function visit166_357_1(result) {
  _$jscoverage['/base/observable.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['356'][1].init(902, 428, '(hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit165_356_1(result) {
  _$jscoverage['/base/observable.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['341'][3].init(283, 17, 'fn != observer.fn');
function visit164_341_3(result) {
  _$jscoverage['/base/observable.js'].branchData['341'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['341'][2].init(277, 23, 'fn && fn != observer.fn');
function visit163_341_2(result) {
  _$jscoverage['/base/observable.js'].branchData['341'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['341'][1].init(105, 1331, '(fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit162_341_1(result) {
  _$jscoverage['/base/observable.js'].branchData['341'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['339'][2].init(170, 26, 'context != observerContext');
function visit161_339_2(result) {
  _$jscoverage['/base/observable.js'].branchData['339'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['339'][1].init(29, 1437, '(context != observerContext) || (fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit160_339_1(result) {
  _$jscoverage['/base/observable.js'].branchData['339'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['337'][1].init(84, 33, 'observer.context || currentTarget');
function visit159_337_1(result) {
  _$jscoverage['/base/observable.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['335'][1].init(97, 7, 'i < len');
function visit158_335_1(result) {
  _$jscoverage['/base/observable.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['333'][1].init(27, 24, 'context || currentTarget');
function visit157_333_1(result) {
  _$jscoverage['/base/observable.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['332'][2].init(681, 21, 'hasFilter || groupsRe');
function visit156_332_2(result) {
  _$jscoverage['/base/observable.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['332'][1].init(675, 27, 'fn || hasFilter || groupsRe');
function visit155_332_1(result) {
  _$jscoverage['/base/observable.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['325'][1].init(478, 6, 'groups');
function visit154_325_1(result) {
  _$jscoverage['/base/observable.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['321'][1].init(402, 17, '!observers.length');
function visit153_321_1(result) {
  _$jscoverage['/base/observable.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['312'][1].init(62, 24, 'Special[self.type] || {}');
function visit152_312_1(result) {
  _$jscoverage['/base/observable.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['299'][1].init(522, 5, 's.add');
function visit151_299_1(result) {
  _$jscoverage['/base/observable.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['291'][1].init(25, 13, 'observer.last');
function visit150_291_1(result) {
  _$jscoverage['/base/observable.js'].branchData['291'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['287'][1].init(52, 15, 'observer.filter');
function visit149_287_1(result) {
  _$jscoverage['/base/observable.js'].branchData['287'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['284'][1].init(429, 94, 'self.findObserver(observer) == -1');
function visit148_284_1(result) {
  _$jscoverage['/base/observable.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['279'][1].init(21, 12, '!observer.fn');
function visit147_279_1(result) {
  _$jscoverage['/base/observable.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['278'][1].init(258, 14, 'S.Config.debug');
function visit146_278_1(result) {
  _$jscoverage['/base/observable.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['274'][1].init(80, 24, 'Special[self.type] || {}');
function visit145_274_1(result) {
  _$jscoverage['/base/observable.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['249'][1].init(121, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit144_249_1(result) {
  _$jscoverage['/base/observable.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['243'][1].init(2801, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit143_243_1(result) {
  _$jscoverage['/base/observable.js'].branchData['243'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['241'][2].init(2746, 36, 'cur && !event.isPropagationStopped()');
function visit142_241_2(result) {
  _$jscoverage['/base/observable.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['241'][1].init(692, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit141_241_1(result) {
  _$jscoverage['/base/observable.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['237'][2].init(518, 33, 'cur[ontype].call(cur) === false');
function visit140_237_2(result) {
  _$jscoverage['/base/observable.js'].branchData['237'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['237'][1].init(501, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit139_237_1(result) {
  _$jscoverage['/base/observable.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['232'][3].init(106, 14, 'gret !== false');
function visit138_232_3(result) {
  _$jscoverage['/base/observable.js'].branchData['232'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['232'][2].init(85, 17, 'ret !== undefined');
function visit137_232_2(result) {
  _$jscoverage['/base/observable.js'].branchData['232'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['232'][1].init(85, 35, 'ret !== undefined && gret !== false');
function visit136_232_1(result) {
  _$jscoverage['/base/observable.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][1].init(210, 18, 'domEventObservable');
function visit135_230_1(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['221'][2].init(1926, 14, 'cur && bubbles');
function visit134_221_2(result) {
  _$jscoverage['/base/observable.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['221'][1].init(210, 31, '!onlyHandlers && cur && bubbles');
function visit133_221_1(result) {
  _$jscoverage['/base/observable.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][4].init(157, 19, 'cur === curDocument');
function visit132_220_4(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][3].init(157, 27, '(cur === curDocument) && win');
function visit131_220_3(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][2].init(135, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit130_220_2(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][1].init(117, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit129_220_1(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['198'][2].init(911, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit128_198_2(result) {
  _$jscoverage['/base/observable.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['198'][1].init(887, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit127_198_1(result) {
  _$jscoverage['/base/observable.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['188'][1].init(548, 34, '!(event instanceof DomEventObject)');
function visit126_188_1(result) {
  _$jscoverage['/base/observable.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['184'][2].init(428, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit125_184_2(result) {
  _$jscoverage['/base/observable.js'].branchData['184'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['184'][1].init(407, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit124_184_1(result) {
  _$jscoverage['/base/observable.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['180'][1].init(209, 30, 'specialEvent.bubbles !== false');
function visit123_180_1(result) {
  _$jscoverage['/base/observable.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['179'][1].init(157, 24, 'Special[eventType] || {}');
function visit122_179_1(result) {
  _$jscoverage['/base/observable.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['173'][1].init(21, 11, 'event || {}');
function visit121_173_1(result) {
  _$jscoverage['/base/observable.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['156'][3].init(306, 17, 'ret !== undefined');
function visit120_156_3(result) {
  _$jscoverage['/base/observable.js'].branchData['156'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['156'][2].init(288, 14, 'gRet !== false');
function visit119_156_2(result) {
  _$jscoverage['/base/observable.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['156'][1].init(288, 35, 'gRet !== false && ret !== undefined');
function visit118_156_1(result) {
  _$jscoverage['/base/observable.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['147'][2].init(363, 33, 'j < currentTargetObservers.length');
function visit117_147_2(result) {
  _$jscoverage['/base/observable.js'].branchData['147'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['147'][1].init(321, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit116_147_1(result) {
  _$jscoverage['/base/observable.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][2].init(3129, 7, 'i < len');
function visit115_139_2(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][1].init(3096, 40, '!event.isPropagationStopped() && i < len');
function visit114_139_1(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['128'][1].init(2539, 32, 'delegateCount < observers.length');
function visit113_128_1(result) {
  _$jscoverage['/base/observable.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['122'][1].init(1197, 34, 'target.parentNode || currentTarget');
function visit112_122_1(result) {
  _$jscoverage['/base/observable.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['115'][1].init(794, 29, 'currentTargetObservers.length');
function visit111_115_1(result) {
  _$jscoverage['/base/observable.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['111'][1].init(417, 7, 'matched');
function visit110_111_1(result) {
  _$jscoverage['/base/observable.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['108'][1].init(243, 21, 'matched === undefined');
function visit109_108_1(result) {
  _$jscoverage['/base/observable.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['103'][1].init(186, 17, 'i < delegateCount');
function visit108_103_1(result) {
  _$jscoverage['/base/observable.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['99'][3].init(53, 21, 'eventType !== \'click\'');
function visit107_99_3(result) {
  _$jscoverage['/base/observable.js'].branchData['99'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['99'][2].init(25, 24, 'target.disabled !== true');
function visit106_99_2(result) {
  _$jscoverage['/base/observable.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['99'][1].init(25, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit105_99_1(result) {
  _$jscoverage['/base/observable.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['98'][1].init(24, 23, 'target != currentTarget');
function visit104_98_1(result) {
  _$jscoverage['/base/observable.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['97'][1].init(1017, 32, 'delegateCount && target.nodeType');
function visit103_97_1(result) {
  _$jscoverage['/base/observable.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['90'][1].init(403, 23, 'self.delegateCount || 0');
function visit102_90_1(result) {
  _$jscoverage['/base/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['48'][2].init(334, 43, 's.setup.call(currentTarget, type) === false');
function visit101_48_2(result) {
  _$jscoverage['/base/observable.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['48'][1].init(322, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit100_48_1(result) {
  _$jscoverage['/base/observable.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['43'][1].init(70, 19, 'Special[type] || {}');
function visit99_43_1(result) {
  _$jscoverage['/base/observable.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/observable.js'].lineData[8]++;
  var Dom = require('dom');
  _$jscoverage['/base/observable.js'].lineData[9]++;
  var Special = require('./special');
  _$jscoverage['/base/observable.js'].lineData[10]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var DomEventObserver = require('./observer');
  _$jscoverage['/base/observable.js'].lineData[12]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/observable.js'].lineData[18]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[19]++;
  var logger = S.getLogger('s/event');
  _$jscoverage['/base/observable.js'].lineData[28]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[29]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[30]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[31]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[38]++;
  S.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[41]++;
  var self = this, type = self.type, s = visit99_43_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[48]++;
  if (visit100_48_1(!s.setup || visit101_48_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[49]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[56]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[57]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[58]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[59]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[78]++;
  var target = event.target, eventType = event['type'], self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit102_90_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[97]++;
  if (visit103_97_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[98]++;
    while (visit104_98_1(target != currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[99]++;
      if (visit105_99_1(visit106_99_2(target.disabled !== true) || visit107_99_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[100]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[102]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[103]++;
        for (i = 0; visit108_103_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[104]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[105]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[106]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[107]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[108]++;
          if (visit109_108_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[109]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[111]++;
          if (visit110_111_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[112]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[115]++;
        if (visit111_115_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[116]++;
          allObservers.push({
  currentTarget: target, 
  'currentTargetObservers': currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[122]++;
      target = visit112_122_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[128]++;
  if (visit113_128_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[129]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[139]++;
  for (i = 0 , len = allObservers.length; visit114_139_1(!event.isPropagationStopped() && visit115_139_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[141]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[142]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[143]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[144]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[147]++;
    for (j = 0; visit116_147_1(!event.isImmediatePropagationStopped() && visit117_147_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[149]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[151]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[156]++;
      if (visit118_156_1(visit119_156_2(gRet !== false) && visit120_156_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[157]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[164]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[173]++;
  event = visit121_173_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[175]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit122_179_1(Special[eventType] || {}), bubbles = visit123_180_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[184]++;
  if (visit124_184_1(specialEvent.fire && visit125_184_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[185]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[188]++;
  if (visit126_188_1(!(event instanceof DomEventObject))) {
    _$jscoverage['/base/observable.js'].lineData[189]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[190]++;
    event = new DomEventObject({
  currentTarget: currentTarget, 
  type: eventType, 
  target: currentTarget});
    _$jscoverage['/base/observable.js'].lineData[195]++;
    S.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[198]++;
  if (visit127_198_1(specialEvent.preFire && visit128_198_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[199]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[205]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[217]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[218]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[220]++;
    cur = visit129_220_1(cur.parentNode || visit130_220_2(cur.ownerDocument || visit131_220_3((visit132_220_4(cur === curDocument)) && win)));
  } while (visit133_221_1(!onlyHandlers && visit134_221_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[223]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[226]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[227]++;
    event['currentTarget'] = cur;
    _$jscoverage['/base/observable.js'].lineData[228]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[230]++;
    if (visit135_230_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[231]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[232]++;
      if (visit136_232_1(visit137_232_2(ret !== undefined) && visit138_232_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[233]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[237]++;
    if (visit139_237_1(cur[ontype] && visit140_237_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[238]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[240]++;
    cur = eventPath[++eventPathIndex];
  } while (visit141_241_1(!onlyHandlers && visit142_241_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[243]++;
  if (visit143_243_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[246]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[249]++;
      if (visit144_249_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[251]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[255]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[258]++;
  logger.debug('trigger action error: ' + eError);
}
    _$jscoverage['/base/observable.js'].lineData[261]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[264]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[272]++;
  var self = this, observers = self.observers, s = visit145_274_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[278]++;
  if (visit146_278_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[279]++;
    if (visit147_279_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[280]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[284]++;
  if (visit148_284_1(self.findObserver(observer) == -1)) {
    _$jscoverage['/base/observable.js'].lineData[287]++;
    if (visit149_287_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[288]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[289]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[291]++;
      if (visit150_291_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[292]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[293]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[295]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[299]++;
    if (visit151_299_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[300]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[310]++;
  var groupsRe, self = this, s = visit152_312_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[321]++;
  if (visit153_321_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[322]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[325]++;
  if (visit154_325_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[326]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[329]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[332]++;
  if (visit155_332_1(fn || visit156_332_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[333]++;
    context = visit157_333_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[335]++;
    for (i = 0 , j = 0 , t = []; visit158_335_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[336]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[337]++;
      observerContext = visit159_337_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[338]++;
      if (visit160_339_1((visit161_339_2(context != observerContext)) || visit162_341_1((visit163_341_2(fn && visit164_341_3(fn != observer.fn))) || visit165_356_1((visit166_357_1(hasFilter && (visit167_359_1((visit168_359_2(filter && visit169_359_3(filter != observer.filter))) || (visit170_360_1(!filter && !observer.filter)))))) || (visit171_365_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[367]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[369]++;
        if (visit172_369_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[370]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[372]++;
        if (visit173_372_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[373]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[375]++;
        if (visit174_375_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[376]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[381]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[384]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[387]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[391]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit175_395_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[398]++;
  if (visit176_398_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[399]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[400]++;
    if (visit177_400_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[401]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[404]++;
      if ((visit178_404_1(!s['tearDown'] || visit179_404_2(s['tearDown'].call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[405]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[408]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[412]++;
    if (visit180_412_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[413]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[414]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[420]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[428]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[430]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[432]++;
  if (visit181_432_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[433]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[435]++;
  if (visit182_435_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[436]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[439]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[443]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[444]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[445]++;
  if (visit183_445_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[446]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[448]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[451]++;
  return DomEventObservable;
});
