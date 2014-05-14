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
if (! _$jscoverage['/base.js']) {
  _$jscoverage['/base.js'] = {};
  _$jscoverage['/base.js'].lineData = [];
  _$jscoverage['/base.js'].lineData[6] = 0;
  _$jscoverage['/base.js'].lineData[7] = 0;
  _$jscoverage['/base.js'].lineData[21] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[76] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[79] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[87] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[94] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[98] = 0;
  _$jscoverage['/base.js'].lineData[101] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[105] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[113] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[116] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[126] = 0;
  _$jscoverage['/base.js'].lineData[128] = 0;
  _$jscoverage['/base.js'].lineData[131] = 0;
  _$jscoverage['/base.js'].lineData[140] = 0;
  _$jscoverage['/base.js'].lineData[151] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[156] = 0;
  _$jscoverage['/base.js'].lineData[160] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[173] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[179] = 0;
  _$jscoverage['/base.js'].lineData[184] = 0;
  _$jscoverage['/base.js'].lineData[186] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[189] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[196] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[199] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[211] = 0;
  _$jscoverage['/base.js'].lineData[213] = 0;
  _$jscoverage['/base.js'].lineData[215] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[225] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[233] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[237] = 0;
  _$jscoverage['/base.js'].lineData[246] = 0;
  _$jscoverage['/base.js'].lineData[254] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[263] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[270] = 0;
  _$jscoverage['/base.js'].lineData[272] = 0;
  _$jscoverage['/base.js'].lineData[275] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[298] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[305] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[341] = 0;
  _$jscoverage['/base.js'].lineData[350] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[365] = 0;
  _$jscoverage['/base.js'].lineData[367] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[374] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[379] = 0;
  _$jscoverage['/base.js'].lineData[381] = 0;
  _$jscoverage['/base.js'].lineData[384] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[388] = 0;
  _$jscoverage['/base.js'].lineData[391] = 0;
  _$jscoverage['/base.js'].lineData[395] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[404] = 0;
  _$jscoverage['/base.js'].lineData[412] = 0;
  _$jscoverage['/base.js'].lineData[414] = 0;
  _$jscoverage['/base.js'].lineData[418] = 0;
}
if (! _$jscoverage['/base.js'].functionData) {
  _$jscoverage['/base.js'].functionData = [];
  _$jscoverage['/base.js'].functionData[0] = 0;
  _$jscoverage['/base.js'].functionData[1] = 0;
  _$jscoverage['/base.js'].functionData[2] = 0;
  _$jscoverage['/base.js'].functionData[3] = 0;
  _$jscoverage['/base.js'].functionData[4] = 0;
  _$jscoverage['/base.js'].functionData[5] = 0;
  _$jscoverage['/base.js'].functionData[6] = 0;
  _$jscoverage['/base.js'].functionData[7] = 0;
  _$jscoverage['/base.js'].functionData[8] = 0;
  _$jscoverage['/base.js'].functionData[9] = 0;
  _$jscoverage['/base.js'].functionData[10] = 0;
  _$jscoverage['/base.js'].functionData[11] = 0;
  _$jscoverage['/base.js'].functionData[12] = 0;
  _$jscoverage['/base.js'].functionData[13] = 0;
  _$jscoverage['/base.js'].functionData[14] = 0;
  _$jscoverage['/base.js'].functionData[15] = 0;
  _$jscoverage['/base.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['30'] = [];
  _$jscoverage['/base.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['33'] = [];
  _$jscoverage['/base.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['67'] = [];
  _$jscoverage['/base.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['71'] = [];
  _$jscoverage['/base.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['75'] = [];
  _$jscoverage['/base.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'] = [];
  _$jscoverage['/base.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['84'] = [];
  _$jscoverage['/base.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['90'] = [];
  _$jscoverage['/base.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['93'] = [];
  _$jscoverage['/base.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['115'] = [];
  _$jscoverage['/base.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['147'] = [];
  _$jscoverage['/base.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['155'] = [];
  _$jscoverage['/base.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['170'] = [];
  _$jscoverage['/base.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['173'] = [];
  _$jscoverage['/base.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['194'] = [];
  _$jscoverage['/base.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'] = [];
  _$jscoverage['/base.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['199'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['207'] = [];
  _$jscoverage['/base.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['210'] = [];
  _$jscoverage['/base.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['224'] = [];
  _$jscoverage['/base.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['230'] = [];
  _$jscoverage['/base.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['263'] = [];
  _$jscoverage['/base.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['269'] = [];
  _$jscoverage['/base.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['298'] = [];
  _$jscoverage['/base.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['303'] = [];
  _$jscoverage['/base.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['331'] = [];
  _$jscoverage['/base.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['336'] = [];
  _$jscoverage['/base.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['355'] = [];
  _$jscoverage['/base.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['364'] = [];
  _$jscoverage['/base.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['365'] = [];
  _$jscoverage['/base.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['377'] = [];
  _$jscoverage['/base.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['384'] = [];
  _$jscoverage['/base.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['387'] = [];
  _$jscoverage['/base.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['406'] = [];
  _$jscoverage['/base.js'].branchData['406'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['406'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['408'] = [];
  _$jscoverage['/base.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['408'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['410'] = [];
  _$jscoverage['/base.js'].branchData['410'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['410'][1].init(95, 15, 'queue === false');
function visit79_410_1(result) {
  _$jscoverage['/base.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['408'][2].init(147, 25, 'typeof queue === \'string\'');
function visit78_408_2(result) {
  _$jscoverage['/base.js'].branchData['408'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['408'][1].init(78, 111, 'typeof queue === \'string\' || queue === false');
function visit77_408_1(result) {
  _$jscoverage['/base.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['406'][2].init(67, 14, 'queue === null');
function visit76_406_2(result) {
  _$jscoverage['/base.js'].branchData['406'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['406'][1].init(51, 190, 'queue === null || typeof queue === \'string\' || queue === false');
function visit75_406_1(result) {
  _$jscoverage['/base.js'].branchData['406'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['387'][1].init(129, 9, 'q && q[0]');
function visit74_387_1(result) {
  _$jscoverage['/base.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['384'][1].init(1011, 15, 'queue !== false');
function visit73_384_1(result) {
  _$jscoverage['/base.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['377'][1].init(829, 6, 'finish');
function visit72_377_1(result) {
  _$jscoverage['/base.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['365'][1].init(22, 15, 'queue !== false');
function visit71_365_1(result) {
  _$jscoverage['/base.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['364'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit70_364_1(result) {
  _$jscoverage['/base.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(255, 18, 'self.__waitTimeout');
function visit69_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['355'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit68_355_1(result) {
  _$jscoverage['/base.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['336'][1].init(107, 14, 'q.length === 1');
function visit67_336_1(result) {
  _$jscoverage['/base.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['331'][1].init(114, 15, 'queue === false');
function visit66_331_1(result) {
  _$jscoverage['/base.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['303'][1].init(237, 18, 'self.__waitTimeout');
function visit65_303_1(result) {
  _$jscoverage['/base.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['298'][1].init(48, 15, 'self.isPaused()');
function visit64_298_1(result) {
  _$jscoverage['/base.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['269'][1].init(266, 18, 'self.__waitTimeout');
function visit63_269_1(result) {
  _$jscoverage['/base.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['263'][1].init(48, 16, 'self.isRunning()');
function visit62_263_1(result) {
  _$jscoverage['/base.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['230'][1].init(3820, 30, 'util.isEmptyObject(_propsData)');
function visit61_230_1(result) {
  _$jscoverage['/base.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['224'][1].init(2589, 14, 'exit === false');
function visit60_224_1(result) {
  _$jscoverage['/base.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['210'][1].init(597, 14, 'val === \'hide\'');
function visit59_210_1(result) {
  _$jscoverage['/base.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['207'][1].init(460, 16, 'val === \'toggle\'');
function visit58_207_1(result) {
  _$jscoverage['/base.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][5].init(58, 14, 'val === \'show\'');
function visit57_199_5(result) {
  _$jscoverage['/base.js'].branchData['199'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit56_199_4(result) {
  _$jscoverage['/base.js'].branchData['199'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][3].init(30, 14, 'val === \'hide\'');
function visit55_199_3(result) {
  _$jscoverage['/base.js'].branchData['199'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit54_199_2(result) {
  _$jscoverage['/base.js'].branchData['199'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['199'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit53_199_1(result) {
  _$jscoverage['/base.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(99, 16, 'specialVals[val]');
function visit52_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['194'][1].init(1212, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit51_194_1(result) {
  _$jscoverage['/base.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit50_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][2].init(700, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit49_186_2(result) {
  _$jscoverage['/base.js'].branchData['186'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(700, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit48_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['173'][1].init(177, 21, 'to.width || to.height');
function visit47_173_1(result) {
  _$jscoverage['/base.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['170'][1].init(1047, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit46_170_1(result) {
  _$jscoverage['/base.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['155'][1].init(22, 24, '!util.isPlainObject(val)');
function visit45_155_1(result) {
  _$jscoverage['/base.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['147'][1].init(276, 17, 'config.delay || 0');
function visit44_147_1(result) {
  _$jscoverage['/base.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['115'][1].init(1531, 25, '!util.isPlainObject(node)');
function visit43_115_1(result) {
  _$jscoverage['/base.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['93'][1].init(211, 6, 'easing');
function visit42_93_1(result) {
  _$jscoverage['/base.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['90'][1].init(110, 8, 'duration');
function visit41_90_1(result) {
  _$jscoverage['/base.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['84'][1].init(581, 28, 'util.isPlainObject(duration)');
function visit40_84_1(result) {
  _$jscoverage['/base.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][2].init(210, 17, 'trimProp !== prop');
function visit39_78_2(result) {
  _$jscoverage['/base.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['78'][1].init(197, 30, '!trimProp || trimProp !== prop');
function visit38_78_1(result) {
  _$jscoverage['/base.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['75'][1].init(79, 8, 'trimProp');
function visit37_75_1(result) {
  _$jscoverage['/base.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['71'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_71_1(result) {
  _$jscoverage['/base.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['67'][1].init(63, 9, 'node.node');
function visit35_67_1(result) {
  _$jscoverage['/base.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['33'][1].init(247, 8, 'complete');
function visit34_33_1(result) {
  _$jscoverage['/base.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['30'][1].init(119, 53, '!util.isEmptyObject(_backupProps = self._backupProps)');
function visit33_30_1(result) {
  _$jscoverage['/base.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), util = require('util'), NodeType = Dom.NodeType, camelCase = util.camelCase, noop = util.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[21]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[27]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[28]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[30]++;
    if (visit33_30_1(!util.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[31]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[33]++;
    if (visit34_33_1(complete)) {
      _$jscoverage['/base.js'].lineData[34]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[63]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[64]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[65]++;
    var config;
    _$jscoverage['/base.js'].lineData[67]++;
    if (visit35_67_1(node.node)) {
      _$jscoverage['/base.js'].lineData[68]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[71]++;
      if (visit36_71_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[72]++;
        to = util.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[73]++;
        util.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[74]++;
  var trimProp = util.trim(prop);
  _$jscoverage['/base.js'].lineData[75]++;
  if (visit37_75_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[76]++;
    to[trimProp] = util.trim(value);
  }
  _$jscoverage['/base.js'].lineData[78]++;
  if (visit38_78_1(!trimProp || visit39_78_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[79]++;
    delete to[prop];
  }
});
      }
      _$jscoverage['/base.js'].lineData[84]++;
      if (visit40_84_1(util.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[85]++;
        config = util.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[87]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[90]++;
        if (visit41_90_1(duration)) {
          _$jscoverage['/base.js'].lineData[91]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[93]++;
        if (visit42_93_1(easing)) {
          _$jscoverage['/base.js'].lineData[94]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[97]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[98]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[101]++;
    config = util.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[104]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[105]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[111]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[113]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[115]++;
    if (visit43_115_1(!util.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[116]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[118]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[119]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[120]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[123]++;
    var newTo = {};
    _$jscoverage['/base.js'].lineData[124]++;
    to = config.to;
    _$jscoverage['/base.js'].lineData[125]++;
    for (var prop in to) {
      _$jscoverage['/base.js'].lineData[126]++;
      newTo[camelCase(prop)] = to[prop];
    }
    _$jscoverage['/base.js'].lineData[128]++;
    config.to = newTo;
  }
  _$jscoverage['/base.js'].lineData[131]++;
  util.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[140]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_147_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[151]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[154]++;
  util.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[155]++;
  if (visit45_155_1(!util.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[156]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[160]++;
  _propsData[prop] = util.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[170]++;
  if (visit46_170_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[173]++;
    if (visit47_173_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[178]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[179]++;
      util.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[184]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[186]++;
      if (visit48_186_1(visit49_186_2(Dom.css(node, 'display') === 'inline') && visit50_187_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[188]++;
        elStyle.zoom = 1;
        _$jscoverage['/base.js'].lineData[189]++;
        elStyle.display = 'inline-block';
      }
    }
    _$jscoverage['/base.js'].lineData[193]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[194]++;
    hidden = (visit51_194_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[195]++;
    util.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[196]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[198]++;
  if (visit52_198_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[199]++;
    if (visit53_199_1(visit54_199_2(visit55_199_3(val === 'hide') && hidden) || visit56_199_4(visit57_199_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[201]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[202]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[203]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[206]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[207]++;
    if (visit58_207_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[208]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[210]++;
    if (visit59_210_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[211]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[213]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[215]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[217]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[218]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[221]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[224]++;
    if (visit60_224_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[225]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[229]++;
  self.startTime = util.now();
  _$jscoverage['/base.js'].lineData[230]++;
  if (visit61_230_1(util.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[231]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[232]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[233]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[236]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[237]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[246]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[254]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[262]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[263]++;
  if (visit62_263_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[265]++;
    self._runTime = util.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[266]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[267]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[268]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[269]++;
    if (visit63_269_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[270]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[272]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[275]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[297]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[298]++;
  if (visit64_298_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[300]++;
    self.startTime = util.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[301]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[302]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[303]++;
    if (visit65_303_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[304]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[305]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[308]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[309]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[312]++;
  return self;
}, 
  beforeResume: noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[327]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[331]++;
  if (visit66_331_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[332]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[335]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[336]++;
    if (visit67_336_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[337]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[341]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[350]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[355]++;
  if (visit68_355_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[356]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[359]++;
  if (visit69_359_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[360]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[361]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[364]++;
  if (visit70_364_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[365]++;
    if (visit71_365_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[367]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[369]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[372]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[373]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[374]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[376]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[377]++;
  if (visit72_377_1(finish)) {
    _$jscoverage['/base.js'].lineData[378]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[379]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[381]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[384]++;
  if (visit73_384_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[386]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[387]++;
    if (visit74_387_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[388]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[391]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[395]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[402]++;
  util.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[403]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[404]++;
  if (visit75_406_1(visit76_406_2(queue === null) || visit77_408_1(visit78_408_2(typeof queue === 'string') || visit79_410_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[412]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[414]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[418]++;
  return AnimBase;
});
