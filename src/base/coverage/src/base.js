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
  _$jscoverage['/base.js'].lineData[9] = 0;
  _$jscoverage['/base.js'].lineData[13] = 0;
  _$jscoverage['/base.js'].lineData[14] = 0;
  _$jscoverage['/base.js'].lineData[15] = 0;
  _$jscoverage['/base.js'].lineData[16] = 0;
  _$jscoverage['/base.js'].lineData[17] = 0;
  _$jscoverage['/base.js'].lineData[18] = 0;
  _$jscoverage['/base.js'].lineData[19] = 0;
  _$jscoverage['/base.js'].lineData[22] = 0;
  _$jscoverage['/base.js'].lineData[26] = 0;
  _$jscoverage['/base.js'].lineData[27] = 0;
  _$jscoverage['/base.js'].lineData[28] = 0;
  _$jscoverage['/base.js'].lineData[30] = 0;
  _$jscoverage['/base.js'].lineData[31] = 0;
  _$jscoverage['/base.js'].lineData[32] = 0;
  _$jscoverage['/base.js'].lineData[34] = 0;
  _$jscoverage['/base.js'].lineData[35] = 0;
  _$jscoverage['/base.js'].lineData[53] = 0;
  _$jscoverage['/base.js'].lineData[55] = 0;
  _$jscoverage['/base.js'].lineData[56] = 0;
  _$jscoverage['/base.js'].lineData[58] = 0;
  _$jscoverage['/base.js'].lineData[59] = 0;
  _$jscoverage['/base.js'].lineData[60] = 0;
  _$jscoverage['/base.js'].lineData[63] = 0;
  _$jscoverage['/base.js'].lineData[65] = 0;
  _$jscoverage['/base.js'].lineData[66] = 0;
  _$jscoverage['/base.js'].lineData[68] = 0;
  _$jscoverage['/base.js'].lineData[70] = 0;
  _$jscoverage['/base.js'].lineData[85] = 0;
  _$jscoverage['/base.js'].lineData[89] = 0;
  _$jscoverage['/base.js'].lineData[90] = 0;
  _$jscoverage['/base.js'].lineData[91] = 0;
  _$jscoverage['/base.js'].lineData[93] = 0;
  _$jscoverage['/base.js'].lineData[103] = 0;
  _$jscoverage['/base.js'].lineData[109] = 0;
  _$jscoverage['/base.js'].lineData[110] = 0;
  _$jscoverage['/base.js'].lineData[111] = 0;
  _$jscoverage['/base.js'].lineData[114] = 0;
  _$jscoverage['/base.js'].lineData[117] = 0;
  _$jscoverage['/base.js'].lineData[118] = 0;
  _$jscoverage['/base.js'].lineData[119] = 0;
  _$jscoverage['/base.js'].lineData[120] = 0;
  _$jscoverage['/base.js'].lineData[121] = 0;
  _$jscoverage['/base.js'].lineData[123] = 0;
  _$jscoverage['/base.js'].lineData[125] = 0;
  _$jscoverage['/base.js'].lineData[130] = 0;
  _$jscoverage['/base.js'].lineData[143] = 0;
  _$jscoverage['/base.js'].lineData[144] = 0;
  _$jscoverage['/base.js'].lineData[145] = 0;
  _$jscoverage['/base.js'].lineData[146] = 0;
  _$jscoverage['/base.js'].lineData[150] = 0;
  _$jscoverage['/base.js'].lineData[152] = 0;
  _$jscoverage['/base.js'].lineData[154] = 0;
  _$jscoverage['/base.js'].lineData[155] = 0;
  _$jscoverage['/base.js'].lineData[165] = 0;
  _$jscoverage['/base.js'].lineData[169] = 0;
  _$jscoverage['/base.js'].lineData[170] = 0;
  _$jscoverage['/base.js'].lineData[171] = 0;
  _$jscoverage['/base.js'].lineData[172] = 0;
  _$jscoverage['/base.js'].lineData[174] = 0;
  _$jscoverage['/base.js'].lineData[175] = 0;
  _$jscoverage['/base.js'].lineData[176] = 0;
  _$jscoverage['/base.js'].lineData[177] = 0;
  _$jscoverage['/base.js'].lineData[180] = 0;
  _$jscoverage['/base.js'].lineData[181] = 0;
  _$jscoverage['/base.js'].lineData[182] = 0;
  _$jscoverage['/base.js'].lineData[187] = 0;
  _$jscoverage['/base.js'].lineData[188] = 0;
  _$jscoverage['/base.js'].lineData[192] = 0;
  _$jscoverage['/base.js'].lineData[193] = 0;
  _$jscoverage['/base.js'].lineData[202] = 0;
  _$jscoverage['/base.js'].lineData[203] = 0;
  _$jscoverage['/base.js'].lineData[205] = 0;
  _$jscoverage['/base.js'].lineData[206] = 0;
  _$jscoverage['/base.js'].lineData[207] = 0;
  _$jscoverage['/base.js'].lineData[208] = 0;
  _$jscoverage['/base.js'].lineData[210] = 0;
  _$jscoverage['/base.js'].lineData[212] = 0;
  _$jscoverage['/base.js'].lineData[218] = 0;
  _$jscoverage['/base.js'].lineData[219] = 0;
  _$jscoverage['/base.js'].lineData[220] = 0;
  _$jscoverage['/base.js'].lineData[221] = 0;
  _$jscoverage['/base.js'].lineData[222] = 0;
  _$jscoverage['/base.js'].lineData[223] = 0;
  _$jscoverage['/base.js'].lineData[224] = 0;
  _$jscoverage['/base.js'].lineData[229] = 0;
  _$jscoverage['/base.js'].lineData[301] = 0;
  _$jscoverage['/base.js'].lineData[302] = 0;
  _$jscoverage['/base.js'].lineData[303] = 0;
  _$jscoverage['/base.js'].lineData[304] = 0;
  _$jscoverage['/base.js'].lineData[306] = 0;
  _$jscoverage['/base.js'].lineData[307] = 0;
  _$jscoverage['/base.js'].lineData[309] = 0;
  _$jscoverage['/base.js'].lineData[311] = 0;
  _$jscoverage['/base.js'].lineData[312] = 0;
  _$jscoverage['/base.js'].lineData[316] = 0;
  _$jscoverage['/base.js'].lineData[317] = 0;
  _$jscoverage['/base.js'].lineData[327] = 0;
  _$jscoverage['/base.js'].lineData[328] = 0;
  _$jscoverage['/base.js'].lineData[329] = 0;
  _$jscoverage['/base.js'].lineData[332] = 0;
  _$jscoverage['/base.js'].lineData[334] = 0;
  _$jscoverage['/base.js'].lineData[336] = 0;
  _$jscoverage['/base.js'].lineData[337] = 0;
  _$jscoverage['/base.js'].lineData[342] = 0;
  _$jscoverage['/base.js'].lineData[343] = 0;
  _$jscoverage['/base.js'].lineData[344] = 0;
  _$jscoverage['/base.js'].lineData[346] = 0;
  _$jscoverage['/base.js'].lineData[347] = 0;
  _$jscoverage['/base.js'].lineData[348] = 0;
  _$jscoverage['/base.js'].lineData[352] = 0;
  _$jscoverage['/base.js'].lineData[354] = 0;
  _$jscoverage['/base.js'].lineData[355] = 0;
  _$jscoverage['/base.js'].lineData[356] = 0;
  _$jscoverage['/base.js'].lineData[359] = 0;
  _$jscoverage['/base.js'].lineData[361] = 0;
  _$jscoverage['/base.js'].lineData[363] = 0;
  _$jscoverage['/base.js'].lineData[364] = 0;
  _$jscoverage['/base.js'].lineData[366] = 0;
  _$jscoverage['/base.js'].lineData[369] = 0;
  _$jscoverage['/base.js'].lineData[396] = 0;
  _$jscoverage['/base.js'].lineData[397] = 0;
  _$jscoverage['/base.js'].lineData[400] = 0;
  _$jscoverage['/base.js'].lineData[401] = 0;
  _$jscoverage['/base.js'].lineData[402] = 0;
  _$jscoverage['/base.js'].lineData[406] = 0;
  _$jscoverage['/base.js'].lineData[407] = 0;
  _$jscoverage['/base.js'].lineData[408] = 0;
  _$jscoverage['/base.js'].lineData[409] = 0;
  _$jscoverage['/base.js'].lineData[410] = 0;
  _$jscoverage['/base.js'].lineData[411] = 0;
  _$jscoverage['/base.js'].lineData[416] = 0;
  _$jscoverage['/base.js'].lineData[417] = 0;
  _$jscoverage['/base.js'].lineData[420] = 0;
  _$jscoverage['/base.js'].lineData[421] = 0;
  _$jscoverage['/base.js'].lineData[422] = 0;
  _$jscoverage['/base.js'].lineData[423] = 0;
  _$jscoverage['/base.js'].lineData[429] = 0;
  _$jscoverage['/base.js'].lineData[430] = 0;
  _$jscoverage['/base.js'].lineData[431] = 0;
  _$jscoverage['/base.js'].lineData[432] = 0;
  _$jscoverage['/base.js'].lineData[433] = 0;
  _$jscoverage['/base.js'].lineData[438] = 0;
  _$jscoverage['/base.js'].lineData[439] = 0;
  _$jscoverage['/base.js'].lineData[445] = 0;
  _$jscoverage['/base.js'].lineData[447] = 0;
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
  _$jscoverage['/base.js'].functionData[17] = 0;
  _$jscoverage['/base.js'].functionData[18] = 0;
  _$jscoverage['/base.js'].functionData[19] = 0;
  _$jscoverage['/base.js'].functionData[20] = 0;
  _$jscoverage['/base.js'].functionData[21] = 0;
}
if (! _$jscoverage['/base.js'].branchData) {
  _$jscoverage['/base.js'].branchData = {};
  _$jscoverage['/base.js'].branchData['17'] = [];
  _$jscoverage['/base.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['18'] = [];
  _$jscoverage['/base.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['26'] = [];
  _$jscoverage['/base.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['27'] = [];
  _$jscoverage['/base.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['31'] = [];
  _$jscoverage['/base.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['34'] = [];
  _$jscoverage['/base.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['91'] = [];
  _$jscoverage['/base.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['111'] = [];
  _$jscoverage['/base.js'].branchData['111'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['117'] = [];
  _$jscoverage['/base.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['118'] = [];
  _$jscoverage['/base.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['120'] = [];
  _$jscoverage['/base.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['125'] = [];
  _$jscoverage['/base.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'] = [];
  _$jscoverage['/base.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['129'] = [];
  _$jscoverage['/base.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['144'] = [];
  _$jscoverage['/base.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['150'] = [];
  _$jscoverage['/base.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['167'] = [];
  _$jscoverage['/base.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['171'] = [];
  _$jscoverage['/base.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['172'] = [];
  _$jscoverage['/base.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'] = [];
  _$jscoverage['/base.js'].branchData['174'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['174'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['175'] = [];
  _$jscoverage['/base.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['180'] = [];
  _$jscoverage['/base.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['187'] = [];
  _$jscoverage['/base.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['205'] = [];
  _$jscoverage['/base.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['206'] = [];
  _$jscoverage['/base.js'].branchData['206'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['219'] = [];
  _$jscoverage['/base.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['301'] = [];
  _$jscoverage['/base.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['311'] = [];
  _$jscoverage['/base.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['317'] = [];
  _$jscoverage['/base.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['328'] = [];
  _$jscoverage['/base.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['336'] = [];
  _$jscoverage['/base.js'].branchData['336'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['346'] = [];
  _$jscoverage['/base.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['346'][2] = new BranchData();
  _$jscoverage['/base.js'].branchData['359'] = [];
  _$jscoverage['/base.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['363'] = [];
  _$jscoverage['/base.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['366'] = [];
  _$jscoverage['/base.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['400'] = [];
  _$jscoverage['/base.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['409'] = [];
  _$jscoverage['/base.js'].branchData['409'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['421'] = [];
  _$jscoverage['/base.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['422'] = [];
  _$jscoverage['/base.js'].branchData['422'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['431'] = [];
  _$jscoverage['/base.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['432'] = [];
  _$jscoverage['/base.js'].branchData['432'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['433'] = [];
  _$jscoverage['/base.js'].branchData['433'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['438'] = [];
  _$jscoverage['/base.js'].branchData['438'][1] = new BranchData();
  _$jscoverage['/base.js'].branchData['439'] = [];
  _$jscoverage['/base.js'].branchData['439'][1] = new BranchData();
}
_$jscoverage['/base.js'].branchData['439'][1].init(36, 10, 'args || []');
function visit48_439_1(result) {
  _$jscoverage['/base.js'].branchData['439'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['438'][1].init(214, 2, 'fn');
function visit47_438_1(result) {
  _$jscoverage['/base.js'].branchData['438'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['433'][1].init(26, 166, 'extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method])');
function visit46_433_1(result) {
  _$jscoverage['/base.js'].branchData['433'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['432'][1].init(29, 7, 'i < len');
function visit45_432_1(result) {
  _$jscoverage['/base.js'].branchData['432'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['431'][1].init(37, 31, 'extensions && extensions.length');
function visit44_431_1(result) {
  _$jscoverage['/base.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['422'][1].init(21, 18, 'plugins[i][method]');
function visit43_422_1(result) {
  _$jscoverage['/base.js'].branchData['422'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['421'][1].init(29, 7, 'i < len');
function visit42_421_1(result) {
  _$jscoverage['/base.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['409'][1].init(17, 28, 'typeof plugin === \'function\'');
function visit41_409_1(result) {
  _$jscoverage['/base.js'].branchData['409'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['400'][1].init(85, 17, 'e.target === self');
function visit40_400_1(result) {
  _$jscoverage['/base.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['366'][1].init(207, 13, 'px[h] || noop');
function visit39_366_1(result) {
  _$jscoverage['/base.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['363'][1].init(83, 48, 'proto.hasOwnProperty(h) && !px.hasOwnProperty(h)');
function visit38_363_1(result) {
  _$jscoverage['/base.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['359'][1].init(172, 26, 'extensions.length && hooks');
function visit37_359_1(result) {
  _$jscoverage['/base.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['346'][2].init(1965, 15, 'sx && sx.extend');
function visit36_346_2(result) {
  _$jscoverage['/base.js'].branchData['346'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['346'][1].init(1965, 25, 'sx && sx.extend || extend');
function visit35_346_1(result) {
  _$jscoverage['/base.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['336'][1].init(94, 21, 'exp.hasOwnProperty(p)');
function visit34_336_1(result) {
  _$jscoverage['/base.js'].branchData['336'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['328'][1].init(52, 17, 'attrs[name] || {}');
function visit33_328_1(result) {
  _$jscoverage['/base.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['317'][1].init(25, 3, 'ext');
function visit32_317_1(result) {
  _$jscoverage['/base.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['311'][1].init(425, 17, 'extensions.length');
function visit31_311_1(result) {
  _$jscoverage['/base.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['301'][1].init(17, 22, '!S.isArray(extensions)');
function visit30_301_1(result) {
  _$jscoverage['/base.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['219'][1].init(46, 22, '!self.get(\'destroyed\')');
function visit29_219_1(result) {
  _$jscoverage['/base.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['206'][1].init(141, 15, 'pluginId === id');
function visit28_206_1(result) {
  _$jscoverage['/base.js'].branchData['206'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['205'][2].init(79, 26, 'p.get && p.get(\'pluginId\')');
function visit27_205_2(result) {
  _$jscoverage['/base.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['205'][1].init(79, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit26_205_1(result) {
  _$jscoverage['/base.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['187'][1].init(642, 5, '!keep');
function visit25_187_1(result) {
  _$jscoverage['/base.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['180'][1].init(29, 12, 'p !== plugin');
function visit24_180_1(result) {
  _$jscoverage['/base.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['175'][1].init(161, 19, 'pluginId !== plugin');
function visit23_175_1(result) {
  _$jscoverage['/base.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][2].init(91, 26, 'p.get && p.get(\'pluginId\')');
function visit22_174_2(result) {
  _$jscoverage['/base.js'].branchData['174'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['174'][1].init(91, 40, 'p.get && p.get(\'pluginId\') || p.pluginId');
function visit21_174_1(result) {
  _$jscoverage['/base.js'].branchData['174'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['172'][1].init(25, 8, 'isString');
function visit20_172_1(result) {
  _$jscoverage['/base.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['171'][1].init(61, 6, 'plugin');
function visit19_171_1(result) {
  _$jscoverage['/base.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['167'][1].init(73, 26, 'typeof plugin === \'string\'');
function visit18_167_1(result) {
  _$jscoverage['/base.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['150'][1].init(265, 24, 'plugin.pluginInitializer');
function visit17_150_1(result) {
  _$jscoverage['/base.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['144'][1].init(46, 28, 'typeof plugin === \'function\'');
function visit16_144_1(result) {
  _$jscoverage['/base.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['129'][1].init(63, 55, '(attributeValue = self.get(attributeName)) !== undefined');
function visit15_129_1(result) {
  _$jscoverage['/base.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][2].init(427, 31, 'attrs[attributeName].sync !== 0');
function visit14_128_2(result) {
  _$jscoverage['/base.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['128'][1].init(174, 119, 'attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit13_128_1(result) {
  _$jscoverage['/base.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['125'][1].init(250, 294, '(onSetMethod = self[onSetMethodName]) && attrs[attributeName].sync !== 0 && (attributeValue = self.get(attributeName)) !== undefined');
function visit12_125_1(result) {
  _$jscoverage['/base.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['120'][1].init(25, 22, 'attributeName in attrs');
function visit11_120_1(result) {
  _$jscoverage['/base.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['118'][1].init(29, 17, 'cs[i].ATTRS || {}');
function visit10_118_1(result) {
  _$jscoverage['/base.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['117'][1].init(379, 13, 'i < cs.length');
function visit9_117_1(result) {
  _$jscoverage['/base.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['111'][1].init(49, 40, 'c.superclass && c.superclass.constructor');
function visit8_111_1(result) {
  _$jscoverage['/base.js'].branchData['111'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['91'][1].init(65, 7, 'self[m]');
function visit7_91_1(result) {
  _$jscoverage['/base.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['34'][1].init(25, 15, 'origFn !== noop');
function visit6_34_1(result) {
  _$jscoverage['/base.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['31'][1].init(641, 7, 'reverse');
function visit5_31_1(result) {
  _$jscoverage['/base.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['27'][1].init(475, 7, 'reverse');
function visit4_27_1(result) {
  _$jscoverage['/base.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['26'][1].init(406, 47, 'arguments.callee.__owner__.__extensions__ || []');
function visit3_26_1(result) {
  _$jscoverage['/base.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['18'][1].init(25, 15, 'origFn !== noop');
function visit2_18_1(result) {
  _$jscoverage['/base.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].branchData['17'][1].init(54, 7, 'reverse');
function visit1_17_1(result) {
  _$jscoverage['/base.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base.js'].functionData[0]++;
  _$jscoverage['/base.js'].lineData[7]++;
  var Attribute = require('attribute');
  _$jscoverage['/base.js'].lineData[9]++;
  var ucfirst = S.ucfirst, ON_SET = '_onSet', noop = S.noop;
  _$jscoverage['/base.js'].lineData[13]++;
  function __getHook(method, reverse) {
    _$jscoverage['/base.js'].functionData[1]++;
    _$jscoverage['/base.js'].lineData[14]++;
    return function(origFn) {
  _$jscoverage['/base.js'].functionData[2]++;
  _$jscoverage['/base.js'].lineData[15]++;
  return function wrap() {
  _$jscoverage['/base.js'].functionData[3]++;
  _$jscoverage['/base.js'].lineData[16]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[17]++;
  if (visit1_17_1(reverse)) {
    _$jscoverage['/base.js'].lineData[18]++;
    if (visit2_18_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[19]++;
      origFn.apply(self, arguments);
    }
  } else {
    _$jscoverage['/base.js'].lineData[22]++;
    self.callSuper.apply(self, arguments);
  }
  _$jscoverage['/base.js'].lineData[26]++;
  var extensions = visit3_26_1(arguments.callee.__owner__.__extensions__ || []);
  _$jscoverage['/base.js'].lineData[27]++;
  if (visit4_27_1(reverse)) {
    _$jscoverage['/base.js'].lineData[28]++;
    extensions.reverse();
  }
  _$jscoverage['/base.js'].lineData[30]++;
  callExtensionsMethod(self, extensions, method, arguments);
  _$jscoverage['/base.js'].lineData[31]++;
  if (visit5_31_1(reverse)) {
    _$jscoverage['/base.js'].lineData[32]++;
    self.callSuper.apply(self, arguments);
  } else {
    _$jscoverage['/base.js'].lineData[34]++;
    if (visit6_34_1(origFn !== noop)) {
      _$jscoverage['/base.js'].lineData[35]++;
      origFn.apply(self, arguments);
    }
  }
};
};
  }
  _$jscoverage['/base.js'].lineData[53]++;
  var Base = Attribute.extend({
  constructor: function() {
  _$jscoverage['/base.js'].functionData[4]++;
  _$jscoverage['/base.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[56]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/base.js'].lineData[58]++;
  var listeners = self.get('listeners');
  _$jscoverage['/base.js'].lineData[59]++;
  for (var n in listeners) {
    _$jscoverage['/base.js'].lineData[60]++;
    self.on(n, listeners[n]);
  }
  _$jscoverage['/base.js'].lineData[63]++;
  self.initializer();
  _$jscoverage['/base.js'].lineData[65]++;
  constructPlugins(self);
  _$jscoverage['/base.js'].lineData[66]++;
  callPluginsMethod.call(self, 'pluginInitializer');
  _$jscoverage['/base.js'].lineData[68]++;
  self.bindInternal();
  _$jscoverage['/base.js'].lineData[70]++;
  self.syncInternal();
}, 
  initializer: noop, 
  '__getHook': __getHook, 
  __callPluginsMethod: callPluginsMethod, 
  bindInternal: function() {
  _$jscoverage['/base.js'].functionData[5]++;
  _$jscoverage['/base.js'].lineData[85]++;
  var self = this, attrs = self.getAttrs(), attr, m;
  _$jscoverage['/base.js'].lineData[89]++;
  for (attr in attrs) {
    _$jscoverage['/base.js'].lineData[90]++;
    m = ON_SET + ucfirst(attr);
    _$jscoverage['/base.js'].lineData[91]++;
    if (visit7_91_1(self[m])) {
      _$jscoverage['/base.js'].lineData[93]++;
      self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
    }
  }
}, 
  syncInternal: function() {
  _$jscoverage['/base.js'].functionData[6]++;
  _$jscoverage['/base.js'].lineData[103]++;
  var self = this, cs = [], i, c = self.constructor, attrs = self.getAttrs();
  _$jscoverage['/base.js'].lineData[109]++;
  while (c) {
    _$jscoverage['/base.js'].lineData[110]++;
    cs.push(c);
    _$jscoverage['/base.js'].lineData[111]++;
    c = visit8_111_1(c.superclass && c.superclass.constructor);
  }
  _$jscoverage['/base.js'].lineData[114]++;
  cs.reverse();
  _$jscoverage['/base.js'].lineData[117]++;
  for (i = 0; visit9_117_1(i < cs.length); i++) {
    _$jscoverage['/base.js'].lineData[118]++;
    var ATTRS = visit10_118_1(cs[i].ATTRS || {});
    _$jscoverage['/base.js'].lineData[119]++;
    for (var attributeName in ATTRS) {
      _$jscoverage['/base.js'].lineData[120]++;
      if (visit11_120_1(attributeName in attrs)) {
        _$jscoverage['/base.js'].lineData[121]++;
        var attributeValue, onSetMethod;
        _$jscoverage['/base.js'].lineData[123]++;
        var onSetMethodName = ON_SET + ucfirst(attributeName);
        _$jscoverage['/base.js'].lineData[125]++;
        if (visit12_125_1((onSetMethod = self[onSetMethodName]) && visit13_128_1(visit14_128_2(attrs[attributeName].sync !== 0) && visit15_129_1((attributeValue = self.get(attributeName)) !== undefined)))) {
          _$jscoverage['/base.js'].lineData[130]++;
          onSetMethod.call(self, attributeValue);
        }
      }
    }
  }
}, 
  'plug': function(plugin) {
  _$jscoverage['/base.js'].functionData[7]++;
  _$jscoverage['/base.js'].lineData[143]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[144]++;
  if (visit16_144_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[145]++;
    var Plugin = plugin;
    _$jscoverage['/base.js'].lineData[146]++;
    plugin = new Plugin();
  }
  _$jscoverage['/base.js'].lineData[150]++;
  if (visit17_150_1(plugin.pluginInitializer)) {
    _$jscoverage['/base.js'].lineData[152]++;
    plugin.pluginInitializer(self);
  }
  _$jscoverage['/base.js'].lineData[154]++;
  self.get('plugins').push(plugin);
  _$jscoverage['/base.js'].lineData[155]++;
  return self;
}, 
  'unplug': function(plugin) {
  _$jscoverage['/base.js'].functionData[8]++;
  _$jscoverage['/base.js'].lineData[165]++;
  var plugins = [], self = this, isString = visit18_167_1(typeof plugin === 'string');
  _$jscoverage['/base.js'].lineData[169]++;
  S.each(self.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[9]++;
  _$jscoverage['/base.js'].lineData[170]++;
  var keep = 0, pluginId;
  _$jscoverage['/base.js'].lineData[171]++;
  if (visit19_171_1(plugin)) {
    _$jscoverage['/base.js'].lineData[172]++;
    if (visit20_172_1(isString)) {
      _$jscoverage['/base.js'].lineData[174]++;
      pluginId = visit21_174_1(visit22_174_2(p.get && p.get('pluginId')) || p.pluginId);
      _$jscoverage['/base.js'].lineData[175]++;
      if (visit23_175_1(pluginId !== plugin)) {
        _$jscoverage['/base.js'].lineData[176]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[177]++;
        keep = 1;
      }
    } else {
      _$jscoverage['/base.js'].lineData[180]++;
      if (visit24_180_1(p !== plugin)) {
        _$jscoverage['/base.js'].lineData[181]++;
        plugins.push(p);
        _$jscoverage['/base.js'].lineData[182]++;
        keep = 1;
      }
    }
  }
  _$jscoverage['/base.js'].lineData[187]++;
  if (visit25_187_1(!keep)) {
    _$jscoverage['/base.js'].lineData[188]++;
    p.pluginDestructor(self);
  }
});
  _$jscoverage['/base.js'].lineData[192]++;
  self.setInternal('plugins', plugins);
  _$jscoverage['/base.js'].lineData[193]++;
  return self;
}, 
  'getPlugin': function(id) {
  _$jscoverage['/base.js'].functionData[10]++;
  _$jscoverage['/base.js'].lineData[202]++;
  var plugin = null;
  _$jscoverage['/base.js'].lineData[203]++;
  S.each(this.get('plugins'), function(p) {
  _$jscoverage['/base.js'].functionData[11]++;
  _$jscoverage['/base.js'].lineData[205]++;
  var pluginId = visit26_205_1(visit27_205_2(p.get && p.get('pluginId')) || p.pluginId);
  _$jscoverage['/base.js'].lineData[206]++;
  if (visit28_206_1(pluginId === id)) {
    _$jscoverage['/base.js'].lineData[207]++;
    plugin = p;
    _$jscoverage['/base.js'].lineData[208]++;
    return false;
  }
  _$jscoverage['/base.js'].lineData[210]++;
  return undefined;
});
  _$jscoverage['/base.js'].lineData[212]++;
  return plugin;
}, 
  destructor: noop, 
  destroy: function() {
  _$jscoverage['/base.js'].functionData[12]++;
  _$jscoverage['/base.js'].lineData[218]++;
  var self = this;
  _$jscoverage['/base.js'].lineData[219]++;
  if (visit29_219_1(!self.get('destroyed'))) {
    _$jscoverage['/base.js'].lineData[220]++;
    callPluginsMethod.call(self, 'pluginDestructor');
    _$jscoverage['/base.js'].lineData[221]++;
    self.destructor();
    _$jscoverage['/base.js'].lineData[222]++;
    self.set('destroyed', true);
    _$jscoverage['/base.js'].lineData[223]++;
    self.fire('destroy');
    _$jscoverage['/base.js'].lineData[224]++;
    self.detach();
  }
}});
  _$jscoverage['/base.js'].lineData[229]++;
  S.mix(Base, {
  __hooks__: {
  initializer: __getHook(), 
  destructor: __getHook('__destructor', true)}, 
  ATTRS: {
  plugins: {
  value: []}, 
  destroyed: {
  value: false}, 
  listeners: {
  value: []}}, 
  extend: function extend(extensions, px, sx) {
  _$jscoverage['/base.js'].functionData[13]++;
  _$jscoverage['/base.js'].lineData[301]++;
  if (visit30_301_1(!S.isArray(extensions))) {
    _$jscoverage['/base.js'].lineData[302]++;
    sx = px;
    _$jscoverage['/base.js'].lineData[303]++;
    px = extensions;
    _$jscoverage['/base.js'].lineData[304]++;
    extensions = [];
  }
  _$jscoverage['/base.js'].lineData[306]++;
  var SubClass = Attribute.extend.call(this, px, sx);
  _$jscoverage['/base.js'].lineData[307]++;
  SubClass.__extensions__ = extensions;
  _$jscoverage['/base.js'].lineData[309]++;
  baseAddMembers.call(SubClass, {});
  _$jscoverage['/base.js'].lineData[311]++;
  if (visit31_311_1(extensions.length)) {
    _$jscoverage['/base.js'].lineData[312]++;
    var attrs = {}, prototype = {};
    _$jscoverage['/base.js'].lineData[316]++;
    S.each(extensions.concat(SubClass), function(ext) {
  _$jscoverage['/base.js'].functionData[14]++;
  _$jscoverage['/base.js'].lineData[317]++;
  if (visit32_317_1(ext)) {
    _$jscoverage['/base.js'].lineData[327]++;
    S.each(ext.ATTRS, function(v, name) {
  _$jscoverage['/base.js'].functionData[15]++;
  _$jscoverage['/base.js'].lineData[328]++;
  var av = attrs[name] = visit33_328_1(attrs[name] || {});
  _$jscoverage['/base.js'].lineData[329]++;
  S.mix(av, v);
});
    _$jscoverage['/base.js'].lineData[332]++;
    var exp = ext.prototype, p;
    _$jscoverage['/base.js'].lineData[334]++;
    for (p in exp) {
      _$jscoverage['/base.js'].lineData[336]++;
      if (visit34_336_1(exp.hasOwnProperty(p))) {
        _$jscoverage['/base.js'].lineData[337]++;
        prototype[p] = exp[p];
      }
    }
  }
});
    _$jscoverage['/base.js'].lineData[342]++;
    SubClass.ATTRS = attrs;
    _$jscoverage['/base.js'].lineData[343]++;
    prototype.constructor = SubClass;
    _$jscoverage['/base.js'].lineData[344]++;
    S.augment(SubClass, prototype);
  }
  _$jscoverage['/base.js'].lineData[346]++;
  SubClass.extend = visit35_346_1(visit36_346_2(sx && sx.extend) || extend);
  _$jscoverage['/base.js'].lineData[347]++;
  SubClass.addMembers = baseAddMembers;
  _$jscoverage['/base.js'].lineData[348]++;
  return SubClass;
}});
  _$jscoverage['/base.js'].lineData[352]++;
  var addMembers = Base.addMembers;
  _$jscoverage['/base.js'].lineData[354]++;
  function baseAddMembers(px) {
    _$jscoverage['/base.js'].functionData[16]++;
    _$jscoverage['/base.js'].lineData[355]++;
    var SubClass = this;
    _$jscoverage['/base.js'].lineData[356]++;
    var extensions = SubClass.__extensions__, hooks = SubClass.__hooks__, proto = SubClass.prototype;
    _$jscoverage['/base.js'].lineData[359]++;
    if (visit37_359_1(extensions.length && hooks)) {
      _$jscoverage['/base.js'].lineData[361]++;
      for (var h in hooks) {
        _$jscoverage['/base.js'].lineData[363]++;
        if (visit38_363_1(proto.hasOwnProperty(h) && !px.hasOwnProperty(h))) {
          _$jscoverage['/base.js'].lineData[364]++;
          continue;
        }
        _$jscoverage['/base.js'].lineData[366]++;
        px[h] = visit39_366_1(px[h] || noop);
      }
    }
    _$jscoverage['/base.js'].lineData[369]++;
    return addMembers.call(SubClass, px);
  }
  _$jscoverage['/base.js'].lineData[396]++;
  function onSetAttrChange(e) {
    _$jscoverage['/base.js'].functionData[17]++;
    _$jscoverage['/base.js'].lineData[397]++;
    var self = this, method;
    _$jscoverage['/base.js'].lineData[400]++;
    if (visit40_400_1(e.target === self)) {
      _$jscoverage['/base.js'].lineData[401]++;
      method = self[ON_SET + e.type.slice(5).slice(0, -6)];
      _$jscoverage['/base.js'].lineData[402]++;
      method.call(self, e.newVal, e);
    }
  }
  _$jscoverage['/base.js'].lineData[406]++;
  function constructPlugins(self) {
    _$jscoverage['/base.js'].functionData[18]++;
    _$jscoverage['/base.js'].lineData[407]++;
    var plugins = self.get('plugins'), Plugin;
    _$jscoverage['/base.js'].lineData[408]++;
    S.each(plugins, function(plugin, i) {
  _$jscoverage['/base.js'].functionData[19]++;
  _$jscoverage['/base.js'].lineData[409]++;
  if (visit41_409_1(typeof plugin === 'function')) {
    _$jscoverage['/base.js'].lineData[410]++;
    Plugin = plugin;
    _$jscoverage['/base.js'].lineData[411]++;
    plugins[i] = new Plugin();
  }
});
  }
  _$jscoverage['/base.js'].lineData[416]++;
  function callPluginsMethod(method) {
    _$jscoverage['/base.js'].functionData[20]++;
    _$jscoverage['/base.js'].lineData[417]++;
    var len, self = this, plugins = self.get('plugins');
    _$jscoverage['/base.js'].lineData[420]++;
    if ((len = plugins.length)) {
      _$jscoverage['/base.js'].lineData[421]++;
      for (var i = 0; visit42_421_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[422]++;
        if (visit43_422_1(plugins[i][method])) {
          _$jscoverage['/base.js'].lineData[423]++;
          plugins[i][method](self);
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[429]++;
  function callExtensionsMethod(self, extensions, method, args) {
    _$jscoverage['/base.js'].functionData[21]++;
    _$jscoverage['/base.js'].lineData[430]++;
    var len;
    _$jscoverage['/base.js'].lineData[431]++;
    if ((len = visit44_431_1(extensions && extensions.length))) {
      _$jscoverage['/base.js'].lineData[432]++;
      for (var i = 0; visit45_432_1(i < len); i++) {
        _$jscoverage['/base.js'].lineData[433]++;
        var fn = visit46_433_1(extensions[i] && (!method ? extensions[i] : extensions[i].prototype[method]));
        _$jscoverage['/base.js'].lineData[438]++;
        if (visit47_438_1(fn)) {
          _$jscoverage['/base.js'].lineData[439]++;
          fn.apply(self, visit48_439_1(args || []));
        }
      }
    }
  }
  _$jscoverage['/base.js'].lineData[445]++;
  S.Base = Base;
  _$jscoverage['/base.js'].lineData[447]++;
  return Base;
});
