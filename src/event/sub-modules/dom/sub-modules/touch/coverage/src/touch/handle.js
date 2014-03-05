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
if (! _$jscoverage['/touch/handle.js']) {
  _$jscoverage['/touch/handle.js'] = {};
  _$jscoverage['/touch/handle.js'].lineData = [];
  _$jscoverage['/touch/handle.js'].lineData[6] = 0;
  _$jscoverage['/touch/handle.js'].lineData[7] = 0;
  _$jscoverage['/touch/handle.js'].lineData[8] = 0;
  _$jscoverage['/touch/handle.js'].lineData[9] = 0;
  _$jscoverage['/touch/handle.js'].lineData[11] = 0;
  _$jscoverage['/touch/handle.js'].lineData[12] = 0;
  _$jscoverage['/touch/handle.js'].lineData[13] = 0;
  _$jscoverage['/touch/handle.js'].lineData[14] = 0;
  _$jscoverage['/touch/handle.js'].lineData[15] = 0;
  _$jscoverage['/touch/handle.js'].lineData[17] = 0;
  _$jscoverage['/touch/handle.js'].lineData[23] = 0;
  _$jscoverage['/touch/handle.js'].lineData[24] = 0;
  _$jscoverage['/touch/handle.js'].lineData[27] = 0;
  _$jscoverage['/touch/handle.js'].lineData[28] = 0;
  _$jscoverage['/touch/handle.js'].lineData[31] = 0;
  _$jscoverage['/touch/handle.js'].lineData[32] = 0;
  _$jscoverage['/touch/handle.js'].lineData[36] = 0;
  _$jscoverage['/touch/handle.js'].lineData[38] = 0;
  _$jscoverage['/touch/handle.js'].lineData[40] = 0;
  _$jscoverage['/touch/handle.js'].lineData[41] = 0;
  _$jscoverage['/touch/handle.js'].lineData[43] = 0;
  _$jscoverage['/touch/handle.js'].lineData[44] = 0;
  _$jscoverage['/touch/handle.js'].lineData[45] = 0;
  _$jscoverage['/touch/handle.js'].lineData[47] = 0;
  _$jscoverage['/touch/handle.js'].lineData[49] = 0;
  _$jscoverage['/touch/handle.js'].lineData[50] = 0;
  _$jscoverage['/touch/handle.js'].lineData[52] = 0;
  _$jscoverage['/touch/handle.js'].lineData[55] = 0;
  _$jscoverage['/touch/handle.js'].lineData[56] = 0;
  _$jscoverage['/touch/handle.js'].lineData[57] = 0;
  _$jscoverage['/touch/handle.js'].lineData[58] = 0;
  _$jscoverage['/touch/handle.js'].lineData[59] = 0;
  _$jscoverage['/touch/handle.js'].lineData[60] = 0;
  _$jscoverage['/touch/handle.js'].lineData[61] = 0;
  _$jscoverage['/touch/handle.js'].lineData[63] = 0;
  _$jscoverage['/touch/handle.js'].lineData[64] = 0;
  _$jscoverage['/touch/handle.js'].lineData[65] = 0;
  _$jscoverage['/touch/handle.js'].lineData[68] = 0;
  _$jscoverage['/touch/handle.js'].lineData[69] = 0;
  _$jscoverage['/touch/handle.js'].lineData[70] = 0;
  _$jscoverage['/touch/handle.js'].lineData[71] = 0;
  _$jscoverage['/touch/handle.js'].lineData[72] = 0;
  _$jscoverage['/touch/handle.js'].lineData[74] = 0;
  _$jscoverage['/touch/handle.js'].lineData[76] = 0;
  _$jscoverage['/touch/handle.js'].lineData[79] = 0;
  _$jscoverage['/touch/handle.js'].lineData[87] = 0;
  _$jscoverage['/touch/handle.js'].lineData[89] = 0;
  _$jscoverage['/touch/handle.js'].lineData[91] = 0;
  _$jscoverage['/touch/handle.js'].lineData[92] = 0;
  _$jscoverage['/touch/handle.js'].lineData[94] = 0;
  _$jscoverage['/touch/handle.js'].lineData[98] = 0;
  _$jscoverage['/touch/handle.js'].lineData[99] = 0;
  _$jscoverage['/touch/handle.js'].lineData[103] = 0;
  _$jscoverage['/touch/handle.js'].lineData[108] = 0;
  _$jscoverage['/touch/handle.js'].lineData[109] = 0;
  _$jscoverage['/touch/handle.js'].lineData[110] = 0;
  _$jscoverage['/touch/handle.js'].lineData[111] = 0;
  _$jscoverage['/touch/handle.js'].lineData[112] = 0;
  _$jscoverage['/touch/handle.js'].lineData[118] = 0;
  _$jscoverage['/touch/handle.js'].lineData[123] = 0;
  _$jscoverage['/touch/handle.js'].lineData[124] = 0;
  _$jscoverage['/touch/handle.js'].lineData[125] = 0;
  _$jscoverage['/touch/handle.js'].lineData[126] = 0;
  _$jscoverage['/touch/handle.js'].lineData[132] = 0;
  _$jscoverage['/touch/handle.js'].lineData[136] = 0;
  _$jscoverage['/touch/handle.js'].lineData[137] = 0;
  _$jscoverage['/touch/handle.js'].lineData[142] = 0;
  _$jscoverage['/touch/handle.js'].lineData[143] = 0;
  _$jscoverage['/touch/handle.js'].lineData[149] = 0;
  _$jscoverage['/touch/handle.js'].lineData[150] = 0;
  _$jscoverage['/touch/handle.js'].lineData[152] = 0;
  _$jscoverage['/touch/handle.js'].lineData[154] = 0;
  _$jscoverage['/touch/handle.js'].lineData[155] = 0;
  _$jscoverage['/touch/handle.js'].lineData[156] = 0;
  _$jscoverage['/touch/handle.js'].lineData[157] = 0;
  _$jscoverage['/touch/handle.js'].lineData[158] = 0;
  _$jscoverage['/touch/handle.js'].lineData[159] = 0;
  _$jscoverage['/touch/handle.js'].lineData[167] = 0;
  _$jscoverage['/touch/handle.js'].lineData[168] = 0;
  _$jscoverage['/touch/handle.js'].lineData[170] = 0;
  _$jscoverage['/touch/handle.js'].lineData[172] = 0;
  _$jscoverage['/touch/handle.js'].lineData[174] = 0;
  _$jscoverage['/touch/handle.js'].lineData[175] = 0;
  _$jscoverage['/touch/handle.js'].lineData[178] = 0;
  _$jscoverage['/touch/handle.js'].lineData[182] = 0;
  _$jscoverage['/touch/handle.js'].lineData[186] = 0;
  _$jscoverage['/touch/handle.js'].lineData[187] = 0;
  _$jscoverage['/touch/handle.js'].lineData[190] = 0;
  _$jscoverage['/touch/handle.js'].lineData[192] = 0;
  _$jscoverage['/touch/handle.js'].lineData[193] = 0;
  _$jscoverage['/touch/handle.js'].lineData[194] = 0;
  _$jscoverage['/touch/handle.js'].lineData[195] = 0;
  _$jscoverage['/touch/handle.js'].lineData[198] = 0;
  _$jscoverage['/touch/handle.js'].lineData[200] = 0;
  _$jscoverage['/touch/handle.js'].lineData[201] = 0;
  _$jscoverage['/touch/handle.js'].lineData[202] = 0;
  _$jscoverage['/touch/handle.js'].lineData[203] = 0;
  _$jscoverage['/touch/handle.js'].lineData[205] = 0;
  _$jscoverage['/touch/handle.js'].lineData[206] = 0;
  _$jscoverage['/touch/handle.js'].lineData[208] = 0;
  _$jscoverage['/touch/handle.js'].lineData[209] = 0;
  _$jscoverage['/touch/handle.js'].lineData[210] = 0;
  _$jscoverage['/touch/handle.js'].lineData[211] = 0;
  _$jscoverage['/touch/handle.js'].lineData[212] = 0;
  _$jscoverage['/touch/handle.js'].lineData[216] = 0;
  _$jscoverage['/touch/handle.js'].lineData[220] = 0;
  _$jscoverage['/touch/handle.js'].lineData[221] = 0;
  _$jscoverage['/touch/handle.js'].lineData[222] = 0;
  _$jscoverage['/touch/handle.js'].lineData[223] = 0;
  _$jscoverage['/touch/handle.js'].lineData[224] = 0;
  _$jscoverage['/touch/handle.js'].lineData[225] = 0;
  _$jscoverage['/touch/handle.js'].lineData[227] = 0;
  _$jscoverage['/touch/handle.js'].lineData[228] = 0;
  _$jscoverage['/touch/handle.js'].lineData[229] = 0;
  _$jscoverage['/touch/handle.js'].lineData[230] = 0;
  _$jscoverage['/touch/handle.js'].lineData[231] = 0;
  _$jscoverage['/touch/handle.js'].lineData[234] = 0;
  _$jscoverage['/touch/handle.js'].lineData[237] = 0;
  _$jscoverage['/touch/handle.js'].lineData[238] = 0;
  _$jscoverage['/touch/handle.js'].lineData[239] = 0;
  _$jscoverage['/touch/handle.js'].lineData[242] = 0;
  _$jscoverage['/touch/handle.js'].lineData[246] = 0;
  _$jscoverage['/touch/handle.js'].lineData[248] = 0;
  _$jscoverage['/touch/handle.js'].lineData[249] = 0;
  _$jscoverage['/touch/handle.js'].lineData[250] = 0;
  _$jscoverage['/touch/handle.js'].lineData[252] = 0;
  _$jscoverage['/touch/handle.js'].lineData[253] = 0;
  _$jscoverage['/touch/handle.js'].lineData[254] = 0;
  _$jscoverage['/touch/handle.js'].lineData[255] = 0;
  _$jscoverage['/touch/handle.js'].lineData[256] = 0;
  _$jscoverage['/touch/handle.js'].lineData[259] = 0;
  _$jscoverage['/touch/handle.js'].lineData[263] = 0;
  _$jscoverage['/touch/handle.js'].lineData[265] = 0;
  _$jscoverage['/touch/handle.js'].lineData[266] = 0;
  _$jscoverage['/touch/handle.js'].lineData[267] = 0;
  _$jscoverage['/touch/handle.js'].lineData[271] = 0;
  _$jscoverage['/touch/handle.js'].lineData[272] = 0;
  _$jscoverage['/touch/handle.js'].lineData[273] = 0;
  _$jscoverage['/touch/handle.js'].lineData[274] = 0;
  _$jscoverage['/touch/handle.js'].lineData[275] = 0;
  _$jscoverage['/touch/handle.js'].lineData[277] = 0;
  _$jscoverage['/touch/handle.js'].lineData[278] = 0;
  _$jscoverage['/touch/handle.js'].lineData[279] = 0;
  _$jscoverage['/touch/handle.js'].lineData[280] = 0;
  _$jscoverage['/touch/handle.js'].lineData[281] = 0;
  _$jscoverage['/touch/handle.js'].lineData[282] = 0;
  _$jscoverage['/touch/handle.js'].lineData[288] = 0;
  _$jscoverage['/touch/handle.js'].lineData[292] = 0;
  _$jscoverage['/touch/handle.js'].lineData[294] = 0;
  _$jscoverage['/touch/handle.js'].lineData[295] = 0;
  _$jscoverage['/touch/handle.js'].lineData[297] = 0;
  _$jscoverage['/touch/handle.js'].lineData[299] = 0;
  _$jscoverage['/touch/handle.js'].lineData[300] = 0;
  _$jscoverage['/touch/handle.js'].lineData[301] = 0;
  _$jscoverage['/touch/handle.js'].lineData[303] = 0;
  _$jscoverage['/touch/handle.js'].lineData[305] = 0;
  _$jscoverage['/touch/handle.js'].lineData[306] = 0;
  _$jscoverage['/touch/handle.js'].lineData[310] = 0;
  _$jscoverage['/touch/handle.js'].lineData[311] = 0;
  _$jscoverage['/touch/handle.js'].lineData[312] = 0;
  _$jscoverage['/touch/handle.js'].lineData[317] = 0;
  _$jscoverage['/touch/handle.js'].lineData[320] = 0;
  _$jscoverage['/touch/handle.js'].lineData[321] = 0;
  _$jscoverage['/touch/handle.js'].lineData[323] = 0;
  _$jscoverage['/touch/handle.js'].lineData[331] = 0;
  _$jscoverage['/touch/handle.js'].lineData[332] = 0;
  _$jscoverage['/touch/handle.js'].lineData[333] = 0;
  _$jscoverage['/touch/handle.js'].lineData[334] = 0;
  _$jscoverage['/touch/handle.js'].lineData[335] = 0;
  _$jscoverage['/touch/handle.js'].lineData[341] = 0;
  _$jscoverage['/touch/handle.js'].lineData[343] = 0;
  _$jscoverage['/touch/handle.js'].lineData[344] = 0;
  _$jscoverage['/touch/handle.js'].lineData[345] = 0;
  _$jscoverage['/touch/handle.js'].lineData[349] = 0;
  _$jscoverage['/touch/handle.js'].lineData[351] = 0;
  _$jscoverage['/touch/handle.js'].lineData[353] = 0;
  _$jscoverage['/touch/handle.js'].lineData[354] = 0;
  _$jscoverage['/touch/handle.js'].lineData[356] = 0;
  _$jscoverage['/touch/handle.js'].lineData[357] = 0;
  _$jscoverage['/touch/handle.js'].lineData[362] = 0;
  _$jscoverage['/touch/handle.js'].lineData[364] = 0;
  _$jscoverage['/touch/handle.js'].lineData[365] = 0;
  _$jscoverage['/touch/handle.js'].lineData[366] = 0;
  _$jscoverage['/touch/handle.js'].lineData[368] = 0;
  _$jscoverage['/touch/handle.js'].lineData[369] = 0;
  _$jscoverage['/touch/handle.js'].lineData[370] = 0;
}
if (! _$jscoverage['/touch/handle.js'].functionData) {
  _$jscoverage['/touch/handle.js'].functionData = [];
  _$jscoverage['/touch/handle.js'].functionData[0] = 0;
  _$jscoverage['/touch/handle.js'].functionData[1] = 0;
  _$jscoverage['/touch/handle.js'].functionData[2] = 0;
  _$jscoverage['/touch/handle.js'].functionData[3] = 0;
  _$jscoverage['/touch/handle.js'].functionData[4] = 0;
  _$jscoverage['/touch/handle.js'].functionData[5] = 0;
  _$jscoverage['/touch/handle.js'].functionData[6] = 0;
  _$jscoverage['/touch/handle.js'].functionData[7] = 0;
  _$jscoverage['/touch/handle.js'].functionData[8] = 0;
  _$jscoverage['/touch/handle.js'].functionData[9] = 0;
  _$jscoverage['/touch/handle.js'].functionData[10] = 0;
  _$jscoverage['/touch/handle.js'].functionData[11] = 0;
  _$jscoverage['/touch/handle.js'].functionData[12] = 0;
  _$jscoverage['/touch/handle.js'].functionData[13] = 0;
  _$jscoverage['/touch/handle.js'].functionData[14] = 0;
  _$jscoverage['/touch/handle.js'].functionData[15] = 0;
  _$jscoverage['/touch/handle.js'].functionData[16] = 0;
  _$jscoverage['/touch/handle.js'].functionData[17] = 0;
  _$jscoverage['/touch/handle.js'].functionData[18] = 0;
  _$jscoverage['/touch/handle.js'].functionData[19] = 0;
  _$jscoverage['/touch/handle.js'].functionData[20] = 0;
  _$jscoverage['/touch/handle.js'].functionData[21] = 0;
  _$jscoverage['/touch/handle.js'].functionData[22] = 0;
  _$jscoverage['/touch/handle.js'].functionData[23] = 0;
  _$jscoverage['/touch/handle.js'].functionData[24] = 0;
  _$jscoverage['/touch/handle.js'].functionData[25] = 0;
}
if (! _$jscoverage['/touch/handle.js'].branchData) {
  _$jscoverage['/touch/handle.js'].branchData = {};
  _$jscoverage['/touch/handle.js'].branchData['32'] = [];
  _$jscoverage['/touch/handle.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['40'] = [];
  _$jscoverage['/touch/handle.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['41'] = [];
  _$jscoverage['/touch/handle.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['52'] = [];
  _$jscoverage['/touch/handle.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['58'] = [];
  _$jscoverage['/touch/handle.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['91'] = [];
  _$jscoverage['/touch/handle.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['108'] = [];
  _$jscoverage['/touch/handle.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['110'] = [];
  _$jscoverage['/touch/handle.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['123'] = [];
  _$jscoverage['/touch/handle.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['125'] = [];
  _$jscoverage['/touch/handle.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['132'] = [];
  _$jscoverage['/touch/handle.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['136'] = [];
  _$jscoverage['/touch/handle.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['142'] = [];
  _$jscoverage['/touch/handle.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['152'] = [];
  _$jscoverage['/touch/handle.js'].branchData['152'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['158'] = [];
  _$jscoverage['/touch/handle.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['170'] = [];
  _$jscoverage['/touch/handle.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['174'] = [];
  _$jscoverage['/touch/handle.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['174'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['187'] = [];
  _$jscoverage['/touch/handle.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['187'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['187'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['192'] = [];
  _$jscoverage['/touch/handle.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['194'] = [];
  _$jscoverage['/touch/handle.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['200'] = [];
  _$jscoverage['/touch/handle.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['200'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['205'] = [];
  _$jscoverage['/touch/handle.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['220'] = [];
  _$jscoverage['/touch/handle.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['223'] = [];
  _$jscoverage['/touch/handle.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['224'] = [];
  _$jscoverage['/touch/handle.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['228'] = [];
  _$jscoverage['/touch/handle.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['230'] = [];
  _$jscoverage['/touch/handle.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['248'] = [];
  _$jscoverage['/touch/handle.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['249'] = [];
  _$jscoverage['/touch/handle.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['253'] = [];
  _$jscoverage['/touch/handle.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['255'] = [];
  _$jscoverage['/touch/handle.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['265'] = [];
  _$jscoverage['/touch/handle.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['266'] = [];
  _$jscoverage['/touch/handle.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['272'] = [];
  _$jscoverage['/touch/handle.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['277'] = [];
  _$jscoverage['/touch/handle.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['279'] = [];
  _$jscoverage['/touch/handle.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['281'] = [];
  _$jscoverage['/touch/handle.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['294'] = [];
  _$jscoverage['/touch/handle.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['300'] = [];
  _$jscoverage['/touch/handle.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['305'] = [];
  _$jscoverage['/touch/handle.js'].branchData['305'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['305'][2] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['305'][3] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['320'] = [];
  _$jscoverage['/touch/handle.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['332'] = [];
  _$jscoverage['/touch/handle.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['334'] = [];
  _$jscoverage['/touch/handle.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['353'] = [];
  _$jscoverage['/touch/handle.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['356'] = [];
  _$jscoverage['/touch/handle.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['364'] = [];
  _$jscoverage['/touch/handle.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['365'] = [];
  _$jscoverage['/touch/handle.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/touch/handle.js'].branchData['368'] = [];
  _$jscoverage['/touch/handle.js'].branchData['368'][1] = new BranchData();
}
_$jscoverage['/touch/handle.js'].branchData['368'][1].init(121, 35, 'S.isEmptyObject(handle.eventHandle)');
function visit63_368_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['368'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['365'][1].init(21, 5, 'event');
function visit62_365_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['364'][1].init(105, 6, 'handle');
function visit61_364_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['356'][1].init(217, 5, 'event');
function visit60_356_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['353'][1].init(105, 7, '!handle');
function visit59_353_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['334'][1].init(65, 25, '!eventHandle[event].count');
function visit58_334_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['332'][1].init(65, 18, 'eventHandle[event]');
function visit57_332_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['320'][1].init(149, 18, 'eventHandle[event]');
function visit56_320_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['305'][3].init(303, 26, 'h[method](event) === false');
function visit55_305_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['305'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['305'][2].init(290, 39, 'h[method] && h[method](event) === false');
function visit54_305_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['305'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['305'][1].init(276, 53, 'h.isActive && h[method] && h[method](event) === false');
function visit53_305_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['305'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['300'][1].init(125, 11, 'h.processed');
function visit52_300_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['294'][1].init(238, 28, '!event.changedTouches.length');
function visit51_294_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['281'][1].init(76, 20, '!self.touches.length');
function visit50_281_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['279'][1].init(610, 20, 'isPointerEvent(type)');
function visit49_279_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['277'][1].init(529, 18, 'isMouseEvent(type)');
function visit48_277_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['272'][1].init(296, 18, 'isTouchEvent(type)');
function visit47_272_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['266'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit46_266_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['265'][1].init(81, 18, 'isMouseEvent(type)');
function visit45_265_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['255'][1].init(390, 19, '!isTouchEvent(type)');
function visit44_255_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['253'][1].init(287, 20, 'isPointerEvent(type)');
function visit43_253_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['249'][1].init(21, 36, 'self.isEventSimulatedFromTouch(type)');
function visit42_249_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['248'][1].init(81, 18, 'isMouseEvent(type)');
function visit41_248_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['230'][1].init(73, 25, 'self.touches.length === 1');
function visit40_230_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['228'][1].init(505, 20, 'isPointerEvent(type)');
function visit39_228_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['224'][1].init(21, 37, 'self.isEventSimulatedFromTouch(event)');
function visit38_224_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['223'][1].init(298, 18, 'isMouseEvent(type)');
function visit37_223_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['220'][1].init(151, 18, 'isTouchEvent(type)');
function visit36_220_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['205'][1].init(866, 10, 'touchEvent');
function visit35_205_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['200'][2].init(689, 22, 'touchList.length === 1');
function visit34_200_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['200'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['200'][1].init(676, 35, 'touchList && touchList.length === 1');
function visit33_200_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['194'][1].init(92, 23, 'pointerType === \'touch\'');
function visit32_194_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['192'][1].init(21, 20, 'isPointerEvent(type)');
function visit31_192_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['187'][3].init(53, 22, 'type === \'touchcancel\'');
function visit30_187_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['187'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['187'][2].init(30, 19, 'type === \'touchend\'');
function visit29_187_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['187'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['187'][1].init(30, 45, 'type === \'touchend\' || type === \'touchcancel\'');
function visit28_187_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['174'][3].init(211, 14, 'dy <= DUP_DIST');
function visit27_174_3(result) {
  _$jscoverage['/touch/handle.js'].branchData['174'][3].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['174'][2].init(193, 14, 'dx <= DUP_DIST');
function visit26_174_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['174'][1].init(193, 32, 'dx <= DUP_DIST && dy <= DUP_DIST');
function visit25_174_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['170'][2].init(162, 5, 'i < l');
function visit24_170_2(result) {
  _$jscoverage['/touch/handle.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['170'][1].init(162, 21, 'i < l && (t = lts[i])');
function visit23_170_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['158'][1].init(70, 6, 'i > -1');
function visit22_158_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['152'][1].init(165, 22, 'this.isPrimaryTouch(t)');
function visit21_152_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['152'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['142'][1].init(17, 28, 'this.isPrimaryTouch(inTouch)');
function visit20_142_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['136'][1].init(17, 24, 'this.firstTouch === null');
function visit19_136_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['132'][1].init(20, 38, 'this.firstTouch === inTouch.identifier');
function visit18_132_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['125'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit17_125_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['123'][1].init(195, 5, 'i < l');
function visit16_123_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['110'][1].init(57, 29, 'touch.pointerId === pointerId');
function visit15_110_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['108'][1].init(195, 5, 'i < l');
function visit14_108_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['91'][1].init(219, 33, '!isPointerEvent(gestureMoveEvent)');
function visit13_91_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['58'][1].init(1663, 30, 'Feature.isMsPointerSupported()');
function visit12_58_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['52'][1].init(1385, 28, 'Feature.isPointerSupported()');
function visit11_52_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['41'][1].init(13, 8, 'S.UA.ios');
function visit10_41_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['40'][1].init(886, 31, 'Feature.isTouchEventSupported()');
function visit9_40_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].branchData['32'][1].init(16, 64, 'S.startsWith(type, \'MSPointer\') || S.startsWith(type, \'pointer\')');
function visit8_32_1(result) {
  _$jscoverage['/touch/handle.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/touch/handle.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/touch/handle.js'].functionData[0]++;
  _$jscoverage['/touch/handle.js'].lineData[7]++;
  var Dom = require('dom');
  _$jscoverage['/touch/handle.js'].lineData[8]++;
  var eventHandleMap = require('./handle-map');
  _$jscoverage['/touch/handle.js'].lineData[9]++;
  var DomEvent = require('event/dom/base');
  _$jscoverage['/touch/handle.js'].lineData[11]++;
  require('./tap');
  _$jscoverage['/touch/handle.js'].lineData[12]++;
  require('./swipe');
  _$jscoverage['/touch/handle.js'].lineData[13]++;
  require('./pinch');
  _$jscoverage['/touch/handle.js'].lineData[14]++;
  require('./rotate');
  _$jscoverage['/touch/handle.js'].lineData[15]++;
  require('./drag');
  _$jscoverage['/touch/handle.js'].lineData[17]++;
  var key = S.guid('touch-handle'), Feature = S.Feature, gestureStartEvent, gestureMoveEvent, gestureEndEvent;
  _$jscoverage['/touch/handle.js'].lineData[23]++;
  function isTouchEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[1]++;
    _$jscoverage['/touch/handle.js'].lineData[24]++;
    return S.startsWith(type, 'touch');
  }
  _$jscoverage['/touch/handle.js'].lineData[27]++;
  function isMouseEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[2]++;
    _$jscoverage['/touch/handle.js'].lineData[28]++;
    return S.startsWith(type, 'mouse');
  }
  _$jscoverage['/touch/handle.js'].lineData[31]++;
  function isPointerEvent(type) {
    _$jscoverage['/touch/handle.js'].functionData[3]++;
    _$jscoverage['/touch/handle.js'].lineData[32]++;
    return visit8_32_1(S.startsWith(type, 'MSPointer') || S.startsWith(type, 'pointer'));
  }
  _$jscoverage['/touch/handle.js'].lineData[36]++;
  var DUP_TIMEOUT = 2500;
  _$jscoverage['/touch/handle.js'].lineData[38]++;
  var DUP_DIST = 25;
  _$jscoverage['/touch/handle.js'].lineData[40]++;
  if (visit9_40_1(Feature.isTouchEventSupported())) {
    _$jscoverage['/touch/handle.js'].lineData[41]++;
    if (visit10_41_1(S.UA.ios)) {
      _$jscoverage['/touch/handle.js'].lineData[43]++;
      gestureEndEvent = 'touchend touchcancel';
      _$jscoverage['/touch/handle.js'].lineData[44]++;
      gestureStartEvent = 'touchstart';
      _$jscoverage['/touch/handle.js'].lineData[45]++;
      gestureMoveEvent = 'touchmove';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[47]++;
      gestureEndEvent = 'touchend touchcancel mouseup';
      _$jscoverage['/touch/handle.js'].lineData[49]++;
      gestureStartEvent = 'touchstart mousedown';
      _$jscoverage['/touch/handle.js'].lineData[50]++;
      gestureMoveEvent = 'touchmove mousemove';
    }
  } else {
    _$jscoverage['/touch/handle.js'].lineData[52]++;
    if (visit11_52_1(Feature.isPointerSupported())) {
      _$jscoverage['/touch/handle.js'].lineData[55]++;
      gestureStartEvent = 'pointerdown';
      _$jscoverage['/touch/handle.js'].lineData[56]++;
      gestureMoveEvent = 'pointermove';
      _$jscoverage['/touch/handle.js'].lineData[57]++;
      gestureEndEvent = 'pointerup pointercancel';
    } else {
      _$jscoverage['/touch/handle.js'].lineData[58]++;
      if (visit12_58_1(Feature.isMsPointerSupported())) {
        _$jscoverage['/touch/handle.js'].lineData[59]++;
        gestureStartEvent = 'MSPointerDown';
        _$jscoverage['/touch/handle.js'].lineData[60]++;
        gestureMoveEvent = 'MSPointerMove';
        _$jscoverage['/touch/handle.js'].lineData[61]++;
        gestureEndEvent = 'MSPointerUp MSPointerCancel';
      } else {
        _$jscoverage['/touch/handle.js'].lineData[63]++;
        gestureStartEvent = 'mousedown';
        _$jscoverage['/touch/handle.js'].lineData[64]++;
        gestureMoveEvent = 'mousemove';
        _$jscoverage['/touch/handle.js'].lineData[65]++;
        gestureEndEvent = 'mouseup';
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[68]++;
  function DocumentHandler(doc) {
    _$jscoverage['/touch/handle.js'].functionData[4]++;
    _$jscoverage['/touch/handle.js'].lineData[69]++;
    var self = this;
    _$jscoverage['/touch/handle.js'].lineData[70]++;
    self.doc = doc;
    _$jscoverage['/touch/handle.js'].lineData[71]++;
    self.eventHandle = {};
    _$jscoverage['/touch/handle.js'].lineData[72]++;
    self.init();
    _$jscoverage['/touch/handle.js'].lineData[74]++;
    self.touches = [];
    _$jscoverage['/touch/handle.js'].lineData[76]++;
    self.inTouch = 0;
  }
  _$jscoverage['/touch/handle.js'].lineData[79]++;
  DocumentHandler.prototype = {
  constructor: DocumentHandler, 
  lastTouches: [], 
  firstTouch: null, 
  init: function() {
  _$jscoverage['/touch/handle.js'].functionData[5]++;
  _$jscoverage['/touch/handle.js'].lineData[87]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[89]++;
  DomEvent.on(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[91]++;
  if (visit13_91_1(!isPointerEvent(gestureMoveEvent))) {
    _$jscoverage['/touch/handle.js'].lineData[92]++;
    DomEvent.on(doc, gestureMoveEvent, self.onTouchMove, self);
  }
  _$jscoverage['/touch/handle.js'].lineData[94]++;
  DomEvent.on(doc, gestureEndEvent, self.onTouchEnd, self);
}, 
  addTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[6]++;
  _$jscoverage['/touch/handle.js'].lineData[98]++;
  originalEvent.identifier = originalEvent.pointerId;
  _$jscoverage['/touch/handle.js'].lineData[99]++;
  this.touches.push(originalEvent);
}, 
  removeTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[7]++;
  _$jscoverage['/touch/handle.js'].lineData[103]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[108]++;
  for (; visit14_108_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[109]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[110]++;
    if (visit15_110_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[111]++;
      touches.splice(i, 1);
      _$jscoverage['/touch/handle.js'].lineData[112]++;
      break;
    }
  }
}, 
  updateTouch: function(originalEvent) {
  _$jscoverage['/touch/handle.js'].functionData[8]++;
  _$jscoverage['/touch/handle.js'].lineData[118]++;
  var i = 0, touch, pointerId = originalEvent.pointerId, touches = this.touches, l = touches.length;
  _$jscoverage['/touch/handle.js'].lineData[123]++;
  for (; visit16_123_1(i < l); i++) {
    _$jscoverage['/touch/handle.js'].lineData[124]++;
    touch = touches[i];
    _$jscoverage['/touch/handle.js'].lineData[125]++;
    if (visit17_125_1(touch.pointerId === pointerId)) {
      _$jscoverage['/touch/handle.js'].lineData[126]++;
      touches[i] = originalEvent;
    }
  }
}, 
  isPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[9]++;
  _$jscoverage['/touch/handle.js'].lineData[132]++;
  return visit18_132_1(this.firstTouch === inTouch.identifier);
}, 
  setPrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[10]++;
  _$jscoverage['/touch/handle.js'].lineData[136]++;
  if (visit19_136_1(this.firstTouch === null)) {
    _$jscoverage['/touch/handle.js'].lineData[137]++;
    this.firstTouch = inTouch.identifier;
  }
}, 
  removePrimaryTouch: function(inTouch) {
  _$jscoverage['/touch/handle.js'].functionData[11]++;
  _$jscoverage['/touch/handle.js'].lineData[142]++;
  if (visit20_142_1(this.isPrimaryTouch(inTouch))) {
    _$jscoverage['/touch/handle.js'].lineData[143]++;
    this.firstTouch = null;
  }
}, 
  dupMouse: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[12]++;
  _$jscoverage['/touch/handle.js'].lineData[149]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[150]++;
  var t = inEvent.changedTouches[0];
  _$jscoverage['/touch/handle.js'].lineData[152]++;
  if (visit21_152_1(this.isPrimaryTouch(t))) {
    _$jscoverage['/touch/handle.js'].lineData[154]++;
    var lt = {
  x: t.clientX, 
  y: t.clientY};
    _$jscoverage['/touch/handle.js'].lineData[155]++;
    lts.push(lt);
    _$jscoverage['/touch/handle.js'].lineData[156]++;
    setTimeout(function() {
  _$jscoverage['/touch/handle.js'].functionData[13]++;
  _$jscoverage['/touch/handle.js'].lineData[157]++;
  var i = lts.indexOf(lt);
  _$jscoverage['/touch/handle.js'].lineData[158]++;
  if (visit22_158_1(i > -1)) {
    _$jscoverage['/touch/handle.js'].lineData[159]++;
    lts.splice(i, 1);
  }
}, DUP_TIMEOUT);
  }
}, 
  isEventSimulatedFromTouch: function(inEvent) {
  _$jscoverage['/touch/handle.js'].functionData[14]++;
  _$jscoverage['/touch/handle.js'].lineData[167]++;
  var lts = this.lastTouches;
  _$jscoverage['/touch/handle.js'].lineData[168]++;
  var x = inEvent.clientX, y = inEvent.clientY;
  _$jscoverage['/touch/handle.js'].lineData[170]++;
  for (var i = 0, l = lts.length, t; visit23_170_1(visit24_170_2(i < l) && (t = lts[i])); i++) {
    _$jscoverage['/touch/handle.js'].lineData[172]++;
    var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
    _$jscoverage['/touch/handle.js'].lineData[174]++;
    if (visit25_174_1(visit26_174_2(dx <= DUP_DIST) && visit27_174_3(dy <= DUP_DIST))) {
      _$jscoverage['/touch/handle.js'].lineData[175]++;
      return true;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[178]++;
  return 0;
}, 
  normalize: function(e) {
  _$jscoverage['/touch/handle.js'].functionData[15]++;
  _$jscoverage['/touch/handle.js'].lineData[182]++;
  var type = e.type, notUp, touchEvent, touchList;
  _$jscoverage['/touch/handle.js'].lineData[186]++;
  if ((touchEvent = isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[187]++;
    touchList = (visit28_187_1(visit29_187_2(type === 'touchend') || visit30_187_3(type === 'touchcancel'))) ? e.changedTouches : e.touches;
    _$jscoverage['/touch/handle.js'].lineData[190]++;
    e.isTouch = 1;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[192]++;
    if (visit31_192_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[193]++;
      var pointerType = e.originalEvent.pointerType;
      _$jscoverage['/touch/handle.js'].lineData[194]++;
      if (visit32_194_1(pointerType === 'touch')) {
        _$jscoverage['/touch/handle.js'].lineData[195]++;
        e.isTouch = 1;
      }
    }
    _$jscoverage['/touch/handle.js'].lineData[198]++;
    touchList = this.touches;
  }
  _$jscoverage['/touch/handle.js'].lineData[200]++;
  if (visit33_200_1(touchList && visit34_200_2(touchList.length === 1))) {
    _$jscoverage['/touch/handle.js'].lineData[201]++;
    e.which = 1;
    _$jscoverage['/touch/handle.js'].lineData[202]++;
    e.pageX = touchList[0].pageX;
    _$jscoverage['/touch/handle.js'].lineData[203]++;
    e.pageY = touchList[0].pageY;
  }
  _$jscoverage['/touch/handle.js'].lineData[205]++;
  if (visit35_205_1(touchEvent)) {
    _$jscoverage['/touch/handle.js'].lineData[206]++;
    return e;
  }
  _$jscoverage['/touch/handle.js'].lineData[208]++;
  notUp = !type.match(/(up|cancel)$/i);
  _$jscoverage['/touch/handle.js'].lineData[209]++;
  e.touches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[210]++;
  e.targetTouches = notUp ? touchList : [];
  _$jscoverage['/touch/handle.js'].lineData[211]++;
  e.changedTouches = touchList;
  _$jscoverage['/touch/handle.js'].lineData[212]++;
  return e;
}, 
  onTouchStart: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[16]++;
  _$jscoverage['/touch/handle.js'].lineData[216]++;
  var e, h, self = this, type = event.type, eventHandle = self.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[220]++;
  if (visit36_220_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[221]++;
    self.setPrimaryTouch(event.changedTouches[0]);
    _$jscoverage['/touch/handle.js'].lineData[222]++;
    self.dupMouse(event);
  } else {
    _$jscoverage['/touch/handle.js'].lineData[223]++;
    if (visit37_223_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[224]++;
      if (visit38_224_1(self.isEventSimulatedFromTouch(event))) {
        _$jscoverage['/touch/handle.js'].lineData[225]++;
        return;
      }
      _$jscoverage['/touch/handle.js'].lineData[227]++;
      self.touches = [event.originalEvent];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[228]++;
      if (visit39_228_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[229]++;
        self.addTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[230]++;
        if (visit40_230_1(self.touches.length === 1)) {
          _$jscoverage['/touch/handle.js'].lineData[231]++;
          DomEvent.on(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      } else {
        _$jscoverage['/touch/handle.js'].lineData[234]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[237]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[238]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[239]++;
    h.isActive = 1;
  }
  _$jscoverage['/touch/handle.js'].lineData[242]++;
  self.callEventHandle('onTouchStart', event);
}, 
  onTouchMove: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[17]++;
  _$jscoverage['/touch/handle.js'].lineData[246]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[248]++;
  if (visit41_248_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[249]++;
    if (visit42_249_1(self.isEventSimulatedFromTouch(type))) {
      _$jscoverage['/touch/handle.js'].lineData[250]++;
      return;
    }
    _$jscoverage['/touch/handle.js'].lineData[252]++;
    self.touches = [event.originalEvent];
  } else {
    _$jscoverage['/touch/handle.js'].lineData[253]++;
    if (visit43_253_1(isPointerEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[254]++;
      self.updateTouch(event.originalEvent);
    } else {
      _$jscoverage['/touch/handle.js'].lineData[255]++;
      if (visit44_255_1(!isTouchEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[256]++;
        throw new Error('unrecognized touch event: ' + event.type);
      }
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[259]++;
  self.callEventHandle('onTouchMove', event);
}, 
  onTouchEnd: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[18]++;
  _$jscoverage['/touch/handle.js'].lineData[263]++;
  var self = this, type = event.type;
  _$jscoverage['/touch/handle.js'].lineData[265]++;
  if (visit45_265_1(isMouseEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[266]++;
    if (visit46_266_1(self.isEventSimulatedFromTouch(event))) {
      _$jscoverage['/touch/handle.js'].lineData[267]++;
      return;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[271]++;
  self.callEventHandle('onTouchEnd', event);
  _$jscoverage['/touch/handle.js'].lineData[272]++;
  if (visit47_272_1(isTouchEvent(type))) {
    _$jscoverage['/touch/handle.js'].lineData[273]++;
    self.dupMouse(event);
    _$jscoverage['/touch/handle.js'].lineData[274]++;
    S.makeArray(event.changedTouches).forEach(function(touch) {
  _$jscoverage['/touch/handle.js'].functionData[19]++;
  _$jscoverage['/touch/handle.js'].lineData[275]++;
  self.removePrimaryTouch(touch);
});
  } else {
    _$jscoverage['/touch/handle.js'].lineData[277]++;
    if (visit48_277_1(isMouseEvent(type))) {
      _$jscoverage['/touch/handle.js'].lineData[278]++;
      self.touches = [];
    } else {
      _$jscoverage['/touch/handle.js'].lineData[279]++;
      if (visit49_279_1(isPointerEvent(type))) {
        _$jscoverage['/touch/handle.js'].lineData[280]++;
        self.removeTouch(event.originalEvent);
        _$jscoverage['/touch/handle.js'].lineData[281]++;
        if (visit50_281_1(!self.touches.length)) {
          _$jscoverage['/touch/handle.js'].lineData[282]++;
          DomEvent.detach(self.doc, gestureMoveEvent, self.onTouchMove, self);
        }
      }
    }
  }
}, 
  callEventHandle: function(method, event) {
  _$jscoverage['/touch/handle.js'].functionData[20]++;
  _$jscoverage['/touch/handle.js'].lineData[288]++;
  var self = this, eventHandle = self.eventHandle, e, h;
  _$jscoverage['/touch/handle.js'].lineData[292]++;
  event = self.normalize(event);
  _$jscoverage['/touch/handle.js'].lineData[294]++;
  if (visit51_294_1(!event.changedTouches.length)) {
    _$jscoverage['/touch/handle.js'].lineData[295]++;
    return;
  }
  _$jscoverage['/touch/handle.js'].lineData[297]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[299]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[300]++;
    if (visit52_300_1(h.processed)) {
      _$jscoverage['/touch/handle.js'].lineData[301]++;
      continue;
    }
    _$jscoverage['/touch/handle.js'].lineData[303]++;
    h.processed = 1;
    _$jscoverage['/touch/handle.js'].lineData[305]++;
    if (visit53_305_1(h.isActive && visit54_305_2(h[method] && visit55_305_3(h[method](event) === false)))) {
      _$jscoverage['/touch/handle.js'].lineData[306]++;
      h.isActive = 0;
    }
  }
  _$jscoverage['/touch/handle.js'].lineData[310]++;
  for (e in eventHandle) {
    _$jscoverage['/touch/handle.js'].lineData[311]++;
    h = eventHandle[e].handle;
    _$jscoverage['/touch/handle.js'].lineData[312]++;
    h.processed = 0;
  }
}, 
  addEventHandle: function(event) {
  _$jscoverage['/touch/handle.js'].functionData[21]++;
  _$jscoverage['/touch/handle.js'].lineData[317]++;
  var self = this, eventHandle = self.eventHandle, handle = eventHandleMap[event].handle;
  _$jscoverage['/touch/handle.js'].lineData[320]++;
  if (visit56_320_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[321]++;
    eventHandle[event].count++;
  } else {
    _$jscoverage['/touch/handle.js'].lineData[323]++;
    eventHandle[event] = {
  count: 1, 
  handle: handle};
  }
}, 
  'removeEventHandle': function(event) {
  _$jscoverage['/touch/handle.js'].functionData[22]++;
  _$jscoverage['/touch/handle.js'].lineData[331]++;
  var eventHandle = this.eventHandle;
  _$jscoverage['/touch/handle.js'].lineData[332]++;
  if (visit57_332_1(eventHandle[event])) {
    _$jscoverage['/touch/handle.js'].lineData[333]++;
    eventHandle[event].count--;
    _$jscoverage['/touch/handle.js'].lineData[334]++;
    if (visit58_334_1(!eventHandle[event].count)) {
      _$jscoverage['/touch/handle.js'].lineData[335]++;
      delete eventHandle[event];
    }
  }
}, 
  destroy: function() {
  _$jscoverage['/touch/handle.js'].functionData[23]++;
  _$jscoverage['/touch/handle.js'].lineData[341]++;
  var self = this, doc = self.doc;
  _$jscoverage['/touch/handle.js'].lineData[343]++;
  DomEvent.detach(doc, gestureStartEvent, self.onTouchStart, self);
  _$jscoverage['/touch/handle.js'].lineData[344]++;
  DomEvent.detach(doc, gestureMoveEvent, self.onTouchMove, self);
  _$jscoverage['/touch/handle.js'].lineData[345]++;
  DomEvent.detach(doc, gestureEndEvent, self.onTouchEnd, self);
}};
  _$jscoverage['/touch/handle.js'].lineData[349]++;
  return {
  addDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[24]++;
  _$jscoverage['/touch/handle.js'].lineData[351]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[353]++;
  if (visit59_353_1(!handle)) {
    _$jscoverage['/touch/handle.js'].lineData[354]++;
    Dom.data(doc, key, handle = new DocumentHandler(doc));
  }
  _$jscoverage['/touch/handle.js'].lineData[356]++;
  if (visit60_356_1(event)) {
    _$jscoverage['/touch/handle.js'].lineData[357]++;
    handle.addEventHandle(event);
  }
}, 
  removeDocumentHandle: function(el, event) {
  _$jscoverage['/touch/handle.js'].functionData[25]++;
  _$jscoverage['/touch/handle.js'].lineData[362]++;
  var doc = Dom.getDocument(el), handle = Dom.data(doc, key);
  _$jscoverage['/touch/handle.js'].lineData[364]++;
  if (visit61_364_1(handle)) {
    _$jscoverage['/touch/handle.js'].lineData[365]++;
    if (visit62_365_1(event)) {
      _$jscoverage['/touch/handle.js'].lineData[366]++;
      handle.removeEventHandle(event);
    }
    _$jscoverage['/touch/handle.js'].lineData[368]++;
    if (visit63_368_1(S.isEmptyObject(handle.eventHandle))) {
      _$jscoverage['/touch/handle.js'].lineData[369]++;
      handle.destroy();
      _$jscoverage['/touch/handle.js'].lineData[370]++;
      Dom.removeData(doc, key);
    }
  }
}};
});
