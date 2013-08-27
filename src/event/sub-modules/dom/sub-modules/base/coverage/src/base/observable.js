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
  _$jscoverage['/base/observable.js'].lineData[11] = 0;
  _$jscoverage['/base/observable.js'].lineData[20] = 0;
  _$jscoverage['/base/observable.js'].lineData[21] = 0;
  _$jscoverage['/base/observable.js'].lineData[22] = 0;
  _$jscoverage['/base/observable.js'].lineData[23] = 0;
  _$jscoverage['/base/observable.js'].lineData[30] = 0;
  _$jscoverage['/base/observable.js'].lineData[33] = 0;
  _$jscoverage['/base/observable.js'].lineData[40] = 0;
  _$jscoverage['/base/observable.js'].lineData[41] = 0;
  _$jscoverage['/base/observable.js'].lineData[48] = 0;
  _$jscoverage['/base/observable.js'].lineData[49] = 0;
  _$jscoverage['/base/observable.js'].lineData[50] = 0;
  _$jscoverage['/base/observable.js'].lineData[51] = 0;
  _$jscoverage['/base/observable.js'].lineData[70] = 0;
  _$jscoverage['/base/observable.js'].lineData[89] = 0;
  _$jscoverage['/base/observable.js'].lineData[90] = 0;
  _$jscoverage['/base/observable.js'].lineData[91] = 0;
  _$jscoverage['/base/observable.js'].lineData[92] = 0;
  _$jscoverage['/base/observable.js'].lineData[94] = 0;
  _$jscoverage['/base/observable.js'].lineData[95] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[103] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[107] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[114] = 0;
  _$jscoverage['/base/observable.js'].lineData[120] = 0;
  _$jscoverage['/base/observable.js'].lineData[121] = 0;
  _$jscoverage['/base/observable.js'].lineData[131] = 0;
  _$jscoverage['/base/observable.js'].lineData[133] = 0;
  _$jscoverage['/base/observable.js'].lineData[134] = 0;
  _$jscoverage['/base/observable.js'].lineData[135] = 0;
  _$jscoverage['/base/observable.js'].lineData[136] = 0;
  _$jscoverage['/base/observable.js'].lineData[139] = 0;
  _$jscoverage['/base/observable.js'].lineData[141] = 0;
  _$jscoverage['/base/observable.js'].lineData[143] = 0;
  _$jscoverage['/base/observable.js'].lineData[148] = 0;
  _$jscoverage['/base/observable.js'].lineData[149] = 0;
  _$jscoverage['/base/observable.js'].lineData[156] = 0;
  _$jscoverage['/base/observable.js'].lineData[166] = 0;
  _$jscoverage['/base/observable.js'].lineData[168] = 0;
  _$jscoverage['/base/observable.js'].lineData[177] = 0;
  _$jscoverage['/base/observable.js'].lineData[178] = 0;
  _$jscoverage['/base/observable.js'].lineData[181] = 0;
  _$jscoverage['/base/observable.js'].lineData[182] = 0;
  _$jscoverage['/base/observable.js'].lineData[183] = 0;
  _$jscoverage['/base/observable.js'].lineData[188] = 0;
  _$jscoverage['/base/observable.js'].lineData[191] = 0;
  _$jscoverage['/base/observable.js'].lineData[192] = 0;
  _$jscoverage['/base/observable.js'].lineData[198] = 0;
  _$jscoverage['/base/observable.js'].lineData[208] = 0;
  _$jscoverage['/base/observable.js'].lineData[209] = 0;
  _$jscoverage['/base/observable.js'].lineData[211] = 0;
  _$jscoverage['/base/observable.js'].lineData[214] = 0;
  _$jscoverage['/base/observable.js'].lineData[217] = 0;
  _$jscoverage['/base/observable.js'].lineData[218] = 0;
  _$jscoverage['/base/observable.js'].lineData[219] = 0;
  _$jscoverage['/base/observable.js'].lineData[221] = 0;
  _$jscoverage['/base/observable.js'].lineData[222] = 0;
  _$jscoverage['/base/observable.js'].lineData[225] = 0;
  _$jscoverage['/base/observable.js'].lineData[226] = 0;
  _$jscoverage['/base/observable.js'].lineData[228] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[234] = 0;
  _$jscoverage['/base/observable.js'].lineData[237] = 0;
  _$jscoverage['/base/observable.js'].lineData[239] = 0;
  _$jscoverage['/base/observable.js'].lineData[243] = 0;
  _$jscoverage['/base/observable.js'].lineData[246] = 0;
  _$jscoverage['/base/observable.js'].lineData[247] = 0;
  _$jscoverage['/base/observable.js'].lineData[250] = 0;
  _$jscoverage['/base/observable.js'].lineData[260] = 0;
  _$jscoverage['/base/observable.js'].lineData[266] = 0;
  _$jscoverage['/base/observable.js'].lineData[267] = 0;
  _$jscoverage['/base/observable.js'].lineData[268] = 0;
  _$jscoverage['/base/observable.js'].lineData[272] = 0;
  _$jscoverage['/base/observable.js'].lineData[274] = 0;
  _$jscoverage['/base/observable.js'].lineData[275] = 0;
  _$jscoverage['/base/observable.js'].lineData[276] = 0;
  _$jscoverage['/base/observable.js'].lineData[278] = 0;
  _$jscoverage['/base/observable.js'].lineData[279] = 0;
  _$jscoverage['/base/observable.js'].lineData[280] = 0;
  _$jscoverage['/base/observable.js'].lineData[282] = 0;
  _$jscoverage['/base/observable.js'].lineData[286] = 0;
  _$jscoverage['/base/observable.js'].lineData[287] = 0;
  _$jscoverage['/base/observable.js'].lineData[297] = 0;
  _$jscoverage['/base/observable.js'].lineData[308] = 0;
  _$jscoverage['/base/observable.js'].lineData[309] = 0;
  _$jscoverage['/base/observable.js'].lineData[312] = 0;
  _$jscoverage['/base/observable.js'].lineData[313] = 0;
  _$jscoverage['/base/observable.js'].lineData[316] = 0;
  _$jscoverage['/base/observable.js'].lineData[319] = 0;
  _$jscoverage['/base/observable.js'].lineData[320] = 0;
  _$jscoverage['/base/observable.js'].lineData[322] = 0;
  _$jscoverage['/base/observable.js'].lineData[323] = 0;
  _$jscoverage['/base/observable.js'].lineData[324] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[354] = 0;
  _$jscoverage['/base/observable.js'].lineData[356] = 0;
  _$jscoverage['/base/observable.js'].lineData[357] = 0;
  _$jscoverage['/base/observable.js'].lineData[359] = 0;
  _$jscoverage['/base/observable.js'].lineData[360] = 0;
  _$jscoverage['/base/observable.js'].lineData[362] = 0;
  _$jscoverage['/base/observable.js'].lineData[363] = 0;
  _$jscoverage['/base/observable.js'].lineData[368] = 0;
  _$jscoverage['/base/observable.js'].lineData[371] = 0;
  _$jscoverage['/base/observable.js'].lineData[374] = 0;
  _$jscoverage['/base/observable.js'].lineData[378] = 0;
  _$jscoverage['/base/observable.js'].lineData[385] = 0;
  _$jscoverage['/base/observable.js'].lineData[386] = 0;
  _$jscoverage['/base/observable.js'].lineData[387] = 0;
  _$jscoverage['/base/observable.js'].lineData[388] = 0;
  _$jscoverage['/base/observable.js'].lineData[391] = 0;
  _$jscoverage['/base/observable.js'].lineData[392] = 0;
  _$jscoverage['/base/observable.js'].lineData[395] = 0;
  _$jscoverage['/base/observable.js'].lineData[399] = 0;
  _$jscoverage['/base/observable.js'].lineData[400] = 0;
  _$jscoverage['/base/observable.js'].lineData[401] = 0;
  _$jscoverage['/base/observable.js'].lineData[407] = 0;
  _$jscoverage['/base/observable.js'].lineData[415] = 0;
  _$jscoverage['/base/observable.js'].lineData[417] = 0;
  _$jscoverage['/base/observable.js'].lineData[419] = 0;
  _$jscoverage['/base/observable.js'].lineData[420] = 0;
  _$jscoverage['/base/observable.js'].lineData[422] = 0;
  _$jscoverage['/base/observable.js'].lineData[423] = 0;
  _$jscoverage['/base/observable.js'].lineData[426] = 0;
  _$jscoverage['/base/observable.js'].lineData[430] = 0;
  _$jscoverage['/base/observable.js'].lineData[431] = 0;
  _$jscoverage['/base/observable.js'].lineData[432] = 0;
  _$jscoverage['/base/observable.js'].lineData[433] = 0;
  _$jscoverage['/base/observable.js'].lineData[435] = 0;
  _$jscoverage['/base/observable.js'].lineData[438] = 0;
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
  _$jscoverage['/base/observable.js'].branchData['35'] = [];
  _$jscoverage['/base/observable.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['40'] = [];
  _$jscoverage['/base/observable.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['40'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['82'] = [];
  _$jscoverage['/base/observable.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['89'] = [];
  _$jscoverage['/base/observable.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['90'] = [];
  _$jscoverage['/base/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'] = [];
  _$jscoverage['/base/observable.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['95'] = [];
  _$jscoverage['/base/observable.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['100'] = [];
  _$jscoverage['/base/observable.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['103'] = [];
  _$jscoverage['/base/observable.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['107'] = [];
  _$jscoverage['/base/observable.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['114'] = [];
  _$jscoverage['/base/observable.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['120'] = [];
  _$jscoverage['/base/observable.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['131'] = [];
  _$jscoverage['/base/observable.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['131'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'] = [];
  _$jscoverage['/base/observable.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['139'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['148'] = [];
  _$jscoverage['/base/observable.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['166'] = [];
  _$jscoverage['/base/observable.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['172'] = [];
  _$jscoverage['/base/observable.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['173'] = [];
  _$jscoverage['/base/observable.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['177'] = [];
  _$jscoverage['/base/observable.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['181'] = [];
  _$jscoverage['/base/observable.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['191'] = [];
  _$jscoverage['/base/observable.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['191'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'] = [];
  _$jscoverage['/base/observable.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['211'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'] = [];
  _$jscoverage['/base/observable.js'].branchData['212'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['212'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['221'] = [];
  _$jscoverage['/base/observable.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['225'] = [];
  _$jscoverage['/base/observable.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['229'] = [];
  _$jscoverage['/base/observable.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['229'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['231'] = [];
  _$jscoverage['/base/observable.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['237'] = [];
  _$jscoverage['/base/observable.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['262'] = [];
  _$jscoverage['/base/observable.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['266'] = [];
  _$jscoverage['/base/observable.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['267'] = [];
  _$jscoverage['/base/observable.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['272'] = [];
  _$jscoverage['/base/observable.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['274'] = [];
  _$jscoverage['/base/observable.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['278'] = [];
  _$jscoverage['/base/observable.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['286'] = [];
  _$jscoverage['/base/observable.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['299'] = [];
  _$jscoverage['/base/observable.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['308'] = [];
  _$jscoverage['/base/observable.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['312'] = [];
  _$jscoverage['/base/observable.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['319'] = [];
  _$jscoverage['/base/observable.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['319'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['320'] = [];
  _$jscoverage['/base/observable.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['322'] = [];
  _$jscoverage['/base/observable.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['324'] = [];
  _$jscoverage['/base/observable.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['326'] = [];
  _$jscoverage['/base/observable.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'] = [];
  _$jscoverage['/base/observable.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['343'] = [];
  _$jscoverage['/base/observable.js'].branchData['343'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['344'] = [];
  _$jscoverage['/base/observable.js'].branchData['344'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['346'] = [];
  _$jscoverage['/base/observable.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['346'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['346'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['347'] = [];
  _$jscoverage['/base/observable.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['352'] = [];
  _$jscoverage['/base/observable.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['356'] = [];
  _$jscoverage['/base/observable.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['359'] = [];
  _$jscoverage['/base/observable.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['362'] = [];
  _$jscoverage['/base/observable.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['382'] = [];
  _$jscoverage['/base/observable.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['385'] = [];
  _$jscoverage['/base/observable.js'].branchData['385'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['387'] = [];
  _$jscoverage['/base/observable.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['391'] = [];
  _$jscoverage['/base/observable.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['391'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['399'] = [];
  _$jscoverage['/base/observable.js'].branchData['399'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['419'] = [];
  _$jscoverage['/base/observable.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['422'] = [];
  _$jscoverage['/base/observable.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['432'] = [];
  _$jscoverage['/base/observable.js'].branchData['432'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['432'][1].init(75, 30, '!domEventObservables && create');
function visit176_432_1(result) {
  _$jscoverage['/base/observable.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['422'][1].init(244, 19, 'domEventObservables');
function visit175_422_1(result) {
  _$jscoverage['/base/observable.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['419'][1].init(117, 25, 'domEventObservablesHolder');
function visit174_419_1(result) {
  _$jscoverage['/base/observable.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['399'][1].init(729, 36, 'S.isEmptyObject(domEventObservables)');
function visit173_399_1(result) {
  _$jscoverage['/base/observable.js'].branchData['399'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['391'][2].init(215, 49, 's[\'tearDown\'].call(currentTarget, type) === false');
function visit172_391_2(result) {
  _$jscoverage['/base/observable.js'].branchData['391'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['391'][1].init(197, 67, '!s[\'tearDown\'] || s[\'tearDown\'].call(currentTarget, type) === false');
function visit171_391_1(result) {
  _$jscoverage['/base/observable.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['387'][1].init(84, 19, '!self.hasObserver()');
function visit170_387_1(result) {
  _$jscoverage['/base/observable.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['385'][1].init(305, 9, 'eventDesc');
function visit169_385_1(result) {
  _$jscoverage['/base/observable.js'].branchData['385'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['382'][1].init(135, 19, 'Special[type] || {}');
function visit168_382_1(result) {
  _$jscoverage['/base/observable.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['362'][1].init(316, 8, 's.remove');
function visit167_362_1(result) {
  _$jscoverage['/base/observable.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['359'][1].init(178, 31, 'observer.last && self.lastCount');
function visit166_359_1(result) {
  _$jscoverage['/base/observable.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['356'][1].init(30, 37, 'observer.filter && self.delegateCount');
function visit165_356_1(result) {
  _$jscoverage['/base/observable.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['352'][1].init(390, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit164_352_1(result) {
  _$jscoverage['/base/observable.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['347'][1].init(85, 27, '!filter && !observer.filter');
function visit163_347_1(result) {
  _$jscoverage['/base/observable.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['346'][3].init(104, 25, 'filter != observer.filter');
function visit162_346_3(result) {
  _$jscoverage['/base/observable.js'].branchData['346'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['346'][2].init(94, 35, 'filter && filter != observer.filter');
function visit161_346_2(result) {
  _$jscoverage['/base/observable.js'].branchData['346'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['346'][1].init(-1, 114, '(filter && filter != observer.filter) || (!filter && !observer.filter)');
function visit160_346_1(result) {
  _$jscoverage['/base/observable.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['344'][1].init(-1, 251, 'hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))');
function visit159_344_1(result) {
  _$jscoverage['/base/observable.js'].branchData['344'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['343'][1].init(918, 436, '(hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit158_343_1(result) {
  _$jscoverage['/base/observable.js'].branchData['343'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][3].init(289, 17, 'fn != observer.fn');
function visit157_328_3(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][2].init(283, 23, 'fn && fn != observer.fn');
function visit156_328_2(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][1].init(107, 1355, '(fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit155_328_1(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['326'][2].init(174, 26, 'context != observerContext');
function visit154_326_2(result) {
  _$jscoverage['/base/observable.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['326'][1].init(30, 1463, '(context != observerContext) || (fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit153_326_1(result) {
  _$jscoverage['/base/observable.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['324'][1].init(86, 33, 'observer.context || currentTarget');
function visit152_324_1(result) {
  _$jscoverage['/base/observable.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['322'][1].init(100, 7, 'i < len');
function visit151_322_1(result) {
  _$jscoverage['/base/observable.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['320'][1].init(28, 24, 'context || currentTarget');
function visit150_320_1(result) {
  _$jscoverage['/base/observable.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['319'][2].init(704, 21, 'hasFilter || groupsRe');
function visit149_319_2(result) {
  _$jscoverage['/base/observable.js'].branchData['319'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['319'][1].init(698, 27, 'fn || hasFilter || groupsRe');
function visit148_319_1(result) {
  _$jscoverage['/base/observable.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['312'][1].init(494, 6, 'groups');
function visit147_312_1(result) {
  _$jscoverage['/base/observable.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['308'][1].init(414, 17, '!observers.length');
function visit146_308_1(result) {
  _$jscoverage['/base/observable.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['299'][1].init(64, 24, 'Special[self.type] || {}');
function visit145_299_1(result) {
  _$jscoverage['/base/observable.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['286'][1].init(536, 5, 's.add');
function visit144_286_1(result) {
  _$jscoverage['/base/observable.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['278'][1].init(26, 13, 'observer.last');
function visit143_278_1(result) {
  _$jscoverage['/base/observable.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['274'][1].init(54, 15, 'observer.filter');
function visit142_274_1(result) {
  _$jscoverage['/base/observable.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['272'][1].init(442, 72, 'self.findObserver(observer) == -1');
function visit141_272_1(result) {
  _$jscoverage['/base/observable.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['267'][1].init(22, 12, '!observer.fn');
function visit140_267_1(result) {
  _$jscoverage['/base/observable.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['266'][1].init(265, 14, 'S.Config.debug');
function visit139_266_1(result) {
  _$jscoverage['/base/observable.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['262'][1].init(82, 24, 'Special[self.type] || {}');
function visit138_262_1(result) {
  _$jscoverage['/base/observable.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['237'][1].init(124, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit137_237_1(result) {
  _$jscoverage['/base/observable.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['231'][1].init(2699, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit136_231_1(result) {
  _$jscoverage['/base/observable.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['229'][2].init(2642, 36, 'cur && !event.isPropagationStopped()');
function visit135_229_2(result) {
  _$jscoverage['/base/observable.js'].branchData['229'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['229'][1].init(577, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit134_229_1(result) {
  _$jscoverage['/base/observable.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['225'][2].init(399, 33, 'cur[ontype].call(cur) === false');
function visit133_225_2(result) {
  _$jscoverage['/base/observable.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['225'][1].init(382, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit132_225_1(result) {
  _$jscoverage['/base/observable.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['221'][1].init(214, 18, 'domEventObservable');
function visit131_221_1(result) {
  _$jscoverage['/base/observable.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][2].init(1932, 14, 'cur && bubbles');
function visit130_212_2(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['212'][1].init(214, 31, '!onlyHandlers && cur && bubbles');
function visit129_212_1(result) {
  _$jscoverage['/base/observable.js'].branchData['212'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][4].init(160, 19, 'cur === curDocument');
function visit128_211_4(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][3].init(160, 27, '(cur === curDocument) && win');
function visit127_211_3(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][2].init(138, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit126_211_2(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['211'][1].init(120, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit125_211_1(result) {
  _$jscoverage['/base/observable.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['191'][2].init(939, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit124_191_2(result) {
  _$jscoverage['/base/observable.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['191'][1].init(915, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit123_191_1(result) {
  _$jscoverage['/base/observable.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['181'][1].init(566, 34, '!(event instanceof DomEventObject)');
function visit122_181_1(result) {
  _$jscoverage['/base/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['177'][2].init(442, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit121_177_2(result) {
  _$jscoverage['/base/observable.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['177'][1].init(421, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit120_177_1(result) {
  _$jscoverage['/base/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['173'][1].init(214, 30, 'specialEvent.bubbles !== false');
function visit119_173_1(result) {
  _$jscoverage['/base/observable.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['172'][1].init(161, 24, 'Special[eventType] || {}');
function visit118_172_1(result) {
  _$jscoverage['/base/observable.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['166'][1].init(24, 11, 'event || {}');
function visit117_166_1(result) {
  _$jscoverage['/base/observable.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['148'][1].init(297, 14, 'gRet !== false');
function visit116_148_1(result) {
  _$jscoverage['/base/observable.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][2].init(371, 33, 'j < currentTargetObservers.length');
function visit115_139_2(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['139'][1].init(329, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit114_139_1(result) {
  _$jscoverage['/base/observable.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['131'][2].init(3200, 7, 'i < len');
function visit113_131_2(result) {
  _$jscoverage['/base/observable.js'].branchData['131'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['131'][1].init(3167, 40, '!event.isPropagationStopped() && i < len');
function visit112_131_1(result) {
  _$jscoverage['/base/observable.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['120'][1].init(2599, 32, 'delegateCount < observers.length');
function visit111_120_1(result) {
  _$jscoverage['/base/observable.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['114'][1].init(1221, 34, 'target.parentNode || currentTarget');
function visit110_114_1(result) {
  _$jscoverage['/base/observable.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['107'][1].init(810, 29, 'currentTargetObservers.length');
function visit109_107_1(result) {
  _$jscoverage['/base/observable.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['103'][1].init(425, 7, 'matched');
function visit108_103_1(result) {
  _$jscoverage['/base/observable.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['100'][1].init(248, 21, 'matched === undefined');
function visit107_100_1(result) {
  _$jscoverage['/base/observable.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['95'][1].init(190, 17, 'i < delegateCount');
function visit106_95_1(result) {
  _$jscoverage['/base/observable.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][3].init(54, 21, 'eventType !== \'click\'');
function visit105_91_3(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][2].init(26, 24, 'target.disabled !== true');
function visit104_91_2(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][1].init(26, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit103_91_1(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['90'][1].init(25, 23, 'target != currentTarget');
function visit102_90_1(result) {
  _$jscoverage['/base/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['89'][1].init(1046, 32, 'delegateCount && target.nodeType');
function visit101_89_1(result) {
  _$jscoverage['/base/observable.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['82'][1].init(415, 23, 'self.delegateCount || 0');
function visit100_82_1(result) {
  _$jscoverage['/base/observable.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['40'][2].init(342, 43, 's.setup.call(currentTarget, type) === false');
function visit99_40_2(result) {
  _$jscoverage['/base/observable.js'].branchData['40'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['40'][1].init(330, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit98_40_1(result) {
  _$jscoverage['/base/observable.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['35'][1].init(72, 19, 'Special[type] || {}');
function visit97_35_1(result) {
  _$jscoverage['/base/observable.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add('event/dom/base/observable', function(S, Dom, Special, DomEventUtils, DomEventObserver, DomEventObject, BaseEvent) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[20]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[21]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[22]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[23]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[30]++;
  S.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[33]++;
  var self = this, type = self.type, s = visit97_35_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[40]++;
  if (visit98_40_1(!s.setup || visit99_40_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[41]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[49]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[50]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[51]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[70]++;
  var target = event.target, eventType = event['type'], self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit100_82_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[89]++;
  if (visit101_89_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[90]++;
    while (visit102_90_1(target != currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[91]++;
      if (visit103_91_1(visit104_91_2(target.disabled !== true) || visit105_91_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[92]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[94]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[95]++;
        for (i = 0; visit106_95_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[96]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[97]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[98]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[99]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[100]++;
          if (visit107_100_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[101]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[103]++;
          if (visit108_103_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[104]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[107]++;
        if (visit109_107_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[108]++;
          allObservers.push({
  currentTarget: target, 
  'currentTargetObservers': currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[114]++;
      target = visit110_114_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[120]++;
  if (visit111_120_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[121]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[131]++;
  for (i = 0 , len = allObservers.length; visit112_131_1(!event.isPropagationStopped() && visit113_131_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[133]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[134]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[135]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[136]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[139]++;
    for (j = 0; visit114_139_1(!event.isImmediatePropagationStopped() && visit115_139_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[141]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[143]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[148]++;
      if (visit116_148_1(gRet !== false)) {
        _$jscoverage['/base/observable.js'].lineData[149]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[156]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[166]++;
  event = visit117_166_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[168]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit118_172_1(Special[eventType] || {}), bubbles = visit119_173_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[177]++;
  if (visit120_177_1(specialEvent.fire && visit121_177_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[178]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[181]++;
  if (visit122_181_1(!(event instanceof DomEventObject))) {
    _$jscoverage['/base/observable.js'].lineData[182]++;
    eventData = event;
    _$jscoverage['/base/observable.js'].lineData[183]++;
    event = new DomEventObject({
  currentTarget: currentTarget, 
  type: eventType, 
  target: currentTarget});
    _$jscoverage['/base/observable.js'].lineData[188]++;
    S.mix(event, eventData);
  }
  _$jscoverage['/base/observable.js'].lineData[191]++;
  if (visit123_191_1(specialEvent.preFire && visit124_191_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[192]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[198]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[208]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[209]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[211]++;
    cur = visit125_211_1(cur.parentNode || visit126_211_2(cur.ownerDocument || visit127_211_3((visit128_211_4(cur === curDocument)) && win)));
  } while (visit129_212_1(!onlyHandlers && visit130_212_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[214]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[217]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[218]++;
    event['currentTarget'] = cur;
    _$jscoverage['/base/observable.js'].lineData[219]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[221]++;
    if (visit131_221_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[222]++;
      domEventObservable.notify(event);
    }
    _$jscoverage['/base/observable.js'].lineData[225]++;
    if (visit132_225_1(cur[ontype] && visit133_225_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[226]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[228]++;
    cur = eventPath[++eventPathIndex];
  } while (visit134_229_1(!onlyHandlers && visit135_229_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[231]++;
  if (visit136_231_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[234]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[237]++;
      if (visit137_237_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[239]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[243]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[246]++;
  S.log('trigger action error: ');
  _$jscoverage['/base/observable.js'].lineData[247]++;
  S.log(eError);
}
    _$jscoverage['/base/observable.js'].lineData[250]++;
    DomEventObservable.triggeredEvent = '';
  }
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[260]++;
  var self = this, observers = self.observers, s = visit138_262_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[266]++;
  if (visit139_266_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[267]++;
    if (visit140_267_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[268]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[272]++;
  if (visit141_272_1(self.findObserver(observer) == -1)) {
    _$jscoverage['/base/observable.js'].lineData[274]++;
    if (visit142_274_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[275]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[276]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[278]++;
      if (visit143_278_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[279]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[280]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[282]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[286]++;
    if (visit144_286_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[287]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[297]++;
  var groupsRe, self = this, s = visit145_299_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[308]++;
  if (visit146_308_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[309]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[312]++;
  if (visit147_312_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[313]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[316]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[319]++;
  if (visit148_319_1(fn || visit149_319_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[320]++;
    context = visit150_320_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[322]++;
    for (i = 0 , j = 0 , t = []; visit151_322_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[323]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[324]++;
      observerContext = visit152_324_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[325]++;
      if (visit153_326_1((visit154_326_2(context != observerContext)) || visit155_328_1((visit156_328_2(fn && visit157_328_3(fn != observer.fn))) || visit158_343_1((visit159_344_1(hasFilter && (visit160_346_1((visit161_346_2(filter && visit162_346_3(filter != observer.filter))) || (visit163_347_1(!filter && !observer.filter)))))) || (visit164_352_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[354]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[356]++;
        if (visit165_356_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[357]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[359]++;
        if (visit166_359_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[360]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[362]++;
        if (visit167_362_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[363]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[368]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[371]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[374]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[378]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit168_382_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[385]++;
  if (visit169_385_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[386]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[387]++;
    if (visit170_387_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[388]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[391]++;
      if ((visit171_391_1(!s['tearDown'] || visit172_391_2(s['tearDown'].call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[392]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[395]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[399]++;
    if (visit173_399_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[400]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[401]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[407]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[415]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[417]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[419]++;
  if (visit174_419_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[420]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[422]++;
  if (visit175_422_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[423]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[426]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[430]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[431]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[432]++;
  if (visit176_432_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[433]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[435]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[438]++;
  return DomEventObservable;
}, {
  requires: ['dom', './special', './utils', './observer', './object', 'event/base']});
