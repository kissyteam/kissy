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
  _$jscoverage['/base.js'].lineData[20] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[29] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[33] = 0;
  _$jscoverage['/base.js'].lineData[62] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[64] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[67] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[71] = 0;
  _$jscoverage['/base.js'].lineData[72] = 0;
  _$jscoverage['/base.js'].lineData[73] = 0;
  _$jscoverage['/base.js'].lineData[74] = 0;
  _$jscoverage['/base.js'].lineData[75] = 0;
  _$jscoverage['/base.js'].lineData[77] = 0;
  _$jscoverage['/base.js'].lineData[78] = 0;
  _$jscoverage['/base.js'].lineData[83] = 0;
  _$jscoverage['/base.js'].lineData[84] = 0;
  _$jscoverage['/base.js'].lineData[86] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[92] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[96] = 0;
  _$jscoverage['/base.js'].lineData[97] = 0;
  _$jscoverage['/base.js'].lineData[100] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[104] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[112] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[115] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[122] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[124] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[127] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[139] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[153] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[159] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[178] = 0;
  _$jscoverage['/base.js'].lineData[183] = 0;
  _$jscoverage['/base.js'].lineData[185] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[194] = 0;
  _$jscoverage['/base.js'].lineData[195] = 0;
  _$jscoverage['/base.js'].lineData[197] = 0;
  _$jscoverage['/base.js'].lineData[198] = 0;
  _$jscoverage['/base.js'].lineData[200] = 0;
  _$jscoverage['/base.js'].lineData[201] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[209] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[214] = 0;
  _$jscoverage['/base.js'].lineData[216] = 0;
  _$jscoverage['/base.js'].lineData[217] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[228] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[230] = 0;
  _$jscoverage['/base.js'].lineData[231] = 0;
  _$jscoverage['/base.js'].lineData[232] = 0;
  _$jscoverage['/base.js'].lineData[235] = 0;
  _$jscoverage['/base.js'].lineData[236] = 0;
  _$jscoverage['/base.js'].lineData[245] = 0;
  _$jscoverage['/base.js'].lineData[253] = 0;
  _$jscoverage['/base.js'].lineData[261] = 0;
  _$jscoverage['/base.js'].lineData[262] = 0;
  _$jscoverage['/base.js'].lineData[264] = 0;
  _$jscoverage['/base.js'].lineData[265] = 0;
  _$jscoverage['/base.js'].lineData[266] = 0;
  _$jscoverage['/base.js'].lineData[267] = 0;
  _$jscoverage['/base.js'].lineData[268] = 0;
  _$jscoverage['/base.js'].lineData[269] = 0;
  _$jscoverage['/base.js'].lineData[271] = 0;
  _$jscoverage['/base.js'].lineData[274] = 0;
  _$jscoverage['/base.js'].lineData[296] = 0;
  _$jscoverage['/base.js'].lineData[297] = 0;
  _$jscoverage['/base.js'].lineData[299] = 0;
  _$jscoverage['/base.js'].lineData[300] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[308] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[326] = 0;
  _$jscoverage['/base.js'].lineData[330] = 0;
  _$jscoverage['/base.js'].lineData[331] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[335] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[340] = 0;
  _$jscoverage['/base.js'].lineData[349] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[358] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[360] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[368] = 0;
  _$jscoverage['/base.js'].lineData[371] = 0;
  _$jscoverage['/base.js'].lineData[372] = 0;
  _$jscoverage['/base.js'].lineData[373] = 0;
  _$jscoverage['/base.js'].lineData[375] = 0;
  _$jscoverage['/base.js'].lineData[376] = 0;
  _$jscoverage['/base.js'].lineData[377] = 0;
  _$jscoverage['/base.js'].lineData[378] = 0;
  _$jscoverage['/base.js'].lineData[380] = 0;
  _$jscoverage['/base.js'].lineData[383] = 0;
  _$jscoverage['/base.js'].lineData[385] = 0;
  _$jscoverage['/base.js'].lineData[386] = 0;
  _$jscoverage['/base.js'].lineData[387] = 0;
  _$jscoverage['/base.js'].lineData[390] = 0;
  _$jscoverage['/base.js'].lineData[394] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[403] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[413] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
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
  _$jscoverage['/base.js'].branchData['29'] = [];
  _$jscoverage['/base.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['32'] = [];
  _$jscoverage['/base.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['66'] = [];
  _$jscoverage['/base.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['70'] = [];
  _$jscoverage['/base.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['74'] = [];
  _$jscoverage['/base.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['77'] = [];
  _$jscoverage['/base.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['77'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['83'] = [];
  _$jscoverage['/base.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['89'] = [];
  _$jscoverage['/base.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['92'] = [];
  _$jscoverage['/base.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['114'] = [];
  _$jscoverage['/base.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['146'] = [];
  _$jscoverage['/base.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['154'] = [];
  _$jscoverage['/base.js'].branchData['154'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['169'] = [];
  _$jscoverage['/base.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['185'] = [];
  _$jscoverage['/base.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['185'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['186'] = [];
  _$jscoverage['/base.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['193'] = [];
  _$jscoverage['/base.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['197'] = [];
  _$jscoverage['/base.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'] = [];
  _$jscoverage['/base.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'][3] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'][4] = new BranchData();
  _$jscoverage['/base.js'].branchData['198'][5] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['209'] = [];
  _$jscoverage['/base.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['223'] = [];
  _$jscoverage['/base.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['229'] = [];
  _$jscoverage['/base.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['262'] = [];
  _$jscoverage['/base.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['268'] = [];
  _$jscoverage['/base.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['297'] = [];
  _$jscoverage['/base.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['302'] = [];
  _$jscoverage['/base.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['330'] = [];
  _$jscoverage['/base.js'].branchData['330'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['335'] = [];
  _$jscoverage['/base.js'].branchData['335'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['354'] = [];
  _$jscoverage['/base.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['358'] = [];
  _$jscoverage['/base.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['363'] = [];
  _$jscoverage['/base.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['364'] = [];
  _$jscoverage['/base.js'].branchData['364'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['376'] = [];
  _$jscoverage['/base.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['383'] = [];
  _$jscoverage['/base.js'].branchData['383'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['386'] = [];
  _$jscoverage['/base.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['405'] = [];
  _$jscoverage['/base.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['405'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['407'] = [];
  _$jscoverage['/base.js'].branchData['407'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['407'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['409'] = [];
  _$jscoverage['/base.js'].branchData['409'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['409'][1].init(103, 15, 'queue === false');
function visit79_409_1(result) {
  _$jscoverage['/base.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['407'][2].init(155, 25, 'typeof queue === \'string\'');
function visit78_407_2(result) {
  _$jscoverage['/base.js'].branchData['407'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['407'][1].init(86, 119, 'typeof queue === \'string\' || queue === false');
function visit77_407_1(result) {
  _$jscoverage['/base.js'].branchData['407'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['405'][2].init(67, 14, 'queue === null');
function visit76_405_2(result) {
  _$jscoverage['/base.js'].branchData['405'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['405'][1].init(51, 206, 'queue === null || typeof queue === \'string\' || queue === false');
function visit75_405_1(result) {
  _$jscoverage['/base.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['386'][1].init(129, 9, 'q && q[0]');
function visit74_386_1(result) {
  _$jscoverage['/base.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['383'][1].init(1011, 15, 'queue !== false');
function visit73_383_1(result) {
  _$jscoverage['/base.js'].branchData['383'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['376'][1].init(829, 6, 'finish');
function visit72_376_1(result) {
  _$jscoverage['/base.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['364'][1].init(22, 15, 'queue !== false');
function visit71_364_1(result) {
  _$jscoverage['/base.js'].branchData['364'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['363'][1].init(403, 37, '!self.isRunning() && !self.isPaused()');
function visit70_363_1(result) {
  _$jscoverage['/base.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['358'][1].init(255, 18, 'self.__waitTimeout');
function visit69_358_1(result) {
  _$jscoverage['/base.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['354'][1].init(149, 38, 'self.isResolved() || self.isRejected()');
function visit68_354_1(result) {
  _$jscoverage['/base.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['335'][1].init(107, 14, 'q.length === 1');
function visit67_335_1(result) {
  _$jscoverage['/base.js'].branchData['335'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['330'][1].init(114, 15, 'queue === false');
function visit66_330_1(result) {
  _$jscoverage['/base.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['302'][1].init(234, 18, 'self.__waitTimeout');
function visit65_302_1(result) {
  _$jscoverage['/base.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['297'][1].init(48, 15, 'self.isPaused()');
function visit64_297_1(result) {
  _$jscoverage['/base.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['268'][1].init(263, 18, 'self.__waitTimeout');
function visit63_268_1(result) {
  _$jscoverage['/base.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['262'][1].init(48, 16, 'self.isRunning()');
function visit62_262_1(result) {
  _$jscoverage['/base.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['229'][1].init(3802, 27, 'S.isEmptyObject(_propsData)');
function visit61_229_1(result) {
  _$jscoverage['/base.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['223'][1].init(2583, 14, 'exit === false');
function visit60_223_1(result) {
  _$jscoverage['/base.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['209'][1].init(597, 14, 'val === \'hide\'');
function visit59_209_1(result) {
  _$jscoverage['/base.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(460, 16, 'val === \'toggle\'');
function visit58_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][5].init(58, 14, 'val === \'show\'');
function visit57_198_5(result) {
  _$jscoverage['/base.js'].branchData['198'][5].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][4].init(58, 25, 'val === \'show\' && !hidden');
function visit56_198_4(result) {
  _$jscoverage['/base.js'].branchData['198'][4].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][3].init(30, 14, 'val === \'hide\'');
function visit55_198_3(result) {
  _$jscoverage['/base.js'].branchData['198'][3].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][2].init(30, 24, 'val === \'hide\' && hidden');
function visit54_198_2(result) {
  _$jscoverage['/base.js'].branchData['198'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['198'][1].init(30, 53, 'val === \'hide\' && hidden || val === \'show\' && !hidden');
function visit53_198_1(result) {
  _$jscoverage['/base.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['197'][1].init(99, 16, 'specialVals[val]');
function visit52_197_1(result) {
  _$jscoverage['/base.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['193'][1].init(1209, 35, 'Dom.css(node, \'display\') === \'none\'');
function visit51_193_1(result) {
  _$jscoverage['/base.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['186'][1].init(65, 33, 'Dom.css(node, \'float\') === \'none\'');
function visit50_186_1(result) {
  _$jscoverage['/base.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['185'][2].init(697, 37, 'Dom.css(node, \'display\') === \'inline\'');
function visit49_185_2(result) {
  _$jscoverage['/base.js'].branchData['185'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['185'][1].init(697, 99, 'Dom.css(node, \'display\') === \'inline\' && Dom.css(node, \'float\') === \'none\'');
function visit48_185_1(result) {
  _$jscoverage['/base.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(177, 21, 'to.width || to.height');
function visit47_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['169'][1].init(1038, 39, 'node.nodeType === NodeType.ELEMENT_NODE');
function visit46_169_1(result) {
  _$jscoverage['/base.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['154'][1].init(22, 21, '!S.isPlainObject(val)');
function visit45_154_1(result) {
  _$jscoverage['/base.js'].branchData['154'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['146'][1].init(276, 17, 'config.delay || 0');
function visit44_146_1(result) {
  _$jscoverage['/base.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['114'][1].init(1510, 22, '!S.isPlainObject(node)');
function visit43_114_1(result) {
  _$jscoverage['/base.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['92'][1].init(211, 6, 'easing');
function visit42_92_1(result) {
  _$jscoverage['/base.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['89'][1].init(110, 8, 'duration');
function visit41_89_1(result) {
  _$jscoverage['/base.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['83'][1].init(569, 25, 'S.isPlainObject(duration)');
function visit40_83_1(result) {
  _$jscoverage['/base.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['77'][2].init(204, 17, 'trimProp !== prop');
function visit39_77_2(result) {
  _$jscoverage['/base.js'].branchData['77'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['77'][1].init(191, 30, '!trimProp || trimProp !== prop');
function visit38_77_1(result) {
  _$jscoverage['/base.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['74'][1].init(76, 8, 'trimProp');
function visit37_74_1(result) {
  _$jscoverage['/base.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['70'][1].init(60, 22, 'typeof to === \'string\'');
function visit36_70_1(result) {
  _$jscoverage['/base.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['66'][1].init(63, 9, 'node.node');
function visit35_66_1(result) {
  _$jscoverage['/base.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['32'][1].init(244, 8, 'complete');
function visit34_32_1(result) {
  _$jscoverage['/base.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['29'][1].init(119, 50, '!S.isEmptyObject(_backupProps = self._backupProps)');
function visit33_29_1(result) {
  _$jscoverage['/base.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Dom = require('dom'), Utils = require('./base/utils'), Q = require('./base/queue'), Promise = require('promise'), NodeType = Dom.NodeType, camelCase = S.camelCase, noop = S.noop, specialVals = {
  toggle: 1, 
  hide: 1, 
  show: 1};
  _$jscoverage['/base.js'].lineData[20]++;
  var defaultConfig = {
  duration: 1, 
  easing: 'linear'};
  _$jscoverage['/base.js'].lineData[26]++;
  function syncComplete(self) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[27]++;
    var _backupProps, complete = self.config.complete;
    _$jscoverage['/base.js'].lineData[29]++;
    if (visit33_29_1(!S.isEmptyObject(_backupProps = self._backupProps))) {
      _$jscoverage['/base.js'].lineData[30]++;
      Dom.css(self.node, _backupProps);
    }
    _$jscoverage['/base.js'].lineData[32]++;
    if (visit34_32_1(complete)) {
      _$jscoverage['/base.js'].lineData[33]++;
      complete.call(self);
    }
  }
  _$jscoverage['/base.js'].lineData[62]++;
  function AnimBase(node, to, duration, easing, complete) {
    _$jscoverage['/base.js'].functionData[2]++;
    _$jscoverage['/base.js'].lineData[63]++;
    var self = this;
    _$jscoverage['/base.js'].lineData[64]++;
    var config;
    _$jscoverage['/base.js'].lineData[66]++;
    if (visit35_66_1(node.node)) {
      _$jscoverage['/base.js'].lineData[67]++;
      config = node;
    } else {
      _$jscoverage['/base.js'].lineData[70]++;
      if (visit36_70_1(typeof to === 'string')) {
        _$jscoverage['/base.js'].lineData[71]++;
        to = S.unparam(String(to), ';', ':');
        _$jscoverage['/base.js'].lineData[72]++;
        S.each(to, function(value, prop) {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[73]++;
  var trimProp = S.trim(prop);
  _$jscoverage['/base.js'].lineData[74]++;
  if (visit37_74_1(trimProp)) {
    _$jscoverage['/base.js'].lineData[75]++;
    to[trimProp] = S.trim(value);
  }
  _$jscoverage['/base.js'].lineData[77]++;
  if (visit38_77_1(!trimProp || visit39_77_2(trimProp !== prop))) {
    _$jscoverage['/base.js'].lineData[78]++;
    delete to[prop];
  }
});
      }
      _$jscoverage['/base.js'].lineData[83]++;
      if (visit40_83_1(S.isPlainObject(duration))) {
        _$jscoverage['/base.js'].lineData[84]++;
        config = S.clone(duration);
      } else {
        _$jscoverage['/base.js'].lineData[86]++;
        config = {
  complete: complete};
        _$jscoverage['/base.js'].lineData[89]++;
        if (visit41_89_1(duration)) {
          _$jscoverage['/base.js'].lineData[90]++;
          config.duration = duration;
        }
        _$jscoverage['/base.js'].lineData[92]++;
        if (visit42_92_1(easing)) {
          _$jscoverage['/base.js'].lineData[93]++;
          config.easing = easing;
        }
      }
      _$jscoverage['/base.js'].lineData[96]++;
      config.node = node;
      _$jscoverage['/base.js'].lineData[97]++;
      config.to = to;
    }
    _$jscoverage['/base.js'].lineData[100]++;
    config = S.merge(defaultConfig, config);
    _$jscoverage['/base.js'].lineData[103]++;
    AnimBase.superclass.constructor.call(self);
    _$jscoverage['/base.js'].lineData[104]++;
    Promise.Defer(self);
    _$jscoverage['/base.js'].lineData[110]++;
    self.config = config;
    _$jscoverage['/base.js'].lineData[112]++;
    node = config.node;
    _$jscoverage['/base.js'].lineData[114]++;
    if (visit43_114_1(!S.isPlainObject(node))) {
      _$jscoverage['/base.js'].lineData[115]++;
      node = Dom.get(config.node);
    }
    _$jscoverage['/base.js'].lineData[117]++;
    self.node = self.el = node;
    _$jscoverage['/base.js'].lineData[118]++;
    self._backupProps = {};
    _$jscoverage['/base.js'].lineData[119]++;
    self._propsData = {};
    _$jscoverage['/base.js'].lineData[122]++;
    var newTo = {};
    _$jscoverage['/base.js'].lineData[123]++;
    to = config.to;
    _$jscoverage['/base.js'].lineData[124]++;
    for (var prop in to) {
      _$jscoverage['/base.js'].lineData[125]++;
      newTo[camelCase(prop)] = to[prop];
    }
    _$jscoverage['/base.js'].lineData[127]++;
    config.to = newTo;
  }
  _$jscoverage['/base.js'].lineData[130]++;
  S.extend(AnimBase, Promise, {
  prepareFx: noop, 
  runInternal: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[139]++;
  var self = this, config = self.config, node = self.node, val, _backupProps = self._backupProps, _propsData = self._propsData, to = config.to, defaultDelay = (visit44_146_1(config.delay || 0)), defaultDuration = config.duration;
  _$jscoverage['/base.js'].lineData[150]++;
  Utils.saveRunningAnim(self);
  _$jscoverage['/base.js'].lineData[153]++;
  S.each(to, function(val, prop) {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[154]++;
  if (visit45_154_1(!S.isPlainObject(val))) {
    _$jscoverage['/base.js'].lineData[155]++;
    val = {
  value: val};
  }
  _$jscoverage['/base.js'].lineData[159]++;
  _propsData[prop] = S.mix({
  delay: defaultDelay, 
  easing: config.easing, 
  frame: config.frame, 
  duration: defaultDuration}, val);
});
  _$jscoverage['/base.js'].lineData[169]++;
  if (visit46_169_1(node.nodeType === NodeType.ELEMENT_NODE)) {
    _$jscoverage['/base.js'].lineData[172]++;
    if (visit47_172_1(to.width || to.height)) {
      _$jscoverage['/base.js'].lineData[177]++;
      var elStyle = node.style;
      _$jscoverage['/base.js'].lineData[178]++;
      S.mix(_backupProps, {
  overflow: elStyle.overflow, 
  'overflow-x': elStyle.overflowX, 
  'overflow-y': elStyle.overflowY});
      _$jscoverage['/base.js'].lineData[183]++;
      elStyle.overflow = 'hidden';
      _$jscoverage['/base.js'].lineData[185]++;
      if (visit48_185_1(visit49_185_2(Dom.css(node, 'display') === 'inline') && visit50_186_1(Dom.css(node, 'float') === 'none'))) {
        _$jscoverage['/base.js'].lineData[187]++;
        elStyle.zoom = 1;
        _$jscoverage['/base.js'].lineData[188]++;
        elStyle.display = 'inline-block';
      }
    }
    _$jscoverage['/base.js'].lineData[192]++;
    var exit, hidden;
    _$jscoverage['/base.js'].lineData[193]++;
    hidden = (visit51_193_1(Dom.css(node, 'display') === 'none'));
    _$jscoverage['/base.js'].lineData[194]++;
    S.each(_propsData, function(_propData, prop) {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[195]++;
  val = _propData.value;
  _$jscoverage['/base.js'].lineData[197]++;
  if (visit52_197_1(specialVals[val])) {
    _$jscoverage['/base.js'].lineData[198]++;
    if (visit53_198_1(visit54_198_2(visit55_198_3(val === 'hide') && hidden) || visit56_198_4(visit57_198_5(val === 'show') && !hidden))) {
      _$jscoverage['/base.js'].lineData[200]++;
      self.stop(true);
      _$jscoverage['/base.js'].lineData[201]++;
      exit = false;
      _$jscoverage['/base.js'].lineData[202]++;
      return exit;
    }
    _$jscoverage['/base.js'].lineData[205]++;
    _backupProps[prop] = Dom.style(node, prop);
    _$jscoverage['/base.js'].lineData[206]++;
    if (visit58_206_1(val === 'toggle')) {
      _$jscoverage['/base.js'].lineData[207]++;
      val = hidden ? 'show' : 'hide';
    }
    _$jscoverage['/base.js'].lineData[209]++;
    if (visit59_209_1(val === 'hide')) {
      _$jscoverage['/base.js'].lineData[210]++;
      _propData.value = 0;
      _$jscoverage['/base.js'].lineData[212]++;
      _backupProps.display = 'none';
    } else {
      _$jscoverage['/base.js'].lineData[214]++;
      _propData.value = Dom.css(node, prop);
      _$jscoverage['/base.js'].lineData[216]++;
      Dom.css(node, prop, 0);
      _$jscoverage['/base.js'].lineData[217]++;
      Dom.show(node);
    }
  }
  _$jscoverage['/base.js'].lineData[220]++;
  return undefined;
});
    _$jscoverage['/base.js'].lineData[223]++;
    if (visit60_223_1(exit === false)) {
      _$jscoverage['/base.js'].lineData[224]++;
      return;
    }
  }
  _$jscoverage['/base.js'].lineData[228]++;
  self.startTime = S.now();
  _$jscoverage['/base.js'].lineData[229]++;
  if (visit61_229_1(S.isEmptyObject(_propsData))) {
    _$jscoverage['/base.js'].lineData[230]++;
    self.__totalTime = defaultDuration * 1000;
    _$jscoverage['/base.js'].lineData[231]++;
    self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[232]++;
  self.stop(true);
}, self.__totalTime);
  } else {
    _$jscoverage['/base.js'].lineData[235]++;
    self.prepareFx();
    _$jscoverage['/base.js'].lineData[236]++;
    self.doStart();
  }
}, 
  isRunning: function() {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[245]++;
  return Utils.isAnimRunning(this);
}, 
  isPaused: function() {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[253]++;
  return Utils.isAnimPaused(this);
}, 
  pause: function() {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[261]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[262]++;
  if (visit62_262_1(self.isRunning())) {
    _$jscoverage['/base.js'].lineData[264]++;
    self._runTime = S.now() - self.startTime;
    _$jscoverage['/base.js'].lineData[265]++;
    self.__totalTime -= self._runTime;
    _$jscoverage['/base.js'].lineData[266]++;
    Utils.removeRunningAnim(self);
    _$jscoverage['/base.js'].lineData[267]++;
    Utils.savePausedAnim(self);
    _$jscoverage['/base.js'].lineData[268]++;
    if (visit63_268_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[269]++;
      clearTimeout(self.__waitTimeout);
    } else {
      _$jscoverage['/base.js'].lineData[271]++;
      self.doStop();
    }
  }
  _$jscoverage['/base.js'].lineData[274]++;
  return self;
}, 
  doStop: noop, 
  doStart: noop, 
  resume: function() {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[296]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[297]++;
  if (visit64_297_1(self.isPaused())) {
    _$jscoverage['/base.js'].lineData[299]++;
    self.startTime = S.now() - self._runTime;
    _$jscoverage['/base.js'].lineData[300]++;
    Utils.removePausedAnim(self);
    _$jscoverage['/base.js'].lineData[301]++;
    Utils.saveRunningAnim(self);
    _$jscoverage['/base.js'].lineData[302]++;
    if (visit65_302_1(self.__waitTimeout)) {
      _$jscoverage['/base.js'].lineData[303]++;
      self.__waitTimeout = setTimeout(function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[304]++;
  self.stop(true);
}, self.__totalTime);
    } else {
      _$jscoverage['/base.js'].lineData[307]++;
      self.beforeResume();
      _$jscoverage['/base.js'].lineData[308]++;
      self.doStart();
    }
  }
  _$jscoverage['/base.js'].lineData[311]++;
  return self;
}, 
  beforeResume: noop, 
  run: function() {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[326]++;
  var self = this, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[330]++;
  if (visit66_330_1(queue === false)) {
    _$jscoverage['/base.js'].lineData[331]++;
    self.runInternal();
  } else {
    _$jscoverage['/base.js'].lineData[334]++;
    q = Q.queue(self.node, queue, self);
    _$jscoverage['/base.js'].lineData[335]++;
    if (visit67_335_1(q.length === 1)) {
      _$jscoverage['/base.js'].lineData[336]++;
      self.runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[340]++;
  return self;
}, 
  stop: function(finish) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[349]++;
  var self = this, node = self.node, q, queue = self.config.queue;
  _$jscoverage['/base.js'].lineData[354]++;
  if (visit68_354_1(self.isResolved() || self.isRejected())) {
    _$jscoverage['/base.js'].lineData[355]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[358]++;
  if (visit69_358_1(self.__waitTimeout)) {
    _$jscoverage['/base.js'].lineData[359]++;
    clearTimeout(self.__waitTimeout);
    _$jscoverage['/base.js'].lineData[360]++;
    self.__waitTimeout = 0;
  }
  _$jscoverage['/base.js'].lineData[363]++;
  if (visit70_363_1(!self.isRunning() && !self.isPaused())) {
    _$jscoverage['/base.js'].lineData[364]++;
    if (visit71_364_1(queue !== false)) {
      _$jscoverage['/base.js'].lineData[366]++;
      Q.remove(node, queue, self);
    }
    _$jscoverage['/base.js'].lineData[368]++;
    return self;
  }
  _$jscoverage['/base.js'].lineData[371]++;
  self.doStop(finish);
  _$jscoverage['/base.js'].lineData[372]++;
  Utils.removeRunningAnim(self);
  _$jscoverage['/base.js'].lineData[373]++;
  Utils.removePausedAnim(self);
  _$jscoverage['/base.js'].lineData[375]++;
  var defer = self.defer;
  _$jscoverage['/base.js'].lineData[376]++;
  if (visit72_376_1(finish)) {
    _$jscoverage['/base.js'].lineData[377]++;
    syncComplete(self);
    _$jscoverage['/base.js'].lineData[378]++;
    defer.resolve([self]);
  } else {
    _$jscoverage['/base.js'].lineData[380]++;
    defer.reject([self]);
  }
  _$jscoverage['/base.js'].lineData[383]++;
  if (visit73_383_1(queue !== false)) {
    _$jscoverage['/base.js'].lineData[385]++;
    q = Q.dequeue(node, queue);
    _$jscoverage['/base.js'].lineData[386]++;
    if (visit74_386_1(q && q[0])) {
      _$jscoverage['/base.js'].lineData[387]++;
      q[0].runInternal();
    }
  }
  _$jscoverage['/base.js'].lineData[390]++;
  return self;
}});
  _$jscoverage['/base.js'].lineData[394]++;
  var Statics = AnimBase.Statics = {
  isRunning: Utils.isElRunning, 
  isPaused: Utils.isElPaused, 
  stop: Utils.stopEl, 
  Q: Q};
  _$jscoverage['/base.js'].lineData[401]++;
  S.each(['pause', 'resume'], function(action) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[402]++;
  Statics[action] = function(node, queue) {
  _$jscoverage['/base.js'].functionData[16]++;
  _$jscoverage['/base.js'].lineData[403]++;
  if (visit75_405_1(visit76_405_2(queue === null) || visit77_407_1(visit78_407_2(typeof queue === 'string') || visit79_409_1(queue === false)))) {
    _$jscoverage['/base.js'].lineData[411]++;
    return Utils.pauseOrResumeQueue(node, queue, action);
  }
  _$jscoverage['/base.js'].lineData[413]++;
  return Utils.pauseOrResumeQueue(node, undefined, action);
};
});
  _$jscoverage['/base.js'].lineData[417]++;
  return AnimBase;
});
