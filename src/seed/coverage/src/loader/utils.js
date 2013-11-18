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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[28] = 0;
  _$jscoverage['/loader/utils.js'].lineData[29] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[32] = 0;
  _$jscoverage['/loader/utils.js'].lineData[35] = 0;
  _$jscoverage['/loader/utils.js'].lineData[36] = 0;
  _$jscoverage['/loader/utils.js'].lineData[38] = 0;
  _$jscoverage['/loader/utils.js'].lineData[42] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[45] = 0;
  _$jscoverage['/loader/utils.js'].lineData[47] = 0;
  _$jscoverage['/loader/utils.js'].lineData[50] = 0;
  _$jscoverage['/loader/utils.js'].lineData[51] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[58] = 0;
  _$jscoverage['/loader/utils.js'].lineData[60] = 0;
  _$jscoverage['/loader/utils.js'].lineData[65] = 0;
  _$jscoverage['/loader/utils.js'].lineData[68] = 0;
  _$jscoverage['/loader/utils.js'].lineData[74] = 0;
  _$jscoverage['/loader/utils.js'].lineData[84] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[87] = 0;
  _$jscoverage['/loader/utils.js'].lineData[90] = 0;
  _$jscoverage['/loader/utils.js'].lineData[91] = 0;
  _$jscoverage['/loader/utils.js'].lineData[93] = 0;
  _$jscoverage['/loader/utils.js'].lineData[96] = 0;
  _$jscoverage['/loader/utils.js'].lineData[99] = 0;
  _$jscoverage['/loader/utils.js'].lineData[100] = 0;
  _$jscoverage['/loader/utils.js'].lineData[102] = 0;
  _$jscoverage['/loader/utils.js'].lineData[111] = 0;
  _$jscoverage['/loader/utils.js'].lineData[112] = 0;
  _$jscoverage['/loader/utils.js'].lineData[124] = 0;
  _$jscoverage['/loader/utils.js'].lineData[126] = 0;
  _$jscoverage['/loader/utils.js'].lineData[129] = 0;
  _$jscoverage['/loader/utils.js'].lineData[130] = 0;
  _$jscoverage['/loader/utils.js'].lineData[134] = 0;
  _$jscoverage['/loader/utils.js'].lineData[139] = 0;
  _$jscoverage['/loader/utils.js'].lineData[149] = 0;
  _$jscoverage['/loader/utils.js'].lineData[159] = 0;
  _$jscoverage['/loader/utils.js'].lineData[165] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[171] = 0;
  _$jscoverage['/loader/utils.js'].lineData[173] = 0;
  _$jscoverage['/loader/utils.js'].lineData[174] = 0;
  _$jscoverage['/loader/utils.js'].lineData[176] = 0;
  _$jscoverage['/loader/utils.js'].lineData[179] = 0;
  _$jscoverage['/loader/utils.js'].lineData[183] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[199] = 0;
  _$jscoverage['/loader/utils.js'].lineData[200] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[206] = 0;
  _$jscoverage['/loader/utils.js'].lineData[208] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[225] = 0;
  _$jscoverage['/loader/utils.js'].lineData[227] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[232] = 0;
  _$jscoverage['/loader/utils.js'].lineData[234] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[237] = 0;
  _$jscoverage['/loader/utils.js'].lineData[238] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[243] = 0;
  _$jscoverage['/loader/utils.js'].lineData[244] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[248] = 0;
  _$jscoverage['/loader/utils.js'].lineData[250] = 0;
  _$jscoverage['/loader/utils.js'].lineData[251] = 0;
  _$jscoverage['/loader/utils.js'].lineData[253] = 0;
  _$jscoverage['/loader/utils.js'].lineData[262] = 0;
  _$jscoverage['/loader/utils.js'].lineData[263] = 0;
  _$jscoverage['/loader/utils.js'].lineData[266] = 0;
  _$jscoverage['/loader/utils.js'].lineData[269] = 0;
  _$jscoverage['/loader/utils.js'].lineData[273] = 0;
  _$jscoverage['/loader/utils.js'].lineData[274] = 0;
  _$jscoverage['/loader/utils.js'].lineData[276] = 0;
  _$jscoverage['/loader/utils.js'].lineData[280] = 0;
  _$jscoverage['/loader/utils.js'].lineData[283] = 0;
  _$jscoverage['/loader/utils.js'].lineData[292] = 0;
  _$jscoverage['/loader/utils.js'].lineData[293] = 0;
  _$jscoverage['/loader/utils.js'].lineData[295] = 0;
  _$jscoverage['/loader/utils.js'].lineData[310] = 0;
  _$jscoverage['/loader/utils.js'].lineData[321] = 0;
  _$jscoverage['/loader/utils.js'].lineData[328] = 0;
  _$jscoverage['/loader/utils.js'].lineData[329] = 0;
  _$jscoverage['/loader/utils.js'].lineData[330] = 0;
  _$jscoverage['/loader/utils.js'].lineData[331] = 0;
  _$jscoverage['/loader/utils.js'].lineData[332] = 0;
  _$jscoverage['/loader/utils.js'].lineData[333] = 0;
  _$jscoverage['/loader/utils.js'].lineData[334] = 0;
  _$jscoverage['/loader/utils.js'].lineData[335] = 0;
  _$jscoverage['/loader/utils.js'].lineData[338] = 0;
  _$jscoverage['/loader/utils.js'].lineData[342] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[354] = 0;
  _$jscoverage['/loader/utils.js'].lineData[356] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[360] = 0;
  _$jscoverage['/loader/utils.js'].lineData[365] = 0;
  _$jscoverage['/loader/utils.js'].lineData[366] = 0;
  _$jscoverage['/loader/utils.js'].lineData[368] = 0;
  _$jscoverage['/loader/utils.js'].lineData[379] = 0;
  _$jscoverage['/loader/utils.js'].lineData[381] = 0;
  _$jscoverage['/loader/utils.js'].lineData[384] = 0;
  _$jscoverage['/loader/utils.js'].lineData[385] = 0;
  _$jscoverage['/loader/utils.js'].lineData[386] = 0;
  _$jscoverage['/loader/utils.js'].lineData[390] = 0;
  _$jscoverage['/loader/utils.js'].lineData[392] = 0;
  _$jscoverage['/loader/utils.js'].lineData[396] = 0;
  _$jscoverage['/loader/utils.js'].lineData[402] = 0;
  _$jscoverage['/loader/utils.js'].lineData[413] = 0;
  _$jscoverage['/loader/utils.js'].lineData[419] = 0;
  _$jscoverage['/loader/utils.js'].lineData[420] = 0;
  _$jscoverage['/loader/utils.js'].lineData[421] = 0;
  _$jscoverage['/loader/utils.js'].lineData[422] = 0;
  _$jscoverage['/loader/utils.js'].lineData[425] = 0;
  _$jscoverage['/loader/utils.js'].lineData[434] = 0;
  _$jscoverage['/loader/utils.js'].lineData[436] = 0;
  _$jscoverage['/loader/utils.js'].lineData[437] = 0;
  _$jscoverage['/loader/utils.js'].lineData[440] = 0;
  _$jscoverage['/loader/utils.js'].lineData[444] = 0;
  _$jscoverage['/loader/utils.js'].lineData[445] = 0;
  _$jscoverage['/loader/utils.js'].lineData[448] = 0;
  _$jscoverage['/loader/utils.js'].lineData[449] = 0;
  _$jscoverage['/loader/utils.js'].lineData[450] = 0;
  _$jscoverage['/loader/utils.js'].lineData[451] = 0;
  _$jscoverage['/loader/utils.js'].lineData[452] = 0;
  _$jscoverage['/loader/utils.js'].lineData[455] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
  _$jscoverage['/loader/utils.js'].functionData[24] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['29'] = [];
  _$jscoverage['/loader/utils.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['35'] = [];
  _$jscoverage['/loader/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['44'] = [];
  _$jscoverage['/loader/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['52'] = [];
  _$jscoverage['/loader/utils.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['58'] = [];
  _$jscoverage['/loader/utils.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['74'] = [];
  _$jscoverage['/loader/utils.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['86'] = [];
  _$jscoverage['/loader/utils.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['90'] = [];
  _$jscoverage['/loader/utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['91'] = [];
  _$jscoverage['/loader/utils.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['99'] = [];
  _$jscoverage['/loader/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['129'] = [];
  _$jscoverage['/loader/utils.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'] = [];
  _$jscoverage['/loader/utils.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'] = [];
  _$jscoverage['/loader/utils.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['173'] = [];
  _$jscoverage['/loader/utils.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['197'] = [];
  _$jscoverage['/loader/utils.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['199'] = [];
  _$jscoverage['/loader/utils.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['205'] = [];
  _$jscoverage['/loader/utils.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['224'] = [];
  _$jscoverage['/loader/utils.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['227'] = [];
  _$jscoverage['/loader/utils.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['231'] = [];
  _$jscoverage['/loader/utils.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['234'] = [];
  _$jscoverage['/loader/utils.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['237'] = [];
  _$jscoverage['/loader/utils.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['240'] = [];
  _$jscoverage['/loader/utils.js'].branchData['240'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['241'] = [];
  _$jscoverage['/loader/utils.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['248'] = [];
  _$jscoverage['/loader/utils.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['262'] = [];
  _$jscoverage['/loader/utils.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['269'] = [];
  _$jscoverage['/loader/utils.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['274'] = [];
  _$jscoverage['/loader/utils.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['292'] = [];
  _$jscoverage['/loader/utils.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['330'] = [];
  _$jscoverage['/loader/utils.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['331'] = [];
  _$jscoverage['/loader/utils.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['333'] = [];
  _$jscoverage['/loader/utils.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['334'] = [];
  _$jscoverage['/loader/utils.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['354'] = [];
  _$jscoverage['/loader/utils.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['356'] = [];
  _$jscoverage['/loader/utils.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['359'] = [];
  _$jscoverage['/loader/utils.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['365'] = [];
  _$jscoverage['/loader/utils.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['384'] = [];
  _$jscoverage['/loader/utils.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['413'] = [];
  _$jscoverage['/loader/utils.js'].branchData['413'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['414'] = [];
  _$jscoverage['/loader/utils.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['419'] = [];
  _$jscoverage['/loader/utils.js'].branchData['419'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['421'] = [];
  _$jscoverage['/loader/utils.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['436'] = [];
  _$jscoverage['/loader/utils.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['449'] = [];
  _$jscoverage['/loader/utils.js'].branchData['449'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['451'] = [];
  _$jscoverage['/loader/utils.js'].branchData['451'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['451'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['451'][2].init(68, 24, 'module.status !== status');
function visit518_451_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['451'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['451'][1].init(57, 35, '!module || module.status !== status');
function visit517_451_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['451'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['449'][1].init(135, 19, 'i < modNames.length');
function visit516_449_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['449'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['436'][1].init(82, 8, '--i > -1');
function visit515_436_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['421'][1].init(60, 23, 'm = path.match(rule[0])');
function visit514_421_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['419'][1].init(198, 22, 'i < mappedRules.length');
function visit513_419_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['419'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['414'][1].init(28, 52, 'runtime.Config.mappedRules || []');
function visit512_414_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['413'][1].init(31, 81, 'rules || runtime.Config.mappedRules || []');
function visit511_413_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['413'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['384'][1].init(135, 24, 'module && module.factory');
function visit510_384_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['365'][1].init(509, 10, 'refModName');
function visit509_365_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['359'][1].init(140, 11, 'modNames[i]');
function visit508_359_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['356'][1].init(82, 5, 'i < l');
function visit507_356_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['354'][1].init(49, 8, 'modNames');
function visit506_354_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['334'][1].init(33, 9, '!alias[j]');
function visit505_334_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['333'][1].init(84, 6, 'j >= 0');
function visit504_333_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['331'][1].init(26, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit503_331_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['330'][1].init(66, 6, 'i >= 0');
function visit502_330_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['292'][1].init(17, 27, 'typeof modNames == \'string\'');
function visit501_292_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['274'][1].init(254, 21, 'exports !== undefined');
function visit500_274_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['269'][1].init(179, 29, 'typeof factory === \'function\'');
function visit499_269_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['262'][1].init(17, 23, 'module.status != LOADED');
function visit498_262_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['248'][1].init(916, 104, 'Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit497_248_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['241'][1].init(21, 25, 'S.inArray(modName, stack)');
function visit496_241_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['240'][1].init(599, 9, '\'@DEBUG@\'');
function visit495_240_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['240'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['237'][1].init(502, 16, 'status != LOADED');
function visit494_237_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['234'][1].init(418, 15, 'status == ERROR');
function visit493_234_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['231'][1].init(320, 18, 'status == ATTACHED');
function visit492_231_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['227'][1].init(206, 2, '!m');
function visit491_227_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['224'][1].init(117, 16, 'modName in cache');
function visit490_224_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['205'][1].init(21, 78, 's && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit489_205_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(331, 5, 'i < l');
function visit488_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['199'][1].init(172, 11, 'cache || {}');
function visit487_199_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['197'][1].init(75, 11, 'stack || []');
function visit486_197_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][1].init(289, 5, 'allOk');
function visit485_173_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][3].init(86, 20, 'm.status == ATTACHED');
function visit484_171_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][2].init(81, 25, 'm && m.status == ATTACHED');
function visit483_171_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][1].init(76, 30, 'a && m && m.status == ATTACHED');
function visit482_171_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][2].init(79, 25, 'module.getType() != \'css\'');
function visit481_167_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][1].init(68, 36, '!module || module.getType() != \'css\'');
function visit480_167_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['129'][1].init(144, 6, 'module');
function visit479_129_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['99'][1].init(460, 5, 'i < l');
function visit478_99_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['91'][1].init(21, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit477_91_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['90'][1].init(119, 26, 'typeof depName == \'string\'');
function visit476_90_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['86'][1].init(44, 8, '!depName');
function visit475_86_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['74'][1].init(20, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit474_74_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['58'][1].init(25, 12, 'Plugin.alias');
function visit473_58_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['52'][1].init(52, 11, 'index != -1');
function visit472_52_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['44'][1].init(38, 29, 's.charAt(s.length - 1) == \'/\'');
function visit471_44_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['35'][1].init(99, 5, 'i < l');
function visit470_35_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['29'][1].init(13, 20, 'typeof s == \'string\'');
function visit469_29_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, TRUE = !0, FALSE = !1, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[28]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[29]++;
    if (visit469_29_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[30]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[35]++;
      for (; visit470_35_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[36]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[38]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[42]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[44]++;
    if (visit471_44_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[45]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[47]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[50]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[51]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[52]++;
    if (visit472_52_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[53]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[54]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[55]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[58]++;
  if (visit473_58_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[60]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[65]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[68]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[74]++;
  return visit474_74_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[84]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[86]++;
  if (visit475_86_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[87]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[90]++;
  if (visit476_90_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[91]++;
    if (visit477_91_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[93]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[96]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[99]++;
  for (l = depName.length; visit478_99_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[100]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[102]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[111]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[112]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[124]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[126]++;
  var mods = runtime.Env.mods, module = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[129]++;
  if (visit479_129_1(module)) {
    _$jscoverage['/loader/utils.js'].lineData[130]++;
    return module;
  }
  _$jscoverage['/loader/utils.js'].lineData[134]++;
  mods[modName] = module = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[139]++;
  return module;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[149]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[159]++;
  var mods = [runtime], module, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[165]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[166]++;
  module = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[167]++;
  if (visit480_167_1(!module || visit481_167_2(module.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[168]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[169]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[170]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[171]++;
  return visit482_171_1(a && visit483_171_2(m && visit484_171_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[173]++;
    if (visit485_173_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[174]++;
      mods.push(runtimeMods[unalias[0]].exports);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[176]++;
      mods.push(null);
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[179]++;
    mods.push(undefined);
  }
});
  _$jscoverage['/loader/utils.js'].lineData[183]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  stack = visit486_197_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[199]++;
  cache = visit487_199_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[200]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[204]++;
  for (i = 0; visit488_204_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[205]++;
    s = visit489_205_1(s && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[206]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[208]++;
  return !!s;
}, 
  attachModRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[221]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[224]++;
  if (visit490_224_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[225]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[227]++;
  if (visit491_227_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[228]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[230]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[231]++;
  if (visit492_231_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[232]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[234]++;
  if (visit493_234_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[235]++;
    errorList.push(m);
  }
  _$jscoverage['/loader/utils.js'].lineData[237]++;
  if (visit494_237_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[238]++;
    return cache[modName] = FALSE;
  }
  _$jscoverage['/loader/utils.js'].lineData[240]++;
  if (visit495_240_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[241]++;
    if (visit496_241_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[242]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[243]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[244]++;
      return cache[modName] = FALSE;
    }
    _$jscoverage['/loader/utils.js'].lineData[246]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[248]++;
  if (visit497_248_1(Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[250]++;
    Utils.attachMod(runtime, m);
    _$jscoverage['/loader/utils.js'].lineData[251]++;
    return cache[modName] = TRUE;
  }
  _$jscoverage['/loader/utils.js'].lineData[253]++;
  return cache[modName] = FALSE;
}, 
  attachMod: function(runtime, module) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[262]++;
  if (visit498_262_1(module.status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[263]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[266]++;
  var factory = module.factory, exports = undefined;
  _$jscoverage['/loader/utils.js'].lineData[269]++;
  if (visit499_269_1(typeof factory === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[273]++;
    exports = factory.apply(module, Utils.getModules(runtime, module.getRequiresWithAlias()));
    _$jscoverage['/loader/utils.js'].lineData[274]++;
    if (visit500_274_1(exports !== undefined)) {
      _$jscoverage['/loader/utils.js'].lineData[276]++;
      module.exports = exports;
    }
  } else {
    _$jscoverage['/loader/utils.js'].lineData[280]++;
    module.exports = factory;
  }
  _$jscoverage['/loader/utils.js'].lineData[283]++;
  module.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[292]++;
  if (visit501_292_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[293]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[295]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[310]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[321]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[328]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[329]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[330]++;
    for (i = ret.length - 1; visit502_330_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[331]++;
      if (visit503_331_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[332]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[333]++;
        for (j = alias.length - 1; visit504_333_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[334]++;
          if (visit505_334_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[335]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[338]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[342]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[353]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[354]++;
  if (visit506_354_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[356]++;
    for (i = 0 , l = modNames.length; visit507_356_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[359]++;
      if (visit508_359_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[360]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[365]++;
  if (visit509_365_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[366]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[368]++;
  return ret;
}, 
  registerModule: function(runtime, name, factory, config) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[379]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[381]++;
  var mods = runtime.Env.mods, module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[384]++;
  if (visit510_384_1(module && module.factory)) {
    _$jscoverage['/loader/utils.js'].lineData[385]++;
    S.log(name + ' is defined more than once', 'warn');
    _$jscoverage['/loader/utils.js'].lineData[386]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[390]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[392]++;
  module = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[396]++;
  S.mix(module, {
  name: name, 
  status: LOADED, 
  factory: factory});
  _$jscoverage['/loader/utils.js'].lineData[402]++;
  S.mix(module, config);
}, 
  getMappedPath: function(runtime, path, rules) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[413]++;
  var mappedRules = visit511_413_1(rules || visit512_414_1(runtime.Config.mappedRules || [])), i, m, rule;
  _$jscoverage['/loader/utils.js'].lineData[419]++;
  for (i = 0; visit513_419_1(i < mappedRules.length); i++) {
    _$jscoverage['/loader/utils.js'].lineData[420]++;
    rule = mappedRules[i];
    _$jscoverage['/loader/utils.js'].lineData[421]++;
    if (visit514_421_1(m = path.match(rule[0]))) {
      _$jscoverage['/loader/utils.js'].lineData[422]++;
      return path.replace(rule[0], rule[1]);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[425]++;
  return path;
}, 
  getHash: function(str) {
  _$jscoverage['/loader/utils.js'].functionData[23]++;
  _$jscoverage['/loader/utils.js'].lineData[434]++;
  var hash = 5381, i;
  _$jscoverage['/loader/utils.js'].lineData[436]++;
  for (i = str.length; visit515_436_1(--i > -1); ) {
    _$jscoverage['/loader/utils.js'].lineData[437]++;
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  _$jscoverage['/loader/utils.js'].lineData[440]++;
  return hash + '';
}});
  _$jscoverage['/loader/utils.js'].lineData[444]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[24]++;
    _$jscoverage['/loader/utils.js'].lineData[445]++;
    var mods = runtime.Env.mods, module, i;
    _$jscoverage['/loader/utils.js'].lineData[448]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[449]++;
    for (i = 0; visit516_449_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[450]++;
      module = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[451]++;
      if (visit517_451_1(!module || visit518_451_2(module.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[452]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[455]++;
    return 1;
  }
})(KISSY);
