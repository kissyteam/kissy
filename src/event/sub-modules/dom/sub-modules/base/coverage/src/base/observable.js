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
  _$jscoverage['/base/observable.js'].lineData[12] = 0;
  _$jscoverage['/base/observable.js'].lineData[21] = 0;
  _$jscoverage['/base/observable.js'].lineData[22] = 0;
  _$jscoverage['/base/observable.js'].lineData[23] = 0;
  _$jscoverage['/base/observable.js'].lineData[24] = 0;
  _$jscoverage['/base/observable.js'].lineData[31] = 0;
  _$jscoverage['/base/observable.js'].lineData[34] = 0;
  _$jscoverage['/base/observable.js'].lineData[41] = 0;
  _$jscoverage['/base/observable.js'].lineData[42] = 0;
  _$jscoverage['/base/observable.js'].lineData[49] = 0;
  _$jscoverage['/base/observable.js'].lineData[50] = 0;
  _$jscoverage['/base/observable.js'].lineData[51] = 0;
  _$jscoverage['/base/observable.js'].lineData[52] = 0;
  _$jscoverage['/base/observable.js'].lineData[71] = 0;
  _$jscoverage['/base/observable.js'].lineData[90] = 0;
  _$jscoverage['/base/observable.js'].lineData[91] = 0;
  _$jscoverage['/base/observable.js'].lineData[92] = 0;
  _$jscoverage['/base/observable.js'].lineData[93] = 0;
  _$jscoverage['/base/observable.js'].lineData[95] = 0;
  _$jscoverage['/base/observable.js'].lineData[96] = 0;
  _$jscoverage['/base/observable.js'].lineData[97] = 0;
  _$jscoverage['/base/observable.js'].lineData[98] = 0;
  _$jscoverage['/base/observable.js'].lineData[99] = 0;
  _$jscoverage['/base/observable.js'].lineData[100] = 0;
  _$jscoverage['/base/observable.js'].lineData[101] = 0;
  _$jscoverage['/base/observable.js'].lineData[102] = 0;
  _$jscoverage['/base/observable.js'].lineData[104] = 0;
  _$jscoverage['/base/observable.js'].lineData[105] = 0;
  _$jscoverage['/base/observable.js'].lineData[108] = 0;
  _$jscoverage['/base/observable.js'].lineData[109] = 0;
  _$jscoverage['/base/observable.js'].lineData[115] = 0;
  _$jscoverage['/base/observable.js'].lineData[121] = 0;
  _$jscoverage['/base/observable.js'].lineData[122] = 0;
  _$jscoverage['/base/observable.js'].lineData[132] = 0;
  _$jscoverage['/base/observable.js'].lineData[134] = 0;
  _$jscoverage['/base/observable.js'].lineData[135] = 0;
  _$jscoverage['/base/observable.js'].lineData[136] = 0;
  _$jscoverage['/base/observable.js'].lineData[137] = 0;
  _$jscoverage['/base/observable.js'].lineData[140] = 0;
  _$jscoverage['/base/observable.js'].lineData[142] = 0;
  _$jscoverage['/base/observable.js'].lineData[144] = 0;
  _$jscoverage['/base/observable.js'].lineData[149] = 0;
  _$jscoverage['/base/observable.js'].lineData[150] = 0;
  _$jscoverage['/base/observable.js'].lineData[157] = 0;
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
  _$jscoverage['/base/observable.js'].lineData[210] = 0;
  _$jscoverage['/base/observable.js'].lineData[211] = 0;
  _$jscoverage['/base/observable.js'].lineData[213] = 0;
  _$jscoverage['/base/observable.js'].lineData[216] = 0;
  _$jscoverage['/base/observable.js'].lineData[219] = 0;
  _$jscoverage['/base/observable.js'].lineData[220] = 0;
  _$jscoverage['/base/observable.js'].lineData[221] = 0;
  _$jscoverage['/base/observable.js'].lineData[223] = 0;
  _$jscoverage['/base/observable.js'].lineData[224] = 0;
  _$jscoverage['/base/observable.js'].lineData[225] = 0;
  _$jscoverage['/base/observable.js'].lineData[226] = 0;
  _$jscoverage['/base/observable.js'].lineData[230] = 0;
  _$jscoverage['/base/observable.js'].lineData[231] = 0;
  _$jscoverage['/base/observable.js'].lineData[233] = 0;
  _$jscoverage['/base/observable.js'].lineData[236] = 0;
  _$jscoverage['/base/observable.js'].lineData[239] = 0;
  _$jscoverage['/base/observable.js'].lineData[242] = 0;
  _$jscoverage['/base/observable.js'].lineData[244] = 0;
  _$jscoverage['/base/observable.js'].lineData[248] = 0;
  _$jscoverage['/base/observable.js'].lineData[251] = 0;
  _$jscoverage['/base/observable.js'].lineData[254] = 0;
  _$jscoverage['/base/observable.js'].lineData[257] = 0;
  _$jscoverage['/base/observable.js'].lineData[265] = 0;
  _$jscoverage['/base/observable.js'].lineData[271] = 0;
  _$jscoverage['/base/observable.js'].lineData[272] = 0;
  _$jscoverage['/base/observable.js'].lineData[273] = 0;
  _$jscoverage['/base/observable.js'].lineData[277] = 0;
  _$jscoverage['/base/observable.js'].lineData[280] = 0;
  _$jscoverage['/base/observable.js'].lineData[281] = 0;
  _$jscoverage['/base/observable.js'].lineData[282] = 0;
  _$jscoverage['/base/observable.js'].lineData[284] = 0;
  _$jscoverage['/base/observable.js'].lineData[285] = 0;
  _$jscoverage['/base/observable.js'].lineData[286] = 0;
  _$jscoverage['/base/observable.js'].lineData[288] = 0;
  _$jscoverage['/base/observable.js'].lineData[292] = 0;
  _$jscoverage['/base/observable.js'].lineData[293] = 0;
  _$jscoverage['/base/observable.js'].lineData[303] = 0;
  _$jscoverage['/base/observable.js'].lineData[314] = 0;
  _$jscoverage['/base/observable.js'].lineData[315] = 0;
  _$jscoverage['/base/observable.js'].lineData[318] = 0;
  _$jscoverage['/base/observable.js'].lineData[319] = 0;
  _$jscoverage['/base/observable.js'].lineData[322] = 0;
  _$jscoverage['/base/observable.js'].lineData[325] = 0;
  _$jscoverage['/base/observable.js'].lineData[326] = 0;
  _$jscoverage['/base/observable.js'].lineData[328] = 0;
  _$jscoverage['/base/observable.js'].lineData[329] = 0;
  _$jscoverage['/base/observable.js'].lineData[330] = 0;
  _$jscoverage['/base/observable.js'].lineData[331] = 0;
  _$jscoverage['/base/observable.js'].lineData[360] = 0;
  _$jscoverage['/base/observable.js'].lineData[362] = 0;
  _$jscoverage['/base/observable.js'].lineData[363] = 0;
  _$jscoverage['/base/observable.js'].lineData[365] = 0;
  _$jscoverage['/base/observable.js'].lineData[366] = 0;
  _$jscoverage['/base/observable.js'].lineData[368] = 0;
  _$jscoverage['/base/observable.js'].lineData[369] = 0;
  _$jscoverage['/base/observable.js'].lineData[374] = 0;
  _$jscoverage['/base/observable.js'].lineData[377] = 0;
  _$jscoverage['/base/observable.js'].lineData[380] = 0;
  _$jscoverage['/base/observable.js'].lineData[384] = 0;
  _$jscoverage['/base/observable.js'].lineData[391] = 0;
  _$jscoverage['/base/observable.js'].lineData[392] = 0;
  _$jscoverage['/base/observable.js'].lineData[393] = 0;
  _$jscoverage['/base/observable.js'].lineData[394] = 0;
  _$jscoverage['/base/observable.js'].lineData[397] = 0;
  _$jscoverage['/base/observable.js'].lineData[398] = 0;
  _$jscoverage['/base/observable.js'].lineData[401] = 0;
  _$jscoverage['/base/observable.js'].lineData[405] = 0;
  _$jscoverage['/base/observable.js'].lineData[406] = 0;
  _$jscoverage['/base/observable.js'].lineData[407] = 0;
  _$jscoverage['/base/observable.js'].lineData[413] = 0;
  _$jscoverage['/base/observable.js'].lineData[421] = 0;
  _$jscoverage['/base/observable.js'].lineData[423] = 0;
  _$jscoverage['/base/observable.js'].lineData[425] = 0;
  _$jscoverage['/base/observable.js'].lineData[426] = 0;
  _$jscoverage['/base/observable.js'].lineData[428] = 0;
  _$jscoverage['/base/observable.js'].lineData[429] = 0;
  _$jscoverage['/base/observable.js'].lineData[432] = 0;
  _$jscoverage['/base/observable.js'].lineData[436] = 0;
  _$jscoverage['/base/observable.js'].lineData[437] = 0;
  _$jscoverage['/base/observable.js'].lineData[438] = 0;
  _$jscoverage['/base/observable.js'].lineData[439] = 0;
  _$jscoverage['/base/observable.js'].lineData[441] = 0;
  _$jscoverage['/base/observable.js'].lineData[444] = 0;
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
  _$jscoverage['/base/observable.js'].branchData['36'] = [];
  _$jscoverage['/base/observable.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['41'] = [];
  _$jscoverage['/base/observable.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['41'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['83'] = [];
  _$jscoverage['/base/observable.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['90'] = [];
  _$jscoverage['/base/observable.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['91'] = [];
  _$jscoverage['/base/observable.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['92'] = [];
  _$jscoverage['/base/observable.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['92'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['96'] = [];
  _$jscoverage['/base/observable.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['101'] = [];
  _$jscoverage['/base/observable.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['104'] = [];
  _$jscoverage['/base/observable.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['108'] = [];
  _$jscoverage['/base/observable.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['115'] = [];
  _$jscoverage['/base/observable.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['121'] = [];
  _$jscoverage['/base/observable.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['132'] = [];
  _$jscoverage['/base/observable.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['132'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['140'] = [];
  _$jscoverage['/base/observable.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['149'] = [];
  _$jscoverage['/base/observable.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['149'][3] = new BranchData();
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
  _$jscoverage['/base/observable.js'].branchData['213'] = [];
  _$jscoverage['/base/observable.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['213'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['213'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['213'][4] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['214'] = [];
  _$jscoverage['/base/observable.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['214'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['223'] = [];
  _$jscoverage['/base/observable.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['225'] = [];
  _$jscoverage['/base/observable.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['225'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['225'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'] = [];
  _$jscoverage['/base/observable.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['234'] = [];
  _$jscoverage['/base/observable.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['234'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['236'] = [];
  _$jscoverage['/base/observable.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['242'] = [];
  _$jscoverage['/base/observable.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['267'] = [];
  _$jscoverage['/base/observable.js'].branchData['267'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['271'] = [];
  _$jscoverage['/base/observable.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['272'] = [];
  _$jscoverage['/base/observable.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['277'] = [];
  _$jscoverage['/base/observable.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['280'] = [];
  _$jscoverage['/base/observable.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['284'] = [];
  _$jscoverage['/base/observable.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['292'] = [];
  _$jscoverage['/base/observable.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['305'] = [];
  _$jscoverage['/base/observable.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['314'] = [];
  _$jscoverage['/base/observable.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['318'] = [];
  _$jscoverage['/base/observable.js'].branchData['318'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['325'] = [];
  _$jscoverage['/base/observable.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['325'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['326'] = [];
  _$jscoverage['/base/observable.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['328'] = [];
  _$jscoverage['/base/observable.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['330'] = [];
  _$jscoverage['/base/observable.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['332'] = [];
  _$jscoverage['/base/observable.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['334'] = [];
  _$jscoverage['/base/observable.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['334'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['349'] = [];
  _$jscoverage['/base/observable.js'].branchData['349'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['350'] = [];
  _$jscoverage['/base/observable.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['352'] = [];
  _$jscoverage['/base/observable.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['352'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['352'][3] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['353'] = [];
  _$jscoverage['/base/observable.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['358'] = [];
  _$jscoverage['/base/observable.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['362'] = [];
  _$jscoverage['/base/observable.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['365'] = [];
  _$jscoverage['/base/observable.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['368'] = [];
  _$jscoverage['/base/observable.js'].branchData['368'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['388'] = [];
  _$jscoverage['/base/observable.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['391'] = [];
  _$jscoverage['/base/observable.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['393'] = [];
  _$jscoverage['/base/observable.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['397'] = [];
  _$jscoverage['/base/observable.js'].branchData['397'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['397'][2] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['405'] = [];
  _$jscoverage['/base/observable.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['425'] = [];
  _$jscoverage['/base/observable.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['428'] = [];
  _$jscoverage['/base/observable.js'].branchData['428'][1] = new BranchData();
  _$jscoverage['/base/observable.js'].branchData['438'] = [];
  _$jscoverage['/base/observable.js'].branchData['438'][1] = new BranchData();
}
_$jscoverage['/base/observable.js'].branchData['438'][1].init(75, 30, '!domEventObservables && create');
function visit183_438_1(result) {
  _$jscoverage['/base/observable.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['428'][1].init(244, 19, 'domEventObservables');
function visit182_428_1(result) {
  _$jscoverage['/base/observable.js'].branchData['428'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['425'][1].init(117, 25, 'domEventObservablesHolder');
function visit181_425_1(result) {
  _$jscoverage['/base/observable.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['405'][1].init(729, 36, 'S.isEmptyObject(domEventObservables)');
function visit180_405_1(result) {
  _$jscoverage['/base/observable.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['397'][2].init(215, 49, 's[\'tearDown\'].call(currentTarget, type) === false');
function visit179_397_2(result) {
  _$jscoverage['/base/observable.js'].branchData['397'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['397'][1].init(197, 67, '!s[\'tearDown\'] || s[\'tearDown\'].call(currentTarget, type) === false');
function visit178_397_1(result) {
  _$jscoverage['/base/observable.js'].branchData['397'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['393'][1].init(84, 19, '!self.hasObserver()');
function visit177_393_1(result) {
  _$jscoverage['/base/observable.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['391'][1].init(305, 9, 'eventDesc');
function visit176_391_1(result) {
  _$jscoverage['/base/observable.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['388'][1].init(135, 19, 'Special[type] || {}');
function visit175_388_1(result) {
  _$jscoverage['/base/observable.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['368'][1].init(316, 8, 's.remove');
function visit174_368_1(result) {
  _$jscoverage['/base/observable.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['365'][1].init(178, 31, 'observer.last && self.lastCount');
function visit173_365_1(result) {
  _$jscoverage['/base/observable.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['362'][1].init(30, 37, 'observer.filter && self.delegateCount');
function visit172_362_1(result) {
  _$jscoverage['/base/observable.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['358'][1].init(390, 44, 'groupsRe && !observer.groups.match(groupsRe)');
function visit171_358_1(result) {
  _$jscoverage['/base/observable.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['353'][1].init(85, 27, '!filter && !observer.filter');
function visit170_353_1(result) {
  _$jscoverage['/base/observable.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['352'][3].init(104, 25, 'filter != observer.filter');
function visit169_352_3(result) {
  _$jscoverage['/base/observable.js'].branchData['352'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['352'][2].init(94, 35, 'filter && filter != observer.filter');
function visit168_352_2(result) {
  _$jscoverage['/base/observable.js'].branchData['352'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['352'][1].init(-1, 114, '(filter && filter != observer.filter) || (!filter && !observer.filter)');
function visit167_352_1(result) {
  _$jscoverage['/base/observable.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['350'][1].init(-1, 251, 'hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))');
function visit166_350_1(result) {
  _$jscoverage['/base/observable.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['349'][1].init(918, 436, '(hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit165_349_1(result) {
  _$jscoverage['/base/observable.js'].branchData['349'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['334'][3].init(289, 17, 'fn != observer.fn');
function visit164_334_3(result) {
  _$jscoverage['/base/observable.js'].branchData['334'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['334'][2].init(283, 23, 'fn && fn != observer.fn');
function visit163_334_2(result) {
  _$jscoverage['/base/observable.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['334'][1].init(107, 1355, '(fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit162_334_1(result) {
  _$jscoverage['/base/observable.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['332'][2].init(174, 26, 'context != observerContext');
function visit161_332_2(result) {
  _$jscoverage['/base/observable.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['332'][1].init(30, 1463, '(context != observerContext) || (fn && fn != observer.fn) || (hasFilter && ((filter && filter != observer.filter) || (!filter && !observer.filter))) || (groupsRe && !observer.groups.match(groupsRe))');
function visit160_332_1(result) {
  _$jscoverage['/base/observable.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['330'][1].init(86, 33, 'observer.context || currentTarget');
function visit159_330_1(result) {
  _$jscoverage['/base/observable.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['328'][1].init(100, 7, 'i < len');
function visit158_328_1(result) {
  _$jscoverage['/base/observable.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['326'][1].init(28, 24, 'context || currentTarget');
function visit157_326_1(result) {
  _$jscoverage['/base/observable.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['325'][2].init(704, 21, 'hasFilter || groupsRe');
function visit156_325_2(result) {
  _$jscoverage['/base/observable.js'].branchData['325'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['325'][1].init(698, 27, 'fn || hasFilter || groupsRe');
function visit155_325_1(result) {
  _$jscoverage['/base/observable.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['318'][1].init(494, 6, 'groups');
function visit154_318_1(result) {
  _$jscoverage['/base/observable.js'].branchData['318'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['314'][1].init(414, 17, '!observers.length');
function visit153_314_1(result) {
  _$jscoverage['/base/observable.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['305'][1].init(64, 24, 'Special[self.type] || {}');
function visit152_305_1(result) {
  _$jscoverage['/base/observable.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['292'][1].init(536, 5, 's.add');
function visit151_292_1(result) {
  _$jscoverage['/base/observable.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['284'][1].init(26, 13, 'observer.last');
function visit150_284_1(result) {
  _$jscoverage['/base/observable.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['280'][1].init(54, 15, 'observer.filter');
function visit149_280_1(result) {
  _$jscoverage['/base/observable.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['277'][1].init(442, 95, 'self.findObserver(observer) == -1');
function visit148_277_1(result) {
  _$jscoverage['/base/observable.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['272'][1].init(22, 12, '!observer.fn');
function visit147_272_1(result) {
  _$jscoverage['/base/observable.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['271'][1].init(265, 14, 'S.Config.debug');
function visit146_271_1(result) {
  _$jscoverage['/base/observable.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['267'][1].init(82, 24, 'Special[self.type] || {}');
function visit145_267_1(result) {
  _$jscoverage['/base/observable.js'].branchData['267'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['242'][1].init(124, 56, 'currentTarget[eventType] && !S.isWindow(currentTarget)');
function visit144_242_1(result) {
  _$jscoverage['/base/observable.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['236'][1].init(2872, 44, '!onlyHandlers && !event.isDefaultPrevented()');
function visit143_236_1(result) {
  _$jscoverage['/base/observable.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['234'][2].init(2815, 36, 'cur && !event.isPropagationStopped()');
function visit142_234_2(result) {
  _$jscoverage['/base/observable.js'].branchData['234'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['234'][1].init(707, 53, '!onlyHandlers && cur && !event.isPropagationStopped()');
function visit141_234_1(result) {
  _$jscoverage['/base/observable.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][2].init(529, 33, 'cur[ontype].call(cur) === false');
function visit140_230_2(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['230'][1].init(512, 50, 'cur[ontype] && cur[ontype].call(cur) === false');
function visit139_230_1(result) {
  _$jscoverage['/base/observable.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['225'][3].init(108, 14, 'gret !== false');
function visit138_225_3(result) {
  _$jscoverage['/base/observable.js'].branchData['225'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['225'][2].init(87, 17, 'ret !== undefined');
function visit137_225_2(result) {
  _$jscoverage['/base/observable.js'].branchData['225'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['225'][1].init(87, 35, 'ret !== undefined && gret !== false');
function visit136_225_1(result) {
  _$jscoverage['/base/observable.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['223'][1].init(214, 18, 'domEventObservable');
function visit135_223_1(result) {
  _$jscoverage['/base/observable.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['214'][2].init(1975, 14, 'cur && bubbles');
function visit134_214_2(result) {
  _$jscoverage['/base/observable.js'].branchData['214'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['214'][1].init(214, 31, '!onlyHandlers && cur && bubbles');
function visit133_214_1(result) {
  _$jscoverage['/base/observable.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][4].init(160, 19, 'cur === curDocument');
function visit132_213_4(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][4].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][3].init(160, 27, '(cur === curDocument) && win');
function visit131_213_3(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][2].init(138, 49, 'cur.ownerDocument || (cur === curDocument) && win');
function visit130_213_2(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['213'][1].init(120, 67, 'cur.parentNode || cur.ownerDocument || (cur === curDocument) && win');
function visit129_213_1(result) {
  _$jscoverage['/base/observable.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['191'][2].init(937, 71, 'specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit128_191_2(result) {
  _$jscoverage['/base/observable.js'].branchData['191'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['191'][1].init(913, 95, 'specialEvent.preFire && specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false');
function visit127_191_1(result) {
  _$jscoverage['/base/observable.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['181'][1].init(564, 34, '!(event instanceof DomEventObject)');
function visit126_181_1(result) {
  _$jscoverage['/base/observable.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['177'][2].init(440, 61, 'specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit125_177_2(result) {
  _$jscoverage['/base/observable.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['177'][1].init(419, 82, 'specialEvent.fire && specialEvent.fire.call(currentTarget, onlyHandlers) === false');
function visit124_177_1(result) {
  _$jscoverage['/base/observable.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['173'][1].init(214, 30, 'specialEvent.bubbles !== false');
function visit123_173_1(result) {
  _$jscoverage['/base/observable.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['172'][1].init(161, 24, 'Special[eventType] || {}');
function visit122_172_1(result) {
  _$jscoverage['/base/observable.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['166'][1].init(22, 11, 'event || {}');
function visit121_166_1(result) {
  _$jscoverage['/base/observable.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['149'][3].init(315, 17, 'ret !== undefined');
function visit120_149_3(result) {
  _$jscoverage['/base/observable.js'].branchData['149'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['149'][2].init(297, 14, 'gRet !== false');
function visit119_149_2(result) {
  _$jscoverage['/base/observable.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['149'][1].init(297, 35, 'gRet !== false && ret !== undefined');
function visit118_149_1(result) {
  _$jscoverage['/base/observable.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['140'][2].init(371, 33, 'j < currentTargetObservers.length');
function visit117_140_2(result) {
  _$jscoverage['/base/observable.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['140'][1].init(329, 75, '!event.isImmediatePropagationStopped() && j < currentTargetObservers.length');
function visit116_140_1(result) {
  _$jscoverage['/base/observable.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['132'][2].init(3200, 7, 'i < len');
function visit115_132_2(result) {
  _$jscoverage['/base/observable.js'].branchData['132'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['132'][1].init(3167, 40, '!event.isPropagationStopped() && i < len');
function visit114_132_1(result) {
  _$jscoverage['/base/observable.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['121'][1].init(2599, 32, 'delegateCount < observers.length');
function visit113_121_1(result) {
  _$jscoverage['/base/observable.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['115'][1].init(1221, 34, 'target.parentNode || currentTarget');
function visit112_115_1(result) {
  _$jscoverage['/base/observable.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['108'][1].init(810, 29, 'currentTargetObservers.length');
function visit111_108_1(result) {
  _$jscoverage['/base/observable.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['104'][1].init(425, 7, 'matched');
function visit110_104_1(result) {
  _$jscoverage['/base/observable.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['101'][1].init(248, 21, 'matched === undefined');
function visit109_101_1(result) {
  _$jscoverage['/base/observable.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['96'][1].init(190, 17, 'i < delegateCount');
function visit108_96_1(result) {
  _$jscoverage['/base/observable.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['92'][3].init(54, 21, 'eventType !== \'click\'');
function visit107_92_3(result) {
  _$jscoverage['/base/observable.js'].branchData['92'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['92'][2].init(26, 24, 'target.disabled !== true');
function visit106_92_2(result) {
  _$jscoverage['/base/observable.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['92'][1].init(26, 49, 'target.disabled !== true || eventType !== \'click\'');
function visit105_92_1(result) {
  _$jscoverage['/base/observable.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['91'][1].init(25, 23, 'target != currentTarget');
function visit104_91_1(result) {
  _$jscoverage['/base/observable.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['90'][1].init(1046, 32, 'delegateCount && target.nodeType');
function visit103_90_1(result) {
  _$jscoverage['/base/observable.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['83'][1].init(415, 23, 'self.delegateCount || 0');
function visit102_83_1(result) {
  _$jscoverage['/base/observable.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['41'][2].init(342, 43, 's.setup.call(currentTarget, type) === false');
function visit101_41_2(result) {
  _$jscoverage['/base/observable.js'].branchData['41'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['41'][1].init(330, 55, '!s.setup || s.setup.call(currentTarget, type) === false');
function visit100_41_1(result) {
  _$jscoverage['/base/observable.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].branchData['36'][1].init(72, 19, 'Special[type] || {}');
function visit99_36_1(result) {
  _$jscoverage['/base/observable.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/observable.js'].lineData[6]++;
KISSY.add('event/dom/base/observable', function(S, Dom, Special, DomEventUtils, DomEventObserver, DomEventObject, BaseEvent) {
  _$jscoverage['/base/observable.js'].functionData[0]++;
  _$jscoverage['/base/observable.js'].lineData[11]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/observable.js'].lineData[12]++;
  var logger = S.getLogger('s/event');
  _$jscoverage['/base/observable.js'].lineData[21]++;
  function DomEventObservable(cfg) {
    _$jscoverage['/base/observable.js'].functionData[1]++;
    _$jscoverage['/base/observable.js'].lineData[22]++;
    var self = this;
    _$jscoverage['/base/observable.js'].lineData[23]++;
    S.mix(self, cfg);
    _$jscoverage['/base/observable.js'].lineData[24]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[31]++;
  S.extend(DomEventObservable, BaseEvent.Observable, {
  setup: function() {
  _$jscoverage['/base/observable.js'].functionData[2]++;
  _$jscoverage['/base/observable.js'].lineData[34]++;
  var self = this, type = self.type, s = visit99_36_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget), handle = eventDesc.handle;
  _$jscoverage['/base/observable.js'].lineData[41]++;
  if (visit100_41_1(!s.setup || visit101_41_2(s.setup.call(currentTarget, type) === false))) {
    _$jscoverage['/base/observable.js'].lineData[42]++;
    DomEventUtils.simpleAdd(currentTarget, type, handle);
  }
}, 
  constructor: DomEventObservable, 
  reset: function() {
  _$jscoverage['/base/observable.js'].functionData[3]++;
  _$jscoverage['/base/observable.js'].lineData[49]++;
  var self = this;
  _$jscoverage['/base/observable.js'].lineData[50]++;
  DomEventObservable.superclass.reset.call(self);
  _$jscoverage['/base/observable.js'].lineData[51]++;
  self.delegateCount = 0;
  _$jscoverage['/base/observable.js'].lineData[52]++;
  self.lastCount = 0;
}, 
  notify: function(event) {
  _$jscoverage['/base/observable.js'].functionData[4]++;
  _$jscoverage['/base/observable.js'].lineData[71]++;
  var target = event.target, eventType = event['type'], self = this, currentTarget = self.currentTarget, observers = self.observers, currentTarget0, allObservers = [], ret, gRet, observerObj, i, j, delegateCount = visit102_83_1(self.delegateCount || 0), len, currentTargetObservers, currentTargetObserver, observer;
  _$jscoverage['/base/observable.js'].lineData[90]++;
  if (visit103_90_1(delegateCount && target.nodeType)) {
    _$jscoverage['/base/observable.js'].lineData[91]++;
    while (visit104_91_1(target != currentTarget)) {
      _$jscoverage['/base/observable.js'].lineData[92]++;
      if (visit105_92_1(visit106_92_2(target.disabled !== true) || visit107_92_3(eventType !== 'click'))) {
        _$jscoverage['/base/observable.js'].lineData[93]++;
        var cachedMatch = {}, matched, key, filter;
        _$jscoverage['/base/observable.js'].lineData[95]++;
        currentTargetObservers = [];
        _$jscoverage['/base/observable.js'].lineData[96]++;
        for (i = 0; visit108_96_1(i < delegateCount); i++) {
          _$jscoverage['/base/observable.js'].lineData[97]++;
          observer = observers[i];
          _$jscoverage['/base/observable.js'].lineData[98]++;
          filter = observer.filter;
          _$jscoverage['/base/observable.js'].lineData[99]++;
          key = filter + '';
          _$jscoverage['/base/observable.js'].lineData[100]++;
          matched = cachedMatch[key];
          _$jscoverage['/base/observable.js'].lineData[101]++;
          if (visit109_101_1(matched === undefined)) {
            _$jscoverage['/base/observable.js'].lineData[102]++;
            matched = cachedMatch[key] = Dom.test(target, filter);
          }
          _$jscoverage['/base/observable.js'].lineData[104]++;
          if (visit110_104_1(matched)) {
            _$jscoverage['/base/observable.js'].lineData[105]++;
            currentTargetObservers.push(observer);
          }
        }
        _$jscoverage['/base/observable.js'].lineData[108]++;
        if (visit111_108_1(currentTargetObservers.length)) {
          _$jscoverage['/base/observable.js'].lineData[109]++;
          allObservers.push({
  currentTarget: target, 
  'currentTargetObservers': currentTargetObservers});
        }
      }
      _$jscoverage['/base/observable.js'].lineData[115]++;
      target = visit112_115_1(target.parentNode || currentTarget);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[121]++;
  if (visit113_121_1(delegateCount < observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[122]++;
    allObservers.push({
  currentTarget: currentTarget, 
  currentTargetObservers: observers.slice(delegateCount)});
  }
  _$jscoverage['/base/observable.js'].lineData[132]++;
  for (i = 0 , len = allObservers.length; visit114_132_1(!event.isPropagationStopped() && visit115_132_2(i < len)); ++i) {
    _$jscoverage['/base/observable.js'].lineData[134]++;
    observerObj = allObservers[i];
    _$jscoverage['/base/observable.js'].lineData[135]++;
    currentTargetObservers = observerObj.currentTargetObservers;
    _$jscoverage['/base/observable.js'].lineData[136]++;
    currentTarget0 = observerObj.currentTarget;
    _$jscoverage['/base/observable.js'].lineData[137]++;
    event.currentTarget = currentTarget0;
    _$jscoverage['/base/observable.js'].lineData[140]++;
    for (j = 0; visit116_140_1(!event.isImmediatePropagationStopped() && visit117_140_2(j < currentTargetObservers.length)); j++) {
      _$jscoverage['/base/observable.js'].lineData[142]++;
      currentTargetObserver = currentTargetObservers[j];
      _$jscoverage['/base/observable.js'].lineData[144]++;
      ret = currentTargetObserver.notify(event, self);
      _$jscoverage['/base/observable.js'].lineData[149]++;
      if (visit118_149_1(visit119_149_2(gRet !== false) && visit120_149_3(ret !== undefined))) {
        _$jscoverage['/base/observable.js'].lineData[150]++;
        gRet = ret;
      }
    }
  }
  _$jscoverage['/base/observable.js'].lineData[157]++;
  return gRet;
}, 
  fire: function(event, onlyHandlers) {
  _$jscoverage['/base/observable.js'].functionData[5]++;
  _$jscoverage['/base/observable.js'].lineData[166]++;
  event = visit121_166_1(event || {});
  _$jscoverage['/base/observable.js'].lineData[168]++;
  var self = this, eventType = String(self.type), domEventObservable, eventData, specialEvent = visit122_172_1(Special[eventType] || {}), bubbles = visit123_173_1(specialEvent.bubbles !== false), currentTarget = self.currentTarget;
  _$jscoverage['/base/observable.js'].lineData[177]++;
  if (visit124_177_1(specialEvent.fire && visit125_177_2(specialEvent.fire.call(currentTarget, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[178]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[181]++;
  if (visit126_181_1(!(event instanceof DomEventObject))) {
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
  if (visit127_191_1(specialEvent.preFire && visit128_191_2(specialEvent.preFire.call(currentTarget, event, onlyHandlers) === false))) {
    _$jscoverage['/base/observable.js'].lineData[192]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[198]++;
  var cur = currentTarget, win = Dom.getWindow(cur), curDocument = win.document, eventPath = [], gret, ret, ontype = 'on' + eventType, eventPathIndex = 0;
  _$jscoverage['/base/observable.js'].lineData[210]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[211]++;
    eventPath.push(cur);
    _$jscoverage['/base/observable.js'].lineData[213]++;
    cur = visit129_213_1(cur.parentNode || visit130_213_2(cur.ownerDocument || visit131_213_3((visit132_213_4(cur === curDocument)) && win)));
  } while (visit133_214_1(!onlyHandlers && visit134_214_2(cur && bubbles)));
  _$jscoverage['/base/observable.js'].lineData[216]++;
  cur = eventPath[eventPathIndex];
  _$jscoverage['/base/observable.js'].lineData[219]++;
  do {
    _$jscoverage['/base/observable.js'].lineData[220]++;
    event['currentTarget'] = cur;
    _$jscoverage['/base/observable.js'].lineData[221]++;
    domEventObservable = DomEventObservable.getDomEventObservable(cur, eventType);
    _$jscoverage['/base/observable.js'].lineData[223]++;
    if (visit135_223_1(domEventObservable)) {
      _$jscoverage['/base/observable.js'].lineData[224]++;
      ret = domEventObservable.notify(event);
      _$jscoverage['/base/observable.js'].lineData[225]++;
      if (visit136_225_1(visit137_225_2(ret !== undefined) && visit138_225_3(gret !== false))) {
        _$jscoverage['/base/observable.js'].lineData[226]++;
        gret = ret;
      }
    }
    _$jscoverage['/base/observable.js'].lineData[230]++;
    if (visit139_230_1(cur[ontype] && visit140_230_2(cur[ontype].call(cur) === false))) {
      _$jscoverage['/base/observable.js'].lineData[231]++;
      event.preventDefault();
    }
    _$jscoverage['/base/observable.js'].lineData[233]++;
    cur = eventPath[++eventPathIndex];
  } while (visit141_234_1(!onlyHandlers && visit142_234_2(cur && !event.isPropagationStopped())));
  _$jscoverage['/base/observable.js'].lineData[236]++;
  if (visit143_236_1(!onlyHandlers && !event.isDefaultPrevented())) {
    _$jscoverage['/base/observable.js'].lineData[239]++;
    try {
      _$jscoverage['/base/observable.js'].lineData[242]++;
      if (visit144_242_1(currentTarget[eventType] && !S.isWindow(currentTarget))) {
        _$jscoverage['/base/observable.js'].lineData[244]++;
        DomEventObservable.triggeredEvent = eventType;
        _$jscoverage['/base/observable.js'].lineData[248]++;
        currentTarget[eventType]();
      }
    }    catch (eError) {
  _$jscoverage['/base/observable.js'].lineData[251]++;
  logger.debug('trigger action error: ' + eError);
}
    _$jscoverage['/base/observable.js'].lineData[254]++;
    DomEventObservable.triggeredEvent = '';
  }
  _$jscoverage['/base/observable.js'].lineData[257]++;
  return gret;
}, 
  on: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[6]++;
  _$jscoverage['/base/observable.js'].lineData[265]++;
  var self = this, observers = self.observers, s = visit145_267_1(Special[self.type] || {}), observer = cfg instanceof DomEventObserver ? cfg : new DomEventObserver(cfg);
  _$jscoverage['/base/observable.js'].lineData[271]++;
  if (visit146_271_1(S.Config.debug)) {
    _$jscoverage['/base/observable.js'].lineData[272]++;
    if (visit147_272_1(!observer.fn)) {
      _$jscoverage['/base/observable.js'].lineData[273]++;
      S.error('lack event handler for ' + self.type);
    }
  }
  _$jscoverage['/base/observable.js'].lineData[277]++;
  if (visit148_277_1(self.findObserver(observer) == -1)) {
    _$jscoverage['/base/observable.js'].lineData[280]++;
    if (visit149_280_1(observer.filter)) {
      _$jscoverage['/base/observable.js'].lineData[281]++;
      observers.splice(self.delegateCount, 0, observer);
      _$jscoverage['/base/observable.js'].lineData[282]++;
      self.delegateCount++;
    } else {
      _$jscoverage['/base/observable.js'].lineData[284]++;
      if (visit150_284_1(observer.last)) {
        _$jscoverage['/base/observable.js'].lineData[285]++;
        observers.push(observer);
        _$jscoverage['/base/observable.js'].lineData[286]++;
        self.lastCount++;
      } else {
        _$jscoverage['/base/observable.js'].lineData[288]++;
        observers.splice(observers.length - self.lastCount, 0, observer);
      }
    }
    _$jscoverage['/base/observable.js'].lineData[292]++;
    if (visit151_292_1(s.add)) {
      _$jscoverage['/base/observable.js'].lineData[293]++;
      s.add.call(self.currentTarget, observer);
    }
  }
}, 
  detach: function(cfg) {
  _$jscoverage['/base/observable.js'].functionData[7]++;
  _$jscoverage['/base/observable.js'].lineData[303]++;
  var groupsRe, self = this, s = visit152_305_1(Special[self.type] || {}), hasFilter = 'filter' in cfg, filter = cfg.filter, context = cfg.context, fn = cfg.fn, currentTarget = self.currentTarget, observers = self.observers, groups = cfg.groups;
  _$jscoverage['/base/observable.js'].lineData[314]++;
  if (visit153_314_1(!observers.length)) {
    _$jscoverage['/base/observable.js'].lineData[315]++;
    return;
  }
  _$jscoverage['/base/observable.js'].lineData[318]++;
  if (visit154_318_1(groups)) {
    _$jscoverage['/base/observable.js'].lineData[319]++;
    groupsRe = BaseUtils.getGroupsRe(groups);
  }
  _$jscoverage['/base/observable.js'].lineData[322]++;
  var i, j, t, observer, observerContext, len = observers.length;
  _$jscoverage['/base/observable.js'].lineData[325]++;
  if (visit155_325_1(fn || visit156_325_2(hasFilter || groupsRe))) {
    _$jscoverage['/base/observable.js'].lineData[326]++;
    context = visit157_326_1(context || currentTarget);
    _$jscoverage['/base/observable.js'].lineData[328]++;
    for (i = 0 , j = 0 , t = []; visit158_328_1(i < len); ++i) {
      _$jscoverage['/base/observable.js'].lineData[329]++;
      observer = observers[i];
      _$jscoverage['/base/observable.js'].lineData[330]++;
      observerContext = visit159_330_1(observer.context || currentTarget);
      _$jscoverage['/base/observable.js'].lineData[331]++;
      if (visit160_332_1((visit161_332_2(context != observerContext)) || visit162_334_1((visit163_334_2(fn && visit164_334_3(fn != observer.fn))) || visit165_349_1((visit166_350_1(hasFilter && (visit167_352_1((visit168_352_2(filter && visit169_352_3(filter != observer.filter))) || (visit170_353_1(!filter && !observer.filter)))))) || (visit171_358_1(groupsRe && !observer.groups.match(groupsRe))))))) {
        _$jscoverage['/base/observable.js'].lineData[360]++;
        t[j++] = observer;
      } else {
        _$jscoverage['/base/observable.js'].lineData[362]++;
        if (visit172_362_1(observer.filter && self.delegateCount)) {
          _$jscoverage['/base/observable.js'].lineData[363]++;
          self.delegateCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[365]++;
        if (visit173_365_1(observer.last && self.lastCount)) {
          _$jscoverage['/base/observable.js'].lineData[366]++;
          self.lastCount--;
        }
        _$jscoverage['/base/observable.js'].lineData[368]++;
        if (visit174_368_1(s.remove)) {
          _$jscoverage['/base/observable.js'].lineData[369]++;
          s.remove.call(currentTarget, observer);
        }
      }
    }
    _$jscoverage['/base/observable.js'].lineData[374]++;
    self.observers = t;
  } else {
    _$jscoverage['/base/observable.js'].lineData[377]++;
    self.reset();
  }
  _$jscoverage['/base/observable.js'].lineData[380]++;
  self.checkMemory();
}, 
  checkMemory: function() {
  _$jscoverage['/base/observable.js'].functionData[8]++;
  _$jscoverage['/base/observable.js'].lineData[384]++;
  var self = this, type = self.type, domEventObservables, handle, s = visit175_388_1(Special[type] || {}), currentTarget = self.currentTarget, eventDesc = DomEventUtils.data(currentTarget);
  _$jscoverage['/base/observable.js'].lineData[391]++;
  if (visit176_391_1(eventDesc)) {
    _$jscoverage['/base/observable.js'].lineData[392]++;
    domEventObservables = eventDesc.observables;
    _$jscoverage['/base/observable.js'].lineData[393]++;
    if (visit177_393_1(!self.hasObserver())) {
      _$jscoverage['/base/observable.js'].lineData[394]++;
      handle = eventDesc.handle;
      _$jscoverage['/base/observable.js'].lineData[397]++;
      if ((visit178_397_1(!s['tearDown'] || visit179_397_2(s['tearDown'].call(currentTarget, type) === false)))) {
        _$jscoverage['/base/observable.js'].lineData[398]++;
        DomEventUtils.simpleRemove(currentTarget, type, handle);
      }
      _$jscoverage['/base/observable.js'].lineData[401]++;
      delete domEventObservables[type];
    }
    _$jscoverage['/base/observable.js'].lineData[405]++;
    if (visit180_405_1(S.isEmptyObject(domEventObservables))) {
      _$jscoverage['/base/observable.js'].lineData[406]++;
      eventDesc.handle = null;
      _$jscoverage['/base/observable.js'].lineData[407]++;
      DomEventUtils.removeData(currentTarget);
    }
  }
}});
  _$jscoverage['/base/observable.js'].lineData[413]++;
  DomEventObservable.triggeredEvent = '';
  _$jscoverage['/base/observable.js'].lineData[421]++;
  DomEventObservable.getDomEventObservable = function(node, type) {
  _$jscoverage['/base/observable.js'].functionData[9]++;
  _$jscoverage['/base/observable.js'].lineData[423]++;
  var domEventObservablesHolder = DomEventUtils.data(node), domEventObservables;
  _$jscoverage['/base/observable.js'].lineData[425]++;
  if (visit181_425_1(domEventObservablesHolder)) {
    _$jscoverage['/base/observable.js'].lineData[426]++;
    domEventObservables = domEventObservablesHolder.observables;
  }
  _$jscoverage['/base/observable.js'].lineData[428]++;
  if (visit182_428_1(domEventObservables)) {
    _$jscoverage['/base/observable.js'].lineData[429]++;
    return domEventObservables[type];
  }
  _$jscoverage['/base/observable.js'].lineData[432]++;
  return null;
};
  _$jscoverage['/base/observable.js'].lineData[436]++;
  DomEventObservable.getDomEventObservablesHolder = function(node, create) {
  _$jscoverage['/base/observable.js'].functionData[10]++;
  _$jscoverage['/base/observable.js'].lineData[437]++;
  var domEventObservables = DomEventUtils.data(node);
  _$jscoverage['/base/observable.js'].lineData[438]++;
  if (visit183_438_1(!domEventObservables && create)) {
    _$jscoverage['/base/observable.js'].lineData[439]++;
    DomEventUtils.data(node, domEventObservables = {});
  }
  _$jscoverage['/base/observable.js'].lineData[441]++;
  return domEventObservables;
};
  _$jscoverage['/base/observable.js'].lineData[444]++;
  return DomEventObservable;
}, {
  requires: ['dom', './special', './utils', './observer', './object', 'event/base']});
