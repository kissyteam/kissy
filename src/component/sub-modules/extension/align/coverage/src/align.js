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
  _$jscoverage['/align.js'].lineData[19] = 0;
  _$jscoverage['/align.js'].lineData[35] = 0;
  _$jscoverage['/align.js'].lineData[41] = 0;
  _$jscoverage['/align.js'].lineData[42] = 0;
  _$jscoverage['/align.js'].lineData[45] = 0;
  _$jscoverage['/align.js'].lineData[46] = 0;
  _$jscoverage['/align.js'].lineData[47] = 0;
  _$jscoverage['/align.js'].lineData[48] = 0;
  _$jscoverage['/align.js'].lineData[51] = 0;
  _$jscoverage['/align.js'].lineData[58] = 0;
  _$jscoverage['/align.js'].lineData[59] = 0;
  _$jscoverage['/align.js'].lineData[76] = 0;
  _$jscoverage['/align.js'].lineData[78] = 0;
  _$jscoverage['/align.js'].lineData[85] = 0;
  _$jscoverage['/align.js'].lineData[87] = 0;
  _$jscoverage['/align.js'].lineData[88] = 0;
  _$jscoverage['/align.js'].lineData[90] = 0;
  _$jscoverage['/align.js'].lineData[91] = 0;
  _$jscoverage['/align.js'].lineData[94] = 0;
  _$jscoverage['/align.js'].lineData[96] = 0;
  _$jscoverage['/align.js'].lineData[101] = 0;
  _$jscoverage['/align.js'].lineData[102] = 0;
  _$jscoverage['/align.js'].lineData[103] = 0;
  _$jscoverage['/align.js'].lineData[104] = 0;
  _$jscoverage['/align.js'].lineData[105] = 0;
  _$jscoverage['/align.js'].lineData[109] = 0;
  _$jscoverage['/align.js'].lineData[110] = 0;
  _$jscoverage['/align.js'].lineData[111] = 0;
  _$jscoverage['/align.js'].lineData[117] = 0;
  _$jscoverage['/align.js'].lineData[118] = 0;
  _$jscoverage['/align.js'].lineData[123] = 0;
  _$jscoverage['/align.js'].lineData[128] = 0;
  _$jscoverage['/align.js'].lineData[129] = 0;
  _$jscoverage['/align.js'].lineData[131] = 0;
  _$jscoverage['/align.js'].lineData[133] = 0;
  _$jscoverage['/align.js'].lineData[139] = 0;
  _$jscoverage['/align.js'].lineData[140] = 0;
  _$jscoverage['/align.js'].lineData[144] = 0;
  _$jscoverage['/align.js'].lineData[145] = 0;
  _$jscoverage['/align.js'].lineData[149] = 0;
  _$jscoverage['/align.js'].lineData[150] = 0;
  _$jscoverage['/align.js'].lineData[156] = 0;
  _$jscoverage['/align.js'].lineData[157] = 0;
  _$jscoverage['/align.js'].lineData[161] = 0;
  _$jscoverage['/align.js'].lineData[164] = 0;
  _$jscoverage['/align.js'].lineData[168] = 0;
  _$jscoverage['/align.js'].lineData[170] = 0;
  _$jscoverage['/align.js'].lineData[174] = 0;
  _$jscoverage['/align.js'].lineData[175] = 0;
  _$jscoverage['/align.js'].lineData[179] = 0;
  _$jscoverage['/align.js'].lineData[182] = 0;
  _$jscoverage['/align.js'].lineData[186] = 0;
  _$jscoverage['/align.js'].lineData[188] = 0;
  _$jscoverage['/align.js'].lineData[191] = 0;
  _$jscoverage['/align.js'].lineData[195] = 0;
  _$jscoverage['/align.js'].lineData[196] = 0;
  _$jscoverage['/align.js'].lineData[197] = 0;
  _$jscoverage['/align.js'].lineData[198] = 0;
  _$jscoverage['/align.js'].lineData[199] = 0;
  _$jscoverage['/align.js'].lineData[202] = 0;
  _$jscoverage['/align.js'].lineData[205] = 0;
  _$jscoverage['/align.js'].lineData[206] = 0;
  _$jscoverage['/align.js'].lineData[207] = 0;
  _$jscoverage['/align.js'].lineData[215] = 0;
  _$jscoverage['/align.js'].lineData[219] = 0;
  _$jscoverage['/align.js'].lineData[221] = 0;
  _$jscoverage['/align.js'].lineData[223] = 0;
  _$jscoverage['/align.js'].lineData[263] = 0;
  _$jscoverage['/align.js'].lineData[264] = 0;
  _$jscoverage['/align.js'].lineData[266] = 0;
  _$jscoverage['/align.js'].lineData[267] = 0;
  _$jscoverage['/align.js'].lineData[268] = 0;
  _$jscoverage['/align.js'].lineData[269] = 0;
  _$jscoverage['/align.js'].lineData[271] = 0;
  _$jscoverage['/align.js'].lineData[272] = 0;
  _$jscoverage['/align.js'].lineData[276] = 0;
  _$jscoverage['/align.js'].lineData[277] = 0;
  _$jscoverage['/align.js'].lineData[279] = 0;
  _$jscoverage['/align.js'].lineData[280] = 0;
  _$jscoverage['/align.js'].lineData[281] = 0;
  _$jscoverage['/align.js'].lineData[290] = 0;
  _$jscoverage['/align.js'].lineData[291] = 0;
  _$jscoverage['/align.js'].lineData[297] = 0;
  _$jscoverage['/align.js'].lineData[298] = 0;
  _$jscoverage['/align.js'].lineData[300] = 0;
  _$jscoverage['/align.js'].lineData[301] = 0;
  _$jscoverage['/align.js'].lineData[302] = 0;
  _$jscoverage['/align.js'].lineData[303] = 0;
  _$jscoverage['/align.js'].lineData[306] = 0;
  _$jscoverage['/align.js'].lineData[307] = 0;
  _$jscoverage['/align.js'].lineData[308] = 0;
  _$jscoverage['/align.js'].lineData[309] = 0;
  _$jscoverage['/align.js'].lineData[312] = 0;
  _$jscoverage['/align.js'].lineData[315] = 0;
  _$jscoverage['/align.js'].lineData[316] = 0;
  _$jscoverage['/align.js'].lineData[317] = 0;
  _$jscoverage['/align.js'].lineData[321] = 0;
  _$jscoverage['/align.js'].lineData[322] = 0;
  _$jscoverage['/align.js'].lineData[323] = 0;
  _$jscoverage['/align.js'].lineData[327] = 0;
  _$jscoverage['/align.js'].lineData[328] = 0;
  _$jscoverage['/align.js'].lineData[331] = 0;
  _$jscoverage['/align.js'].lineData[334] = 0;
  _$jscoverage['/align.js'].lineData[335] = 0;
  _$jscoverage['/align.js'].lineData[336] = 0;
  _$jscoverage['/align.js'].lineData[340] = 0;
  _$jscoverage['/align.js'].lineData[341] = 0;
  _$jscoverage['/align.js'].lineData[354] = 0;
  _$jscoverage['/align.js'].lineData[355] = 0;
  _$jscoverage['/align.js'].lineData[356] = 0;
  _$jscoverage['/align.js'].lineData[358] = 0;
  _$jscoverage['/align.js'].lineData[363] = 0;
  _$jscoverage['/align.js'].lineData[365] = 0;
  _$jscoverage['/align.js'].lineData[367] = 0;
  _$jscoverage['/align.js'].lineData[369] = 0;
  _$jscoverage['/align.js'].lineData[372] = 0;
  _$jscoverage['/align.js'].lineData[375] = 0;
  _$jscoverage['/align.js'].lineData[378] = 0;
  _$jscoverage['/align.js'].lineData[379] = 0;
  _$jscoverage['/align.js'].lineData[381] = 0;
  _$jscoverage['/align.js'].lineData[386] = 0;
  _$jscoverage['/align.js'].lineData[390] = 0;
  _$jscoverage['/align.js'].lineData[391] = 0;
  _$jscoverage['/align.js'].lineData[393] = 0;
  _$jscoverage['/align.js'].lineData[398] = 0;
  _$jscoverage['/align.js'].lineData[402] = 0;
  _$jscoverage['/align.js'].lineData[403] = 0;
  _$jscoverage['/align.js'].lineData[404] = 0;
  _$jscoverage['/align.js'].lineData[407] = 0;
  _$jscoverage['/align.js'].lineData[411] = 0;
  _$jscoverage['/align.js'].lineData[414] = 0;
  _$jscoverage['/align.js'].lineData[418] = 0;
  _$jscoverage['/align.js'].lineData[419] = 0;
  _$jscoverage['/align.js'].lineData[428] = 0;
  _$jscoverage['/align.js'].lineData[436] = 0;
  _$jscoverage['/align.js'].lineData[437] = 0;
  _$jscoverage['/align.js'].lineData[440] = 0;
  _$jscoverage['/align.js'].lineData[441] = 0;
  _$jscoverage['/align.js'].lineData[444] = 0;
  _$jscoverage['/align.js'].lineData[454] = 0;
  _$jscoverage['/align.js'].lineData[455] = 0;
  _$jscoverage['/align.js'].lineData[460] = 0;
  _$jscoverage['/align.js'].lineData[464] = 0;
  _$jscoverage['/align.js'].lineData[465] = 0;
  _$jscoverage['/align.js'].lineData[466] = 0;
  _$jscoverage['/align.js'].lineData[471] = 0;
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
  _$jscoverage['/align.js'].branchData['39'] = [];
  _$jscoverage['/align.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['41'] = [];
  _$jscoverage['/align.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['42'] = [];
  _$jscoverage['/align.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['45'] = [];
  _$jscoverage['/align.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['47'] = [];
  _$jscoverage['/align.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'] = [];
  _$jscoverage['/align.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'] = [];
  _$jscoverage['/align.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['82'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'] = [];
  _$jscoverage['/align.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['83'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['84'] = [];
  _$jscoverage['/align.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'] = [];
  _$jscoverage['/align.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][3] = new BranchData();
  _$jscoverage['/align.js'].branchData['111'][4] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'] = [];
  _$jscoverage['/align.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['112'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['113'] = [];
  _$jscoverage['/align.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['140'] = [];
  _$jscoverage['/align.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['140'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['141'] = [];
  _$jscoverage['/align.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['145'] = [];
  _$jscoverage['/align.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['145'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['146'] = [];
  _$jscoverage['/align.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['156'] = [];
  _$jscoverage['/align.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['156'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['161'] = [];
  _$jscoverage['/align.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'] = [];
  _$jscoverage['/align.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['163'] = [];
  _$jscoverage['/align.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['168'] = [];
  _$jscoverage['/align.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['168'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['174'] = [];
  _$jscoverage['/align.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['179'] = [];
  _$jscoverage['/align.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'] = [];
  _$jscoverage['/align.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['180'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['181'] = [];
  _$jscoverage['/align.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['186'] = [];
  _$jscoverage['/align.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['266'] = [];
  _$jscoverage['/align.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['300'] = [];
  _$jscoverage['/align.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['302'] = [];
  _$jscoverage['/align.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['306'] = [];
  _$jscoverage['/align.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['308'] = [];
  _$jscoverage['/align.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['316'] = [];
  _$jscoverage['/align.js'].branchData['316'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['316'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['322'] = [];
  _$jscoverage['/align.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['340'] = [];
  _$jscoverage['/align.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['354'] = [];
  _$jscoverage['/align.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['355'] = [];
  _$jscoverage['/align.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['356'] = [];
  _$jscoverage['/align.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['375'] = [];
  _$jscoverage['/align.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['375'][2] = new BranchData();
  _$jscoverage['/align.js'].branchData['378'] = [];
  _$jscoverage['/align.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['390'] = [];
  _$jscoverage['/align.js'].branchData['390'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['402'] = [];
  _$jscoverage['/align.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['411'] = [];
  _$jscoverage['/align.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['414'] = [];
  _$jscoverage['/align.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['418'] = [];
  _$jscoverage['/align.js'].branchData['418'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['436'] = [];
  _$jscoverage['/align.js'].branchData['436'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['440'] = [];
  _$jscoverage['/align.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/align.js'].branchData['465'] = [];
  _$jscoverage['/align.js'].branchData['465'][1] = new BranchData();
}
_$jscoverage['/align.js'].branchData['465'][1].init(46, 8, 'self.$el');
function visit69_465_1(result) {
  _$jscoverage['/align.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['440'][1].init(3179, 38, 'newElRegion.height !== elRegion.height');
function visit68_440_1(result) {
  _$jscoverage['/align.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['436'][1].init(3024, 36, 'newElRegion.width !== elRegion.width');
function visit67_436_1(result) {
  _$jscoverage['/align.js'].branchData['436'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['418'][1].init(1459, 48, 'newOverflowCfg.adjustX || newOverflowCfg.adjustY');
function visit66_418_1(result) {
  _$jscoverage['/align.js'].branchData['418'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['414'][1].init(1316, 83, 'overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect)');
function visit65_414_1(result) {
  _$jscoverage['/align.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['411'][1].init(1189, 83, 'overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect)');
function visit64_411_1(result) {
  _$jscoverage['/align.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['402'][1].init(857, 4, 'fail');
function visit63_402_1(result) {
  _$jscoverage['/align.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['390'][1].init(447, 43, 'isFailY(elFuturePos, elRegion, visibleRect)');
function visit62_390_1(result) {
  _$jscoverage['/align.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['378'][1].init(50, 43, 'isFailX(elFuturePos, elRegion, visibleRect)');
function visit61_378_1(result) {
  _$jscoverage['/align.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['375'][2].init(809, 36, 'overflow.adjustX || overflow.adjustY');
function visit60_375_2(result) {
  _$jscoverage['/align.js'].branchData['375'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['375'][1].init(793, 53, 'visibleRect && (overflow.adjustX || overflow.adjustY)');
function visit59_375_1(result) {
  _$jscoverage['/align.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['356'][1].init(132, 14, 'overflow || {}');
function visit58_356_1(result) {
  _$jscoverage['/align.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['355'][2].init(70, 27, 'offset && [].concat(offset)');
function visit57_355_2(result) {
  _$jscoverage['/align.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['355'][1].init(70, 37, 'offset && [].concat(offset) || [0, 0]');
function visit56_355_1(result) {
  _$jscoverage['/align.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['354'][1].init(32, 14, 'refNode || win');
function visit55_354_1(result) {
  _$jscoverage['/align.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['340'][1].init(17, 13, 'v && v.points');
function visit54_340_1(result) {
  _$jscoverage['/align.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['322'][1].init(13, 19, 'this.get(\'visible\')');
function visit53_322_1(result) {
  _$jscoverage['/align.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['316'][2].init(13, 17, 'e.target === this');
function visit52_316_2(result) {
  _$jscoverage['/align.js'].branchData['316'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['316'][1].init(13, 29, 'e.target === this && e.newVal');
function visit51_316_1(result) {
  _$jscoverage['/align.js'].branchData['316'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['308'][1].init(378, 9, 'H === \'r\'');
function visit50_308_1(result) {
  _$jscoverage['/align.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['306'][1].init(321, 9, 'H === \'c\'');
function visit49_306_1(result) {
  _$jscoverage['/align.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['302'][1].init(266, 9, 'V === \'b\'');
function visit48_302_1(result) {
  _$jscoverage['/align.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['300'][1].init(209, 9, 'V === \'c\'');
function visit47_300_1(result) {
  _$jscoverage['/align.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['266'][1].init(70, 20, '!S.isWindow(domNode)');
function visit46_266_1(result) {
  _$jscoverage['/align.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['186'][2].init(1382, 42, 'pos.top + size.height > visibleRect.bottom');
function visit45_186_2(result) {
  _$jscoverage['/align.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['186'][1].init(1362, 62, 'overflow.adjustY && pos.top + size.height > visibleRect.bottom');
function visit44_186_1(result) {
  _$jscoverage['/align.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['181'][1].init(41, 42, 'pos.top + size.height > visibleRect.bottom');
function visit43_181_1(result) {
  _$jscoverage['/align.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][2].init(1123, 26, 'pos.top >= visibleRect.top');
function visit42_180_2(result) {
  _$jscoverage['/align.js'].branchData['180'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['180'][1].init(36, 84, 'pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit41_180_1(result) {
  _$jscoverage['/align.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['179'][1].init(1084, 121, 'overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom');
function visit40_179_1(result) {
  _$jscoverage['/align.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['174'][2].init(914, 25, 'pos.top < visibleRect.top');
function visit39_174_2(result) {
  _$jscoverage['/align.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['174'][1].init(894, 45, 'overflow.adjustY && pos.top < visibleRect.top');
function visit38_174_1(result) {
  _$jscoverage['/align.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['168'][2].init(658, 41, 'pos.left + size.width > visibleRect.right');
function visit37_168_2(result) {
  _$jscoverage['/align.js'].branchData['168'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['168'][1].init(638, 61, 'overflow.adjustX && pos.left + size.width > visibleRect.right');
function visit36_168_1(result) {
  _$jscoverage['/align.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['163'][1].init(43, 41, 'pos.left + size.width > visibleRect.right');
function visit35_163_1(result) {
  _$jscoverage['/align.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][2].init(401, 28, 'pos.left >= visibleRect.left');
function visit34_162_2(result) {
  _$jscoverage['/align.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['162'][1].init(35, 85, 'pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit33_162_1(result) {
  _$jscoverage['/align.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['161'][1].init(363, 121, 'overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right');
function visit32_161_1(result) {
  _$jscoverage['/align.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['156'][2].init(189, 27, 'pos.left < visibleRect.left');
function visit31_156_2(result) {
  _$jscoverage['/align.js'].branchData['156'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['156'][1].init(169, 47, 'overflow.adjustX && pos.left < visibleRect.left');
function visit30_156_1(result) {
  _$jscoverage['/align.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['146'][1].init(48, 54, 'elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit29_146_1(result) {
  _$jscoverage['/align.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['145'][2].init(16, 33, 'elFuturePos.top < visibleRect.top');
function visit28_145_2(result) {
  _$jscoverage['/align.js'].branchData['145'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['145'][1].init(16, 103, 'elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom');
function visit27_145_1(result) {
  _$jscoverage['/align.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['141'][1].init(50, 53, 'elFuturePos.left + elRegion.width > visibleRect.right');
function visit26_141_1(result) {
  _$jscoverage['/align.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['140'][2].init(16, 35, 'elFuturePos.left < visibleRect.left');
function visit25_140_2(result) {
  _$jscoverage['/align.js'].branchData['140'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['140'][1].init(16, 104, 'elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right');
function visit24_140_1(result) {
  _$jscoverage['/align.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['113'][1].init(119, 36, 'visibleRect.right > visibleRect.left');
function visit23_113_1(result) {
  _$jscoverage['/align.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][2].init(70, 36, 'visibleRect.bottom > visibleRect.top');
function visit22_112_2(result) {
  _$jscoverage['/align.js'].branchData['112'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['112'][1].init(36, 88, 'visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit21_112_1(result) {
  _$jscoverage['/align.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][4].init(32, 21, 'visibleRect.left >= 0');
function visit20_111_4(result) {
  _$jscoverage['/align.js'].branchData['111'][4].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][3].init(23, 125, 'visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit19_111_3(result) {
  _$jscoverage['/align.js'].branchData['111'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][2].init(7, 20, 'visibleRect.top >= 0');
function visit18_111_2(result) {
  _$jscoverage['/align.js'].branchData['111'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['111'][1].init(-1, 149, 'visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left');
function visit17_111_1(result) {
  _$jscoverage['/align.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['84'][1].init(45, 35, '$(el).css(\'overflow\') !== \'visible\'');
function visit16_84_1(result) {
  _$jscoverage['/align.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][2].init(307, 22, 'el !== documentElement');
function visit15_83_2(result) {
  _$jscoverage['/align.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['83'][1].init(34, 81, 'el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit14_83_1(result) {
  _$jscoverage['/align.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][2].init(270, 11, 'el !== body');
function visit13_82_2(result) {
  _$jscoverage['/align.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['82'][1].init(270, 116, 'el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\'');
function visit12_82_1(result) {
  _$jscoverage['/align.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][3].init(96, 20, 'el.clientWidth !== 0');
function visit11_78_3(result) {
  _$jscoverage['/align.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][2].init(86, 30, '!UA.ie || el.clientWidth !== 0');
function visit10_78_2(result) {
  _$jscoverage['/align.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['78'][1].init(86, 388, '(!UA.ie || el.clientWidth !== 0) && (el !== body && el !== documentElement && $(el).css(\'overflow\') !== \'visible\')');
function visit9_78_1(result) {
  _$jscoverage['/align.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['47'][1].init(72, 26, 'positionStyle !== \'static\'');
function visit8_47_1(result) {
  _$jscoverage['/align.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['45'][2].init(1049, 15, 'parent !== body');
function visit7_45_2(result) {
  _$jscoverage['/align.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['45'][1].init(1039, 25, 'parent && parent !== body');
function visit6_45_1(result) {
  _$jscoverage['/align.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['42'][1].init(20, 41, 'element.nodeName.toLowerCase() === \'html\'');
function visit5_42_1(result) {
  _$jscoverage['/align.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['41'][1].init(881, 11, '!skipStatic');
function visit4_41_1(result) {
  _$jscoverage['/align.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][3].init(191, 28, 'positionStyle === \'absolute\'');
function visit3_39_3(result) {
  _$jscoverage['/align.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][2].init(162, 25, 'positionStyle === \'fixed\'');
function visit2_39_2(result) {
  _$jscoverage['/align.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].branchData['39'][1].init(162, 57, 'positionStyle === \'fixed\' || positionStyle === \'absolute\'');
function visit1_39_1(result) {
  _$jscoverage['/align.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/align.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/align.js'].functionData[0]++;
  _$jscoverage['/align.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/align.js'].lineData[8]++;
  var win = S.Env.host, $ = Node.all, UA = S.UA;
  _$jscoverage['/align.js'].lineData[19]++;
  function getOffsetParent(element) {
    _$jscoverage['/align.js'].functionData[1]++;
    _$jscoverage['/align.js'].lineData[35]++;
    var doc = element.ownerDocument, body = doc.body, parent, positionStyle = $(element).css('position'), skipStatic = visit1_39_1(visit2_39_2(positionStyle === 'fixed') || visit3_39_3(positionStyle === 'absolute'));
    _$jscoverage['/align.js'].lineData[41]++;
    if (visit4_41_1(!skipStatic)) {
      _$jscoverage['/align.js'].lineData[42]++;
      return visit5_42_1(element.nodeName.toLowerCase() === 'html') ? null : element.parentNode;
    }
    _$jscoverage['/align.js'].lineData[45]++;
    for (parent = element.parentNode; visit6_45_1(parent && visit7_45_2(parent !== body)); parent = parent.parentNode) {
      _$jscoverage['/align.js'].lineData[46]++;
      positionStyle = $(parent).css('position');
      _$jscoverage['/align.js'].lineData[47]++;
      if (visit8_47_1(positionStyle !== 'static')) {
        _$jscoverage['/align.js'].lineData[48]++;
        return parent;
      }
    }
    _$jscoverage['/align.js'].lineData[51]++;
    return null;
  }
  _$jscoverage['/align.js'].lineData[58]++;
  function getVisibleRectForElement(element) {
    _$jscoverage['/align.js'].functionData[2]++;
    _$jscoverage['/align.js'].lineData[59]++;
    var visibleRect = {
  left: 0, 
  right: Infinity, 
  top: 0, 
  bottom: Infinity}, el, scrollX, scrollY, winSize, doc = element.ownerDocument, $win = $(doc).getWindow(), body = doc.body, documentElement = doc.documentElement;
    _$jscoverage['/align.js'].lineData[76]++;
    for (el = element; (el = getOffsetParent(el)); ) {
      _$jscoverage['/align.js'].lineData[78]++;
      if (visit9_78_1((visit10_78_2(!UA.ie || visit11_78_3(el.clientWidth !== 0))) && (visit12_82_1(visit13_82_2(el !== body) && visit14_83_1(visit15_83_2(el !== documentElement) && visit16_84_1($(el).css('overflow') !== 'visible')))))) {
        _$jscoverage['/align.js'].lineData[85]++;
        var pos = $(el).offset();
        _$jscoverage['/align.js'].lineData[87]++;
        pos.left += el.clientLeft;
        _$jscoverage['/align.js'].lineData[88]++;
        pos.top += el.clientTop;
        _$jscoverage['/align.js'].lineData[90]++;
        visibleRect.top = Math.max(visibleRect.top, pos.top);
        _$jscoverage['/align.js'].lineData[91]++;
        visibleRect.right = Math.min(visibleRect.right, pos.left + el.clientWidth);
        _$jscoverage['/align.js'].lineData[94]++;
        visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
        _$jscoverage['/align.js'].lineData[96]++;
        visibleRect.left = Math.max(visibleRect.left, pos.left);
      }
    }
    _$jscoverage['/align.js'].lineData[101]++;
    scrollX = $win.scrollLeft();
    _$jscoverage['/align.js'].lineData[102]++;
    scrollY = $win.scrollTop();
    _$jscoverage['/align.js'].lineData[103]++;
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    _$jscoverage['/align.js'].lineData[104]++;
    visibleRect.top = Math.max(visibleRect.top, scrollY);
    _$jscoverage['/align.js'].lineData[105]++;
    winSize = {
  width: $win.width(), 
  height: $win.height()};
    _$jscoverage['/align.js'].lineData[109]++;
    visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
    _$jscoverage['/align.js'].lineData[110]++;
    visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
    _$jscoverage['/align.js'].lineData[111]++;
    return visit17_111_1(visit18_111_2(visibleRect.top >= 0) && visit19_111_3(visit20_111_4(visibleRect.left >= 0) && visit21_112_1(visit22_112_2(visibleRect.bottom > visibleRect.top) && visit23_113_1(visibleRect.right > visibleRect.left)))) ? visibleRect : null;
  }
  _$jscoverage['/align.js'].lineData[117]++;
  function getElFuturePos(elRegion, refNodeRegion, points, offset) {
    _$jscoverage['/align.js'].functionData[3]++;
    _$jscoverage['/align.js'].lineData[118]++;
    var xy, diff, p1, p2;
    _$jscoverage['/align.js'].lineData[123]++;
    xy = {
  left: elRegion.left, 
  top: elRegion.top};
    _$jscoverage['/align.js'].lineData[128]++;
    p1 = getAlignOffset(refNodeRegion, points[0]);
    _$jscoverage['/align.js'].lineData[129]++;
    p2 = getAlignOffset(elRegion, points[1]);
    _$jscoverage['/align.js'].lineData[131]++;
    diff = [p2.left - p1.left, p2.top - p1.top];
    _$jscoverage['/align.js'].lineData[133]++;
    return {
  left: xy.left - diff[0] + (+offset[0]), 
  top: xy.top - diff[1] + (+offset[1])};
  }
  _$jscoverage['/align.js'].lineData[139]++;
  function isFailX(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[4]++;
    _$jscoverage['/align.js'].lineData[140]++;
    return visit24_140_1(visit25_140_2(elFuturePos.left < visibleRect.left) || visit26_141_1(elFuturePos.left + elRegion.width > visibleRect.right));
  }
  _$jscoverage['/align.js'].lineData[144]++;
  function isFailY(elFuturePos, elRegion, visibleRect) {
    _$jscoverage['/align.js'].functionData[5]++;
    _$jscoverage['/align.js'].lineData[145]++;
    return visit27_145_1(visit28_145_2(elFuturePos.top < visibleRect.top) || visit29_146_1(elFuturePos.top + elRegion.height > visibleRect.bottom));
  }
  _$jscoverage['/align.js'].lineData[149]++;
  function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
    _$jscoverage['/align.js'].functionData[6]++;
    _$jscoverage['/align.js'].lineData[150]++;
    var pos = S.clone(elFuturePos), size = {
  width: elRegion.width, 
  height: elRegion.height};
    _$jscoverage['/align.js'].lineData[156]++;
    if (visit30_156_1(overflow.adjustX && visit31_156_2(pos.left < visibleRect.left))) {
      _$jscoverage['/align.js'].lineData[157]++;
      pos.left = visibleRect.left;
    }
    _$jscoverage['/align.js'].lineData[161]++;
    if (visit32_161_1(overflow.resizeWidth && visit33_162_1(visit34_162_2(pos.left >= visibleRect.left) && visit35_163_1(pos.left + size.width > visibleRect.right)))) {
      _$jscoverage['/align.js'].lineData[164]++;
      size.width -= (pos.left + size.width) - visibleRect.right;
    }
    _$jscoverage['/align.js'].lineData[168]++;
    if (visit36_168_1(overflow.adjustX && visit37_168_2(pos.left + size.width > visibleRect.right))) {
      _$jscoverage['/align.js'].lineData[170]++;
      pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
    }
    _$jscoverage['/align.js'].lineData[174]++;
    if (visit38_174_1(overflow.adjustY && visit39_174_2(pos.top < visibleRect.top))) {
      _$jscoverage['/align.js'].lineData[175]++;
      pos.top = visibleRect.top;
    }
    _$jscoverage['/align.js'].lineData[179]++;
    if (visit40_179_1(overflow.resizeHeight && visit41_180_1(visit42_180_2(pos.top >= visibleRect.top) && visit43_181_1(pos.top + size.height > visibleRect.bottom)))) {
      _$jscoverage['/align.js'].lineData[182]++;
      size.height -= (pos.top + size.height) - visibleRect.bottom;
    }
    _$jscoverage['/align.js'].lineData[186]++;
    if (visit44_186_1(overflow.adjustY && visit45_186_2(pos.top + size.height > visibleRect.bottom))) {
      _$jscoverage['/align.js'].lineData[188]++;
      pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
    }
    _$jscoverage['/align.js'].lineData[191]++;
    return S.mix(pos, size);
  }
  _$jscoverage['/align.js'].lineData[195]++;
  function flip(points, reg, map) {
    _$jscoverage['/align.js'].functionData[7]++;
    _$jscoverage['/align.js'].lineData[196]++;
    var ret = [];
    _$jscoverage['/align.js'].lineData[197]++;
    S.each(points, function(p) {
  _$jscoverage['/align.js'].functionData[8]++;
  _$jscoverage['/align.js'].lineData[198]++;
  ret.push(p.replace(reg, function(m) {
  _$jscoverage['/align.js'].functionData[9]++;
  _$jscoverage['/align.js'].lineData[199]++;
  return map[m];
}));
});
    _$jscoverage['/align.js'].lineData[202]++;
    return ret;
  }
  _$jscoverage['/align.js'].lineData[205]++;
  function flipOffset(offset, index) {
    _$jscoverage['/align.js'].functionData[10]++;
    _$jscoverage['/align.js'].lineData[206]++;
    offset[index] = -offset[index];
    _$jscoverage['/align.js'].lineData[207]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[215]++;
  function Align() {
    _$jscoverage['/align.js'].functionData[11]++;
  }
  _$jscoverage['/align.js'].lineData[219]++;
  Align.__getOffsetParent = getOffsetParent;
  _$jscoverage['/align.js'].lineData[221]++;
  Align.__getVisibleRectForElement = getVisibleRectForElement;
  _$jscoverage['/align.js'].lineData[223]++;
  Align.ATTRS = {
  align: {
  value: {}}};
  _$jscoverage['/align.js'].lineData[263]++;
  function getRegion(node) {
    _$jscoverage['/align.js'].functionData[12]++;
    _$jscoverage['/align.js'].lineData[264]++;
    var offset, w, h, domNode = node[0];
    _$jscoverage['/align.js'].lineData[266]++;
    if (visit46_266_1(!S.isWindow(domNode))) {
      _$jscoverage['/align.js'].lineData[267]++;
      offset = node.offset();
      _$jscoverage['/align.js'].lineData[268]++;
      w = node.outerWidth();
      _$jscoverage['/align.js'].lineData[269]++;
      h = node.outerHeight();
    } else {
      _$jscoverage['/align.js'].lineData[271]++;
      var $win = $(domNode).getWindow();
      _$jscoverage['/align.js'].lineData[272]++;
      offset = {
  left: $win.scrollLeft(), 
  top: $win.scrollTop()};
      _$jscoverage['/align.js'].lineData[276]++;
      w = $win.width();
      _$jscoverage['/align.js'].lineData[277]++;
      h = $win.height();
    }
    _$jscoverage['/align.js'].lineData[279]++;
    offset.width = w;
    _$jscoverage['/align.js'].lineData[280]++;
    offset.height = h;
    _$jscoverage['/align.js'].lineData[281]++;
    return offset;
  }
  _$jscoverage['/align.js'].lineData[290]++;
  function getAlignOffset(region, align) {
    _$jscoverage['/align.js'].functionData[13]++;
    _$jscoverage['/align.js'].lineData[291]++;
    var V = align.charAt(0), H = align.charAt(1), w = region.width, h = region.height, x, y;
    _$jscoverage['/align.js'].lineData[297]++;
    x = region.left;
    _$jscoverage['/align.js'].lineData[298]++;
    y = region.top;
    _$jscoverage['/align.js'].lineData[300]++;
    if (visit47_300_1(V === 'c')) {
      _$jscoverage['/align.js'].lineData[301]++;
      y += h / 2;
    } else {
      _$jscoverage['/align.js'].lineData[302]++;
      if (visit48_302_1(V === 'b')) {
        _$jscoverage['/align.js'].lineData[303]++;
        y += h;
      }
    }
    _$jscoverage['/align.js'].lineData[306]++;
    if (visit49_306_1(H === 'c')) {
      _$jscoverage['/align.js'].lineData[307]++;
      x += w / 2;
    } else {
      _$jscoverage['/align.js'].lineData[308]++;
      if (visit50_308_1(H === 'r')) {
        _$jscoverage['/align.js'].lineData[309]++;
        x += w;
      }
    }
    _$jscoverage['/align.js'].lineData[312]++;
    return {
  left: x, 
  top: y};
  }
  _$jscoverage['/align.js'].lineData[315]++;
  function beforeVisibleChange(e) {
    _$jscoverage['/align.js'].functionData[14]++;
    _$jscoverage['/align.js'].lineData[316]++;
    if (visit51_316_1(visit52_316_2(e.target === this) && e.newVal)) {
      _$jscoverage['/align.js'].lineData[317]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[321]++;
  function onResize() {
    _$jscoverage['/align.js'].functionData[15]++;
    _$jscoverage['/align.js'].lineData[322]++;
    if (visit53_322_1(this.get('visible'))) {
      _$jscoverage['/align.js'].lineData[323]++;
      realign.call(this);
    }
  }
  _$jscoverage['/align.js'].lineData[327]++;
  function realign() {
    _$jscoverage['/align.js'].functionData[16]++;
    _$jscoverage['/align.js'].lineData[328]++;
    this._onSetAlign(this.get('align'));
  }
  _$jscoverage['/align.js'].lineData[331]++;
  Align.prototype = {
  __bindUI: function() {
  _$jscoverage['/align.js'].functionData[17]++;
  _$jscoverage['/align.js'].lineData[334]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[335]++;
  self.on('beforeVisibleChange', beforeVisibleChange, self);
  _$jscoverage['/align.js'].lineData[336]++;
  self.$el.getWindow().on('resize', onResize, self);
}, 
  '_onSetAlign': function(v) {
  _$jscoverage['/align.js'].functionData[18]++;
  _$jscoverage['/align.js'].lineData[340]++;
  if (visit54_340_1(v && v.points)) {
    _$jscoverage['/align.js'].lineData[341]++;
    this.align(v.node, v.points, v.offset, v.overflow);
  }
}, 
  align: function(refNode, points, offset, overflow) {
  _$jscoverage['/align.js'].functionData[19]++;
  _$jscoverage['/align.js'].lineData[354]++;
  refNode = Node.one(visit55_354_1(refNode || win));
  _$jscoverage['/align.js'].lineData[355]++;
  offset = visit56_355_1(visit57_355_2(offset && [].concat(offset)) || [0, 0]);
  _$jscoverage['/align.js'].lineData[356]++;
  overflow = visit58_356_1(overflow || {});
  _$jscoverage['/align.js'].lineData[358]++;
  var self = this, el = self.$el, fail = 0;
  _$jscoverage['/align.js'].lineData[363]++;
  var visibleRect = getVisibleRectForElement(el[0]);
  _$jscoverage['/align.js'].lineData[365]++;
  var elRegion = getRegion(el);
  _$jscoverage['/align.js'].lineData[367]++;
  var refNodeRegion = getRegion(refNode);
  _$jscoverage['/align.js'].lineData[369]++;
  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
  _$jscoverage['/align.js'].lineData[372]++;
  var newElRegion = S.merge(elRegion, elFuturePos);
  _$jscoverage['/align.js'].lineData[375]++;
  if (visit59_375_1(visibleRect && (visit60_375_2(overflow.adjustX || overflow.adjustY)))) {
    _$jscoverage['/align.js'].lineData[378]++;
    if (visit61_378_1(isFailX(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[379]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[381]++;
      points = flip(points, /[lr]/ig, {
  l: 'r', 
  r: 'l'});
      _$jscoverage['/align.js'].lineData[386]++;
      offset = flipOffset(offset, 0);
    }
    _$jscoverage['/align.js'].lineData[390]++;
    if (visit62_390_1(isFailY(elFuturePos, elRegion, visibleRect))) {
      _$jscoverage['/align.js'].lineData[391]++;
      fail = 1;
      _$jscoverage['/align.js'].lineData[393]++;
      points = flip(points, /[tb]/ig, {
  t: 'b', 
  b: 't'});
      _$jscoverage['/align.js'].lineData[398]++;
      offset = flipOffset(offset, 1);
    }
    _$jscoverage['/align.js'].lineData[402]++;
    if (visit63_402_1(fail)) {
      _$jscoverage['/align.js'].lineData[403]++;
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
      _$jscoverage['/align.js'].lineData[404]++;
      S.mix(newElRegion, elFuturePos);
    }
    _$jscoverage['/align.js'].lineData[407]++;
    var newOverflowCfg = {};
    _$jscoverage['/align.js'].lineData[411]++;
    newOverflowCfg.adjustX = visit64_411_1(overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[414]++;
    newOverflowCfg.adjustY = visit65_414_1(overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect));
    _$jscoverage['/align.js'].lineData[418]++;
    if (visit66_418_1(newOverflowCfg.adjustX || newOverflowCfg.adjustY)) {
      _$jscoverage['/align.js'].lineData[419]++;
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  _$jscoverage['/align.js'].lineData[428]++;
  self.set({
  'x': newElRegion.left, 
  'y': newElRegion.top}, {
  force: 1});
  _$jscoverage['/align.js'].lineData[436]++;
  if (visit67_436_1(newElRegion.width !== elRegion.width)) {
    _$jscoverage['/align.js'].lineData[437]++;
    self.set('width', el.width() + newElRegion.width - elRegion.width);
  }
  _$jscoverage['/align.js'].lineData[440]++;
  if (visit68_440_1(newElRegion.height !== elRegion.height)) {
    _$jscoverage['/align.js'].lineData[441]++;
    self.set('height', el.height() + newElRegion.height - elRegion.height);
  }
  _$jscoverage['/align.js'].lineData[444]++;
  return self;
}, 
  center: function(node) {
  _$jscoverage['/align.js'].functionData[20]++;
  _$jscoverage['/align.js'].lineData[454]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[455]++;
  self.set('align', {
  node: node, 
  points: ['cc', 'cc'], 
  offset: [0, 0]});
  _$jscoverage['/align.js'].lineData[460]++;
  return self;
}, 
  __destructor: function() {
  _$jscoverage['/align.js'].functionData[21]++;
  _$jscoverage['/align.js'].lineData[464]++;
  var self = this;
  _$jscoverage['/align.js'].lineData[465]++;
  if (visit69_465_1(self.$el)) {
    _$jscoverage['/align.js'].lineData[466]++;
    self.$el.getWindow().detach('resize', onResize, self);
  }
}};
  _$jscoverage['/align.js'].lineData[471]++;
  return Align;
});
