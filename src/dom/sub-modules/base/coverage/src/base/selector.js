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
if (! _$jscoverage['/base/selector.js']) {
  _$jscoverage['/base/selector.js'] = {};
  _$jscoverage['/base/selector.js'].lineData = [];
  _$jscoverage['/base/selector.js'].lineData[6] = 0;
  _$jscoverage['/base/selector.js'].lineData[7] = 0;
  _$jscoverage['/base/selector.js'].lineData[8] = 0;
  _$jscoverage['/base/selector.js'].lineData[29] = 0;
  _$jscoverage['/base/selector.js'].lineData[30] = 0;
  _$jscoverage['/base/selector.js'].lineData[31] = 0;
  _$jscoverage['/base/selector.js'].lineData[34] = 0;
  _$jscoverage['/base/selector.js'].lineData[35] = 0;
  _$jscoverage['/base/selector.js'].lineData[36] = 0;
  _$jscoverage['/base/selector.js'].lineData[37] = 0;
  _$jscoverage['/base/selector.js'].lineData[38] = 0;
  _$jscoverage['/base/selector.js'].lineData[41] = 0;
  _$jscoverage['/base/selector.js'].lineData[45] = 0;
  _$jscoverage['/base/selector.js'].lineData[46] = 0;
  _$jscoverage['/base/selector.js'].lineData[49] = 0;
  _$jscoverage['/base/selector.js'].lineData[50] = 0;
  _$jscoverage['/base/selector.js'].lineData[51] = 0;
  _$jscoverage['/base/selector.js'].lineData[56] = 0;
  _$jscoverage['/base/selector.js'].lineData[57] = 0;
  _$jscoverage['/base/selector.js'].lineData[58] = 0;
  _$jscoverage['/base/selector.js'].lineData[59] = 0;
  _$jscoverage['/base/selector.js'].lineData[61] = 0;
  _$jscoverage['/base/selector.js'].lineData[64] = 0;
  _$jscoverage['/base/selector.js'].lineData[65] = 0;
  _$jscoverage['/base/selector.js'].lineData[66] = 0;
  _$jscoverage['/base/selector.js'].lineData[67] = 0;
  _$jscoverage['/base/selector.js'].lineData[68] = 0;
  _$jscoverage['/base/selector.js'].lineData[69] = 0;
  _$jscoverage['/base/selector.js'].lineData[71] = 0;
  _$jscoverage['/base/selector.js'].lineData[75] = 0;
  _$jscoverage['/base/selector.js'].lineData[76] = 0;
  _$jscoverage['/base/selector.js'].lineData[77] = 0;
  _$jscoverage['/base/selector.js'].lineData[78] = 0;
  _$jscoverage['/base/selector.js'].lineData[82] = 0;
  _$jscoverage['/base/selector.js'].lineData[83] = 0;
  _$jscoverage['/base/selector.js'].lineData[84] = 0;
  _$jscoverage['/base/selector.js'].lineData[88] = 0;
  _$jscoverage['/base/selector.js'].lineData[89] = 0;
  _$jscoverage['/base/selector.js'].lineData[90] = 0;
  _$jscoverage['/base/selector.js'].lineData[95] = 0;
  _$jscoverage['/base/selector.js'].lineData[96] = 0;
  _$jscoverage['/base/selector.js'].lineData[97] = 0;
  _$jscoverage['/base/selector.js'].lineData[100] = 0;
  _$jscoverage['/base/selector.js'].lineData[101] = 0;
  _$jscoverage['/base/selector.js'].lineData[110] = 0;
  _$jscoverage['/base/selector.js'].lineData[111] = 0;
  _$jscoverage['/base/selector.js'].lineData[112] = 0;
  _$jscoverage['/base/selector.js'].lineData[113] = 0;
  _$jscoverage['/base/selector.js'].lineData[115] = 0;
  _$jscoverage['/base/selector.js'].lineData[117] = 0;
  _$jscoverage['/base/selector.js'].lineData[118] = 0;
  _$jscoverage['/base/selector.js'].lineData[119] = 0;
  _$jscoverage['/base/selector.js'].lineData[121] = 0;
  _$jscoverage['/base/selector.js'].lineData[122] = 0;
  _$jscoverage['/base/selector.js'].lineData[124] = 0;
  _$jscoverage['/base/selector.js'].lineData[125] = 0;
  _$jscoverage['/base/selector.js'].lineData[126] = 0;
  _$jscoverage['/base/selector.js'].lineData[128] = 0;
  _$jscoverage['/base/selector.js'].lineData[129] = 0;
  _$jscoverage['/base/selector.js'].lineData[130] = 0;
  _$jscoverage['/base/selector.js'].lineData[132] = 0;
  _$jscoverage['/base/selector.js'].lineData[133] = 0;
  _$jscoverage['/base/selector.js'].lineData[135] = 0;
  _$jscoverage['/base/selector.js'].lineData[141] = 0;
  _$jscoverage['/base/selector.js'].lineData[142] = 0;
  _$jscoverage['/base/selector.js'].lineData[145] = 0;
  _$jscoverage['/base/selector.js'].lineData[146] = 0;
  _$jscoverage['/base/selector.js'].lineData[150] = 0;
  _$jscoverage['/base/selector.js'].lineData[153] = 0;
  _$jscoverage['/base/selector.js'].lineData[154] = 0;
  _$jscoverage['/base/selector.js'].lineData[157] = 0;
  _$jscoverage['/base/selector.js'].lineData[158] = 0;
  _$jscoverage['/base/selector.js'].lineData[159] = 0;
  _$jscoverage['/base/selector.js'].lineData[162] = 0;
  _$jscoverage['/base/selector.js'].lineData[166] = 0;
  _$jscoverage['/base/selector.js'].lineData[167] = 0;
  _$jscoverage['/base/selector.js'].lineData[168] = 0;
  _$jscoverage['/base/selector.js'].lineData[169] = 0;
  _$jscoverage['/base/selector.js'].lineData[172] = 0;
  _$jscoverage['/base/selector.js'].lineData[173] = 0;
  _$jscoverage['/base/selector.js'].lineData[181] = 0;
  _$jscoverage['/base/selector.js'].lineData[182] = 0;
  _$jscoverage['/base/selector.js'].lineData[183] = 0;
  _$jscoverage['/base/selector.js'].lineData[185] = 0;
  _$jscoverage['/base/selector.js'].lineData[186] = 0;
  _$jscoverage['/base/selector.js'].lineData[190] = 0;
  _$jscoverage['/base/selector.js'].lineData[191] = 0;
  _$jscoverage['/base/selector.js'].lineData[197] = 0;
  _$jscoverage['/base/selector.js'].lineData[199] = 0;
  _$jscoverage['/base/selector.js'].lineData[202] = 0;
  _$jscoverage['/base/selector.js'].lineData[203] = 0;
  _$jscoverage['/base/selector.js'].lineData[206] = 0;
  _$jscoverage['/base/selector.js'].lineData[207] = 0;
  _$jscoverage['/base/selector.js'].lineData[208] = 0;
  _$jscoverage['/base/selector.js'].lineData[209] = 0;
  _$jscoverage['/base/selector.js'].lineData[210] = 0;
  _$jscoverage['/base/selector.js'].lineData[211] = 0;
  _$jscoverage['/base/selector.js'].lineData[219] = 0;
  _$jscoverage['/base/selector.js'].lineData[221] = 0;
  _$jscoverage['/base/selector.js'].lineData[224] = 0;
  _$jscoverage['/base/selector.js'].lineData[227] = 0;
  _$jscoverage['/base/selector.js'].lineData[228] = 0;
  _$jscoverage['/base/selector.js'].lineData[232] = 0;
  _$jscoverage['/base/selector.js'].lineData[233] = 0;
  _$jscoverage['/base/selector.js'].lineData[234] = 0;
  _$jscoverage['/base/selector.js'].lineData[235] = 0;
  _$jscoverage['/base/selector.js'].lineData[237] = 0;
  _$jscoverage['/base/selector.js'].lineData[240] = 0;
  _$jscoverage['/base/selector.js'].lineData[241] = 0;
  _$jscoverage['/base/selector.js'].lineData[244] = 0;
  _$jscoverage['/base/selector.js'].lineData[252] = 0;
  _$jscoverage['/base/selector.js'].lineData[253] = 0;
  _$jscoverage['/base/selector.js'].lineData[255] = 0;
  _$jscoverage['/base/selector.js'].lineData[256] = 0;
  _$jscoverage['/base/selector.js'].lineData[261] = 0;
  _$jscoverage['/base/selector.js'].lineData[265] = 0;
  _$jscoverage['/base/selector.js'].lineData[275] = 0;
  _$jscoverage['/base/selector.js'].lineData[279] = 0;
  _$jscoverage['/base/selector.js'].lineData[280] = 0;
  _$jscoverage['/base/selector.js'].lineData[281] = 0;
  _$jscoverage['/base/selector.js'].lineData[282] = 0;
  _$jscoverage['/base/selector.js'].lineData[285] = 0;
  _$jscoverage['/base/selector.js'].lineData[289] = 0;
  _$jscoverage['/base/selector.js'].lineData[315] = 0;
  _$jscoverage['/base/selector.js'].lineData[327] = 0;
  _$jscoverage['/base/selector.js'].lineData[334] = 0;
  _$jscoverage['/base/selector.js'].lineData[335] = 0;
  _$jscoverage['/base/selector.js'].lineData[336] = 0;
  _$jscoverage['/base/selector.js'].lineData[339] = 0;
  _$jscoverage['/base/selector.js'].lineData[340] = 0;
  _$jscoverage['/base/selector.js'].lineData[341] = 0;
  _$jscoverage['/base/selector.js'].lineData[342] = 0;
  _$jscoverage['/base/selector.js'].lineData[345] = 0;
  _$jscoverage['/base/selector.js'].lineData[349] = 0;
  _$jscoverage['/base/selector.js'].lineData[351] = 0;
  _$jscoverage['/base/selector.js'].lineData[352] = 0;
  _$jscoverage['/base/selector.js'].lineData[354] = 0;
  _$jscoverage['/base/selector.js'].lineData[355] = 0;
  _$jscoverage['/base/selector.js'].lineData[356] = 0;
  _$jscoverage['/base/selector.js'].lineData[357] = 0;
  _$jscoverage['/base/selector.js'].lineData[358] = 0;
  _$jscoverage['/base/selector.js'].lineData[359] = 0;
  _$jscoverage['/base/selector.js'].lineData[361] = 0;
  _$jscoverage['/base/selector.js'].lineData[366] = 0;
  _$jscoverage['/base/selector.js'].lineData[379] = 0;
  _$jscoverage['/base/selector.js'].lineData[386] = 0;
  _$jscoverage['/base/selector.js'].lineData[389] = 0;
  _$jscoverage['/base/selector.js'].lineData[390] = 0;
  _$jscoverage['/base/selector.js'].lineData[391] = 0;
  _$jscoverage['/base/selector.js'].lineData[392] = 0;
  _$jscoverage['/base/selector.js'].lineData[393] = 0;
  _$jscoverage['/base/selector.js'].lineData[394] = 0;
  _$jscoverage['/base/selector.js'].lineData[398] = 0;
  _$jscoverage['/base/selector.js'].lineData[399] = 0;
  _$jscoverage['/base/selector.js'].lineData[403] = 0;
  _$jscoverage['/base/selector.js'].lineData[404] = 0;
  _$jscoverage['/base/selector.js'].lineData[407] = 0;
  _$jscoverage['/base/selector.js'].lineData[409] = 0;
  _$jscoverage['/base/selector.js'].lineData[410] = 0;
  _$jscoverage['/base/selector.js'].lineData[411] = 0;
  _$jscoverage['/base/selector.js'].lineData[416] = 0;
  _$jscoverage['/base/selector.js'].lineData[417] = 0;
  _$jscoverage['/base/selector.js'].lineData[419] = 0;
  _$jscoverage['/base/selector.js'].lineData[422] = 0;
  _$jscoverage['/base/selector.js'].lineData[434] = 0;
  _$jscoverage['/base/selector.js'].lineData[435] = 0;
  _$jscoverage['/base/selector.js'].lineData[439] = 0;
}
if (! _$jscoverage['/base/selector.js'].functionData) {
  _$jscoverage['/base/selector.js'].functionData = [];
  _$jscoverage['/base/selector.js'].functionData[0] = 0;
  _$jscoverage['/base/selector.js'].functionData[1] = 0;
  _$jscoverage['/base/selector.js'].functionData[2] = 0;
  _$jscoverage['/base/selector.js'].functionData[3] = 0;
  _$jscoverage['/base/selector.js'].functionData[4] = 0;
  _$jscoverage['/base/selector.js'].functionData[5] = 0;
  _$jscoverage['/base/selector.js'].functionData[6] = 0;
  _$jscoverage['/base/selector.js'].functionData[7] = 0;
  _$jscoverage['/base/selector.js'].functionData[8] = 0;
  _$jscoverage['/base/selector.js'].functionData[9] = 0;
  _$jscoverage['/base/selector.js'].functionData[10] = 0;
  _$jscoverage['/base/selector.js'].functionData[11] = 0;
  _$jscoverage['/base/selector.js'].functionData[12] = 0;
  _$jscoverage['/base/selector.js'].functionData[13] = 0;
  _$jscoverage['/base/selector.js'].functionData[14] = 0;
  _$jscoverage['/base/selector.js'].functionData[15] = 0;
  _$jscoverage['/base/selector.js'].functionData[16] = 0;
  _$jscoverage['/base/selector.js'].functionData[17] = 0;
  _$jscoverage['/base/selector.js'].functionData[18] = 0;
  _$jscoverage['/base/selector.js'].functionData[19] = 0;
  _$jscoverage['/base/selector.js'].functionData[20] = 0;
  _$jscoverage['/base/selector.js'].functionData[21] = 0;
  _$jscoverage['/base/selector.js'].functionData[22] = 0;
  _$jscoverage['/base/selector.js'].functionData[23] = 0;
  _$jscoverage['/base/selector.js'].functionData[24] = 0;
  _$jscoverage['/base/selector.js'].functionData[25] = 0;
  _$jscoverage['/base/selector.js'].functionData[26] = 0;
  _$jscoverage['/base/selector.js'].functionData[27] = 0;
  _$jscoverage['/base/selector.js'].functionData[28] = 0;
  _$jscoverage['/base/selector.js'].functionData[29] = 0;
}
if (! _$jscoverage['/base/selector.js'].branchData) {
  _$jscoverage['/base/selector.js'].branchData = {};
  _$jscoverage['/base/selector.js'].branchData['10'] = [];
  _$jscoverage['/base/selector.js'].branchData['10'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['11'] = [];
  _$jscoverage['/base/selector.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['12'] = [];
  _$jscoverage['/base/selector.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['13'] = [];
  _$jscoverage['/base/selector.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['29'] = [];
  _$jscoverage['/base/selector.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['35'] = [];
  _$jscoverage['/base/selector.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['37'] = [];
  _$jscoverage['/base/selector.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['37'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['49'] = [];
  _$jscoverage['/base/selector.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['50'] = [];
  _$jscoverage['/base/selector.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['58'] = [];
  _$jscoverage['/base/selector.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['66'] = [];
  _$jscoverage['/base/selector.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['68'] = [];
  _$jscoverage['/base/selector.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['78'] = [];
  _$jscoverage['/base/selector.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['105'] = [];
  _$jscoverage['/base/selector.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['106'] = [];
  _$jscoverage['/base/selector.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['106'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['110'] = [];
  _$jscoverage['/base/selector.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['112'] = [];
  _$jscoverage['/base/selector.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['115'] = [];
  _$jscoverage['/base/selector.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['117'] = [];
  _$jscoverage['/base/selector.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['119'] = [];
  _$jscoverage['/base/selector.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['122'] = [];
  _$jscoverage['/base/selector.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['125'] = [];
  _$jscoverage['/base/selector.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['125'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['126'] = [];
  _$jscoverage['/base/selector.js'].branchData['126'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['130'] = [];
  _$jscoverage['/base/selector.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['133'] = [];
  _$jscoverage['/base/selector.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['141'] = [];
  _$jscoverage['/base/selector.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['145'] = [];
  _$jscoverage['/base/selector.js'].branchData['145'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['151'] = [];
  _$jscoverage['/base/selector.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['158'] = [];
  _$jscoverage['/base/selector.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['162'] = [];
  _$jscoverage['/base/selector.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['162'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['166'] = [];
  _$jscoverage['/base/selector.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['168'] = [];
  _$jscoverage['/base/selector.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['172'] = [];
  _$jscoverage['/base/selector.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['181'] = [];
  _$jscoverage['/base/selector.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['183'] = [];
  _$jscoverage['/base/selector.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['186'] = [];
  _$jscoverage['/base/selector.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['191'] = [];
  _$jscoverage['/base/selector.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['202'] = [];
  _$jscoverage['/base/selector.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['207'] = [];
  _$jscoverage['/base/selector.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['208'] = [];
  _$jscoverage['/base/selector.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['209'] = [];
  _$jscoverage['/base/selector.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['227'] = [];
  _$jscoverage['/base/selector.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['228'] = [];
  _$jscoverage['/base/selector.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['228'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['229'] = [];
  _$jscoverage['/base/selector.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['233'] = [];
  _$jscoverage['/base/selector.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['234'] = [];
  _$jscoverage['/base/selector.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['241'] = [];
  _$jscoverage['/base/selector.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['241'][3] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['252'] = [];
  _$jscoverage['/base/selector.js'].branchData['252'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['279'] = [];
  _$jscoverage['/base/selector.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['281'] = [];
  _$jscoverage['/base/selector.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['315'] = [];
  _$jscoverage['/base/selector.js'].branchData['315'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['340'] = [];
  _$jscoverage['/base/selector.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['354'] = [];
  _$jscoverage['/base/selector.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['356'] = [];
  _$jscoverage['/base/selector.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['357'] = [];
  _$jscoverage['/base/selector.js'].branchData['357'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['386'] = [];
  _$jscoverage['/base/selector.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['386'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['387'] = [];
  _$jscoverage['/base/selector.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['392'] = [];
  _$jscoverage['/base/selector.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['398'] = [];
  _$jscoverage['/base/selector.js'].branchData['398'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['403'] = [];
  _$jscoverage['/base/selector.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['407'] = [];
  _$jscoverage['/base/selector.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['409'] = [];
  _$jscoverage['/base/selector.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['409'][2] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['411'] = [];
  _$jscoverage['/base/selector.js'].branchData['411'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['416'] = [];
  _$jscoverage['/base/selector.js'].branchData['416'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['435'] = [];
  _$jscoverage['/base/selector.js'].branchData['435'][1] = new BranchData();
  _$jscoverage['/base/selector.js'].branchData['435'][2] = new BranchData();
}
_$jscoverage['/base/selector.js'].branchData['435'][2].init(103, 64, 'Dom.filter(elements, filter, context).length === elements.length');
function visit401_435_2(result) {
  _$jscoverage['/base/selector.js'].branchData['435'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['435'][1].init(83, 85, 'elements.length && (Dom.filter(elements, filter, context).length === elements.length)');
function visit400_435_1(result) {
  _$jscoverage['/base/selector.js'].branchData['435'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['416'][1].init(1352, 28, 'typeof filter === \'function\'');
function visit399_416_1(result) {
  _$jscoverage['/base/selector.js'].branchData['416'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['411'][1].init(37, 26, 'getAttr(elem, \'id\') === id');
function visit398_411_1(result) {
  _$jscoverage['/base/selector.js'].branchData['411'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['409'][2].init(773, 12, '!tag && !cls');
function visit397_409_2(result) {
  _$jscoverage['/base/selector.js'].branchData['409'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['409'][1].init(767, 18, 'id && !tag && !cls');
function visit396_409_1(result) {
  _$jscoverage['/base/selector.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['407'][1].init(496, 14, 'clsRe && tagRe');
function visit395_407_1(result) {
  _$jscoverage['/base/selector.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['403'][1].init(352, 3, 'cls');
function visit394_403_1(result) {
  _$jscoverage['/base/selector.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['398'][1].init(175, 3, 'tag');
function visit393_398_1(result) {
  _$jscoverage['/base/selector.js'].branchData['398'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['392'][1].init(136, 3, '!id');
function visit392_392_1(result) {
  _$jscoverage['/base/selector.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['387'][1].init(51, 85, '(filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit391_387_1(result) {
  _$jscoverage['/base/selector.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['386'][2].init(215, 26, 'typeof filter === \'string\'');
function visit390_386_2(result) {
  _$jscoverage['/base/selector.js'].branchData['386'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['386'][1].init(215, 137, 'typeof filter === \'string\' && (filter = trim(filter)) && (match = rSimpleSelector.exec(filter))');
function visit389_386_1(result) {
  _$jscoverage['/base/selector.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['357'][1].init(34, 33, 'elements[i] === elements[i - 1]');
function visit388_357_1(result) {
  _$jscoverage['/base/selector.js'].branchData['357'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['356'][1].init(92, 7, 'i < len');
function visit387_356_1(result) {
  _$jscoverage['/base/selector.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['354'][1].init(131, 12, 'hasDuplicate');
function visit386_354_1(result) {
  _$jscoverage['/base/selector.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['340'][1].init(26, 7, 'a === b');
function visit385_340_1(result) {
  _$jscoverage['/base/selector.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['315'][1].init(25, 35, 'query(selector, context)[0] || null');
function visit384_315_1(result) {
  _$jscoverage['/base/selector.js'].branchData['315'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['281'][1].init(61, 20, 'matches.call(n, str)');
function visit383_281_1(result) {
  _$jscoverage['/base/selector.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['279'][1].init(149, 7, 'i < len');
function visit382_279_1(result) {
  _$jscoverage['/base/selector.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['252'][1].init(22, 56, '!a.compareDocumentPosition || !b.compareDocumentPosition');
function visit381_252_1(result) {
  _$jscoverage['/base/selector.js'].branchData['252'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['241'][3].init(34, 49, 'el.nodeName.toLowerCase() === value.toLowerCase()');
function visit380_241_3(result) {
  _$jscoverage['/base/selector.js'].branchData['241'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['241'][2].init(17, 13, 'value === \'*\'');
function visit379_241_2(result) {
  _$jscoverage['/base/selector.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['241'][1].init(17, 66, 'value === \'*\' || el.nodeName.toLowerCase() === value.toLowerCase()');
function visit378_241_1(result) {
  _$jscoverage['/base/selector.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['234'][1].init(66, 20, 'ret && ret.specified');
function visit377_234_1(result) {
  _$jscoverage['/base/selector.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['233'][1].init(20, 31, 'el && el.getAttributeNode(name)');
function visit376_233_1(result) {
  _$jscoverage['/base/selector.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['229'][1].init(67, 60, '(SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit375_229_1(result) {
  _$jscoverage['/base/selector.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['228'][2].init(167, 128, '(className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit374_228_2(result) {
  _$jscoverage['/base/selector.js'].branchData['228'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['228'][1].init(153, 142, 'className && (className = className.replace(/[\\r\\t\\n]/g, SPACE)) && (SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1');
function visit373_228_1(result) {
  _$jscoverage['/base/selector.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['227'][1].init(109, 26, 'el && getAttr(el, \'class\')');
function visit372_227_1(result) {
  _$jscoverage['/base/selector.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['209'][1].init(30, 35, 'Dom._contains(contexts[ci], tmp[i])');
function visit371_209_1(result) {
  _$jscoverage['/base/selector.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['208'][1].init(35, 16, 'ci < contextsLen');
function visit370_208_1(result) {
  _$jscoverage['/base/selector.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['207'][1].init(153, 7, 'i < len');
function visit369_207_1(result) {
  _$jscoverage['/base/selector.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['202'][1].init(1049, 14, '!simpleContext');
function visit368_202_1(result) {
  _$jscoverage['/base/selector.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['191'][1].init(651, 23, 'isDomNodeList(selector)');
function visit367_191_1(result) {
  _$jscoverage['/base/selector.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['186'][1].init(455, 17, 'isArray(selector)');
function visit366_186_1(result) {
  _$jscoverage['/base/selector.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['183'][1].init(309, 20, 'selector.getDOMNodes');
function visit365_183_1(result) {
  _$jscoverage['/base/selector.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['181'][1].init(204, 41, 'selector.nodeType || S.isWindow(selector)');
function visit364_181_1(result) {
  _$jscoverage['/base/selector.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['172'][3].init(266, 15, 'contextsLen > 1');
function visit363_172_3(result) {
  _$jscoverage['/base/selector.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['172'][2].init(248, 14, 'ret.length > 1');
function visit362_172_2(result) {
  _$jscoverage['/base/selector.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['172'][1].init(248, 33, 'ret.length > 1 && contextsLen > 1');
function visit361_172_1(result) {
  _$jscoverage['/base/selector.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['168'][1].init(57, 15, 'i < contextsLen');
function visit360_168_1(result) {
  _$jscoverage['/base/selector.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['166'][1].init(2331, 4, '!ret');
function visit359_166_1(result) {
  _$jscoverage['/base/selector.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['162'][2].init(1209, 18, 'parents.length > 1');
function visit358_162_2(result) {
  _$jscoverage['/base/selector.js'].branchData['162'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['162'][1].init(1198, 29, 'parents && parents.length > 1');
function visit357_162_1(result) {
  _$jscoverage['/base/selector.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['158'][1].init(568, 15, '!parents.length');
function visit356_158_1(result) {
  _$jscoverage['/base/selector.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['151'][1].init(80, 24, 'parentIndex < parentsLen');
function visit355_151_1(result) {
  _$jscoverage['/base/selector.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['145'][1].init(478, 12, 'i < partsLen');
function visit354_145_1(result) {
  _$jscoverage['/base/selector.js'].branchData['145'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['141'][1].init(317, 12, 'i < partsLen');
function visit353_141_1(result) {
  _$jscoverage['/base/selector.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['133'][1].init(917, 26, 'isSimpleSelector(selector)');
function visit352_133_1(result) {
  _$jscoverage['/base/selector.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['130'][1].init(755, 27, 'rTagSelector.test(selector)');
function visit351_130_1(result) {
  _$jscoverage['/base/selector.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['126'][1].init(553, 26, 'rIdSelector.test(selector)');
function visit350_126_1(result) {
  _$jscoverage['/base/selector.js'].branchData['126'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['125'][2].init(128, 39, 'el.nodeName.toLowerCase() === RegExp.$1');
function visit349_125_2(result) {
  _$jscoverage['/base/selector.js'].branchData['125'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['125'][1].init(122, 45, 'el && el.nodeName.toLowerCase() === RegExp.$1');
function visit348_125_1(result) {
  _$jscoverage['/base/selector.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['122'][1].init(311, 29, 'rTagIdSelector.test(selector)');
function visit347_122_1(result) {
  _$jscoverage['/base/selector.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['119'][1].init(142, 29, 'rClassSelector.test(selector)');
function visit346_119_1(result) {
  _$jscoverage['/base/selector.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['117'][1].init(51, 19, 'selector === \'body\'');
function visit345_117_1(result) {
  _$jscoverage['/base/selector.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['115'][1].init(60, 13, 'simpleContext');
function visit344_115_1(result) {
  _$jscoverage['/base/selector.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['112'][1].init(370, 16, 'isSelectorString');
function visit343_112_1(result) {
  _$jscoverage['/base/selector.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['110'][1].init(313, 9, '!selector');
function visit342_110_1(result) {
  _$jscoverage['/base/selector.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['106'][2].init(197, 27, '(simpleContext = 1) && [doc]');
function visit341_106_2(result) {
  _$jscoverage['/base/selector.js'].branchData['106'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['106'][1].init(155, 21, 'context !== undefined');
function visit340_106_1(result) {
  _$jscoverage['/base/selector.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['105'][1].init(101, 28, 'typeof selector === \'string\'');
function visit339_105_1(result) {
  _$jscoverage['/base/selector.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['78'][1].init(76, 35, 'match && Dom._contains(elem, match)');
function visit338_78_1(result) {
  _$jscoverage['/base/selector.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['68'][1].init(152, 9, 's === \'.\'');
function visit337_68_1(result) {
  _$jscoverage['/base/selector.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['66'][1].init(51, 9, 's === \'#\'');
function visit336_66_1(result) {
  _$jscoverage['/base/selector.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['58'][1].init(54, 5, '!name');
function visit335_58_1(result) {
  _$jscoverage['/base/selector.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['50'][1].init(18, 23, 'f(self[i], i) === false');
function visit334_50_1(result) {
  _$jscoverage['/base/selector.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['49'][1].init(94, 5, 'i < l');
function visit333_49_1(result) {
  _$jscoverage['/base/selector.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['37'][2].init(67, 44, 'elem.className || elem.getAttribute(\'class\')');
function visit332_37_2(result) {
  _$jscoverage['/base/selector.js'].branchData['37'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['37'][1].init(60, 79, '(\' \' + (elem.className || elem.getAttribute(\'class\')) + \' \').indexOf(match) > -1');
function visit331_37_1(result) {
  _$jscoverage['/base/selector.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['35'][1].init(180, 19, 'i < elements.length');
function visit330_35_1(result) {
  _$jscoverage['/base/selector.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['29'][1].init(898, 30, '!supportGetElementsByClassName');
function visit329_29_1(result) {
  _$jscoverage['/base/selector.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['13'][1].init(42, 66, 'docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit328_13_1(result) {
  _$jscoverage['/base/selector.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['12'][1].init(45, 109, 'docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit327_12_1(result) {
  _$jscoverage['/base/selector.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['11'][1].init(31, 155, 'docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit326_11_1(result) {
  _$jscoverage['/base/selector.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].branchData['10'][1].init(89, 187, 'docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector');
function visit325_10_1(result) {
  _$jscoverage['/base/selector.js'].branchData['10'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/selector.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/selector.js'].functionData[0]++;
  _$jscoverage['/base/selector.js'].lineData[7]++;
  var Dom = require('./api');
  _$jscoverage['/base/selector.js'].lineData[8]++;
  var doc = S.Env.host.document, docElem = doc.documentElement, matches = visit325_10_1(docElem.matches || visit326_11_1(docElem.webkitMatchesSelector || visit327_12_1(docElem.mozMatchesSelector || visit328_13_1(docElem.oMatchesSelector || docElem.msMatchesSelector)))), supportGetElementsByClassName = 'getElementsByClassName' in doc, getElementsByClassName = doc.getElementsByClassName, isArray = S.isArray, makeArray = S.makeArray, isDomNodeList = Dom.isDomNodeList, SPACE = ' ', push = Array.prototype.push, rClassSelector = /^\.([\w-]+)$/, rIdSelector = /^#([\w-]+)$/, rTagSelector = /^([\w-])+$/, rTagIdSelector = /^([\w-]+)#([\w-]+)$/, rSimpleSelector = /^(?:#([\w-]+))?\s*([\w-]+|\*)?\.?([\w-]+)?$/, trim = S.trim;
  _$jscoverage['/base/selector.js'].lineData[29]++;
  if (visit329_29_1(!supportGetElementsByClassName)) {
    _$jscoverage['/base/selector.js'].lineData[30]++;
    getElementsByClassName = function(el, match) {
  _$jscoverage['/base/selector.js'].functionData[1]++;
  _$jscoverage['/base/selector.js'].lineData[31]++;
  var result = [], elements = el.getElementsByTagName('*'), i, elem;
  _$jscoverage['/base/selector.js'].lineData[34]++;
  match = ' ' + match + ' ';
  _$jscoverage['/base/selector.js'].lineData[35]++;
  for (i = 0; visit330_35_1(i < elements.length); i++) {
    _$jscoverage['/base/selector.js'].lineData[36]++;
    elem = elements[i];
    _$jscoverage['/base/selector.js'].lineData[37]++;
    if (visit331_37_1((' ' + (visit332_37_2(elem.className || elem.getAttribute('class'))) + ' ').indexOf(match) > -1)) {
      _$jscoverage['/base/selector.js'].lineData[38]++;
      result.push(elem);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[41]++;
  return result;
};
  }
  _$jscoverage['/base/selector.js'].lineData[45]++;
  function queryEach(f) {
    _$jscoverage['/base/selector.js'].functionData[2]++;
    _$jscoverage['/base/selector.js'].lineData[46]++;
    var self = this, l = self.length, i;
    _$jscoverage['/base/selector.js'].lineData[49]++;
    for (i = 0; visit333_49_1(i < l); i++) {
      _$jscoverage['/base/selector.js'].lineData[50]++;
      if (visit334_50_1(f(self[i], i) === false)) {
        _$jscoverage['/base/selector.js'].lineData[51]++;
        break;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[56]++;
  function checkSelectorAndReturn(selector) {
    _$jscoverage['/base/selector.js'].functionData[3]++;
    _$jscoverage['/base/selector.js'].lineData[57]++;
    var name = selector.substr(1);
    _$jscoverage['/base/selector.js'].lineData[58]++;
    if (visit335_58_1(!name)) {
      _$jscoverage['/base/selector.js'].lineData[59]++;
      throw new Error('An invalid or illegal string was specified for selector.');
    }
    _$jscoverage['/base/selector.js'].lineData[61]++;
    return name;
  }
  _$jscoverage['/base/selector.js'].lineData[64]++;
  function makeMatch(selector) {
    _$jscoverage['/base/selector.js'].functionData[4]++;
    _$jscoverage['/base/selector.js'].lineData[65]++;
    var s = selector.charAt(0);
    _$jscoverage['/base/selector.js'].lineData[66]++;
    if (visit336_66_1(s === '#')) {
      _$jscoverage['/base/selector.js'].lineData[67]++;
      return makeIdMatch(checkSelectorAndReturn(selector));
    } else {
      _$jscoverage['/base/selector.js'].lineData[68]++;
      if (visit337_68_1(s === '.')) {
        _$jscoverage['/base/selector.js'].lineData[69]++;
        return makeClassMatch(checkSelectorAndReturn(selector));
      } else {
        _$jscoverage['/base/selector.js'].lineData[71]++;
        return makeTagMatch(selector);
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[75]++;
  function makeIdMatch(id) {
    _$jscoverage['/base/selector.js'].functionData[5]++;
    _$jscoverage['/base/selector.js'].lineData[76]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[6]++;
  _$jscoverage['/base/selector.js'].lineData[77]++;
  var match = Dom._getElementById(id, doc);
  _$jscoverage['/base/selector.js'].lineData[78]++;
  return visit338_78_1(match && Dom._contains(elem, match)) ? [match] : [];
};
  }
  _$jscoverage['/base/selector.js'].lineData[82]++;
  function makeClassMatch(className) {
    _$jscoverage['/base/selector.js'].functionData[7]++;
    _$jscoverage['/base/selector.js'].lineData[83]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[8]++;
  _$jscoverage['/base/selector.js'].lineData[84]++;
  return getElementsByClassName(elem, className);
};
  }
  _$jscoverage['/base/selector.js'].lineData[88]++;
  function makeTagMatch(tagName) {
    _$jscoverage['/base/selector.js'].functionData[9]++;
    _$jscoverage['/base/selector.js'].lineData[89]++;
    return function(elem) {
  _$jscoverage['/base/selector.js'].functionData[10]++;
  _$jscoverage['/base/selector.js'].lineData[90]++;
  return elem.getElementsByTagName(tagName);
};
  }
  _$jscoverage['/base/selector.js'].lineData[95]++;
  function isSimpleSelector(selector) {
    _$jscoverage['/base/selector.js'].functionData[11]++;
    _$jscoverage['/base/selector.js'].lineData[96]++;
    var complexReg = /,|\+|=|~|\[|\]|:|>|\||\$|\^|\*|\(|\)|[\w-]+\.[\w-]+|[\w-]+#[\w-]+/;
    _$jscoverage['/base/selector.js'].lineData[97]++;
    return !selector.match(complexReg);
  }
  _$jscoverage['/base/selector.js'].lineData[100]++;
  function query(selector, context) {
    _$jscoverage['/base/selector.js'].functionData[12]++;
    _$jscoverage['/base/selector.js'].lineData[101]++;
    var ret, i, el, simpleContext, isSelectorString = visit339_105_1(typeof selector === 'string'), contexts = visit340_106_1(context !== undefined) ? query(context) : visit341_106_2((simpleContext = 1) && [doc]), contextsLen = contexts.length;
    _$jscoverage['/base/selector.js'].lineData[110]++;
    if (visit342_110_1(!selector)) {
      _$jscoverage['/base/selector.js'].lineData[111]++;
      ret = [];
    } else {
      _$jscoverage['/base/selector.js'].lineData[112]++;
      if (visit343_112_1(isSelectorString)) {
        _$jscoverage['/base/selector.js'].lineData[113]++;
        selector = trim(selector);
        _$jscoverage['/base/selector.js'].lineData[115]++;
        if (visit344_115_1(simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[117]++;
          if (visit345_117_1(selector === 'body')) {
            _$jscoverage['/base/selector.js'].lineData[118]++;
            ret = [doc.body];
          } else {
            _$jscoverage['/base/selector.js'].lineData[119]++;
            if (visit346_119_1(rClassSelector.test(selector))) {
              _$jscoverage['/base/selector.js'].lineData[121]++;
              ret = makeArray(getElementsByClassName(doc, RegExp.$1));
            } else {
              _$jscoverage['/base/selector.js'].lineData[122]++;
              if (visit347_122_1(rTagIdSelector.test(selector))) {
                _$jscoverage['/base/selector.js'].lineData[124]++;
                el = Dom._getElementById(RegExp.$2, doc);
                _$jscoverage['/base/selector.js'].lineData[125]++;
                ret = visit348_125_1(el && visit349_125_2(el.nodeName.toLowerCase() === RegExp.$1)) ? [el] : [];
              } else {
                _$jscoverage['/base/selector.js'].lineData[126]++;
                if (visit350_126_1(rIdSelector.test(selector))) {
                  _$jscoverage['/base/selector.js'].lineData[128]++;
                  el = Dom._getElementById(selector.substr(1), doc);
                  _$jscoverage['/base/selector.js'].lineData[129]++;
                  ret = el ? [el] : [];
                } else {
                  _$jscoverage['/base/selector.js'].lineData[130]++;
                  if (visit351_130_1(rTagSelector.test(selector))) {
                    _$jscoverage['/base/selector.js'].lineData[132]++;
                    ret = makeArray(doc.getElementsByTagName(selector));
                  } else {
                    _$jscoverage['/base/selector.js'].lineData[133]++;
                    if (visit352_133_1(isSimpleSelector(selector))) {
                      _$jscoverage['/base/selector.js'].lineData[135]++;
                      var parts = selector.split(/\s+/), partsLen, parents = contexts, parentIndex, parentsLen;
                      _$jscoverage['/base/selector.js'].lineData[141]++;
                      for (i = 0 , partsLen = parts.length; visit353_141_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[142]++;
                        parts[i] = makeMatch(parts[i]);
                      }
                      _$jscoverage['/base/selector.js'].lineData[145]++;
                      for (i = 0 , partsLen = parts.length; visit354_145_1(i < partsLen); i++) {
                        _$jscoverage['/base/selector.js'].lineData[146]++;
                        var part = parts[i], newParents = [], matches;
                        _$jscoverage['/base/selector.js'].lineData[150]++;
                        for (parentIndex = 0 , parentsLen = parents.length; visit355_151_1(parentIndex < parentsLen); parentIndex++) {
                          _$jscoverage['/base/selector.js'].lineData[153]++;
                          matches = part(parents[parentIndex]);
                          _$jscoverage['/base/selector.js'].lineData[154]++;
                          newParents.push.apply(newParents, makeArray(matches));
                        }
                        _$jscoverage['/base/selector.js'].lineData[157]++;
                        parents = newParents;
                        _$jscoverage['/base/selector.js'].lineData[158]++;
                        if (visit356_158_1(!parents.length)) {
                          _$jscoverage['/base/selector.js'].lineData[159]++;
                          break;
                        }
                      }
                      _$jscoverage['/base/selector.js'].lineData[162]++;
                      ret = visit357_162_1(parents && visit358_162_2(parents.length > 1)) ? Dom.unique(parents) : parents;
                    }
                  }
                }
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[166]++;
        if (visit359_166_1(!ret)) {
          _$jscoverage['/base/selector.js'].lineData[167]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[168]++;
          for (i = 0; visit360_168_1(i < contextsLen); i++) {
            _$jscoverage['/base/selector.js'].lineData[169]++;
            push.apply(ret, Dom._selectInternal(selector, contexts[i]));
          }
          _$jscoverage['/base/selector.js'].lineData[172]++;
          if (visit361_172_1(visit362_172_2(ret.length > 1) && visit363_172_3(contextsLen > 1))) {
            _$jscoverage['/base/selector.js'].lineData[173]++;
            Dom.unique(ret);
          }
        }
      } else {
        _$jscoverage['/base/selector.js'].lineData[181]++;
        if (visit364_181_1(selector.nodeType || S.isWindow(selector))) {
          _$jscoverage['/base/selector.js'].lineData[182]++;
          ret = [selector];
        } else {
          _$jscoverage['/base/selector.js'].lineData[183]++;
          if (visit365_183_1(selector.getDOMNodes)) {
            _$jscoverage['/base/selector.js'].lineData[185]++;
            ret = selector.getDOMNodes();
          } else {
            _$jscoverage['/base/selector.js'].lineData[186]++;
            if (visit366_186_1(isArray(selector))) {
              _$jscoverage['/base/selector.js'].lineData[190]++;
              ret = selector;
            } else {
              _$jscoverage['/base/selector.js'].lineData[191]++;
              if (visit367_191_1(isDomNodeList(selector))) {
                _$jscoverage['/base/selector.js'].lineData[197]++;
                ret = makeArray(selector);
              } else {
                _$jscoverage['/base/selector.js'].lineData[199]++;
                ret = [selector];
              }
            }
          }
        }
        _$jscoverage['/base/selector.js'].lineData[202]++;
        if (visit368_202_1(!simpleContext)) {
          _$jscoverage['/base/selector.js'].lineData[203]++;
          var tmp = ret, ci, len = tmp.length;
          _$jscoverage['/base/selector.js'].lineData[206]++;
          ret = [];
          _$jscoverage['/base/selector.js'].lineData[207]++;
          for (i = 0; visit369_207_1(i < len); i++) {
            _$jscoverage['/base/selector.js'].lineData[208]++;
            for (ci = 0; visit370_208_1(ci < contextsLen); ci++) {
              _$jscoverage['/base/selector.js'].lineData[209]++;
              if (visit371_209_1(Dom._contains(contexts[ci], tmp[i]))) {
                _$jscoverage['/base/selector.js'].lineData[210]++;
                ret.push(tmp[i]);
                _$jscoverage['/base/selector.js'].lineData[211]++;
                break;
              }
            }
          }
        }
      }
    }
    _$jscoverage['/base/selector.js'].lineData[219]++;
    ret.each = queryEach;
    _$jscoverage['/base/selector.js'].lineData[221]++;
    return ret;
  }
  _$jscoverage['/base/selector.js'].lineData[224]++;
  function hasSingleClass(el, cls) {
    _$jscoverage['/base/selector.js'].functionData[13]++;
    _$jscoverage['/base/selector.js'].lineData[227]++;
    var className = visit372_227_1(el && getAttr(el, 'class'));
    _$jscoverage['/base/selector.js'].lineData[228]++;
    return visit373_228_1(className && visit374_228_2((className = className.replace(/[\r\t\n]/g, SPACE)) && visit375_229_1((SPACE + className + SPACE).indexOf(SPACE + cls + SPACE) > -1)));
  }
  _$jscoverage['/base/selector.js'].lineData[232]++;
  function getAttr(el, name) {
    _$jscoverage['/base/selector.js'].functionData[14]++;
    _$jscoverage['/base/selector.js'].lineData[233]++;
    var ret = visit376_233_1(el && el.getAttributeNode(name));
    _$jscoverage['/base/selector.js'].lineData[234]++;
    if (visit377_234_1(ret && ret.specified)) {
      _$jscoverage['/base/selector.js'].lineData[235]++;
      return ret.nodeValue;
    }
    _$jscoverage['/base/selector.js'].lineData[237]++;
    return undefined;
  }
  _$jscoverage['/base/selector.js'].lineData[240]++;
  function isTag(el, value) {
    _$jscoverage['/base/selector.js'].functionData[15]++;
    _$jscoverage['/base/selector.js'].lineData[241]++;
    return visit378_241_1(visit379_241_2(value === '*') || visit380_241_3(el.nodeName.toLowerCase() === value.toLowerCase()));
  }
  _$jscoverage['/base/selector.js'].lineData[244]++;
  S.mix(Dom, {
  _compareNodeOrder: function(a, b) {
  _$jscoverage['/base/selector.js'].functionData[16]++;
  _$jscoverage['/base/selector.js'].lineData[252]++;
  if (visit381_252_1(!a.compareDocumentPosition || !b.compareDocumentPosition)) {
    _$jscoverage['/base/selector.js'].lineData[253]++;
    return a.compareDocumentPosition ? -1 : 1;
  }
  _$jscoverage['/base/selector.js'].lineData[255]++;
  var bit = a.compareDocumentPosition(b) & 4;
  _$jscoverage['/base/selector.js'].lineData[256]++;
  return bit ? -1 : 1;
}, 
  _getElementsByTagName: function(name, context) {
  _$jscoverage['/base/selector.js'].functionData[17]++;
  _$jscoverage['/base/selector.js'].lineData[261]++;
  return makeArray(context.querySelectorAll(name));
}, 
  _getElementById: function(id, doc) {
  _$jscoverage['/base/selector.js'].functionData[18]++;
  _$jscoverage['/base/selector.js'].lineData[265]++;
  return doc.getElementById(id);
}, 
  _getSimpleAttr: getAttr, 
  _isTag: isTag, 
  _hasSingleClass: hasSingleClass, 
  _matchesInternal: function(str, seeds) {
  _$jscoverage['/base/selector.js'].functionData[19]++;
  _$jscoverage['/base/selector.js'].lineData[275]++;
  var ret = [], i = 0, n, len = seeds.length;
  _$jscoverage['/base/selector.js'].lineData[279]++;
  for (; visit382_279_1(i < len); i++) {
    _$jscoverage['/base/selector.js'].lineData[280]++;
    n = seeds[i];
    _$jscoverage['/base/selector.js'].lineData[281]++;
    if (visit383_281_1(matches.call(n, str))) {
      _$jscoverage['/base/selector.js'].lineData[282]++;
      ret.push(n);
    }
  }
  _$jscoverage['/base/selector.js'].lineData[285]++;
  return ret;
}, 
  _selectInternal: function(str, context) {
  _$jscoverage['/base/selector.js'].functionData[20]++;
  _$jscoverage['/base/selector.js'].lineData[289]++;
  return makeArray(context.querySelectorAll(str));
}, 
  query: query, 
  get: function(selector, context) {
  _$jscoverage['/base/selector.js'].functionData[21]++;
  _$jscoverage['/base/selector.js'].lineData[315]++;
  return visit384_315_1(query(selector, context)[0] || null);
}, 
  unique: (function() {
  _$jscoverage['/base/selector.js'].functionData[22]++;
  _$jscoverage['/base/selector.js'].lineData[327]++;
  var hasDuplicate, baseHasDuplicate = true;
  _$jscoverage['/base/selector.js'].lineData[334]++;
  [0, 0].sort(function() {
  _$jscoverage['/base/selector.js'].functionData[23]++;
  _$jscoverage['/base/selector.js'].lineData[335]++;
  baseHasDuplicate = false;
  _$jscoverage['/base/selector.js'].lineData[336]++;
  return 0;
});
  _$jscoverage['/base/selector.js'].lineData[339]++;
  function sortOrder(a, b) {
    _$jscoverage['/base/selector.js'].functionData[24]++;
    _$jscoverage['/base/selector.js'].lineData[340]++;
    if (visit385_340_1(a === b)) {
      _$jscoverage['/base/selector.js'].lineData[341]++;
      hasDuplicate = true;
      _$jscoverage['/base/selector.js'].lineData[342]++;
      return 0;
    }
    _$jscoverage['/base/selector.js'].lineData[345]++;
    return Dom._compareNodeOrder(a, b);
  }
  _$jscoverage['/base/selector.js'].lineData[349]++;
  return function(elements) {
  _$jscoverage['/base/selector.js'].functionData[25]++;
  _$jscoverage['/base/selector.js'].lineData[351]++;
  hasDuplicate = baseHasDuplicate;
  _$jscoverage['/base/selector.js'].lineData[352]++;
  elements.sort(sortOrder);
  _$jscoverage['/base/selector.js'].lineData[354]++;
  if (visit386_354_1(hasDuplicate)) {
    _$jscoverage['/base/selector.js'].lineData[355]++;
    var i = 1, len = elements.length;
    _$jscoverage['/base/selector.js'].lineData[356]++;
    while (visit387_356_1(i < len)) {
      _$jscoverage['/base/selector.js'].lineData[357]++;
      if (visit388_357_1(elements[i] === elements[i - 1])) {
        _$jscoverage['/base/selector.js'].lineData[358]++;
        elements.splice(i, 1);
        _$jscoverage['/base/selector.js'].lineData[359]++;
        --len;
      } else {
        _$jscoverage['/base/selector.js'].lineData[361]++;
        i++;
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[366]++;
  return elements;
};
})(), 
  filter: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[26]++;
  _$jscoverage['/base/selector.js'].lineData[379]++;
  var elems = query(selector, context), id, tag, match, cls, ret = [];
  _$jscoverage['/base/selector.js'].lineData[386]++;
  if (visit389_386_1(visit390_386_2(typeof filter === 'string') && visit391_387_1((filter = trim(filter)) && (match = rSimpleSelector.exec(filter))))) {
    _$jscoverage['/base/selector.js'].lineData[389]++;
    id = match[1];
    _$jscoverage['/base/selector.js'].lineData[390]++;
    tag = match[2];
    _$jscoverage['/base/selector.js'].lineData[391]++;
    cls = match[3];
    _$jscoverage['/base/selector.js'].lineData[392]++;
    if (visit392_392_1(!id)) {
      _$jscoverage['/base/selector.js'].lineData[393]++;
      filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[27]++;
  _$jscoverage['/base/selector.js'].lineData[394]++;
  var tagRe = true, clsRe = true;
  _$jscoverage['/base/selector.js'].lineData[398]++;
  if (visit393_398_1(tag)) {
    _$jscoverage['/base/selector.js'].lineData[399]++;
    tagRe = isTag(elem, tag);
  }
  _$jscoverage['/base/selector.js'].lineData[403]++;
  if (visit394_403_1(cls)) {
    _$jscoverage['/base/selector.js'].lineData[404]++;
    clsRe = hasSingleClass(elem, cls);
  }
  _$jscoverage['/base/selector.js'].lineData[407]++;
  return visit395_407_1(clsRe && tagRe);
};
    } else {
      _$jscoverage['/base/selector.js'].lineData[409]++;
      if (visit396_409_1(id && visit397_409_2(!tag && !cls))) {
        _$jscoverage['/base/selector.js'].lineData[410]++;
        filter = function(elem) {
  _$jscoverage['/base/selector.js'].functionData[28]++;
  _$jscoverage['/base/selector.js'].lineData[411]++;
  return visit398_411_1(getAttr(elem, 'id') === id);
};
      }
    }
  }
  _$jscoverage['/base/selector.js'].lineData[416]++;
  if (visit399_416_1(typeof filter === 'function')) {
    _$jscoverage['/base/selector.js'].lineData[417]++;
    ret = S.filter(elems, filter);
  } else {
    _$jscoverage['/base/selector.js'].lineData[419]++;
    ret = Dom._matchesInternal(filter, elems);
  }
  _$jscoverage['/base/selector.js'].lineData[422]++;
  return ret;
}, 
  test: function(selector, filter, context) {
  _$jscoverage['/base/selector.js'].functionData[29]++;
  _$jscoverage['/base/selector.js'].lineData[434]++;
  var elements = query(selector, context);
  _$jscoverage['/base/selector.js'].lineData[435]++;
  return visit400_435_1(elements.length && (visit401_435_2(Dom.filter(elements, filter, context).length === elements.length)));
}});
  _$jscoverage['/base/selector.js'].lineData[439]++;
  return Dom;
});
