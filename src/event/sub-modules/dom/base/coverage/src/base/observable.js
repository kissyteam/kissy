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
  _$jscoverage['/base/observable.js'].lineData[40] = 0;
  _$jscoverage['/base/observable.js'].lineData[47] = 0;
  _$jscoverage['/base/observable.js'].lineData[48] = 0;
  _$jscoverage['/base/observable.js'].lineData[55] = 0;
  _$jscoverage['/base/observable.js'].lineData[56] = 0;
  _$jscoverage['/base/observable.js'].lineData[57] = 0;
  _$jscoverage['/base/observable.js'].lineData[58] = 0;
  _$jscoverage['/base/observable.js'].lineData[77] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[102] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[105] = 0;
  _$jscoverage['/base/observable.js'].lineData[106] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[110] = 0;
  _$jscoverage['/base/observable.js'].lineData[111] = 0;
  _$jscoverage['/base/observable.js'].lineData[114] = 0;
  _$jscoverage['/base/observable.js'].lineData[115] = 0;
  _$jscoverage['/base/observable.js'].lineData[121] = 0;
  _$jscoverage['/base/observable.js'].lineData[127] = 0;
  _$jscoverage['/base/observable.js'].lineData[128] = 0;
  _$jscoverage['/base/observable.js'].lineData[138] = 0;
  _$jscoverage['/base/observable.js'].lineData[140] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[142] = 0;
  _$jscoverage['/base/observable.js'].lineData[143] = 0;
  _$jscoverage['/base/observable.js'].lineData[146] = 0;
  _$jscoverage['/base/observable.js'].lineData[148] = 0;
  _$jscoverage['/base/observable.js'].lineData[150] = 0;
  _$jscoverage['/base/observable.js'].lineData[155] = 0;
  _$jscoverage['/base/observable.js'].lineData[156] = 0;
  _$jscoverage['/base/observable.js'].lineData[163] = 0;
  _$jscoverage['/base/observable.js'].lineData[172] = 0;
  _$jscoverage['/base/observable.js'].lineData[174] = 0;
  _$jscoverage['/base/observable.js'].lineData[183] = 0;
  _$jscoverage['/base/observable.js'].lineData[184] = 0;
  _$jscoverage['/base/observable.js'].lineData[187] = 0;
  _$jscoverage['/base/observable.js'].lineData[188] = 0;
  _$jscoverage['/base/observable.js'].lineData[189] = 0;
  _$jscoverage['/base/observable.js'].lineData[194] = 0;
  _$jscoverage['/base/observable.js'].lineData[197] = 0;
  _$jscoverage['/base/observable.js'].lineData[198] = 0;
  _$jscoverage['/base/observable.js'].lineData[204] = 0;
  _$jscoverage['/base/observable.js'].lineData[216] = 0;
  _$jscoverage['/base/observable.js'].lineData[217] = 0;
  _$jscoverage['/base/observable.js'].lineData[219] = 0;
  _$jscoverage['/base/observable.js'].lineData[222] = 0;
  _$jscoverage['/base/observable.js'].lineData[225] = 0;
  _$jscoverage['/base/observable.js'].lineData[226] = 0;
  _$jscoverage['/base/observable.js'].lineData[227] = 0;
  _$jscoverage['/base/observable.js'].lineData[229] = 0;
  _$jscoverage['/base/observable.js'].lineData[230] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[232] = 0;
  _$jscoverage['/base/observable.js'].lineData[236] = 0;
  _$jscoverage['/base/observable.js'].lineData[237] = 0;
  _$jscoverage['/base/observable.js'].lineData[239] = 0;
  _$jscoverage['/base/observable.js'].lineData[242] = 0;
  _$jscoverage['/base/observable.js'].lineData[245] = 0;
  _$jscoverage['/base/observable.js'].lineData[248] = 0;
  _$jscoverage['/base/observable.js'].lineData[250] = 0;
  _$jscoverage['/base/observable.js'].lineData[254] = 0;
  _$jscoverage['/base/observable.js'].lineData[257] = 0;
  _$jscoverage['/base/observable.js'].lineData[260] = 0;
  _$jscoverage['/base/observable.js'].lineData[263] = 0;
  _$jscoverage['/base/observable.js'].lineData[271] = 0;
  _$jscoverage['/base/observable.js'].lineData[277] = 0;
  _$jscoverage['/base/observable.js'].lineData[278] = 0;
  _$jscoverage['/base/observable.js'].lineData[279] = 0;
  _$jscoverage['/base/observable.js'].lineData[283] = 0;
  _$jscoverage['/base/observable.js'].lineData[286] = 0;
  _$jscoverage['/base/observable.js'].lineData[287] = 0;
  _$jscoverage['/base/observable.js'].lineData[288] = 0;
  _$jscoverage['/base/observable.js'].lineData[290] = 0;
  _$jscoverage['/base/observable.js'].lineData[291] = 0;
  _$jscoverage['/base/observable.js'].lineData[292] = 0;
  _$jscoverage['/base/observable.js'].lineData[294] = 0;
  _$jscoverage['/base/observable.js'].lineData[298] = 0;
  _$jscoverage['/base/observable.js'].lineData[299] = 0;
  _$jscoverage['/base/observable.js'].lineData[309] = 0;
  _$jscoverage['/base/observable.js'].lineData[320] = 0;
  _$jscoverage['/base/observable.js'].lineData[321] = 0;
  _$jscoverage['/base/observable.js'].lineData[324] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[328] = 0;
  _$jscoverage['/base/observable.js'].lineData[331] = 0;
  _$jscoverage['/base/observable.js'].lineData[332] = 0;
  _$jscoverage['/base/observable.js'].lineData[334] = 0;
  _$jscoverage['/base/observable.js'].lineData[335] = 0;
  _$jscoverage['/base/observable.js'].lineData[336] = 0;
  _$jscoverage['/base/observable.js'].lineData[337] = 0;
  _$jscoverage['/base/observable.js'].lineData[366] = 0;
  _$jscoverage['/base/observable.js'].lineData[368] = 0;
  _$jscoverage['/base/observable.js'].lineData[369] = 0;
  _$jscoverage['/base/observable.js'].lineData[371] = 0;
  _$jscoverage['/base/observable.js'].lineData[372] = 0;
  _$jscoverage['/base/observable.js'].lineData[374] = 0;
  _$jscoverage['/base/observable.js'].lineData[375] = 0;
  _$jscoverage['/base/observable.js'].lineData[380] = 0;
  _$jscoverage['/base/observable.js'].lineData[383] = 0;
  _$jscoverage['/base/observable.js'].lineData[386] = 0;
  _$jscoverage['/base/observable.js'].lineData[390] = 0;
  _$jscoverage['/base/observable.js'].lineData[397] = 0;
  _$jscoverage['/base/observable.js'].lineData[398] = 0;
  _$jscoverage['/base/observable.js'].lineData[399] = 0;
  _$jscoverage['/base/observable.js'].lineData[400] = 0;
  _$jscoverage['/base/observable.js'].lineData[403] = 0;
  _$jscoverage['/base/observable.js'].lineData[404] = 0;
  _$jscoverage['/base/observable.js'].lineData[407] = 0;
  _$jscoverage['/base/observable.js'].lineData[411] = 0;
  _$jscoverage['/base/observable.js'].lineData[412] = 0;
  _$jscoverage['/base/observable.js'].lineData[413] = 0;
  _$jscoverage['/base/observable.js'].lineData[419] = 0;
  _$jscoverage['/base/observable.js'].lineData[427] = 0;
  _$jscoverage['/base/observable.js'].lineData[429] = 0;
  _$jscoverage['/base/observable.js'].lineData[431] = 0;
  _$jscoverage['/base/observable.js'].lineData[432] = 0;
  _$jscoverage['/base/observable.js'].lineData[434] = 0;
  _$jscoverage['/base/observable.js'].lineData[435] = 0;
  _$jscoverage['/base/observable.js'].lineData[438] = 0;
  _$jscoverage['/base/observable.js'].lineData[442] = 0;
  _$jscoverage['/base/observable.js'].lineData[443] = 0;
  _$jscoverage['/base/observable.js'].lineData[444] = 0;
  _$jscoverage['/base/observable.js'].lineData[445] = 0;
  _$jscoverage['/base/observable.js'].lineData[447] = 0;
  _$jscoverage['/base/observable.js'].lineData[450] = 0;
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
  _$jscoverage['/base/observable.js'].branchData['42'] = [];
  _$jscoverage['/base/observable.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['47'] = [];
  _$jscoverage['/base/observable.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['89'] = [];
  _$jscoverage['/base/observable.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['96'] = [];
  _$jscoverage['/base/observable.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['97'] = [];
  _$jscoverage['/base/observable.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['98'] = [];
  _$jscoverage['/base/observable.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['98'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['102'] = [];
  _$jscoverage['/base/observable.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['107'] = [];
  _$jscoverage['/base/observable.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['110'] = [];
  _$jscoverage['/base/observable.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['114'] = [];
  _$jscoverage['/base/observable.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['121'] = [];
  _$jscoverage['/base/observable.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['127'] = [];
  _$jscoverage['/base/observable.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['138'] = [];
  _$jscoverage['/base/observable.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['138'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['146'] = [];
  _$jscoverage['/base/observable.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['146'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['155'] = [];
  _$jscoverage['/base/observable.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['155'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['155'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['172'] = [];
  _$jscoverage['/base/observable.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['178'] = [];
  _$jscoverage['/base/observable.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['179'] = [];
  _$jscoverage['/base/observable.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['183'] = [];
  _$jscoverage['/base/observable.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['183'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['187'] = [];
  _$jscoverage['/base/observable.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['197'] = [];
  _$jscoverage['/base/observable.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['197'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'] = [];
  _$jscoverage['/base/observable.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['219'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'] = [];
  _$jscoverage['/base/observable.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['220'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['229'] = [];
  _$jscoverage['/base/observable.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['231'] = [];
  _$jscoverage['/base/observable.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['231'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['231'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['236'] = [];
  _$jscoverage['/base/observable.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['236'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['240'] = [];
  _$jscoverage['/base/observable.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['240'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['242'] = [];
  _$jscoverage['/base/observable.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['248'] = [];
  _$jscoverage['/base/observable.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['273'] = [];
  _$jscoverage['/base/observable.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['277'] = [];
  _$jscoverage['/base/observable.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['278'] = [];
  _$jscoverage['/base/observable.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['283'] = [];
  _$jscoverage['/base/observable.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['286'] = [];
  _$jscoverage['/base/observable.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['290'] = [];
  _$jscoverage['/base/observable.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['298'] = [];
  _$jscoverage['/base/observable.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['311'] = [];
  _$jscoverage['/base/observable.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['320'] = [];
  _$jscoverage['/base/observable.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['324'] = [];
  _$jscoverage['/base/observable.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['331'] = [];
  _$jscoverage['/base/observable.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['331'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['332'] = [];
  _$jscoverage['/base/observable.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['334'] = [];
  _$jscoverage['/base/observable.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['336'] = [];
  _$jscoverage['/base/observable.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['338'] = [];
  _$jscoverage['/base/observable.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['338'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['340'] = [];
  _$jscoverage['/base/observable.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['340'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['340'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['355'] = [];
  _$jscoverage['/base/observable.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['356'] = [];
  _$jscoverage['/base/observable.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'] = [];
  _$jscoverage['/base/observable.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['359'] = [];
  _$jscoverage['/base/observable.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['364'] = [];
  _$jscoverage['/base/observable.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['368'] = [];
  _$jscoverage['/base/observable.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['371'] = [];
  _$jscoverage['/base/observable.js'].branchData['371'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['374'] = [];
  _$jscoverage['/base/observable.js'].branchData['374'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['394'] = [];
  _$jscoverage['/base/observable.js'].branchData['394'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['397'] = [];
  _$jscoverage['/base/observable.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['399'] = [];
  _$jscoverage['/base/observable.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['403'] = [];
  _$jscoverage['/base/observable.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['403'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['411'] = [];
  _$jscoverage['/base/observable.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['431'] = [];
  _$jscoverage['/base/observable.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['434'] = [];
  _$jscoverage['/base/observable.js'].branchData['434'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['444'] = [];
  _$jscoverage['/base/observable.js'].branchData['444'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['444'][1].init(73, 30, '!domEventObservables && create');
function visit183_444_1(result) {
  _$jscoverage['/base/observable.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['434'][1].init(237, 19, 'domEventObservables');
function visit182_434_1(result) {
  _$jscoverage['/base/observable.js'].branchData['434'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['431'][1].init(113, 25, 'domEventObservablesHolder');
function visit181_431_1(result) {
  _$jscoverage['/base/observable.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['411'][1].init(709, 36, 'S.isEmptyObject(domEventObservables)');
function visit180_411_1(result) {
  _$jscoverage['/base/observable.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['403'][2].init(208, 46, 's.tearDown.call(currentTarget, type) === false');
function visit179_403_2(result) {
  _$jscoverage['/base/observable.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['403'][1].init(193, 61, '!s.tearDown || s.tearDown.call(currentTarget, type) === false');
function visit178_403_1(result) {
  _$jscoverage['/base/observable.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['399'][1].init(82, 19, '!self.hasObserver()');
function visit177_399_1(result) {
  _$jscoverage['/base/observable.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['397'][1].init(297, 9, 'eventDesc');
function visit176_397_1(result) {
  _$jscoverage['/base/observable.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['394'][1].init(131, 19, 'Special[type] || {}');
function visit175_394_1(result) {
  _$jscoverage['/base/observable.js'].branchData['394'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['374'][1].init(309, 8, 's.remove');
function visit174_374_1(result) {
  _$jscoverage['/base/observable.js'].branchData['374'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['371'][1].init(174, 31, 'observer.last && self.lastCount');
function visit173_371_1(result) {
  _$jscoverage['/base/observable.js'].branchData['371'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['368'][1].init(29, 37, 'observer.filter && self.delegateCount');
function visit172_368_1(result) {
  _$jscoverage['/base/observable.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['364'][1].init(383, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit171_364_1(result) {
  _$jscoverage['/base/observable.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['359'][1].init(85, 27, '!filter && !observer.filter');
function visit170_359_1(result) {
  _$jscoverage['/base/observable.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][3].init(102, 26, 'filter !== observer.filter');
function visit169_358_3(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][2].init(92, 36, 'filter && filter !== observer.filter');
function visit168_358_2(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][1].init(-1, 114, '(filter && filter !== observer.filter) || (!filter && !observer.filter)');
function visit167_358_1(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['356'][1].init(-1, 248, 'hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))');
function visit166_356_1(result) {
  _$jscoverage['/base/observable.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['355'][1].init(903, 429, '(hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit165_355_1(result) {
  _$jscoverage['/base/observable.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['340'][3].init(284, 18, 'fn !== observer.fn');
function visit164_340_3(result) {
  _$jscoverage['/base/observable.js'].branchData['340'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['340'][2].init(278, 24, 'fn && fn !== observer.fn');
function visit163_340_2(result) {
  _$jscoverage['/base/observable.js'].branchData['340'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['340'][1].init(106, 1333, '(fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit162_340_1(result) {
  _$jscoverage['/base/observable.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['338'][2].init(170, 27, 'context !== observerContext');
function visit161_338_2(result) {
  _$jscoverage['/base/observable.js'].branchData['338'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['338'][1].init(29, 1440, '(context !== observerContext) || (fn && fn !== observer.fn) || (hasFilter && ((filter && filter !== observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit160_338_1(result) {
  _$jscoverage['/base/observable.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['336'][1].init(84, 33, 'observer.context || currentTarget');
function visit159_336_1(result) {
  _$jscoverage['/base/observable.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['334'][1].init(97, 7, 'i < len');
function visit158_334_1(result) {
  _$jscoverage['/base/observable.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['332'][1].init(27, 24, 'context || currentTarget');
function visit157_332_1(result) {
  _$jscoverage['/base/observable.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['331'][2].init(681, 21, 'hasFilter || groupsRe');
function visit156_331_2(result) {
  _$jscoverage['/base/observable.js'].branchData['331'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['331'][1].init(675, 27, 'fn || hasFilter || groupsRe');
function visit155_331_1(result) {
  _$jscoverage['/base/observable.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['324'][1].init(478, 6, 'groups');
function visit154_324_1(result) {
  _$jscoverage['/base/observable.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['320'][1].init(402, 17, '!observers.length');
function visit153_320_1(result) {
  _$jscoverage['/base/observable.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['311'][1].init(62, 24, 'Special[self.type] || {}');
function visit152_311_1(result) {
  _$jscoverage['/base/observable.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['298'][1].init(522, 5, 's.add');
function visit151_298_1(result) {
  _$jscoverage['/base/observable.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['290'][1].init(25, 13, 'observer.last');
function visit150_290_1(result) {
  _$jscoverage['/base/observable.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['286'][1].init(52, 15, 'observer.filter');
function visit149_286_1(result) {
  _$jscoverage['/base/observable.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['283'][1].init(429, 95, 'self.findObserver(observer) === -1');
function visit148_283_1(result) {
  _$jscoverage['/base/observable.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['278'][1].init(21, 12, '!observer.fn');
function visit147_278_1(result) {
  _$jscoverage['/base/observable.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['277'][1].init(258, 14, 'S.Config.debug');
function visit146_277_1(result) {
  _$jscoverage['/base/observable.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['273'][1].init(80, 24, 'Special[self.type] || {}');
function visit145_273_1(result) {
  _$jscoverage['/base/observable.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['248'][1].init(121, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit144_248_1(result) {
  _$jscoverage['/base/observable.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['242'][1].init(2798, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit143_242_1(result) {
  _$jscoverage['/base/observable.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['240'][2].init(2743, 36, 'cur && !event.isPropagationStopped()');
function visit142_240_2(result) {
  _$jscoverage['/base/observable.js'].branchData['240'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['240'][1].init(689, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit141_240_1(result) {
  _$jscoverage['/base/observable.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['236'][2].init(515, 33, 'cur[ontype].call(cur) === false');
function visit140_236_2(result) {
  _$jscoverage['/base/observable.js'].branchData['236'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['236'][1].init(498, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit139_236_1(result) {
  _$jscoverage['/base/observable.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['231'][3].init(106, 14, 'gret !== false');
function visit138_231_3(result) {
  _$jscoverage['/base/observable.js'].branchData['231'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['231'][2].init(85, 17, 'ret !== undefined');
function visit137_231_2(result) {
  _$jscoverage['/base/observable.js'].branchData['231'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['231'][1].init(85, 35, 'ret !== undefined && gret !== false');
function visit136_231_1(result) {
  _$jscoverage['/base/observable.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['229'][1].init(207, 18, 'domEventObservable');
function visit135_229_1(result) {
  _$jscoverage['/base/observable.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][2].init(1926, 14, 'cur && bubbles');
function visit134_220_2(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['220'][1].init(210, 31, '!onlyHandlers && cur && bubbles');
function visit133_220_1(result) {
  _$jscoverage['/base/observable.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][4].init(157, 19, 'cur === curDocument');
function visit132_219_4(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][3].init(157, 27, '(cur === curDocument) && win');
function visit131_219_3(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][2].init(135, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit130_219_2(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['219'][1].init(117, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit129_219_1(result) {
  _$jscoverage['/base/observable.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['197'][2].init(911, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit128_197_2(result) {
  _$jscoverage['/base/observable.js'].branchData['197'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['197'][1].init(887, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit127_197_1(result) {
  _$jscoverage['/base/observable.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['187'][1].init(548, 34, '!(event instanceof DomEventObject)');
function visit126_187_1(result) {
  _$jscoverage['/base/observable.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['183'][2].init(428, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit125_183_2(result) {
  _$jscoverage['/base/observable.js'].branchData['183'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['183'][1].init(407, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit124_183_1(result) {
  _$jscoverage['/base/observable.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['179'][1].init(209, 30, 'specialEvent.bubbles !== false');
function visit123_179_1(result) {
  _$jscoverage['/base/observable.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['178'][1].init(157, 24, 'Special[eventType] || {}');
function visit122_178_1(result) {
  _$jscoverage['/base/observable.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['172'][1].init(21, 11, 'event || {}');
function visit121_172_1(result) {
  _$jscoverage['/base/observable.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['155'][3].init(306, 17, 'ret !== undefined');
function visit120_155_3(result) {
  _$jscoverage['/base/observable.js'].branchData['155'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['155'][2].init(288, 14, 'gRet !== false');
function visit119_155_2(result) {
  _$jscoverage['/base/observable.js'].branchData['155'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['155'][1].init(288, 35, 'gRet !== false && ret !== undefined');
function visit118_155_1(result) {
  _$jscoverage['/base/observable.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['146'][2].init(363, 33, 'j < currentTargetObservers.length');
function visit117_146_2(result) {
  _$jscoverage['/base/observable.js'].branchData['146'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['146'][1].init(321, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit116_146_1(result) {
  _$jscoverage['/base/observable.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['138'][2].init(3127, 7, 'i < len');
function visit115_138_2(result) {
  _$jscoverage['/base/observable.js'].branchData['138'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['138'][1].init(3094, 40, '!event.isPropagationStopped() && i < len');
function visit114_138_1(result) {
  _$jscoverage['/base/observable.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['127'][1].init(2537, 32, 'delegateCount < observers.length');
function visit113_127_1(result) {
  _$jscoverage['/base/observable.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['121'][1].init(1197, 34, 'target.parentNode || currentTarget');
function visit112_121_1(result) {
  _$jscoverage['/base/observable.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['114'][1].init(794, 29, 'currentTargetObservers.length');
function visit111_114_1(result) {
  _$jscoverage['/base/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['110'][1].init(417, 7, 'matched');
function visit110_110_1(result) {
  _$jscoverage['/base/observable.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['107'][1].init(243, 21, 'matched === undefined');
function visit109_107_1(result) {
  _$jscoverage['/base/observable.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['102'][1].init(186, 17, 'i < delegateCount');
function visit108_102_1(result) {
  _$jscoverage['/base/observable.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['98'][3].init(53, 21, 'eventType !== \'click\'');
function visit107_98_3(result) {
  _$jscoverage['/base/observable.js'].branchData['98'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['98'][2].init(25, 24, 'target.disabled !== true');
function visit106_98_2(result) {
  _$jscoverage['/base/observable.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['98'][1].init(25, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit105_98_1(result) {
  _$jscoverage['/base/observable.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['97'][1].init(24, 24, 'target !== currentTarget');
function visit104_97_1(result) {
  _$jscoverage['/base/observable.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['96'][1].init(1014, 32, 'delegateCount && target.nodeType');
function visit103_96_1(result) {
  _$jscoverage['/base/observable.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['89'][1].init(400, 23, 'self.delegateCount || 0');
function visit102_89_1(result) {
  _$jscoverage['/base/observable.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['47'][2].init(334, 43, 's.setup.call(currentTarget, type) === false');
function visit101_47_2(result) {
  _$jscoverage['/base/observable.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['47'][1].init(322, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit100_47_1(result) {
  _$jscoverage['/base/observable.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['42'][1].init(70, 19, 'Special[type] || {}');
function visit99_42_1(result) {
  _$jscoverage['/base/observable.js'].branchData['42'][1].ranCondition(result);
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
  _$jscoverage['/base/observable.js'].lineData[40]++;
  var self = this, type = self.type, s = visit99_42_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[47]++;
  if (visit100_47_1(!s.setup || visit101_47_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[48]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[56]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[57]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[58]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[77]++;
  var target = event.target, eventType = event.type, self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit102_89_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[96]++;
  if (visit103_96_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[97]++;
    while (visit104_97_1(target !== currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[98]++;
      if (visit105_98_1(visit106_98_2(target.disabled !== true) || visit107_98_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[99]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[101]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[102]++;
        for (i = 0; visit108_102_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[103]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[104]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[105]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[106]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[107]++;
          if (visit109_107_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[108]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[110]++;
          if (visit110_110_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[111]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[114]++;
        if (visit111_114_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[115]++;
          allObservers.push({
  currentTarget: target, 
  'currentTargetObservers': currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[121]++;
      target = visit112_121_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[127]++;
  if (visit113_127_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[128]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[138]++;
  for (i = 0 , len = allObservers.length; visit114_138_1(!event.isPropagationStopped() && visit115_138_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[140]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[141]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[142]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[143]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[146]++;
    for (j = 0; visit116_146_1(!event.isImmediatePropagationStopped() && visit117_146_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[148]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[150]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[155]++;
      if (visit118_155_1(visit119_155_2(gRet !== false) && visit120_155_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[156]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[163]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[172]++;
  event = visit121_172_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[174]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit122_178_1(Special[eventType] || {}), bubbles = visit123_179_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[183]++;
  if (visit124_183_1(specialEvent.fire && visit125_183_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[184]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[187]++;
  if (visit126_187_1(!(event instanceof DomEventObject))) {
    _$jscoverage['/base/observable.js'].lineData[188]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[189]++;
    event = new DomEventObject({
  currentTarget: currentTarget, 
  type: eventType, 
  target: currentTarget});
    _$jscoverage['/base/observable.js'].lineData[194]++;
    S.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[197]++;
  if (visit127_197_1(specialEvent.preFire && visit128_197_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[198]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[204]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[216]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[217]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[219]++;
    cur = visit129_219_1(cur.parentNode || visit130_219_2(cur.ownerDocument || visit131_219_3((visit132_219_4(cur === curDocument)) && win)));
  } while (visit133_220_1(!onlyHandlers && visit134_220_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[222]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[225]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[226]++;
    event.currentTarget = cur;
    _$jscoverage['/base/observable.js'].lineData[227]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[229]++;
    if (visit135_229_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[230]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[231]++;
      if (visit136_231_1(visit137_231_2(ret !== undefined) && visit138_231_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[232]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[236]++;
    if (visit139_236_1(cur[ontype] && visit140_236_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[237]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[239]++;
    cur = eventPath[++eventPathIndex];
  } while (visit141_240_1(!onlyHandlers && visit142_240_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[242]++;
  if (visit143_242_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[245]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[248]++;
      if (visit144_248_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[250]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[254]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[257]++;
  logger.debug('trigger action error: ' + eError);
}
    _$jscoverage['/base/observable.js'].lineData[260]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[263]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[271]++;
  var self = this, observers = self.observers, s = visit145_273_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[277]++;
  if (visit146_277_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[278]++;
    if (visit147_278_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[279]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[283]++;
  if (visit148_283_1(self.findObserver(observer) === -1)) {
    _$jscoverage['/base/observable.js'].lineData[286]++;
    if (visit149_286_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[287]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[288]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[290]++;
      if (visit150_290_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[291]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[292]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[294]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[298]++;
    if (visit151_298_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[299]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[309]++;
  var groupsRe, self = this, s = visit152_311_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[320]++;
  if (visit153_320_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[321]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[324]++;
  if (visit154_324_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[325]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[328]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[331]++;
  if (visit155_331_1(fn || visit156_331_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[332]++;
    context = visit157_332_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[334]++;
    for (i = 0 , j = 0 , t = []; visit158_334_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[335]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[336]++;
      observerContext = visit159_336_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[337]++;
      if (visit160_338_1((visit161_338_2(context !== observerContext)) || visit162_340_1((visit163_340_2(fn && visit164_340_3(fn !== observer.fn))) || visit165_355_1((visit166_356_1(hasFilter && (visit167_358_1((visit168_358_2(filter && visit169_358_3(filter !== observer.filter))) || (visit170_359_1(!filter && !observer.filter)))))) || (visit171_364_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[366]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[368]++;
        if (visit172_368_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[369]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[371]++;
        if (visit173_371_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[372]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[374]++;
        if (visit174_374_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[375]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[380]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[383]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[386]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[390]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit175_394_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[397]++;
  if (visit176_397_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[398]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[399]++;
    if (visit177_399_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[400]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[403]++;
      if ((visit178_403_1(!s.tearDown || visit179_403_2(s.tearDown.call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[404]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[407]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[411]++;
    if (visit180_411_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[412]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[413]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[419]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[427]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[429]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[431]++;
  if (visit181_431_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[432]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[434]++;
  if (visit182_434_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[435]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[438]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[442]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[443]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[444]++;
  if (visit183_444_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[445]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[447]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[450]++;
  return DomEventObservable;
});
